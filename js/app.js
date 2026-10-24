(() => {
  "use strict";

  const GAMES = window.GAMES;
  const SVGNS = "http://www.w3.org/2000/svg";
  const $ = s => document.querySelector(s);

  // ---------- Textos de cada joc ----------
  // N: noms que canvien segons el joc (tots femenins en català i castellà: comarca, província, comunitat)
  const NOUNS = {
    cat: {
      ca: { one: "comarca", many: "comarques", grp: "província", Grps: "Províncies", all: "Tot Catalunya",
            game: "Comarques de Catalunya", gameDesc: "43 comarques · 4 províncies", hash: "catalunya",
            title: "Aprèn Catalunya jugant", sub: "4 províncies, 43 comarques i les seves capitals. Tria on vols jugar i a què.",
            source: "Institut Cartogràfic i Geològic de Catalunya (ICGC), 2026" },
      es: { one: "comarca", many: "comarcas", grp: "provincia", Grps: "Provincias", all: "Toda Cataluña",
            game: "Comarcas de Cataluña", gameDesc: "43 comarcas · 4 provincias", hash: "catalunya",
            title: "Aprende Cataluña jugando", sub: "4 provincias, 43 comarcas y sus capitales. Elige dónde quieres jugar y a qué.",
            source: "Institut Cartogràfic i Geològic de Catalunya (ICGC), 2026" },
    },
    esp: {
      ca: { one: "província", many: "províncies", grp: "comunitat autònoma", Grps: "Comunitats", all: "Tota Espanya",
            game: "Províncies d'Espanya", gameDesc: "50 províncies, Ceuta i Melilla · 17 comunitats", hash: "espanya",
            title: "Aprèn Espanya jugant", sub: "50 províncies, Ceuta i Melilla, amb les capitals i les 17 comunitats autònomes. Tria on vols jugar i a què.",
            source: "Eurostat GISCO, NUTS 2024",
            capDesc: "Les capitals que no es diuen igual que la seva província: Vitòria, Bilbao, Oviedo, Pamplona…" },
      es: { one: "provincia", many: "provincias", grp: "comunidad autónoma", Grps: "Comunidades", all: "Toda España",
            game: "Provincias de España", gameDesc: "50 provincias, Ceuta y Melilla · 17 comunidades", hash: "espanya",
            title: "Aprende España jugando", sub: "50 provincias, Ceuta y Melilla, con sus capitales y las 17 comunidades autónomas. Elige dónde quieres jugar y a qué.",
            source: "Eurostat GISCO, NUTS 2024",
            capDesc: "Las capitales que no se llaman igual que su provincia: Vitoria, Bilbao, Oviedo, Pamplona…" },
    },
  };

  const T = {
    ca: N => ({
      gamesTitle: "Què vols estudiar?",
      mastered: `${N.many} dominades`,
      scopeTitle: "On jugues?",
      lengthTitle: "Quantes preguntes?",
      n10: "10", nAll: "Totes",
      showNames: "Mostra els noms", showCaps: "Mostra les capitals",
      points: "punts", newRecord: "🏆 Nou rècord!", menu: "Menú", again: "Torna-hi", reviewMistakes: "Repassa errors",
      footer: `Dades geogràfiques: ${N.source}.`,
      best: "Rècord", noBest: "Encara sense rècord",
      modes: {
        explora: ["Explora", `Toca el mapa i descobreix cada ${N.one}, la seva capital i la ${N.grp}.`],
        on: ["On és?", `Et diem una ${N.one} i l'has de trobar al mapa. Tens 3 intents.`],
        quina: ["Quina és?", `S'il·lumina una ${N.one}: endevina com es diu entre 4 opcions.`],
        escriu: ["Escriu-la", `S'il·lumina una ${N.one} i n'has d'escriure el nom. Els accents no compten i tens pistes.`],
        capital: ["Capitals", N.capDesc || `Quina és la capital de cada ${N.one}? Tria la bona.`],
        prov: [N.Grps, `A quina ${N.grp} pertany cada ${N.one}?`],
        rellotge: ["Contrarellotge", "60 segons per trobar-ne tantes com puguis. Encerts: +2 s. Errors: −3 s."],
      },
      exploreHint: `Toca una ${N.one} per descobrir-la`,
      find: "Troba al mapa", whichCom: `Com es diu la ${N.one} marcada?`, whichCap: "Quina és la capital de",
      whichProv: `A quina ${N.grp} és`, capital: "Capital", group: N.grp[0].toUpperCase() + N.grp.slice(1), area: "Superfície",
      masteredTag: "✓ Dominada", thatIs: "Això és", wellDone: "Molt bé!", itWas: "Era",
      streakX: m => `Ratxa! Punts ×${m}`,
      resTitles: ["Cal practicar una mica més", "Bon intent!", "Molt bé!", "Ets un crack!"],
      resDetail: (c, t, s) => `${c} de ${t} encerts · millor ratxa ${s}`,
      resTimed: (c, s) => `${c} ${N.many} trobades · millor ratxa ${s}`,
      timeUp: "S'ha acabat el temps!",
      typeHere: "Escriu el nom…", check: "Comprova", dontKnow: "No ho sé",
      almost: "Gairebé! S'escriu", notThat: "Aquesta és una altra:", hintLeft: n => `Pista (${n})`,
    }),
    es: N => ({
      gamesTitle: "¿Qué quieres estudiar?",
      mastered: `${N.many} dominadas`,
      scopeTitle: "¿Dónde juegas?",
      lengthTitle: "¿Cuántas preguntas?",
      n10: "10", nAll: "Todas",
      showNames: "Mostrar los nombres", showCaps: "Mostrar las capitales",
      points: "puntos", newRecord: "🏆 ¡Nuevo récord!", menu: "Menú", again: "Otra vez", reviewMistakes: "Repasar errores",
      footer: `Datos geográficos: ${N.source}.`,
      best: "Récord", noBest: "Aún sin récord",
      modes: {
        explora: ["Explora", `Toca el mapa y descubre cada ${N.one}, su capital y su ${N.grp}.`],
        on: ["¿Dónde está?", `Te decimos una ${N.one} y tienes que encontrarla en el mapa. Tienes 3 intentos.`],
        quina: ["¿Cuál es?", `Se ilumina una ${N.one}: adivina cómo se llama entre 4 opciones.`],
        escriu: ["Escríbela", `Se ilumina una ${N.one} y tienes que escribir su nombre. Los acentos no cuentan y tienes pistas.`],
        capital: ["Capitales", N.capDesc || `¿Cuál es la capital de cada ${N.one}? Elige la buena.`],
        prov: [N.Grps, `¿A qué ${N.grp} pertenece cada ${N.one}?`],
        rellotge: ["Contrarreloj", "60 segundos para encontrar todas las que puedas. Aciertos: +2 s. Errores: −3 s."],
      },
      exploreHint: `Toca una ${N.one} para descubrirla`,
      find: "Encuentra en el mapa", whichCom: `¿Cómo se llama la ${N.one} marcada?`, whichCap: "¿Cuál es la capital de",
      whichProv: `¿En qué ${N.grp} está`, capital: "Capital", group: N.grp[0].toUpperCase() + N.grp.slice(1), area: "Superficie",
      masteredTag: "✓ Dominada", thatIs: "Esto es", wellDone: "¡Muy bien!", itWas: "Era",
      streakX: m => `¡Racha! Puntos ×${m}`,
      resTitles: ["Hay que practicar un poco más", "¡Buen intento!", "¡Muy bien!", "¡Eres un crack!"],
      resDetail: (c, t, s) => `${c} de ${t} aciertos · mejor racha ${s}`,
      resTimed: (c, s) => `${c} ${N.many} encontradas · mejor racha ${s}`,
      timeUp: "¡Se acabó el tiempo!",
      typeHere: "Escribe el nombre…", check: "Comprobar", dontKnow: "No lo sé",
      almost: "¡Casi! Se escribe", notThat: "Esa es otra:", hintLeft: n => `Pista (${n})`,
    }),
  };
  const MODES = [
    { id: "explora", emoji: "🧭", color: "#cfe6f2" },
    { id: "on", emoji: "📍", color: "#ffd9c7" },
    { id: "quina", emoji: "🔎", color: "#d8f3e3" },
    { id: "escriu", emoji: "✍️", color: "#d6ecff" },
    { id: "capital", emoji: "🏛️", color: "#fde9b8" },
    { id: "prov", emoji: "🗺️", color: "#e3dcfb" },
    { id: "rellotge", emoji: "⏱️", color: "#ffd1d3" },
  ];

  // ---------- Estat persistent ----------
  const KEY = "comarcat-v1";
  const S = Object.assign({ lang: "ca", sound: true, len: 10, xp: 0, game: "cat", g: {} }, read());
  for (const id in GAMES) S.g[id] = Object.assign({ scope: "all", best: {}, mastery: {} }, S.g[id]);
  if (S.best) { Object.assign(S.g.cat, { best: S.best, mastery: S.mastery || {}, scope: S.scope || "all" }); delete S.best; delete S.mastery; delete S.scope; }
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* sense emmagatzematge */ } }

  // Joc actiu
  let GAME, ITEMS, BY_ID, GRP;
  const P = () => S.g[S.game];
  const N = () => NOUNS[S.game][S.lang];
  const t = () => T[S.lang](N());
  const nm = x => (typeof x === "string" ? x : x[S.lang]);
  const name = c => nm(c.nom);
  const capOf = c => nm(c.cap);
  const grpName = id => nm(GRP[id].nom);
  const grpColor = id => GRP[id].color;
  const grpSize = id => ITEMS.filter(c => c.grp === id).length;

  function setGame(id) {
    S.game = id;
    GAME = GAMES[id];
    ITEMS = GAME.items;
    BY_ID = Object.fromEntries(ITEMS.map(c => [c.id, c]));
    GRP = Object.fromEntries(GAME.groups.map(g => [g.id, g]));
    if (P().scope !== "all" && !GRP[P().scope]) P().scope = "all";
    buildMap();
    history.replaceState(null, "", `#${N().hash}`);
  }

  // ---------- Utilitats ----------
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (arr, n, except) => shuffle(arr.filter(x => !except.includes(x))).slice(0, n);
  const isMastered = id => (P().mastery[id] || 0) >= 3;
  // Àmbits triables: tot o grups amb més d'un element
  const scopes = () => ["all", ...GAME.groups.filter(g => grpSize(g.id) > 1).map(g => g.id)];
  // Per a Espanya, la majoria de capitals es diuen com la província: només preguntem les que no
  const capitalPool = () => ITEMS.filter(c => norm(capOf(c)) !== norm(name(c)));
  const scopeOf = mode => (mode === "prov" || (mode === "capital" && capitalPool().length < ITEMS.length) ? "all" : P().scope);
  function poolFor(mode) {
    const scope = scopeOf(mode);
    let pool = ITEMS.filter(c => scope === "all" || c.grp === scope);
    if (mode === "capital") pool = pool.filter(c => capitalPool().includes(c));
    if (mode === "prov") pool = pool.filter(c => grpSize(c.grp) > 1);
    return pool;
  }

  // ---------- So ----------
  let actx;
  function tone(freqs, dur = .12, type = "sine", gap = .09, vol = .18) {
    if (!S.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), t0 = actx.currentTime + i * gap;
        o.type = type; o.frequency.value = f;
        g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.001, t0 + dur);
        o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + dur);
      });
    } catch { /* àudio no disponible */ }
  }
  const sfx = {
    ok: () => tone([660, 880], .14, "triangle"),
    bad: () => tone([220, 170], .18, "sawtooth", .1, .08),
    streak: () => tone([660, 880, 1100], .12, "triangle", .07),
    end: () => tone([523, 659, 784, 1046], .22, "triangle", .12),
    tick: () => tone([1200], .05, "square", 0, .04),
  };

  // ---------- Mapa ----------
  const svg = $("#map");
  const gCom = el("g"), gProv = el("g"), gLbl = el("g"), gFx = el("g");
  svg.append(gCom, gProv, gLbl, gFx);
  let paths = {}, labels = {};
  function el(tag, attrs = {}) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }

  // Mida d'un traçat a partir de les coordenades de la "d"
  function spanOf(d) {
    const n = d.match(/-?\d+(\.\d+)?/g).map(Number);
    const xs = n.filter((_, i) => i % 2 === 0), ys = n.filter((_, i) => i % 2 === 1);
    return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
  }

  function buildMap() {
    [gCom, gProv, gLbl, gFx].forEach(g => (g.innerHTML = ""));
    paths = {}; labels = {};
    ITEMS.forEach(c => {
      const g = el("g", { class: "com", "data-id": c.id, style: `--c:${grpColor(c.grp)}` });
      g.append(el("path", { d: c.d }));
      // Els territoris minúsculs (Ceuta, Melilla) porten un cercle per poder-los tocar
      if (spanOf(c.d) < 8) g.append(el("circle", { cx: c.lx, cy: c.ly, r: 7, class: "dot" }));
      gCom.append(g); paths[c.id] = g;
      const tx = el("text", { x: c.lx, y: c.ly, class: "lbl" });
      const n = el("tspan", { x: c.lx });
      const cap = el("tspan", { x: c.lx, dy: "1.15em", class: "cap" });
      tx.append(n, cap); tx.style.display = "none"; gLbl.append(tx); labels[c.id] = { tx, n, cap };
    });
    relabel();
    GAME.frames.forEach(f => gProv.append(el("rect", { x: f.x, y: f.y, width: f.w, height: f.h, rx: 8, class: "inset" })));
    GAME.outlines.forEach(d => gProv.append(el("path", { d, class: "prov-line" })));
    vb = { x: 0, y: 0, w: GAME.w, h: GAME.h }; homeVB = { ...vb };
  }
  function relabel() { ITEMS.forEach(c => { labels[c.id].n.textContent = name(c); labels[c.id].cap.textContent = capOf(c); }); }

  // Zoom i desplaçament amb viewBox
  let vb = { x: 0, y: 0, w: 1000, h: 1000 }, homeVB = { ...vb };
  function applyVB() {
    svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    const r = svg.getBoundingClientRect();
    const upp = r.width ? Math.max(vb.w / r.width, vb.h / r.height) : 1;
    gLbl.setAttribute("font-size", (12.5 * upp).toFixed(2));
    gFx.querySelectorAll(".ping").forEach(c => c.setAttribute("r", 16 * upp));
    gCom.querySelectorAll(".dot").forEach(c => c.setAttribute("r", 9 * upp));
  }
  function fitTo(ids) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    ids.forEach(id => { const b = paths[id].getBBox(); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); });
    const pad = Math.max(x1 - x0, y1 - y0) * .04;
    vb = { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
    homeVB = { ...vb }; applyVB();
  }
  function zoomAt(f, cx, cy) {
    const nw = Math.min(Math.max(vb.w * f, 40), GAME.w * 1.6);
    const k = nw / vb.w;
    if (cx === undefined) { cx = vb.x + vb.w / 2; cy = vb.y + vb.h / 2; }
    vb = { x: cx - (cx - vb.x) * k, y: cy - (cy - vb.y) * k, w: vb.w * k, h: vb.h * k };
    applyVB();
  }
  function toSvg(clientX, clientY) {
    const pt = svg.createSVGPoint(); pt.x = clientX; pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
  }

  const ptrs = new Map();
  let moved = false, downTarget = null, pinch0 = null;
  svg.addEventListener("pointerdown", e => {
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
    if (ptrs.size === 1) { moved = false; downTarget = e.target.closest(".com"); }
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = { d: Math.hypot(a.x - b.x, a.y - b.y), w: vb.w }; moved = true; }
  });
  svg.addEventListener("pointermove", e => {
    const prev = ptrs.get(e.pointerId); if (!prev) return;
    const cur = { x: e.clientX, y: e.clientY };
    if (ptrs.size === 1) {
      if (!moved && Math.hypot(cur.x - prev.x0, cur.y - prev.y0) < 8) return;
      moved = true;
      const a = toSvg(prev.x, prev.y), b = toSvg(cur.x, cur.y);
      vb.x -= b.x - a.x; vb.y -= b.y - a.y; applyVB();
      ptrs.set(e.pointerId, { ...prev, ...cur });
    } else if (ptrs.size === 2 && pinch0) {
      ptrs.set(e.pointerId, cur);
      const [a, b] = [...ptrs.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const m = toSvg((a.x + b.x) / 2, (a.y + b.y) / 2);
      zoomAt((pinch0.w * pinch0.d / d) / vb.w, m.x, m.y);
    }
  });
  const endPtr = e => {
    const had = ptrs.delete(e.pointerId);
    if (ptrs.size < 2) pinch0 = null;
    if (had && ptrs.size === 0 && !moved && downTarget && e.type === "pointerup") onMapTap(downTarget.dataset.id);
    if (ptrs.size === 0) downTarget = null;
  };
  ["pointerup", "pointercancel", "pointerleave"].forEach(ev => svg.addEventListener(ev, endPtr));
  svg.addEventListener("wheel", e => { e.preventDefault(); const p = toSvg(e.clientX, e.clientY); zoomAt(e.deltaY > 0 ? 1.15 : 1 / 1.15, p.x, p.y); }, { passive: false });
  $("#zIn").onclick = () => zoomAt(1 / 1.4);
  $("#zOut").onclick = () => zoomAt(1.4);
  $("#zFit").onclick = () => { vb = { ...homeVB }; applyVB(); };
  window.addEventListener("resize", applyVB);

  function resetMapClasses() {
    ITEMS.forEach(c => { paths[c.id].setAttribute("class", "com"); labels[c.id].tx.style.display = "none"; });
    gFx.innerHTML = "";
  }
  function showLabel(id, withCap) {
    const l = labels[id];
    l.tx.style.display = ""; l.n.style.display = ""; l.cap.style.display = withCap ? "" : "none"; l.cap.setAttribute("dy", "1.15em");
  }
  function ping(id) {
    gFx.innerHTML = "";
    const c = BY_ID[id];
    gFx.append(el("circle", { cx: c.lx, cy: c.ly, r: 16, class: "ping" }));
    applyVB();
  }
  const cls = (id, name, on = true) => paths[id].classList.toggle(name, on);

  let toastT;
  function toast(msg, kind = "") {
    const n = $("#toast"); n.textContent = msg; n.className = `toast show ${kind}`;
    clearTimeout(toastT); toastT = setTimeout(() => n.classList.remove("show"), 1300);
  }

  // ---------- Pantalles ----------
  function show(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === id));
    if (id === "home") { stopTimer(); renderHome(); }
    if (id === "game") requestAnimationFrame(applyVB);
    window.scrollTo(0, 0);
  }
  document.addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b) show(b.dataset.go); });

  function renderStatic() {
    const L = t();
    document.documentElement.lang = S.lang;
    document.querySelectorAll("[data-t]").forEach(n => { const v = L[n.dataset.t]; if (typeof v === "string") n.textContent = v; });
    $("#heroTitle").textContent = N().title;
    $("#heroSub").textContent = N().sub;
    $("#btnLang").textContent = S.lang === "ca" ? "ES" : "CA";
    $("#btnSound").textContent = S.sound ? "🔊" : "🔇";
    $("#xpLevel").textContent = Math.floor(S.xp / 200) + 1;
    $("#xpFill").style.width = `${(S.xp % 200) / 2}%`;
  }

  // Mapa en miniatura de cada joc per al selector
  const miniMaps = {};
  for (const id in GAMES) {
    const g = GAMES[id], col = Object.fromEntries(g.groups.map(x => [x.id, x.color]));
    miniMaps[id] = `<svg viewBox="0 0 ${g.w} ${g.h}" aria-hidden="true">${g.items.map(c => `<path d="${c.d}" fill="${col[c.grp]}"/>`).join("")}</svg>`;
  }

  function renderHome() {
    renderStatic();
    const L = t();

    const gb = $("#games"); gb.innerHTML = "";
    for (const id in GAMES) {
      const n = NOUNS[id][S.lang];
      const b = document.createElement("button");
      b.className = "game-card" + (S.game === id ? " on" : "");
      b.innerHTML = `${miniMaps[id]}<span><b>${n.game}</b><small>${n.gameDesc}</small></span>`;
      b.onclick = () => { if (S.game !== id) { setGame(id); save(); renderHome(); } };
      gb.append(b);
    }

    const m = ITEMS.filter(c => isMastered(c.id)).length;
    $("#masteryNum").textContent = m;
    $("#masteryArc").style.strokeDasharray = `${m / ITEMS.length * 100} 100`;
    $("#masteryArc").style.opacity = m ? 1 : 0;

    const sc = $("#scopeChips"); sc.innerHTML = "";
    scopes().forEach(p => {
      const b = document.createElement("button");
      b.className = "chip" + (P().scope === p ? " on" : "");
      b.innerHTML = p === "all" ? N().all : `<span class="dot" style="background:${grpColor(p)}"></span>${grpName(p)}`;
      b.onclick = () => { P().scope = p; save(); renderHome(); };
      sc.append(b);
    });
    const lc = $("#lengthChips"); lc.innerHTML = "";
    [[10, L.n10], [0, L.nAll]].forEach(([v, txt]) => {
      const b = document.createElement("button");
      b.className = "chip" + (S.len === v ? " on" : "");
      b.textContent = txt;
      b.onclick = () => { S.len = v; save(); renderHome(); };
      lc.append(b);
    });

    const box = $("#modes"); box.innerHTML = "";
    MODES.forEach(md => {
      const [mname, desc] = L.modes[md.id];
      const b = document.createElement("button");
      b.className = "mode";
      b.style.setProperty("--c", md.color);
      let best = "";
      if (md.id !== "explora") {
        const r = P().best[bestKey(md.id)];
        best = r ? `<span class="best">${L.best}: ${r.score} <span class="st">${"★".repeat(r.stars || 0)}</span></span>` : `<span class="best" style="color:var(--muted)">${L.noBest}</span>`;
      }
      b.innerHTML = `<span class="emoji">${md.emoji}</span><h3>${mname}</h3><p>${desc}</p>${best}`;
      b.onclick = () => start(md.id);
      box.append(b);
    });
  }
  const bestKey = mode => `${mode}|${scopeOf(mode)}|${mode === "rellotge" ? "t" : S.len}`;

  $("#btnLang").onclick = () => {
    S.lang = S.lang === "ca" ? "es" : "ca"; save(); renderStatic(); relabel();
    if ($("#home").classList.contains("active")) renderHome();
    else if (G && G.mode === "explora") renderExplore();
    else if (G && G.queue && $("#game").classList.contains("active") && !G.locked) ask();
  };
  $("#btnSound").onclick = () => { S.sound = !S.sound; save(); renderStatic(); };

  // ---------- Joc ----------
  let G = null, timerId = null;
  function stopTimer() { clearInterval(timerId); timerId = null; }

  function start(mode, onlyIds) {
    stopTimer();
    const scope = scopeOf(mode);
    const pool = poolFor(mode);
    let queue = shuffle(onlyIds ? pool.filter(c => onlyIds.includes(c.id)) : pool);
    if (mode !== "rellotge" && !onlyIds && S.len) queue = queue.slice(0, S.len);
    G = { mode, scope, pool, queue, i: 0, score: 0, streak: 0, bestStreak: 0, correct: 0, errors: [], attempts: 0, locked: false, time: 60, review: !!onlyIds };

    show("game");
    resetMapClasses();
    ITEMS.forEach(c => cls(c.id, "off", scope !== "all" && c.grp !== scope));
    $("#mapWrap").classList.toggle("map-neutral", mode !== "explora");
    exploreSel = null; exploreGrp = null;
    $("#tLabels").checked = $("#tCaps").checked = false;
    requestAnimationFrame(() => fitTo(ITEMS.filter(c => scope === "all" || c.grp === scope).map(c => c.id)));

    $("#streak").hidden = mode === "explora";
    $("#timer").hidden = mode !== "rellotge";
    $(".progress").style.visibility = mode === "explora" || mode === "rellotge" ? "hidden" : "visible";
    $("#score").parentElement.hidden = mode === "explora";
    $("#exploreTools").hidden = mode !== "explora";
    $("#infoCard").hidden = true;
    updateHud();

    if (mode === "explora") return renderExplore();
    if (mode === "rellotge") {
      timerId = setInterval(() => {
        G.time -= 1; updateHud();
        if (G.time <= 5 && G.time > 0) sfx.tick();
        if (G.time <= 0) { stopTimer(); toast(t().timeUp, "bad"); G.locked = true; setTimeout(finish, 900); }
      }, 1000);
    }
    ask();
  }

  function updateHud() {
    $("#score").textContent = G.score;
    $("#streak").querySelector("b").textContent = G.streak;
    const tm = $("#timer"); tm.querySelector("b").textContent = Math.max(0, G.time); tm.classList.toggle("low", G.time <= 10);
    $("#progFill").style.width = G.queue.length ? `${G.i / G.queue.length * 100}%` : "0";
  }

  const target = () => G.queue[G.i % G.queue.length];
  // Distractors de l'àmbit; si n'hi ha pocs, de tot el joc
  const distractors = (c, base) => {
    const d = sample(base, 3, [c]);
    return d.length >= 3 ? d : d.concat(sample(ITEMS, 3 - d.length, [c, ...d]));
  };

  function ask() {
    if (!G || G.mode === "explora") return;
    const c = target(), L = t();
    G.attempts = 0; G.locked = false;
    const pr = $("#prompt"), op = $("#options");
    op.innerHTML = ""; op.className = "options";
    gFx.innerHTML = "";
    ITEMS.forEach(x => { cls(x.id, "target", false); cls(x.id, "flash", false); });

    if (G.mode === "on" || G.mode === "rellotge") {
      pr.innerHTML = `<small>${L.find}</small><span class="name">${name(c)}</span>`;
      if (G.mode === "on") pr.innerHTML += `<div class="attempts" id="att"><i></i><i></i><i></i></div>`;
      return;
    }
    cls(c.id, "target"); ping(c.id);
    if (G.mode === "escriu") return askWrite(c, L);
    let opts;
    if (G.mode === "quina") {
      pr.innerHTML = `<small>${L.modes.quina[0]}</small>${L.whichCom}`;
      opts = shuffle([c, ...distractors(c, G.pool)]).map(x => ({ label: name(x), ok: x === c }));
    } else if (G.mode === "capital") {
      pr.innerHTML = `<small>${L.modes.capital[0]}</small>${L.whichCap}<span class="name">${name(c)}?</span>`;
      opts = shuffle([c, ...distractors(c, G.pool)]).map(x => ({ label: capOf(x), ok: x === c }));
    } else {
      pr.innerHTML = `<small>${L.modes.prov[0]}</small>${L.whichProv}<span class="name">${name(c)}?</span>`;
      op.classList.add("prov");
      const others = sample(GAME.groups.map(g => g.id), 3, [c.grp]);
      const ids = GAME.groups.length <= 4 ? GAME.groups.map(g => g.id) : shuffle([c.grp, ...others]);
      opts = ids.map(id => ({ label: grpName(id), ok: id === c.grp, color: grpColor(id) }));
    }
    opts.forEach((o, i) => {
      const b = document.createElement("button");
      b.className = "opt";
      if (o.color) b.style.background = o.color;
      b.innerHTML = `<span class="k">${i + 1}</span>${o.label}`;
      b.onclick = () => answerOption(b, o.ok);
      b.dataset.ok = o.ok ? "1" : "";
      op.append(b);
    });
  }

  function mult() { return G.streak >= 6 ? 3 : G.streak >= 3 ? 2 : 1; }

  function hit(c, base) {
    G.streak += 1; G.bestStreak = Math.max(G.bestStreak, G.streak); G.correct += 1;
    G.score += Math.round(base * mult());
    P().mastery[c.id] = Math.min((P().mastery[c.id] || 0) + 1, 9);
    if (G.streak === 3 || G.streak === 6) { sfx.streak(); toast(t().streakX(mult()), "ok"); } else sfx.ok();
  }
  function miss(c) {
    G.streak = 0;
    if (!G.errors.includes(c.id)) G.errors.push(c.id);
    P().mastery[c.id] = Math.max((P().mastery[c.id] || 0) - 1, 0);
  }

  function answerOption(btn, ok) {
    if (G.locked) return;
    G.locked = true;
    const c = target();
    document.querySelectorAll("#options .opt").forEach(b => { b.disabled = true; if (b.dataset.ok) b.classList.add("ok"); });
    if (ok) { hit(c, 100); cls(c.id, "done"); }
    else { btn.classList.add("bad"); sfx.bad(); miss(c); cls(c.id, "miss"); }
    cls(c.id, "target", false);
    showLabel(c.id, G.mode === "capital");
    updateHud();
    setTimeout(next, ok ? 750 : 1500);
  }

  // ---------- Escriu-la ----------
  // Sense accents, majúscules, apòstrofs ni espais: "pla de lestany" = "Pla de l'Estany"
  const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z]/g, "");
  function lev(a, b) {
    const d = Array.from({ length: b.length + 1 }, (_, j) => j);
    for (let i = 1; i <= a.length; i++) {
      let prev = d[0]; d[0] = i;
      for (let j = 1; j <= b.length; j++) {
        const tmp = d[j];
        d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
        prev = tmp;
      }
    }
    return d[b.length];
  }
  // S'accepta el nom en qualsevol dels dos idiomes i els àlies (Vizcaya, Lérida…)
  const namesOf = c => [...new Set([...(typeof c.nom === "string" ? [c.nom] : Object.values(c.nom)), ...(c.alias || [])].map(norm))];
  // "exact", "typo" o null. Una errata només val si no s'assembla més a un altre element.
  function matchName(v, c) {
    if (namesOf(c).includes(v)) return "exact";
    const dist = x => Math.min(...namesOf(x).map(n => lev(v, n)));
    const n = norm(name(c)).length, tol = n <= 4 ? 0 : n <= 9 ? 1 : 2;
    const dc = dist(c);
    if (dc > tol) return null;
    return ITEMS.some(x => x !== c && dist(x) <= dc) ? null : "typo";
  }

  function askWrite(c, L) {
    G.hints = 0;
    const pr = $("#prompt"), op = $("#options");
    pr.innerHTML = `<small>${L.modes.escriu[0]}</small>${L.whichCom}<div class="attempts" id="att"><i></i><i></i></div>`;
    op.classList.add("write");
    op.innerHTML = `<form class="write-form" id="wForm" autocomplete="off">
        <input id="wIn" type="text" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="done" placeholder="${L.typeHere}" aria-label="${L.typeHere}">
        <button class="btn" type="submit">${L.check}</button></form>
      <p class="hint write-hint" id="wHintTxt"></p>
      <div class="write-help"><button type="button" class="btn ghost" id="wHint">💡 ${L.hintLeft(2)}</button><button type="button" class="btn ghost" id="wSkip">${L.dontKnow}</button></div>`;
    $("#wForm").onsubmit = e => { e.preventDefault(); answerWrite(); };
    $("#wHint").onclick = writeHint;
    $("#wSkip").onclick = writeFail;
    if (matchMedia("(pointer: fine)").matches) $("#wIn").focus();
  }

  function writeHint() {
    if (G.locked || G.hints >= 2) return;
    const c = target(), L = t(), nom = name(c);
    G.hints += 1;
    const show = G.hints === 1 ? 1 : Math.ceil(nom.length / 2);
    let k = 0;
    $("#wHintTxt").textContent = [...nom].map(ch => (/[\s'-]/.test(ch) ? ch : k++ < show ? ch : "_")).join(" ");
    $("#wHint").textContent = `💡 ${L.hintLeft(2 - G.hints)}`;
    $("#wHint").disabled = G.hints >= 2;
    tone([500], .08, "triangle");
  }

  function answerWrite() {
    if (G.locked) return;
    const c = target(), L = t(), inp = $("#wIn"), v = norm(inp.value);
    if (!v) return inp.focus();
    const res = matchName(v, c);
    if (res) {
      G.locked = true;
      toast(res === "typo" ? `${L.almost} ${name(c)}` : L.wellDone, "ok");
      hit(c, Math.max(20, 100 - 25 * G.hints - 40 * G.attempts - (res === "typo" ? 20 : 0)));
      cls(c.id, "target", false); cls(c.id, "done"); showLabel(c.id, false);
      inp.value = name(c); inp.disabled = true; inp.className = "ok";
      updateHud();
      setTimeout(next, res === "typo" ? 1600 : 900);
      return;
    }
    sfx.bad();
    G.attempts += 1; G.streak = 0; updateHud();
    document.querySelectorAll("#att i").forEach((n, i) => n.classList.toggle("lost", i >= 2 - G.attempts));
    inp.className = ""; void inp.offsetWidth; inp.className = "bad";
    // Si ha escrit un altre element, li ensenyem on és
    const other = ITEMS.find(x => x !== c && matchName(v, x) === "exact");
    if (other) {
      toast(`${L.notThat} ${name(other)}`, "bad");
      cls(other.id, "flash"); setTimeout(() => cls(other.id, "flash", false), 900);
    }
    if (G.attempts >= 2) return writeFail();
    inp.select();
  }

  function writeFail() {
    if (G.locked) return;
    G.locked = true;
    const c = target(), inp = $("#wIn");
    miss(c); sfx.bad();
    cls(c.id, "target", false); cls(c.id, "miss"); showLabel(c.id, false);
    inp.value = name(c); inp.disabled = true; inp.className = "bad";
    setTimeout(() => toast(`${t().itWas} ${name(c)}`, "bad"), 300);
    setTimeout(next, 2000);
  }

  function onMapTap(id) {
    if (!G) return;
    if (G.mode === "explora") return exploreSelect(id);
    if (G.locked || !(G.mode === "on" || G.mode === "rellotge")) return;
    const c = target(), tapped = BY_ID[id];
    if (paths[id].classList.contains("done") && id !== c.id && G.mode === "on") { toast(`${t().thatIs} ${name(tapped)}`); return; }
    if (id === c.id) {
      G.locked = true;
      hit(c, G.mode === "on" ? [100, 60, 30][G.attempts] : 10);
      cls(c.id, "done"); showLabel(c.id, false);
      toast(t().wellDone, "ok");
      if (G.mode === "rellotge") G.time += 2;
      updateHud();
      setTimeout(next, G.mode === "rellotge" ? 350 : 650);
      return;
    }
    sfx.bad();
    paths[id].classList.remove("flash"); void paths[id].getBBox(); cls(id, "flash");
    setTimeout(() => cls(id, "flash", false), 700);
    toast(`${t().thatIs} ${name(tapped)}`, "bad");
    if (G.mode === "rellotge") { G.streak = 0; G.time = Math.max(0, G.time - 3); updateHud(); return; }
    G.attempts += 1;
    document.querySelectorAll("#att i").forEach((n, i) => n.classList.toggle("lost", i >= 3 - G.attempts));
    G.streak = 0; updateHud();
    if (G.attempts >= 3) {
      G.locked = true; miss(c);
      cls(c.id, "miss"); showLabel(c.id, false); ping(c.id);
      setTimeout(() => toast(`${t().itWas} ${name(c)}`, "bad"), 400);
      setTimeout(next, 1800);
    }
  }

  function next() {
    if (!G || !$("#game").classList.contains("active")) return;
    G.i += 1;
    if (G.mode === "rellotge") {
      if (G.i % G.queue.length === 0) { G.queue = shuffle(G.queue); ITEMS.forEach(c => { cls(c.id, "done", false); labels[c.id].tx.style.display = "none"; }); }
      if (G.time > 0) ask();
      return;
    }
    updateHud();
    if (G.i >= G.queue.length) return finish();
    ask();
  }

  function finish() {
    stopTimer();
    const L = t(), total = G.queue.length;
    const acc = G.mode === "rellotge" ? Math.min(G.correct / 25, 1) : G.correct / total;
    const stars = acc >= .9 ? 3 : acc >= .7 ? 2 : acc >= .5 ? 1 : 0;
    const key = bestKey(G.mode);
    const prev = P().best[key];
    const record = !G.review && G.score > 0 && (!prev || G.score > prev.score);
    if (record) P().best[key] = { score: G.score, stars };
    S.xp += Math.round(G.score / 10) + G.correct * 2;
    save();

    show("results");
    renderStatic();
    $("#stars").innerHTML = [0, 1, 2].map(i => `<span class="${i < stars ? "on" : ""}">★</span>`).join("");
    $("#resTitle").textContent = L.resTitles[stars];
    $("#resScore").textContent = G.score;
    $("#resDetail").textContent = G.mode === "rellotge" ? L.resTimed(G.correct, G.bestStreak) : L.resDetail(G.correct, total, G.bestStreak);
    $("#resRecord").hidden = !record;
    $("#resMistakes").innerHTML = G.errors.map(id => `<span>${name(BY_ID[id])}</span>`).join("");
    $("#btnReviewMistakes").hidden = !G.errors.length;
    sfx.end();
    if (stars >= 2 || record) confetti();
  }
  $("#btnAgain").onclick = () => start(G.mode);
  $("#btnReviewMistakes").onclick = () => start(G.mode === "rellotge" ? "on" : G.mode, G.errors.slice());

  document.addEventListener("keydown", e => {
    if (!$("#game").classList.contains("active")) return;
    if (e.key === "Escape") return show("home");
    if (e.target.tagName === "INPUT") return;
    const n = +e.key;
    if (n >= 1 && n <= 4) { const b = document.querySelectorAll("#options .opt")[n - 1]; if (b && !b.disabled) b.click(); }
  });

  // ---------- Explora ----------
  let exploreSel = null, exploreGrp = null;
  function renderExplore() {
    const L = t();
    $("#prompt").innerHTML = `<small>${L.modes.explora[0]}</small>${L.exploreHint}`;
    $("#options").innerHTML = "";
    const lg = $("#legend"); lg.innerHTML = "";
    GAME.groups.slice().sort((a, b) => grpName(a.id).localeCompare(grpName(b.id), S.lang)).forEach(g => {
      const b = document.createElement("button");
      b.className = exploreGrp === g.id ? "on" : "";
      b.innerHTML = `<i style="background:${g.color}"></i>${grpName(g.id)} · ${grpSize(g.id)}`;
      b.onclick = () => {
        exploreGrp = exploreGrp === g.id ? null : g.id;
        const ids = ITEMS.filter(c => !exploreGrp || c.grp === exploreGrp).map(c => c.id);
        ITEMS.forEach(c => cls(c.id, "off", !!exploreGrp && c.grp !== exploreGrp));
        fitTo(ids); renderExplore(); refreshExploreLabels();
      };
      lg.append(b);
    });
    if (exploreSel) exploreSelect(exploreSel);
  }
  function refreshExploreLabels() {
    const names = $("#tLabels").checked, caps = $("#tCaps").checked;
    ITEMS.forEach(c => {
      const l = labels[c.id], sel = c.id === exploreSel;
      l.tx.style.display = (names || caps || sel) && !paths[c.id].classList.contains("off") ? "" : "none";
      l.n.style.display = names || sel ? "" : "none";
      l.cap.style.display = caps || sel ? "" : "none";
      l.cap.setAttribute("dy", l.n.style.display === "none" ? "0" : "1.15em");
    });
  }
  $("#tLabels").onchange = refreshExploreLabels;
  $("#tCaps").onchange = refreshExploreLabels;

  function exploreSelect(id) {
    const L = t(), c = BY_ID[id];
    if (exploreSel) cls(exploreSel, "sel", false);
    exploreSel = id; cls(id, "sel");
    refreshExploreLabels();
    tone([520 + (parseInt(id, 10) * 12)], .08, "triangle");
    const card = $("#infoCard");
    card.hidden = false;
    card.innerHTML = `<h3>${name(c)}</h3>
      <div><span class="tag" style="background:${grpColor(c.grp)}">${grpName(c.grp)}</span> ${isMastered(id) ? `<span class="tag" style="background:var(--ok)">${L.masteredTag}</span>` : ""}</div>
      <dl><dt>${L.capital}</dt><dd>${capOf(c)}</dd><dt>${L.group}</dt><dd>${grpName(c.grp)}</dd><dt>${L.area}</dt><dd>${c.approx ? "≈ " : ""}${c.area.toLocaleString(S.lang)} km²</dd></dl>`;
  }

  // ---------- Confeti ----------
  function confetti() {
    const cv = $("#confetti"), ctx = cv.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const cols = ["#4c8bf5", "#ef6461", "#3fb57a", "#f2a93b", "#f5b700", "#ff6b35"];
    const parts = Array.from({ length: 160 }, () => ({
      x: innerWidth / 2 + (Math.random() - .5) * 120, y: innerHeight * .35,
      vx: (Math.random() - .5) * 14, vy: -Math.random() * 13 - 4, r: Math.random() * 6 + 4,
      c: cols[Math.random() * cols.length | 0], a: Math.random() * 6, va: (Math.random() - .5) * .3,
    }));
    const t0 = performance.now();
    (function frame(now) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts.forEach(p => {
        p.vy += .35; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.a += p.va;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore();
      });
      if (now - t0 < 3000) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })(t0);
  }

  // ---------- Inici ----------
  const fromHash = Object.keys(GAMES).find(id => `#${NOUNS[id].ca.hash}` === location.hash);
  setGame(fromHash || (GAMES[S.game] ? S.game : "cat"));
  applyVB();
  show("home");
})();
