// charkit.js — parametric "square-head" character mold with a joint rig,
// expressions, poses and three material finishes (vinyl / clay / pixar).
// Usage: const kit = createKit(THREE, RoundedBoxGeometry); const c = kit.build(kit.PRESETS.trump, 'vinyl');
//        kit.setExpression(c, 'smug'); kit.setPose(c, 'point', t);
export function createKit(THREE, RoundedBoxGeometry) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, x) => a + (b - a) * x;

  // ---------------- defaults & presets ----------------
  const DEFAULT = {
    name: 'Persona',
    skin: '#e0b08a',
    head: { w: 0.62, h: 0.66, d: 0.58, round: 0.12, jowl: 0 },
    eyes: { size: 0.064, spacing: 0.135, y: 0.03, open: 1.0, tilt: 0, iris: '#3b2a1e' },
    brows: { color: '#3a2a20', thick: 0.032, y: 0.14 },
    nose: { size: 0.05, width: 1.0 },
    ears: { size: 0.075 },
    mouth: { width: 1.0, lips: '#7a3b33' },
    hair: { style: 'short', color: '#3a2a20' },
    glasses: { style: 'none', color: '#151515' },
    beard: { style: 'none', color: '#3a2a20' },
    acc: { hat: 'none', hatColor: '#151515', watch: false, chain: false, badge: false, cigar: false },
    hands: { L: 'auto', R: 'auto' },
    body: { height: 1.0, shoulders: 0.56, chest: 0.32, belly: 0.0, arms: 0.075, legs: 0.095, legLen: 0.78 },
    outfit: { type: 'tee', top: '#2f6fd6', inner: '#f5f5f5', tie: '#c8102e', vest: '', pants: '#2b2f3a', shoes: '#1a1a1a' },
    expression: 'neutral',
    pose: 'idle',
  };
  const P = (o) => deepMerge(structuredClone(DEFAULT), o);
  const PRESETS = {
    jensen: P({ name: 'Jensen Huang', skin: '#e2b088',
      head: { w: 0.62, h: 0.64, d: 0.58, round: 0.13 },
      eyes: { size: 0.06, open: 0.55, tilt: 0.12, spacing: 0.14, iris: '#2a1d14' },
      brows: { color: '#4a3526', thick: 0.022 },
      hair: { style: 'short', color: '#6b4c35' },
      glasses: { style: 'square', color: '#1a1a1a' },
      body: { shoulders: 0.54, chest: 0.3, belly: 0.12, height: 0.98 },
      outfit: { type: 'leather', top: '#111111', inner: '#1d1d1d', pants: '#161616', shoes: '#0d0d0d' },
      expression: 'happy' }),
    trump: P({ name: 'Donald Trump', skin: '#dc7a35',
      head: { w: 0.7, h: 0.66, d: 0.62, round: 0.13, jowl: 0.6 },
      eyes: { size: 0.056, open: 0.5, spacing: 0.15, iris: '#3d5a80' },
      brows: { color: '#e8c56a', thick: 0.03, y: 0.12 },
      nose: { size: 0.055, width: 1.15 },
      hair: { style: 'swoop', color: '#f2d06b' },
      mouth: { width: 0.85, lips: '#a5533d' },
      body: { shoulders: 0.66, chest: 0.4, belly: 1.0, height: 1.02, arms: 0.09, legs: 0.115, legLen: 0.72 },
      outfit: { type: 'suit', top: '#1c2a4a', inner: '#ffffff', tie: '#c8102e', pants: '#1c2a4a', shoes: '#111111' },
      expression: 'smug' }),
    elon: P({ name: 'Elon Musk', skin: '#eebd98',
      head: { w: 0.6, h: 0.72, d: 0.58, round: 0.12, jowl: 0.15 },
      eyes: { size: 0.062, open: 0.85, spacing: 0.135, iris: '#4a6b4a' },
      brows: { color: '#3b2a20', thick: 0.026 },
      hair: { style: 'receding', color: '#3b2a20' },
      body: { shoulders: 0.6, chest: 0.34, belly: 0.25, height: 1.06 },
      outfit: { type: 'tee', top: '#141414', pants: '#2a3242', shoes: '#151515' },
      expression: 'happy' }),
    king: P({ name: 'Stephen King', skin: '#efc9ae',
      head: { w: 0.58, h: 0.72, d: 0.56, round: 0.12 },
      eyes: { size: 0.06, open: 0.9, iris: '#5b6f8a' },
      brows: { color: '#9a9a9a', thick: 0.03 },
      hair: { style: 'messy', color: '#c9c9c9' },
      glasses: { style: 'square', color: '#2a2a2a' },
      body: { shoulders: 0.5, chest: 0.28, belly: 0.05, height: 1.08, arms: 0.065, legs: 0.08 },
      outfit: { type: 'sweater', top: '#5a6b48', pants: '#3a3f4a', shoes: '#3b2a1e' },
      expression: 'surprised' }),
    duffy: P({ name: 'Sean Duffy', skin: '#efc3a0',
      head: { w: 0.62, h: 0.68, d: 0.58, round: 0.12, jowl: 0.1 },
      eyes: { size: 0.062, open: 0.85, iris: '#4a6a8a' },
      hair: { style: 'side', color: '#4a3424' },
      body: { shoulders: 0.6, chest: 0.33, belly: 0.15 },
      outfit: { type: 'suit', top: '#2c3e5c', inner: '#ffffff', tie: '#2a5db0', pants: '#2c3e5c', shoes: '#111111' },
      expression: 'worried' }),
    rico: P({ name: 'El Millonario', skin: '#e8bb93',
      head: { w: 0.6, h: 0.7, d: 0.58, round: 0.12, jowl: 0.1 },
      eyes: { size: 0.06, open: 0.75, iris: '#3b2a1e' },
      brows: { color: '#9a9a9a', thick: 0.03 },
      hair: { style: 'slick', color: '#c9c9c9' },
      glasses: { style: 'shades', color: '#111111' },
      body: { shoulders: 0.6, chest: 0.34, belly: 0.2, height: 1.06 },
      outfit: { type: 'suit', top: '#16161a', inner: '#ffffff', tie: '#d4a83a', pants: '#16161a', shoes: '#0d0d0d' },
      acc: { watch: true, chain: false, cigar: false },
      expression: 'smug' }),
    banquero: P({ name: 'El Banquero', skin: '#f0c9a6',
      head: { w: 0.62, h: 0.68, d: 0.58, round: 0.12, jowl: 0.25 },
      eyes: { size: 0.056, open: 0.7, iris: '#4a5a6a' },
      brows: { color: '#7a6a5a', thick: 0.03 },
      hair: { style: 'horseshoe', color: '#8a7a6a' },
      beard: { style: 'mustache', color: '#7a6a5a' },
      glasses: { style: 'round', color: '#b08a3a' },
      body: { shoulders: 0.58, chest: 0.34, belly: 0.4, height: 1.0 },
      outfit: { type: 'suit', top: '#4a4f58', inner: '#ffffff', tie: '#7a1f2b', vest: '#5d6470', pants: '#4a4f58', shoes: '#1a1a1a' },
      acc: { watch: true, chain: true },
      expression: 'smug', pose: 'handsBehind' }),
    asalariado: P({ name: 'El Asalariado', skin: '#d9a57c',
      head: { w: 0.6, h: 0.66, d: 0.57, round: 0.13 },
      eyes: { size: 0.062, open: 0.75, iris: '#3b2a1e' },
      hair: { style: 'short', color: '#2a1d14' },
      beard: { style: 'stubble', color: '#2a1d14' },
      body: { shoulders: 0.54, chest: 0.31, belly: 0.2, height: 0.98 },
      outfit: { type: 'shirt', top: '#8fb6e0', inner: '#8fb6e0', tie: '#2c3e5c', pants: '#c2a77e', shoes: '#4a3424' },
      acc: { badge: true },
      expression: 'worried' }),
    gordo: P({ name: 'El Magnate Gordo', skin: '#e6a27a',
      head: { w: 0.72, h: 0.66, d: 0.64, round: 0.14, jowl: 0.9 },
      eyes: { size: 0.052, open: 0.55, iris: '#3b2a1e' },
      brows: { color: '#3a2a20', thick: 0.034 },
      hair: { style: 'slick', color: '#2a1d14' },
      beard: { style: 'mustache', color: '#2a1d14' },
      body: { shoulders: 0.7, chest: 0.42, belly: 1.0, height: 1.0, arms: 0.095, legs: 0.12, legLen: 0.7 },
      outfit: { type: 'suit', top: '#efe6d2', inner: '#ffffff', tie: '#b3202a', pants: '#efe6d2', shoes: '#6b4a2e' },
      acc: { hat: 'tophat', hatColor: '#16161a', chain: true, cigar: true, watch: true },
      expression: 'grin' }),
    // --- Amazon video cast ---
    bezos: P({ name: 'Jeff Bezos (caricatura)', skin: '#e3a684',
      head: { w: 0.66, h: 0.68, d: 0.6, round: 0.22, jowl: 0.05, shine: true },
      ears: { size: 0.095 },
      eyes: { size: 0.07, open: 1.0, spacing: 0.14, iris: '#5a3a22' },
      brows: { color: '#3a2a1e', thick: 0.04, y: 0.16 },
      nose: { size: 0.052, width: 1.05 },
      hair: { style: 'bald', color: '#4a3526' },
      mouth: { width: 1.15, lips: '#a5533d' },
      body: { shoulders: 0.68, chest: 0.38, belly: 0.05, height: 1.0, arms: 0.1, legs: 0.1 },
      outfit: { type: 'puffer', top: '#1b1b1f', vest: '#2f3d55', pants: '#3a4a6a', shoes: '#151515' },
      acc: { watch: true },
      expression: 'grin' }),
    vendedor: P({ name: 'Toño (vendedor)', skin: '#c68a5e',
      head: { w: 0.6, h: 0.66, d: 0.57, round: 0.13 },
      eyes: { size: 0.066, open: 0.95, iris: '#2a1d14' },
      brows: { color: '#1a1210', thick: 0.034 },
      hair: { style: 'messy', color: '#1a1210' },
      body: { shoulders: 0.54, chest: 0.3, belly: 0.08, height: 0.98 },
      outfit: { type: 'hoodie', top: '#e0582a', inner: '#f5f5f5', pants: '#3a4a6a', shoes: '#f2f2f2' },
      expression: 'happy' }),
    lucia: P({ name: 'Lucía (la lista)', skin: '#e6b48f',
      head: { w: 0.58, h: 0.64, d: 0.56, round: 0.14 },
      eyes: { size: 0.064, open: 0.9, iris: '#3b2a1e', lashes: true },
      brows: { color: '#2a1d14', thick: 0.024 },
      nose: { size: 0.044 },
      hair: { style: 'bob', color: '#2a1d14' },
      glasses: { style: 'square', color: '#9a2a3a' },
      mouth: { width: 0.9, lips: '#b8404c' },
      body: { shoulders: 0.48, chest: 0.27, belly: 0.0, height: 0.95, arms: 0.065, legs: 0.085 },
      outfit: { type: 'shirt', top: '#3f6fb5', inner: '#3f6fb5', pants: '#2b2f3a', shoes: '#1a1a1a' },
      acc: { badge: true },
      expression: 'neutral' }),
    ramiro: P({ name: 'Ramiro (el amargado)', skin: '#d9a57c',
      head: { w: 0.62, h: 0.68, d: 0.58, round: 0.12, jowl: 0.35 },
      eyes: { size: 0.058, open: 0.5, iris: '#3b2a1e', bags: true },
      brows: { color: '#6a6a6a', thick: 0.036 },
      nose: { size: 0.058, width: 1.1 },
      hair: { style: 'receding', color: '#7a7a7a' },
      beard: { style: 'mustache', color: '#6a6a6a' },
      body: { shoulders: 0.58, chest: 0.34, belly: 0.3, height: 0.97 },
      outfit: { type: 'sweater', top: '#6b6f5a', pants: '#4a4a4a', shoes: '#3b2a1e' },
      acc: { badge: true },
      expression: 'sad' }),
    brandon: P({ name: 'Brandon (el lambiscón)', skin: '#f0c9a6',
      head: { w: 0.6, h: 0.7, d: 0.57, round: 0.12 },
      eyes: { size: 0.068, open: 1.1, iris: '#4a6a8a' },
      brows: { color: '#8a5a20', thick: 0.026 },
      hair: { style: 'side', color: '#b0802a' },
      mouth: { width: 1.2, lips: '#b0605a' },
      body: { shoulders: 0.54, chest: 0.3, belly: 0.05, height: 1.02 },
      outfit: { type: 'suit', top: '#2f5bb0', inner: '#ffffff', tie: '#ffcf3a', pants: '#2f5bb0', shoes: '#4a3424' },
      acc: { badge: true },
      expression: 'grin' }),
    becario: P({ name: 'Kevin (el becario)', skin: '#e0a882',
      head: { w: 0.58, h: 0.64, d: 0.56, round: 0.14 },
      eyes: { size: 0.06, open: 0.6, iris: '#3b2a1e' },
      brows: { color: '#3a2a1e', thick: 0.026 },
      hair: { style: 'messy', color: '#3a2a1e' },
      body: { shoulders: 0.48, chest: 0.27, belly: 0.1, height: 0.94, arms: 0.068, legs: 0.085 },
      outfit: { type: 'tee', top: '#ffcf3a', pants: '#3a4a6a', shoes: '#d65c5c' },
      acc: { badge: true, cap: true, hatColor: '#d65c5c' },
      expression: 'neutral' }),
  };

  const EXPRESSIONS = {
    neutral:   { open: 1.0, brow: [0, 0], mouth: 'flat', pupil: 1 },
    happy:     { open: 0.85, brow: [0.04, 0.05], mouth: 'smile', pupil: 1 },
    grin:      { open: 0.75, brow: [0.05, 0.08], mouth: 'grin', pupil: 1 },
    surprised: { open: 1.35, brow: [0.12, 0], mouth: 'o', pupil: 0.75 },
    shocked:   { open: 1.5, brow: [0.16, -0.12], mouth: 'scream', pupil: 0.55 },
    angry:     { open: 0.8, brow: [-0.03, -0.45], mouth: 'frown', pupil: 1 },
    worried:   { open: 1.0, brow: [0.05, 0.4], mouth: 'wavy', pupil: 0.9 },
    smug:      { open: 0.6, brow: [0.02, -0.12], mouth: 'smirk', pupil: 1 },
    evil:      { open: 0.42, brow: [-0.05, -0.62], mouth: 'evil', pupil: 0.8, pupilX: 0.3 },
    sad:       { open: 0.8, brow: [0.02, 0.45], mouth: 'frown', pupil: 1 },
  };
  const POSES = ['evilRub', 'sit', 'lookPhone', 'celebrate', 'eat', 'laugh', 'stretch', 'lean', 'showPhone', 'sleep', 'headHands', 'idle', 'point', 'shrug', 'handsUp', 'facepalm', 'think', 'crossed', 'wave', 'walk', 'presenting', 'podium', 'rubHands', 'handsBehind', 'handshake', 'phone', 'countMoney', 'thumbsUp', 'lookDown'];
  const GESTURES = ['open', 'fist', 'point', 'thumbsUp', 'money', 'peace', 'grab', 'relaxed'];

  // ---------------- materials (finishes) ----------------
  let clayBump = null;
  function getClayBump() {
    if (clayBump) return clayBump;
    const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d');
    const img = g.createImageData(256, 256); let s = 9;
    for (let i = 0; i < img.data.length; i += 4) { s = (s * 16807) % 2147483647; const v = 90 + (s % 90); img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0); g.filter = 'blur(1.2px)'; g.drawImage(c, 0, 0);
    clayBump = new THREE.CanvasTexture(c); clayBump.wrapS = clayBump.wrapT = THREE.RepeatWrapping; clayBump.repeat.set(6, 6);
    return clayBump;
  }
  function makeMat(color, kind, finish) {
    const col = new THREE.Color(color);
    if (kind === 'glass') return new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0, transparent: true, opacity: 0.18, metalness: 0, clearcoat: 1 });
    if (kind === 'dark') return new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.2, clearcoat: 1 });
    if (kind === 'white') return new THREE.MeshPhysicalMaterial({ color: col, roughness: 0.25, clearcoat: 0.6 });
    if (finish === 'clay') {
      const cc = col.clone(); const hsl = {}; cc.getHSL(hsl); cc.setHSL(hsl.h, hsl.s * 0.85, Math.min(1, hsl.l * 1.04));
      return new THREE.MeshStandardMaterial({ color: cc, roughness: 1.0, metalness: 0, bumpMap: getClayBump(), bumpScale: kind === 'skin' ? 3 : 5 });
    }
    if (finish === 'pixar') {
      const m = new THREE.MeshPhysicalMaterial({ color: col, roughness: kind === 'leather' ? 0.3 : kind === 'cloth' ? 0.85 : kind === 'hair' ? 0.55 : 0.48,
        sheen: kind === 'cloth' ? 1.0 : kind === 'skin' ? 0.35 : 0.2, sheenRoughness: 0.6, sheenColor: col.clone().lerp(new THREE.Color(0xffffff), 0.5),
        clearcoat: kind === 'leather' ? 0.8 : kind === 'skin' ? 0.12 : 0, clearcoatRoughness: 0.4 });
      if (kind === 'skin') { m.emissive = col.clone().multiplyScalar(0.09); m.emissive.r *= 1.6; }
      return m;
    }
    // vinyl (glossy toy)
    return new THREE.MeshPhysicalMaterial({ color: col, roughness: kind === 'cloth' ? 0.42 : 0.28, metalness: 0, clearcoat: 1.0, clearcoatRoughness: kind === 'cloth' ? 0.35 : 0.08 });
  }

  // ---------------- geometry helpers ----------------
  const rbox = (w, h, d, r, seg = 4) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3));
  function add(parent, geo, mat, x = 0, y = 0, z = 0) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
  function roundRectShape(w, h, r) { const s = new THREE.Shape(); const x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }

  // ---------------- builder ----------------
  function build(params, finish = 'vinyl') {
    const p = deepMerge(structuredClone(DEFAULT), params || {});
    const F = (c, k) => makeMat(c, k, finish);
    const skin = F(p.skin, 'skin');
    const outfitKind = p.outfit.type === 'leather' ? 'leather' : 'cloth';
    const topM = F(p.outfit.top, outfitKind), innerM = F(p.outfit.inner, 'cloth'), pantsM = F(p.outfit.pants, 'cloth'), shoeM = F(p.outfit.shoes, 'leather');
    const hairM = F(p.hair.color, 'hair');
    const root = new THREE.Group(); root.name = p.name;
    const R = {}; root.userData = { p, rig: R, finish };
    const b = p.body, k = b.height;

    // pelvis / hips
    const legLen = b.legLen * k;
    const hips = new THREE.Group(); hips.position.y = legLen; root.add(hips); R.hips = hips;
    const pelvisW = Math.max(0.34, b.shoulders * 0.7) + b.belly * 0.12;
    add(hips, rbox(pelvisW, 0.2, b.chest * 0.85 + b.belly * 0.1, 0.07), pantsM, 0, -0.02, 0);
    // belt
    if (['suit', 'tee', 'leather', 'puffer'].includes(p.outfit.type)) add(hips, rbox(pelvisW + 0.01, 0.04, b.chest * 0.85 + b.belly * 0.1 + 0.01, 0.015), F('#1a1a1a', 'leather'), 0, 0.07, 0);

    // spine / torso
    const spine = new THREE.Group(); spine.position.y = 0.06; hips.add(spine); R.spine = spine;
    const torsoH = 0.52 * k;
    const chestW = b.shoulders, chestD = b.chest + (b.belly < 0.35 ? b.belly * 0.12 : 0);
    add(spine, rbox(chestW, torsoH, chestD, 0.1), topM, 0, torsoH / 2, 0);
    const bellyR = b.belly >= 0.35 ? lerp(0.16, 0.36, b.belly) : 0;
    const bellyCZ = chestD * 0.5 + lerp(0.01, 0.2, b.belly) - bellyR;
    if (bellyR > 0.04) {
      const belly = add(spine, new THREE.SphereGeometry(bellyR, 48, 32), topM, 0, torsoH * 0.36, bellyCZ);
      belly.scale.set(1.08, 1.0, 1.0); R.belly = belly;
      // side fill so the belly blends with the torso
      add(spine, new THREE.SphereGeometry(bellyR * 0.95, 32, 24), topM, 0, torsoH * 0.34, 0).scale.set(chestW / (bellyR * 1.9), 1.0, 1.0);
    }
    const frontZ = (y) => { // approx. front surface z at a given height (follows belly)
      let z = chestD / 2;
      if (bellyR > 0.04) { const cy = torsoH * 0.36, cz = bellyCZ, dy = y - cy; if (Math.abs(dy) < bellyR) z = Math.max(z, cz + Math.sqrt(bellyR * bellyR - dy * dy)); }
      return z;
    };
    // outfit details
    const ot = p.outfit.type;
    if (ot === 'suit') {
      // shirt V + tie following the belly
      const vH = torsoH * 0.38; const shirt = add(spine, new THREE.ConeGeometry(0.09, vH, 3), innerM, 0, torsoH - vH / 2 + 0.005, frontZ(torsoH - vH / 2) + 0.002); shirt.rotation.z = Math.PI; shirt.scale.z = 0.1;
      add(spine, rbox(0.06, 0.05, 0.03, 0.01), F(p.outfit.tie, 'cloth'), 0, torsoH - 0.04, frontZ(torsoH - 0.04) + 0.01);
      const tieM = F(p.outfit.tie, 'cloth'); const N = 10, top = torsoH - 0.06, bot = torsoH * (b.belly > 0.5 ? -0.02 : 0.12);
      for (let i = 0; i < N; i++) { const y0 = lerp(top, bot, i / N), y1 = lerp(top, bot, (i + 1) / N), z0 = frontZ(y0) + 0.008, z1 = frontZ(y1) + 0.008;
        const len = Math.hypot(y1 - y0, z1 - z0); const w = lerp(0.045, 0.085, (i + 1) / N);
        const seg = add(spine, new THREE.BoxGeometry(w, len + 0.004, 0.012), tieM, 0, (y0 + y1) / 2, (z0 + z1) / 2); seg.rotation.x = Math.atan2(z1 - z0, -(y1 - y0)) * -1 + 0; seg.rotation.x = -Math.atan2(z1 - z0, y0 - y1); }
      if (p.outfit.vest) { const vm = F(p.outfit.vest, 'cloth'); for (const s of [-1, 1]) { const v = add(spine, rbox(0.075, torsoH * 0.55, 0.015, 0.006), vm, s * 0.07, torsoH * 0.5, frontZ(torsoH * 0.5) + 0.005); v.rotation.z = s * 0.1; } for (let i = 0; i < 3; i++) add(spine, new THREE.SphereGeometry(0.011, 8, 6), F('#d4a83a', 'leather'), 0.045, torsoH * (0.6 - i * 0.12), frontZ(torsoH * (0.6 - i * 0.12)) + 0.014); }
      for (const s of [-1, 1]) { const l = add(spine, rbox(0.07, torsoH * 0.42, 0.02, 0.008), topM, s * 0.085, torsoH * 0.78, frontZ(torsoH * 0.78) + 0.004); l.rotation.z = s * 0.32; }
      for (const s of [-1, 1]) add(spine, new THREE.SphereGeometry(0.012, 10, 8), F('#d8d8d8', 'white'), s * 0.0, torsoH * 0.25 - (s + 1) * 0.06, frontZ(torsoH * 0.25 - (s + 1) * 0.06) + 0.004).visible = b.belly < 0.5;
    } else if (ot === 'leather') {
      add(spine, rbox(0.17, torsoH * 0.92, 0.02, 0.008), innerM, 0, torsoH * 0.5, frontZ(torsoH * 0.5) + 0.002);
      for (const s of [-1, 1]) { const l = add(spine, rbox(0.06, torsoH * 0.5, 0.025, 0.01), topM, s * 0.105, torsoH * 0.74, frontZ(torsoH * 0.74) + 0.006); l.rotation.z = s * 0.22;
        add(spine, new THREE.BoxGeometry(0.006, torsoH * 0.85, 0.006), F('#9a9a9a', 'dark'), s * 0.088, torsoH * 0.47, frontZ(torsoH * 0.47) + 0.006); }
      add(spine, rbox(chestW + 0.02, 0.05, chestD + 0.02, 0.02), topM, 0, 0.02, 0); // jacket hem
    } else if (ot === 'sweater') {
      add(spine, rbox(chestW + 0.012, 0.05, chestD + 0.012, 0.022), topM, 0, 0.025, 0);
      const coll = add(spine, new THREE.TorusGeometry(0.1, 0.022, 10, 24), topM, 0, torsoH - 0.01, 0); coll.rotation.x = Math.PI / 2;
    } else if (ot === 'shirt') {
      for (const s of [-1, 1]) { const c = add(spine, rbox(0.1, 0.05, 0.03, 0.01), topM, s * 0.06, torsoH - 0.01, frontZ(torsoH) - 0.005); c.rotation.z = s * 0.5; }
      for (let i = 0; i < 4; i++) add(spine, new THREE.SphereGeometry(0.01, 8, 6), F('#f4f4f4', 'white'), 0, torsoH * (0.82 - i * 0.2), frontZ(torsoH * (0.82 - i * 0.2)) + 0.004);
      add(spine, rbox(0.012, torsoH * 0.95, 0.008, 0.003), F(p.outfit.top, 'cloth'), 0.0, torsoH * 0.5, frontZ(torsoH * 0.5) + 0.003);
      if (p.outfit.tieOn) { const tm = F(p.outfit.tie, 'cloth'); const tie = add(spine, rbox(0.06, torsoH * 0.55, 0.012, 0.01), tm, 0.02, torsoH * 0.68, frontZ(torsoH * 0.68) + 0.01); tie.rotation.z = 0.12; }
    } else if (ot === 'puffer') { // quilted vest over a tee
      const vm = F(p.outfit.vest || '#2f3d55', 'cloth'), seam = F(new THREE.Color(p.outfit.vest || '#2f3d55').multiplyScalar(0.55).getStyle(), 'cloth');
      const vw = chestW + 0.05, vd = chestD + 0.06;
      for (let i = 0; i < 5; i++) add(spine, rbox(vw - Math.abs(i - 2) * 0.004, torsoH * 0.19, vd, 0.045), vm, 0, torsoH * (0.1 + i * 0.19), 0);
      for (let i = 1; i < 5; i++) add(spine, rbox(vw - 0.004, 0.012, vd - 0.004, 0.005), seam, 0, torsoH * (0.005 + i * 0.19), 0);
      add(spine, rbox(0.012, torsoH * 0.95, 0.01, 0.004), F('#9a9a9a', 'dark'), 0, torsoH * 0.5, vd / 2 + 0.002);
      const coll = add(spine, new THREE.CylinderGeometry(0.13, 0.14, 0.09, 20, 1, true), vm, 0, torsoH + 0.02, 0); coll.material.side = THREE.DoubleSide;
      const tc = add(spine, new THREE.TorusGeometry(0.095, 0.014, 10, 24), topM, 0, torsoH - 0.005, 0); tc.rotation.x = Math.PI / 2;
    } else if (ot === 'hoodie') {
      add(spine, rbox(chestW + 0.014, 0.06, chestD + 0.014, 0.025), topM, 0, 0.03, 0);
      add(spine, rbox(chestW * 0.62, torsoH * 0.26, 0.03, 0.02), topM, 0, torsoH * 0.22, frontZ(torsoH * 0.22) + 0.006);
      add(spine, rbox(chestW * 0.5, 0.012, 0.012, 0.005), F(new THREE.Color(p.outfit.top).multiplyScalar(0.6).getStyle(), 'cloth'), 0, torsoH * 0.35, frontZ(torsoH * 0.35) + 0.02);
      const hood = add(spine, rbox(chestW * 0.62, 0.13, 0.12, 0.05), topM, 0, torsoH + 0.005, -chestD / 2 + 0.03); hood.rotation.x = -0.35; for (const s2 of [-1, 1]) { const hs = add(spine, rbox(0.06, 0.1, chestD * 0.55, 0.025), topM, s2 * 0.13, torsoH + 0.0, -0.02); hs.rotation.z = s2 * 0.25; }
      for (const s2 of [-1, 1]) { add(spine, new THREE.CylinderGeometry(0.007, 0.007, torsoH * 0.32, 6), F(p.outfit.inner, 'white'), s2 * 0.05, torsoH * 0.8, frontZ(torsoH * 0.8) + 0.012); add(spine, new THREE.SphereGeometry(0.013, 8, 6), F(p.outfit.inner, 'white'), s2 * 0.05, torsoH * 0.63, frontZ(torsoH * 0.63) + 0.014); }
    } else { // tee
      const coll = add(spine, new THREE.TorusGeometry(0.095, 0.014, 10, 24), topM, 0, torsoH - 0.005, 0); coll.rotation.x = Math.PI / 2;
    }

    // neck & head
    const neck = new THREE.Group(); neck.position.y = torsoH; spine.add(neck); R.neck = neck;
    add(neck, new THREE.CylinderGeometry(0.085 + b.belly * 0.03, 0.095 + b.belly * 0.03, 0.12, 20), skin, 0, 0.04, 0);
    if (ot === 'suit') { const c = add(neck, new THREE.CylinderGeometry(0.105 + b.belly * 0.03, 0.11 + b.belly * 0.03, 0.05, 20), innerM, 0, 0.0, 0); }
    const head = new THREE.Group(); const hd = p.head; head.position.y = 0.08 + hd.h / 2; neck.add(head); R.head = head;
    add(head, rbox(hd.w, hd.h, hd.d, hd.round * Math.min(hd.w, hd.h)), skin);
    if (hd.jowl > 0.01) { const j = add(head, rbox(hd.w * (1 + 0.035 * hd.jowl), hd.h * 0.46, hd.d * (1 + 0.025 * hd.jowl), hd.round * Math.min(hd.w, hd.h) * 1.1), skin, 0, -hd.h * (0.27 + 0.02 * hd.jowl), 0.004); }
    const fz = hd.d / 2 + (hd.jowl > 0.01 ? 0.02 * hd.jowl : 0) * 0;
    if (hd.shine) { const sh = add(head, new THREE.SphereGeometry(hd.w * 0.16, 16, 10), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.28, depthWrite: false }), -hd.w * 0.14, hd.h / 2 + 0.002, hd.d * 0.1); sh.scale.set(1.3, 0.08, 0.8); sh.castShadow = false; }
    // ears
    for (const s of [-1, 1]) { const e = add(head, new THREE.SphereGeometry(p.ears.size, 16, 12), skin, s * hd.w / 2, -0.01, -0.02); e.scale.set(0.45, 1, 0.75); }
    // eyes
    const E = p.eyes; const eyesG = []; R.eyes = eyesG;
    const whiteM = F('#ffffff', 'white'), irisM = F(E.iris, 'dark'), pupilM = F('#0b0b0b', 'dark'), hiM = new THREE.MeshBasicMaterial({ color: 0xffffff });
    for (const s of [-1, 1]) {
      const g = new THREE.Group(); g.position.set(s * E.spacing, E.y, fz - E.size * 0.25); g.rotation.z = -s * E.tilt; head.add(g);
      const inner = new THREE.Group(); g.add(inner);
      add(inner, new THREE.SphereGeometry(E.size, 24, 16), whiteM).scale.set(1.15, 1, 0.55);
      const iris = add(inner, new THREE.SphereGeometry(E.size * 0.6, 20, 14), irisM, 0, 0, E.size * 0.32); iris.scale.set(1, 1, 0.35);
      const pupil = add(inner, new THREE.SphereGeometry(E.size * 0.32, 16, 12), pupilM, 0, 0, E.size * 0.48); pupil.scale.set(1, 1, 0.3);
      add(inner, new THREE.SphereGeometry(E.size * 0.12, 8, 6), hiM, E.size * 0.18, E.size * 0.2, E.size * 0.56);
      const lid = add(g, rbox(E.size * 2.6, E.size * 0.35, E.size * 0.5, E.size * 0.12), skin, 0, E.size * 0.9, E.size * 0.12);
      if (E.lashes) for (let k = 0; k < 2; k++) { const la = add(g, rbox(E.size * 0.55, E.size * 0.16, E.size * 0.2, E.size * 0.05), F('#151515', 'dark'), s * E.size * (0.95 + k * 0.25), E.size * (0.75 - k * 0.3), E.size * 0.2); la.rotation.z = s * (0.5 + k * 0.35); }
      if (E.bags) { const bg = add(head, new THREE.SphereGeometry(E.size, 16, 10), F(new THREE.Color(p.skin).multiplyScalar(0.8).getStyle(), 'skin'), s * E.spacing, E.y - E.size * 0.95, fz - 0.004); bg.scale.set(1.15, 0.38, 0.25); }
      g.userData = { inner, pupil, iris, lid, side: s }; eyesG.push(g);
    }
    // brows
    R.brows = [];
    for (const s of [-1, 1]) { const br = add(head, rbox(0.14, p.brows.thick, 0.035, p.brows.thick * 0.45), F(p.brows.color, 'hair'), s * E.spacing, p.brows.y, fz + 0.005); br.userData = { side: s, y0: p.brows.y }; R.brows.push(br); }
    // nose
    const nose = add(head, rbox(p.nose.size * 1.1 * p.nose.width, p.nose.size * 1.5, p.nose.size * 1.1, p.nose.size * 0.45), skin, 0, -0.06, fz + p.nose.size * 0.35);
    // mouth variants
    const lipsM = F(p.mouth.lips, 'dark'), mouthInM = F('#3a0f12', 'dark'), teethM = F('#ffffff', 'white');
    const mw = 0.085 * p.mouth.width, my = -0.17 - hd.jowl * 0.02, mz = fz + 0.008;
    const mouth = new THREE.Group(); mouth.position.set(0, my, mz); head.add(mouth); R.mouth = {};
    const mk = (name, fn) => { const g = new THREE.Group(); fn(g); g.visible = false; mouth.add(g); R.mouth[name] = g; };
    mk('flat', g => add(g, rbox(mw * 1.7, 0.022, 0.02, 0.01), lipsM));
    mk('smile', g => { const t = add(g, new THREE.TorusGeometry(mw, 0.015, 8, 24, Math.PI * 0.85), lipsM); t.rotation.z = Math.PI + Math.PI * 0.075; t.position.y = mw * 0.55; });
    mk('frown', g => { const t = add(g, new THREE.TorusGeometry(mw * 0.85, 0.015, 8, 24, Math.PI * 0.8), lipsM); t.rotation.z = Math.PI * 0.1; t.position.y = -mw * 0.6; });
    mk('grin', g => { const d = add(g, new THREE.CircleGeometry(mw * 1.1, 32, Math.PI, Math.PI), mouthInM); add(g, rbox(mw * 2.0, mw * 0.32, 0.01, 0.004), teethM, 0, -mw * 0.14, 0.004); const l = add(g, new THREE.TorusGeometry(mw * 1.1, 0.008, 8, 32, Math.PI), lipsM); l.rotation.z = Math.PI; add(g, rbox(mw * 2.25, 0.014, 0.012, 0.006), lipsM, 0, 0, 0.002); });
    mk('o', g => { const d = add(g, new THREE.CircleGeometry(mw * 0.55, 24), mouthInM); d.scale.y = 1.25; const l = add(g, new THREE.TorusGeometry(mw * 0.55, 0.015, 8, 24), lipsM); l.scale.y = 1.25; });
    mk('scream', g => { const d = add(g, new THREE.CircleGeometry(mw * 0.85, 24), mouthInM); d.scale.y = 1.5; const l = add(g, new THREE.TorusGeometry(mw * 0.85, 0.015, 8, 24), lipsM); l.scale.y = 1.5; add(g, rbox(mw * 1.2, mw * 0.25, 0.01, 0.004), teethM, 0, mw * 1.05, 0.004); });
    mk('evil', g => { g.rotation.z = 0.06; const d = add(g, new THREE.CircleGeometry(mw * 1.35, 32, Math.PI, Math.PI), mouthInM); d.scale.y = 0.42; add(g, rbox(mw * 2.4, mw * 0.24, 0.01, 0.004), teethM, 0, -mw * 0.11, 0.004);
      add(g, rbox(mw * 2.75, 0.016, 0.012, 0.006), lipsM, 0, 0, 0.002); for (const s of [-1, 1]) { const c = add(g, new THREE.TorusGeometry(mw * 0.28, 0.013, 6, 12, Math.PI * 0.6), lipsM); c.position.set(s * mw * 1.38, mw * 0.2, 0.002); c.rotation.z = s > 0 ? -0.2 : Math.PI + 0.2 - Math.PI * 0.6; } });
    mk('smirk', g => { const t = add(g, new THREE.TorusGeometry(mw * 0.9, 0.015, 8, 24, Math.PI * 0.5), lipsM); t.rotation.z = Math.PI * 1.5; t.position.set(-mw * 0.1, mw * 0.55, 0); add(g, rbox(mw * 0.9, 0.016, 0.02, 0.007), lipsM, -mw * 0.5, -mw * 0.33, 0); });
    mk('talk', g => { const d = add(g, new THREE.CircleGeometry(mw * 0.8, 28), mouthInM); d.scale.y = 0.7; add(g, rbox(mw * 1.05, mw * 0.2, 0.01, 0.004), teethM, 0, mw * 0.42, 0.004); const tg = add(g, new THREE.CircleGeometry(mw * 0.45, 20), F('#c0505a', 'dark'), 0, -mw * 0.3, 0.003); tg.scale.y = 0.5; const l = add(g, new THREE.TorusGeometry(mw * 0.8, 0.014, 8, 28), lipsM); l.scale.y = 0.7; });
    mk('wavy', g => { for (let i = 0; i < 3; i++) { const t = add(g, new THREE.TorusGeometry(mw * 0.3, 0.009, 6, 12, Math.PI), lipsM); t.position.x = (i - 1) * mw * 0.6; t.rotation.z = i % 2 ? Math.PI : 0; } });

    // hair (fitted to the head box)
    buildHair(head, p, hd, hairM, fz);
    // glasses
    if (p.glasses.style !== 'none') buildGlasses(head, p, hd, E, fz, F);
    // facial hair
    if (p.beard.style === 'mustache') { const bm = F(p.beard.color, 'hair'); for (const s of [-1, 1]) { const m = add(head, rbox(0.085, 0.032, 0.03, 0.012), bm, s * 0.04, -0.115, fz + 0.012); m.rotation.z = s * -0.25; } }
    if (p.beard.style === 'stubble') { const sm = new THREE.MeshStandardMaterial({ color: p.beard.color, transparent: true, opacity: 0.2, roughness: 1, depthWrite: false }); const st = add(head, rbox(hd.w * 0.9, hd.h * 0.3, 0.02, 0.05), sm, 0, -hd.h * 0.31, fz - 0.007); st.castShadow = false; }
    // accessories
    const A = p.acc || {};
    if (A.hat === 'tophat') { const hm = F(A.hatColor || '#151515', 'leather'); add(head, new THREE.CylinderGeometry(hd.w * 0.62, hd.w * 0.62, 0.025, 32), hm, 0, hd.h / 2 + 0.05, 0); add(head, new THREE.CylinderGeometry(hd.w * 0.4, hd.w * 0.42, 0.42, 32), hm, 0, hd.h / 2 + 0.27, 0); add(head, new THREE.CylinderGeometry(hd.w * 0.425, hd.w * 0.425, 0.06, 32), F('#8b1e1e', 'cloth'), 0, hd.h / 2 + 0.1, 0); }
    if (A.cap) { const cm = F(A.hatColor || '#2f6fd6', 'cloth'); add(head, rbox(hd.w * 1.06, hd.h * 0.2, hd.d * 1.06, 0.06), cm, 0, hd.h / 2, 0); add(head, rbox(hd.w * 0.8, 0.025, hd.d * 0.4, 0.01), cm, 0, hd.h / 2 - 0.06, hd.d / 2 + hd.d * 0.15); }
    if (A.cigar) { const cg = add(head, new THREE.CapsuleGeometry(0.018, 0.13, 4, 8), F('#6b4423', 'leather'), 0.07, -0.16, fz + 0.06); cg.rotation.set(Math.PI / 2 - 0.25, 0, 0.35); const em = add(head, new THREE.SphereGeometry(0.02, 8, 6), new THREE.MeshStandardMaterial({ color: 0xff5a1a, emissive: 0xff3a00, emissiveIntensity: 2 }), 0.105, -0.175, fz + 0.13); em.castShadow = false; }
    if (A.chain) { const ch = add(spine, new THREE.TorusGeometry(0.11, 0.009, 6, 24, Math.PI), F('#d9b14a', 'leather'), 0.0, torsoH * 0.42, frontZ(torsoH * 0.42) + 0.012); ch.rotation.z = Math.PI; }
    if (A.badge) { add(spine, new THREE.TorusGeometry(0.09, 0.006, 6, 20, Math.PI), F('#2f6fd6', 'cloth'), 0, torsoH * 0.82, frontZ(torsoH * 0.82) + 0.006).rotation.z = Math.PI; add(spine, rbox(0.07, 0.09, 0.012, 0.01), F('#ffffff', 'white'), 0, torsoH * 0.62, frontZ(torsoH * 0.62) + 0.012); add(spine, rbox(0.05, 0.02, 0.014, 0.004), F('#2f6fd6', 'cloth'), 0, torsoH * 0.65, frontZ(torsoH * 0.65) + 0.016); }

    // arms
    const armR = b.arms, ua = 0.3 * k, fa = 0.28 * k;
    const teeLike = ot === 'tee' || ot === 'puffer'; const sleeveFore = teeLike ? skin : topM;
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(s * (chestW / 2 + armR * 0.55), torsoH - armR * 1.1, 0); spine.add(sh);
      add(sh, new THREE.SphereGeometry(armR * 1.18, 20, 14), topM);
      add(sh, new THREE.CapsuleGeometry(armR, ua - armR, 8, 16), topM, 0, -ua / 2, 0);
      if (teeLike) add(sh, new THREE.CylinderGeometry(armR * 1.12, armR * 1.12, ua * 0.35, 16), topM, 0, -ua * 0.25, 0);
      const el = new THREE.Group(); el.position.y = -ua; sh.add(el);
      add(el, new THREE.SphereGeometry(armR * 0.98, 16, 12), teeLike ? skin : topM);
      add(el, new THREE.CapsuleGeometry(armR * 0.9, fa - armR, 8, 16), sleeveFore, 0, -fa / 2, 0);
      if (ot === 'suit') add(el, new THREE.CylinderGeometry(armR * 0.95, armR * 0.95, 0.03, 16), innerM, 0, -fa + 0.02, 0);
      if (ot === 'hoodie' || ot === 'sweater') add(el, new THREE.CylinderGeometry(armR * 1.0, armR * 1.0, 0.045, 16), topM, 0, -fa + 0.03, 0);
      const wr = new THREE.Group(); wr.position.y = -fa; el.add(wr);
      buildHand(wr, skin, armR, s);
      if (s < 0 && (p.acc || {}).watch) add(wr, new THREE.CylinderGeometry(armR * 0.98, armR * 0.98, 0.035, 16), F('#d9b14a', 'leather'), 0, 0.03, 0);
      R[s < 0 ? 'shoulderL' : 'shoulderR'] = sh; R[s < 0 ? 'elbowL' : 'elbowR'] = el; R[s < 0 ? 'wristL' : 'wristR'] = wr;
    }
    // legs
    const lr = b.legs, th = legLen * 0.5, sn = legLen * 0.46;
    for (const s of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(s * (pelvisW / 2 - lr * 0.9), -0.05, 0); hips.add(hip);
      add(hip, new THREE.CapsuleGeometry(lr, th - lr, 8, 16), pantsM, 0, -th / 2, 0);
      const kn = new THREE.Group(); kn.position.y = -th; hip.add(kn);
      add(kn, new THREE.SphereGeometry(lr * 0.95, 16, 12), pantsM);
      add(kn, new THREE.CapsuleGeometry(lr * 0.9, sn - lr, 8, 16), pantsM, 0, -sn / 2, 0);
      const an = new THREE.Group(); an.position.y = -sn - lr * 0.2; kn.add(an);
      add(an, rbox(lr * 2.1, 0.08, lr * 3.2, 0.035), shoeM, 0, -0.01, lr * 0.7);
      R[s < 0 ? 'hipL' : 'hipR'] = hip; R[s < 0 ? 'kneeL' : 'kneeR'] = kn; R[s < 0 ? 'ankleL' : 'ankleR'] = an;
    }
    // ground the feet
    root.userData.footOffset = 0;
    setExpression(root, p.expression); setPose(root, p.pose, 0);
    return root;
  }

  function buildHand(wr, skin, armR, s) {
    const palm = add(wr, rbox(armR * 1.5, armR * 1.55, armR * 0.75, armR * 0.3), skin, 0, -armR * 0.7, 0);
    const fingers = [];
    for (let i = 0; i < 4; i++) {
      const f = new THREE.Group(); f.position.set((i - 1.5) * armR * 0.36, -armR * 1.45, 0); wr.add(f);
      const len = armR * (i === 0 || i === 3 ? 0.62 : 0.75); const l1 = len * 0.55, l2 = len * 0.5;
      add(f, new THREE.CapsuleGeometry(armR * 0.17, l1, 4, 8), skin, 0, -l1 / 2, 0);
      const tip = new THREE.Group(); tip.position.y = -l1; f.add(tip); f.userData.tip = tip;
      add(tip, new THREE.CapsuleGeometry(armR * 0.165, l2, 4, 8), skin, 0, -l2 / 2, 0); fingers.push(f);
    }
    const th = new THREE.Group(); th.position.set(-s * armR * 0.72, -armR * 0.75, armR * 0.2); th.rotation.z = -s * 0.7; wr.add(th);
    add(th, new THREE.CapsuleGeometry(armR * 0.19, armR * 0.45, 4, 8), skin, 0, -armR * 0.3, 0);
    wr.userData = { fingers, thumb: th };
  }

  function buildHair(head, p, hd, hairM, fz) {
    const st = p.hair.style, w = hd.w, h = hd.h, d = hd.d, r = hd.round * Math.min(w, h);
    const H = new THREE.Group(); head.add(H);
    const cap = (cw, ch, cd, y, z = 0, rr = r * 1.1) => add(H, rbox(cw, ch, cd, rr), hairM, 0, y, z);
    if (st === 'bald' || st === 'none') return;
    if (st === 'short') {
      cap(w * 1.05, h * 0.24, d * 1.05, h / 2 - h * 0.07);
      for (const s of [-1, 1]) add(H, rbox(w * 0.06, h * 0.42, d * 0.8, 0.02), hairM, s * (w / 2 + 0.005), h * 0.17, -d * 0.08);
      add(H, rbox(w * 1.02, h * 0.5, d * 0.1, 0.03), hairM, 0, h * 0.13, -d / 2 - 0.005);
      const fr = add(H, rbox(w * 0.98, h * 0.07, d * 0.18, 0.02), hairM, 0, h * 0.4, d / 2 - d * 0.06); fr.rotation.x = 0.15;
    } else if (st === 'swoop') { // big blond front swoop
      cap(w * 1.08, h * 0.24, d * 1.08, h / 2 - h * 0.06);
      const sw = add(H, rbox(w * 1.06, h * 0.22, d * 0.46, 0.07), hairM, 0.02, h / 2 + h * 0.04, d / 2 - d * 0.02); sw.rotation.set(-0.5, 0, -0.06);
      const sw2 = add(H, rbox(w * 0.9, h * 0.12, d * 0.3, 0.05), hairM, -0.03, h / 2 + h * 0.13, d / 2 - d * 0.1); sw2.rotation.set(-0.25, 0, 0.1);
      const side = add(H, rbox(w * 0.6, h * 0.12, d * 0.5, 0.05), hairM, w * 0.22, h / 2 + h * 0.06, d * 0.08); side.rotation.set(-0.15, 0, -0.18);
      for (const s of [-1, 1]) add(H, rbox(w * 0.08, h * 0.45, d * 0.85, 0.03), hairM, s * (w / 2 + 0.01), h * 0.16, -d * 0.06);
      add(H, rbox(w * 1.06, h * 0.55, d * 0.14, 0.04), hairM, 0, h * 0.12, -d / 2 - 0.01);
    } else if (st === 'receding') {
      cap(w * 1.05, h * 0.26, d * 0.82, h / 2 - h * 0.02, -d * 0.1);
      const hl = add(H, rbox(w * 0.7, h * 0.12, d * 0.2, 0.04), hairM, 0, h / 2 + h * 0.04, d * 0.24); hl.rotation.x = -0.25;
      for (const s of [-1, 1]) add(H, rbox(w * 0.05, h * 0.36, d * 0.62, 0.02), hairM, s * (w / 2 + 0.004), h * 0.2, -d * 0.16);
      add(H, rbox(w * 1.02, h * 0.48, d * 0.09, 0.03), hairM, 0, h * 0.14, -d / 2 - 0.005);
      
    } else if (st === 'messy') {
      cap(w * 1.06, h * 0.22, d * 1.06, h / 2 - h * 0.06);
      let sd = 3; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
      for (let i = 0; i < 14; i++) { const t = add(H, rbox(w * 0.22, h * 0.07, d * 0.22, 0.02), hairM, (rn() - 0.5) * w * 1.0, h / 2 + rn() * 0.03, (rn() - 0.5) * d * 0.9); t.rotation.set((rn() - 0.5) * 0.9, rn() * 3, (rn() - 0.5) * 0.9); }
      for (const s of [-1, 1]) add(H, rbox(w * 0.08, h * 0.45, d * 0.85, 0.03), hairM, s * (w / 2 + 0.01), h * 0.14, -d * 0.06);
      add(H, rbox(w * 1.04, h * 0.55, d * 0.12, 0.04), hairM, 0, h * 0.1, -d / 2 - 0.008);
    } else if (st === 'slick') {
      const c = cap(w * 1.05, h * 0.2, d * 1.04, h / 2 - h * 0.04); c.scale.z = 1.0;
      for (let i = 0; i < 5; i++) add(H, new THREE.BoxGeometry(0.005, 0.004, d * 0.85), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.12 }), (i - 2) * w * 0.16, h / 2 + h * 0.058, -0.02);
      for (const s of [-1, 1]) add(H, rbox(w * 0.05, h * 0.36, d * 0.78, 0.02), hairM, s * (w / 2 + 0.004), h * 0.2, -d * 0.1);
      add(H, rbox(w * 1.02, h * 0.5, d * 0.1, 0.03), hairM, 0, h * 0.14, -d / 2 - 0.005);
    } else if (st === 'horseshoe') {
      for (const s of [-1, 1]) add(H, rbox(w * 0.07, h * 0.3, d * 0.75, 0.025), hairM, s * (w / 2 + 0.01), h * 0.08, -d * 0.1);
      add(H, rbox(w * 1.06, h * 0.32, d * 0.12, 0.04), hairM, 0, h * 0.06, -d / 2 - 0.01);
    } else if (st === 'bob') {
      cap(w * 1.08, h * 0.26, d * 1.08, h / 2 - h * 0.05);
      for (const s of [-1, 1]) add(H, rbox(w * 0.12, h * 0.74, d * 0.92, 0.045), hairM, s * (w / 2 + 0.028), h * 0.03, -d * 0.06);
      add(H, rbox(w * 1.1, h * 0.76, d * 0.14, 0.05), hairM, 0, h * 0.03, -d / 2 - 0.02);
      const fr = add(H, rbox(w * 1.0, h * 0.13, d * 0.16, 0.045), hairM, -w * 0.04, h * 0.37, d / 2 - d * 0.04); fr.rotation.z = 0.1;
    } else if (st === 'ponytail') {
      cap(w * 1.06, h * 0.24, d * 1.06, h / 2 - h * 0.06);
      for (const s of [-1, 1]) add(H, rbox(w * 0.06, h * 0.42, d * 0.8, 0.02), hairM, s * (w / 2 + 0.005), h * 0.17, -d * 0.08);
      add(H, rbox(w * 1.02, h * 0.5, d * 0.1, 0.03), hairM, 0, h * 0.13, -d / 2 - 0.005);
      const tail = add(H, new THREE.CapsuleGeometry(w * 0.09, h * 0.45, 6, 12), hairM, 0, h * 0.05, -d / 2 - 0.08); tail.rotation.x = 0.35;
    } else if (st === 'side') {
      cap(w * 1.05, h * 0.23, d * 1.05, h / 2 - h * 0.065);
      const lift = add(H, rbox(w * 0.6, h * 0.1, d * 0.3, 0.04), hairM, w * 0.15, h / 2 + 0.005, d / 2 - d * 0.18); lift.rotation.x = -0.2;
      add(H, new THREE.BoxGeometry(0.008, 0.012, d * 0.7), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25 }), -w * 0.18, h / 2 + 0.008, 0);
      for (const s of [-1, 1]) add(H, rbox(w * 0.06, h * 0.4, d * 0.8, 0.02), hairM, s * (w / 2 + 0.005), h * 0.17, -d * 0.08);
      add(H, rbox(w * 1.02, h * 0.5, d * 0.1, 0.03), hairM, 0, h * 0.13, -d / 2 - 0.005);
    }
  }

  function buildGlasses(head, p, hd, E, fz, F) {
    const fm = F(p.glasses.color, 'dark'); const lens = p.glasses.style === 'shades' ? new THREE.MeshPhysicalMaterial({ color: 0x0a0a0a, roughness: 0.08, clearcoat: 1, metalness: 0.3 }) : F('#ffffff', 'glass');
    const G = new THREE.Group(); head.add(G);
    const lw = E.size * 3.0, lh = E.size * (p.glasses.style === 'round' ? 3.0 : 2.3), rr = p.glasses.style === 'round' ? lh * 0.5 : lh * 0.25;
    const outer = roundRectShape(lw, lh, rr); const inner = roundRectShape(lw - 0.016, lh - 0.016, Math.max(0.002, rr - 0.008)); outer.holes.push(inner);
    const frameGeo = new THREE.ExtrudeGeometry(outer, { depth: 0.012, bevelEnabled: false, curveSegments: 12 });
    const lensGeo = new THREE.ShapeGeometry(roundRectShape(lw - 0.016, lh - 0.016, Math.max(0.002, rr - 0.008)), 12);
    const z = fz + 0.035;
    for (const s of [-1, 1]) {
      add(G, frameGeo, fm, s * E.spacing, E.y, z);
      add(G, lensGeo, lens, s * E.spacing, E.y, z + 0.006);
      const arm = add(G, new THREE.BoxGeometry(0.01, 0.01, hd.d * 0.62), fm, s * (hd.w / 2 + 0.004), E.y + lh * 0.3, z - hd.d * 0.31);
      add(G, new THREE.BoxGeometry(Math.abs(hd.w / 2 - (E.spacing + lw / 2)) + 0.01, 0.012, 0.012), fm, s * (E.spacing + lw / 2 + (hd.w / 2 - E.spacing - lw / 2) / 2), E.y + lh * 0.3, z + 0.006);
    }
    add(G, new THREE.BoxGeometry(E.spacing * 2 - lw, 0.012, 0.012), fm, 0, E.y + lh * 0.18, z + 0.006);
  }

  // ---------------- expressions ----------------
  function setExpression(root, name, blend = 1) {
    const R = root.userData.rig, p = root.userData.p; const X = EXPRESSIONS[name] || EXPRESSIONS.neutral;
    root.userData.expression = name;
    const open = clamp(p.eyes.open * X.open, 0.12, 1.6);
    for (const g of R.eyes) { const u = g.userData; u.inner.scale.y = open; u.pupil.scale.set(X.pupil, X.pupil, 0.3); u.iris.scale.set(1, 1, 0.35);
      const px = (X.pupilX || 0) * p.eyes.size * 0.45; u.pupil.position.x = px; u.iris.position.x = px;
      u.lid.position.y = p.eyes.size * (0.55 + 0.45 * open); u.lid.scale.y = 1; }
    for (const br of R.brows) { const s = br.userData.side; br.position.y = br.userData.y0 + X.brow[0] * 0.5 - (1 - Math.min(1, open)) * 0.02; br.rotation.z = s * X.brow[1] * -1; }
    for (const k in R.mouth) R.mouth[k].visible = k === X.mouth;
  }

  // ---------------- poses (joint rotations) ----------------
  const ZERO = { spine: [0, 0, 0], neck: [0, 0, 0], head: [0, 0, 0], shoulderL: [0, 0, -0.12], shoulderR: [0, 0, 0.12], elbowL: [-0.15, 0, 0], elbowR: [-0.15, 0, 0], wristL: [0, 0, 0], wristR: [0, 0, 0], hipL: [0, 0, 0], hipR: [0, 0, 0], kneeL: [0, 0, 0], kneeR: [0, 0, 0] };
  function poseTable(name, t) {
    const P = structuredClone(ZERO); const bob = Math.sin(t * 2.2) * 0.02;
    P.spine[0] = bob * 0.5; P.head[2] = Math.sin(t * 1.3) * 0.03;
    switch (name) {
      case 'point': P.shoulderR = [-1.45, 0, 0.12]; P.elbowR = [-0.05, 0, 0]; P.head[1] = -0.1; break;
      case 'shrug': P.shoulderL = [0, 0, -0.45]; P.shoulderR = [0, 0, 0.45]; P.elbowL = [-1.45, -0.5, 0]; P.elbowR = [-1.45, 0.5, 0]; P.wristL = [0, 0, -0.6]; P.wristR = [0, 0, 0.6]; P.head[2] = 0.18; P.neck[1] = 0.05; break;
      case 'handsUp': P.shoulderL = [0, 0, -2.5]; P.shoulderR = [0, 0, 2.5]; P.elbowL = [0, 0, -0.5]; P.elbowR = [0, 0, 0.5]; P.spine[0] = -0.08; break;
      case 'facepalm': P.shoulderR = [-2.1, 0, -0.35]; P.elbowR = [-2.25, 0, 0]; P.head = [0.35, 0, 0]; P.spine[0] = 0.12; break;
      case 'think': P.shoulderR = [-0.75, 0, -0.32]; P.elbowR = [-2.35, 0, 0]; P.shoulderL = [-0.4, 0, 0.3]; P.elbowL = [-1.5, 0, 0]; P.head = [0.05, 0.1, 0.12]; break;
      case 'crossed': P.shoulderL = [-0.38, 0, 0.16]; P.shoulderR = [-0.42, 0, -0.16]; P.elbowL = [-1.2, 1.3, 0]; P.elbowR = [-1.25, -1.3, 0]; break;
      case 'podium': P.shoulderL = [-0.55, 0, -0.12]; P.shoulderR = [-0.55, 0, 0.12]; P.elbowL = [-0.95, 0, 0]; P.elbowR = [-0.95, 0, 0]; P.head[0] = 0.05; break;
      case 'wave': P.shoulderR = [0, 0, 2.6]; P.elbowR = [0, 0, 0.55 + Math.sin(t * 9) * 0.35]; P.head[2] = 0.08; break;
      case 'presenting': P.shoulderR = [-0.55, 0, 0.5]; P.elbowR = [-0.75, 0, 0]; P.wristR = [0, 0, 0.5]; P.shoulderL = [-0.55, 0, -0.5]; P.elbowL = [-0.75, 0, 0]; P.wristL = [0, 0, -0.5]; break;
      case 'evilRub': { const r = Math.sin(t * 2 * Math.PI * 4.5) * 0.11; const sway = Math.sin(t * 1.3);
        P.spine = [0.16 + Math.sin(t * 9) * 0.01, sway * 0.05, 0]; P.neck = [0.1, 0, 0]; P.head = [0.1, -sway * 0.08, sway * 0.07];
        P.shoulderL = [-0.75, 0, 0.78]; P.shoulderR = [-0.75, 0, -0.78]; P.elbowL = [-1.15, 1.55 + r, 0]; P.elbowR = [-1.15, -1.55 + r, 0]; P.wristL = [0, -1.3, r * 1.2]; P.wristR = [0, 1.3, r * 1.2]; break; }
      case 'rubHands': { const r = Math.sin(t * 14) * 0.08; P.shoulderL = [-0.7, 0, 0.42]; P.shoulderR = [-0.7, 0, -0.42]; P.elbowL = [-1.1, 0.75 + r, 0]; P.elbowR = [-1.1, -0.75 + r, 0]; P.head[0] = 0.08; break; }
      case 'handsBehind': P.shoulderL = [0.45, 0, 0.12]; P.shoulderR = [0.45, 0, -0.12]; P.elbowL = [-0.55, -0.6, 0]; P.elbowR = [-0.55, 0.6, 0]; P.spine[0] = -0.05; P.head[0] = -0.08; break;
      case 'handshake': P.shoulderR = [-0.85, 0, 0.05]; P.elbowR = [-0.45, 0, 0]; P.wristR = [0, Math.PI / 2, 0]; P.elbowR[0] += Math.sin(t * 9) * 0.06; break;
      case 'phone': P.shoulderR = [-0.2, 0, -0.35]; P.elbowR = [-2.6, 0, 0]; P.wristR = [0, 0.4, 0]; P.head[2] = 0.12; break;
      case 'countMoney': P.shoulderL = [-0.55, 0, 0.3]; P.shoulderR = [-0.55, 0, -0.3]; P.elbowL = [-1.1, 0.5, 0]; P.elbowR = [-1.1, -0.5, 0]; P.head[0] = 0.25; break;
      case 'thumbsUp': P.shoulderR = [-1.0, 0, 0.35]; P.elbowR = [-1.2, 0, 0]; P.wristR = [0, -0.6, 0]; P.head[2] = 0.06; break;
      case 'lookDown': P.shoulderL = [0.45, 0, 0.12]; P.shoulderR = [0.45, 0, -0.12]; P.elbowL = [-0.55, -0.6, 0]; P.elbowR = [-0.55, 0.6, 0]; P.neck[0] = 0.25; P.head[0] = 0.35; break;
      case 'sit': P.shoulderL = [-0.35, 0, -0.08]; P.shoulderR = [-0.35, 0, 0.08]; P.elbowL = [-0.9, 0, 0]; P.elbowR = [-0.9, 0, 0]; break;
      case 'lookPhone': P.shoulderR = [-0.75, 0, -0.32]; P.elbowR = [-1.75, 0.25, 0]; P.wristR = [0.25, 0.15, 0]; P.shoulderL = [-0.35, 0, 0.28]; P.elbowL = [-1.25, 0.6, 0]; P.neck = [0.22, 0, 0]; P.head = [0.25, 0, 0]; break;
      case 'showPhone': P.shoulderL = [-1.35, 0, 0.12]; P.elbowL = [-0.35, 0, 0]; P.wristL = [-0.2, 0, 0]; P.head = [0.0, 0.0, 0.05]; break;
      case 'celebrate': { const pump = Math.abs(Math.sin(t * 7)); P.shoulderL = [-0.2, 0, -2.4 - pump * 0.25]; P.elbowL = [0, 0, -0.9 + pump * 0.4]; P.shoulderR = [-2.7, 0, 0.25]; P.elbowR = [-0.3, 0, 0]; P.wristR = [0.2, Math.PI, 0]; P.spine = [-0.08, Math.sin(t * 7) * 0.05, 0]; P.head = [-0.15, 0, Math.sin(t * 7) * 0.06]; break; }
      case 'eat': { const ch = Math.sin(t * 9) * 0.06; P.shoulderR = [-0.85, 0, -0.42]; P.elbowR = [-2.0 + ch, 0.1, 0]; P.wristR = [0.1, 0, 0]; P.head = [0.04, 0, Math.sin(t * 4.5) * 0.03]; break; }
      case 'laugh': { const sh = Math.sin(t * 15) * 0.04; P.spine = [-0.18 + sh, 0, 0]; P.neck = [-0.15, 0, 0]; P.head = [-0.3 + sh, 0, 0.05]; P.shoulderL = [-0.45, 0, 0.35]; P.shoulderR = [-0.45, 0, -0.35]; P.elbowL = [-1.5, 0.6, 0]; P.elbowR = [-1.5, -0.6, 0]; break; }
      case 'stretch': P.shoulderL = [0, 0, -2.85]; P.shoulderR = [0, 0, 2.85]; P.elbowL = [0, 0, -0.25]; P.elbowR = [0, 0, 0.25]; P.spine = [-0.1, 0, 0]; P.head = [-0.2, 0, 0]; break;
      case 'lean': P.spine = [0.32, 0, 0]; P.neck = [-0.12, 0, 0]; P.head = [-0.12, 0, 0]; P.shoulderL = [-1.15, 0, -0.02]; P.shoulderR = [-1.15, 0, 0.02]; P.elbowL = [-0.05, 0, 0]; P.elbowR = [-0.05, 0, 0]; P.wristL = [0.4, 0, 0]; P.wristR = [0.4, 0, 0]; break; // fists on a table top ~0.78 high, ~0.63 ahead
      case 'sleep': P.shoulderL = [0, 0, -0.08]; P.shoulderR = [0, 0, 0.08]; P.elbowL = [-0.1, 0, 0]; P.elbowR = [-0.1, 0, 0]; P.spine[0] = 0; P.head = [0, 0, 0.15]; break;
      case 'headHands': P.shoulderL = [-1.0, 0, -1.25]; P.shoulderR = [-1.0, 0, 1.25]; P.elbowL = [-2.3, 0, 0]; P.elbowR = [-2.3, 0, 0]; P.head = [0.05, 0, 0]; break;
      case 'walk': { const w = Math.sin(t * 6); P.hipL[0] = w * 0.5; P.hipR[0] = -w * 0.5; P.kneeL[0] = Math.max(0, -w) * 0.8; P.kneeR[0] = Math.max(0, w) * 0.8; P.shoulderL[0] = -w * 0.45; P.shoulderR[0] = w * 0.45; P.elbowL[0] = -0.35; P.elbowR[0] = -0.35; P.spine[1] = w * 0.06; break; }
    }
    return P;
  }
  // ---------------- hand gestures ----------------
  // finger curl per gesture [index, middle, ring, pinky] (rad) + thumb [x, z-mult]
  const GEST = {
    open: { f: [0.05, 0.05, 0.05, 0.05], th: [0, 0.7] }, relaxed: { f: [0.35, 0.45, 0.55, 0.6], th: [0.2, 0.6] },
    fist: { f: [1.7, 1.7, 1.7, 1.7], th: [0.9, 0.2] }, point: { f: [0, 1.7, 1.7, 1.7], th: [0.9, 0.2] },
    thumbsUp: { f: [1.7, 1.7, 1.7, 1.7], th: [0, -2.4] }, peace: { f: [0, 0, 1.7, 1.7], th: [0.9, 0.2] },
    grab: { f: [0.9, 0.95, 1.0, 1.0], th: [0.6, 0.4] }, money: { f: [0.9, 1.0, 1.1, 1.2], th: [0.6, 0.3], rub: true },
  };
  const POSE_HANDS = { evilRub: ['relaxed', 'relaxed'], lookPhone: ['relaxed', 'grab'], showPhone: ['grab', 'relaxed'], celebrate: ['fist', 'grab'], eat: ['relaxed', 'grab'], laugh: ['open', 'open'], stretch: ['open', 'open'], lean: ['fist', 'fist'], sit: ['relaxed', 'relaxed'], headHands: ['open', 'open'], point: ['relaxed', 'point'], thumbsUp: ['relaxed', 'thumbsUp'], countMoney: ['money', 'money'], rubHands: ['open', 'open'], crossed: ['fist', 'fist'], handsBehind: ['grab', 'grab'], lookDown: ['grab', 'grab'], handshake: ['relaxed', 'grab'], phone: ['relaxed', 'grab'], facepalm: ['relaxed', 'open'], think: ['relaxed', 'fist'], wave: ['relaxed', 'open'], handsUp: ['open', 'open'], shrug: ['open', 'open'], presenting: ['open', 'open'] };
  function setHand(root, side, gesture, t = 0) {
    const wr = root.userData.rig[side === 'L' ? 'wristL' : 'wristR']; if (!wr) return; const g = GEST[gesture] || GEST.relaxed; const s = side === 'L' ? -1 : 1;
    wr.userData.fingers.forEach((f, i) => { f.rotation.set(-g.f[i] * 0.6, 0, 0); if (f.userData.tip) f.userData.tip.rotation.set(-g.f[i] * 0.85, 0, 0); });
    const th = wr.userData.thumb; const rub = g.rub ? Math.sin(t * 16) * 0.35 : 0;
    th.rotation.set(-g.th[0] + rub, 0, -s * g.th[1]);
  }
  function setPose(root, name, t = 0, o = {}) {
    const R = root.userData.rig; const P = poseTable(name, t); root.userData.pose = name;
    if (o.sit || name === 'sit') { P.hipL = [-1.5, 0.06, 0]; P.hipR = [-1.5, -0.06, 0]; P.kneeL = [1.45, 0, 0]; P.kneeR = [1.45, 0, 0]; if (Math.abs(P.spine[0]) < 0.05) P.spine[0] = 0.03; }
    for (const j in P) if (R[j]) R[j].rotation.set(P[j][0], P[j][1], P[j][2]);
    const ph = POSE_HANDS[name] || ['relaxed', 'relaxed']; const hs = root.userData.p.hands || {};
    setHand(root, 'L', hs.L && hs.L !== 'auto' ? hs.L : ph[0], t); setHand(root, 'R', hs.R && hs.R !== 'auto' ? hs.R : ph[1], t);
    if (name === 'evilRub') for (const w of [R.wristL, R.wristR]) w.userData.fingers.forEach((f, i) => { const c = 0.35 + 0.3 * Math.sin(t * 2 * Math.PI * 4.5 + i * 0.7); f.rotation.x = -c * 0.6; if (f.userData.tip) f.userData.tip.rotation.x = -c * 0.85; });
    // walking bob
    R.hips.position.y = root.userData.p.body.legLen * root.userData.p.body.height + (name === 'walk' ? Math.abs(Math.sin(t * 6)) * 0.02 : 0);
  }

  // ---------------- holding things ----------------
  // Parent an object to the palm so it moves with the hand (never floating next to it).
  // Grip frame: x = across the palm, y = toward the wrist (fingertips are -y), z = out of the palm.
  function grip(root, side) { const wr = root.userData.rig[side === 'L' ? 'wristL' : 'wristR']; const a = root.userData.p.body.arms;
    if (!wr.userData.grip) { const g = new THREE.Group(); g.position.set(0, -a * 1.35, a * 0.5); wr.add(g); wr.userData.grip = g; } return wr.userData.grip; }
  function hold(root, side, obj, o = {}) { const g = grip(root, side); g.add(obj); obj.position.set(...(o.at || [0, 0, 0])); obj.rotation.set(...(o.rot || [0, 0, 0])); if (o.scale) obj.scale.setScalar(o.scale); obj.visible = true; return obj; }
  // seated: lift/lower the root so the thighs rest on a seat of height seatY
  function sitY(root, seatY = 0.45) { const p = root.userData.p, k = p.body.height, legLen = p.body.legLen * k; return seatY + 0.07 - legLen; }
  // mouth flap for dialogue: a = 0..1 (from the voice envelope); 0 restores the expression's mouth
  function setMouthOpen(root, a) { const R = root.userData.rig; const X = EXPRESSIONS[root.userData.expression] || EXPRESSIONS.neutral;
    if (a > 0.06) { for (const k in R.mouth) R.mouth[k].visible = k === 'talk'; const m = R.mouth.talk; m.scale.set(0.8 + a * 0.22, 0.22 + a * 0.78, 1); }
    else for (const k in R.mouth) R.mouth[k].visible = k === X.mouth; }
  function blink(root, t, seed = 0) { const ph = (t + seed * 1.7) % 3.7; const b = ph < 0.13 ? Math.sin(ph / 0.13 * Math.PI) : 0; if (b <= 0) return; for (const g of root.userData.rig.eyes) g.userData.inner.scale.y *= (1 - 0.92 * b); }

  function deepMerge(a, b) { for (const k in b) { if (b[k] && typeof b[k] === 'object' && !Array.isArray(b[k])) { a[k] = deepMerge(a[k] || {}, b[k]); } else a[k] = b[k]; } return a; }

  // crowd: random townsperson with plain clothes
  function townsperson(seed = 1) { let s = seed * 9301 + 49297; const rn = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const pick = (a) => a[Math.floor(rn() * a.length)];
    return P({ name: 'Persona', skin: pick(['#f1c9a5', '#e0a882', '#c68a5e', '#a86f4a', '#8d5a3b', '#f0d0b5']),
      head: { w: 0.56 + rn() * 0.1, h: 0.6 + rn() * 0.12, d: 0.56, round: 0.1 + rn() * 0.08, jowl: rn() < 0.3 ? rn() * 0.5 : 0 },
      eyes: { size: 0.056 + rn() * 0.012, open: 0.7 + rn() * 0.3, tilt: rn() < 0.25 ? 0.1 : 0 },
      hair: { style: pick(['short', 'short', 'side', 'messy', 'receding', 'bald', 'bob']), color: pick(['#2a1d14', '#111111', '#6b4a2b', '#b08a5a', '#9a9a9a', '#5a3a22']) },
      glasses: { style: rn() < 0.2 ? pick(['square', 'round']) : 'none' },
      body: { shoulders: 0.48 + rn() * 0.12, chest: 0.28 + rn() * 0.06, belly: rn() < 0.25 ? 0.4 + rn() * 0.5 : rn() * 0.25, height: 0.9 + rn() * 0.16 },
      outfit: { type: pick(['tee', 'tee', 'shirt', 'sweater']), top: pick(['#d65c5c', '#3a7bd5', '#76b900', '#e0c050', '#8a5cd6', '#2fb5a3', '#e08a3a', '#8fb6e0', '#f2f2f2']), pants: pick(['#2b2f3a', '#3a4a6a', '#c2a77e', '#4a4a4a', '#6b4a2e']), shoes: pick(['#1a1a1a', '#4a3424', '#f2f2f2']) },
      expression: pick(['neutral', 'happy', 'worried', 'surprised', 'neutral']) }); }
  return { DEFAULT, PRESETS, EXPRESSIONS, POSES, GESTURES, FINISHES: ['vinyl', 'clay', 'pixar'], build, setExpression, setPose, setHand, hold, grip, sitY, setMouthOpen, blink, townsperson, deepMerge, makeMat, rbox };
}
