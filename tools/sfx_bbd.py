# Sound-effects-only track for "Compra, pide prestado, muere", aligned to the video timeline (t=0 = video start).
# Also writes the cue sheet (time, effect, what happens). No music, no voices.
import numpy as np, wave, json, sys, os, unicodedata, re
SR = 44100; rng = np.random.default_rng(5)
root, out_wav, out_md = sys.argv[1], sys.argv[2], sys.argv[3]
D = json.load(open(os.path.join(root, 'scenes', 'words_bbd.json'))); W = D['words']; LN = {l['id']: l for l in D['lines']}
norm = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
def wAt(line, txt):
    for w in W:
        if w['line'] == line and norm(w['text']) == norm(txt): return w['start']
    return LN[line]['start']
END = 71.5; N = int(SR * END); L = np.zeros(N); R = np.zeros(N); CUES = []
t_ = lambda d: np.arange(int(SR * d)) / SR
def fft_filter(x, lo=None, hi=None):
    F = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)
    if hi: g *= 1 / np.sqrt(1 + (f / hi) ** 4)
    return np.fft.irfft(F * g, len(x))
def nrm(x, a=1.0): return x / (np.abs(x).max() + 1e-9) * a
def put(sig, t, g=1.0, pan=0.0, name=None, what=None):
    i = int(SR * t); j = min(N, i + len(sig)); L[i:j] += sig[:j - i] * g * (1 - max(0, pan)); R[i:j] += sig[:j - i] * g * (1 + min(0, pan))
    if name: CUES.append((t, name, what))
# ---------- effect synths ----------
def whoosh(d=0.45):
    t = t_(d); n = rng.standard_normal(len(t)); env = np.sin(np.pi * t / d) ** 2
    lo = fft_filter(n, 300, 1200); hi = fft_filter(n, 1500, 6000); mix = lo * (1 - t / d) + hi * (t / d); return nrm(mix * env, 0.5)
def pop():
    t = t_(0.09); f = 900 * np.exp(-t * 25) + 300; return nrm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40), 0.45)
def blip(f0=1300):
    t = t_(0.07); return nrm(np.sign(np.sin(2 * np.pi * f0 * t)) * 0.4 * np.exp(-t * 45) + np.sin(2 * np.pi * f0 * t) * np.exp(-t * 45), 0.3)
def phone_ding():
    t = t_(0.7); return nrm((np.sin(2 * np.pi * 1568 * t) * np.exp(-t * 6) + 0.6 * np.sin(2 * np.pi * 2093 * np.maximum(0, t - 0.12)) * (t > 0.12) * np.exp(-np.maximum(0, t - 0.12) * 6)), 0.4)
def engine(d=2.2):
    t = t_(d); f0 = 38 + 22 * np.minimum(1, t / 1.6); ph = 2 * np.pi * np.cumsum(f0) / SR
    e = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) * (0.3 + 0.7 * np.minimum(1, t / 1.4)) * np.exp(-np.maximum(0, t - 1.8) * 8)
    return nrm(e + 0.15 * fft_filter(rng.standard_normal(len(t)), 80, 600) * np.minimum(1, t / 1.4), 0.6)
def brakes():
    t = t_(0.5); n = fft_filter(rng.standard_normal(len(t)), 2500, 5000) * np.sin(np.pi * t / 0.5) * (1 + 0.3 * np.sin(2 * np.pi * 30 * t)); return nrm(n, 0.25)
def door():
    t = t_(0.35); thud = np.sin(2 * np.pi * 70 * t) * np.exp(-t * 22); click = fft_filter(rng.standard_normal(len(t)), 2000, 8000) * np.exp(-t * 90)
    return nrm(thud + 0.4 * click, 0.7)
def hammer():
    t = t_(0.18); return nrm(fft_filter(rng.standard_normal(len(t)), 400, 3000) * np.exp(-t * 35) + 0.6 * np.sin(2 * np.pi * 180 * t) * np.exp(-t * 30), 0.4)
def crane_beep():
    t = t_(0.18); return nrm(np.sin(2 * np.pi * 1050 * t) * (t < 0.15), 0.18)
def ka_ching():
    t = t_(1.3); bell = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * dcy) for f, a, dcy in [(2637, 1, 3), (3520, 0.6, 4), (5274, 0.3, 6)])
    drawer = fft_filter(rng.standard_normal(len(t)), 800, 4000) * np.exp(-t * 18) * (t < 0.25); return nrm(np.concatenate([np.zeros(int(SR * 0.12)), bell])[:len(t)] + 0.6 * drawer, 0.6)
def shimmer(d=1.2):
    t = t_(d); s = np.zeros_like(t)
    for _ in range(18): k = rng.uniform(0, d * 0.8); f = rng.uniform(2500, 6000); s += np.sin(2 * np.pi * f * t) * np.exp(-np.maximum(0, t - k) * 12) * (t > k)
    return nrm(s, 0.25)
def bike_bell():
    t = t_(0.9); one = lambda tt: (np.sin(2 * np.pi * 3100 * tt) + 0.5 * np.sin(2 * np.pi * 4200 * tt)) * np.exp(-tt * 9) * (1 + 0.4 * np.sin(2 * np.pi * 18 * tt))
    s = one(t); s[int(SR * 0.22):] += one(t[:len(t) - int(SR * 0.22)]); return nrm(s, 0.4)
def footsteps(n=4, gap=0.32):
    st = np.zeros(int(SR * (n * gap + 0.2)))
    for k in range(n): t = t_(0.12); s = fft_filter(rng.standard_normal(len(t)), 150, 1500) * np.exp(-t * 40); i = int(SR * k * gap); st[i:i + len(s)] += s
    return nrm(st, 0.35)
def rumble_rise(d=2.0):
    t = t_(d); r = fft_filter(rng.standard_normal(len(t)), 30, 140) * np.minimum(1, t / 0.4) * np.exp(-np.maximum(0, t - 1.4) * 4)
    sw = fft_filter(rng.standard_normal(len(t)), 800, 5000) * (t / d) ** 2 * np.exp(-np.maximum(0, t - 1.6) * 10); return nrm(r + 0.35 * sw, 0.7)
def sparkle(d=1.4): return shimmer(d)
def rewind(d=1.1):
    t = t_(d); f = 200 + 1600 * np.abs(np.sin(np.pi * t / d * 2)); saw = 2 * ((np.cumsum(f) / SR) % 1) - 1; return nrm(fft_filter(saw, 200, 4000) * np.sin(np.pi * t / d), 0.3)
def boom():
    t = t_(2.0); f = 30 + 60 * np.exp(-t * 6); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) + 0.5 * fft_filter(rng.standard_normal(len(t)), 40, 400) * np.exp(-t * 5); return nrm(s, 0.9)
def crickets(d):
    t = t_(d); s = np.zeros_like(t)
    for k in np.arange(0, d, 0.55): ch = (np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 30 * t) > 0)) * ((t > k) & (t < k + 0.18)); s += ch
    return nrm(fft_filter(s, 3000, 6000), 0.08)
def city_bed(d):
    t = t_(d); b = fft_filter(rng.standard_normal(len(t)), 60, 500); return nrm(b, 0.05)
def chatter_laugh(): return None
# ---------- timeline (mirrors scenes/bbd.html) ----------
T = dict(carStart=LN['N1']['end'] + 0.05, door=7.0, n2=LN['N2']['start'], bankUp=20.5, office=LN['M2']['start'] - 0.25, n3=LN['N3']['start'] - 0.25, a1=LN['A1']['start'] - 0.3,
         gordo=45.0, n4=LN['N4']['start'] - 0.3, n5=LN['N5']['start'] - 0.25, n6=LN['N6']['start'] - 0.3)
# ambience beds (very low)
put(city_bed(T['n3']), 0, 1.0, name='Ambiente de ciudad (muy bajito)', what='Fondo de calle mientras pasa la historia de día')
put(city_bed(T['n4'] - T['a1']), T['a1'], 1.0)
put(crickets(T['n5'] - T['n4']), T['n4'], 1.0, name='Grillos (muy bajito)', what='Escena de noche, la herencia')
# events
put(pop(), 0.2, name='Pop', what='Aparece el título "COMPRA · PIDE PRESTADO · MUERE"')
put(phone_ding(), 0.6, name='Notificación de celular', what='El asalariado ve su quincena')
put(pop(), wAt('N1', 'impuestos'), 0.8, name='Pop', what='"impuestos" (le quitan su dinero)')
put(whoosh(), T['carStart'] - 0.25, name='Whoosh (corte)', what='Corte a la calle: llega el auto')
put(engine(), T['carStart'], name='Motor del auto de lujo', what='El auto viene hacia la cámara')
put(brakes(), T['door'] - 0.65, name='Frenos', what='El auto se detiene')
put(door(), T['door'] + 0.05, name='Puerta del auto', what='Se abre la puerta')
put(footsteps(3), T['door'] + 0.3, name='Pasos', what='El millonario sale del auto')
put(pop(), T['door'] + 0.4, name='Pop', what='Letrero "EL MILLONARIO"')
put(whoosh(), T['n2'] - 0.55, name='Whoosh (corte)', what='Corte al edificio en construcción')
put(pop(), T['n2'] - 0.2, name='Pop', what='"PARTE 1 · COMPRA"')
for k in range(int((LN['N2']['end'] - T['n2']) / 0.6)):
    put(hammer(), T['n2'] + 0.3 + k * 0.6, 0.8 if k % 2 else 1.0, pan=(-0.4 if k % 2 else 0.3))
put(np.zeros(1), T['n2'] + 0.3, name='Martillazos de obra (repetidos)', what='El edificio se levanta piso por piso')
for k in range(5): put(crane_beep(), T['n2'] + 1.5 + k * 1.3, pan=0.5)
put(np.zeros(1), T['n2'] + 1.5, name='Pitido de grúa (cada 1.3 s)', what='La grúa trabajando')
for w in ['acciones', 'edificios', 'empresas']: put(pop(), wAt('N2', w), name='Pop', what=f'Letrero "{w.upper()}"')
put(pop(), wAt('N2', 'impuestos'), name='Pop', what='"SI NO VENDE → $0 DE IMPUESTOS"')
put(whoosh(), T['bankUp'] - 0.25, name='Whoosh (corte)', what='Corte al banco: el banquero en su balcón')
put(pop(), T['bankUp'] + 0.1, name='Pop', what='"PARTE 2 · PIDE PRESTADO"'); put(pop(), T['bankUp'] + 0.5, name='Pop', what='Letrero "EL BANQUERO"')
put(whoosh(0.35), T['office'] - 0.2, 0.8, name='Whoosh (corte)', what='Corte a la oficina del banquero')
put(phone_ding(), LN['M3']['start'], name='Notificación de celular', what='El millonario enseña sus 48 edificios')
put(ka_ching(), LN['B2']['start'] - 0.05, name='¡Ka-ching! (caja registradora)', what='"¡APROBADO!"')
put(whoosh(), T['n3'] - 0.25, name='Whoosh (corte)', what='Corte al escenario azul')
for i in range(3): put(blip(1200 + i * 200), T['n3'] + 0.3 + 0.25 + i * 0.35, name='Bip de tablero' if i == 0 else None, what='Aparecen las líneas: PRÉSTAMO / ¿ES INGRESO? / IMPUESTOS' if i == 0 else None)
put(shimmer(1.4), T['n3'] + 0.3, name='Brillos de dinero', what='Crecen los billetes')
put(shimmer(1.2), wAt('N3', 'edificios'), name='Brillos', what='Crecen los edificios pequeños')
put(whoosh(), T['a1'] - 0.25, name='Whoosh (corte)', what='Corte: el asalariado pregunta desde la calle')
put(bike_bell(), LN['A2']['start'] - 0.15, name='Timbre de bici', what='"…¿Mi bici?" (aparece la bici)')
put(pop(), LN['A2']['start'] + 0.2, name='Pop', what='"GARANTÍA: UNA BICI"')
put(whoosh(), T['gordo'] - 0.25, name='Whoosh (corte)', what='Entra el magnate gordo')
put(footsteps(4, 0.3), T['gordo'] + 0.05, 1.2, name='Pasos pesados', what='El gordo camina hacia el asalariado')
put(pop(), T['gordo'] + 0.4, name='Pop', what='Letrero "EL MAGNATE"')
put(rumble_rise(2.2), wAt('G1', 'diez') - 0.25, name='Retumbe + subida', what='"¡Yo quiero diez!": salen 10 rascacielos')
put(pop(), wAt('G1', 'diez'), name='Pop', what='"×10 EDIFICIOS"')
put(whoosh(0.6), T['n4'] - 0.35, name='Whoosh lento (corte)', what='Corte a la noche')
put(pop(), T['n4'] + 0.1, name='Pop', what='"PARTE 3 · MUERE"')
put(sparkle(1.6), wAt('N4', 'reciben') - 0.3, name='Destello mágico', what='Aparece la llave de oro de la herencia')
for i in range(3): put(blip(1100 + i * 220), wAt('N4', 'reinicia') - 0.2 + 0.25 + i * 0.35, name='Bip de tablero' if i == 0 else None, what='GANANCIAS HEREDADAS / VALOR SE REINICIA / IMPUESTO $0' if i == 0 else None)
put(whoosh(), T['n5'] - 0.25, name='Whoosh (corte)', what='Corte de vuelta al día: el edificio')
put(pop(), T['n5'], name='Pop', what='"VENDE UN POCO → PAGA EL PRÉSTAMO"')
put(rewind(1.4), wAt('N5', 'juego') - 0.1, name='Rebobinado', what='"el juego vuelve a empezar" (el edificio baja y sube)')
put(whoosh(0.7), T['n6'] - 0.4, name='Whoosh largo (grúa)', what='La cámara sube del asalariado al banquero')
for w, label in [('compra', 'COMPRA'), ('pide', 'PIDE PRESTADO'), ('muere', 'MUERE'), ('legal', '¿LEGAL? SÍ'), ('justo', '¿JUSTO? TÚ DIME')]:
    put(pop(), wAt('N6', w), name='Pop', what=f'"{label}"')
put(boom(), LN['N6']['end'] + 0.15, name='Golpe final (boom)', what='Cierre del video')
# ---------- write ----------
mx = max(np.abs(L).max(), np.abs(R).max()); st = (np.stack([L, R], 1) / mx * 0.89 * 32767).astype(np.int16)
with wave.open(out_wav, 'w') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
CUES.sort(key=lambda c: c[0])
with open(out_md, 'w') as f:
    f.write('# Efectos de sonido · "Compra, pide prestado, muere"\n\nPista: `music/efectos_compra_pide_prestado_muere.mp3` (71.5 s). Empieza en 0:00 igual que el video.\n\n| Tiempo | Efecto | Qué pasa |\n|---|---|---|\n')
    for t, n, w in CUES: f.write(f"| {int(t // 60)}:{t % 60:05.2f} | {n} | {w} |\n")
print(len(CUES), 'cues')
