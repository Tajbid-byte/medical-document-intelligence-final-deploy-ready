import { mkdirSync, rmSync, copyFileSync, cpSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
copyFileSync(join(root, 'index.html'), join(dist, 'index.html'));
cpSync(join(root, 'src'), join(dist, 'src'), { recursive: true });

const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.VITE_API_URL || process.env.API_URL || '';
writeFileSync(
  join(dist, 'config.js'),
  `window.__MDI_CONFIG__ = { API_URL: ${JSON.stringify(apiUrl)} };\n`,
  'utf8'
);

console.log('Static frontend built successfully.');
console.log(`API URL embedded: ${apiUrl || '(empty - user can set it inside the UI)'}`);
