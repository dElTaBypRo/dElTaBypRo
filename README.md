# dElTaBypRo · Videos explicadores en 3D

Herramientas para hacer videos cortos verticales (Reels / TikTok, 1080×1920) con personajes caricatura de cabeza cuadrada, escenarios 3D, cámara de cine, subtítulos palabra por palabra y música propia. Todo se arma con código (Three.js) y se renderiza cuadro por cuadro en un navegador sin pantalla.

## Qué hay aquí

| Carpeta | Contenido |
|---|---|
| `kit/charkit.js` | **Molde de personajes**: cabeza cuadrada, cuerpo con esqueleto (hombros, codos, muñecas, caderas, rodillas, cuello), dedos con dos articulaciones, panza esférica, peinados que se ajustan a la cabeza, lentes, barba, ropa, accesorios, 9 expresiones, 18 poses y 8 gestos de manos. 3 acabados: vinilo, plastilina y Pixar. |
| `kit/propkit.js` | **Objetos**: avión, Starship + torre con "palillos", ovni, router con chispas, podio con bandera, celular, radar, aeropuerto, nubes. |
| `kit/citykit.js` | **Ciudad**: calle con banquetas y cruce peatonal, banco con la oficina/balcón del banquero, edificio en construcción que se levanta piso por piso (con grúa), auto de lujo con puerta que abre, autos, postes, árboles, bancas y gente caminando. |
| `editor/editor.html` | **Editor de personajes** con controles (la misma página del artifact). Usa Three.js desde CDN e importa `charkit.js` y `citykit.js` desde la misma carpeta. |
| `scenes/` | Las escenas de cada video (una página por video) con su voz (`vo_*.mp3`) y los tiempos de cada palabra (`words_*.json`). |
| `tools/` | `render.js` (renderiza cuadros), `show.js` / `props.js` / `city.js` / `hands.js` (vistas previas), `bass.py` (sintetizador del bajo), `notes.py` (detecta notas de un audio), efectos `whoosh.wav` y `crack.wav`. |
| `music/` | Soundtrack de bajo en 3 versiones + golpes sueltos (ver abajo). |
| `examples/` | Videos terminados (versión ligera) e imágenes de muestra. |

## Personajes incluidos

Millonario, Banquero, Asalariado, Magnate gordo, Jensen, Trump, Elon, Stephen King y Sean Duffy. Para gente de fondo, `kit.townsperson(semilla)` genera personas distintas cada vez.

```js
const kit = createKit(THREE, RoundedBoxGeometry);
const rico = kit.build(kit.PRESETS.rico, 'clay');   // 'vinyl' | 'clay' | 'pixar'
kit.setExpression(rico, 'smug');
kit.setPose(rico, 'rubHands', t);                    // t = tiempo en segundos (anima)
kit.setHand(rico, 'R', 'money', t);                  // gesto de la mano derecha
```

- **Poses**: idle, walk, point, rubHands, countMoney, handshake, handsBehind, lookDown, thumbsUp, phone, shrug, handsUp, facepalm, think, crossed, wave, presenting, podium.
- **Gestos de manos**: open, relaxed, fist, point, thumbsUp, peace, grab, money (frota los dedos).

## Ciudad

```js
const city = createCity(THREE, kit, { finish: 'clay', progress: 0.5 });
scene.add(city.group);
city.update(t);                          // gente caminando, grúa
city.site.userData.setProgress(0.8, t);  // edificio en construcción (0 a 1)
city.limo.userData.setDoor(1.1);         // abre la puerta del auto de lujo
city.bank.userData.officeStand;          // dónde pararse en el balcón del banquero
```

## Música

`music/` trae el riff que tocaste en el piano, detectado tecla por tecla en todos los cuadros del video (59 fps, `tools/keys.py`). Es un loop de 16 tecleos: sube de la nota más grave a la más aguda y regresa, 2 tecleos por nota:

**D D · F F · G G · A♭ A♭ · G G · F F · E♭ E♭ · D D**

Cada par dura 0.6 s y el segundo golpe cae a los 0.4 s (swing de tresillo a 100 BPM). La vuelta dura 4.8 s y se repite sin cortes.

| Versión | Tono base | Archivos |
|---|---|---|
| 1 · grave | Re1–La♭1 (37–52 Hz) | `bajo_v1_grave_loop.wav`, `golpe_v1_grave.wav` |
| 2 · menos grave | Re2–La♭2 (73–104 Hz) | `bajo_v2_menos_grave_loop.wav`, `golpe_v2_menos_grave.wav` |
| 3 · un poquito menos grave | Re3–La♭3 (147–208 Hz) | `bajo_v3_poquito_menos_grave_loop.wav`, `golpe_v3_poquito_menos_grave.wav` |

Los `*_demo.mp3` son el loop repetido 6 veces para escucharlo. Los `golpe_*` son un solo golpe de cuerda para los momentos en que pasa algo. Para regenerar o cambiar el riff: edita `PAIRS` en `tools/bass.py` y corre `python3 tools/bass.py music`.


### Track de 5 minutos (`music/musica_bajo_5min.mp3`)
El loop de bajo con acompañamiento ligero, para subirlo como audio a TikTok/Reels: hi-hat con swing, bombo, rimshot, chasquidos, shaker y piano eléctrico con acordes de suspenso (Re–Fa–La♭ y Sol–Si♭–Re). Va por secciones para no aburrir: intro solo bajo → entran platillos y chasquidos → groove completo → respiro con bajo y piano → groove con shaker → bajada con bombo y chasquidos → groove final → cierre con golpe. Se regenera con `python3 tools/track.py music salida.wav`.

## Cómo renderizar

Requisitos: Node 18+, Chromium con Playwright y ffmpeg.

```bash
npm install                       # instala three@0.160.0
npm run serve                     # sirve el repo en http://127.0.0.1:8765 (déjalo corriendo)
# en otra terminal:
PAGE=paro.html DUR=62.9 LANGQ='?sub=3' node tools/render.js frames full 4   # cuadros a 30 fps, 4 navegadores
ffmpeg -framerate 30 -i frames/f%05d.jpg -i scenes/vo_paro.mp3 -c:v libx264 -crf 19 -pix_fmt yuv420p -c:a aac -shortest video.mp4
```

- `?sub=3` = desenfoque de movimiento (cada cuadro se calcula 3 veces y se mezcla).
- `TIMES=1,5,10 node tools/render.js prueba test` saca solo esos segundos para revisar.
- Los subtítulos y letreros respetan la **zona segura de Reels/TikTok**: nada importante en los últimos ~420 px de abajo ni en la franja derecha de los botones.

## Videos de ejemplo

En `examples/videos/`: la ventana del avión (inglés y español), "Este hombre cayó en el truco más antiguo" (Jensen Huang), "¿Aliens o Elon?" (paro aéreo de EE. UU.) y la prueba de cámara de 10 s.
