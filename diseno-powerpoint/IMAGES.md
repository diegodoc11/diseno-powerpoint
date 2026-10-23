# Imágenes reales y generadas para diapositivas (Kie AI + Apify)

## ⚠️ Cuándo usar una imagen (jerarquía — leer primero)

1. **Iconos primero (gratis).** Resuelve los visuales inline/spot con react-icons antes de
   pagar por una imagen.
2. **Imagen de apoyo si los iconos no bastan**: cuando la idea necesita una representación
   concreta (objeto, escena o persona real) que un icono no transmite. La imagen **apoya y
   explica** lo que dice el slide.
3. **Fondos/heros: permitidos.** Un fondo cinematográfico a sangre completa (con overlay
   oscuro para que el texto se lea) está OK para portada, cierre o divisores de sección.
4. **Modelo económico por defecto: `google/nano-banana` (~$0.02 / 4 créditos a 1K).** Es la
   mitad de precio que `nano-banana-2` (~$0.04 / 8 créditos). Usa el 2 solo si necesitas más
   calidad. Nunca `nano-banana-pro`.
5. **Avisa antes de gastar**: propón al usuario qué slide la necesita y por qué.

## Modo editorial: material real e imágenes a la medida

En decks de clientes (ver `METODO-EDITORIAL.md`) el orden cambia: **primero lo real**, luego IA a la medida.
- **Fotos reales del cliente:** si solo hay videos, saca cuadros con
  `ffmpeg -ss 3 -i clip.mp4 -frames:v 1 -q:v 2 foto.jpg` (recepción, el experto trabajando…).
- **Personas recortadas del fondo:** `rembg` con `new_session("birefnet-general")` (modelo en `~/.u2net`);
  sirve para ponerlas sobre los fondos de la marca o en un círculo.
- **Quitar letreros o logos viejos:** recortando con PIL, nunca con IA (la IA retoca la piel y falsea resultados).
- **Imágenes IA pensadas para la slide:** misma paleta del deck en el prompt + dónde va el sujeto + dónde queda
  libre el texto (*"subject on the right third, the left two thirds dark and empty for text"*). En lote y en
  paralelo con `scripts/gen_images.py images.json`; revisa todas en una hoja de contactos antes de usarlas.
- **Personas generadas que ilustran una historia real** → rótulo "Imagen ilustrativa".
- **Recorta a la proporción exacta de la caja** (helper `fit()` con sharp) en vez de confiar en `sizing: cover`.

## Cómo decido el visual de cada slide (leer el texto PRIMERO)

1. **Lee primero TODO el texto/esquema** de la presentación.
2. Por cada slide, clasifica qué pide su contenido y elige la fuente:

| Lo que pide el texto del slide | Visual | Fuente | Costo aprox. |
|---|---|---|---|
| Concepto abstracto, categoría, paso, métrica, ítem de lista | **Icono** | react-icons | **$0** |
| Ambiente/tono en portada, cierre o divisor de sección | **Fondo / hero** | Generar (Kie AI `google/nano-banana`) | ~$0.02 |
| Ilustrar un concepto que un icono no transmite (escena, objeto, proceso) | **Imagen de apoyo** generada | Generar (Kie AI) | ~$0.02 |
| Algo **real y específico** que NO se debe inventar (persona/lugar real, logo, producto, captura, gráfico, foto histórica) | **Imagen real** | Apify scrape (verificar) | ~$0.0035/img |
| Frase de impacto / dato grande | **Nada** — tipografía + color | — | $0 |

3. **Default a iconos** (gratis). Para fondos e ilustraciones, **genera con Kie AI** (barato y
   fiable). **Scrape solo** cuando necesites una imagen real imprescindible (ver fiabilidad abajo).
4. **Propón el plan visual al usuario antes de gastar** en imágenes de pago.

Hay dos fuentes (mismo patrón que la skill `carruseles`):

| Fuente | Cuándo usarla | Script |
|---|---|---|
| **Kie AI** (Nano Banana) — *generar* | Heros atmosféricos, ilustraciones conceptuales, escenas que ilustran una idea abstracta. La IA inventa la imagen. | `scripts/New-DeckImage.ps1` |
| **Apify** (`hooli/google-images-scraper`) — *imágenes reales* | Cuando la imagen NO debe inventarse: foto real de una persona/lugar, logo, producto, captura, gráfico, mapa, foto histórica. | `scripts/Find-DeckImage.ps1` |

## Requisitos (en este equipo, ya configurados)
- **Kie AI:** variable de entorno `KIE_API_KEY` (key en https://kie.ai/api-key).
- **Apify:** token en `~/.apify/auth.json` (vía `apify login -t <token>`) o variable `APIFY_TOKEN`
  (token en https://console.apify.com/account/integrations).

---

## A) Generar con Kie AI — `New-DeckImage.ps1`

```powershell
& "<skill>\scripts\New-DeckImage.ps1" `
  -Prompt "cinematic editorial photo of <escena>, dark premium tones, no text, no words" `
  -AspectRatio "16:9" -Resolution "1K" `
  -OutputPath ".\img\hero.png"
```

| Parámetro | Valores | Default |
|---|---|---|
| `-Prompt` | texto (inglés rinde mejor) | (requerido) |
| `-Model` | **`google/nano-banana`** (~$0.02, default — el más barato) · `nano-banana-2` (~$0.04, opcional, más calidad) | `google/nano-banana` |
| `-AspectRatio` | `16:9` (hero/fondo), `4:3`/`3:2` (lateral), `1:1` (spot), `9:16`, `4:5`, `21:9` | `16:9` |
| `-Resolution` | `1K`, `2K`, `4K` | `1K` |
| `-ImageInput` | URLs https de referencia | — |
| `-OutputPath` | ruta de salida | `./deck-img-<fecha>.png` |

**Guía de prompt para imágenes de diapositiva:**
1. **Termina SIEMPRE con `no text, no words, no letters, no logos`** — el texto lo dibuja
   PptxGenJS; si el modelo escribe, choca con tu tipografía.
2. **Empareja la paleta del deck** (p. ej. *"deep charcoal background with warm golden
   accents"*) para que la imagen se sienta parte del diseño, no pegada.
3. **Deja zona despejada** para el texto: *"lower portion darker and clean, reserved for
   text overlay"* (o el lado que toque).
4. **Estilo editorial/cinematográfico** para lujo: *"cinematic editorial photograph,
   premium magazine quality, shallow depth of field, dramatic lighting"*.
5. **Usa `google/nano-banana`** (el más barato, ~$0.02) por defecto; sube a `nano-banana-2`
   (~$0.04) solo si una imagen necesita más calidad. Nunca `nano-banana-pro`. Para más
   nitidez, sube `-Resolution` a `2K`/`4K`.

---

## B) Imágenes reales con Apify — `Find-DeckImage.ps1`

```powershell
& "<skill>\scripts\Find-DeckImage.ps1" `
  -Query "industrial robot arms automated factory" `
  -Label automation -Max 5 -OutDir ".\img\_scraping"
```

| Parámetro | Notas |
|---|---|
| `-Query` | una o varias queries separadas por `|`. Sé específico. |
| `-Label` | prefijo de los archivos (`automation_01.jpg`, …) |
| `-Max` | máximo por query (default 5) |
| `-Size` | `large` (default), `xlarge`, `huge` |
| `-OutDir` | carpeta de salida (crea `<OutDir>/<Label>/` + `_manifest.json`) |

**Protocolo (igual que en `carruseles`):** propón la query al usuario → scrapea →
**abre las opciones con la Read tool y muéstralas** → deja que el usuario elija.
**Nunca uses la primera automáticamente.** Revisa derechos de uso si es para publicar.

**Costo (plan FREE):** ~**$0.0035 por imagen** (+ ~$0.00005 de arranque) → **5 imágenes ≈ $0.018**.

**⚠️ Fiabilidad (medido en pruebas reales):** se paga por **cada resultado aunque no sirva**.
Muchos hosts devuelven un placeholder *"This site does not have permission to access or serve
this content"* y a veces los resultados son **off-topic**. Por eso:
1. **Abre SIEMPRE cada imagen descargada con la Read tool** y descarta placeholders/irrelevantes.
2. Para la mayoría de casos **es más fiable y de costo similar generar con Kie AI** (~$0.02 una
   imagen on-topic y a tu paleta) que scrapear 5 (~$0.018) y rezar. Reserva el scrape para
   cuando de verdad necesites algo **real y verificable** (una persona/logo/producto concretos).
3. Si scrapeas, usa queries **muy específicas y visuales** y prepárate para re-scrapear (se
   vuelve a cobrar).

---

## Colocar la imagen en el deck (PptxGenJS)

```javascript
// Imagen lateral / enmarcada (cover recorta sin deformar)
slide.addImage({ path: "img/foto.jpg", x: 8.78, y: 2.25, w: 3.49, h: 1.7,
                 sizing: { type: "cover", w: 3.49, h: 1.7 } });

// Hero/fondo a sangre completa + overlay oscuro para legibilidad (permitido para
// portada, cierre o divisores). PptxGenJS no tiene degradados nativos -> apila rectángulos.
slide.addImage({ path: "img/hero.png", x: 0, y: 0, w: W, h: H,
                 sizing: { type: "cover", w: W, h: H } });
slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: H,
                 fill: { color: BG, transparency: 50 } });           // velo general
slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 8.3, h: H,
                 fill: { color: BG, transparency: 38 } });           // lado del texto, más oscuro
// ...luego el texto encima
```

**Reglas:**
- Usa `sizing: { type: "cover" }` para llenar el marco sin deformar (recorta el exceso).
- Para texto sobre imagen, **oscurece detrás del texto** (rect translúcido) hasta que
  el contraste sea cómodo. Sin gradientes nativos: apila 1–2 rectángulos.
- Motivo de lujo: marcos con esquinas redondeadas (`rounding: true` para círculos, o un
  `ROUNDED_RECTANGLE` detrás) y un filete dorado fino al borde.
- `addImage` acepta rutas locales o URLs https. (Kie AI necesita URLs https en
  `-ImageInput`; sube los archivos locales antes si hace falta.)

## QA visual (obligatorio)
Tras renderizar, **abre el PNG con la Read tool** y verifica:
1. ¿La imagen se ve nítida y **no deformada** (estirada)?
2. ¿El texto encima es **legible** (contraste suficiente)?
3. ¿La imagen **explica/refuerza** el mensaje del slide (no es relleno)?
4. ¿No tapa elementos clave ni se sale del marco?
