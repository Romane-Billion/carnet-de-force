import { EX, ALL, byId, CARDIO, PAUSE_EXO, FICHES } from "./data.js";
import { SCHEMAS, LEGENDES } from "./schemas.js";
import { initRepas, refreshRepas, REPAS_KEYS } from "./repas.js";

/* ---------- Stockage sur le téléphone ---------- */
const K = {seances: "carnet-seances-v2", encours: "carnet-encours-v2", tractions: "carnet-tractions-v2", marche: "carnet-marche-v1"};
const store = {
  get(k, d){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v){ try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; } },
  del(k){ try { localStorage.removeItem(k); } catch {} }
};
const sortS = a => a.sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : (x.createdAt || 0) - (y.createdAt || 0)));
let sessions = sortS(store.get(K.seances, []));
let tractions = store.get(K.tractions, []).sort((a, b) => a.date < b.date ? -1 : 1);
let cur = null; // séance en cours
// Vitesse de marche inclinée (pente maximale) : c'est Romane qui décide quand monter de 0,1 km/h.
let marche = store.get(K.marche, null) || [{date: "2026-11-09", v: 3.5}];
const vitesse = () => marche[marche.length - 1];
const PALIER_JOURS = 14;

const $ = id => document.getElementById(id);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = n => (Math.round(n * 10) / 10).toString().replace(".", ",");
const today = () => { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); };
const dateFr = (s, o = {weekday:"short", day:"numeric", month:"short"}) => new Date(s + "T12:00:00").toLocaleDateString("fr-FR", o);
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
function monday(s){ const d = new Date(s + "T12:00:00"); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return d.toISOString().slice(0, 10); }
function toast(msg){ const t = $("toast"); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 4200); }
const unitOf = ex => ex.mode === "assist" ? "kg d'assistance" : ex.mode === "charge" ? (ex.unite || "kg") : "";
const loadTxt = (ex, c) => ex.mode === "assist" ? `-${fmt(c)} kg` : ex.mode === "charge" ? `${fmt(c)} ${ex.unite || "kg"}` : "poids du corps";

/* ---------- Progression automatique ---------- */
const keyOf = ex => (ex.lie && ex.lie !== "presse") ? ex.lie : ex.id; // presse B garde sa propre progression (12 reps)
function lastOf(key){
  for (let i = sessions.length - 1; i >= 0; i--){
    for (const [id, e] of Object.entries(sessions[i].ex || {})){
      if (byId[id] && keyOf(byId[id]) === key && (e.sets || []).some(v => v)) return e;
    }
  }
  return null;
}
function plan(ex){
  const e = lastOf(keyOf(ex));
  if (!e){
    let start = ex.start;
    if (ex.lie === "presse"){ const p = plan(byId.presse); start = p.charge != null ? Math.max(0, p.charge - 10) : null; }
    if (ex.lie && ex.lie !== "presse") start = byId[ex.lie].start;
    return {charge: ex.mode === "reps" ? null : start, reps: ex.min, msg: start == null && ex.mode !== "reps" ? "Première fois : choisis ta charge avec « Modifier »." : ""};
  }
  const done = (e.sets || []).filter(v => v === 1).length;
  const all = done >= ex.sets && e.reps >= ex.min;
  let c = e.charge ?? null, r = e.reps ?? ex.min, msg = "";
  if (all){
    if (r < ex.max){ r++; msg = `Progrès : ${r} reps cette fois.`; }
    else if (ex.mode === "assist"){ const n = Math.max(0, c - ex.step); msg = n === 0 ? "Progrès : sans assistance !" : `Progrès : ${fmt(c - n)} kg d'assistance en moins.`; c = n; r = ex.min; }
    else if (ex.mode === "charge" && c != null){ c = c + ex.step; r = ex.min; msg = `Progrès : +${fmt(ex.step)} kg.`; }
    else msg = "Tu es au maximum prévu, garde ce niveau.";
  } else if (done < ex.sets) msg = "Même objectif que la dernière fois.";
  return {charge: c, reps: Math.max(ex.min, Math.min(r, ex.max)), msg};
}

/* ---------- Séance en cours ---------- */
function newSession(type){
  const ex = {};
  for (const e of EX[type]){ const p = plan(e); ex[e.id] = {charge: p.charge, reps: p.reps, sets: Array(e.sets).fill(0)}; }
  return {type, date: today(), cardio: null, ex, startedAt: Date.now()};
}
function loadCurrent(){
  const c = store.get(K.encours, null);
  if (c && c.type && Date.now() - (c.startedAt || 0) < 14 * 3600e3) return c;
  const last = sessions[sessions.length - 1];
  return newSession(last ? (last.type === "A" ? "B" : "A") : "A");
}
const saveCurrent = () => store.set(K.encours, cur);
const started = () => cur.cardio || Object.values(cur.ex).some(e => e.sets.some(v => v));

function duree(type){
  const list = EX[type].filter(e => !e.optionnel);
  let s = CARDIO.min * 60;
  for (const e of list) s += e.sets * 45 + (e.sets - 1) * e.repos + 60;
  s += (list.length - 1) * PAUSE_EXO;
  const m = Math.round(s / 60 / 5) * 5;
  return m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, "0")}` : `${m} min`;
}

function renderSeance(){
  const list = EX[cur.type], main = list.filter(e => !e.optionnel), opt = list.filter(e => e.optionnel);
  $("jour").innerHTML = `
    <div class="eyebrow">${dateFr(cur.date, {weekday:"long", day:"numeric", month:"long"})}</div>
    <h1>Séance ${cur.type}</h1>
    <p class="big">${main.length} exercices${opt.length ? ` + ${opt.length} optionnel` : ""} · environ ${duree(cur.type)}</p>
    <p class="muted small">Touche le rond d'une série quand tu l'as finie : un grand compte à rebours de pause s'affiche en bas de l'écran et sonne à la fin. Touche le rond une deuxième fois s'il te manque des reps.</p>
    <button type="button" class="link" id="switch">Faire plutôt la séance ${cur.type === "A" ? "B" : "A"}</button>`;
  const c = cur.cardio;
  $("cardio").innerHTML = `<div class="ex-head"><h3>1. Cardio · ${CARDIO.min} min</h3>${c ? `<span class="okmark">✓ Fait</span>` : ""}</div>
    <div class="banner"><b>Marche inclinée : pente maximale, ${fmt(vitesse().v)} km/h,</b> sans te tenir aux barres.
      ${(() => { const d = new Date(vitesse().date + "T12:00:00"); d.setDate(d.getDate() + PALIER_JOURS); const pret = today() >= d.toISOString().slice(0, 10);
        return pret ? `<div style="margin-top:8px"><button type="button" class="primary" id="marchePlus">Je me sens prête : +0,1 km/h</button></div><span class="small">Seulement si ${fmt(vitesse().v)} km/h te paraît facile maintenant.</span>`
          : `<span class="small muted">Prochain palier (+0,1 km/h) proposé à partir du ${dateFr(d.toISOString().slice(0, 10), {day:"numeric", month:"long"})}, quand tu te sentiras prête.</span>`; })()}</div>
    <p class="muted small" style="margin:0">Pour démarrer. Touche ce que tu as fait.</p>
    <div class="choices">${CARDIO.choix.map(x => `<button type="button" class="choice" data-cardio="${esc(x)}" aria-pressed="${c === x}">${esc(x)}</button>`).join("")}</div>`;
  $("exList").innerHTML = list.map((ex, i) => {
    const st = cur.ex[ex.id], p = plan(ex);
    const fiche = ex.schema ? FICHES.find(f => f.schema === ex.schema || f.id === ex.schema) : null;
    const load = ex.mode === "reps" ? "" : st.charge == null ? " · charge à choisir" : ` · ${loadTxt(ex, st.charge)}`;
    const doneAll = st.sets.every(v => v);
    return `<div class="card ex ${doneAll ? "done" : ""}" id="ex-${ex.id}">
      <div class="ex-head"><h3>${i + 2}. ${esc(ex.nom)}</h3>${ex.nouveau ? `<span class="tag">Nouveau</span>` : ""}${ex.optionnel ? `<span class="tag soft">Optionnel</span>` : ""}</div>
      <div class="target num">${ex.sets} × ${st.reps}${ex.mode === "time" ? " s" : " reps"}${load}</div>
      ${p.msg && p.msg.startsWith("Progrès") ? `<div class="tip up">${esc(p.msg)}</div>` : ""}
      <p class="muted small" style="margin:0">${esc(ex.tip)}</p>
      <div class="sets">${st.sets.map((v, k) => `<button type="button" class="set s${v}" data-set="${ex.id}:${k}" aria-label="Série ${k + 1} ${v === 1 ? "faite" : v === 2 ? "pas toutes les reps" : "à faire"}">${v === 1 ? "✓" : v === 2 ? "≈" : k + 1}</button>`).join("")}</div>
      <div class="restinfo"><span>⏱ Pause : <b>${mmss(ex.repos)}</b> entre les séries, <b>${mmss(PAUSE_EXO)}</b> avant l'exercice suivant</span><button type="button" class="ghost" data-pause="${ex.id}">Lancer la pause</button></div>
      <div class="row">
        ${fiche ? `<button type="button" class="ghost" data-fiche="${fiche.id}">Comment faire ?</button>` : ""}
        <button type="button" class="ghost" data-edit="${ex.id}">Modifier</button>
      </div>
      <div class="edit" id="edit-${ex.id}" hidden>
        ${ex.mode !== "reps" ? `<label class="f">${ex.mode === "assist" ? "Assistance (kg)" : `Charge (${ex.unite || "kg"})`}<input type="number" inputmode="decimal" step="0.5" min="0" max="400" data-charge="${ex.id}" value="${st.charge ?? ""}"></label>` : ""}
        <label class="f">Reps par série<input type="number" inputmode="numeric" min="1" max="60" data-reps="${ex.id}" value="${st.reps}"></label>
      </div>
    </div>`;
  }).join("");
}

document.addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.id === "switch"){
    if (started() && t.dataset.armed !== "1"){ t.dataset.armed = "1"; t.textContent = "Tu as déjà commencé. Touche encore pour changer."; return; }
    cur = newSession(cur.type === "A" ? "B" : "A"); saveCurrent(); renderSeance(); return;
  }
  if (t.id === "marchePlus"){ marche.push({date: today(), v: Math.round((vitesse().v + .1) * 10) / 10}); store.set(K.marche, marche); renderSeance(); renderProgres(); toast(`Nouvelle vitesse : ${fmt(vitesse().v)} km/h. Bravo !`); return; }
  if (t.dataset.cardio){ cur.cardio = cur.cardio === t.dataset.cardio ? null : t.dataset.cardio; saveCurrent(); renderSeance(); keepAwake(); return; }
  if (t.dataset.set){
    const [id, k] = t.dataset.set.split(":"); const st = cur.ex[id]; const ex = byId[id];
    st.sets[k] = (st.sets[k] + 1) % 3; saveCurrent();
    if (st.sets[k] === 1){
      keepAwake();
      const list = EX[cur.type], idx = list.findIndex(x => x.id === id);
      if (st.sets.every(v => v)){
        const next = list.slice(idx + 1).find(x => !cur.ex[x.id].sets.every(v => v));
        if (next) startRest(PAUSE_EXO, `Pause, ensuite : ${next.nom}`);
        else stopRest();
      } else startRest(ex.repos, `Repos, ensuite série ${st.sets.findIndex(v => !v) + 1}`);
    }
    renderSeance(); return;
  }
  if (t.dataset.pause){ const ex = byId[t.dataset.pause]; const st = cur.ex[ex.id]; startRest(st.sets.every(v => v) ? PAUSE_EXO : ex.repos, "Pause"); return; }
  if (t.dataset.edit){ const el = $("edit-" + t.dataset.edit); el.hidden = !el.hidden; return; }
  if (t.dataset.fiche){ openFiche(t.dataset.fiche); return; }
  if (t.dataset.close !== undefined){ $("sheet").close(); return; }
});
document.addEventListener("change", e => {
  const i = e.target;
  if (i.dataset.charge){ const v = parseFloat(String(i.value).replace(",", ".")); cur.ex[i.dataset.charge].charge = isFinite(v) ? v : null; saveCurrent(); renderSeance(); $("edit-" + i.dataset.charge).hidden = false; }
  if (i.dataset.reps){ const v = parseInt(i.value, 10); if (v > 0){ cur.ex[i.dataset.reps].reps = v; saveCurrent(); renderSeance(); $("edit-" + i.dataset.reps).hidden = false; } }
});
$("sheet").addEventListener("click", e => { if (e.target === $("sheet")) $("sheet").close(); });

$("finish").addEventListener("click", () => {
  const ex = {};
  for (const [id, st] of Object.entries(cur.ex)) if (st.sets.some(v => v)) ex[id] = {charge: st.charge, reps: st.reps, sets: st.sets};
  if (!Object.keys(ex).length && !cur.cardio){ toast("Coche au moins une série ou ton cardio avant de terminer."); return; }
  const doc = {id: "s" + Date.now().toString(36), date: cur.date, type: cur.type, cardio: cur.cardio, vitesse: cur.cardio === CARDIO.choix[0] ? vitesse().v : undefined, ex, createdAt: Date.now()};
  sessions = sortS([...sessions, doc]);
  if (!store.set(K.seances, sessions)){ sessions = sessions.filter(s => s !== doc); toast("Le téléphone n'a pas pu enregistrer. Exporte une sauvegarde et réessaie."); return; }
  stopRest();
  const prochaine = newSession(cur.type === "A" ? "B" : "A");
  const ups = EX[cur.type].filter(e => ex[e.id]).map(e => ({e, p: plan(e)})).filter(x => x.p.msg.startsWith("Progrès"));
  cur = prochaine; saveCurrent(); renderAll(); window.scrollTo({top: 0});
  toast(`Séance enregistrée, bravo ! ${ups.length ? `${ups.length} progrès pour la prochaine fois.` : ""}`);
});

/* ---------- Minuteur de pause ---------- */
let restT = null, audio = null, restEnd = 0, restDur = 0, wake = null;
function unlockAudio(){ try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); audio.resume?.(); } catch {} }
function beep(){
  if (!audio) return;
  try { [0, .35, .7].forEach(d => { const o = audio.createOscillator(), g = audio.createGain(); o.frequency.value = 880; o.connect(g); g.connect(audio.destination);
    const t = audio.currentTime + d; g.gain.setValueAtTime(.3, t); g.gain.exponentialRampToValueAtTime(.001, t + .25); o.start(t); o.stop(t + .25); }); } catch {}
}
async function keepAwake(){ try { if (!wake && navigator.wakeLock) { wake = await navigator.wakeLock.request("screen"); wake.addEventListener("release", () => wake = null); } } catch {} }
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && started()) keepAwake(); });
function startRest(sec, label){
  unlockAudio(); clearInterval(restT);
  restDur = sec; restEnd = Date.now() + sec * 1000;
  const box = $("rest"); box.hidden = false; box.classList.remove("over");
  $("restLabel").textContent = label;
  const tick = () => {
    const left = Math.max(0, Math.round((restEnd - Date.now()) / 1000));
    $("restTime").textContent = mmss(left);
    box.querySelector(".bar i").style.width = (left / restDur * 100) + "%";
    if (left === 0){ clearInterval(restT); box.classList.add("over"); $("restTime").textContent = "Go !"; $("restLabel").textContent = "C'est reparti"; beep(); navigator.vibrate?.([250, 120, 250]);
      setTimeout(() => { if (box.classList.contains("over")) box.hidden = true; }, 8000); }
  };
  tick(); restT = setInterval(tick, 250);
}
function stopRest(){ clearInterval(restT); $("rest").hidden = true; }
$("restPlus").addEventListener("click", () => { restEnd = Math.max(restEnd, Date.now()) + 30000; restDur += 30; $("rest").classList.remove("over"); clearInterval(restT); const l = $("restLabel").textContent; startRest(Math.round((restEnd - Date.now()) / 1000), l); });
$("restStop").addEventListener("click", stopRest);

/* ---------- Fiches ---------- */
function schemaPair(id){
  const s = SCHEMAS[id]; if (!s) return "";
  const lg = LEGENDES[id] || ["", ""];
  return `<div class="pair">${s.map((x, i) => `<figure><div class="svgbox">${x}</div><figcaption>${lg[i]}</figcaption></figure>`).join("")}</div>`;
}
function ficheHTML(f, full){
  return `${schemaPair(f.schema)}
    <p style="margin:0">${esc(f.quoi)}</p>
    <p style="margin:0"><b>Ce qui travaille :</b> ${esc(f.travaille)}</p>
    ${full ? `<h3>Pas à pas</h3><ol>${f.etapes.map(x => `<li>${esc(x)}</li>`).join("")}</ol>
    ${f.eviter ? `<div class="banner warn"><b>À éviter :</b> ${esc(f.eviter)}</div>` : ""}
    ${f.plus ? `<p class="muted" style="margin:0"><b>Pour progresser :</b> ${esc(f.plus)}</p>` : ""}` : ""}`;
}
function openFiche(id){
  const f = FICHES.find(x => x.id === id); if (!f) return;
  $("sheetBody").innerHTML = `<button class="ghost close" type="button" data-close>Fermer</button><h2>${esc(f.titre)}</h2>${ficheHTML(f, true)}`;
  const d = $("sheet"); d.showModal ? d.showModal() : d.setAttribute("open", "");
}
function renderFiches(){
  const nouveaux = FICHES.filter(f => f.nouveau), autres = FICHES.filter(f => !f.nouveau && !f.essai), essai = FICHES.filter(f => f.essai);
  const card = f => `<div class="card stack"><div class="ex-head"><h2>${esc(f.titre)}</h2>${f.nouveau ? `<span class="tag">Nouveau</span>` : ""}${f.essai ? `<span class="tag soft">Pas dans tes séances</span>` : ""}</div>${ficheHTML(f, false)}<button type="button" class="primary" data-fiche="${f.id}">Voir le pas à pas</button></div>`;
  const connus = [...new Map(ALL.filter(e => !e.nouveau).map(e => [e.nom, e])).values()];
  $("lib").innerHTML = `<h2 class="sec">Nouveaux pour toi</h2>${nouveaux.map(card).join("")}
    ${autres.map(card).join("")}
    <h2 class="sec">À réessayer un jour</h2>${essai.map(card).join("")}
    <h2 class="sec">Ceux que tu connais</h2><div class="card stack">${connus.map(e => `<div><b>${esc(e.nom)}</b><p class="muted small" style="margin:2px 0 0">${esc(e.tip)}</p></div>`).join("")}</div>`;
}

/* ---------- Progrès ---------- */
function renderProgres(){
  // Séances
  const n = sessions.length, wk = monday(today());
  const thisWeek = sessions.filter(s => monday(s.date) === wk).length;
  const weeks = []; for (let i = 7; i >= 0; i--){ const d = new Date(wk + "T12:00:00"); d.setDate(d.getDate() - 7 * i); const k = d.toISOString().slice(0, 10); weeks.push({k, n: sessions.filter(s => monday(s.date) === k).length}); }
  const first = sessions[0];
  $("pSeances").innerHTML = `<h2>Séances</h2>
    <div class="stats"><div class="stat"><span class="eyebrow">Cette semaine</span><b class="num">${thisWeek} / 2</b></div>
      <div class="stat"><span class="eyebrow">Au total</span><b class="num">${n}</b></div>
      <div class="stat"><span class="eyebrow">Depuis</span><b>${first ? dateFr(first.date, {day:"numeric", month:"short"}) : "–"}</b></div></div>
    <div class="weeks">${weeks.map(w => `<div class="wk"><div class="wbar"><i style="height:${Math.min(w.n, 3) / 3 * 100}%" class="${w.n >= 2 ? "ok" : ""}"></i></div><span>${dateFr(w.k, {day:"numeric", month:"numeric"})}</span><b class="num">${w.n}</b></div>`).join("")}</div>
    <p class="muted small" style="margin:0">Séances par semaine, sur les 8 dernières semaines. En vert : objectif de 2 atteint.</p>`;

  // Tractions strictes
  const best = tractions.length ? Math.max(...tractions.map(t => t.n)) : null;
  const lastT = tractions[tractions.length - 1];
  $("pTractions").innerHTML = `<h2>Tractions strictes</h2>
    <p class="muted small" style="margin:0">Sans assistance, bras tendus jusqu'au menton au-dessus de la barre. Teste-toi de temps en temps (une fois toutes les 2 à 4 semaines), en début de séance A, et note ici combien tu en as fait.</p>
    <div class="stats"><div class="stat"><span class="eyebrow">Au départ</span><b class="num">1 à 2</b><span class="muted small">nov. 2026</span></div>
      <div class="stat"><span class="eyebrow">Dernier test</span><b class="num">${lastT ? lastT.n : "–"}</b><span class="muted small">${lastT ? dateFr(lastT.date, {day:"numeric", month:"short"}) : "pas encore"}</span></div>
      <div class="stat"><span class="eyebrow">Record</span><b class="num">${best ?? "–"}</b></div></div>
    <div class="row"><label class="f" style="flex:1">Combien aujourd'hui ?<input type="number" inputmode="numeric" min="0" max="50" id="tNb"></label><button type="button" class="primary" id="tAdd">Noter</button></div>
    ${tractions.length > 1 ? chart(tractions.map(t => ({d: t.date, v: t.n})), v => String(v), "tractions strictes") : ""}
    ${tractions.length ? `<ul class="small">${[...tractions].reverse().slice(0, 6).map(t => `<li>${dateFr(t.date)} : <b>${t.n}</b> traction${t.n > 1 ? "s" : ""}</li>`).join("")}</ul>` : ""}`;

  // Marche inclinée
  $("pMarche").innerHTML = `<h2>Marche inclinée</h2>
    <div class="stats"><div class="stat"><span class="eyebrow">Au départ</span><b class="num">${fmt(marche[0].v)} km/h</b><span class="muted small">${dateFr(marche[0].date, {day:"numeric", month:"short"})}</span></div>
      <div class="stat"><span class="eyebrow">Aujourd'hui</span><b class="num">${fmt(vitesse().v)} km/h</b><span class="muted small">depuis le ${dateFr(vitesse().date, {day:"numeric", month:"short"})}</span></div>
      <div class="stat"><span class="eyebrow">Gagné</span><b class="num">+${fmt(vitesse().v - marche[0].v)} km/h</b></div></div>
    <p class="muted small" style="margin:0">Toujours à la pente maximale, sans te tenir aux barres.</p>
    ${marche.length > 1 ? `<ul class="small">${[...marche].reverse().map(m => `<li>${dateFr(m.date)} : <b>${fmt(m.v)} km/h</b></li>`).join("")}</ul>` : ""}`;

  // Charges
  const keys = [...new Map(ALL.filter(e => e.mode !== "reps" || true).map(e => [keyOf(e), e])).values()];
  const rows = keys.map(ex => {
    const pts = []; for (const s of sessions) for (const [id, e] of Object.entries(s.ex || {})) if (byId[id] && keyOf(byId[id]) === keyOf(ex) && (e.sets || []).some(v => v)) pts.push({d: s.date, c: e.charge, r: e.reps});
    return {ex, pts};
  }).filter(x => x.pts.length);
  if (!rows.length){ $("pCharges").innerHTML = `<h2>Charges</h2><p class="muted" style="margin:0">Termine ta première séance : tu verras ici, pour chaque exercice, la charge du départ, celle d'aujourd'hui et ce que tu as gagné.</p>`; return; }
  const sel = $("pCharges").dataset.sel || rows[0].ex.id;
  $("pCharges").innerHTML = `<h2>Charges</h2><p class="muted small" style="margin:0">Touche un exercice pour voir sa courbe.</p>
    <div class="clist">${rows.map(({ex, pts}) => {
      const a = pts[0], b = pts[pts.length - 1];
      let gain = "";
      if (ex.mode === "assist"){ const g = (a.c ?? 0) - (b.c ?? 0); gain = g > 0 ? `${fmt(g)} kg d'assistance en moins` : "pas encore de changement"; }
      else if (ex.mode === "charge"){ const g = (b.c ?? 0) - (a.c ?? 0); gain = g > 0 ? `+${fmt(g)} kg` : g < 0 ? `${fmt(g)} kg` : "pas encore de changement"; }
      else { const g = b.r - a.r; gain = g > 0 ? `+${g} rep${g > 1 ? "s" : ""}` : "pas encore de changement"; }
      const val = p => ex.mode === "reps" ? `${p.r} reps` : `${loadTxt(ex, p.c ?? 0)} × ${p.r}`;
      return `<button type="button" class="crow" data-sel="${ex.id}" aria-pressed="${ex.id === sel}"><b>${esc(ex.nom.replace(/,.*$/, ""))}</b><span class="num">${val(a)} → ${val(b)}</span><span class="gain ${/^\+|moins/.test(gain) ? "pos" : ""}">${gain}</span></button>`;
    }).join("")}</div><div id="cchart"></div>`;
  const r = rows.find(x => x.ex.id === sel) || rows[0], ex = r.ex;
  const v = p => ex.mode === "assist" ? -(p.c ?? 0) : ex.mode === "charge" ? (p.c ?? 0) : p.r;
  $("cchart").innerHTML = r.pts.length > 1 ? chart(r.pts.map(p => ({d: p.d, v: v(p)})), x => ex.mode === "assist" ? (x === 0 ? "0" : "-" + fmt(-x)) : fmt(x), ex.mode === "assist" ? "kg d'assistance, plus c'est proche de 0, plus tu es forte" : ex.mode === "charge" ? (ex.unite || "kg") : "reps") : `<p class="muted small" style="margin:0">La courbe apparaît à partir de 2 séances.</p>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-sel]"); if (b){ $("pCharges").dataset.sel = b.dataset.sel; renderProgres(); }
  if (e.target.id === "tAdd"){
    const n = parseInt($("tNb").value, 10); if (!(n >= 0)){ toast("Indique le nombre de tractions."); return; }
    tractions = tractions.filter(t => t.date !== today()); tractions.push({date: today(), n}); tractions.sort((a, b) => a.date < b.date ? -1 : 1);
    store.set(K.tractions, tractions); renderProgres(); toast(`Noté : ${n} traction${n > 1 ? "s" : ""} stricte${n > 1 ? "s" : ""} aujourd'hui.`);
  }
});
function chart(pts, lab, unitY){
  const W = 640, H = 220, L = 44, R = 16, T = 14, B = 30;
  let lo = Math.min(...pts.map(p => p.v)), hi = Math.max(...pts.map(p => p.v));
  if (lo === hi){ lo -= 2; hi += 2; }
  const stepRaw = (hi - lo) / 4, mag = Math.pow(10, Math.floor(Math.log10(stepRaw)));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= stepRaw) || 10 * mag;
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  const x = i => pts.length === 1 ? (L + W - R) / 2 : L + i * (W - L - R) / (pts.length - 1);
  const y = v => T + (hi - v) / (hi - lo) * (H - T - B);
  let g = ""; for (let v = lo; v <= hi + 1e-9; v += step) g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${lab(v)}</text>`;
  const path = pts.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.v)}`).join(" ");
  const every = Math.max(1, Math.ceil(pts.length / 6));
  const xl = pts.map((p, i) => (i % every === 0 || i === pts.length - 1) ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${dateFr(p.d, {day:"numeric", month:"short"})}</text>` : "").join("");
  const dots = pts.map((p, i) => `<circle class="dot ${i === pts.length - 1 ? "last" : ""}" cx="${x(i)}" cy="${y(p.v)}" r="${i === pts.length - 1 ? 6 : 4.5}"/>`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe : ${esc(unitY)}">${g}<path class="line" d="${path}"/>${dots}${xl}</svg><p class="muted small" style="margin:0">Axe vertical : ${esc(unitY)}.</p>`;
}

/* ---------- Historique ---------- */
function renderHist(){
  if (!sessions.length){ $("hist").innerHTML = `<div class="card empty"><h3>Pas encore de séance</h3><p class="muted" style="margin:0">Quand tu touches « Terminer la séance », elle apparaît ici.</p></div>`; return; }
  $("hist").innerHTML = [...sessions].reverse().map(s => {
    const items = Object.entries(s.ex || {}).filter(([id]) => byId[id]).map(([id, e]) => {
      const ex = byId[id], ok = e.sets.filter(v => v === 1).length, part = e.sets.filter(v => v === 2).length;
      return `<li><b>${esc(ex.nom.replace(/,.*$/, ""))}</b> · ${ex.mode === "reps" ? "" : loadTxt(ex, e.charge ?? 0) + " · "}<span class="num">${ok}/${ex.sets} séries de ${e.reps}${part ? `, ${part} incomplète${part > 1 ? "s" : ""}` : ""}</span></li>`;
    }).join("");
    return `<div class="card"><div class="row" style="justify-content:space-between"><h3>Séance ${esc(s.type)} · ${dateFr(s.date)}</h3><button class="ghost" data-del="${esc(s.id)}" type="button">Supprimer</button></div>
      <ul>${s.cardio ? `<li>Cardio : ${esc(s.cardio)}${s.vitesse ? `, ${fmt(s.vitesse)} km/h` : ""}</li>` : ""}${items}</ul></div>`;
  }).join("");
}
$("hist").addEventListener("click", ev => {
  const btn = ev.target.closest("[data-del]"); if (!btn) return;
  if (btn.dataset.armed !== "1"){ btn.dataset.armed = "1"; btn.textContent = "Confirmer"; btn.classList.add("danger");
    setTimeout(() => { if (btn.isConnected){ btn.dataset.armed = ""; btn.textContent = "Supprimer"; btn.classList.remove("danger"); } }, 4000); return; }
  sessions = sessions.filter(s => s.id !== btn.dataset.del); store.set(K.seances, sessions); renderAll(); toast("Séance supprimée");
});

/* ---------- Sauvegarde ---------- */
$("export").addEventListener("click", async () => {
  const name = `carnet-de-force-${today()}.json`;
  const blob = new Blob([JSON.stringify({app: "carnet-de-force", version: 2, seances: sessions, tractions, marche, repas: Object.fromEntries(Object.entries(REPAS_KEYS).map(([k, key]) => [k, store.get(key, null)]))}, null, 1)], {type: "application/json"});
  const file = new File([blob], name, {type: "application/json"});
  try { if (navigator.canShare?.({files: [file]})){ await navigator.share({files: [file], title: "Sauvegarde carnet de force"}); return; } } catch (e) { if (e?.name === "AbortError") return; }
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
});
$("importBtn").addEventListener("click", () => $("importFile").click());
$("importFile").addEventListener("change", async ev => {
  const f = ev.target.files[0]; ev.target.value = ""; if (!f) return;
  try {
    const data = JSON.parse(await f.text()); if (!Array.isArray(data.seances)) throw 0;
    const ids = new Set(sessions.map(s => s.id)); let n = 0;
    for (const s of data.seances) if (s?.date && s.ex && !ids.has(s.id) && Object.values(s.ex).every(e => Array.isArray(e.sets))){ sessions.push(s); ids.add(s.id); n++; }
    if (Array.isArray(data.tractions)) for (const t of data.tractions) if (t?.date && !tractions.some(x => x.date === t.date)) tractions.push({date: t.date, n: +t.n || 0});
    sortS(sessions); tractions.sort((a, b) => a.date < b.date ? -1 : 1);
    if (Array.isArray(data.marche) && data.marche.length > marche.length){ marche = data.marche; store.set(K.marche, marche); }
    store.set(K.seances, sessions); store.set(K.tractions, tractions);
    if (data.repas){
      const jr = store.get(REPAS_KEYS.jours, {}); for (const [d, j] of Object.entries(data.repas.jours || {})) if (!jr[d]) jr[d] = j; store.set(REPAS_KEYS.jours, jr);
      const fv = store.get(REPAS_KEYS.favoris, []); for (const f of data.repas.favoris || []) if (!fv.some(x => x.nom === f.nom)) fv.push(f); store.set(REPAS_KEYS.favoris, fv);
      const cp = store.get(REPAS_KEYS.corps, []); for (const c of data.repas.corps || []) if (!cp.some(x => x.date === c.date)) cp.push(c); cp.sort((x, y) => x.date < y.date ? -1 : 1); store.set(REPAS_KEYS.corps, cp);
      if (data.repas.objectifs && !localStorage.getItem(REPAS_KEYS.objectifs)) store.set(REPAS_KEYS.objectifs, data.repas.objectifs);
      refreshRepas();
    }
    renderAll();
    toast(n ? `${n} séance${n > 1 ? "s" : ""} importée${n > 1 ? "s" : ""}` : "Rien de nouveau dans ce fichier");
  } catch { toast("Ce fichier n'est pas une sauvegarde de cette version du carnet."); }
});

/* ---------- Onglets ---------- */
const TABS = ["seance", "repas", "exos", "progres", "histo"];
document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => {
  document.querySelectorAll(".tabs button").forEach(x => x.setAttribute("aria-selected", x === b));
  TABS.forEach(t => $("p-" + t).hidden = t !== b.dataset.tab);
  window.scrollTo({top: 0});
}));

if (window.matchMedia("(display-mode: standalone)").matches || navigator.standalone) $("install").hidden = true;
// Mise à jour : dès qu'une nouvelle version est installée, l'appli se recharge toute seule.
if ("serviceWorker" in navigator){
  const hadCtrl = !!navigator.serviceWorker.controller; let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadCtrl && !reloaded){ reloaded = true; location.reload(); } });
  navigator.serviceWorker.register("sw.js").then(r => { r.update?.(); document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") r.update?.().catch(() => {}); }); }).catch(() => {});
}

function renderAll(){ renderSeance(); renderFiches(); renderProgres(); renderHist(); }
cur = loadCurrent(); saveCurrent();
renderAll();
initRepas();
