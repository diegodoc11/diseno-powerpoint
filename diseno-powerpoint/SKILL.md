---
name: diseno-powerpoint
description: Crea presentaciones de PowerPoint (.pptx) de LUJO — estética negra premium con dorado y naranja, tipografía fuerte, iconos, imágenes de apoyo (IA/reales) y notas del orador. Úsala siempre que el usuario quiera crear, diseñar o mejorar un deck, diapositivas, pitch, clase o presentación profesional/elegante. Incluye la metodología completa de build (PptxGenJS), render y QA visual con PowerPoint, fuentes legibles en móvil, imágenes con Kie AI / Apify, y animaciones.
---

# Diseño PowerPoint (Lujo) — by Diego

Crea presentaciones con calidad de estudio: **negro profundo + dorado metálico + naranja**, tipografía Arial Black, líneas finas elegantes, iconos y apoyos visuales. Esta skill encierra una metodología probada de extremo a extremo: **construir con código → renderizar y revisar visualmente → pulir**. Ver `PREFERENCIAS.md` para los gustos específicos de Diego e `IMAGES.md` para el flujo de imágenes.

## Cuándo usar
Cualquier pedido de "crea/diseña/mejora una presentación, deck, diapositivas, pitch, clase, slides" — sobre todo si piden algo **elegante, profesional, premium o de lujo**.

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
5. Viñetas: `bullet:true` o tu propio prefijo (nunca ambos). Degradados: no nativos → usar imagen de fondo o apilar rectángulos translúcidos.

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
**QA obligatorio (asume que hay errores):** abre los PNG con la Read tool — idealmente con un **subagente de ojos frescos** — y busca desbordes, solapamientos, texto cortado, bajo contraste, gaps disparejos, números grandes con cifras "oldstyle" (usar Cambria si Georgia las muestra raras), notas pegadas al footer. Corrige y **re-renderiza** hasta que un pase no encuentre nada nuevo.

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
1. Lee TODO el copy/brief → decide el visual de cada slide (icono / imagen / fondo / nada).
2. Construye con PptxGenJS (FS centralizado, helpers, paleta de lujo). Notas del orador con `addNotes` si las hay.
3. Renderiza a PNG (PowerPoint COM) y haz **QA visual con subagente**. Corrige y re-renderiza.
4. (Opcional) Imágenes de apoyo con Kie AI / Apify — avisando del costo.
5. (Opcional, al final) Animaciones por COM, sobre copia `-ANIMADO`.
6. Entrega el `.pptx`. Las fuentes (Arial Black, Arial, Consolas, Cambria) son estándar de Windows → se ve idéntico.
