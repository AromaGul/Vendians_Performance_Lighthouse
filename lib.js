// Shared settings and helpers for the orchestrator (run-lighthouse.js) and worker (audit-route.js).

import 'dotenv/config';
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

export const BASE_URL = (process.env.VENDIANS_BASE_URL || 'https://dev.vendians.com').replace(/\/$/, '');
export const EMAIL = process.env.VENDIANS_TEST_EMAIL;
export const CHROME_PATH = process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
export const PASS_MS = Number(process.env.PASS_THRESHOLD_MS || 3000);
export const SESSION_FILE = '.session.json';
export const INTERACTIONS_FILE = 'interactions.json';

// Network/CPU profiles. All keep the desktop screen (web only); only speed changes.
// `simulate` = page loads on the real network and Lighthouse calculates the timings
// for the profile; `provided` = no throttling, real network as-is.
export const PROFILES = {
  desktop: { label: 'Desktop broadband', throttlingMethod: 'simulate', throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } },
  '4g': { label: 'Slow 4G', throttlingMethod: 'simulate', throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 } },
  '3g': { label: '3G', throttlingMethod: 'simulate', throttling: { rttMs: 300, throughputKbps: 700, cpuSlowdownMultiplier: 4 } },
  none: { label: 'No throttling (real network)', throttlingMethod: 'provided', throttling: { rttMs: 0, throughputKbps: 0, cpuSlowdownMultiplier: 1 } },
};

export function launchChrome() {
  return puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    defaultViewport: null,
    args: ['--no-first-run', '--no-default-browser-check'],
  });
}

// Signs in through the UI (email-only dev login) and returns the session:
// the `tokenid` cookie alone is not enough, the app also needs its localStorage.
export async function login(page) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle2' });
  const input = await page.waitForSelector('input[placeholder="Enter email address"]', { timeout: 30000 });
  await input.click({ clickCount: 3 });
  await input.type(EMAIL);
  await page.locator('::-p-text(Login with Email)').click();
  await page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 30000 });
  await page.waitForNetworkIdle({ idleTime: 1000, timeout: 30000 }).catch(() => {});
  return {
    cookies: await page.browser().cookies(),
    localStorage: await page.evaluate(() => JSON.stringify(localStorage)),
  };
}

// Logs in with a throwaway browser and saves the session for the workers.
export async function signIn() {
  const browser = await launchChrome();
  const session = await login(await browser.newPage());
  await browser.close();
  fs.writeFileSync(SESSION_FILE, JSON.stringify(session));
  console.log(`Signed in as ${EMAIL}`);
}

// Safety guard for click tests: while armed, any API request that is not a read
// (POST/PUT/PATCH/DELETE to api.<host>) is blocked, so a click can never change dev data.
// Returns { arm(), disarm(), takeBlocked() }.
export async function guardWrites(page) {
  const apiHost = process.env.VENDIANS_API_HOST || 'api.' + new URL(BASE_URL).hostname; // api.dev.vendians.com
  const cdp = await page.createCDPSession();
  let armed = false;
  let blocked = [];
  cdp.on('Fetch.requestPaused', async ({ requestId, request }) => {
    const write = !['GET', 'HEAD', 'OPTIONS'].includes(request.method);
    try {
      if (armed && write) {
        blocked.push(`${request.method} ${new URL(request.url).pathname}`);
        await cdp.send('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' });
      } else {
        await cdp.send('Fetch.continueRequest', { requestId });
      }
    } catch {
      // request already gone (page navigated)
    }
  });
  await cdp.send('Fetch.enable', { patterns: [{ urlPattern: `*://${apiHost}/*`, requestStage: 'Request' }] });
  return {
    arm: () => { armed = true; },
    disarm: () => { armed = false; },
    takeBlocked: () => { const b = blocked; blocked = []; return b; },
  };
}

// Restores a saved session into a fresh browser. localStorage is re-applied on every
// document load because Lighthouse clears origin storage before each run.
export async function restoreSession(page, session) {
  await page.browser().setCookie(...session.cookies);
  await page.evaluateOnNewDocument((origin, data) => {
    if (location.origin !== origin) return;
    for (const [k, v] of Object.entries(JSON.parse(data))) {
      if (localStorage.getItem(k) === null) localStorage.setItem(k, v);
    }
  }, BASE_URL, session.localStorage);
}
