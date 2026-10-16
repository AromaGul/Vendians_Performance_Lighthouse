// Worker: audits ONE route N times in a fresh Chrome and writes <outDir>/<id>.json (+ .html for the median run).
// Run by run-lighthouse.js; each route gets its own process so memory never builds up.
//
//   node audit-route.js <routeId> <runs> <outDir>
// Exit code 3 = the session expired (page redirected to /login).

import fs from 'node:fs';
import path from 'node:path';
import { navigation, generateReport, desktopConfig } from 'lighthouse';
import { routes } from './routes.js';
import { BASE_URL, PASS_MS, PROFILES, SESSION_FILE, launchChrome, restoreSession } from './lib.js';

const [routeId, runsArg, outDir, profileArg] = process.argv.slice(2);
const route = routes.find((r) => r.id === routeId);
const RUNS = Number(runsArg || 3);
const profile = PROFILES[profileArg || 'desktop'];

const config = {
  ...desktopConfig,
  settings: {
    ...desktopConfig.settings,
    onlyCategories: ['performance'],
    maxWaitForLoad: 60000,
    throttlingMethod: profile.throttlingMethod,
    throttling: { ...desktopConfig.settings.throttling, ...profile.throttling },
  },
};

const ms = (lhr, id) => lhr.audits[id]?.numericValue ?? null;

function extract(lhr) {
  const requests = lhr.audits['network-requests']?.details?.items ?? [];
  const api = requests
    .filter((r) => r.url.includes('api.') && r.networkEndTime && r.networkRequestTime)
    .map((r) => ({ url: r.url, ms: r.networkEndTime - r.networkRequestTime }))
    .sort((a, b) => b.ms - a.ms);
  return {
    score: lhr.categories.performance.score === null ? null : Math.round(lhr.categories.performance.score * 100),
    fcp: ms(lhr, 'first-contentful-paint'),
    lcp: ms(lhr, 'largest-contentful-paint'),
    tbt: ms(lhr, 'total-blocking-time'),
    cls: ms(lhr, 'cumulative-layout-shift'),
    si: ms(lhr, 'speed-index'),
    tti: ms(lhr, 'interactive'),
    bytes: ms(lhr, 'total-byte-weight'),
    requests: requests.length,
    apiCalls: api.length,
    slowestApiMs: api[0]?.ms ?? null,
    slowestApi: api[0]?.url ?? null,
    finalUrl: lhr.finalDisplayedUrl,
    error: lhr.runtimeError?.message ?? null,
  };
}

const browser = await launchChrome();
const page = await browser.newPage();
if (route.auth !== false) {
  await restoreSession(page, JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8')));
}

const runs = [];
let sessionLost = false;
for (let i = 1; i <= RUNS; i++) {
  try {
    const { lhr } = await navigation(page, BASE_URL + route.path, { config });
    const m = extract(lhr);
    if (route.auth !== false && new URL(m.finalUrl).pathname.startsWith('/login')) {
      sessionLost = true;
      break;
    }
    runs.push({ lhr, m });
    console.log(`  run ${i}/${RUNS}: ${m.error ? `error: ${m.error}` : `LCP ${Math.round(m.lcp)} ms, score ${m.score}`}`);
  } catch (err) {
    console.log(`  run ${i}/${RUNS}: failed: ${err.message}`);
  }
}
await browser.close();
if (sessionLost) process.exit(3);

const ok = runs.filter((r) => r.m.lcp !== null && !r.m.error).sort((a, b) => a.m.lcp - b.m.lcp);
const median = ok[Math.floor((ok.length - 1) / 2)];
if (median) fs.writeFileSync(path.join(outDir, `${route.id}.html`), generateReport(median.lhr, 'html'));

const final = median ? new URL(median.m.finalUrl) : null;
const finalPath = final ? final.pathname + final.search : null;
const redirected = final && final.pathname !== route.path.split('?')[0];

const result = {
  ...route,
  profile: profileArg || 'desktop',
  runs: runs.length,
  lcpRuns: ok.map((r) => Math.round(r.m.lcp)),
  ...(median ? median.m : { error: runs[0]?.m.error || 'all runs failed' }),
  redirectedTo: redirected ? finalPath : null,
  status: !median ? 'ERROR' : redirected ? 'REDIRECTED' : median.m.lcp <= PASS_MS ? 'PASS' : 'FAIL',
};
fs.writeFileSync(path.join(outDir, `${route.id}.json`), JSON.stringify(result, null, 2));
console.log(`  => ${result.status}${median ? ` (median LCP ${Math.round(median.m.lcp)} ms)` : ''}`);
