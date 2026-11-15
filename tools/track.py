# 5-minute arrangement: user's bass loop + light swing drums + sparse keys. Stereo 44.1 kHz.
import numpy as np, wave, sys, os
SR = 44100; BEAT = 0.6; SW = 0.4; LOOP = 8 * BEAT          # 100 BPM, triplet swing, 4.8 s loop
rng = np.random.default_rng(3)
def read(p):
    w = wave.open(p); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768; return x
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); from_ = np.empty_like(x); z = 0.0
    # vectorized one-pole via lfilter-like cumulative approach is complex; use FFT brickwall-ish smooth filter instead
    F = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); F *= 1 / np.sqrt(1 + (f / fc) ** 4); return np.fft.irfft(F, len(x))
def hp(x, fc):
    F = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); F *= 1 / np.sqrt(1 + (fc / np.maximum(f, 1)) ** 4); return np.fft.irfft(F, len(x))
def bp(x, lo, hi): return lp(hp(x, lo), hi)
t_ = lambda d: np.arange(int(SR * d)) / SR
# ---- drum voices ----
def kick():
    t = t_(0.45); f = 45 + 80 * np.exp(-t * 28); ph = 2 * np.pi * np.cumsum(f) / SR
    return (np.sin(ph) * np.exp(-t * 7) + 0.25 * np.exp(-t * 300) * rng.standard_normal(len(t))) * 1.1
def rim():
    t = t_(0.12); n = bp(rng.standard_normal(len(t)), 1500, 5000) * np.exp(-t * 60)
    return (0.6 * n / (np.abs(n).max() + 1e-9) + 0.5 * np.sin(2 * np.pi * 420 * t) * np.exp(-t * 45)) * 0.85
def hat(open_=False):
    t = t_(0.25 if open_ else 0.06); n = hp(rng.standard_normal(len(t)), 7000) * np.exp(-t * (14 if open_ else 70)); return n / (np.abs(n).max() + 1e-9) * 0.7
def snap():
    t = t_(0.09); n = bp(rng.standard_normal(len(t)), 1200, 3500) * np.exp(-t * 55); return n / (np.abs(n).max() + 1e-9) * 0.7
def shaker():
    t = t_(0.09); env = np.minimum(1, t / 0.03) * np.exp(-t * 40); n = bp(rng.standard_normal(len(t)), 4000, 9000) * env; return n / (np.abs(n).max() + 1e-9) * 0.35
SEMI = {'C': 0, 'Db': 1, 'D': 2, 'Eb': 3, 'E': 4, 'F': 5, 'Gb': 6, 'G': 7, 'Ab': 8, 'A': 9, 'Bb': 10, 'B': 11}
fq = lambda n, o: 440 * 2 ** ((SEMI[n] + 12 * (o + 1) - 69) / 12)
def epiano(notes, dur=1.8):
    t = t_(dur); y = np.zeros_like(t)
    for n, o in notes:
        f = fq(n, o); y += (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 3) + 0.08 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 6)) * np.exp(-t * 1.6)
    trem = 1 + 0.12 * np.sin(2 * np.pi * 4.5 * t); return y * trem * np.minimum(1, t / 0.005) / len(notes) * 0.5
def reverb(x, wet=0.22, length=1.6):
    n = int(SR * length); t = np.arange(n) / SR; ir = lp(rng.standard_normal(n) * np.exp(-t * 4), 4000); ir /= np.sqrt((ir ** 2).sum())
    L = len(x) + n; F = 1 << (L - 1).bit_length(); w = np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[:len(x)]; return (1 - wet) * x + wet * w

music = sys.argv[1]; out = sys.argv[2]
bass1 = read(os.path.join(music, 'bajo_v1_grave_loop.wav')); bass2 = read(os.path.join(music, 'bajo_v2_menos_grave_loop.wav'))
golpe = read(os.path.join(music, 'golpe_v1_grave.wav'))
BASS = lp(bass1 * 0.95 + bass2 * 0.3, 1800)
SHORT = len(sys.argv) > 3 and sys.argv[3] == 'corto'
NL = 29 if SHORT else 62                                  # 29 loops = 2:19 (+ ending) | 62 loops = 4:58
TOTAL = int(SR * (NL * LOOP + 4.5))
L = np.zeros(TOTAL); R = np.zeros(TOTAL)
def put(sig, t, gl=1.0, gr=1.0):
    i = int(SR * t); j = min(TOTAL, i + len(sig)); L[i:j] += sig[:j - i] * gl; R[i:j] += sig[:j - i] * gr
# arrangement (in loops): which layers are on
def sec(l):
    if SHORT:
        if l < 2: return dict(bass=1, hat=0, snap=0, kick=0, rim=0, shk=0, keys=0)               # intro
        if l < 6: return dict(bass=1, hat=1, snap=1, kick=0, rim=0, shk=0, keys=0)               # + hats & snaps
        if l < 14: return dict(bass=1, hat=1, snap=0, kick=1, rim=1, shk=0, keys=(l % 4 == 2))   # groove A
        if l < 16: return dict(bass=1, hat=0, snap=0, kick=0, rim=0, shk=0, keys=1)              # breather
        if l < 24: return dict(bass=1, hat=1, snap=0, kick=1, rim=1, shk=1, keys=(l % 2 == 0))   # groove B
        if l < 26: return dict(bass=1, hat=0, snap=1, kick=1, rim=0, shk=0, keys=0)              # drop
        if l < 28: return dict(bass=1, hat=1, snap=0, kick=1, rim=1, shk=1, keys=1)              # full
        return dict(bass=1, hat=0, snap=0, kick=0, rim=0, shk=0, keys=1)                         # outro
    if l < 4: return dict(bass=1, hat=0, snap=0, kick=0, rim=0, shk=0, keys=0)               # intro: just the bass
    if l < 12: return dict(bass=1, hat=1, snap=1, kick=0, rim=0, shk=0, keys=0)              # + hats & snaps
    if l < 28: return dict(bass=1, hat=1, snap=0, kick=1, rim=1, shk=0, keys=(l % 4 == 0))   # groove A
    if l < 32: return dict(bass=1, hat=0, snap=0, kick=0, rim=0, shk=0, keys=1)              # breather: bass + keys
    if l < 48: return dict(bass=1, hat=1, snap=0, kick=1, rim=1, shk=1, keys=(l % 2 == 0))   # groove B
    if l < 52: return dict(bass=1, hat=0, snap=1, kick=1, rim=0, shk=0, keys=0)              # drop: kick + snaps
    if l < 60: return dict(bass=1, hat=1, snap=0, kick=1, rim=1, shk=1, keys=(l % 2 == 0))   # full
    return dict(bass=1, hat=(l < 61), snap=0, kick=0, rim=0, shk=0, keys=1)                  # outro
K, RM, SN = kick(), rim(), snap(); HT = [hat() for _ in range(6)]; HO = hat(True); SH = [shaker() for _ in range(4)]
CH1 = epiano([('D', 3), ('F', 3), ('Ab', 3)], 2.4); CH2 = epiano([('G', 3), ('Bb', 3), ('D', 4)], 2.4)
keysbus = np.zeros(TOTAL)
for l in range(NL):
    s = sec(l); t0 = l * LOOP
    if s['bass']: put(BASS, t0)        # v1 + a quiet octave-up layer so phones still hear it
    for b in range(8):
        tb = t0 + b * BEAT
        if s['hat']:
            put(HT[(l * 8 + b) % 6], tb, 0.7, 1.0); put(HT[(l * 8 + b + 3) % 6] * 0.6, tb + SW, 0.7, 1.0)
            if b == 7 and l % 4 == 3: put(HO, tb + SW, 0.7, 1.0)
        if s['shk']: put(SH[b % 4], tb + SW * 0.5, 1.0, 0.6); put(SH[(b + 1) % 4] * 0.8, tb + SW, 1.0, 0.6)
        if s['kick'] and b in (0, 4): put(K, tb)
        if s['kick'] and b == 6 and l % 2 == 1: put(K * 0.7, tb + SW)
        if s['rim'] and b in (2, 6): put(RM, tb, 0.9, 0.8)
        if s['snap'] and b in (2, 6): put(SN, tb, 1.0, 0.85)
    if s['rim'] and l % 8 == 7: [put(RM * (0.5 + 0.12 * k), t0 + 7 * BEAT + k * BEAT / 3, 0.9, 0.8) for k in range(3)]   # little fill
    if s['keys']:
        i = int(SR * t0); seg = CH1[:]; keysbus[i:i + len(seg)] += seg[:TOTAL - i]
        i = int(SR * (t0 + 4 * BEAT)); seg = CH2; keysbus[i:i + len(seg)] += seg[:TOTAL - i] * 0.8
keysbus = reverb(keysbus, 0.35)
L += keysbus * 0.9; R += keysbus * 1.0
put(golpe * 1.1, NL * LOOP)                                    # final hit
# gentle master: fade in/out + soft clip
fade = np.ones(TOTAL); fi = int(SR * 0.5); fade[:fi] = np.linspace(0, 1, fi); fo = int(SR * 3.5); fade[-fo:] = np.linspace(1, 0, fo) ** 1.5
L *= fade; R *= fade
mx = max(np.abs(L).max(), np.abs(R).max()); L = np.tanh(L / mx * 1.2) / np.tanh(1.2); R = np.tanh(R / mx * 1.2) / np.tanh(1.2)
st = (np.stack([L, R], 1) * 32767 * 0.95).astype(np.int16)
with wave.open(out, 'w') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(st.tobytes())
print('ok', TOTAL / SR, 's')
