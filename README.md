# Diseño PowerPoint (Lujo)

Skill de Claude para crear **presentaciones de PowerPoint de lujo** — estética negra premium con dorado y naranja, tipografía fuerte (Arial Black), líneas finas, iconos, imágenes de apoyo (IA con Kie AI / reales con Apify) y notas del orador. Incluye la metodología completa: construir con PptxGenJS → renderizar y revisar visualmente con PowerPoint → pulir, con fuentes legibles en móvil y animaciones opcionales.

Creada y refinada con Diego.

## Instalar

```bash
npx skills add https://github.com/diegodoc11/diseno-powerpoint --skill diseno-powerpoint
```

## Contenido

- **`diseno-powerpoint/SKILL.md`** — metodología completa (estética, build, QA, móvil, imágenes, animaciones, reglas de marca).
- **`diseno-powerpoint/IMAGES.md`** — flujo de imágenes: iconos → Kie AI (modelo barato) → Apify, con cómo colocarlas.
- **`diseno-powerpoint/PREFERENCIAS.md`** — preferencias de Diego (aplicar por defecto).
- **`diseno-powerpoint/scripts/New-DeckImage.ps1`** — generar imágenes con Kie AI (Nano Banana económico).
- **`diseno-powerpoint/scripts/Find-DeckImage.ps1`** — traer imágenes reales con Apify.

## Requisitos
- Node.js (PptxGenJS, react-icons, sharp) para construir el `.pptx`.
- PowerPoint (Windows) para render/QA y animaciones vía COM.
- Para imágenes: `KIE_API_KEY` (Kie AI) y/o login de Apify (`apify login`). Las claves se leen del entorno; **no se guardan en la skill**.
