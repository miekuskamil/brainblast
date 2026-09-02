/**
 * Inline the Vite build into one self-contained .html file.
 *
 * The Vite project is the source of truth; this is a packaging step so the app
 * can be opened by double-clicking, with no server and no network. Fonts fall
 * back to the system rounded stack when offline.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const assets = join(dist, 'assets');

const files = readdirSync(assets);
const js = files.find((f) => f.endsWith('.js'));
const css = files.find((f) => f.endsWith('.css'));

if (!js || !css) {
  console.error('No build output found. Run `npm run build` first.');
  process.exit(1);
}

const jsSource = readFileSync(join(assets, js), 'utf8');
const cssSource = readFileSync(join(assets, css), 'utf8');

/**
 * No external font link here on purpose: the packaged file must work with no
 * network at all — on a train, on school wifi, on a laptop that is offline.
 * The CSS falls back to the platform's rounded UI face, which is close enough
 * and costs nothing.
 */
const html = `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#5b5bd6" />
<title>Brain Blast</title>
<style>${cssSource}</style>
</head>
<body>
<div id="root"></div>
<script type="module">${jsSource}</script>
</body>
</html>
`;

const out = join(root, 'brainblast.html');
writeFileSync(out, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
console.log(`Wrote ${out} (${kb} KB)`);
