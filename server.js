const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 8080;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
  '.ttf':  'font/ttf',
  '.mp4':  'video/mp4',
  '.webm': 'video/webm',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);

  // Security: prevent directory traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      // Try appending .html
      const withHtml = filePath + '.html';
      fs.readFile(withHtml, (e2, data) => {
        if (e2) {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end('<h1 style="font-family:sans-serif;padding:2rem">404 — Pagina non trovata</h1>');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
          res.end(data);
        }
      });
      return;
    }

    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type':  mime,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`\n  ✦  Valeria Milan — Demo Server`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  Local:   http://localhost:${PORT}/`);
  console.log(`  IPv6:    http://[::1]:${PORT}/`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  Pagine disponibili:`);
  console.log(`    /             →  Landing Page`);
  console.log(`    /chi-sono     →  Chi Sono`);
  console.log(`    /percorsi     →  Percorsi Individuali`);
  console.log(`    /servizi      →  Servizi`);
  console.log(`    /blog         →  Blog`);
  console.log(`    /contatti     →  Contatti`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  Premi Ctrl+C per fermare il server\n`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n  Porta ${PORT} già in uso. Chiudi l'altro processo e riprova.\n`);
  } else {
    console.error('Server error:', err);
  }
  process.exit(1);
});
