(() => {
  "use strict";

  const { w: MAP_W, h: MAP_H, comarques: COMS, provincies: PROVS } = window.MAPA;
  const BY_ID = Object.fromEntries(COMS.map(c => [c.id, c]));
  const PROV_NAMES = ["Barcelona", "Girona", "Lleida", "Tarragona"];
  const PROV_COLOR = { Barcelona: "var(--p-barcelona)", Girona: "var(--p-girona)", Lleida: "var(--p-lleida)", Tarragona: "var(--p-tarragona)" };
  const SVGNS = "http://www.w3.org/2000/svg";
  const $ = s => document.querySelector(s);

  // ---------- Textos ----------
  const T = {
    ca: {
      heroTitle: "Aprèn Catalunya jugant",
      heroSub: "4 províncies, 43 comarques i les seves capitals. Tria on vols jugar i a què.",
      mastered: "comarques dominades",
      scopeTitle: "On jugues?",
      lengthTitle: "Quantes preguntes?",
      all: "Tot Catalunya", n10: "10", nAll: "Totes",
      showNames: "Mostra els noms", showCaps: "Mostra les capitals",
      points: "punts", newRecord: "🏆 Nou rècord!", menu: "Menú", again: "Torna-hi", reviewMistakes: "Repassa errors",
      footer: "Dades geogràfiques: Institut Cartogràfic i Geològic de Catalunya (ICGC), 2026.",
      best: "Rècord", noBest: "Encara sense rècord",
      modes: {
        explora: ["Explora", "Toca el mapa i descobreix cada comarca, la capital i la província."],
        on: ["On és?", "Et diem una comarca i l'has de trobar al mapa. Tens 3 intents."],
        quina: ["Quina és?", "S'il·lumina una comarca: endevina com es diu entre 4 opcions."],
        capital: ["Capitals", "Quina és la capital de cada comarca? Tria la bona."],
        prov: ["Províncies", "A quina província pertany cada comarca? Barcelona, Girona, Lleida o Tarragona."],
        rellotge: ["Contrarellotge", "60 segons per trobar-ne tantes com puguis. Encerts: +2 s. Errors: −3 s."],
      },
      exploreHint: "Toca una comarca per descobrir-la",
      find: "Troba al mapa", whichCom: "Com es diu la comarca marcada?", whichCap: "Quina és la capital de",
      whichProv: "A quina província és", capital: "Capital", province: "Província", area: "Superfície",
      masteredTag: "✓ Dominada", thatIs: "Això és", wellDone: "Molt bé!", itWas: "Era",
      streakX: m => `Ratxa! Punts ×${m}`,
      resTitles: ["Cal practicar una mica més", "Bon intent!", "Molt bé!", "Ets un crack!"],
      resDetail: (c, t, s) => `${c} de ${t} encerts · millor ratxa ${s}`,
      resTimed: (c, s) => `${c} comarques trobades · millor ratxa ${s}`,
      timeUp: "S'ha acabat el temps!", provinceOf: "Província de",
    },
    es: {
      heroTitle: "Aprende Cataluña jugando",
      heroSub: "4 provincias, 43 comarcas y sus capitales. Elige dónde quieres jugar y a qué.",
      mastered: "comarcas dominadas",
      scopeTitle: "¿Dónde juegas?",
      lengthTitle: "¿Cuántas preguntas?",
      all: "Toda Cataluña", n10: "10", nAll: "Todas",
      showNames: "Mostrar los nombres", showCaps: "Mostrar las capitales",
      points: "puntos", newRecord: "🏆 ¡Nuevo récord!", menu: "Menú", again: "Otra vez", reviewMistakes: "Repasar errores",
      footer: "Datos geográficos: Institut Cartogràfic i Geològic de Catalunya (ICGC), 2026.",
      best: "Récord", noBest: "Aún sin récord",
      modes: {
        explora: ["Explora", "Toca el mapa y descubre cada comarca, su capital y su provincia."],
        on: ["¿Dónde está?", "Te decimos una comarca y tienes que encontrarla en el mapa. Tienes 3 intentos."],
        quina: ["¿Cuál es?", "Se ilumina una comarca: adivina cómo se llama entre 4 opciones."],
        capital: ["Capitales", "¿Cuál es la capital de cada comarca? Elige la buena."],
        prov: ["Provincias", "¿A qué provincia pertenece cada comarca? Barcelona, Girona, Lleida o Tarragona."],
        rellotge: ["Contrarreloj", "60 segundos para encontrar todas las que puedas. Aciertos: +2 s. Errores: −3 s."],
      },
      exploreHint: "Toca una comarca para descubrirla",
      find: "Encuentra en el mapa", whichCom: "¿Cómo se llama la comarca marcada?", whichCap: "¿Cuál es la capital de",
      whichProv: "¿En qué provincia está", capital: "Capital", province: "Provincia", area: "Superficie",
      masteredTag: "✓ Dominada", thatIs: "Esto es", wellDone: "¡Muy bien!", itWas: "Era",
      streakX: m => `¡Racha! Puntos ×${m}`,
      resTitles: ["Hay que practicar un poco más", "¡Buen intento!", "¡Muy bien!", "¡Eres un crack!"],
      resDetail: (c, t, s) => `${c} de ${t} aciertos · mejor racha ${s}`,
      resTimed: (c, s) => `${c} comarcas encontradas · mejor racha ${s}`,
      timeUp: "¡Se acabó el tiempo!", provinceOf: "Provincia de",
    },
  };
  const MODES = [
    { id: "explora", emoji: "🧭", color: "#cfe6f2" },
    { id: "on", emoji: "📍", color: "#ffd9c7" },
    { id: "quina", emoji: "🔎", color: "#d8f3e3" },
    { id: "capital", emoji: "🏛️", color: "#fde9b8" },
    { id: "prov", emoji: "🗺️", color: "#e3dcfb" },
    { id: "rellotge", emoji: "⏱️", color: "#ffd1d3" },
  ];

  // ---------- Estat persistent ----------
  const KEY = "comarcat-v1";
  const S = Object.assign({ lang: "ca", sound: true, scope: "all", len: 10, xp: 0, best: {}, mastery: {} }, read());
  function read() { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* sense emmagatzematge */ } }
  const t = () => T[S.lang];

  // ---------- Utilitats ----------
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const sample = (arr, n, except) => shuffle(arr.filter(x => !except.includes(x))).slice(0, n);
  const poolFor = scope => COMS.filter(c => scope === "all" || c.prov === scope);
  const isMastered = id => (S.mastery[id] || 0) >= 3;

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
  const paths = {}, labels = {};
  function el(tag, attrs = {}) { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; }

  function buildMap() {
    svg.append(gCom, gProv, gLbl, gFx);
    COMS.forEach(c => {
      const p = el("path", { d: c.d, class: `com p-${c.prov}`, "data-id": c.id });
      gCom.append(p); paths[c.id] = p;
      const tx = el("text", { x: c.lx, y: c.ly, class: "lbl" });
      const n = el("tspan", { x: c.lx }); n.textContent = c.nom;
      const cap = el("tspan", { x: c.lx, dy: "1.15em", class: "cap" }); cap.textContent = c.cap;
      tx.append(n, cap); tx.style.display = "none"; gLbl.append(tx); labels[c.id] = { tx, cap };
    });
    PROVS.forEach(p => gProv.append(el("path", { d: p.d, class: "prov-line" })));
  }

  // Zoom i desplaçament amb viewBox
  let vb = { x: 0, y: 0, w: MAP_W, h: MAP_H };
  function applyVB() {
    svg.setAttribute("viewBox", `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    const r = svg.getBoundingClientRect();
    const upp = r.width ? Math.max(vb.w / r.width, vb.h / r.height) : 1;
    gLbl.setAttribute("font-size", (12.5 * upp).toFixed(2));
    gFx.querySelectorAll(".ping").forEach(c => c.setAttribute("r", 16 * upp));
  }
  function fitTo(ids) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    ids.forEach(id => { const b = paths[id].getBBox(); x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.width); y1 = Math.max(y1, b.y + b.height); });
    const pad = Math.max(x1 - x0, y1 - y0) * .04;
    vb = { x: x0 - pad, y: y0 - pad, w: x1 - x0 + 2 * pad, h: y1 - y0 + 2 * pad };
    homeVB = { ...vb }; applyVB();
  }
  let homeVB = { ...vb };
  function zoomAt(f, cx, cy) {
    const nw = Math.min(Math.max(vb.w * f, 60), MAP_W * 1.6);
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
    COMS.forEach(c => { paths[c.id].setAttribute("class", `com p-${c.prov}`); labels[c.id].tx.style.display = "none"; });
    gFx.innerHTML = "";
  }
  function showLabel(id, withCap) { const l = labels[id]; l.tx.style.display = ""; l.cap.style.display = withCap ? "" : "none"; }
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
    document.documentElement.lang = S.lang;
    document.querySelectorAll("[data-t]").forEach(n => { const v = t()[n.dataset.t]; if (typeof v === "string") n.textContent = v; });
    $("#btnLang").textContent = S.lang === "ca" ? "ES" : "CA";
    $("#btnSound").textContent = S.sound ? "🔊" : "🔇";
    const lvl = Math.floor(S.xp / 200) + 1;
    $("#xpLevel").textContent = lvl;
    $("#xpFill").style.width = `${(S.xp % 200) / 2}%`;
  }

  function renderHome() {
    renderStatic();
    const m = COMS.filter(c => isMastered(c.id)).length;
    $("#masteryNum").textContent = m;
    $("#masteryArc").style.strokeDasharray = `${m / COMS.length * 100} 100`;
    $("#masteryArc").style.opacity = m ? 1 : 0;

    const sc = $("#scopeChips"); sc.innerHTML = "";
    ["all", ...PROV_NAMES].forEach(p => {
      const b = document.createElement("button");
      b.className = "chip" + (S.scope === p ? " on" : "");
      b.innerHTML = p === "all" ? t().all : `<span class="dot" style="background:${PROV_COLOR[p]}"></span>${p}`;
      b.onclick = () => { S.scope = p; save(); renderHome(); };
      sc.append(b);
    });
    const lc = $("#lengthChips"); lc.innerHTML = "";
    [[10, t().n10], [0, t().nAll]].forEach(([v, txt]) => {
      const b = document.createElement("button");
      b.className = "chip" + (S.len === v ? " on" : "");
      b.textContent = txt;
      b.onclick = () => { S.len = v; save(); renderHome(); };
      lc.append(b);
    });

    const box = $("#modes"); box.innerHTML = "";
    MODES.forEach(md => {
      const [name, desc] = t().modes[md.id];
      const b = document.createElement("button");
      b.className = "mode";
      b.style.setProperty("--c", md.color);
      let best = "";
      if (md.id !== "explora") {
        const r = S.best[bestKey(md.id)];
        best = r ? `<span class="best">${t().best}: ${r.score} <span class="st">${"★".repeat(r.stars || 0)}</span></span>` : `<span class="best" style="color:var(--muted)">${t().noBest}</span>`;
      }
      b.innerHTML = `<span class="emoji">${md.emoji}</span><h3>${name}</h3><p>${desc}</p>${best}`;
      b.onclick = () => start(md.id);
      box.append(b);
    });
  }
  const scopeOf = mode => (mode === "prov" ? "all" : S.scope);
  const bestKey = mode => `${mode}|${scopeOf(mode)}|${mode === "rellotge" ? "t" : S.len}`;

  $("#btnLang").onclick = () => { S.lang = S.lang === "ca" ? "es" : "ca"; save(); renderStatic(); if ($("#home").classList.contains("active")) renderHome(); else if (G && G.mode === "explora") renderExplore(); else if (G && G.queue) ask(); };
  $("#btnSound").onclick = () => { S.sound = !S.sound; save(); renderStatic(); };

  // ---------- Joc ----------
  let G = null, timerId = null;
  function stopTimer() { clearInterval(timerId); timerId = null; }

  function start(mode, onlyIds) {
    stopTimer();
    const scope = scopeOf(mode);
    const pool = poolFor(scope);
    let queue = shuffle(onlyIds ? pool.filter(c => onlyIds.includes(c.id)) : pool);
    if (mode !== "rellotge" && !onlyIds && S.len) queue = queue.slice(0, S.len);
    G = { mode, scope, pool, queue, i: 0, score: 0, streak: 0, bestStreak: 0, correct: 0, errors: [], attempts: 0, locked: false, time: 60, review: !!onlyIds };

    show("game");
    resetMapClasses();
    COMS.forEach(c => cls(c.id, "off", scope !== "all" && c.prov !== scope));
    $("#mapWrap").classList.toggle("map-neutral", mode !== "explora");
    exploreSel = null; exploreProv = null;
    $("#tLabels").checked = $("#tCaps").checked = false;
    requestAnimationFrame(() => fitTo(pool.map(c => c.id)));

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

  function ask() {
    if (!G || G.mode === "explora") return;
    const c = target(), L = t();
    G.attempts = 0; G.locked = false;
    const pr = $("#prompt"), op = $("#options");
    op.innerHTML = ""; op.className = "options";
    gFx.innerHTML = "";
    COMS.forEach(x => { cls(x.id, "target", false); cls(x.id, "flash", false); });

    if (G.mode === "on" || G.mode === "rellotge") {
      pr.innerHTML = `<small>${L.find}</small><span class="name">${c.nom}</span>`;
      if (G.mode === "on") pr.innerHTML += `<div class="attempts" id="att"><i></i><i></i><i></i></div>`;
      return;
    }
    cls(c.id, "target"); ping(c.id);
    let opts;
    if (G.mode === "quina") {
      pr.innerHTML = `<small>${L.modes.quina[0]}</small>${L.whichCom}`;
      opts = shuffle([c, ...sample(G.pool, 3, [c])]).map(x => ({ label: x.nom, ok: x === c }));
    } else if (G.mode === "capital") {
      pr.innerHTML = `<small>${L.modes.capital[0]}</small>${L.whichCap}<span class="name">${c.nom}?</span>`;
      opts = shuffle([c, ...sample(G.pool, 3, [c])]).map(x => ({ label: x.cap, ok: x === c }));
    } else {
      pr.innerHTML = `<small>${L.modes.prov[0]}</small>${L.whichProv}<span class="name">${c.nom}?</span>`;
      op.classList.add("prov");
      opts = PROV_NAMES.map(p => ({ label: p, ok: p === c.prov, color: PROV_COLOR[p] }));
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
    S.mastery[c.id] = Math.min((S.mastery[c.id] || 0) + 1, 9);
    if (G.streak === 3 || G.streak === 6) { sfx.streak(); toast(t().streakX(mult()), "ok"); } else sfx.ok();
  }
  function miss(c) {
    G.streak = 0;
    if (!G.errors.includes(c.id)) G.errors.push(c.id);
    S.mastery[c.id] = Math.max((S.mastery[c.id] || 0) - 1, 0);
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

  function onMapTap(id) {
    if (!G) return;
    if (G.mode === "explora") return exploreSelect(id);
    if (G.locked || !(G.mode === "on" || G.mode === "rellotge")) return;
    const c = target(), tapped = BY_ID[id];
    if (paths[id].classList.contains("done") && id !== c.id && G.mode === "on") { toast(`${t().thatIs} ${tapped.nom}`); return; }
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
    toast(`${t().thatIs} ${tapped.nom}`, "bad");
    if (G.mode === "rellotge") { G.streak = 0; G.time = Math.max(0, G.time - 3); updateHud(); return; }
    G.attempts += 1;
    document.querySelectorAll("#att i").forEach((n, i) => n.classList.toggle("lost", i >= 3 - G.attempts));
    G.streak = 0; updateHud();
    if (G.attempts >= 3) {
      G.locked = true; miss(c);
      cls(c.id, "miss"); showLabel(c.id, false); ping(c.id);
      setTimeout(() => toast(`${t().itWas} ${c.nom}`, "bad"), 400);
      setTimeout(next, 1800);
    }
  }

  function next() {
    if (!G || !$("#game").classList.contains("active")) return;
    G.i += 1;
    if (G.mode === "rellotge") {
      if (G.i % G.queue.length === 0) { G.queue = shuffle(G.queue); COMS.forEach(c => { cls(c.id, "done", false); labels[c.id].tx.style.display = "none"; }); }
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
    const prev = S.best[key];
    const record = !G.review && G.score > 0 && (!prev || G.score > prev.score);
    if (record) S.best[key] = { score: G.score, stars };
    S.xp += Math.round(G.score / 10) + G.correct * 2;
    save();

    show("results");
    renderStatic();
    $("#stars").innerHTML = [0, 1, 2].map(i => `<span class="${i < stars ? "on" : ""}">★</span>`).join("");
    $("#resTitle").textContent = L.resTitles[stars];
    $("#resScore").textContent = G.score;
    $("#resDetail").textContent = G.mode === "rellotge" ? L.resTimed(G.correct, G.bestStreak) : L.resDetail(G.correct, total, G.bestStreak);
    $("#resRecord").hidden = !record;
    $("#resMistakes").innerHTML = G.errors.map(id => `<span>${BY_ID[id].nom}</span>`).join("");
    $("#btnReviewMistakes").hidden = !G.errors.length;
    sfx.end();
    if (stars >= 2 || record) confetti();
  }
  $("#btnAgain").onclick = () => start(G.mode);
  $("#btnReviewMistakes").onclick = () => start(G.mode === "rellotge" ? "on" : G.mode, G.errors.slice());

  document.addEventListener("keydown", e => {
    if (!$("#game").classList.contains("active")) return;
    const n = +e.key;
    if (n >= 1 && n <= 4) { const b = document.querySelectorAll("#options .opt")[n - 1]; if (b && !b.disabled) b.click(); }
    if (e.key === "Escape") show("home");
  });

  // ---------- Explora ----------
  let exploreSel = null, exploreProv = null;
  function renderExplore() {
    const L = t();
    $("#prompt").innerHTML = `<small>${L.modes.explora[0]}</small>${L.exploreHint}`;
    $("#options").innerHTML = "";
    const lg = $("#legend"); lg.innerHTML = "";
    PROV_NAMES.forEach(p => {
      const b = document.createElement("button");
      b.className = exploreProv === p ? "on" : "";
      const n = COMS.filter(c => c.prov === p).length;
      b.innerHTML = `<i style="background:${PROV_COLOR[p]}"></i>${p} · ${n}`;
      b.onclick = () => {
        exploreProv = exploreProv === p ? null : p;
        const ids = COMS.filter(c => !exploreProv || c.prov === exploreProv).map(c => c.id);
        COMS.forEach(c => cls(c.id, "off", !!exploreProv && c.prov !== exploreProv));
        fitTo(ids); renderExplore(); refreshExploreLabels();
      };
      lg.append(b);
    });
    if (exploreSel) exploreSelect(exploreSel);
  }
  function refreshExploreLabels() {
    const names = $("#tLabels").checked, caps = $("#tCaps").checked;
    COMS.forEach(c => {
      const visible = (names || caps || c.id === exploreSel) && !paths[c.id].classList.contains("off");
      labels[c.id].tx.style.display = visible ? "" : "none";
      labels[c.id].tx.firstChild.style.display = names || c.id === exploreSel ? "" : "none";
      labels[c.id].cap.style.display = caps || c.id === exploreSel ? "" : "none";
      labels[c.id].cap.setAttribute("dy", labels[c.id].tx.firstChild.style.display === "none" ? "0" : "1.15em");
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
    card.innerHTML = `<h3>${c.nom}</h3>
      <div><span class="tag" style="background:${PROV_COLOR[c.prov]}">${L.provinceOf} ${c.prov}</span> ${isMastered(id) ? `<span class="tag" style="background:var(--ok)">${L.masteredTag}</span>` : ""}</div>
      <dl><dt>${L.capital}</dt><dd>${c.cap}</dd><dt>${L.province}</dt><dd>${c.prov}</dd><dt>${L.area}</dt><dd>${c.area.toLocaleString(S.lang)} km²</dd></dl>`;
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
  buildMap();
  applyVB();
  show("home");
})();
