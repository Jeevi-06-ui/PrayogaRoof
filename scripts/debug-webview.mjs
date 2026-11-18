import http from 'http';
import WebSocket from 'ws';

async function getPages() {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

async function run() {
  const pages = await getPages();
  const page = pages[0];
  if (!page) {
    console.error('No WebView page found');
    process.exit(1);
  }

  console.log(`Connecting to page: ${page.title} (${page.url})`);
  const ws = new WebSocket(page.webSocketDebuggerUrl);

  let idCounter = 1;
  const send = (method, params = {}) => {
    return new Promise((resolve) => {
      const id = idCounter++;
      const handler = (msg) => {
        const res = JSON.parse(msg);
        if (res.id === id) {
          ws.off('message', handler);
          resolve(res.result);
        }
      };
      ws.on('message', handler);
      ws.send(JSON.stringify({ id, method, params }));
    });
  };

  ws.on('open', async () => {
    console.log('Connected to Chrome DevTools Protocol!');
    await send('Runtime.enable');
    await send('Log.enable');
    await send('Page.enable');

    ws.on('message', (msg) => {
      const data = JSON.parse(msg);
      if (data.method === 'Runtime.consoleAPICalled') {
        const args = data.params.args.map(a => a.value || a.description || JSON.stringify(a)).join(' ');
        console.log(`[WebView Console ${data.params.type}]`, args);
      } else if (data.method === 'Runtime.exceptionThrown') {
        console.error('[WebView Exception!]', JSON.stringify(data.params.exceptionDetails, null, 2));
      }
    });

    const expIds = [
      'ohms-law',
      'convex-lens',
      'simple-pendulum',
      'vernier-callipers',
      'pn-junction-diode',
      'ph-testing',
      'chemical-equilibrium',
      'bio-osmosis',
      'bio-heart-circulation',
      'bio-mitosis',
    ];

    for (const expId of expIds) {
      console.log(`\nTesting navigation to: https://localhost/experiments/${expId}`);
      const evalRes = await send('Runtime.evaluate', {
        expression: `window.location.hash = ''; window.history.pushState({}, '', '/experiments/${expId}'); window.dispatchEvent(new PopStateEvent('popstate')); document.title;`,
        returnByValue: true
      });
      console.log('PushState result:', evalRes);

      // Wait 1.5 seconds to observe any errors or crashes
      await new Promise(r => setTimeout(r, 1500));

      const status = await send('Runtime.evaluate', {
        expression: `({ url: window.location.href, title: document.title, bodyLength: document.body.innerHTML.length, hasError: !!document.querySelector('.text-red-500, [role="alert"]') })`,
        returnByValue: true
      });
      console.log(`Status for ${expId}:`, status?.value);
    }

    console.log('\nTesting navigation to Mathematics Page...');
    await send('Runtime.evaluate', {
      expression: `window.history.pushState({}, '', '/subjects/mathematics'); window.dispatchEvent(new PopStateEvent('popstate'));`,
      returnByValue: true
    });
    await new Promise(r => setTimeout(r, 2000));
    const mathStatus = await send('Runtime.evaluate', {
      expression: `({ url: window.location.href, title: document.title, bodyLength: document.body.innerHTML.length })`,
      returnByValue: true
    });
    console.log('Status for Mathematics:', mathStatus?.value);

    ws.close();
    process.exit(0);
  });
}

run().catch(console.error);
