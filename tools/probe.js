const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('http://127.0.0.1:8765/scenes/' + process.argv[2]); await p.waitForFunction(() => window.READY === true);
  console.log(await p.evaluate(process.argv[3])); await b.close(); })();
