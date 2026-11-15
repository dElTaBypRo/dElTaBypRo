const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await p.goto('http://127.0.0.1:8765/scenes/city.html'); await p.waitForFunction(() => window.READY, null, { timeout: 90000 });
  for (const n of process.argv[3].split(',')) { await p.evaluate(n => window.renderCity(n, 2), n); await p.screenshot({ path: `${process.argv[2]}/city_${n}.jpg`, type: 'jpeg', quality: 90 }); console.log('ok', n); }
  await b.close();
})();
