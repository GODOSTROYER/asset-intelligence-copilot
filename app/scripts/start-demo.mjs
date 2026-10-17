// One-command live demo: API on 4178 + Vite UI on 5173, a fresh memory state each run.
// Usage (from app/): SAMPLE_DATA_PATH=<dataset folder> [REFERENCE_DATE=2027-01-15] npm run demo
// The test set lives at <dataset repo>/test-data/dataset (today = 2027-01-15); the sample set at <dataset repo>/sample-data.
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = process.env.SAMPLE_DATA_PATH;
if (!DATA || !existsSync(DATA)) {
  console.error('Set SAMPLE_DATA_PATH to the dataset folder, e.g. ../flytbase-ahc-swe-asset-intelligence-dataset/test-data/dataset');
  process.exit(1);
}
const STATE = join(APP, '.local', 'demo-' + new Date().toISOString().replace(/[:.]/g, '-'));
mkdirSync(STATE, { recursive: true });
const env = { ...process.env, PORT: '4178', COPILOT_STATE_DIR: STATE, REFERENCE_DATE: process.env.REFERENCE_DATE ?? '2027-01-15' };

const run = (name, args) => {
  const child = spawn(process.execPath, args, { cwd: APP, env, stdio: 'inherit' });
  child.on('exit', code => { console.log(`[${name}] exited with ${code}`); process.exit(code ?? 0); });
  return child;
};
const api = run('api', ['--import', 'tsx', 'server/index.ts']);
const web = run('web', [join(APP, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', '5173', '--strictPort']);
const stop = () => { api.kill(); web.kill(); };
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
console.log('Demo memory state:', STATE, '· open http://localhost:5173 (wait ~5 s for the data to load)');
