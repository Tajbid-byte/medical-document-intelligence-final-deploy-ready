import { createServer } from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const useDist = process.argv.includes('--dist');
const base = useDist ? join(root, 'dist') : root;
const port = Number(process.env.PORT || 3000);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
};

createServer((req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${port}`);
  if (url.pathname === '/config.js' && !useDist) {
    res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8' });
    res.end(`window.__MDI_CONFIG__ = { API_URL: ${JSON.stringify(process.env.NEXT_PUBLIC_API_URL || '')} };`);
    return;
  }
  let path = join(base, url.pathname === '/' ? 'index.html' : url.pathname);
  if (!existsSync(path)) path = join(base, 'index.html');
  const ext = extname(path);
  res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
  res.end(readFileSync(path));
}).listen(port, () => {
  console.log(`Medical Document Intelligence frontend running at http://localhost:${port}`);
});
