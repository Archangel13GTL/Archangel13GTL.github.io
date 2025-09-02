#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE = '/workspace';
const TARGET_URL = 'https://tenetx.me';

async function fetchText(url) {
  const res = await fetch(url);
  return await res.text();
}

function extractTokens(str) {
  const colors = new Set((str.match(/#[0-9a-fA-F]{3,6}\b/g) || []).map(c => c.toLowerCase()));
  const fonts = new Set();
  const fontRegex = /font-family\s*:\s*([^;}{]+)/gi;
  let m;
  while ((m = fontRegex.exec(str)) !== null) {
    m[1].split(',').forEach(f => {
      const token = f.replace(/['"]/g, '').trim().toLowerCase();
      if (token) fonts.add(token);
    });
  }
  return new Set([...colors, ...fonts]);
}

async function getTenetTokens() {
  try {
    const html = await fetchText(TARGET_URL);
    let combined = html;

    const linkRegex = /<link[^>]+href=["']([^"']+\.css)["'][^>]*>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const cssUrl = new URL(match[1], TARGET_URL).href;
      try {
        combined += await fetchText(cssUrl);
      } catch {}
    }

    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    while ((match = styleRegex.exec(html)) !== null) {
      combined += match[1];
    }

    return extractTokens(combined);
  } catch {
    return new Set();
  }
}

function walk(dir, ext) {
  let files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name.startsWith('.git')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(walk(full, ext));
    else if (full.endsWith(ext)) files.push(full);
  }
  return files;
}

function jaccard(a, b) {
  const inter = new Set([...a].filter(x => b.has(x)));
  const union = new Set([...a, ...b]);
  return union.size === 0 ? 1 : inter.size / union.size;
}

async function collectRepoTokens(repoPath) {
  const cssFiles = walk(repoPath, '.css');
  let content = '';
  for (const file of cssFiles) {
    try {
      content += fs.readFileSync(file, 'utf8');
    } catch {}
  }
  return extractTokens(content);
}

function checkStructure(repoPath) {
  if (fs.existsSync(path.join(repoPath, 'index.html'))) return true;
  const pkgPath = path.join(repoPath, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      const hasBuild = pkg.scripts && pkg.scripts.build;
      const hasAssets = fs.existsSync(path.join(repoPath, 'assets'));
      return !!hasBuild && hasAssets;
    } catch {}
  }
  return false;
}

async function checkLinks(repoPath) {
  const htmlFiles = walk(repoPath, '.html');
  const urlRegex = /<a\s+[^>]*href=["']([^"']+)["']/gi;
  let urls = [];
  for (const file of htmlFiles) {
    const html = fs.readFileSync(file, 'utf8');
    let m;
    while ((m = urlRegex.exec(html)) !== null) {
      const href = m[1];
      if (/^https?:\/\//i.test(href)) urls.push(href);
    }
  }
  if (urls.length === 0) return 1;
  let valid = 0;
  for (const url of urls) {
    try {
      let res = await fetch(url, { method: 'HEAD' });
      if (res.status >= 400) {
        res = await fetch(url);
      }
      if (res.status < 400) valid++;
    } catch {}
  }
  return valid / urls.length;
}

function recencyScore(repoPath) {
  try {
    const ts = parseInt(execSync('git log -1 --format=%ct', { cwd: repoPath }).toString().trim(), 10);
    const ageDays = (Date.now() / 1000 - ts) / 86400;
    return 1 - Math.min(ageDays / 365, 1);
  } catch {
    return 0;
  }
}

async function main() {
  const tenetTokens = await getTenetTokens();
  const repos = fs.readdirSync(WORKSPACE).filter(name => {
    const p = path.join(WORKSPACE, name);
    return fs.statSync(p).isDirectory();
  });

  const results = [];
  for (const name of repos) {
    const repoPath = path.join(WORKSPACE, name);
    const repoTokens = await collectRepoTokens(repoPath);
    const similarity = jaccard(tenetTokens, repoTokens);
    const structure = checkStructure(repoPath) ? 1 : 0;
    const linkHealth = await checkLinks(repoPath);
    const recency = recencyScore(repoPath);
    const score = similarity * 0.4 + structure * 0.3 + linkHealth * 0.2 + recency * 0.1;
    results.push({ repo: name, similarity, structure, linkHealth, recency, score });
  }

  results.sort((a, b) => b.score - a.score);

  const dataDir = path.join(path.resolve(__dirname, '..'), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'ranking.json'), JSON.stringify(results, null, 2));
}

main();
