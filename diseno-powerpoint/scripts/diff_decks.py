# Compara dos .pptx slide por slide: textos, posiciones/tamaños, formas agregadas o borradas, imágenes y notas.
# Sirve cuando el cliente editó el deck a mano: muestra qué cambió para pasarlo al build sin deshacer nada suyo.
# Uso: python -X utf8 diff_decks.py <mio.pptx> <cliente.pptx>             → diferencias por slide
#      python -X utf8 diff_decks.py <cliente.pptx> <nuevo.pptx> --lineas  → renglones del cliente que faltan en el nuevo
import re
import sys
from pptx import Presentation
from pptx.util import Emu

inch = lambda v: round(Emu(v).inches, 2) if v is not None else None
norm = lambda t: re.sub(r"\s+", " ", t.replace("\xa0", " ").replace("\x0b", " ")).strip().lower()


def runs_info(sh):
    out = []
    if not sh.has_text_frame:
        return out
    for p in sh.text_frame.paragraphs:
        for r in p.runs:
            f = r.font
            try:
                col = str(f.color.rgb) if f.color and f.color.type is not None else None
            except Exception:
                col = None
            out.append((r.text, f.size.pt if f.size else None, f.bold, f.italic, f.name, col))
    return out


def shapes(slide):
    return [{
        "name": sh.name, "type": str(sh.shape_type).split(".")[-1].split(" ")[0],
        "box": (inch(sh.left), inch(sh.top), inch(sh.width), inch(sh.height)),
        "text": sh.text_frame.text.strip() if sh.has_text_frame else "",
        "runs": runs_info(sh),
        "img": getattr(getattr(sh, "image", None), "sha1", None) if sh.shape_type == 13 else None,
    } for sh in slide.shapes]


def diferencias(A, B):
    print("slides:", len(A.slides), "vs", len(B.slides))
    for i, (sa, sb) in enumerate(zip(A.slides, B.slides), 1):
        na = {s["name"]: s for s in shapes(sa)}
        nb = {s["name"]: s for s in shapes(sb)}
        lines = [f"  - BORRADA {s['type']} '{n}' {s['box']} «{s['text'][:60]}»" for n, s in na.items() if n not in nb]
        for name, s in nb.items():
            if name not in na:
                lines.append(f"  + NUEVA {s['type']} '{name}' {s['box']} «{s['text'][:80]}»")
                continue
            o = na[name]
            if s["text"] != o["text"]:
                lines.append(f"  ~ TEXTO '{name}': «{o['text'][:90]}» → «{s['text'][:90]}»")
            db = [round(b - a, 2) if a is not None and b is not None else None for a, b in zip(o["box"], s["box"])]
            if any(d is not None and abs(d) >= 0.05 for d in db):
                lines.append(f"  ↔ CAJA '{name}' {o['box']} → {s['box']}")
            if s["text"] == o["text"] and s["runs"] and o["runs"]:
                fa = {r[1:] for r in o["runs"]}
                fb = {r[1:] for r in s["runs"]}
                if fa != fb:
                    lines.append(f"  ✎ FORMATO '{name}' «{s['text'][:40]}»")
            if s["img"] != o["img"] and s["img"] and o["img"]:
                lines.append(f"  🖼 IMAGEN CAMBIADA '{name}'")
        ta = sa.notes_slide.notes_text_frame.text if sa.has_notes_slide else ""
        tb = sb.notes_slide.notes_text_frame.text if sb.has_notes_slide else ""
        if ta.strip() != tb.strip():
            lines.append(f"  ✍ NOTAS cambiaron ({len(ta)} → {len(tb)} caracteres)")
        if lines:
            print(f"SLIDE {i}:\n" + "\n".join(lines))
    for j in range(len(A.slides) + 1, len(B.slides) + 1):
        print(f"SLIDE {j}: NUEVA en el segundo archivo")


def parrafos(slide):
    return {t for sh in slide.shapes if sh.has_text_frame
            for t in (norm("".join(r.text for r in p.runs)) for p in sh.text_frame.paragraphs) if t}


def faltantes(C, N):
    # cada párrafo que escribió el cliente debe seguir en el deck nuevo (salvo lo que él pidió quitar);
    # se busca en todo el texto de la slide para que un salto de línea agregado no cuente como faltante
    for i, (sc, sn) in enumerate(zip(C.slides, N.slides), 1):
        todo = norm(" ".join(sh.text_frame.text for sh in sn.shapes if sh.has_text_frame))
        for t in sorted(parrafos(sc)):
            if t not in todo:
                print(f"slide {i}: falta «{t[:100]}»")


if __name__ == "__main__":
    A, B = Presentation(sys.argv[1]), Presentation(sys.argv[2])
    faltantes(A, B) if "--lineas" in sys.argv else diferencias(A, B)
