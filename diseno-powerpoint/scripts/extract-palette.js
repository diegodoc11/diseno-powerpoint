// Saca la paleta y las fuentes REALES de la web de una marca.
// Cómo usarlo: abre la página en el navegador y ejecuta este código en la página
// (herramienta de JavaScript del navegador, o pegarlo en la consola). Devuelve:
//   vars  → variables CSS de :root/body (suelen traer los nombres: --gold, --rosa, --vino…)
//   fonts → familias tipográficas y cuántos elementos las usan
//   top   → colores más usados (texto, fondo, bordes) y degradados
// Con eso llena brand.json: fondo, texto, acento, profundidad y el color de ACCIÓN (el de los botones).
(() => {
  const vars = {};
  for (const sheet of Array.from(document.styleSheets)) {
    let rules;
    try { rules = sheet.cssRules; } catch (e) { continue; }
    for (const r of Array.from(rules)) {
      if (r.selectorText && /:root|html|body/.test(r.selectorText)) {
        for (const p of Array.from(r.style)) if (p.startsWith("--")) vars[p] = r.style.getPropertyValue(p).trim();
      }
    }
  }
  const counts = {}, fonts = {};
  document.querySelectorAll("body *").forEach((el) => {
    const cs = getComputedStyle(el);
    ["color", "backgroundColor", "borderTopColor"].forEach((k) => {
      const v = cs[k];
      if (v && v !== "rgba(0, 0, 0, 0)") counts[k + ":" + v] = (counts[k + ":" + v] || 0) + 1;
    });
    fonts[cs.fontFamily] = (fonts[cs.fontFamily] || 0) + 1;
    if (cs.backgroundImage && cs.backgroundImage.includes("gradient")) {
      const g = "grad:" + cs.backgroundImage.slice(0, 160);
      counts[g] = (counts[g] || 0) + 1;
    }
  });
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 40);
  return { title: document.title, vars, fonts, top, bodyBg: getComputedStyle(document.body).backgroundColor };
})();
