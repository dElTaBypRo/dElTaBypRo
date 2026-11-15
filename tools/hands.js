const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await b.newPage({ viewport: { width: 1500, height: 1000 } });
  p.on('pageerror', e => console.error('PAGEERR', e.message));
  await p.goto('http://127.0.0.1:8765/scenes/show.html'); await p.waitForFunction(() => window.READY);
  for (const g of ['open', 'relaxed', 'fist', 'point', 'thumbsUp', 'peace', 'grab', 'money']) { await p.evaluate(g => window.renderHand(g), g); await p.screenshot({ path: `${process.argv[2]}/hand_${g}.png`, clip: { x: 450, y: 200, width: 600, height: 600 } }); }
  await b.close();
})();
