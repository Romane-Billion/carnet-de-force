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
  for (const h of o.hl || []) s += `<ellipse cx="${h[0]}" cy="${h[1]}" rx="${h[2]}" ry="${h[3]}" transform="rotate(${h[4] || 0} ${h[0]} ${h[1]})" fill="${C.hot}" opacity=".85"/>`;
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

/* ---------- Outils pour les nouveaux dessins ---------- */
const seg = (a, b, w, col = C.ink) => `<line x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}" stroke="${col}" stroke-width="${w}" stroke-linecap="round"/>`;
const blob = (x, y, rx, ry, rot = 0) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${rot} ${x} ${y})" fill="${C.hot}" opacity=".85"/>`;
const rect = (x, y, w, h, col = C.eq, rot = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${col}" transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"/>`;
const head = (x, y) => `<circle cx="${x}" cy="${y}" r="11" fill="${C.ink}"/>`;
const titre = (t, sub, col) => txt(14, 24, t, {bold:true}) + (sub ? txt(14, 42, sub, {col: col || C.eq}) : "");
// silhouette de face : centre x, épaules y, hanches y, bras [coudeG, mainG, coudeD, mainD], jambes [genouG, piedG, genouD, piedD]
function front(cx, shy, hipy, bras, jambes){
  const sL = [cx - 22, shy], sR = [cx + 22, shy], hL = [cx - 13, hipy], hR = [cx + 13, hipy];
  return seg([cx, shy], [cx, hipy], 24) + seg(sL, sR, 12) + seg(sL, bras[0], 8) + seg(bras[0], bras[1], 7) + seg(sR, bras[2], 8) + seg(bras[2], bras[3], 7)
    + seg(hL, jambes[0], 12) + seg(jambes[0], jambes[1], 10) + seg(hR, jambes[2], 12) + seg(jambes[2], jambes[3], 10) + head(cx, shy - 22);
}

/* ---------- Tractions assistées (machine à genoux) ---------- */
const machineT = padY => `${seg([236, 20], [236, 206], 7, C.eq)}${seg([236, 30], [120, 30], 6, C.eq)}${seg([236, 120], [196, 120], 5, C.eq)}
  ${seg([236, padY + 6], [178, padY + 6], 5, C.eq)}${rect(104, padY, 76, 11)}`;
const traction = [
  svg(floor + machineT(171) + body({head:[168,62], sh:[150,74], hip:[150,132], kn:[150,168], an:[112,168], el:[150,54], wr:[150,32]}, {back:[141,96]})
    + txt(14, 64, "DÉPART", {bold:true}) + txt(14, 82, "bras tendus,") + txt(14, 98, "épaules basses,") + txt(14, 114, "abdos serrés") + txt(14, 144, "genoux sur", {col:C.eq}) + txt(14, 160, "le coussin", {col:C.eq}), "Tractions assistées, départ : bras tendus"),
  svg(floor + machineT(139) + body({head:[168,24], sh:[150,42], hip:[150,100], kn:[150,136], an:[112,136], el:[128,58], wr:[148,32]}, {back:[141,62]})
    + arrow(266, 170, 266, 70) + txt(14, 64, "ARRIVÉE", {bold:true}) + txt(14, 82, "menton au-dessus") + txt(14, 98, "des poignées") + txt(14, 124, "coudes vers", {col:C.eq}) + txt(14, 140, "les poches", {col:C.eq}), "Tractions assistées, arrivée : menton au-dessus des poignées")
];

/* ---------- Presse inclinée, vue de côté ---------- */
const rail = `${seg([96, 206], [270, 32], 6, C.soft)}${rect(30, 168, 80, 12, C.eq, -8)}${rect(14, 112, 16, 66, C.eq, -30)}`;
const plateauP = (x, y) => rect(x - 6, y - 26, 12, 52, C.eq, 45);
const presse = [
  svg(floor + rail + plateauP(176, 146) + body({head:[38,124], sh:[52,140], hip:[92,166], kn:[132,118], an:[170,148], toe:[178,138], el:[80,152], wr:[96,170]}, {glute:[88,170]})
    + titre("DÉPART : genoux à 90°", "pas plus bas pour ton genou", C.bad) + txt(196, 186, "descends", {col:C.eq}) + txt(196, 202, "en 3 s", {col:C.eq}), "Presse inclinée, départ : genoux pliés à 90 degrés"),
  svg(floor + rail + plateauP(206, 98) + body({head:[38,124], sh:[52,140], hip:[92,166], kn:[148,130], an:[198,104], toe:[206,92], el:[80,152], wr:[96,170]}, {glute:[88,170]})
    + arrow(214, 160, 250, 124) + titre("ARRIVÉE : jambes tendues", "genoux pas verrouillés") + txt(170, 190, "pousse avec", {col:C.eq}) + txt(170, 206, "les talons", {col:C.eq}), "Presse inclinée, arrivée : jambes tendues")
];

/* ---------- Mollets à la presse ---------- */
const mollets = [
  svg(floor + rail + plateauP(208, 86) + body({head:[38,124], sh:[52,140], hip:[92,166], kn:[148,130], an:[190,104], toe:[204,88], el:[80,152], wr:[96,170]}, {hl:[[172,118,7,16,-55]]})
    + titre("DÉPART : talons vers toi", "pointe des pieds en bas du plateau") + txt(150, 190, "étire bien", {col:C.eq}) + txt(150, 206, "le mollet", {col:C.eq}), "Mollets à la presse, départ : talons qui descendent"),
  svg(floor + rail + plateauP(222, 72) + body({head:[38,124], sh:[52,140], hip:[92,166], kn:[148,130], an:[190,104], toe:[214,82], el:[80,152], wr:[96,170]}, {hl:[[172,118,7,16,-55]]})
    + arrow(232, 120, 256, 96) + titre("ARRIVÉE : sur la pointe", "tiens 1 s, genoux tendus") , "Mollets à la presse, arrivée : pointe des pieds poussée")
];

/* ---------- Développé couché ---------- */
const bancDC = `${rect(54, 146, 150, 12)}${seg([74, 158], [74, 206], 6, C.eq)}${seg([186, 158], [186, 206], 6, C.eq)}`;
const barreDC = (x, y) => `${seg([x - 4, y - 30], [x - 4, y + 30], 5, C.eq)}<circle cx="${x - 4}" cy="${y}" r="20" fill="none" stroke="${C.eq}" stroke-width="6"/>`;
const corpsDC = (el, wr) => body({head:[64,134], sh:[86,138], hip:[168,140], kn:[214,120], an:[224,200], toe:[240,204], el, wr}, {hl:[[108,128,16,8]]});
const dc = [
  svg(floor + bancDC + barreDC(100, 66) + corpsDC([94, 108], [100, 72]) + titre("DÉPART : bras tendus", "omoplates serrées") + txt(196, 64, "pieds à plat", {col:C.eq}) + txt(196, 80, "au sol", {col:C.eq}), "Développé couché, départ : barre bras tendus"),
  svg(floor + bancDC + barreDC(112, 112) + corpsDC([84, 150], [112, 118]) + arrow(150, 50, 150, 96) + titre("ARRIVÉE : barre au bas", "des pectoraux") + txt(170, 64, "descends en 2-3 s", {col:C.eq}) + txt(170, 80, "coudes à 45°", {col:C.eq}), "Développé couché, arrivée : barre au bas de la poitrine")
];

/* ---------- Abducteurs (vue de face) ---------- */
const siegeAb = `${rect(110, 120, 80, 14)}${rect(118, 50, 64, 70, C.soft)}`;
const abduc = [
  svg(floor + siegeAb + rect(112, 132, 10, 26) + rect(178, 132, 10, 26) + front(150, 76, 126, [[118, 104], [112, 128], [182, 104], [188, 128]], [[136, 144], [134, 200], [164, 144], [166, 200]])
    + blob(126, 120, 9, 12) + blob(174, 120, 9, 12) + titre("DÉPART : jambes fermées", "dos collé au dossier"), "Abducteurs, départ : jambes presque fermées"),
  svg(floor + siegeAb + rect(84, 132, 10, 26) + rect(206, 132, 10, 26) + front(150, 76, 126, [[118, 104], [112, 128], [182, 104], [188, 128]], [[104, 144], [112, 200], [196, 144], [188, 200]])
    + blob(126, 120, 9, 12) + blob(174, 120, 9, 12) + arrow(96, 186, 58, 186) + arrow(204, 186, 242, 186)
    + titre("ARRIVÉE : ouvre fort", "tiens 1 s, referme en 2-3 s"), "Abducteurs, arrivée : jambes ouvertes")
];

/* ---------- Adducteurs (vue de face) : coussins à l'intérieur des genoux ---------- */
const adduc = [
  svg(floor + siegeAb + rect(110, 132, 10, 26) + rect(180, 132, 10, 26) + front(150, 76, 126, [[118, 104], [112, 128], [182, 104], [188, 128]], [[104, 144], [112, 200], [196, 144], [188, 200]])
    + blob(138, 140, 8, 12) + blob(162, 140, 8, 12) + titre("DÉPART : jambes ouvertes", "coussins à l'intérieur des genoux"), "Adducteurs, départ : jambes ouvertes, coussins à l'intérieur des genoux"),
  svg(floor + siegeAb + rect(138, 132, 10, 26) + rect(152, 132, 10, 26) + front(150, 76, 126, [[118, 104], [112, 128], [182, 104], [188, 128]], [[132, 144], [130, 200], [168, 144], [170, 200]])
    + blob(138, 140, 8, 12) + blob(162, 140, 8, 12) + arrow(70, 186, 108, 186) + arrow(230, 186, 192, 186)
    + titre("ARRIVÉE : serre fort", "tiens 1 s, rouvre en 2-3 s"), "Adducteurs, arrivée : jambes fermées")
];

/* ---------- Tirage vertical ---------- */
const machineTir = `${seg([150, 6], [150, 36], 2, C.eq)}${rect(100, 156, 70, 12)}${rect(166, 132, 30, 12)}${seg([132, 168], [132, 206], 6, C.eq)}`;
const tirage = [
  svg(floor + machineTir + seg([110, 36], [196, 36], 6, C.eq) + body({head:[158,76], sh:[138,92], hip:[134,152], kn:[180,148], an:[186,202], el:[144,64], wr:[150,38]}, {back:[130,114]})
    + txt(14, 64, "DÉPART", {bold:true}) + txt(14, 82, "bras tendus,") + txt(14, 98, "poitrine sortie"), "Tirage vertical, départ : bras tendus vers la barre"),
  svg(floor + machineTir + seg([150, 36], [160, 90], 2, C.eq) + seg([116, 92], [202, 92], 6, C.eq) + body({head:[158,78], sh:[138,96], hip:[134,152], kn:[180,148], an:[186,202], el:[126,124], wr:[156,96]}, {back:[130,116]})
    + arrow(230, 40, 230, 86) + txt(14, 64, "ARRIVÉE", {bold:true}) + txt(14, 82, "barre en haut") + txt(14, 98, "de la poitrine") + txt(14, 128, "coudes vers", {col:C.eq}) + txt(14, 144, "le bas", {col:C.eq}), "Tirage vertical, arrivée : barre en haut de la poitrine")
];

/* ---------- Dips assistés ---------- */
const machineD = padY => `${seg([236, 20], [236, 206], 7, C.eq)}${seg([236, 120], [146, 120], 6, C.eq)}${seg([236, padY + 6], [178, padY + 6], 5, C.eq)}${rect(104, padY, 76, 11)}`;
const dips = [
  svg(floor + machineD(172) + body({head:[158,52], sh:[150,68], hip:[150,128], kn:[150,166], an:[112,166], el:[158,94], wr:[158,118]}, {hl:[[155,84,5,11,-15]]})
    + txt(14, 64, "DÉPART", {bold:true}) + txt(14, 82, "bras tendus,") + txt(14, 98, "épaules basses,") + txt(14, 114, "buste droit"), "Dips assistés, départ : bras tendus"),
  svg(floor + machineD(196) + body({head:[158,82], sh:[150,98], hip:[150,154], kn:[150,190], an:[112,190], el:[124,108], wr:[150,118]}, {hl:[[136,104,6,12,-70]]})
    + arrow(260, 60, 260, 110) + txt(14, 64, "ARRIVÉE", {bold:true}) + txt(14, 82, "coudes à 90°,") + txt(14, 98, "pas plus bas") + txt(14, 128, "coudes vers", {col:C.eq}) + txt(14, 144, "l'arrière", {col:C.eq}), "Dips assistés, arrivée : coudes pliés à 90 degrés")
];

/* ---------- Développé militaire ---------- */
const bancM = `${rect(116, 60, 12, 92)}${rect(112, 150, 70, 12)}${seg([140, 162], [140, 206], 6, C.eq)}`;
const halt = (x, y) => `${rect(x - 14, y - 4, 28, 8, C.ink)}${rect(x - 16, y - 8, 6, 16, C.ink)}${rect(x + 10, y - 8, 6, 16, C.ink)}`;
const militaire = [
  svg(floor + bancM + body({head:[144,62], sh:[138,82], hip:[136,148], kn:[182,150], an:[188,202], el:[150,108], wr:[154,82]}, {hl:[[140,84,10,8]]}) + halt(154, 78)
    + titre("DÉPART : charge aux épaules", "coudes sous les mains"), "Développé militaire, départ : charge à hauteur des épaules"),
  svg(floor + bancM + body({head:[144,62], sh:[138,82], hip:[136,148], kn:[182,150], an:[188,202], el:[146,54], wr:[150,26]}, {hl:[[140,84,10,8]]}) + halt(150, 22)
    + arrow(200, 90, 200, 40) + txt(14, 64, "ARRIVÉE", {bold:true}) + txt(14, 82, "bras tendus") + txt(14, 120, "abdos et fesses", {col:C.eq}) + txt(14, 136, "serrés : ne", {col:C.eq}) + txt(14, 152, "cambre pas", {col:C.eq}), "Développé militaire, arrivée : bras tendus au-dessus de la tête")
];

/* ---------- Pec deck (vue de face) ---------- */
const pecMachine = `${rect(122, 50, 56, 100, C.soft)}${rect(110, 140, 80, 12)}`;
const pecdeck = [
  svg(floor + pecMachine + rect(66, 52, 10, 40) + rect(224, 52, 10, 40) + front(150, 86, 138, [[96, 92], [74, 70], [204, 92], [226, 70]], [[134, 166], [134, 204], [166, 166], [166, 204]])
    + blob(150, 102, 18, 9) + titre("DÉPART : bras ouverts", "coudes un peu pliés"), "Pec deck, départ : bras ouverts sur les côtés"),
  svg(floor + pecMachine + rect(130, 50, 10, 40) + rect(160, 50, 10, 40) + front(150, 86, 138, [[118, 100], [138, 72], [182, 100], [162, 72]], [[134, 166], [134, 204], [166, 166], [166, 204]])
    + blob(150, 102, 18, 9) + arrow(80, 140, 116, 140) + arrow(220, 140, 184, 140) + titre("ARRIVÉE : bras fermés", "serre 1 s"), "Pec deck, arrivée : bras ramenés devant")
];

/* ---------- Handstand ---------- */
const mur = `${rect(212, 8, 14, 198, C.soft)}`;
const hsBody = (o = {}) => body({head:[176,178], sh:[180,154], hip:[190,98], kn:[196,62], an:[200,28], toe:[208,22], el:[178,180], wr:[176,204]}, {hl:[[185,128,8,16,8]], ...o});
const hs_mur = [
  svg(floor + mur + body({head:[118,178], sh:[124,154], hip:[170,118], kn:[196,140], an:[208,150], toe:[210,138], el:[120,180], wr:[116,204]}, {})
    + txt(14, 24, "1. Monte en marchant", {bold:true}) + txt(14, 42, "les pieds au mur,", {col:C.eq}) + txt(14, 58, "mains vers le mur", {col:C.eq}) + arrow(140, 200, 168, 200), "Handstand au mur, étape 1 : monter les pieds au mur"),
  svg(floor + mur + hsBody() + titre("2. Ventre face au mur", "mains à 20-30 cm du mur") + txt(14, 90, "pousse fort", {col:C.acc, bold:true}) + txt(14, 106, "dans le sol", {col:C.acc})
    + txt(14, 136, "fesses et abdos", {col:C.eq}) + txt(14, 152, "serrés, regarde", {col:C.eq}) + txt(14, 168, "entre tes mains", {col:C.eq}), "Handstand au mur, étape 2 : ventre face au mur, corps aligné")
];
const hs_taps = [
  svg(floor + mur + hsBody() + titre("1. Handstand au mur", "poids sur les deux mains"), "Shoulder taps, étape 1 : handstand au mur"),
  svg(floor + mur + hsBody() + seg([180, 154], [160, 168], 8) + seg([160, 168], [172, 150], 7)
    + txt(14, 24, "2. Touche l'épaule", {bold:true}) + txt(14, 42, "décale le poids,", {col:C.eq}) + txt(14, 58, "bassin immobile", {col:C.eq}) + txt(14, 120, "1 s pour lever,", {col:C.eq}) + txt(14, 136, "1 s pour reposer", {col:C.eq}), "Shoulder taps, étape 2 : une main touche l'épaule opposée")
];
const hs_decol = [
  svg(floor + mur + hsBody() + titre("1. Pieds au mur", "corps bien aligné"), "Décoller du mur, étape 1 : pieds contre le mur"),
  svg(floor + mur + body({head:[172,178], sh:[176,154], hip:[180,98], kn:[182,62], an:[184,28], toe:[188,20], el:[174,180], wr:[172,204]}, {hl:[[178,128,8,16]]})
    + arrow(202, 50, 192, 50) + titre("2. Décolle les pieds", "et cherche l'équilibre") + txt(14, 120, "appuie avec le", {col:C.eq}) + txt(14, 136, "bout des doigts", {col:C.eq}) + txt(14, 152, "pour ne pas tomber", {col:C.eq}), "Décoller du mur, étape 2 : pieds décollés, en équilibre")
];

export const SCHEMAS = {ext45, negatives, releves, presse, pressepieds, mollets, hipthrust, traction, dc, abduc, adduc, tirage, dips, militaire, pecdeck, hs_mur, hs_taps, hs_decol};
export const LEGENDES = {
  ext45:["Départ", "Arrivée"], negatives:["Départ", "Arrivée"], releves:["Départ", "Arrivée"],
  presse:["Départ", "Arrivée"], pressepieds:["Pieds : à faire", "Pieds : à éviter"], hipthrust:["Départ", "Arrivée"],
  mollets:["Départ", "Arrivée"], traction:["Départ", "Arrivée"], dc:["Départ", "Arrivée"], abduc:["Départ", "Arrivée"], adduc:["Départ", "Arrivée"], tirage:["Départ", "Arrivée"],
  dips:["Départ", "Arrivée"], militaire:["Départ", "Arrivée"], pecdeck:["Départ", "Arrivée"], hs_mur:["Étape 1", "Étape 2"], hs_taps:["Étape 1", "Étape 2"], hs_decol:["Étape 1", "Étape 2"]
};
