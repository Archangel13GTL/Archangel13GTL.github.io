# AI Integration

The `/api/ai` endpoint proxies requests to configured AI providers.

## Environment Variables

Set the following variables to enable providers:

- `OPENAI_API_KEY` – API key for OpenAI.
- `ANTHROPIC_API_KEY` – API key for Anthropic.
- `GEMINI_API_KEY` – API key for Google Gemini.
- `AI_DEFAULT_PROVIDER` – provider used when no `provider` is specified.

## Provider Mappings

The service maps provider names to their respective APIs:

| Provider    | Environment Variable  | Base URL |
|-------------|-----------------------|----------|
| `openai`    | `OPENAI_API_KEY`      | `https://api.openai.com/v1` |
| `anthropic` | `ANTHROPIC_API_KEY`   | `https://api.anthropic.com` |
| `gemini`    | `GEMINI_API_KEY`      | `https://generativelanguage.googleapis.com/v1beta` |

## Example Calls

### curl

```bash
curl -X POST https://example.com/api/ai \
  -H "Content-Type: application/json" \
  -d '{"provider":"openai","model":"gpt-4","messages":[{"role":"user","content":"Hello"}]}'
```

### JavaScript

```js
const res = await fetch('/api/ai', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'openai',
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello' }]
  })
});
const data = await res.json();
```
