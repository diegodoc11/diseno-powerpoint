# Diseño PowerPoint (Lujo)

Skill de Claude para crear **presentaciones de PowerPoint de lujo** con dos modos:

- **Lujo fijo** para los programas propios: estética negra premium con dorado y naranja, tipografía fuerte,
  líneas finas, iconos e imágenes de apoyo.
- **Método editorial** para clientes, lives y webinars de venta: el estilo sale de una referencia y de los
  colores reales de la marca, cada slide se diseña según lo que dice, se usa material real del cliente con
  imágenes de IA hechas a la medida, y todo pasa por una doble revisión (propia + revisor independiente).

En los dos: construir con PptxGenJS → renderizar y revisar visualmente con PowerPoint → pulir, con fuentes
legibles en el celular, el guion en las notas del orador y animaciones opcionales.

Creada y refinada con Diego.

## Instalar

```bash
npx skills add https://github.com/diegodoc11/diseno-powerpoint --skill diseno-powerpoint
```

## Contenido

- **`diseno-powerpoint/SKILL.md`** — cómo elegir el modo y la metodología completa (estética, build, QA, móvil, imágenes, animaciones, marca).
- **`diseno-powerpoint/METODO-EDITORIAL.md`** — el método para clientes: dirección de arte, catálogo de diseños por tipo de contenido, material, construcción, doble revisión y trampas aprendidas.
- **`diseno-powerpoint/IMAGES.md`** — flujo de imágenes: iconos → Kie AI (modelo barato) → Apify, y material real del cliente.
- **`diseno-powerpoint/PREFERENCIAS.md`** — preferencias de Diego (aplicar por defecto).
- **`diseno-powerpoint/templates/`** — `build-editorial.js` (helpers + 10 slides de ejemplo, una por tipo de diseño) y `brand.example.json`.
- **`diseno-powerpoint/scripts/`**
  - `New-DeckImage.ps1` / `gen_images.py` — imágenes con Kie AI (una o en lote).
  - `Find-DeckImage.ps1` — imágenes reales con Apify.
  - `extract-palette.js` — saca colores y fuentes de la web de una marca.
  - `make_backgrounds.py` — fondos con los colores de la marca.
  - `render.ps1`, `contact_sheets.py`, `test-open.ps1`, `export-pdf.ps1` — render, hojas de revisión, diagnóstico y PDF.

## Requisitos
- Node.js con PptxGenJS, react, react-dom, react-icons y sharp para construir el `.pptx`.
- Python 3 con Pillow y numpy (fondos, hojas de revisión); opcional `rembg` para recortar personas.
- PowerPoint (Windows) para render/QA, PDF y animaciones vía COM.
- Para imágenes: `KIE_API_KEY` (Kie AI) y/o login de Apify (`apify login`). Las claves se leen del entorno; **no se guardan en la skill**.
