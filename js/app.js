import { EX, ALL, byId, LEVELS, XP_LEVEL } from "./data.js";

/* ---------- Stockage (sur le téléphone) ---------- */
const KEY = "carnet-seances-v1";
const DRAFT = "carnet-brouillon-v1";
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k){ try { localStorage.removeItem(k); } catch {} }
};
const sortS = a => a.sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : (x.createdAt || 0) - (y.createdAt || 0)));
let sessions = sortS(store.get(KEY, []));
const persist = () => store.set(KEY, sessions);
const last0 = sessions[sessions.length - 1];
let curType = last0 ? (last0.type === "A" ? "B" : "A") : "A";

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = n => (Math.round(n * 10) / 10).toString().replace(".", ",");
const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const dateFr = s => new Date(s + "T12:00:00").toLocaleDateString("fr-FR", {weekday:"short", day:"numeric", month:"short"});
function weekKey(s){ const d = new Date(s + "T12:00:00"); const day = (d.getDay() + 6) % 7; d.setDate(d.getDate() - day + 3); const y = d.getFullYear(); const w1 = new Date(y, 0, 4); return y + "-" + Math.round(((d - w1) / 864e5 - 3 + ((w1.getDay() + 6) % 7)) / 7 + 1); }
function toast(msg){ const t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 3400); }

/* ---------- Visuels ---------- */
const HOLLOW = (pose) => `<svg viewBox="0 0 300 200" role="img" aria-label="Position hollow">
  <rect width="300" height="200" fill="var(--soft)"/>
  <line x1="20" y1="160" x2="280" y2="160" stroke="var(--line)" stroke-width="4"/>
  ${pose === 0
    ? `<path d="M70 150 Q150 165 220 150" stroke="var(--ink)" stroke-width="14" fill="none" stroke-linecap="round"/>
       <line x1="220" y1="150" x2="270" y2="152" stroke="var(--ink)" stroke-width="11" stroke-linecap="round"/>
       <circle cx="55" cy="142" r="14" fill="var(--ink)"/>
       <line x1="70" y1="145" x2="25" y2="148" stroke="var(--ink)" stroke-width="8" stroke-linecap="round"/>`
    : `<path d="M85 128 Q150 162 215 132" stroke="var(--ink)" stroke-width="14" fill="none" stroke-linecap="round"/>
       <line x1="215" y1="132" x2="268" y2="110" stroke="var(--ink)" stroke-width="11" stroke-linecap="round"/>
       <circle cx="70" cy="112" r="14" fill="var(--ink)"/>
       <line x1="78" y1="118" x2="28" y2="96" stroke="var(--ink)" stroke-width="8" stroke-linecap="round"/>
       <text x="150" y="190" text-anchor="middle" font-size="14" fill="var(--muted)" font-family="sans-serif">bas du dos collé au sol</text>`}
</svg>`;
function visual(ex, cls = "vis"){
  const inner = ex.img
    ? `<img src="img/${ex.id}-0.jpg" alt="" loading="lazy"><img class="f1" src="img/${ex.id}-1.jpg" alt="" loading="lazy">`
    : HOLLOW(1);
  return `<button type="button" class="${cls}" data-fiche="${ex.id}" aria-label="Voir la fiche : ${esc(ex.nom)}">${inner}<span class="info" aria-hidden="true">i</span></button>`;
}
function openFiche(id){
  const ex = byId[id]; if (!ex) return;
  const pic = n => ex.img ? `<img src="img/${ex.id}-${n}.jpg" alt="">` : `<div class="svgbox">${HOLLOW(n)}</div>`;
  const unit = ex.mode === "time" ? "s" : "reps";
  $("sheetBody").innerHTML = `
    <button class="ghost close" type="button" data-close>Fermer</button>
    <div><div class="eyebrow">${esc(ex.muscles)}</div><h2>${esc(ex.nom)}</h2>
      <div class="target num">${ex.sets} séries × ${ex.min} à ${ex.max} ${unit}${ex.detail ? " · " + esc(ex.detail) : ""} · repos ${ex.repos} s</div></div>
    <div class="pair"><figure>${pic(0)}<figcaption>Départ</figcaption></figure><figure>${pic(1)}<figcaption>Arrivée</figcaption></figure></div>
    <ol>${ex.conseils.map(c => `<li>${esc(c)}</li>`).join("")}</ol>`;
  const d = $("sheet"); if (d.showModal) d.showModal(); else d.setAttribute("open", "");
}
document.addEventListener("click", e => {
  const f = e.target.closest("[data-fiche]"); if (f){ openFiche(f.dataset.fiche); return; }
  if (e.target.closest("[data-close]") || e.target === $("sheet")) $("sheet").close();
});

/* ---------- Analyse (identique au carnet) ---------- */
function repsOf(entry){ return (entry?.reps || []).filter(r => typeof r === "number" && r > 0); }
function score(ex, entry){
  const r = repsOf(entry); if (!r.length) return null;
  if (ex.mode === "assist") return -(entry.charge ?? 0);
  if (ex.mode === "charge") return entry.charge ?? 0;
  return Math.max(...r);
}
function lastEntry(exId){
  for (let i = sessions.length - 1; i >= 0; i--){ const e = sessions[i].ex?.[exId]; if (e && repsOf(e).length) return {s: sessions[i], e}; }
  return null;
}
function analyse(){
  const best = {}; let prs = 0; const prMarks = {};
  for (const s of sessions){
    for (const [id, e] of Object.entries(s.ex || {})){
      const ex = byId[id]; if (!ex) continue;
      const v = score(ex, e); if (v === null) continue;
      if (best[id] === undefined) best[id] = v;
      else if (v > best[id]){ best[id] = v; prs++; (prMarks[s.id] ||= []).push(id); }
    }
  }
  return {best, prs, prMarks};
}
function suggestion(ex){
  const last = lastEntry(ex.id);
  const unit = ex.mode === "time" ? "s" : "reps";
  if (!last){
    if (ex.mode === "assist") return {load: ex.start, text: `Départ : ${ex.start} kg d'assistance`};
    if (ex.mode === "charge") return {load: ex.start, text: ex.start === null ? `Première fois : choisis une charge où tu fais ${ex.min} reps propres` : `Départ : ${fmt(ex.start)} kg`};
    return {load: null, text: `Vise ${ex.min} à ${ex.max} ${unit} par série`};
  }
  const r = repsOf(last.e);
  const allTop = r.length >= ex.sets && r.every(x => x >= ex.max);
  const c = last.e.charge ?? 0;
  if (ex.mode === "assist"){
    if (allTop){ const n = Math.max(0, c - ex.step); return {load: n, up: true, text: n === 0 ? "Niveau suivant : sans assistance ! 🏆" : `Niveau suivant : ${n} kg d'assistance`}; }
    return {load: c, text: `Garde ${c} kg d'assistance, vise +1 rep (dernière fois ${r.join(" / ")})`};
  }
  if (ex.mode === "charge"){
    if (allTop){ const n = c + ex.step; return {load: n, up: true, text: `Monte à ${fmt(n)} kg`}; }
    return {load: c, text: `Garde ${fmt(c)} kg, vise +1 rep (dernière fois ${r.join(" / ")})`};
  }
  if (allTop) return {load: null, up: true, text: ex.mode === "time" ? "Ajoute 5 s par série" : "Ajoute 1 rep par série"};
  return {load: null, text: `Dernière fois : ${r.join(" / ")} ${unit}, vise un peu plus`};
}
function computeBadges(an){
  const n = sessions.length;
  const weeks = {}; sessions.forEach(s => { const k = weekKey(s.date); weeks[k] = (weeks[k] || 0) + 1; });
  const fullWeeks = Object.values(weeks).filter(v => v >= 2).length;
  const has = (id, test) => sessions.some(s => { const e = s.ex?.[id]; return e && repsOf(e).length && test(e, repsOf(e)); });
  const T = byId.traction;
  const tractionAt = lvl => has("traction", (e, r) => (e.charge ?? 99) <= lvl && r.length >= T.sets && r.every(x => x >= T.min));
  return [
    {code:"1", nom:"Premier pas", txt:"Enregistrer ta première séance", on: n >= 1},
    {code:"2×", nom:"Semaine complète", txt:"2 séances dans la même semaine", on: fullWeeks >= 1},
    {code:"PR", nom:"Record battu", txt:"Battre un record sur un exercice", on: an.prs >= 1},
    {code:"10", nom:"Collection", txt:"10 records battus", on: an.prs >= 10},
    {code:"B1", nom:"Bloc terminé", txt:"8 séances, ton premier bloc", on: n >= 8},
    {code:"4S", nom:"Un mois carré", txt:"4 semaines à 2 séances", on: fullWeeks >= 4},
    {code:"-15", nom:"Palier -15", txt:"4 séries de 6 tractions à -15 kg", on: tractionAt(15)},
    {code:"-10", nom:"Palier -10", txt:"4 séries de 6 tractions à -10 kg", on: tractionAt(10)},
    {code:"-5", nom:"Palier -5", txt:"4 séries de 6 tractions à -5 kg", on: tractionAt(5)},
    {code:"👑", nom:"Boss final", txt:"3 tractions propres sans assistance", on: has("traction", (e, r) => (e.charge ?? 99) === 0 && Math.max(...r) >= 3)},
    {code:"D0", nom:"Dips libres", txt:"5 dips sans assistance", on: has("dips", (e, r) => (e.charge ?? 99) === 0 && Math.max(...r) >= 5)},
    {code:"100", nom:"Presse 100", txt:"10 reps à 100 kg à la presse", on: has("presse", (e, r) => (e.charge ?? 0) >= 100 && Math.max(...r) >= 10)},
    {code:"30s", nom:"Gainage d'acier", txt:"3 × 30 s en hollow", on: has("hollow", (e, r) => r.length >= 3 && r.every(x => x >= 30))}
  ];
}

/* ---------- Rendu ---------- */
function renderHero(){
  const an = analyse(); const nb = computeBadges(an).filter(b => b.on).length;
  const xp = sessions.length * 100 + an.prs * 50 + nb * 150;
  const lv = Math.floor(xp / XP_LEVEL);
  $("lvl").innerHTML = `Niv. ${lv + 1}<small>${LEVELS[Math.min(lv, LEVELS.length - 1)]}</small>`;
  $("xpLabel").textContent = `${xp} XP`;
  $("xpNext").textContent = `${XP_LEVEL - (xp % XP_LEVEL)} XP avant le niveau ${lv + 2}`;
  $("xpFill").style.width = ((xp % XP_LEVEL) / XP_LEVEL * 100) + "%";
  const bestAssist = an.best.traction !== undefined ? -an.best.traction : 20;
  $("ladder").innerHTML = [20, 15, 10, 5, 0].map(v => {
    const cls = v === bestAssist ? "now" : v > bestAssist ? "done" : "";
    return `<div class="rung ${cls}">${v === 0 ? "0" : "-" + v}<span>${v === 0 ? "boss" : v === bestAssist ? "toi" : "kg"}</span></div>`;
  }).join("");
  const p = (n, w) => `${n} ${w}${n > 1 ? "s" : ""}`;
  $("chips").innerHTML = `<span class="chip num">${p(sessions.length, "séance")}</span><span class="chip num">${p(an.prs, "record")}</span><span class="chip num">${p(nb, "badge")}</span>`;
}
function renderCycle(){
  const pos = sessions.length % 10 + 1, bloc = Math.floor(sessions.length / 10) + 1, el = $("cycle");
  if (pos >= 9){ el.className = "banner recup"; el.innerHTML = `<b>Séance récup (${pos - 8}/2) · bloc ${bloc}.</b> Garde tes charges mais fais une série de moins partout et arrête-toi loin de l'échec.`; }
  else { el.className = "banner"; el.innerHTML = `<b>Bloc ${bloc} · séance ${pos}/8.</b> Après 8 séances, 2 séances récup, puis on repart plus fort.`; }
}
function renderForm(){
  $("exList").innerHTML = EX[curType].map(ex => {
    const sg = suggestion(ex);
    const unit = ex.mode === "time" ? "s" : "reps";
    const hasLoad = ex.mode === "assist" || ex.mode === "charge";
    const sets = Array.from({length: ex.sets}, (_, i) => `<label class="f">Série ${i + 1}<input type="number" inputmode="numeric" min="0" max="300" id="r-${ex.id}-${i}" placeholder="${unit}"></label>`).join("");
    return `<div class="ex">
      <div class="ex-top">${visual(ex)}
        <div class="ex-title"><h3>${esc(ex.nom)}</h3>
          <span class="target num">${ex.sets} × ${ex.min} à ${ex.max} ${unit}${ex.detail ? " · " + esc(ex.detail) : ""}</span>
          <div class="ex-actions"><button type="button" class="timer-btn" data-rest="${ex.repos}">⏱ Repos ${ex.repos} s</button></div>
        </div></div>
      <div class="tip ${sg.up ? "up" : ""}">${sg.text}</div>
      <div class="sets ${hasLoad ? "" : "noload"} ${ex.sets === 3 ? "s3" : ""}">
        ${hasLoad ? `<label class="f load">${ex.mode === "assist" ? "Assistance (kg)" : "Charge (kg)"}<input type="number" inputmode="decimal" step="0.5" min="0" max="400" id="c-${ex.id}" value="${sg.load ?? ""}"></label>` : ""}
        ${sets}
      </div></div>`;
  }).join("");
  $("segA").setAttribute("aria-pressed", curType === "A");
  $("segB").setAttribute("aria-pressed", curType === "B");
  renderCycle(); restoreDraft();
}
function renderLibrary(){
  const block = (t, list) => `<div class="card stack"><h2>Séance ${t}</h2>${list.map(ex => `
    <div class="ex"><div class="ex-top">${visual(ex)}<div class="ex-title"><h3>${esc(ex.nom)}</h3>
      <span class="target">${esc(ex.muscles)}</span><span class="muted" style="font-size:.85rem">${esc(ex.conseils[0])}</span></div></div></div>`).join("")}</div>`;
  $("lib").innerHTML = `<p class="muted" style="margin:0">Touche une image pour voir la position de départ, d'arrivée et les points clés.</p>` + block("A", EX.A) + block("B", EX.B);
}
function renderProgress(){
  const sel = $("exSel"), prev = sel.value || "traction";
  sel.innerHTML = ALL.map(e => `<option value="${e.id}">${esc(e.nom)}</option>`).join("");
  sel.value = prev; drawChart();
}
function drawChart(){
  const ex = byId[$("exSel").value], box = $("chartBox");
  const pts = sessions.map(s => ({s, e: s.ex?.[ex.id]})).filter(p => p.e && repsOf(p.e).length).map(p => ({d: p.s.date, v: score(ex, p.e), r: repsOf(p.e)}));
  const unitY = ex.mode === "assist" ? "assistance (kg)" : ex.mode === "charge" ? "charge (kg)" : ex.mode === "time" ? "meilleure série (s)" : "meilleure série (reps)";
  const lab = v => ex.mode === "assist" ? (v === 0 ? "0" : "-" + fmt(-v)) : fmt(v);
  if (!pts.length){ $("stats").innerHTML = ""; box.innerHTML = `<div class="empty"><h3>Pas encore de points</h3><p class="muted" style="margin:0">Enregistre une séance avec « ${esc(ex.nom)} » et ta courbe démarre ici.</p></div>`; return; }
  const first = pts[0], last = pts[pts.length - 1], best = Math.max(...pts.map(p => p.v)), gain = last.v - first.v;
  $("stats").innerHTML = `<div class="stat"><span class="eyebrow">Départ</span><b class="num">${lab(first.v)}</b></div>
    <div class="stat"><span class="eyebrow">Record</span><b class="num">${lab(best)}</b></div>
    <div class="stat"><span class="eyebrow">Progrès</span><b class="num" style="color:${gain > 0 ? "var(--good)" : "var(--ink)"}">${gain > 0 ? "+" : ""}${fmt(gain)}</b></div>`;
  const W = 640, H = 260, L = 44, R = 16, T = 16, B = 34;
  let lo = Math.min(...pts.map(p => p.v)), hi = Math.max(...pts.map(p => p.v));
  if (lo === hi){ lo -= 5; hi += 5; }
  const stepRaw = (hi - lo) / 4, mag = Math.pow(10, Math.floor(Math.log10(stepRaw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= stepRaw) || 10 * mag;
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  const x = i => pts.length === 1 ? L + (W - L - R) / 2 : L + i * (W - L - R) / (pts.length - 1);
  const y = v => T + (hi - v) / (hi - lo) * (H - T - B);
  let grid = "";
  for (let v = lo; v <= hi + 1e-9; v += step) grid += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${lab(v)}</text>`;
  const path = pts.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.v)}`).join(" ");
  const area = pts.length > 1 ? `<path class="area" d="${path} L${x(pts.length - 1)},${H - B} L${x(0)},${H - B} Z"/>` : "";
  const every = Math.max(1, Math.ceil(pts.length / 6));
  const xl = pts.map((p, i) => (i % every === 0 || i === pts.length - 1) ? `<text x="${x(i)}" y="${H - 10}" text-anchor="middle">${new Date(p.d + "T12:00:00").toLocaleDateString("fr-FR", {day:"numeric", month:"short"})}</text>` : "").join("");
  const dots = pts.map((p, i) => `<circle class="dot ${i === pts.length - 1 ? "last" : ""}" cx="${x(i)}" cy="${y(p.v)}" r="${i === pts.length - 1 ? 6 : 4.5}"><title>${dateFr(p.d)} : ${lab(p.v)} · ${p.r.join("/")}</title></circle>`).join("");
  box.innerHTML = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution de ${esc(ex.nom)}, ${unitY}">${grid}${area}<path class="line" d="${path}"/>${dots}${xl}</svg>
    <p class="muted" style="margin:0;font-size:.82rem">Axe vertical : ${unitY}${ex.mode === "assist" ? ", plus c'est proche de 0, plus tu es forte" : ""}.</p>`;
}
function renderBadges(){
  $("badges").innerHTML = computeBadges(analyse()).map(x => `<div class="badge ${x.on ? "on" : ""}"><div class="disc">${x.code}</div><h3>${x.nom}</h3><p>${x.txt}</p><span class="eyebrow" style="color:${x.on ? "var(--good)" : "var(--muted)"}">${x.on ? "Débloqué" : "À gagner"}</span></div>`).join("");
}
function renderHist(){
  const an = analyse();
  if (!sessions.length){ $("hist").innerHTML = `<div class="card empty"><h3>Ton historique est vide</h3><p class="muted" style="margin:0">Va dans l'onglet Séance, remplis ce que tu as fait et enregistre. Chaque séance apparaîtra ici.</p></div>`; return; }
  $("hist").innerHTML = [...sessions].reverse().map(s => {
    const items = Object.entries(s.ex || {}).filter(([id, e]) => byId[id] && repsOf(e).length).map(([id, e]) => {
      const ex = byId[id];
      const load = ex.mode === "assist" ? `-${fmt(e.charge ?? 0)} kg` : ex.mode === "charge" ? `${fmt(e.charge ?? 0)} kg` : "";
      const pr = an.prMarks[s.id]?.includes(id) ? `<span class="pr">record</span>` : "";
      return `<li><b>${esc(ex.nom)}</b> ${load} · <span class="num">${repsOf(e).join(" / ")}${ex.mode === "time" ? " s" : ""}</span>${pr}</li>`;
    }).join("");
    return `<div class="card"><div class="row" style="justify-content:space-between"><h3>Séance ${esc(s.type)} · ${dateFr(s.date)}</h3>
      <button class="ghost" data-del="${esc(s.id)}" type="button">Supprimer</button></div>
      <ul>${items || "<li class='muted'>Aucun exercice noté</li>"}</ul>${s.note ? `<p class="muted" style="margin:0;font-size:.9rem">📝 ${esc(s.note)}</p>` : ""}</div>`;
  }).join("");
}
function renderAll(){ renderHero(); renderForm(); renderLibrary(); renderProgress(); renderBadges(); renderHist(); }

/* ---------- Brouillon : rien n'est perdu si l'appli se ferme en pleine séance ---------- */
function saveDraft(){
  const vals = {}; $("form").querySelectorAll("input,textarea").forEach(i => { if (i.value !== "") vals[i.id] = i.value; });
  store.set(DRAFT, {type: curType, date: $("date").value, vals, at: Date.now()});
}
function restoreDraft(){
  const d = store.get(DRAFT, null);
  if (!d || d.type !== curType || Date.now() - d.at > 12 * 3600e3) return;
  for (const [id, v] of Object.entries(d.vals)){ const el = $(id); if (el) el.value = v; }
}
$("form").addEventListener("input", saveDraft);

/* ---------- Minuteur de repos ---------- */
let restT = null, audio = null;
function beep(){
  try { if (!audio) return; const o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = 880; o.connect(g); g.connect(audio.destination);
    g.gain.setValueAtTime(.25, audio.currentTime); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + .6); o.start(); o.stop(audio.currentTime + .6); } catch {}
}
function startRest(sec){
  try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume?.(); } catch {}
  clearInterval(restT);
  const end = Date.now() + sec * 1000, box = $("rest");
  box.hidden = false; box.classList.remove("done");
  const tick = () => {
    const left = Math.max(0, Math.round((end - Date.now()) / 1000));
    box.querySelector("b").textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
    box.querySelector(".bar i").style.width = (left / sec * 100) + "%";
    if (left === 0){ clearInterval(restT); box.classList.add("done"); box.querySelector("b").textContent = "Go !"; beep(); navigator.vibrate?.([200, 100, 200]); setTimeout(() => { if (box.classList.contains("done")) box.hidden = true; }, 6000); }
  };
  tick(); restT = setInterval(tick, 250);
}
document.addEventListener("click", e => { const b = e.target.closest("[data-rest]"); if (b) startRest(+b.dataset.rest); });
$("restPlus").addEventListener("click", () => { const b = $("rest").querySelector("b").textContent.split(":"); if (b.length === 2) startRest(+b[0] * 60 + +b[1] + 30); });
$("restStop").addEventListener("click", () => { clearInterval(restT); $("rest").hidden = true; });

/* ---------- Interactions ---------- */
const TABS = ["seance", "exos", "progres", "badges", "histo"];
document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".tabs button").forEach(x => x.setAttribute("aria-selected", x === b));
  TABS.forEach(t => $("p-" + t).hidden = t !== b.dataset.tab);
  window.scrollTo({top: 0});
}));
document.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => { saveDraft(); curType = b.dataset.type; renderForm(); }));
$("exSel").addEventListener("change", drawChart);
$("date").value = today();

$("hist").addEventListener("click", ev => {
  const btn = ev.target.closest("[data-del]"); if (!btn) return;
  if (btn.dataset.armed !== "1"){ btn.dataset.armed = "1"; btn.textContent = "Confirmer la suppression"; btn.classList.add("danger");
    setTimeout(() => { if (btn.isConnected){ btn.dataset.armed = ""; btn.textContent = "Supprimer"; btn.classList.remove("danger"); } }, 4000); return; }
  sessions = sessions.filter(s => s.id !== btn.dataset.del); persist(); renderAll(); toast("Séance supprimée");
});

$("form").addEventListener("submit", ev => {
  ev.preventDefault();
  const ex = {};
  for (const e of EX[curType]){
    const reps = Array.from({length: e.sets}, (_, i) => { const v = parseFloat($(`r-${e.id}-${i}`).value); return isFinite(v) && v > 0 ? v : null; });
    if (!reps.some(r => r !== null)) continue;
    const entry = {reps};
    if (e.mode === "assist" || e.mode === "charge"){ const c = parseFloat(String($(`c-${e.id}`).value).replace(",", ".")); entry.charge = isFinite(c) ? c : 0; }
    ex[e.id] = entry;
  }
  if (!Object.keys(ex).length){ toast("Remplis au moins une série avant d'enregistrer."); return; }
  const before = analyse(), beforeB = computeBadges(before).filter(b => b.on).length;
  const doc = {id: "s" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), date: $("date").value || today(), type: curType, ex, note: $("note").value.trim(), createdAt: Date.now()};
  sessions = sortS([...sessions, doc]);
  if (!persist()){ sessions = sessions.filter(s => s !== doc); toast("Le téléphone n'a pas pu enregistrer. Exporte une sauvegarde puis réessaie."); return; }
  store.del(DRAFT); $("note").value = "";
  const after = analyse(), newPr = after.prs - before.prs, newB = computeBadges(after).filter(b => b.on).length - beforeB;
  let msg = "Séance enregistrée, +100 XP";
  if (newPr > 0) msg += ` · ${newPr} record${newPr > 1 ? "s" : ""} battu${newPr > 1 ? "s" : ""} !`;
  if (newB > 0) msg += ` · ${newB} badge${newB > 1 ? "s" : ""} débloqué${newB > 1 ? "s" : ""} 🏅`;
  toast(msg);
  curType = curType === "A" ? "B" : "A"; $("date").value = today(); renderAll(); window.scrollTo({top: 0, behavior: "smooth"});
});

/* ---------- Sauvegarde : export / import ---------- */
$("export").addEventListener("click", async () => {
  const name = `carnet-de-force-${today()}.json`;
  const blob = new Blob([JSON.stringify({app: "carnet-de-force", version: 1, seances: sessions}, null, 1)], {type: "application/json"});
  const file = new File([blob], name, {type: "application/json"});
  try { if (navigator.canShare?.({files: [file]})){ await navigator.share({files: [file], title: "Sauvegarde carnet de force"}); return; } } catch (e) { if (e?.name === "AbortError") return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});
$("importBtn").addEventListener("click", () => $("importFile").click());
$("importFile").addEventListener("change", async ev => {
  const f = ev.target.files[0]; ev.target.value = ""; if (!f) return;
  try {
    const data = JSON.parse(await f.text()); const list = Array.isArray(data) ? data : data.seances;
    if (!Array.isArray(list)) throw 0;
    const ids = new Set(sessions.map(s => s.id)); let n = 0;
    for (const s of list){ if (s && s.date && s.ex && typeof s.ex === "object"){ const id = String(s.id || "i" + n + Date.now().toString(36)); if (!ids.has(id)){ sessions.push({...s, id, type: s.type === "B" ? "B" : "A", note: String(s.note || "")}); ids.add(id); n++; } } }
    sortS(sessions); persist(); renderAll(); toast(n ? `${n} séance${n > 1 ? "s" : ""} importée${n > 1 ? "s" : ""}` : "Rien de nouveau dans ce fichier");
  } catch { toast("Ce fichier n'est pas une sauvegarde du carnet."); }
});

/* ---------- Installation ---------- */
const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
if (standalone) $("install").hidden = true;
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

renderAll();
