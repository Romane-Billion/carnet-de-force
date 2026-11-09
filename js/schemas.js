// Dessins explicatifs, vue de profil. Chaque schéma = deux vignettes (départ, arrivée)
// avec la zone qui travaille en jaune, des flèches et de courtes annotations.

const C = {ink:"var(--ink)", eq:"var(--muted)", soft:"var(--line)", hot:"var(--plate)", ok:"var(--good)", bad:"var(--bad)", acc:"var(--accent)"};

// Silhouette à partir des articulations. p = {head, sh, hip, kn, an, el, wr, toe?}
function body(p, o = {}){
  const L = (a, b, w) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${C.ink}" stroke-width="${w}" stroke-linecap="round"/>`;
  let s = "";
  if (o.glute) s += `<circle cx="${o.glute[0]}" cy="${o.glute[1]}" r="17" fill="${C.hot}" opacity=".85"/>`;
  if (o.abs) s += `<ellipse cx="${o.abs[0]}" cy="${o.abs[1]}" rx="9" ry="16" transform="rotate(${o.absRot || 0} ${o.abs[0]} ${o.abs[1]})" fill="${C.hot}" opacity=".85"/>`;
  if (o.back) s += `<ellipse cx="${o.back[0]}" cy="${o.back[1]}" rx="9" ry="18" transform="rotate(${o.backRot || 0} ${o.back[0]} ${o.back[1]})" fill="${C.hot}" opacity=".85"/>`;
  s += L(p.hip, p.kn, 12) + L(p.kn, p.an, 10);
  if (p.toe) s += L(p.an, p.toe, 8);
  s += L(p.sh, p.hip, 17);
  s += L(p.sh, p.el, 8) + L(p.el, p.wr, 7);
  s += `<circle cx="${p.head[0]}" cy="${p.head[1]}" r="11" fill="${C.ink}"/>`;
  return s;
}
const arrow = (x1, y1, x2, y2, col = C.acc) => {
  const a = Math.atan2(y2 - y1, x2 - x1), h = 9;
  const p1 = [x2 - h * Math.cos(a - .5), y2 - h * Math.sin(a - .5)], p2 = [x2 - h * Math.cos(a + .5), y2 - h * Math.sin(a + .5)];
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width="3.5" stroke-linecap="round"/><path d="M${x2} ${y2} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z" fill="${col}"/>`;
};
const curve = (d, col = C.acc) => `<path d="${d}" stroke="${col}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-dasharray="1 7"/>`;
const txt = (x, y, t, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 13}" font-weight="${o.bold ? 700 : 500}" fill="${o.col || C.ink}" text-anchor="${o.anchor || "start"}" font-family="Barlow,system-ui,sans-serif">${t}</text>`;
const floor = `<line x1="8" y1="206" x2="292" y2="206" stroke="${C.soft}" stroke-width="3"/>`;
const svg = (inner, label) => `<svg viewBox="0 0 300 220" role="img" aria-label="${label}">${inner}</svg>`;

/* ---------- Extension au banc à 45° ---------- */
function bancExt(){
  // pied du banc, plateau des pieds, rouleau des chevilles, coussin incliné à 45°
  return `<path d="M36 206 L160 206 M56 206 L60 168 M130 206 L128 120" stroke="${C.eq}" stroke-width="6" stroke-linecap="round" fill="none"/>
    <rect x="42" y="164" width="40" height="8" rx="3" fill="${C.eq}"/>
    <circle cx="80" cy="150" r="7" fill="${C.eq}"/>
    <rect x="110" y="104" width="54" height="15" rx="7" transform="rotate(-45 137 111)" fill="${C.eq}"/>`;
}
const ext45 = [
  svg(floor + bancExt() + body({an:[66,158], toe:[54,166], kn:[104,118], hip:[144,80], sh:[174,136], head:[182,156], el:[188,122], wr:[176,116]}, {glute:[136,74]})
    + curve("M198 182 Q222 120 200 72") + arrow(204, 78, 198, 66)
    + txt(228, 140, "remonte") + txt(228, 156, "en serrant") + txt(228, 172, "les fesses")
    + txt(14, 24, "DÉPART : penchée vers le sol", {bold:true}) + txt(14, 42, "dos un peu arrondi", {col:C.eq}), "Extension à 45°, départ : buste penché vers le sol"),
  svg(floor + bancExt() + body({an:[66,158], toe:[54,166], kn:[104,118], hip:[144,80], sh:[182,42], head:[194,28], el:[194,58], wr:[180,56]}, {glute:[136,74]})
    + `<line x1="48" y1="176" x2="214" y2="14" stroke="${C.ok}" stroke-width="2" stroke-dasharray="6 5"/>`
    + txt(14, 24, "ARRIVÉE : corps bien droit", {bold:true}) + txt(206, 70, "pas plus haut,", {col:C.bad}) + txt(206, 86, "sinon tu", {col:C.bad}) + txt(206, 102, "cambres", {col:C.bad})
    + txt(160, 140, "coussin sous", {col:C.eq}) + txt(160, 156, "le pli de", {col:C.eq}) + txt(160, 172, "la hanche", {col:C.eq}) + arrow(158, 136, 146, 118, C.eq)
    + txt(14, 100, "pieds en V", {col:C.eq}) + arrow(36, 106, 52, 160, C.eq), "Extension à 45°, arrivée : corps aligné des talons à la tête")
];

/* ---------- Négatives de traction ---------- */
function barre(){
  return `<rect x="120" y="26" width="150" height="7" rx="3" fill="${C.eq}"/><line x1="128" y1="30" x2="128" y2="206" stroke="${C.eq}" stroke-width="5"/><line x1="262" y1="30" x2="262" y2="206" stroke="${C.eq}" stroke-width="5"/>`;
}
const banc = `<rect x="160" y="178" width="64" height="12" rx="3" fill="${C.soft}"/><line x1="168" y1="190" x2="168" y2="206" stroke="${C.soft}" stroke-width="5"/><line x1="216" y1="190" x2="216" y2="206" stroke="${C.soft}" stroke-width="5"/>`;
const bras = (sh, el, wr) => `<line x1="${sh[0]}" y1="${sh[1]}" x2="${el[0]}" y2="${el[1]}" stroke="${C.ink}" stroke-width="8" stroke-linecap="round"/><line x1="${el[0]}" y1="${el[1]}" x2="${wr[0]}" y2="${wr[1]}" stroke="${C.ink}" stroke-width="7" stroke-linecap="round"/>`;
const negatives = [
  svg(floor + barre() + banc + body({head:[192,20], sh:[192,46], hip:[192,106], kn:[196,144], an:[190,176], el:[168,44], wr:[172,30]}, {back:[182,64]})
    + bras([192,46], [216,44], [212,30])
    + txt(14, 40, "DÉPART", {bold:true}) + txt(14, 58, "menton") + txt(14, 74, "au-dessus") + txt(14, 90, "de la barre") + txt(14, 120, "monte en", {col:C.eq}) + txt(14, 136, "t'aidant", {col:C.eq}) + txt(14, 152, "du banc", {col:C.eq}), "Négative de traction, départ : en haut, menton au-dessus de la barre"),
  svg(floor + barre() + banc + body({head:[192,64], sh:[192,84], hip:[192,144], kn:[194,172], an:[192,170], el:[178,58], wr:[174,30]}, {back:[182,102]})
    + bras([192,84], [206,58], [210,30])
    + arrow(240, 60, 240, 150) + txt(240, 174, "5 s", {bold:true, size:18, anchor:"middle", col:C.acc})
    + txt(14, 40, "ARRIVÉE", {bold:true}) + txt(14, 58, "bras tendus") + txt(14, 96, "descends", {col:C.eq}) + txt(14, 112, "en comptant", {col:C.eq}) + txt(14, 128, "jusqu'à 5", {col:C.eq}), "Négative de traction, arrivée : bras tendus après 5 secondes de descente")
];

/* ---------- Relevé de genoux, chaise romaine ---------- */
function chaise(){
  return `<line x1="196" y1="40" x2="196" y2="206" stroke="${C.eq}" stroke-width="6"/>
    <rect x="178" y="60" width="14" height="80" rx="6" fill="${C.eq}"/>
    <rect x="128" y="66" width="68" height="10" rx="4" fill="${C.eq}"/>
    <rect x="180" y="190" width="40" height="8" rx="2" fill="${C.soft}"/>`;
}
const releves = [
  svg(floor + chaise() + body({head:[172,40], sh:[172,62], hip:[172,126], kn:[170,160], an:[168,194], el:[172,74], wr:[140,66]}, {abs:[164,98]})
    + txt(14, 30, "DÉPART", {bold:true}) + txt(14, 50, "avant-bras sur") + txt(14, 66, "les appuis") + txt(14, 90, "dos collé", {col:C.eq}) + txt(14, 106, "au dossier", {col:C.eq}) + txt(14, 130, "jambes pendues", {col:C.eq}), "Relevé de genoux, départ : jambes pendues, dos contre le dossier"),
  svg(floor + chaise() + body({head:[172,40], sh:[172,62], hip:[166,124], kn:[126,100], an:[120,140], el:[172,74], wr:[140,66]}, {abs:[160,96], absRot:10})
    + arrow(104, 150, 112, 116)
    + txt(14, 30, "ARRIVÉE", {bold:true}) + txt(14, 50, "genoux vers") + txt(14, 66, "la poitrine") + txt(14, 168, "enroule le bassin :", {col:C.acc, bold:true}) + txt(14, 186, "les fesses décollent", {col:C.acc}), "Relevé de genoux, arrivée : genoux à la poitrine, bassin enroulé")
];

/* ---------- Presse : placement des pieds ---------- */
function plateau(feet, title, sub, col, mark, ty){
  const foot = (x, y, r) => `<ellipse cx="${x}" cy="${y}" rx="13" ry="25" transform="rotate(${r} ${x} ${y})" fill="${col}" opacity=".9"/>`;
  return svg(`<rect x="60" y="40" width="180" height="150" rx="10" fill="none" stroke="${C.eq}" stroke-width="5"/>
    ${txt(150, 32, "haut du plateau", {anchor:"middle", col:C.eq, size:12})}${txt(150, 208, "bas du plateau", {anchor:"middle", col:C.eq, size:12})}
    ${feet.map(f => foot(...f)).join("")}
    ${txt(22, 34, mark, {bold:true, size:26, col})}
    ${txt(150, ty, title, {anchor:"middle", bold:true, size:15, col})}${txt(150, ty + 18, sub, {anchor:"middle", size:12})}`, title);
}
const pressepieds = [
  plateau([[112, 74, -12], [188, 74, 12]], "Hauts et écartés", "fessiers, arrière des cuisses", C.ok, "✓", 148),
  plateau([[132, 158, -4], [168, 158, 4]], "Bas et serrés", "avant des cuisses, genoux", C.bad, "✗", 76)
];

/* ---------- Hip thrust ---------- */
const bench = `<rect x="16" y="120" width="62" height="16" rx="4" fill="${C.eq}"/><line x1="26" y1="136" x2="26" y2="206" stroke="${C.eq}" stroke-width="6"/><line x1="68" y1="136" x2="68" y2="206" stroke="${C.eq}" stroke-width="6"/>`;
const disque = (x, y) => `<circle cx="${x}" cy="${y}" r="27" fill="none" stroke="${C.eq}" stroke-width="7"/><circle cx="${x}" cy="${y}" r="4" fill="${C.eq}"/>`;
const mousse = (x, y) => `<rect x="${x - 18}" y="${y - 13}" width="36" height="26" rx="12" fill="${C.acc}" opacity=".9"/>`;
const hipthrust = [
  svg(floor + bench + body({head:[90,108], sh:[78,124], hip:[134,190], kn:[186,152], an:[204,204], toe:[220,204], el:[104,150], wr:[130,176]}, {glute:[128,192]})
    + disque(140, 166) + mousse(140, 166)
    + txt(150, 24, "DÉPART", {bold:true}) + txt(150, 42, "fesses près du sol") + txt(150, 62, "haut du dos sur", {col:C.eq}) + txt(150, 78, "le bord du banc", {col:C.eq})
    + txt(170, 118, "gros coussin", {col:C.acc, bold:true}), "Hip thrust, départ : fesses près du sol, barre sur un gros coussin"),
  svg(floor + bench + body({head:[88,104], sh:[76,124], hip:[146,128], kn:[196,124], an:[204,204], toe:[220,204], el:[104,132], wr:[136,118]}, {glute:[146,136]})
    + disque(146, 102) + mousse(146, 102) + `<line x1="76" y1="116" x2="200" y2="116" stroke="${C.ok}" stroke-width="2" stroke-dasharray="6 5"/>`
    + arrow(150, 190, 150, 150) + txt(150, 24, "ARRIVÉE", {bold:true}) + txt(150, 42, "corps en table") + txt(216, 166, "pousse", {col:C.eq}) + txt(216, 182, "dans les", {col:C.eq}) + txt(216, 198, "talons", {col:C.eq})
    + txt(12, 24, "barre dans le pli", {col:C.acc, bold:true}) + txt(12, 40, "de la hanche,", {col:C.acc}) + txt(12, 56, "pas sur les os", {col:C.acc}), "Hip thrust, arrivée : corps à l'horizontale des épaules aux genoux")
];

export const SCHEMAS = {ext45, negatives, releves, presse: pressepieds, pressepieds, hipthrust};
export const LEGENDES = {
  ext45:["Départ", "Arrivée"], negatives:["Départ", "Arrivée"], releves:["Départ", "Arrivée"],
  presse:["À faire", "À éviter"], pressepieds:["À faire", "À éviter"], hipthrust:["Départ", "Arrivée"]
};
