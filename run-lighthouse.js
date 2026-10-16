// Runs Lighthouse (desktop web screen, performance only) on every VenDians screen.
//
//   npm run audit                                     all routes, 3 runs each
//   node run-lighthouse.js --runs=1                   one run per route
//   node run-lighthouse.js --only=home,leaves-my      selected routes
//   node run-lighthouse.js --profile=4g               network profile: desktop (default), 4g, 3g, none
//   node run-lighthouse.js --resume=reports/<stamp>   finish an interrupted run (repeat the same --profile)
//
// Signs in once with the dev email login and hands the session to a separate
// worker process per route (audit-route.js), so memory never builds up.
// Each worker keeps the median run (by LCP); this script writes the summary.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { routes } from './routes.js';
import { BASE_URL, EMAIL, PASS_MS, PROFILES, SESSION_FILE, launchChrome, login } from './lib.js';

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? 'true']),
);
const RUNS = Number(args.runs || 3);
const PROFILE = args.profile || 'desktop';
if (!PROFILES[PROFILE]) {
  console.error(`Unknown --profile=${PROFILE}. Use one of: ${Object.keys(PROFILES).join(', ')}`);
  process.exit(1);
}
const only = args.only ? new Set(args.only.split(',')) : null;
const selected = routes.filter((r) => !only || only.has(r.id));

if (!EMAIL) {
  console.error('VENDIANS_TEST_EMAIL is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

const outDir = args.resume || path.join('reports', `${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}-${PROFILE}`);
fs.mkdirSync(outDir, { recursive: true });

async function signIn() {
  const browser = await launchChrome();
  const session = await login(await browser.newPage());
  await browser.close();
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session));
  console.log(`Signed in as ${EMAIL}`);
}

let signedIn = false;
for (const [i, route] of selected.entries()) {
  const resultFile = path.join(outDir, `${route.id}.json`);
  if (fs.existsSync(resultFile)) continue; // already done (resume)

  if (route.auth !== false && !signedIn) {
    await signIn();
    signedIn = true;
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    console.log(`[${i + 1}/${selected.length}] ${route.id} ${route.path}`);
    const { status } = spawnSync(process.execPath, ['audit-route.js', route.id, String(RUNS), outDir, PROFILE], { stdio: 'inherit' });
    if (status !== 3) break;
    console.log('  session expired, signing in again');
    await signIn();
  }
}

// Summary from every per-route result in the folder
const results = selected
  .map((r) => path.join(outDir, `${r.id}.json`))
  .filter((f) => fs.existsSync(f))
  .map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));

fs.writeFileSync(
  path.join(outDir, 'results.json'),
  JSON.stringify({ baseUrl: BASE_URL, profile: PROFILE, profileSettings: PROFILES[PROFILE], runsPerPage: RUNS, passThresholdMs: PASS_MS, results }, null, 2),
);

const cols = ['profile', 'module', 'page', 'path', 'priority', 'status', 'score', 'lcp', 'fcp', 'tbt', 'cls', 'si', 'tti', 'bytes', 'requests', 'apiCalls', 'slowestApiMs', 'slowestApi', 'redirectedTo', 'lcpRuns', 'error'];
const cell = (v) => {
  if (v === null || v === undefined) return '';
  const s = Array.isArray(v) ? v.join(' / ') : typeof v === 'number' ? String(Math.round(v * 1000) / 1000) : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
fs.writeFileSync(path.join(outDir, 'summary.csv'), [cols.join(','), ...results.map((r) => cols.map((c) => cell(r[c])).join(','))].join('\n'));

const counts = results.reduce((a, r) => ({ ...a, [r.status]: (a[r.status] || 0) + 1 }), {});
console.log(`\nDone ${results.length}/${selected.length}: ${JSON.stringify(counts)}  ->  ${outDir}`);
