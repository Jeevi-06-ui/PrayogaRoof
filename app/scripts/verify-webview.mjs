// verify-webview.mjs
const listRes = await fetch('http://localhost:9223/json/list');
const targets = await listRes.json();
const wsUrl = targets[0]?.webSocketDebuggerUrl;

if (!wsUrl) {
  console.error('No target found');
  process.exit(1);
}

const ws = new WebSocket(wsUrl);
let id = 1;
const pending = new Map();

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) {
    const resolve = pending.get(msg.id);
    pending.delete(msg.id);
    resolve(msg);
  }
};

await new Promise((res) => ws.onopen = res);

function send(method, params = {}) {
  const reqId = id++;
  return new Promise((resolve) => {
    pending.set(reqId, resolve);
    ws.send(JSON.stringify({ id: reqId, method, params }));
  });
}

// 1. Check window.AndroidTTS
const ttsRes = await send('Runtime.evaluate', {
  expression: `({
    hasAndroidTTS: !!window.AndroidTTS,
    speak: typeof window.AndroidTTS?.speak,
    pause: typeof window.AndroidTTS?.pause,
    resume: typeof window.AndroidTTS?.resume,
    stop: typeof window.AndroidTTS?.stop,
    testVoice: typeof window.AndroidTTS?.testVoice,
    location: window.location.href,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  })`,
  returnByValue: true
});

console.log('--- WebView Native Bridge & Dimensions ---');
console.log(JSON.stringify(ttsRes.result?.result?.value, null, 2));

// 2. Navigate to /experiment/ohms-law
await send('Runtime.evaluate', {
  expression: `window.location.hash = '#/experiment/ohms-law';`
});

// Wait 1.5s
await new Promise((r) => setTimeout(r, 1500));

const expRes = await send('Runtime.evaluate', {
  expression: `({
    hash: window.location.hash,
    title: document.title,
    bodyWidth: document.body.clientWidth,
    bodyScrollWidth: document.body.scrollWidth,
    hasHorizontalScroll: document.body.scrollWidth > window.innerWidth,
    bottomNavVisible: !!document.querySelector('nav'),
    labWorkspace: !!document.querySelector('main')
  })`,
  returnByValue: true
});

console.log('--- Navigation to Ohm\'s Law ---');
console.log(JSON.stringify(expRes.result?.result?.value, null, 2));

// 3. Navigate to fullscreen workspace: /workspace/ohms-law
await send('Runtime.evaluate', {
  expression: `window.location.hash = '#/workspace/ohms-law';`
});
await new Promise((r) => setTimeout(r, 1500));

const wsRes = await send('Runtime.evaluate', {
  expression: `({
    hash: window.location.hash,
    mainWidth: document.querySelector('main')?.clientWidth,
    mainHeight: document.querySelector('main')?.clientHeight,
    viewportWidth: window.innerWidth,
    toolbarVisible: !!document.querySelector('header'),
    mobileBottomBarVisible: !!document.querySelector('button[aria-label="Toggle Equipment Drawer"], button:has(.lucide-wrench)'),
    canvasWidthRatio: document.querySelector('main')?.clientWidth / window.innerWidth
  })`,
  returnByValue: true
});

console.log('--- Fullscreen Lab Workspace on Mobile ---');
console.log(JSON.stringify(wsRes.result?.result?.value, null, 2));

ws.close();
process.exit(0);
