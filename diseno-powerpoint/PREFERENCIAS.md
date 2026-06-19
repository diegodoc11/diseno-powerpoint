# Preferencias de Diego (leer antes de diseñar)

Estas son las preferencias confirmadas para los decks de Diego. Aplícalas por defecto.

## Estética
- **Paleta de lujo fija:** fondo negro `#0A0A0A`, naranja `#F97316` (energía/CTA), dorado `#D4AF37` (premium: números, líneas, bordes), plateado `#C7CAD1` (secundario), blanco `#F5F5F0` (principal), verde `#3DD68C` (positivo), rojo `#E5484D` (negativo/costo).
- Titulares en **Arial Black**. Líneas finas y bordes elegantes, **nunca barras gruesas**. Mucho aire negativo, look premium oscuro.
- Para números grandes usar **Cambria** si Georgia muestra cifras "oldstyle" raras (el "0" como "o").

## Tipografía MÓVIL (importante)
- Los decks se ven en **celular** → fuentes grandes. Cuerpo ≥ 16–17 pt, descripciones ≥ 14–15, notas ≥ 13–14, nada por debajo de ~12 (salvo footer ≥ 11). Centralizar en una constante `FS` para escalar fácil. Si Diego pide "más grande", subir todo el `FS` de una vez.

## Visuales
- **Iconos primero** (react-icons, gratis) en círculos dorados. Hacen los decks visuales sin costo.
- **Imágenes de apoyo** cuando el icono no basta, y **fondos/heros** permitidos (a Diego le gustan). 
- **Modelo de imágenes: SIEMPRE el barato `google/nano-banana` (~$0.02)**. Nunca los caros (`nano-banana-pro`) salvo que lo pida. Para más calidad subir resolución, no cambiar de modelo.
- **Avisar antes de gastar** en imágenes generadas o scrapeadas.
- **Portada estilo "personal brand"** cuando aplique: foto de Diego a un lado (split) + texto al otro, con marco dorado. Ojo con la relación de aspecto de la foto (mostrarla completa, sin distorsionar).
- Las imágenes de testimonios suelen traer su propio texto quemado: mostrarlas completas, no superponer texto que las contradiga. Los nombres de archivo de Diego no siempre son fiables → guiarse por el **contenido** de la imagen.

## Guion y notas
- El **guion del orador** va en las **notas del presentador** (`slide.addNotes`), nunca en la diapositiva. El texto visible es solo lo que el brief marca como "En pantalla".

## Animaciones
- Por defecto entregar **sin animaciones** (Diego las agrega manualmente). Si las pide, agregarlas **al final** por PowerPoint COM (transiciones Fade + revelado por clic), sobre una copia con sufijo `-ANIMADO`.

## Reglas de marca
- Programas: **IMPERIO**, **SISTEMA IA SALES** (u otro que indique el brief) → el nombre va en el **footer**.
- **Nunca** nombrar herramientas de chat por su marca comercial → "la herramienta de IA del chat" / "automatización de chats". (Claude sí se nombra.)
- **Nunca** referenciar otros módulos por número, solo por nombre.
- Modelos de IA por **nivel** (Haiku/Sonnet/Opus), sin números de versión en pantalla.

## Estilos por programa
- **Financial Elite** (carbón + dorado + serif) es un buen default cuando se pide "máximo lujo / inversores". El estilo negro+dorado+naranja es la firma general de los programas de Diego.

## QA
- Siempre revisar el render con **ojos frescos (subagente)** antes de entregar. Diego nota los detalles (relación de aspecto de fotos, texto pequeño, elementos pegados).
