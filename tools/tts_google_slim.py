"""Generate the Slim/Telmex video voices with Google Cloud Text-to-Speech (one request per line).

Needs an API key saved as a network secret for texttospeech.googleapis.com (header X-Goog-Api-Key); the proxy adds it,
so this script never sees the key. Run: python3 tools/tts_google_slim.py [--list]
Writes audio/slim/lines/<LINE>.mp3 + <LINE>.words.json (word timings), then run python3 tools/assemble_slim.py.
Word timings come from SSML <mark> time points when the voice supports them; otherwise they are estimated from the audio.
"""
import json, os, re, subprocess, sys, base64, urllib.request, urllib.error
import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'audio', 'slim', 'lines')
API = 'https://texttospeech.googleapis.com/v1beta1'
LANG = 'es-US'
# preferred voices per character, best first; the first one available in voices.list is used
CAST = {
    'abuelo':     dict(prefer=['es-US-Chirp3-HD-Charon', 'es-US-Studio-B', 'es-US-Neural2-B', 'es-US-Wavenet-B'], gender='MALE', pitch=-3.0, rate=0.93),
    'nieto':      dict(prefer=['es-US-Chirp3-HD-Puck', 'es-US-Neural2-C', 'es-US-Wavenet-C'], gender='MALE', pitch=2.5, rate=1.06),
    'slim':       dict(prefer=['es-US-Chirp3-HD-Algenib', 'es-US-Chirp3-HD-Orus', 'es-US-Neural2-B', 'es-US-Wavenet-B'], gender='MALE', pitch=-5.0, rate=0.95),
    'salinas':    dict(prefer=['es-US-Chirp3-HD-Fenrir', 'es-US-Neural2-C', 'es-US-Wavenet-C'], gender='MALE', pitch=-1.0, rate=1.0),
    'ocde':       dict(prefer=['es-US-Chirp3-HD-Kore', 'es-US-Neural2-A', 'es-US-Wavenet-A'], gender='FEMALE', pitch=0.0, rate=1.0),
    'reguladora': dict(prefer=['es-US-Chirp3-HD-Leda', 'es-US-Chirp3-HD-Aoede', 'es-US-Wavenet-A', 'es-US-Neural2-A'], gender='FEMALE', pitch=-2.0, rate=0.98),
}
# what each line SAYS (numbers spelled out); ids match tools/assemble_slim.py
SPOKEN = {
    'N1': 'Abuelo, ¿qué es eso?',
    'A1': 'Mi recibo del teléfono de mil novecientos noventa y cinco. Una llamadita a Tijuana… y adiós quincena.',
    'N2': '¿¡Por qué era tan caro!?',
    'A2': 'Porque nomás había una compañía… y era del gobierno.',
    'N3': '¿Y cómo dejó de ser del gobierno?',
    'S1': '¡Se vende la telefónica de todos los mexicanos!',
    'C1': 'Yo la compro. Con mis socios gringos y franceses.',
    'N4': '¿Y con eso se hizo rico?',
    'S2': 'Y de pilón… nadie te puede competir en larga distancia hasta mil novecientos noventa y seis.',
    'C2': '¡Trato hecho!',
    'N5': '¿Y cuando por fin llegó la competencia?',
    'A3': 'Llegó… pero en dos mil doce él todavía tenía el ochenta por ciento de los teléfonos fijos, y el setenta por ciento de los celulares.',
    'N6': '¿Y eso cuánto nos costó?',
    'O1': 'Según nuestro cálculo… ciento veintinueve mil millones de dólares, en solo cinco años.',
    'C3': '¡Esos datos están mal!',
    'N7': '¿Y él mientras qué?',
    'C4': 'El hombre más rico del mundo… de dos mil diez a dos mil trece.',
    'N8': '¿Y nadie lo paró?',
    'R1': 'Por la reforma de dos mil trece, lo declaramos agente preponderante. Le vamos a poner reglas especiales.',
    'C5': 'Me amparo.',
    'N9': '¿Y ese regulador todavía existe?',
    'A4': 'En dos mil veinticinco lo desaparecieron. Ahora lo regula el gobierno directito.',
    'N10': '¿Y Slim?',
    'A5': 'Ciento veinticinco mil millones de dólares. Más rico que nunca.',
    'N11': 'O sea que… ¿ya no pago caro?',
    'A6': 'Ahora pagas en abonitos, mijo… pero al mismo señor.',
}
SPEAKER = {k: {'N': 'nieto', 'A': 'abuelo', 'S': 'salinas', 'C': 'slim', 'O': 'ocde', 'R': 'reguladora'}[k[0]] for k in SPOKEN}


def call(path, body=None):
    req = urllib.request.Request(API + path, data=json.dumps(body).encode() if body is not None else None, headers={'Content-Type': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=60) as r: return json.loads(r.read())
    except urllib.error.HTTPError as e:
        raise RuntimeError(f'{e.code}: {e.read().decode()[:400]}')


def pick_voices():
    names = {v['name']: v for v in call(f'/voices?languageCode={LANG}')['voices']}
    chosen = {}
    for spk, c in CAST.items():
        n = next((p for p in c['prefer'] if p in names), None)
        if not n:  # any voice of the right gender
            n = next(v['name'] for v in names.values() if v.get('ssmlGender') == c['gender'])
        chosen[spk] = n
    return chosen, sorted(names)


def esc(s): return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def synth(text, voice, c):
    toks = text.split(); chirp = 'Chirp' in voice
    audio = {'audioEncoding': 'MP3', 'sampleRateHertz': 44100}
    if not chirp: audio.update(pitch=c['pitch'], speakingRate=c['rate'])
    else: audio.update(speakingRate=c['rate'])
    if not chirp:  # SSML with a mark before each word → exact word start times
        ssml = '<speak>' + ' '.join(f'<mark name="w{i}"/>{esc(t)}' for i, t in enumerate(toks)) + '<mark name="end"/></speak>'
        try:
            r = call('/text:synthesize', {'input': {'ssml': ssml}, 'voice': {'languageCode': LANG, 'name': voice}, 'audioConfig': audio, 'enableTimePointing': ['SSML_MARK']})
            tp = {p['markName']: p['timeSeconds'] for p in r.get('timepoints', [])}
            if len(tp) >= len(toks):
                st = [tp.get(f'w{i}', 0) for i in range(len(toks))] + [tp.get('end', None)]
                return base64.b64decode(r['audioContent']), st
        except RuntimeError as e:
            print('  (sin marcas SSML:', str(e)[:120], ')')
    r = call('/text:synthesize', {'input': {'text': text}, 'voice': {'languageCode': LANG, 'name': voice}, 'audioConfig': audio})
    return base64.b64decode(r['audioContent']), None


def estimate_words(mp3, toks):
    """No time points: spread the words over the voiced span, weighted by letters."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', mp3, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'], capture_output=True, check=True).stdout
    a = np.frombuffer(raw, np.int16).astype(np.float32) / 32768; hop = 160; n = len(a) // hop
    db = 20 * np.log10(np.sqrt((a[:n * hop].reshape(n, hop) ** 2).mean(1)) + 1e-9); voiced = np.where(db > db.max() - 35)[0]
    t0, t1 = (voiced[0] * 0.01, voiced[-1] * 0.01 + 0.01) if len(voiced) else (0.0, len(a) / 16000)
    wts = [max(1, len(re.sub(r'\W', '', t))) + (3 if t[-1] in '.,…:' else 0) for t in toks]; tot = sum(wts); out, t = [], t0
    for tok, w in zip(toks, wts):
        d = (t1 - t0) * w / tot; out.append((t, t + d * 0.85)); t += d
    return out


def main():
    voices, all_names = pick_voices()
    if '--list' in sys.argv:
        print('\n'.join(all_names)); print(json.dumps(voices, indent=1)); return
    os.makedirs(OUT, exist_ok=True); print('Voces:', json.dumps(voices, ensure_ascii=False))
    for lid, text in SPOKEN.items():
        spk = SPEAKER[lid]; voice = voices[spk]; toks = text.split()
        data, st = synth(text, voice, CAST[spk]); mp3 = os.path.join(OUT, lid + '.mp3'); open(mp3, 'wb').write(data)
        if st:
            end = st[-1] if st[-1] else st[-2] + 0.5; ws = [{'text': t, 'start': round(st[i], 3), 'end': round(st[i + 1] if i + 1 < len(toks) else end, 3)} for i, t in enumerate(toks)]
        else:
            ws = [{'text': t, 'start': round(a, 3), 'end': round(b, 3)} for t, (a, b) in zip(toks, estimate_words(mp3, toks))]
        json.dump({'speaker': spk, 'voice': voice, 'words': ws}, open(os.path.join(OUT, lid + '.words.json'), 'w'), ensure_ascii=False)
        print(f'{lid:4} {spk:10} {voice:28} {ws[-1]["end"]:5.2f}s  {text[:50]}')


if __name__ == '__main__':
    main()
