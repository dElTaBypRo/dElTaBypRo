# Plucked-bass / piano riff synthesizer (Karplus-Strong + piano partials), seamless loops.
import numpy as np, wave, sys, os
SR = 44100
U = 0.2                      # grid step (s): 16th note at 75 BPM
LOOP_UNITS = 48              # 3 bars of 4/4 -> 9.6 s
# riff transcribed from the user's piano video (unit index, note name)
RIFF = [(0,'G'),(2,'G'),(3,'Ab'),(5,'Ab'),(6,'G'),(8,'F'),(11,'F'),(12,'Eb'),(14,'Eb'),(18,'D'),(20,'D'),(21,'F'),(23,'F'),(24,'G'),
        (29,'Ab'),(30,'G'),(32,'G'),(33,'F'),(35,'F'),(36,'Eb'),(38,'Eb'),(40,'D'),(42,'D'),(43,'D'),(45,'D')]
SEMI = {'C':0,'C#':1,'Db':1,'D':2,'D#':3,'Eb':3,'E':4,'F':5,'F#':6,'Gb':6,'G':7,'G#':8,'Ab':8,'A':9,'A#':10,'Bb':10,'B':11}
def freq(name, octave): return 440.0 * 2 ** ((SEMI[name] + 12 * (octave + 1) - 69) / 12)
rng = np.random.default_rng(7)

def ks_pluck(f, dur, bright=0.5, decay=0.996):
    n = int(SR * dur); N = max(2, int(round(SR / f)))
    buf = rng.uniform(-1, 1, N)
    # soften the excitation (finger pluck, not pick)
    for _ in range(int(3 + (1 - bright) * 6)): buf = 0.5 * (buf + np.roll(buf, 1))
    out = np.empty(n); idx = 0
    for i in range(n):
        s = buf[idx]; nxt = buf[(idx + 1) % N]
        buf[idx] = decay * (0.5 * (s + nxt)); out[i] = s; idx = (idx + 1) % N
    return out

def piano_tone(f, dur):
    t = np.arange(int(SR * dur)) / SR; y = np.zeros_like(t)
    for h, a in [(1, 1.0), (2, 0.45), (3, 0.22), (4, 0.12), (5, 0.06)]:
        y += a * np.sin(2 * np.pi * f * h * t * (1 + 0.0004 * h * h)) * np.exp(-t * (2.2 + h * 1.1))
    return y * np.minimum(1, t / 0.004)

def note(f, dur, vel, mix_piano, sub):
    a = ks_pluck(f, dur, bright=0.35 + 0.3 * vel)
    a /= (np.max(np.abs(a)) + 1e-9)
    p = piano_tone(f, dur); p /= (np.max(np.abs(p)) + 1e-9)
    t = np.arange(len(a)) / SR
    s = np.sin(2 * np.pi * f * t) * np.exp(-t * 3.0) * sub        # sub reinforcement
    y = (1 - mix_piano) * a + mix_piano * p + s
    env = np.minimum(1, t / 0.003) * np.exp(-t * 1.2)                # gentle overall decay
    return vel * y * env

def lowpass(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); z = 0.0
    for i, v in enumerate(x): z = (1 - a) * v + a * z; y[i] = z
    return y

def reverb(x, wet=0.18, length=1.2):
    n = int(SR * length); t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 5.5); ir = lowpass(ir, 2500); ir /= np.sqrt((ir ** 2).sum())
    L = len(x) + n; F = 1 << (L - 1).bit_length()
    w = np.fft.irfft(np.fft.rfft(x, F) * np.fft.rfft(ir, F), F)[:len(x)]
    return (1 - wet) * x + wet * w

def render(octave, mix_piano, sub, repeats=3):
    total = int(SR * U * LOOP_UNITS * repeats) + SR * 2
    y = np.zeros(total)
    for r in range(repeats):
        for k, (u, n) in enumerate(RIFF):
            nu = RIFF[k + 1][0] if k + 1 < len(RIFF) else LOOP_UNITS
            dur = min(1.6, (nu - u) * U + 0.9)
            vel = 1.0 if (k == 0 or RIFF[k - 1][1] != n) else 0.78      # accent first of each repeated pair
            f = freq(n, octave)
            seg = note(f, dur, vel, mix_piano, sub)
            i0 = int(SR * U * (u + r * LOOP_UNITS)); y[i0:i0 + len(seg)] += seg
    y = reverb(y)
    return y

def save(path, y):
    y = y / (np.max(np.abs(y)) + 1e-9) * 0.89
    d = (y * 32767).astype(np.int16)
    with wave.open(path, 'w') as w: w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())

outdir = sys.argv[1]
VERSIONS = [('v1_grave', 1, 0.15, 0.5), ('v2_menos_grave', 2, 0.25, 0.25), ('v3_poquito_menos_grave', 3, 0.4, 0.0)]
L = int(SR * U * LOOP_UNITS)
for name, octv, mixp, sub in VERSIONS:
    y = render(octv, mixp, sub, repeats=3)
    loop = y[L:2 * L].copy()                 # middle repetition: tails from the previous loop wrap in -> seamless
    save(os.path.join(outdir, f'bajo_{name}_loop.wav'), loop)
    save(os.path.join(outdir, f'bajo_{name}_demo4x.wav'), np.tile(loop, 4))
    # single stings (one hit + one pair) for "the rich do something" moments
    st = np.concatenate([note(freq('G', octv), 1.4, 1.0, mixp, sub), np.zeros(int(SR * 0.1))])
    save(os.path.join(outdir, f'golpe_{name}.wav'), reverb(st))
    print('ok', name, f'{freq("G", octv):.1f} Hz root')
