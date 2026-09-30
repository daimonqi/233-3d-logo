import fs from 'node:fs/promises';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const glb = await fs.readFile(new URL('../assets/233-icon-3d.glb', import.meta.url));
const built = await build({
  entryPoints: [fileURLToPath(new URL('./viewer-source.js', import.meta.url))],
  bundle: true,
  write: false,
  format: 'iife',
  target: 'es2022',
  minify: true,
});
let script = built.outputFiles[0].text;
if (!script.includes('__GLB_BASE64__')) throw new Error('Missing model placeholder.');
script = script.replace('__GLB_BASE64__', glb.toString('base64'));
const template = await fs.readFile(new URL('./viewer-template.html', import.meta.url), 'utf8');
const html = template.replace('__VIEWER_BUNDLE__', () => script);
await fs.writeFile(new URL('../assets/233-icon-mouse-preview.html', import.meta.url), html);
console.log(JSON.stringify({ bytes: Buffer.byteLength(html), modelBytes: glb.length }));
