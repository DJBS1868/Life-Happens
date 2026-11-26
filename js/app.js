/* Life Happens — mobile life simulator UI controller */
import {
  store, loadData, save, resetAll, displayName, ageStage, educationLabel, schoolGrade,
  statusInfo, relationLabel, closenessLabel, fmtMoney, netWorth, assetValue,
  computeFinances, getCountry, createProfile, randomDraft, startRandomLife, archiveCurrent,
  clamp, currentYear
} from "./engine.js";
import { ageUp, computeAchievements } from "./lifecycle.js";
import {
  resolveEvent, doActivity, enrollUniversity, enrollTrade, enrollGrad, applyForJob,
  careerAction, relationshipAction, buyAsset, sellAsset, investMoney,
  withdrawInvestments, borrowMoney, repayDebt, setSetting
} from "./actions.js";
import { JOBS, jobRequirementText, jobMeetsRequirements } from "./jobs.js";
import { ASSET_CATALOG, ASSET_MAP, ASSET_TYPES } from "./assets.js";
import { ACTIVITY_CATEGORIES, ACTIVITIES } from "./activities.js";
import { MAJORS, COUNTRIES, randomFrom } from "./countries.js";
import {
  avatarSVG, SKIN_TONES, HAIR_STYLES, HAIR_COLORS, EYE_COLORS,
  OUTFIT_COLORS, BACKGROUNDS, randomAppearance
} from "./avatar.js";
import { icon, logoMark } from "./icons.js";

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));
const pct = (v) => clamp(Math.round(Number(v) || 0), 0, 100);
const cap = (s) => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);

const ui = {
  draft: null,
  titleAppearance: null,
  currentEvent: null,
  resultClose: null,
  confirmAction: null,
  amountConfirm: null,
  amountRate: 1,
  amountMaxLocal: 0,
  majorMode: "university",
  feedRendered: false
};

const EFFECT_LABELS = {
  happiness: "Happiness", health: "Health", smarts: "Smarts",
  looks: "Looks", fame: "Fame", karma: "Karma", money: "Money"
};

/* ------------------------------------------------------------------ */
/* Boot                                                                */
/* ------------------------------------------------------------------ */
loadData();
ui.titleAppearance = randomAppearance("female");
applySettings();
store.screen = "title";
store.activeTab = null;
render();

function applySettings() {
  document.body.classList.toggle("no-motion", !store.settings.motion);
}

let audioCtx = null;
function feedback(kind = "tap") {
  if (store.settings.haptics && navigator.vibrate) {
    try { navigator.vibrate(kind === "error" ? [16, 28, 16] : 10); } catch (e) { /* ignore */ }
  }
  if (!store.settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = kind === "error" ? 190 : kind === "success" ? 660 : 440;
    gain.gain.setValueAtTime(0.028, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.09);
  } catch (e) { /* audio unavailable */ }
}

function toast(message, tone = "neutral") {
  if (!message) return;
  const root = $("#toast-root");
  if (!root) return;
  const el = document.createElement("div");
  el.className = `toast ${tone}`;
  el.textContent = message;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 260);
  }, 2700);
}

function setScreen(name) {
  store.screen = name;
  ["title", "create", "game", "death"].forEach((s) => {
    const el = document.getElementById(`screen-${s}`);
    if (el) el.classList.toggle("hidden", s !== name);
  });
  document.body.dataset.screen = name;
}

function render(opts = {}) {
  if (store.screen === "title") renderTitle();
  else if (store.screen === "create") renderCreate();
  else if (store.screen === "game") renderGame(opts);
  else if (store.screen === "death") renderDeath();
  else renderTitle();
}

function closeAllOverlays() {
  ["drawer-root", "sheet-root", "modal-root"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = "";
  });
  ui.currentEvent = null;
  ui.resultClose = null;
  ui.confirmAction = null;
  ui.amountConfirm = null;
}

/* ------------------------------------------------------------------ */
/* Global events                                                       */
/* ------------------------------------------------------------------ */
document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-act]");
  if (!target || target.disabled) return;
  try {
    handleAction(target.dataset.act, target.dataset, target);
  } catch (err) {
    console.error(err);
    toast("Something went wrong. Try again.", "negative");
  }
});

document.addEventListener("input", (e) => {
  const input = e.target;
  if (!input.matches("[data-create-input]") || !ui.draft) return;
  ui.draft[input.dataset.createInput] = input.value;
  updateCreateHero();
});

/* ------------------------------------------------------------------ */
/* Title screen                                                        */
/* ------------------------------------------------------------------ */
function renderTitle() {
  setScreen("title");
  const p = store.profile;
  const app = p?.appearance || ui.titleAppearance;
  const continueCard = p ? `
    <button class="continue-card" data-act="title-continue">
      ${avatarSVG(p.appearance, { size: 46, dead: !p.alive })}
      <div class="continue-main">
        <strong>${esc(displayName(p))}</strong>
        <span>${p.alive ? `Age ${p.age} • ${esc(ageStage(p.age))}` : `Deceased at age ${p.age}`}</span>
      </div>
      <div class="go">${icon("play", 15)}</div>
    </button>` : "";

  $("#screen-title").innerHTML = `
    <div class="title-content">
      <div class="title-top">
        <div class="title-logo">
          ${logoMark(46)}
          <div class="title-wordmark">LIFE<br>HAPPENS</div>
        </div>
        <div class="title-sub">A LIFE SIMULATOR</div>
      </div>
      <div class="title-hero">
        <div class="title-avatar-ring">
          ${avatarSVG(app, { size: 142, dead: p ? !p.alive : false })}
          <div class="title-float f1">🎂</div>
          <div class="title-float f2">💼</div>
          <div class="title-float f3">❤️</div>
        </div>
        <p class="title-tagline">Every choice writes a chapter. How will your story end?</p>
      </div>
      <div class="title-actions">
        ${continueCard}
        <button class="btn btn-primary btn-lg" data-act="title-new">${p ? "Start a New Life" : "Start Your Life"}</button>
        <button class="btn btn-ghost btn-lg" data-act="title-random">${icon("dice", 18)} Random Life</button>
        <div class="title-links">
          <button class="title-link" data-act="title-lives">${icon("heart", 14)} Lives${store.lives.length ? ` (${store.lives.length})` : ""}</button>
          <button class="title-link" data-act="title-settings">${icon("settings", 14)} Settings</button>
          <button class="title-link" data-act="title-about">${icon("info", 14)} About</button>
        </div>
      </div>
      <div class="title-footer">Make every year count.</div>
    </div>`;
}

/* ------------------------------------------------------------------ */
/* Create screen                                                       */
/* ------------------------------------------------------------------ */
function renderCreate() {
  setScreen("create");
  if (!ui.draft) ui.draft = randomDraft();
  const d = ui.draft;
  const c = COUNTRIES[d.countryCode] || COUNTRIES.US;
  const a = d.appearance;
  const scroller = $(".create-scroll");
  const scrollTop = scroller ? scroller.scrollTop : 0;
  const display = `${d.firstName || "Your"} ${d.lastName || "Name"}`.trim();

  const swatches = (label, key, colors) => `
    <div class="appearance-row">
      <span class="app-label">${label}</span>
      <div class="swatches">
        ${colors.map((col) => `<button class="swatch ${a[key] === col ? "active" : ""}" style="background:${col}" data-act="create-swatch" data-key="${key}" data-value="${col}" aria-label="${label} ${col}"></button>`).join("")}
      </div>
    </div>`;

  $("#screen-create").innerHTML = `
    <div class="create-top">
      <button class="btn-icon" data-act="create-back" aria-label="Back">${icon("arrowLeft", 21)}</button>
      <h1>Create Your Character</h1>
      <span style="width:42px"></span>
    </div>
    <div class="create-scroll scroll">
      <div class="create-hero">
        <div class="create-avatar-wrap">
          ${avatarSVG(a, { size: 104 })}
          <button class="create-random" data-act="create-random-avatar" aria-label="Randomize appearance">${icon("dice", 17)}</button>
        </div>
        <h2 id="create-hero-name">${esc(display)}</h2>
        <p id="create-hero-sub">Born in ${esc(d.city)}, ${esc(c.name)} ${c.flag}</p>
      </div>

      <div class="card form-card">
        <div class="form-row">
          <label>Name</label>
          <div class="name-grid">
            <input class="text-input" data-create-input="firstName" value="${esc(d.firstName)}" placeholder="First name" maxlength="18" autocomplete="off">
            <input class="text-input" data-create-input="lastName" value="${esc(d.lastName)}" placeholder="Last name" maxlength="18" autocomplete="off">
          </div>
        </div>
        <div class="form-row">
          <label>Gender</label>
          <div class="segmented">
            ${[["female", "Female"], ["male", "Male"], ["nonbinary", "Non-binary"]].map(([id, label]) => `<button class="${d.gender === id ? "active" : ""}" data-act="create-gender" data-value="${id}">${label}</button>`).join("")}
          </div>
        </div>
      </div>

      <div class="card form-card">
        <div class="form-row">
          <label>Country</label>
          <button class="picker-row" data-act="create-country">
            <span class="picker-flag">${c.flag}</span>
            <span class="picker-main"><strong>${esc(c.name)}</strong><small>${c.currency.code} • ${c.demonym}</small></span>
            <span class="chev">${icon("chevronRight", 18)}</span>
          </button>
        </div>
        <div class="form-row">
          <label>City</label>
          <button class="picker-row" data-act="create-city">
            <span class="picker-flag">${icon("mapPin", 18)}</span>
            <span class="picker-main"><strong>${esc(d.city)}</strong><small>Hometown</small></span>
            <span class="chev">${icon("chevronRight", 18)}</span>
          </button>
        </div>
      </div>

      <div class="card appearance-card">
        <div class="appearance-head"><h3>Appearance</h3><span>Tap to customize</span></div>
        <div class="appearance-row">
          <span class="app-label">Hair</span>
          <div class="cycle-row">
            <button class="cycle-btn" data-act="create-hair" data-dir="-1" aria-label="Previous hair">${icon("chevronLeft", 16)}</button>
            <span class="cycle-value">${cap(a.hair)}</span>
            <button class="cycle-btn" data-act="create-hair" data-dir="1" aria-label="Next hair">${icon("chevronRight", 16)}</button>
          </div>
        </div>
        ${swatches("Skin", "skin", SKIN_TONES)}
        ${swatches("Hair color", "hairColor", HAIR_COLORS)}
        ${swatches("Eyes", "eyes", EYE_COLORS)}
        ${swatches("Outfit", "outfit", OUTFIT_COLORS)}
        ${swatches("Backdrop", "bg", BACKGROUNDS)}
        <div class="appearance-row">
          <span class="app-label">Extras</span>
          <div class="toggle-chips">
            <button class="toggle-chip ${a.glasses ? "active" : ""}" data-act="create-toggle" data-key="glasses">Glasses</button>
            ${d.gender !== "female" ? `<button class="toggle-chip ${a.beard ? "active" : ""}" data-act="create-toggle" data-key="beard">Beard</button>` : ""}
          </div>
        </div>
      </div>
    </div>
    <div class="create-footer">
      <button class="btn btn-primary btn-lg" data-act="create-start">Begin Life</button>
      <p class="create-note">Your life starts at age 0. Every year brings a choice.</p>
    </div>`;

  const ns = $(".create-scroll");
  if (ns) ns.scrollTop = scrollTop;
}

function updateCreateHero() {
  if (!ui.draft) return;
  const name = $("#create-hero-name");
  const sub = $("#create-hero-sub");
  if (name) name.textContent = `${ui.draft.firstName || "Your"} ${ui.draft.lastName || "Name"}`.trim();
  if (sub) {
    const c = COUNTRIES[ui.draft.countryCode] || COUNTRIES.US;
    sub.textContent = `Born in ${ui.draft.city}, ${c.name} ${c.flag}`;
  }
}

/* ------------------------------------------------------------------ */
/* Game screen                                                         */
/* ------------------------------------------------------------------ */
function renderGame(opts = {}) {
  const p = store.profile;
  if (!p) {
    store.screen = "title";
    return renderTitle();
  }
  if (!p.alive) {
    store.screen = "death";
    return renderDeath();
  }
  setScreen("game");
  renderTopbar(p);
  renderIdentity(p);
  renderStats(p);
  renderFeed(opts);
  renderBottomNav();
  renderAgeDock(p);
  if (store.activeTab) renderSubpage();
  else $("#subpage").classList.add("hidden");
}

function renderTopbar(p) {
  $("#topbar").innerHTML = `
    <button class="topbar-btn" data-act="open-drawer" aria-label="Open menu">${icon("menu", 22)}</button>
    <div class="topbar-title">
      <strong>${esc(displayName(p))}</strong>
      <span>Age ${p.age} • ${esc(ageStage(p.age))}</span>
    </div>
    <button class="topbar-money" data-act="tab" data-tab="more" aria-label="Bank">${icon("coin", 15)} ${fmtMoney(p.money, p, { compact: true })}</button>`;
}

function renderIdentity(p) {
  const status = statusInfo(p);
  const mood = p.stats.happiness > 65 ? "happy" : p.stats.happiness > 35 ? "neutral" : "sad";
  const c = getCountry(p);
  $("#identity").innerHTML = `
    <div class="identity-card">
      <div class="id-avatar">${avatarSVG(p.appearance, { size: 64, mood })}</div>
      <div class="id-main">
        <div class="id-name">${esc(displayName(p))}</div>
        <div class="id-sub">${esc(p.city)}, ${c.flag} • ${esc(ageStage(p.age))}</div>
        <div class="id-status">${icon(status.icon, 13)} <span>${esc(status.label)}</span></div>
        <div class="id-status-sub">${esc(status.sub || "")}</div>
      </div>
    </div>`;
}

function statBar(label, value, tone) {
  return `<div class="stat">
    <div class="stat-top"><span>${label}</span><b>${Math.round(value)}</b></div>
    <div class="stat-bar"><i class="stat-fill ${tone}" style="width:${pct(value)}%"></i></div>
  </div>`;
}

function renderStats(p) {
  const nw = netWorth(p);
  const extra = p.fame > 0 ? `<div class="extra-stats">
      <span>${icon("star", 12)} Fame ${Math.round(p.fame)}</span>
      <span>${icon("heart", 12)} Karma ${Math.round(p.karma)}</span>
    </div>` : "";
  $("#stats").innerHTML = `
    <div class="stats-card">
      <div class="money-row">
        <div class="money-cell"><span>Cash</span><strong>${fmtMoney(p.money, p, { compact: true })}</strong></div>
        <div class="money-cell"><span>Net worth</span><strong>${fmtMoney(nw, p, { compact: true })}</strong></div>
      </div>
      <div class="stat-grid">
        ${statBar("Happiness", p.stats.happiness, "happy")}
        ${statBar("Health", p.stats.health, "health")}
        ${statBar("Smarts", p.stats.smarts, "smarts")}
        ${statBar("Looks", p.stats.looks, "looks")}
      </div>
      ${p.debt > 0 ? `<div class="debt-note">${icon("warning", 12)} Debt ${fmtMoney(p.debt, p, { compact: true })}</div>` : ""}
      ${extra}
    </div>`;
}

const LOG_ICONS = {
  milestone: "star", positive: "smile", negative: "warning",
  money: "coin", death: "heart", neutral: "dot"
};

function renderFeed(opts = {}) {
  const p = store.profile;
  const feed = $("#feed");
  const prevTop = feed.scrollTop;
  const atBottom = feed.scrollHeight - feed.scrollTop - feed.clientHeight < 56;
  const entries = p.log.slice(-140);
  let html = "";
  let lastAge = null;
  for (const entry of entries) {
    if (entry.age !== lastAge) {
      html += `<div class="age-divider"><span>Age ${entry.age}</span></div>`;
      lastAge = entry.age;
    }
    const type = entry.type || "neutral";
    html += `<div class="log-item ${type}">
      <div class="log-ico">${icon(LOG_ICONS[type] || "dot", 14)}</div>
      <p>${esc(entry.text)}</p>
    </div>`;
  }
  if (!entries.length) {
    html = `<div class="empty-state"><div class="big">🌱</div><h3>Your story starts here</h3><p>Tap the Age button to begin living your life.</p></div>`;
  }
  const earlier = p.log.length > 140 ? `<div class="feed-more">${p.log.length - 140} earlier memories…</div>` : "";
  feed.innerHTML = `<div class="feed-inner">${earlier}${html}</div>`;
  if (opts.scrollFeed || atBottom || !ui.feedRendered) feed.scrollTop = feed.scrollHeight;
  else feed.scrollTop = prevTop;
  ui.feedRendered = true;
}

function renderBottomNav() {
  const tabs = [
    ["activities", "Activities", "sparkle"],
    ["relationships", "Relationships", "users"],
    ["career", "Career", "briefcase"],
    ["assets", "Assets", "home"],
    ["more", "More", "menu"]
  ];
  $("#bottomnav").innerHTML = tabs.map(([id, label, ico]) => `
    <button class="nav-item ${store.activeTab === id ? "active" : ""}" data-act="tab" data-tab="${id}">
      <span class="nav-ico">${icon(ico, 21)}</span>
      <span class="nav-label">${label}</span>
    </button>`).join("");
}

function renderAgeDock(p) {
  $("#age-dock").innerHTML = `
    <button class="age-btn" data-act="age">
      <span class="age-main">Age +1</span>
      <span class="age-sub">${p.age} → ${p.age + 1}</span>
    </button>`;
}

function renderSubpage() {
  const el = $("#subpage");
  const p = store.profile;
  el.classList.remove("hidden");
  let html = "";
  if (store.activeTab === "activities") html = activitiesPage(p);
  else if (store.activeTab === "relationships") html = relationshipsPage(p);
  else if (store.activeTab === "career") html = careerPage(p);
  else if (store.activeTab === "assets") html = assetsPage(p);
  else if (store.activeTab === "more") html = morePage(p);
  else { store.activeTab = null; el.classList.add("hidden"); return; }
  el.innerHTML = html;
  el.scrollTop = 0;
}

function subpageShell(title, sub, body) {
  return `<div class="subpage-head">
      <button class="subpage-back" data-act="close-subpage" aria-label="Back">${icon("arrowLeft", 20)}</button>
      <div class="subpage-headtext"><h2>${esc(title)}</h2><span>${esc(sub)}</span></div>
    </div>
    <div class="subpage-body scroll">${body}</div>`;
}

function panel(title, sub, body, extraClass = "") {
  return `<div class="panel ${extraClass}">
    <div class="panel-head">
      <div><h3>${esc(title)}</h3>${sub ? `<span>${esc(sub)}</span>` : ""}</div>
    </div>
    ${body}
  </div>`;
}

/* ------------------------------------------------------------------ */
/* Activities                                                          */
/* ------------------------------------------------------------------ */
function activityCard(a, p) {
  const done = p.usedActivities.includes(a.id);
  const cost = a.cost ? fmtMoney(a.cost, p) : "Free";
  const chips = Object.entries(a.effects || {})
    .filter(([, v]) => v)
    .slice(0, 3)
    .map(([k, v]) => `<span class="chip ${v > 0 ? "good" : "bad"}">${v > 0 ? "+" : ""}${v} ${EFFECT_LABELS[k] || k}</span>`)
    .join("");
  return `<button class="activity-card ${done ? "done" : ""}" data-act="activity" data-id="${a.id}" ${done ? "disabled" : ""}>
    <div class="activity-top"><span class="activity-icon">${a.icon}</span><span class="cost">${done ? "Done" : cost}</span></div>
    <strong class="activity-name">${esc(a.name)}</strong>
    <span class="activity-desc">${esc(a.desc)}</span>
    <div class="effect-chips">${chips}</div>
  </button>`;
}

function activitiesPage(p) {
  let body = "";
  for (const cat of ACTIVITY_CATEGORIES) {
    const items = ACTIVITIES.filter((a) => a.category === cat.id && p.age >= (a.minAge || 0) && p.age <= (a.maxAge ?? 120));
    if (!items.length) continue;
    body += `<div class="cat-head" style="--cat:${cat.color}">
        <span class="cat-ico">${cat.icon}</span>
        <div><strong>${esc(cat.name)}</strong><small>${items.length} ${items.length === 1 ? "activity" : "activities"}</small></div>
      </div>
      <div class="activity-grid">${items.map((a) => activityCard(a, p)).join("")}</div>`;
  }
  if (!body) body = `<div class="empty-state"><div class="big">🎈</div><h3>Nothing available</h3><p>Grow a little older to unlock more activities.</p></div>`;
  return subpageShell("Activities", `Age ${p.age} • ${p.usedActivities.length} done this year`, body);
}

/* ------------------------------------------------------------------ */
/* Relationships                                                       */
/* ------------------------------------------------------------------ */
const REL_ORDER = { partner: 0, spouse: 0, mother: 1, father: 1, sibling: 1, grandparent: 1, child: 2, grandchild: 2, friend: 3, pet: 4, ex: 5 };

function relRow(r) {
  const alive = r.alive !== false;
  return `<button class="rel-row" data-act="rel" data-id="${r.id}">
    <span class="rel-avatar">${avatarSVG(r.appearance, { size: 44, dead: !alive })}</span>
    <span class="rel-main">
      <span class="rel-name">${esc(r.firstName)} ${esc(r.lastName)}</span>
      <span class="rel-sub">${relationLabel(r)} • ${alive ? `Age ${r.age}` : `Passed at ${r.age}`}</span>
    </span>
    <span class="rel-close">
      <span class="closeness-bar"><i style="width:${pct(r.closeness)}%"></i></span>
      <span>${alive ? closenessLabel(r.closeness) : "Remembered"}</span>
    </span>
  </button>`;
}

function relationshipsPage(p) {
  const all = [...p.relationships].sort((a, b) => {
    const aa = a.alive === false ? 1 : 0;
    const bb = b.alive === false ? 1 : 0;
    if (aa !== bb) return aa - bb;
    return (REL_ORDER[a.type] ?? 9) - (REL_ORDER[b.type] ?? 9) || b.closeness - a.closeness;
  });
  const groups = [
    ["Partner", all.filter((r) => r.type === "partner" || r.type === "spouse")],
    ["Family", all.filter((r) => ["mother", "father", "sibling", "grandparent", "child", "grandchild"].includes(r.type))],
    ["Friends", all.filter((r) => r.type === "friend")],
    ["Pets", all.filter((r) => r.type === "pet")],
    ["Past & Lost", all.filter((r) => r.type === "ex")]
  ];
  let body = "";
  for (const [name, list] of groups) {
    if (!list.length) continue;
    body += `<div class="rel-section-head"><strong>${name}</strong><span>${list.length}</span></div>
      <div class="card rel-list">${list.map(relRow).join("")}</div>`;
  }
  if (!body) body = `<div class="empty-state"><div class="big">👥</div><h3>No relationships yet</h3><p>Meet people through activities and life events.</p></div>`;
  const aliveCount = p.relationships.filter((r) => r.alive !== false).length;
  return subpageShell("Relationships", `${aliveCount} people in your life`, body);
}

/* ------------------------------------------------------------------ */
/* Career                                                              */
/* ------------------------------------------------------------------ */
const STAGE_NAMES = {
  elementary: "Elementary School", middle: "Middle School", high: "High School",
  university: "University", trade: "Trade School", grad: "Graduate School"
};

function careerActionButton(arg, label, sub, ico, p, danger = false) {
  const used = (p.careerActions || []).includes(arg);
  return `<button class="action-btn ${danger ? "danger" : ""}" data-act="career-action" data-arg="${arg}" ${used ? "disabled" : ""}>
    <span class="action-ico">${icon(ico, 18)}</span>
    <span class="action-label">${label}</span>
    <span class="action-sub">${used ? "Done this year" : sub}</span>
  </button>`;
}

function schoolPanel(p) {
  const e = p.education;
  if (e.stage) {
    const left = Math.max(0, (e.gradAge || p.age) - p.age);
    return panel(STAGE_NAMES[e.stage] || "School", `${e.schoolName || ""}${e.major ? ` • ${e.major}` : ""}`, `
      <div class="school-strip">
        <div><span>GPA</span><strong>${Number(e.gpa || 0).toFixed(2)}</strong></div>
        <div><span>Grade</span><strong>${schoolGrade(p) || "—"}</strong></div>
        <div><span>Years left</span><strong>${left}</strong></div>
      </div>
      <div class="action-grid">
        ${careerActionButton("study", "Study Hard", "+Smarts, +GPA", "school", p)}
        ${careerActionButton("club", "Join a Club", "+Happiness", "users", p)}
        ${careerActionButton("skip", "Skip Class", "+Happiness, −GPA", "clock", p)}
        <button class="action-btn danger" data-act="career-action" data-arg="dropout">
          <span class="action-ico">${icon("close", 18)}</span>
          <span class="action-label">Drop Out</span>
          <span class="action-sub">Leave school</span>
        </button>
      </div>`);
  }

  const enroll = [];
  if (p.age >= 18 && (e.level === "none" || e.level === "hs")) {
    enroll.push(`<button class="action-btn" data-act="open-major" data-kind="university">
      <span class="action-ico">${icon("school", 18)}</span><span class="action-label">University</span><span class="action-sub">4 years • pick a major</span></button>`);
    enroll.push(`<button class="action-btn" data-act="enroll-trade">
      <span class="action-ico">${icon("briefcase", 18)}</span><span class="action-label">Trade School</span><span class="action-sub">2 years • practical skills</span></button>`);
  }
  if (e.level === "bachelor" && p.age >= 22) {
    enroll.push(`<button class="action-btn" data-act="open-major" data-kind="grad">
      <span class="action-ico">${icon("school", 18)}</span><span class="action-label">Graduate School</span><span class="action-sub">2 years • master's degree</span></button>`);
  }
  const note = e.droppedOut ? "You dropped out. You can still enroll in higher education." :
    p.age < 5 ? "You are too young for school. Enrollment starts at age 5." :
    p.age < 18 ? "You will be enrolled automatically." :
    e.level === "master" ? "You have completed your education." : "Choose your next step.";
  return panel("Education", educationLabel(p), `
    <div class="school-note">${icon("info", 15)} <span>${esc(note)}</span></div>
    ${enroll.length ? `<div class="action-grid">${enroll.join("")}</div>` : ""}`);
}

function jobPanel(p) {
  if (p.job) {
    const perf = p.job.performance || 0;
    return panel(p.job.title, p.job.company, `
      <div class="job-hero">
        <span class="job-hero-icon">${p.job.icon || "💼"}</span>
        <div class="job-hero-main">
          <strong>${fmtMoney(p.job.salary, p)}<small>/yr</small></strong>
          <span>Level ${p.job.level || 1} • ${p.job.years || 0} ${(p.job.years || 0) === 1 ? "year" : "years"} at this job</span>
        </div>
      </div>
      <div class="perf-wrap"><div class="perf-label"><span>Performance</span><b>${Math.round(perf)}</b></div><div class="perf-bar"><i style="width:${pct(perf)}%"></i></div></div>
      <div class="action-grid">
        ${careerActionButton("work", "Work Overtime", "+Performance, +Pay", "clock", p)}
        ${careerActionButton("promote", "Ask for Promotion", "Performance + experience", "chart", p)}
        ${careerActionButton("raise", "Ask for a Raise", "+Salary", "coin", p)}
        <button class="action-btn danger" data-act="career-action" data-arg="quit">
          <span class="action-ico">${icon("logout", 18)}</span><span class="action-label">Quit Job</span><span class="action-sub">Leave this position</span>
        </button>
        ${p.age >= 60 ? `<button class="action-btn" data-act="career-action" data-arg="retire">
          <span class="action-ico">${icon("sun", 18)}</span><span class="action-label">Retire</span><span class="action-sub">Pension ${fmtMoney(Math.round(p.job.salary * 0.4), p, { compact: true })}/yr</span>
        </button>` : ""}
      </div>`);
  }
  if (p.retired) {
    return panel("Retired", "The golden years", `
      <div class="school-note">${icon("sun", 15)} <span>You are retired with a pension of ${fmtMoney(p.pension, p)} per year.</span></div>`);
  }
  return panel("Career", "Unemployed", `
    <div class="school-note">${icon("briefcase", 15)} <span>You do not have a job. Browse the job market below and apply.</span></div>`);
}

function jobRow(j, p) {
  const meets = jobMeetsRequirements(j, p);
  const current = p.job?.id === j.id;
  return `<div class="job-row ${meets ? "" : "locked"}">
    <span class="job-row-ico">${j.icon}</span>
    <div class="job-row-main">
      <strong>${esc(j.title)}</strong>
      <span>${esc(j.company)}</span>
      <small>${esc(jobRequirementText(j))}</small>
    </div>
    <div class="job-row-right">
      <b>${fmtMoney(j.salary, p, { compact: true })}</b>
      ${current ? `<span class="pill current">Current</span>` : meets
        ? `<button class="mini-btn" data-act="job-apply" data-id="${j.id}">Apply</button>`
        : `<span class="lock">${icon("lock", 14)}</span>`}
    </div>
  </div>`;
}

function careerPage(p) {
  const jobs = [...JOBS].sort((a, b) => {
    const am = jobMeetsRequirements(a, p) ? 0 : 1;
    const bm = jobMeetsRequirements(b, p) ? 0 : 1;
    return am - bm || a.req.age - b.req.age || a.salary - b.salary;
  });
  const matches = jobs.filter((j) => jobMeetsRequirements(j, p)).length;
  let body = "";
  if (p.inPrison > 0) {
    body += panel("Incarcerated", `${p.inPrison} year${p.inPrison === 1 ? "" : "s"} remaining`, `
      <div class="school-note">${icon("lock", 15)} <span>You cannot work or study while in prison.</span></div>`);
  }
  body += schoolPanel(p);
  body += jobPanel(p);
  body += panel("Job Market", `${matches} matching ${matches === 1 ? "job" : "jobs"}`, `
    <div class="job-list">${jobs.map((j) => jobRow(j, p)).join("")}</div>`);
  return subpageShell("Career", p.job ? `${p.job.title} • ${fmtMoney(p.job.salary, p, { compact: true })}/yr` : "Work, learn, and grow", body);
}

/* ------------------------------------------------------------------ */
/* Assets                                                              */
/* ------------------------------------------------------------------ */
function assetsPage(p) {
  const nw = netWorth(p);
  const owned = p.assets || [];
  const ownedRows = owned.length ? owned.map((a) => `
    <div class="owned-row">
      <span class="asset-ico">${a.icon || "📦"}</span>
      <div class="owned-main"><strong>${esc(a.name)}</strong><span>Value ${fmtMoney(a.value || a.price, p, { compact: true })} • Upkeep ${fmtMoney(a.upkeep || 0, p, { compact: true })}/yr</span></div>
      <button class="mini-btn danger" data-act="sell-asset" data-id="${a.uid}">Sell</button>
    </div>`).join("") : `<div class="empty-state small"><div class="big">🏠</div><h3>Nothing owned yet</h3><p>Buy a home, a car, or something luxurious.</p></div>`;

  let catalog = "";
  for (const type of ASSET_TYPES) {
    const items = ASSET_CATALOG.filter((a) => a.type === type.id);
    catalog += `<div class="cat-head" style="--cat:#eef4f6">
        <span class="cat-ico">${type.icon}</span>
        <div><strong>${esc(type.name)}</strong><small>${esc(type.blurb)}</small></div>
      </div>
      <div class="asset-grid">${items.map((a) => `
        <button class="asset-card" data-act="buy-asset" data-id="${a.id}">
          <div class="asset-top"><span class="asset-ico">${a.icon}</span><span class="asset-price">${fmtMoney(a.price, p, { compact: true })}</span></div>
          <strong>${esc(a.name)}</strong>
          <span class="asset-desc">${esc(a.desc)}</span>
          <span class="asset-upkeep">Upkeep ${fmtMoney(a.upkeep, p, { compact: true })}/yr</span>
          <span class="buy-pill">${owned.some((o) => o.id === a.id) ? "Buy another" : "Buy"}</span>
        </button>`).join("")}</div>`;
  }

  const body = `
    <div class="worth-card">
      <div class="worth-main"><span>Net worth</span><strong>${fmtMoney(nw, p)}</strong></div>
      <div class="worth-grid">
        <div><span>Cash</span><b>${fmtMoney(p.money, p, { compact: true })}</b></div>
        <div><span>Investments</span><b>${fmtMoney(p.investments, p, { compact: true })}</b></div>
        <div><span>Assets</span><b>${fmtMoney(assetValue(p), p, { compact: true })}</b></div>
        <div><span>Debt</span><b class="${p.debt ? "bad" : ""}">${fmtMoney(p.debt, p, { compact: true })}</b></div>
      </div>
    </div>
    ${panel("Your Assets", `${owned.length} owned`, ownedRows)}
    <div class="section-label market-label">Marketplace</div>
    ${catalog}`;
  return subpageShell("Assets", "Build something that lasts", body);
}

/* ------------------------------------------------------------------ */
/* More                                                                */
/* ------------------------------------------------------------------ */
function morePage(p) {
  const fin = computeFinances(p);
  const ach = computeAchievements(p);
  const unlocked = ach.filter((a) => a.unlocked);
  const featured = [...unlocked, ...ach.filter((a) => !a.unlocked)].slice(0, 8);
  const lives = store.lives.length;
  const settingsRow = (key, label, sub) => `
    <div class="settings-row">
      <div><strong>${label}</strong><span>${sub}</span></div>
      <button class="switch ${store.settings[key] ? "on" : ""}" data-act="setting-toggle" data-key="${key}" aria-pressed="${store.settings[key]}"><i></i></button>
    </div>`;

  const body = `
    <div class="bank-card">
      <div class="bank-title">${icon("bank", 18)} <strong>Bank</strong><span>${fmtMoney(fin.net, p, { compact: true })}/yr</span></div>
      <div class="bank-grid">
        <div><span>Cash</span><b>${fmtMoney(p.money, p, { compact: true })}</b></div>
        <div><span>Investments</span><b>${fmtMoney(p.investments, p, { compact: true })}</b></div>
        <div><span>Debt</span><b class="${p.debt ? "bad" : ""}">${fmtMoney(p.debt, p, { compact: true })}</b></div>
        <div><span>Net worth</span><b>${fmtMoney(netWorth(p), p, { compact: true })}</b></div>
      </div>
      <div class="bank-actions">
        <button class="bank-btn" data-act="bank" data-kind="invest">Invest</button>
        <button class="bank-btn" data-act="bank" data-kind="withdraw">Withdraw</button>
        <button class="bank-btn" data-act="bank" data-kind="borrow">Borrow</button>
        <button class="bank-btn" data-act="bank" data-kind="repay">Repay</button>
      </div>
    </div>

    ${panel("Achievements", `${unlocked.length} of ${ach.length} unlocked`, `
      <div class="progress-line"><i style="width:${pct((unlocked.length / ach.length) * 100)}%"></i></div>
      <div class="ach-grid compact">${featured.map((a) => `
        <div class="ach ${a.unlocked ? "" : "locked"}">
          <span class="ach-ico">${a.icon}</span>
          <strong>${esc(a.name)}</strong>
          <span>${esc(a.desc)}</span>
        </div>`).join("")}</div>
      <button class="btn btn-secondary btn-block btn-sm" data-act="all-achievements">View all ribbons</button>`)}

    ${panel("Settings", "Sound, haptics, motion", `
      ${settingsRow("sound", "Sound", "Subtle taps and cues")}
      ${settingsRow("haptics", "Haptics", "Vibration feedback")}
      ${settingsRow("motion", "Motion", "Animations and transitions")}`)}

    ${panel("This Life", "History and app", `
      <button class="list-row" data-act="open-lives">
        <span class="list-icon">${icon("heart", 18)}</span>
        <span class="list-main"><strong>Lives</strong><span>${lives ? `${lives} past ${lives === 1 ? "life" : "lives"} saved` : "No past lives yet"}</span></span>
        <span class="chev">${icon("chevronRight", 18)}</span>
      </button>
      <button class="list-row" data-act="about">
        <span class="list-icon">${icon("info", 18)}</span>
        <span class="list-main"><strong>About Life Happens</strong><span>Version 1.0 • saved on this device</span></span>
        <span class="chev">${icon("chevronRight", 18)}</span>
      </button>
      <button class="list-row" data-act="new-life">
        <span class="list-icon">${icon("plus", 18)}</span>
        <span class="list-main"><strong>Start a New Life</strong><span>Your current life will be archived</span></span>
        <span class="chev">${icon("chevronRight", 18)}</span>
      </button>
      <button class="list-row" data-act="main-menu">
        <span class="list-icon">${icon("home", 18)}</span>
        <span class="list-main"><strong>Main Menu</strong><span>Save and return to the title screen</span></span>
        <span class="chev">${icon("chevronRight", 18)}</span>
      </button>`)}

    <div class="version-note">Life Happens v1.0 • An original life simulator</div>`;
  return subpageShell("More", "Bank, ribbons, settings, and history", body);
}

/* ------------------------------------------------------------------ */
/* Overlays: sheets and modals                                         */
/* ------------------------------------------------------------------ */
function openSheet({ title, sub, body, onMount }) {
  const root = $("#sheet-root");
  root.innerHTML = `<div class="overlay sheet-overlay">
    <div class="sheet" role="dialog" aria-modal="true">
      <div class="sheet-grip"></div>
      <div class="sheet-head">
        <div><h2>${esc(title)}</h2>${sub ? `<span>${esc(sub)}</span>` : ""}</div>
        <button class="sheet-close" data-act="sheet-close" aria-label="Close">${icon("close", 18)}</button>
      </div>
      <div class="sheet-body scroll">${body}</div>
    </div>
  </div>`;
  const overlay = root.querySelector(".sheet-overlay");
  if (overlay) overlay.addEventListener("click", (e) => { if (e.target === overlay) closeSheet(); });
  if (onMount) onMount(root.querySelector(".sheet"));
}

function closeSheet() {
  $("#sheet-root").innerHTML = "";
  ui.amountConfirm = null;
  ui.confirmAction = null;
}

function openModal(html) {
  $("#modal-root").innerHTML = `<div class="overlay modal-overlay">${html}</div>`;
}

function closeModal() {
  $("#modal-root").innerHTML = "";
  ui.currentEvent = null;
  ui.resultClose = null;
}

function openEventModal(modal) {
  const p = store.profile;
  if (!p || !modal) return;
  ui.currentEvent = modal;
  const choices = modal.choices || [];
  openModal(`<div class="modal-card event-modal">
    <div class="event-icon">${modal.icon || "✨"}</div>
    <div class="modal-kicker">${esc(modal.kicker || "Life Event")}</div>
    <h2 class="modal-title">${esc(modal.title || "What Happens Next?")}</h2>
    <p class="modal-text">${esc(modal.text || "")}</p>
    <div class="choice-list">
      ${choices.map((c, i) => {
        const need = c.requires?.money || 0;
        const cant = need > 0 && p.money < need;
        return `<button class="choice-btn" data-act="event-choice" data-index="${i}" ${cant ? "disabled" : ""}>
          <span class="choice-label">${esc(c.label)}</span>
          <span class="choice-sub">${cant ? `Need ${fmtMoney(need, p)}` : esc(c.sub || "")}</span>
        </button>`;
      }).join("")}
    </div>
  </div>`);
}

function openResultModal({ title, message, icon: ico, tone = "neutral", onClose }) {
  ui.resultClose = onClose || null;
  openModal(`<div class="modal-card result-modal ${tone}">
    <div class="event-icon small">${ico || "✨"}</div>
    <div class="modal-kicker">${esc(title || "What Happened")}</div>
    <p class="modal-text result-text">${esc(message || "")}</p>
    <button class="btn btn-primary btn-lg" data-act="result-close">Continue</button>
  </div>`);
}

function confirmThen({ title, message, confirmLabel = "Confirm", danger = false, onConfirm }) {
  ui.confirmAction = onConfirm || null;
  openSheet({
    title,
    body: `<p class="confirm-text">${esc(message)}</p>
      <div class="confirm-actions">
        <button class="btn btn-secondary btn-lg" data-act="confirm-cancel">Cancel</button>
        <button class="btn ${danger ? "btn-danger" : "btn-primary"} btn-lg" data-act="confirm-ok">${esc(confirmLabel)}</button>
      </div>`
  });
}

function openAmountSheet({ title, sub, maxUSD, confirmLabel, onConfirm }) {
  const p = store.profile;
  const rate = getCountry(p).currency.rate || 1;
  const maxLocal = Math.max(0, Math.floor(maxUSD * rate));
  if (maxLocal <= 0) {
    toast("Nothing available for that.", "negative");
    return;
  }
  ui.amountRate = rate;
  ui.amountMaxLocal = maxLocal;
  ui.amountConfirm = onConfirm;
  const symbol = getCountry(p).currency.symbol;
  openSheet({
    title,
    sub,
    body: `<div class="amount-wrap">
      <div class="amount-input"><span>${esc(symbol)}</span><input id="amount-input" type="number" inputmode="numeric" min="1" max="${maxLocal}" value="${maxLocal}"></div>
      <div class="amount-hint">Available: ${fmtMoney(maxUSD, p)}</div>
      <div class="quick-row">
        <button class="toggle-chip" data-act="amount-quick" data-pct="0.25">25%</button>
        <button class="toggle-chip" data-act="amount-quick" data-pct="0.5">50%</button>
        <button class="toggle-chip" data-act="amount-quick" data-pct="1">Max</button>
      </div>
      <button class="btn btn-primary btn-lg" data-act="amount-confirm">${esc(confirmLabel)}</button>
    </div>`
  });
}

function openCountrySheet() {
  openSheet({
    title: "Choose a Country",
    sub: "Your birthplace shapes your currency and names",
    body: `<div class="country-list">${Object.values(COUNTRIES).map((c) => `
      <button class="country-item ${ui.draft.countryCode === c.code ? "active" : ""}" data-act="country-select" data-code="${c.code}">
        <span class="flag">${c.flag}</span>
        <span class="name">${esc(c.name)}</span>
        <span class="cur">${c.currency.code}</span>
        ${ui.draft.countryCode === c.code ? `<span class="check">${icon("check", 18)}</span>` : ""}
      </button>`).join("")}</div>`
  });
}

function openCitySheet() {
  const c = COUNTRIES[ui.draft.countryCode] || COUNTRIES.US;
  openSheet({
    title: "Choose a City",
    sub: c.name,
    body: `<div class="country-list">${c.cities.map((city) => `
      <button class="country-item ${ui.draft.city === city ? "active" : ""}" data-act="city-select" data-city="${esc(city)}">
        <span class="flag">${icon("mapPin", 18)}</span>
        <span class="name">${esc(city)}</span>
        ${ui.draft.city === city ? `<span class="check">${icon("check", 18)}</span>` : ""}
      </button>`).join("")}</div>`
  });
}

function openMajorSheet(kind) {
  ui.majorMode = kind || "university";
  const grad = ui.majorMode === "grad";
  openSheet({
    title: grad ? "Choose a Graduate Program" : "Choose Your Major",
    sub: grad ? "2 years • master's degree" : "4 years • bachelor's degree",
    body: `<div class="major-list">${MAJORS.map((m) => `
      <button class="major-row" data-act="major-select" data-id="${m.id}">
        <span class="major-ico">${m.icon}</span>
        <span class="major-main"><strong>${esc(m.name)}</strong><span>${esc(m.desc)}</span></span>
        <span class="major-smarts">+${m.smarts} 🧠</span>
      </button>`).join("")}</div>`
  });
}

function openPersonSheet(id) {
  const p = store.profile;
  const rel = p?.relationships.find((r) => r.id === id);
  if (!rel) { closeSheet(); return; }
  const defs = personActionDefs(rel, p);
  const used = rel.lastInteractions || {};
  const alive = rel.alive !== false;
  openSheet({
    title: `${rel.firstName} ${rel.lastName}`,
    sub: `${relationLabel(rel)} • ${alive ? `Age ${rel.age}` : `Passed away at age ${rel.age}`}`,
    body: `<div class="person-hero">
        <div class="person-avatar">${avatarSVG(rel.appearance, { size: 84, dead: !alive })}</div>
        <div class="person-close-wrap"><div class="person-close"><i style="width:${pct(rel.closeness)}%"></i></div><span>${alive ? closenessLabel(rel.closeness) : "In memory"} • ${Math.round(rel.closeness)}/100</span></div>
      </div>
      <div class="action-grid">
        ${defs.map((d) => {
          const done = d.arg !== "visit" && used[d.arg] === p.age;
          return `<button class="action-btn ${d.danger ? "danger" : ""}" data-act="rel-action" data-id="${rel.id}" data-arg="${d.arg}" ${done ? "disabled" : ""}>
            <span class="action-ico">${icon(d.icon, 18)}</span>
            <span class="action-label">${esc(d.label)}</span>
            <span class="action-sub">${done ? "Done this year" : esc(d.sub)}</span>
          </button>`;
        }).join("")}
      </div>`
  });
}

function personActionDefs(rel, p) {
  const defs = [];
  const add = (arg, label, sub, ico, danger = false) => defs.push({ arg, label, sub, icon: ico, danger });
  if (rel.alive === false) {
    add("visit", "Visit the Grave", "Remember the good times", "heart");
    return defs;
  }
  if (rel.type === "pet") {
    add("play", "Play Together", "+Closeness, +Happiness", "sparkle");
    add("feed", "Feed", "$20", "coin");
    add("vet", "Vet Visit", "$150", "shield");
    return defs;
  }
  add("spend", "Spend Time", "+Closeness", "clock");
  add("compliment", "Compliment", "+Closeness", "smile");
  add("gift", "Give a Gift", "$100", "gift");
  add("argue", "Argue", "−Closeness", "warning");
  if (["mother", "father", "sibling", "grandparent"].includes(rel.type)) {
    add("askmoney", "Ask for Money", "Family favor", "coin");
  }
  if (rel.type === "partner") {
    add("propose", "Propose", "$2,000 • needs 75 bond", "ring");
    add("baby", "Try for a Baby", "$5,000", "baby");
    add("breakup", "Break Up", "End the relationship", "close", true);
  }
  if (rel.type === "spouse") {
    add("baby", "Try for a Baby", "$5,000", "baby");
    add("adopt", "Adopt a Child", "$15,000", "heart");
    add("breakup", "Divorce", "End the marriage", "close", true);
  }
  return defs;
}

function openAchievementsSheet() {
  const p = store.profile;
  const ach = computeAchievements(p);
  const unlocked = ach.filter((a) => a.unlocked).length;
  openSheet({
    title: "Ribbons",
    sub: `${unlocked} of ${ach.length} unlocked`,
    body: `<div class="progress-line"><i style="width:${pct((unlocked / ach.length) * 100)}%"></i></div>
      <div class="ach-grid">${[...ach].sort((a, b) => Number(b.unlocked) - Number(a.unlocked)).map((a) => `
        <div class="ach ${a.unlocked ? "" : "locked"}">
          <span class="ach-ico">${a.icon}</span>
          <strong>${esc(a.name)}</strong>
          <span>${esc(a.desc)}</span>
        </div>`).join("")}</div>`
  });
}

function openLivesSheet() {
  const lives = store.lives;
  const body = lives.length ? `<div class="lives-list">${lives.map((l) => `
    <button class="life-row" data-act="life-detail" data-id="${l.id}">
      <span class="life-avatar">${avatarSVG(l.appearance, { size: 46, dead: true })}</span>
      <span class="life-main"><strong>${esc(l.firstName)} ${esc(l.lastName)}</strong><span>Age ${l.age} • ${esc(l.cause || "Unknown")}</span></span>
      <span class="life-right"><b>${fmtMoney(l.netWorth, l)}</b><span>${l.ribbons?.length || 0} ribbons</span></span>
    </button>`).join("")}</div>`
    : `<div class="empty-state"><div class="big">🕯️</div><h3>No past lives</h3><p>Finished lives will be remembered here.</p></div>`;
  openSheet({ title: "Lives", sub: `${lives.length} remembered`, body });
}

function openLifeDetail(id) {
  const l = store.lives.find((x) => x.id === id);
  if (!l) return;
  const log = (l.log || []).slice(-18).map((e) => `<div class="log-item ${e.type || "neutral"}">
      <div class="log-ico">${icon(LOG_ICONS[e.type] || "dot", 14)}</div><p>${esc(e.text)}</p></div>`).join("");
  openSheet({
    title: `${l.firstName} ${l.lastName}`,
    sub: `${l.city || ""} • ${l.age} years • ${l.cause || "Unknown"}`,
    body: `<div class="life-detail-hero">${avatarSVG(l.appearance, { size: 88, dead: true })}</div>
      <div class="school-strip">
        <div><span>Net worth</span><strong>${fmtMoney(l.netWorth, l, { compact: true })}</strong></div>
        <div><span>Happiness</span><strong>${Math.round(l.happiness || 0)}</strong></div>
        <div><span>Health</span><strong>${Math.round(l.health || 0)}</strong></div>
      </div>
      <div class="school-note">${icon("briefcase", 15)} <span>${esc(l.job || "No career")} • ${esc(l.education || "No education")}</span></div>
      ${l.ribbons?.length ? `<div class="ribbon-row">${l.ribbons.map((r) => `<span class="ribbon">${r.icon} ${esc(r.name)}</span>`).join("")}</div>` : ""}
      <div class="section-label" style="margin:16px 0 8px">Final years</div>
      ${log || `<p class="muted tiny">No memories saved.</p>`}`
  });
}

function openSettingsSheet() {
  const row = (key, label, sub) => `<div class="settings-row">
      <div><strong>${label}</strong><span>${sub}</span></div>
      <button class="switch ${store.settings[key] ? "on" : ""}" data-act="setting-toggle" data-key="${key}" aria-pressed="${store.settings[key]}"><i></i></button>
    </div>`;
  openSheet({
    title: "Settings",
    sub: "Preferences for this device",
    body: `<div class="settings-card">
        ${row("sound", "Sound", "Subtle taps and cues")}
        ${row("haptics", "Haptics", "Vibration feedback")}
        ${row("motion", "Motion", "Animations and transitions")}
      </div>
      <button class="btn btn-danger btn-block" data-act="reset-data">Reset all data</button>
      <p class="hint center">This erases your current life, past lives, and settings.</p>`
  });
}

function openAboutSheet() {
  openSheet({
    title: "About Life Happens",
    sub: "Version 1.0",
    body: `<div class="about-hero">${logoMark(56)}</div>
      <p class="about-text">Life Happens is an original mobile life simulator. Grow up, choose a path, build a career, fall in love, raise a family, and see how your story ends.</p>
      <div class="about-facts">
        <div><span>Save data</span><b>Stored locally on this device</b></div>
        <div><span>Orientation</span><b>Portrait mobile</b></div>
        <div><span>Lives remembered</span><b>${store.lives.length}</b></div>
      </div>
      <p class="hint center">Not affiliated with BitLife or Candywriter. An original game inspired by the life-sim genre.</p>`
  });
}

function openDrawer() {
  const p = store.profile;
  if (!p) return;
  $("#drawer-root").innerHTML = `<div class="overlay drawer-overlay">
    <aside class="drawer">
      <div class="drawer-head">
        <button class="drawer-close" data-act="close-drawer" aria-label="Close">${icon("close", 20)}</button>
        <div class="drawer-avatar">${avatarSVG(p.appearance, { size: 64, dead: !p.alive })}</div>
        <strong>${esc(displayName(p))}</strong>
        <span>Age ${p.age} • ${esc(ageStage(p.age))}</span>
      </div>
      <div class="drawer-menu">
        <button class="drawer-item" data-act="drawer-item" data-item="life">${icon("user", 19)} My Life</button>
        <button class="drawer-item" data-act="drawer-item" data-item="lives">${icon("heart", 19)} Lives</button>
        <button class="drawer-item" data-act="drawer-item" data-item="achievements">${icon("trophy", 19)} Ribbons</button>
        <button class="drawer-item" data-act="drawer-item" data-item="settings">${icon("settings", 19)} Settings</button>
        <button class="drawer-item" data-act="drawer-item" data-item="about">${icon("info", 19)} About</button>
        <button class="drawer-item" data-act="drawer-item" data-item="new">${icon("plus", 19)} New Life</button>
        <button class="drawer-item" data-act="drawer-item" data-item="menu">${icon("home", 19)} Main Menu</button>
      </div>
      <div class="drawer-foot">Life Happens v1.0</div>
    </aside>
  </div>`;
  const overlay = $("#drawer-root .drawer-overlay");
  if (overlay) overlay.addEventListener("click", (e) => { if (e.target === overlay) closeDrawer(); });
}

function closeDrawer() {
  $("#drawer-root").innerHTML = "";
}

/* ------------------------------------------------------------------ */
/* Death screen                                                        */
/* ------------------------------------------------------------------ */
function renderDeath() {
  const p = store.profile;
  if (!p) { store.screen = "title"; return renderTitle(); }
  if (p.alive) { store.screen = "game"; return renderGame(); }
  setScreen("death");
  const achievements = p._achievements || computeAchievements(p).filter((a) => a.unlocked);
  const ribbons = achievements.slice(0, 14);
  const cause = p.death?.cause || "unknown causes";
  const birthYear = currentYear() - p.age;
  const kids = p.relationships.filter((r) => r.type === "child" && r.alive !== false).length;
  const spouse = p.relationships.find((r) => r.type === "spouse");
  const milestones = p.log.filter((e) => e.type === "milestone" || e.type === "death").slice(-14);

  $("#screen-death").innerHTML = `
    <div class="death-scroll scroll">
      <div class="death-top">LIFE HAPPENS</div>
      <div class="death-hero">
        <div class="death-avatar">${avatarSVG(p.appearance, { size: 118, dead: true })}</div>
        <h1>${esc(displayName(p))}</h1>
        <div class="death-years">${birthYear} – ${currentYear()}</div>
        <p class="death-cause">Died at age ${p.age} from ${esc(cause)}.</p>
        <p class="death-place">${esc(p.city)}, ${esc(getCountry(p).name)}</p>
      </div>
      <div class="death-stats">
        <div><span>Happiness</span><b>${Math.round(p.stats.happiness)}</b></div>
        <div><span>Health</span><b>${Math.round(p.stats.health)}</b></div>
        <div><span>Smarts</span><b>${Math.round(p.stats.smarts)}</b></div>
        <div><span>Looks</span><b>${Math.round(p.stats.looks)}</b></div>
      </div>
      <div class="death-summary">
        <div><span>Net worth</span><b>${fmtMoney(netWorth(p), p)}</b></div>
        <div><span>Career</span><b>${esc(p.job?.title || (p.retired ? "Retired" : "None"))}</b></div>
        <div><span>Children</span><b>${kids}</b></div>
        <div><span>Spouse</span><b>${esc(spouse?.firstName || "—")}</b></div>
      </div>
      ${ribbons.length ? `<div class="death-ribbons">${ribbons.map((r) => `<span class="ribbon">${r.icon} ${esc(r.name)}</span>`).join("")}</div>` : ""}
      <div class="death-highlights">
        <div class="section-label">Life highlights</div>
        ${milestones.length ? milestones.map((e) => `<div class="death-log ${e.type}">${esc(e.text)}</div>`).join("") : `<p class="muted tiny">A quiet life, remembered.</p>`}
      </div>
      <div class="death-actions">
        <button class="btn btn-primary btn-lg" data-act="death-new">Start a New Life</button>
        <button class="btn btn-ghost btn-lg" data-act="death-review">Review Full Life</button>
        <button class="btn btn-ghost btn-lg" data-act="death-menu">Main Menu</button>
      </div>
      <div class="death-foot">Every life leaves a story.</div>
    </div>`;
}

/* ------------------------------------------------------------------ */
/* Navigation and game-flow helpers                                    */
/* ------------------------------------------------------------------ */
function archiveCurrentLife() {
  const p = store.profile;
  if (p && p.alive && !p.archived) {
    p._achievements = computeAchievements(p).filter((a) => a.unlocked);
    archiveCurrent("Started a new life", true);
  }
}

function beginNewLife() {
  if (store.profile && store.profile.alive && !store.profile.archived) {
    confirmThen({
      title: "Start Over?",
      message: "Your current life will be saved to your Lives history, then you will create a new character.",
      confirmLabel: "Start a New Life",
      danger: true,
      onConfirm: () => {
        archiveCurrentLife();
        ui.draft = randomDraft();
        store.activeTab = null;
        store.screen = "create";
        renderCreate();
      }
    });
  } else {
    ui.draft = randomDraft();
    store.activeTab = null;
    store.screen = "create";
    renderCreate();
  }
}

function beginRandomLife() {
  const start = () => {
    const p = startRandomLife();
    store.activeTab = null;
    ui.feedRendered = false;
    renderGame({ scrollFeed: true });
    feedback("success");
    toast(`Welcome to the world, ${p.firstName}.`, "milestone");
  };
  if (store.profile && store.profile.alive && !store.profile.archived) {
    confirmThen({
      title: "Start Over?",
      message: "Your current life will be archived and a brand-new random life will begin.",
      confirmLabel: "Random Life",
      danger: true,
      onConfirm: () => { archiveCurrentLife(); start(); }
    });
  } else start();
}

function startLife() {
  const p = createProfile(ui.draft);
  ui.draft = null;
  store.activeTab = null;
  ui.feedRendered = false;
  renderGame({ scrollFeed: true });
  feedback("success");
  toast(`Welcome to the world, ${p.firstName}.`, "milestone");
}

function goTitle() {
  save();
  closeAllOverlays();
  closeDrawer();
  store.activeTab = null;
  store.screen = "title";
  ui.feedRendered = false;
  renderTitle();
}

function showDeath() {
  closeModal();
  closeSheet();
  closeDrawer();
  store.activeTab = null;
  store.screen = "death";
  renderDeath();
}

function openInvestSheet() {
  const p = store.profile;
  if (!p) return;
  if (p.money <= 0) { toast("You have no cash to invest.", "negative"); return; }
  openAmountSheet({
    title: "Invest",
    sub: "Put cash into the market",
    maxUSD: Math.floor(p.money),
    confirmLabel: "Invest",
    onConfirm: (usd) => investMoney(usd)
  });
}

function openBorrowSheet() {
  const p = store.profile;
  if (!p) return;
  const room = 200000 - p.debt;
  if (room <= 0) { toast("The bank will not lend you any more.", "negative"); return; }
  openAmountSheet({
    title: "Borrow",
    sub: "Take out a bank loan",
    maxUSD: room,
    confirmLabel: "Borrow",
    onConfirm: (usd) => borrowMoney(usd)
  });
}

function openRepaySheet() {
  const p = store.profile;
  if (!p) return;
  const max = Math.min(p.debt, p.money);
  if (max <= 0) { toast(p.debt <= 0 ? "You have no debt." : "You have no cash to repay.", "negative"); return; }
  openAmountSheet({
    title: "Repay Debt",
    sub: `You owe ${fmtMoney(p.debt, p)}`,
    maxUSD: Math.floor(max),
    confirmLabel: "Repay",
    onConfirm: (usd) => repayDebt(usd)
  });
}

function openLifeReview() {
  const p = store.profile;
  if (!p) return;
  const log = p.log.map((e) => `<div class="log-item ${e.type || "neutral"}">
      <div class="log-ico">${icon(LOG_ICONS[e.type] || "dot", 14)}</div>
      <p><b class="log-age">${e.age}</b> ${esc(e.text)}</p>
    </div>`).join("");
  openSheet({
    title: "Life Story",
    sub: `${displayName(p)} • ${p.age} years`,
    body: `<div class="review-log">${log || `<p class="muted tiny">No memories saved.</p>`}</div>`
  });
}

function handleEventChoice(index) {
  const ev = ui.currentEvent;
  const choice = ev?.choices?.[index];
  const res = resolveEvent(ev, index);
  if (!res || !res.ok) {
    toast(res?.message || "That choice is not available.", "negative");
    return;
  }
  closeModal();
  if (res.died) {
    feedback("error");
    showDeath();
    return;
  }
  feedback("success");
  renderGame();
  const eff = choice?.effects || {};
  const tone = (eff.happiness < 0 || eff.health < 0 || eff.money < 0) ? "negative"
    : (eff.money > 0 || eff.happiness > 0 || eff.health > 0) ? "positive" : "neutral";
  const after = () => {
    if (res.openMajor) openMajorSheet("university");
    else if (res.next) openEventModal(res.next);
  };
  if (res.message) {
    openResultModal({
      title: ev?.title || "What Happened",
      message: res.message,
      icon: ev?.icon,
      tone,
      onClose: after
    });
  } else after();
}

/* ------------------------------------------------------------------ */
/* Action router                                                       */
/* ------------------------------------------------------------------ */
function handleAction(act, ds) {
  const p = store.profile;

  switch (act) {
    /* Title */
    case "title-continue": {
      if (!p) return;
      if (p.alive) { store.activeTab = null; ui.feedRendered = false; renderGame({ scrollFeed: true }); }
      else showDeath();
      feedback("success");
      return;
    }
    case "title-new": return beginNewLife();
    case "title-random": return beginRandomLife();
    case "title-lives": return openLivesSheet();
    case "title-settings": return openSettingsSheet();
    case "title-about": return openAboutSheet();

    /* Create */
    case "create-back": {
      store.screen = "title";
      renderTitle();
      return;
    }
    case "create-random-avatar": {
      ui.draft.appearance = randomAppearance(ui.draft.gender);
      renderCreate();
      return;
    }
    case "create-gender": {
      ui.draft.gender = ds.value;
      if (ui.draft.gender === "female") ui.draft.appearance.beard = false;
      renderCreate();
      return;
    }
    case "create-hair": {
      const list = HAIR_STYLES;
      let idx = list.indexOf(ui.draft.appearance.hair);
      idx = (idx + Number(ds.dir || 1) + list.length) % list.length;
      ui.draft.appearance.hair = list[idx];
      renderCreate();
      return;
    }
    case "create-swatch": {
      ui.draft.appearance[ds.key] = ds.value;
      renderCreate();
      return;
    }
    case "create-toggle": {
      ui.draft.appearance[ds.key] = !ui.draft.appearance[ds.key];
      renderCreate();
      return;
    }
    case "create-country": return openCountrySheet();
    case "create-city": return openCitySheet();
    case "create-start": return startLife();
    case "country-select": {
      ui.draft.countryCode = ds.code;
      const c = COUNTRIES[ds.code] || COUNTRIES.US;
      ui.draft.city = randomFrom(c.cities);
      closeSheet();
      renderCreate();
      return;
    }
    case "city-select": {
      ui.draft.city = ds.city;
      closeSheet();
      renderCreate();
      return;
    }

    /* Main game */
    case "tab": {
      if (!p) return;
      store.activeTab = store.activeTab === ds.tab ? null : ds.tab;
      renderGame();
      return;
    }
    case "close-subpage": {
      store.activeTab = null;
      renderGame();
      return;
    }
    case "age": {
      if (!p || !p.alive) return;
      const res = ageUp();
      if (!res.ok) return;
      if (res.died) {
        feedback("error");
        showDeath();
        return;
      }
      feedback("success");
      renderGame({ scrollFeed: true });
      if (res.modal) openEventModal(res.modal);
      else toast(`You are now ${p.age}.`, "neutral");
      return;
    }

    /* Drawer */
    case "open-drawer": return openDrawer();
    case "close-drawer": return closeDrawer();
    case "drawer-item": {
      closeDrawer();
      if (ds.item === "life") { store.activeTab = "more"; renderGame(); }
      else if (ds.item === "lives") openLivesSheet();
      else if (ds.item === "achievements") openAchievementsSheet();
      else if (ds.item === "settings") openSettingsSheet();
      else if (ds.item === "about") openAboutSheet();
      else if (ds.item === "new") beginNewLife();
      else if (ds.item === "menu") goTitle();
      return;
    }

    /* Activities */
    case "activity": {
      const res = doActivity(ds.id);
      if (!res.ok) { feedback("error"); toast(res.message, "negative"); return; }
      if (res.openInvest) { openInvestSheet(); return; }
      if (res.died) { showDeath(); return; }
      feedback("success");
      renderGame();
      if (res.modal) openEventModal(res.modal);
      else toast(res.message || "Done.", "positive");
      return;
    }

    /* Relationships */
    case "rel": return openPersonSheet(ds.id);
    case "rel-action": {
      const res = relationshipAction(ds.id, ds.arg);
      if (!res.ok) { feedback("error"); toast(res.message, "negative"); return; }
      feedback("success");
      renderGame();
      toast(res.message, "positive");
      if (store.profile.relationships.some((r) => r.id === ds.id)) openPersonSheet(ds.id);
      else closeSheet();
      return;
    }

    /* Career */
    case "career-action": {
      const arg = ds.arg;
      if (arg === "dropout" || arg === "quit" || arg === "retire") {
        const copy = arg === "dropout"
          ? { title: "Drop Out?", message: "Leaving school now may limit your future opportunities.", label: "Drop Out" }
          : arg === "quit"
            ? { title: "Quit Your Job?", message: "You will lose your salary and need to find work again.", label: "Quit Job" }
            : { title: "Retire?", message: "You will stop working and begin collecting your pension.", label: "Retire" };
        confirmThen({
          title: copy.title, message: copy.message, confirmLabel: copy.label, danger: true,
          onConfirm: () => careerAction(arg)
        });
        return;
      }
      const res = careerAction(arg);
      if (!res.ok) { feedback("error"); toast(res.message, "negative"); return; }
      if (res.openMajor) { openMajorSheet("university"); return; }
      feedback("success");
      renderGame();
      toast(res.message || "Done.", "neutral");
      return;
    }
    case "job-apply": {
      const res = applyForJob(ds.id);
      if (!res.ok) { feedback("error"); toast(res.message, "negative"); return; }
      feedback(res.hired ? "success" : "error");
      renderGame();
      toast(res.message, res.hired ? "positive" : "negative");
      return;
    }
    case "open-major": return openMajorSheet(ds.kind || "university");
    case "enroll-trade": {
      const res = enrollTrade();
      if (!res.ok) { feedback("error"); toast(res.message, "negative"); return; }
      feedback("success");
      store.activeTab = "career";
      renderGame();
      toast(res.message, "positive");
      return;
    }
    case "major-select": {
      const res = ui.majorMode === "grad" ? enrollGrad(ds.id) : enrollUniversity(ds.id);
      if (!res.ok) { feedback("error"); toast(res.message, "negative"); return; }
      closeSheet();
      feedback("success");
      store.activeTab = "career";
      renderGame();
      toast(res.message, "positive");
      return;
    }

    /* Assets */
    case "buy-asset": {
      const item = ASSET_MAP[ds.id];
      if (!item) return;
      if (p.money < item.price) { feedback("error"); toast(`You need ${fmtMoney(item.price, p)} for that.`, "negative"); return; }
      confirmThen({
        title: `Buy ${item.name}?`,
        message: `Price ${fmtMoney(item.price, p)} • upkeep ${fmtMoney(item.upkeep, p)}/yr. ${item.desc}`,
        confirmLabel: `Buy for ${fmtMoney(item.price, p, { compact: true })}`,
        onConfirm: () => buyAsset(item.id)
      });
      return;
    }
    case "sell-asset": {
      const item = p.assets.find((a) => a.uid === ds.id);
      if (!item) return;
      confirmThen({
        title: `Sell ${item.name}?`,
        message: `You will receive about ${fmtMoney(Math.round((item.value || item.price) * 0.75), p)}.`,
        confirmLabel: "Sell",
        danger: true,
        onConfirm: () => sellAsset(item.uid)
      });
      return;
    }

    /* Bank */
    case "bank": {
      if (ds.kind === "invest") return openInvestSheet();
      if (ds.kind === "borrow") return openBorrowSheet();
      if (ds.kind === "repay") return openRepaySheet();
      if (ds.kind === "withdraw") {
        if (p.investments <= 0) { toast("You have no investments.", "negative"); return; }
        confirmThen({
          title: "Withdraw Investments?",
          message: `Move ${fmtMoney(p.investments, p)} back into your cash balance.`,
          confirmLabel: "Withdraw All",
          onConfirm: () => withdrawInvestments()
        });
      }
      return;
    }
    case "amount-quick": {
      const input = $("#amount-input");
      if (!input) return;
      input.value = Math.max(1, Math.floor(ui.amountMaxLocal * Number(ds.pct || 1)));
      return;
    }
    case "amount-confirm": {
      const input = $("#amount-input");
      const raw = Math.max(0, Number(input?.value) || 0);
      const usd = raw > 0 ? Math.max(1, Math.round(raw / (ui.amountRate || 1))) : 0;
      const fn = ui.amountConfirm;
      if (!fn) { closeSheet(); return; }
      const res = fn(usd);
      if (res?.ok) {
        closeSheet();
        feedback("success");
        toast(res.message || "Done.", "positive");
        renderGame();
      } else {
        feedback("error");
        toast(res?.message || "Enter a valid amount.", "negative");
      }
      return;
    }

    /* Settings and misc */
    case "setting-toggle": {
      const key = ds.key;
      store.settings[key] = !store.settings[key];
      setSetting(key, store.settings[key]);
      const btn = document.querySelector(`[data-act="setting-toggle"][data-key="${key}"]`);
      if (btn) {
        btn.classList.toggle("on", !!store.settings[key]);
        btn.setAttribute("aria-pressed", String(!!store.settings[key]));
      }
      applySettings();
      feedback("tap");
      return;
    }
    case "reset-data": {
      confirmThen({
        title: "Reset Everything?",
        message: "This permanently erases your current life, all past lives, and your settings.",
        confirmLabel: "Reset All Data",
        danger: true,
        onConfirm: () => {
          resetAll();
          closeAllOverlays();
          ui.draft = null;
          store.screen = "title";
          renderTitle();
          return { ok: true, message: "All data reset." };
        }
      });
      return;
    }
    case "all-achievements": return openAchievementsSheet();
    case "open-lives": return openLivesSheet();
    case "life-detail": return openLifeDetail(ds.id);
    case "about": return openAboutSheet();
    case "new-life": return beginNewLife();
    case "main-menu": return goTitle();

    /* Modals */
    case "event-choice": return handleEventChoice(Number(ds.index));
    case "result-close": {
      const fn = ui.resultClose;
      closeModal();
      if (fn) fn();
      if (store.screen === "game" && !$("#modal-root").innerHTML && !$("#sheet-root").innerHTML) renderGame();
      return;
    }
    case "confirm-cancel": return closeSheet();
    case "confirm-ok": {
      const fn = ui.confirmAction;
      ui.confirmAction = null;
      closeSheet();
      const res = fn ? fn() : null;
      if (res && res.ok === false) { feedback("error"); toast(res.message || "That did not work.", "negative"); }
      else if (res && res.message) { feedback("success"); toast(res.message, "positive"); }
      else feedback("success");
      if (store.screen === "game") renderGame();
      else if (store.screen === "create") renderCreate();
      else if (store.screen === "death") renderDeath();
      else if (store.screen === "title") renderTitle();
      return;
    }
    case "sheet-close": return closeSheet();

    /* Death */
    case "death-new": return beginNewLife();
    case "death-review": return openLifeReview();
    case "death-menu": return goTitle();

    default:
      return;
  }
}
