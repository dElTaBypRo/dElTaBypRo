# Sound-effects-only track for the Slim/Telmex video, aligned to the video timeline (t=0 = video start).
# Also writes the cue sheet (time, effect, what happens). No music, no voices.
# Run: python3 tools/sfx_amazon.py <repo_root> <out.wav> <out_cues.md>
import numpy as np, wave, json, sys, os, unicodedata, re
SR = 44100; rng = np.random.default_rng(7)
root, out_wav, out_md = sys.argv[1], sys.argv[2], sys.argv[3]
D = json.load(open(os.path.join(root, 'scenes', 'words_slim.json'))); W = D['words']; LN = {l['id']: l for l in D['lines']}
norm = lambda s: re.sub(r'[^a-z0-9%]', '', unicodedata.normalize('NFD', s.lower()).encode('ascii', 'ignore').decode())
def wAt(line, txt):
    for w in W:
        if w['line'] == line and norm(w['text']) == norm(txt): return w['start']
    raise KeyError((line, txt))
END = D['end']; N = int(SR * END); L = np.zeros(N); R = np.zeros(N); CUES = []
t_ = lambda d: np.arange(int(SR * d)) / SR
def fft_filter(x, lo=None, hi=None):
    F = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); g = np.ones_like(f)
    if lo: g *= 1 / np.sqrt(1 + (lo / np.maximum(f, 1)) ** 4)
    if hi: g *= 1 / np.sqrt(1 + (f / hi) ** 4)
    return np.fft.irfft(F * g, len(x))
def nrm(x, a=1.0): return x / (np.abs(x).max() + 1e-9) * a
def fade(x, a=0.3, b=0.3):
    n = len(x); ia, ib = min(n, int(SR * a)), min(n, int(SR * b)); x = x.copy(); x[:ia] *= np.linspace(0, 1, ia); x[n - ib:] *= np.linspace(1, 0, ib); return x
def put(sig, t, g=1.0, pan=0.0, name=None, what=None):
    i = int(SR * t); j = min(N, i + len(sig))
    if j > i: L[i:j] += sig[:j - i] * g * (1 - max(0, pan)); R[i:j] += sig[:j - i] * g * (1 + min(0, pan))
    if name: CUES.append((t, name, what))
# ---------- effect synths ----------
def whoosh(d=0.45):
    t = t_(d); n = rng.standard_normal(len(t)); env = np.sin(np.pi * t / d) ** 2
    lo = fft_filter(n, 300, 1200); hi = fft_filter(n, 1500, 6000); return nrm((lo * (1 - t / d) + hi * (t / d)) * env, 0.5)
def pop():
    t = t_(0.09); f = 900 * np.exp(-t * 25) + 300; return nrm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 40), 0.45)
def blip(f0=1300):
    t = t_(0.07); return nrm(np.sign(np.sin(2 * np.pi * f0 * t)) * 0.4 * np.exp(-t * 45) + np.sin(2 * np.pi * f0 * t) * np.exp(-t * 45), 0.3)
def phone_ding():
    t = t_(0.7); return nrm((np.sin(2 * np.pi * 1568 * t) * np.exp(-t * 6) + 0.6 * np.sin(2 * np.pi * 2093 * np.maximum(0, t - 0.12)) * (t > 0.12) * np.exp(-np.maximum(0, t - 0.12) * 6)), 0.4)
def ka_ching():
    t = t_(1.3); bell = sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * dcy) for f, a, dcy in [(2637, 1, 3), (3520, 0.6, 4), (5274, 0.3, 6)])
    drawer = fft_filter(rng.standard_normal(len(t)), 800, 4000) * np.exp(-t * 18) * (t < 0.25); return nrm(np.concatenate([np.zeros(int(SR * 0.12)), bell])[:len(t)] + 0.6 * drawer, 0.6)
def shimmer(d=1.2):
    t = t_(d); s = np.zeros_like(t)
    for _ in range(18): k = rng.uniform(0, d * 0.8); f = rng.uniform(2500, 6000); s += np.sin(2 * np.pi * f * t) * np.exp(-np.maximum(0, t - k) * 12) * (t > k)
    return nrm(s, 0.25)
def party_popper():
    t = t_(0.6); bang = fft_filter(rng.standard_normal(len(t)), 300, 5000) * np.exp(-t * 30); return nrm(bang, 0.6) + shimmer(0.6) * 0.8
def click():
    t = t_(0.06); return nrm(fft_filter(rng.standard_normal(len(t)), 1500, 9000) * np.exp(-t * 120) + 0.5 * np.sin(2 * np.pi * 2400 * t) * np.exp(-t * 90), 0.5)
def buzzer(d=0.55):
    t = t_(d); f = 110; s = np.sign(np.sin(2 * np.pi * f * t)) + 0.6 * np.sign(np.sin(2 * np.pi * f * 1.06 * t)); return nrm(fft_filter(s, 80, 2500) * (t < d - 0.03), 0.35)
def ting():
    t = t_(1.0); return nrm(sum(a * np.sin(2 * np.pi * f * t) * np.exp(-t * k) for f, a, k in [(3950, 1, 5), (5925, 0.5, 7), (7900, 0.25, 9)]), 0.35)
def sting():  # dramatic "dun!" + rise, for the evil idea
    t = t_(1.6); f = 46 + 20 * np.exp(-t * 5); hit = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.6) + 0.5 * fft_filter(rng.standard_normal(len(t)), 40, 500) * np.exp(-t * 6)
    stab = sum(np.sin(2 * np.pi * ff * t) for ff in (155.6, 185.0, 233.1, 311.1)) * np.exp(-t * 2.2) * 0.35; return nrm(hit + stab, 0.9)
def drone(d):
    t = t_(d); s = sum(a * np.sin(2 * np.pi * f * t + 0.3 * np.sin(2 * np.pi * 0.2 * t)) for f, a in [(55, 1), (58.3, 0.7), (110, 0.25)]); return fade(nrm(s, 0.2), 0.8, 0.6)
def room_tone(d):
    t = t_(d); return fade(nrm(fft_filter(rng.standard_normal(len(t)), 60, 400) + 0.3 * np.sin(2 * np.pi * 120 * t), 0.045), 0.4, 0.4)
def night_bed(d):
    t = t_(d); s = np.zeros_like(t)
    for k in np.arange(0, d, 0.55): s += (np.sin(2 * np.pi * 4300 * t) * (np.sin(2 * np.pi * 30 * t) > 0)) * ((t > k) & (t < k + 0.18))
    return fade(nrm(fft_filter(s, 3000, 6000), 0.07) + nrm(fft_filter(rng.standard_normal(len(t)), 60, 300), 0.03), 0.4, 0.4)
def wind(d):
    t = t_(d); n = fft_filter(rng.standard_normal(len(t)), 150, 900) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.35 * t)); return fade(nrm(n, 0.18), 0.5, 0.5)
def factory_bed(d):
    t = t_(d); hum = fft_filter(rng.standard_normal(len(t)), 50, 300) * 0.6 + 0.25 * np.sin(2 * np.pi * 98 * t); s = nrm(hum, 0.12)
    for k in np.arange(0.2, d, 0.75):  # rhythmic clank of the line
        tt = t_(0.2); c = fft_filter(rng.standard_normal(len(tt)), 600, 4000) * np.exp(-tt * 30) + 0.5 * np.sin(2 * np.pi * 320 * tt) * np.exp(-tt * 25); i = int(SR * k); s[i:i + len(c)] += nrm(c, 0.12)[:len(s) - i]
    for k in np.arange(0.6, d, 1.9):  # robot servo whirr
        tt = t_(0.5); f = 600 + 500 * np.sin(np.pi * tt / 0.5); c = np.sign(np.sin(2 * np.pi * np.cumsum(f) / SR)) * np.sin(np.pi * tt / 0.5); i = int(SR * k); s[i:i + len(c)] += nrm(fft_filter(c, 300, 3000), 0.05)[:len(s) - i]
    return fade(s, 0.3, 0.3)
def birds(d):
    t = t_(d); s = np.zeros_like(t)
    for k in np.arange(0.3, d, 0.7):
        if rng.random() < 0.35: continue
        n = rng.integers(2, 5); f0 = rng.uniform(2600, 4200)
        for j in range(n):
            tt = t_(0.09); ff = f0 * (1 + 0.25 * np.sin(np.pi * tt / 0.09)); ch = np.sin(2 * np.pi * np.cumsum(ff) / SR) * np.sin(np.pi * tt / 0.09); i = int(SR * (k + j * 0.11)); s[i:i + len(ch)] += ch[:max(0, len(s) - i)]
    return fade(nrm(s, 0.12), 0.5, 0.5)
def womp():  # sad descending "wah-wah"
    out = []
    for f0, d in [(392, 0.32), (370, 0.32), (349, 0.32), (330, 0.9)]:
        t = t_(d); f = f0 * (1 - 0.06 * (t / d) * (d > 0.5)); ph = 2 * np.pi * np.cumsum(f) / SR; s = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)) * np.minimum(1, t / 0.03) * np.exp(-t * (1.5 if d > 0.5 else 3)) * (1 + 0.25 * np.sin(2 * np.pi * 6 * t) * (d > 0.5))
        out.append(fft_filter(s, 150, 2500))
    return nrm(np.concatenate(out), 0.45)
def dun_dun():  # reveal sting: dun-dun-DUUN
    parts = []
    for f, d in [(98, 0.28), (92.5, 0.28), (73.4, 1.4)]:
        t = t_(d); ph = 2 * np.pi * f * t; parts.append((np.sin(ph) + 0.6 * np.sin(2 * ph) + 0.4 * np.sign(np.sin(ph)) * 0.3) * np.exp(-t * (6 if d < 1 else 1.6)))
    return nrm(fft_filter(np.concatenate(parts), 40, 3000), 0.8)
def boom():
    t = t_(2.0); f = 30 + 60 * np.exp(-t * 6); s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) + 0.5 * fft_filter(rng.standard_normal(len(t)), 40, 400) * np.exp(-t * 5); return nrm(s, 0.9)
def tape_stop(d=0.6, up=False):
    t = t_(d); k = t / d; f = 220 * ((k) if up else (1 - k)) + 30; saw = 2 * ((np.cumsum(f) / SR) % 1) - 1; return nrm(fft_filter(saw, 60, 3000) * np.sin(np.pi * np.minimum(1, k * 1.2) / 1.0) ** 0.5, 0.35)
def drop_boop():
    t = t_(0.35); f = 900 * np.exp(-t * 5) + 200; return nrm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 6), 0.4)
def rise_swoosh(d=0.6):
    t = t_(d); n = fft_filter(rng.standard_normal(len(t)), 800, 7000) * (t / d) ** 1.5 * np.exp(-np.maximum(0, t - d * 0.85) * 30); return nrm(n, 0.4)
def paper():
    t = t_(0.4); return nrm(fft_filter(rng.standard_normal(len(t)), 1500, 7000) * (np.abs(np.sin(2 * np.pi * 9 * t)) ** 3) * np.exp(-t * 4), 0.3)
def chew(d):
    s = np.zeros(int(SR * d))
    for k in np.arange(0, d - 0.15, 0.22): tt = t_(0.12); c = fft_filter(rng.standard_normal(len(tt)), 400, 2500) * np.exp(-tt * 30); i = int(SR * k); s[i:i + len(c)] += c
    return nrm(s, 0.12)
def clock_bed(d):
    s = np.zeros(int(SR * d))
    for k in np.arange(0.1, d, 1.0):
        tt = t_(0.05); c = fft_filter(rng.standard_normal(len(tt)), 2500, 8000) * np.exp(-tt * 120); i = int(SR * k); s[i:i + len(c)] += nrm(c, 0.05 if int(k) % 2 else 0.035)[:len(s) - i]
    return fade(s + nrm(fft_filter(rng.standard_normal(len(s)), 80, 600), 0.02), 0.3, 0.3)
def crowd_bed(d):
    t = t_(d); s = np.zeros_like(t)
    for _ in range(14):
        f0 = rng.uniform(110, 240); ph = 2 * np.pi * np.cumsum(f0 * (1 + 0.08 * np.sin(2 * np.pi * rng.uniform(1, 3) * t + rng.uniform(0, 6)))) / SR
        env = (np.sin(2 * np.pi * rng.uniform(0.3, 0.9) * t + rng.uniform(0, 6)) > 0.2) * 1.0; s += np.sin(ph) * np.convolve(env, np.ones(2000) / 2000, 'same')
    return fade(nrm(fft_filter(s, 150, 1800), 0.09), 0.5, 0.5)
def gavel():
    t = t_(0.35); return nrm(np.sin(2 * np.pi * 180 * t) * np.exp(-t * 28) + 0.8 * fft_filter(rng.standard_normal(len(t)), 500, 4000) * np.exp(-t * 60), 0.8)
def rewind_time(d=1.2):
    t = t_(d); f = 300 + 2200 * (t / d) ** 2; saw = 2 * ((np.cumsum(f) / SR) % 1) - 1; return nrm(fft_filter(saw, 200, 5000) * np.sin(np.pi * t / d) + 0.4 * whoosh(d), 0.4)
def coins(d=1.4):
    t = t_(d); s = np.zeros_like(t)
    for _ in range(40): k = rng.uniform(0, d * 0.85); f = rng.uniform(3000, 7000); s += np.sin(2 * np.pi * f * t) * np.exp(-np.maximum(0, t - k) * 30) * (t > k)
    return nrm(s, 0.3)
def stamp():
    t = t_(0.5); return nrm(np.sin(2 * np.pi * 60 * t) * np.exp(-t * 14) + 0.6 * fft_filter(rng.standard_normal(len(t)), 100, 1500) * np.exp(-t * 25), 0.9)
def poof():
    t = t_(0.6); return nrm(fft_filter(rng.standard_normal(len(t)), 300, 6000) * np.exp(-t * 7) * np.minimum(1, t / 0.02), 0.45) + shimmer(0.6) * 0.5
def boing():
    t = t_(0.5); f = 180 + 120 * np.sin(2 * np.pi * 9 * t) * np.exp(-t * 4); return nrm(np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 5), 0.4)
# ---------- timeline (mirrors scenes/slim.html: transitions sit in the gaps before S1, N5, N7, R1 and N10) ----------
st = lambda k: LN[k]['start']; en = lambda k: LN[k]['end']
T1990, T2012, TMONEY, T2014, THOME = st('S1') - 1.25, st('N5') - 1.1, st('N7') - 1.05, st('R1') - 1.05, st('N10') - 1.05
put(clock_bed(T1990), 0, name='Reloj de pared + ambiente de casa (bajito)', what='Sala del abuelo')
put(crowd_bed(T2012 - T1990), T1990, name='Murmullo de subasta', what='1990: la venta de Telmex')
put(room_tone(TMONEY - T2012), T2012, name='Zumbido de oficina (bajito)', what='2012: la oficina de la OCDE')
put(wind(T2014 - TMONEY), TMONEY, 0.6, name='Viento en la cima', what='La montaña de dinero')
put(room_tone(THOME - T2014), T2014)
put(clock_bed(END - THOME), THOME, name='Reloj de pared (bajito)', what='De regreso en la sala')
put(paper(), st('A1') - 0.2, name='Papel', what='El abuelo saca el recibo de 1995')
put(drop_boop(), wAt('A1', 'quincena'), 0.8, name='Bajón cómico', what='"…y adiós quincena"')
put(rewind_time(), T1990 - 0.05, name='Rebobinado (viaje al pasado)', what='Viajamos a 1990 (todo se pone sepia)')
put(gavel(), st('S1') - 0.05, name='Martillazo', what='"¡Se vende la telefónica…!"')
put(whoosh(0.3), st('C1') + 0.05, 0.6, name='Paleta arriba', what='Slim levanta su paleta')
put(ka_ching(), st('C1') + 0.8, 0.6, name='¡Ka-ching!', what='1,760 millones de dólares')
put(pop(), wAt('S2', '1996'), name='Pop', what='"Solo Telmex en larga distancia hasta 1996"')
for k in range(3): put(gavel(), st('C2') + 0.05 + k * 0.28, 0.9 if k else 1.0)
put(np.zeros(1), st('C2') + 0.05, name='Tres martillazos', what='"¡Trato hecho!"')
put(rewind_time(0.9)[::-1].copy(), T2012 - 0.05, 0.8, name='Avance rápido', what='Saltamos a 2012')
put(pop(), wAt('A3', '80%'), name='Pop', what='Gráfica: 80% de los fijos')
put(pop(), wAt('A3', '70%'), name='Pop', what='Gráfica: 70% de los celulares')
put(ka_ching(), wAt('O1', '129'), name='¡Ka-ching!', what='129 mil millones de dólares')
put(boing(), st('C3') - 0.1, name='Boing', what='Slim se asoma: "¡Esos datos están mal!"')
put(whoosh(0.6), TMONEY - 0.1, 0.8, name='Whoosh (corte)', what='La montaña de dinero')
put(coins(1.6), st('C4') - 0.1, name='Lluvia de monedas', what='"El hombre más rico del mundo…"')
put(ting(), wAt('C4', '2010'), 0.8, name='¡Ting!', what='La corona del #1')
put(whoosh(0.6), T2014 - 0.1, 0.8, name='Whoosh (corte)', what='2014: la oficina del regulador')
put(stamp(), wAt('R1', 'preponderante'), name='¡Sellazo!', what='"AGENTE PREPONDERANTE"')
put(paper(), st('C5') - 0.1, name='Papel', what='"Me amparo"')
put(poof(), wAt('A4', 'desaparecieron'), name='¡Puf!', what='El regulador desaparece')
put(whoosh(0.6), THOME - 0.1, 0.8, name='Whoosh (regreso)', what='De vuelta en la sala')
put(ka_ching(), wAt('A5', '125'), 0.8, name='¡Ka-ching!', what='125 mil millones de dólares')
put(phone_ding(), st('A6') - 0.2, 0.8, name='Notificación', what='El abuelo señala el celular del nieto')
put(boom(), en('A6') + 0.6, 0.7, name='Golpe final', what='El nieto mira a la cámara')
# ---------- write ----------
mx = max(np.abs(L).max(), np.abs(R).max()); st = (np.stack([L, R], 1) / mx * 0.89 * 32767).astype(np.int16)
with wave.open(out_wav, 'w') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
CUES.sort(key=lambda c: c[0])
with open(out_md, 'w') as f:
    f.write(f'# Efectos de sonido · "El más rico del mundo… cobrándote el teléfono"\n\nPista: `music/efectos_slim.mp3` ({END:.1f} s). Empieza en 0:00 igual que el video. Sin música.\n\n| Tiempo | Efecto | Qué pasa |\n|---|---|---|\n')
    for t, n, w in CUES: f.write(f"| {int(t // 60)}:{t % 60:05.2f} | {n} | {w} |\n")
print(len(CUES), 'cues')
