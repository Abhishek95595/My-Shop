const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const net = require('net');

const ARTIFACTS_DIR = path.join(__dirname, '..', 'artifacts', 'mobile-verification');
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

function findChrome() {
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, '127.0.0.1', () => {
      const port = srv.address().port;
      srv.close(() => resolve(port));
    });
    srv.on('error', reject);
  });
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const chromePath = findChrome();
  if (!chromePath) {
    console.error('Chrome not found');
    process.exit(1);
  }
  const port = await getFreePort();
  const tmpDir = path.join('/tmp', `qa_chrome_${Date.now()}`);
  fs.mkdirSync(tmpDir, { recursive: true });

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${tmpDir}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--window-size=1440,900',
    'about:blank',
  ]);

  await sleep(1500);

  const targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  const pageTarget = targets.find((t) => t.type === 'page');
  const wsUrl = pageTarget.webSocketDebuggerUrl;

  const WebSocket = global.WebSocket || require('ws');
  const ws = new WebSocket(wsUrl);

  await new Promise((resolve) => {
    ws.onopen = resolve;
  });

  let id = 1;
  const pending = new Map();
  ws.onmessage = (evt) => {
    const msg = JSON.parse(evt.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const reqId = id++;
      pending.set(reqId, { resolve, reject });
      ws.send(JSON.stringify({ id: reqId, method, params }));
    });
  };

  await send('Page.enable');
  await send('DOM.enable');
  await send('CSS.enable');
  await send('Runtime.enable');

  const QA_VIEWPORTS = [
    { name: 'desktop_1440', width: 1440, height: 900, isMobile: false },
    { name: 'tablet_768', width: 768, height: 1024, isMobile: true },
    { name: 'mobile_375', width: 375, height: 812, isMobile: true },
  ];

  const results = {};

  for (const vp of QA_VIEWPORTS) {
    console.log(`\nInspecting ${vp.name} (${vp.width}x${vp.height})...`);
    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: 2,
      mobile: vp.isMobile,
    });

    await send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(2500);

    // Evaluate in page
    const evalRes = await send('Runtime.evaluate', {
      expression: `(${() => {
        const sections = Array.from(document.querySelectorAll('main > div > section, main > div > div')).map((s, i) => {
          const rect = s.getBoundingClientRect();
          return {
            index: i,
            id: s.id || s.className.slice(0, 30),
            tag: s.tagName,
            top: Math.round(rect.top + window.scrollY),
            height: Math.round(rect.height),
            width: Math.round(rect.width),
          };
        });

        const cards = Array.from(document.querySelectorAll('.group.bg-cream-50')).map((c) => {
          const rect = c.getBoundingClientRect();
          const img = c.querySelector('img');
          const title = c.querySelector('h3')?.innerText || '';
          return {
            title,
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            hasImage: !!img,
            imgSrc: img ? img.src.slice(0, 60) : null,
          };
        });

        const buttons = Array.from(document.querySelectorAll('button, a[href]')).map((b) => {
          const rect = b.getBoundingClientRect();
          const text = b.innerText?.trim() || b.getAttribute('aria-label') || '';
          return {
            text: text.slice(0, 40),
            width: Math.round(rect.width),
            height: Math.round(rect.height),
            visible: rect.width > 0 && rect.height > 0 && window.getComputedStyle(b).display !== 'none',
          };
        });

        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasHorizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
          sectionsCount: sections.length,
          sections,
          cardsCount: cards.length,
          cards: cards.slice(0, 8),
          smallTouchTargets: buttons.filter((b) => b.visible && (b.width < 44 || b.height < 44) && !b.text.includes('Full Rates')),
        };
      }})()`,
      returnByValue: true,
    });

    results[vp.name] = evalRes.result.value;

    // Full page screenshot
    const layoutMetrics = await send('Page.getLayoutMetrics');
    const contentSize = layoutMetrics.cssContentSize || layoutMetrics.contentSize;
    const fullHeight = Math.ceil(contentSize.height);

    await send('Emulation.setDeviceMetricsOverride', {
      width: vp.width,
      height: fullHeight,
      deviceScaleFactor: 2,
      mobile: vp.isMobile,
    });
    await sleep(500);

    const shot = await send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
    });

    const shotFile = path.join(ARTIFACTS_DIR, `qa_${vp.name}_full.png`);
    fs.writeFileSync(shotFile, Buffer.from(shot.data, 'base64'));
    console.log(`Saved screenshot: ${shotFile} (height: ${fullHeight}px)`);
  }

  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'qa_metrics_report.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('\nQA Metrics report written to qa_metrics_report.json');

  chromeProc.kill();
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
