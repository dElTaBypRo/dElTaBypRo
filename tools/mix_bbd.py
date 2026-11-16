# Mix for "Compra, pide prestado, muere": dialogue + bass loop only while the rich scheme + bass hits on actions.
import numpy as np, wave, json, sys, os
SR = 44100
def rd(p):
    w = wave.open(p); n = w.getnchannels(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
    return x.reshape(-1, n).mean(1) if n > 1 else x
root = sys.argv[1]; outp = sys.argv[2]; MUSIC = '--con-musica' in sys.argv   # default: NO music (the user adds it in TikTok)
vo = rd(os.path.join(root, 'scenes', 'vo_bbd.wav')) if os.path.exists(os.path.join(root, 'scenes', 'vo_bbd.wav')) else None
v1 = rd(os.path.join(root, 'music', 'bajo_v1_grave_loop.wav')); v2 = rd(os.path.join(root, 'music', 'bajo_v2_menos_grave_loop.wav'))
hit = rd(os.path.join(root, 'music', 'golpe_v1_grave.wav')); hit2 = rd(os.path.join(root, 'music', 'golpe_v2_menos_grave.wav'))
D = json.load(open(os.path.join(root, 'scenes', 'words_bbd.json'))); LN = {l['id']: l for l in D['lines']}
END = 71.5; N = int(SR * END); mus = np.zeros(N); sfx = np.zeros(N)
bass = v1 * 0.9 + v2 * 0.35
def put(buf, sig, t, g=1.0):
    i = int(SR * t); j = min(N, i + len(sig)); buf[i:j] += sig[:j - i] * g
def loop_section(t0, t1, g=0.55):
    n = int(SR * (t1 - t0)); reps = int(np.ceil(n / len(bass))) + 1; seg = np.tile(bass, reps)[:n].copy()
    f = int(SR * 0.25); seg[:f] *= np.linspace(0, 1, f); seg[-int(SR * 0.6):] *= np.linspace(1, 0, int(SR * 0.6)); put(mus, seg, t0, g)
# music only while the rich are doing their thing
loop_section(LN['N2']['start'] - 0.4, LN['M2']['start'] - 0.6)      # building rises
loop_section(LN['N3']['start'] - 0.3, LN['A1']['start'] - 0.2)      # borrowed money, no tax
loop_section(LN['G1']['start'] + 1.8, LN['N4']['start'] - 0.2)      # ten towers
loop_section(LN['N5']['start'] - 0.3, LN['N6']['start'] - 0.2)      # the game restarts
# hits
for t, g in [(7.0, 1.0), (LN['B2']['start'] - 0.05, 1.1), (45.0, 1.0), (47.6, 0.8), (53.8, 0.9)]: put(sfx, hit, t, g); put(sfx, hit2, t, 0.35 * g)
fin = LN['N6']['end'] + 0.15; put(sfx, hit, fin, 1.3); put(sfx, hit2, fin, 0.6); put(sfx, np.tile(bass, 2)[:int(SR * 2.5)] * np.linspace(1, 0, int(SR * 2.5)), fin + 0.05, 0.5)
# limo engine (4.9 - 6.9 s) and door thud
t = np.arange(int(SR * 2.2)) / SR; f0 = 38 + 22 * np.minimum(1, t / 1.6); ph = 2 * np.pi * np.cumsum(f0) / SR
eng = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph)) * (0.3 + 0.7 * np.minimum(1, t / 1.4)) * np.exp(-np.maximum(0, t - 1.8) * 8)
rng = np.random.default_rng(1); eng += 0.05 * np.convolve(rng.standard_normal(len(t)), np.ones(30) / 30, 'same'); put(sfx, eng, 4.9, 0.35)
td = np.arange(int(SR * 0.25)) / SR; put(sfx, np.sin(2 * np.pi * 70 * td) * np.exp(-td * 25), 7.05, 0.6)
if not MUSIC: mus[:] = 0; sfx[:] = 0; put(sfx, eng, 4.9, 0.35); put(sfx, np.sin(2 * np.pi * 70 * td) * np.exp(-td * 25), 7.05, 0.6)   # keep only engine + door
mix = mus * 0.6 + sfx * 0.7
if vo is not None: mix[:len(vo)] += vo[:N] * 1.0
mix /= np.abs(mix).max() + 1e-9
with wave.open(outp, 'w') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767 * 0.95).astype(np.int16).tobytes())
print('ok', END)
