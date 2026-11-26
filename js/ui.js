import {
  COUNTRIES, SKIN_TONES, HAIR_COLORS, HAIR_STYLES, ACHIEVEMENTS, CHALLENGE,
  ASSETS, ACTIVITY_CATEGORIES, ACTIVITY_ACTIONS,
  money, moneyFull, fullName, rand, randInt, chance, clamp,
} from './data.js';
import { avatarSVG, randomAvatar, flagSVG } from './avatar.js';
import * as G from './game.js';

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

let draft = null;
let panel = { type: null, view: null };
let modalOpen = false;
let audioCtx = null;
let toastTimer = null;

function displayMoney(n) {
  if (Math.abs(n) >= 1_000_000) return money(n);
  return moneyFull(n);
}
const IRREGULAR_PLURALS = { child: 'children', person: 'people', life: 'lives', man: 'men', woman: 'women' };
function plural(n, word) { return `${n} ${n === 1 ? word : (IRREGULAR_PLURALS[word] || word + 's')}`; }
function flagHTML(code) { return flagSVG(code); }
function avatarHTML(a, cls = 'avatar-md', age = null) { return `<div class="${cls}">${avatarSVG(a, { age })}</div>`; }
const PET_EMOJI = { Biscuit: '🐶', Pepper: '🐱', Mochi: '🐱', Waffles: '🐶', Shadow: '🐱', Luna: '🐱', Charlie: '🐶', Bean: '🐱' };
function petEmoji(r) { return PET_EMOJI[r.firstName] || '🐾'; }

// ---------------------------------------------------------------------------
// Sound & haptics
// ---------------------------------------------------------------------------
function blip(freq = 520, dur = 0.035, vol = 0.018) {
  if (!G.state.settings.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = vol;
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + dur);
  } catch {}
}
function haptic(ms = 8) {
  if (!G.state.settings.haptics) return;
  try { navigator.vibrate?.(ms); } catch {}
}
document.addEventListener('pointerdown', e => {
  if (e.target.closest('button')) { blip(); haptic(7); }
}, { passive: true });

// ---------------------------------------------------------------------------
// Toast / FX
// ---------------------------------------------------------------------------
export function toast(message, ms = 2200) {
  const t = $('#toast');
  t.textContent = message;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}
export function confetti(emoji = '✨') {
  const fx = $('#fx');
  const bits = ['✨', '🎉', '⭐', emoji, '💫'];
  for (let i = 0; i < 16; i++) {
    const b = document.createElement('span');
    b.className = 'fx-bit';
    b.textContent = bits[i % bits.length];
    b.style.left = (35 + Math.random() * 30) + '%';
    b.style.top = (44 + Math.random() * 12) + '%';
    b.style.setProperty('--dx', (Math.random() * 220 - 110) + 'px');
    b.style.setProperty('--dy', (-60 - Math.random() * 160) + 'px');
    b.style.setProperty('--rot', (Math.random() * 500 - 250) + 'deg');
    b.style.animationDelay = (Math.random() * 0.15) + 's';
    fx.appendChild(b);
    setTimeout(() => b.remove(), 1500);
  }
}
function showAchievements(list) {
  if (!list?.length) return;
  const a = list[0];
  toast(`🏆 Achievement: ${a.name}`);
  confetti('🏆');
  blip(760, 0.09, 0.03);
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------
export function showScreen(name) {
  G.state.screen = name;
  $('#screen-title').classList.toggle('hidden', name !== 'title');
  $('#screen-create').classList.toggle('hidden', name !== 'create');
  $('#screen-game').classList.toggle('hidden', name !== 'game');
  if (name !== 'game') closePanel(true);
  if (name === 'title') renderTitle();
  if (name === 'create') renderCreate();
  if (name === 'game') renderGame(true);
}

function renderTitle() {
  const saved = G.hasSave();
  const p = G.state.player;
  $('#titleAvatar').innerHTML = saved && p
    ? avatarSVG(p.avatar, { age: p.age })
    : avatarSVG(randomAvatar(chance(.5) ? 'female' : 'male'), { age: 26 });
  $('#btnContinue').classList.toggle('hidden', !saved);
  $('#btnPlay').textContent = saved ? 'New Life' : 'Play';
}

export function newDraft() {
  const gender = chance(.5) ? 'female' : 'male';
  return {
    gender,
    country: COUNTRIES[0],
    avatar: randomAvatar(gender),
    firstName: G.randomFirstName(gender),
    lastName: G.randomLastName(),
  };
}

function renderCreate() {
  if (!draft) draft = newDraft();
  $('#inputFirst').value = draft.firstName;
  $('#inputLast').value = draft.lastName;
  $('#createAvatar').innerHTML = avatarSVG(draft.avatar, { age: 0 });
  $('#countryName').textContent = draft.country.name;
  $('#countryFlag').innerHTML = flagHTML(draft.country.code);
  $$('#genderSegment button').forEach(b => b.classList.toggle('active', b.dataset.gender === draft.gender));
  renderSwatches();
}
function renderSwatches() {
  const skin = $('#skinSwatches');
  skin.innerHTML = SKIN_TONES.map((s, i) => `<button class="swatch ${i === draft.avatar.skin ? 'active' : ''}" data-skin="${i}" style="background:${s.base}" aria-label="Skin tone ${i + 1}"></button>`).join('');
  const hair = $('#hairSwatches');
  hair.innerHTML = HAIR_COLORS.map((h, i) => `<button class="swatch ${i === draft.avatar.hairColor ? 'active' : ''}" data-hair="${i}" style="background:${h.base}" aria-label="${h.name} hair"></button>`).join('');
  $$('.swatch[data-skin]').forEach(b => b.onclick = () => { draft.avatar.skin = +b.dataset.skin; $('#createAvatar').innerHTML = avatarSVG(draft.avatar, { age: 0 }); renderSwatches(); });
  $$('.swatch[data-hair]').forEach(b => b.onclick = () => { draft.avatar.hairColor = +b.dataset.hair; $('#createAvatar').innerHTML = avatarSVG(draft.avatar, { age: 0 }); renderSwatches(); });
}
function shuffleLook() {
  const a = randomAvatar(draft.gender);
  draft.avatar = { ...a, skin: chance(.5) ? a.skin : draft.avatar.skin, hairColor: chance(.5) ? a.hairColor : draft.avatar.hairColor };
  $('#createAvatar').innerHTML = avatarSVG(draft.avatar, { age: 0 });
  renderSwatches();
}
function randomizeAll() {
  draft = newDraft();
  renderCreate();
}

function startLifeFromDraft() {
  const first = ($('#inputFirst').value || '').trim().slice(0, 16) || G.randomFirstName(draft.gender);
  const last = ($('#inputLast').value || '').trim().slice(0, 16) || G.randomLastName();
  draft.firstName = first; draft.lastName = last;
  G.startNewLife({ firstName: first, lastName: last, gender: draft.gender, country: draft.country, avatar: draft.avatar });
  showScreen('game');
  toast(`Welcome to the world, ${first}.`);
  confetti('👶');
}

// ---------------------------------------------------------------------------
// Game screen
// ---------------------------------------------------------------------------
export function renderGame(scroll = false) {
  const p = G.state.player;
  if (!p) return;
  const c = G.countryByCode(p.country);
  $('#charAvatar').innerHTML = avatarSVG(p.avatar, { age: p.age });
  $('#charFlag').innerHTML = flagHTML(p.country);
  $('#charName').textContent = fullName(p);
  $('#charOccEmoji').textContent = G.occupationEmoji(p);
  $('#charOcc').textContent = G.occupationLabel(p);
  const mv = $('#btnMoney');
  mv.textContent = displayMoney(p.money);
  mv.style.color = p.money < 0 ? '#ff6b6b' : '';
  $('#btnBank').textContent = p.money < 0 ? 'Bank Balance · Debt' : 'Bank Balance';

  for (const [stat, value] of Object.entries(p.stats)) {
    const row = $(`.stat-row[data-stat="${stat}"]`);
    if (!row) continue;
    const fill = $('.stat-fill', row);
    const pct = $('.stat-pct', row);
    fill.style.width = Math.max(0, Math.min(100, value)) + '%';
    fill.classList.toggle('mid', value < 55 && value >= 28);
    fill.classList.toggle('low', value < 28);
    row.classList.toggle('tiny', value < 8);
    pct.textContent = Math.round(value) + '%';
  }

  renderLog(scroll);
  $('#panelMoney').textContent = displayMoney(p.money);
  if (!p.alive) {
    $('#btnAge').disabled = true;
    $('.age-label').textContent = 'RIP';
    $('.age-plus').textContent = '🪦';
  } else {
    $('#btnAge').disabled = false;
    $('.age-label').textContent = 'Age';
    $('.age-plus').textContent = '+';
  }
  if (panel.type) renderPanelBody();
}

function renderLog(scroll) {
  const p = G.state.player;
  const log = $('#lifeLog');
  let html = '';
  let lastAge = null;
  for (const entry of p.log) {
    if (entry.age !== lastAge) {
      lastAge = entry.age;
      html += `<div class="log-age">Age: ${entry.age} ${entry.age === 1 ? 'year' : 'years'}</div>`;
    }
    html += `<div class="log-line ${entry.type || ''}">${esc(entry.text)}</div>`;
  }
  if (!p.log.length) {
    html = '<div class="log-empty">Your story begins...</div>';
  } else if (p.age > lastAge) {
    html += `<div class="log-age">Age: ${p.age} ${p.age === 1 ? 'year' : 'years'}</div>`;
  }
  log.innerHTML = html;
  if (scroll) requestAnimationFrame(() => { log.scrollTop = log.scrollHeight; });
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------
export function openPanel(type, view = null) {
  const p = G.state.player;
  if (!p) return;
  panel = { type, view };
  $('#panel').classList.remove('hidden');
  document.body.classList.add('panel-open');
  renderPanelChrome();
  renderPanelBody();
  $('#panelBody').scrollTop = 0;
}
export function closePanel(force = false) {
  if (!force && panel.view) { panel.view = null; renderPanelChrome(); renderPanelBody(); return; }
  panel = { type: null, view: null };
  $('#panel').classList.add('hidden');
  document.body.classList.remove('panel-open');
}
function pushView(view) {
  panel.view = view;
  $('#panelBody').scrollTop = 0;
  renderPanelChrome();
  renderPanelBody();
}
const PANEL_CLOSE_ICON = '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>';
const PANEL_BACK_ICON = '<svg viewBox="0 0 24 24"><path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function renderPanelChrome() {
  const p = G.state.player;
  if (!p) return;
  $('#panelAvatar').innerHTML = avatarSVG(p.avatar, { age: p.age });
  $('#panelName').textContent = fullName(p);
  $('#panelOcc').textContent = G.occupationLabel(p);
  const moneyEl = $('#panelMoney');
  moneyEl.textContent = displayMoney(p.money);
  moneyEl.classList.toggle('debt', p.money < 0);
  const back = $('#panelBack');
  back.innerHTML = panel.view ? PANEL_BACK_ICON : PANEL_CLOSE_ICON;
  back.setAttribute('aria-label', panel.view ? 'Back' : 'Close');
}
function panelTitleFor() {
  if (panel.view?.title) return panel.view.title;
  const map = { job: 'Job', assets: 'Assets', relationships: 'Relationships', activities: 'Activities', menu: 'Menu', achievements: 'Achievements', finances: 'Finances', shop: 'Shop' };
  return map[panel.type] || 'Life Happens';
}
function renderPanelBody() {
  const p = G.state.player;
  if (!p) return;
  renderPanelChrome();
  $('#panelTitle').textContent = panelTitleFor();
  const body = $('#panelBody');
  if (panel.view) { renderPanelView(body); return; }
  switch (panel.type) {
    case 'job': renderJobPanel(body); break;
    case 'assets': renderAssetsPanel(body); break;
    case 'relationships': renderRelationshipsPanel(body); break;
    case 'activities': renderActivitiesPanel(body); break;
    case 'menu': renderMenuPanel(body); break;
    case 'achievements': renderAchievementsPanel(body); break;
    case 'finances': renderFinancesPanel(body); break;
    default: body.innerHTML = '';
  }
}
function renderPanelView(body) {
  const v = panel.view;
  if (v.kind === 'category') renderCategory(body, v.id);
  else if (v.kind === 'achievements') renderAchievementsPanel(body);
  else if (v.kind === 'settings') renderSettingsPanel(body);
  else if (v.kind === 'stats') renderStatsPanel(body);
  else if (v.kind === 'shop') renderShop(body, v.category || 'Vehicle');
  else if (v.kind === 'finances') renderFinancesPanel(body);
  else body.innerHTML = '';
}

// ---------------------------------------------------------------------------
// Job panel
// ---------------------------------------------------------------------------
function renderJobPanel(body) {
  const p = G.state.player;
  let html = '';
  if (p.job) {
    const perf = Math.round(p.job.performance || 0);
    html += `<div class="hero-card">
      <div class="hero-top">
        <div class="row-emoji" style="width:52px;height:52px;font-size:26px">${p.job.icon || '💼'}</div>
        <div class="hero-info">
          <div class="hero-kicker">Currently employed</div>
          <div class="hero-title">${esc(p.job.title)}</div>
          <div class="hero-sub">${esc(p.job.company)} · ${plural(p.job.years || 0, 'year')}</div>
        </div>
        <div class="hero-money"><b>${money(p.job.salary)}</b><span>per year</span></div>
      </div>
      <div class="mini-bar ${perf < 40 ? 'warm' : ''}"><i style="width:${perf}%"></i></div>
      <div class="mini-label"><span>Performance</span><span>${perf}%</span></div>
    </div>
    <div class="section-label">Work</div>
    <div class="menu-list">
      <button class="list-row" data-jobact="work"><span class="row-emoji">💪</span><span class="row-main"><span class="row-title">Work Harder</span><span class="row-sub">Boost your performance</span></span><span class="row-chev">›</span></button>
      <button class="list-row" data-jobact="raise"><span class="row-emoji">💰</span><span class="row-main"><span class="row-title">Ask for a Raise</span><span class="row-sub">Try for more money</span></span><span class="row-chev">›</span></button>
      <button class="list-row" data-jobact="promote"><span class="row-emoji">📈</span><span class="row-main"><span class="row-title">Ask for Promotion</span><span class="row-sub">Needs 68% performance</span></span><span class="row-chev">›</span></button>
      <button class="list-row" data-jobact="quit"><span class="row-emoji">🚪</span><span class="row-main"><span class="row-title">Quit Job</span><span class="row-sub">Walk away</span></span><span class="row-chev">›</span></button>
      ${p.age >= 55 ? `<button class="list-row" data-jobact="retire"><span class="row-emoji">🌴</span><span class="row-main"><span class="row-title">Retire</span><span class="row-sub">Start the easy life</span></span><span class="row-chev">›</span></button>` : ''}
    </div>`;
  } else {
    html += `<div class="empty-card"><span class="big">${p.retired ? '🌴' : '💼'}</span><b>${p.retired ? 'Retired' : 'Unemployed'}</b>${p.retired ? 'You are enjoying the quiet life.' : 'Find a job below to start earning money.'}</div>`;
  }

  html += `<div class="section-label">Education <span class="lbl-right">${esc(G.educationLabel(p))}</span></div>`;
  if (p.pendingEducation) {
    html += `<div class="empty-card" style="padding:14px"><b>${p.pendingEducation.type === 'grad' ? 'Graduate School' : 'University'}</b>${plural(p.pendingEducation.years, 'year')} remaining</div>`;
  } else {
    html += `<button class="list-row" data-open-activities="education"><span class="row-emoji">🎓</span><span class="row-main"><span class="row-title">Education</span><span class="row-sub">Study, enroll, and improve your smarts</span></span><span class="row-right">Open ›</span></button>`;
  }

  html += `<div class="section-label">Job Listings <span class="lbl-right">${G.jobListings().length} available</span></div>`;
  const listings = G.jobListings();
  if (!listings.length) {
    html += `<div class="empty-card">No jobs available yet. Improve your education and stats.</div>`;
  } else {
    for (const j of listings.slice(0, 14)) {
      const req = [];
      if (j.smarts) req.push(`${j.smarts} Smarts`);
      if (j.looks) req.push(`${j.looks} Looks`);
      const reqText = req.length ? req.join(' · ') : 'No requirements';
      html += `<button class="list-row" data-job="${j.id}">
        <span class="row-emoji">${j.icon}</span>
        <span class="row-main"><span class="row-title">${esc(j.title)}</span><span class="row-sub">${esc(reqText)} · ${esc(j.category)}</span></span>
        <span class="row-right ${j.eligible ? 'green' : 'red'}">${money(j.salary)}<span class="tiny-sub">${j.eligible ? 'Apply' : 'Locked'}</span></span>
      </button>`;
    }
  }
  body.innerHTML = html;

  $$('[data-jobact]', body).forEach(b => b.onclick = () => {
    const act = b.dataset.jobact;
    if (act === 'work') { const r = G.workHarder(); handleResult(r); renderGame(); renderPanelBody(); }
    if (act === 'raise') { const r = G.askRaise(); handleResult(r); renderGame(); renderPanelBody(); }
    if (act === 'promote') { const r = G.askPromotion(); handleResult(r); renderGame(); renderPanelBody(); }
    if (act === 'quit') confirmModal('Quit your job?', 'You will lose your salary and start over.', () => { const r = G.quitJob(); handleResult(r); renderGame(); renderPanelBody(); });
    if (act === 'retire') confirmModal('Retire?', 'You will stop working and receive a pension.', () => { const r = G.retire(); handleResult(r); renderGame(); renderPanelBody(); });
  });
  $$('[data-job]', body).forEach(b => b.onclick = () => {
    const j = G.jobListings().find(x => x.id === b.dataset.job);
    if (j) showJobModal(j);
  });
  $$('[data-open-activities]', body).forEach(b => b.onclick = () => { panel = { type: 'activities', view: { kind: 'category', id: b.dataset.openActivities, title: 'Education' } }; renderPanelBody(); });
}

function showJobModal(job) {
  const p = G.state.player;
  const req = [];
  if (job.smarts) req.push(`${job.smarts} Smarts`);
  if (job.looks) req.push(`${job.looks} Looks`);
  const edu = { none: 'No Education', hs: 'High School', uni: 'University', grad: 'Graduate School' }[job.edu];
  const body = `<p class="modal-blue">${esc(job.title)}</p>
    <p>A <b>${esc(job.category)}</b> role at <b>${esc(job.company)}</b>.</p>
    <div class="profile-table">
      <div class="pt-row"><span>Salary</span><b>${moneyFull(job.salary)} / year</b></div>
      <div class="pt-row"><span>Education</span><b>${edu}</b></div>
      <div class="pt-row"><span>Requirements</span><b>${req.length ? req.join(' · ') : 'None'}</b></div>
    </div>
    <p>${job.eligible ? 'You meet the requirements. Apply now?' : 'Your stats are below the requirements. You can still try.'}</p>`;
  showModal({
    title: 'Job Opening',
    body,
    options: [
      { label: 'Apply for this job', primary: true, onClick: () => {
        const r = G.applyForJob(job.id, job.company);
        closeModal();
        handleResult(r);
        renderGame();
        renderPanelBody();
      } },
      { label: 'Maybe later', onClick: () => closeModal() },
    ],
    dismissible: true,
  });
}

// ---------------------------------------------------------------------------
// Assets panel
// ---------------------------------------------------------------------------
function renderAssetsPanel(body) {
  const p = G.state.player;
  const nw = G.netWorth(p);
  const assets = p.assets || [];
  let html = `<div class="hero-card">
    <div class="hero-top">
      <div class="hero-info">
        <div class="hero-kicker">Net worth</div>
        <div class="hero-title">${displayMoney(nw)}</div>
        <div class="hero-sub">${plural(assets.length, 'asset')} · ${displayMoney(p.money)} in the bank</div>
      </div>
      <div class="hero-money"><b style="color:${p.debt ? '#ff7b7b' : '#4ade4f'}">${p.debt ? '-' + displayMoney(p.debt) : displayMoney(p.money)}</b><span>${p.debt ? 'Debt' : 'Available'}</span></div>
    </div>
    <div class="hero-stats">
      <div class="hero-stat">Bank<b>${displayMoney(p.money)}</b></div>
      <div class="hero-stat">Assets<b>${displayMoney(assets.reduce((s, a) => s + a.value, 0))}</b></div>
      <div class="hero-stat">Debt<b>${displayMoney(p.debt || 0)}</b></div>
    </div>
  </div>`;

  html += `<div class="section-label">Your Assets</div>`;
  if (!assets.length) {
    html += `<div class="empty-card"><span class="big">🏚️</span><b>Nothing yet</b>Buy your first car, home or luxury item below.</div>`;
  } else {
    for (const [i, a] of assets.entries()) {
      html += `<button class="list-row" data-asset="${i}">
        <span class="row-emoji">${a.icon}</span>
        <span class="row-main"><span class="row-title">${esc(a.name)}</span><span class="row-sub">${a.type} · upkeep ${money(a.upkeep)}/yr</span></span>
        <span class="row-right green">${displayMoney(a.value)}<span class="tiny-sub">Manage ›</span></span>
      </button>`;
    }
  }

  html += `<div class="section-label">Go Shopping</div>
    <div class="menu-list">
      ${['Vehicle', 'Property', 'Luxury', 'Tech'].map(t => {
        const icons = { Vehicle: '🚗', Property: '🏠', Luxury: '💎', Tech: '📱' };
        const names = { Vehicle: 'Vehicles', Property: 'Properties', Luxury: 'Luxury', Tech: 'Tech' };
        const browse = { Vehicle: 'Browse vehicles', Property: 'Browse properties', Luxury: 'Browse luxury items', Tech: 'Browse tech' };
        return `<button class="list-row" data-shop="${t}"><span class="row-emoji">${icons[t]}</span><span class="row-main"><span class="row-title">${names[t]}</span><span class="row-sub">${browse[t]}</span></span><span class="row-chev">›</span></button>`;
      }).join('')}
    </div>`;
  body.innerHTML = html;

  $$('[data-shop]', body).forEach(b => b.onclick = () => pushView({ kind: 'shop', category: b.dataset.shop, title: b.dataset.shop === 'Vehicle' ? 'Vehicles' : b.dataset.shop === 'Property' ? 'Properties' : b.dataset.shop === 'Luxury' ? 'Luxury' : 'Tech' }));
  $$('[data-asset]', body).forEach(b => b.onclick = () => {
    const i = +b.dataset.asset;
    const a = G.state.player.assets[i];
    if (!a) return;
    showModal({
      title: a.name,
      body: `<div class="modal-avatar-row"><div class="row-emoji" style="width:54px;height:54px;font-size:28px">${a.icon}</div><div class="who"><b>${esc(a.name)}</b><span>${a.type}</span></div></div>
        <div class="profile-table">
          <div class="pt-row"><span>Current value</span><b>${moneyFull(a.value)}</b></div>
          <div class="pt-row"><span>Purchase price</span><b>${moneyFull(a.purchasePrice || a.value)}</b></div>
          <div class="pt-row"><span>Yearly upkeep</span><b>${moneyFull(a.upkeep)}</b></div>
        </div>
        <p>Selling now would get you about <b>${moneyFull(Math.round(a.value * 0.82))}</b>.</p>`,
      options: [
        { label: 'Sell this asset', danger: true, onClick: () => { const r = G.sellAsset(i); closeModal(); handleResult(r); renderGame(); renderPanelBody(); } },
        { label: 'Keep it', onClick: () => closeModal() },
      ],
      dismissible: true,
    });
  });
}

function renderShop(body, category) {
  const p = G.state.player;
  const cats = ['Vehicle', 'Property', 'Luxury', 'Tech'];
  let html = `<div class="pill-row">${cats.map(c => `<button class="pill ${c === category ? 'active' : ''}" data-shopcat="${c}">${c === 'Vehicle' ? 'Vehicles' : c === 'Property' ? 'Properties' : c}</button>`).join('')}</div>`;
  const items = ASSETS.filter(a => a.type === category);
  for (const a of items) {
    const afford = p.money >= a.value;
    html += `<button class="list-row" data-buy="${a.id}">
      <span class="row-emoji">${a.icon}</span>
      <span class="row-main"><span class="row-title">${esc(a.name)}</span><span class="row-sub">Upkeep ${money(a.upkeep)}/yr${a.minAge > p.age ? ` · Age ${a.minAge}+` : ''}</span></span>
      <span class="row-right ${afford ? 'green' : 'red'}">${money(a.value)}<span class="tiny-sub">${afford ? 'Buy' : 'Too expensive'}</span></span>
    </button>`;
  }
  body.innerHTML = html;
  $$('[data-shopcat]', body).forEach(b => b.onclick = () => pushView({ kind: 'shop', category: b.dataset.shopcat, title: b.dataset.shopcat === 'Vehicle' ? 'Vehicles' : b.dataset.shopcat === 'Property' ? 'Properties' : b.dataset.shopcat }));
  $$('[data-buy]', body).forEach(b => b.onclick = () => {
    const a = ASSETS.find(x => x.id === b.dataset.buy);
    if (!a) return;
    showModal({
      title: 'Confirm Purchase',
      body: `<p>Buy <b>${esc(a.name)}</b> for <b>${moneyFull(a.value)}</b>?</p><p>Yearly upkeep: ${moneyFull(a.upkeep)}</p>`,
      options: [
        { label: 'Buy it', primary: true, onClick: () => { const r = G.buyAsset(a.id); closeModal(); handleResult(r); renderGame(); renderPanelBody(); } },
        { label: 'Cancel', onClick: () => closeModal() },
      ],
    });
  });
}

// ---------------------------------------------------------------------------
// Relationships panel
// ---------------------------------------------------------------------------
function renderRelationshipsPanel(body) {
  const p = G.state.player;
  const rels = p.relationships;
  const groups = [
    ['Partner & Spouse', ['Partner', 'Spouse']],
    ['Family', ['Mother', 'Father', 'Guardian', 'Sibling', 'Child']],
    ['Friends', ['Friend']],
    ['Work', ['Coworker']],
    ['Pets', ['Pet']],
    ['Exes', ['Ex']],
    ['In Memory', []],
  ];
  const active = rels.filter(r => r.alive);
  const partner = active.find(r => ['Partner', 'Spouse'].includes(r.relation));
  const kids = active.filter(r => r.relation === 'Child');
  let html = `<div class="hero-card">
    <div class="hero-top">
      <div class="hero-info">
        <div class="hero-kicker">Relationships</div>
        <div class="hero-title">${plural(active.length, 'person')} in your life</div>
        <div class="hero-sub">${partner ? `Partner: ${esc(partner.firstName)}` : 'Single and ready to mingle'} · ${plural(kids.length, 'child')}</div>
      </div>
      <div class="hero-money"><b>${p.followers ? (p.followers >= 1000 ? (p.followers / 1000).toFixed(1) + 'K' : p.followers) : 0}</b><span>Followers</span></div>
    </div>
    ${!partner ? `<button class="panel-cta" data-findlove>💘 Find Love</button>` : ''}
  </div>`;

  const renderGroup = (title, types) => {
    let list = rels.filter(r => types.includes(r.relation));
    if (title === 'In Memory') list = p.relationships.filter(r => !r.alive && r.relation !== 'Pet');
    if (!list.length) return '';
    let s = `<div class="section-label">${title}</div>`;
    for (const r of list) {
      if (!r.alive && title !== 'In Memory') continue;
      s += `<button class="person-row" data-person="${r.id}">
        ${r.pet ? `<div class="avatar avatar-md pet-avatar">${petEmoji(r)}</div>` : avatarHTML(r.avatar, 'avatar-md', r.age)}
        <span class="person-main">
          <span class="person-name">${esc(G.personName(r))} <span class="person-rel">(${r.relation})</span> ${r.alive ? '' : '<span class="relation-heart" style="color:#8b96a3">🪦</span>'}</span>
          ${r.alive ? `<span class="bond"><span class="bond-label">Relationship</span><span class="bond-val">${Math.round(r.bond)}%</span><span class="bond-track"><i style="width:${r.bond}%"></i></span></span>` : `<span class="person-rel deceased">Deceased</span>`}
        </span>
        <span class="more-dots">›</span>
      </button>`;
    }
    return s;
  };

  html += renderGroup('Partner & Spouse', ['Partner', 'Spouse']);
  html += renderGroup('Family', ['Mother', 'Father', 'Guardian', 'Sibling', 'Child']);
  html += renderGroup('Friends', ['Friend']);
  html += renderGroup('Work', ['Coworker']);
  html += renderGroup('Pets', ['Pet']);
  html += renderGroup('In Memory', []);
  if (!active.length) html += `<div class="empty-card"><span class="big">👥</span><b>No relationships yet</b>Get out there and meet people.</div>`;
  body.innerHTML = html;

  $$('[data-person]', body).forEach(b => b.onclick = () => {
    const r = G.findPerson(b.dataset.person);
    if (r) showPersonModal(r);
  });
  $('[data-findlove]', body)?.addEventListener('click', () => {
    const r = G.doActivity('date');
    handleResult(r);
    renderGame();
    renderPanelBody();
  });
}

function showPersonModal(r) {
  const p = G.state.player;
  const relationLabel = r.pet ? 'Pet' : r.relation;
  const actions = [];
  const add = (label, emoji, action, sub = '', danger = false) => actions.push({ label, emoji, action, sub, danger });
  if (r.alive) {
    if (r.pet) {
      add('Play with them', '🎾', 'play');
      add('Take to the vet', '🩺', 'vet', '$250');
      add('Spend time together', '🤗', 'spend');
    } else {
      add('Spend time together', '🤗', 'spend');
      add('Give a compliment', '💬', 'compliment');
      add('Give a gift', '🎁', 'gift');
      if (['Mother', 'Father', 'Guardian', 'Sibling', 'Friend', 'Spouse', 'Partner'].includes(r.relation)) add('Ask for money', '💵', 'askmoney');
      if (r.relation === 'Partner') { add('Propose', '💍', 'propose', '$2,000'); add('Have a baby', '👶', 'baby', '$5,000'); }
      if (r.relation === 'Spouse') add('Have a baby', '👶', 'baby', '$5,000');
      if (['Partner', 'Spouse'].includes(r.relation)) add(r.relation === 'Spouse' ? 'Divorce' : 'Break up', '💔', 'breakup', '', true);
      if (r.relation === 'Child') add('Discipline', '🗯️', 'discipline');
      if (['Friend', 'Coworker'].includes(r.relation) && p.age >= 18) add('Hook up', '🔥', 'hookup');
      if (r.relation === 'Spouse' && p.age >= 18) add('Hook up', '🔥', 'hookup');
      add('Insult them', '😠', 'insult', '', true);
    }
  }
  const body = `<div class="modal-avatar-row">
      ${r.pet ? `<div class="avatar avatar-lg pet-avatar">${petEmoji(r)}</div>` : `<div class="avatar avatar-lg">${avatarSVG(r.avatar, { age: r.age })}</div>`}
      <div class="who"><b>${esc(G.personName(r))}</b><span>${esc(relationLabel)} · ${r.pet ? 'a very good pet' : `${r.age} year${r.age === 1 ? '' : 's'} old`}</span></div>
    </div>
    <div class="profile-table">
      <div class="pt-row"><span>Relationship</span><b>${r.alive ? Math.round(r.bond) + '%' : 'Deceased'}</b></div>
      <div class="pt-row"><span>Gender</span><b>${r.pet ? 'Pet' : r.gender === 'female' ? 'Female' : 'Male'}</b></div>
      <div class="pt-row"><span>Status</span><b>${r.alive ? 'Alive' : 'Deceased'}</b></div>
    </div>
    ${r.alive ? `<div class="modal-bar"><i style="width:${r.bond}%"></i></div>` : ''}
    ${r.alive ? `<div class="modal-actions">${actions.map(a => `<button class="modal-action ${a.danger ? 'danger' : ''}" data-paction="${a.action}"><span class="ma-emoji">${a.emoji}</span>${a.label}<span class="ma-sub">${a.sub}</span></button>`).join('')}</div>` : '<p class="modal-note">They are no longer with us.</p>'}`;
  showModal({
    title: r.pet ? r.firstName : `${r.firstName} ${r.lastName}`,
    body,
    dismissible: true,
    onMount: card => {
      $$('[data-paction]', card).forEach(b => b.onclick = () => {
        const action = b.dataset.paction;
        if (action === 'gift') { showGiftMenu(r); return; }
        const res = G.relationshipAction(r.id, action);
        closeModal();
        handleResult(res);
        renderGame();
        renderPanelBody();
      });
    },
  });
}
function showGiftMenu(r) {
  showModal({
    title: 'Give a Gift',
    body: `<p>How much would you like to spend on <b>${esc(r.firstName)}</b>?</p><p>Better gifts build a stronger relationship.</p>`,
    options: [
      { label: '$100 gift', onClick: () => gift(r, 'gift100') },
      { label: '$1,000 gift', onClick: () => gift(r, 'gift1000') },
      { label: '$10,000 gift', onClick: () => gift(r, 'gift10000') },
      { label: 'Cancel', onClick: () => closeModal() },
    ],
  });
}
function gift(r, kind) {
  const res = G.relationshipAction(r.id, kind);
  closeModal();
  handleResult(res);
  renderGame();
  renderPanelBody();
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------
function renderActivitiesPanel(body) {
  const p = G.state.player;
  let html = '';
  if (p.prison > 0) {
    html += `<div class="panel-note">⛓️ You are in prison. Most activities are unavailable.</div>`;
  }
  html += `<div class="menu-list">`;
  for (const c of ACTIVITY_CATEGORIES) {
    html += `<button class="list-row" data-cat="${c.id}" ${p.prison > 0 ? 'disabled' : ''}>
      <span class="row-emoji">${c.icon}</span><span class="row-main"><span class="row-title">${c.name}</span><span class="row-sub">${c.desc}</span></span><span class="row-chev">›</span>
    </button>`;
  }
  html += `</div>`;
  body.innerHTML = html;
  $$('[data-cat]', body).forEach(b => b.onclick = () => pushView({ kind: 'category', id: b.dataset.cat, title: ACTIVITY_CATEGORIES.find(c => c.id === b.dataset.cat)?.name || 'Activities' }));
}

function renderCategory(body, id) {
  const p = G.state.player;
  const cat = ACTIVITY_CATEGORIES.find(c => c.id === id);
  if (!cat) { body.innerHTML = '<div class="empty-card">Category not found.</div>'; return; }
  let html = `<div class="section-label">Choose an Activity</div>`;
  html += `<div class="menu-list">`;
  for (const a of cat.actions) {
    const locked = (a.minAge && p.age < a.minAge) || (a.cost && p.money < a.cost);
    const sub = [a.sub, a.minAge && p.age < a.minAge ? `Age ${a.minAge}+` : '', a.cost && p.money < a.cost ? 'Not enough money' : ''].filter(Boolean).join(' · ');
    html += `<button class="list-row ${locked ? 'locked' : ''}" data-act="${a.id}">
      <span class="row-emoji">${a.icon}</span>
      <span class="row-main"><span class="row-title">${a.name}</span><span class="row-sub">${esc(sub)}</span></span>
      <span class="row-right ${locked ? 'red' : ''}">${a.cost ? money(a.cost) : 'Free'}<span class="tiny-sub">${locked ? 'Locked' : 'Do it'}</span></span>
    </button>`;
  }
  html += `</div>`;
  body.innerHTML = html;
  $$('[data-act]', body).forEach(b => b.onclick = () => {
    const a = ACTIVITY_ACTIONS[b.dataset.act];
    if (!a) return;
    if (a.category === 'crime') {
      confirmModal(`Commit ${a.name}?`, 'This is illegal. If you get caught, you could go to prison.', () => runActivity(a.id));
    } else runActivity(a.id);
  });
}
function runActivity(id) {
  const res = G.doActivity(id);
  handleResult(res);
  renderGame();
  renderPanelBody();
}

// ---------------------------------------------------------------------------
// Menu
// ---------------------------------------------------------------------------
function renderMenuPanel(body) {
  const p = G.state.player;
  const title = p.age >= 65 ? 'Retired Legend' : p.age >= 30 ? 'Certified Bitizen' : 'Rising Star';
  const row = (id, emoji, label, sub) => `<button class="list-row" data-menu="${id}"><span class="row-emoji">${emoji}</span><span class="row-main"><span class="row-title">${label}</span><span class="row-sub">${sub}</span></span><span class="row-chev">›</span></button>`;
  let html = `<div class="panel-note">${esc(title)} · Age ${p.age}</div>`;
  html += `<div class="section-label">Life</div><div class="menu-list">
    ${row('stats', '📊', 'Life Stats', 'Age, education, money and more')}
    ${row('achievements', '🏆', 'Achievements', `${Object.keys(G.state.achievements).length} of ${ACHIEVEMENTS.length} unlocked`)}
  </div>`;
  html += `<div class="section-label">Game</div><div class="menu-list">
    ${row('settings', '⚙️', 'Settings', 'Sound, haptics and saved data')}
    ${row('save', '💾', 'Save Game', 'Keep your life safe')}
    ${row('newlife', '🌱', 'New Life', 'Start over from birth')}
    ${row('mainmenu', '🏠', 'Main Menu', 'Save and return to the title screen')}
  </div>`;
  html += `<div class="section-label">Info</div><div class="menu-list">
    ${row('about', 'ℹ️', 'About', 'Life Happens v1.0.0')}
  </div>`;
  body.innerHTML = html;
  $$('[data-menu]', body).forEach(b => b.onclick = () => {
    const id = b.dataset.menu;
    if (id === 'stats') pushView({ kind: 'stats', title: 'Life Stats' });
    if (id === 'achievements') pushView({ kind: 'achievements', title: 'Achievements' });
    if (id === 'settings') pushView({ kind: 'settings', title: 'Settings' });
    if (id === 'save') { G.save(); toast('💾 Game saved.'); }
    if (id === 'newlife') confirmModal('Start a new life?', 'Your current life will be saved over. Achievements stay with you.', () => { G.startNewLife({}); showScreen('game'); toast('A brand new life begins.'); confetti('👶'); });
    if (id === 'mainmenu') { G.save(); closePanel(true); showScreen('title'); }
    if (id === 'about') showAbout();
  });
}

function renderStatsPanel(body) {
  const p = G.state.player;
  const nw = G.netWorth(p);
  const rows = [
    ['Name', fullName(p)], ['Age', p.age], ['Gender', p.gender === 'female' ? 'Female' : 'Male'],
    ['Country', G.countryByCode(p.country).name], ['Occupation', G.occupationLabel(p)],
    ['Education', G.educationLabel(p)], ['Bank Balance', displayMoney(p.money)],
    ['Net Worth', displayMoney(nw)], ['Debt', displayMoney(p.debt || 0)],
    ['Followers', (p.followers || 0).toLocaleString()],
    ['Relationship', p.relationships.some(r => r.alive && r.relation === 'Spouse') ? 'Married' : p.relationships.some(r => r.alive && r.relation === 'Partner') ? 'Dating' : 'Single'],
    ['Children', p.relationships.filter(r => r.relation === 'Child').length],
  ];
  body.innerHTML = `<div class="section-label">Details</div>
    <div class="profile-table panel-table">${rows.map(([k, v]) => `<div class="pt-row"><span>${k}</span><b>${esc(v)}</b></div>`).join('')}</div>
    <div class="section-label">Stats</div>
    <div class="panel-stats">${Object.entries(p.stats).map(([k, v]) => `<div class="panel-stat"><div class="panel-stat-top"><span>${k}</span><b>${v}%</b></div><div class="mini-bar ${v < 30 ? 'low' : v < 55 ? 'warm' : ''}"><i style="width:${v}%"></i></div></div>`).join('')}</div>`;
}

function renderAchievementsPanel(body) {
  const unlocked = G.state.achievements;
  let html = `<div class="section-label">Achievements <span class="lbl-right">${Object.keys(unlocked).length} / ${ACHIEVEMENTS.length}</span></div><div class="menu-list">`;
  for (const a of ACHIEVEMENTS) {
    const got = !!unlocked[a.id];
    html += `<div class="list-row achievement ${got ? '' : 'locked'}"><span class="row-emoji">${got ? a.icon : '🔒'}</span><span class="row-main"><span class="row-title">${a.name}</span><span class="row-sub">${a.desc}</span></span><span class="row-right ${got ? 'green' : ''}">${got ? '✓' : ''}</span></div>`;
  }
  html += `</div>`;
  body.innerHTML = html;
}

function renderSettingsPanel(body) {
  const s = G.state.settings;
  body.innerHTML = `<div class="section-label">Preferences</div>
    <div class="menu-list">
    <button class="list-row" data-toggle="sound"><span class="row-emoji">🔊</span><span class="row-main"><span class="row-title">Sound effects</span><span class="row-sub">Taps and little blips</span></span><span class="row-right ${s.sound ? 'green' : ''}">${s.sound ? 'ON' : 'OFF'}</span></button>
    <button class="list-row" data-toggle="haptics"><span class="row-emoji">📳</span><span class="row-main"><span class="row-title">Haptics</span><span class="row-sub">Vibrate on touch (mobile)</span></span><span class="row-right ${s.haptics ? 'green' : ''}">${s.haptics ? 'ON' : 'OFF'}</span></button>
    </div>
    <div class="section-label">Data</div>
    <div class="menu-list">
    <button class="list-row" data-settings-action="save"><span class="row-emoji">💾</span><span class="row-main"><span class="row-title">Save now</span><span class="row-sub">Write your life to this device</span></span><span class="row-right green">Save</span></button>
    <button class="list-row" data-settings-action="erase"><span class="row-emoji">🗑️</span><span class="row-main"><span class="row-title">Erase all data</span><span class="row-sub">Delete your save and achievements</span></span><span class="row-right red">Erase</span></button>
    </div>
    <p class="panel-note">Life Happens v1.0.0 · Made for mobile</p>`;
  $$('[data-toggle]', body).forEach(b => b.onclick = () => {
    const k = b.dataset.toggle;
    G.state.settings[k] = !G.state.settings[k];
    G.save();
    renderSettingsPanel(body);
  });
  $('[data-settings-action="save"]', body).onclick = () => { G.save(); toast('💾 Game saved.'); };
  $('[data-settings-action="erase"]', body).onclick = () => confirmModal('Erase all data?', 'This deletes your current life and every achievement. There is no undo.', () => {
    G.clearSave();
    G.state.player = null;
    G.state.achievements = {};
    closePanel(true);
    showScreen('title');
    toast('All data erased.');
  });
}

function renderFinancesPanel(body) {
  const p = G.state.player;
  const nw = G.netWorth(p);
  body.innerHTML = `<div class="hero-card">
    <div class="hero-top"><div class="hero-info"><div class="hero-kicker">Finances</div><div class="hero-title" style="font-size:24px">${displayMoney(nw)}</div><div class="hero-sub">Net worth</div></div><div class="hero-money"><b>${displayMoney(p.money)}</b><span>Bank</span></div></div>
    <div class="hero-stats"><div class="hero-stat">Income/yr<b>${displayMoney(p.lastIncome || 0)}</b></div><div class="hero-stat">Expenses/yr<b>${displayMoney(p.lastExpenses || 0)}</b></div><div class="hero-stat">Debt<b>${displayMoney(p.debt || 0)}</b></div></div>
  </div>
  <div class="section-label">Earning</div>
  <div class="list-row"><span class="row-emoji">💼</span><span class="row-main"><span class="row-title">${p.job ? p.job.title : p.retired ? 'Pension' : 'No income'}</span><span class="row-sub">${p.job ? p.job.company : p.retired ? 'Retired life' : 'Get a job to earn money'}</span></span><span class="row-right green">${displayMoney(p.lastIncome || 0)}</span></div>
  <div class="section-label">Assets</div>
  ${(p.assets || []).length ? p.assets.map(a => `<div class="list-row"><span class="row-emoji">${a.icon}</span><span class="row-main"><span class="row-title">${esc(a.name)}</span><span class="row-sub">${a.type}</span></span><span class="row-right green">${displayMoney(a.value)}</span></div>`).join('') : '<div class="empty-card">No assets yet.</div>'}`;
}

// ---------------------------------------------------------------------------
// Modals
// ---------------------------------------------------------------------------
export function showModal({ title, body = '', options = [], okText = 'OK', dismissible = true, onMount = null, onClose = null, tone = '' }) {
  modalOpen = true;
  $('#modalLayer').classList.remove('hidden');
  const card = $('#modalCard');
  card.className = 'modal-card' + (tone ? ' ' + tone : '');
  const opts = options.map((o, i) => `<button class="modal-choice ${o.primary ? 'primary' : ''} ${o.danger ? 'danger-choice' : ''}" data-opt="${i}">${esc(o.label)}${o.sub ? `<small>${esc(o.sub)}</small>` : ''}</button>`).join('');
  card.innerHTML = `<div class="modal-head">${esc(title)}</div>
    <div class="modal-body">${body}${opts ? `<div class="modal-choices">${opts}</div>` : `<button class="modal-ok" data-ok>${esc(okText)}</button>`}</div>`;
  const close = () => closeModal();
  $$('[data-opt]', card).forEach(b => b.onclick = () => {
    const o = options[+b.dataset.opt];
    if (!o) return;
    if (o.onClick) o.onClick();
    else close();
  });
  $('[data-ok]', card)?.addEventListener('click', close);
  if (onMount) onMount(card);
  $('#modalLayer').onclick = e => { if (e.target === $('#modalLayer') && dismissible) close(); };
  if (onClose) card._onClose = onClose;
  requestAnimationFrame(() => card.scrollTop = 0);
  return card;
}
export function closeModal() {
  const card = $('#modalCard');
  const cb = card?._onClose;
  if (card) card._onClose = null;
  $('#modalLayer').classList.add('hidden');
  modalOpen = false;
  if (cb) cb();
}
function confirmModal(title, body, onYes) {
  showModal({
    title,
    body: `<p>${esc(body)}</p>`,
    options: [
      { label: 'Yes, do it', primary: true, onClick: () => { closeModal(); onYes(); } },
      { label: 'Cancel', onClick: () => closeModal() },
    ],
    dismissible: true,
  });
}

function handleResult(res) {
  if (!res) return;
  if (res.achievements?.length) showAchievements(res.achievements);
  if (res.modal) {
    showResultModal(res.modal);
    if (res.modal.body && !res.modal.options) {
      // result modal includes its own OK
    }
    return;
  }
  if (res.message) toast(res.message);
  else if (res.ok === false && !res.modal) toast(res.message || 'That did not work.');
}
function showResultModal(modal) {
  if (!modal) return;
  if (modal.options?.length) {
    showModal({
      title: modal.title || 'What will you do?',
      body: modal.body || '',
      options: modal.options.map(o => ({
        label: o.label,
        sub: o.sub,
        primary: o.primary,
        onClick: () => {
          closeModal();
          if (o.onClick) { o.onClick(); return; }
          if (o.action) {
            const r = o.action();
            if (r?.toast) toast(r.toast);
            if (r?.result) showResultModal(r.result);
            if (G.state.player && G.state.screen === 'game') {
              renderGame();
              if (panel.type) renderPanelBody();
            }
          }
        },
      })),
      dismissible: false,
    });
  } else {
    showModal({ title: modal.title || 'Life Happens', body: modal.body || '', dismissible: false });
  }
}

export function showEventModal(ev) {
  showModal({
    title: ev.title,
    body: ev.body,
    options: ev.options.map((o, i) => ({
      label: o.label,
      sub: o.sub,
      onClick: () => {
        const res = G.resolveEventOption(i);
        closeModal();
        renderGame(true);
        if (res?.achievements?.length) showAchievements(res.achievements);
        if (res?.text) toast(res.text, 2600);
        if (res?.title || res?.body) showResultModal(res);
        if (res?.modal) showResultModal(res.modal);
      },
    })),
    dismissible: false,
  });
}

export function showDeathModal() {
  const s = G.deathSummary();
  if (!s) return;
  const body = `<div style="text-align:center;font-size:54px;line-height:1;margin:4px 0 6px">🪦</div>
    <p style="text-align:center;font-size:17px;font-weight:800;color:#222">${esc(s.name)}</p>
    <p style="text-align:center;margin-bottom:10px">Died at age <b>${s.age}</b> from ${esc(s.cause)}.</p>
    <div class="profile-table">
      <div class="pt-row"><span>Net worth</span><b>${moneyFull(s.netWorth)}</b></div>
      <div class="pt-row"><span>Final happiness</span><b>${s.happiness}%</b></div>
      <div class="pt-row"><span>Children</span><b>${s.children}</b></div>
      <div class="pt-row"><span>Achievements</span><b>${s.achievements}</b></div>
    </div>
    <p class="modal-blue" style="text-align:center">Every life leaves a story behind.</p>`;
  showModal({
    title: 'Rest in Peace',
    body,
    options: [
      { label: 'Start a New Life', primary: true, onClick: () => { closeModal(); G.clearSave(); draft = newDraft(); showScreen('create'); } },
      ...(s.canLegacy ? [{ label: 'Continue Your Legacy', onClick: () => {
        const old = G.state.player;
        const g = chance(.5) ? 'female' : 'male';
        G.startNewLife({ legacyOf: old, firstName: G.randomFirstName(g), lastName: old.lastName, gender: g, country: G.countryByCode(old.country), avatar: randomAvatar(g) });
        closeModal();
        showScreen('game');
        toast('Your legacy continues.');
        confetti('🧬');
      } }] : []),
    ],
    dismissible: false,
  });
}

export function showChallengeModal() {
  const c = G.challengeStatus();
  const p = G.state.player;
  const agePct = Math.min(100, Math.round((p.age / 80) * 100));
  const hapPct = Math.min(100, Math.round((p.stats.happiness / 60) * 100));
  const body = `<p><b>${c.title}</b></p><p>${c.desc}</p>
    <div class="profile-table">
      <div class="pt-row"><span>Reach age 80</span><b>${p.age} / 80</b></div>
      <div class="pt-row"><span>Happiness 60%</span><b>${p.stats.happiness}%</b></div>
      <div class="pt-row"><span>Reward</span><b>${moneyFull(c.reward)}</b></div>
    </div>
    <div class="modal-bar"><i style="width:${agePct}%"></i></div>
    <p class="modal-note">${c.claimed ? 'Reward claimed. Challenge complete!' : c.done ? 'You did it! Claim your reward.' : 'Keep living. You are not done yet.'}</p>`;
  showModal({
    title: 'Live Challenge',
    body,
    options: [
      ...(!c.claimed && c.done ? [{ label: `Claim ${moneyFull(c.reward)}`, primary: true, onClick: () => {
        const r = G.claimChallenge();
        closeModal();
        handleResult(r);
        renderGame();
        if (r.ok) { confetti('💰'); toast(r.message); }
      } }] : []),
      { label: 'Close', onClick: () => closeModal() },
    ],
  });
}

export function showProfileModal() {
  const p = G.state.player;
  if (!p) return;
  const nw = G.netWorth(p);
  const partner = p.relationships.find(r => r.alive && ['Partner', 'Spouse'].includes(r.relation));
  const body = `<div class="modal-avatar-row"><div class="avatar avatar-lg">${avatarSVG(p.avatar, { age: p.age })}</div><div class="who"><b>${esc(fullName(p))}</b><span>Age ${p.age} · ${G.countryByCode(p.country).name}</span></div></div>
    <div class="profile-table">
      <div class="pt-row"><span>Occupation</span><b>${esc(G.occupationLabel(p))}</b></div>
      <div class="pt-row"><span>Education</span><b>${esc(G.educationLabel(p))}</b></div>
      <div class="pt-row"><span>Bank balance</span><b>${moneyFull(p.money)}</b></div>
      <div class="pt-row"><span>Net worth</span><b>${moneyFull(nw)}</b></div>
      <div class="pt-row"><span>Relationship</span><b>${partner ? esc(partner.firstName) + ' (' + partner.relation + ')' : 'Single'}</b></div>
      <div class="pt-row"><span>Followers</span><b>${(p.followers || 0).toLocaleString()}</b></div>
    </div>
    <div class="modal-actions">
      <button class="modal-action" data-profile-finances><span class="ma-emoji">💰</span>Finances<span class="ma-sub">Net worth ${money(nw)}</span></button>
      <button class="modal-action" data-profile-achievements><span class="ma-emoji">🏆</span>Achievements<span class="ma-sub">${Object.keys(G.state.achievements).length} unlocked</span></button>
    </div>`;
  showModal({
    title: 'Profile',
    body,
    dismissible: true,
    onMount: card => {
      $('[data-profile-finances]', card)?.addEventListener('click', () => { closeModal(); openPanel('finances'); });
      $('[data-profile-achievements]', card)?.addEventListener('click', () => { closeModal(); openPanel('achievements'); });
    },
  });
}

function showAbout() {
  showModal({
    title: 'About Life Happens',
    body: `<div style="text-align:center;font-size:44px;margin-bottom:6px">🌱</div>
      <p style="text-align:center"><b>Life Happens</b><br>Version 1.0.0</p>
      <p>A mobile life simulator. Create a character, make choices, build relationships, chase careers, and see how your story ends.</p>
      <p>Every life is different. There are no save points in real life — but there is one here.</p>
      <p class="modal-note">An original game inspired by the life-simulator genre. Not affiliated with or endorsed by BitLife or Candywriter.</p>`,
  });
}

export function showCountryPicker() {
  const body = `<div class="country-grid">${COUNTRIES.map(c => `<button class="country-option" data-country="${c.code}"><span class="flag-inline">${flagSVG(c.code)}</span><span>${c.name}</span></button>`).join('')}</div>`;
  showModal({
    title: 'Choose a Country',
    body,
    dismissible: true,
    onMount: card => {
      $$('[data-country]', card).forEach(b => b.onclick = () => {
        const c = COUNTRIES.find(x => x.code === b.dataset.country);
        if (c) { draft.country = c; }
        closeModal();
        renderCreate();
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Title / create wiring
// ---------------------------------------------------------------------------
function wireTitle() {
  $('#btnPlay').onclick = () => {
    if (G.hasSave()) {
      confirmModal('Start a new life?', 'Your current saved life will be replaced. Achievements are kept.', () => {
        G.startNewLife({});
        showScreen('game');
        toast('A brand new life begins.');
        confetti('👶');
      });
    } else {
      G.startNewLife({});
      showScreen('game');
      toast('A brand new life begins.');
      confetti('👶');
    }
  };
  $('#btnContinue').onclick = () => {
    if (G.load()) {
      showScreen('game');
      toast('Welcome back.');
      if (G.state.player && !G.state.player.alive) setTimeout(showDeathModal, 360);
    } else toast('No saved life found.');
  };
  $('#btnCreate').onclick = () => { draft = newDraft(); showScreen('create'); };
  $('#btnTitleMenu').onclick = () => showModal({
    title: 'Settings',
    body: `<p>Sound effects: <b>${G.state.settings.sound ? 'On' : 'Off'}</b></p><p>Haptics: <b>${G.state.settings.haptics ? 'On' : 'Off'}</b></p><p class="modal-note">You can change these in the game menu too.</p>`,
    options: [
      { label: `Sound: ${G.state.settings.sound ? 'On' : 'Off'}`, onClick: () => { G.state.settings.sound = !G.state.settings.sound; G.save(); closeModal(); $('#btnTitleMenu').click(); } },
      { label: `Haptics: ${G.state.settings.haptics ? 'On' : 'Off'}`, onClick: () => { G.state.settings.haptics = !G.state.settings.haptics; G.save(); closeModal(); $('#btnTitleMenu').click(); } },
      { label: 'Close', onClick: () => closeModal() },
    ],
  });
}
function wireCreate() {
  $('#btnCreateBack').onclick = () => showScreen('title');
  $('#btnRandomizeAll').onclick = randomizeAll;
  $('#btnShuffleLook').onclick = shuffleLook;
  $('#btnStartLife').onclick = startLifeFromDraft;
  $('#btnCountry').onclick = showCountryPicker;
  $('#inputFirst').oninput = e => { draft.firstName = e.target.value; };
  $('#inputLast').oninput = e => { draft.lastName = e.target.value; };
  $$('#genderSegment button').forEach(b => b.onclick = () => {
    draft.gender = b.dataset.gender;
    draft.avatar.gender = b.dataset.gender;
    draft.avatar.facialHair = b.dataset.gender === 'male' ? (chance(.5) ? rand(['none', 'stache', 'goatee', 'beard']) : 'none') : 'none';
    draft.avatar.earrings = b.dataset.gender === 'female' ? chance(.55) : false;
    renderCreate();
  });
}

function wireGame() {
  $('#btnMenu').onclick = () => openPanel('menu');
  $('#btnChallenge').onclick = showChallengeModal;
  $('#btnBitizen').onclick = showProfileModal;
  $('#btnPray').onclick = () => {
    const r = G.pray();
    renderGame();
    toast(r.message || 'You prayed.');
    if (r.ok) blip(640, .1, .03);
  };
  $('#btnCommunity').onclick = () => { openPanel('achievements'); toast('Welcome to the Life Happens community!'); };
  $('#btnCharName').onclick = showProfileModal;
  $('#btnCharOcc').onclick = showProfileModal;
  $('#btnMoney').onclick = () => openPanel('finances');
  $('#btnBank').onclick = () => openPanel('finances');
  $$('.nav-item[data-nav]').forEach(b => b.onclick = () => openPanel(b.dataset.nav));
  $('#panelBack').onclick = () => closePanel();
  $('#btnAge').onclick = doAgeUp;
  $('#btnAgeDown').onclick = () => {
    const r = G.rewindYear();
    if (!r.ok) { toast(r.message); return; }
    renderGame(true);
    toast(r.message);
    confetti('⏳');
  };
}

function doAgeUp() {
  const p = G.state.player;
  if (!p) return;
  if (!p.alive) { showDeathModal(); return; }
  if (G.state.pendingEvent) { showEventModal(G.state.pendingEvent); return; }
  const res = G.ageUp();
  renderGame(true);
  if (res.blocked) return;
  if (res.achievements?.length) showAchievements(res.achievements);
  if (res.death) {
    setTimeout(showDeathModal, 260);
    return;
  }
  if (res.choice) {
    setTimeout(() => showEventModal(res.choice), 240);
  }
  blip(420, .05, .025);
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
function renderBrandMarks() {
  const mark = `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="50" cy="50" r="48" fill="#ffffff"/>
    <path d="M50 79 V47" stroke="#0a0a0a" stroke-width="8" stroke-linecap="round"/>
    <path d="M50 57 C36 57 27 48 27 34 C42 34 50 44 50 57 Z" fill="#0a0a0a"/>
    <path d="M50 51 C64 51 73 42 73 28 C58 28 50 38 50 51 Z" fill="#0a0a0a"/>
    <circle cx="50" cy="22" r="4.2" fill="#0a0a0a"/>
  </svg>`;
  $$('.brand-mark').forEach(el => { el.innerHTML = mark; });
}

export function boot() {
  renderBrandMarks();
  wireTitle();
  wireCreate();
  wireGame();
  G.load();
  draft = newDraft();
  showScreen('title');
}
