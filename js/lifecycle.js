import {
  store, clamp, randomInt, currentYear, log, save, netWorth,
  archiveCurrent, addChild, addGrandchild, getCountry
} from "./engine.js";
import { EVENTS } from "./events.js";
import { FLAVOR, CONDITIONAL_FLAVOR } from "./flavor.js";

function note(p, text, type = "neutral") {
  return { age: p.age, text, type, t: Date.now() };
}

function addNote(p, notes, text, type = "neutral") {
  notes.push(note(p, text, type));
}

function handleEducation(p, notes) {
  const e = p.education;
  if (!e) return;

  if (!e.stage && !e.droppedOut && e.level === "none" && p.age >= 5) {
    if (p.age < 11) {
      e.stage = "elementary";
      e.gpa = 3.0;
      e.schoolName = `${p.city} Elementary School`;
      addNote(p, notes, `I started elementary school at ${e.schoolName}.`, "milestone");
    } else if (p.age < 14) {
      e.stage = "middle";
      e.gpa = 3.0;
      e.schoolName = `${p.city} Middle School`;
      addNote(p, notes, "I started middle school.", "milestone");
    } else if (p.age < 18) {
      e.stage = "high";
      e.gpa = 3.0;
      e.schoolName = `${p.city} High School`;
      addNote(p, notes, "I started high school.", "milestone");
    } else {
      e.level = "hs";
      e.gpa = 3.0;
      addNote(p, notes, "I finished high school.", "milestone");
    }
  }
  if (p.age >= 11 && p.age < 14 && e.stage === "elementary") {
    e.stage = "middle";
    e.gpa = Math.min(4, e.gpa + 0.1);
    e.schoolName = `${p.city} Middle School`;
    addNote(p, notes, "I started middle school.", "milestone");
  }
  if (p.age >= 14 && p.age < 18 && e.stage === "middle") {
    e.stage = "high";
    e.gpa = Math.min(4, e.gpa + 0.05);
    e.schoolName = `${p.city} High School`;
    addNote(p, notes, "I started high school.", "milestone");
  }
  if (p.age >= 18 && e.stage === "high") {
    e.level = "hs";
    e.stage = null;
    e.gpa = clamp(e.gpa, 0, 4);
    addNote(p, notes, `I graduated from high school with a ${e.gpa.toFixed(1)} GPA.`, "milestone");
    p.stats.happiness = clamp(p.stats.happiness + 6);
    p.stats.smarts = clamp(p.stats.smarts + 2);
    p._collegePrompted = false;
  }

  if (e.stage === "university") {
    if (p.age >= e.gradAge) {
      e.level = "bachelor";
      e.stage = null;
      addNote(p, notes, `I graduated from university with a degree in ${e.major}.`, "milestone");
      p.stats.happiness = clamp(p.stats.happiness + 12);
      p.stats.smarts = clamp(p.stats.smarts + 4);
      p._gradPrompted = false;
    } else {
      payTuition(p, notes, 18000, "university");
    }
  } else if (e.stage === "trade") {
    if (p.age >= e.gradAge) {
      e.level = "trade";
      e.stage = null;
      addNote(p, notes, "I finished trade school and earned my certificate.", "milestone");
      p.stats.happiness = clamp(p.stats.happiness + 9);
      p.stats.smarts = clamp(p.stats.smarts + 3);
    } else {
      payTuition(p, notes, 8000, "trade school");
    }
  } else if (e.stage === "grad") {
    if (p.age >= e.gradAge) {
      e.level = "master";
      e.stage = null;
      addNote(p, notes, `I earned my master's degree in ${e.major}.`, "milestone");
      p.stats.happiness = clamp(p.stats.happiness + 12);
      p.stats.smarts = clamp(p.stats.smarts + 5);
    } else {
      payTuition(p, notes, 30000, "graduate school");
    }
  }

  if (e.stage && e.gpa != null) {
    const delta = (p.stats.smarts - 55) / 100 + (Math.random() * 0.16 - 0.08);
    e.gpa = clamp(e.gpa + delta, 0.4, 4);
  }
}

function payTuition(p, notes, amount, label) {
  if (p.money >= amount) {
    p.money -= amount;
  } else {
    p.debt += amount;
    addNote(p, notes, `I took out a student loan for ${label} tuition.`, "negative");
  }
}

function handleJobYear(p, notes) {
  if (!p.job || p.inPrison > 0) return;
  p.job.years = (p.job.years || 0) + 1;
  p.job.performance = clamp((p.job.performance ?? 55) + randomInt(-1, 3));
  if (p.job.performance < 18 && Math.random() < 0.14) {
    addNote(p, notes, `I was let go from my job as a ${p.job.title}. My performance had slipped.`, "negative");
    p.job = null;
    p.stats.happiness = clamp(p.stats.happiness - 10);
  } else if (p.job.performance > 88 && Math.random() < 0.16 && (p.job.level || 1) < 6) {
    p.job.level = (p.job.level || 1) + 1;
    p.job.salary = Math.round(p.job.salary * 1.12);
    addNote(p, notes, `I earned a promotion at work. My new salary is ${Math.round(p.job.salary)}.`, "positive");
    p.stats.happiness = clamp(p.stats.happiness + 5);
  }
}

function ageRelationships(p, notes) {
  for (const r of p.relationships) {
    if (r.alive === false) continue;
    r.age += 1;
    r.lastInteractions = {};

    if (r.type === "pet") {
      if (!r.lifespan) r.lifespan = randomInt(10, 16);
      if (r.age >= r.lifespan) {
        r.alive = false;
        addNote(p, notes, `My ${r.species || "pet"}, ${r.firstName}, passed away. I'll never forget them.`, "negative");
        p.stats.happiness = clamp(p.stats.happiness - 12);
      }
      continue;
    }

    if (["friend", "partner", "spouse"].includes(r.type)) {
      r.closeness = clamp(r.closeness - randomInt(0, 2));
    }

    if (r.type === "child" || r.type === "grandchild") continue;

    const risk = r.age >= 58 ? (r.age - 58) * 0.0042 : 0;
    if (Math.random() < risk) {
      r.alive = false;
      const label = r.type === "mother" ? "My mother" : r.type === "father" ? "My father" : r.type === "spouse" ? "My spouse" : r.type === "grandparent" ? `My ${r.gender === "female" ? "grandmother" : "grandfather"}` : r.type === "sibling" ? `My ${r.gender === "female" ? "sister" : "brother"}` : `My ${r.type}`;
      addNote(p, notes, `${label}, ${r.firstName}, passed away at age ${r.age}.`, "death");
      const loss = r.type === "spouse" ? 28 : r.type === "mother" || r.type === "father" ? 18 : 9;
      p.stats.happiness = clamp(p.stats.happiness - loss);
      if (r.type === "spouse") p.flags.married = false;

      if ((r.type === "mother" || r.type === "father" || r.type === "grandparent") && Math.random() < 0.42) {
        const inherit = r.type === "grandparent" ? randomInt(1000, 25000) : randomInt(5000, 80000);
        p.money += inherit;
        addNote(p, notes, `I inherited ${inherit.toLocaleString("en-US")} from ${r.firstName}.`, "money");
      }
    }
  }
}

function applyFinances(p, notes) {
  const fin = computeFinancesLocal(p);
  if (p.inPrison > 0) {
    p.stats.happiness = clamp(p.stats.happiness - 5);
    p.stats.health = clamp(p.stats.health - 2);
  }
  if (p.age >= 18) {
    p.money += fin.income - fin.expenses;
    if (fin.income > 0 && p.age % 5 === 0) {
      addNote(p, notes, `I earned ${Math.round(fin.income).toLocaleString("en-US")} this year.`, "money");
    }
    if (p.money < 0) {
      p.stats.happiness = clamp(p.stats.happiness - 2);
      if (p.age % 3 === 0) addNote(p, notes, "I ended the year in debt. The bills keep piling up.", "negative");
    }
  } else {
    p.money += fin.income;
  }

  if (p.investments > 0) {
    const rate = Math.random() * 0.34 - 0.17;
    const change = Math.round(p.investments * rate);
    p.investments = Math.max(0, p.investments + change);
    if (Math.abs(change) > p.investments * 0.05 + 100) {
      addNote(p, notes, change >= 0 ? `My investments gained ${Math.abs(change).toLocaleString("en-US")}.` : `My investments lost ${Math.abs(change).toLocaleString("en-US")}.`, change >= 0 ? "money" : "negative");
    }
  }
}

function computeFinancesLocal(p) {
  let income = 0;
  if (p.job && p.inPrison === 0) income = p.job.salary;
  if (p.retired && p.pension) income = p.pension;
  let expenses = 0;
  if (p.age >= 18) expenses += 9000;
  const kids = p.relationships.filter(r => r.type === "child" && r.alive !== false).length;
  expenses += kids * 5000;
  expenses += p.assets.reduce((s, a) => s + (a.upkeep || 0), 0);
  if (p.debt > 0) expenses += Math.round(p.debt * 0.08);
  return { income, expenses, net: income - expenses };
}

function driftStats(p) {
  const s = p.stats;
  if (p.age > 35) s.health = clamp(s.health - 0.25);
  if (p.age > 50) s.health = clamp(s.health - 0.4);
  if (p.age > 70) s.health = clamp(s.health - 0.9);
  if (p.inPrison > 0) s.health = clamp(s.health - 2.5);
  if (p.age > 30) s.looks = clamp(s.looks - 0.35);
  if (p.age > 50) s.looks = clamp(s.looks - 0.45);
  if (p.age > 55) s.smarts = clamp(s.smarts - 0.2);
  if (p.education.stage) s.smarts = clamp(s.smarts + 0.8);
  s.happiness = clamp(s.happiness + (58 - s.happiness) * 0.025);
}

function pickFlavor(p) {
  const pool = [...FLAVOR, ...CONDITIONAL_FLAVOR].filter(f => {
    if (p.age < f.min || p.age > f.max) return false;
    if (p.recentFlavor.includes(f.id)) return false;
    if (f.cond && !f.cond(p)) return false;
    return true;
  });
  const chosen = [];
  const count = pool.length > 4 ? (Math.random() < 0.55 ? 2 : 1) : Math.min(1, pool.length);
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    const item = pool.splice(idx, 1)[0];
    if (!item) break;
    chosen.push(item);
    p.recentFlavor.push(item.id);
  }
  p.recentFlavor = p.recentFlavor.slice(-18);
  return chosen.map(c => c.text);
}

function checkDeath(p) {
  if (p.stats.health <= 0) return { cause: "health complications" };
  if (p.age >= 120) return { cause: "old age" };
  let risk = 0;
  if (p.age >= 60) risk += (p.age - 60) * 0.0045;
  if (p.age >= 85) risk += (p.age - 85) * 0.02;
  risk += Math.max(0, 100 - p.stats.health) * 0.0028;
  if (p.inPrison > 0) risk += 0.01;
  if (Math.random() >= risk) return null;
  const causesOld = ["old age", "heart failure", "a stroke", "pneumonia", "natural causes"];
  const causesUnwell = ["heart disease", "cancer", "a long illness", "complications from an infection"];
  const causesYoung = ["a tragic accident", "a sudden heart attack", "a rare illness", "a stroke"];
  if (p.age >= 85) return { cause: causesOld[randomInt(0, causesOld.length - 1)] };
  if (p.stats.health < 50) return { cause: causesUnwell[randomInt(0, causesUnwell.length - 1)] };
  return { cause: causesYoung[randomInt(0, causesYoung.length - 1)] };
}

function collegeEvent(p) {
  return {
    id: "college_milestone",
    kicker: `Age ${p.age} • Graduation Day`,
    title: "What Comes Next?",
    icon: "🎓",
    age: p.age,
    text: `I graduated from high school with a ${p.education.gpa.toFixed(1)} GPA. The future is wide open. What should I do next?`,
    choices: [
      { label: "Go to university", sub: "4 years • student loans available", action: "college_major", effects: {}, result: "I decided to go to university." },
      { label: "Trade school", sub: "2 years • practical skills", action: "trade", effects: {}, result: "I decided to learn a trade." },
      { label: "Start working", sub: "Enter the job market now", action: "work", effects: {}, result: "I decided to start working right away." },
      { label: "Take a gap year", sub: "Figure things out", action: "gap", effects: {}, result: "I decided to take a gap year." }
    ]
  };
}

function retirementEvent(p) {
  return {
    id: "retirement_milestone",
    kicker: `Age ${p.age} • A Lifetime of Work`,
    title: "Time to Retire?",
    icon: "🌅",
    age: p.age,
    text: "I've been working for decades. The idea of sleeping in and doing whatever I want is tempting.",
    choices: [
      { label: "Retire", sub: "Start your next chapter", effects: { happiness: 10 }, action: "retire", result: "I retired. No more alarm clocks." },
      { label: "Keep working", sub: "You're not done yet", effects: { happiness: -2, health: -1 }, action: "keepjob", result: "I decided to keep working for a while longer." }
    ]
  };
}

export function pickEvent(p) {
  if (p.age === 18 && p.education.level === "hs" && !p._collegePrompted) {
    p._collegePrompted = true;
    return collegeEvent(p);
  }
  if (p.age >= 65 && p.job && !p._retirementPrompted) {
    p._retirementPrompted = true;
    return retirementEvent(p);
  }
  if (p.inPrison > 0) return null;
  const pool = EVENTS.filter(e => {
    if (p.age < e.min || p.age > e.max) return false;
    if (p.seenEvents.includes(e.id)) return false;
    if (e.cond && !e.cond(p)) return false;
    return true;
  });
  if (!pool.length) return null;
  const chance = p.age < 6 ? 0 : p.age < 18 ? 0.48 : 0.62;
  if (Math.random() > chance) return null;
  const total = pool.reduce((s, e) => s + (e.weight || 5), 0);
  let roll = Math.random() * total;
  let chosen = pool[0];
  for (const e of pool) {
    roll -= (e.weight || 5);
    if (roll <= 0) { chosen = e; break; }
  }
  p.seenEvents.push(chosen.id);
  return { ...chosen, kicker: `Age ${p.age} • Life Event`, age: p.age };
}

export function die(cause, opts = {}) {
  const p = store.profile;
  if (!p || !p.alive) return false;
  p.alive = false;
  p.death = { cause, age: p.age, year: currentYear() };
  p._achievements = computeAchievements(p).filter(a => a.unlocked);
  log(p, `I died at age ${p.age} from ${cause}.`, "death");
  archiveCurrent(cause, false);
  save();
  return true;
}

export function ageUp() {
  const p = store.profile;
  if (!p || !p.alive) return { ok: false };
  p.age += 1;
  p.usedActivities = [];
  p.careerActions = [];
  p.relationships.forEach(r => { r.lastInteractions = {}; });
  const notes = [];

  if (p.inPrison > 0) {
    p.inPrison -= 1;
    addNote(p, notes, "I spent another year behind bars. The days blur together.", "negative");
    if (p.inPrison === 0) addNote(p, notes, "I was released from prison. Time to rebuild.", "milestone");
  } else {
    handleEducation(p, notes);
    handleJobYear(p, notes);
  }

  ageRelationships(p, notes);
  applyFinances(p, notes);
  driftStats(p);

  if ([1, 10, 18, 21, 30, 40, 50, 65, 80, 100].includes(p.age)) {
    addNote(p, notes, `I turned ${p.age} today.`, "milestone");
  }

  const flavors = pickFlavor(p);
  flavors.forEach(t => addNote(p, notes, t, "neutral"));

  const death = checkDeath(p);
  p.log.push(...notes);
  if (p.log.length > 900) p.log.splice(0, p.log.length - 900);

  if (death) {
    die(death.cause);
    return { ok: true, died: true, cause: death.cause, age: p.age };
  }

  const modal = pickEvent(p);
  save();
  return { ok: true, died: false, modal, age: p.age };
}

export function computeAchievements(p) {
  const nw = netWorth(p);
  const kids = p.relationships.filter(r => r.type === "child" && r.alive !== false).length;
  const pets = p.relationships.filter(r => r.type === "pet" && r.alive !== false).length;
  const friends = p.relationships.filter(r => r.type === "friend" && r.alive !== false).length;
  const has = type => p.relationships.some(r => r.type === type && r.alive !== false);
  const list = [
    { id: "first_year", name: "First Steps", icon: "👣", desc: "Reach your first birthday.", test: () => p.age >= 1 },
    { id: "student", name: "Bookworm", icon: "📚", desc: "Enroll in school.", test: () => !!p.education.stage || p.education.level !== "none" },
    { id: "graduate", name: "Graduate", icon: "🎓", desc: "Graduate from high school or college.", test: () => ["hs", "trade", "bachelor", "master"].includes(p.education.level) },
    { id: "homeowner", name: "Homeowner", icon: "🏠", desc: "Buy your first home.", test: () => p.assets.some(a => a.type === "home") },
    { id: "driver", name: "Road Ready", icon: "🚗", desc: "Get a driver's license.", test: () => !!p.flags.license },
    { id: "married", name: "The One", icon: "💍", desc: "Get married.", test: () => p.flags.married || has("spouse") },
    { id: "parent", name: "Parent", icon: "🍼", desc: "Have or adopt a child.", test: () => kids > 0 },
    { id: "grandparent", name: "Grandparent", icon: "👶", desc: "Welcome a grandchild.", test: () => has("grandchild") },
    { id: "millionaire", name: "Millionaire", icon: "💰", desc: "Reach a net worth of $1,000,000.", test: () => nw >= 1000000 },
    { id: "famous", name: "Famous", icon: "🌟", desc: "Reach 70 fame.", test: () => p.fame >= 70 },
    { id: "criminal", name: "Criminal Record", icon: "🚔", desc: "Get involved in crime.", test: () => p.flags.crimes > 0 || p.inPrison > 0 },
    { id: "centenarian", name: "Centenarian", icon: "🎂", desc: "Live to 100.", test: () => p.age >= 100 },
    { id: "survivor", name: "Survivor", icon: "🛡️", desc: "Live to 80.", test: () => p.age >= 80 },
    { id: "career", name: "Career Climber", icon: "📈", desc: "Reach level 4 in your career.", test: () => !!p.job && p.job.level >= 4 },
    { id: "retiree", name: "Golden Years", icon: "🌅", desc: "Retire.", test: () => !!p.retired },
    { id: "traveler", name: "World Traveler", icon: "✈️", desc: "Take 5 vacations.", test: () => (p.flags.vacations || 0) >= 5 },
    { id: "petlover", name: "Pet Lover", icon: "🐾", desc: "Adopt 2 pets.", test: () => pets >= 2 },
    { id: "scholar", name: "Scholar", icon: "🧠", desc: "Reach 95 smarts.", test: () => p.stats.smarts >= 95 },
    { id: "fitness", name: "Peak Shape", icon: "💪", desc: "Reach 95 health.", test: () => p.stats.health >= 95 },
    { id: "looker", name: "Head Turner", icon: "😍", desc: "Reach 95 looks.", test: () => p.stats.looks >= 95 },
    { id: "joyful", name: "Pure Joy", icon: "😄", desc: "Reach 95 happiness.", test: () => p.stats.happiness >= 95 },
    { id: "kind", name: "Good Karma", icon: "☯️", desc: "Reach 90 karma.", test: () => p.karma >= 90 },
    { id: "bigfamily", name: "Big Family", icon: "👨‍👩‍👧‍👦", desc: "Have 3 children.", test: () => kids >= 3 },
    { id: "socialite", name: "Socialite", icon: "🥂", desc: "Have 8 friends.", test: () => friends >= 8 },
    { id: "business", name: "Entrepreneur", icon: "🏪", desc: "Start a business.", test: () => (p.flags.businesses || 0) > 0 },
    { id: "author", name: "Author", icon: "📖", desc: "Publish a book.", test: () => (p.flags.books || 0) > 0 },
    { id: "lucky", name: "Jackpot", icon: "🎰", desc: "Win the lottery.", test: () => (p.flags.lotteryWins || 0) > 0 },
    { id: "politician", name: "Public Servant", icon: "🏛️", desc: "Work in politics.", test: () => p.job?.field === "politics" },
    { id: "doctor", name: "Healer", icon: "🩺", desc: "Become a doctor or surgeon.", test: () => p.job && ["doctor", "surgeon"].includes(p.job.id) },
    { id: "astronaut", name: "Astronaut", icon: "🚀", desc: "Reach for the stars.", test: () => p.job?.id === "astronaut" },
    { id: "athlete", name: "Pro Athlete", icon: "🏆", desc: "Go pro in sports.", test: () => p.job?.id === "athlete" },
    { id: "celebrity", name: "Legend", icon: "🌠", desc: "Reach 90 fame.", test: () => p.fame >= 90 }
  ];
  return list.map(a => ({ ...a, unlocked: a.test() }));
}

export function retirePerson(p) {
  if (!p.job) return;
  p.pension = Math.round(p.job.salary * 0.4);
  p.retired = true;
  p.job = null;
  log(p, "I retired from my career. The golden years begin.", "milestone");
  p.stats.happiness = clamp(p.stats.happiness + 10);
  save();
}
