import { cp, mkdir, rm, writeFile, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const item of ['index.html', 'assets', 'data']) {
  const src = path.join(root, item);
  if (existsSync(src)) await cp(src, path.join(out, item), { recursive: true });
}

const outIndex = path.join(out, 'index.html');
let html = await readFile(outIndex, 'utf8');
for (const css of ['v07.css','v08.css','v09.css']) {
  if (!html.includes(`assets/${css}`)) html = html.replace('</head>', `  <link rel="stylesheet" href="assets/${css}" />\n</head>`);
}
for (const js of ['v07.js','v08.js','v09.js']) {
  if (!html.includes(`assets/${js}`)) html = html.replace('</body>', `  <script src="assets/${js}" defer></script>\n</body>`);
}
await writeFile(outIndex, html, 'utf8');

const DEFAULT_SUPABASE_URL = 'https://nhqewuniroljxgaefkgx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_0WQ5ts4mMkLLZM0WJFstGQ_xxx1QOg6';
const DEFAULT_SITE_URL = 'https://sadafalizadeh-arch.vercel.app';

const esc = (v='') => String(v).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
const siteUrl = process.env.SITE_URL || DEFAULT_SITE_URL;
const cfg = `window.SADAF_CONFIG = {\n  SUPABASE_URL: '${esc(supabaseUrl)}',\n  SUPABASE_ANON_KEY: '${esc(supabaseAnonKey)}',\n  SITE_URL: '${esc(siteUrl)}',\n  DOWNLOAD_URL_TTL_SECONDS: ${Number(process.env.DOWNLOAD_URL_TTL_SECONDS || 300)},\n  GATEWAY_ENABLED: ${String(process.env.GATEWAY_ENABLED || 'false').toLowerCase() === 'true'},\n  PAYMENT_PROVIDER: '${esc(process.env.PAYMENT_PROVIDER || 'zarinpal')}'\n};\n`;
await writeFile(path.join(out, 'assets', 'config.js'), cfg, 'utf8');
console.log('Built dist/ with production config and v0.7-v0.9 refinement layers.');
