const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1500, height: 1000 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await p.goto('http://127.0.0.1:8765/scenes/show.html'); await p.waitForFunction(() => window.READY, null, { timeout: 60000 });
  const jobs = JSON.parse(process.argv[3]);
  for (const j of jobs) { await p.evaluate(j => window.renderShow(j.finish, j.ids, j.opts || {}), j); await p.screenshot({ path: `${process.argv[2]}/${j.out}` }); console.log('ok', j.out); }
  await b.close();
})();
