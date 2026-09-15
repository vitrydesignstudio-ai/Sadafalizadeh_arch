import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
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

const esc = (v='') => String(v).replace(/\\/g,'\\\\').replace(/'/g,"\\'");
const cfg = `window.SADAF_CONFIG = {\n  SUPABASE_URL: '${esc(process.env.SUPABASE_URL || '')}',\n  SUPABASE_ANON_KEY: '${esc(process.env.SUPABASE_ANON_KEY || '')}',\n  SITE_URL: '${esc(process.env.SITE_URL || '')}',\n  DOWNLOAD_URL_TTL_SECONDS: ${Number(process.env.DOWNLOAD_URL_TTL_SECONDS || 300)},\n  GATEWAY_ENABLED: ${String(process.env.GATEWAY_ENABLED || 'false').toLowerCase() === 'true'},\n  PAYMENT_PROVIDER: '${esc(process.env.PAYMENT_PROVIDER || 'zarinpal')}'\n};\n`;
await writeFile(path.join(out, 'assets', 'config.js'), cfg, 'utf8');
console.log('Built dist/ with public runtime config.');
