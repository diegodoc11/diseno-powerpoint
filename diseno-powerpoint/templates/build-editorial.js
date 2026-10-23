// Plantilla del método editorial (skill diseno-powerpoint, ver METODO-EDITORIAL.md).
// Copia este archivo y brand.json a la carpeta del proyecto, borra las slides de ejemplo y escribe
// un bloque { } por slide, eligiendo el diseño según lo que dice (catálogo en METODO-EDITORIAL.md).
//
//   NODE_PATH=<carpeta con node_modules> node build-editorial.js
//   SLIDES="1-5,9" construye solo esas · OUTFILE=otra.pptx cambia la salida
//
// Necesita en node_modules: pptxgenjs, react, react-dom, react-icons, sharp.
// Carpetas junto al script: bg/ (scripts/make_backgrounds.py), img/ y assets/ (fotos), notes.json (guion).
const path = require("path");
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const React = require("react");
const RD = require("react-dom/server");
const sharp = require("sharp");
const PI = require("react-icons/pi");

const HERE = __dirname;
const BRAND = JSON.parse(fs.readFileSync(path.join(HERE, "brand.json"), "utf8"));
const OUT = process.env.OUTFILE || path.join(HERE, BRAND.output || "presentacion.pptx");
const CROPS = path.join(HERE, "_crops");
fs.mkdirSync(CROPS, { recursive: true });
const NOTES_FILE = path.join(HERE, "notes.json");
const NOTES = fs.existsSync(NOTES_FILE) ? JSON.parse(fs.readFileSync(NOTES_FILE, "utf8")) : {};

const W = 13.333, H = 7.5, MX = 0.85, CW = W - 2 * MX;
const K = BRAND.colors;
const C = {
  black: K.bg, gold: K.accent, goldLine: K.lineDark, vino: K.depth, vinoDk: K.depthDark,
  rosa: K.action, rosa2: K.actionLight, text: K.text, muted: K.muted, card: K.card, soft: K.soft,
  ivory: K.ivory, ink: K.ink, ink2: K.ink2, goldDk: K.accentDeep, lineL: K.lineLight, cardL: K.cardLight,
};
const SERIF = BRAND.fonts.serif, SANS = BRAND.fonts.sans;
const DARK = { dark: true, fg: C.text, fg2: C.muted, acc: C.gold, line: C.goldLine, card: C.card, logo: BRAND.logo_dark_bg };
const LIGHT = { dark: false, fg: C.ink, fg2: C.ink2, acc: C.goldDk, line: C.lineL, card: C.cardL, logo: BRAND.logo_light_bg };

const pres = new pptxgen();
pres.defineLayout({ name: "WIDE", width: W, height: H });
pres.layout = "WIDE";
pres.author = BRAND.name;
pres.title = BRAND.name;

// ---------------------------------------------------------------- helpers
let N = 0;
const ONLY = (process.env.SLIDES || "").split(",").filter(Boolean).flatMap((r) => {
  const [a, b] = r.split("-").map(Number);
  return Array.from({ length: (b || a) - a + 1 }, (_, i) => a + i);
});
const NOOP = { addText() {}, addImage() {}, addShape() {}, addNotes() {} };

// bg: "dark-a" | "dark-b" | "dark-c" | "depth" | "light" (archivos en bg/, si no existen usa color plano)
function slide(bg = "dark-a") {
  N++;
  const t = bg === "light" ? LIGHT : DARK;
  if (ONLY.length && !ONLY.includes(N)) return Object.assign({ t }, NOOP);
  const s = pres.addSlide();
  s.t = t;
  const file = path.join(HERE, "bg", bg + ".jpg");
  s.background = fs.existsSync(file) ? { path: file } : { color: bg === "light" ? C.ivory : bg === "depth" ? C.vinoDk : C.black };
  const n = NOTES[String(N)];
  if (n) s.addNotes(typeof n === "string" ? n : `${n.block || ""}\nSLIDE ${N} · ${n.title || ""}\n\n${(n.guion || []).join("\n\n")}`);
  return s;
}

// "texto *acento*": el acento sale en itálica del color de acento (o lo que digan las opciones acc*)
function runs(str, o) {
  const out = [];
  str.split("*").forEach((seg, i) => {
    if (seg === "") return;
    const acc = i % 2 === 1;
    seg.split("\n").forEach((ln, j) => {
      // el salto va en el run anterior: un run vacío con salto hace que PowerPoint rechace el archivo
      if (j > 0 && out.length) out[out.length - 1].options.breakLine = true;
      if (ln === "") return;
      const op = {
        fontFace: acc && o.accFont ? o.accFont : o.font || SERIF,
        fontSize: acc && o.accSize ? o.accSize : o.size,
        color: acc ? o.accent : o.color,
        italic: acc ? (o.accItalic === undefined ? true : o.accItalic) : !!o.italic,
        bold: acc ? (o.accBold === undefined ? !!o.bold : o.accBold) : !!o.bold,
      };
      if (o.charSpacing) op.charSpacing = o.charSpacing;
      if (o.transparency) op.transparency = o.transparency;
      out.push({ text: ln, options: op });
    });
  });
  return out;
}
function T(s, str, x, y, w, h, o = {}) {
  const opt = Object.assign({ size: 18, color: s.t.fg, accent: s.t.acc }, o);
  s.addText(runs(str, opt), { x, y, w, h, margin: 0, align: opt.align || "left", valign: opt.valign || "top", lineSpacingMultiple: opt.ls || 1.0 });
}
function eyebrow(s, text, x = MX, y = 0.55, w = 9, color) {
  s.addText(text, { x, y, w, h: 0.3, fontFace: SANS, fontSize: 12, bold: true, color: color || s.t.acc, charSpacing: 4, margin: 0, valign: "middle" });
}
function hline(s, x, y, w, color, width = 0.75, dash) {
  const line = { color: color || s.t.line, width };
  if (dash) line.dashType = dash;
  s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line });
}
function vline(s, x, y, h, color, width = 0.75) {
  s.addShape(pres.shapes.LINE, { x, y, w: 0, h, line: { color: color || s.t.line, width } });
}
function box(s, x, y, w, h, o = {}) {
  const opt = { x, y, w, h };
  if (o.fill) opt.fill = { color: o.fill, transparency: o.ft || 0 };
  if (o.line) opt.line = { color: o.line, width: o.lw || 0.75, dashType: o.dash || "solid" };
  if (o.r) opt.rectRadius = o.r;
  s.addShape(o.r ? pres.shapes.ROUNDED_RECTANGLE : pres.shapes.RECTANGLE, opt);
}
function logo(s, x, y) {
  const h = 0.36, w = h * (BRAND.logo_ratio || 2.75);
  const lx = x === undefined ? W - MX - w + 0.12 : x, ly = y === undefined ? H - 0.62 : y;
  const file = s.t.logo && path.join(HERE, s.t.logo);
  if (s.imgUnderLogo) box(s, lx + 0.02, ly + 0.03, w - 0.04, h - 0.06, { r: 0.12, fill: C.black, ft: 40 });
  if (file && fs.existsSync(file)) s.addImage({ path: file, x: lx, y: ly, w, h });
  else s.addText(BRAND.name, { x: lx - 1, y: ly, w: w + 1, h, margin: 0, fontFace: SANS, fontSize: 11, color: s.t.fg2, charSpacing: 4, align: "right", valign: "middle" });
}

const icoCache = {};
async function ico(name, color) {
  const k = name + color;
  if (icoCache[k]) return icoCache[k];
  const Comp = PI[name] || PI.PiSparkleLight;
  const svg = RD.renderToStaticMarkup(React.createElement(Comp, { color: "#" + color, size: "256" }));
  const buf = await sharp(Buffer.from(svg)).png().toBuffer();
  return (icoCache[k] = "image/png;base64," + buf.toString("base64"));
}
async function ring(s, name, x, y, d, o = {}) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: o.fill || s.t.card }, line: { color: o.line || s.t.acc, width: 0.75 } });
  const p = d * 0.23;
  s.addImage({ data: await ico(name, o.color || s.t.acc), x: x + p, y: y + p, w: d - 2 * p, h: d - 2 * p });
}
async function icon(s, name, x, y, d, color) {
  s.addImage({ data: await ico(name, color || s.t.acc), x, y, w: d, h: d });
}

// recorta cada imagen a la proporción exacta de su caja (nunca se deforma)
async function fit(file, w, h, pos = "centre") {
  const src = path.isAbsolute(file) ? file : path.join(HERE, file);
  const pw = Math.round(w * 150), ph = Math.round(h * 150);
  const out = path.join(CROPS, `${path.basename(file).replace(/\.\w+$/, "")}_${pw}x${ph}_${pos}.jpg`);
  if (!fs.existsSync(out)) await sharp(src).resize(pw, ph, { fit: "cover", position: pos }).jpeg({ quality: 86 }).toFile(out);
  return out;
}
const exists = (file) => fs.existsSync(path.isAbsolute(file) ? file : path.join(HERE, file));
function tag(s, text, x, y, o = {}) {
  const h = o.h || 0.3, w = o.w || 0.32 + text.length * 0.106;
  box(s, x, y, w, h, { fill: o.fill || C.black, ft: o.ft === undefined ? 20 : o.ft });
  s.addText(text, { x, y, w, h, margin: 0, fontFace: SANS, fontSize: o.size || 10.5, bold: true, color: o.color || C.gold, align: "center", valign: "middle", charSpacing: 2 });
}
function illTag(s, xRight, yBottom) {
  const w = 1.55, h = 0.26;
  s.addText("Imagen ilustrativa", { x: xRight - w, y: yBottom - h, w, h, margin: 0, fontFace: SANS, fontSize: 10, italic: true, color: "D0D0D0", align: "right", valign: "middle" });
}
// recuadro punteado del color de acción para un dato o una foto que falta (nunca inventes datos)
function placeholder(s, x, y, w, h, label, sub, onLight = !s.t.dark) {
  box(s, x, y, w, h, { line: C.rosa, lw: 1.25, dash: "dash", fill: onLight ? "FBEFF3" : "1A0A10", ft: onLight ? 0 : 20 });
  s.addText(label, { x: x + 0.15, y: y + h / 2 - 0.42, w: w - 0.3, h: 0.4, margin: 0, fontFace: SANS, fontSize: 13, bold: true, color: C.rosa2, align: "center", valign: "middle", charSpacing: 2 });
  if (sub) s.addText(sub, { x: x + 0.15, y: y + h / 2 + 0.02, w: w - 0.3, h: 0.55, margin: 0, fontFace: SANS, fontSize: 11.5, color: s.t.fg2, align: "center", valign: "top" });
}
async function pic(s, file, x, y, w, h, o = {}) {
  if (!exists(file)) return placeholder(s, x, y, w, h, o.missing || "FOTO", path.basename(file));
  s.addImage({ path: await fit(file, w, h, o.pos), x, y, w, h });
  if (o.frame !== false) box(s, x, y, w, h, { line: o.frameColor || s.t.acc, lw: 0.75 });
  if (o.tag) tag(s, o.tag, x + 0.15, y + h - 0.45);
  if (o.ill) illTag(s, x + w - 0.12, y + h - 0.08);
}
async function gradPNG(name, x2, y2, stops) {
  const out = path.join(CROPS, name + "-" + C.black + ".png");
  if (fs.existsSync(out)) return out;
  const st = stops.map(([off, a]) => `<stop offset="${off}" stop-color="#${C.black}" stop-opacity="${a}"/>`).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="1000" viewBox="0 0 1000 1000" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1="0" x2="${x2}" y2="${y2}">${st}</linearGradient></defs><rect width="1000" height="1000" fill="url(#g)"/></svg>`;
  await sharp(Buffer.from(svg)).png().toFile(out);
  return out;
}
let FADE_L, EDGE_L, EDGE_R;
// foto a sangre a la derecha (de x hasta el borde) fundida con el fondo
async function bleedRight(s, file, x, o = {}) {
  const w = W - x;
  if (!exists(file)) return placeholder(s, x, 0, w, H, o.missing || "FOTO", path.basename(file));
  s.imgUnderLogo = true;
  s.addImage({ path: await fit(file, w, H, o.pos), x, y: 0, w, h: H });
  s.addImage({ path: EDGE_L, x: x - 0.02, y: 0, w: o.fw || 1.7, h: H });
  if (o.ill) illTag(s, W - 0.2, 0.42);
}
async function bleedLeft(s, file, w, o = {}) {
  if (!exists(file)) return placeholder(s, 0, 0, w, H, o.missing || "FOTO", path.basename(file));
  s.addImage({ path: await fit(file, w, H, o.pos), x: 0, y: 0, w, h: H });
  const fw = o.fw || 1.7;
  s.addImage({ path: EDGE_R, x: w - fw + 0.02, y: 0, w: fw, h: H });
  if (o.ill) illTag(s, w - 0.35, H - 0.12);
}
// píldora del color de acción: "escribe X en el chat", reservar, entrar
async function chip(s, label, x, y, w, h = 0.62, o = {}) {
  box(s, x, y, w, h, { r: o.r === undefined ? h / 2 : o.r, fill: C.rosa, line: C.rosa2 });
  const ic = Math.min(0.36, h * 0.56);
  s.addImage({ data: await ico(o.icon || "PiChatCircleDotsLight", "FFFFFF"), x: x + 0.26, y: y + (h - ic) / 2, w: ic, h: ic });
  T(s, label, x + 0.26 + ic + 0.16, y, w - (0.26 + ic + 0.16) - 0.22, h, {
    font: SANS, size: o.size || 15.5, color: "FFFFFF", accent: "FFFFFF", accFont: SANS, accItalic: false, accBold: true,
    accSize: o.accSize, valign: "middle", ls: 1.05,
  });
}
function quoteCard(s, x, y, w, h, str, o = {}) {
  box(s, x, y, w, h, { fill: o.fill || s.t.card, ft: o.ft === undefined ? (s.t.dark ? 8 : 0) : o.ft, line: s.t.line });
  box(s, x, y, 0.06, h, { fill: s.t.acc });
  T(s, str, x + 0.35, y + 0.1, w - 0.6, h - 0.2, Object.assign({ size: 22, italic: true, valign: "middle", ls: 1.05 }, o));
}
function bigNum(s, n) {
  s.addText(n, { x: 7.6, y: 0.1, w: 5.4, h: 4.6, margin: 0, fontFace: SERIF, fontSize: 300, italic: true, color: C.gold, transparency: 82, align: "right", valign: "top" });
}
// curva suave (Catmull-Rom) dibujada con formas: área translúcida + línea + eje con edades/fechas
function smooth(pts, n = 14) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)];
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
function curveChart(s, o) {
  const X = (a) => o.x + ((a - o.a0) / (o.a1 - o.a0)) * o.w;
  const Y = (v) => o.y + o.h - ((v - o.v0) / (o.v1 - o.v0)) * o.h;
  const rel = smooth(o.data.map(([a, v]) => [X(a), Y(v)])).map(([px, py]) => ({ x: +(px - o.x).toFixed(4), y: +(py - o.y).toFixed(4) }));
  const area = [{ x: rel[0].x, y: o.h }, ...rel, { x: rel[rel.length - 1].x, y: o.h }, { close: true }];
  s.addShape(pres.shapes.CUSTOM_GEOMETRY, { x: o.x, y: o.y, w: o.w, h: o.h, points: area, fill: { color: o.color, transparency: o.areaT || 84 } });
  s.addShape(pres.shapes.CUSTOM_GEOMETRY, { x: o.x, y: o.y, w: o.w, h: o.h, points: rel, line: { color: o.color, width: 3.25 } });
  hline(s, o.x, o.y + o.h, o.w, o.axis, 1);
  o.ticks.forEach((a) => s.addText(String(a), { x: X(a) - 0.4, y: o.y + o.h + 0.1, w: 0.8, h: 0.32, margin: 0, fontFace: SANS, fontSize: 13, color: o.tickColor, align: "center" }));
  return { X, Y };
}
// tarjeta de reserva legible en celular: datos de pago (o recuadros pendientes), QR y número grande
async function reservePanel(s, x, y, w, h, o = {}) {
  box(s, x, y, w, h, { fill: C.ivory, line: C.gold, lw: 1 });
  s.addText(o.title || "CÓMO RESERVAR", { x, y: y + 0.18, w, h: 0.3, margin: 0, fontFace: SANS, fontSize: 12.5, bold: true, color: C.goldDk, charSpacing: 4, align: "center" });
  const cx = x + 0.22, cw = w - 0.44, cy = y + 0.58, chh = 1.9, tx = cx + 0.18, tw = cw - 0.3;
  box(s, cx, cy, cw, chh, { line: C.rosa, lw: 1.25, dash: "dash", fill: "FBEFF3" });
  s.addText(o.payLabel || "TRANSFERENCIA", { x: tx, y: cy + 0.12, w: tw, h: 0.26, margin: 0, fontFace: SANS, fontSize: 11, bold: true, color: C.rosa, charSpacing: 2 });
  s.addText(`Banco: ${o.bank || "[ __________ ]"}`, { x: tx, y: cy + 0.42, w: tw, h: 0.32, margin: 0, fontFace: SANS, fontSize: 15, color: C.ink });
  s.addText(o.accountLabel || "CUENTA", { x: tx, y: cy + 0.8, w: tw, h: 0.24, margin: 0, fontFace: SANS, fontSize: 11, bold: true, color: C.ink2, charSpacing: 3 });
  s.addText(o.account || "[ número de cuenta ]", { x: tx, y: cy + 1.02, w: tw, h: 0.42, margin: 0, fontFace: SANS, fontSize: 18, bold: true, color: C.ink, valign: "middle" });
  s.addText(`Titular: ${o.holder || "[ __________ ]"}`, { x: tx, y: cy + 1.5, w: tw, h: 0.32, margin: 0, fontFace: SANS, fontSize: 15, color: C.ink });
  const q = Math.min(1.6, h - 3.9), qy = cy + chh + 0.15;
  if (o.qr && exists(o.qr)) s.addImage({ path: path.isAbsolute(o.qr) ? o.qr : path.join(HERE, o.qr), x: x + (w - q) / 2, y: qy, w: q, h: q });
  else placeholder(s, x + (w - q) / 2, qy, q, q, "QR", "", true);
  const yb = qy + q + 0.05;
  s.addText(o.scanLabel || "Escanea → WhatsApp", { x, y: yb, w, h: 0.26, margin: 0, fontFace: SANS, fontSize: 11.5, color: C.ink2, align: "center" });
  s.addText(o.phone || "[ teléfono ]", { x, y: yb + 0.26, w, h: 0.45, margin: 0, fontFace: SANS, fontSize: 24, bold: true, color: C.ink, align: "center", valign: "middle", charSpacing: 1 });
  if (o.keyword) T(s, `Escribe: *“${o.keyword}”*`, x, yb + 0.72, w, 0.42, { size: 21, color: C.ink2, accent: C.rosa, align: "center", valign: "middle" });
}

// ---------------------------------------------------------------- slides de ejemplo (bórralas)
(async () => {
  FADE_L = await gradPNG("fadeL", 1, 0, [[0, 0.96], [0.4, 0.9], [0.62, 0.55], [0.82, 0.12], [1, 0]]);
  EDGE_L = await gradPNG("edgeL", 1, 0, [[0, 1], [0.3, 0.75], [1, 0]]);
  EDGE_R = await gradPNG("edgeR", 1, 0, [[0, 0], [0.7, 0.75], [1, 1]]);

  // 1 · PORTADA: foto a sangre + velo + titular serif con acento
  {
    const s = slide("dark-a");
    if (exists("img/portada.jpg")) {
      s.addImage({ path: await fit("img/portada.jpg", W, H, "east"), x: 0, y: 0, w: W, h: H });
      s.addImage({ path: FADE_L, x: 0, y: 0, w: 9.4, h: H });
    }
    eyebrow(s, "LIVE  ·  NOMBRE DEL EXPERTO", MX, 1.65);
    T(s, "El título del live con *la promesa* en itálica *del color de acento*", MX, 2.0, 5.95, 2.75, { size: 41, ls: 0.95 });
    T(s, "(el subtítulo con la objeción que rompe, en itálica tenue)", MX, 4.75, 5.9, 0.95, { size: 20, italic: true, color: C.muted });
    hline(s, MX, 5.82, 0.7, C.gold, 1);
    T(s, "Una línea en sans que dice qué va a entender quien se quede", MX, 5.97, 5.9, 0.75, { font: SANS, size: 15, ls: 1.1 });
  }

  // 2 · QUIÉN SOY: foto enmarcada + cifras grandes + promesas numeradas
  {
    const s = slide("dark-a");
    await pic(s, "assets/experto.jpg", MX, 0.6, 4.2, 6.25, { missing: "FOTO DEL EXPERTO" });
    const X = 5.6, Wr = W - MX - X;
    eyebrow(s, "TU ANFITRIONA HOY", X, 0.65);
    T(s, "Nombre *Apellido*", X, 0.95, Wr, 0.85, { size: 46 });
    T(s, "23", X, 2.25, 1.8, 0.9, { size: 60, color: C.gold });
    s.addText("años de experiencia", { x: X, y: 3.12, w: 2.0, h: 0.3, margin: 0, fontFace: SANS, fontSize: 13.5, color: C.muted });
    vline(s, X + 2.15, 2.4, 1.0);
    T(s, "20,000", X + 2.45, 2.25, 3.0, 0.9, { size: 60, color: C.gold });
    s.addText("clientes", { x: X + 2.45, y: 3.12, w: 2.5, h: 0.3, margin: 0, fontFace: SANS, fontSize: 13.5, color: C.muted });
    hline(s, X, 3.75, Wr);
    T(s, "Esto es lo que vas a entender hoy:", X, 3.88, Wr, 0.45, { size: 23, italic: true, color: C.gold });
    ["Primera promesa concreta", "Segunda promesa concreta", "La *única* cosa que lo resuelve de raíz"].forEach((t, i) => {
      const y = 4.45 + i * 0.66;
      T(s, String(i + 1), X, y - 0.06, 0.4, 0.55, { size: 28, color: C.gold });
      T(s, t, X + 0.45, y, Wr - 0.45, 0.62, { font: SANS, size: 16, accFont: SANS, accItalic: false, accBold: true });
    });
    logo(s);
  }

  // 3 · FRASE DE IMPACTO + interacción en el chat
  {
    const s = slide("dark-b");
    eyebrow(s, "ESCÚCHAME BIEN");
    T(s, "La frase que rompe la creencia.\n*La que quieres que se lleven.*", MX, 1.2, CW, 2.2, { size: 50, ls: 0.96 });
    T(s, "Una línea de apoyo en sans, tenue, que la desarrolla", MX, 3.65, CW, 0.5, { font: SANS, size: 18, color: C.muted });
    await chip(s, "¿Tiene sentido? Escribe *SÍ* en el chat", MX, 4.6, 5.6, 0.64);
    logo(s);
  }

  // 4 · HISTORIA: foto a sangre + dato + cita + remate
  {
    const s = slide("dark-c");
    await bleedRight(s, "img/historia.jpg", 8.75, { ill: true, missing: "FOTO / IMAGEN DE LA HISTORIA" });
    const Wl = 7.55;
    eyebrow(s, "UNA HISTORIA REAL");
    s.addText("NOMBRE  ·  54 AÑOS  ·  SU SITUACIÓN", { x: MX, y: 0.95, w: Wl, h: 0.35, margin: 0, fontFace: SANS, fontSize: 14, bold: true, color: C.gold, charSpacing: 3 });
    T(s, "“La frase textual que dijo, en itálica, tal como la contó”", MX, 1.45, Wl, 1.3, { size: 26, italic: true });
    hline(s, MX, 3.0, Wl);
    s.addText("SEMANAS DESPUÉS", { x: MX, y: 3.15, w: 4, h: 0.3, margin: 0, fontFace: SANS, fontSize: 12.5, bold: true, color: C.gold, charSpacing: 4 });
    T(s, "“Lo que dijo después del resultado”", MX, 3.5, Wl, 0.6, { size: 27, italic: true, color: C.gold });
    quoteCard(s, MX, 4.6, Wl, 1.0, "El remate: *lo que cambió de verdad.*", { size: 26, italic: false });
    logo(s);
  }

  // 5 · DIVISOR DE SECCIÓN
  {
    const s = slide("depth");
    bigNum(s, "1");
    eyebrow(s, "SECRETO 1", MX, 0.9);
    T(s, "No fallaste tú.\n*Falló el método.*", MX, 1.25, 9.2, 2.3, { size: 60, ls: 0.95 });
    T(s, "Una línea que prepara lo que viene", MX, 3.75, 10, 0.5, { font: SANS, size: 18, color: C.soft });
    logo(s);
  }

  // 6 · TABLA COMPARATIVA (slide marfil)
  {
    const s = slide("light");
    eyebrow(s, "SECRETO 1  ·  LA COMPARACIÓN");
    T(s, "¿Por qué nada de lo que has probado *te duró?*", MX, 0.88, CW, 0.85, { size: 40 });
    const cx = [MX, MX + 3.75, MX + 9.15], cwid = [3.5, 5.2, 2.48];
    ["OPCIÓN", "QUÉ PASA", "CUÁNTO DURA"].forEach((t, i) => s.addText(t, { x: cx[i], y: 2.0, w: cwid[i], h: 0.32, margin: 0, fontFace: SANS, fontSize: 12, bold: true, color: C.goldDk, charSpacing: 3 }));
    hline(s, MX, 2.4, CW, C.goldDk, 1);
    [["Opción A", "Lo que hace y por qué no basta", "4–5 meses"], ["Opción B", "Lo que hace y por qué no basta", "6–12 meses"], ["Opción C", "Lo que hace y por qué no basta", "Nada permanente"]].forEach(([a, b, c], i) => {
      const y = 2.48 + i * 0.98;
      T(s, a, cx[0], y, cwid[0], 0.9, { size: 25, valign: "middle" });
      s.addText(b, { x: cx[1], y, w: cwid[1], h: 0.9, margin: 0, fontFace: SANS, fontSize: 16.5, color: C.ink2, valign: "middle" });
      T(s, c, cx[2], y, cwid[2], 0.9, { size: 25, italic: true, color: C.vino, valign: "middle" });
      hline(s, MX, y + 0.95, CW);
    });
    logo(s);
  }

  // 7 · CURVA DIBUJADA (slide marfil)
  {
    const s = slide("light");
    eyebrow(s, "LO QUE PASA CON LOS AÑOS");
    T(s, "Tu indicador *por edad*", MX, 0.88, CW, 0.85, { size: 40 });
    const ch = curveChart(s, {
      x: 1.3, y: 2.35, w: 10.9, h: 3.6, a0: 20, a1: 70, v0: 0, v1: 105,
      data: [[20, 100], [25, 99], [30, 94.5], [35, 89.5], [40, 84.5], [45, 79], [48, 70], [50, 62], [55, 48], [60, 38], [65, 31], [70, 26]],
      color: C.goldDk, axis: C.ink2, tickColor: C.ink2, ticks: [20, 30, 40, 50, 60, 70],
    });
    s.addShape(pres.shapes.OVAL, { x: ch.X(45) - 0.11, y: ch.Y(79) - 0.11, w: 0.22, h: 0.22, fill: { color: C.vino }, line: { color: C.ivory, width: 2 } });
    T(s, "45 → se *DESPLOMA*", ch.X(46.5), ch.Y(97), 4.2, 0.6, { size: 30, accent: C.vino, accItalic: false, accBold: true });
    logo(s);
  }

  // 8 · PREGUNTAS FRECUENTES: respuesta corta gigante
  {
    const s = slide("dark-a");
    eyebrow(s, "LO QUE SIEMPRE ME PREGUNTAN");
    T(s, "Lo que *siempre* me preguntan", MX, 0.88, CW, 0.85, { size: 40 });
    const faq = [["¿Duele?", "NO", "El detalle en una línea"], ["¿Recuperación?", "NINGUNA", "El detalle en una línea"], ["¿Sesiones?", "UNA", "El detalle en una línea"], ["¿Cuánto dura?", "2 AÑOS", "vs 5 meses de otros"], ["¿Se nota?", "NO", "“Te ves descansada”"], ["¿Sirve para mí?", "SÍ", "El detalle en una línea"]];
    const cw = (CW - 0.6) / 3, chh = 2.2;
    faq.forEach(([q, a, d], i) => {
      const x = MX + (i % 3) * (cw + 0.3), y = 2.0 + Math.floor(i / 3) * (chh + 0.25);
      box(s, x, y, cw, chh, { fill: C.card, line: C.goldLine });
      s.addText(q, { x: x + 0.3, y: y + 0.25, w: cw - 0.6, h: 0.4, margin: 0, fontFace: SANS, fontSize: 16, bold: true, color: C.muted });
      T(s, a, x + 0.3, y + 0.66, cw - 0.6, 0.78, { size: 44, color: C.gold });
      s.addText(d, { x: x + 0.3, y: y + 1.45, w: cw - 0.6, h: 0.65, margin: 0, fontFace: SANS, fontSize: 15.5, color: C.text });
    });
    logo(s);
  }

  // 9 · ESCALERA DE PRECIOS
  {
    const s = slide("dark-b");
    eyebrow(s, "LOS PRECIOS, EN PÚBLICO");
    T(s, "Hay opciones *para cada bolsillo.*", MX, 0.88, CW, 0.8, { size: 40 });
    const base = 5.5, cw = (CW - 0.6) / 3;
    [{ top: 3.05, t: "OPCIÓN BÁSICA", p: "Desde $7,500", d: "Ayuda, pero no resuelve de raíz" }, { top: 2.5, t: "OPCIÓN MEDIA", p: "$14,900", d: "" }, { top: 1.85, t: "LA QUE RESUELVE", p: "$29,900", d: "aprox. $1,690/mes\ndura 2 años · resuelve de raíz", hi: true }].forEach((st, i) => {
      const x = MX + i * (cw + 0.3);
      box(s, x, st.top, cw, base - st.top, { fill: st.hi ? C.vinoDk : C.card, line: st.hi ? C.gold : C.goldLine, lw: st.hi ? 1.5 : 0.75 });
      s.addText(st.t, { x: x + 0.28, y: st.top + 0.22, w: cw - 0.56, h: 0.62, margin: 0, fontFace: SANS, fontSize: 13, bold: true, color: st.hi ? C.gold : C.text, charSpacing: 2 });
      T(s, st.p, x + 0.28, st.top + 0.9, cw - 0.56, 0.9, { size: st.hi ? 54 : 40, color: st.hi ? C.gold : C.text });
      if (st.d) s.addText(st.d, { x: x + 0.28, y: st.top + (st.hi ? 1.9 : 1.75), w: cw - 0.56, h: 0.62, margin: 0, fontFace: SANS, fontSize: 14.5, color: st.hi ? C.text : C.muted });
    });
    T(s, "Solo una resuelve de raíz. En la valoración definimos cuál es la tuya.", MX, 5.75, CW, 0.5, { size: 23, italic: true });
    logo(s);
  }

  // 10 · OFERTA + TARJETA DE RESERVA
  {
    const s = slide("depth");
    box(s, MX, 0.48, CW, 0.62, { r: 0.31, fill: C.rosa, line: C.rosa2 });
    s.addText("SOLO PARA QUIENES RESERVAN HOY:", { x: MX, y: 0.48, w: CW, h: 0.62, margin: 0, fontFace: SANS, fontSize: 15, bold: true, color: "FFFFFF", align: "center", valign: "middle", charSpacing: 1 });
    const Wl = 7.2;
    [["1", "PRIMER BONO: *lo que incluye y cuánto vale*"], ["2", "SEGUNDO BONO: *lo que incluye*"]].forEach(([n, t], i) => {
      const y = 1.35 + i * 1.3;
      box(s, MX, y, Wl, 1.1, { fill: "0E0709", ft: 15, line: C.gold });
      T(s, n, MX + 0.25, y + 0.08, 0.6, 0.85, { size: 46, color: C.gold });
      T(s, t, MX + 0.95, y, Wl - 1.2, 1.1, { font: SANS, size: 16, bold: true, accent: C.text, accFont: SANS, accItalic: false, accBold: false, valign: "middle" });
    });
    T(s, "*[CUPOS]* espacios · la urgencia real, sin inventar", MX + 0.05, 4.15, Wl, 0.5, { font: SANS, size: 16, color: C.soft, accent: C.rosa2, accFont: SANS, accItalic: false, accBold: true });
    await reservePanel(s, 8.4, 1.35, 4.08, 5.25, { keyword: "vengo del live" });
    logo(s);
  }

  await pres.writeFile({ fileName: OUT });
  console.log("OK", OUT, "slides:", ONLY.length ? ONLY.length : N);
})().catch((e) => { console.error(e); process.exit(1); });
