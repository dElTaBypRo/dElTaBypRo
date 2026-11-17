---
name: videos-trama
description: Cómo hacer los videos verticales (Reels/TikTok) de este repo con personajes 3D de cabeza cuadrada contando una historia con trama. Úsala cada vez que se pida un video nuevo, un guion, voces, escenas o efectos de sonido para un video.
---

# Videos con trama (personajes 3D, sin narrador)

## Estilo de historia
- **Sin narrador.** La historia la cuentan los personajes con sus diálogos y con lo que hacen.
- Los personajes **a veces rompen la cuarta pared** (voltean a la cámara y explican lo que está pasando) y a veces solo viven su escena.
- Trama con perspectivas: protagonista común vs. poderosos, con un remate claro al final.
- Duración objetivo: 60–90 s. Corte cada ~2.5 s, plano/contraplano en diálogos, acercamiento en los remates.

## Reglas visuales (obligatorias)
- **Casi nada de UI.** Nada de títulos, letreros con nombres de personajes ni "PARTE 1/2/3" encima del video.
- La información se muestra **dentro de la escena**: pantallas, celulares, letreros, gráficas en monitores, cajas, edificios que crecen, etc.
- **Subtítulos chicos** (≈68 px, Inter Black con contorno), solo del diálogo, con **color por personaje**, centrados en x≈500 y y≈1250 (zona segura de Reels/TikTok: nada importante en los últimos ~420 px ni en la franja derecha de botones; ancho máximo 820 px).
- Cámara estilo explicador: contrapicado para los poderosos, picado/cenital para la gente, push-ins, órbitas, grúa al final.

## Audio (obligatorio)
- **NUNCA poner música** a menos que el usuario la pida explícitamente. El usuario pone la música en la app.
- Entregar siempre:
  1. **Video con voces + efectos, sin música.**
  2. **Pista de puros efectos** (MP3) de la misma duración que el video, empezando en 0:00, para alinearla en la app.
  3. **Tabla de tiempos** de efectos (`docs/efectos_<video>.md`), generada por el script de efectos.
  4. Voces solas si se piden.
- Una voz de ElevenLabs por personaje. Mostrar guion y elenco al usuario antes de gastar créditos.

## Personajes y animación (`kit/charkit.js`)
- Presets: rico, banquero, asalariado, gordo, jensen, trump, elon, king, duffy; `kit.townsperson(semilla)` para gente de fondo.
- Expresiones incluye `evil` (plan malévolo). Pose animada `evilRub` = frotarse las manos rápido como mosca; sirve para cualquier personaje: `kit.setPose(c, 'evilRub', t); kit.setExpression(c, 'evil')`. Vista previa: `scenes/anim.html`.
- **Objetos en la mano:** pegarlos a `rig.wristR/L` con gesto `grab` y orientar el objeto con la palma; nunca dejarlos flotando cerca de la mano.
- **Evitar que los personajes atraviesen objetos** (autos, puertas, mesas): animar la salida del auto por el hueco de la puerta abierta (de adentro hacia afuera, perpendicular al auto) y revisar en cuadros de prueba que nada se encime.

## Contenido
- Personas reales solo como **caricatura/parodia**, con hechos verificados en al menos 2 fuentes; lo no confirmado se dice como "según reportes".
- No hacer chistes que se burlen de discapacidades, etnias u otros grupos; el humor va contra los poderosos o la situación.
- Marcas reales: se pueden nombrar en parodia, sin copiar logotipos.

## Flujo técnico
1. Guion + elenco → aprobación del usuario.
2. Generar voces (una por personaje), separar frases, armar la línea de tiempo del diálogo (`tools/assemble_*.py`), transcribir para tiempos por palabra (`scenes/words_<video>.json`).
3. Página de escenas `scenes/<video>.html` con los kits (`charkit`, `propkit`, `citykit`); `?ui=min` debe ser el comportamiento por defecto en videos nuevos.
4. Cuadros de prueba: `TIMES=... PAGE=<video>.html node tools/render.js prueba test 4` + hoja de contacto; corregir encuadres, choques y objetos tapando.
5. Render completo en segundo plano con timeout largo (2 h) y el servidor (`npm run serve`) también con timeout largo; si se corta, retomar con `SKIP_EXISTING=1`.
6. Efectos: script `tools/sfx_<video>.py` que genera la pista y la tabla; mezcla voces+efectos sin música.
7. Subir al repo: escena, voces, tiempos, scripts, tabla de efectos y video de ejemplo ligero (`examples/videos/`).
