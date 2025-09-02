const express = require('express');
const { Readable } = require('stream');

const app = express();
app.use(express.json());

async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  if (process.env.SITE_API_KEY && token === process.env.SITE_API_KEY) {
    return next();
  }

  try {
    const admin = require('firebase-admin');
    if (!admin.apps.length) admin.initializeApp();
    await admin.auth().verifyIdToken(token);
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

app.use(['/api/ai', '/api/ai/status'], authenticate);

app.get('/api/ai/status', (req, res) => {
  res.json({ status: 'ok', provider: process.env.AI_PROVIDER });
});

app.post('/api/ai', async (req, res) => {
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();
  const prompt = req.body.prompt;
  const messages = req.body.messages || (prompt ? [{ role: 'user', content: prompt }] : []);

  let url, headers, body, stream = false;

  switch (provider) {
    case 'openai':
      url = 'https://api.openai.com/v1/chat/completions';
      headers = {
        'Authorization': `Bearer ${process.env.AI_API_KEY}`,
        'Content-Type': 'application/json'
      };
      body = { model: process.env.OPENAI_MODEL, messages, stream: true };
      stream = true;
      break;
    case 'azure':
      url = `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.OPENAI_MODEL}/chat/completions?api-version=2023-07-01-preview`;
      headers = {
        'api-key': process.env.AZURE_OPENAI_KEY,
        'Content-Type': 'application/json'
      };
      body = { messages, stream: true };
      stream = true;
      break;
    case 'gemini':
      url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
      headers = { 'Content-Type': 'application/json' };
      body = { contents: [{ parts: [{ text: prompt }] }] };
      break;
    case 'perplexity':
      url = 'https://api.perplexity.ai/chat/completions';
      headers = {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json'
      };
      body = { model: process.env.OPENAI_MODEL, messages, stream: true };
      stream = true;
      break;
    default:
      return res.status(500).json({ error: 'Unsupported AI provider' });
  }

  const upstream = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });

  if (stream) {
    res.setHeader('Content-Type', upstream.headers.get('content-type') || 'text/plain');
    res.status(upstream.status);
    Readable.fromWeb(upstream.body).pipe(res);
  } else {
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  }
});

module.exports = app;
