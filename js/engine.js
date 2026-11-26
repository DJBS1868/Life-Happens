import { COUNTRIES, COUNTRY_LIST, randomFrom, randomName } from "./countries.js";
import { randomAppearance } from "./avatar.js";

const SAVE_KEY = "life-happens.save.v1";
const LIVES_KEY = "life-happens.lives.v1";
const SETTINGS_KEY = "life-happens.settings.v1";

export const store = {
  profile: null,
  lives: [],
  settings: { sound: true, haptics: true, motion: true },
  queue: [],
  screen: "title",
  activeTab: null,
  hasSave: false
};

export function clamp(v, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, v));
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function makeId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function currentYear() {
  return new Date().getFullYear();
}

export function getCountry(p) {
  return COUNTRIES[p?.countryCode] || COUNTRIES.US;
}

export function loadData() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.profile) {
        store.profile = migrateProfile(data.profile);
        store.hasSave = true;
      }
    }
  } catch (e) { /* ignore corrupt save */ }
  try {
    const raw = localStorage.getItem(LIVES_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) store.lives = arr;
    }
  } catch (e) { /* ignore */ }
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) store.settings = { ...store.settings, ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }
  return store;
}

function migrateProfile(p) {
  p.stats = p.stats && typeof p.stats === "object" ? p.stats : {};
  ["happiness", "health", "smarts", "looks"].forEach(k => {
    p.stats[k] = Number.isFinite(p.stats[k]) ? p.stats[k] : { happiness: 75, health: 85, smarts: 60, looks: 65 }[k];
  });
  p.education = p.education || { level: "none", stage: null, gpa: 0, major: null, gradAge: null, droppedOut: false, schoolName: null };
  if (p.education.stage === "baby") p.education.stage = null;
  p.relationships = p.relationships || [];
  p.relationships.forEach(r => { r.lastInteractions = r.lastInteractions || {}; r.alive = r.alive !== false; });
  p.assets = p.assets || [];
  p.log = p.log || [];
  p.usedActivities = p.usedActivities || [];
  p.careerActions = p.careerActions || [];
  p.seenEvents = p.seenEvents || [];
  p.recentFlavor = p.recentFlavor || [];
  p.flags = { license: false, vacations: 0, crimes: 0, marriages: 0, businesses: 0, books: 0, lotteryWins: 0, skydives: 0, surgeries: 0, ...(p.flags || {}) };
  p.jobHistory = p.jobHistory || [];
  p.conditions = p.conditions || [];
  p.money = Number.isFinite(p.money) ? p.money : 0;
  p.debt = Number.isFinite(p.debt) ? p.debt : 0;
  p.investments = Number.isFinite(p.investments) ? p.investments : 0;
  p.fame = Number.isFinite(p.fame) ? p.fame : 0;
  p.karma = Number.isFinite(p.karma) ? p.karma : 50;
  p.inPrison = p.inPrison || 0;
  p.retired = p.retired || false;
  p.pension = p.pension || 0;
  p.archived = p.archived || false;
  p.death = p.death || null;
  return p;
}

export function save() {
  try {
    if (store.profile) {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ profile: store.profile, savedAt: Date.now() }));
    }
    localStorage.setItem(LIVES_KEY, JSON.stringify(store.lives));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(store.settings));
  } catch (e) { /* storage may be unavailable */ }
}

export function resetAll() {
  try {
    localStorage.removeItem(SAVE_KEY);
    localStorage.removeItem(LIVES_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  } catch (e) { /* ignore */ }
  store.profile = null;
  store.lives = [];
  store.queue = [];
  store.screen = "title";
  store.hasSave = false;
  store.settings = { sound: true, haptics: true, motion: true };
}

export function displayName(p) {
  return `${p.firstName} ${p.lastName}`.trim();
}

export function ageStage(age) {
  if (age < 3) return "Baby";
  if (age < 5) return "Toddler";
  if (age < 13) return "Child";
  if (age < 18) return "Teen";
  if (age < 25) return "Young Adult";
  if (age < 40) return "Adult";
  if (age < 60) return "Middle-Aged";
  if (age < 80) return "Senior";
  return "Elder";
}

export function educationLabel(p) {
  const e = p.education;
  if (!e) return "None";
  if (e.stage === "university") return `University • ${e.major || "Undeclared"}`;
  if (e.stage === "grad") return `Graduate School • ${e.major || "Undeclared"}`;
  if (e.stage === "trade") return "Trade School";
  if (e.stage === "high") return "High School";
  if (e.stage === "middle") return "Middle School";
  if (e.stage === "elementary") return "Elementary School";
  if (e.level === "master") return `Master's • ${e.major || "Graduate"}`;
  if (e.level === "bachelor") return `Bachelor's • ${e.major || "Graduate"}`;
  if (e.level === "trade") return "Trade Certificate";
  if (e.level === "hs") return "High School Diploma";
  return "No formal education";
}

export function schoolGrade(p) {
  const e = p.education;
  if (!e || !e.stage) return "";
  if (e.stage === "elementary") return `Grade ${clamp(p.age - 4, 1, 5)}`;
  if (e.stage === "middle") return `Grade ${clamp(p.age - 10, 6, 8)}`;
  if (e.stage === "high") return `Grade ${clamp(p.age - 13, 9, 12)}`;
  if (e.stage === "university") return `Year ${clamp(p.age - (e.startAge || 18) + 1, 1, 4)}`;
  if (e.stage === "trade") return `Year ${clamp(p.age - (e.startAge || 18) + 1, 1, 2)}`;
  if (e.stage === "grad") return `Year ${clamp(p.age - (e.startAge || 22) + 1, 1, 2)}`;
  return "";
}

export function statusInfo(p) {
  if (!p.alive) return { label: "Deceased", sub: "At peace", icon: "heart" };
  if (p.inPrison > 0) return { label: "Inmate", sub: `${p.inPrison} year${p.inPrison === 1 ? "" : "s"} remaining`, icon: "lock" };
  if (p.retired) return { label: "Retired", sub: p.pension ? "Enjoying the golden years" : "Taking it easy", icon: "sun" };
  if (p.education.stage) return { label: "Student", sub: `${educationLabel(p)} • ${schoolGrade(p)}`.replace(/ • $/, ""), icon: "school" };
  if (p.job) return { label: p.job.title, sub: p.job.company, icon: "briefcase" };
  if (p.age < 5) return { label: ageStage(p.age), sub: "Just getting started", icon: "baby" };
  return { label: "Unemployed", sub: "Looking for opportunities", icon: "user" };
}

export function relationLabel(rel) {
  switch (rel.type) {
    case "mother": return "Mother";
    case "father": return "Father";
    case "sibling": return rel.gender === "female" ? "Sister" : "Brother";
    case "grandparent": return rel.gender === "female" ? "Grandmother" : "Grandfather";
    case "partner": return "Partner";
    case "spouse": return "Spouse";
    case "ex": return "Ex";
    case "child": return rel.gender === "female" ? "Daughter" : "Son";
    case "friend": return "Friend";
    case "pet": return rel.species === "cat" ? "Cat" : "Dog";
    case "grandchild": return "Grandchild";
    default: return "Family";
  }
}

export function closenessLabel(v) {
  if (v >= 90) return "Inseparable";
  if (v >= 70) return "Close";
  if (v >= 45) return "Good";
  if (v >= 25) return "Strained";
  return "Broken";
}

export function fmtMoney(usd, p, opts = {}) {
  const c = getCountry(p).currency;
  const value = (Number(usd) || 0) * c.rate;
  const abs = Math.abs(value);
  if (opts.compact && abs >= 1000000) {
    return (value < 0 ? "-" : "") + c.symbol + new Intl.NumberFormat(c.locale, { notation: "compact", maximumFractionDigits: 1 }).format(abs);
  }
  if (opts.compact && abs >= 100000) {
    return (value < 0 ? "-" : "") + c.symbol + new Intl.NumberFormat(c.locale, { notation: "compact", maximumFractionDigits: 1 }).format(abs);
  }
  const rounded = Math.round(value);
  const formatted = new Intl.NumberFormat(c.locale, { maximumFractionDigits: 0 }).format(Math.abs(rounded));
  return (rounded < 0 ? "-" : "") + c.symbol + formatted;
}

export function fmtDeltaMoney(usd, p) {
  const v = Number(usd) || 0;
  return (v >= 0 ? "+" : "-") + fmtMoney(Math.abs(v), p);
}

export function assetValue(p) {
  return (p.assets || []).reduce((sum, a) => sum + (a.value || a.price || 0), 0);
}

export function netWorth(p) {
  return Math.round((p.money || 0) + (p.investments || 0) + assetValue(p) - (p.debt || 0));
}

export function computeFinances(p) {
  let income = 0;
  if (p.job && p.inPrison === 0) income = p.job.salary;
  else if (p.retired && p.pension) income = p.pension;
  let expenses = 0;
  if (p.age >= 18) expenses += 9000;
  const kids = (p.relationships || []).filter(r => r.type === "child" && r.alive !== false).length;
  expenses += kids * 5000;
  expenses += (p.assets || []).reduce((s, a) => s + (a.upkeep || 0), 0);
  if (p.debt > 0) expenses += Math.round(p.debt * 0.08);
  return { income, expenses, net: income - expenses };
}

export function log(p, text, type = "neutral") {
  p.log.push({ age: p.age, text, type, t: Date.now() });
  if (p.log.length > 900) p.log.splice(0, p.log.length - 900);
}

export function applyEffects(p, effects = {}) {
  ["happiness", "health", "smarts", "looks"].forEach(k => {
    if (typeof effects[k] === "number") p.stats[k] = clamp(p.stats[k] + effects[k]);
  });
  ["fame", "karma"].forEach(k => {
    if (typeof effects[k] === "number") p[k] = clamp(p[k] + effects[k]);
  });
  if (typeof effects.money === "number") p.money = Math.round((p.money + effects.money) * 100) / 100;
  if (effects.rel) {
    const rel = p.relationships.find(r => r.type === effects.rel.type && r.alive !== false);
    if (rel) rel.closeness = clamp(rel.closeness + effects.rel.amount);
  }
  if (typeof effects.relAll === "number") {
    p.relationships.forEach(r => { if (r.alive !== false && r.type !== "pet") r.closeness = clamp(r.closeness + effects.relAll); });
  }
}

export function pushQueue(modal) {
  if (modal) store.queue.push(modal);
}

export function takeQueue() {
  return store.queue.shift() || null;
}

export function newPerson({ type, gender, age, lastName, countryCode, first, closeness, species }) {
  const c = COUNTRIES[countryCode] || COUNTRIES.US;
  const g = gender || randomFrom(["male", "female"]);
  const nm = first ? { first, last: lastName || randomFrom(c.names.last) } : randomName(c.code, g);
  return {
    id: makeId(),
    firstName: nm.first,
    lastName: lastName || nm.last,
    gender: g,
    type,
    age: age ?? 0,
    closeness: closeness ?? randomInt(65, 88),
    alive: true,
    appearance: randomAppearance(g),
    countryCode: c.code,
    species: species || null,
    lastInteractions: {},
    metAt: null
  };
}

function initialRelationships(p) {
  const c = getCountry(p);
  const familyLast = p.lastName;
  const mother = newPerson({ type: "mother", gender: "female", age: randomInt(24, 38), lastName: familyLast, countryCode: c.code, closeness: randomInt(82, 96) });
  const father = newPerson({ type: "father", gender: "male", age: randomInt(25, 40), lastName: familyLast, countryCode: c.code, closeness: randomInt(78, 94) });
  mother.metAt = 0;
  father.metAt = 0;
  p.relationships.push(mother, father);

  const siblingCount = Math.random() < 0.18 ? 0 : Math.random() < 0.78 ? 1 : 2;
  for (let i = 0; i < siblingCount; i++) {
    const sib = newPerson({
      type: "sibling",
      gender: randomFrom(["male", "female"]),
      age: randomInt(1, 10),
      lastName: familyLast,
      countryCode: c.code,
      closeness: randomInt(68, 92)
    });
    sib.metAt = 0;
    p.relationships.push(sib);
  }

  [["female", "grandparent"], ["male", "grandparent"]].forEach(([g, type]) => {
    if (Math.random() < 0.68) {
      const gp = newPerson({ type, gender: g, age: randomInt(56, 78), lastName: familyLast, countryCode: c.code, closeness: randomInt(60, 88) });
      gp.metAt = 0;
      p.relationships.push(gp);
    }
  });
  return { mother, father };
}

export function createProfile(draft) {
  const countryCode = draft.countryCode || "US";
  const c = COUNTRIES[countryCode] || COUNTRIES.US;
  const gender = draft.gender || "female";
  const name = {
    first: (draft.firstName || "").trim() || randomName(countryCode, gender).first,
    last: (draft.lastName || "").trim() || randomName(countryCode, gender).last
  };
  const p = {
    version: 1,
    firstName: name.first,
    lastName: name.last,
    gender,
    countryCode,
    city: draft.city || randomFrom(c.cities),
    appearance: draft.appearance || randomAppearance(gender),
    age: 0,
    alive: true,
    stats: {
      happiness: randomInt(68, 92),
      health: randomInt(78, 98),
      smarts: randomInt(42, 86),
      looks: randomInt(44, 92)
    },
    money: 0,
    debt: 0,
    investments: 0,
    fame: 0,
    karma: 50,
    education: { level: "none", stage: null, gpa: 0, major: null, gradAge: null, startAge: null, droppedOut: false, schoolName: null },
    job: null,
    jobHistory: [],
    relationships: [],
    assets: [],
    log: [],
    usedActivities: [],
    careerActions: [],
    seenEvents: [],
    recentFlavor: [],
    conditions: [],
    flags: { license: false, vacations: 0, crimes: 0, marriages: 0, businesses: 0, books: 0, lotteryWins: 0, skydives: 0, surgeries: 0 },
    inPrison: 0,
    retired: false,
    pension: 0,
    archived: false,
    death: null,
    createdAt: Date.now()
  };

  const family = initialRelationships(p);
  const genderWord = gender === "female" ? "girl" : gender === "male" ? "boy" : "baby";
  log(p, `I was born a ${genderWord} in ${p.city}, ${c.name}.`, "milestone");
  log(p, `My mother is ${family.mother.firstName} and my father is ${family.father.firstName}.`, "neutral");
  const sibs = p.relationships.filter(r => r.type === "sibling");
  if (sibs.length === 1) {
    log(p, `I have a ${sibs[0].gender === "female" ? "sister" : "brother"}, ${sibs[0].firstName}.`, "neutral");
  } else if (sibs.length > 1) {
    log(p, `I have ${sibs.length} siblings: ${sibs.map(s => s.firstName).join(" and ")}.`, "neutral");
  }
  log(p, "My story begins here.", "neutral");

  store.profile = p;
  store.queue = [];
  store.activeTab = null;
  store.screen = "game";
  store.hasSave = true;
  save();
  return p;
}

export function randomDraft() {
  const country = randomFrom(COUNTRY_LIST);
  const gender = randomFrom(["female", "male", "nonbinary"]);
  const nm = randomName(country.code, gender === "nonbinary" ? randomFrom(["female", "male"]) : gender);
  return {
    firstName: nm.first,
    lastName: nm.last,
    gender,
    countryCode: country.code,
    city: randomFrom(country.cities),
    appearance: randomAppearance(gender)
  };
}

export function startRandomLife() {
  return createProfile(randomDraft());
}

export function archiveCurrent(reason = "Started a new life", abandoned = false) {
  const p = store.profile;
  if (!p || p.archived) return;
  const unlocked = p._achievements || [];
  store.lives.unshift({
    id: makeId(),
    firstName: p.firstName,
    lastName: p.lastName,
    gender: p.gender,
    countryCode: p.countryCode,
    city: p.city,
    appearance: p.appearance,
    age: p.age,
    alive: p.alive,
    cause: reason,
    abandoned,
    netWorth: netWorth(p),
    money: p.money,
    happiness: p.stats.happiness,
    health: p.stats.health,
    smarts: p.stats.smarts,
    looks: p.stats.looks,
    job: p.job ? p.job.title : null,
    education: educationLabel(p),
    children: p.relationships.filter(r => r.type === "child" && r.alive !== false).length,
    spouse: p.relationships.find(r => r.type === "spouse" && r.alive !== false)?.firstName || null,
    ribbons: unlocked.map(a => ({ id: a.id, name: a.name, icon: a.icon })),
    log: p.log.slice(-400),
    archivedAt: Date.now()
  });
  store.lives = store.lives.slice(0, 60);
  p.archived = true;
  save();
}

export function addPartner({ age, gender, name, closeness = 72 } = {}) {
  const p = store.profile;
  if (p.relationships.some(r => (r.type === "partner" || r.type === "spouse") && r.alive !== false)) return null;
  const g = gender || (p.gender === "male" ? (Math.random() < 0.85 ? "female" : "male") : p.gender === "female" ? (Math.random() < 0.85 ? "male" : "female") : randomFrom(["male", "female"]));
  const rel = newPerson({
    type: "partner",
    gender: g,
    age: clamp(age ?? p.age + randomInt(-3, 4), 18, 82),
    countryCode: p.countryCode,
    closeness,
    first: name
  });
  rel.metAt = p.age;
  p.relationships.push(rel);
  p.stats.happiness = clamp(p.stats.happiness + 5);
  return rel;
}

export function addFriend({ age, gender } = {}) {
  const p = store.profile;
  const rel = newPerson({
    type: "friend",
    gender: gender || randomFrom(["male", "female"]),
    age: clamp(age ?? p.age + randomInt(-4, 5), 5, 95),
    countryCode: p.countryCode,
    closeness: randomInt(55, 75)
  });
  rel.metAt = p.age;
  p.relationships.push(rel);
  return rel;
}

export function addChild({ adopted = false } = {}) {
  const p = store.profile;
  const gender = randomFrom(["male", "female"]);
  const child = newPerson({
    type: "child",
    gender,
    age: adopted ? randomInt(1, 6) : 0,
    lastName: p.lastName,
    countryCode: p.countryCode,
    closeness: randomInt(86, 98)
  });
  child.metAt = p.age;
  child.adopted = adopted;
  p.relationships.push(child);
  p.flags.parent = true;
  p.stats.happiness = clamp(p.stats.happiness + 10);
  return child;
}

export function addPet({ species } = {}) {
  const p = store.profile;
  const names = ["Bella", "Max", "Luna", "Charlie", "Daisy", "Rocky", "Milo", "Coco", "Buddy", "Pepper"];
  const sp = species || randomFrom(["dog", "cat"]);
  const pet = newPerson({
    type: "pet",
    gender: randomFrom(["male", "female"]),
    age: 0,
    lastName: p.lastName,
    countryCode: p.countryCode,
    first: randomFrom(names),
    closeness: 100,
    species: sp
  });
  pet.metAt = p.age;
  p.relationships.push(pet);
  return pet;
}

export function addGrandchild() {
  const p = store.profile;
  const parentChild = p.relationships.find(r => r.type === "child" && r.alive !== false && r.age >= 18);
  if (!parentChild) return null;
  const gc = newPerson({
    type: "grandchild",
    gender: randomFrom(["male", "female"]),
    age: 0,
    lastName: parentChild.lastName || p.lastName,
    countryCode: p.countryCode,
    closeness: randomInt(85, 98)
  });
  gc.metAt = p.age;
  p.relationships.push(gc);
  return gc;
}

export function removeRelationship(rel, newType = "ex") {
  if (!rel) return;
  if (newType === "ex") {
    rel.type = "ex";
    rel.closeness = clamp(rel.closeness - 30);
    rel.exAt = store.profile.age;
  } else {
    rel.alive = false;
  }
}
