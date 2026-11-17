// propkit.js — props & sets in the same rounded clay style as charkit.
// const props = createProps(THREE, kit, 'clay'); scene.add(props.airplane({ livery: '#d6342c' }));
export function createProps(THREE, kit, finish = 'clay') {
  const M = (c, kind = 'cloth') => kit.makeMat(c, kind, finish);
  const E = (c, k = 1.2) => new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: k, roughness: 0.6 });
  const rb = kit.rbox;
  const add = (p, g, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.castShadow = true; o.receiveShadow = true; p.add(o); return o; };
  let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

  // ---------------- airplane ----------------
  function airplane(o = {}) {
    const g = new THREE.Group(); const L = o.length ?? 4.2, R = o.radius ?? 0.33;
    const body = M(o.body ?? '#f4f2ee'), liv = M(o.livery ?? '#2b5fd9'), liv2 = M(o.livery2 ?? '#f2b134'), dark = M('#2a2f38', 'leather'), metal = M('#b9bec7');
    // fuselage along +z (nose at +z)
    const fus = add(g, new THREE.CapsuleGeometry(R, L - 2 * R, 10, 28), body); fus.rotation.x = Math.PI / 2; fus.position.y = R + 0.35;
    const nose = add(g, new THREE.SphereGeometry(R, 28, 20), body, 0, R + 0.33, L / 2 - R * 0.6); nose.scale.set(1, 0.92, 1.3);
    // tail upsweep
    const tail = add(g, new THREE.ConeGeometry(R * 0.98, R * 2.4, 28), body, 0, R + 0.45, -L / 2 - R * 0.5); tail.rotation.x = -Math.PI / 2 - 0.12;
    // livery stripe + belly
    const stripe = add(g, new THREE.CylinderGeometry(R * 1.012, R * 1.012, L * 0.86, 28, 1, true, Math.PI * 0.62, Math.PI * 0.76), liv); stripe.rotation.x = Math.PI / 2; stripe.position.set(0, R + 0.35, 0.05);
    // cockpit windows
    for (const s of [-1, 1]) { const w = add(g, rb(0.12, 0.07, 0.05, 0.02), dark, s * R * 0.48, R + 0.5, L / 2 - R * 0.35); w.rotation.y = s * 0.6; }
    // cabin windows
    for (const s of [-1, 1]) for (let i = 0; i < 14; i++) add(g, rb(0.02, 0.06, 0.07, 0.01), dark, s * R * 0.99, R + 0.45, L / 2 - 0.85 - i * 0.2);
    // wings (swept)
    for (const s of [-1, 1]) {
      const wing = add(g, rb(2.1, 0.06, 0.72, 0.03), body, s * 1.15, R + 0.2, 0.05); wing.rotation.set(0, s * 0.42, s * 0.06);
      const tip = add(g, rb(0.05, 0.28, 0.26, 0.02), liv, s * 2.08, R + 0.32, -0.38); tip.rotation.y = s * 0.42;
      // engine
      const eng = new THREE.Group(); eng.position.set(s * 0.95, R - 0.02, 0.62); g.add(eng);
      add(eng, new THREE.CylinderGeometry(0.2, 0.17, 0.7, 24), liv2).rotation.x = Math.PI / 2;
      add(eng, new THREE.CircleGeometry(0.17, 24), dark, 0, 0, 0.351);
      const fan = new THREE.Group(); fan.position.z = 0.355; eng.add(fan); for (let b = 0; b < 8; b++) { const bl = add(fan, new THREE.BoxGeometry(0.03, 0.3, 0.01), metal); bl.rotation.z = b * Math.PI / 8; }
      add(eng, new THREE.SphereGeometry(0.05, 12, 8), metal, 0, 0, 0.36);
      g.userData['fan' + s] = fan;
      add(g, rb(0.06, 0.18, 0.4, 0.02), body, s * 0.95, R + 0.13, 0.55);
    }
    // stabilizers + fin
    for (const s of [-1, 1]) { const st = add(g, rb(0.85, 0.05, 0.38, 0.02), body, s * 0.45, R + 0.55, -L / 2 - 0.15); st.rotation.y = s * 0.45; }
    const fin = add(g, rb(0.06, 0.95, 0.62, 0.03), liv, 0, R + 1.0, -L / 2 - 0.05); fin.rotation.x = -0.45;
    // gear
    if (o.gear !== false) {
      const wheel = new THREE.CylinderGeometry(0.09, 0.09, 0.08, 16);
      for (const [x, z] of [[-0.35, 0.0], [0.35, 0.0], [0, L / 2 - 0.4]]) { add(g, new THREE.CylinderGeometry(0.025, 0.025, 0.3, 8), metal, x, 0.25, z); const w = add(g, wheel, dark, x, 0.09, z); w.rotation.z = Math.PI / 2; }
    }
    // nav lights
    g.userData.lights = [add(g, new THREE.SphereGeometry(0.035, 10, 8), E(0xff2a2a, 2), -2.12, R + 0.24, -0.3), add(g, new THREE.SphereGeometry(0.035, 10, 8), E(0x2aff5a, 2), 2.12, R + 0.24, -0.3)];
    return g;
  }

  // ---------------- starship (ship + booster) ----------------
  function lathe(points, seg = 40) { return new THREE.LatheGeometry(points.map(([x, y]) => new THREE.Vector2(x, y)), seg); }
  function starshipShip(o = {}) {
    const g = new THREE.Group(); const R = 0.45, H = 2.7; const steel = M(o.steel ?? '#c4c8ce', 'leather'), tiles = M('#26292e', 'cloth'), dark = M('#3a3d43', 'leather');
    add(g, new THREE.CylinderGeometry(R, R, H, 40), steel, 0, H / 2, 0);
    const shield = add(g, new THREE.CylinderGeometry(R * 1.01, R * 1.01, H, 40, 1, true, Math.PI * 0.5, Math.PI), tiles, 0, H / 2, 0);
    const pts = []; for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push([R * Math.cos(t * Math.PI / 2) ** 0.75, H + t * 1.15]); }
    add(g, lathe(pts), steel);
    const noseTiles = add(g, lathe(pts.map(([x, y]) => [x * 1.01, y])), tiles); noseTiles.geometry = new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x * 1.01, y)), 40, Math.PI * 0.5, Math.PI);
    // flaps
    for (const s of [-1, 1]) { const f = add(g, rb(0.32, 0.6, 0.06, 0.03), tiles, s * (R + 0.12), H + 0.55, 0); f.rotation.z = s * 0.25; }
    for (const s of [-1, 1]) { const f = add(g, rb(0.42, 0.9, 0.07, 0.03), tiles, s * (R + 0.18), 0.6, 0); f.rotation.z = s * 0.06; }
    // engines
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, r = i < 3 ? 0.14 : 0.3; const n = add(g, new THREE.CylinderGeometry(0.06, 0.11, 0.2, 16, 1, true), dark, Math.cos(a) * r, -0.08, Math.sin(a) * r); }
    return g;
  }
  function starshipBooster(o = {}) {
    const g = new THREE.Group(); const R = 0.45, H = 3.9; const steel = M(o.steel ?? '#c4c8ce', 'leather'), dark = M('#3a3d43', 'leather'), soot = M('#6d6f73');
    add(g, new THREE.CylinderGeometry(R, R, H, 40), steel, 0, H / 2, 0);
    add(g, new THREE.CylinderGeometry(R * 1.01, R * 1.01, 0.6, 40, 1, true), soot, 0, 0.3, 0);
    for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + Math.PI / 4; const fin = add(g, rb(0.32, 0.04, 0.26, 0.015), dark, Math.cos(a) * (R + 0.14), H - 0.35, Math.sin(a) * (R + 0.14)); fin.rotation.y = -a; }
    add(g, new THREE.CylinderGeometry(R * 0.98, R * 0.9, 0.22, 40), dark, 0, H + 0.1, 0); // hot-stage ring
    for (let i = 0; i < 13; i++) { const a = i / 13 * Math.PI * 2, r = i < 3 ? 0.09 : i < 7 ? 0.22 : 0.34; add(g, new THREE.CylinderGeometry(0.045, 0.08, 0.16, 12, 1, true), dark, Math.cos(a) * r, -0.06, Math.sin(a) * r); }
    return g;
  }
  function starshipStack() { const g = new THREE.Group(); const b = starshipBooster(); g.add(b); const s = starshipShip(); s.position.y = 4.12; g.add(s); g.userData = { booster: b, ship: s }; return g; }

  // ---------------- launch tower with chopsticks ----------------
  function tower(o = {}) {
    const g = new THREE.Group(); const H = o.height ?? 9.5, W = 1.1; const steel = M('#5d6470', 'leather'), dark = M('#2e3238', 'leather'), concrete = M('#b8b3a8');
    add(g, rb(4.2, 0.3, 4.2, 0.08), concrete, 1.4, 0.15, 0);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(g, new THREE.BoxGeometry(0.1, H, 0.1), steel, x * W / 2, H / 2, z * W / 2);
    for (let y = 0.6; y < H; y += 0.6) { for (const [dx, dz, rx, rz] of [[0, -1, 0, 0], [0, 1, 0, 0], [-1, 0, 1, 0], [1, 0, 1, 0]]) {
      const b = add(g, new THREE.BoxGeometry(rx ? 0.05 : W, 0.05, rx ? W : 0.05), steel, dx * W / 2, y, dz * W / 2);
      const d = add(g, new THREE.BoxGeometry(rx ? 0.04 : W * 1.4, 0.04, rx ? W * 1.4 : 0.04), steel, dx * W / 2, y - 0.3, dz * W / 2); if (rx) d.rotation.x = 0.5; else d.rotation.z = 0.5; } }
    add(g, rb(W + 0.3, 0.4, W + 0.3, 0.05), dark, 0, H + 0.2, 0);
    // chopsticks carriage + arms
    const carriage = new THREE.Group(); carriage.position.set(0.62, o.armY ?? H - 2.0, 0); g.add(carriage); g.userData.carriage = carriage;
    add(carriage, rb(0.3, 0.7, W + 0.3, 0.05), dark);
    const arms = [];
    for (const s of [-1, 1]) {
      const pivot = new THREE.Group(); pivot.position.set(0.1, 0, s * 0.45); carriage.add(pivot);
      add(pivot, rb(3.2, 0.32, 0.22, 0.06), steel, 1.6, 0, 0);
      add(pivot, rb(0.6, 0.12, 0.3, 0.04), M('#e8c24a'), 2.9, -0.2, -s * 0.1);
      pivot.rotation.y = -s * (o.open ?? 0.35); arms.push(pivot);
    }
    g.userData.arms = arms;
    g.userData.setOpen = (v) => arms.forEach((p, i) => p.rotation.y = -(i ? 1 : -1) * v);
    // orbital launch mount
    const mount = new THREE.Group(); mount.position.set(2.4, 0.3, 0); g.add(mount);
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) add(mount, rb(0.25, 1.6, 0.25, 0.04), concrete, x * 0.55, 0.8, z * 0.55);
    add(mount, new THREE.TorusGeometry(0.62, 0.12, 12, 40), steel, 0, 1.65, 0).rotation.x = Math.PI / 2;
    g.userData.mountTop = new THREE.Vector3(2.4, 1.95, 0);
    return g;
  }

  // ---------------- UFO ----------------
  function ufo(o = {}) {
    const g = new THREE.Group(); const hull = M(o.hull ?? '#9aa3ad', 'leather'), dark = M('#4a5058', 'leather');
    const saucer = add(g, new THREE.SphereGeometry(1.4, 48, 24), hull); saucer.scale.set(1, 0.24, 1);
    add(g, new THREE.TorusGeometry(1.32, 0.09, 12, 64), dark).rotation.x = Math.PI / 2;
    const dome = add(g, new THREE.SphereGeometry(0.6, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0x8ff6ff, emissive: 0x2bd4e6, emissiveIntensity: 0.7, roughness: 0.15, transparent: true, opacity: 0.8 }), 0, 0.22, 0);
    const lights = []; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; lights.push(add(g, new THREE.SphereGeometry(0.075, 12, 8), E(i % 2 ? 0xfff27a : 0x7affd1, 2.2), Math.cos(a) * 1.3, -0.02, Math.sin(a) * 1.3)); }
    add(g, new THREE.CylinderGeometry(0.4, 0.55, 0.2, 32), dark, 0, -0.3, 0);
    const beam = add(g, new THREE.ConeGeometry(1.6, 5, 40, 1, true), new THREE.MeshBasicMaterial({ color: 0x9ffcff, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide }), 0, -2.85, 0); beam.castShadow = false;
    beam.visible = o.beam ?? true; g.userData = { lights, beam, dome };
    return g;
  }

  // ---------------- router with sparks ----------------
  function router() {
    const g = new THREE.Group(); const shell = M('#2f343c', 'leather'), lightOff = M('#1d2026');
    add(g, rb(1.6, 0.32, 1.0, 0.1), shell, 0, 0.16, 0);
    for (const x of [-0.6, 0, 0.6]) { const a = add(g, new THREE.CapsuleGeometry(0.045, 0.75, 4, 10), shell, x, 0.75, -0.42); a.rotation.z = x * 0.35; }
    const leds = []; for (let i = 0; i < 6; i++) leds.push(add(g, new THREE.SphereGeometry(0.035, 10, 8), E(i < 4 ? 0x39ff6a : 0xff3b2f, 2.4), -0.5 + i * 0.2, 0.2, 0.505));
    for (let i = 0; i < 4; i++) { const c = add(g, new THREE.CylinderGeometry(0.035, 0.035, 1.4, 10), M(['#2f7ad9', '#e8c24a', '#d9472f', '#3fb36a'][i]), -0.45 + i * 0.3, 0.16, -1.15); c.rotation.x = Math.PI / 2; }
    const sparks = new THREE.Group(); g.add(sparks); const sm = E(0xffd25a, 3);
    for (let i = 0; i < 36; i++) { const v = new THREE.Vector3((rnd() - 0.5) * 2, 0.6 + rnd() * 2, (rnd() - 0.5) * 2).normalize(); const d = 0.15 + rnd() * 0.75; const len = 0.08 + rnd() * 0.16;
      const s = add(sparks, new THREE.CylinderGeometry(0.008, 0.002, len, 5), sm, -0.2 + v.x * d, 0.34 + v.y * d, 0.2 + v.z * d); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v); s.castShadow = false; s.userData.v = v.toArray(); }
    const flash = add(g, new THREE.SphereGeometry(0.09, 12, 8), E(0xfff0b0, 4), -0.2, 0.34, 0.2); flash.castShadow = false;
    const smoke = new THREE.Group(); g.add(smoke); const smM = new THREE.MeshStandardMaterial({ color: 0x5d6168, roughness: 1, transparent: true, opacity: 0.4, depthWrite: false }); for (let i = 0; i < 6; i++) { const sp = add(smoke, new THREE.SphereGeometry(0.12 + i * 0.05, 14, 10), smM, 0.25 + i * 0.06, 0.5 + i * 0.22, -0.1 - i * 0.05); sp.castShadow = false; }
    g.userData = { leds, sparks, smoke };
    return g;
  }

  // ---------------- press podium + flag backdrop ----------------
  function podium() {
    const g = new THREE.Group(); const wood = M('#7a5136'), blue = M('#1f3d7a'), gold = M('#d9b14a', 'leather');
    add(g, rb(1.1, 1.25, 0.6, 0.08), wood, 0, 0.62, 0);
    add(g, rb(1.2, 0.08, 0.7, 0.03), wood, 0, 1.28, 0.02);
    const seal = add(g, new THREE.CylinderGeometry(0.26, 0.26, 0.03, 40), blue, 0, 0.78, 0.31); seal.rotation.x = Math.PI / 2;
    add(g, new THREE.TorusGeometry(0.26, 0.025, 8, 40), gold, 0, 0.78, 0.33);
    for (const s of [-1, 1]) { const m = add(g, new THREE.CylinderGeometry(0.012, 0.012, 0.45, 8), M('#222'), s * 0.12, 1.5, 0.15); m.rotation.x = 0.5; add(g, new THREE.SphereGeometry(0.04, 12, 8), M('#1a1a1a'), s * 0.12, 1.7, 0.27); }
    // backdrop + flag
    add(g, rb(5, 3.4, 0.1, 0.05), M('#25385e'), 0, 1.7, -1.6);
    const flag = new THREE.Group(); flag.position.set(-1.6, 1.4, -1.2); g.add(flag);
    add(flag, new THREE.CylinderGeometry(0.03, 0.03, 2.8, 10), gold, 0, 0, 0);
    for (let i = 0; i < 7; i++) add(flag, rb(1.1, 0.1, 0.03, 0.01), M(i % 2 ? '#f4f1ea' : '#b8292f'), 0.6, 1.25 - i * 0.1, 0);
    add(flag, rb(0.48, 0.38, 0.035, 0.01), M('#22386e'), 0.29, 1.12, 0.004);
    return g;
  }

  // ---------------- phone with a post ----------------
  function phone(text = '¡LLEGARON LOS ALIENS! 👽') {
    const g = new THREE.Group();
    add(g, rb(0.75, 1.5, 0.08, 0.1), M('#1c1e22', 'leather'));
    const tex = canvasTex(512, 1024, (c, w, h) => {
      c.fillStyle = '#0f1115'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#8a93a3'; c.beginPath(); c.arc(70, 140, 40, 0, 7); c.fill();
      c.fillStyle = '#ffffff'; c.font = 'bold 34px Inter, sans-serif'; c.fillText('Stephen King', 125, 135); c.fillStyle = '#8a93a3'; c.font = '28px Inter, sans-serif'; c.fillText('hace 2 min', 125, 172);
      c.fillStyle = '#ffffff'; c.font = 'bold 54px Inter, sans-serif'; wrap(c, text, 40, 280, 440, 66);
      c.fillStyle = '#8a93a3'; c.font = '30px Inter, sans-serif'; c.fillText('♡ 48K    ⟲ 12K    💬 9K', 40, 620);
    });
    add(g, new THREE.PlaneGeometry(0.66, 1.38), new THREE.MeshBasicMaterial({ map: tex }), 0, 0, 0.042);
    return g;
  }
  function wrap(c, text, x, y, maxW, lh) { const words = text.split(' '); let line = ''; for (const w of words) { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { c.fillText(line, x, y); y += lh; line = w; } else line = t; } c.fillText(line, x, y); }

  // ---------------- radar console ----------------
  function radar(t = 0, dots = 18) {
    const g = new THREE.Group();
    add(g, rb(1.8, 1.2, 0.9, 0.1), M('#3a4250'), 0, 0.6, 0);
    add(g, rb(1.9, 1.4, 0.5, 0.12), M('#323946'), 0, 1.55, -0.15).rotation.x = -0.15;
    const tex = canvasTex(512, 512, (c, w, h) => {
      c.fillStyle = '#04140a'; c.fillRect(0, 0, w, h); c.strokeStyle = 'rgba(60,255,120,0.35)'; c.lineWidth = 2;
      for (let r = 50; r < 260; r += 50) { c.beginPath(); c.arc(256, 256, r, 0, 7); c.stroke(); }
      c.beginPath(); c.moveTo(0, 256); c.lineTo(512, 256); c.moveTo(256, 0); c.lineTo(256, 512); c.stroke();
      const a = t * 1.5; const gr = c.createConicGradient ? c.createConicGradient(a, 256, 256) : null;
      if (gr) { gr.addColorStop(0, 'rgba(60,255,120,0.55)'); gr.addColorStop(0.12, 'rgba(60,255,120,0)'); gr.addColorStop(1, 'rgba(60,255,120,0)'); c.fillStyle = gr; c.beginPath(); c.arc(256, 256, 250, 0, 7); c.fill(); }
      let s = 7; const rn = () => (s = (s * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < dots; i++) { const x = 60 + rn() * 390, y = 60 + rn() * 390; c.fillStyle = '#5bff8f'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); }
    });
    const scr = add(g, new THREE.PlaneGeometry(1.4, 1.0), new THREE.MeshBasicMaterial({ map: tex }), 0, 1.57, 0.11); scr.rotation.x = -0.15;
    return g;
  }

  // ---------------- airport set ----------------
  function airport(o = {}) {
    const g = new THREE.Group(); const n = o.planes ?? 6;
    add(g, new THREE.PlaneGeometry(80, 80), M('#8fae6a'), 0, 0, 0).rotation.x = -Math.PI / 2;
    add(g, rb(60, 0.04, 3.2, 0.01), M('#3d4148'), 0, 0.02, 8);
    for (let i = -14; i <= 14; i++) add(g, rb(1.2, 0.05, 0.14, 0.01), M('#f4f1ea'), i * 2, 0.03, 8);
    add(g, rb(40, 0.035, 9, 0.01), M('#5a5e66'), 0, 0.018, 1.5);
    // terminal
    add(g, rb(22, 2.2, 3.5, 0.3), M('#d9d4c9'), 0, 1.1, -5);
    add(g, rb(21.6, 0.9, 0.06, 0.04), M('#3d6fa8'), 0, 1.3, -3.24);
    // control tower
    const ct = new THREE.Group(); ct.position.set(13, 0, -6); g.add(ct);
    add(ct, new THREE.CylinderGeometry(0.55, 0.75, 6, 24), M('#e4dfd4'), 0, 3, 0);
    add(ct, new THREE.CylinderGeometry(1.25, 0.95, 1.1, 8), M('#2f3d52'), 0, 6.5, 0);
    add(ct, new THREE.CylinderGeometry(1.35, 1.35, 0.18, 8), M('#e4dfd4'), 0, 7.1, 0);
    add(ct, new THREE.SphereGeometry(0.12, 10, 8), E(0xff3030, 2), 0, 7.45, 0);
    // parked planes at gates
    const planes = [];
    for (let i = 0; i < n; i++) { const p = airplane({ livery: ['#2b5fd9', '#d6342c', '#2fa36b', '#7a3fc4', '#e07a1f', '#1a1a1a'][i % 6], livery2: ['#f2b134', '#f4f2ee', '#f4f2ee', '#f2b134', '#2b5fd9', '#d6342c'][i % 6] }); p.scale.setScalar(0.8); p.position.set(-9 + i * 3.6, 0, 0.2); p.rotation.y = Math.PI; g.add(p); planes.push(p); }
    // trees
    for (let i = 0; i < 30; i++) { const x = (rnd() - 0.5) * 70, z = -12 - rnd() * 20; const tr = add(g, new THREE.SphereGeometry(0.8 + rnd() * 0.6, 14, 10), M('#4f7d3a'), x, 1.4, z); add(g, new THREE.CylinderGeometry(0.12, 0.15, 1, 8), M('#6b4a2e'), x, 0.5, z); }
    g.userData.planes = planes;
    return g;
  }

  // ---------------- clouds ----------------
  function cloud(s = 1) { const g = new THREE.Group(); const m = M('#ffffff'); for (let i = 0; i < 7; i++) add(g, new THREE.SphereGeometry((0.5 + rnd() * 0.5) * s, 16, 12), m, (rnd() - 0.5) * 2.2 * s, rnd() * 0.4 * s, (rnd() - 0.5) * 1.0 * s); return g; }

  // ---------------- hand props (real scale: the characters are ~1.8 units tall) ----------------
  const METAL = () => new THREE.MeshPhysicalMaterial({ color: 0xd8dde3, metalness: 0.9, roughness: 0.25 });
  // electric rotary shaver standing upright (y up), ~0.17 long; o.body / o.grip colours
  function razor(o = {}) {
    const g = new THREE.Group(); const body = M(o.body || '#1fa39a', 'leather'), grip = M(o.grip || '#1a1a1a', 'leather'), metal = METAL();
    add(g, rb(0.056, 0.13, 0.04, 0.018), body, 0, 0.065, 0);
    add(g, rb(0.044, 0.075, 0.044, 0.014), grip, 0, 0.055, 0);
    add(g, new THREE.CylinderGeometry(0.008, 0.008, 0.006, 12), M(o.accent || '#ffffff', 'white'), 0, 0.105, 0.021).rotation.x = Math.PI / 2;
    add(g, rb(0.078, 0.028, 0.052, 0.012), grip, 0, 0.142, 0);
    for (const [x, z] of [[-0.021, -0.01], [0.021, -0.01], [0, 0.013]]) { add(g, new THREE.CylinderGeometry(0.0145, 0.0145, 0.01, 20), metal, x, 0.159, z); add(g, new THREE.TorusGeometry(0.009, 0.0016, 6, 16), M('#333', 'dark'), x, 0.1645, z).rotation.x = Math.PI / 2; }
    return g;
  }
  // product box with a printed face (draw(ctx, w, h))
  function box(w, h, d, color, draw) { const g = new THREE.Group(); const m = M(color || '#c9a26b', 'cloth'); const b = add(g, rb(w, h, d, Math.min(w, h, d) * 0.08), m, 0, h / 2, 0);
    if (draw) { const tex = canvasTex(256, Math.round(256 * h / w), draw); add(g, new THREE.PlaneGeometry(w * 0.92, h * 0.92), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 }), 0, h / 2, d / 2 + 0.001); }
    return g; }
  // Mexican torta (bolillo sandwich), long axis along x, ~0.17 long
  function torta() {
    const g = new THREE.Group(); const bread = M('#d79a52', 'cloth');
    const top = add(g, new THREE.CapsuleGeometry(0.038, 0.1, 8, 16), bread, 0, 0.022, 0); top.rotation.z = Math.PI / 2; top.scale.set(1, 1, 0.95);
    const bot = add(g, new THREE.CapsuleGeometry(0.034, 0.1, 8, 16), bread, 0, -0.03, 0); bot.rotation.z = Math.PI / 2; bot.scale.set(1, 0.7, 0.95);
    const lay = (c, y, sx, sz) => { const l = add(g, rb(0.15 * sx, 0.012, 0.075 * sz, 0.005), M(c, 'cloth'), 0, y, 0); return l; };
    lay('#5fae3a', -0.006, 1.02, 1.12); lay('#e8a0a8', 0.002, 0.95, 1.0); lay('#d6342c', -0.014, 0.9, 1.05); lay('#9bc45a', 0.009, 0.85, 0.95);
    return g;
  }
  function mug(color = '#f2f2f2', text) { const g = new THREE.Group(); const m = M(color, 'white');
    add(g, new THREE.CylinderGeometry(0.04, 0.036, 0.1, 24), m, 0, 0.05, 0); add(g, new THREE.CylinderGeometry(0.035, 0.035, 0.002, 20), M('#3b2412', 'dark'), 0, 0.09, 0);
    const h = add(g, new THREE.TorusGeometry(0.025, 0.007, 8, 16), m, 0.045, 0.05, 0); h.rotation.z = Math.PI / 2;
    if (text) { const tex = canvasTex(256, 128, (c, w, hh) => { c.fillStyle = color; c.fillRect(0, 0, w, hh); c.fillStyle = '#111'; c.font = '900 44px Inter, sans-serif'; c.textAlign = 'center'; c.fillText(text, w / 2, 80); });
      const lb = add(g, new THREE.CylinderGeometry(0.0405, 0.0365, 0.06, 24, 1, true, -0.9, 1.8), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), 0, 0.05, 0); lb.castShadow = false; }
    return g; }
  // phone with a live screen: g.userData.draw(fn(ctx,w,h)) redraws it. Screen faces +z, long axis y. ~0.08 x 0.16
  function screenPhone(o = {}) {
    const g = new THREE.Group(); const W = o.w || 0.08, H = o.h || 0.162;
    add(g, rb(W, H, 0.011, 0.01), M(o.color || '#1c1e22', 'leather'));
    const c = document.createElement('canvas'); c.width = 540; c.height = Math.round(540 * H / W); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const scr = add(g, new THREE.PlaneGeometry(W * 0.9, H * 0.93), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), 0, 0, 0.0058); scr.castShadow = false;
    const glow = new THREE.PointLight(0x9fc8ff, 0, 0.6); glow.position.set(0, 0, 0.08); g.add(glow);
    g.userData = { canvas: c, ctx: c.getContext('2d'), tex, screen: scr, glow, draw(fn) { fn(this.ctx, c.width, c.height); tex.needsUpdate = true; } };
    return g;
  }
  // wall / desk monitor with a live screen (same draw() API). Screen faces +z.
  function monitor(w = 1.6, h = 0.9, o = {}) {
    const g = new THREE.Group(); add(g, rb(w + 0.06, h + 0.06, 0.05, 0.02), M(o.frame || '#111214', 'dark'));
    const c = document.createElement('canvas'); c.width = o.res || 1024; c.height = Math.round(c.width * h / w); const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const scr = add(g, new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }), 0, 0, 0.027); scr.castShadow = false; scr.receiveShadow = false;
    g.userData = { canvas: c, ctx: c.getContext('2d'), tex, screen: scr, draw(fn) { fn(this.ctx, c.width, c.height); tex.needsUpdate = true; } };
    return g;
  }

  return { razor, box, torta, mug, screenPhone, monitor, airplane, starshipShip, starshipBooster, starshipStack, tower, ufo, router, podium, phone, radar, airport, cloud, canvasTex };
}
