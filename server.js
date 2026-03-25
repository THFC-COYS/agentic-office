// ============================================================
// Agentic Office — Zero-dependency API Proxy Server
// Uses only Node.js built-ins (http, fs, path, url)
// Node 18+ required (uses built-in fetch)
// ============================================================

const http = require('http');
const fs   = require('fs');
const path = require('path');
const url  = require('url');

// ── Load .env manually (no dotenv needed) ─────────────────────
try {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const [k, ...v] = line.trim().split('=');
      if (k && !k.startsWith('#') && !process.env[k]) {
        process.env[k] = v.join('=').replace(/^["']|["']$/g, '');
      }
    });
  }
} catch (_) {}

const PORT    = parseInt(process.env.PORT || '3000', 10);
const PUBLIC  = path.join(__dirname, 'public');

// ── MIME types ────────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.ico':  'image/x-icon'
};

// ── Helpers ───────────────────────────────────────────────────
function json(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(body);
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end',  () => {
      try { resolve(JSON.parse(Buffer.concat(chunks).toString())); }
      catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

async function proxyFetch(targetUrl, fetchOpts) {
  const res  = await fetch(targetUrl, fetchOpts);
  const body = await res.json();
  return { ok: res.ok, status: res.status, body };
}

// ── Proxy handlers ────────────────────────────────────────────

async function handleClaude(req, res) {
  const { apiKey, model, system, messages, max_tokens } = await readBody(req);
  const key = apiKey || process.env.ANTHROPIC_API_KEY || '';

  if (!key) {
    return json(res, 400, {
      error: 'No Anthropic API key. Add one in Settings ⚙ or set ANTHROPIC_API_KEY in .env'
    });
  }

  const { ok, status, body } = await proxyFetch(
    'https://api.anthropic.com/v1/messages',
    {
      method: 'POST',
      headers: {
        'x-api-key':          key,
        'anthropic-version':  '2023-06-01',
        'content-type':       'application/json'
      },
      body: JSON.stringify({
        model:      model      || 'claude-sonnet-4-6',
        max_tokens: max_tokens || 1024,
        system:     system     || '',
        messages
      })
    }
  );

  if (!ok) return json(res, status, { error: body.error?.message || 'Claude API error', details: body });
  json(res, 200, { content: body.content[0].text, usage: body.usage });
}

async function handleOpenAI(req, res) {
  const { apiKey, model, messages, max_tokens } = await readBody(req);
  const key = apiKey || process.env.OPENAI_API_KEY || '';

  if (!key) {
    return json(res, 400, {
      error: 'No OpenAI API key. Add one in Settings ⚙ or set OPENAI_API_KEY in .env'
    });
  }

  const { ok, status, body } = await proxyFetch(
    'https://api.openai.com/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type':  'application/json'
      },
      body: JSON.stringify({
        model:      model      || 'gpt-4o-mini',
        max_tokens: max_tokens || 1024,
        messages
      })
    }
  );

  if (!ok) return json(res, status, { error: body.error?.message || 'OpenAI API error' });
  json(res, 200, { content: body.choices[0].message.content, usage: body.usage });
}

async function handleCustom(req, res) {
  const { endpoint, apiKey, payload } = await readBody(req);

  if (!endpoint) return json(res, 400, { error: 'No endpoint URL provided' });

  const headers = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const { ok, status, body } = await proxyFetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!ok) return json(res, status, { error: 'Custom endpoint error', details: body });
  json(res, 200, body);
}

// ── Static file server ────────────────────────────────────────
function serveStatic(req, res) {
  let filePath = path.join(PUBLIC, req.pathname === '/' ? 'index.html' : req.pathname);

  // Prevent directory traversal
  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Try index.html as fallback (SPA)
      fs.readFile(path.join(PUBLIC, 'index.html'), (err2, data2) => {
        if (err2) { res.writeHead(404); res.end('Not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(data2);
      });
      return;
    }
    const ext  = path.extname(filePath);
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
}

// ── Router ────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const parsed   = new URL(req.url, 'http://localhost');
  req.pathname   = parsed.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  try {
    if (req.method === 'GET'  && req.pathname === '/api/health') {
      return json(res, 200, {
        status:        'ok',
        claudeKeySet:  !!process.env.ANTHROPIC_API_KEY,
        openaiKeySet:  !!process.env.OPENAI_API_KEY
      });
    }

    if (req.method === 'POST' && req.pathname === '/api/proxy/claude')  return await handleClaude(req, res);
    if (req.method === 'POST' && req.pathname === '/api/proxy/openai')  return await handleOpenAI(req, res);
    if (req.method === 'POST' && req.pathname === '/api/proxy/custom')  return await handleCustom(req, res);

    // Static files
    serveStatic(req, res);
  } catch (err) {
    console.error('Server error:', err.message);
    json(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║   🏢  Agentic Office is running!     ║');
  console.log(`║   Open: http://localhost:${PORT}         ║`);
  console.log('╚══════════════════════════════════════╝\n');

  if (!process.env.ANTHROPIC_API_KEY && !process.env.OPENAI_API_KEY) {
    console.log('⚠  No API keys in .env — configure them in the app Settings panel.\n');
  }
});
