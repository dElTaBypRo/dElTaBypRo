# Video de Slim/Telmex · qué falta y cómo terminarlo

Todo lo visual ya está hecho y probado: personajes (`kit/charkit.js`), escenarios (`kit/slimsets.js`), escena (`scenes/slim.html`) y efectos (`tools/sfx_slim.py`). Solo faltan las **voces**.

## Voces con Google Cloud Text-to-Speech
1. En Google Cloud: crear proyecto, activar facturación, activar **Cloud Text-to-Speech API** y crear una **clave de API** (restringida a esa API).
2. En la sesión de Claude Code: menú del entorno (barra de título) → Editar → **Network secrets**:
   host `texttospeech.googleapis.com`, encabezado `X-Goog-Api-Key`, valor = la clave.
3. Generar y armar (con la clave guardada):
```bash
python3 tools/tts_google_slim.py --list      # ver voces es-US disponibles y el reparto elegido
python3 tools/tts_google_slim.py             # audio/slim/lines/<LINEA>.mp3 + tiempos por palabra
python3 tools/assemble_slim.py               # scenes/vo_slim.wav + scenes/words_slim.json (modo real)
```
4. Cuadros de prueba, render, efectos y mezcla (sin música):
```bash
TIMES=1,20,45,57,68,80,97,106 PAGE=slim.html tools/serve_and.sh node tools/render.js <carpeta>/prueba test 4
DUR=$(python3 -c "import json;print(json.load(open('scenes/words_slim.json'))['end'])") PAGE=slim.html tools/serve_and.sh node tools/render.js <carpeta>/frames full 4
python3 tools/sfx_slim.py . <carpeta>/sfx_slim.wav docs/efectos_slim.md && ffmpeg -i <carpeta>/sfx_slim.wav -b:a 192k music/efectos_slim.mp3
ffmpeg -i scenes/vo_slim.wav -i <carpeta>/sfx_slim.wav -filter_complex "[0:a]aformat=channel_layouts=stereo[v];[1:a]volume=0.42[s];[v][s]amix=inputs=2:duration=longest:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11[a]" -map "[a]" <carpeta>/mix.wav
ffmpeg -framerate 30 -i <carpeta>/frames/f%05d.jpg -i <carpeta>/mix.wav -map 0:v -map 1:a -c:v libx264 -crf 19 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest <carpeta>/slim.mp4
```
5. Entregar: video (voces + efectos, sin música), `music/efectos_slim.mp3`, `docs/efectos_slim.md`, portada.

## Alternativa: voces grabadas por el usuario
Guardar cada línea como `audio/slim/lines/<LINEA>.mp3` (ids en `tools/assemble_slim.py`) con un `<LINEA>.words.json` de tiempos
(se pueden estimar con la función `estimate_words` de `tools/tts_google_slim.py`) y correr `tools/assemble_slim.py`.
