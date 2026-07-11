// Kai's Creations — LOCAL-ONLY content manager server.
// Zero dependencies: built-in http/fs/path/crypto modules only.
// Never link this from the public gallery. Run manually: node manager-server.js
// Golden rules enforced here:
//  - Missing EXIF stays blank, never invented (browser-side EXIF reader falls back to "").
//  - Manifest is the single source of truth for display fields.
//  - This server only writes within content/creations.json and images/ inside this project.

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.MANAGER_PORT || 4000;
const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, 'content');
const MANIFEST_PATH = path.join(CONTENT_DIR, 'creations.json');
const IMAGES_DIR = path.join(ROOT, 'images');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp'
};

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Content-Length': Buffer.byteLength(body) });
  res.end(body);
}

function readBody(req, limitBytes) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(new Error('Payload too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function safeStaticJoin(root, urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const normalized = path.normalize(decoded).replace(/^([.]{2}[/\\])+/, '');
  return path.join(root, normalized);
}

function sanitizeFilename(name) {
  const base = path.basename(name || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_');
  return base || `upload_${Date.now()}`;
}

function uniqueImagePath(filename) {
  let candidate = filename;
  let i = 1;
  while (fs.existsSync(path.join(IMAGES_DIR, candidate))) {
    const ext = path.extname(filename);
    const stem = path.basename(filename, ext);
    candidate = `${stem}-${i}${ext}`;
    i += 1;
  }
  return candidate;
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/api/creations') {
      if (!fs.existsSync(MANIFEST_PATH)) return sendJson(res, 200, { items: [] });
      const raw = fs.readFileSync(MANIFEST_PATH, 'utf8');
      return sendJson(res, 200, JSON.parse(raw));
    }

    if (req.method === 'POST' && req.url === '/api/creations') {
      const body = await readBody(req, 5 * 1024 * 1024);
      let data;
      try { data = JSON.parse(body.toString('utf8')); } catch (e) { return sendJson(res, 400, { error: 'Invalid JSON' }); }
      if (!data || !Array.isArray(data.items)) return sendJson(res, 400, { error: 'Expected { items: [] }' });
      fs.mkdirSync(CONTENT_DIR, { recursive: true });
      fs.writeFileSync(MANIFEST_PATH, JSON.stringify(data, null, 2) + '\n', 'utf8');
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'POST' && req.url === '/api/upload') {
      const body = await readBody(req, 20 * 1024 * 1024);
      let data;
      try { data = JSON.parse(body.toString('utf8')); } catch (e) { return sendJson(res, 400, { error: 'Invalid JSON' }); }
      if (!data || !data.filename || !data.dataUrl) return sendJson(res, 400, { error: 'Expected { filename, dataUrl }' });
      const match = /^data:(.+?);base64,(.*)$/.exec(data.dataUrl);
      if (!match) return sendJson(res, 400, { error: 'dataUrl must be a base64 data URL' });
      const buffer = Buffer.from(match[2], 'base64');
      fs.mkdirSync(IMAGES_DIR, { recursive: true });
      const safeName = uniqueImagePath(sanitizeFilename(data.filename));
      fs.writeFileSync(path.join(IMAGES_DIR, safeName), buffer);
      return sendJson(res, 200, { ok: true, path: `images/${safeName}` });
    }

    // Static files (manager.html, manager.js, css, and read access to images/content for preview)
    let filePath = safeStaticJoin(ROOT, req.url === '/' ? '/manager.html' : req.url);
    fs.stat(filePath, (err, stats) => {
      if (err || !stats.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    });
  } catch (e) {
    sendJson(res, 500, { error: e.message || 'Server error' });
  }
});

server.listen(PORT, () => {
  console.log(`Kai's Creations MANAGER (local-only) running at http://localhost:${PORT}`);
  console.log('This tool is not part of the public gallery. Do not deploy or expose it.');
});
