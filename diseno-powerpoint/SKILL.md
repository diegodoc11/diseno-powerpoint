---
name: diseno-powerpoint
description: Crea presentaciones de PowerPoint (.pptx) de LUJO, la "presentación premium" de Diego. Dos modos — (1) estética fija negra con dorado y naranja para sus programas (IMPERIO, Sistema IA Sales) y (2) MÉTODO EDITORIAL para clientes, lives y webinars de venta - estilo tomado de una referencia y de los colores reales de la marca, cada slide diseñada según lo que dice, material real con imágenes a la medida y doble revisión. Úsala siempre que el usuario quiera crear, diseñar o mejorar un deck, diapositivas, pitch, clase, live, webinar o presentación profesional/elegante, sobre todo si menciona una referencia, la marca o la web de un cliente. Incluye build con PptxGenJS, render y QA visual con PowerPoint, fuentes legibles en móvil, imágenes con Kie AI / Apify, plantilla de código y scripts.
---

# Diseño PowerPoint (Lujo) — by Diego

Crea presentaciones con calidad de estudio: **negro profundo + dorado metálico + naranja**, tipografía Arial Black, líneas finas elegantes, iconos y apoyos visuales. Esta skill encierra una metodología probada de extremo a extremo: **construir con código → renderizar y revisar visualmente → pulir**. Ver `PREFERENCIAS.md` para los gustos específicos de Diego e `IMAGES.md` para el flujo de imágenes.

## Cuándo usar
Cualquier pedido de "crea/diseña/mejora una presentación, deck, diapositivas, pitch, clase, slides, live, webinar" — sobre todo si piden algo **elegante, profesional, premium o de lujo**.

## 0) Elige el modo (antes de todo)

| Si el deck es… | Modo | Qué seguir |
|---|---|---|
| Una clase o material de **los programas de Diego** (IMPERIO, Sistema IA Sales) | **Lujo fijo** | Secciones 1–8 de este archivo |
| Para un **cliente**, un **live / webinar de venta**, o hay una **referencia** o una **web de la marca** | **Editorial** | **`METODO-EDITORIAL.md`** + `templates/` + `scripts/` (las secciones 2–6 de aquí siguen aplicando) |

El modo editorial es el que Diego calificó como *"el nivel está muy alto"* (oct 2026). Sus 5 pasos:
1. **Dirección de arte:** estilo de la referencia + colores reales sacados de la web de la marca
   (`scripts/extract-palette.js`), un solo color para las acciones, fuentes instaladas equivalentes.
2. **Cada slide diseñada según lo que dice** (catálogo de diseños en el método), nunca la misma plantilla seguida.
3. **Material real + imágenes a la medida:** fotos del cliente o cuadros de sus videos, antes/después propios,
   e imágenes de Kie con la misma paleta y espacio libre para el texto (`scripts/gen_images.py`).
4. **Construir** con `templates/build-editorial.js` + `brand.json` + fondos de `scripts/make_backgrounds.py`;
   guion en las notas; datos faltantes como recuadros pendientes (nunca inventados).
5. **Doble revisión:** la tuya con hojas de contacto (`scripts/render.ps1` + `scripts/contact_sheets.py`) y la
   de un **revisor independiente** (subagente) con el brief del método. Entrega PPTX + PDF (`scripts/export-pdf.ps1`).

---

## 1) Estética de LUJO (la firma)

Paleta por defecto (la marca de Diego):
- **Fondo:** negro profundo `#0A0A0A`
- **Naranja `#F97316`** → energía, acentos, destacados, CTAs
- **Dorado `#D4AF37`** → premium: números, líneas finas, bordes, detalles
- **Plateado `#C7CAD1`** → texto secundario / descripciones
- **Blanco suave `#F5F5F0`** → texto principal
- **Verde `#3DD68C`** → positivo / recomendado · **Rojo `#E5484D`** → negativo / costo
- **Titulares:** Arial Black. **Cuerpo:** Arial. **Cajas tipo comando/terminal:** Consolas.
- **Líneas finas y bordes elegantes** para separar/enmarcar — **NUNCA barras gruesas**.
- Mucho aire negativo, composición premium, cero saturación. Comprometerse con el fondo oscuro da el aire de lujo.

Otros estilos de marca disponibles (si el usuario pide otra cosa): Tech Keynote (Apple), Corporate (Microsoft), Creative Bold (Google), **Financial Elite** (Goldman/McKinsey: carbón+dorado+serif) y Startup Pitch. El default de Diego es esta paleta negra/dorada/naranja.

---

## 2) Construir el deck (PptxGenJS, desde cero)

Se construye con **PptxGenJS** (Node) generando un `.pptx` desde cero. Patrón:

```bash
npm install pptxgenjs react-icons react react-dom sharp   # en una carpeta de build
node build.js
```

Estructura del `build.js`:
- `pres.defineLayout({ name:"WIDE", width:13.333, height:7.5 }); pres.layout="WIDE"` (16:9 ancho).
- **Centraliza los tamaños de fuente en una constante `FS`** (ver §3) para escalar de una vez.
- Helpers reutilizables: `base` (fondo negro), `hline`/`vline` (líneas finas), `eyebrow` (rótulo dorado con tracking), `footer` (marca + número), `iconRing` (icono en círculo dorado), `panel` (tarjeta con borde fino), `bullets` (viñetas con chevron `›` dorado), `closing`/`banner` (caja destacada con barra naranja + borde dorado), `cmdBox` (caja tipo terminal, fuente Consolas), `partHeader` (número grande dorado + título + verbo + icono + línea), `title`.
- Patrones de slide: tarjetas (2/3/4 col o grid 3×3), comparación 2 columnas, listas con icono+valor a la derecha, timeline/escalera, mockups armados con formas (búsqueda Google, tarjeta de negocio, etc.).
- **Notas del orador (guion):** `slide.addNotes("...")` → va al panel de notas del presentador, NUNCA como texto visible.

### ⚠️ Errores de PptxGenJS que CORROMPEN el archivo (evítalos)
1. **Color hex sin `#`**: `color:"FF0000"` ✅ — `"#FF0000"` ❌ corrompe.
2. **Nunca opacidad en hex de 8 dígitos**; usa `transparency`/`opacity` aparte.
3. **Líneas: nunca ancho/alto negativo ni una línea de tamaño 0×0** → genera XML que **PowerPoint rechaza al abrir** (aunque otras herramientas la lean). Líneas verticales = `w:0, h>0`; horizontales = `h:0, w>0`; diagonales: usa caja positiva + `flipH/flipV`.
4. **Objetos de sombra frescos por shape** (PptxGenJS los muta in-place): usa una *factory* `makeShadow()`.
5. Viñetas: `bullet:true` o tu propio prefijo (nunca ambos). Degradados: no nativos → usar imagen de fondo o apilar rectángulos translúcidos (o un PNG con degradado hecho con sharp, como en la plantilla).
6. **Run de texto vacío con salto de línea** (`{text:"", options:{breakLine:true}}`): PowerPoint dice "no se pudo abrir el archivo" aunque el XML sea válido. Pasa al partir texto por `\n` junto a un marcador. El helper `runs()` de la plantilla pone el salto en el run anterior. Para encontrar la slide culpable: construye por rangos (`SLIDES=1-10`) y abre cada archivo con `scripts/test-open.ps1`.
7. **`sizing: {type:"cover"}` deforma** si PptxGenJS no conoce el tamaño real de la imagen: recorta antes a la proporción exacta de la caja con sharp (helper `fit()`).

---

## 3) Legibilidad en MÓVIL (tamaños mínimos)

Los decks de Diego se ven mucho en **celular**. No uses fuentes diminutas. Mínimos (en slide 13.3×7.5"):
- Cuerpo / párrafos / viñetas: **≥ 16–17 pt**
- Descripciones en tarjetas / subtítulos: **≥ 14–15 pt**
- Notas al pie / leyendas: **≥ 13–14 pt** (nunca < ~12)
- Pie / numeración: **≥ 11 pt** · Títulos y números grandes: ya son grandes.

Si al agrandar no cabe: **reduce palabras o sube el alto de la caja** — nunca encojas bajo el mínimo. Ejemplo de constante:
```js
const FS = { foot:11, eyebrow:14, note:15, body:17, sub:16.5, bullet:16, cardTitle:16, cardDesc:14, closing:18 };
```

---

## 4) Render y QA visual (PowerPoint COM — Windows, sin LibreOffice)

En este equipo no hay LibreOffice; se usa **PowerPoint vía COM (PowerShell)** para exportar a PNG y revisar:
```powershell
$ppt = New-Object -ComObject PowerPoint.Application
$pres = $ppt.Presentations.Open($pptx, -1, 0, 0)   # ReadOnly
$pres.Export($imgDir, "PNG", 1920, 1080)
$pres.Close(); $ppt.Quit()
```
**QA obligatorio y DOBLE (asume que hay errores):**
1. **Tuyo:** `scripts/render.ps1` → `scripts/contact_sheets.py` (hojas 2×2 numeradas) → abre todas con la Read tool. Busca desbordes, solapamientos, texto cortado o encima de una cara, palabras solas al final de una línea (únelas con ` `), bajo contraste, gaps disparejos, números con cifras "oldstyle" (Cambria si Georgia las muestra raras), notas pegadas al footer. Corrige y re-renderiza solo las cambiadas (`--pick`).
2. **Revisor independiente:** un subagente de ojos frescos con el brief de `METODO-EDITORIAL.md` (compara contra el texto fuente y caza defectos visuales). Aplica lo que encuentre y re-renderiza. En el live de oct 2026 encontró ~20 detalles que el primer pase no vio (una cara recortada, una CLABE ilegible en celular).

---

## 5) Visuales: ICONOS primero, luego imágenes

Jerarquía (ver `IMAGES.md` para el detalle y los scripts):
1. **Iconos primero (gratis)** — react-icons rasterizados a PNG con `sharp`, en círculos dorados (`iconRing`).
2. **Imagen de apoyo** si el icono no basta (representación concreta) → generar con **Kie AI** (`scripts/New-DeckImage.ps1`, modelo económico `google/nano-banana` ~$0.02). Termina los prompts con `no text, no words`.
3. **Imagen real** (persona/logo/producto/captura) → **Apify** (`scripts/Find-DeckImage.ps1`, actor `hooli/google-images-scraper`). Verifica cada descarga (a veces vienen placeholders u off-topic).
4. **Fondos/heros** a sangre completa: permitidos para portada/cierre/divisores (con overlay oscuro para legibilidad). Genera con el modelo barato.

**Modelo de imágenes:** SIEMPRE el barato `google/nano-banana` (~$0.02). Nunca `nano-banana-pro` salvo que se pida. Para más nitidez, sube `-Resolution` (2K/4K), no cambies de modelo. **Avisa antes de gastar** en imágenes de pago.

---

## 6) Animaciones y transiciones (paso FINAL, por PowerPoint COM)

PptxGenJS **no** anima. Si el usuario las quiere, se agregan **de último** por COM:
- **Transiciones:** `$slide.SlideShowTransition.EntryEffect = 3849` (Fade Smoothly), `AdvanceOnClick=-1`, `Duration=0.7`.
- **Revelado por clic:** `$slide.TimeLine.MainSequence.AddEffect($shape, 10, 0, 1)` (10=Fade; trigger 1=al clic, 2=con la anterior). Para "fila por fila", agrupa shapes por su `Top` (~12 pt) y pon el primero del grupo al clic y el resto "con la anterior". Excluye título (Top<1.55"), footer (Top>6.85"), líneas/barras (Height<0.12" o Type=9).
- Reglas: animar de ÚLTIMO (regenerar el .pptx las borra → trabajar sobre copia `-ANIMADO`); no se ven en renders estáticos (verifica `MainSequence.Count` y que reabra); se ven en **modo presentación (F5)**.

> Por defecto Diego prefiere entregar **sin animaciones** y agregarlas él manualmente, salvo que pida lo contrario.

---

## 7) Reglas de marca (voz)
- El nombre del programa va en el **footer** (p. ej. "IMPERIO", "SISTEMA IA SALES"). Usa el que indique cada brief.
- **Nunca** mencionar herramientas de chat por su nombre comercial → decir "la herramienta de IA del chat" o "automatización de chats". (Claude sí se nombra.)
- **Nunca** referenciar otros módulos por número, solo por nombre ("el módulo de anuncios").
- Versiones de modelos: por **nivel** (Haiku/Sonnet/Opus), sin fijar números de versión en pantalla.

---

## 8) Checklist de flujo
0. Elige el modo (sección 0). Si es editorial, sigue `METODO-EDITORIAL.md` paso a paso.
1. Lee TODO el copy/brief → decide el diseño y el visual de cada slide según lo que dice (icono / foto real / imagen IA / fondo / solo tipografía).
2. Construye con PptxGenJS (FS centralizado, helpers; en editorial, `templates/build-editorial.js` + `brand.json`). Guion en notas con `addNotes`.
3. Renderiza a PNG (PowerPoint COM) y haz la **doble revisión** (tuya + revisor independiente). Corrige y re-renderiza.
4. Imágenes de apoyo con Kie AI / Apify — avisando del costo (en lote: `scripts/gen_images.py`).
5. (Opcional, al final) Animaciones por COM, sobre copia `-ANIMADO`.
6. Entrega el `.pptx` **y un PDF** (`scripts/export-pdf.ps1`) para verlo en el celular. Usa solo fuentes instaladas en Windows → se ve idéntico. Al entregar, lista los datos pendientes y las decisiones que tomaste por tu cuenta.
