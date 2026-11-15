const { chromium } = require('playwright');
const fs = require('fs');
const [,, outDir, mode, workers = '4'] = process.argv;
const FPS = 30, DUR = +(process.env.DUR || 46.2); const LANGQ = process.env.LANGQ || '';
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  let frames;
  if (mode === 'test' && process.env.TIMES) frames = process.env.TIMES.split(',').map(Number).map(t => ({ t, f: 't' + t.toFixed(1).padStart(5, '0') + '.jpg' }));
  else if (mode === 'test') frames = [0.5, 2.5, 4.2, 6, 9.5, 12.6, 15, 17.2, 19.9, 22.5, 25.5, 27.8, 30, 31.7, 33.5, 35.8, 38.5, 39.6, 41.5, 44, 45.3].map(t => ({ t, f: `t${t.toFixed(1)}.jpg` }));
  else { frames = []; const N = Math.round(DUR * FPS); for (let i = 0; i < N; i++) frames.push({ t: i / FPS, f: `f${String(i).padStart(5, '0')}.jpg` }); }
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const nw = +workers; let done = 0; const t0 = Date.now();
  await Promise.all([...Array(nw).keys()].map(async w => {
    const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
    p.on('pageerror', e => console.error('PAGEERR', e.message));
    p.on('console', m => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
    await p.goto('http://127.0.0.1:8765/scenes/' + (process.env.PAGE || 'scene.html') + LANGQ);
    await p.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
    for (let i = w; i < frames.length; i += nw) {
      await p.evaluate(t => window.renderAt(t), frames[i].t);
      await p.screenshot({ path: `${outDir}/${frames[i].f}`, type: 'jpeg', quality: 92 });
      if (++done % 100 === 0) console.log(done, 'frames', ((Date.now() - t0) / 1000).toFixed(0) + 's');
    }
  }));
  await b.close(); console.log('done', frames.length, ((Date.now() - t0) / 1000).toFixed(0) + 's');
})();
