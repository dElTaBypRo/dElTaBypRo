// slimsets.js — sets for the Slim / Telmex video, same rounded clay style as charkit/propkit/amazonsets.
// const sets = createSlimSets(THREE, kit, props);
// const room = sets.livingRoom(); scene.add(room); // handles on room.userData
// Builders: livingRoom(), auction1990(), chartOffice(), moneyMountain(), regulatorOffice().
// Each returns a THREE.Group that carries its own lights (one shadow caster per set). Character front = +z;
// a seated character's root goes at y = kit.sitY(c, seatY). Spots are { x, z, ry } (plus y when the floor is raised).
export function createSlimSets(THREE, kit, props) {
  const M = (c, k = 'cloth') => kit.makeMat(c, k, 'clay');
  const EM = (c, k = 1.5) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k, roughness: 0.6 });
  const BASIC = (o) => new THREE.MeshBasicMaterial({ toneMapped: false, ...o });
  const rb = kit.rbox;
  const add = (p, g, m, x = 0, y = 0, z = 0, shadow = true) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; p.add(o); return o; };
  const ctex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  let sd = 23; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const FONT = 'Inter, "DejaVu Sans", Arial, sans-serif';
  // three r160 has no scene.environmentIntensity: dim the environment per material instead (works on sets and characters)
  function setEnvIntensity(obj, k) { obj.traverse(o => { if (!o.material) return; for (const m of [].concat(o.material)) if ('envMapIntensity' in m) m.envMapIntensity = k; }); }
  // flat plane with a live canvas: g.userData.draw(fn(ctx, w, h)) redraws it (same API as props.monitor)
  function livePlane(w, h, res = 512, o = {}) {
    const c = document.createElement('canvas'); c.width = res; c.height = Math.round(res * h / w); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), o.basic ? BASIC({ map: tex }) : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 })); m.receiveShadow = true;
    const g = new THREE.Group(); g.add(m); g.userData = { canvas: c, ctx: c.getContext('2d'), tex, plane: m, draw(fn) { fn(this.ctx, c.width, c.height); tex.needsUpdate = true; } };
    if (o.fill) g.userData.draw((x, cw, ch) => { x.fillStyle = o.fill; x.fillRect(0, 0, cw, ch); });
    return g;
  }
  function framedPicture(w, h, draw, frame = '#6b4a2b') { const g = new THREE.Group(); add(g, rb(w + 0.08, h + 0.08, 0.04, 0.012), M(frame, 'leather'), 0, 0, 0);
    add(g, new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: ctex(256, Math.round(256 * h / w), draw), roughness: 0.6 }), 0, 0, 0.022, false); return g; }
  const portrait = (bg, skin, shirt) => (c, w, h) => { c.fillStyle = bg; c.fillRect(0, 0, w, h); c.fillStyle = shirt; c.beginPath(); c.ellipse(w / 2, h * 1.02, w * 0.42, h * 0.36, 0, 0, 7); c.fill();
    c.fillStyle = skin; c.beginPath(); c.roundRect(w * 0.3, h * 0.22, w * 0.4, h * 0.42, w * 0.08); c.fill(); c.fillStyle = '#2a1d14'; c.fillRect(w * 0.3, h * 0.2, w * 0.4, h * 0.08);
    c.fillStyle = 'rgba(80,50,20,0.25)'; c.fillRect(0, 0, w, h); };
  // wooden folding chair (1990 hall) and office chair; front = +z, seat top ~0.45
  function woodChair(color = '#7a5034') {
    const g = new THREE.Group(); const m = M(color, 'leather'), dark = M('#3a2618', 'leather');
    add(g, rb(0.5, 0.06, 0.46, 0.02), m, 0, 0.42, 0);
    for (const x of [-0.21, 0.21]) for (const z of [-0.19, 0.19]) add(g, new THREE.CylinderGeometry(0.022, 0.022, 0.42, 8), dark, x, 0.21, z);
    for (const x of [-0.21, 0.21]) add(g, new THREE.CylinderGeometry(0.022, 0.022, 0.5, 8), dark, x, 0.68, -0.21);
    add(g, rb(0.48, 0.16, 0.04, 0.015), m, 0, 0.84, -0.21); return g;
  }
  function officeChair(color = '#1c1c20') {
    const g = new THREE.Group(); const m = M(color, 'leather'), metal = M('#8a8f96', 'dark');
    add(g, rb(0.52, 0.08, 0.5, 0.035), m, 0, 0.41, 0); const back = add(g, rb(0.5, 0.7, 0.08, 0.035), m, 0, 0.84, -0.24); back.rotation.x = -0.08;
    add(g, new THREE.CylinderGeometry(0.035, 0.035, 0.3, 10), metal, 0, 0.23, 0);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const leg = add(g, rb(0.3, 0.04, 0.05, 0.015), metal, Math.sin(a) * 0.15, 0.06, Math.cos(a) * 0.15); leg.rotation.y = a + Math.PI / 2; }
    return g;
  }
  function plant(p, x, z, s = 1, pot = '#c8643a') { add(p, new THREE.CylinderGeometry(0.2 * s, 0.15 * s, 0.4 * s, 16), M(pot), x, 0.2 * s, z); for (let i = 0; i < 9; i++) { const lf = add(p, new THREE.SphereGeometry(0.18 * s, 12, 8), M(i % 2 ? '#4f9a45' : '#3f8a3e'), x + Math.sin(i * 2.3) * 0.17 * s, (0.55 + (i % 4) * 0.16) * s, z + Math.cos(i * 2.3) * 0.15 * s); lf.scale.set(0.65, 1.4, 0.65); } }
  function wallClock(p, x, y, z, ry = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; p.add(g); add(g, new THREE.CylinderGeometry(0.22, 0.22, 0.04, 32), M('#f4efe6', 'white'), 0, 0, 0, false).rotation.x = Math.PI / 2;
    add(g, new THREE.TorusGeometry(0.22, 0.02, 8, 32), M('#3a2618', 'leather'), 0, 0, 0.01, false); const h1 = add(g, new THREE.BoxGeometry(0.015, 0.12, 0.01), M('#111', 'dark'), 0, 0.05, 0.03, false); h1.geometry.translate(0, 0, 0);
    const h2 = add(g, new THREE.BoxGeometry(0.012, 0.17, 0.01), M('#111', 'dark'), 0.05, 0.03, 0.03, false); h2.rotation.z = -1.2; return g; }

  // ======================= 1. LIVING ROOM (grandpa, today) =======================
  // camera: [0.3, 1.55, 3.6] -> [0, 1.0, -1.2], fov 48 (two-shot on the sofa); over the table: [1.6, 1.4, 1.2] -> [-0.3, 1.0, -1.3]
  function livingRoom() {
    const G = new THREE.Group(); G.name = 'livingRoom'; const CH = 2.8;
    const tileTex = ctex(512, 512, (c, w, h) => { const n = 8, s = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const k = rnd() * 0.08; c.fillStyle = `rgb(${178 + k * 300 | 0},${96 + k * 200 | 0},${62 + k * 120 | 0})`; c.fillRect(i * s, j * s, s, s); } c.strokeStyle = '#d8c4a8'; c.lineWidth = 4; for (let i = 0; i <= n; i++) { c.beginPath(); c.moveTo(i * s, 0); c.lineTo(i * s, h); c.stroke(); c.beginPath(); c.moveTo(0, i * s); c.lineTo(w, i * s); c.stroke(); } });
    tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping; tileTex.repeat.set(2.5, 2.5);
    const floor = add(G, new THREE.PlaneGeometry(5.2, 5.2), new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.7 }), 0, 0, 0, false); floor.rotation.x = -Math.PI / 2;
    const wallM = M('#ecc98a'), lowM = M('#c9793f'), trimM = M('#f4efe6', 'white');
    // back wall (z=-2.6) with a painted lower band, right wall (x=+2.6)
    add(G, new THREE.BoxGeometry(5.2, CH, 0.12), wallM, 0, CH / 2, -2.66); add(G, new THREE.BoxGeometry(5.2, 0.9, 0.02), lowM, 0, 0.45, -2.59, false); add(G, rb(5.2, 0.05, 0.04, 0.01), trimM, 0, 0.92, -2.58, false);
    add(G, new THREE.BoxGeometry(0.12, CH, 5.2), wallM, 2.66, CH / 2, 0); add(G, new THREE.BoxGeometry(0.02, 0.9, 5.2), lowM, 2.59, 0.45, 0, false); add(G, rb(0.04, 0.05, 5.2, 0.01), trimM, 2.58, 0.92, 0, false);
    // left wall (x=-2.6) with a window hole at z -0.8..0.6, y 1.0..2.2 and afternoon sky behind it
    const wz0 = -0.8, wz1 = 0.6, wy0 = 1.0, wy1 = 2.2, wx = -2.66;
    add(G, new THREE.BoxGeometry(0.12, CH, 2.6 + wz0), wallM, wx, CH / 2, (-2.6 + wz0) / 2); add(G, new THREE.BoxGeometry(0.12, CH, 2.6 - wz1), wallM, wx, CH / 2, (wz1 + 2.6) / 2);
    add(G, new THREE.BoxGeometry(0.12, wy0, wz1 - wz0), wallM, wx, wy0 / 2, (wz0 + wz1) / 2); add(G, new THREE.BoxGeometry(0.12, CH - wy1, wz1 - wz0), wallM, wx, (wy1 + CH) / 2, (wz0 + wz1) / 2);
    add(G, new THREE.BoxGeometry(0.02, 0.9, 2.6 + wz0), lowM, -2.59, 0.45, (-2.6 + wz0) / 2, false); add(G, new THREE.BoxGeometry(0.02, 0.9, 2.6 - wz1), lowM, -2.59, 0.45, (wz1 + 2.6) / 2, false);
    const frameM = M('#5a3a22', 'leather'); add(G, rb(0.16, 0.06, wz1 - wz0 + 0.12, 0.02), frameM, wx + 0.02, wy0, (wz0 + wz1) / 2); add(G, rb(0.16, 0.06, wz1 - wz0 + 0.12, 0.02), frameM, wx + 0.02, wy1, (wz0 + wz1) / 2);
    add(G, rb(0.08, wy1 - wy0, 0.05, 0.01), frameM, wx, (wy0 + wy1) / 2, (wz0 + wz1) / 2);
    const skyTex = ctex(512, 256, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#7fb2e0'); g.addColorStop(0.65, '#f6d6a0'); g.addColorStop(1, '#f2a468'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.fillStyle = '#c98a5a'; for (let i = 0; i < 9; i++) { const bw = 40 + rnd() * 50, bh = 30 + rnd() * 70; c.fillRect(i * 58, h - bh, bw, bh); } c.fillStyle = '#e0b07a'; for (let i = 0; i < 9; i++) c.fillRect(i * 58 + 10, h - 20, 12, 12); });
    const sky = add(G, new THREE.PlaneGeometry(4, 2), BASIC({ map: skyTex }), -3.6, 1.6, -0.1, false); sky.rotation.y = Math.PI / 2;
    // curtains
    const curtM = M('#d9b14a'); for (const z of [wz0 - 0.18, wz1 + 0.18]) { const ct = add(G, rb(0.06, 1.55, 0.36, 0.03), curtM, -2.55, 1.62, z); }
    add(G, new THREE.CylinderGeometry(0.02, 0.02, 2.0, 8), M('#8a6a3a', 'leather'), -2.52, 2.42, (wz0 + wz1) / 2).rotation.x = Math.PI / 2;
    // sarape-striped rug
    const rugTex = ctex(512, 256, (c, w, h) => { const cols = ['#c0392b', '#f2c230', '#1fa39a', '#7d2e8f', '#e67e22', '#2c3e50', '#ffffff']; let x = 0; while (x < w) { const sw = 8 + rnd() * 28; c.fillStyle = cols[(rnd() * cols.length) | 0]; c.fillRect(x, 0, sw, h); x += sw; } });
    const rug = add(G, new THREE.PlaneGeometry(2.6, 1.6), new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.95 }), 0, 0.006, -0.35, false); rug.rotation.x = -Math.PI / 2;
    // sofa (2 seats, seat top 0.45), back against the wall, facing +z
    const sofa = new THREE.Group(); sofa.position.set(0, 0, -1.75); G.add(sofa); const sofaM = M('#8a3b2a'), sofaD = M('#6e2c1f');
    add(sofa, rb(2.36, 0.3, 0.9, 0.08), sofaD, 0, 0.2, 0); for (const x of [-0.53, 0.53]) add(sofa, rb(1.04, 0.14, 0.82, 0.06), sofaM, x, 0.42, 0.04);
    add(sofa, rb(2.36, 0.72, 0.24, 0.1), sofaM, 0, 0.7, -0.36); for (const x of [-1.2, 1.2]) add(sofa, rb(0.2, 0.62, 0.9, 0.08), sofaD, x, 0.37, 0);
    for (const x of [-0.53, 0.53]) add(sofa, rb(0.5, 0.012, 0.3, 0.004), M('#fbf6ec', 'white'), x, 1.06, -0.3, false).rotation.x = -0.3; // crochet doilies
    for (const x of [-0.95, 0.95]) add(sofa, rb(0.32, 0.32, 0.14, 0.07), M(x < 0 ? '#1fa39a' : '#f2c230'), x, 0.62, -0.18).rotation.z = x * 0.2;
    // coffee table + open box of yellowed paper bills
    const tbl = new THREE.Group(); tbl.position.set(0, 0, -0.45); G.add(tbl); const woodM = M('#7a5034', 'leather');
    add(tbl, rb(1.2, 0.06, 0.62, 0.02), woodM, 0, 0.42, 0); for (const x of [-0.52, 0.52]) for (const z of [-0.24, 0.24]) add(tbl, new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8), M('#5a3a22', 'leather'), x, 0.2, z);
    const billBox = new THREE.Group(); billBox.position.set(-0.22, 0.45, 0); tbl.add(billBox); const cardM = M('#c9a26b');
    add(billBox, new THREE.BoxGeometry(0.42, 0.012, 0.3), cardM, 0, 0.006, 0); for (const [x, z, w, d] of [[-0.205, 0, 0.012, 0.3], [0.205, 0, 0.012, 0.3], [0, -0.145, 0.42, 0.012], [0, 0.145, 0.42, 0.012]]) add(billBox, new THREE.BoxGeometry(w, 0.2, d), cardM, x, 0.1, z);
    for (const [x, z, a] of [[-0.21, 0, 0.9], [0.21, 0, -0.9]]) { const f = add(billBox, new THREE.BoxGeometry(0.012, 0.16, 0.3), cardM, x + Math.sign(x) * 0.06, 0.22, z); f.rotation.z = a; }
    const paperM = M('#efe0a8', 'white'); for (let i = 0; i < 7; i++) { const p = add(billBox, new THREE.BoxGeometry(0.3, 0.004, 0.22), paperM, (rnd() - 0.5) * 0.06, 0.06 + i * 0.022, (rnd() - 0.5) * 0.04); p.rotation.set((rnd() - 0.5) * 0.3, (rnd() - 0.5) * 0.4, (rnd() - 0.5) * 0.25); }
    const loose = add(tbl, new THREE.BoxGeometry(0.3, 0.004, 0.22), paperM, 0.28, 0.452, 0.08, false); loose.rotation.y = 0.35;
    add(tbl, new THREE.CylinderGeometry(0.06, 0.05, 0.12, 16), M('#f2f2f2', 'white'), 0.42, 0.51, -0.15); // cafecito
    // side table with the old rotary landline
    const st = new THREE.Group(); st.position.set(1.6, 0, -1.9); G.add(st); add(st, rb(0.5, 0.6, 0.5, 0.03), woodM, 0, 0.3, 0); add(st, rb(0.54, 0.012, 0.54, 0.004), M('#fbf6ec', 'white'), 0, 0.605, 0, false);
    const oldPhone = new THREE.Group(); oldPhone.position.set(0, 0.61, 0.02); oldPhone.rotation.y = -0.4; st.add(oldPhone); const phM = M('#e8dcc0', 'white');
    add(oldPhone, rb(0.24, 0.1, 0.28, 0.05), phM, 0, 0.05, 0); const dial = add(oldPhone, new THREE.CylinderGeometry(0.075, 0.075, 0.02, 24), M('#f6f0e0', 'white'), 0, 0.09, 0.06); dial.rotation.x = -0.35;
    for (let i = 0; i < 10; i++) { const a = -0.6 + i * 0.5; const h = add(oldPhone, new THREE.CylinderGeometry(0.011, 0.011, 0.022, 8), M('#5a4a3a', 'dark'), Math.cos(a) * 0.05, 0.1 + Math.sin(a) * 0.016, 0.06 + Math.sin(a) * 0.045, false); h.rotation.x = -0.35; }
    const hs = new THREE.Group(); hs.position.set(0, 0.13, -0.04); oldPhone.add(hs); add(hs, rb(0.06, 0.04, 0.3, 0.02), phM, 0, 0, 0); for (const z of [-0.13, 0.13]) add(hs, rb(0.08, 0.06, 0.08, 0.03), phM, 0, -0.02, z);
    oldPhone.userData.handset = hs;
    for (let i = 0; i < 14; i++) add(oldPhone, new THREE.TorusGeometry(0.018, 0.005, 6, 10), M('#e8dcc0', 'white'), -0.14 - i * 0.008, 0.05 - i * 0.012, -0.05, false).rotation.y = Math.PI / 2;
    // TV cabinet on the right wall (facing -x) with a chunky TV
    const tv = new THREE.Group(); tv.position.set(2.25, 0, 0.6); tv.rotation.y = -Math.PI / 2; G.add(tv); add(tv, rb(1.3, 0.55, 0.45, 0.03), woodM, 0, 0.275, 0);
    add(tv, rb(0.62, 0.48, 0.45, 0.06), M('#2a2a2e', 'dark'), 0, 0.8, 0); add(tv, rb(0.5, 0.36, 0.01, 0.03), EM('#3a5a7a', 0.4), 0, 0.8, 0.226, false);
    // family photo wall + calendar + clock
    const photos = [[-1.3, 1.85, 0.42, 0.52, portrait('#d8c3a0', '#c68a5e', '#3a5a8a')], [-0.7, 2.0, 0.36, 0.36, portrait('#c9b48e', '#e0b48e', '#8a3b2a')], [-0.75, 1.55, 0.3, 0.38, portrait('#d6c6a6', '#a86f4a', '#2f6b3a')], [0.0, 1.95, 0.62, 0.44, portrait('#cbb391', '#c68a5e', '#5a4a3a')], [0.75, 1.82, 0.34, 0.44, portrait('#d0bc98', '#f0d0b5', '#d65c5c')], [1.25, 2.02, 0.3, 0.3, portrait('#c4ae88', '#8d5a3b', '#e0c050')]];
    for (const [x, y, w, h, dr] of photos) { const f = framedPicture(w, h, dr, rnd() < 0.5 ? '#6b4a2b' : '#c9a24a'); f.position.set(x, y, -2.58); G.add(f); }
    const cal = framedPicture(0.38, 0.56, (c, w, h) => { c.fillStyle = '#fff'; c.fillRect(0, 0, w, h); c.fillStyle = '#c0392b'; c.fillRect(0, 0, w, h * 0.42); c.fillStyle = '#f2c230'; c.beginPath(); c.arc(w * 0.5, h * 0.22, w * 0.15, 0, 7); c.fill(); c.fillStyle = '#333'; for (let i = 0; i < 20; i++) c.fillRect(12 + (i % 5) * 46, h * 0.5 + Math.floor(i / 5) * 30, 30, 18); }, '#f4efe6');
    cal.position.set(2.58, 1.75, -1.2); cal.rotation.y = -Math.PI / 2; G.add(cal); wallClock(G, 2.58, 2.25, 0.6, -Math.PI / 2);
    // floor lamp + plant
    add(G, new THREE.CylinderGeometry(0.02, 0.02, 1.5, 8), M('#8a6a3a', 'leather'), -1.75, 0.75, -2.1); add(G, new THREE.CylinderGeometry(0.16, 0.2, 0.06, 20), M('#5a3a22', 'leather'), -1.75, 0.03, -2.1);
    const shade = add(G, new THREE.CylinderGeometry(0.16, 0.24, 0.3, 24, 1, true), new THREE.MeshStandardMaterial({ color: '#f6e2b8', emissive: '#ffb45e', emissiveIntensity: 0.8, side: THREE.DoubleSide }), -1.75, 1.55, -2.1, false);
    plant(G, 2.15, -2.2, 1.2);
    add(G, new THREE.BoxGeometry(5.2, 0.08, 5.2), M('#f4ead8', 'white'), 0, CH + 0.04, 0, false); add(G, new THREE.CylinderGeometry(0.22, 0.22, 0.03, 24), EM('#fff2d8', 1.0), 0, CH - 0.015, -0.4, false);
    // lights: warm afternoon sun through the window (only shadow caster), warm fill, lamp glow
    const hemi = new THREE.HemisphereLight(0xffe6c8, 0x5a3a2a, 0.55); G.add(hemi);
    const sun = new THREE.DirectionalLight(0xffc98a, 2.6); sun.position.set(-6, 3.6, 0.6); sun.target.position.set(0, 0.3, -0.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 14 }); sun.shadow.bias = -0.0006; G.add(sun, sun.target);
    const fill = new THREE.PointLight(0xffd8a8, 3.2, 9, 1.5); fill.position.set(0.8, 2.4, 1.8); G.add(fill);
    const lampL = new THREE.PointLight(0xffb067, 1.6, 4, 1.6); lampL.position.set(-1.75, 1.5, -2.0); G.add(lampL);
    const ud = G.userData;
    ud.billBox = billBox; ud.oldPhone = oldPhone; ud.sofa = sofa; ud.coffeeTable = tbl; ud.sun = sun;
    ud.sofaSeats = [{ x: -0.53, z: -1.66, ry: 0 }, { x: 0.53, z: -1.66, ry: 0 }]; ud.seatY = 0.49; // seat cushion top
    ud.standSpot = { x: 1.15, z: -0.3, ry: -0.45 }; ud.tableTop = 0.45; ud.window = { x: -2.6, y: 1.6, z: -0.1 };
    setEnvIntensity(G, 0.25); ud.envIntensity = 0.25;
    return G;
  }

  // ======================= 2. AUCTION HALL (1990) =======================
  // camera: wide from the back [1.2, 2.3, 5.2] -> [0, 1.5, -2.6], fov 50; podium low angle [0.4, 1.0, -0.6] -> [0, 1.9, -3.2], fov 42
  function auction1990() {
    const G = new THREE.Group(); G.name = 'auction1990'; const CH = 4.0;
    const parquet = ctex(512, 512, (c, w, h) => { for (let i = 0; i < 16; i++) for (let j = 0; j < 4; j++) { const k = rnd() * 0.12; c.fillStyle = `rgb(${120 + k * 300 | 0},${78 + k * 200 | 0},${46 + k * 100 | 0})`; c.fillRect(j * 128 + (i % 2) * 64, i * 32, 128, 31); } });
    parquet.wrapS = parquet.wrapT = THREE.RepeatWrapping; parquet.repeat.set(3, 3);
    const floor = add(G, new THREE.PlaneGeometry(9, 10), new THREE.MeshStandardMaterial({ map: parquet, roughness: 0.6 }), 0, 0, 0.5, false); floor.rotation.x = -Math.PI / 2;
    const panelM = M('#5a3a22', 'leather'), wallM = M('#d8c8a0'), trimM = M('#3a2618', 'leather');
    // back wall with wood panels, side walls
    add(G, new THREE.BoxGeometry(9, CH, 0.12), wallM, 0, CH / 2, -4.56); for (let i = 0; i < 8; i++) add(G, rb(1.0, 1.2, 0.05, 0.02), panelM, -3.85 + i * 1.1, 0.6, -4.48);
    for (const s of [-1, 1]) { add(G, new THREE.BoxGeometry(0.12, CH, 10), wallM, s * 4.5, CH / 2, 0.5); for (let i = 0; i < 8; i++) add(G, rb(0.05, 1.2, 1.1, 0.02), panelM, s * 4.42, 0.6, -4.0 + i * 1.2); add(G, rb(0.06, 0.06, 10, 0.02), trimM, s * 4.42, 1.25, 0.5, false); }
    add(G, rb(9, 0.06, 0.06, 0.02), trimM, 0, 1.25, -4.47, false);
    // ceiling with old fluorescent fixtures
    add(G, new THREE.BoxGeometry(9, 0.1, 10), M('#e8e0c8'), 0, CH + 0.05, 0.5, false);
    for (const z of [-3, -0.5, 2]) for (const x of [-2, 2]) add(G, rb(1.2, 0.06, 0.26, 0.02), EM('#fff4d8', 1.2), x, CH - 0.04, z, false);
    // stage (y=0.25) with the podium, gavel and microphone
    const STG = 0.25; add(G, rb(6.4, STG, 2.4, 0.03), M('#6b4a2b', 'leather'), 0, STG / 2, -3.3); add(G, rb(6.4, 0.04, 0.06, 0.01), trimM, 0, STG, -2.1, false);
    const pod = new THREE.Group(); pod.position.set(0, STG, -2.75); G.add(pod); const podM = M('#7a5034', 'leather');
    add(pod, rb(0.95, 1.08, 0.55, 0.04), podM, 0, 0.54, 0); add(pod, rb(1.05, 0.06, 0.66, 0.02), M('#5a3a22', 'leather'), 0, 1.1, -0.02); add(pod, rb(0.7, 0.5, 0.02, 0.02), M('#c9a24a', 'leather'), 0, 0.62, 0.28, false);
    const gavel = new THREE.Group(); gavel.position.set(0.28, 1.14, 0.02); gavel.rotation.y = 0.5; pod.add(gavel); add(gavel, new THREE.CylinderGeometry(0.06, 0.07, 0.03, 20), M('#3a2618', 'leather'), 0, 0, 0);
    const gh = new THREE.Group(); gh.position.set(0, 0.06, 0); gavel.add(gh); add(gh, new THREE.CylinderGeometry(0.045, 0.045, 0.16, 16), M('#5a3a22', 'leather'), 0, 0, 0).rotation.z = Math.PI / 2; add(gh, new THREE.CylinderGeometry(0.014, 0.014, 0.24, 8), M('#7a5034', 'leather'), 0, 0, 0.12).rotation.x = Math.PI / 2;
    gavel.userData.head = gh;
    const mic = new THREE.Group(); mic.position.set(-0.22, 1.13, -0.05); pod.add(mic); add(mic, new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6), M('#2a2a2e', 'dark'), 0, 0.15, 0.03).rotation.x = 0.35; add(mic, new THREE.SphereGeometry(0.04, 12, 8), M('#555', 'dark'), 0, 0.3, 0.1);
    // banner screen behind the podium (live canvas)
    const screen = props.monitor(3.2, 1.4, { frame: '#3a2618', res: 1280 }); screen.position.set(0, 3.08, -4.44); G.add(screen);
    // retro details: CRT TV on a cart, standing microphones, wall clock, side tables with water jugs
    const crt = new THREE.Group(); crt.position.set(-3.4, 0, -1.6); crt.rotation.y = 0.6; G.add(crt); add(crt, rb(0.7, 0.75, 0.55, 0.03), M('#4a4a4e', 'dark'), 0, 0.375, 0);
    add(crt, rb(0.66, 0.56, 0.6, 0.1), M('#3a3a3c', 'dark'), 0, 1.03, 0); add(crt, rb(0.48, 0.38, 0.01, 0.06), EM('#8fb0b0', 0.5), 0, 1.05, 0.305, false);
    for (const [x, z] of [[-2.6, -2.3], [2.6, -2.3]]) { add(G, new THREE.CylinderGeometry(0.012, 0.012, 1.5, 6), M('#2a2a2e', 'dark'), x, STG + 0.75, z); add(G, new THREE.CylinderGeometry(0.16, 0.16, 0.03, 16), M('#2a2a2e', 'dark'), x, STG + 0.015, z); add(G, new THREE.SphereGeometry(0.045, 12, 8), M('#666', 'dark'), x, STG + 1.52, z); }
    wallClock(G, -3.2, 2.7, -4.48, 0);
    // bidder chairs: 3 rows x 5 facing the podium (-z), plus paddles on the seats
    const seats = []; const chairs = [];
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) { const x = (i - 2) * 1.1, z = -0.4 + r * 1.3; const ch = woodChair(); ch.position.set(x, 0, z); ch.rotation.y = Math.PI; G.add(ch); chairs.push(ch); seats.push({ x, z, ry: Math.PI }); }
    const paddle = () => { const g = new THREE.Group(); add(g, new THREE.CylinderGeometry(0.12, 0.12, 0.012, 24), M('#f4efe6', 'white'), 0, 0.2, 0).rotation.x = Math.PI / 2; add(g, rb(0.03, 0.2, 0.012, 0.006), M('#7a5034', 'leather'), 0, 0.05, 0); return g; };
    // lights: warm tungsten, one spot on the podium (shadow caster)
    G.add(new THREE.HemisphereLight(0xfff0d8, 0x4a3a2a, 0.6));
    const spot = new THREE.SpotLight(0xffe2b0, 70, 12, 0.6, 0.5, 1.4); spot.position.set(1.2, CH - 0.1, -0.2); spot.target.position.set(0, 1.2, -3.0); spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.0005; G.add(spot, spot.target);
    for (const [x, z] of [[-2, -0.5], [2, -0.5], [0, 2.2]]) { const pl = new THREE.PointLight(0xffe0b0, 4, 8, 1.6); pl.position.set(x, CH - 0.4, z); G.add(pl); }
    const ud = G.userData;
    ud.screen = screen; ud.podiumGroup = pod; ud.gavel = gavel; ud.mic = mic; ud.chairs = chairs; ud.seats = seats; ud.paddle = paddle; ud.spot = spot;
    ud.podium = { x: 0, y: STG, z: -3.3, ry: 0 }; // auctioneer stands behind the lectern on the stage, facing the room (+z)
    ud.bidderSeat = seats[2]; ud.partnerSeats = [seats[1], seats[3]]; ud.seatY = 0.45; // Slim front row centre, partners either side (they face -z)
    ud.observerSpots = [{ x: 3.55, z: -0.9, ry: -2.2 }, { x: 3.7, z: 0.1, ry: -2.35 }]; ud.observerSpot = ud.observerSpots[0];
    ud.stageY = STG; ud.screenPos = { x: 0, y: 3.08, z: -4.42 };
    setEnvIntensity(G, 0.3); ud.envIntensity = 0.3;
    return G;
  }

  // ======================= 3. CHART OFFICE (OECD) =======================
  // camera: [0.4, 1.75, 3.6] -> [0, 1.6, -3.4], fov 50; screen close [0, 1.85, -0.9] -> [0, 1.85, -3.4], fov 50
  function chartOffice() {
    const G = new THREE.Group(); G.name = 'chartOffice'; const CH = 3.2;
    const floor = add(G, new THREE.PlaneGeometry(7, 8), new THREE.MeshStandardMaterial({ color: '#c9ccd0', roughness: 0.35, metalness: 0.05 }), 0, 0, 0, false); floor.rotation.x = -Math.PI / 2;
    const rug = add(G, new THREE.PlaneGeometry(3.4, 2.4), M('#4a5a6e'), 0, 0.005, -1.0, false); rug.rotation.x = -Math.PI / 2;
    const wallM = M('#eef0f2', 'white');
    add(G, new THREE.BoxGeometry(7, CH, 0.12), wallM, 0, CH / 2, -3.56); add(G, new THREE.BoxGeometry(7, 0.12, 0.04), M('#2c3e50'), 0, 0.06, -3.49, false);
    const screen = props.monitor(3.6, 2.0, { frame: '#16181c', res: 1440 }); screen.position.set(0, 1.85, -3.46); G.add(screen);
    const scrGlow = new THREE.PointLight(0xa8c8ff, 3, 6, 2); scrGlow.position.set(0, 1.8, -2.6); G.add(scrGlow);
    // left wall with an open doorway (peek spot) at z -1.4..-0.4 + plant
    const lw = -3.5, d0 = -1.5, d1 = -0.4, DH = 2.35;
    add(G, new THREE.BoxGeometry(0.12, CH, 3.5 + d0), wallM, lw, CH / 2, (-3.5 + d0) / 2); add(G, new THREE.BoxGeometry(0.12, CH, 4 - d1), wallM, lw, CH / 2, (d1 + 4) / 2); add(G, new THREE.BoxGeometry(0.12, CH - DH, d1 - d0), wallM, lw, (DH + CH) / 2, (d0 + d1) / 2);
    const steel = M('#9aa3ad', 'dark'); add(G, rb(0.16, DH, 0.06, 0.01), steel, lw + 0.02, DH / 2, d0); add(G, rb(0.16, DH, 0.06, 0.01), steel, lw + 0.02, DH / 2, d1); add(G, rb(0.16, 0.06, d1 - d0 + 0.06, 0.01), steel, lw + 0.02, DH, (d0 + d1) / 2);
    add(G, new THREE.PlaneGeometry(1.4, DH), M('#2a2d33'), lw - 0.3, DH / 2, (d0 + d1) / 2, false).rotation.y = Math.PI / 2; // dark corridor behind the door
    const door = add(G, rb(0.05, DH - 0.04, d1 - d0 - 0.04, 0.01), new THREE.MeshStandardMaterial({ color: '#b8d4e8', transparent: true, opacity: 0.35, roughness: 0.1 }), lw - 0.35, DH / 2, d0 + 0.5, false); door.rotation.y = 1.0;
    plant(G, lw + 0.45, d0 - 0.45, 1.25, '#2a2a2e');
    // right side: glass wall with daytime city
    for (let i = 0; i <= 8; i++) add(G, new THREE.BoxGeometry(0.07, CH, 0.07), steel, 3.5, CH / 2, -3.5 + i * 0.95);
    add(G, new THREE.BoxGeometry(0.1, 0.08, 8), steel, 3.5, 0.04, 0.3); add(G, new THREE.BoxGeometry(0.1, 0.08, 8), steel, 3.5, CH - 0.04, 0.3);
    const cityTex = ctex(2048, 1024, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#8ec2ee'); g.addColorStop(0.7, '#d8ecf8'); g.addColorStop(1, '#eef4f8'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (const [col, lo, hi] of [['#b8c4d0', 0.3, 0.6], ['#8f9cab', 0.45, 0.9]]) { let x = 0; while (x < w) { const bw = 60 + rnd() * 140, bh = h * (lo + rnd() * (hi - lo)) * 0.6; c.fillStyle = col; c.fillRect(x, h - bh, bw, bh); c.fillStyle = 'rgba(255,255,255,0.35)'; for (let yy = h - bh + 12; yy < h - 8; yy += 22) c.fillRect(x + 6, yy, bw - 12, 6); x += bw + 10; } } });
    const city = add(G, new THREE.PlaneGeometry(30, 15), BASIC({ map: cityTex }), 12, 4, 0, false); city.rotation.y = -Math.PI / 2;
    // low cabinet with binders under the screen, a high table with reports, ceiling panels
    add(G, rb(3.0, 0.5, 0.45, 0.02), M('#dfe3e8', 'white'), 0, 0.25, -3.25); for (let i = 0; i < 10; i++) add(G, rb(0.08, 0.3, 0.26, 0.01), M(['#2c5aa0', '#1fa39a', '#c0392b', '#f2c230'][i % 4]), -1.2 + i * 0.12, 0.65, -3.25);
    const rt = new THREE.Group(); rt.position.set(1.7, 0, -1.6); G.add(rt); add(rt, rb(0.8, 0.04, 0.6, 0.015), M('#f4f6f8', 'white'), 0, 1.0, 0); add(rt, new THREE.CylinderGeometry(0.03, 0.03, 1.0, 10), steel, 0, 0.5, 0); add(rt, new THREE.CylinderGeometry(0.25, 0.25, 0.03, 20), steel, 0, 0.015, 0);
    for (let i = 0; i < 5; i++) add(rt, rb(0.3, 0.02, 0.4, 0.004), M('#ffffff', 'white'), (rnd() - 0.5) * 0.1, 1.03 + i * 0.022, (rnd() - 0.5) * 0.06).rotation.y = (rnd() - 0.5) * 0.4;
    add(G, new THREE.BoxGeometry(7, 0.08, 8), M('#f4f6f8', 'white'), 0, CH + 0.04, 0, false); for (const z of [-2.4, -0.4, 1.6]) for (const x of [-1.6, 1.6]) add(G, rb(1.0, 0.03, 1.0, 0.01), EM('#f4f8ff', 0.55), x, CH - 0.015, z, false);
    // lights: cool daylight through the glass (shadow caster), hemi, ceiling fill
    G.add(new THREE.HemisphereLight(0xe8f0ff, 0x6a7078, 0.7));
    const day = new THREE.DirectionalLight(0xf2f6ff, 2.4); day.position.set(8, 6, 1.5); day.target.position.set(-0.5, 0, -1.2); day.castShadow = true; day.shadow.mapSize.set(2048, 2048);
    Object.assign(day.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 20 }); day.shadow.bias = -0.0006; G.add(day, day.target);
    for (const z of [-1.8, 1.2]) { const pl = new THREE.PointLight(0xf4f8ff, 4, 8, 1.6); pl.position.set(0, CH - 0.3, z); G.add(pl); }
    const ud = G.userData;
    ud.screen = screen; ud.screenPos = { x: 0, y: 1.85, z: -3.43 }; ud.reportTable = rt;
    ud.presenterSpot = { x: -1.35, z: -2.55, ry: 0.35 }; // front-left of the screen, facing the room
    ud.observerSpots = [{ x: 2.3, z: 0.5, ry: -2.6 }, { x: 2.75, z: 1.2, ry: -2.6 }]; ud.observerSpot = ud.observerSpots[0];
    ud.peekSpot = { x: -3.15, z: -0.95, ry: Math.PI / 2 }; // in the doorway, facing into the room (+x)
    ud.doorway = { x: lw, z: (d0 + d1) / 2, height: DH };
    setEnvIntensity(G, 0.35); ud.envIntensity = 0.35;
    return G;
  }

  // ======================= 4. MONEY MOUNTAIN =======================
  // camera: low hero [0.6, 0.9, 7.2] -> [0, 2.7, 0], fov 50; summit close [0.5, 3.4, 2.4] -> [0, 3.6, 0], fov 40
  function moneyMountain() {
    const G = new THREE.Group(); G.name = 'moneyMountain';
    const skyTex = ctex(1024, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#0a0620'); g.addColorStop(0.45, '#2a1458'); g.addColorStop(0.72, '#7a2a6a'); g.addColorStop(1, '#f2a14a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.7})`; c.fillRect(rnd() * w, rnd() * h * 0.45, 1.5, 1.5); } });
    G.add(new THREE.Mesh(new THREE.SphereGeometry(60, 32, 16), BASIC({ map: skyTex, side: THREE.BackSide, fog: false })));
    const ground = add(G, new THREE.CircleGeometry(30, 48), M('#1c1a24'), 0, 0, 0, false); ground.rotation.x = -Math.PI / 2;
    // banknote bundle texture (fictional bills, no real currency design)
    const billTex = ctex(256, 128, (c, w, h) => { c.fillStyle = '#2f7a45'; c.fillRect(0, 0, w, h); c.fillStyle = '#246338'; c.fillRect(6, 6, w - 12, h - 12); c.fillStyle = '#5fa86e'; c.beginPath(); c.ellipse(w / 2, h / 2, w * 0.18, h * 0.32, 0, 0, 7); c.fill();
      c.fillStyle = '#163f24'; c.font = `900 64px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('$', w / 2, h / 2 + 2); c.fillStyle = '#f4efe6'; c.fillRect(w * 0.44, 0, w * 0.12, h); });
    const sideTex = ctex(64, 32, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#9cc894' : '#5f9e68'; c.fillRect(0, i * 2, w, 2); } c.fillStyle = '#f4efe6'; c.fillRect(w * 0.44, 0, w * 0.12, h); });
    const faceM = new THREE.MeshStandardMaterial({ map: billTex, roughness: 0.8 }), edgeM = new THREE.MeshStandardMaterial({ map: sideTex, roughness: 0.85 });
    const geo = new THREE.BoxGeometry(0.34, 0.11, 0.16);
    const pts = []; const SUM = 2.5;
    for (let y = 0; y < SUM; y += 0.11) { const r = 3.4 * Math.pow(1 - y / SUM, 0.85) + 0.75; const n = Math.floor(2 * Math.PI * r / 0.3);
      for (let k = 0; k < 3; k++) { const rr = r - k * 0.32; if (rr < 0.1) break; const nn = Math.max(4, Math.floor(n * rr / r)); for (let i = 0; i < nn; i++) { const a = i / nn * Math.PI * 2 + y * 3 + k; pts.push([Math.cos(a) * rr + (rnd() - 0.5) * 0.06, y + 0.055, Math.sin(a) * rr + (rnd() - 0.5) * 0.06, a + Math.PI / 2 + (rnd() - 0.5) * 0.5]); } } }
    // flat summit platform
    for (let x = -0.6; x <= 0.61; x += 0.34) for (let z = -0.6; z <= 0.61; z += 0.17) pts.push([x, SUM + 0.055, z, 0]);
    const inst = new THREE.InstancedMesh(geo, [edgeM, edgeM, faceM, faceM, edgeM, edgeM], pts.length); const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s1 = new THREE.Vector3(1, 1, 1);
    pts.forEach(([x, y, z, a], i) => { e.set((rnd() - 0.5) * 0.08, a, (rnd() - 0.5) * 0.08); q.setFromEuler(e); m4.compose(new THREE.Vector3(x, y, z), q, s1); inst.setMatrixAt(i, m4); });
    inst.castShadow = true; inst.receiveShadow = true; G.add(inst);
    // filler cone so no gaps show through the bundles
    add(G, new THREE.ConeGeometry(4.0, SUM * 1.15, 40, 1, true), M('#2a5e38'), 0, SUM * 0.5, 0, false).scale.set(1, 1, 1);
    add(G, new THREE.CylinderGeometry(0.75, 0.75, 0.05, 32), M('#2a5e38'), 0, SUM + 0.02, 0, false);
    // loose flying bills
    const looseM = new THREE.MeshStandardMaterial({ map: billTex, side: THREE.DoubleSide, roughness: 0.8 });
    for (let i = 0; i < 26; i++) { const b = add(G, new THREE.PlaneGeometry(0.34, 0.16), looseM, (rnd() - 0.5) * 7, 0.02 + rnd() * 0.02, 1.0 + rnd() * 3.5, false); b.rotation.set(-Math.PI / 2, 0, rnd() * 6); }
    // gold "#1" sign on a post beside the summit + a crown prop (hidden; parent can show it on a head)
    const gold = new THREE.MeshStandardMaterial({ color: '#f2c230', metalness: 0.85, roughness: 0.25, emissive: '#5a3a00', emissiveIntensity: 0.3 });
    const signTex = ctex(256, 256, (c, w, h) => { c.fillStyle = '#f2c230'; c.beginPath(); c.arc(w / 2, h / 2, w / 2 - 4, 0, 7); c.fill(); c.strokeStyle = '#b8860b'; c.lineWidth = 14; c.stroke(); c.fillStyle = '#5a3a00'; c.font = `900 130px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('#1', w / 2, h / 2 + 6); });
    const sign = new THREE.Group(); sign.position.set(1.15, SUM, -0.15); G.add(sign); add(sign, new THREE.CylinderGeometry(0.03, 0.03, 1.4, 10), gold, 0, 0.7, 0);
    add(sign, new THREE.CylinderGeometry(0.42, 0.42, 0.05, 40), gold, 0, 1.5, 0).rotation.x = Math.PI / 2; add(sign, new THREE.CircleGeometry(0.4, 40), new THREE.MeshStandardMaterial({ map: signTex, metalness: 0.5, roughness: 0.35 }), 0, 1.5, 0.03, false);
    sign.rotation.y = -0.35;
    const crown = new THREE.Group(); add(crown, new THREE.CylinderGeometry(0.2, 0.22, 0.12, 24, 1, true), gold, 0, 0.06, 0); for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; add(crown, new THREE.ConeGeometry(0.05, 0.14, 8), gold, Math.cos(a) * 0.2, 0.18, Math.sin(a) * 0.2); add(crown, new THREE.SphereGeometry(0.022, 8, 6), EM('#ff3a5a', 0.6), Math.cos(a) * 0.205, 0.07, Math.sin(a) * 0.205); }
    crown.visible = false; G.add(crown);
    // lights: two spots on the summit (one shadow caster), warm rim from behind, low hemi
    G.add(new THREE.HemisphereLight(0x8a7ad8, 0x1a1020, 0.35));
    const key = new THREE.SpotLight(0xfff0d0, 110, 20, 0.5, 0.5, 1.2); key.position.set(4, 8, 6); key.target.position.set(0, 1.6, 0); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0006; G.add(key, key.target);
    const key2 = new THREE.SpotLight(0xd8c0ff, 55, 20, 0.55, 0.6, 1.2); key2.position.set(-5, 6, 5); key2.target.position.set(0, 1.8, 0); G.add(key2, key2.target);
    const rim = new THREE.DirectionalLight(0xffb060, 1.6); rim.position.set(0, 4, -8); G.add(rim);
    const ud = G.userData;
    ud.summit = { x: 0, y: SUM + 0.05, z: 0 }; ud.sign = sign; ud.crown = crown; ud.key = key; ud.bundles = inst;
    ud.observerSpots = [{ x: 2.4, z: 3.6, ry: -2.6 }, { x: 3.2, z: 3.2, ry: -2.4 }]; ud.observerSpot = ud.observerSpots[0];
    setEnvIntensity(G, 0.35); ud.envIntensity = 0.35;
    return G;
  }

  // ======================= 5. REGULATOR OFFICE (2014) =======================
  // camera: [0.7, 1.65, 3.4] -> [0, 1.2, -1.5], fov 50; stamp close [0.9, 1.6, -0.3] -> [0.45, 0.85, -1.35], fov 40
  function regulatorOffice() {
    const G = new THREE.Group(); G.name = 'regulatorOffice'; const CH = 2.9;
    const floor = add(G, new THREE.PlaneGeometry(6, 6.5), new THREE.MeshStandardMaterial({ color: '#b9b4a6', roughness: 0.6 }), 0, 0, 0, false); floor.rotation.x = -Math.PI / 2;
    const lowM = M('#6f8a6a'), upM = M('#ece6d4');
    add(G, new THREE.BoxGeometry(6, CH, 0.12), upM, 0, CH / 2, -3.06); add(G, new THREE.BoxGeometry(6, 1.0, 0.02), lowM, 0, 0.5, -2.99, false); add(G, rb(6, 0.05, 0.04, 0.01), M('#4a5a46'), 0, 1.02, -2.98, false);
    for (const s of [-1, 1]) { add(G, new THREE.BoxGeometry(0.12, CH, 6.5), upM, s * 3.06, CH / 2, 0); add(G, new THREE.BoxGeometry(0.02, 1.0, 6.5), lowM, s * 2.99, 0.5, 0, false); }
    // window with blinds on the back wall (right)
    add(G, new THREE.PlaneGeometry(1.4, 1.2), BASIC({ color: '#cfe0ee' }), 1.7, 1.75, -2.99, false); for (let i = 0; i < 14; i++) add(G, rb(1.44, 0.04, 0.02, 0.006), M('#f4f1e8', 'white'), 1.7, 1.2 + i * 0.085, -2.97, false);
    // framed generic certificate, wall clock, bookshelf with binders, filing cabinets, water dispenser (garrafón)
    const cert = framedPicture(0.7, 0.5, (c, w, h) => { c.fillStyle = '#fbf6ea'; c.fillRect(0, 0, w, h); c.strokeStyle = '#b89a5a'; c.lineWidth = 8; c.strokeRect(10, 10, w - 20, h - 20); c.fillStyle = '#5a4a3a'; for (let i = 0; i < 5; i++) c.fillRect(w * 0.2, h * 0.3 + i * 18, w * 0.6, 6); c.fillStyle = '#b89a5a'; c.beginPath(); c.arc(w * 0.78, h * 0.78, 16, 0, 7); c.fill(); }, '#3a2618');
    cert.position.set(-0.9, 1.9, -2.98); G.add(cert); wallClock(G, 0.3, 2.3, -2.98, 0);
    const shelf = new THREE.Group(); shelf.position.set(-2.55, 0, -1.5); shelf.rotation.y = Math.PI / 2; G.add(shelf); add(shelf, rb(1.4, 1.9, 0.38, 0.02), M('#7a6a52', 'leather'), 0, 0.95, 0);
    for (let r = 0; r < 4; r++) { add(shelf, rb(1.3, 0.02, 0.34, 0.005), M('#5a4a3a', 'leather'), 0, 0.2 + r * 0.45, 0.02); for (let i = 0; i < 9; i++) add(shelf, rb(0.1, 0.32, 0.28, 0.01), M(['#2c5aa0', '#c0392b', '#2f6b3a', '#d9b14a', '#5a5a5a'][(i + r) % 5]), -0.55 + i * 0.135, 0.38 + r * 0.45, 0.04); }
    for (const z of [0.3, 0.85]) { add(G, rb(0.55, 1.3, 0.6, 0.02), M('#8a8f96', 'dark'), 2.65, 0.65, z); for (let i = 0; i < 3; i++) add(G, rb(0.02, 0.05, 0.2, 0.01), M('#c8ccd0', 'dark'), 2.36, 0.25 + i * 0.4, z, false); }
    const wd = new THREE.Group(); wd.position.set(2.55, 0, -2.4); G.add(wd); add(wd, rb(0.36, 1.0, 0.36, 0.03), M('#f2f2f2', 'white'), 0, 0.5, 0); add(wd, new THREE.CylinderGeometry(0.15, 0.15, 0.42, 20), new THREE.MeshStandardMaterial({ color: '#7fb8e8', transparent: true, opacity: 0.6, roughness: 0.1 }), 0, 1.22, 0);
    plant(G, -2.5, -2.55, 1.1, '#5a5a5a');
    // desk (top 0.78) + regulator chair behind it
    const desk = new THREE.Group(); desk.position.set(0, 0, -1.35); G.add(desk); const dw = M('#6b4a2b', 'leather');
    add(desk, rb(1.9, 0.06, 0.85, 0.02), dw, 0, 0.75, 0); add(desk, rb(1.86, 0.62, 0.05, 0.02), M('#5a3a22', 'leather'), 0, 0.41, 0.36); for (const x of [-0.85, 0.85]) add(desk, rb(0.12, 0.72, 0.8, 0.02), M('#5a3a22', 'leather'), x, 0.36, 0);
    add(desk, rb(0.35, 0.25, 0.04, 0.02), M('#2a2a2e', 'dark'), -0.6, 0.93, -0.25); add(desk, rb(0.3, 0.2, 0.01, 0.01), EM('#5a7a9a', 0.4), -0.6, 0.95, -0.228, false); // old monitor
    add(desk, rb(0.25, 0.08, 0.32, 0.01), M('#d0c8b0', 'white'), 0.75, 0.82, -0.2); // tray of papers
    const deskChair = officeChair(); deskChair.position.set(0, 0, -2.05); G.add(deskChair);
    // document with a live canvas (lying on the desk, top edge toward the regulator)
    const doc = livePlane(0.46, 0.62, 512, { fill: '#fbf8ef' }); doc.rotation.x = -Math.PI / 2; doc.rotation.z = Math.PI; doc.position.set(-0.12, 0.783, -1.2); doc.rotation.order = 'XYZ'; G.add(doc);
    // giant rubber stamp + ink pad; group origin at the bottom of the stamp so lifting y raises it
    const pad = add(G, rb(0.34, 0.04, 0.26, 0.01), M('#2a2a2e', 'dark'), 0.55, 0.8, -1.2); add(G, rb(0.3, 0.012, 0.22, 0.004), M('#a01a1a'), 0.55, 0.822, -1.2, false);
    const stamp = new THREE.Group(); stamp.position.set(0.55, 0.83, -1.2); G.add(stamp);
    add(stamp, rb(0.3, 0.05, 0.22, 0.01), M('#a01a1a'), 0, 0.025, 0); add(stamp, rb(0.32, 0.1, 0.24, 0.02), M('#3a2618', 'leather'), 0, 0.1, 0); add(stamp, new THREE.CylinderGeometry(0.035, 0.05, 0.26, 12), M('#7a5034', 'leather'), 0, 0.28, 0); add(stamp, new THREE.SphereGeometry(0.09, 16, 12), M('#c0392b'), 0, 0.45, 0);
    // fluorescent ceiling panels
    add(G, new THREE.BoxGeometry(6, 0.08, 6.5), M('#f4f1e8', 'white'), 0, CH + 0.04, 0, false); for (const z of [-1.5, 0.6]) for (const x of [-1.2, 1.2]) add(G, rb(1.2, 0.03, 0.6, 0.01), EM('#f4fbff', 1.1), x, CH - 0.015, z, false);
    // lights: fluorescent-white key from above (shadow caster), window light, hemi
    G.add(new THREE.HemisphereLight(0xf0f4ff, 0x6a6458, 0.65));
    const key = new THREE.DirectionalLight(0xf4f8ff, 1.8); key.position.set(1.5, 6, 3); key.target.position.set(0, 0.5, -1.3); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -4, right: 4, top: 4, bottom: -4, near: 0.5, far: 14 }); key.shadow.bias = -0.0006; G.add(key, key.target);
    const winL = new THREE.PointLight(0xdfeeff, 3, 6, 1.6); winL.position.set(1.7, 1.8, -2.4); G.add(winL);
    const fill = new THREE.PointLight(0xfff4e0, 3, 8, 1.6); fill.position.set(0, 2.4, 1.5); G.add(fill);
    const ud = G.userData;
    ud.stamp = stamp; ud.doc = doc.userData; ud.docGroup = doc; ud.desk = desk; ud.deskChair = deskChair; ud.inkPad = pad;
    ud.deskTop = 0.78; ud.seatY = 0.45;
    ud.deskSpot = { x: 0, z: -2.05, ry: 0 }; // behind the desk (stand, or sit with kit.sitY on the chair), facing +z
    ud.visitorSpot = { x: 0.15, z: -0.25, ry: Math.PI }; // in front of the desk, facing the regulator (-z)
    ud.observerSpots = [{ x: -2.1, z: 1.0, ry: 2.4 }, { x: -2.5, z: 1.6, ry: 2.45 }]; ud.observerSpot = ud.observerSpots[0];
    setEnvIntensity(G, 0.3); ud.envIntensity = 0.3;
    return G;
  }

  return { livingRoom, auction1990, chartOffice, moneyMountain, regulatorOffice, woodChair, officeChair, livePlane, setEnvIntensity };
}
