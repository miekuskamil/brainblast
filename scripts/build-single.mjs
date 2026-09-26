/**
 * Inline the Vite build into one self-contained .html file (brainblast.html).
 *
 * The Vite project is the source of truth; this is a packaging step so the app
 * can be opened by double-clicking, with no server and no network. Fonts fall
 * back to the system rounded stack when offline.
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = process.argv[2] || join(root, 'dist');
const outFile = process.argv[3] || join(root, 'brainblast.html');
const assets = join(distDir, 'assets');
const files = readdirSync(assets);
const js = files.filter((f) => f.endsWith('.js'));
const css = files.find((f) => f.endsWith('.css'));
if (!js.length || !css) {
  console.error('No build output found. Run `npm run build` first.');
  process.exit(1);
}
// The main entry is the largest chunk; the PWA helper chunk is not needed offline.
const entry = js.map((f) => [f, readFileSync(join(assets, f), 'utf8')]).sort((a, b) => b[1].length - a[1].length)[0][1];
const cssSource = readFileSync(join(assets, css), 'utf8');
const safeJs = entry.replace(/<\/script/gi, '<\\/script');

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
<script type="module">${safeJs}</script>
</body>
</html>
`;
writeFileSync(outFile, html);
console.log(`${outFile} written (${(html.length / 1024).toFixed(0)} KB)`);
