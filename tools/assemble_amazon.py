"""Assemble the Amazon parody dialogue track from one ElevenLabs take per character.

Inputs : audio/amazon/<char>.mp3 + <char>.words.json (word timings of that take)
Outputs: scenes/vo_amazon.wav / .mp3      – the dialogue track (voices only)
         scenes/words_amazon.json         – lines, words (timeline seconds, speaker) and
                                            per-speaker mouth envelopes at 30 fps for lip sync
Run    : python3 tools/assemble_amazon.py
"""
import json, os, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'audio', 'amazon')
SR, FPS = 44100, 30
END = 94.0

# line id, speaker, line index inside that speaker's take, timeline start (s)
LINES = [
    ('T1', 'tono', 0, 0.40), ('T2', 'tono', 1, 4.70), ('T3', 'tono', 2, 8.25),
    ('B1', 'bezos', 0, 15.60), ('L1', 'lucia', 0, 19.30), ('B2', 'bezos', 1, 27.60),
    ('R1', 'ramiro', 0, 32.35), ('B3', 'bezos', 2, 42.20), ('BR1', 'brandon', 0, 43.35),
    ('B4', 'bezos', 3, 48.35), ('K1', 'kevin', 0, 49.45), ('B5', 'bezos', 4, 52.75),
    ('B6', 'bezos', 5, 55.50), ('L2', 'lucia', 1, 66.40),
    ('K2', 'kevin', 1, 79.60), ('B7', 'bezos', 6, 81.95),
    ('T4', 'tono', 3, 85.30), ('T5', 'tono', 4, 87.60), ('T6', 'tono', 5, 90.90),
]
# spoken words → how the caption shows them
MERGE = [(['diez', 'mil'], '10,000'), (['cuatro', 'millones'], '4 millones'), (['sesenta', 'por', 'ciento'], '60%'),
         (['dos', 'mil', 'veinte'], '2020'), (['dos', 'mil', 'veintidós'], '2022')]
KEEP_TAGS = ('[laughs]', '[sighs]')


def load_mp3(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def split_lines(words):
    """Group a take's words into lines, cutting at [long pause]; drop direction tags."""
    lines, cur = [], []
    for w in words:
        t = w['text']
        if t.startswith('[long'):
            if cur: lines.append(cur); cur = []
            continue
        if t in KEEP_TAGS: cur.append(dict(w, tag=True)); continue
        if t.startswith('[') or t.endswith(']') or t in ('waking', 'full,'):
            continue
        cur.append(dict(w))
    if cur: lines.append(cur)
    return lines


def merge_tokens(ws):
    core = lambda t: t.strip('¡¿!?.,:…').lower()
    out, i = [], 0
    while i < len(ws):
        for pat, rep in MERGE:
            n = len(pat)
            if [core(w['text']) for w in ws[i:i + n]] == pat:
                first, last = ws[i]['text'], ws[i + n - 1]['text']
                lead = first[:len(first) - len(first.lstrip('¡¿'))]; trail = last[len(last.rstrip('!?.,:…')):]
                out.append(dict(ws[i], text=lead + rep + trail, end=ws[i + n - 1]['end'])); i += n; break
        else:
            out.append(ws[i]); i += 1
    return out


def main():
    takes = {}
    for spk in sorted({l[1] for l in LINES}):
        takes[spk] = (load_mp3(os.path.join(SRC, spk + '.mp3')), split_lines(json.load(open(os.path.join(SRC, spk + '.words.json')))['words']))
    N = int(END * SR)
    tracks = {spk: np.zeros(N, np.float32) for spk in takes}
    out_lines, out_words = [], []
    for lid, spk, idx, at in LINES:
        audio, lines = takes[spk]
        ws = lines[idx]
        s0 = max(0.0, ws[0]['start'] - 0.06); s1 = min(len(audio) / SR, ws[-1]['end'] + 0.14)
        seg = audio[int(s0 * SR):int(s1 * SR)].copy()
        rms = 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9)
        gain = 10 ** (float(np.clip((-21.5 - rms) * 0.6, -4, 8)) / 20)   # even out levels, keep some acting dynamics
        f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        a = int(at * SR); seg = seg[:N - a]
        tracks[spk][a:a + len(seg)] += seg * gain
        off = at - s0
        text_words = [w for w in ws if not w.get('tag')]
        out_lines.append({'id': lid, 'speaker': spk, 'start': round(ws[0]['start'] + off, 3), 'end': round(ws[-1]['end'] + off, 3),
                          'text': ' '.join(w['text'] for w in text_words)})
        for w in merge_tokens(text_words):
            out_words.append({'text': w['text'], 'start': round(w['start'] + off, 3), 'end': round(w['end'] + off, 3), 'speaker': spk, 'line': lid})
    mix = sum(tracks.values())
    pk = np.abs(mix).max(); mix = mix / pk * 0.89 if pk > 0.89 else mix
    # mouth envelopes (30 fps) per speaker
    hop = SR // FPS; env = {}
    for spk, tr in tracks.items():
        n = len(tr) // hop; fr = tr[:n * hop].reshape(n, hop)
        db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9)
        v = np.clip((db + 42) / 26, 0, 1)
        v = np.convolve(v, [0.25, 0.5, 0.25], 'same')
        env[spk] = [round(float(x), 2) for x in v]
    os.makedirs(os.path.join(ROOT, 'scenes'), exist_ok=True)
    wav = os.path.join(ROOT, 'scenes', 'vo_amazon.wav')
    with wave.open(wav, 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wav, '-b:a', '160k', os.path.join(ROOT, 'scenes', 'vo_amazon.mp3')], check=True)
    json.dump({'end': END, 'fps': FPS, 'lines': out_lines, 'words': out_words, 'mouth': env}, open(os.path.join(ROOT, 'scenes', 'words_amazon.json'), 'w'), ensure_ascii=False)
    for l in out_lines: print(f"{l['id']:4} {l['speaker']:8} {l['start']:6.2f}-{l['end']:6.2f}  {l['text'][:70]}")


if __name__ == '__main__':
    main()
