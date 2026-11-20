"""Dialogue timeline for the Slim/Telmex video ("¿Cómo un señor se volvió el más rico del mundo cobrándote el teléfono?").

Lines are chained one after another (each with its own gap before it), so the timeline adapts to the real voice durations.
- Real mode: audio/slim/<speaker>.mp3 + <speaker>.words.json exist for every speaker (one ElevenLabs take per character,
  lines separated by [long pause], word timings from scribe).
- Per-line mode: audio/slim/lines/<LINE>.mp3 + <LINE>.words.json for every line (Google TTS, tools/tts_google_slim.py).
- Placeholder mode (no audio yet): durations are estimated from the text, the track is silent and the mouth envelope
  is synthetic, so the scene can be built and framed before the voices exist. Re-run once the voices arrive.
Outputs: scenes/vo_slim.wav/.mp3 and scenes/words_slim.json (end, lines, words, per-speaker mouth envelopes at 30 fps).
"""
import json, os, re, subprocess, wave
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'audio', 'slim')
SR, FPS, TAIL = 44100, 30, 2.6

# id, speaker, line index inside that speaker's take, gap before (s), text (placeholder / reference)
LINES = [
    ('N1', 'nieto', 0, 0.5, 'Abuelo, ¿qué es eso?'),
    ('A1', 'abuelo', 0, 0.3, 'Mi recibo del teléfono de 1995. Una llamadita a Tijuana… y adiós quincena.'),
    ('N2', 'nieto', 1, 0.3, '¿¡Por qué era tan caro!?'),
    ('A2', 'abuelo', 1, 0.3, 'Porque nomás había una compañía… y era del gobierno.'),
    ('N3', 'nieto', 2, 0.3, '¿Y cómo dejó de ser del gobierno?'),
    ('S1', 'salinas', 0, 1.4, '¡Se vende la telefónica de todos los mexicanos!'),
    ('C1', 'slim', 0, 0.4, 'Yo la compro. Con mis socios gringos y franceses.'),
    ('N4', 'nieto', 3, 0.6, '¿Y con eso se hizo rico?'),
    ('S2', 'salinas', 1, 0.3, 'Y de pilón… nadie te puede competir en larga distancia hasta 1996.'),
    ('C2', 'slim', 1, 0.3, '¡Trato hecho!'),
    ('N5', 'nieto', 4, 1.3, '¿Y cuando por fin llegó la competencia?'),
    ('A3', 'abuelo', 2, 0.3, 'Llegó… pero en 2012 él todavía tenía el 80% de los teléfonos fijos, y el 70% de los celulares.'),
    ('N6', 'nieto', 5, 0.4, '¿Y eso cuánto nos costó?'),
    ('O1', 'ocde', 0, 0.3, 'Según nuestro cálculo… 129 mil millones de dólares, en solo cinco años.'),
    ('C3', 'slim', 2, 0.3, '¡Esos datos están mal!'),
    ('N7', 'nieto', 6, 1.2, '¿Y él mientras qué?'),
    ('C4', 'slim', 3, 0.3, 'El hombre más rico del mundo… de 2010 a 2013.'),
    ('N8', 'nieto', 7, 0.5, '¿Y nadie lo paró?'),
    ('R1', 'reguladora', 0, 1.2, 'Por la reforma de 2013, lo declaramos agente preponderante. Le vamos a poner reglas especiales.'),
    ('C5', 'slim', 4, 0.4, 'Me amparo.'),
    ('N9', 'nieto', 8, 0.6, '¿Y ese regulador todavía existe?'),
    ('A4', 'abuelo', 3, 0.3, 'En 2025 lo desaparecieron. Ahora lo regula el gobierno directito.'),
    ('N10', 'nieto', 9, 1.2, '¿Y Slim?'),
    ('A5', 'abuelo', 4, 0.3, '125 mil millones de dólares. Más rico que nunca.'),
    ('N11', 'nieto', 10, 0.5, 'O sea que… ¿ya no pago caro?'),
    ('A6', 'abuelo', 5, 0.4, 'Ahora pagas en abonitos, mijo… pero al mismo señor.'),
]
# spoken words → how the caption shows them
MERGE = [(['mil', 'novecientos', 'noventa', 'y', 'cinco'], '1995'), (['mil', 'novecientos', 'noventa', 'y', 'seis'], '1996'),
         (['dos', 'mil', 'veinticinco'], '2025'), (['dos', 'mil', 'diez'], '2010'), (['dos', 'mil', 'doce'], '2012'), (['dos', 'mil', 'trece'], '2013'),
         (['ochenta', 'por', 'ciento'], '80%'), (['setenta', 'por', 'ciento'], '70%'), (['ciento', 'veintinueve'], '129'), (['ciento', 'veinticinco'], '125')]
KEEP_TAGS = ('[laughs]', '[sighs]')


def load_mp3(p):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', p, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(np.float32) / 32768


def split_lines(words):
    lines, cur = [], []
    for w in words:
        t = w['text']
        if t.startswith('[long'):
            if cur: lines.append(cur); cur = []
            continue
        if t in KEEP_TAGS: cur.append(dict(w, tag=True)); continue
        if t.startswith('[') or t.endswith(']'): continue
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


def placeholder_words(text):
    """Estimated word timings for a line that has no audio yet (relative to the line start)."""
    t, ws = 0.0, []
    for tok in text.split():
        core = re.sub(r'[^\w%]', '', tok)
        d = 0.5 + 0.28 * len(core) if re.search(r'\d', core) else 0.1 + 0.055 * len(core)
        ws.append({'text': tok, 'start': round(t, 3), 'end': round(t + d, 3)}); t += d + 0.04
        if tok.endswith('…'): t += 0.4
        elif tok[-1] in ',.:': t += 0.18
    return ws


def main():
    per_line = all(os.path.exists(os.path.join(SRC, 'lines', l[0] + '.mp3')) for l in LINES)  # one file per line (tools/tts_google_slim.py)
    real = per_line or all(os.path.exists(os.path.join(SRC, s + '.mp3')) for s in {l[1] for l in LINES})
    takes = {}
    if real and not per_line:
        for spk in sorted({l[1] for l in LINES}):
            takes[spk] = (load_mp3(os.path.join(SRC, spk + '.mp3')), split_lines(json.load(open(os.path.join(SRC, spk + '.words.json')))['words']))
    # place lines one after another
    plan, t = [], 0.0
    for lid, spk, idx, gap, text in LINES:
        t += gap
        if per_line:
            audio = load_mp3(os.path.join(SRC, 'lines', lid + '.mp3')); ws = [dict(w) for w in json.load(open(os.path.join(SRC, 'lines', lid + '.words.json')))['words']]
            s0 = max(0.0, ws[0]['start'] - 0.06); s1 = min(len(audio) / SR, ws[-1]['end'] + 0.25)
            rel = [dict(w, start=w['start'] - s0, end=w['end'] - s0) for w in ws]
            plan.append((lid, spk, t, rel, audio[int(s0 * SR):int(s1 * SR)].copy())); t += s1 - s0
        elif real:
            audio, lines = takes[spk]; ws = lines[idx]
            s0 = max(0.0, ws[0]['start'] - 0.06); s1 = min(len(audio) / SR, ws[-1]['end'] + 0.14)
            rel = [dict(w, start=w['start'] - s0, end=w['end'] - s0) for w in ws]
            plan.append((lid, spk, t, rel, audio[int(s0 * SR):int(s1 * SR)].copy())); t += s1 - s0
        else:
            rel = placeholder_words(text); plan.append((lid, spk, t, rel, None)); t += rel[-1]['end'] + 0.1
    END = round(t + TAIL, 2); N = int(END * SR)
    tracks = {spk: np.zeros(N, np.float32) for spk in {l[1] for l in LINES}}
    out_lines, out_words = [], []
    for lid, spk, at, rel, seg in plan:
        if seg is not None:
            rms = 20 * np.log10(np.sqrt((seg ** 2).mean()) + 1e-9); gain = 10 ** (float(np.clip((-21.5 - rms) * 0.6, -4, 8)) / 20)
            f = int(0.012 * SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
            a = int(at * SR); seg = seg[:N - a]; tracks[spk][a:a + len(seg)] += seg * gain
        text_words = [w for w in rel if not w.get('tag')]
        out_lines.append({'id': lid, 'speaker': spk, 'start': round(at + rel[0]['start'], 3), 'end': round(at + rel[-1]['end'], 3), 'text': ' '.join(w['text'] for w in text_words)})
        for w in merge_tokens(text_words):
            out_words.append({'text': w['text'], 'start': round(at + w['start'], 3), 'end': round(at + w['end'], 3), 'speaker': spk, 'line': lid})
    hop = SR // FPS; env = {}
    for spk, tr in tracks.items():
        n = len(tr) // hop
        if real:
            fr = tr[:n * hop].reshape(n, hop); db = 20 * np.log10(np.sqrt((fr ** 2).mean(1)) + 1e-9); v = np.clip((db + 42) / 26, 0, 1)
        else:  # synthetic flap inside each spoken word
            v = np.zeros(n); tt = np.arange(n) / FPS
            for w in out_words:
                if w['speaker'] != spk: continue
                m = (tt >= w['start']) & (tt < w['end']); v[m] = 0.45 + 0.4 * np.abs(np.sin((tt[m] - w['start']) * np.pi * 6))
        v = np.convolve(v, [0.25, 0.5, 0.25], 'same'); env[spk] = [round(float(x), 2) for x in v]
    if real:  # placeholder mode has no audio to write
        mix = sum(tracks.values()); pk = np.abs(mix).max(); mix = mix / pk * 0.89 if pk > 0.89 else mix
        wav = os.path.join(ROOT, 'scenes', 'vo_slim.wav')
        with wave.open(wav, 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype(np.int16).tobytes())
        subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', wav, '-b:a', '160k', os.path.join(ROOT, 'scenes', 'vo_slim.mp3')], check=True)
    json.dump({'end': END, 'fps': FPS, 'placeholder': not real, 'lines': out_lines, 'words': out_words, 'mouth': env},
              open(os.path.join(ROOT, 'scenes', 'words_slim.json'), 'w'), ensure_ascii=False)
    print('mode:', 'REAL' if real else 'PLACEHOLDER', ' end:', END)
    for l in out_lines: print(f"{l['id']:4} {l['speaker']:10} {l['start']:6.2f}-{l['end']:6.2f}  {l['text'][:64]}")


if __name__ == '__main__':
    main()
