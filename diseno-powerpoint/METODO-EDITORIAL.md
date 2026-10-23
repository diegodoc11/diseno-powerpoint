# Método editorial: decks para clientes, lives y webinars

Úsalo cuando el deck **no es de un programa de Diego** (un cliente, una marca, un live o un webinar de venta),
o cuando hay una **referencia de estilo** (PDF, deck, imágenes) o una **web de la marca**. El estilo fijo
negro/dorado/naranja de la sección 1 de SKILL.md queda solo para IMPERIO / Sistema IA Sales.

> Probado en octubre de 2026: live de 44 slides para una clínica estética. Diego: *"el nivel de esa
> presentación está muy alto… ya no voy a usar Claude Design"*.

El nivel sale de cinco pasos. Ninguno se salta.

---

## Paso 1 · Dirección de arte (antes de escribir código)

1. **Mira la referencia y descríbela en 5 rasgos:** tipografía (¿serif? ¿itálicas?), color, ritmo
   (claro/oscuro), elementos (líneas finas, rótulos con espaciado, números grandes, citas) y uso de fotos.
   - Si es PDF: renderiza las páginas a una hoja de contactos con PyMuPDF (`fitz`) y ábrela con Read.
2. **Saca los colores REALES de la marca; no los inventes.**
   - Si tiene web: ábrela en el navegador y corre `scripts/extract-palette.js` (devuelve las variables CSS,
     los colores más usados y las fuentes).
   - Si no: el logo y sus archivos de marca.
3. **Asigna roles** en `brand.json`: fondo, texto, acento principal, profundidad (para resplandores), y
   **un color solo para acciones** (botones, "escribe en el chat", reservar). Si la marca tiene un color
   fuerte (rosa, rojo), ese es el de acción y no se usa en nada más.
4. **Fuentes:** las de la marca si están instaladas; si no, la instalada más parecida
   (Jost/Futura → Century Gothic · Cormorant → Garamond · Playfair/Didot → Bodoni MT · Cinzel → Perpetua
   Titling MT). Revisa `C:\Windows\Fonts` antes de elegir; nunca dependas de una fuente que no está.
5. **Ritmo de revista:** base oscura de la marca + slides **marfil** para la parte educativa + **divisores**
   de color profundo para las secciones clave ("Secreto 1, 2, 3"). Fondos con resplandores suaves y grano
   fino (`scripts/make_backgrounds.py`), nunca planos.
6. **Jerarquía:** titulares en serif con 1–3 palabras clave en **itálica del color de acento**
   (`*así*` en el helper `T()`); rótulos pequeños en MAYÚSCULAS con espaciado; texto corrido en sans.

## Paso 2 · Cada slide diseñada según lo que dice

Lee **todo** el guion antes de diseñar. Por slide, elige el diseño según el tipo de contenido.

- Nunca el mismo diseño en dos slides seguidas.
- **Guion con formato:** lo que viene en negrita-cursiva va **completo y textual**; el texto normal son
  palabras señal (pueden ir como etiquetas, lista o chips), pero ninguna idea se pierde.
- Corrige solo ortografía y acentos; si cambias una palabra (p. ej. para que coincida con lo que dice el
  orador), avísalo al entregar.

| Contenido | Diseño | Helper / patrón en `templates/build-editorial.js` |
|---|---|---|
| Portada / cierre emocional | Foto a sangre + velo degradado + titular serif grande | `heroSlide` (portada del demo) |
| Presentación del experto | Foto enmarcada + nombre + 2 cifras grandes + promesas numeradas | slide 2 del demo |
| Frase de impacto / creencia | Tipografía grande sola, sin cajas; acento en itálica | `T()` con `size` 40–60 |
| Historia de un cliente o paciente | Foto a sangre a un lado + dato (edad, situación) + cita en itálica + remate en tarjeta | `bleedRight` / `bleedLeft` + `quoteCard` |
| Interacción en vivo ("escribe X en el chat") | Píldora del color de acción con ícono de chat | `chip()` |
| Sección clave ("Secreto 1") | Fondo profundo + número gigante translúcido + titular | `bigNum()` en fondo `depth` |
| Comparación de opciones | Tabla con filetes finos, columna del resultado en color de alerta | slide de tabla del demo |
| Algo que cambia con el tiempo | Curva dibujada con marcadores y notas (no gráfica de Excel) | `curveChart()` |
| Preguntas frecuentes | Rejilla de tarjetas: pregunta pequeña + respuesta gigante (NO, UNA, 2 AÑOS) | slide FAQ del demo |
| Proceso o historia del experto | Línea de tiempo vertical con nodos-ícono | `ring()` + `vline()` |
| Lo que ya gastó / costo de no actuar | Recibo marfil con renglones punteados y total | patrón "recibo" (en la guía de abajo) |
| Precios por niveles | Escalera de columnas que suben; la recomendada resaltada | slide escalera del demo |
| Lista de lo que incluye | Foto del experto + checklist con íconos | `icon()` + filetes |
| Oferta y cierre | Bonos numerados + urgencia + tarjeta de reserva legible en celular | `reservePanel()` |
| Antes / después | Tarjetas iguales con rótulos ANTES/DESPUÉS arriba y el dato abajo | `pic()` + `tag()` |
| Dato que falta (cuenta, cupos, foto) | Recuadro punteado del color de acción con el nombre del dato | `placeholder()` |

**Recibo (lo que ya gastó):** tarjeta marfil sobre fondo oscuro; cada renglón = concepto (serif) + detalle
pequeño (sans) a la izquierda y monto alineado a la derecha; filete punteado entre renglones; abajo
`TOTAL` en rótulo y el total grande en color de alerta.

## Paso 3 · Material real + imágenes a la medida

1. **Primero lo real:** fotos del experto o cliente, antes/después propios, capturas.
   - Si solo hay videos, saca cuadros: `ffmpeg -ss 3 -i clip.mp4 -frames:v 1 -q:v 2 foto.jpg`.
   - Quita letreros o logos viejos recortando con PIL (no con IA: la IA retoca la piel y falsea resultados).
   - Para recortar personas del fondo: `rembg` con el modelo `birefnet-general` (ya está en `~/.u2net`).
   - Antes/después lado a lado: si al ajustar la proporción se corta una cara, recompón cada mitad por
     separado centrada en su cara.
2. **Imágenes IA (Kie, modelo barato) pensadas para la slide:** el prompt lleva la **misma paleta** del
   deck, **dónde va el sujeto** y **dónde queda el espacio para el texto**
   ("subject on the right third, the left two thirds dark and empty for text") y termina en
   "no text, no words, no letters, no logos". Genera todas en paralelo con `scripts/gen_images.py`
   (~$0.02 c/u) y revísalas en una hoja de contactos antes de usarlas.
3. **Personas generadas que ilustran una historia real** → rótulo "Imagen ilustrativa".
4. **Cada imagen se recorta a la proporción EXACTA de su caja** antes de ponerla (`fit()` con sharp).
   `sizing: cover` de PptxGenJS deforma la imagen si no conoce su tamaño real.
5. **Salud y estética:** cero jeringas o agujas en piezas promocionales; antes/después solo propios.

## Paso 4 · Construir

1. Copia `templates/build-editorial.js` y `templates/brand.example.json` (como `brand.json`) a la carpeta del
   proyecto. Corre `scripts/make_backgrounds.py brand.json` para crear los fondos en `bg/`.
2. Cada slide es un bloque `{ }` con su propio diseño. El guion va en las notas del orador
   (`notes.json` → `addNotes`), nunca en la slide.
3. Datos que no tienes → `placeholder()`. **Nunca inventes datos** (cuentas, cupos, reseñas, testimonios).
4. Correr: `NODE_PATH=<carpeta con node_modules> node build-editorial.js`
   (necesita pptxgenjs, react, react-dom, react-icons y sharp; hay uno listo en
   `Claude practicas/Skill Editor PPT/build-ia-imperio/node_modules`).

## Paso 5 · Doble revisión (obligatoria)

1. **Tu revisión:** `scripts/render.ps1` → `scripts/contact_sheets.py` (hojas 2×2 numeradas) → revisa
   **todas**. Busca: texto encima de caras, palabras solas al final de línea (únelas con espacio duro
   `\u00A0` o corta la línea a mano), cajas desbordadas, caras recortadas, contraste bajo, texto < 16 pt
   en cuerpo. Corrige y vuelve a revisar solo las que cambiaron (`--pick 3,8,12`).
2. **Revisor independiente:** lanza un subagente de ojos frescos con el brief de abajo. Te devuelve una lista
   "Slide N — problema → arreglo".
3. Aplica lo que encuentre, re-renderiza y entrega **PPTX + PDF** (`scripts/export-pdf.ps1`).

### Brief para el revisor independiente (copiar y completar)

> Haz un control de calidad con ojos frescos de un deck de N slides. No edites nada: solo mira y reporta.
> Slides renderizadas: `<render>\Diapositiva1.PNG … DiapositivaN.PNG`. Hojas de contactos de 4 en
> `<qa>\qa_01.png …` (el número en el recuadro magenta; los bordes magenta no son parte de las slides).
> Texto fuente: `<archivo>`; lo marcado con `<<…>>` debe aparecer completo.
> Decisiones intencionales que NO debes reportar: `<lista: acentos en itálica dorada en vez de MAYÚSCULAS,
> recuadros punteados = datos pendientes, rótulos agregados, correcciones de ortografía…>`.
> Reporta solo problemas reales: (1) contenido que falta, está cortado o cambió de sentido; (2) visuales:
> desbordes, elementos que se tocan o se enciman, palabra sola en una línea, texto muy pequeño o de bajo
> contraste para un celular, fotos deformadas o caras cortadas. Formato: "Slide N — problema → arreglo
> concreto", lo más importante primero, máximo 350 palabras.

---

## Trampas aprendidas

- **Un run de texto vacío con salto de línea hace que PowerPoint no abra el archivo**, aunque el XML sea
  válido. El helper `runs()` ya lo evita. Si pasa: construye por rangos (`SLIDES=1-10`) y abre cada uno con
  `scripts/test-open.ps1` hasta encontrar la slide.
- **Tachar el precio de la competencia parece descuento falso:** ponlo en gris, sin tachar.
- **Números que la gente copia (cuenta, CLABE, teléfono):** en línea propia, ≥ 18 pt y en negrita.
- **En un live la gente lo ve en el celular:** no puede escanear un QR de su propia pantalla. Pon el número
  de WhatsApp grande junto al QR y recomienda fijar el link en el chat.
- **Logo blanco sobre una foto clara:** velo oscuro suave detrás (el helper lo hace con `imgUnderLogo`).
- **Títulos sobre foto a sangre:** limita el ancho del texto para que no pise la cara del sujeto.
- **Al pasar código por un heredoc de Bash**, `\\n` llega como salto real y rompe los strings de JS: edita
  esos strings con la herramienta Edit.
