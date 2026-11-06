#!/usr/bin/env node
// =========================================================================
// Admission Hub — Local Development Server for VS Code
// Run via `npm start` or press F5 in VS Code.
// Serves the project at http://localhost:5500 with UTF-8 headers.
// =========================================================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 5500;
const ROOT = path.join(__dirname, '..');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.sql': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const safePath = decodeURIComponent((req.url || '/').split('?')[0]);
  const relPath = safePath === '/' ? '/index.html' : safePath;
  const filePath = path.normalize(path.join(ROOT, relPath));

  // Prevent directory traversal outside ROOT
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + safePath);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('\n============================================================');
  console.log('🎓 Admission Hub — Local VS Code Dev Server');
  console.log(`🌐 Open in Browser: http://localhost:${PORT}`);
  console.log('🕷️  To run live scraper: npm run scrape');
  console.log('Press Ctrl+C to stop the server.');
  console.log('============================================================\n');
});
