/* LifeHappens — a mobile-first life simulator. */
(function () {
  "use strict";

  const D = window.LIFE_DATA;
  const SAVE_KEY = "lifehappens.save.v2";
  const META_KEY = "lifehappens.meta.v2";
  const VERSION = 2;
  const STAT_KEYS = ["happiness", "health", "smarts", "looks"];
  const STAT_INFO = {
    happiness: { label: "Happy", emoji: "😊", name: "Happiness" },
    health: { label: "Health", emoji: "❤️", name: "Health" },
    smarts: { label: "Smarts", emoji: "🧠", name: "Smarts" },
    looks: { label: "Looks", emoji: "✨", name: "Looks" }
  };
  const TYPE_INFO = {
    birth: { label: "The beginning", icon: "i-spark" },
    milestone: { label: "Milestone", icon: "i-spark" },
    money: { label: "Money", icon: "i-assets" },
    career: { label: "Career", icon: "i-briefcase" },
    love: { label: "Love", icon: "i-heart" },
    health: { label: "Health", icon: "i-heart" },
    bad: { label: "Hard times", icon: "i-info" },
    school: { label: "School", icon: "i-book" },
    life: { label: "Life", icon: "i-spark" }
  };
  const EDU_RANK = { none: 0, highschool: 1, trade: 1, university: 2, grad: 3 };
  const FRIEND_FIRST = ["Sam", "Riley", "Alex", "Jamie", "Casey", "Robin", "Taylor", "Morgan", "Ari", "Kai"];
  const PARTNER_TRAITS = ["kind", "funny", "ambitious", "calm", "adventurous", "creative", "thoughtful", "stubborn", "generous", "curious"];
  const $ = (id) => document.getElementById(id);
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const rand = (lo, hi) => lo + Math.random() * (hi - lo);
  const randInt = (lo, hi) => Math.floor(rand(lo, hi + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const chance = (p) => Math.random() < p;

  let game = null;
  let meta = loadMeta();
  let activeTab = "life";
  let draft = null;
  let pendingConfirm = null;
  let modalOnClose = null;
  let audioCtx = null;
  let booted = false;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[ch]));
  }
  function icon(name, cls) {
    return `<svg class="${cls || "icon"}" aria-hidden="true"><use href="#${name}"/></svg>`;
  }
  function byId(id) { return document.getElementById(id); }

  function loadMeta() {
    try {
      const raw = JSON.parse(localStorage.getItem(META_KEY) || "null");
      if (raw && typeof raw === "object") {
        return {
          unlocked: Array.isArray(raw.unlocked) ? raw.unlocked : [],
          lives: Array.isArray(raw.lives) ? raw.lives : [],
          settings: Object.assign({ sound: true, haptics: true }, raw.settings || {})
        };
      }
    } catch (e) { /* Ignore broken storage. */ }
    return { unlocked: [], lives: [], settings: { sound: true, haptics: true } };
  }
  function saveMeta() {
    try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (e) { /* Storage can be full or blocked. */ }
  }
  function readSave() {
    try {
      const raw = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      if (raw && raw.version === VERSION && raw.person && typeof raw.age === "number") return raw;
    } catch (e) { /* Ignore. */ }
    return null;
  }
  function saveGame() {
    if (!game) return;
    try {
      game.lastSaved = Date.now();
      localStorage.setItem(SAVE_KEY, JSON.stringify(game));
    } catch (e) { /* Storage can fail in private mode. */ }
  }
  function removeSave() {
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* Ignore. */ }
  }

  function countryOf(g) { return D.COUNTRIES[g.person.country] || D.COUNTRIES.US; }
  function symbolOf(g) { return countryOf(g).symbol; }
  function fmt(value, compact) {
    if (!Number.isFinite(value)) value = 0;
    const negative = value < 0;
    const abs = Math.abs(Math.round(value));
    let out;
    if (compact && abs >= 1000000) {
      out = (abs / 1000000).toFixed(abs >= 10000000 ? 0 : 1).replace(/\.0$/, "") + "m";
    } else if (compact && abs >= 10000) {
      out = Math.round(abs / 1000) + "k";
    } else if (compact && abs >= 1000) {
      out = (abs / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    } else {
      out = abs.toLocaleString("en-US");
    }
    const g = game;
    const sym = g ? symbolOf(g) : "$";
    return (negative ? "-" : "") + sym + out;
  }
  function fmtStat(value) { return Math.round(clamp(value, 0, 100)); }
  function stageFor(age) {
    for (const stage of D.STAGES) if (age <= stage.max) return stage;
    return D.STAGES[D.STAGES.length - 1];
  }
  function computeAvatar(g) {
    const age = g.age;
    const gender = g.person.gender;
    if (age <= 2) return "👶";
    if (age <= 4) return "🧒";
    if (age <= 12) return gender === "Female" ? "👧" : gender === "Male" ? "👦" : "🧒";
    if (age >= 68) return gender === "Female" ? "👵" : gender === "Male" ? "👴" : "🧓";
    if (age >= 18) return gender === "Female" ? "👩" : gender === "Male" ? "👨" : "🧑";
    return gender === "Female" ? "👧" : gender === "Male" ? "👦" : "🧑";
  }
  function ageNumber(g) { return g ? g.age : 0; }
  function netWorth(g) {
    if (!g) return 0;
    let worth = (g.money || 0) + (g.investments || 0) - (g.loans || 0);
    for (const id of g.assets || []) {
      const asset = D.ASSETS.find(a => a.id === id);
      if (asset) worth += Math.round(asset.price * 0.62);
    }
    return Math.round(worth);
  }
  function livingCosts(g) {
    if (!g || g.age < 18) return 0;
    let total = g.flags.independent ? 13200 : 4200;
    total += (g.relationships || []).filter(r => r.role === "Child" && r.alive).length * 2400;
    for (const id of g.assets || []) {
      const asset = D.ASSETS.find(a => a.id === id);
      if (asset) total += asset.upkeep || 0;
    }
    return total;
  }
  function incomeOf(g) {
    if (!g) return 0;
    let total = g.job ? g.job.salary : 0;
    for (const id of g.assets || []) {
      const asset = D.ASSETS.find(a => a.id === id);
      if (asset && asset.income) total += asset.income;
    }
    return total;
  }
  function loanPayment(g) {
    if (!g || !g.loans) return 0;
    return Math.min(g.loans, Math.max(500, Math.round((g.job ? g.job.salary : 0) * 0.05)));
  }
  function currentExpenses(g) {
    if (!g) return 0;
    let total = livingCosts(g) + loanPayment(g);
    if (g.education && g.education.program) total += g.education.annualTuition || 0;
    return total;
  }
  function relBar(value) { return clamp(Math.round(value), 0, 100); }
  function relColor(value) {
    if (value >= 70) return "var(--green)";
    if (value >= 40) return "var(--gold)";
    return "var(--red)";
  }
  function getPartner(g) {
    if (!g || !g.partnerId) return null;
    return (g.relationships || []).find(r => r.id === g.partnerId) || null;
  }
  function hasFriend(g) {
    return (g.relationships || []).some(r => r.role === "Friend" && r.alive);
  }
  function randomFirst(gender, countryCode) {
    const c = D.COUNTRIES[countryCode] || D.COUNTRIES.US;
    if (gender === "Male") return pick(c.male);
    if (gender === "Female") return pick(c.female);
    return pick(Math.random() < 0.5 ? c.male : c.female);
  }
  function randomLast(countryCode) {
    return pick((D.COUNTRIES[countryCode] || D.COUNTRIES.US).last);
  }
  function randomDraft() {
    const code = pick(D.COUNTRY_ORDER);
    const country = D.COUNTRIES[code];
    const gender = pick(["Female", "Male", "Non-binary"]);
    return {
      first: randomFirst(gender, code),
      last: randomLast(code),
      gender,
      country: code,
      city: pick(country.cities)
    };
  }
  function newId(prefix) {
    return prefix + "_" + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  }
  function fullName(g) { return `${g.person.first} ${g.person.last}`; }
  function withArticle(word) { return `${/^[aeiou]/i.test(word) ? "An" : "A"} ${word}`; }

  function haptic(ms) {
    if (!meta.settings.haptics) return;
    try { if (navigator.vibrate) navigator.vibrate(ms || 12); } catch (e) { /* Ignore. */ }
  }
  function ensureAudio() {
    if (!meta.settings.sound) return null;
    try {
      if (!audioCtx) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return null;
        audioCtx = new Ctx();
      }
      if (audioCtx.state === "suspended") audioCtx.resume();
      return audioCtx;
    } catch (e) { return null; }
  }
  function tone(freq, duration, type, volume, delay) {
    const ctx = ensureAudio();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = ctx.currentTime + (delay || 0);
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(volume || 0.035, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + (duration || 0.09));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + (duration || 0.09) + 0.02);
    } catch (e) { /* Audio is optional. */ }
  }
  function soundTap() { tone(520, 0.05, "sine", 0.025); }
  function soundGood() { tone(660, 0.08, "sine", 0.04); tone(990, 0.12, "sine", 0.035, 0.07); }
  function soundAge() { tone(420, 0.09, "triangle", 0.035); tone(620, 0.14, "triangle", 0.03, 0.08); }

  function showToast(text, kind) {
    const root = $("toast-root");
    if (!root) return;
    const el = document.createElement("div");
    el.className = "toast";
    const iconName = kind === "trophy" ? "i-trophy" : kind === "heart" ? "i-heart" : kind === "bad" ? "i-info" : "i-check";
    el.innerHTML = `${icon(iconName)}<span>${esc(text)}</span>`;
    root.appendChild(el);
    while (root.children.length > 3) root.removeChild(root.firstElementChild);
    window.setTimeout(() => {
      el.classList.add("is-out");
      window.setTimeout(() => el.remove(), 260);
    }, 2600);
  }

  function confettiBurst(count) {
    const root = $("confetti-root");
    if (!root) return;
    const colors = ["#ff6b5e", "#f2b63f", "#14b8a6", "#8b79e8", "#548cf0", "#ff9b87"];
    for (let i = 0; i < (count || 26); i++) {
      const bit = document.createElement("i");
      bit.className = "confetti";
      bit.style.left = rand(4, 96) + "%";
      bit.style.background = pick(colors);
      bit.style.setProperty("--dx", rand(-70, 70) + "px");
      bit.style.setProperty("--rot", rand(180, 780) + "deg");
      bit.style.animationDelay = rand(0, 0.3) + "s";
      bit.style.animationDuration = rand(1.4, 2.2) + "s";
      if (i % 3 === 0) bit.style.borderRadius = "50%";
      root.appendChild(bit);
      window.setTimeout(() => bit.remove(), 2600);
    }
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(el => el.classList.toggle("is-active", el.id === id));
  }
  function isModalOpen() { return $("modal-root").classList.contains("is-open"); }

  function openModal(html, opts) {
    opts = opts || {};
    const root = $("modal-root");
    modalOnClose = opts.onClose || null;
    root.innerHTML = `<div class="modal-overlay" data-overlay="1"><div class="modal-sheet" role="dialog" aria-modal="true">${html}</div></div>`;
    root.classList.add("is-open");
    $("app").classList.add("modal-open");
    root.dataset.dismissible = opts.dismissible === false ? "0" : "1";
    window.setTimeout(() => {
      const focusTarget = root.querySelector("[autofocus], .choice-btn, .btn-primary, .action-btn, .settings-row");
      if (focusTarget) { try { focusTarget.focus({ preventScroll: true }); } catch (e) { /* Ignore. */ } }
    }, 80);
  }
  function closeModal(runCallback) {
    const root = $("modal-root");
    if (!root.classList.contains("is-open")) return;
    const cb = modalOnClose;
    modalOnClose = null;
    pendingConfirm = null;
    root.classList.remove("is-open");
    $("app").classList.remove("modal-open");
    root.dataset.dismissible = "1";
    window.setTimeout(() => { if (!root.classList.contains("is-open")) root.innerHTML = ""; }, 220);
    if (runCallback !== false && typeof cb === "function") cb();
  }

  function modalHeader(opts) {
    return `<div class="modal-handle"></div>
      <div class="modal-top">
        <div class="modal-icon">${opts.emoji || "✨"}</div>
        <div style="min-width:0;flex:1">
          <div class="modal-kicker">${esc(opts.kicker || "LifeHappens")}</div>
          <h3 class="modal-title">${esc(opts.title || "")}</h3>
        </div>
        ${opts.close === false ? "" : `<button class="modal-close" data-close aria-label="Close">${icon("i-close")}</button>`}
      </div>`;
  }
  function effectsChips(chips) {
    if (!chips || !chips.length) return "";
    return `<div class="modal-effects">${chips.map(c => `<span class="effect ${c.kind || ""}">${esc(c.text)}</span>`).join("")}</div>`;
  }
  function showResultModal(title, text, chips, onClose, emoji) {
    openModal(`${modalHeader({ emoji: emoji || "✨", kicker: "What happened", title })}
      <p class="modal-text">${esc(text)}</p>
      ${effectsChips(chips)}
      <div class="modal-actions"><button class="btn btn-primary" data-close>Continue</button></div>`, { dismissible: false, onClose });
  }
  function showConfirm(title, text, label, onConfirm, opts) {
    opts = opts || {};
    pendingConfirm = onConfirm;
    openModal(`${modalHeader({ emoji: opts.emoji || "🤔", kicker: opts.kicker || "Are you sure?", title })}
      <p class="modal-text">${esc(text)}</p>
      <div class="modal-actions">
        <button class="btn ${opts.danger ? "btn-danger" : "btn-primary"}" data-confirm>${esc(label || "Confirm")}</button>
        <button class="btn btn-text" data-close>Never mind</button>
      </div>`, { dismissible: true });
  }

  function startScreen() {
    closeModal(false);
    game = null;
    activeTab = "life";
    refreshStart();
    showScreen("screen-start");
  }
  function refreshStart() {
    const save = readSave();
    const btn = $("btn-continue");
    if (!btn) return;
    btn.hidden = !save;
    if (save) {
      btn.textContent = save.phase === "dead" ? "Visit memorial" : `Continue ${save.person.first} · Age ${save.age}`;
    }
  }

  function randomizeDraft() {
    draft = randomDraft();
    renderCreate();
  }
  function renderCreate() {
    if (!draft) draft = randomDraft();
    $("input-first").value = draft.first;
    $("input-last").value = draft.last;
    document.querySelectorAll("#gender-picker button").forEach(btn => {
      btn.classList.toggle("is-selected", btn.dataset.gender === draft.gender);
    });
    const countrySelect = $("select-country");
    countrySelect.innerHTML = D.COUNTRY_ORDER.map(code => {
      const c = D.COUNTRIES[code];
      return `<option value="${code}">${c.flag} ${esc(c.name)}</option>`;
    }).join("");
    countrySelect.value = draft.country;
    const cities = D.COUNTRIES[draft.country].cities;
    if (!cities.includes(draft.city)) draft.city = pick(cities);
    $("select-city").innerHTML = cities.map(city => `<option value="${esc(city)}">${esc(city)}</option>`).join("");
    $("select-city").value = draft.city;
    const avatars = D.GENDER_AVATARS[draft.gender] || D.GENDER_AVATARS["Non-binary"];
    $("create-avatar").textContent = avatars[2] || avatars[0];
    $("avatar-caption").textContent = `${withArticle(countryOf({ person: draft }).demonym)} life in ${draft.city}`;
  }
  function openCreate() {
    if (!draft) draft = randomDraft();
    renderCreate();
    showScreen("screen-create");
  }

  function makeRelationship(opts) {
    return {
      id: opts.id || newId("rel"),
      name: opts.name,
      role: opts.role,
      emoji: opts.emoji || "🧑",
      age: opts.age || 30,
      relation: opts.relation == null ? 70 : opts.relation,
      alive: opts.alive !== false,
      gender: opts.gender || "Non-binary",
      trait: opts.trait || ""
    };
  }

  function createGame(person) {
    const country = D.COUNTRIES[person.country];
    const gender = person.gender;
    const last = person.last;
    const motherGender = "Female";
    const fatherGender = "Male";
    const motherFirst = randomFirst(motherGender, person.country);
    const fatherFirst = randomFirst(fatherGender, person.country);
    const mother = makeRelationship({
      id: "mother", name: `${motherFirst} ${last}`, role: "Mother", emoji: "👩",
      age: randInt(27, 42), relation: randInt(78, 95), gender: motherGender
    });
    const father = makeRelationship({
      id: "father", name: `${fatherFirst} ${last}`, role: "Father", emoji: "👨",
      age: randInt(28, 45), relation: randInt(74, 93), gender: fatherGender
    });
    const rels = [mother, father];
    if (chance(0.55)) {
      const sibGender = pick(["Female", "Male"]);
      const sibFirst = randomFirst(sibGender, person.country);
      const older = chance(0.5);
      rels.push(makeRelationship({
        id: "sibling", name: `${sibFirst} ${last}`, role: sibGender === "Female" ? "Sister" : "Brother",
        emoji: sibGender === "Female" ? "👧" : "👦", age: older ? randInt(4, 10) : randInt(1, 5),
        relation: randInt(58, 82), gender: sibGender
      }));
    }
    const g = {
      version: VERSION,
      phase: "playing",
      person: {
        first: person.first, last: person.last, gender: person.gender,
        country: person.country, city: person.city
      },
      age: 0,
      alive: true,
      stats: {
        happiness: randInt(66, 88), health: randInt(70, 92),
        smarts: randInt(58, 86), looks: randInt(55, 88)
      },
      money: 0,
      investments: 0,
      loans: 0,
      salary: 0,
      expenses: 0,
      job: null,
      education: { level: "none", program: null, yearsLeft: 0, annualTuition: 0, target: null },
      relationships: rels,
      partnerId: null,
      assets: [],
      timeline: [],
      achievements: [],
      flags: { independent: false, retired: false, license: false, school: false },
      yearActions: {},
      firedEvents: [],
      jobMarket: [],
      pendingEvent: null,
      lastEventAge: -1,
      logSeq: 0,
      death: null,
      createdAt: Date.now(),
      lastSaved: Date.now()
    };
    addLog(g, `You were born in ${person.city}, ${country.name}. A whole life begins with one tiny breath.`, "birth", "👶");
    addLog(g, `Your parents, ${mother.name} and ${father.name}, brought you home and argued about which one of you you looked like.`, "birth", "🏡");
    addLog(g, "Welcome to LifeHappens. There are no right answers — only consequences.", "milestone", "✨");
    return g;
  }

  function addLog(g, text, type, emoji, chips) {
    g.logSeq = (g.logSeq || 0) + 1;
    g.timeline.push({
      id: g.logSeq,
      age: g.age,
      text,
      type: type || "life",
      emoji: emoji || "✨",
      chips: chips || []
    });
    if (g.timeline.length > 600) g.timeline = g.timeline.slice(-600);
  }

  function beginGame(person) {
    game = createGame(person);
    activeTab = "life";
    closeModal(false);
    saveGame();
    renderGame({ scroll: "bottom" });
    showScreen("screen-game");
    soundGood();
    haptic(18);
    window.setTimeout(() => showToast("Your story starts now. Tap Age Up to grow.", "heart"), 700);
  }

  function hasActiveLife() {
    const save = readSave();
    return Boolean(save && save.phase === "playing");
  }

  function handlePlay() {
    if (hasActiveLife()) {
      showConfirm("Start a new life?", "Your current life is saved, but a new one will replace it. This cannot be undone.", "Start over", () => {
        closeModal(false);
        beginGame(randomDraft());
      }, { emoji: "🌱", kicker: "Fresh start" });
      return;
    }
    beginGame(randomDraft());
  }

  function handleBegin() {
    const first = ($("input-first").value || "").trim().slice(0, 16);
    const last = ($("input-last").value || "").trim().slice(0, 18);
    if (!first || !last) { showToast("Give your new life a first and last name.", "bad"); return; }
    const person = {
      first, last,
      gender: draft.gender,
      country: $("select-country").value,
      city: $("select-city").value
    };
    if (hasActiveLife()) {
      showConfirm("Replace your current life?", "Starting this life will overwrite your saved one.", "Begin anyway", () => {
        closeModal(false);
        beginGame(person);
      }, { emoji: "🌱", kicker: "New beginning" });
    } else {
      beginGame(person);
    }
  }

  function continueLife() {
    const save = readSave();
    if (!save) { refreshStart(); return; }
    game = save;
    if (game.phase === "dead" || !game.alive) {
      renderDeath();
      showScreen("screen-death");
      return;
    }
    game.phase = "playing";
    activeTab = "life";
    renderGame({ scroll: "bottom" });
    showScreen("screen-game");
    if (game.pendingEvent) window.setTimeout(showEventModal, 260);
  }

  function makeChips(effects) {
    if (!effects) return [];
    const chips = [];
    for (const key of STAT_KEYS) {
      const value = effects[key];
      if (value) chips.push({ text: `${STAT_INFO[key].name} ${value > 0 ? "+" : ""}${Math.round(value)}`, kind: value > 0 ? "pos" : "neg" });
    }
    if (effects.money) {
      chips.push({ text: `${effects.money > 0 ? "+" : ""}${fmt(effects.money)}`, kind: effects.money > 0 ? "money" : "neg" });
    }
    if (effects.family) chips.push({ text: `Family ${effects.family > 0 ? "+" : ""}${Math.round(effects.family)}`, kind: effects.family > 0 ? "pos" : "neg" });
    if (effects.partner) chips.push({ text: `Partner ${effects.partner > 0 ? "+" : ""}${Math.round(effects.partner)}`, kind: effects.partner > 0 ? "pos" : "neg" });
    if (effects.social) chips.push({ text: `Social ${effects.social > 0 ? "+" : ""}${Math.round(effects.social)}`, kind: effects.social > 0 ? "pos" : "neg" });
    if (effects.performance) chips.push({ text: `Work rep ${effects.performance > 0 ? "+" : ""}${Math.round(effects.performance)}`, kind: effects.performance > 0 ? "pos" : "neg" });
    if (effects.jobBoost) chips.push({ text: effects.jobBoost >= 1 ? `Salary +${Math.round((effects.jobBoost - 1) * 100)}%` : `Hours -${Math.round((1 - effects.jobBoost) * 100)}%`, kind: effects.jobBoost >= 1 ? "money" : "neg" });
    if (effects.independence) chips.push({ text: "Moved out", kind: "pos" });
    if (effects.retire) chips.push({ text: "Retired", kind: "pos" });
    if (effects.meet) chips.push({ text: "New connection", kind: "pos" });
    return chips;
  }

  function renderGame(opts) {
    if (!game) return;
    opts = opts || {};
    renderHeader();
    document.querySelectorAll("#bottom-nav button").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.tab === activeTab);
    });
    renderTab({ scroll: opts.scroll || "preserve" });
    renderAgeDock();
    if (game.pendingEvent && !isModalOpen()) {
      window.setTimeout(() => { if (game && game.pendingEvent && !isModalOpen()) showEventModal(); }, 260);
    }
  }

  function renderHeader() {
    const g = game;
    if (!g) return;
    $("header-avatar").textContent = computeAvatar(g);
    $("header-name").textContent = fullName(g);
    $("header-meta").textContent = `Age ${g.age} · ${stageFor(g.age).name} · ${countryOf(g).flag}`;
    const moneyEl = $("header-money");
    moneyEl.textContent = fmt(g.money, true);
    moneyEl.classList.toggle("is-negative", g.money < 0);
    const income = incomeOf(g);
    $("header-income").textContent = income > 0 ? `+${fmt(income, true)}/yr` : g.age < 5 ? "no income" : g.age < 18 ? "allowance" : "no income";
    $("avatar-dot").classList.toggle("is-alive", Boolean(g.alive));

    $("stats-grid").innerHTML = STAT_KEYS.map(key => {
      const value = clamp(g.stats[key], 0, 100);
      return `<div class="stat ${value <= 24 ? "is-low" : ""}" data-stat="${key}">
        <div class="stat-top"><span class="emoji">${STAT_INFO[key].emoji}</span><span>${STAT_INFO[key].label}</span><b>${fmtStat(value)}</b></div>
        <div class="stat-bar"><i style="width:${value}%"></i></div>
      </div>`;
    }).join("");
  }

  function renderAgeDock() {
    const btn = $("age-btn");
    if (!game) return;
    if (game.pendingEvent) {
      $("age-btn-title").textContent = "A choice awaits";
      $("age-btn-sub").textContent = "Resolve this moment to keep going";
      document.querySelector(".age-btn-plus").textContent = "!";
      btn.disabled = true;
      return;
    }
    $("age-btn-title").textContent = "Age up";
    $("age-btn-sub").textContent = `Turn ${game.age + 1} · ${stageFor(game.age + 1).name}`;
    document.querySelector(".age-btn-plus").textContent = "+1";
    btn.disabled = !game.alive;
  }

  function renderTab(opts) {
    opts = opts || {};
    const body = $("tab-body");
    if (!body || !game) return;
    const previous = body.scrollTop;
    if (activeTab === "life") body.innerHTML = timelineTab();
    else if (activeTab === "activities") body.innerHTML = activitiesTab();
    else if (activeTab === "people") body.innerHTML = peopleTab();
    else if (activeTab === "assets") body.innerHTML = assetsTab();
    else if (activeTab === "career") body.innerHTML = careerTab();
    if (opts.scroll === "bottom") {
      requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
    } else if (opts.scroll === "top") {
      body.scrollTop = 0;
    } else {
      requestAnimationFrame(() => { body.scrollTop = previous; });
    }
  }

  function timelineTab() {
    const g = game;
    const items = g.timeline.map(item => {
      const type = TYPE_INFO[item.type] || TYPE_INFO.life;
      const chips = (item.chips || []).map(c => `<span class="effect ${c.kind || ""}">${esc(c.text)}</span>`).join("");
      return `<div class="tl-item" data-type="${esc(item.type || "life")}">
        <div class="tl-rail"><div class="tl-age">${item.age}</div></div>
        <div class="tl-card">
          <div class="tl-head">${icon(type.icon)}<span>${esc(type.label)}</span></div>
          <div class="tl-text">${esc(item.text)}</div>
          ${chips ? `<div class="tl-effects">${chips}</div>` : ""}
        </div>
      </div>`;
    }).join("");
    const endText = g.pendingEvent ? "A decision is waiting for you." : g.age >= 99 ? "Every year is a gift now." : "Tap Age Up when you're ready for the next year.";
    return `<div class="timeline">
      ${items || `<div class="empty-card"><div class="empty-icon">📖</div><div class="empty-title">Your story begins</div><div class="empty-text">Tap Age Up to live your first year.</div></div>`}
      <div class="timeline-end"><span class="line"></span>${esc(endText)}<span class="line"></span></div>
    </div>`;
  }

  function activitiesTab() {
    const g = game;
    const groups = ["Wellness", "Fun", "Growth", "Money"];
    const tint = { Wellness: "tint-teal", Fun: "tint-coral", Growth: "tint-purple", Money: "tint-gold" };
    const available = D.ACTIVITIES.filter(a => g.age >= (a.minAge || 0) && (!a.maxAge || g.age <= a.maxAge));
    const sections = groups.map(group => {
      const acts = available.filter(a => a.category === group);
      if (!acts.length) return "";
      const cards = acts.map(a => {
        const done = Boolean(g.yearActions["act:" + a.id]);
        const poor = g.money < (a.cost || 0);
        const buttonLabel = done ? "Done" : poor ? "Need" : "Do";
        const chips = makeChips(a.effects).map(c => `<span class="effect ${c.kind}">${esc(c.text)}</span>`).join("");
        return `<div class="action-card ${done ? "is-used" : ""}">
          <div class="action-icon ${tint[group]}">${a.icon}</div>
          <div class="action-main">
            <div class="action-title">${esc(a.title)}</div>
            <div class="action-desc">${esc(a.desc)}</div>
            <div class="action-meta">
              <span class="action-cost">${a.cost ? fmt(a.cost) : "Free"}</span>
              ${chips || `<span class="effect">A little risk</span>`}
            </div>
          </div>
          <button class="action-btn ${done ? "is-done" : ""}" data-act="activity" data-id="${a.id}" ${done || poor ? "disabled" : ""}>${buttonLabel}</button>
        </div>`;
      }).join("");
      return `<div class="section-head">${icon(group === "Wellness" ? "i-heart" : group === "Fun" ? "i-spark" : group === "Growth" ? "i-book" : "i-assets")}<h3>${group}</h3><span class="spacer"></span><small>once a year</small></div><div class="stack">${cards}</div>`;
    }).join("");
    return `<div class="panel">
      <div class="panel-intro">
        <div><h2 class="panel-title">Activities</h2><p class="panel-sub">Make the most of age ${g.age}. Each activity is once per year.</p></div>
        <div class="year-chip">Year ${g.age}</div>
      </div>
      ${sections}
      <div style="height:10px"></div>
    </div>`;
  }

  function partnerCardHtml() {
    const g = game;
    const partner = getPartner(g);
    if (!partner) {
      if (g.age < 16) {
        return `<div class="empty-card"><div class="empty-icon">🌱</div><div class="empty-title">Romance can wait</div><div class="empty-text">You're still young. There will be time for crushes, dates, and all the complicated stuff.</div></div>`;
      }
      const done = Boolean(g.yearActions.dating);
      return `<div class="empty-card">
        <div class="empty-icon">💌</div>
        <div class="empty-title">${done ? "You put yourself out there" : "Ready to meet someone?"}</div>
        <div class="empty-text">${done ? "Nothing clicked this year. There is always next year." : "A date costs " + fmt(40) + ". You might meet someone who changes everything."}</div>
        <button class="btn btn-primary" data-act="meet" ${done || g.money < 40 ? "disabled" : ""}>${done ? "Already tried this year" : "Go on a date"}</button>
      </div>`;
    }
    const relation = relBar(partner.relation);
    const isSpouse = partner.role === "Spouse";
    const dateDone = Boolean(g.yearActions["partner:date"]);
    const children = g.relationships.filter(r => r.role === "Child" && r.alive).length;
    return `<div class="partner-card">
      <div class="partner-row">
        <div class="partner-avatar">${partner.emoji}</div>
        <div style="flex:1;min-width:0">
          <div class="partner-name">${esc(partner.name)}</div>
          <div class="partner-meta">${isSpouse ? "Married" : "Partner"} · Age ${partner.age}${partner.trait ? " · " + esc(partner.trait) : ""}</div>
          <div class="person-rel"><div class="progress coral"><i style="width:${relation}%"></i></div><b>${relation}</b></div>
        </div>
      </div>
      <div class="partner-actions">
        <button class="action-btn" data-act="date-night" ${dateDone || g.money < 50 ? "disabled" : ""}>${dateDone ? "Date done" : "Date night"}</button>
        ${!isSpouse && relation >= 60 ? `<button class="action-btn gold" data-act="propose">Propose</button>` : ""}
        ${(isSpouse || relation >= 55) && g.age >= 20 && g.age <= 45 && children < 4 ? `<button class="action-btn alt" data-act="start-family">Start a family</button>` : ""}
        <button class="action-btn" data-act="break-up" style="background:var(--red-soft);color:#b33d3d">${isSpouse ? "Divorce" : "Break up"}</button>
      </div>
    </div>`;
  }

  function peopleTab() {
    const g = game;
    const partner = getPartner(g);
    const family = g.relationships.filter(r => r.id !== g.partnerId).slice().sort((a, b) => {
      const order = { Mother: 1, Father: 2, Sister: 3, Brother: 3, Child: 4, Friend: 5 };
      return (order[a.role] || 9) - (order[b.role] || 9) || b.age - a.age;
    });
    const familyHtml = family.map(p => {
      const relation = p.alive ? relBar(p.relation) : 0;
      const roleLabel = p.alive ? p.role : `${p.role} · remembered`;
      return `<button class="person-card" data-act="person" data-id="${p.id}">
        <div class="person-avatar ${p.alive ? "" : "dead"}">${p.emoji}${p.role === "Child" ? `<span class="tiny-heart">${p.age < 3 ? "🍼" : "♥"}</span>` : ""}</div>
        <div class="person-info">
          <div class="person-name">${esc(p.name)}</div>
          <div class="person-role">${esc(roleLabel)} · Age ${p.age}</div>
          <div class="person-rel"><div class="progress" style="--rel:${relation}"><i style="width:${relation}%;background:${relColor(relation)}"></i></div><b>${p.alive ? relation : "—"}</b></div>
        </div>
        <span class="person-chevron">${icon("i-chevron")}</span>
      </button>`;
    }).join("");
    return `<div class="panel">
      <div class="panel-intro">
        <div><h2 class="panel-title">People</h2><p class="panel-sub">The people around you shape the story too.</p></div>
        <div class="year-chip">${partner ? (partner.role === "Spouse" ? "Married" : "Taken") : "Single"}</div>
      </div>
      <div class="section-head">${icon("i-heart")}<h3>Love life</h3></div>
      ${partnerCardHtml()}
      <div class="section-head">${icon("i-people")}<h3>Family & friends</h3><span class="spacer"></span><small>${family.length} people</small></div>
      <div class="stack">${familyHtml || `<div class="empty-card"><div class="empty-icon">🫂</div><div class="empty-title">No one here yet</div><div class="empty-text">Life is better with people in it.</div></div>`}</div>
      <div style="height:10px"></div>
    </div>`;
  }

  function openPerson(id) {
    const g = game;
    const p = g.relationships.find(r => r.id === id);
    if (!p) return;
    const relation = p.alive ? relBar(p.relation) : 0;
    const isPartner = p.id === g.partnerId;
    const isSpouse = p.role === "Spouse";
    const isParent = p.role === "Mother" || p.role === "Father";
    const isChild = p.role === "Child";
    const action = (key, emoji, title, desc, cost, btn, disabled, extraClass) => {
      const used = Boolean(g.yearActions[`person:${p.id}:${key}`]);
      const poor = cost && g.money < cost;
      return `<div class="action-card ${used ? "is-used" : ""}">
        <div class="action-icon ${extraClass || "tint-teal"}">${emoji}</div>
        <div class="action-main">
          <div class="action-title">${esc(title)}</div>
          <div class="action-desc">${esc(desc)}</div>
          <div class="action-meta">${cost ? `<span class="action-cost">${fmt(cost)}</span>` : `<span class="action-cost">Free</span>`}</div>
        </div>
        <button class="action-btn ${used ? "is-done" : ""}" data-person-action="${key}" data-person-id="${p.id}" ${used || poor || disabled ? "disabled" : ""}>${used ? "Done" : poor ? "Need" : btn}</button>
      </div>`;
    };
    let actions = "";
    if (p.alive) {
      actions += action("time", "☕", "Spend time together", "A little undivided attention goes a long way.", 0, "Visit", false, "tint-teal");
      actions += action("gift", "🎁", "Give a thoughtful gift", "Something small, chosen with care.", 60, "Give", false, "tint-coral");
      actions += action("advice", "💬", "Ask for advice", "They have seen a thing or two.", 0, "Ask", false, "tint-purple");
      if (isParent && g.age < 40) actions += action("borrow", "💸", "Ask for a little help", "It is awkward, but they are family.", 0, "Ask", false, "tint-gold");
      if (isChild && p.age < 18) {
        actions += action("story", "📖", "Read a story", "The voices make all the difference.", 0, "Read", false, "tint-blue");
        if (p.age >= 5) actions += action("homework", "✏️", "Help with homework", "Patience, snacks, and long division.", 0, "Help", false, "tint-teal");
      }
      if (isPartner) {
        actions += action("date", "🌹", "Plan a date night", "Put the phones away for an evening.", 50, "Plan", false, "tint-coral");
        if (!isSpouse && relation >= 60) actions += action("propose", "💍", "Propose", "A ring, a question, and a very big answer.", 500, "Ask", false, "tint-gold");
        if ((isSpouse || relation >= 55) && g.age >= 20 && g.age <= 45 && g.relationships.filter(r => r.role === "Child" && r.alive).length < 4) {
          actions += action("family", "🍼", "Start a family", "Talk about bringing a child into your life.", 400, "Talk", false, "tint-blue");
        }
        actions += action("breakup", "💔", isSpouse ? "Ask for a divorce" : "End the relationship", "Some conversations change everything.", 0, isSpouse ? "Divorce" : "End", false, "tint-coral");
      }
    }
    openModal(`${modalHeader({ emoji: p.emoji, kicker: p.alive ? p.role : "In memory", title: p.name })}
      <div class="person-sheet-head">
        <div class="person-sheet-avatar">${p.emoji}</div>
        <div style="flex:1;min-width:0">
          <div class="person-sheet-name">${esc(p.name)}</div>
          <div class="person-sheet-meta">${p.alive ? `${p.role} · Age ${p.age}` : `Passed away at ${p.age}`}</div>
          <div class="person-sheet-rel"><div class="progress"><i style="width:${relation}%;background:${relColor(relation)}"></i></div><b>${p.alive ? relation + "/100" : "Remembered"}</b></div>
        </div>
      </div>
      ${p.alive ? `<div class="person-actions">${actions}</div>` : `<p class="modal-text">Some people stay with us long after they are gone. You can still visit their memory.</p><div class="modal-actions"><button class="btn btn-primary" data-close>Remember them</button></div>`}
    `);
  }

  function assetsTab() {
    const g = game;
    const income = incomeOf(g);
    const expenses = currentExpenses(g);
    const worth = netWorth(g);
    const owned = g.assets.map(id => D.ASSETS.find(a => a.id === id)).filter(Boolean);
    const investDone = Boolean(g.yearActions.invested);
    const withdrawDone = Boolean(g.yearActions.withdrew);
    const ownedHtml = owned.length ? owned.map(a => `<div class="asset-card">
      <div class="asset-icon">${a.icon}</div>
      <div class="asset-name">${esc(a.name)}</div>
      <div class="asset-value">${fmt(a.price)} · ${fmt(a.upkeep)}/yr</div>
      <button class="action-btn" data-act="sell" data-id="${a.id}" style="background:var(--paper-2);color:var(--muted)">Sell for ${fmt(a.price * 0.62)}</button>
    </div>`).join("") : `<div class="empty-card" style="grid-column:1/-1"><div class="empty-icon">📦</div><div class="empty-title">Nothing yet</div><div class="empty-text">The first thing you buy for yourself always feels a little unreal.</div></div>`;
    const shopHtml = D.ASSETS.map(a => {
      const isOwned = g.assets.includes(a.id);
      const locked = g.age < (a.minAge || 0);
      const poor = g.money < a.price;
      const label = isOwned ? "Owned" : locked ? `Age ${a.minAge}+` : poor ? "Need" : "Buy";
      return `<div class="asset-card">
        <div class="asset-icon">${a.icon}</div>
        <div class="asset-name">${esc(a.name)}</div>
        <div class="asset-value">${fmt(a.price)}${a.upkeep ? " · " + fmt(a.upkeep) + "/yr" : ""}</div>
        <button class="action-btn ${isOwned ? "is-done" : ""}" data-act="buy" data-id="${a.id}" ${isOwned || locked || poor ? "disabled" : ""}>${label}</button>
      </div>`;
    }).join("");
    return `<div class="panel">
      <div class="panel-intro">
        <div><h2 class="panel-title">Assets</h2><p class="panel-sub">Build a life you can point to.</p></div>
        <div class="year-chip">Net ${fmt(worth, true)}</div>
      </div>
      <div class="money-hero">
        <div class="money-label">${icon("i-assets")} Cash on hand</div>
        <div class="money-value ${g.money < 0 ? "negative" : ""}">${fmt(g.money)}</div>
        <div class="money-sub">
          <div>Income<b class="pos">${income ? "+" + fmt(income, true) : "—"}</b></div>
          <div>Expenses<b class="neg">${expenses ? "-" + fmt(expenses, true) : "—"}</b></div>
          <div>Net worth<b>${fmt(worth, true)}</b></div>
        </div>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="kpi-label">Invested</div><div class="kpi-value">${fmt(g.investments, true)}</div></div>
        <div class="kpi"><div class="kpi-label">Loans</div><div class="kpi-value" style="color:${g.loans ? "var(--red)" : "inherit"}">${fmt(g.loans, true)}</div></div>
        <div class="kpi"><div class="kpi-label">Assets</div><div class="kpi-value">${g.assets.length}</div></div>
      </div>

      <div class="section-head">${icon("i-assets")}<h3>Invest</h3><span class="spacer"></span><small>grows yearly</small></div>
      <div class="action-card invest-card">
        <div class="action-icon tint-gold">📈</div>
        <div class="action-main">
          <div class="action-title">Index fund</div>
          <div class="action-desc">Slow and steady, with the usual ups and downs.</div>
          <div class="action-meta"><span class="effect ${g.investments ? "pos" : ""}">${fmt(g.investments)} invested</span><span class="effect">once a year</span></div>
        </div>
        <div class="invest-actions">
          <button class="action-btn alt" data-act="invest" data-amount="500" ${investDone || g.money < 500 ? "disabled" : ""}>${investDone ? "Done" : "+" + fmt(500)}</button>
          <button class="action-btn gold" data-act="invest" data-amount="2000" ${investDone || g.money < 2000 ? "disabled" : ""}>+${fmt(2000)}</button>
          <button class="action-btn" data-act="withdraw" ${!g.investments || withdrawDone ? "disabled" : ""} style="background:var(--paper-2);color:var(--muted)">${withdrawDone ? "Done" : "Withdraw"}</button>
        </div>
      </div>

      <div class="section-head">${icon("i-assets")}<h3>Your things</h3><span class="spacer"></span><small>${owned.length} owned</small></div>
      <div class="asset-grid">${ownedHtml}</div>

      <div class="section-head">${icon("i-plus")}<h3>Shop</h3><span class="spacer"></span><small>one of each</small></div>
      <div class="asset-grid">${shopHtml}</div>
      <div style="height:10px"></div>
    </div>`;
  }

  function eduStatusHtml() {
    const g = game;
    if (g.age < 18) {
      return `<div class="edu-card">
        <div class="edu-head"><div class="edu-icon">🎒</div><div style="flex:1"><div class="edu-title">School</div><div class="edu-sub">You're in school. Grades open doors later.</div></div></div>
        <div class="job-actions"><button class="action-btn alt" data-act="study" ${g.yearActions.studied ? "disabled" : ""}>${g.yearActions.studied ? "Studied this year" : "Study extra"}</button></div>
      </div>`;
    }
    if (g.education.program) {
      const program = D.EDUCATION.find(p => p.id === g.education.program);
      return `<div class="edu-card">
        <div class="edu-head"><div class="edu-icon">${program.icon}</div><div style="flex:1"><div class="edu-title">${esc(program.title)}</div><div class="edu-sub">${g.education.yearsLeft} year${g.education.yearsLeft === 1 ? "" : "s"} left · ${fmt(g.education.annualTuition)}/yr</div></div></div>
        <div class="progress blue" style="margin-top:10px"><i style="width:${Math.round(((program.years - g.education.yearsLeft) / program.years) * 100)}%"></i></div>
        <div class="job-actions"><button class="action-btn alt" data-act="study" ${g.yearActions.studied ? "disabled" : ""}>${g.yearActions.studied ? "Studied this year" : "Study extra"}</button></div>
      </div>`;
    }
    const options = D.EDUCATION.filter(p => {
      if (p.id === "grad") return g.education.level === "university";
      return g.education.level === "none" || g.education.level === "highschool";
    });
    const optHtml = options.map(p => {
      const poor = g.money < Math.round(p.tuition / p.years);
      return `<div class="edu-option">
        <div class="edu-option-main"><div class="edu-option-title">${p.icon} ${esc(p.title)}</div><div class="edu-option-desc">${p.years} year${p.years === 1 ? "" : "s"} · ${fmt(p.tuition)} total · ${esc(p.desc)}</div></div>
        <button class="action-btn alt" data-act="enroll" data-id="${p.id}" ${poor ? "" : ""}>Enroll</button>
      </div>`;
    }).join("");
    return `<div class="edu-card">
      <div class="edu-head"><div class="edu-icon">${g.education.level === "grad" ? "📜" : g.education.level === "university" ? "🎓" : g.education.level === "trade" ? "🔧" : "📘"}</div><div style="flex:1"><div class="edu-title">${esc(D.EDUCATION_LABELS[g.education.level] || "Education")}</div><div class="edu-sub">${g.education.level === "none" || g.education.level === "highschool" ? "There is still time to learn something new." : "You finished what you started."}</div></div></div>
      ${options.length ? `<div class="edu-options">${optHtml}</div>` : ""}
      <div class="job-actions"><button class="action-btn alt" data-act="study" ${g.yearActions.studied ? "disabled" : ""}>${g.yearActions.studied ? "Studied this year" : "Study something new"}</button></div>
    </div>`;
  }

  function careerTab() {
    const g = game;
    if (g.age >= 16 && !g.jobMarket.length && !g.flags.retired) refreshJobMarket();
    const eduRank = EDU_RANK[g.education.level] || 0;
    let jobHtml;
    if (g.job) {
      jobHtml = `<div class="job-hero">
        <div class="job-head">
          <div class="job-logo">${g.job.icon}</div>
          <div style="flex:1;min-width:0"><div class="job-title">${esc(g.job.title)}</div><div class="job-company">${esc(g.job.company)} · ${g.job.years} year${g.job.years === 1 ? "" : "s"}</div></div>
          <div class="job-pay"><b>${fmt(g.job.salary, true)}</b><small>per year</small></div>
        </div>
        <div class="progress-block">
          <div class="progress-label"><span>Performance</span><b>${Math.round(g.job.performance)}/100</b></div>
          <div class="progress ${g.job.performance < 40 ? "coral" : ""}"><i style="width:${clamp(g.job.performance, 0, 100)}%"></i></div>
        </div>
        <div class="job-actions">
          <button class="action-btn alt" data-act="work" ${g.yearActions.worked ? "disabled" : ""}>${g.yearActions.worked ? "Worked hard" : "Work harder"}</button>
          <button class="action-btn gold" data-act="raise" ${g.yearActions.raised ? "disabled" : ""}>${g.yearActions.raised ? "Asked" : "Ask for raise"}</button>
          ${g.age >= 60 ? `<button class="action-btn" data-act="retire">Retire</button>` : ""}
          <button class="action-btn danger" data-act="quit">Quit</button>
        </div>
      </div>`;
    } else {
      jobHtml = `<div class="empty-card"><div class="empty-icon">${g.flags.retired ? "🌅" : "🧭"}</div><div class="empty-title">${g.flags.retired ? "Retired" : "Between jobs"}</div><div class="empty-text">${g.flags.retired ? "You put in the years. The mornings are yours now." : "No paycheck right now. The job listings below are a place to start."}</div></div>`;
    }
    const listings = g.age < 16 ? "" : g.jobMarket.map((listing, index) => {
      const job = D.JOBS.find(j => j.id === listing.jobId);
      if (!job) return "";
      const reqEdu = EDU_RANK[job.education] || 0;
      const eduOk = eduRank >= reqEdu;
      const ageOk = g.age >= job.minAge;
      const smartOk = g.stats.smarts >= (job.smarts || 0);
      const looksOk = g.stats.looks >= (job.looks || 0);
      const meets = eduOk && ageOk && smartOk && looksOk;
      const applied = Boolean(g.yearActions.jobApplied);
      const reqBits = [];
      if (job.education !== "none") reqBits.push(`<span class="${eduOk ? "met" : "unmet"}">${D.EDUCATION_LABELS[job.education]}</span>`);
      if (job.minAge > 18) reqBits.push(`<span class="${ageOk ? "met" : "unmet"}">age ${job.minAge}+</span>`);
      if (job.smarts) reqBits.push(`<span class="${smartOk ? "met" : "unmet"}">${job.smarts} smarts</span>`);
      if (job.looks) reqBits.push(`<span class="${looksOk ? "met" : "unmet"}">${job.looks} looks</span>`);
      return `<div class="job-listing">
        <div class="job-listing-top">
          <div class="job-logo">${job.icon}</div>
          <div style="flex:1;min-width:0"><div class="job-title">${esc(job.title)}</div><div class="job-company">${esc(listing.company)}</div></div>
          <div class="job-pay"><b>${fmt(listing.salary, true)}</b><small>per year</small></div>
        </div>
        <div class="job-listing-bottom">
          <div class="job-req">${reqBits.length ? reqBits.join(" · ") : `<span class="met">No experience needed</span>`}</div>
          <button class="action-btn ${meets ? "alt" : ""}" data-act="apply" data-index="${index}" ${!meets || applied ? "disabled" : ""}>${applied ? "Applied" : meets ? "Apply" : "Locked"}</button>
        </div>
      </div>`;
    }).join("");
    return `<div class="panel">
      <div class="panel-intro">
        <div><h2 class="panel-title">Career</h2><p class="panel-sub">Work, study, and build something that lasts.</p></div>
        <div class="year-chip">${g.job ? "Employed" : g.flags.retired ? "Retired" : "Open"}</div>
      </div>
      ${jobHtml}
      <div class="section-head">${icon("i-book")}<h3>Education</h3><span class="spacer"></span><small>${esc(D.EDUCATION_LABELS[g.education.level] || "")}</small></div>
      ${eduStatusHtml()}
      ${g.loans ? `<div class="notice" style="margin-top:9px">${icon("i-info")}<span>You owe ${fmt(g.loans)} in student loans. Payments come out of your yearly income.</span></div>` : ""}
      ${g.age >= 16 && !g.flags.retired ? `<div class="section-head">${icon("i-briefcase")}<h3>Job openings</h3><span class="spacer"></span><small>one application a year</small></div><div class="stack">${listings || `<div class="empty-card"><div class="empty-icon">🗞️</div><div class="empty-title">No listings right now</div><div class="empty-text">Check again after your next birthday.</div></div>`}</div>` : ""}
      ${g.age < 16 ? `<div class="notice" style="margin-top:10px">${icon("i-info")}<span>You can start applying for jobs at 16. For now, school is your job.</span></div>` : ""}
      <div style="height:10px"></div>
    </div>`;
  }

  function openSettings() {
    openModal(`${modalHeader({ emoji: "⚙️", kicker: "LifeHappens", title: "Settings" })}
      <div class="settings-list">
        <button class="settings-row" data-settings="sound">
          <div class="action-icon tint-teal">🔊</div>
          <div class="settings-row-main"><div class="settings-row-title">Sound</div><div class="settings-row-desc">Small taps and good news.</div></div>
          <span class="toggle ${meta.settings.sound ? "is-on" : ""}"></span>
        </button>
        <button class="settings-row" data-settings="haptics">
          <div class="action-icon tint-purple">📳</div>
          <div class="settings-row-main"><div class="settings-row-title">Haptics</div><div class="settings-row-desc">A little buzz on big moments.</div></div>
          <span class="toggle ${meta.settings.haptics ? "is-on" : ""}"></span>
        </button>
        <button class="settings-row" data-settings="achievements">
          <div class="action-icon tint-gold">🏆</div>
          <div class="settings-row-main"><div class="settings-row-title">Achievements</div><div class="settings-row-desc">${meta.unlocked.length} of ${D.ACHIEVEMENTS.length} unlocked.</div></div>
          <span class="person-chevron">${icon("i-chevron")}</span>
        </button>
        <button class="settings-row" data-settings="howto">
          <div class="action-icon tint-blue">📖</div>
          <div class="settings-row-main"><div class="settings-row-title">How to play</div><div class="settings-row-desc">A quick guide to your new life.</div></div>
          <span class="person-chevron">${icon("i-chevron")}</span>
        </button>
        <button class="settings-row" data-settings="menu">
          <div class="action-icon tint-coral">🏠</div>
          <div class="settings-row-main"><div class="settings-row-title">Save & main menu</div><div class="settings-row-desc">Come back whenever you're ready.</div></div>
          <span class="person-chevron">${icon("i-chevron")}</span>
        </button>
        <button class="settings-row" data-settings="restart">
          <div class="action-icon tint-coral">🌱</div>
          <div class="settings-row-main"><div class="settings-row-title">Start a new life</div><div class="settings-row-desc">Your current life will be replaced.</div></div>
          <span class="person-chevron">${icon("i-chevron")}</span>
        </button>
      </div>
      <div class="modal-note">LifeHappens · v2 · Autosaved on this device</div>`);
  }

  function openAchievements() {
    const list = D.ACHIEVEMENTS.map(a => {
      const unlocked = meta.unlocked.includes(a.id);
      return `<div class="achievement ${unlocked ? "" : "is-locked"}">
        <div class="achievement-icon">${unlocked ? a.icon : "🔒"}</div>
        <div style="flex:1"><div class="achievement-name">${esc(a.name)}</div><div class="achievement-desc">${esc(a.desc)}</div></div>
        ${unlocked ? `<span class="achievement-check">${icon("i-check")}</span>` : ""}
      </div>`;
    }).join("");
    openModal(`${modalHeader({ emoji: "🏆", kicker: "Collected across lives", title: "Achievements" })}
      <p class="modal-subtext">${meta.unlocked.length} of ${D.ACHIEVEMENTS.length} unlocked. Achievements stay with you across every life.</p>
      <div class="achievement-list">${list}</div>
      <div class="modal-actions"><button class="btn btn-primary" data-close>Back</button></div>`);
  }

  function openHowTo() {
    openModal(`${modalHeader({ emoji: "📖", kicker: "The basics", title: "How to live" })}
      <p class="modal-text">LifeHappens is a life, one year at a time. There is no winning and no losing — just the story you make.</p>
      <div class="achievement-list">
        <div class="achievement"><div class="achievement-icon">⏭️</div><div><div class="achievement-name">Age up</div><div class="achievement-desc">Tap the big button to live another year. Birthdays bring changes, money, and surprises.</div></div></div>
        <div class="achievement"><div class="achievement-icon">🔀</div><div><div class="achievement-name">Make choices</div><div class="achievement-desc">When a moment appears, pick a path. The results are permanent.</div></div></div>
        <div class="achievement"><div class="achievement-icon">🧭</div><div><div class="achievement-name">Use your tabs</div><div class="achievement-desc">Activities shape your stats, People shape your relationships, Assets build your wealth, and Career moves your life forward.</div></div></div>
        <div class="achievement"><div class="achievement-icon">💾</div><div><div class="achievement-name">It saves itself</div><div class="achievement-desc">Every choice is saved on this device. Come back anytime.</div></div></div>
      </div>
      <div class="modal-actions"><button class="btn btn-primary" data-close>Got it</button></div>`);
  }

  function openProfile() {
    if (!game) return;
    const g = game;
    const partner = getPartner(g);
    const children = g.relationships.filter(r => r.role === "Child" && r.alive).length;
    openModal(`${modalHeader({ emoji: computeAvatar(g), kicker: "Your life so far", title: fullName(g) })}
      <div class="person-sheet-head">
        <div class="person-sheet-avatar">${computeAvatar(g)}</div>
        <div style="flex:1;min-width:0">
          <div class="person-sheet-name">Age ${g.age} · ${stageFor(g.age).name}</div>
          <div class="person-sheet-meta">${esc(g.person.city)}, ${esc(countryOf(g).name)}</div>
          <div class="person-sheet-meta">${esc(D.EDUCATION_LABELS[g.education.level] || "No diploma")}${g.job ? " · " + esc(g.job.title) : ""}</div>
        </div>
      </div>
      <div class="kpi-grid" style="margin-top:9px">
        <div class="kpi"><div class="kpi-label">Net worth</div><div class="kpi-value">${fmt(netWorth(g), true)}</div></div>
        <div class="kpi"><div class="kpi-label">Trophies</div><div class="kpi-value">${g.achievements.length}</div></div>
        <div class="kpi"><div class="kpi-label">Family</div><div class="kpi-value">${children} kid${children === 1 ? "" : "s"}</div></div>
      </div>
      <p class="modal-subtext" style="margin-top:10px">${partner ? `With ${esc(partner.name)}. ` : "Single. "}${g.flags.independent ? "Living on your own." : "Still close to home."}</p>
      <div class="modal-actions">
        <button class="btn btn-secondary" data-settings="achievements" style="background:var(--card);color:var(--ink);border-color:var(--line)">View achievements</button>
        <button class="btn btn-primary" data-close>Back to life</button>
      </div>`);
  }

  function showEventModal() {
    if (!game || !game.pendingEvent) return;
    const event = D.LIFE_EVENTS.find(e => e.id === game.pendingEvent);
    if (!event) { game.pendingEvent = null; saveGame(); renderGame(); return; }
    const choices = event.choices.map((choice, index) => {
      const bits = [];
      if (choice.effects && choice.effects.money < 0) bits.push(`Costs ${fmt(Math.abs(choice.effects.money))}`);
      if (choice.risk) bits.push(`Risky · ${Math.round(choice.risk.chance * 100)}% chance`);
      if (choice.effects && choice.effects.independence) bits.push("Move out");
      return `<button class="choice-btn ${choice.risk ? "risk" : ""}" data-choice="${index}">
        <span class="choice-num">${index + 1}</span>
        <span class="choice-main"><span class="choice-label">${esc(choice.label)}</span>${bits.length ? `<span class="choice-hint">${esc(bits.join(" · "))}</span>` : ""}</span>
        ${icon("i-chevron")}
      </button>`;
    }).join("");
    openModal(`${modalHeader({ emoji: event.icon, kicker: "A moment in your life", title: event.title, close: false })}
      <p class="modal-text">${esc(event.text)}</p>
      <div class="modal-choices">${choices}</div>
      <div class="modal-note">Your choice cannot be undone.</div>`, { dismissible: false });
  }

  function renderDeath() {
    const g = game;
    if (!g || !g.death) return;
    const death = g.death;
    const trophies = g.achievements.map(id => D.ACHIEVEMENTS.find(a => a.id === id)).filter(Boolean);
    const trophyHtml = trophies.length ? trophies.slice(0, 8).map(a => `<span class="death-trophy"><span>${a.icon}</span>${esc(a.name)}</span>`).join("") : `<span class="death-trophy">A life lived quietly</span>`;
    $("screen-death").innerHTML = `<div class="death-hero">
        <div class="death-kicker">The end of a chapter</div>
        <div class="death-avatar">${computeAvatar(g)}</div>
        <div class="death-name">${esc(fullName(g))}</div>
        <div class="death-years">${g.age} years · ${esc(countryOf(g).name)}</div>
      </div>
      <div class="death-summary">
        <div class="death-stats">
          <div class="death-stat"><b>${g.age}</b><span>Years</span></div>
          <div class="death-stat"><b>${fmt(netWorth(g), true)}</b><span>Net worth</span></div>
          <div class="death-stat"><b>${trophies.length}</b><span>Trophies</span></div>
        </div>
        <p class="death-quote">“${esc(death.quote)}”</p>
      </div>
      <div class="death-section-title">A few things you collected</div>
      <div class="death-trophies">${trophyHtml}</div>
      <div class="death-actions">
        <button class="btn btn-primary" data-death="new">Start another life</button>
        <button class="btn btn-secondary" data-death="menu">Main menu</button>
      </div>
      <div class="death-small">${esc(death.cause)} · LifeHappens</div>`;
  }

  function switchTab(tab) {
    if (!game || activeTab === tab) return;
    activeTab = tab;
    document.querySelectorAll("#bottom-nav button").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.tab === tab);
    });
    renderTab({ scroll: tab === "life" ? "bottom" : "top" });
    soundTap();
    haptic(8);
  }

  function changeStat(key, amount) {
    if (!game || !amount) return;
    game.stats[key] = clamp(game.stats[key] + amount, 0, 100);
  }

  function adjustRelationships(roles, amount) {
    if (!game || !amount) return;
    for (const person of game.relationships) {
      if (person.alive && roles.includes(person.role)) {
        person.relation = clamp(person.relation + amount, 0, 100);
      }
    }
  }

  function createPartnerCandidate() {
    const g = game;
    const gender = pick(["Female", "Male"]);
    const name = `${randomFirst(gender, g.person.country)} ${randomLast(g.person.country)}`;
    const partner = makeRelationship({
      id: newId("partner"),
      name,
      role: "Partner",
      emoji: gender === "Female" ? "👩" : "👨",
      age: clamp(g.age + randInt(-3, 3), 18, 95),
      relation: randInt(54, 68),
      gender,
      trait: pick(PARTNER_TRAITS)
    });
    g.relationships.push(partner);
    g.partnerId = partner.id;
    addLog(g, `You met ${partner.name}. They were ${partner.trait}, and the conversation did not feel like work.`, "love", "💞");
    unlockAchievement("in_love");
    return partner;
  }

  function mergeEffects(base, extra) {
    const out = Object.assign({}, base || {});
    if (!extra) return out;
    for (const [key, value] of Object.entries(extra)) {
      if (key === "jobBoost") out[key] = (out[key] || 1) * value;
      else if (typeof value === "number" && typeof out[key] === "number") out[key] += value;
      else out[key] = value;
    }
    return out;
  }

  function applyEffects(effects) {
    const g = game;
    const notes = [];
    if (!g || !effects) return { chips: [], notes };
    for (const key of STAT_KEYS) {
      if (typeof effects[key] === "number") changeStat(key, effects[key]);
    }
    if (effects.money) g.money += effects.money;
    if (effects.performance && g.job) g.job.performance = clamp(g.job.performance + effects.performance, 0, 100);
    if (effects.family) adjustRelationships(["Mother", "Father", "Sister", "Brother", "Child"], effects.family);
    if (effects.partner) adjustRelationships(["Partner", "Spouse"], effects.partner);
    if (effects.social) {
      adjustRelationships(["Friend"], effects.social);
      if (effects.social > 0 && !hasFriend(g)) {
        const name = `${pick(FRIEND_FIRST)} ${randomLast(g.person.country)}`;
        const friend = makeRelationship({
          id: newId("friend"), name, role: "Friend", emoji: "🧑", age: clamp(g.age + randInt(-2, 2), 5, 100),
          relation: 45 + effects.social, gender: pick(["Female", "Male"]), trait: pick(PARTNER_TRAITS)
        });
        g.relationships.push(friend);
        notes.push(`You made a new friend, ${friend.name}.`);
      }
    }
    if (effects.independence) g.flags.independent = true;
    if (effects.retire) {
      g.job = null;
      g.salary = 0;
      g.flags.retired = true;
      notes.push("You retired. The mornings belong to you now.");
    }
    if (effects.quitJob) {
      g.job = null;
      g.salary = 0;
      g.jobMarket = [];
      notes.push("You left your job behind.");
    }
    if (effects.jobBoost && g.job) {
      g.job.salary = Math.round(g.job.salary * effects.jobBoost);
      g.salary = g.job.salary;
    }
    if (effects.removeAsset) {
      g.assets = g.assets.filter(id => id !== effects.removeAsset);
    }
    if (effects.meet && !getPartner(g)) {
      if (chance(effects.meet)) {
        createPartnerCandidate();
      } else {
        notes.push("The connection did not go anywhere. It happens.");
      }
    }
    if (effects.license) g.flags.license = true;
    const chips = makeChips(effects).filter(c => c.text !== "New connection" || getPartner(g));
    checkAchievements();
    return { chips, notes };
  }

  function eventTypeFor(effects) {
    if (!effects) return "life";
    if (effects.jobBoost || effects.performance || effects.retire || effects.quitJob) return "career";
    if (effects.partner || effects.family || effects.meet) return "love";
    if (effects.health || effects.health === 0) return "health";
    if (effects.money) return effects.money > 0 ? "money" : "bad";
    return "life";
  }

  function resolveEvent(index) {
    const g = game;
    if (!g || !g.pendingEvent) return;
    const event = D.LIFE_EVENTS.find(e => e.id === g.pendingEvent);
    if (!event) { g.pendingEvent = null; saveGame(); renderGame(); return; }
    const choice = event.choices[index];
    if (!choice) return;
    let effects = Object.assign({}, choice.effects || {});
    let outcome = typeof choice.result === "function" ? choice.result(g) : choice.result;
    if (choice.risk) {
      const won = chance(choice.risk.chance);
      const branch = won ? choice.risk.win : choice.risk.lose;
      effects = mergeEffects(effects, branch || {});
      outcome = (won ? choice.risk.winText : choice.risk.loseText) || outcome;
    }
    const applied = applyEffects(effects);
    const chips = applied.chips;
    g.firedEvents.push(event.id);
    g.lastEventAge = g.age;
    g.pendingEvent = null;
    const type = eventTypeFor(effects);
    addLog(g, outcome, type, event.icon, chips);
    for (const note of applied.notes) addLog(g, note, "life", "✨");
    saveGame();
    renderGame({ scroll: "bottom" });
    const died = checkDeath();
    if (died) {
      saveGame();
      showResultModal(event.title, outcome, chips, () => {
        renderDeath();
        showScreen("screen-death");
      }, event.icon);
    } else {
      showResultModal(event.title, outcome, chips, null, event.icon);
      if ((effects.happiness || 0) + (effects.money || 0) + (effects.health || 0) > 8) soundGood();
    }
  }

  function pickEvent() {
    const g = game;
    const eligible = D.LIFE_EVENTS.filter(e => {
      if (g.firedEvents.includes(e.id)) return false;
      if (g.age < e.minAge || g.age > e.maxAge) return false;
      if (e.when && !e.when(g)) return false;
      return true;
    });
    if (!eligible.length) return null;
    const force = g.age - g.lastEventAge >= 2;
    if (!force && !chance(0.64)) return null;
    const weighted = [];
    for (const e of eligible) {
      const weight = e.minAge >= 60 ? 2 : 1;
      for (let i = 0; i < weight; i++) weighted.push(e);
    }
    return pick(weighted);
  }

  function processEducationYear(g) {
    const result = { paid: 0, loan: 0, graduated: false };
    if (!g.education.program) return result;
    g.education.yearsLeft -= 1;
    if (g.education.yearsLeft <= 0) {
      const program = D.EDUCATION.find(p => p.id === g.education.program);
      g.education.level = g.education.target || (program ? program.level : "highschool");
      g.education.program = null;
      g.education.annualTuition = 0;
      g.education.yearsLeft = 0;
      g.education.target = null;
      g.stats.happiness = clamp(g.stats.happiness + 7, 0, 100);
      g.stats.smarts = clamp(g.stats.smarts + 5, 0, 100);
      result.graduated = true;
      addLog(g, `You graduated from ${program ? program.title : "your program"}. The diploma was heavier than it looked.`, "school", "🎓", [{ text: "Smarts +5", kind: "pos" }, { text: "Happiness +7", kind: "pos" }]);
      unlockAchievement("graduate");
      refreshJobMarket();
      return result;
    }
    const due = g.education.annualTuition || 0;
    if (due > 0) {
      if (g.money >= due) {
        g.money -= due;
        result.paid = due;
        addLog(g, `You paid ${fmt(due)} in tuition for another year.`, "school", "💳", [{ text: `-${fmt(due)}`, kind: "neg" }]);
      } else {
        const covered = Math.max(0, g.money);
        const shortfall = due - covered;
        g.money = 0;
        g.loans += shortfall;
        result.paid = due;
        result.loan = shortfall;
        addLog(g, `Tuition was ${fmt(due)}. You covered what you could and added ${fmt(shortfall)} to your student loans.`, "school", "🎓", [{ text: `Loans +${fmt(shortfall)}`, kind: "neg" }]);
      }
    }
    return result;
  }

  function processInvestments(g) {
    if (!g.investments || g.investments <= 0) return;
    const rate = 0.055 + rand(-0.14, 0.15);
    const before = g.investments;
    g.investments = Math.max(0, Math.round(g.investments * (1 + rate)));
    const gain = g.investments - before;
    if (Math.abs(gain) >= 180) {
      addLog(g, gain >= 0
        ? `Your investments grew by ${fmt(gain)}. Slow money is still money.`
        : `Your investments dipped by ${fmt(Math.abs(gain))}. You tried not to check the app.`, "money", "📈",
        [{ text: (gain >= 0 ? "+" : "-") + fmt(Math.abs(gain)), kind: gain >= 0 ? "money" : "neg" }]);
    }
  }

  function processStats(g) {
    let healthLoss = 0.35;
    if (g.age > 30) healthLoss += (g.age - 30) * 0.027;
    if (g.age > 65) healthLoss += (g.age - 65) * 0.025;
    if (g.stats.happiness < 35) healthLoss += 0.7;
    if (g.stats.happiness > 72) healthLoss -= 0.25;
    g.stats.health = clamp(g.stats.health - healthLoss + rand(-0.2, 0.3), 0, 100);
    if (g.age > 32) g.stats.looks = clamp(g.stats.looks - (0.35 + (g.age - 32) * 0.012), 0, 100);
    if (g.age > 62) g.stats.smarts = clamp(g.stats.smarts - 0.18, 0, 100);
    g.stats.happiness = clamp(g.stats.happiness + (55 - g.stats.happiness) * 0.025 + rand(-2.2, 2.2), 0, 100);
    if (g.money < 0) g.stats.happiness = clamp(g.stats.happiness - 2, 0, 100);
    if (getPartner(g)) g.stats.happiness = clamp(g.stats.happiness + 0.5, 0, 100);
  }

  function processRelationships(g) {
    for (const person of g.relationships) person.age += 1;
    for (const person of g.relationships) {
      if (!person.alive) continue;
      if (person.role === "Mother" || person.role === "Father") {
        const p = Math.max(0, (person.age - 66) * 0.006);
        if (chance(p)) {
          person.alive = false;
          g.stats.happiness = clamp(g.stats.happiness - 17, 0, 100);
          g.stats.health = clamp(g.stats.health - 2, 0, 100);
          g.money -= 1800;
          addLog(g, `${person.name} passed away at ${person.age}. The house felt much quieter after that.`, "bad", "🕊️", [{ text: "Happiness -17", kind: "neg" }, { text: "-" + fmt(1800), kind: "neg" }]);
        }
      }
    }
    for (const person of g.relationships) {
      if (!person.alive) continue;
      if (person.role === "Partner" || person.role === "Spouse") {
        const p = Math.max(0, (person.age - 70) * 0.009);
        if (chance(p)) {
          person.alive = false;
          person.role = "Late " + person.role;
          g.partnerId = null;
          g.flags.married = false;
          g.stats.happiness = clamp(g.stats.happiness - 22, 0, 100);
          addLog(g, `${person.name} passed away at ${person.age}. You kept their things exactly where they were.`, "bad", "🕯️", [{ text: "Happiness -22", kind: "neg" }]);
          continue;
        }
      }
      let drift = -0.45;
      if (person.role === "Partner" || person.role === "Spouse") drift = -1.1;
      if (person.role === "Friend") drift = -0.75;
      if (person.role === "Child") drift = -0.2;
      person.relation = clamp(person.relation + drift, 0, 100);
    }
    const partner = getPartner(g);
    if (partner && !g.flags.married && partner.relation < 18 && chance(0.3)) {
      partner.role = "Ex";
      g.partnerId = null;
      g.stats.happiness = clamp(g.stats.happiness - 9, 0, 100);
      addLog(g, `${partner.name} ended things. It was not a fight, which somehow made it worse.`, "bad", "💔", [{ text: "Happiness -9", kind: "neg" }]);
    }
    if ((g.age === 7 || g.age === 13) && !hasFriend(g)) {
      const name = `${pick(FRIEND_FIRST)} ${randomLast(g.person.country)}`;
      const friend = makeRelationship({
        id: newId("friend"), name, role: "Friend", emoji: "🧑", age: clamp(g.age + randInt(-1, 1), 5, 100),
        relation: randInt(62, 82), gender: pick(["Female", "Male"]), trait: pick(PARTNER_TRAITS)
      });
      g.relationships.push(friend);
      addLog(g, `You became friends with ${name}. You spent the whole summer trading secrets and snacks.`, "love", "🫂");
    }
  }

  function promoteJob(g) {
    if (!g.job) return;
    g.job.performance = clamp(g.job.performance + 8, 0, 100);
    if (!g.job.title.startsWith("Senior ") && !g.job.title.startsWith("Lead ")) g.job.title = "Senior " + g.job.title;
    else if (!g.job.title.startsWith("Lead ")) g.job.title = "Lead " + g.job.title.replace(/^Senior /, "");
    g.job.salary = Math.round(g.job.salary * 1.14);
    g.salary = g.job.salary;
    g.stats.happiness = clamp(g.stats.happiness + 6, 0, 100);
    addLog(g, `You were promoted to ${g.job.title} at ${g.job.company}. Your salary went up to ${fmt(g.job.salary)}.`, "career", "📈", [{ text: "Salary up", kind: "money" }, { text: "Happiness +6", kind: "pos" }]);
  }

  function processJob(g) {
    if (!g.job) return;
    g.job.years += 1;
    g.job.performance = clamp(g.job.performance - 4 + rand(-3, 3), 0, 100);
    if (g.job.performance < 15 && chance(0.24)) {
      addLog(g, `You were let go from ${g.job.company}. The meeting was short and the walk home was long.`, "bad", "📦", [{ text: "Happiness -9", kind: "neg" }]);
      g.stats.happiness = clamp(g.stats.happiness - 9, 0, 100);
      g.job = null;
      g.salary = 0;
      g.jobMarket = [];
      return;
    }
    if (g.job.years >= 2 && g.job.performance >= 76 && chance(0.3)) promoteJob(g);
  }

  function ageUp() {
    if (!game || !game.alive || game.pendingEvent) return;
    const g = game;
    soundAge();
    haptic(16);
    g.age += 1;
    g.yearActions = {};
    g.stats.happiness = clamp(g.stats.happiness + 0.4, 0, 100);
    if (g.age >= 5 && g.age <= 17) g.money += 150;
    if (g.age === 18) {
      if (g.education.level === "none" && !g.education.program) g.education.level = "highschool";
      const gift = g.relationships.filter(r => (r.role === "Mother" || r.role === "Father") && r.alive).reduce((max, r) => Math.max(max, r.relation), 0) > 55 ? 1000 : 250;
      g.money += gift;
      addLog(g, `You turned 18. Your parents gave you ${fmt(gift)} and a very long hug.`, "milestone", "🎓", [{ text: "+" + fmt(gift), kind: "money" }]);
      unlockAchievement("student");
    }

    const income = incomeOf(g);
    if (income) g.money += income;
    processInvestments(g);
    const eduResult = processEducationYear(g);
    const living = livingCosts(g);
    const loanPay = loanPayment(g);
    const expenses = living + loanPay;
    g.money -= expenses;
    if (loanPay) g.loans = Math.max(0, g.loans - loanPay);
    g.expenses = expenses + eduResult.paid;
    g.salary = g.job ? g.job.salary : 0;

    if (g.age >= 18 && (income || expenses)) {
      const chips = [];
      if (income) chips.push({ text: "+" + fmt(income), kind: "money" });
      if (g.expenses) chips.push({ text: "-" + fmt(g.expenses), kind: "neg" });
      addLog(g, income
        ? `You earned ${fmt(income)} this year and paid ${fmt(g.expenses)} in bills, living costs, and debt.`
        : `No paycheck this year. Bills and living costs came to ${fmt(g.expenses)}.`, "money", income ? "💰" : "🧾", chips);
    }
    if (g.money < 0) {
      g.stats.happiness = clamp(g.stats.happiness - 3, 0, 100);
      addLog(g, "You went into the red. The bank sent a very polite but very serious letter.", "bad", "🏦", [{ text: "Happiness -3", kind: "neg" }]);
    }
    if (g.loans > 0 && loanPay > 0) {
      addLog(g, `You paid ${fmt(loanPay)} toward your student loans. You still owe ${fmt(g.loans)}.`, "money", "🎓", [{ text: "-" + fmt(loanPay), kind: "neg" }]);
    }

    processRelationships(g);
    processStats(g);
    processJob(g);

    const milestone = D.MILESTONES[g.age];
    if (milestone) addLog(g, milestone.text, "milestone", milestone.icon);
    if (g.age === 5) { g.flags.school = true; unlockAchievement("student"); }
    if (g.age === 16) g.flags.license = true;

    const flavorPool = g.age < 13 ? D.FLAVOR.child : g.age < 20 ? D.FLAVOR.teen : g.age < 60 ? D.FLAVOR.adult : D.FLAVOR.senior;
    if (!milestone || chance(0.55)) addLog(g, pick(flavorPool), "life", g.age < 13 ? "🧸" : g.age < 20 ? "🎧" : g.age < 60 ? "🌤️" : "🍂");

    if (g.age >= 16) refreshJobMarket();
    checkAchievements();

    const died = checkDeath();
    if (died) {
      saveGame();
      renderDeath();
      showScreen("screen-death");
      return;
    }

    const event = pickEvent();
    if (event) {
      g.pendingEvent = event.id;
      addLog(g, "A moment is waiting for your answer.", "life", "⏳");
    }
    saveGame();
    renderGame({ scroll: "bottom" });
    if (event) window.setTimeout(showEventModal, 300);
  }

  function unlockAchievement(id) {
    if (!game || game.achievements.includes(id)) return false;
    const ach = D.ACHIEVEMENTS.find(a => a.id === id);
    if (!ach) return false;
    game.achievements.push(id);
    if (!meta.unlocked.includes(id)) {
      meta.unlocked.push(id);
      saveMeta();
    }
    showToast(`Achievement unlocked: ${ach.name}`, "trophy");
    confettiBurst(18);
    soundGood();
    return true;
  }

  function checkAchievements() {
    if (!game) return;
    const g = game;
    if (g.age >= 1) unlockAchievement("first_steps");
    if (g.age >= 5 || g.flags.school) unlockAchievement("student");
    if (g.education.level === "trade" || g.education.level === "university" || g.education.level === "grad") unlockAchievement("graduate");
    if (g.job) unlockAchievement("first_job");
    if (g.flags.independent) unlockAchievement("independent");
    if (getPartner(g)) unlockAchievement("in_love");
    if (g.flags.married || (getPartner(g) && getPartner(g).role === "Spouse")) unlockAchievement("married");
    if (g.relationships.some(r => r.role === "Child")) unlockAchievement("parent");
    if (g.assets.includes("condo") || g.assets.includes("house")) unlockAchievement("homeowner");
    if (g.assets.includes("car")) unlockAchievement("wheels");
    if (g.job && g.job.salary >= 100000) unlockAchievement("six_figures");
    if (netWorth(g) >= 1000000) unlockAchievement("millionaire");
    if (g.stats.health >= 95) unlockAchievement("healthy");
    if (g.stats.smarts >= 95) unlockAchievement("genius");
    if (g.relationships.some(r => r.alive && r.relation >= 95)) unlockAchievement("popular");
    if (g.age >= 80) unlockAchievement("eighty");
    if (g.age >= 100) unlockAchievement("centenarian");
    if (g.flags.retired) unlockAchievement("retired");
  }

  function checkDeath() {
    if (!game) return false;
    const g = game;
    if (!g.alive) return true;
    let cause = null;
    if (g.stats.health <= 0) cause = "health complications";
    else if (g.age >= 100) cause = "old age";
    else if (g.age >= 55) {
      const p = Math.pow((g.age - 50) / 55, 2) * 0.18 + (100 - g.stats.health) * 0.0015 + (g.age > 85 ? 0.1 : 0);
      if (chance(p)) cause = g.stats.health < 35 ? "health complications" : "old age";
    }
    if (!cause) return false;
    die(cause);
    return true;
  }

  function die(cause) {
    const g = game;
    if (!g || !g.alive) return;
    g.alive = false;
    g.phase = "dead";
    g.pendingEvent = null;
    const children = g.relationships.filter(r => r.role === "Child" && r.alive).length;
    let quote = "A life, in all its ordinary and extraordinary moments.";
    if (g.age >= 100) quote = "A century of mornings, arguments, small wins, and second chances. You used the time well.";
    else if (g.achievements.length >= 12) quote = "You collected a life full of stories. The kind people retell long after the room goes quiet.";
    else if (getPartner(g)) quote = "Love was the throughline. Everything else was weather.";
    else if (children >= 2) quote = "You made a family, and the family made a world.";
    else if (netWorth(g) > 500000) quote = "You built something that outlasted the noise. And you learned it was never only about the money.";
    else if (g.age >= 80) quote = "The years went quickly. The small things were the ones that stayed.";
    g.death = { age: g.age, cause, quote, at: Date.now() };
    addLog(g, `At ${g.age}, ${fullName(g)} died of ${cause}. The story ends here — but what a story.`, "bad", "🕯️");
    meta.lives.unshift({
      name: fullName(g), age: g.age, cause, netWorth: netWorth(g),
      achievements: g.achievements.length, country: countryOf(g).name, at: Date.now()
    });
    meta.lives = meta.lives.slice(0, 24);
    saveMeta();
    saveGame();
  }

  function refreshJobMarket() {
    const g = game;
    if (!g) return;
    if (g.age < 16) { g.jobMarket = []; return; }
    const eligible = D.JOBS.filter(j => j.minAge <= g.age + 2);
    const pool = eligible.slice();
    const chosen = [];
    while (chosen.length < 5 && pool.length) {
      const index = randInt(0, pool.length - 1);
      chosen.push(pool.splice(index, 1)[0]);
    }
    const all = D.JOBS.filter(j => !chosen.includes(j));
    while (chosen.length < 5 && all.length) {
      chosen.push(all.splice(randInt(0, all.length - 1), 1)[0]);
    }
    g.jobMarket = chosen.map(job => ({
      jobId: job.id,
      company: pick(job.companies),
      salary: Math.round(job.salary * rand(0.93, 1.12) / 100) * 100
    }));
  }

  function doActivity(id) {
    const g = game;
    const activity = D.ACTIVITIES.find(a => a.id === id);
    if (!g || !activity) return;
    if (g.yearActions["act:" + id]) return;
    if (g.money < (activity.cost || 0)) { showToast("Not enough money for that right now.", "bad"); return; }
    g.yearActions["act:" + id] = true;
    g.money -= activity.cost || 0;
    let chips = [];
    let text = "";
    if (id === "lottery") {
      const roll = Math.random();
      let prize = 0;
      if (roll < 0.015) prize = 5000;
      else if (roll < 0.09) prize = 100;
      else if (roll < 0.22) prize = 10;
      if (prize) {
        g.money += prize;
        chips.push({ text: "+" + fmt(prize), kind: "money" });
        text = prize >= 5000 ? "The last square matched. You stared at the ticket for a full minute before believing it." : `You won ${fmt(prize)}. Not life-changing, but a very good day.`;
        soundGood();
      } else {
        chips.push({ text: "-" + fmt(activity.cost), kind: "neg" });
        text = "You scratched off the ticket. Nothing. The bin outside was full of the same story.";
      }
    } else if (id === "casino") {
      const roll = Math.random();
      if (roll < 0.27) {
        g.money += 300;
        chips.push({ text: "+" + fmt(300), kind: "money" });
        text = "You doubled your money and wisely walked away. The lights made it harder than it sounds.";
        soundGood();
      } else if (roll < 0.34) {
        g.money += 600;
        chips.push({ text: "+" + fmt(600), kind: "money" });
        text = "The machine lit up. You cashed out before the house could change its mind.";
        soundGood();
      } else {
        chips.push({ text: "-" + fmt(activity.cost), kind: "neg" });
        text = "The house won. You told yourself it was entertainment, not a loss.";
      }
    } else {
      const applied = applyEffects(activity.effects || {});
      chips = applied.chips;
      const lines = {
        park: "You spent the afternoon outside. You came home with grass stains and a very good mood.",
        storytime: "Someone read to you and did all the voices. You asked for one more chapter.",
        walk: "You went for a walk with no destination. The fresh air did more than you expected.",
        gym: "You put in the work at the gym. Everything hurt, in the good way.",
        doctor: "The doctor listened, checked a few things, and told you to take better care of yourself. You actually listened.",
        meditate: "You sat quietly for twenty minutes. The noise in your head eventually got bored and left.",
        salon: "You walked out of the salon feeling like a slightly upgraded version of yourself.",
        spa: "You spent an afternoon being steamed, scrubbed, and told to relax. You managed it.",
        party: "You went to the party. The music was loud, the snacks were questionable, and you stayed too late.",
        vacation: "You got away for a few days. The weather was good, the phone stayed mostly in your bag.",
        concert: "The bass rattled your ribs and the crowd sang every word. For two hours, nothing else mattered.",
        gaming: "You played until the room got dark. One more level turned into five.",
        restaurant: "You ordered something you would not normally get. It was exactly right.",
        library: "You found a quiet corner and read until your neck hurt. Worth it.",
        volunteer: "You gave a few hours away and came home with the strange, steady feeling of having been useful.",
        openmic: "You got on stage, forgot one line, and recovered. The applause was real.",
        language: "You practiced a new language until the words started to feel less foreign.",
        hustle: "You worked the side hustle. It was not glamorous, but the money was real."
      };
      text = lines[id] || "You did something good for yourself.";
      if (id === "vacation" && getPartner(g)) {
        const partner = getPartner(g);
        partner.relation = clamp(partner.relation + 4, 0, 100);
        chips.push({ text: "Partner +4", kind: "pos" });
      }
      if (id === "party") soundTap();
    }
    addLog(g, text, activity.category === "Money" ? "money" : activity.category === "Wellness" ? "health" : "life", activity.icon, chips);
    saveGame();
    checkDeath();
    if (!g.alive) {
      renderDeath();
      showScreen("screen-death");
      return;
    }
    renderGame({ scroll: "preserve" });
    showToast(text.length > 80 ? text.slice(0, 77) + "..." : text);
    soundTap();
  }

  function meetSomeone() {
    const g = game;
    if (!g || g.age < 16 || getPartner(g) || g.yearActions.dating) return;
    if (g.money < 40) { showToast("A date costs " + fmt(40) + ". You're a little short.", "bad"); return; }
    g.money -= 40;
    g.yearActions.dating = true;
    g.stats.happiness = clamp(g.stats.happiness + 1, 0, 100);
    if (chance(0.72)) {
      createPartnerCandidate();
      addLog(g, "The date went well enough that you both forgot to check the time. You made plans for next week.", "love", "💞", [{ text: "-" + fmt(40), kind: "neg" }]);
      soundGood();
    } else {
      addLog(g, "The date was fine. Not bad, not magic. You split the bill and went home.", "life", "☕", [{ text: "-" + fmt(40), kind: "neg" }]);
    }
    saveGame();
    checkAchievements();
    renderGame({ scroll: "preserve" });
  }

  function dateNight() {
    const g = game;
    const partner = getPartner(g);
    if (!g || !partner || g.yearActions["partner:date"]) return;
    if (g.money < 50) { showToast("A date night costs " + fmt(50) + ".", "bad"); return; }
    g.money -= 50;
    g.yearActions["partner:date"] = true;
    partner.relation = clamp(partner.relation + 8, 0, 100);
    g.stats.happiness = clamp(g.stats.happiness + 5, 0, 100);
    addLog(g, `You and ${partner.name} went out for the evening. You talked about nothing important and laughed anyway.`, "love", "🌹", [{ text: "Partner +8", kind: "pos" }, { text: "-" + fmt(50), kind: "neg" }]);
    checkAchievements();
    saveGame();
    renderGame({ scroll: "preserve" });
    showToast("A good night with " + partner.name + ".");
    soundGood();
  }

  function proposeToPartner() {
    const g = game;
    const partner = getPartner(g);
    if (!g || !partner || partner.role === "Spouse") return;
    if (g.money < 500) { showToast("A ring costs " + fmt(500) + ". You'll need to save a little.", "bad"); return; }
    if (partner.relation < 60) { showToast("The timing doesn't feel right yet. Build the relationship first.", "bad"); return; }
    showConfirm("Ask the big question?", `A ring costs ${fmt(500)}. ${partner.name} means a lot to you. Are you ready?`, "Propose", () => {
      closeModal(false);
      g.money -= 500;
      const p = clamp(partner.relation / 100 * 0.9 + 0.05, 0.1, 0.97);
      const chips = [{ text: "-" + fmt(500), kind: "neg" }];
      if (chance(p)) {
        partner.role = "Spouse";
        partner.relation = clamp(partner.relation + 12, 0, 100);
        g.flags.married = true;
        g.stats.happiness = clamp(g.stats.happiness + 14, 0, 100);
        addLog(g, `${partner.name} said yes. You both cried a little, then called everyone you knew.`, "love", "💍", chips.concat([{ text: "Happiness +14", kind: "pos" }, { text: "Married", kind: "pos" }]));
        checkAchievements();
        saveGame();
        renderGame({ scroll: "bottom" });
        showResultModal("They said yes", `You and ${partner.name} are engaged. The wedding was small, warm, and exactly yours.`, chips.concat([{ text: "Happiness +14", kind: "pos" }, { text: "Married", kind: "pos" }]), null, "💍");
        confettiBurst(30);
        soundGood();
      } else {
        partner.relation = clamp(partner.relation - 12, 0, 100);
        g.stats.happiness = clamp(g.stats.happiness - 10, 0, 100);
        addLog(g, `${partner.name} said they were not ready. The ring stayed in your pocket, and the walk home was very long.`, "bad", "💔", chips.concat([{ text: "Happiness -10", kind: "neg" }]));
        saveGame();
        renderGame({ scroll: "bottom" });
        showResultModal("Not yet", `${partner.name} said they love you but are not ready for marriage. It hurt more than you expected.`, chips.concat([{ text: "Happiness -10", kind: "neg" }, { text: "Partner -12", kind: "neg" }]), null, "💔");
      }
    }, { emoji: "💍", kicker: "A very big question" });
  }

  function startFamily() {
    const g = game;
    const partner = getPartner(g);
    if (!g || !partner) return;
    if (g.money < 400) { showToast("Getting ready for a child costs money. You need " + fmt(400) + ".", "bad"); return; }
    if (g.relationships.filter(r => r.role === "Child" && r.alive).length >= 4) { showToast("Your hands are already full.", "bad"); return; }
    showConfirm("Start a family?", `You and ${partner.name} have talked about children. It would change everything.`, "Start a family", () => {
      closeModal(false);
      g.money -= 400;
      const gender = pick(["Female", "Male"]);
      const name = randomFirst(gender, g.person.country);
      const child = makeRelationship({
        id: newId("child"), name: `${name} ${g.person.last}`, role: "Child",
        emoji: gender === "Female" ? "👧" : "👦", age: 0, relation: 92, gender
      });
      g.relationships.push(child);
      partner.relation = clamp(partner.relation + 8, 0, 100);
      g.stats.happiness = clamp(g.stats.happiness + 13, 0, 100);
      const chips = [{ text: "-" + fmt(400), kind: "neg" }, { text: "Happiness +13", kind: "pos" }, { text: "New child", kind: "pos" }];
      addLog(g, `${child.name} was born. You held them in the hospital and forgot every sentence you had practiced.`, "love", "🍼", chips);
      checkAchievements();
      saveGame();
      renderGame({ scroll: "bottom" });
      showResultModal("A new chapter", `Welcome to the world, ${child.name}. You and ${partner.name} are officially parents.`, chips, null, "🍼");
      confettiBurst(30);
      soundGood();
    }, { emoji: "🍼", kicker: "A family decision" });
  }

  function breakUp() {
    const g = game;
    const partner = getPartner(g);
    if (!g || !partner) return;
    const married = partner.role === "Spouse";
    showConfirm(married ? "Ask for a divorce?" : "End the relationship?", married
      ? "Divorce is expensive and final. A lawyer will cost around $5,000."
      : "You will lose this relationship. There is no undo.", married ? "Divorce" : "Break up", () => {
      closeModal(false);
      if (married && g.money >= 5000) g.money -= 5000;
      g.relationships = g.relationships.filter(r => r.id !== partner.id);
      g.partnerId = null;
      g.flags.married = false;
      g.stats.happiness = clamp(g.stats.happiness - 13, 0, 100);
      const chips = [{ text: "Happiness -13", kind: "neg" }];
      if (married) chips.push({ text: "-" + fmt(5000), kind: "neg" });
      addLog(g, married ? `You and ${partner.name} divorced. The paperwork was easier than the silence.` : `You and ${partner.name} broke up. You kept the good memories and returned the hoodie.`, "bad", "💔", chips);
      saveGame();
      renderGame({ scroll: "bottom" });
      showResultModal(married ? "Divorced" : "Single again", "Some endings are not failures. They are just endings.", chips, null, "💔");
    }, { emoji: "💔", kicker: "A hard conversation", danger: true });
  }

  function personAction(key, personId) {
    const g = game;
    const person = g.relationships.find(r => r.id === personId);
    if (!g || !person || !person.alive) return;
    if (g.yearActions[`person:${personId}:${key}`]) return;
    if (key === "propose") { closeModal(false); proposeToPartner(); return; }
    if (key === "family") { closeModal(false); startFamily(); return; }
    if (key === "breakup") { closeModal(false); breakUp(); return; }
    if (key === "borrow" && g.age >= 40) return;
    const costs = { gift: 60, date: 50 };
    const cost = costs[key] || 0;
    if (cost && g.money < cost) { showToast("Not enough money for that.", "bad"); return; }
    g.money -= cost;
    g.yearActions[`person:${personId}:${key}`] = true;
    let text = "";
    let chips = [];
    if (key === "time") {
      person.relation = clamp(person.relation + 7, 0, 100);
      g.stats.happiness = clamp(g.stats.happiness + 3, 0, 100);
      text = `You spent a slow afternoon with ${person.name}. No big news, just time.`;
      chips = [{ text: "Relationship +7", kind: "pos" }, { text: "Happiness +3", kind: "pos" }];
    } else if (key === "gift") {
      person.relation = clamp(person.relation + 10, 0, 100);
      g.stats.happiness = clamp(g.stats.happiness + 2, 0, 100);
      text = `You gave ${person.name} a gift. They pretended not to be emotional about it.`;
      chips = [{ text: "Relationship +10", kind: "pos" }, { text: "-" + fmt(60), kind: "neg" }];
    } else if (key === "advice") {
      person.relation = clamp(person.relation + 3, 0, 100);
      g.stats.smarts = clamp(g.stats.smarts + 3, 0, 100);
      text = `${person.name} gave you advice. Some of it was useful. Some of it was just stories.`;
      chips = [{ text: "Smarts +3", kind: "pos" }, { text: "Relationship +3", kind: "pos" }];
    } else if (key === "story") {
      person.relation = clamp(person.relation + 8, 0, 100);
      g.stats.happiness = clamp(g.stats.happiness + 3, 0, 100);
      text = `You read ${person.name} a story and did all the voices. They asked for one more.`;
      chips = [{ text: "Relationship +8", kind: "pos" }, { text: "Happiness +3", kind: "pos" }];
    } else if (key === "homework") {
      person.relation = clamp(person.relation + 5, 0, 100);
      g.stats.smarts = clamp(g.stats.smarts + 2, 0, 100);
      text = `You helped ${person.name} with homework. There were snacks, tears, and one breakthrough.`;
      chips = [{ text: "Relationship +5", kind: "pos" }, { text: "Smarts +2", kind: "pos" }];
    } else if (key === "borrow") {
      if (chance(0.7)) {
        const amount = randInt(250, 700);
        g.money += amount;
        person.relation = clamp(person.relation - 4, 0, 100);
        text = `${person.name} helped you out with ${fmt(amount)}. You promised to pay it back.`;
        chips = [{ text: "+" + fmt(amount), kind: "money" }, { text: "Relationship -4", kind: "neg" }];
      } else {
        person.relation = clamp(person.relation - 5, 0, 100);
        text = `${person.name} said money was tight. The ask hung in the air a little too long.`;
        chips = [{ text: "Relationship -5", kind: "neg" }];
      }
    } else if (key === "date") {
      person.relation = clamp(person.relation + 8, 0, 100);
      g.stats.happiness = clamp(g.stats.happiness + 5, 0, 100);
      text = `You and ${person.name} had a date night. You stayed out later than planned.`;
      chips = [{ text: "Relationship +8", kind: "pos" }, { text: "-" + fmt(50), kind: "neg" }];
    }
    addLog(g, text, "love", "💞", chips);
    checkAchievements();
    saveGame();
    renderGame({ scroll: "preserve" });
    openPerson(personId);
    showToast("Time well spent with " + person.name + ".");
  }

  function investMoney(amount) {
    const g = game;
    if (!g || g.yearActions.invested) return;
    if (g.money < amount) { showToast("You don't have that much cash available.", "bad"); return; }
    g.money -= amount;
    g.investments += amount;
    g.yearActions.invested = true;
    addLog(g, `You moved ${fmt(amount)} into an index fund. It felt like planting something.`, "money", "📈", [{ text: "-" + fmt(amount), kind: "neg" }]);
    saveGame();
    renderGame({ scroll: "preserve" });
    showToast("Invested " + fmt(amount) + ".");
  }
  function withdrawInvestments() {
    const g = game;
    if (!g || !g.investments || g.yearActions.withdrew) return;
    const amount = g.investments;
    g.money += amount;
    g.investments = 0;
    g.yearActions.withdrew = true;
    addLog(g, `You cashed out ${fmt(amount)} from your investments. The money was real again.`, "money", "💵", [{ text: "+" + fmt(amount), kind: "money" }]);
    saveGame();
    renderGame({ scroll: "preserve" });
    showToast("Cashed out " + fmt(amount) + ".");
  }

  function buyAsset(id) {
    const g = game;
    const asset = D.ASSETS.find(a => a.id === id);
    if (!g || !asset || g.assets.includes(id)) return;
    if (g.age < (asset.minAge || 0)) { showToast("You're too young for that.", "bad"); return; }
    if (g.money < asset.price) { showToast("You need " + fmt(asset.price) + " for that.", "bad"); return; }
    g.money -= asset.price;
    g.assets.push(id);
    const effects = { happiness: asset.happiness || 0, looks: asset.looks || 0, health: asset.health || 0 };
    applyEffects(effects);
    addLog(g, `You bought a ${asset.name}. It was ${fmt(asset.price)} and worth every penny, probably.`, "money", asset.icon, [{ text: "-" + fmt(asset.price), kind: "neg" }, { text: "Happiness +" + (asset.happiness || 0), kind: "pos" }]);
    if (id === "condo" || id === "house") g.flags.independent = true;
    checkAchievements();
    saveGame();
    renderGame({ scroll: "preserve" });
    showToast("You bought a " + asset.name + ".");
    confettiBurst(16);
    soundGood();
  }

  function sellAsset(id) {
    const g = game;
    const asset = D.ASSETS.find(a => a.id === id);
    if (!g || !asset || !g.assets.includes(id)) return;
    const value = Math.round(asset.price * 0.62);
    showConfirm("Sell your " + asset.name + "?", `You will get ${fmt(value)}. The memories are included for free.`, "Sell it", () => {
      closeModal(false);
      g.assets = g.assets.filter(a => a !== id);
      g.money += value;
      g.stats.happiness = clamp(g.stats.happiness - 2, 0, 100);
      addLog(g, `You sold your ${asset.name} for ${fmt(value)}. Someone else gets to enjoy it now.`, "money", asset.icon, [{ text: "+" + fmt(value), kind: "money" }]);
      saveGame();
      renderGame({ scroll: "preserve" });
      showToast("Sold for " + fmt(value) + ".");
    }, { emoji: asset.icon, kicker: "Letting go", danger: true });
  }

  function applyForJob(index) {
    const g = game;
    if (!g || g.yearActions.jobApplied) return;
    const listing = g.jobMarket[index];
    if (!listing) return;
    const job = D.JOBS.find(j => j.id === listing.jobId);
    if (!job) return;
    const eduOk = (EDU_RANK[g.education.level] || 0) >= (EDU_RANK[job.education] || 0);
    const smartOk = g.stats.smarts >= (job.smarts || 0);
    const looksOk = g.stats.looks >= (job.looks || 0);
    if (g.age < job.minAge || !eduOk || !smartOk || !looksOk) return;
    g.yearActions.jobApplied = true;
    let chanceToGet = 0.48 + g.stats.smarts / 260 + (g.age > 24 ? 0.05 : 0) + ((EDU_RANK[g.education.level] || 0) > (EDU_RANK[job.education] || 0) ? 0.12 : 0);
    if (g.job) chanceToGet -= 0.08;
    chanceToGet = clamp(chanceToGet, 0.16, 0.94);
    if (chance(chanceToGet)) {
      g.job = {
        id: job.id, title: job.title, icon: job.icon, company: listing.company,
        salary: listing.salary, years: 0, performance: 58, level: 1
      };
      g.salary = listing.salary;
      g.stats.happiness = clamp(g.stats.happiness + 6, 0, 100);
      addLog(g, `You got the job: ${job.title} at ${listing.company}. You celebrated with something small and slightly too expensive.`, "career", job.icon, [{ text: "Hired", kind: "pos" }, { text: fmt(listing.salary) + "/yr", kind: "money" }]);
      unlockAchievement("first_job");
      g.jobMarket = [];
      showToast("You got the job at " + listing.company + "!");
      soundGood();
      confettiBurst(20);
    } else {
      addLog(g, `You applied to ${listing.company} for the ${job.title} role. They went with someone else.`, "career", "📨");
      showToast("Not this time. Keep building your skills.", "bad");
    }
    checkAchievements();
    saveGame();
    renderGame({ scroll: "preserve" });
  }

  function workHarder() {
    const g = game;
    if (!g || !g.job || g.yearActions.worked) return;
    g.yearActions.worked = true;
    g.job.performance = clamp(g.job.performance + 14, 0, 100);
    g.stats.happiness = clamp(g.stats.happiness - 2, 0, 100);
    addLog(g, `You put in extra hours at ${g.job.company}. Your manager noticed, even if they did not say so.`, "career", "💼", [{ text: "Work rep +14", kind: "pos" }, { text: "Happiness -2", kind: "neg" }]);
    saveGame();
    renderGame({ scroll: "preserve" });
    showToast("Your performance improved.");
  }

  function askForRaise() {
    const g = game;
    if (!g || !g.job || g.yearActions.raised) return;
    g.yearActions.raised = true;
    const p = clamp(0.3 + g.job.performance / 220 + g.stats.smarts / 500, 0.18, 0.9);
    if (chance(p)) {
      const raise = Math.round(g.job.salary * 0.1);
      g.job.salary += raise;
      g.salary = g.job.salary;
      g.stats.happiness = clamp(g.stats.happiness + 6, 0, 100);
      addLog(g, `You asked for a raise and got ${fmt(raise)} more a year. The conversation was less terrifying than expected.`, "career", "📈", [{ text: "Salary +" + fmt(raise), kind: "money" }, { text: "Happiness +6", kind: "pos" }]);
      showToast("Raise approved: +" + fmt(raise) + "/yr");
      soundGood();
    } else {
      g.stats.happiness = clamp(g.stats.happiness - 3, 0, 100);
      addLog(g, "You asked for a raise. They said the budget was tight and promised to revisit it. You've heard that before.", "career", "📉", [{ text: "Happiness -3", kind: "neg" }]);
      showToast("Not this time.", "bad");
    }
    saveGame();
    renderGame({ scroll: "preserve" });
  }

  function quitJob() {
    const g = game;
    if (!g || !g.job) return;
    showConfirm("Quit your job?", `You will leave ${g.job.company} and lose the steady paycheck.`, "Quit", () => {
      closeModal(false);
      const title = g.job.title;
      const company = g.job.company;
      g.job = null;
      g.salary = 0;
      g.jobMarket = [];
      g.stats.happiness = clamp(g.stats.happiness + 2, 0, 100);
      addLog(g, `You quit your job as a ${title} at ${company}. The relief and the fear arrived at the same time.`, "career", "🚪");
      saveGame();
      renderGame({ scroll: "bottom" });
      showToast("You left " + company + ".");
    }, { emoji: "🚪", kicker: "A big decision", danger: true });
  }

  function retireNow() {
    const g = game;
    if (!g || !g.job || g.age < 60) return;
    showConfirm("Retire?", "You have worked for a long time. The numbers work, if you are careful.", "Retire", () => {
      closeModal(false);
      g.job = null;
      g.salary = 0;
      g.flags.retired = true;
      g.stats.happiness = clamp(g.stats.happiness + 9, 0, 100);
      g.stats.health = clamp(g.stats.health + 3, 0, 100);
      addLog(g, "You retired. The first Monday morning with nowhere to be felt almost illegal.", "milestone", "🌅", [{ text: "Happiness +9", kind: "pos" }]);
      unlockAchievement("retired");
      saveGame();
      renderGame({ scroll: "bottom" });
      showToast("You retired. Enjoy the quiet.", "trophy");
      confettiBurst(26);
    }, { emoji: "🌅", kicker: "The next chapter" });
  }

  function studyHarder() {
    const g = game;
    if (!g || g.yearActions.studied) return;
    g.yearActions.studied = true;
    g.stats.smarts = clamp(g.stats.smarts + 6, 0, 100);
    g.stats.happiness = clamp(g.stats.happiness - 1, 0, 100);
    addLog(g, "You studied hard this year. Some of it stuck.", "school", "📚", [{ text: "Smarts +6", kind: "pos" }]);
    checkAchievements();
    saveGame();
    renderGame({ scroll: "preserve" });
    showToast("Smarts improved.");
  }

  function enroll(programId) {
    const g = game;
    const program = D.EDUCATION.find(p => p.id === programId);
    if (!g || !program || g.education.program) return;
    if (g.age < 18) return;
    if (program.id === "grad" && g.education.level !== "university") return;
    if (program.id !== "grad" && g.education.level !== "none" && g.education.level !== "highschool") return;
    const perYear = Math.round(program.tuition / program.years);
    const loan = g.money < perYear;
    showConfirm(`Enroll in ${program.title}?`, `${program.years} year${program.years === 1 ? "" : "s"}, ${fmt(perYear)} per year.${loan ? " You will need a student loan for the first year." : ""}`, "Enroll", () => {
      closeModal(false);
      g.education.program = program.id;
      g.education.yearsLeft = program.years;
      g.education.annualTuition = perYear;
      g.education.target = program.level;
      let loanAmount = 0;
      if (g.money >= perYear) {
        g.money -= perYear;
      } else {
        loanAmount = perYear - Math.max(0, g.money);
        g.money = 0;
        g.loans += loanAmount;
      }
      addLog(g, `You enrolled in ${program.title}. ${loanAmount ? `You took ${fmt(loanAmount)} in student loans to cover the first year.` : `You paid ${fmt(perYear)} for the first year.`}`, "school", program.icon, loanAmount ? [{ text: "Loans +" + fmt(loanAmount), kind: "neg" }] : [{ text: "-" + fmt(perYear), kind: "neg" }]);
      saveGame();
      renderGame({ scroll: "preserve" });
      showToast("You enrolled in " + program.title + ".");
      soundGood();
    }, { emoji: program.icon, kicker: "Back to school" });
  }

  function handleSettings(action) {
    if (!action) return;
    if (action === "sound") {
      meta.settings.sound = !meta.settings.sound;
      saveMeta();
      if (meta.settings.sound) soundTap();
      openSettings();
    } else if (action === "haptics") {
      meta.settings.haptics = !meta.settings.haptics;
      saveMeta();
      haptic(15);
      openSettings();
    } else if (action === "achievements") {
      openAchievements();
    } else if (action === "howto") {
      openHowTo();
    } else if (action === "menu") {
      saveGame();
      closeModal(false);
      game = null;
      refreshStart();
      showScreen("screen-start");
    } else if (action === "restart") {
      showConfirm("Start a new life?", "Your current life will be replaced. Achievements stay with you.", "Start over", () => {
        closeModal(false);
        removeSave();
        game = null;
        draft = randomDraft();
        renderCreate();
        showScreen("screen-create");
      }, { emoji: "🌱", kicker: "Fresh start", danger: true });
    }
  }

  function handleDeathAction(action) {
    if (action === "new") {
      game = null;
      beginGame(randomDraft());
    } else if (action === "menu") {
      game = null;
      refreshStart();
      showScreen("screen-start");
    }
  }

  function onTabClick(event) {
    const el = event.target.closest("[data-act]");
    if (!el || !game) return;
    const act = el.dataset.act;
    if (act === "activity") doActivity(el.dataset.id);
    else if (act === "person") openPerson(el.dataset.id);
    else if (act === "meet") meetSomeone();
    else if (act === "date-night") dateNight();
    else if (act === "propose") proposeToPartner();
    else if (act === "start-family") startFamily();
    else if (act === "break-up") breakUp();
    else if (act === "invest") investMoney(Number(el.dataset.amount));
    else if (act === "withdraw") withdrawInvestments();
    else if (act === "buy") buyAsset(el.dataset.id);
    else if (act === "sell") sellAsset(el.dataset.id);
    else if (act === "apply") applyForJob(Number(el.dataset.index));
    else if (act === "work") workHarder();
    else if (act === "raise") askForRaise();
    else if (act === "quit") quitJob();
    else if (act === "retire") retireNow();
    else if (act === "study") studyHarder();
    else if (act === "enroll") enroll(el.dataset.id);
  }

  function onModalClick(event) {
    const root = $("modal-root");
    if (event.target.classList && event.target.classList.contains("modal-overlay")) {
      if (root.dataset.dismissible === "1") closeModal();
      return;
    }
    const closeBtn = event.target.closest("[data-close]");
    if (closeBtn) { closeModal(); return; }
    const confirmBtn = event.target.closest("[data-confirm]");
    if (confirmBtn) {
      const cb = pendingConfirm;
      pendingConfirm = null;
      closeModal(false);
      if (typeof cb === "function") cb();
      return;
    }
    const choice = event.target.closest("[data-choice]");
    if (choice) { resolveEvent(Number(choice.dataset.choice)); return; }
    const settings = event.target.closest("[data-settings]");
    if (settings) { handleSettings(settings.dataset.settings); return; }
    const personBtn = event.target.closest("[data-person-action]");
    if (personBtn) {
      personAction(personBtn.dataset.personAction, personBtn.dataset.personId);
      return;
    }
  }

  function bindEvents() {
    $("btn-play").addEventListener("click", () => { ensureAudio(); handlePlay(); });
    $("btn-create").addEventListener("click", () => { soundTap(); openCreate(); });
    $("btn-continue").addEventListener("click", () => { soundTap(); continueLife(); });
    $("btn-start-settings").addEventListener("click", openHowTo);

    $("btn-create-back").addEventListener("click", () => {
      refreshStart();
      showScreen("screen-start");
    });
    $("btn-randomize").addEventListener("click", () => {
      draft = randomDraft();
      renderCreate();
      soundTap();
      haptic(8);
    });
    $("gender-picker").addEventListener("click", (event) => {
      const btn = event.target.closest("[data-gender]");
      if (!btn || !draft) return;
      draft.gender = btn.dataset.gender;
      renderCreate();
      soundTap();
    });
    $("select-country").addEventListener("change", (event) => {
      if (!draft) return;
      draft.country = event.target.value;
      draft.city = pick(D.COUNTRIES[draft.country].cities);
      renderCreate();
    });
    $("select-city").addEventListener("change", (event) => {
      if (!draft) return;
      draft.city = event.target.value;
      $("avatar-caption").textContent = `${withArticle(countryOf({ person: draft }).demonym)} life in ${draft.city}`;
    });
    $("input-first").addEventListener("input", (event) => { if (draft) draft.first = event.target.value; });
    $("input-last").addEventListener("input", (event) => { if (draft) draft.last = event.target.value; });
    $("btn-begin").addEventListener("click", handleBegin);
    $("btn-quick-begin").addEventListener("click", () => {
      const person = randomDraft();
      if (hasActiveLife()) {
        showConfirm("Start a new life?", "Your current life will be replaced.", "Start over", () => {
          closeModal(false);
          beginGame(person);
        }, { emoji: "🎲", kicker: "Surprise me" });
      } else beginGame(person);
    });

    $("btn-settings").addEventListener("click", openSettings);
    $("btn-money").addEventListener("click", () => switchTab("assets"));
    $("btn-avatar").addEventListener("click", openProfile);
    $("age-btn").addEventListener("click", () => {
      ensureAudio();
      if (game && game.pendingEvent) { showEventModal(); return; }
      ageUp();
    });
    $("bottom-nav").addEventListener("click", (event) => {
      const btn = event.target.closest("[data-tab]");
      if (btn) switchTab(btn.dataset.tab);
    });
    $("tab-body").addEventListener("click", onTabClick);
    $("modal-root").addEventListener("click", onModalClick);
    $("screen-death").addEventListener("click", (event) => {
      const btn = event.target.closest("[data-death]");
      if (btn) handleDeathAction(btn.dataset.death);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isModalOpen() && $("modal-root").dataset.dismissible === "1") closeModal();
    });
    document.addEventListener("pointerdown", () => { ensureAudio(); }, { once: true });
    window.addEventListener("beforeunload", saveGame);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") saveGame();
    });
  }

  function init() {
    if (booted) return;
    booted = true;
    meta = loadMeta();
    draft = randomDraft();
    renderCreate();
    refreshStart();
    showScreen("screen-start");
    bindEvents();
    if ("serviceWorker" in navigator && location.protocol !== "file:") {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => undefined);
      });
    }
    if (location.protocol === "file:") {
      console.warn("LifeHappens is best served over HTTP for full mobile behaviour.");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  /* __APPEND_5__ */
})();
