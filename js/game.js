import {
  COUNTRIES, FIRST_NAMES, LAST_NAMES, SKIN_TONES, HAIR_COLORS, HAIR_STYLES, EYE_COLORS,
  CLOTHES, JOBS, COMPANIES, ASSETS, ACTIVITY_ACTIONS, ACTIVITY_CATEGORIES, ACHIEVEMENTS,
  CHALLENGE, EDUCATION_LABEL, rand, randInt, chance, clamp, money, moneyFull, fullName,
} from './data.js';
import { randomAvatar, avatarSVG, flagSVG } from './avatar.js';

export const SAVE_KEY = 'lifehappens.save.v2';

export const state = {
  player: null,
  settings: { sound: true, haptics: true },
  achievements: {},
  challengeClaimed: false,
  pendingEvent: null,
  pendingDeath: false,
  lastSnapshot: null,
  toastQueue: [],
  screen: 'title',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function randomFirstName(gender) { return rand(FIRST_NAMES[gender] || FIRST_NAMES.female); }
export function randomLastName() { return rand(LAST_NAMES); }
export function newId() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4); }
export function countryByCode(code) { return COUNTRIES.find(c => c.code === code) || COUNTRIES[0]; }
export function occupationEmoji(p) {
  if (!p.alive) return '🪦';
  if (p.prison > 0) return '⛓️';
  if (p.age < 5) return '👶';
  if (p.age < 18) return '🎒';
  if (p.retired) return '🌴';
  if (p.job) return p.job.icon || '💼';
  return '😐';
}
export function occupationLabel(p) {
  if (!p.alive) return 'Deceased';
  if (p.prison > 0) return `Prisoner · ${p.prison} yr${p.prison === 1 ? '' : 's'} left`;
  if (p.age < 5) return 'Toddler';
  if (p.age < 18) return 'Student';
  if (p.retired) return 'Retired';
  if (p.job) return `${p.job.title} · ${p.job.company}`;
  return 'Unemployed';
}
export function netWorth(p = state.player) {
  if (!p) return 0;
  const assets = (p.assets || []).reduce((s, a) => s + a.value, 0);
  return Math.round(p.money + assets - (p.debt || 0));
}
export function makePerson({ gender = chance(.5) ? 'female' : 'male', age = 30, relation = 'Friend', lastName = '', bond = 60, firstName = null, avatar = null, alive = true } = {}) {
  return {
    id: newId(),
    firstName: firstName || randomFirstName(gender),
    lastName,
    gender,
    age,
    relation,
    bond: clamp(bond),
    avatar: avatar || randomAvatar(gender),
    alive,
    pet: relation === 'Pet',
    spouse: relation === 'Spouse',
  };
}
export function personName(p) { return p.pet ? p.firstName : `${p.firstName} ${p.lastName}`.trim(); }

// ---------------------------------------------------------------------------
// Creation
// ---------------------------------------------------------------------------
export function createPlayer({ firstName, lastName, gender, country, avatar, legacyOf = null } = {}) {
  const g = gender || (chance(.5) ? 'female' : 'male');
  const c = country || rand(COUNTRIES);
  const p = {
    id: newId(),
    firstName: firstName || randomFirstName(g),
    lastName: lastName || randomLastName(),
    gender: g,
    country: c.code,
    avatar: avatar || randomAvatar(g),
    age: 0,
    alive: true,
    cause: null,
    stats: {
      happiness: randInt(68, 92),
      health: randInt(82, 100),
      smarts: randInt(38, 78),
      looks: randInt(35, 86),
    },
    money: 0,
    debt: 0,
    job: null,
    jobHistory: [],
    education: 'none',
    pendingEducation: null,
    trade: false,
    retired: false,
    prison: 0,
    assets: [],
    relationships: [],
    log: [],
    followers: 0,
    vacations: 0,
    prayerAge: -1,
    achievements: {},
    seenEvents: [],
    lastIncome: 0,
    lastExpenses: 0,
    created: Date.now(),
  };

  if (legacyOf) {
    p.money = Math.max(1500, Math.round(netWorth(legacyOf) * 0.1));
    p.lastName = legacyOf.lastName;
    p.log.push({ age: 0, text: `You were born into the legacy of ${fullName(legacyOf)}.`, type: 'special' });
    p.log.push({ age: 0, text: `You inherited ${moneyFull(p.money)} from your family.`, type: 'pos' });
    const guardian = makePerson({ gender: legacyOf.relationships.find(r => r.relation === 'Spouse')?.gender || 'female', age: randInt(28, 45), relation: 'Guardian', lastName: p.lastName, bond: 88 });
    guardian.firstName = legacyOf.relationships.find(r => r.relation === 'Spouse' && r.alive)?.firstName || guardian.firstName;
    p.relationships.push(guardian);
    unlock('legacy');
  } else {
    const mother = makePerson({ gender: 'female', age: randInt(24, 40), relation: 'Mother', lastName: p.lastName, bond: randInt(82, 98) });
    const father = makePerson({ gender: 'male', age: randInt(25, 43), relation: 'Father', lastName: p.lastName, bond: randInt(78, 96) });
    p.relationships.push(mother, father);
    p.log.push({ age: 0, text: `You were born a ${g === 'female' ? 'girl' : 'boy'} in ${c.name}.`, type: 'special' });
    p.log.push({ age: 0, text: `Your parents, ${mother.firstName} and ${father.firstName}, welcomed you into the world.`, type: 'info' });
    if (chance(.55)) {
      const sibAge = randInt(1, 7);
      const sib = makePerson({ gender: chance(.5) ? 'female' : 'male', age: sibAge, relation: 'Sibling', lastName: p.lastName, bond: randInt(55, 92) });
      p.relationships.push(sib);
      p.log.push({ age: 0, text: `You have a ${sibAge}-year-old ${sib.gender === 'female' ? 'sister' : 'brother'}, ${sib.firstName}.`, type: 'info' });
    }
    p.log.push({ age: 0, text: 'A whole life is ahead of you.', type: '' });
  }
  return p;
}

export function startNewLife(opts = {}) {
  state.player = createPlayer(opts);
  state.achievements = state.achievements || {};
  state.challengeClaimed = false;
  state.pendingEvent = null;
  state.pendingDeath = false;
  state.lastSnapshot = null;
  state.screen = 'game';
  save();
  return state.player;
}

// ---------------------------------------------------------------------------
// Logging / stats
// ---------------------------------------------------------------------------
export function addLog(text, type = '') {
  const p = state.player;
  if (!p) return;
  p.log.push({ age: p.age, text, type, ts: Date.now() });
  if (p.log.length > 400) p.log.splice(0, p.log.length - 400);
}
export function bump(stat, amount, silent = false) {
  const p = state.player;
  if (!p) return 0;
  const before = p.stats[stat];
  p.stats[stat] = clamp(Math.round(p.stats[stat] + amount));
  const diff = p.stats[stat] - before;
  if (!silent && diff !== 0) {
    // silent by default; specific actions describe their own changes
  }
  return diff;
}
export function changeMoney(amount) {
  const p = state.player;
  if (!p) return 0;
  p.money = Math.round(p.money + amount);
  return amount;
}
function statLine(stat, amount) {
  if (!amount) return '';
  return `${stat} ${amount > 0 ? '+' : ''}${amount}`;
}
function joinStats(parts) { return parts.filter(Boolean).join(' · '); }

// ---------------------------------------------------------------------------
// Save / load
// ---------------------------------------------------------------------------
export function save() {
  try {
    const payload = {
      v: 2,
      player: state.player,
      settings: state.settings,
      achievements: state.achievements,
      challengeClaimed: state.challengeClaimed,
      savedAt: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
    return true;
  } catch { return false; }
}
function normalizePlayer(p) {
  if (!p || typeof p !== 'object') return null;
  p.stats = { happiness: 70, health: 80, smarts: 50, looks: 50, ...(p.stats || {}) };
  p.assets = Array.isArray(p.assets) ? p.assets : [];
  p.relationships = Array.isArray(p.relationships) ? p.relationships : [];
  p.log = Array.isArray(p.log) ? p.log : [];
  p.jobHistory = Array.isArray(p.jobHistory) ? p.jobHistory : [];
  p.seenEvents = Array.isArray(p.seenEvents) ? p.seenEvents : [];
  p.avatar = p.avatar || randomAvatar(p.gender || 'female');
  p.followers ??= 0;
  p.vacations ??= 0;
  p.debt ??= 0;
  p.prison ??= 0;
  p.money ??= 0;
  p.age ??= 0;
  p.alive = p.alive !== false;
  p.education ||= 'none';
  p.prayerAge ??= -1;
  p.lastIncome ??= 0;
  p.lastExpenses ??= 0;
  p.retired = !!p.retired;
  p.trade = !!p.trade;
  p.beenToPrison = !!p.beenToPrison;
  return p;
}
export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data || !data.player) return false;
    state.player = normalizePlayer(data.player);
    state.settings = { sound: true, haptics: true, ...(data.settings || {}) };
    state.achievements = data.achievements || {};
    state.challengeClaimed = !!data.challengeClaimed;
    state.pendingEvent = null;
    state.pendingDeath = false;
    state.lastSnapshot = null;
    return true;
  } catch { return false; }
}
export function hasSave() { return !!localStorage.getItem(SAVE_KEY); }
export function clearSave() { try { localStorage.removeItem(SAVE_KEY); } catch {} }

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------
export function unlock(id) {
  if (!state.achievements[id]) {
    state.achievements[id] = Date.now();
    return ACHIEVEMENTS.find(a => a.id === id) || null;
  }
  return null;
}
export function checkAchievements() {
  const p = state.player;
  if (!p) return [];
  const got = [];
  const tryUnlock = id => { const a = unlock(id); if (a) got.push(a); };
  if (p.age >= 2) tryUnlock('first_steps');
  if (p.stats.smarts >= 80) tryUnlock('student');
  if (p.job) tryUnlock('first_job');
  if (p.education === 'uni' || p.education === 'grad') tryUnlock('degree');
  if (p.relationships.some(r => r.relation === 'Spouse' && r.alive)) tryUnlock('married');
  if (p.relationships.some(r => r.relation === 'Child')) tryUnlock('parent');
  if (p.assets.some(a => a.type === 'Property')) tryUnlock('homeowner');
  if (netWorth(p) >= 1000000) tryUnlock('millionaire');
  if (p.prison > 0 || p.beenToPrison) tryUnlock('criminal');
  if (p.age >= 100) tryUnlock('centenarian');
  if (p.vacations >= 5) tryUnlock('world');
  if (p.followers >= 1000000) tryUnlock('famous');
  return got;
}

// ---------------------------------------------------------------------------
// Aging
// ---------------------------------------------------------------------------
export function snapshotForRewind() {
  if (!state.player) return;
  state.lastSnapshot = JSON.parse(JSON.stringify(state.player));
}
export function rewindYear() {
  const p = state.player;
  if (!p) return { ok: false, message: 'No life to rewind.' };
  if (!state.lastSnapshot) return { ok: false, message: 'Nothing to rewind yet.' };
  const cost = 2500;
  if (p.money < cost) return { ok: false, message: `You need ${moneyFull(cost)} to turn back time.` };
  const restored = JSON.parse(JSON.stringify(state.lastSnapshot));
  restored.money -= cost;
  restored.log.push({ age: restored.age, text: `You turned back time. It cost you ${moneyFull(cost)}.`, type: 'special' });
  state.player = restored;
  state.lastSnapshot = null;
  state.pendingEvent = null;
  state.pendingDeath = false;
  save();
  return { ok: true, message: `You turned back time to age ${restored.age}.`, player: restored };
}

export function ageUp() {
  const p = state.player;
  if (!p || !p.alive) return { death: true };
  if (state.pendingEvent) return { blocked: true };
  snapshotForRewind();
  state.pendingEvent = null;

  p.age += 1;
  let autos = [];
  let choice = null;

  // Relationships get a year older
  for (const r of p.relationships) {
    if (r.alive && !r.pet) r.age += 1;
  }

  if (p.prison > 0) {
    p.prison -= 1;
    p.stats.happiness = clamp(p.stats.happiness - randInt(2, 5));
    p.stats.health = clamp(p.stats.health - randInt(0, 2));
    addLog(`Another year behind bars. ${p.prison > 0 ? `${p.prison} year${p.prison === 1 ? '' : 's'} left.` : 'You are being released today.'}`, 'neg');
    if (p.prison === 0) addLog('You walked out of prison a free person.', 'pos');
    for (const r of p.relationships) if (r.alive && !r.pet) r.bond = clamp(r.bond - 2);
    if (p.prison === 0) p.beenToPrison = true;
  } else {
    // Education progression
    if (p.pendingEducation) {
      p.pendingEducation.years -= 1;
      if (p.pendingEducation.years <= 0) {
        const type = p.pendingEducation.type;
        p.education = type === 'grad' ? 'grad' : 'uni';
        addLog(`You graduated from ${type === 'grad' ? 'graduate school' : 'university'}!`, 'pos');
        p.stats.smarts = clamp(p.stats.smarts + randInt(8, 16));
        p.stats.happiness = clamp(p.stats.happiness + 8);
        p.pendingEducation = null;
        unlock('degree');
      } else {
        addLog(`You are still studying. ${p.pendingEducation.years} year${p.pendingEducation.years === 1 ? '' : 's'} to go.`, 'info');
      }
    }

    // Income and expenses
    let income = 0;
    if (p.job) {
      income = p.job.salary;
      p.money += income;
      p.job.years = (p.job.years || 0) + 1;
      addLog(`You earned ${moneyFull(income)} working as a ${p.job.title}.`, 'pos');
      // performance drift
      p.job.performance = clamp((p.job.performance ?? 60) - randInt(0, 3));
      if (p.job.performance < 18 && chance(.28)) {
        addLog(`You were fired from ${p.job.company} for poor performance.`, 'neg');
        p.job = null;
        p.stats.happiness = clamp(p.stats.happiness - 10);
      }
    } else if (p.retired) {
      income = Math.round(p.pension || 12000);
      p.money += income;
      addLog(`You received ${moneyFull(income)} in retirement income.`, 'pos');
    }

    let expenses = 0;
    if (p.age >= 18) expenses += 9000;
    const kids = p.relationships.filter(r => r.relation === 'Child' && r.alive).length;
    expenses += kids * 3200;
    expenses += p.assets.reduce((s, a) => s + (a.upkeep || 0), 0);
    if (p.debt > 0) {
      const pay = Math.min(1800, p.debt);
      p.debt -= pay;
      expenses += pay;
    }
    p.lastIncome = income;
    p.lastExpenses = expenses;
    if (expenses > 0) {
      p.money -= expenses;
      addLog(`Your yearly expenses were ${moneyFull(expenses)}.`, 'neg');
    }
    if (p.money < 0) {
      addLog('You are in debt. Your bank balance is negative.', 'neg');
      p.stats.happiness = clamp(p.stats.happiness - 4);
    }

    // Stat drift
    p.stats.happiness = clamp(p.stats.happiness + (p.stats.happiness < 45 ? 1 : -randInt(0, 1)));
    if (p.age > 30) p.stats.health = clamp(p.stats.health - (p.age > 65 ? randInt(1, 3) : randInt(0, 1)));
    if (p.age > 45) p.stats.looks = clamp(p.stats.looks - randInt(0, 1));
    if (p.age > 55) p.stats.smarts = clamp(p.stats.smarts - randInt(0, 1));

    // Milestones
    autos.push(...milestones(p));

    // Random events
    const picks = pickEvents(p);
    autos.push(...picks.autos);
    choice = picks.choice;

    // Parents / elders passing
    for (const r of p.relationships) {
      if (!r.alive || r.pet) continue;
      if ((r.relation === 'Mother' || r.relation === 'Father' || r.relation === 'Guardian') && r.age > 68 && chance(.055 + (r.age - 68) * .004)) {
        r.alive = false;
        r.bond = 0;
        addLog(`${r.firstName} passed away at age ${r.age}. You are heartbroken.`, 'neg');
        p.stats.happiness = clamp(p.stats.happiness - 18);
      }
    }
  }

  // Apply auto event results
  for (const auto of autos) {
    if (auto) addLog(auto.text, auto.type || '');
    if (auto?.effect) auto.effect(p);
  }

  // Death check
  if (p.prison <= 0 && deathCheck(p)) {
    die();
    state.pendingEvent = null;
    state.pendingDeath = true;
    const got = checkAchievements();
    save();
    return { death: true, achievements: got };
  }

  if (choice) {
    state.pendingEvent = choice;
  }

  const got = checkAchievements();
  save();
  return { choice: state.pendingEvent, achievements: got };
}

function milestones(p) {
  const out = [];
  const say = (text, type, effect) => out.push({ text, type, effect });
  switch (p.age) {
    case 1:
      say('You took your first steps and said your first word: "dada".', 'special', () => { p.stats.happiness = clamp(p.stats.happiness + 4); });
      break;
    case 3:
      say('You started preschool and made your first friend.', '', () => { p.stats.smarts = clamp(p.stats.smarts + 3); });
      break;
    case 5:
      say('You started kindergarten.', 'info', () => { p.stats.smarts = clamp(p.stats.smarts + 2); });
      break;
    case 6:
      say('You started elementary school.', 'info', () => { p.stats.smarts = clamp(p.stats.smarts + 4); });
      break;
    case 12:
      say('You started middle school.', 'info', () => { p.stats.smarts = clamp(p.stats.smarts + 3); });
      break;
    case 14:
      say('You started high school.', 'info', () => { p.stats.smarts = clamp(p.stats.smarts + 3); });
      break;
    case 16:
      say('You got your first phone. Welcome to the internet.', '', () => { p.stats.happiness = clamp(p.stats.happiness + 5); });
      break;
    case 18:
      if (p.education === 'none') p.education = 'hs';
      say('You graduated from high school.', 'pos', () => { p.stats.happiness = clamp(p.stats.happiness + 6); });
      break;
    case 21:
      say('You are officially an adult. The world is yours.', '', () => { p.stats.happiness = clamp(p.stats.happiness + 2); });
      break;
    case 30:
      say('You turned 30. Time to get your life together... or not.', '', null);
      break;
    case 40:
      say('You turned 40. You bought a sensible pair of shoes.', '', () => { p.stats.looks = clamp(p.stats.looks - 1); });
      break;
    case 50:
      say('You turned 50. Half a century of memories.', 'special', null);
      break;
    case 65:
      say('You reached retirement age.', 'info', null);
      break;
    case 100:
      say('You turned 100 years old. Unbelievable.', 'special', () => { p.stats.happiness = clamp(p.stats.happiness + 20); });
      break;
  }
  return out;
}

function deathCheck(p) {
  if (p.stats.health <= 0) return true;
  let base = 0.0015;
  if (p.age > 50) base += (p.age - 50) * 0.0018;
  if (p.age > 70) base += (p.age - 70) * 0.006;
  if (p.age > 85) base += (p.age - 85) * 0.022;
  if (p.age > 100) base += 0.12;
  base *= 1 + (100 - p.stats.health) / 70;
  if (p.stats.health < 25) base += 0.09;
  if (p.age < 18) base *= 0.35;
  return chance(base);
}

function die() {
  const p = state.player;
  p.alive = false;
  const causes = p.age < 30
    ? ['a tragic accident', 'a sudden illness', 'a freak accident']
    : p.age < 60
      ? ['a heart attack', 'a car accident', 'a sudden illness', 'cancer']
      : p.age < 85
        ? ['a heart attack', 'cancer', 'a stroke', 'complications from an illness']
        : ['old age', 'natural causes', 'a long, full life'];
  p.cause = rand(causes);
  addLog(`You died at age ${p.age} from ${p.cause}.`, 'neg');
  addLog(`Final net worth: ${moneyFull(netWorth(p))}.`, 'special');
}

export function deathSummary() {
  const p = state.player;
  if (!p) return null;
  return {
    name: fullName(p),
    age: p.age,
    cause: p.cause,
    netWorth: netWorth(p),
    happiness: p.stats.happiness,
    children: p.relationships.filter(r => r.relation === 'Child').length,
    achievements: Object.keys(state.achievements).length,
    canLegacy: p.relationships.some(r => r.relation === 'Child' && r.alive),
  };
}

// ---------------------------------------------------------------------------
// Random events
// ---------------------------------------------------------------------------
const EVENT_POOL = [
  {
    id: 'wallet', min: 6, max: 90, weight: 10, title: 'Found Wallet',
    body: () => 'You spot a wallet on the sidewalk. It has <b>$' + '140</b> inside and an ID.',
    options: () => [
      { label: 'Keep the cash', run: () => { changeMoney(140); bump('happiness', 2); return { text: 'You kept the cash. Easy money.', type: 'pos' }; } },
      { label: 'Return the wallet', run: () => { bump('happiness', 6); changeMoney(20); return { text: 'The owner rewarded you with $20 and a clear conscience.', type: 'pos' }; } },
    ],
  },
  {
    id: 'bully', min: 7, max: 17, weight: 9, title: 'School Bully',
    body: () => 'A kid at school keeps making fun of your shoes. The whole class is watching.',
    options: () => [
      { label: 'Stand up for yourself', run: () => { if (chance(.55)) { bump('happiness', 5); bump('looks', 2); return { text: 'You stood your ground. The bully backed off.', type: 'pos' }; } bump('health', -5); bump('happiness', -4); return { text: 'It turned into a fight. You got a bloody nose.', type: 'neg' }; } },
      { label: 'Tell a teacher', run: () => { bump('happiness', 2); bump('smarts', 1); return { text: 'The teacher handled it. The bully got detention.', type: '' }; } },
      { label: 'Ignore them', run: () => { bump('happiness', -2); return { text: 'You ignored them, but it still stung.', type: 'neg' }; } },
    ],
  },
  {
    id: 'drugs', min: 14, max: 34, weight: 7, title: 'Party Invitation',
    body: () => 'Someone at a party offers you something you know you probably shouldn\'t take.',
    options: () => [
      { label: 'Try it', run: () => { if (chance(.5)) { bump('happiness', 8); bump('health', -6); return { text: 'You had a wild night. Your body is not happy about it.', type: '' }; } bump('health', -14); bump('happiness', -6); return { text: 'You had a bad reaction and spent the night throwing up.', type: 'neg' }; } },
      { label: 'Politely decline', run: () => { bump('happiness', 1); return { text: 'You passed. Your future self appreciates it.', type: 'pos' }; } },
    ],
  },
  {
    id: 'sick', min: 2, max: 95, weight: 9, title: 'Feeling Sick',
    body: () => 'You wake up with a pounding headache and a fever. You feel awful.',
    options: () => [
      { label: 'See a doctor ($120)', run: () => { if (state.player.money >= 120) { changeMoney(-120); bump('health', 10); return { text: 'The doctor gave you medicine. You feel much better.', type: 'pos' }; } bump('health', -5); return { text: 'You could not afford a doctor. You tried to sleep it off.', type: 'neg' }; } },
      { label: 'Ride it out', run: () => { bump('health', -6); bump('happiness', -3); return { text: 'You stayed in bed for a few days. It eventually passed.', type: 'neg' }; } },
    ],
  },
  {
    id: 'celebrity', min: 16, max: 90, weight: 5, title: 'Celebrity Sighting',
    body: () => 'You spot a famous actor at a coffee shop. Nobody else seems to have noticed.',
    options: () => [
      { label: 'Ask for a photo', run: () => { bump('happiness', 8); if (chance(.4)) { state.player.followers += 1500; return { text: 'They took a photo with you! Your post blew up.', type: 'pos' }; } return { text: 'They politely declined but said hello. Still a good day.', type: '' }; } },
      { label: 'Play it cool', run: () => { bump('happiness', 4); return { text: 'You played it cool and smiled. Very mysterious of you.', type: '' }; } },
    ],
  },
  {
    id: 'tax', min: 18, max: 90, weight: 6, when: p => !!p.job, title: 'Tax Audit',
    body: () => 'The tax office found some "irregularities" in your paperwork. They want an explanation.',
    options: () => [
      { label: 'Pay the fine ($1,500)', run: () => { changeMoney(-1500); bump('happiness', -4); return { text: 'You paid the fine and hired a better accountant.', type: 'neg' }; } },
      { label: 'Hire a tax lawyer ($3,000)', run: () => { changeMoney(-3000); bump('happiness', 2); return { text: 'Your lawyer got the fine reduced to nothing. Worth it.', type: 'pos' }; } },
    ],
  },
  {
    id: 'cheat', min: 18, max: 90, weight: 6, when: p => p.relationships.some(r => r.alive && (r.relation === 'Partner' || r.relation === 'Spouse')), title: 'Suspicious Messages',
    body: () => 'You see a suspicious message pop up on your partner\'s phone. They quickly hide the screen.',
    options: () => [
      { label: 'Confront them', run: () => { const partner = state.player.relationships.find(r => r.alive && (r.relation === 'Partner' || r.relation === 'Spouse')); if (partner) { partner.bond = clamp(partner.bond - 30); } bump('happiness', -12); return { text: 'They admitted to cheating. Your relationship is badly damaged.', type: 'neg' }; } },
      { label: 'Let it go', run: () => { const partner = state.player.relationships.find(r => r.alive && (r.relation === 'Partner' || r.relation === 'Spouse')); if (partner) partner.bond = clamp(partner.bond - 8); bump('happiness', -4); return { text: 'You let it go, but the doubt lingers.', type: 'neg' }; } },
    ],
  },
  {
    id: 'childmoney', min: 28, max: 90, weight: 6, when: p => p.relationships.some(r => r.alive && r.relation === 'Child'), title: 'Family Matters',
    body: () => 'Your child calls asking for financial help. They sound stressed.',
    options: () => [
      { label: 'Give them $2,000', run: () => { changeMoney(-2000); const c = state.player.relationships.find(r => r.relation === 'Child' && r.alive); if (c) c.bond = clamp(c.bond + 12); bump('happiness', 4); return { text: 'Your child is grateful. Family first.', type: 'pos' }; } },
      { label: 'Say no', run: () => { const c = state.player.relationships.find(r => r.relation === 'Child' && r.alive); if (c) c.bond = clamp(c.bond - 10); bump('happiness', -3); return { text: 'You said no. They hung up upset.', type: 'neg' }; } },
    ],
  },
  {
    id: 'midlife', min: 40, max: 58, weight: 6, title: 'Midlife Crisis',
    body: () => 'You wake up and suddenly feel like you have wasted your youth. Something must change.',
    options: () => [
      { label: 'Buy a sports car ($60,000)', run: () => { if (state.player.money >= 60000) { changeMoney(-60000); bump('happiness', 18); bump('looks', 4); return { text: 'You bought a bright red sports car. Subtle.', type: 'pos' }; } bump('happiness', -3); return { text: 'You could not afford it. The crisis continues.', type: 'neg' }; } },
      { label: 'Take up yoga', run: () => { bump('happiness', 10); bump('health', 5); return { text: 'You found inner peace on a mat. Namaste.', type: 'pos' }; } },
    ],
  },
  {
    id: 'inheritance', min: 35, max: 95, weight: 4, title: 'Unexpected Inheritance',
    body: () => 'A distant relative you barely remember has left you something in their will.',
    options: () => [
      { label: 'Accept it', run: () => { const amt = randInt(5, 80) * 1000; changeMoney(amt); bump('happiness', 8); return { text: `You inherited ${moneyFull(amt)}.`, type: 'pos' }; } },
    ],
  },
  {
    id: 'startup', min: 24, max: 55, weight: 4, title: 'Startup Offer',
    body: () => 'A friend wants you to invest in their new app. "It is going to be huge," they say.',
    options: () => [
      { label: 'Invest $10,000', run: () => { if (state.player.money >= 10000) { changeMoney(-10000); if (chance(.3)) { changeMoney(65000); bump('happiness', 12); return { text: 'The app took off. Your investment paid out $65,000!', type: 'pos' }; } bump('happiness', -8); return { text: 'The app flopped. You lost your $10,000.', type: 'neg' }; } return { text: 'You do not have $10,000 to spare.', type: 'neg' }; } },
      { label: 'Pass', run: () => ({ text: 'You passed. Sometimes the boring choice is the right one.', type: '' }) },
    ],
  },
  {
    id: 'viral', min: 13, max: 80, weight: 5, title: 'Going Viral',
    body: () => 'A video you posted is suddenly getting attention. Comments are flooding in.',
    options: () => [
      { label: 'Lean into it', run: () => { const f = randInt(2000, 60000); state.player.followers += f; bump('happiness', 8); return { text: `You gained ${f.toLocaleString()} followers.`, type: 'pos' }; } },
      { label: 'Delete it', run: () => { bump('happiness', -2); return { text: 'You deleted the video. The internet moved on.', type: '' }; } },
    ],
  },
  {
    id: 'robbed', min: 16, max: 90, weight: 5, title: 'Mugged',
    body: () => 'Someone steps out of an alley and demands your wallet.',
    options: () => [
      { label: 'Hand over your wallet', run: () => { const amt = Math.min(state.player.money, randInt(100, 800)); changeMoney(-amt); bump('happiness', -6); return { text: `They took ${moneyFull(amt)} and ran. At least you are safe.`, type: 'neg' }; } },
      { label: 'Run', run: () => { if (chance(.55)) { bump('happiness', 2); return { text: 'You bolted and got away. Your cardio finally paid off.', type: 'pos' }; } bump('health', -8); changeMoney(-200); return { text: 'They caught you. You got hurt and lost $200.', type: 'neg' }; } },
    ],
  },
  {
    id: 'cruise', min: 25, max: 90, weight: 5, title: 'Cruise Invitation',
    body: () => 'A friend invites you on a week-long cruise. It sounds amazing, but it is not free.',
    options: () => [
      { label: 'Go ($3,000)', run: () => { if (state.player.money >= 3000) { changeMoney(-3000); bump('happiness', 16); bump('health', 3); state.player.vacations++; return { text: 'Sun, sea and zero responsibilities. Worth every penny.', type: 'pos' }; } return { text: 'You cannot afford the trip right now.', type: 'neg' }; } },
      { label: 'Stay home', run: () => ({ text: 'You stayed home and watched cruise videos instead.', type: '' }) },
    ],
  },
  {
    id: 'wedding', min: 20, max: 90, weight: 5, title: 'Wedding Invitation',
    body: () => 'A friend is getting married and wants you there. The gift registry is... ambitious.',
    options: () => [
      { label: 'Attend with a gift ($500)', run: () => { changeMoney(-500); bump('happiness', 8); return { text: 'You danced all night and caught the bouquet. Maybe.', type: 'pos' }; } },
      { label: 'Send your regrets', run: () => { bump('happiness', -2); return { text: 'You stayed home. The cake looked great on social media.', type: '' }; } },
    ],
  },
  {
    id: 'prom', min: 16, max: 19, weight: 9, when: p => p.age <= 19, title: 'Prom Night',
    body: () => 'The school prom is coming up. Everyone is talking about it.',
    options: () => [
      { label: 'Go all out', run: () => { changeMoney(-400); bump('happiness', 12); bump('looks', 3); return { text: 'You looked amazing and danced until your feet hurt.', type: 'pos' }; } },
      { label: 'Stay home', run: () => { bump('happiness', -4); bump('smarts', 2); return { text: 'You stayed home and studied. Responsible, if a little lonely.', type: '' }; } },
    ],
  },
  {
    id: 'layoff', min: 20, max: 65, weight: 5, when: p => !!p.job, title: 'Layoffs',
    body: () => 'Your company announced layoffs. Your name is on the list.',
    options: () => [
      { label: 'Negotiate a severance', run: () => { const amt = Math.round((state.player.job?.salary || 30000) * .2); changeMoney(amt); state.player.job = null; bump('happiness', -8); return { text: `You lost your job but got ${moneyFull(amt)} severance.`, type: 'neg' }; } },
      { label: 'Accept it quietly', run: () => { state.player.job = null; bump('happiness', -12); return { text: 'You packed your desk and walked out. Time for a fresh start.', type: 'neg' }; } },
    ],
  },
  {
    id: 'stray', min: 8, max: 90, weight: 5, title: 'Stray Dog',
    body: () => 'A scruffy little dog follows you home. It has no collar and looks hungry.',
    options: () => [
      { label: 'Adopt it', run: () => { changeMoney(-250); const pet = makePerson({ gender: chance(.5) ? 'female' : 'male', age: 2, relation: 'Pet', bond: 92, firstName: rand(['Biscuit', 'Pepper', 'Mochi', 'Waffles', 'Shadow', 'Luna', 'Charlie', 'Bean']) }); state.player.relationships.push(pet); bump('happiness', 10); return { text: `You adopted ${pet.firstName}. Your heart grew three sizes.`, type: 'pos' }; } },
      { label: 'Leave it be', run: () => { bump('happiness', -2); return { text: 'You walked away. The little face haunts you a bit.', type: '' }; } },
    ],
  },
  {
    id: 'jury', min: 21, max: 75, weight: 4, title: 'Jury Duty',
    body: () => 'You have been summoned for jury duty. It is your civic responsibility.',
    options: () => [
      { label: 'Serve', run: () => { bump('happiness', 3); bump('smarts', 2); changeMoney(-100); return { text: 'You served on a trial. The legal system is fascinating.', type: '' }; } },
      { label: 'Try to get out of it', run: () => { if (chance(.6)) return { text: 'You got out of jury duty. Lucky you.', type: 'pos' }; changeMoney(-500); return { text: 'The judge was not amused. You were fined $500.', type: 'neg' }; } },
    ],
  },
  {
    id: 'siblingloan', min: 20, max: 90, weight: 4, when: p => p.relationships.some(r => r.alive && r.relation === 'Sibling'), title: 'Sibling Trouble',
    body: () => 'Your sibling needs to borrow money. They promise to pay you back.',
    options: () => [
      { label: 'Lend $3,000', run: () => { changeMoney(-3000); const s = state.player.relationships.find(r => r.alive && r.relation === 'Sibling'); if (s) s.bond = clamp(s.bond + 15); return { text: 'You lent them the money. Family helps family.', type: 'pos' }; } },
      { label: 'Refuse', run: () => { const s = state.player.relationships.find(r => r.alive && r.relation === 'Sibling'); if (s) s.bond = clamp(s.bond - 12); return { text: 'You said no. Things are awkward now.', type: 'neg' }; } },
    ],
  },
  {
    id: 'promotion', min: 18, max: 65, weight: 6, when: p => !!p.job, title: 'Offer on the Table',
    body: () => 'Your boss pulls you aside. There is a promotion available, but it comes with more pressure.',
    options: () => [
      { label: 'Take the promotion', run: () => { const j = state.player.job; j.title = j.title.startsWith('Senior') ? j.title : 'Senior ' + j.title; j.salary = Math.round(j.salary * 1.25); j.performance = clamp((j.performance || 60) + 8); bump('happiness', 6); unlock('promotion'); return { text: `You were promoted to ${j.title}! Salary increased.`, type: 'pos' }; } },
      { label: 'Stay where you are', run: () => { bump('happiness', 2); return { text: 'You declined. Less stress, same paycheck.', type: '' }; } },
    ],
  },
  {
    id: 'lotterygift', min: 12, max: 90, weight: 5, title: 'Scratch Card',
    body: () => 'A relative gives you a scratch-off lottery ticket as a gift.',
    options: () => [
      { label: 'Scratch it', run: () => { const roll = Math.random(); if (roll < .002) { changeMoney(250000); bump('happiness', 20); return { text: 'JACKPOT! You won $250,000!', type: 'pos' }; } if (roll < .03) { changeMoney(5000); bump('happiness', 8); return { text: 'You won $5,000! Not bad for a gift.', type: 'pos' }; } if (roll < .2) { changeMoney(50); return { text: 'You won $50. Enough for a nice dinner.', type: 'pos' }; } return { text: 'Nothing. Not even a free ticket.', type: '' }; } },
    ],
  },
  {
    id: 'foodpoison', min: 3, max: 95, weight: 6, title: 'Bad Takeout',
    body: () => 'That late-night takeout did not agree with you. You feel terrible.',
    options: () => [
      { label: 'Wait it out', run: () => { bump('health', -5); bump('happiness', -3); return { text: 'You spent the night in the bathroom. Grim.', type: 'neg' }; } },
      { label: 'Go to the hospital ($300)', run: () => { changeMoney(-300); bump('health', 2); return { text: 'The hospital patched you up. You will live.', type: '' }; } },
    ],
  },
  {
    id: 'gymbuddy', min: 16, max: 70, weight: 5, title: 'Gym Buddy',
    body: () => 'Someone at the gym offers to be your workout partner. They seem very motivated.',
    options: () => [
      { label: 'Accept', run: () => { bump('health', 6); bump('happiness', 3); return { text: 'You gained a gym buddy and actually showed up.', type: 'pos' }; } },
      { label: 'Decline', run: () => ({ text: 'You prefer to work out alone. Fair enough.', type: '' }) },
    ],
  },
];

function pickEvents(p) {
  const autos = [];
  const autoPool = [
    { when: () => true, run: () => chance(.5) ? { text: 'The weather was beautiful this year.', type: '' } : null },
    { when: () => p.age > 18 && p.job, run: () => ({ text: 'A coworker brought donuts to the office. A good day.', type: 'pos', effect: () => bump('happiness', 2) }) },
    { when: () => p.age < 18, run: () => ({ text: 'You spent the summer riding bikes with your friends.', type: '', effect: () => bump('happiness', 3) }) },
    { when: () => p.age > 65, run: () => ({ text: 'You spent a quiet afternoon in the garden.', type: '', effect: () => bump('happiness', 2) }) },
    { when: () => p.relationships.some(r => r.alive && (r.relation === 'Partner' || r.relation === 'Spouse')), run: () => ({ text: 'You and your partner had a lovely date night.', type: 'pos', effect: () => { bump('happiness', 4); const r = p.relationships.find(r => r.alive && (r.relation === 'Partner' || r.relation === 'Spouse')); if (r) r.bond = clamp(r.bond + 2); } }) },
    { when: () => p.assets.some(a => a.type === 'Property'), run: () => ({ text: 'You spent the weekend fixing things around the house.', type: '', effect: () => bump('happiness', 2) }) },
  ];
  const auto = rand(autoPool.filter(a => a.when()));
  const autoRes = auto?.run();
  if (autoRes) autos.push(autoRes);

  const options = EVENT_POOL.filter(e => p.age >= e.min && p.age <= e.max && (!e.when || e.when(p)) && !(e.once && p.seenEvents.includes(e.id)));
  if (options.length && chance(.58)) {
    const weighted = options.flatMap(e => Array(Math.max(1, e.weight || 4)).fill(e));
    const e = rand(weighted);
    if (e.once) p.seenEvents.push(e.id);
    return { autos, choice: { id: e.id, title: e.title, body: e.body(p), options: e.options(p) } };
  }
  return { autos, choice: null };
}

export function resolveEventOption(optionIndex) {
  const ev = state.pendingEvent;
  if (!ev) return null;
  const opt = ev.options[optionIndex];
  if (!opt) return null;
  const result = opt.run();
  if (result?.text) addLog(result.text, result.type || '');
  state.pendingEvent = null;
  const got = checkAchievements();
  save();
  return { ...result, achievements: got };
}

// ---------------------------------------------------------------------------
// Activities
// ---------------------------------------------------------------------------
export function canAct() {
  const p = state.player;
  if (!p) return { ok: false, message: 'No life in progress.' };
  if (!p.alive) return { ok: false, message: 'Your life is over.' };
  if (p.prison > 0) return { ok: false, message: 'You are in prison.' };
  return { ok: true };
}

export function doActivity(id) {
  const p = state.player;
  const meta = ACTIVITY_ACTIONS[id];
  const guard = canAct();
  if (!guard.ok) return { ok: false, message: guard.message };
  if (!meta) return { ok: false, message: 'Unknown activity.' };
  if (meta.minAge && p.age < meta.minAge) return { ok: false, message: `You must be at least ${meta.minAge} to do this.` };
  if (meta.cost && p.money < meta.cost) return { ok: false, message: `You need ${moneyFull(meta.cost)} for this.` };

  const pay = () => { if (meta.cost) changeMoney(-meta.cost); };
  let out = { ok: true };

  switch (id) {
    case 'study': {
      pay();
      const gain = randInt(3, 6);
      bump('smarts', gain); bump('happiness', -1);
      out.message = `You studied hard. Smarts +${gain}.`;
      addLog(`You studied hard and improved your smarts.`, 'pos');
      break;
    }
    case 'library': {
      const gain = randInt(2, 4);
      bump('smarts', gain); bump('happiness', 1);
      out.message = `A quiet afternoon at the library. Smarts +${gain}.`;
      addLog('You spent the afternoon reading at the library.', 'pos');
      break;
    }
    case 'university': {
      if (p.pendingEducation) return { ok: false, message: 'You are already enrolled in school.' };
      if (p.education === 'uni' || p.education === 'grad') return { ok: false, message: 'You already have a degree.' };
      if (p.age < 18) return { ok: false, message: 'You must be 18 to enroll.' };
      pay();
      p.pendingEducation = { type: 'uni', years: 4 };
      bump('smarts', 8);
      addLog('You enrolled in university. Four years of hard work ahead.', 'info');
      out.message = 'You enrolled in university!';
      out.modal = { title: 'University', body: `<p>You are officially a college student. Tuition set you back <b>${moneyFull(meta.cost)}</b>.</p><p class="modal-blue">Graduate in 4 years to unlock better jobs.</p>` };
      break;
    }
    case 'gradschool': {
      if (p.pendingEducation) return { ok: false, message: 'You are already enrolled in school.' };
      if (p.education !== 'uni') return { ok: false, message: 'You need a university degree first.' };
      pay();
      p.pendingEducation = { type: 'grad', years: 2 };
      bump('smarts', 10);
      addLog('You enrolled in graduate school.', 'info');
      out.message = 'You enrolled in graduate school!';
      break;
    }
    case 'tradeschool': {
      pay();
      p.trade = true; bump('smarts', 8);
      addLog('You completed a trade certification.', 'pos');
      out.message = 'You earned a trade certification.';
      break;
    }
    case 'gym': {
      pay();
      const h = randInt(3, 7); const l = randInt(0, 2);
      bump('health', h); bump('looks', l); bump('happiness', 2);
      out.message = `You worked out. Health +${h}${l ? ` · Looks +${l}` : ''}.`;
      addLog('You hit the gym and felt the burn.', 'pos');
      break;
    }
    case 'doctor': {
      pay();
      const h = randInt(6, 14);
      bump('health', h);
      out.message = `The doctor gave you a clean bill of health. Health +${h}.`;
      addLog('You visited the doctor and got a checkup.', 'pos');
      break;
    }
    case 'dentist': {
      pay();
      const l = randInt(2, 5);
      bump('looks', l); bump('health', 1);
      out.message = `Your smile is brighter. Looks +${l}.`;
      addLog('You got your teeth cleaned at the dentist.', 'pos');
      break;
    }
    case 'spa': {
      pay();
      const l = randInt(3, 7); const h = randInt(3, 7);
      bump('looks', l); bump('happiness', h);
      out.message = `You feel refreshed. Looks +${l} · Happiness +${h}.`;
      addLog('You treated yourself to a spa day.', 'pos');
      break;
    }
    case 'meditate': {
      const h = randInt(4, 8);
      bump('happiness', h); bump('health', 1);
      out.message = `You found your center. Happiness +${h}.`;
      addLog('You meditated and found a moment of peace.', 'pos');
      break;
    }
    case 'surgery': {
      pay();
      if (chance(.75)) {
        const l = randInt(10, 20);
        bump('looks', l);
        out.message = `The surgery was a success. Looks +${l}.`;
        addLog('You got plastic surgery and love the results.', 'pos');
        out.modal = { title: 'Plastic Surgery', body: `<p>The procedure went perfectly. You look like a brand-new person.</p><p class="modal-blue">Looks +${l}</p>` };
      } else {
        const l = randInt(8, 16);
        bump('looks', -l); bump('health', -5);
        out.message = `The surgery was botched. Looks -${l}.`;
        addLog('Your plastic surgery went horribly wrong.', 'neg');
        out.modal = { title: 'Botched Surgery', body: `<p>The surgeon sneezed. You are going to need a good lawyer.</p><p class="modal-blue">Looks -${l} · Health -5</p>` };
      }
      break;
    }
    case 'movies': {
      pay();
      const h = randInt(4, 8);
      bump('happiness', h);
      out.message = `You enjoyed the movie. Happiness +${h}.`;
      addLog('You went to the movies and ate too much popcorn.', 'pos');
      break;
    }
    case 'concert': {
      pay();
      const h = randInt(7, 13);
      bump('happiness', h);
      out.message = `Great concert! Happiness +${h}.`;
      addLog('You went to an amazing concert and sang your heart out.', 'pos');
      break;
    }
    case 'vacation': {
      pay();
      const h = randInt(10, 18);
      bump('happiness', h); bump('health', 2); p.vacations++;
      out.message = `You needed that vacation. Happiness +${h}.`;
      addLog('You took a vacation and came back feeling alive.', 'pos');
      out.modal = { title: 'Vacation', body: `<p>Sun, sand and absolutely no emails. You feel like a new person.</p><p class="modal-blue">Happiness +${h} · Health +2</p>` };
      break;
    }
    case 'games': {
      const h = randInt(3, 6);
      bump('happiness', h); bump('smarts', 1);
      out.message = `You gamed all afternoon. Happiness +${h}.`;
      addLog('You spent the day playing video games.', 'pos');
      break;
    }
    case 'party': {
      const h = randInt(8, 14); const dmg = randInt(3, 8);
      bump('happiness', h); bump('health', -dmg);
      out.message = `What a night! Happiness +${h} · Health -${dmg}.`;
      addLog('You went to a party and stayed out way too late.', 'pos');
      break;
    }
    case 'pet': {
      pay();
      const pet = makePerson({ gender: chance(.5) ? 'female' : 'male', age: randInt(1, 4), relation: 'Pet', bond: 90, firstName: rand(['Biscuit', 'Pepper', 'Mochi', 'Waffles', 'Shadow', 'Luna', 'Charlie', 'Bean', 'Noodle', 'Pickles']) });
      p.relationships.push(pet);
      bump('happiness', 10);
      addLog(`You adopted a pet named ${pet.firstName}.`, 'pos');
      out.message = `Welcome home, ${pet.firstName}!`;
      out.modal = { title: 'New Pet', body: `<p>You adopted <b>${pet.firstName}</b>. They already own your heart (and your couch).</p><p class="modal-blue">Happiness +10</p>` };
      break;
    }
    case 'lottery': {
      pay();
      const roll = Math.random();
      if (roll < .0004) {
        changeMoney(1000000); bump('happiness', 25);
        out.modal = { title: 'JACKPOT!', body: '<p>You won <b>$1,000,000</b>! Your life just changed forever.</p><p class="modal-blue">The odds were one in a million. Literally.</p>' };
        addLog('You won $1,000,000 in the lottery!', 'special');
      } else if (roll < .01) {
        changeMoney(10000); bump('happiness', 12);
        out.modal = { title: 'Winner!', body: '<p>You won <b>$10,000</b> on a lottery ticket!</p>' };
        addLog('You won $10,000 in the lottery!', 'pos');
      } else if (roll < .08) {
        changeMoney(100); bump('happiness', 3);
        out.message = 'You won $100. Better than nothing.';
        addLog('You won $100 on a lottery ticket.', 'pos');
      } else {
        out.message = 'No luck. Maybe next time.';
        addLog('Your lottery ticket was a loser.', 'neg');
      }
      break;
    }
    case 'casino': {
      pay();
      if (chance(.48)) {
        const win = meta.cost * 2;
        changeMoney(win);
        bump('happiness', 8);
        out.modal = { title: 'Big Win', body: `<p>The cards fell your way. You doubled your money and walked away with <b>${moneyFull(win)}</b>.</p>` };
        addLog(`You won ${moneyFull(win)} at the casino.`, 'pos');
      } else {
        bump('happiness', -6);
        out.modal = { title: 'House Always Wins', body: `<p>You lost your <b>${moneyFull(meta.cost)}</b>. The dealer did not even smile.</p>` };
        addLog(`You lost ${moneyFull(meta.cost)} at the casino.`, 'neg');
      }
      break;
    }
    case 'stocks': {
      pay();
      const roll = Math.random();
      if (roll < .55) {
        const gain = Math.round(meta.cost * (0.08 + Math.random() * 0.35));
        changeMoney(meta.cost + gain);
        bump('happiness', 5);
        out.modal = { title: 'Smart Investment', body: `<p>Your stocks went up. You made a profit of <b>${moneyFull(gain)}</b>.</p>` };
        addLog(`Your stock investment earned ${moneyFull(gain)}.`, 'pos');
      } else {
        const loss = Math.round(meta.cost * (0.25 + Math.random() * 0.4));
        changeMoney(meta.cost - loss);
        bump('happiness', -6);
        out.modal = { title: 'Market Crash', body: `<p>The market dropped. You lost <b>${moneyFull(loss)}</b>.</p>` };
        addLog(`Your stock investment lost ${moneyFull(loss)}.`, 'neg');
      }
      break;
    }
    case 'charity': {
      pay();
      bump('happiness', 7);
      out.message = 'You donated to charity. Good karma.';
      addLog('You donated $1,000 to charity.', 'pos');
      break;
    }
    case 'loan': {
      changeMoney(10000); p.debt = (p.debt || 0) + 12000;
      out.message = 'You took a $10,000 loan. You owe $12,000.';
      addLog('You took out a bank loan.', 'info');
      break;
    }
    case 'date': {
      if (p.age < 16) return { ok: false, message: 'You must be 16 to date.' };
      const partner = makePerson({ age: Math.max(16, p.age + randInt(-2, 4)), relation: 'Partner', lastName: randomLastName(), bond: randInt(45, 65) });
      out.modal = {
        title: 'Love Interest',
        body: `<div class="modal-avatar-row"><div class="avatar avatar-lg">${avatarSVG(partner.avatar, { age: partner.age })}</div><div class="who"><b>${partner.firstName} ${partner.lastName}</b><span>${partner.age} · ${partner.gender === 'female' ? 'Woman' : 'Man'} · ${rand(['Kind', 'Funny', 'Ambitious', 'Adventurous', 'Mysterious'])}</span></div></div><p>You matched with someone interesting. Want to ask them out?</p>`,
        options: [
          { label: 'Ask them out', action: () => askOut(partner) },
          { label: 'Not my type', action: () => ({ toast: 'You passed on the date.' }) },
        ],
      };
      break;
    }
    case 'friend': {
      const friend = makePerson({ age: clamp(p.age + randInt(-5, 5), 8, 95), relation: 'Friend', lastName: randomLastName(), bond: randInt(40, 70) });
      p.relationships.push(friend);
      bump('happiness', 5);
      addLog(`You made a new friend, ${friend.firstName}.`, 'pos');
      out.message = `You made a new friend: ${friend.firstName}.`;
      break;
    }
    case 'socialmedia': {
      const gained = chance(.05) ? randInt(20000, 150000) : randInt(20, 1500);
      p.followers += gained;
      bump('happiness', 3);
      addLog(`You posted online and gained ${gained.toLocaleString()} followers.`, gained > 5000 ? 'special' : 'pos');
      out.message = `+${gained.toLocaleString()} followers`;
      if (gained > 5000) out.modal = { title: 'Going Viral', body: `<p>Your post blew up! You gained <b>${gained.toLocaleString()}</b> followers.</p>` };
      break;
    }
    case 'nightout': {
      pay();
      const h = randInt(6, 12);
      bump('happiness', h); bump('health', -2);
      addLog('You had a night out with friends.', 'pos');
      out.message = `A fun night out. Happiness +${h}.`;
      break;
    }
    case 'shoplift':
    case 'pickpocket':
    case 'carjack':
    case 'bankrob':
    case 'assault': {
      return commitCrime(id);
    }
    default:
      out.message = 'Nothing happened.';
  }

  const got = checkAchievements();
  save();
  return { ...out, achievements: got };
}

function askOut(person) {
  const p = state.player;
  const hasPartner = p.relationships.some(r => r.alive && (r.relation === 'Partner' || r.relation === 'Spouse'));
  if (hasPartner) return { toast: 'You are already in a relationship.' };
  const score = p.stats.looks * .5 + p.stats.happiness * .2 + (p.money > 10000 ? 15 : 0) + randInt(0, 30);
  if (score > 45) {
    person.relation = 'Partner';
    person.bond = randInt(55, 72);
    p.relationships.push(person);
    bump('happiness', 10);
    addLog(`You are now dating ${person.firstName}.`, 'pos');
    save();
    return { toast: `You are now dating ${person.firstName}!`, result: { title: 'It\'s a Match!', body: `<p>${person.firstName} said yes. You have a date this weekend.</p>` }, achievements: checkAchievements() };
  }
  bump('happiness', -4);
  addLog(`You asked ${person.firstName} out and got rejected.`, 'neg');
  save();
  return { toast: `${person.firstName} said no. Ouch.` };
}

export function commitCrime(id, forced = null) {
  const p = state.player;
  const crimes = {
    shoplift: { chance: .78, reward: () => randInt(40, 300), fine: () => randInt(100, 600), prison: () => (chance(.3) ? 1 : 0), name: 'shoplifting' },
    pickpocket: { chance: .62, reward: () => randInt(100, 900), fine: () => randInt(200, 1500), prison: () => (chance(.45) ? randInt(1, 2) : 0), name: 'pickpocketing' },
    carjack: { chance: .48, reward: () => randInt(2000, 12000), fine: () => randInt(1000, 4000), prison: () => randInt(2, 5), name: 'stealing a car' },
    bankrob: { chance: .3, reward: () => randInt(15000, 90000), fine: () => randInt(5000, 15000), prison: () => randInt(5, 12), name: 'robbing a bank' },
    assault: { chance: .5, reward: () => 0, fine: () => randInt(500, 3000), prison: () => randInt(1, 4), name: 'assault' },
  };
  const c = crimes[id];
  const bonus = (p.stats.smarts - 50) * .003 + (p.stats.looks - 50) * .001;
  const success = forced === null ? chance(clamp(c.chance + bonus, .05, .95)) : !!forced;
  if (success) {
    const amt = c.reward();
    if (amt) changeMoney(amt);
    bump('happiness', 4);
    addLog(amt ? `You got away with ${c.name} and scored ${moneyFull(amt)}.` : `You got away with ${c.name}.`, 'pos');
    save();
    return { ok: true, modal: { title: 'Smooth Criminal', body: `<p>You pulled off ${c.name} without getting caught.</p>${amt ? `<p class="modal-blue">You made ${moneyFull(amt)}.</p>` : ''}` }, achievements: checkAchievements() };
  }
  const fine = Math.min(p.money > 0 ? p.money : 0, c.fine());
  changeMoney(-fine);
  bump('happiness', -10);
  const sentence = c.prison();
  let body = `<p>You were caught ${c.name}.</p><p>You were fined <b>${moneyFull(fine)}</b>.`;
  if (sentence > 0) {
    p.prison = sentence;
    p.job = null;
    p.beenToPrison = true;
    bump('health', -4);
    body += ` You were sentenced to <b>${sentence} year${sentence === 1 ? '' : 's'}</b> in prison.</p>`;
    addLog(`You were arrested for ${c.name} and sentenced to ${sentence} year${sentence === 1 ? '' : 's'} in prison.`, 'neg');
    unlock('criminal');
  } else {
    body += ' You got off with a warning.</p>';
    addLog(`You were caught ${c.name} and fined ${moneyFull(fine)}.`, 'neg');
  }
  save();
  return { ok: true, modal: { title: 'Busted!', body }, achievements: checkAchievements() };
}

// ---------------------------------------------------------------------------
// Prison
// ---------------------------------------------------------------------------
export function prisonAction(action, forced = null) {
  const p = state.player;
  if (!p || p.prison <= 0) return { ok: false, message: 'You are not in prison.' };
  if (action === 'escape') {
    const success = forced === null ? chance(.18) : !!forced;
    if (success) {
      p.prison = 0;
      bump('happiness', 15);
      addLog('You escaped from prison!', 'special');
      save();
      return { ok: true, modal: { title: 'Jailbreak!', body: '<p>You slipped past the guards and vanished into the night. You are free again.</p><p class="modal-blue">Happiness +15</p>' }, achievements: checkAchievements() };
    }
    const extra = randInt(1, 2);
    p.prison += extra;
    bump('happiness', -10);
    addLog(`Your escape attempt failed. ${extra} more year${extra === 1 ? '' : 's'} added to your sentence.`, 'neg');
    save();
    return { ok: true, modal: { title: 'Escape Failed', body: `<p>The guards caught you halfway over the wall.</p><p class="modal-blue">Sentence extended by ${extra} year${extra === 1 ? '' : 's'}.</p>` }, achievements: checkAchievements() };
  }
  if (action === 'behave') {
    p.prison = Math.max(0, p.prison - 1);
    bump('happiness', 2);
    addLog(p.prison > 0 ? 'You kept your head down and earned good behavior credit.' : 'You served your time and walked out a free person.', 'pos');
    save();
    return { ok: true, message: p.prison > 0 ? 'Sentence reduced by one year.' : 'You are free!' };
  }
  if (action === 'workout') {
    bump('health', 4);
    bump('happiness', 2);
    addLog('You worked out in the prison yard.', 'pos');
    save();
    return { ok: true, message: 'Health +4 · Happiness +2' };
  }
  return { ok: false, message: 'Unknown action.' };
}

// ---------------------------------------------------------------------------
// Jobs
// ---------------------------------------------------------------------------
export function jobListings() {
  const p = state.player;
  if (!p) return [];
  const eduRank = { none: 0, hs: 1, uni: 2, grad: 3 };
  return JOBS
    .filter(j => p.age >= j.minAge)
    .filter(j => eduRank[p.education] >= eduRank[j.edu] || (p.trade && j.edu === 'hs'))
    .map(j => ({ ...j, eligible: p.stats.smarts >= j.smarts && p.stats.looks >= j.looks, company: rand(COMPANIES) }))
    .sort((a, b) => b.salary - a.salary);
}

export function applyForJob(jobId, preferredCompany = null) {
  const p = state.player;
  const guard = canAct();
  if (!guard.ok) return { ok: false, message: guard.message };
  const job = JOBS.find(j => j.id === jobId);
  if (!job) return { ok: false, message: 'Job not found.' };
  if (p.age < job.minAge) return { ok: false, message: `You must be ${job.minAge} to apply.` };
  const eduRank = { none: 0, hs: 1, uni: 2, grad: 3 };
  if (eduRank[p.education] < eduRank[job.edu] && !(p.trade && job.edu === 'hs')) {
    return { ok: false, message: `This job requires ${EDUCATION_LABEL[job.edu]}.` };
  }
  if (p.stats.smarts < job.smarts) return { ok: false, message: `You need at least ${job.smarts} Smarts for this job.` };
  if (p.stats.looks < job.looks) return { ok: false, message: `You need at least ${job.looks} Looks for this job.` };
  const score = .42 + (p.stats.smarts - job.smarts) * .004 + (p.stats.looks - job.looks) * .002 + (eduRank[p.education] - eduRank[job.edu]) * .08;
  if (chance(clamp(score, .08, .95))) {
    const company = preferredCompany || rand(COMPANIES);
    p.job = { id: job.id, title: job.title, icon: job.icon, salary: job.salary, company, performance: randInt(52, 70), years: 0 };
    p.retired = false;
    p.jobHistory.push({ title: job.title, company, salary: job.salary, startAge: p.age });
    bump('happiness', 8);
    addLog(`You got a job as a ${job.title} at ${company}!`, 'pos');
    // coworkers
    if (chance(.7)) {
      const cw = makePerson({ age: clamp(p.age + randInt(-6, 8), 20, 65), relation: 'Coworker', lastName: randomLastName(), bond: randInt(35, 60) });
      p.relationships.push(cw);
    }
    unlock('first_job');
    save();
    return {
      ok: true,
      modal: { title: 'You\'re Hired!', body: `<p><b>${job.title}</b> at <b>${company}</b>.</p><p>Starting salary: <b>${moneyFull(job.salary)}/year</b>.</p><p class="modal-blue">Work hard to earn raises and promotions.</p>` },
      achievements: checkAchievements(),
    };
  }
  bump('happiness', -3);
  addLog(`You applied for a job as a ${job.title} but did not get it.`, 'neg');
  save();
  return { ok: false, message: `You did not get the ${job.title} job.`, modal: { title: 'Not This Time', body: `<p>You interviewed for <b>${job.title}</b> but they went with someone else.</p><p class="modal-blue">Try improving your stats and applying again.</p>` } };
}

export function workHarder() {
  const p = state.player;
  const guard = canAct();
  if (!guard.ok) return { ok: false, message: guard.message };
  if (!p.job) return { ok: false, message: 'You do not have a job.' };
  const gain = randInt(7, 14);
  p.job.performance = clamp((p.job.performance || 50) + gain);
  bump('happiness', -2); bump('health', -1);
  addLog('You worked harder than ever at your job.', 'pos');
  save();
  return { ok: true, message: `Performance +${gain}. Your boss noticed.`, achievements: checkAchievements() };
}
export function askRaise() {
  const p = state.player;
  const guard = canAct();
  if (!guard.ok) return { ok: false, message: guard.message };
  if (!p.job) return { ok: false, message: 'You do not have a job.' };
  const score = .22 + (p.job.performance || 50) / 170;
  if (chance(clamp(score, .1, .85))) {
    const raise = Math.round(p.job.salary * (0.06 + Math.random() * 0.12));
    p.job.salary += raise;
    p.job.performance = clamp(p.job.performance - 4);
    bump('happiness', 7);
    addLog(`You got a raise of ${moneyFull(raise)} per year!`, 'pos');
    save();
    return { ok: true, modal: { title: 'Raise Approved', body: `<p>Your boss approved a raise of <b>${moneyFull(raise)}</b> per year.</p><p>New salary: <b>${moneyFull(p.job.salary)}</b>.</p>` }, achievements: checkAchievements() };
  }
  bump('happiness', -4);
  addLog('You asked for a raise and were turned down.', 'neg');
  save();
  return { ok: false, modal: { title: 'Request Denied', body: '<p>"Maybe next quarter," your boss said without looking up.</p>' } };
}
export function askPromotion() {
  const p = state.player;
  const guard = canAct();
  if (!guard.ok) return { ok: false, message: guard.message };
  if (!p.job) return { ok: false, message: 'You do not have a job.' };
  if ((p.job.performance || 0) < 68) return { ok: false, message: 'Your performance is too low for a promotion.' };
  const score = .3 + (p.job.performance - 60) / 120;
  if (chance(clamp(score, .15, .9))) {
    p.job.title = p.job.title.startsWith('Senior') ? p.job.title.replace('Senior ', 'Lead ') : 'Senior ' + p.job.title;
    const raise = Math.round(p.job.salary * (0.18 + Math.random() * 0.2));
    p.job.salary += raise;
    p.job.performance = clamp(p.job.performance - 8);
    bump('happiness', 10);
    addLog(`You were promoted to ${p.job.title}!`, 'pos');
    unlock('promotion');
    save();
    return { ok: true, modal: { title: 'Promoted!', body: `<p>You are now <b>${p.job.title}</b>.</p><p>New salary: <b>${moneyFull(p.job.salary)}</b>.</p>` }, achievements: checkAchievements() };
  }
  bump('happiness', -3);
  addLog('You asked for a promotion and were told to keep working.', 'neg');
  save();
  return { ok: false, modal: { title: 'Not Yet', body: '<p>"Keep up the good work and we will talk," your boss said.</p>' } };
}
export function quitJob() {
  const p = state.player;
  if (!p.job) return { ok: false, message: 'You do not have a job.' };
  const title = p.job.title;
  p.job = null;
  bump('happiness', 2);
  addLog(`You quit your job as a ${title}.`, 'info');
  save();
  return { ok: true, message: 'You quit your job.' };
}
export function retire() {
  const p = state.player;
  if (p.age < 55) return { ok: false, message: 'You are too young to retire.' };
  if (!p.job) return { ok: false, message: 'You do not have a job.' };
  p.pension = Math.round(p.job.salary * 0.4);
  p.job = null;
  p.retired = true;
  bump('happiness', 8);
  addLog(`You retired. Your pension is ${moneyFull(p.pension)} per year.`, 'pos');
  save();
  return { ok: true, modal: { title: 'Retired', body: `<p>You hung up your work boots for good.</p><p>Annual pension: <b>${moneyFull(p.pension)}</b>.</p>` } };
}

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------
export function buyAsset(id) {
  const p = state.player;
  const guard = canAct();
  if (!guard.ok) return { ok: false, message: guard.message };
  const def = ASSETS.find(a => a.id === id);
  if (!def) return { ok: false, message: 'Asset not found.' };
  if (p.age < def.minAge) return { ok: false, message: `You must be ${def.minAge} to buy this.` };
  if (p.money < def.value) return { ok: false, message: `You need ${moneyFull(def.value)}. You have ${moneyFull(p.money)}.` };
  changeMoney(-def.value);
  p.assets.push({ ...def, boughtAt: p.age, purchasePrice: def.value, value: Math.round(def.value * (0.92 + Math.random() * 0.16)) });
  bump('happiness', Math.min(15, def.joy));
  addLog(`You bought a ${def.name} for ${moneyFull(def.value)}.`, 'pos');
  if (def.type === 'Property') unlock('homeowner');
  save();
  return { ok: true, modal: { title: 'Purchase Complete', body: `<p>You are now the proud owner of a <b>${def.name}</b>.</p><p class="modal-blue">Paid ${moneyFull(def.value)}</p>` }, achievements: checkAchievements() };
}
export function sellAsset(index) {
  const p = state.player;
  const a = p.assets[index];
  if (!a) return { ok: false, message: 'Asset not found.' };
  const sale = Math.round(a.value * 0.82);
  changeMoney(sale);
  p.assets.splice(index, 1);
  bump('happiness', -2);
  addLog(`You sold your ${a.name} for ${moneyFull(sale)}.`, 'info');
  save();
  return { ok: true, message: `Sold ${a.name} for ${moneyFull(sale)}.` };
}

// ---------------------------------------------------------------------------
// Relationships
// ---------------------------------------------------------------------------
export function findPerson(id) { return state.player?.relationships.find(r => r.id === id); }

export function relationshipAction(id, action) {
  const p = state.player;
  const guard = canAct();
  if (!guard.ok) return { ok: false, message: guard.message };
  const r = findPerson(id);
  if (!r) return { ok: false, message: 'Person not found.' };
  if (!r.alive) return { ok: false, message: 'They are no longer with us.' };

  switch (action) {
    case 'spend': {
      const b = randInt(5, 11);
      r.bond = clamp(r.bond + b); bump('happiness', 3);
      addLog(`You spent quality time with ${r.firstName}.`, 'pos');
      save();
      return { ok: true, message: `You bonded with ${r.firstName}. Relationship +${b}.`, achievements: checkAchievements() };
    }
    case 'compliment': {
      const b = randInt(3, 8);
      r.bond = clamp(r.bond + b); bump('happiness', 2);
      addLog(`You complimented ${r.firstName}.`, 'pos');
      save();
      return { ok: true, message: `${r.firstName} appreciated that. Relationship +${b}.` };
    }
    case 'insult': {
      const b = randInt(10, 24);
      r.bond = clamp(r.bond - b); bump('happiness', -3);
      addLog(`You insulted ${r.firstName}. That was mean.`, 'neg');
      save();
      return { ok: true, message: `${r.firstName} is hurt. Relationship -${b}.` };
    }
    case 'gift100':
    case 'gift1000':
    case 'gift10000': {
      const amt = action === 'gift100' ? 100 : action === 'gift1000' ? 1000 : 10000;
      if (p.money < amt) return { ok: false, message: `You need ${moneyFull(amt)}.` };
      changeMoney(-amt);
      const b = amt >= 10000 ? 24 : amt >= 1000 ? 13 : 6;
      r.bond = clamp(r.bond + b); bump('happiness', 2);
      addLog(`You gave ${r.firstName} a ${moneyFull(amt)} gift.`, 'pos');
      save();
      return { ok: true, message: `${r.firstName} loved the gift. Relationship +${b}.` };
    }
    case 'askmoney': {
      if (!['Mother', 'Father', 'Guardian', 'Sibling', 'Friend', 'Spouse', 'Partner'].includes(r.relation)) return { ok: false, message: 'They are not likely to give you money.' };
      if (chance(.35 + r.bond / 300)) {
        const amt = r.relation === 'Mother' || r.relation === 'Father' ? randInt(100, 2500) : randInt(50, 800);
        changeMoney(amt);
        r.bond = clamp(r.bond - 4);
        addLog(`${r.firstName} gave you ${moneyFull(amt)}.`, 'pos');
        save();
        return { ok: true, message: `${r.firstName} gave you ${moneyFull(amt)}.` };
      }
      bump('happiness', -2);
      addLog(`You asked ${r.firstName} for money and they said no.`, 'neg');
      save();
      return { ok: false, message: `${r.firstName} said no.` };
    }
    case 'hookup': {
      if (p.age < 18) return { ok: false, message: 'You must be 18.' };
      if (['Mother', 'Father', 'Guardian', 'Sibling', 'Child'].includes(r.relation)) return { ok: false, message: 'Absolutely not.' };
      if (chance(.6)) {
        r.bond = clamp(r.bond + 10); bump('happiness', 8);
        addLog(`You hooked up with ${r.firstName}.`, 'pos');
        save();
        return { ok: true, message: `You hooked up with ${r.firstName}.`, achievements: checkAchievements() };
      }
      bump('happiness', -4);
      addLog(`${r.firstName} turned you down.`, 'neg');
      save();
      return { ok: false, message: `${r.firstName} turned you down.` };
    }
    case 'propose': {
      if (p.age < 18) return { ok: false, message: 'You must be 18 to propose.' };
      if (r.relation !== 'Partner') return { ok: false, message: 'You can only propose to a partner.' };
      if (r.bond < 65) return { ok: false, message: `${r.firstName} does not seem ready. Build your relationship first.` };
      if (p.money < 2000) return { ok: false, message: 'You need at least $2,000 for a ring.' };
      changeMoney(-2000);
      r.relation = 'Spouse';
      r.bond = clamp(r.bond + 10);
      bump('happiness', 15);
      addLog(`You proposed to ${r.firstName} and they said yes!`, 'special');
      unlock('married');
      save();
      return { ok: true, modal: { title: `${r.firstName} Said Yes!`, body: `<p>You and <b>${r.firstName}</b> are engaged. Wedding bells are in your future.</p><p class="modal-blue">Happiness +15</p>` }, achievements: checkAchievements() };
    }
    case 'baby': {
      if (p.age < 18) return { ok: false, message: 'You are too young.' };
      if (!['Partner', 'Spouse'].includes(r.relation)) return { ok: false, message: 'You need a partner to have a child.' };
      if (p.age > 55) return { ok: false, message: 'It may be too late for that.' };
      if (p.money < 5000) return { ok: false, message: 'You need $5,000 for the hospital bills.' };
      changeMoney(-5000);
      const gender = chance(.5) ? 'female' : 'male';
      const baby = makePerson({ gender, age: 0, relation: 'Child', lastName: p.lastName, bond: 95, firstName: randomFirstName(gender) });
      p.relationships.push(baby);
      r.bond = clamp(r.bond + 12);
      bump('happiness', 18);
      addLog(`You and ${r.firstName} welcomed a baby ${gender === 'female' ? 'girl' : 'boy'}, ${baby.firstName}!`, 'special');
      unlock('parent');
      save();
      return { ok: true, modal: { title: 'A New Arrival', body: `<p>Congratulations! You are now the parent of <b>${baby.firstName}</b>.</p><p class="modal-blue">Happiness +18</p>` }, achievements: checkAchievements() };
    }
    case 'breakup': {
      if (!['Partner', 'Spouse'].includes(r.relation)) return { ok: false, message: 'You are not in a relationship with them.' };
      const wasSpouse = r.relation === 'Spouse';
      r.relation = 'Ex';
      r.bond = 0;
      bump('happiness', -12);
      addLog(`You ${wasSpouse ? 'divorced' : 'broke up with'} ${r.firstName}.`, 'neg');
      save();
      return { ok: true, modal: { title: wasSpouse ? 'Divorce' : 'Breakup', body: `<p>You and ${r.firstName} are no longer together. It is going to be a tough few weeks.</p>` } };
    }
    case 'play': {
      if (!r.pet) return { ok: false, message: 'They are not a pet.' };
      r.bond = clamp(r.bond + 8); bump('happiness', 6);
      addLog(`You played with ${r.firstName}.`, 'pos');
      save();
      return { ok: true, message: `${r.firstName} is very happy.` };
    }
    case 'vet': {
      if (!r.pet) return { ok: false, message: 'They are not a pet.' };
      if (p.money < 250) return { ok: false, message: 'You need $250.' };
      changeMoney(-250);
      r.bond = clamp(r.bond + 5); bump('happiness', 2);
      addLog(`You took ${r.firstName} to the vet.`, 'info');
      save();
      return { ok: true, message: `${r.firstName} is healthy and happy.` };
    }
    case 'discipline': {
      if (r.relation !== 'Child') return { ok: false, message: 'That is not your child.' };
      if (chance(.6)) { r.bond = clamp(r.bond - 8); addLog(`You disciplined ${r.firstName}. They were not happy about it.`, ''); save(); return { ok: true, message: `${r.firstName} learned a lesson.` }; }
      r.bond = clamp(r.bond - 15); bump('happiness', -2);
      addLog(`You disciplined ${r.firstName}. They stormed off.`, 'neg');
      save();
      return { ok: false, message: `${r.firstName} is upset with you.` };
    }
    default:
      return { ok: false, message: 'Unknown action.' };
  }
}

// ---------------------------------------------------------------------------
// Pray / challenge
// ---------------------------------------------------------------------------
export function pray() {
  const p = state.player;
  if (!p) return { ok: false, message: 'No life in progress.' };
  if (p.prayerAge === p.age) return { ok: false, message: 'You already prayed this year.' };
  p.prayerAge = p.age;
  bump('happiness', 3);
  addLog('You prayed and felt a little lighter.', 'pos');
  if (chance(.08)) {
    const amt = randInt(20, 200);
    changeMoney(amt);
    addLog(`Someone blessed you with ${moneyFull(amt)}.`, 'special');
    save();
    return { ok: true, message: `Your prayer was answered. +${moneyFull(amt)}` };
  }
  save();
  return { ok: true, message: 'You prayed for good fortune. Happiness +3.' };
}
export function challengeStatus() {
  const p = state.player;
  const done = p ? CHALLENGE.check(p) : false;
  return { ...CHALLENGE, done, claimed: state.challengeClaimed };
}
export function claimChallenge() {
  const p = state.player;
  if (!p || !CHALLENGE.check(p)) return { ok: false, message: 'Challenge not complete yet.' };
  if (state.challengeClaimed) return { ok: false, message: 'You already claimed this challenge.' };
  state.challengeClaimed = true;
  changeMoney(CHALLENGE.reward);
  addLog(`You completed the "${CHALLENGE.title}" challenge and won ${moneyFull(CHALLENGE.reward)}!`, 'special');
  save();
  return { ok: true, message: `Challenge complete! +${moneyFull(CHALLENGE.reward)}` };
}

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------
export function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
  if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
  return Math.floor(diff / 86400000) + 'd ago';
}
export function flagOf(code) { return flagSVG(code); }
export function educationLabel(p) {
  if (p.pendingEducation) return `Studying (${p.pendingEducation.years} yr left)`;
  return EDUCATION_LABEL[p.education] || 'No Education';
}
export function statsOf(p) { return p.stats; }
