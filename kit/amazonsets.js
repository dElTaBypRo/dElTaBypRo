// amazonsets.js — sets for the Amazon razor video, in the same rounded clay style as charkit/propkit.
// const sets = createAmazonSets(THREE, kit, props);
// const room = sets.bedroom(); scene.add(room); room.userData.setTime(0); room.userData.setLamp(1);
// Builders: bedroom(), hqExterior(), meetingRoom(), factory(). Each returns a THREE.Group that carries its own lights
// (lights inside an invisible group are ignored by three.js, so several sets can share one scene if only one is visible).
export function createAmazonSets(THREE, kit, props) {
  const M = (c, k = 'cloth') => kit.makeMat(c, k, 'clay');
  const EM = (c, k = 1.5) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k, roughness: 0.6 });
  const BASIC = (o) => new THREE.MeshBasicMaterial({ toneMapped: false, ...o });
  const rb = kit.rbox;
  const add = (p, g, m, x = 0, y = 0, z = 0, shadow = true) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = shadow; o.receiveShadow = true; p.add(o); return o; };
  const ctex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  const FONT = 'Inter, "DejaVu Sans", Arial, sans-serif';
  const lerp = (a, b, x) => a + (b - a) * x;
  // three r160 has no scene.environmentIntensity: dim the environment per material instead (works on sets and characters)
  function setEnvIntensity(obj, k) { obj.traverse(o => { if (!o.material) return; for (const m of [].concat(o.material)) if ('envMapIntensity' in m) m.envMapIntensity = k; }); }

  // lit-window facade texture (night)
  function facadeTex(cols, rows, litP = 0.45, base = '#0c111b') {
    return ctex(cols * 16, rows * 24, (c, w, h) => { c.fillStyle = base; c.fillRect(0, 0, w, h);
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) { const lit = rnd() < litP; c.fillStyle = lit ? (rnd() < 0.7 ? '#ffd27a' : '#cfe6ff') : '#1a2232'; c.fillRect(i * 16 + 3, j * 24 + 4, 10, 15); } });
  }
  const facadeMat = (tex, k = 1.0) => new THREE.MeshStandardMaterial({ color: '#141a24', emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: k, roughness: 0.35, metalness: 0.3 });

  // shared printed cartons ("amazon" in plain lowercase letters, no logo)
  const cartonTex = ctex(256, 256, (c, w, h) => { c.fillStyle = '#c9a26b'; c.fillRect(0, 0, w, h); c.fillStyle = '#b48c58'; c.fillRect(0, h * 0.44, w, h * 0.12);
    c.fillStyle = '#1a1a1a'; c.font = `800 62px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('amazon', w / 2, h * 0.27); });
  const cartonMats = (() => { const side = M('#c9a26b'), face = new THREE.MeshStandardMaterial({ map: cartonTex, roughness: 0.9 }); return [face, face, side, side, face, face]; })();
  function carton(w = 0.6, h = 0.45, d = 0.5) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), cartonMats); m.castShadow = m.receiveShadow = true; m.position.y = h / 2; const g = new THREE.Group(); g.add(m); return g; }
  // Toño's teal FILO product box (front face printed)
  const filoTex = ctex(256, 192, (c, w, h) => { c.fillStyle = '#1fa39a'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(w * 0.12, h * 0.18, w * 0.16, h * 0.62, 12); c.fill(); c.fillRect(w * 0.1, h * 0.12, w * 0.2, h * 0.1);
    c.font = `900 64px ${FONT}`; c.textBaseline = 'middle'; c.fillText('FILO', w * 0.38, h * 0.42); c.font = `700 26px ${FONT}`; c.fillText('rasuradora pro', w * 0.38, h * 0.68); });
  const filoMats = (() => { const side = M('#1fa39a'), face = new THREE.MeshStandardMaterial({ map: filoTex, roughness: 0.8 }); return [side, side, side, side, face, face]; })();
  function filoBox(w = 0.34, h = 0.26, d = 0.2) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), filoMats); m.castShadow = m.receiveShadow = true; m.position.y = h / 2; const g = new THREE.Group(); g.add(m); return g; }

  // simple office chair, front = +z, seat top at ~0.45
  function chair(color = '#1c1c20') {
    const g = new THREE.Group(); const m = M(color, 'leather'), metal = M('#8a8f96', 'dark');
    add(g, rb(0.52, 0.08, 0.5, 0.035), m, 0, 0.41, 0);
    const back = add(g, rb(0.5, 0.62, 0.08, 0.035), m, 0, 0.8, -0.24); back.rotation.x = -0.08;
    add(g, new THREE.CylinderGeometry(0.035, 0.035, 0.3, 10), metal, 0, 0.23, 0);
    for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const leg = add(g, rb(0.3, 0.04, 0.05, 0.015), metal, Math.sin(a) * 0.15, 0.06, Math.cos(a) * 0.15); leg.rotation.y = a + Math.PI / 2; add(g, new THREE.SphereGeometry(0.03, 8, 6), M('#111', 'dark'), Math.sin(a) * 0.29, 0.03, Math.cos(a) * 0.29); }
    return g;
  }

  // ======================= 1. BEDROOM (Toño) =======================
  function bedroom() {
    const G = new THREE.Group(); G.name = 'bedroom';
    const wallM = M('#e9b98f'), trimM = M('#f4efe6', 'white'), woodM = M('#7a5034', 'leather'), wood2 = M('#a8744a');
    // floor with planks
    const floorTex = ctex(512, 512, (c, w, h) => { c.fillStyle = '#b07a4a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#a87246' : '#b9824f'; c.fillRect(0, i * 64, w, 62); c.fillStyle = '#7d5232'; c.fillRect(0, i * 64 + 62, w, 2); c.fillRect((i * 173) % w, i * 64, 2, 64); } });
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(2, 2);
    const floor = add(G, new THREE.PlaneGeometry(5, 5), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.85 }), 0, 0, 0, false); floor.rotation.x = -Math.PI / 2;
    // back wall (z=-2.5) with a window hole at x 1.2..2.3, y 0.95..2.15
    const WH = 2.8, wz = -2.56, wx0 = 1.2, wx1 = 2.3, wy0 = 0.95, wy1 = 2.15;
    add(G, new THREE.BoxGeometry(wx0 + 2.5, WH, 0.12), wallM, (-2.5 + wx0) / 2, WH / 2, wz);
    add(G, new THREE.BoxGeometry(2.5 - wx1, WH, 0.12), wallM, (wx1 + 2.5) / 2, WH / 2, wz);
    add(G, new THREE.BoxGeometry(wx1 - wx0, wy0, 0.12), wallM, (wx0 + wx1) / 2, wy0 / 2, wz);
    add(G, new THREE.BoxGeometry(wx1 - wx0, WH - wy1, 0.12), wallM, (wx0 + wx1) / 2, (wy1 + WH) / 2, wz);
    // window frame, mullion, sill, curtains
    const wcx = (wx0 + wx1) / 2, wcy = (wy0 + wy1) / 2;
    add(G, rb(wx1 - wx0 + 0.12, 0.07, 0.16, 0.02), trimM, wcx, wy0 - 0.02, -2.47); add(G, rb(wx1 - wx0 + 0.12, 0.06, 0.1, 0.02), trimM, wcx, wy1 + 0.02, -2.5);
    for (const x of [wx0 - 0.03, wx1 + 0.03]) add(G, rb(0.06, wy1 - wy0 + 0.1, 0.1, 0.02), trimM, x, wcy, -2.5);
    add(G, new THREE.BoxGeometry(0.035, wy1 - wy0, 0.05), trimM, wcx, wcy, -2.52); add(G, new THREE.BoxGeometry(wx1 - wx0, 0.035, 0.05), trimM, wcx, wcy, -2.52);
    const curtM = M('#2f7f78');
    for (const s of [-1, 1]) { const ct = add(G, rb(0.3, 1.55, 0.08, 0.04), curtM, wcx + s * ((wx1 - wx0) / 2 + 0.12), wcy - 0.05, -2.42); ct.scale.x = 1; }
    add(G, new THREE.CylinderGeometry(0.015, 0.015, wx1 - wx0 + 0.8, 8), M('#333', 'dark'), wcx, wy1 + 0.12, -2.42).rotation.z = Math.PI / 2;
    // sky planes outside the window (night / morning crossfade)
    const skyline = (c, w, h, col, litCol) => { // Mexican rooftops with water tanks (tinacos)
      let x = 0; let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
      while (x < w) { const bw = 60 + r() * 90, bh = 80 + r() * 140; c.fillStyle = col; c.fillRect(x, h - bh, bw, bh);
        if (r() < 0.7) { c.fillRect(x + bw * 0.2, h - bh - 26, 34, 26); c.beginPath(); c.ellipse(x + bw * 0.2 + 17, h - bh - 26, 17, 6, 0, 0, 7); c.fill(); }
        if (litCol) for (let i = 0; i < 4; i++) if (r() < 0.45) { c.fillStyle = litCol; c.fillRect(x + 10 + r() * (bw - 30), h - bh + 20 + r() * (bh - 50), 14, 18); c.fillStyle = col; }
        x += bw + 4; } };
    const nightTex = ctex(1024, 683, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#060a22'); g.addColorStop(0.6, '#18245a'); g.addColorStop(1, '#3d3a6e'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      let s = 3; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + r() * 0.7})`; c.fillRect(r() * w, r() * h * 0.6, 2, 2); }
      const mg = c.createRadialGradient(w * 0.62, h * 0.3, 10, w * 0.62, h * 0.3, 120); mg.addColorStop(0, 'rgba(255,250,220,0.55)'); mg.addColorStop(1, 'rgba(255,250,220,0)'); c.fillStyle = mg; c.fillRect(0, 0, w, h);
      c.fillStyle = '#fff8dc'; c.beginPath(); c.arc(w * 0.62, h * 0.3, 46, 0, 7); c.fill(); c.fillStyle = '#e8dfba'; c.beginPath(); c.arc(w * 0.6, h * 0.29, 9, 0, 7); c.arc(w * 0.64, h * 0.33, 6, 0, 7); c.fill();
      skyline(c, w, h, '#0d1026', '#ffcf6a'); });
    const dayTex = ctex(1024, 683, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#6fa8e0'); g.addColorStop(0.55, '#ffd9a0'); g.addColorStop(1, '#ffad6a'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      const sg = c.createRadialGradient(w * 0.45, h * 0.62, 10, w * 0.45, h * 0.62, 220); sg.addColorStop(0, 'rgba(255,240,180,0.95)'); sg.addColorStop(1, 'rgba(255,240,180,0)'); c.fillStyle = sg; c.fillRect(0, 0, w, h);
      c.fillStyle = '#fff3c4'; c.beginPath(); c.arc(w * 0.45, h * 0.62, 50, 0, 7); c.fill(); skyline(c, w, h, '#b07a62', null); });
    const skyN = add(G, new THREE.PlaneGeometry(4.5, 3), BASIC({ map: nightTex }), wcx, 1.5, -3.6, false);
    const skyD = add(G, new THREE.PlaneGeometry(4.5, 3), BASIC({ map: dayTex, transparent: true, opacity: 0 }), wcx, 1.5, -3.58, false);
    skyN.receiveShadow = skyD.receiveShadow = false;
    // left wall (x=-2.5) with the dream-truck poster
    add(G, new THREE.BoxGeometry(0.12, WH, 5), wallM, -2.56, WH / 2, 0);
    add(G, new THREE.BoxGeometry(0.04, 0.12, 5), trimM, -2.48, 0.06, 0); add(G, new THREE.BoxGeometry(5, 0.12, 0.04), trimM, 0, 0.06, -2.48);
    const posterTex = ctex(512, 360, (c, w, h) => { c.fillStyle = '#fff6e0'; c.fillRect(0, 0, w, h); const g = c.createLinearGradient(0, 0, 0, h * 0.75); g.addColorStop(0, '#ffb35c'); g.addColorStop(1, '#ffe2b0'); c.fillStyle = g; c.fillRect(16, 16, w - 32, h * 0.72);
      c.fillStyle = '#c0392b'; c.beginPath(); c.roundRect(70, 120, 250, 90, 18); c.fill(); c.beginPath(); c.roundRect(300, 150, 150, 60, 10); c.fill(); c.fillStyle = '#9b2c20'; c.beginPath(); c.roundRect(110, 70, 150, 70, 16); c.fill();
      c.fillStyle = '#bfe6ff'; c.fillRect(130, 84, 50, 42); c.fillRect(190, 84, 55, 42); c.fillStyle = '#222'; for (const x of [140, 380]) { c.beginPath(); c.arc(x, 215, 38, 0, 7); c.fill(); } c.fillStyle = '#bbb'; for (const x of [140, 380]) { c.beginPath(); c.arc(x, 215, 16, 0, 7); c.fill(); }
      c.fillStyle = '#c0392b'; c.font = `900 58px ${FONT}`; c.textAlign = 'center'; c.fillText('MI TROCA', w / 2, h - 30); });
    add(G, rb(0.04, 0.8, 1.1, 0.01), M('#2a1d14', 'leather'), -2.49, 1.7, -0.65);
    const poster = add(G, new THREE.PlaneGeometry(1.02, 0.72), new THREE.MeshStandardMaterial({ map: posterTex, roughness: 0.7 }), -2.465, 1.7, -0.65, false); poster.rotation.y = Math.PI / 2;
    // bed: head against the back wall, mattress top 0.55, 2.4 long (the characters are ~2.07 units head-to-toe)
    const BL = 2.4, bed = new THREE.Group(); bed.position.set(0.4, 0, -2.42 + BL / 2 + 0.02); G.add(bed);
    add(bed, rb(1.2, 0.3, BL, 0.05), woodM, 0, 0.17, 0);
    add(bed, rb(1.28, 1.05, 0.1, 0.04), woodM, 0, 0.52, -BL / 2 - 0.01);
    add(bed, rb(1.28, 0.5, 0.08, 0.04), woodM, 0, 0.27, BL / 2 + 0.01);
    add(bed, rb(1.12, 0.2, BL - 0.08, 0.08), M('#f2efe8', 'white'), 0, 0.42, 0);
    add(bed, rb(0.62, 0.14, 0.34, 0.07), M('#ffffff', 'white'), 0, 0.6, -BL / 2 + 0.36);
    const quiltM = M('#3a6ab0');
    const QZ0 = -BL / 2 + 0.92, QZ1 = BL / 2 - 0.02; // quilt from the chest of a lying character to the foot end
    const quilt = add(bed, rb(1.18, 0.1, QZ1 - QZ0, 0.05), quiltM, 0, 0.6, (QZ0 + QZ1) / 2);
    const fold = add(bed, rb(1.19, 0.03, 0.22, 0.012), M('#f2efe8', 'white'), 0, 0.66, QZ0 + 0.08);
    const feet = add(bed, rb(0.62, 0.3, 0.42, 0.14), quiltM, 0, 0.9, BL / 2 - 0.3); feet.visible = false;
    // nightstand + lamp
    const ns = new THREE.Group(); ns.position.set(-0.6, 0, -2.18); G.add(ns);
    add(ns, rb(0.5, 0.55, 0.42, 0.04), wood2, 0, 0.275, 0); add(ns, rb(0.44, 0.02, 0.02, 0.008), M('#5a3a22', 'dark'), 0, 0.38, 0.215); add(ns, new THREE.SphereGeometry(0.02, 8, 6), M('#d9b14a', 'leather'), 0, 0.33, 0.22);
    add(ns, new THREE.CylinderGeometry(0.08, 0.1, 0.05, 20), M('#2a2a2a', 'dark'), 0.08, 0.575, -0.04); add(ns, new THREE.CylinderGeometry(0.014, 0.014, 0.32, 8), M('#d9b14a', 'leather'), 0.08, 0.75, -0.04);
    const shadeM = new THREE.MeshStandardMaterial({ color: '#f6e2b8', emissive: '#ffb45e', emissiveIntensity: 1.2, roughness: 0.8, side: THREE.DoubleSide });
    const shade = add(ns, new THREE.CylinderGeometry(0.1, 0.17, 0.2, 24, 1, true), shadeM, 0.08, 0.95, -0.04, false);
    const bulb = add(ns, new THREE.SphereGeometry(0.04, 12, 8), BASIC({ color: '#fff1c8' }), 0.08, 0.9, -0.04, false);
    const lamp = new THREE.PointLight(0xffb067, 4, 8, 1.6); lamp.position.set(-0.52, 0.92, -2.2); G.add(lamp);
    // charger + phone dock on the nightstand
    add(ns, rb(0.08, 0.012, 0.15, 0.006), M('#1c1e22', 'leather'), -0.12, 0.556, 0.05);
    // desk + laptop (left wall)
    const desk = new THREE.Group(); desk.position.set(-2.15, 0, -0.65); G.add(desk);
    add(desk, rb(0.62, 0.05, 1.3, 0.02), wood2, 0, 0.75, 0); for (const z of [-0.6, 0.6]) add(desk, rb(0.56, 0.72, 0.05, 0.02), wood2, 0, 0.37, z);
    add(desk, rb(0.32, 0.018, 0.44, 0.01), M('#3a3d42', 'dark'), 0.05, 0.785, 0);
    const laptop = props.monitor(0.42, 0.27, { frame: '#3a3d42', res: 512 }); laptop.rotation.order = 'YXZ'; laptop.rotation.set(-0.22, Math.PI / 2, 0); laptop.position.set(-0.12, 0.93, 0); laptop.scale.z = 0.4; desk.add(laptop);
    const dchair = chair('#c0392b'); dchair.position.set(-1.55, 0, -0.65); dchair.rotation.y = -Math.PI / 2 - 0.4; G.add(dchair);
    // inventory: stacks of teal FILO boxes (front-left corner)
    const stacks = new THREE.Group(); stacks.position.set(-1.85, 0, 1.05); G.add(stacks);
    [[0, 0, 4], [0.36, 0.02, 3], [0.72, -0.01, 2], [0.1, 0.24, 3], [0.46, 0.25, 2]].forEach(([x, z, n], k) => { for (let i = 0; i < n; i++) { const b = filoBox(); b.position.set(x, i * 0.26, z); b.rotation.y = (rnd() - 0.5) * 0.12 + (k > 2 ? 0.0 : 0); stacks.add(b); } });
    const shipping = carton(0.55, 0.4, 0.45); shipping.position.set(-1.0, 0, 1.75); shipping.rotation.y = 0.3; G.add(shipping); shipping.children[0].material = [M('#c9a26b'), M('#c9a26b'), M('#c9a26b'), M('#c9a26b'), M('#c9a26b'), M('#c9a26b')];
    // rug, plant
    const rug = add(G, new THREE.CircleGeometry(0.95, 40), M('#c0392b'), 0.9, 0.006, 0.65, false); rug.rotation.x = -Math.PI / 2; rug.scale.set(1.25, 0.85, 1);
    const rug2 = add(G, new THREE.RingGeometry(0.62, 0.72, 40), M('#ffcf3a'), 0.9, 0.008, 0.65, false); rug2.rotation.x = -Math.PI / 2; rug2.scale.set(1.25, 0.85, 1);
    add(G, new THREE.CylinderGeometry(0.16, 0.12, 0.3, 16), M('#c8643a'), 2.15, 0.15, -2.15); for (let i = 0; i < 6; i++) { const lf = add(G, new THREE.SphereGeometry(0.14, 12, 8), M('#4f9a45'), 2.15 + Math.sin(i) * 0.12, 0.42 + (i % 3) * 0.1, -2.15 + Math.cos(i * 1.7) * 0.1); lf.scale.set(0.7, 1.3, 0.7); }
    // lights
    const hemi = new THREE.HemisphereLight(0x8fa4e0, 0x3a2a24, 0.2); G.add(hemi);
    const win = new THREE.DirectionalLight(0x8fa8ff, 1.0); win.position.set(3.25, 4.05, -6.5); win.target.position.set(1.2, 0, -0.5); G.add(win, win.target);
    win.castShadow = true; win.shadow.mapSize.set(2048, 2048); Object.assign(win.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 0.5, far: 16 }); win.shadow.bias = -0.0005;
    const fill = new THREE.PointLight(0x6a7cc0, 0.6, 9, 1.5); fill.position.set(1.0, 2.4, 2.4); G.add(fill);
    const ud = G.userData;
    ud.laptop = laptop; ud.quilt = quilt; ud.lampLight = lamp; ud.sunLight = win; ud.hemi = hemi;
    ud.bedAnchor = { x: 0.4, y: 0.74, z: -0.25 }; // lying character root (rotation.x = -PI/2): feet toward +z, head on the pillow
    ud.pillow = { x: 0.4, y: 0.6, z: -2.04 };
    ud.standSpot = { x: 1.35, z: -0.55, ry: -0.5 }; // beside the bed, in the window light
    ud.roomCenter = { x: 0.9, z: 0.6 };
    ud.deskSpot = { x: -1.55, z: -0.65, ry: -Math.PI / 2 };
    ud.lampPos = { x: -0.52, y: 0.92, z: -2.22 };
    ud.window = { x: wcx, y: wcy, z: -2.5 };
    ud.setQuilt = (k) => { quilt.scale.y = lerp(1, 4.3, k); quilt.position.y = lerp(0.6, 0.765, k); fold.position.y = lerp(0.66, 0.985, k); feet.visible = k > 0.5; feet.position.y = lerp(0.7, 1.02, k); };
    ud.setLamp = (on) => { lamp.intensity = 4 * on; shadeM.emissiveIntensity = 0.05 + 1.15 * on; bulb.visible = on > 0.5; };
    ud.setTime = (k) => { skyD.material.opacity = k; hemi.color.setRGB(lerp(0.56, 1.0, k), lerp(0.64, 0.92, k), lerp(0.88, 0.78, k)); hemi.intensity = lerp(0.2, 0.55, k);
      win.color.setRGB(lerp(0.56, 1.0, k), lerp(0.66, 0.8, k), lerp(1.0, 0.55, k)); win.intensity = lerp(1.0, 3.4, k); fill.intensity = lerp(0.6, 0.9, k); fill.color.setRGB(lerp(0.42, 1.0, k), lerp(0.49, 0.85, k), lerp(0.75, 0.7, k)); };
    ud.setQuilt(0); ud.setLamp(1); ud.setTime(0); setEnvIntensity(G, 0.12); ud.envIntensity = 0.12;
    return G;
  }

  // ======================= 2. HQ EXTERIOR (night) =======================
  function hqExterior() {
    const G = new THREE.Group(); G.name = 'hqExterior';
    const ground = add(G, new THREE.PlaneGeometry(220, 220), M('#22262e'), 0, 0, 0, false); ground.rotation.x = -Math.PI / 2;
    const road = add(G, new THREE.PlaneGeometry(220, 10), M('#30343c'), 0, 0.01, 22, false); road.rotation.x = -Math.PI / 2;
    for (let i = -10; i <= 10; i++) { const l = add(G, new THREE.PlaneGeometry(3, 0.25), EM('#e8d27a', 0.25), i * 10, 0.02, 22, false); l.rotation.x = -Math.PI / 2; }
    const walk = add(G, rb(220, 0.2, 5, 0.05), M('#5a5e66'), 0, 0.1, 14.5, false);
    // sky dome with stars and a moon
    const skyTex = ctex(1024, 512, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#04071a'); g.addColorStop(0.55, '#0f1a44'); g.addColorStop(0.75, '#2a2f5e'); g.addColorStop(1, '#3a3050'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 400; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.7})`; c.fillRect(rnd() * w, rnd() * h * 0.55, 1.5, 1.5); } });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(180, 32, 16), BASIC({ map: skyTex, side: THREE.BackSide, fog: false })); G.add(sky);
    const moon = add(G, new THREE.CircleGeometry(5, 32), BASIC({ color: '#fff6d8', fog: false }), -60, 90, -130, false); moon.lookAt(0, 0, 0);
    // the tower: 10 x 36 x 10 dark glass with lit windows
    const TW = 10, TH = 36;
    const tf = facadeMat(facadeTex(20, 54, 0.42), 1.1), ts = facadeMat(facadeTex(20, 54, 0.32), 1.0), top = M('#1a1f28', 'dark');
    const tower = new THREE.Mesh(new THREE.BoxGeometry(TW, TH, TW), [ts, ts, top, top, tf, tf]); tower.position.y = TH / 2; G.add(tower);
    // vertical fins + crown
    for (let i = -2; i <= 2; i++) add(G, new THREE.BoxGeometry(0.12, TH, 0.3), M('#2a3240', 'dark'), i * 2.5, TH / 2, TW / 2 + 0.1, false);
    add(G, rb(TW + 0.6, 0.6, TW + 0.6, 0.1), M('#2a3240', 'dark'), 0, TH + 0.3, 0, false);
    // lit meeting-room floor near the top (front face)
    const roomTex = ctex(512, 96, (c, w, h) => { c.fillStyle = '#ffd9a0'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffeccc'; for (let i = 0; i < 6; i++) c.fillRect(20 + i * 82, 6, 60, 10); c.fillStyle = 'rgba(40,30,30,0.85)'; c.fillRect(150, 46, 200, 22); for (let i = 0; i < 5; i++) { c.beginPath(); c.arc(170 + i * 42, 44, 12, 0, 7); c.fill(); } c.fillStyle = '#3a6ab0'; c.fillRect(380, 14, 110, 60); });
    const room = add(G, new THREE.PlaneGeometry(8.6, 1.6), BASIC({ map: roomTex }), 0, TH - 3.2, TW / 2 + 0.02, false);
    const roomGlow = new THREE.PointLight(0xffc27a, 30, 18, 2); roomGlow.position.set(0, TH - 3.2, TW / 2 + 2); G.add(roomGlow);
    // plain lowercase letters on the roof (no logo)
    const signTex = ctex(1024, 256, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.font = `800 190px ${FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('amazon', w / 2, h * 0.52); });
    const sign = add(G, new THREE.PlaneGeometry(9, 2.25), BASIC({ map: signTex, transparent: true }), 0, TH + 1.9, TW / 2 - 0.6, false);
    const signBack = add(G, new THREE.BoxGeometry(8.4, 0.25, 0.25), M('#3a414c', 'dark'), 0, TH + 0.75, TW / 2 - 0.75, false);
    for (const x of [-3.2, 0, 3.2]) add(G, new THREE.BoxGeometry(0.15, 1.6, 0.15), M('#3a414c', 'dark'), x, TH + 1.4, TW / 2 - 0.75, false);
    const signGlow = new THREE.PointLight(0xffffff, 20, 12, 2); signGlow.position.set(0, TH + 2, TW / 2 + 1.5); G.add(signGlow);
    // three glass domes ("the spheres") at the base, front-left
    const glassM = new THREE.MeshStandardMaterial({ color: '#9fd8c8', emissive: '#3a8a6a', emissiveIntensity: 0.35, transparent: true, opacity: 0.35, roughness: 0.15, depthWrite: false });
    const lineM = new THREE.LineBasicMaterial({ color: '#d8f2e8', transparent: true, opacity: 0.75 });
    [[-9, 9, 4.2], [-3.2, 11.2, 3.3], [1.8, 10.4, 2.6]].forEach(([x, z, r]) => {
      add(G, new THREE.SphereGeometry(r, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), glassM, x, 0, z, false);
      const ln = new THREE.LineSegments(new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(r * 1.002, 3)), lineM); ln.position.set(x, 0, z); G.add(ln);
      for (let i = 0; i < 7; i++) { const p = add(G, new THREE.SphereGeometry(r * (0.18 + rnd() * 0.15), 12, 8), EM('#3f9a55', 0.35), x + (rnd() - 0.5) * r, r * 0.2 + rnd() * r * 0.35, z + (rnd() - 0.5) * r, false); p.scale.y = 1.3; }
      const pl = new THREE.PointLight(0x7fe0a0, 12, r * 3, 2); pl.position.set(x, r * 0.5, z); G.add(pl);
    });
    // neighbour buildings
    for (let i = 0; i < 18; i++) {
      const side = i % 2 ? 1 : -1; const bw = 6 + rnd() * 6, bh = 8 + rnd() * 20, bd = 6 + rnd() * 6;
      const x = side * (14 + rnd() * 34), z = -30 + rnd() * 34; if (Math.abs(x) < 12 && z > -12) continue;
      const fm = facadeMat(facadeTex(Math.round(bw * 1.6), Math.round(bh * 1.5), 0.3), 0.8);
      const b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), [fm, fm, M('#1a1e26', 'dark'), M('#1a1e26', 'dark'), fm, fm]); b.position.set(x, bh / 2, z); G.add(b);
    }
    // street lights along the sidewalk
    for (let i = -6; i <= 6; i++) { const x = i * 7; add(G, new THREE.CylinderGeometry(0.08, 0.1, 4.5, 8), M('#3a3f48', 'dark'), x, 2.25, 16.5, false); add(G, rb(0.9, 0.12, 0.3, 0.04), M('#3a3f48', 'dark'), x + 0.35, 4.5, 16.5, false); add(G, new THREE.SphereGeometry(0.16, 10, 8), BASIC({ color: '#ffe0a0' }), x + 0.55, 4.38, 16.5, false); }
    for (const x of [-14, 0, 14]) { const sl = new THREE.PointLight(0xffd090, 18, 14, 2); sl.position.set(x + 0.55, 4.2, 16.5); G.add(sl); }
    // lights
    G.add(new THREE.HemisphereLight(0x5a6aa8, 0x1a1a22, 0.35));
    const moonL = new THREE.DirectionalLight(0x9fb0ff, 0.9); moonL.position.set(-40, 60, 40); G.add(moonL);
    G.userData.topFloor = { x: 0, y: TH - 3.2, z: TW / 2 }; // lit meeting-room window on the front face
    G.userData.sign = { x: 0, y: TH + 1.9, z: TW / 2 - 0.6 };
    G.userData.towerHeight = TH; setEnvIntensity(G, 0.1); G.userData.envIntensity = 0.1;
    return G;
  }

  // ======================= 3. MEETING ROOM =======================
  function meetingRoom() {
    const G = new THREE.Group(); G.name = 'meetingRoom';
    const CH = 3.3;
    const floor = add(G, new THREE.PlaneGeometry(6.2, 9), new THREE.MeshStandardMaterial({ color: '#2e2a27', roughness: 0.55, metalness: 0.05 }), 0, 0, -0.3, false); floor.rotation.x = -Math.PI / 2;
    const rug = add(G, new THREE.PlaneGeometry(3.0, 5.4), M('#3a3f4a'), 0, 0.005, -0.3, false); rug.rotation.x = -Math.PI / 2;
    // back wall + big screen
    add(G, new THREE.BoxGeometry(6.2, CH, 0.12), M('#2a2d33'), 0, CH / 2, -3.86);
    const screen = props.monitor(3.2, 1.8, { frame: '#0c0d10', res: 1280 }); screen.position.set(0, 2.05, -3.77); G.add(screen);
    const screenGlow = new THREE.PointLight(0x7fb0ff, 3, 6, 2); screenGlow.position.set(0, 2.0, -3.0); G.add(screenGlow);
    // left wall: wood panels + sconces
    const panelM = M('#4a3222', 'leather');
    add(G, new THREE.BoxGeometry(0.12, CH, 8.2), M('#2a2d33'), -3.1, CH / 2, -0.3);
    for (let i = 0; i < 7; i++) add(G, rb(0.05, CH - 0.4, 1.08, 0.02), panelM, -3.02, CH / 2, -3.4 + i * 1.12);
    for (const z of [-2.2, 1.0]) { add(G, rb(0.08, 0.35, 0.16, 0.03), EM('#ffcf8a', 1.4), -2.96, 2.1, z, false); const sl = new THREE.PointLight(0xffbf7a, 2.2, 4.5, 2); sl.position.set(-2.7, 2.1, z); G.add(sl); }
    // right side: floor-to-ceiling window wall with a night skyline
    const mull = M('#15171b', 'dark');
    for (let i = 0; i <= 8; i++) add(G, new THREE.BoxGeometry(0.08, CH, 0.08), mull, 3.1, CH / 2, -3.8 + i * 1.0);
    add(G, new THREE.BoxGeometry(0.1, 0.1, 8.2), mull, 3.1, 0.05, -0.3); add(G, new THREE.BoxGeometry(0.1, 0.1, 8.2), mull, 3.1, CH - 0.05, -0.3);
    const glass = add(G, new THREE.PlaneGeometry(8.2, CH), new THREE.MeshStandardMaterial({ color: '#8fb0d8', transparent: true, opacity: 0.08, roughness: 0.05, depthWrite: false }), 3.1, CH / 2, -0.3, false); glass.rotation.y = -Math.PI / 2;
    const skyTex = ctex(2048, 1024, (c, w, h) => { const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#050816'); g.addColorStop(0.55, '#14204a'); g.addColorStop(1, '#3a3060'); c.fillStyle = g; c.fillRect(0, 0, w, h);
      for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.6})`; c.fillRect(rnd() * w, rnd() * h * 0.4, 2, 2); }
      for (const [col, lo, hi, lit] of [['#141a2c', 0.35, 0.75, 0.25], ['#0b0f1c', 0.5, 0.95, 0.45]]) { let x = 0; while (x < w) { const bw = 50 + rnd() * 110, bh = h * (lo + rnd() * (hi - lo)) * 0.6; c.fillStyle = col; c.fillRect(x, h - bh, bw, bh);
        for (let yy = h - bh + 10; yy < h - 8; yy += 18) for (let xx = x + 6; xx < x + bw - 10; xx += 14) if (rnd() < lit) { c.fillStyle = rnd() < 0.75 ? '#ffd27a' : '#cfe6ff'; c.fillRect(xx, yy, 7, 10); } x += bw + 6; } } });
    const sky = add(G, new THREE.PlaneGeometry(36, 18), BASIC({ map: skyTex, fog: false }), 13, 4.5, -0.3, false); sky.rotation.y = -Math.PI / 2;
    // ceiling with light strips
    add(G, new THREE.BoxGeometry(6.2, 0.1, 8.2), M('#1d1f24'), 0, CH + 0.05, -0.3, false);
    for (const x of [-0.6, 0.6]) add(G, new THREE.BoxGeometry(0.06, 0.02, 3.6), BASIC({ color: '#8a7e6a' }), x, CH - 0.01, -0.2, false);
    // pendant lamps over the table
    for (const z of [-2.6, -1.4, -0.2, 1.0, 2.2]) for (const x of [-1.9, 1.9]) add(G, new THREE.CircleGeometry(0.12, 20), BASIC({ color: '#ffe8c8' }), x, CH - 0.005, z, false).rotation.x = Math.PI / 2;
    // key light (one shadow caster) over the table
    const key = new THREE.SpotLight(0xffe2c0, 60, 9, 0.85, 0.6, 1.6); key.position.set(0.4, CH - 0.1, -0.4); key.target.position.set(0, 0.7, -0.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005; G.add(key, key.target);
    G.add(new THREE.HemisphereLight(0xb0bce0, 0x2a2220, 0.35));
    const warm = new THREE.PointLight(0xffc890, 4, 7, 1.8); warm.position.set(0, 2.4, 1.8); G.add(warm);
    // table: top 0.78, head end edge at z=-2.0, foot at z=1.6
    const woodM = M('#3b2618', 'leather');
    add(G, rb(1.5, 0.06, 3.6, 0.025), woodM, 0, 0.75, -0.2);
    add(G, rb(1.52, 0.012, 3.62, 0.006), M('#24170e', 'dark'), 0, 0.716, -0.2);
    for (const z of [-1.2, 0.8]) add(G, rb(0.6, 0.72, 0.4, 0.04), M('#1f1612', 'leather'), 0, 0.36, z);
    // chairs (two per side) facing the table
    const seats = [{ x: -1.0, z: -1.2, ry: Math.PI / 2 }, { x: 1.0, z: -1.2, ry: -Math.PI / 2 }, { x: -1.0, z: 0.2, ry: Math.PI / 2 }, { x: 1.0, z: 0.2, ry: -Math.PI / 2 }];
    const chairs = seats.map(s => { const c = chair(); c.position.set(s.x, 0, s.z); c.rotation.y = s.ry; G.add(c); return c; });
    // mugs, notepads, the boss's "DÍA 1" mug
    const mugs = [];
    for (const s of seats) { const m = props.mug('#f2f2f2'); m.scale.setScalar(1.6); m.position.set(Math.sign(s.x) * 0.5, 0.78, s.z + 0.28); G.add(m); mugs.push(m);
      const pad = add(G, rb(0.22, 0.012, 0.3, 0.004), M('#f4f1e8', 'white'), Math.sign(s.x) * 0.45, 0.787, s.z - 0.1); pad.rotation.y = (rnd() - 0.5) * 0.3; }
    const bossMug = props.mug('#ffffff', 'DÍA 1'); bossMug.scale.setScalar(1.6); bossMug.position.set(0.45, 0.78, -1.82); bossMug.rotation.y = -0.6; G.add(bossMug);
    // plant
    add(G, new THREE.CylinderGeometry(0.22, 0.18, 0.5, 16), M('#2a2a2e', 'dark'), -2.6, 0.25, -3.35); for (let i = 0; i < 8; i++) { const lf = add(G, new THREE.SphereGeometry(0.2, 12, 8), M('#3f8a45'), -2.6 + Math.sin(i * 2.1) * 0.2, 0.7 + (i % 4) * 0.18, -3.35 + Math.cos(i * 2.1) * 0.18); lf.scale.set(0.6, 1.4, 0.6); }
    const ud = G.userData;
    ud.screen = screen; ud.seats = seats; ud.chairs = chairs; ud.mugs = mugs; ud.bossMug = bossMug; ud.key = key;
    ud.bossSpot = { x: 0, z: -2.4, ry: 0 }; // Bezos stands here facing +z; lean pose fists land on the table top
    ud.tableTop = 0.78; ud.tableHeadZ = -2.0; ud.tableFootZ = 1.6; ud.screenPos = { x: 0, y: 2.05, z: -3.75 }; setEnvIntensity(G, 0.3); ud.envIntensity = 0.3;
    return G;
  }

  // ======================= 4. FACTORY / WAREHOUSE =======================
  function factory() {
    const G = new THREE.Group(); G.name = 'factory';
    const floor = add(G, new THREE.PlaneGeometry(32, 30), M('#7a7d80'), 0, 0, 1, false); floor.rotation.x = -Math.PI / 2;
    // safety lines
    for (const z of [-9.2, -5.2, -1.6, 1.9]) { const l = add(G, new THREE.PlaneGeometry(20, 0.12), M('#f2c230'), 0, 0.01, z, false); l.rotation.x = -Math.PI / 2; }
    // corrugated walls
    const corr = ctex(256, 256, (c, w, h) => { for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#4d5966' : '#56626f'; c.fillRect(i * 16, 0, 16, h); } }); corr.wrapS = corr.wrapT = THREE.RepeatWrapping; corr.repeat.set(8, 1);
    const wallM = new THREE.MeshStandardMaterial({ map: corr, roughness: 0.8, metalness: 0.2 });
    add(G, new THREE.BoxGeometry(32, 12, 0.3), wallM, 0, 6, -12.2);
    const corr2 = corr.clone(); corr2.needsUpdate = true; corr2.repeat.set(8, 1);
    for (const s of [-1, 1]) { const w = add(G, new THREE.BoxGeometry(0.3, 12, 30), new THREE.MeshStandardMaterial({ map: corr2, roughness: 0.8, metalness: 0.2 }), s * 16, 6, 1); }
    // roof trusses + high-bay lamps
    const steel = M('#3a3f46', 'dark');
    for (let i = 0; i < 6; i++) { const z = -10 + i * 4; add(G, new THREE.BoxGeometry(32, 0.3, 0.25), steel, 0, 11.4, z, false);
      for (const x of [-8, 0, 8]) { add(G, new THREE.CylinderGeometry(0.02, 0.02, 1.2, 6), steel, x, 10.7, z, false); add(G, new THREE.CylinderGeometry(0.35, 0.55, 0.35, 20, 1, true), M('#2a2e34', 'dark'), x, 10.0, z, false); add(G, new THREE.CircleGeometry(0.5, 20), BASIC({ color: '#eaf4ff' }), x, 9.83, z, false).rotation.x = Math.PI / 2; } }
    // ---- wall of 12 screens + giant counter ----
    const screens = [];
    const cols = [-4.65, -1.55, 1.55, 4.65], rows = [3.0, 4.9, 6.8];
    for (const y of rows) for (const x of cols) { const m = props.monitor(2.8, 1.6, { frame: '#101114', res: 512 }); m.position.set(x, y, -11.95); G.add(m); screens.push(m); }
    add(G, rb(13.2, 6.0, 0.15, 0.05), M('#1a1c20', 'dark'), 0, 4.9, -12.05);
    const counter = props.monitor(9.2, 1.9, { frame: '#101114', res: 1536 }); counter.position.set(0, 9.0, -11.95); G.add(counter);
    const scrGlow = new THREE.PointLight(0x9fc8ff, 25, 16, 2); scrGlow.position.set(0, 5.5, -9); G.add(scrGlow);
    // ---- conveyor belts along x ----
    const beltTex = ctex(128, 64, (c, w, h) => { c.fillStyle = '#1c1d20'; c.fillRect(0, 0, w, h); c.fillStyle = '#2c2e33'; for (let i = 0; i < 4; i++) c.fillRect(i * 32, 0, 12, h); });
    beltTex.wrapS = beltTex.wrapT = THREE.RepeatWrapping; beltTex.repeat.set(18, 1);
    const L = 18, X0 = -9, V = 1.5, belts = [];
    const BZ = [-7.2, -3.5, 0.2];
    BZ.forEach((z, bi) => {
      const b = new THREE.Group(); b.position.z = z; G.add(b);
      add(b, rb(L, 0.22, 1.2, 0.05), M('#4a5058', 'dark'), 0, 0.82, 0);
      const bt = beltTex.clone(); bt.needsUpdate = true; add(b, new THREE.BoxGeometry(L, 0.04, 1.0), new THREE.MeshStandardMaterial({ map: bt, roughness: 0.9 }), 0, 0.95, 0);
      for (const s of [-1, 1]) add(b, rb(L, 0.1, 0.06, 0.02), M('#f2c230'), 0, 1.0, s * 0.56);
      for (let i = 0; i <= 9; i++) for (const s of [-1, 1]) add(b, new THREE.BoxGeometry(0.1, 0.72, 0.1), steel, X0 + i * 2, 0.36, s * 0.45);
      for (const s of [-1, 1]) add(b, new THREE.CylinderGeometry(0.13, 0.13, 1.2, 16), M('#6a7078', 'dark'), s * (L / 2), 0.86, 0).rotation.x = Math.PI / 2;
      // items: razors (belt 0), product boxes (belt 1), cartons (belt 2)
      const items = [];
      for (let i = 0; i < 9; i++) { let it;
        if (bi === 0) { it = props.razor({ body: '#232f3e', grip: '#111317', accent: '#ff9900' }); it.scale.setScalar(2.3); }
        else if (bi === 1) { it = props.box(0.42, 0.3, 0.26, '#232f3e', (c, w, h) => { c.fillStyle = '#232f3e'; c.fillRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.font = `800 44px ${FONT}`; c.textAlign = 'center'; c.fillText('amazon', w / 2, h * 0.42); c.fillStyle = '#ff9900'; c.font = `800 30px ${FONT}`; c.fillText('básicos', w / 2, h * 0.72); }); }
        else it = carton(0.62, 0.42, 0.5);
        it.position.set(0, 0.97, 0); b.add(it); items.push(it); }
      belts.push({ group: b, items, tex: bt });
    });
    // ---- orange robot arms behind each belt ----
    const orange = M('#e8742a', 'leather'), dark = M('#2a2c30', 'dark');
    const robots = [];
    BZ.forEach((z, bi) => { for (const x of [-4.5, 3.0]) {
      const base = new THREE.Group(); base.position.set(x + bi * 0.7, 0, z - 1.45); base.scale.setScalar(1.3); G.add(base);
      add(base, new THREE.CylinderGeometry(0.4, 0.46, 0.3, 24), dark, 0, 0.15, 0);
      const turret = new THREE.Group(); turret.position.y = 0.3; base.add(turret);
      add(turret, new THREE.CylinderGeometry(0.3, 0.34, 0.35, 20), orange, 0, 0.17, 0);
      const sh = new THREE.Group(); sh.position.y = 0.45; turret.add(sh);
      add(sh, new THREE.SphereGeometry(0.2, 16, 12), dark);
      add(sh, rb(0.2, 1.25, 0.22, 0.07), orange, 0, 0.62, 0);
      const el = new THREE.Group(); el.position.y = 1.25; sh.add(el);
      add(el, new THREE.SphereGeometry(0.15, 14, 10), dark);
      add(el, rb(0.16, 1.05, 0.17, 0.06), orange, 0, 0.52, 0);
      const wr = new THREE.Group(); wr.position.y = 1.05; el.add(wr);
      add(wr, new THREE.CylinderGeometry(0.1, 0.1, 0.16, 14), dark, 0, 0.05, 0);
      add(wr, rb(0.28, 0.1, 0.22, 0.03), M('#c8ccd2', 'dark'), 0, 0.17, 0);
      for (const s of [-1, 1]) add(wr, rb(0.05, 0.2, 0.12, 0.02), M('#c8ccd2', 'dark'), s * 0.11, 0.3, 0);
      robots.push({ turret, sh, el, wr, ph: bi * 1.3 + (x > 0 ? 0.7 : 0) });
    } });
    for (const [x, z] of [[-4, -5], [4, -1.6], [-2, 1.8]]) { const accent = new THREE.PointLight(0xff8a3a, 10, 8, 2); accent.position.set(x, 3, z); G.add(accent); }
    // ---- pallets of cartons ----
    const pallet = (x, z, nx, nz, ny) => { const p = new THREE.Group(); p.position.set(x, 0, z); G.add(p); add(p, rb(nx * 0.66 + 0.1, 0.14, nz * 0.54 + 0.1, 0.02), M('#a9805a'), 0, 0.07, 0);
      for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) for (let k = 0; k < ny; k++) { const c = carton(0.62, 0.42, 0.5); c.position.set((i - (nx - 1) / 2) * 0.66, 0.14 + k * 0.43, (j - (nz - 1) / 2) * 0.54); c.rotation.y = (rnd() - 0.5) * 0.06; p.add(c); } return p; };
    pallet(12.0, -8.5, 2, 2, 4); pallet(12.2, -5.0, 2, 2, 3); pallet(-12.2, -6.5, 2, 2, 4); pallet(-12.0, -2.8, 2, 2, 2); pallet(12.4, 4.5, 2, 2, 3);
    // ---- shipping chute from the end of the carton belt ----
    const chute = new THREE.Group(); chute.position.set(9.0, 0, BZ[2]); G.add(chute);
    const slope = Math.atan2(0.75, 3.0);
    const bed = add(chute, rb(3.1, 0.06, 1.0, 0.02), M('#b8bec6', 'dark'), 1.5, 0.6, 0); bed.rotation.z = -slope;
    for (const s of [-1, 1]) { const r = add(chute, rb(3.1, 0.16, 0.05, 0.02), M('#f2c230'), 1.5, 0.68, s * 0.52); r.rotation.z = -slope; }
    for (const x of [0.3, 1.5, 2.7]) add(chute, new THREE.BoxGeometry(0.08, 0.9 - x * 0.25, 0.08), steel, x, (0.9 - x * 0.25) / 2, 0);
    const cage = new THREE.Group(); cage.position.set(3.6, 0, 0); chute.add(cage); add(cage, rb(1.4, 0.08, 1.4, 0.02), steel, 0, 0.12, 0);
    for (const [x, z] of [[-0.68, 0], [0.68, 0], [0, -0.68], [0, 0.68]]) { const w = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(x ? 0.02 : 1.4, 1.1, z ? 0.02 : 1.4, 1, 3, 3)), new THREE.LineBasicMaterial({ color: '#9aa2ac' })); w.position.set(x, 0.65, z); cage.add(w); }
    for (let i = 0; i < 5; i++) { const c = carton(0.5, 0.36, 0.42); c.position.set((rnd() - 0.5) * 0.7, 0.16 + Math.floor(i / 3) * 0.37, (rnd() - 0.5) * 0.7); c.rotation.y = rnd() * 3; cage.add(c); }
    const sliders = []; for (let i = 0; i < 3; i++) { const c = carton(0.5, 0.36, 0.42); chute.add(c); sliders.push(c); }
    // ---- lights ----
    G.add(new THREE.HemisphereLight(0xc8d8f0, 0x3a3630, 0.4));
    const top = new THREE.DirectionalLight(0xeaf2ff, 1.6); top.position.set(4, 14, 8); top.target.position.set(0, 0, -3); top.castShadow = true; top.shadow.mapSize.set(2048, 2048);
    Object.assign(top.shadow.camera, { left: -17, right: 17, top: 14, bottom: -14, near: 1, far: 40 }); top.shadow.bias = -0.0006; G.add(top, top.target);
    for (const x of [-8, 8]) { const pl = new THREE.PointLight(0xdfeaff, 18, 18, 2); pl.position.set(x, 9, -2); G.add(pl); }
    const ud = G.userData;
    ud.screens = screens; ud.counter = counter; ud.belts = belts; ud.robots = robots; ud.beltZ = BZ; ud.beltTop = 0.97;
    ud.walkway = { x: 0, z: 3.4 }; // free floor in front of the belts (good spot for a character)
    ud.update = (t) => {
      belts.forEach((b, bi) => { b.tex.offset.x = -(t * V) % 1; b.items.forEach((it, i) => { const u = ((t * V + i * (L / b.items.length) + bi * 0.7) % L + L) % L; it.position.x = X0 + u; }); });
      robots.forEach(r => { const s = Math.sin(t * 2.6 + r.ph); r.turret.rotation.y = Math.sin(t * 1.3 + r.ph) * 0.35; r.sh.rotation.x = 0.55 + 0.12 * s; r.el.rotation.x = 1.25 + 0.35 * Math.max(0, s); r.wr.rotation.x = 0.5 - 0.3 * s; });
      sliders.forEach((c, i) => { const u = ((t * 0.55 + i / 3) % 1); c.position.set(0.1 + u * 3.0, 1.0 - 0.75 * u, (i - 1) * 0.08); c.rotation.z = -slope; c.visible = u < 0.97; });
    };
    ud.update(0); setEnvIntensity(G, 0.5); ud.envIntensity = 0.5;
    return G;
  }

  return { bedroom, hqExterior, meetingRoom, factory, chair, carton, filoBox, setEnvIntensity };
}
