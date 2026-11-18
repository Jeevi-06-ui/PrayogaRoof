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

async function testAll() {
  const pages = await getPages();
  const page = pages[0];
  console.log('Connecting to emulator webview...');
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
    await send('Runtime.enable');
    await send('Log.enable');

    const exceptions = [];
    ws.on('message', (msg) => {
      const data = JSON.parse(msg);
      if (data.method === 'Runtime.exceptionThrown') {
        const text = data.params.exceptionDetails?.exception?.description || data.params.exceptionDetails?.text;
        console.error('CRASH/EXCEPTION CAUGHT:', text);
        exceptions.push(text);
      }
    });

    // Get list of experiments from window.EXPERIMENTS if available or fetch
    const expsRes = await send('Runtime.evaluate', {
      expression: `
        // Switch tabs and test
        window.location.href = '/dashboard';
      `
    });

    await new Promise(r => setTimeout(r, 1000));

    // Get all experiment links on the dashboard
    const linksRes = await send('Runtime.evaluate', {
      expression: `Array.from(document.querySelectorAll('a[href^="/experiments/"]')).map(a => a.getAttribute('href'))`,
      returnByValue: true
    });
    console.log('Found experiment links:', linksRes?.result?.value);

    // Let's test navigating to several experiments across Physics, Chemistry, Biology, Math
    const testList = [
      '/experiments/ohms-law',
      '/experiments/convex-lens',
      '/experiments/simple-pendulum',
      '/experiments/magnetic-field',
      '/experiments/vernier-callipers',
      '/experiments/spherometer',
      '/experiments/concave-mirror-focal-length',
      '/experiments/pn-junction-diode',
      '/experiments/ph-testing',
      '/experiments/paper-chromatography',
      '/experiments/chemical-equilibrium',
      '/experiments/acid-base-titration',
      '/experiments/bio-osmosis',
      '/experiments/bio-stomata',
      '/experiments/bio-mitosis',
      '/experiments/bio-heart-circulation',
      '/experiments/bio-nephron',
      '/subjects/mathematics'
    ];

    for (const url of testList) {
      console.log(`\nNavigating to ${url}...`);
      await send('Runtime.evaluate', {
        expression: `window.location.href = '${url}';`
      });
      await new Promise(r => setTimeout(r, 1200));

      // Test switching through tabs
      const tabs = ['lab', 'simulation', 'observations', 'viva'];
      for (const t of tabs) {
        await send('Runtime.evaluate', {
          expression: `
            const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.toLowerCase().includes('${t}'));
            if (btn) btn.click();
          `
        });
        await new Promise(r => setTimeout(r, 400));
      }

      const check = await send('Runtime.evaluate', {
        expression: `({ title: document.title, errorPresent: !!document.querySelector('.text-red-500, [role="alert"]') })`,
        returnByValue: true
      });
      console.log(`Result for ${url}:`, check?.result?.value);
    }

    console.log('\n--- Test Completed ---');
    console.log('Total caught runtime exceptions:', exceptions.length);
    ws.close();
    process.exit(0);
  });
}

testAll().catch(console.error);
