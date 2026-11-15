# Análisis del video de referencia ("PART 2 – PARIS", 142 s)

Análisis cuadro por cuadro (2–6 fps + detección de cortes) y de audio (energía por bandas, notas sostenidas). Es solo un desglose de estructura y estilo: **no se copia**, se usa para hacer nuestra versión original.

## Tema real
No es exactamente "compra, pide prestado, muere". Trata de cómo los préstamos bancarios **crean dinero**, la inflación de activos y el **efecto Cantillon**, y termina vendiendo Bitcoin ("FIX THE MONEY. FIX THE WORLD."). Sí aparece el **"pide prestado"** (el millonario pide un millón usando 48 edificios de garantía: "entre más tengo, más me prestan"). **No aparece el "muere"** (herencia) ni la evasión de impuestos explícita: eso es territorio libre para nuestra versión.

## Estructura (~57 tomas, ~2.5 s cada una)
1. Protesta "TAX THE RICH!" + título "PART 2 / PARIS" (0–3 s).
2. Un joven ahorrador junta €50k para el enganche (3–9 s).
3. **Llega el millonario en su auto** (8.7–10 s): cámara fija a ras de calle, el auto viene directo hacia la lente. Corte a **contrapicado** cuando sale por la puerta y se frota las manos (10–11 s).
4. Banco: "Quiero otro millón" / "¿Garantía?" / celular con 48 edificios / "¡Aprobado! 3%". Pantallas que escriben NUEVO PRÉSTAMO / NUEVO DEPÓSITO / NUEVA DEUDA. "Eso fue fácil" (11–26 s).
5. Escenario abstracto (piso de cuadrícula neón): frasco de ahorros vs. cilindro gigante de billetes que crece (26–34 s).
6. Guerra de ofertas por el departamento → VENDIDO (34–54 s). Toma **desde arriba** de los ricos rodeando el letrero (43–47 s).
7. Caminata platicando con la cámara de frente retrocediendo; **dos rascacielos salen del suelo** con la frase "entre más tengo, más me prestan" (54–65 s).
8. Edificio en ruinas que sube de precio (65–75 s).
9. Demostración de apalancamiento: 1 casa → **aparecen 10 casas sobre la mesa** (75–103 s). Cubo rojo de DEUDA.
10. Efecto Cantillon: monedas que flotan hacia la torre (103–118 s).
11. Final: **grúa subiendo hasta vista cenital de la multitud**, penthouse con champaña, letrero final (119–138 s).

## Personajes
- **Millonario:** alto, flaco, viejo, pelo blanco, saco de terciopelo guinda, moño, reloj de oro. Poses presumidas (manos tras la cabeza, frotarse las manos, dedo negando). Subtítulos en **dorado**.
- **Banquero:** pelo engominado negro, lentes redondos, bigote, traje negro, corbata roja. Sillón-trono, botón rojo, pantallas. Subtítulos en **azul claro**.
- **Ahorrador:** joven, sudadera gris, mochila, celular. Siempre se ve pequeño. Subtítulos en **blanco**.
- **Gordos de fondo:** uno con bombín y saco verde con costal de dinero; otro con sombrero de copa estilo Monopoly.
- Multitud: cientos de figuras de colores con banderas y pancartas.

## Lenguaje de cámara
1. **Contrapicado** para los ricos, los edificios y el dinero que crece.
2. Tomas fijas a ras de calle con punto de fuga (el auto, las torres) donde el movimiento ocurre dentro del cuadro.
3. **Picado o cenital** para la gente y el mercado.
4. Grúa continua hasta vista cenital en la frase principal.
5. Caminata con la cámara de frente retrocediendo.
6. Insertos de celular, letreros y pantallas con acercamientos lentos.
7. Plano/contraplano en los diálogos, un corte por frase.
8. Contraste de escala en el escenario abstracto.
9. Acercamientos suaves en los remates; casi nada de cámara en mano.
10. Corte cada ~2.5 s, con escenas que se repiten como "callback".

## Subtítulos
Sans redonda tipo Poppins en negritas, 3–5 palabras, centrados al ~75% de alto, con sombra y **color según quién habla**.

## Música y sonido
**La mayor parte del video NO tiene música.** Entra en momentos cortos, todo en **La menor**:
- **Cuando el rico "hace su jugada"** (pedir el préstamo, 13–26 s): bajo pulsado tipo blues sigiloso, La–Do–Re–Mi♭–Re–Do–Si♭–La, ~92 BPM.
- **Golpes graves** en las acciones: entrar al banco (11.1 s), préstamo aprobado (18.2 s), VENDIDO (54.6 s), torres que suben (62.3 s), casas que se multiplican (84.2 s).
- **Acorde sostenido de La menor** debajo del narrador cuando explica, que empieza y termina con los cortes.
- **Subida (riser)** cuando el dinero crece.
- El final cierra con el golpe más fuerte: acorde completo de La menor.

## Qué hacer en nuestra versión
1. Misma estructura (persona común vs. rico, banquero, demostración abstracta, remate) **y agregar el acto "MUERE"** (los herederos reciben las torres, la herencia paga el préstamo).
2. Abrir con multitud y un título "PARTE X / CIUDAD" (otra ciudad).
3. Llegada en auto: toma fija a ras de calle con el auto hacia la lente, luego corte a contrapicado al salir por la puerta. Motor y golpe grave en el corte.
4. Elenco: millonario flaco con color de lujo y detalles dorados, banquero grasoso, asalariado y uno o dos gordos de fondo (ya están en `kit/charkit.js`).
5. Ricos y edificios en contrapicado; la persona común pequeña o vista desde arriba.
6. Edificios que se levantan cuando pide el préstamo (`citykit` → `setProgress`), casas que aparecen en la mesa con contadores.
7. Gente desde arriba y una grúa a vista cenital para la frase principal.
8. Escenario abstracto con tableros (verde ganancias, rojo deudas).
9. Un número en pantalla en cada momento de dinero.
10. Caminata platicando con la cámara de frente.
11. Subtítulos con color por personaje.
12. Corte cada ~2.5 s; plano/contraplano; acercamientos en los remates.
13. **Silencio por defecto.** Nuestro riff de bajo (`music/`) entra solo cuando el rico trama algo.
14. Golpes de bajo (`music/golpe_*.wav`) en préstamo aprobado, VENDIDO, torre que sube y casas que se multiplican.
15. Cierre con letrero sobre la vista aérea y el golpe musical más fuerte.
