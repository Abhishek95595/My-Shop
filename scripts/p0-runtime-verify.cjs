/**
 * P0 verification runtime tests — driven over CDP against the production site,
 * reusing the real Chrome profile's Firebase admin session (isolated clone).
 */
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PHASE = process.argv[2] || 'admin-delete';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const SRC_PROFILE = process.env.KOH_ADMIN_PROFILE ||
  `${process.env.HOME}/Library/Application Support/Google/Chrome/Default`;
const TMP = `/tmp/koh_p0_${Date.now()}`;
const BASE = 'https://khushi-ornament-house.vercel.app';
const PORT = 9337;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const finish = async (chrome, code = 0) => {
  // stdout is piped when this verifier runs under the task shell. Flush it
  // before ending so its runtime evidence is retained in the command output.
  await new Promise((resolve) => process.stdout.write('', resolve));
  chrome.kill();
  if (ws) ws.close();
  process.exitCode = code;
};

function launchChrome() {
  fs.mkdirSync(path.join(TMP, 'Default'), { recursive: true });
  try {
    if (process.env.KOH_COPY_FULL_PROFILE === '1') {
      fs.cpSync(SRC_PROFILE, path.join(TMP, 'Default'), { recursive: true, force: true });
    }
    // Firebase's persisted browser session lives in the site IndexedDB. Clone
    // only it plus the Chrome cookie/key metadata required by Google sign-in;
    // copying an entire real profile creates multi-GB disposable directories.
    const chromeRoot = path.dirname(SRC_PROFILE);
    const files = ['Cookies', 'Cookies-journal', 'Preferences', 'Secure Preferences', 'Login Data', 'Login Data-journal'];
    for (const file of files) {
      const source = path.join(SRC_PROFILE, file);
      if (fs.existsSync(source)) fs.cpSync(source, path.join(TMP, 'Default', file));
    }
    const siteDb = path.join(SRC_PROFILE, 'IndexedDB', 'https_khushi-ornament-house.vercel.app_0.indexeddb.leveldb');
    if (fs.existsSync(siteDb)) {
      fs.mkdirSync(path.join(TMP, 'Default', 'IndexedDB'), { recursive: true });
      fs.cpSync(siteDb, path.join(TMP, 'Default', 'IndexedDB', path.basename(siteDb)), { recursive: true });
    }
    for (const directory of ['Local Storage', 'WebStorage', 'Service Worker']) {
      const source = path.join(SRC_PROFILE, directory);
      if (fs.existsSync(source)) {
        fs.mkdirSync(path.join(TMP, 'Default', directory), { recursive: true });
        execSync(
          `rsync -a --exclude='CacheStorage' --exclude='Code Cache' --exclude='ScriptCache' --exclude='GPUCache' --exclude='DawnWebGPUCache' "${source}/" "${path.join(TMP, 'Default', directory)}/"`,
          { stdio: 'pipe' }
        );
      }
    }
    const localState = path.join(chromeRoot, 'Local State');
    if (fs.existsSync(localState)) fs.cpSync(localState, path.join(TMP, 'Local State'));
    execSync(`rm -f "${TMP}/Singleton" "${TMP}/Default/Singleton" 2>/dev/null; find "${TMP}" -name LOCK -delete 2>/dev/null`, { stdio: 'ignore' });
  } catch (e) { console.error('clone warn:', e.message); }
  return spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${PORT}`,
    '--remote-debugging-address=127.0.0.1', '--no-first-run',
    '--no-default-browser-check', '--disable-gpu',
    `--user-data-dir=${TMP}`, '--profile-directory=Default', 'about:blank',
  ], { stdio: 'ignore' });
}

let wsId = 0;
const pending = new Map();
let ws;

function send(method, params = {}, sessionId) {
  const id = ++wsId;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
}

async function evaluate(expr, sessionId) {
  const r = await send('Runtime.evaluate', {
    expression: expr, awaitPromise: true, returnByValue: true,
  }, sessionId);
  if (r.exceptionDetails) throw new Error('Page eval error: ' + JSON.stringify(r.exceptionDetails).slice(0, 500));
  return r.result.value;
}

async function waitTab(sessionId, testid, timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    await sleep(1500);
    try {
      const state = await evaluate(`(() => {
        const dash = document.querySelector('[data-testid="${testid}"]');
        const denied = document.querySelector('[data-testid="admin-access-denied"]');
        return JSON.stringify({ dash: !!dash, denied: !!denied, text: (document.body.innerText || '').slice(0, 400) });
      })()`, sessionId);
      const s = JSON.parse(state);
      if (s.dash) return s;
      if (s.denied) throw new Error('ADMIN ACCESS DENIED — session not authorized: ' + s.text);
    } catch (e) { if (String(e).includes('DENIED')) throw e; }
  }
  throw new Error('Timed out waiting for ' + testid + ' — body: ' + (await evaluate('document.body ? document.body.innerText.slice(0,300) : "NO BODY"', sessionId)));
}

async function main() {
  const chrome = launchChrome();
  let version = null;
  for (let i = 0; i < 20; i++) {
    await sleep(700);
    try { version = await (await fetch(`http://127.0.0.1:${PORT}/json/version`)).json(); break; } catch {}
  }
  if (!version) throw new Error('Chrome CDP did not come up');

  const targetList = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
  const page = targetList.find(t => t.type === 'page');
  if (!page) throw new Error('No page target found');

  ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p.reject(new Error(msg.error.message));
      else p.resolve(msg.result);
    }
  };

  const attached = await send('Target.attachToTarget', { targetId: page.id, flatten: true });
  const sessionId = attached.sessionId;
  await send('Page.enable', {}, sessionId);
  await send('Page.navigate', { url: BASE + '/admin' }, sessionId);

  if (PHASE === 'nonadmin-login') {
    await sleep(2500);
    const denied = await evaluate(`JSON.stringify({ denied: !!document.querySelector('[data-testid="admin-access-denied"]'), body: document.body.innerText.slice(0, 600) })`, sessionId);
    if (!JSON.parse(denied).denied) throw new Error('Expected the non-admin profile to begin at the denied admin screen');
    if (JSON.parse(denied).body.includes('100omkarnathverma@gmail.com')) {
      console.log('NONADMIN LOGIN:', JSON.stringify({ customerAuthenticated: true, adminDashboardAuthorized: false, adminDenied: true }));
      await finish(chrome);
      return;
    }
    await evaluate(`(() => Array.from(document.querySelectorAll('button')).find((b) => b.innerText.includes('Sign In as Administrator')).click())()`, sessionId);
    await sleep(3500);
    const targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const popup = targets.find((target) => target.type === 'page' && target.url.includes('accounts.google.com'));
    if (!popup) throw new Error('Google sign-in popup did not open; targets: ' + targets.map((target) => target.url).join(', '));
    const popupAttached = await send('Target.attachToTarget', { targetId: popup.id, flatten: true });
    const popupSession = popupAttached.sessionId;
    await send('Page.enable', {}, popupSession);
    const selection = await evaluate(`(() => {
      const email = '100omkarnathverma@gmail.com';
      const leaf = Array.from(document.querySelectorAll('*')).find((el) => el.children.length === 0 && el.textContent.trim() === email);
      return JSON.stringify({ accountListed: !!leaf, prompt: document.body.innerText.slice(0, 300) });
    })()`, popupSession);
    if (!JSON.parse(selection).accountListed) throw new Error('The supplied Google account is not available in the existing browser session; interactive sign-in is required');
    await evaluate(`(() => {
      const email = '100omkarnathverma@gmail.com';
      const leaf = Array.from(document.querySelectorAll('*')).find((el) => el.children.length === 0 && el.textContent.trim() === email);
      (leaf.closest('[role="link"], [role="button"], [data-identifier]') || leaf.parentElement).click();
    })()`, popupSession);
    await sleep(5000);
    const finalState = await evaluate(`JSON.stringify({ customerAuthenticated: document.body.innerText.includes('100omkarnathverma@gmail.com'), adminDashboardAuthorized: !!document.querySelector('[data-testid="admin-dashboard"]'), adminDenied: !!document.querySelector('[data-testid="admin-access-denied"]') })`, sessionId);
    console.log('NONADMIN LOGIN:', finalState);
    await finish(chrome);
    return;
  }

  // 1. Confirm admin session + dashboard
  const s = await waitTab(sessionId, 'admin-dashboard');
  console.log('ADMIN DASHBOARD: visible. snippet=', JSON.stringify(s.text.slice(0, 200)));

  const PRODUCT = 'P0 Verification Temporary Draft';

  if (PHASE === 'setup') {
    await evaluate(`(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Add Product');
      btn.click();
    })()`, sessionId);
    await sleep(2500);
    await evaluate(`(() => {
      const dlg = document.querySelector('[role="dialog"]');
      const set = (id, v) => {
        const el = dlg.querySelector('#' + id);
        const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
        setter.call(el, v);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      };
      set('product-name', '${PRODUCT}');
      set('product-slug', 'p0-verification-temp-draft');
      set('product-weight', '1');
    })()`, sessionId);
    await sleep(500);
    const up = await evaluate(`(async () => {
      const res = await fetch('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAHElEQVQoz2P4z8DAwMDAwMDwn4GBgYGBgYGBAQAkBgMBOOSShwAAAABJRU5ErkJggg==');
      const blob = await res.blob();
      const file = new File([blob], 'p0-verification.png', { type: 'image/png' });
      const dlg = document.querySelector('[role="dialog"]');
      const input = dlg.querySelector('input[type="file"]');
      if (!input) return JSON.stringify({ error: 'no file input' });
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
      for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 1000));
        const rm = dlg.querySelectorAll('button[aria-label^="Remove image"]');
        if (rm.length > 0) return JSON.stringify({ uploaded: true, removeBtns: rm.length,
          imgs: Array.from(dlg.querySelectorAll('img')).map(i=>i.src).filter(s=>s.includes('firebasestorage')) });
      }
      return JSON.stringify({ uploaded: false, text: dlg.innerText.slice(0, 400) });
    })()`, sessionId);
    console.log('UPLOAD RESULT:', up);
    const u = JSON.parse(up);
    if (!u.uploaded) throw new Error('Upload failed: ' + up);
    const downloadUrl = u.imgs[0];

    // Save as Draft
    const saveResult = await evaluate(`(async () => {
      const dlg = document.querySelector('[role="dialog"]');
      const btn = Array.from(dlg.querySelectorAll('button')).find(b => b.innerText.trim() === 'Save as Draft');
      btn.click();
      for (let i = 0; i < 25; i++) {
        await new Promise(r => setTimeout(r, 1000));
        if (!document.querySelector('[role="dialog"]')) return JSON.stringify({ closed: true });
      }
      return JSON.stringify({ closed: false, text: (document.querySelector('[role="dialog"]')||{innerText:''}).innerText.slice(0,400) });
    })()`, sessionId);
    console.log('SAVE RESULT:', saveResult);
    if (!JSON.parse(saveResult).closed) throw new Error('Modal did not close after save');
    await sleep(4000);

    const rowInfo2 = await evaluate(`(() => {
      const rows = Array.from(document.querySelectorAll('article, table tbody tr, [data-testid="admin-products-section"] .divide-y > div'));
      const row = rows.find(r => r.innerText && r.innerText.includes('${PRODUCT}'));
      return row ? JSON.stringify({ text: row.innerText.slice(0, 200), imgSrc: (row.querySelector('img')||{}).src || null }) : null;
    })()`, sessionId);
    console.log('CREATED ROW:', rowInfo2);
    await sleep(2000);
    const probe = await fetch(downloadUrl);
    console.log('PUBLIC READ PROBE (hardened rules):', probe.status, probe.status === 200 ? '(PUBLIC READ OK)' : '(FAIL)');
    console.log('PUBLIC READ content-type:', probe.headers.get('content-type'));
    console.log('PHASE DONE: setup');
    await finish(chrome);
    return;
  }

  if (PHASE === 'cleanup') {
    await evaluate(`(() => {
      const rows = Array.from(document.querySelectorAll('article, table tbody tr, [data-testid="admin-products-section"] .divide-y > div'));
      const r = rows.find(x => x.innerText && x.innerText.includes('${PRODUCT}'));
      const btn = Array.from(r.querySelectorAll('button')).find(b => (b.getAttribute('aria-label')||'') === 'Archive ${PRODUCT}');
      btn.click();
    })()`, sessionId);
    await sleep(1500);
    const arch = await evaluate(`(async () => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.trim() === 'Archive Product');
      if (!btn) return JSON.stringify({ ok: false, text: document.body.innerText.slice(0,300) });
      btn.click();
      await new Promise(r => setTimeout(r, 4000));
      return JSON.stringify({ ok: true });
    })()`, sessionId);
    console.log('ARCHIVE RESULT:', arch);
    await sleep(3000);
    const del = await evaluate(`(async () => {
      const rows = Array.from(document.querySelectorAll('article, table tbody tr, [data-testid="admin-products-section"] .divide-y > div'));
      const r = rows.find(x => x.innerText && x.innerText.includes('${PRODUCT}'));
      if (!r) return JSON.stringify({ ok: false, note: 'row not found after archive' });
      const btn = Array.from(r.querySelectorAll('button')).find(b => (b.getAttribute('aria-label')||'') === 'Delete ${PRODUCT} permanently');
      if (!btn) return JSON.stringify({ ok: false, note: 'no permanent delete button', text: r.innerText.slice(0,200) });
      btn.click();
      await new Promise(r2 => setTimeout(r2, 1500));
      const dlg = Array.from(document.querySelectorAll('[role="dialog"]')).pop();
      const input = dlg.querySelector('input');
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(input, 'DELETE');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await new Promise(r2 => setTimeout(r2, 500));
      const confirmBtn = Array.from(dlg.querySelectorAll('button')).find(b => /delete/i.test(b.innerText) && !b.disabled);
      confirmBtn.click();
      for (let i = 0; i < 25; i++) {
        await new Promise(r2 => setTimeout(r2, 1000));
        if (!document.querySelector('[role="dialog"]')) break;
      }
      await new Promise(r2 => setTimeout(r2, 4000));
      return JSON.stringify({ ok: true });
    })()`, sessionId);
    console.log('DELETE RESULT:', del);
    await sleep(4000);
    const gone = await evaluate(`(() => {
      const rows = Array.from(document.querySelectorAll('article, table tbody tr, [data-testid="admin-products-section"] .divide-y > div'));
      const r = rows.find(x => x.innerText && x.innerText.includes('${PRODUCT}'));
      const totals = document.body.innerText.match(/TOTAL PRODUCTS[\\s\\S]{0,20}/);
      return JSON.stringify({ stillListed: !!r, totals: totals ? totals[0] : null });
    })()`, sessionId);
    console.log('POST-CLEANUP STATE:', gone);
    console.log('PHASE DONE: cleanup');
    await finish(chrome);
    return;
  }

  if (PHASE === 'status') {
    const status = await evaluate(`(() => {
      const rows = Array.from(document.querySelectorAll('article, table tbody tr, [data-testid="admin-products-section"] .divide-y > div'));
      const temporary = rows.find((row) => row.innerText && row.innerText.includes('${PRODUCT}'));
      return JSON.stringify({ temporaryDraftListed: !!temporary, visibleProductRows: rows.length });
    })()`, sessionId);
    console.log('CLEANUP STATUS:', status);
    await finish(chrome);
    return;
  }

  // 2. Locate the temporary draft row
  let rowInfo = await evaluate(`(() => {
    const rows = Array.from(document.querySelectorAll('article, table tbody tr, [data-testid="admin-products-section"] .divide-y > div'));
    const row = rows.find(r => r.innerText && r.innerText.includes('P0 Verification Temporary Draft'));
    if (!row) return null;
    const img = row.querySelector('img');
    const editBtn = Array.from(row.querySelectorAll('button')).find(b => (b.getAttribute('aria-label')||'').includes('Edit'));
    return JSON.stringify({ text: row.innerText.slice(0, 300), imgSrc: img ? img.src : null, hasEdit: !!editBtn });
  })()`, sessionId);
  if (!rowInfo) {
    for (let i = 0; i < 15 && !rowInfo; i++) {
      await sleep(2000);
      rowInfo = await evaluate(`(() => {
        const rows = Array.from(document.querySelectorAll('article, table tbody tr, [data-testid="admin-products-section"] .divide-y > div'));
        const row = rows.find(r => r.innerText && r.innerText.includes('P0 Verification Temporary Draft'));
        if (!row) return null;
        const img = row.querySelector('img');
        const editBtn = Array.from(row.querySelectorAll('button')).find(b => (b.getAttribute('aria-label')||'').includes('Edit'));
        return JSON.stringify({ text: row.innerText.slice(0, 300), imgSrc: img ? img.src : null, hasEdit: !!editBtn });
      })()`, sessionId);
    }
  }
  if (!rowInfo) throw new Error('Temporary draft row NOT FOUND in admin product list. Body: ' + (await evaluate('document.body.innerText.slice(0,600)', sessionId)));
  console.log('DRAFT ROW:', rowInfo);

  // 3. Open edit modal
  await evaluate(`(() => {
    const rows = Array.from(document.querySelectorAll('article, table tbody tr, [data-testid="admin-products-section"] .divide-y > div'));
    const r = rows.find(x => x.innerText && x.innerText.includes('P0 Verification Temporary Draft'));
    const btn = Array.from(r.querySelectorAll('button')).find(b => (b.getAttribute('aria-label')||'').includes('Edit'));
    btn.click();
  })()`, sessionId);
  await sleep(2500);
  const modal = await evaluate(`(() => {
    const m = document.querySelector('[role="dialog"]');
    if (!m) return null;
    return JSON.stringify({ title: (m.innerText||'').slice(0,150),
      removeBtns: Array.from(m.querySelectorAll('button[aria-label^="Remove image"]')).map(b=>b.getAttribute('aria-label')),
      imgs: Array.from(m.querySelectorAll('img')).map(i=>i.src).filter(s=>s.includes('firebasestorage')) });
  })()`, sessionId);
  if (!modal) throw new Error('Edit modal did not open');
  console.log('EDIT MODAL:', modal);
  const m = JSON.parse(modal);
  if (!m.imgs.length) throw new Error('No firebasestorage image found in edit modal');
  const downloadUrl = m.imgs[0];

  // 4. Click Remove image via the normal admin UI (triggers deleteObject)
  const rmResult = await evaluate(`(async () => {
    const dlg = document.querySelector('[role="dialog"]');
    const btn = dlg.querySelector('button[aria-label^="Remove image"]');
    btn.click();
    await new Promise(r => setTimeout(r, 4000));
    const after = document.querySelector('[role="dialog"]');
    return JSON.stringify({
      remainingRemoveBtns: Array.from(after.querySelectorAll('button[aria-label^="Remove image"]')).length,
      remainingImgs: Array.from(after.querySelectorAll('img')).map(i=>i.src).filter(s=>s.includes('firebasestorage')).length,
      errorText: Array.from(after.querySelectorAll('*')).filter(e=>e.children.length===0 && /failed|error|denied/i.test(e.textContent||'')).map(e=>e.textContent.trim()).slice(0,3)
    });
  })()`, sessionId);
  console.log('AFTER REMOVE-IMAGE CLICK:', rmResult);
  const rm = JSON.parse(rmResult);
  if (rm.remainingRemoveBtns !== 0 || rm.remainingImgs !== 0) throw new Error('Image still present after remove: ' + rmResult);
  console.log('PERMISSION_DENIED in UI after remove:', /denied/i.test(rm.errorText.join(' ')));

  // 5. Persist the Firestore image-array change with "Save as Draft"
  const saveResult = await evaluate(`(async () => {
    const dlg = document.querySelector('[role="dialog"]');
    const btn = Array.from(dlg.querySelectorAll('button')).find(b => b.innerText.trim() === 'Save as Draft');
    btn.click();
    for (let i = 0; i < 20; i++) {
      await new Promise(r => setTimeout(r, 1000));
      if (!document.querySelector('[role="dialog"]')) return JSON.stringify({ closed: true });
    }
    return JSON.stringify({ closed: false, text: (document.querySelector('[role="dialog"]')||{innerText:''}).innerText.slice(0,300) });
  })()`, sessionId);
  console.log('SAVE RESULT:', saveResult);
  if (!JSON.parse(saveResult).closed) throw new Error('Modal did not close after save');

  // 6. Independent verification: Storage object must be gone
  await sleep(3000);
  const probe = await fetch(downloadUrl, { method: 'GET' });
  console.log('STORAGE PROBE status after delete:', probe.status, probe.status === 404 ? '(OBJECT GONE)' : '(OBJECT STILL EXISTS)');

  // 7. Confirm product row reflects updated Firestore (no image)
  await sleep(2500);
  const rowAfter = await evaluate(`(() => {
    const rows = Array.from(document.querySelectorAll('article, table tbody tr, [data-testid="admin-products-section"] .divide-y > div'));
    const r = rows.find(x => x.innerText && x.innerText.includes('P0 Verification Temporary Draft'));
    return JSON.stringify({ exists: !!r, imgs: r ? r.querySelectorAll('img').length : -1, text: r ? r.innerText.slice(0,200) : null });
  })()`, sessionId);
  console.log('ROW AFTER SAVE:', rowAfter);

  console.log('PHASE DONE: admin-delete');
  await finish(chrome);
}

main().catch((e) => { console.error('FAIL:', e.message); process.exit(1); });
