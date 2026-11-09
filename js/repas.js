// Onglet Repas : tout est gratuit et sans IA.
// Aliments : table Ciqual (Anses) embarquée, Open Food Facts en ligne (recherche et code-barres),
// plats du dehors à portions standard, favoris, saisie manuelle. Données sur le téléphone.
import { PLATS, PORTIONS } from "./plats.js";

const K = {jours: "carnet-repas-v1", favoris: "carnet-favoris-v1", objectifs: "carnet-objectifs-v1", corps: "carnet-corps-v1"};
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } }
};
const DEF_OBJ = {k: 1800, p: 115, g: 190, l: 60, pas: 7500};
let jours = store.get(K.jours, {}), favoris = store.get(K.favoris, []), obj = {...DEF_OBJ, ...store.get(K.objectifs, {})}, corps = store.get(K.corps, []);
let ciqual = null, day = null, pick = null, scanner = null;

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const r0 = n => Math.round(n), r1 = n => (Math.round(n * 10) / 10).toString().replace(".", ",");
const iso = d => { const x = new Date(d); x.setMinutes(x.getMinutes() - x.getTimezoneOffset()); return x.toISOString().slice(0, 10); };
const today = () => iso(new Date());
const dateFr = (s, o = {weekday:"long", day:"numeric", month:"long"}) => new Date(s + "T12:00:00").toLocaleDateString("fr-FR", o);
const norm = s => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/æ/g, "ae");
const toast = m => { const t = $("toast"); t.textContent = m; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3600); };
const MOMENTS = [["matin", "Petit-déjeuner"], ["midi", "Déjeuner"], ["collation", "Collation"], ["soir", "Dîner"]];
const momentNow = () => { const h = new Date().getHours(); return h < 11 ? "matin" : h < 15 ? "midi" : h < 18 ? "collation" : "soir"; };
const J = d => (jours[d] ||= {items: [], pas: null});
const saveJ = () => { for (const [d, j] of Object.entries(jours)) if (!j.items.length && j.pas == null) delete jours[d]; store.set(K.jours, jours); };
const tot = items => items.reduce((a, i) => ({k: a.k + i.k, p: a.p + i.p, g: a.g + i.g, l: a.l + i.l}), {k: 0, p: 0, g: 0, l: 0});

/* ---------- Bilan du jour ---------- */
function render(){
  const j = J(day), t = tot(j.items);
  const bar = (lab, v, goal, unit, cls) => {
    const pct = goal ? Math.min(100, v / goal * 100) : 0, left = goal - v;
    return `<div class="mac"><div class="mac-top"><b>${lab}</b><span class="num">${r0(v)} / ${goal} ${unit}</span></div>
      <div class="mbar"><i class="${cls}" style="width:${pct}%"></i></div>
      <span class="muted small">${left >= 0 ? `reste ${r0(left)} ${unit}` : `${r0(-left)} ${unit} au-dessus`}</span></div>`;
  };
  const isToday = day === today();
  $("rDate").innerHTML = `<button type="button" class="ghost nav" data-day="-1" aria-label="Jour précédent">‹</button>
    <div><div class="eyebrow">${isToday ? "Aujourd'hui" : ""}</div><h2>${dateFr(day)}</h2></div>
    <button type="button" class="ghost nav" data-day="1" aria-label="Jour suivant" ${isToday ? "disabled" : ""}>›</button>`;
  $("rBilan").innerHTML = `${bar("Calories", t.k, obj.k, "kcal", "k")}${bar("Protéines", t.p, obj.p, "g", "p")}
    <div class="mac2">${bar("Glucides", t.g, obj.g, "g", "g")}${bar("Lipides", t.l, obj.l, "g", "l")}</div>
    ${t.p < obj.p * .8 && t.k > obj.k * .6 ? `<div class="tip">Pense aux protéines : il t'en manque ${r0(obj.p - t.p)} g. Un skyr, du thon, des œufs ou du poulet aident vite.</div>` : ""}
    <label class="f pas">Pas aujourd'hui (facultatif, objectif ${obj.pas.toLocaleString("fr-FR")})<input type="number" inputmode="numeric" min="0" max="100000" id="rPas" value="${j.pas ?? ""}" placeholder="ex. 6500"></label>`;
  const favs = favoris.length ? `<div class="favs"><span class="eyebrow">Favoris, en un tap</span><div class="chips2">${favoris.map((f, i) => `<button type="button" class="chip2" data-fav="${i}">+ ${esc(f.nom)} <small>${r0(tot(f.items).k)} kcal</small></button>`).join("")}</div></div>` : "";
  $("rListe").innerHTML = favs + MOMENTS.map(([m, nom]) => {
    const its = j.items.map((it, idx) => ({it, idx})).filter(x => x.it.moment === m);
    const tt = tot(its.map(x => x.it));
    return `<div class="card stack moment"><div class="ex-head"><h3>${nom}</h3><span class="muted num small">${its.length ? r0(tt.k) + " kcal · " + r0(tt.p) + " g prot." : ""}</span></div>
      ${its.map(({it, idx}) => `<div class="item"><div><b>${esc(it.nom)}</b><span class="muted small">${esc(it.q)} · ${r0(it.k)} kcal · P ${r1(it.p)} · G ${r1(it.g)} · L ${r1(it.l)}</span></div><button type="button" class="x" data-delitem="${idx}" aria-label="Retirer">×</button></div>`).join("")}
      <div class="row"><button type="button" class="ghost" data-add="${m}">+ Ajouter</button>${its.length ? `<button type="button" class="link" data-savefav="${m}">Enregistrer en favori</button>` : ""}</div></div>`;
  }).join("");
  renderCorps();
  $("rObj").innerHTML = `<summary>Mes objectifs du jour</summary>
    <div class="edit4">${[["k","Calories (kcal)"],["p","Protéines (g)"],["g","Glucides (g)"],["l","Lipides (g)"],["pas","Pas"]].map(([k, l]) => `<label class="f">${l}<input type="number" inputmode="numeric" data-obj="${k}" value="${obj[k]}"></label>`).join("")}</div>
    <p class="muted small" style="margin:0">Calculés pour une sèche légère (1,68 m, 60 kg, peu active en semaine). Tu peux les changer.</p>
    <button type="button" class="link" id="objReset">Revenir aux valeurs conseillées</button>`;
}

/* ---------- Poids et mensurations ---------- */
const MESURES = [["poids", "Poids", "kg"], ["taille", "Tour de taille", "cm"], ["hanches", "Tour de hanches", "cm"], ["fesses", "Tour de fesses", "cm"], ["cuisse", "Tour de cuisse", "cm"], ["bras", "Tour de bras", "cm"]];
function renderCorps(){
  const first = k => corps.find(c => c[k] != null), last = k => [...corps].reverse().find(c => c[k] != null);
  const rows = MESURES.map(([k, l, u]) => { const a = first(k), b = last(k); if (!b) return "";
    const d = b[k] - a[k]; return `<div class="crow static"><b>${l}</b><span class="num">${r1(a[k])} → ${r1(b[k])} ${u}</span><span class="gain">${d === 0 ? "=" : (d > 0 ? "+" : "") + r1(d) + " " + u}</span></div>`; }).join("");
  const pts = corps.filter(c => c.poids != null);
  $("rCorps").innerHTML = `<h2>Poids et mensurations</h2>
    <p class="muted small" style="margin:0">Une fois par semaine suffit, le matin à jeun, toujours dans les mêmes conditions. Remplis seulement ce que tu veux.</p>
    <div class="edit3">${MESURES.map(([k, l, u]) => `<label class="f">${l} (${u})<input type="number" inputmode="decimal" step="0.1" data-mes="${k}"></label>`).join("")}</div>
    <button type="button" class="primary" id="mesAdd">Noter aujourd'hui</button>
    ${rows ? `<div class="clist">${rows}</div>` : ""}
    ${pts.length > 1 ? lineChart(pts.map(c => ({d: c.date, v: c.poids})), "poids (kg)") : ""}`;
}
function lineChart(pts, unit){
  const W = 640, H = 200, L = 44, R = 16, T = 14, B = 28;
  let lo = Math.min(...pts.map(p => p.v)), hi = Math.max(...pts.map(p => p.v)); if (hi - lo < 2){ lo -= 1; hi += 1; }
  const x = i => L + i * (W - L - R) / (pts.length - 1), y = v => T + (hi - v) / (hi - lo) * (H - T - B);
  let g = ""; for (let i = 0; i <= 4; i++){ const v = lo + (hi - lo) * i / 4; g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${r1(v)}</text>`; }
  const path = pts.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.v)}`).join(" ");
  const every = Math.max(1, Math.ceil(pts.length / 6));
  const xl = pts.map((p, i) => (i % every === 0 || i === pts.length - 1) ? `<text x="${x(i)}" y="${H - 6}" text-anchor="middle">${dateFr(p.d, {day:"numeric", month:"short"})}</text>` : "").join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe ${unit}">${g}<path class="line" d="${path}"/>${pts.map((p, i) => `<circle class="dot" cx="${x(i)}" cy="${y(p.v)}" r="4.5"/>`).join("")}${xl}</svg>`;
}

/* ---------- Ajout d'un aliment ---------- */
async function loadCiqual(){
  if (ciqual) return ciqual;
  const rows = await (await fetch("data/ciqual.json")).json();
  ciqual = rows.map(r => ({nom: r[0], n: norm(r[0]), k: r[1], p: r[2], g: r[3], l: r[4]}));
  return ciqual;
}
function openAdd(moment){
  pick = {moment};
  $("addBody").innerHTML = `<div class="row" style="justify-content:space-between"><h2>Ajouter · ${MOMENTS.find(m => m[0] === moment)[1]}</h2><button class="ghost" type="button" data-closeadd>Fermer</button></div>
    <div class="seg4" role="tablist">${[["cherche","Chercher"],["scan","Code-barres"],["manuel","À la main"]].map(([k, l], i) => `<button type="button" data-mode="${k}" aria-pressed="${i === 0}">${l}</button>`).join("")}</div>
    <div id="addMode"></div>`;
  setMode("cherche");
  const d = $("addSheet"); d.showModal ? d.showModal() : d.setAttribute("open", "");
}
function closeAdd(){ stopScan(); $("addSheet").close(); }
function setMode(m){
  stopScan();
  document.querySelectorAll("[data-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === m));
  const box = $("addMode");
  if (m === "cherche"){
    box.innerHTML = `<input type="search" id="q" placeholder="ex. brick, thon, riz, skyr…" autocomplete="off" enterkeyhint="search">
      <div id="res" class="res"><p class="muted small">Tape un aliment ou un plat. Les plats du dehors (brick, couscous, kebab, sushis…) ont des portions toutes prêtes.</p></div>`;
    $("q").focus();
  } else if (m === "scan"){
    box.innerHTML = `<div id="reader" class="reader"></div>
      <p class="muted small" style="margin:0">Vise le code-barres du paquet. Ça marche aussi en tapant les chiffres :</p>
      <div class="row"><input type="number" inputmode="numeric" id="ean" placeholder="ex. 3017620422003" style="flex:1"><button type="button" class="primary" id="eanGo">Chercher</button></div>
      <div id="scanRes"></div>`;
    startScan();
  } else {
    box.innerHTML = `<label class="f">Nom<input type="text" id="mNom" placeholder="ex. Salade du midi"></label>
      <div class="edit4">${[["k","Calories (kcal)"],["p","Protéines (g)"],["g","Glucides (g)"],["l","Lipides (g)"]].map(([k, l]) => `<label class="f">${l}<input type="number" inputmode="decimal" step="0.1" data-man="${k}"></label>`).join("")}</div>
      <button type="button" class="primary" id="manAdd">Ajouter</button>`;
  }
}
let qTimer = null;
async function search(q){
  const res = $("res"); if (!res) return;
  const words = norm(q).split(/\s+/).filter(w => w.length > 1);
  if (!words.length){ res.innerHTML = ""; return; }
  const plats = PLATS.map((p, i) => ({p, i, n: norm(p[0])})).filter(x => words.every(w => x.n.includes(w)));
  const base = await loadCiqual();
  const score = it => (it.n.startsWith(words[0]) ? 0 : 50) + it.nom.length / 4 + (/\bcru|cuit|nature\b/.test(it.n) ? -3 : 0);
  const ciq = base.filter(x => words.every(w => x.n.includes(w))).sort((a, b) => score(a) - score(b)).slice(0, 25);
  window._ciq = ciq;
  res.innerHTML = `${plats.length ? `<div class="eyebrow">Plats à portions</div>${plats.map(x => `<button type="button" class="hit" data-plat="${x.i}"><b>${esc(x.p[0])}</b><span class="muted small">${esc(x.p[5])} · ${x.p[1]} kcal · ${x.p[2]} g prot.</span></button>`).join("")}` : ""}
    ${ciq.length ? `<div class="eyebrow">Aliments (pour 100 g)</div>${ciq.map((x, i) => `<button type="button" class="hit" data-ciq="${i}"><b>${esc(x.nom)}</b><span class="muted small">${x.k} kcal · P ${r1(x.p)} · G ${r1(x.g)} · L ${r1(x.l)}</span></button>`).join("")}` : ""}
    <button type="button" class="ghost" id="offSearch" style="margin-top:6px">Chercher « ${esc(q)} » dans les produits du commerce (Open Food Facts, internet)</button>
    ${!plats.length && !ciq.length ? `<p class="muted small">Rien dans la table. Essaie un autre mot, cherche dans les produits du commerce, ou ajoute-le à la main.</p>` : ""}`;
}
async function offSearch(q){
  const res = $("res"); const b = $("offSearch"); if (b){ b.disabled = true; b.textContent = "Recherche en cours…"; }
  try {
    const u = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&fields=product_name,brands,nutriments,code,quantity&lc=fr&cc=fr`;
    const d = await (await fetch(u)).json();
    const prods = (d.products || []).map(offItem).filter(Boolean);
    window._off = prods;
    const html = prods.length ? `<div class="eyebrow">Produits du commerce (pour 100 g)</div>${prods.map((x, i) => `<button type="button" class="hit" data-off="${i}"><b>${esc(x.nom)}</b><span class="muted small">${x.k} kcal · P ${r1(x.p)} · G ${r1(x.g)} · L ${r1(x.l)}</span></button>`).join("")}` : `<p class="muted small">Aucun produit trouvé.</p>`;
    if (b) b.outerHTML = html;
  } catch { if (b){ b.disabled = false; b.textContent = "Pas de connexion. Réessayer"; } }
}
function offItem(p){
  const n = p?.nutriments || {}; const k = n["energy-kcal_100g"] ?? (n.energy_100g ? n.energy_100g / 4.184 : null);
  if (k == null || !p.product_name) return null;
  return {nom: `${p.product_name}${p.brands ? " · " + p.brands.split(",")[0] : ""}`, k: Math.round(k), p: +n.proteins_100g || 0, g: +n.carbohydrates_100g || 0, l: +n.fat_100g || 0};
}
async function lookupEan(code){
  const box = $("scanRes"); if (!box) return;
  box.innerHTML = `<p class="muted small">Recherche du produit ${esc(code)}…</p>`;
  try {
    const d = await (await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,brands,nutriments,quantity`)).json();
    const it = d.status === 1 ? offItem(d.product) : null;
    if (!it){ box.innerHTML = `<p class="muted small">Produit inconnu ou sans valeurs nutritionnelles. Ajoute-le « À la main » avec l'étiquette.</p>`; return; }
    stopScan(); showQty({...it, src: "g"});
  } catch { box.innerHTML = `<p class="muted small">Pas de connexion internet : le code-barres a besoin du réseau.</p>`; }
}
async function startScan(){
  try {
    if (!window.Html5Qrcode){ await new Promise((ok, ko) => { const s = document.createElement("script"); s.src = "js/vendor/html5-qrcode.min.js"; s.onload = ok; s.onerror = ko; document.head.append(s); }); }
    const F = window.Html5QrcodeSupportedFormats;
    scanner = new window.Html5Qrcode("reader", {formatsToSupport: [F.EAN_13, F.EAN_8, F.UPC_A, F.UPC_E], verbose: false});
    await scanner.start({facingMode: "environment"}, {fps: 10, qrbox: {width: 260, height: 140}}, code => { navigator.vibrate?.(80); lookupEan(code); }, () => {});
  } catch { scanner = null; const r = $("reader"); if (r) r.innerHTML = `<p class="muted small">La caméra n'est pas disponible. Autorise-la dans Safari, ou tape les chiffres du code-barres.</p>`; }
}
function stopScan(){ if (!scanner) return; const s = scanner; scanner = null; try { Promise.resolve(s.stop()).then(() => s.clear()).catch(() => {}); } catch {} }

function showQty(it){
  pick.it = it;
  const box = $("addMode");
  if (it.src === "plat"){
    box.innerHTML = `<h3>${esc(it.nom)}</h3><p class="muted small" style="margin:0">Portion moyenne : ${esc(it.desc)}. Ce sont des estimations.</p>
      <div class="choices3">${PORTIONS.map(p => `<button type="button" class="choice" data-portion="${p.id}" aria-pressed="${p.id === "moyenne"}"><b>${p.nom}</b><span class="small">${r0(it.k * p.f)} kcal</span></button>`).join("")}</div>
      <label class="f">Nombre<input type="number" inputmode="decimal" step="0.5" min="0.5" id="nb" value="1"></label>
      <div id="prev"></div><button type="button" class="primary" id="qAdd">Ajouter</button>`;
    pick.portion = "moyenne";
  } else {
    box.innerHTML = `<h3>${esc(it.nom)}</h3><p class="muted small" style="margin:0">Pour 100 g : ${it.k} kcal · P ${r1(it.p)} · G ${r1(it.g)} · L ${r1(it.l)}</p>
      <label class="f">Quantité (g)<input type="number" inputmode="decimal" id="grams" value="100" min="1" max="3000"></label>
      <div class="chips2">${[30, 50, 100, 150, 200, 250].map(g => `<button type="button" class="chip2" data-g="${g}">${g} g</button>`).join("")}</div>
      <div id="prev"></div><button type="button" class="primary" id="qAdd">Ajouter</button>`;
  }
  preview();
}
function current(){
  const it = pick.it;
  if (it.src === "plat"){ const f = PORTIONS.find(p => p.id === pick.portion).f * (parseFloat($("nb").value.replace(",", ".")) || 1); const nb = parseFloat($("nb").value) || 1;
    return {nom: it.nom, q: `${nb > 1 ? nb + " × " : ""}portion ${PORTIONS.find(p => p.id === pick.portion).nom.toLowerCase()}`, k: it.k * f, p: it.p * f, g: it.g * f, l: it.l * f}; }
  const gr = parseFloat($("grams").value.replace(",", ".")) || 0, f = gr / 100;
  return {nom: it.nom, q: `${r0(gr)} g`, k: it.k * f, p: it.p * f, g: it.g * f, l: it.l * f};
}
function preview(){ const c = current(); $("prev").innerHTML = `<div class="tip">${r0(c.k)} kcal · ${r1(c.p)} g de protéines · ${r1(c.g)} g de glucides · ${r1(c.l)} g de lipides</div>`; }
function addItems(items, moment){
  const j = J(day); const rd = v => Math.round(+v * 10) / 10; for (const i of items) j.items.push({...i, moment, k: rd(i.k), p: rd(i.p), g: rd(i.g), l: rd(i.l)}); saveJ(); render();
}

/* ---------- Événements ---------- */
document.addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b || !b.closest("#p-repas, #addSheet")) return;
  if (b.dataset.day){ const d = new Date(day + "T12:00:00"); d.setDate(d.getDate() + +b.dataset.day); day = iso(d); render(); return; }
  if (b.dataset.add){ openAdd(b.dataset.add); return; }
  if (b.dataset.closeadd !== undefined){ closeAdd(); return; }
  if (b.dataset.mode){ setMode(b.dataset.mode); return; }
  if (b.dataset.plat){ const p = PLATS[b.dataset.plat]; showQty({nom: p[0], k: p[1], p: p[2], g: p[3], l: p[4], desc: p[5], src: "plat"}); return; }
  if (b.dataset.ciq){ showQty({...window._ciq[b.dataset.ciq], src: "g"}); return; }
  if (b.dataset.off){ showQty({...window._off[b.dataset.off], src: "g"}); return; }
  if (b.id === "offSearch"){ offSearch($("q").value.trim()); return; }
  if (b.id === "eanGo"){ const v = $("ean").value.trim(); if (v) lookupEan(v); return; }
  if (b.dataset.portion){ pick.portion = b.dataset.portion; document.querySelectorAll("[data-portion]").forEach(x => x.setAttribute("aria-pressed", x === b)); preview(); return; }
  if (b.dataset.g){ $("grams").value = b.dataset.g; preview(); return; }
  if (b.id === "qAdd"){ const c = current(); addItems([c], pick.moment); closeAdd(); toast(`Ajouté : ${c.nom}, ${r0(c.k)} kcal`); return; }
  if (b.id === "manAdd"){
    const v = k => parseFloat((document.querySelector(`[data-man="${k}"]`).value || "0").replace(",", ".")) || 0;
    if (!v("k")){ toast("Indique au moins les calories."); return; }
    addItems([{nom: $("mNom").value.trim() || "Repas", q: "saisi à la main", k: v("k"), p: v("p"), g: v("g"), l: v("l")}], pick.moment); closeAdd(); return;
  }
  if (b.dataset.delitem){ J(day).items.splice(+b.dataset.delitem, 1); saveJ(); render(); return; }
  if (b.dataset.fav){ const f = favoris[b.dataset.fav]; addItems(f.items, momentNow()); toast(`Ajouté : ${f.nom}`); return; }
  if (b.dataset.savefav){
    const items = J(day).items.filter(i => i.moment === b.dataset.savefav).map(({moment, ...i}) => i);
    const nom = prompt("Nom de ce favori ?", items.length === 1 ? items[0].nom : "Mon " + MOMENTS.find(m => m[0] === b.dataset.savefav)[1].toLowerCase());
    if (!nom) return; favoris.push({nom: nom.slice(0, 40), items}); store.set(K.favoris, favoris); render(); toast("Favori enregistré"); return;
  }
  if (b.id === "mesAdd"){
    const e2 = {date: today()}; let any = false;
    document.querySelectorAll("[data-mes]").forEach(i => { const v = parseFloat(i.value.replace(",", ".")); if (v > 0){ e2[i.dataset.mes] = v; any = true; } });
    if (!any){ toast("Remplis au moins une mesure."); return; }
    corps = corps.filter(c => c.date !== e2.date); const prev = store.get(K.corps, []).find(c => c.date === e2.date) || {};
    corps.push({...prev, ...e2}); corps.sort((a, b2) => a.date < b2.date ? -1 : 1); store.set(K.corps, corps); render(); toast("Mesures notées"); return;
  }
  if (b.id === "objReset"){ obj = {...DEF_OBJ}; store.set(K.objectifs, obj); render(); return; }
});
document.addEventListener("input", e => {
  const i = e.target;
  if (i.id === "q"){ clearTimeout(qTimer); qTimer = setTimeout(() => search(i.value), 180); }
  if (i.id === "grams" || i.id === "nb") preview();
});
document.addEventListener("change", e => {
  const i = e.target;
  if (i.id === "rPas"){ const v = parseInt(i.value, 10); J(day).pas = v >= 0 ? v : null; saveJ(); }
  if (i.dataset.obj){ const v = parseFloat(i.value); if (v > 0){ obj[i.dataset.obj] = v; store.set(K.objectifs, obj); render(); $("rObj").open = true; } }
});
$("addSheet").addEventListener("close", stopScan);
$("addSheet").addEventListener("click", e => { if (e.target === $("addSheet")) closeAdd(); });

export function initRepas(){ day = today(); render(); }
export function refreshRepas(){ jours = store.get(K.jours, {}); favoris = store.get(K.favoris, []); corps = store.get(K.corps, []); obj = {...DEF_OBJ, ...store.get(K.objectifs, {})}; render(); }
export const REPAS_KEYS = K;
