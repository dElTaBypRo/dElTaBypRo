import sys, wave, numpy as np
fn = sys.argv[1]
w = wave.open(fn); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
hop = 256; win = 2048
frames = (len(x) - win) // hop
win_f = np.hanning(win)
mag = np.array([np.abs(np.fft.rfft(x[i*hop:i*hop+win] * win_f)) for i in range(frames)])
energy = np.sqrt((x[:frames*hop].reshape(-1, hop) ** 2).mean(1))
# spectral flux onsets
flux = np.maximum(0, np.diff(np.log1p(mag * 50), axis=0)).sum(1); flux = np.concatenate([[0], flux])
thr = np.median(flux) + 2.5 * np.std(flux)
onsets = []
for i in range(1, len(flux) - 1):
    if flux[i] > thr and flux[i] >= flux[i-1] and flux[i] >= flux[i+1] and (not onsets or i - onsets[-1] > int(0.08 * sr / hop)):
        onsets.append(i)
names = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
freqs = np.fft.rfftfreq(win, 1 / sr)
def pitch(i0):
    seg = mag[i0+2:i0+10].mean(0)
    # harmonic product spectrum over 50..1500 Hz
    hps = seg.copy()
    for h in (2, 3, 4):
        d = seg[::h]; hps[:len(d)] *= d
    lo, hi = np.searchsorted(freqs, 50), np.searchsorted(freqs, 1100)
    k = lo + np.argmax(hps[lo:hi])
    # parabolic interpolation
    if 0 < k < len(hps) - 1:
        a, b, c = np.log(hps[k-1] + 1e-12), np.log(hps[k] + 1e-12), np.log(hps[k+1] + 1e-12); p = 0.5 * (a - c) / (a - 2 * b + c)
    else: p = 0
    f = (k + p) * sr / win
    m = 69 + 12 * np.log2(f / 440)
    return f, int(round(m))
prev = None
for i in onsets:
    t = i * hop / sr; f, m = pitch(i)
    print(f"{t:6.2f}s  {f:7.1f} Hz  {names[m % 12]}{m // 12 - 1}  (midi {m})  {'Δ%.2f' % (t - prev) if prev else ''}")
    prev = t
