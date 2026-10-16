// Stage 2 worker: measures a slice of one screen's controls from interactions.json.
// Run by run-interactions.js in its own process (a fresh Chrome per slice keeps memory flat).
//
//   node audit-interactions.js <screenId> <runs> <outDir> <start> <count>
// Exit code 3 = the session expired (screen redirected to /login).
//
// Per control kind:
//   tab / dropdown / button / sort / filter / pagination / link / search
//       open the screen, start a Lighthouse timespan, click (or type into the search box),
//       wait until API calls finish and the page stops changing, stop the timespan.
//       Response time = click until the screen settles; checked against the 3 s rule.
//   dropdown with selectOptions (e.g. Birthdays location filter)
//       also selects each option and measures the time until the section updates.
//   section-load (e.g. Birthdays on Home)
//       opens the screen and measures the time until that section has finished loading.
//   external-link (e.g. Quick links to Google Sites)
//       not clicked; checks the link still works (HTTP status, redirects, time).
// Every non-read API request made during a click is blocked, so nothing on dev changes.

import fs from 'node:fs';
import path from 'node:path';
import { startTimespan, desktopConfig } from 'lighthouse';
import { BASE_URL, INTERACTIONS_FILE, PASS_MS, SESSION_FILE, guardWrites, launchChrome, restoreSession } from './lib.js';

const [screenId, runsArg, outDir, startArg, countArg] = process.argv.slice(2);
const RUNS = Number(runsArg || 1);
const START = Number(startArg || 0);
const COUNT = Number(countArg || 15);
const IDLE_MS = 500; // quiet period that counts as "settled"
const MAX_MS = 30000; // give up waiting after this long
const MAX_OPTIONS = 20; // options tested per selectOptions dropdown

const screen = JSON.parse(fs.readFileSync(INTERACTIONS_FILE, 'utf8')).screens.find((s) => s.id === screenId);
const items = screen.items.filter((i) => i.enabled).slice(START, START + COUNT);
const baseUrl = BASE_URL + screen.path;

// Timespans cannot use simulated throttling, so clicks are measured on the real network.
const config = {
  ...desktopConfig,
  settings: { ...desktopConfig.settings, onlyCategories: ['performance'], throttlingMethod: 'provided' },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

const browser = await launchChrome();
const page = await browser.newPage();
await page.setViewport({ width: 1350, height: 940 });
await restoreSession(page, JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8')));
const guard = await guardWrites(page);

// Track API/XHR traffic so we know when the screen has finished loading data,
// and log each call's duration (used for section loads).
const inflight = new Map();
const apiLog = [];
let lastNet = 0;
// Only VenDians' own calls count: third-party requests (e.g. the embedded YouTube player's
// stats call) can stay open for minutes and would stop the screen from ever "settling".
const OWN_HOSTS = [new URL(BASE_URL).hostname, process.env.VENDIANS_API_HOST || `api.${new URL(BASE_URL).hostname}`];
const isData = (req) => ['xhr', 'fetch'].includes(req.resourceType()) && OWN_HOSTS.includes(new URL(req.url()).hostname);
page.on('request', (req) => { if (isData(req)) { inflight.set(req, Date.now()); lastNet = Date.now(); } });
const done = (req) => {
  const started = inflight.get(req);
  if (started === undefined) return;
  inflight.delete(req);
  lastNet = Date.now();
  apiLog.push({ url: req.url(), start: started, ms: lastNet - started });
};
page.on('requestfinished', done);
page.on('requestfailed', done);

async function watchDom() {
  await page.evaluate(() => {
    if (window.__vdObserver) return;
    window.__vdLastMutation = Date.now();
    window.__vdObserver = new MutationObserver(() => { window.__vdLastMutation = Date.now(); });
    window.__vdObserver.observe(document.documentElement, { subtree: true, childList: true, characterData: true });
  });
}

async function settle(t0) {
  await sleep(150);
  while (Date.now() - t0 < MAX_MS) {
    const lastDom = await page.evaluate(() => window.__vdLastMutation || 0).catch(() => 0);
    const last = Math.max(lastNet, lastDom, t0);
    if (inflight.size === 0 && Date.now() - last >= IDLE_MS) return { ms: last - t0, settled: true };
    await sleep(100);
  }
  return { ms: MAX_MS, settled: false };
}

async function exitIfLoggedOut() {
  if (new URL(page.url()).pathname.startsWith('/login')) {
    await browser.close();
    process.exit(3);
  }
}

async function openBase() {
  inflight.clear();
  await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 60000 });
  await exitIfLoggedOut();
  await watchDom();
  await settle(Date.now());
}

const atBase = () => {
  const u = new URL(page.url());
  return u.pathname + u.search === screen.path;
};

// Finds the control again: links by class + where they point, everything else by class + text.
async function find(item) {
  const handle = await page.evaluateHandle(({ css, text, href, nth }) => {
    const visible = (e) => {
      const r = e.getBoundingClientRect();
      const s = getComputedStyle(e);
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
    };
    const textOf = (e) =>
      (e.innerText || e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.title || '').trim().replace(/\s+/g, ' ').slice(0, 120);
    const sidebar = document.querySelector('aside');
    const matches = [...document.querySelectorAll(css)].filter(
      (e) =>
        visible(e) &&
        !(sidebar && sidebar.contains(e)) &&
        !e.closest('[role=dialog]') &&
        (href ? e.getAttribute('href') === href : textOf(e) === text),
    );
    return matches[nth] || null;
  }, item);
  return handle.asElement();
}

async function act(item, el) {
  await el.evaluate((e) => e.scrollIntoView({ block: 'center' }));
  await el.click();
  if (item.kind === 'search') await page.keyboard.type('an', { delay: 50 });
}

// Setup step for buttons that only enable after a row is ticked (PRECONDITIONS in discovery):
// ticks the checkbox of the first table row whose text matches the pattern.
async function tickRow(pattern) {
  const point = await page.evaluate((source) => {
    const re = new RegExp(source);
    const tr = [...document.querySelectorAll('tbody tr')].find(
      (t) => re.test(t.innerText) && t.querySelector('input[type=checkbox], [role=checkbox]'),
    );
    if (!tr) return null;
    const box = tr.querySelector('input[type=checkbox], [role=checkbox]');
    box.scrollIntoView({ block: 'center' });
    const r = box.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, pattern);
  if (!point) return false;
  await page.mouse.click(point.x, point.y);
  await sleep(500);
  return true;
}

async function undo(item, el) {
  if (item.kind === 'search') {
    await el.click({ clickCount: 3 }).catch(() => {});
    await page.keyboard.press('Backspace');
  }
  if (item.kind === 'checkbox') {
    await el.click().catch(() => {}); // untick
    return;
  }
  if (item.closeWith) {
    // Close the confirmation dialog with its cancel button (e.g. "No"), never the confirm one.
    // The write guard stays on while doing it.
    guard.arm();
    const closer = await page.evaluateHandle(
      (text) =>
        [...document.querySelectorAll('[role=dialog] button, [role=alertdialog] button')].find((b) => b.innerText.trim() === text) || null,
      item.closeWith,
    );
    const button = closer.asElement();
    if (button) await button.click();
    else await page.keyboard.press('Escape');
    await sleep(300);
    guard.disarm();
    blockedDuringUndo.push(...guard.takeBlocked());
    return;
  }
  await page.keyboard.press('Escape');
  await sleep(200);
  await page.keyboard.press('Escape');
}
const blockedDuringUndo = [];

function extract(lhr) {
  if (!lhr) return {};
  const requests = lhr.audits['network-requests']?.details?.items ?? [];
  const api = requests
    .filter((r) => r.url.includes('api.') && r.networkEndTime && r.networkRequestTime)
    .map((r) => ({ url: r.url, ms: r.networkEndTime - r.networkRequestTime }))
    .sort((a, b) => b.ms - a.ms);
  return {
    inp: lhr.audits['interaction-to-next-paint']?.numericValue ?? null,
    tbt: lhr.audits['total-blocking-time']?.numericValue ?? null,
    cls: lhr.audits['cumulative-layout-shift']?.numericValue ?? null,
    apiCalls: api.length,
    slowestApiMs: api[0]?.ms ?? null,
    slowestApi: api[0]?.url ?? null,
  };
}

// One result row; every kind fills the same columns so the summary stays one table.
function makeRow(item, runs, extra = {}) {
  const ok = runs.filter((r) => r.settled !== undefined);
  const ms = ok.length ? median(ok.map((r) => r.ms)) : null;
  const mid = [...ok].sort((a, b) => a.ms - b.ms)[Math.floor((ok.length - 1) / 2)] ?? {};
  const error = extra.error ?? null;
  return {
    screen: screen.id,
    module: screen.module,
    page: screen.page,
    key: item.key,
    kind: item.kind,
    label: item.label,
    section: item.section ?? null,
    runs: ok.length,
    responseRuns: ok.map((r) => Math.round(r.ms)),
    responseMs: ms,
    settled: ok.every((r) => r.settled),
    inp: mid.inp ?? null,
    tbt: mid.tbt ?? null,
    cls: mid.cls ?? null,
    apiCalls: mid.apiCalls ?? null,
    slowestApiMs: mid.slowestApiMs ?? null,
    slowestApi: mid.slowestApi ?? null,
    navigatedTo: null,
    blockedWrites: [],
    httpStatus: null,
    finalUrl: null,
    note: null,
    status: ms === null ? (error === 'control not found' ? 'NOT FOUND' : 'ERROR') : ms <= PASS_MS ? 'PASS' : 'FAIL',
    ...extra,
    error,
  };
}

// Click (or type) once with a Lighthouse timespan around it.
async function measureClick(item, el) {
  guard.arm();
  try {
    const timespan = await startTimespan(page, { config });
    const t0 = Date.now();
    await act(item, el);
    const s = await settle(t0);
    const result = await timespan.endTimespan();
    return { ...s, ...extract(result?.lhr) };
  } finally {
    guard.disarm();
  }
}

// tab / dropdown / button / sort / filter / pagination / link / search
async function measureControl(item) {
  const runs = [];
  let navigatedTo = null;
  let error = null;
  const blocked = [];
  for (let i = 1, retried = false; i <= RUNS; i++) {
    try {
      if (!atBase() || item.before) await openBase(); // setup steps start from a clean screen
      // Let the screen finish re-rendering first, or the control found may be replaced
      // before the click lands ("Node is detached from document").
      await settle(Date.now());
      if (item.before?.tickRow && !(await tickRow(item.before.tickRow))) {
        error = 'setup failed: no table row matches the precondition';
        break;
      }
      let el = await find(item);
      if (!el) {
        await openBase(); // state from an earlier click may hide it; retry on a clean screen
        el = await find(item);
      }
      if (!el) {
        error = 'control not found';
        break;
      }
      runs.push(await measureClick(item, el));
      blocked.push(...guard.takeBlocked());
      if (!atBase()) navigatedTo = new URL(page.url()).pathname;
      await undo(item, el).catch(() => {});
      blocked.push(...blockedDuringUndo.splice(0));
      if (item.before) await openBase(); // clear the ticked row before the next control
      error = null;
    } catch (err) {
      error = err.message.split('\n')[0];
      await openBase().catch(() => {});
      // A re-render or a reloading embed can detach the control mid-click: retry this run once.
      if (!retried && /detached/i.test(error)) { retried = true; i--; }
    }
  }
  return makeRow(item, runs, { navigatedTo, blockedWrites: [...new Set(blocked)], error });
}

// Dropdowns marked selectOptions: select each option and time the update.
// The screen is reopened before every option so each starts from the default filter.
async function measureOptions(item) {
  await openBase();
  const el = await find(item);
  if (!el) return [];
  await el.click();
  await sleep(500);
  const options = await page.evaluate(() =>
    [...document.querySelectorAll('[role=option]')]
      .filter((o) => o.getBoundingClientRect().height > 0)
      .map((o) => o.innerText.trim().replace(/\s+/g, ' '))
      .filter(Boolean),
  );
  await page.keyboard.press('Escape');

  const rows = [];
  for (const option of options.slice(0, MAX_OPTIONS)) {
    const optionItem = { ...item, kind: 'dropdown-option', key: `${item.key}>${option}`, label: `${item.label} → ${option}` };
    const runs = [];
    let error = null;
    const blocked = [];
    for (let i = 1, retried = false; i <= RUNS; i++) {
      try {
        await openBase();
        const dropdown = await find(item);
        if (!dropdown) { error = 'control not found'; break; }
        await dropdown.click();
        await sleep(400);
        const handle = await page.evaluateHandle(
          (text) => [...document.querySelectorAll('[role=option]')].find((o) => o.innerText.trim().replace(/\s+/g, ' ') === text) || null,
          option,
        );
        const optionEl = handle.asElement();
        if (!optionEl) { error = 'option not found'; break; }
        runs.push(await measureClick({ kind: 'dropdown-option' }, optionEl));
        blocked.push(...guard.takeBlocked());
        error = null;
      } catch (err) {
        error = err.message.split('\n')[0];
        // e.g. "detached Frame" when the embedded video reloads mid-click: retry this run once
        if (!retried) { retried = true; i--; }
      }
    }
    rows.push(makeRow(optionItem, runs, { blockedWrites: [...new Set(blocked)], error }));
  }
  return rows;
}

// section-load: open the screen fresh and time until the section shows its content
// (no loading placeholders left and no change for IDLE_MS).
async function measureSection(item) {
  const runs = [];
  let error = null;
  let slowest = null;
  for (let i = 1; i <= RUNS; i++) {
    try {
      inflight.clear();
      const t0 = Date.now();
      await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await exitIfLoggedOut();
      let lastText = null;
      let lastChange = Date.now();
      let loadedAt = null;
      while (Date.now() - t0 < MAX_MS) {
        const state = await page
          .evaluate((name) => {
            const h = [...document.querySelectorAll('h1, h2, h3, h4')].find((e) => e.innerText.trim().toLowerCase() === name.toLowerCase());
            if (!h) return null;
            const box = h.closest('[class*=panel], [class*=card], section') || h.parentElement;
            const loading = !!box.querySelector('[class*=skeleton], [class*=spinner], [class*=loading], [aria-busy=true]');
            return { text: box.innerText, body: box.innerText.replace(h.innerText, '').trim(), loading };
          }, item.text)
          .catch(() => null);
        if (state) {
          if (state.text !== lastText) { lastText = state.text; lastChange = Date.now(); }
          if (!state.loading && state.body.length > 0 && Date.now() - lastChange >= IDLE_MS) { loadedAt = lastChange; break; }
        }
        await sleep(100);
      }
      const ms = loadedAt ? loadedAt - t0 : MAX_MS;
      const during = apiLog.filter((a) => a.start >= t0 && a.start <= t0 + ms).sort((a, b) => b.ms - a.ms);
      const related = during.find((a) => a.url.toLowerCase().includes(item.text.toLowerCase().replace(/s$/, ''))) ?? during[0];
      runs.push({ ms, settled: !!loadedAt, slowestApiMs: related?.ms ?? null, slowestApi: related?.url ?? null });
      slowest = related ?? slowest;
    } catch (err) {
      error = err.message.split('\n')[0];
    }
  }
  return makeRow(item, runs, { error, note: slowest ? 'slowest API = the call behind this section, if one matches its name' : null });
}

// external-link: not clicked (it leaves VenDians); checks the link still works.
async function checkLink(item) {
  const t0 = Date.now();
  let status = null;
  let finalUrl = null;
  let error = null;
  // One retry: a single network hiccup should not mark a working link as broken.
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetch(item.href, { redirect: 'follow', signal: AbortSignal.timeout(20000) });
      status = res.status;
      finalUrl = res.url;
      error = null;
      await res.arrayBuffer().catch(() => {});
      break;
    } catch (err) {
      error = err.message;
    }
  }
  const signInWall = finalUrl && /accounts\.google\.com|ServiceLogin/.test(finalUrl);
  const row = makeRow(item, [{ ms: Date.now() - t0, settled: true }], {
    httpStatus: status,
    finalUrl,
    note: signInWall ? 'asks for Google sign-in (normal for internal Google Sites / Drive)' : null,
    error,
  });
  row.status = error || status >= 400 ? 'BROKEN LINK' : 'LINK OK';
  return row;
}

await openBase();
const results = [];

for (const item of items) {
  let rows;
  if (item.kind === 'external-link') rows = [await checkLink(item)];
  else if (item.kind === 'section-load') rows = [await measureSection(item)];
  else {
    rows = [await measureControl(item)];
    if (item.selectOptions) rows.push(...(await measureOptions(item)));
  }
  for (const row of rows) {
    results.push(row);
    const time = row.responseMs !== null ? `  ${Math.round(row.responseMs)} ms` : '';
    const extra = row.httpStatus ? `  HTTP ${row.httpStatus}` : row.blockedWrites.length ? `  (blocked: ${row.blockedWrites.join(', ')})` : '';
    console.log(`  ${row.status.padEnd(11)} ${row.kind.padEnd(15)} ${row.label.slice(0, 50)}${time}${extra}`);
  }
}

await browser.close();
fs.writeFileSync(path.join(outDir, `${screen.id}.${START}.json`), JSON.stringify(results, null, 2));
