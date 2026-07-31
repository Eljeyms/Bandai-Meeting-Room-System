const http = require('http');
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const port = process.env.PORT || 8081;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const server = http.createServer((req, res) => {
  const requestPath = decodeURIComponent((req.url || '/').split('?')[0]);
  const normalizedPath = requestPath === '/' || requestPath === '' ? '/index.html' : requestPath;
  const resolvedRoot = path.resolve(root);
  const candidatePath = path.resolve(resolvedRoot, `.${normalizedPath}`);

  if (!candidatePath.startsWith(resolvedRoot + path.sep) && candidatePath !== resolvedRoot) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    return res.end('403 Forbidden');
  }

  const finalPath = candidatePath.endsWith(path.sep) ? path.join(candidatePath, 'index.html') : candidatePath;

  fs.stat(finalPath, (err, stats) => {
    if (err) {
      if (requestPath === '/' || requestPath === '') {
        return sendFile(path.join(resolvedRoot, 'index.html'), res);
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('404 Not Found');
    }

    if (stats.isDirectory()) {
      return sendFile(path.join(finalPath, 'index.html'), res);
    }

    sendFile(finalPath, res);
  });
});

function sendFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('500 Internal Server Error');
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

console.log('Starting local server');

server.listen(port, () => {
  console.log(`Local server running at http://localhost:${port}/`);
});
