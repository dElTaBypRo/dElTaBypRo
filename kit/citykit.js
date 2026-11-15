// citykit.js — a city street set in the same rounded clay style (street, sidewalks, buildings,
// a bank tower with the banker's office window, a building under construction, cars, a crowd).
// const city = createCity(THREE, kit, { finish: 'clay' }); scene.add(city.group);
export function createCity(THREE, kit, opts = {}) {
  const finish = opts.finish ?? 'clay';
  const M = (c, k = 'cloth') => kit.makeMat(c, k, finish);
  const E = (c, k = 1.5) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k, roughness: 0.6 });
  const rb = kit.rbox;
  const add = (p, g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; p.add(o); return o; };
  let seed = opts.seed ?? 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const FLOOR = 2.6; // floor height (characters are ~2 units tall)
  const glass = (c = '#3d5f86') => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.12, metalness: 0.2, clearcoat: 1, envMapIntensity: 1.4 });
  function textTex(text, w = 1024, h = 256, bg = '#1c2a44', fg = '#e8c24a', font = 'bold 150px Inter, sans-serif') {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.fillStyle = bg; g.fillRect(0, 0, w, h); g.fillStyle = fg; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, w / 2, h / 2 + 6);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }

  // ---------- generic building ----------
  function building(o = {}) {
    const g = new THREE.Group(); const W = o.w ?? 8, D = o.d ?? 8, F = o.floors ?? 4, H = F * FLOOR; const wall = M(o.color ?? '#d9cbb3'), trim = M(o.trim ?? '#f2ece0');
    add(g, rb(W, H, D, 0.25), wall, 0, H / 2, 0);
    const win = glass(o.glass ?? '#3d5f86'); const frame = trim;
    const cols = Math.max(2, Math.floor(W / 2.0));
    for (let f = 0; f < F; f++) {
      const y = f * FLOOR + FLOOR * 0.55;
      if (f === 0 && o.shop) { add(g, rb(W * 0.86, FLOOR * 0.62, 0.08, 0.05), win, 0, FLOOR * 0.42, D / 2 + 0.02); add(g, rb(W * 0.92, 0.5, 0.9, 0.08), M(o.awning ?? '#c8442e'), 0, FLOOR * 0.86, D / 2 + 0.4); continue; }
      for (let c = 0; c < cols; c++) { const x = -W / 2 + (c + 0.5) * (W / cols); add(g, rb(W / cols * 0.55, FLOOR * 0.5, 0.08, 0.04), win, x, y, D / 2 + 0.02); add(g, rb(W / cols * 0.62, 0.1, 0.18, 0.03), frame, x, y - FLOOR * 0.28, D / 2 + 0.06); }
      add(g, rb(W + 0.1, 0.12, D + 0.1, 0.04), trim, 0, (f + 1) * FLOOR - 0.06, 0);
    }
    add(g, rb(W + 0.3, 0.45, D + 0.3, 0.1), trim, 0, H + 0.22, 0);
    if (!o.shop) { add(g, rb(1.4, 2.2, 0.15, 0.06), M('#5a3a24', 'leather'), 0, 1.1, D / 2 + 0.05); }
    for (let i = 0; i < (o.ac ?? 2); i++) add(g, rb(1.0, 0.7, 0.8, 0.12), M('#b8bcc4'), -W / 3 + i * 1.6, H + 0.8, -D / 4);
    g.userData = { H, W, D };
    return g;
  }

  // ---------- bank tower with banker's office ----------
  function bank(o = {}) {
    const g = new THREE.Group(); const W = 12, D = 10, F = o.floors ?? 12, H = F * FLOOR;
    const stone = M('#e9e2d2'), goldM = M('#d9b14a', 'leather'), gl = glass('#2c4a70');
    add(g, rb(W, FLOOR * 1.6, D, 0.2), stone, 0, FLOOR * 0.8, 0); // podium
    add(g, rb(W * 0.82, H - FLOOR * 1.6, D * 0.82, 0.25), gl, 0, FLOOR * 1.6 + (H - FLOOR * 1.6) / 2, -0.4); // glass tower
    for (let f = 2; f < F; f++) add(g, rb(W * 0.83, 0.14, D * 0.83, 0.04), M('#cfc7b5'), 0, f * FLOOR, -0.4);
    for (let i = -2; i <= 2; i++) add(g, rb(0.18, H - FLOOR * 1.6, 0.18, 0.05), goldM, i * W * 0.2, FLOOR * 1.6 + (H - FLOOR * 1.6) / 2, D * 0.41 - 0.4 + 0.02);
    add(g, rb(W * 0.9, 0.6, D * 0.9, 0.12), goldM, 0, H + 0.3, -0.4);
    // classical entrance
    for (let i = 0; i < 6; i++) add(g, new THREE.CylinderGeometry(0.32, 0.36, FLOOR * 1.3, 20), stone, -W * 0.36 + i * W * 0.144, FLOOR * 0.75, D / 2 + 1.2);
    const ped = add(g, new THREE.CylinderGeometry(1, 1, W * 0.9, 3), stone, 0, FLOOR * 1.55, D / 2 + 1.2); ped.rotation.z = Math.PI / 2; ped.scale.set(0.55, 1, 1.6);
    for (let s = 0; s < 3; s++) add(g, rb(W * 0.95 - s * 0.4, 0.2, 1.6 - s * 0.4, 0.05), stone, 0, 0.1 + s * 0.2, D / 2 + 1.7 + (2 - s) * 0.25);
    const sign = add(g, new THREE.PlaneGeometry(W * 0.62, 1.3), new THREE.MeshStandardMaterial({ map: textTex('BANCO'), roughness: 0.5 }), 0, FLOOR * 2.05, D / 2 + 1.25 + 0.02); sign.castShadow = false;
    // big doors
    const doorL = new THREE.Group(), doorR = new THREE.Group(); doorL.position.set(-1.1, 0.6, D / 2 + 0.02); doorR.position.set(1.1, 0.6, D / 2 + 0.02); g.add(doorL, doorR);
    add(doorL, rb(1.05, 2.6, 0.12, 0.04), M('#4a3020', 'leather'), 0.53, 1.3, 0); add(doorR, rb(1.05, 2.6, 0.12, 0.04), M('#4a3020', 'leather'), -0.53, 1.3, 0);
    // banker's office: a recessed balcony window high on the facade
    const of = o.officeFloor ?? 5; const oy = of * FLOOR; const oz = D * 0.41 - 0.4;
    const office = new THREE.Group(); office.position.set(-W * 0.2, oy, oz); g.add(office);
    add(office, rb(3.6, 0.2, 1.6, 0.06), stone, 0, 0.1, 0.6);                    // balcony slab
    add(office, rb(3.6, 1.0, 0.06, 0.03), new THREE.MeshPhysicalMaterial({ color: 0xcfe6ff, roughness: 0.05, transparent: true, opacity: 0.25 }), 0, 0.7, 1.36); add(office, rb(3.7, 0.08, 0.14, 0.03), M('#d9b14a', 'leather'), 0, 1.22, 1.36); // glass balcony rail
    add(office, rb(3.4, FLOOR * 0.85, 0.05, 0.03), new THREE.MeshStandardMaterial({ color: 0x2a1d14, roughness: 0.9 }), 0, FLOOR * 0.45, -0.25); // dark interior
    const lamp = new THREE.PointLight(0xffd59a, 6, 6); lamp.position.set(0, 2.0, 0.2); office.add(lamp);
    g.userData = { H, W, D, office, officeStand: new THREE.Vector3(-W * 0.2, oy + 0.2, oz + 0.95), doorL, doorR, setDoors: (a) => { doorL.rotation.y = -a; doorR.rotation.y = a; } };
    return g;
  }

  // ---------- building under construction ----------
  function construction(o = {}) {
    const g = new THREE.Group(); const W = o.w ?? 9, D = o.d ?? 8, F = o.floors ?? 7;
    const conc = M('#b9b4aa'), steel = M('#d8a23a', 'leather'), wall = M(o.color ?? '#cdb9a0'), win = glass();
    const floors = [];
    for (let f = 0; f < F; f++) {
      const fl = new THREE.Group(); fl.position.y = f * FLOOR; g.add(fl);
      add(fl, rb(W, 0.25, D, 0.06), conc, 0, 0.12, 0);
      for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1], [0, 1]]) add(fl, rb(0.3, FLOOR, 0.3, 0.05), steel, x * (W / 2 - 0.2), FLOOR / 2, z * (D / 2 - 0.2));
      const skin = new THREE.Group(); fl.add(skin); add(skin, rb(W, FLOOR - 0.25, D, 0.15), wall, 0, FLOOR / 2 + 0.06, 0);
      for (let c = 0; c < 4; c++) add(skin, rb(W / 4 * 0.55, FLOOR * 0.5, 0.06, 0.03), win, -W / 2 + (c + 0.5) * W / 4, FLOOR * 0.55, D / 2 + 0.03);
      floors.push({ fl, skin });
    }
    // tower crane
    const crane = new THREE.Group(); crane.position.set(W / 2 + 2, 0, -D / 2); g.add(crane);
    const ch = F * FLOOR + 6; for (let y = 0; y < ch; y += 1.2) { add(crane, new THREE.BoxGeometry(1.0, 0.08, 0.08), steel, 0, y, 0.5); add(crane, new THREE.BoxGeometry(1.0, 0.08, 0.08), steel, 0, y, -0.5); add(crane, new THREE.BoxGeometry(0.08, 0.08, 1.0), steel, 0.5, y, 0); add(crane, new THREE.BoxGeometry(0.08, 0.08, 1.0), steel, -0.5, y, 0); }
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(crane, new THREE.BoxGeometry(0.12, ch, 0.12), steel, x * 0.5, ch / 2, z * 0.5);
    const jib = new THREE.Group(); jib.position.y = ch; crane.add(jib); add(jib, rb(16, 0.6, 0.7, 0.05), steel, -5, 0, 0); add(jib, rb(1.6, 1.4, 1.2, 0.1), M('#e8e2d0'), 0, -0.9, 0); add(jib, rb(2, 1.2, 1.2, 0.08), conc, 4, -0.3, 0);
    const hook = new THREE.Group(); hook.position.set(-9, 0, 0); jib.add(hook); const cable = add(hook, new THREE.CylinderGeometry(0.03, 0.03, 1, 6), M('#333333'), 0, -0.5, 0); const load = add(hook, rb(3, 0.4, 0.8, 0.05), steel, 0, -1, 0);
    function setProgress(p, t = 0) { // p: 0..1 -> floors rise one by one, skin follows
      const fp = p * F;
      floors.forEach(({ fl, skin }, i) => { const k = Math.min(1, Math.max(0, fp - i)); fl.visible = k > 0; fl.scale.set(1, Math.max(0.001, Math.min(1, k * 1.6)), 1); skin.visible = fp - i > 1.2; });
      jib.rotation.y = Math.sin(t * 0.6) * 0.6; const drop = 2 + (1 + Math.sin(t * 1.3)) * (ch - 6) * 0.25; cable.scale.y = drop; cable.position.y = -drop / 2; load.position.y = -drop;
    }
    setProgress(o.progress ?? 0.6);
    g.userData = { setProgress, floors: F, H: F * FLOOR };
    return g;
  }

  // ---------- cars ----------
  function car(o = {}) {
    const g = new THREE.Group(); const L = o.long ? 5.6 : 4.0, Wd = 1.9; const paint = M(o.color ?? '#2b5fd9', 'leather'), dark = M('#1c1f24', 'leather'), chrome = M('#d8dce2', 'leather'), win = glass('#22324a');
    add(g, rb(L, 0.7, Wd, 0.28), paint, 0, 0.75, 0);
    const cab = add(g, rb(L * (o.long ? 0.5 : 0.55), 0.62, Wd * 0.9, 0.25), paint, -L * 0.05, 1.35, 0);
    for (const s of [-1, 1]) add(g, rb(L * (o.long ? 0.46 : 0.5), 0.46, 0.04, 0.1), win, -L * 0.05, 1.38, s * Wd * 0.45);
    add(g, rb(0.05, 0.45, Wd * 0.8, 0.08), win, -L * 0.05 + L * 0.27, 1.36, 0).rotation.z = -0.35;
    for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) { const w = add(g, new THREE.CylinderGeometry(0.42, 0.42, 0.32, 20), dark, x * L * 0.32, 0.42, z * Wd * 0.47); w.rotation.x = Math.PI / 2; add(g, new THREE.CylinderGeometry(0.22, 0.22, 0.34, 16), chrome, x * L * 0.32, 0.42, z * Wd * 0.47).rotation.x = Math.PI / 2; }
    for (const s of [-1, 1]) { add(g, rb(0.06, 0.18, 0.4, 0.05), E(0xfff4c8, 1.2), L / 2, 0.85, s * 0.6); add(g, rb(0.06, 0.16, 0.36, 0.05), E(0xff2a2a, 1.0), -L / 2, 0.85, s * 0.62); }
    if (o.long) { add(g, rb(0.08, 0.36, 1.0, 0.04), chrome, L / 2 + 0.01, 0.8, 0); add(g, new THREE.SphereGeometry(0.07, 10, 8), chrome, L / 2 - 0.1, 1.15, 0); }
    // driver-side rear door that can open (on +z side, hinge toward the front)
    const hinge = new THREE.Group(); hinge.position.set(-L * 0.05 + 0.15, 0.5, Wd / 2 + 0.01); g.add(hinge);
    add(hinge, rb(1.2, 0.68, 0.06, 0.06), paint, -0.6, 0.3, 0); add(hinge, rb(1.05, 0.42, 0.03, 0.06), win, -0.6, 0.86, 0); add(hinge, rb(0.18, 0.05, 0.05, 0.02), chrome, -1.0, 0.45, 0.05);
    g.userData = { door: hinge, setDoor: (a) => { hinge.rotation.y = a; }, L, seatPos: new THREE.Vector3(-L * 0.18, 0.55, 0.3) };
    return g;
  }

  // ---------- street furniture ----------
  function streetlight() { const g = new THREE.Group(); const m = M('#3a3f48', 'leather'); add(g, new THREE.CylinderGeometry(0.08, 0.12, 5, 12), m, 0, 2.5, 0); add(g, rb(1.2, 0.12, 0.12, 0.05), m, -0.5, 5, 0); add(g, rb(0.6, 0.2, 0.4, 0.08), m, -1.0, 4.9, 0); const bulb = add(g, rb(0.45, 0.06, 0.3, 0.03), E(0xfff0c0, 1.2), -1.0, 4.78, 0); bulb.castShadow = false; g.userData.bulb = bulb; return g; }
  function tree() { const g = new THREE.Group(); add(g, rb(1.2, 0.4, 1.2, 0.1), M('#b8b0a0'), 0, 0.2, 0); add(g, new THREE.CylinderGeometry(0.12, 0.16, 1.8, 10), M('#6b4a2e'), 0, 1.2, 0); for (let i = 0; i < 4; i++) add(g, new THREE.SphereGeometry(0.75 + rnd() * 0.3, 14, 10), M('#4f8a3a'), (rnd() - 0.5) * 0.7, 2.4 + rnd() * 0.6, (rnd() - 0.5) * 0.7); return g; }
  function bench() { const g = new THREE.Group(); const w = M('#8a5a36'), m = M('#3a3f48', 'leather'); add(g, rb(1.8, 0.1, 0.5, 0.03), w, 0, 0.5, 0); add(g, rb(1.8, 0.4, 0.08, 0.03), w, 0, 0.8, -0.22); for (const s of [-1, 1]) add(g, rb(0.08, 0.5, 0.5, 0.02), m, s * 0.8, 0.25, 0); return g; }

  // ---------- assemble the street ----------
  const group = new THREE.Group();
  const LEN = opts.length ?? 80;
  add(group, new THREE.PlaneGeometry(400, 400), M('#9a9485'), 0, -0.02, 0).rotation.x = -Math.PI / 2;
  add(group, rb(LEN, 0.05, 8, 0.02), M('#4a4d55'), 0, 0.0, 0);
  for (let x = -LEN / 2 + 2; x < LEN / 2; x += 4) add(group, rb(2, 0.06, 0.18, 0.02), M('#f2ead8'), x, 0.01, 0);
  for (let i = -3; i <= 3; i++) add(group, rb(0.6, 0.06, 6.5, 0.02), M('#f2ead8'), 6 + i * 1.0, 0.012, 0).position.x = 6 + i * 1.0;
  for (const s of [-1, 1]) { add(group, rb(LEN, 0.3, 4, 0.06), M('#c9c2b2'), 0, 0.15, s * 6); add(group, rb(LEN, 0.32, 0.25, 0.05), M('#e2dccd'), 0, 0.16, s * 4.1); }
  const SIDEWALK_Y = 0.3;
  // north side (z<0): bank in the middle, buildings around
  const bankB = bank(); bankB.position.set(0, 0, -8 - 5); group.add(bankB);
  const north = [[-30, 6, '#d9cbb3'], [-21, 4, '#c98f6a'], [-13, 5, '#e2d6bf'], [13, 4, '#b8c4cc'], [21, 6, '#d6b98f'], [30, 3, '#c9a0a0']];
  const nb = []; for (const [x, f, c] of north) { const b = building({ w: 7.5, d: 8, floors: f, color: c, shop: rnd() < 0.5, awning: ['#c8442e', '#2f6fd6', '#2fa36b'][Math.floor(rnd() * 3)] }); b.position.set(x, 0, -8 - 4); group.add(b); nb.push(b); }
  // south side (z>0): construction site + buildings (facing -z)
  const site = construction({ progress: opts.progress ?? 0.6 }); site.position.set(-4, 0, 13); site.rotation.y = Math.PI; group.add(site);
  const south = [[-24, 4, '#e2d6bf'], [-15, 5, '#c9b18f'], [8, 4, '#d0c0b0'], [17, 6, '#b8c4cc'], [27, 3, '#d9cbb3']];
  for (const [x, f, c] of south) { const b = building({ w: 8, d: 8, floors: f, color: c, shop: rnd() < 0.5 }); b.position.set(x, 0, 12); b.rotation.y = Math.PI; group.add(b); }
  // fences around construction
  for (let i = -2; i <= 2; i++) add(group, rb(2.2, 1.6, 0.08, 0.03), M('#e8c24a'), -4 + i * 2.25, 1.1, 8.3);
  // furniture
  const lights = []; for (let x = -36; x <= 36; x += 12) for (const s of [-1, 1]) { const l = streetlight(); l.position.set(x, SIDEWALK_Y, s * 4.6); l.rotation.y = s > 0 ? Math.PI : 0; group.add(l); lights.push(l); }
  for (let x = -33; x <= 33; x += 12) for (const s of [-1, 1]) { if (s < 0 && Math.abs(x) < 7) continue; const t = tree(); t.position.set(x, SIDEWALK_Y, s * 7.0); group.add(t); }
  for (const x of [-18, 18]) { const b = bench(); b.position.set(x, SIDEWALK_Y, -7.2); group.add(b); }
  // cars
  const limo = car({ long: true, color: '#121418' }); limo.position.set(2.0, 0, -2.3); group.add(limo);
  const parked = []; for (const [x, c, s] of [[-14, '#d6342c', 1], [-20, '#2fa36b', -1], [14, '#e8c24a', 1], [22, '#2b5fd9', -1], [-28, '#8a5cd6', 1]]) { const cc = car({ color: c }); cc.position.set(x, 0, s * 2.4); cc.rotation.y = s > 0 ? Math.PI : 0; group.add(cc); parked.push(cc); }
  // crowd
  const crowd = [];
  if (opts.crowd !== false) for (let i = 0; i < (opts.people ?? 22); i++) {
    const p = kit.build(kit.townsperson(i + 3), finish); const s = rnd() < 0.5 ? -1 : 1; const x = -34 + rnd() * 68; p.position.set(x, SIDEWALK_Y, s * (5.2 + rnd() * 1.4)); const dir = rnd() < 0.5 ? 1 : -1; p.rotation.y = dir > 0 ? Math.PI / 2 : -Math.PI / 2; p.scale.setScalar(0.95);
    p.userData.walk = { dir, speed: 0.8 + rnd() * 0.6, x0: x, phase: rnd() * 10 }; group.add(p); crowd.push(p);
  }
  function update(t) {
    for (const p of crowd) { const w = p.userData.walk; let x = w.x0 + w.dir * w.speed * t; x = ((x + 36) % 72 + 72) % 72 - 36; p.position.x = x; kit.setPose(p, 'walk', t * w.speed + w.phase); }
    site.userData.setProgress(site.userData.progress ?? (opts.progress ?? 0.6), t);
  }
  return { group, bank: bankB, site, limo, parked, crowd, lights, update, SIDEWALK_Y, parts: { building, bank, construction, car, streetlight, tree, bench } };
}
