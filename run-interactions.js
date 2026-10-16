// Stage 2: measures every enabled control in interactions.json (made by discover-interactions.js).
//
//   node run-interactions.js                            all screens, 1 run per control
//   node run-interactions.js --runs=3                   3 runs per control (median reported)
//   node run-interactions.js --only=dir-employees       selected screens
//   node run-interactions.js --resume=reports/<stamp>   finish an interrupted run
//
// Signs in once, then measures each screen in slices of controls, each slice in its own
// worker process (audit-interactions.js). Writes interactions-summary.csv + results.json.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { BASE_URL, EMAIL, INTERACTIONS_FILE, PASS_MS, signIn } from './lib.js';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? 'true']),
);
const RUNS = Number(args.runs || 1);
const CHUNK = Number(args.chunk || 15);
const only = args.only ? new Set(args.only.split(',')) : null;

if (!EMAIL) {
  console.error('VENDIANS_TEST_EMAIL is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}
if (!fs.existsSync(INTERACTIONS_FILE)) {
  console.error(`${INTERACTIONS_FILE} not found. Run "node discover-interactions.js" first.`);
  process.exit(1);
}

const { screens } = JSON.parse(fs.readFileSync(INTERACTIONS_FILE, 'utf8'));
const selected = screens.filter((s) => (!only || only.has(s.id)) && s.items.some((i) => i.enabled));
const total = selected.reduce((n, s) => n + s.items.filter((i) => i.enabled).length, 0);

const outDir = args.resume || path.join('reports', `${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}-interactions`);
fs.mkdirSync(outDir, { recursive: true });
console.log(`${selected.length} screens, ${total} controls, ${RUNS} run(s) each  ->  ${outDir}`);

let signedIn = false;
for (const [i, screen] of selected.entries()) {
  const count = screen.items.filter((x) => x.enabled).length;
  for (let start = 0; start < count; start += CHUNK) {
    if (fs.existsSync(path.join(outDir, `${screen.id}.${start}.json`))) continue; // resume

    if (!signedIn) {
      await signIn();
      signedIn = true;
    }
    for (let attempt = 1; attempt <= 2; attempt++) {
      console.log(`[${i + 1}/${selected.length}] ${screen.id} controls ${start + 1}-${Math.min(start + CHUNK, count)} of ${count}`);
      const { status } = spawnSync(
        process.execPath,
        ['audit-interactions.js', screen.id, String(RUNS), outDir, String(start), String(CHUNK)],
        { stdio: 'inherit' },
      );
      if (status !== 3) break;
      console.log('  session expired, signing in again');
      await signIn();
    }
  }
}

// Summary from every slice in the folder
const results = fs
  .readdirSync(outDir)
  .filter((f) => /\.\d+\.json$/.test(f))
  .flatMap((f) => JSON.parse(fs.readFileSync(path.join(outDir, f), 'utf8')));

fs.writeFileSync(
  path.join(outDir, 'results.json'),
  JSON.stringify({ baseUrl: BASE_URL, runsPerControl: RUNS, passThresholdMs: PASS_MS, results }, null, 2),
);

const cols = ['module', 'page', 'section', 'kind', 'label', 'status', 'responseMs', 'settled', 'inp', 'tbt', 'cls', 'apiCalls', 'slowestApiMs', 'slowestApi', 'navigatedTo', 'blockedWrites', 'httpStatus', 'finalUrl', 'note', 'responseRuns', 'error'];
const cell = (v) => {
  if (v === null || v === undefined) return '';
  const s = Array.isArray(v) ? v.join(' / ') : typeof v === 'number' ? String(Math.round(v * 1000) / 1000) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
fs.writeFileSync(
  path.join(outDir, 'interactions-summary.csv'),
  [cols.join(','), ...results.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n'),
);

const counts = results.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {});
console.log(`\nDone: ${results.length} results for ${total} controls (dropdown options add rows): ${JSON.stringify(counts)}  ->  ${outDir}`);
