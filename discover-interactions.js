// Stage 1 — discovery. Opens every screen in routes.js (logged in) and lists the tabs,
// dropdowns, buttons, search boxes and links on it. Clicks nothing; only reads the page.
//
//   node discover-interactions.js                    all screens -> interactions.json
//   node discover-interactions.js --only=home        re-scan some screens and merge them into interactions.json
//   node discover-interactions.js --reclassify       re-apply the skip rules to interactions.json (no scan)
//
// Review interactions.json before stage 2: set "enabled": false on anything you
// do not want clicked. Items blocked by the safety rules below start disabled.

import fs from 'node:fs';
import { routes } from './routes.js';
import { BASE_URL, EMAIL, INTERACTIONS_FILE, SESSION_FILE, launchChrome, restoreSession, signIn } from './lib.js';

// Never clicked: anything that changes data, downloads/uploads files, or logs out.
// (Stage 2 also blocks every non-read API request as a second safety net.)
const DENY = /\b(save|submit|confirm|delete|remove|approve|decline|reject|cancel|withdraw|send|publish|upload|import|export|downloads?|logout|log out|sign out|reset|archive|activate|deactivate|terminate|lock|unlock|close cycle|generate|sync|run|recalculate|mark all|duplicate|clone|assign|release|notify|picture|yes|ok)\b/i;

// Page sections whose loading time is measured on their own (screen id -> section headings),
// e.g. Birthdays on Home, which waits on the slow /employees/birthday API.
const SECTION_LOADS = { home: ['Birthdays'] };

// Dropdowns inside these sections are also tested option by option (each option is selected
// and the time until the section updates is measured), e.g. the Birthdays location filter.
const SELECT_OPTION_SECTIONS = ['Birthdays'];

// Buttons that only enable after a row is ticked, tested with that setup step first
// (screen id -> button label -> steps). They are tested even though their label would
// normally be skipped, because the first click only opens a confirmation dialog and the
// test closes it with `closeWith` — the confirming button (e.g. "Yes") is never clicked.
const PRECONDITIONS = {
  'perf-my-goals': {
    'Submit for Approval': { tickRow: '\\bPending\\b(?! Approval)', closeWith: 'No' },
  },
};

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')).map(([k, v]) => [k, v ?? 'true']),
);
const only = args.only ? new Set(args.only.split(',')) : null;
const selected = routes.filter((r) => r.auth !== false && (!only || only.has(r.id)));

if (!EMAIL) {
  console.error('VENDIANS_TEST_EMAIL is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}

// Runs inside the page: returns every visible clickable control outside the sidebar.
function scanPage() {
  const visible = (e) => {
    const r = e.getBoundingClientRect();
    const s = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  };
  const sidebar = document.querySelector('aside');
  const header = document.querySelector('header');
  const query = 'button, a[href], [role=tab], [role=button], [role=combobox], [aria-haspopup], select, input[type=search], input[placeholder], input[type=checkbox], [role=checkbox]';
  const all = [...document.querySelectorAll(query)].filter(
    (e) => visible(e) && !(sidebar && sidebar.contains(e)) && !e.closest('[role=dialog]'),
  );
  // Keep the outermost control when one control is nested in another (e.g. a dropdown and its input).
  const outer = all.filter((e) => !all.some((o) => o !== e && o.contains(e)));

  const cssOf = (e) => {
    const cls = [...e.classList].find((c) => /^(ethr|vd)-/.test(c));
    const role = e.getAttribute('role');
    const type = e.tagName === 'INPUT' && e.type === 'checkbox' ? '[type="checkbox"]' : '';
    return e.tagName.toLowerCase() + type + (cls ? `.${cls}` : '') + (!cls && role ? `[role="${role}"]` : '');
  };
  const textOf = (e) =>
    (e.innerText || e.getAttribute('aria-label') || e.getAttribute('placeholder') || e.title || '').trim().replace(/\s+/g, ' ').slice(0, 120);
  // Nearest section heading above the control (e.g. "Birthdays", "Quick links").
  const sectionOf = (e) => {
    for (let c = e.parentElement; c && c !== document.body; c = c.parentElement) {
      const h = c.querySelector('h1, h2, h3, h4');
      if (h && !h.contains(e)) return h.innerText.trim().replace(/\s+/g, ' ').slice(0, 60);
    }
    return null;
  };

  const seen = new Map();
  return outer.map((e) => {
    const css = cssOf(e);
    const text = textOf(e);
    const href = e.tagName === 'A' ? e.getAttribute('href') : null;
    const key = href ? `${css}|${href}` : `${css}|${text}`;
    const nth = seen.get(key) ?? 0;
    seen.set(key, nth + 1);
    return {
      css,
      text,
      href,
      nth,
      tag: e.tagName,
      role: e.getAttribute('role'),
      popup: e.getAttribute('aria-haspopup'),
      className: e.className.toString(),
      disabled: e.disabled === true || e.getAttribute('aria-disabled') === 'true',
      inHeader: !!(header && header.contains(e)),
      section: sectionOf(e),
    };
  });
}

function classify(el) {
  const c = el.className;
  if (el.tag === 'A') return /^https?:\/\//.test(el.href) && !el.href.startsWith(BASE_URL) ? 'external-link' : 'link';
  // Row checkboxes only select rows on screen; the first one (usually "select all") is tested.
  if (el.role === 'checkbox' || el.css.includes('[type="checkbox"]')) return 'checkbox';
  if (el.tag === 'INPUT' && /search/i.test(el.text)) return 'search';
  if (el.role === 'tab') return 'tab';
  if (el.role === 'combobox' || el.tag === 'SELECT' || ['listbox', 'menu', 'true', 'dialog'].includes(el.popup)) return 'dropdown';
  if (c.includes('table__sort')) return 'sort';
  if (c.includes('table__filter-trigger')) return 'filter';
  if (c.includes('pagination') || c.includes('footer-nav')) return 'pagination';
  if (el.tag === 'INPUT') return 'input';
  return 'button';
}

// Decides whether stage 2 clicks the control by default, and why not.
function decide(el, kind) {
  if (el.disabled) return 'disabled';
  if (el.tag === 'TH') return 'column drag handle';
  if (/theme-switch/.test(el.className)) return 'changes theme setting';
  if (kind === 'input') return 'text field (not a search box)';
  if (kind === 'pagination' && /^\d+$/.test(el.text) && el.text !== '2') return 'duplicate page number';
  if (kind === 'pagination' && el.text === '…') return 'page jump';
  return null; // label-based rules are in applyRules()
}

// Reasons that come from how a control looks, not from its label. Kept by --reclassify.
const STRUCTURAL = new Set(['disabled', 'column drag handle', 'changes theme setting', 'text field (not a search box)', 'duplicate page number', 'page jump']);
const GENERIC_CSS = new Set(['button', 'button.ethr-button', 'button.ethr-icon-button', 'span[role="button"]', 'div[role="button"]']);

// The same action repeated on every table row (Edit X, View claim 123, Manage users for X)
// is tested once: "Edit PKR" and "Edit USD" share the key "button.vd-row-action|Edit".
// A list of same-styled items (accordion rows, pivot cells, chips) is also tested once.
// Links are grouped by where they go, ignoring ids: /employees/12 and /employees/40 are one.
function actionKey(item) {
  if (item.kind === 'link') return `${item.css}|${item.href.replace(/[0-9a-f-]{8,}|\d+/gi, '#')}`;
  const text = item.text.replace(/\d[\d,.]*/g, '#');
  const verb = text.includes(' for ') ? text.split(' for ')[0] : text.split(' ')[0];
  const known = /^(edit|view|delete|manage|open|show|#)\b/i.test(text);
  return GENERIC_CSS.has(item.css) || known ? `${item.css}|${verb}` : item.css;
}

// Label-based rules, applied after scanning (and again by --reclassify).
function applyRules(items) {
  const collapsible = (x) => x.kind === 'button' || x.kind === 'link';
  const groups = {};
  for (const x of items) if (collapsible(x)) (groups[actionKey(x)] ??= []).push(x);
  const seen = new Set();
  for (const x of items) {
    if (x.before) continue; // tested with a setup step (PRECONDITIONS); rules do not apply
    if (x.skipReason && STRUCTURAL.has(x.skipReason)) continue;
    let reason = null;
    if (x.nth > 0) reason = 'repeat of the same control (first one is tested)';
    else if (x.kind !== 'external-link' && x.kind !== 'section-load' && DENY.test(x.text)) reason = 'action that may change data or download';
    else if (collapsible(x) && groups[actionKey(x)].length >= 3) {
      if (seen.has(actionKey(x))) reason = 'repeat of a row action (first one is tested)';
      seen.add(actionKey(x));
    }
    x.enabled = reason === null;
    if (reason) x.skipReason = reason;
    else delete x.skipReason;
  }
  return items;
}

function printSummary(screens) {
  const all = screens.flatMap((s) => s.items);
  const on = all.filter((x) => x.enabled);
  const byKind = on.reduce((a, x) => ({ ...a, [x.kind]: (a[x.kind] || 0) + 1 }), {});
  console.log(`\n${all.length} controls found, ${on.length} to test ${JSON.stringify(byKind)}  ->  ${INTERACTIONS_FILE}`);
}

// --reclassify: re-apply the rules to an existing interactions.json without scanning again.
if (args.reclassify) {
  const data = JSON.parse(fs.readFileSync(INTERACTIONS_FILE, 'utf8'));
  for (const screen of data.screens) {
    for (const x of screen.items) if (x.kind === 'search' && !/search/i.test(x.text)) x.kind = 'dropdown';
    applyRules(screen.items);
  }
  fs.writeFileSync(INTERACTIONS_FILE, JSON.stringify(data, null, 2));
  printSummary(data.screens);
  process.exit(0);
}

await signIn();
const session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
const browser = await launchChrome();
const page = await browser.newPage();
await page.setViewport({ width: 1350, height: 940 });
await restoreSession(page, session);

const screens = [];
for (const [i, route] of selected.entries()) {
  process.stdout.write(`[${i + 1}/${selected.length}] ${route.id} ... `);
  try {
    await page.goto(BASE_URL + route.path, { waitUntil: 'networkidle2', timeout: 60000 });
    await page.waitForNetworkIdle({ idleTime: 1000, timeout: 20000 }).catch(() => {});
    const found = await page.evaluate(scanPage);

    const items = [];
    for (const section of SECTION_LOADS[route.id] ?? []) {
      items.push({ key: `${route.id}:section-load:${section}`, kind: 'section-load', label: `${section} section loads`, css: '', text: section, nth: 0, scope: 'page', section, enabled: true });
    }
    for (const el of found) {
      // Header controls (global search, notifications, account menu) are the same on
      // every screen, so they are tested once, on Home.
      if (el.inHeader && route.id !== 'home') continue;
      const kind = classify(el);
      const pre = el.nth === 0 ? PRECONDITIONS[route.id]?.[el.text] : undefined;
      const reason = pre ? null : decide(el, kind);
      const label =
        el.text ||
        (el.href ? el.href.replace(/^https?:\/\//, '').split('/')[0] : kind === 'checkbox' ? 'First checkbox (select all / first row)' : el.css);
      items.push({
        key: `${route.id}:${kind}:${el.href || label}${el.nth ? `#${el.nth}` : ''}`,
        kind,
        label,
        css: el.css,
        text: el.text,
        ...(el.href ? { href: el.href } : {}),
        nth: el.nth,
        scope: el.inHeader ? 'header' : 'page',
        ...(el.section ? { section: el.section } : {}),
        ...(kind === 'dropdown' && SELECT_OPTION_SECTIONS.includes(el.section) ? { selectOptions: true } : {}),
        ...(pre ? { before: { tickRow: pre.tickRow }, closeWith: pre.closeWith } : {}),
        enabled: reason === null,
        ...(reason ? { skipReason: reason } : {}),
      });
    }
    applyRules(items);
    screens.push({ id: route.id, module: route.module, page: route.page, path: route.path, items });
    const on = items.filter((x) => x.enabled).length;
    console.log(`${items.length} found, ${on} to test`);
  } catch (err) {
    screens.push({ id: route.id, module: route.module, page: route.page, path: route.path, items: [], error: err.message });
    console.log(`failed: ${err.message}`);
  }
}
await browser.close();

// --only merges the re-scanned screens into the existing file; a full scan replaces it.
let all = screens;
if (only && fs.existsSync(INTERACTIONS_FILE)) {
  const existing = JSON.parse(fs.readFileSync(INTERACTIONS_FILE, 'utf8')).screens;
  const fresh = new Map(screens.map((s) => [s.id, s]));
  all = routes
    .filter((r) => r.auth !== false)
    .map((r) => fresh.get(r.id) ?? existing.find((s) => s.id === r.id))
    .filter(Boolean);
}
fs.writeFileSync(INTERACTIONS_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl: BASE_URL, screens: all }, null, 2));

printSummary(all);
