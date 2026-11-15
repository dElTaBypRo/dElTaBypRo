import numpy as np, sys
W, H = 240, 165
d = np.fromfile(sys.argv[1], dtype=np.uint8); n = d.size // (W * H * 3); fr = d[:n * W * H * 3].reshape(n, H, W, 3).astype(int)
fps = float(sys.argv[2])
red = (fr[..., 0] > 190) & (fr[..., 1] < 90) & (fr[..., 2] < 110)
cnt = red.sum((1, 2))
xs = np.array([ (np.nonzero(red[i])[1].mean() / W if cnt[i] > 15 else -1) for i in range(n)])
ys = np.array([ (np.nonzero(red[i])[0].max() / H if cnt[i] > 15 else -1) for i in range(n)])
# press events: red appears (or jumps to another key)
ev = []; prev = -1
for i in range(n):
    x = xs[i]
    if x >= 0 and (prev < 0 or abs(x - prev) > 0.03): ev.append((i / fps, x, ys[i]))
    prev = x
for t, x, y in ev: print(f"{t:6.2f}  x={x:.3f}  {'white' if y > 0.75 else 'black'}")
print(len(ev), 'presses')
