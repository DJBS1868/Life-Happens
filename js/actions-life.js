import {
  store, clamp, randomInt, getCountry, fmtMoney, log, save, applyEffects,
  addPartner, addChild, addPet, addFriend, newPerson, netWorth, removeRelationship
} from "./engine.js";
import { JOBS, JOB_MAP, EDU_RANK, jobTitleForLevel, jobMeetsRequirements } from "./jobs.js";
import { ASSET_CATALOG, ASSET_MAP } from "./assets.js";
import { MAJORS, randomFrom } from "./countries.js";
import { retirePerson } from "./lifecycle.js";

export function enrollUniversity(majorId) {
  const p = store.profile;
  if (!p) return { ok: false, message: "No active life." };
  if (p.education.stage) return { ok: false, message: "You're already in school." };
  if (p.age < 18) return { ok: false, message: "You must be 18 to enroll." };
  const major = MAJORS.find(m => m.id === majorId) || MAJORS[0];
  p.education.stage = "university";
  p.education.major = major.name;
  p.education.majorId = major.id;
  p.education.gradAge = p.age + 4;
  p.education.startAge = p.age;
  p.education.gpa = 3.0;
  p.education.schoolName = `${p.city} University`;
  p.stats.happiness = clamp(p.stats.happiness + 5);
  log(p, `I enrolled at ${p.education.schoolName} to study ${major.name}.`, "milestone");
  save();
  return { ok: true, message: `You enrolled at ${p.education.schoolName}.` };
}

export function enrollTrade() {
  const p = store.profile;
  if (!p) return { ok: false, message: "No active life." };
  if (p.education.stage) return { ok: false, message: "You're already in school." };
  p.education.stage = "trade";
  p.education.major = "Trade Certificate";
  p.education.majorId = "trade";
  p.education.gradAge = p.age + 2;
  p.education.startAge = p.age;
  p.education.gpa = 3.0;
  p.education.schoolName = `${p.city} Trade School`;
  p.stats.happiness = clamp(p.stats.happiness + 4);
  log(p, `I enrolled at ${p.education.schoolName} to learn a trade.`, "milestone");
  save();
  return { ok: true, message: "You enrolled in trade school." };
}

export function enrollGrad(majorId) {
  const p = store.profile;
  if (!p) return { ok: false, message: "No active life." };
  if (p.education.stage) return { ok: false, message: "You're already in school." };
  if (p.education.level !== "bachelor") return { ok: false, message: "You need a bachelor's degree first." };
  if (p.age < 22) return { ok: false, message: "You're too young for graduate school." };
  const major = MAJORS.find(m => m.id === majorId) || MAJORS[0];
  p.education.stage = "grad";
  p.education.major = major.name;
  p.education.majorId = major.id;
  p.education.gradAge = p.age + 2;
  p.education.startAge = p.age;
  p.education.gpa = 3.5;
  p.education.schoolName = `${p.city} Graduate School`;
  p.stats.happiness = clamp(p.stats.happiness + 5);
  log(p, `I started graduate school for ${major.name}.`, "milestone");
  save();
  return { ok: true, message: "You enrolled in graduate school." };
}

export function applyForJob(jobId) {
  const p = store.profile;
  const job = JOB_MAP[jobId];
  if (!p || !job) return { ok: false, message: "Job not found." };
  if (p.inPrison > 0) return { ok: false, message: "You can't apply for jobs while in prison." };
  if (!jobMeetsRequirements(job, p)) return { ok: false, message: "You don't meet the requirements for this job." };
  const reqSmarts = job.req.smarts || 50;
  let chance = 0.4 + (p.stats.smarts - reqSmarts) * 0.008 + (p.stats.looks - 50) * 0.002 + p.fame * 0.0015;
  if (p.education.level === "bachelor" || p.education.level === "master") chance += 0.08;
  if (p.job) chance += 0.04;
  chance = clamp(chance, 0.12, 0.94);
  if (Math.random() < chance) {
    p.job = {
      id: job.id,
      title: job.title,
      baseTitle: job.title,
      company: job.company,
      icon: job.icon,
      salary: job.salary,
      level: 1,
      performance: 55,
      years: 0,
      field: job.field,
      category: job.category
    };
    p.retired = false;
    p.pension = 0;
    p.jobHistory.push({ id: job.id, title: job.title, company: job.company, salary: job.salary, age: p.age });
    p.stats.happiness = clamp(p.stats.happiness + 5);
    log(p, `I was hired as a ${job.title} at ${job.company}.`, "positive");
    save();
    return { ok: true, hired: true, message: `You're hired as a ${job.title} at ${job.company}!` };
  }
  p.stats.happiness = clamp(p.stats.happiness - 1);
  log(p, `I applied for a job as a ${job.title} at ${job.company} but didn't get it.`, "negative");
  save();
  return { ok: true, hired: false, message: "They went with another candidate. Keep trying!" };
}

export function careerAction(action) {
  const p = store.profile;
  if (!p) return { ok: false, message: "No active life." };
  if (p.careerActions.includes(action)) return { ok: false, message: "You already did that this year." };
  if (p.inPrison > 0) return { ok: false, message: "You're in prison." };

  if (action === "study") {
    if (!p.education.stage) return { ok: false, message: "You're not in school." };
    p.careerActions.push(action);
    p.stats.smarts = clamp(p.stats.smarts + 3);
    p.stats.happiness = clamp(p.stats.happiness - 1);
    p.education.gpa = clamp(p.education.gpa + 0.15, 0, 4);
    log(p, "I studied hard and my grades improved.", "positive");
    save();
    return { ok: true, message: "You studied hard. Smarts +3." };
  }
  if (action === "club") {
    if (!p.education.stage) return { ok: false, message: "You're not in school." };
    p.careerActions.push(action);
    p.stats.happiness = clamp(p.stats.happiness + 3);
    p.stats.looks = clamp(p.stats.looks + 1);
    log(p, "I joined a school club and made new friends.", "positive");
    save();
    return { ok: true, message: "You joined a club. Happiness +3." };
  }
  if (action === "skip") {
    if (!p.education.stage) return { ok: false, message: "You're not in school." };
    p.careerActions.push(action);
    p.stats.happiness = clamp(p.stats.happiness + 2);
    p.stats.smarts = clamp(p.stats.smarts - 1);
    p.education.gpa = clamp(p.education.gpa - 0.25, 0, 4);
    log(p, "I skipped class and spent the day goofing off.", "negative");
    save();
    return { ok: true, message: "You skipped class. Happiness +2, GPA down." };
  }
  if (action === "dropout") {
    if (!p.education.stage) return { ok: false, message: "You're not in school." };
    p.education.stage = null;
    p.education.droppedOut = true;
    p.education.level = "none";
    p.stats.happiness = clamp(p.stats.happiness - 5);
    log(p, "I dropped out of school.", "negative");
    save();
    return { ok: true, message: "You dropped out of school." };
  }
  if (action === "work") {
    if (!p.job) return { ok: false, message: "You don't have a job." };
    p.careerActions.push(action);
    p.job.performance = clamp(p.job.performance + 8);
    p.money += Math.round(p.job.salary * 0.04);
    p.stats.health = clamp(p.stats.health - 1);
    p.stats.happiness = clamp(p.stats.happiness - 2);
    log(p, "I worked overtime and impressed my boss.", "positive");
    save();
    return { ok: true, message: "You worked hard. Performance +8." };
  }
  if (action === "promote") {
    if (!p.job) return { ok: false, message: "You don't have a job." };
    p.careerActions.push(action);
    if (p.job.performance < 55 || p.job.years < 1) {
      log(p, "I asked for a promotion but was told I need more experience.", "negative");
      save();
      return { ok: true, message: "Not yet. Improve your performance and try again." };
    }
    const chance = clamp(0.3 + p.job.performance / 220 + p.job.level * 0.03, 0.15, 0.9);
    if (Math.random() < chance) {
      p.job.level = Math.min(7, (p.job.level || 1) + 1);
      p.job.title = jobTitleForLevel(p.job.baseTitle || p.job.title, p.job.level);
      p.job.salary = Math.round(p.job.salary * 1.18);
      p.stats.happiness = clamp(p.stats.happiness + 6);
      log(p, `I was promoted to ${p.job.title}. My salary is now ${fmtMoney(p.job.salary, p)}.`, "positive");
      save();
      return { ok: true, message: `Promoted to ${p.job.title}!` };
    }
    log(p, "I asked for a promotion and was turned down.", "negative");
    save();
    return { ok: true, message: "Not this time. Keep working hard." };
  }
  if (action === "raise") {
    if (!p.job) return { ok: false, message: "You don't have a job." };
    p.careerActions.push(action);
    const chance = clamp(0.25 + p.job.performance / 240, 0.12, 0.85);
    if (Math.random() < chance) {
      p.job.salary = Math.round(p.job.salary * 1.08);
      p.stats.happiness = clamp(p.stats.happiness + 3);
      log(p, `I got a raise. My salary is now ${fmtMoney(p.job.salary, p)}.`, "positive");
      save();
      return { ok: true, message: "You got a raise!" };
    }
    log(p, "I asked for a raise and was told no.", "negative");
    save();
    return { ok: true, message: "No raise this year." };
  }
  if (action === "quit") {
    if (!p.job) return { ok: false, message: "You don't have a job." };
    const title = p.job.title;
    p.job = null;
    p.stats.happiness = clamp(p.stats.happiness + 2);
    log(p, `I quit my job as a ${title}.`, "neutral");
    save();
    return { ok: true, message: "You quit your job." };
  }
  if (action === "retire") {
    if (!p.job) return { ok: false, message: "You don't have a job." };
    if (p.age < 60) return { ok: false, message: "You're too young to retire." };
    retirePerson(p);
    return { ok: true, message: "You retired. Enjoy the golden years." };
  }
  if (action === "university") {
    if (p.education.stage) return { ok: false, message: "You're already in school." };
    return { ok: true, openMajor: true, message: "" };
  }
  if (action === "grad") {
    if (p.education.level !== "bachelor") return { ok: false, message: "You need a bachelor's degree first." };
    return { ok: true, openGrad: true, message: "" };
  }
  return { ok: false, message: "Unknown action." };
}

export function relationshipAction(relId, action) {
  const p = store.profile;
  if (!p) return { ok: false, message: "No active life." };
  const rel = p.relationships.find(r => r.id === relId);
  if (!rel) return { ok: false, message: "Person not found." };
  const used = rel.lastInteractions || {};
  if (used[action] === p.age) return { ok: false, message: "You already did that this year." };

  if (!rel.alive && action !== "visit") return { ok: false, message: `${rel.firstName} has passed away.` };

  const label = rel.type === "mother" ? "my mother" : rel.type === "father" ? "my father" : rel.type === "sibling" ? (rel.gender === "female" ? "my sister" : "my brother") : rel.type === "child" ? (rel.gender === "female" ? "my daughter" : "my son") : rel.type === "pet" ? "my pet" : rel.type === "spouse" ? "my spouse" : rel.type === "partner" ? "my partner" : rel.firstName;
  let message = "";

  if (action === "spend") {
    rel.closeness = clamp(rel.closeness + 8);
    p.stats.happiness = clamp(p.stats.happiness + 2);
    message = `I spent quality time with ${rel.firstName}.`;
    log(p, message, "positive");
  } else if (action === "gift") {
    const cost = 100;
    if (p.money < cost) return { ok: false, message: "You can't afford a gift." };
    p.money -= cost;
    rel.closeness = clamp(rel.closeness + 12);
    p.stats.happiness = clamp(p.stats.happiness + 1);
    message = `I gave ${rel.firstName} a thoughtful gift.`;
    log(p, message, "positive");
  } else if (action === "compliment") {
    rel.closeness = clamp(rel.closeness + 5);
    p.stats.happiness = clamp(p.stats.happiness + 1);
    message = `I complimented ${rel.firstName}.`;
    log(p, message, "positive");
  } else if (action === "argue") {
    rel.closeness = clamp(rel.closeness - 15);
    p.stats.happiness = clamp(p.stats.happiness - 2);
    message = `I got into an argument with ${rel.firstName}.`;
    log(p, message, "negative");
  } else if (action === "askmoney") {
    if (!["mother", "father", "sibling", "grandparent"].includes(rel.type)) return { ok: false, message: "They're not the lending type." };
    if (rel.closeness < 35) {
      rel.closeness = clamp(rel.closeness - 5);
      message = `${rel.firstName} said no. We're not close enough for that.`;
      log(p, message, "negative");
    } else if (Math.random() < 0.62) {
      const amount = randomInt(100, 2500);
      p.money += amount;
      rel.closeness = clamp(rel.closeness - 3);
      message = `${rel.firstName} gave me ${fmtMoney(amount, p)}.`;
      log(p, message, "money");
    } else {
      rel.closeness = clamp(rel.closeness - 8);
      message = `${rel.firstName} said they couldn't help me out.`;
      log(p, message, "negative");
    }
  } else if (action === "propose") {
    if (rel.type !== "partner") return { ok: false, message: "You can only propose to a partner." };
    if (p.age < 18) return { ok: false, message: "You're too young to marry." };
    if (rel.closeness < 75) return { ok: false, message: `${rel.firstName} doesn't seem ready. Build your bond first.` };
    if (p.money < 2000) return { ok: false, message: "You need at least $2,000 for a ring and wedding." };
    p.money -= 2000;
    rel.type = "spouse";
    rel.closeness = clamp(rel.closeness + 10);
    p.flags.married = true;
    p.flags.marriages = (p.flags.marriages || 0) + 1;
    p.stats.happiness = clamp(p.stats.happiness + 15);
    message = `${rel.firstName} said yes! We're married.`;
    log(p, `I proposed to ${rel.firstName}, and we got married!`, "milestone");
  } else if (action === "breakup") {
    if (!["partner", "spouse"].includes(rel.type)) return { ok: false, message: "You're not in a relationship with them." };
    const wasSpouse = rel.type === "spouse";
    removeRelationship(rel, "ex");
    if (wasSpouse) p.flags.married = false;
    p.stats.happiness = clamp(p.stats.happiness - 12);
    message = `I broke up with ${rel.firstName}.`;
    log(p, message, "negative");
  } else if (action === "baby") {
    if (!["partner", "spouse"].includes(rel.type)) return { ok: false, message: "You need a partner first." };
    if (p.age < 18 || p.age > 50) return { ok: false, message: "Now isn't the right time." };
    if (p.money < 5000) return { ok: false, message: "You need at least $5,000 saved up." };
    p.money -= 5000;
    if (Math.random() < 0.58) {
      const child = addChild();
      message = `We welcomed a baby ${child.gender === "female" ? "girl" : "boy"}, ${child.firstName}.`;
      p.stats.happiness = clamp(p.stats.happiness + 8);
      log(p, message, "milestone");
    } else {
      message = "We're trying for a baby. Maybe next year.";
      log(p, message, "neutral");
    }
  } else if (action === "adopt") {
    if (rel.type !== "spouse") return { ok: false, message: "You need to be married to adopt." };
    if (p.money < 15000) return { ok: false, message: "Adoption costs at least $15,000." };
    p.money -= 15000;
    const child = addChild({ adopted: true });
    message = `We adopted a child, ${child.firstName}.`;
    p.stats.happiness = clamp(p.stats.happiness + 10);
    log(p, message, "milestone");
  } else if (action === "play") {
    rel.closeness = clamp(rel.closeness + 8);
    p.stats.happiness = clamp(p.stats.happiness + 3);
    message = `I played with ${rel.firstName}.`;
    log(p, message, "positive");
  } else if (action === "feed") {
    if (p.money < 20) return { ok: false, message: "You need $20 for food." };
    p.money -= 20;
    rel.closeness = clamp(rel.closeness + 5);
    p.stats.happiness = clamp(p.stats.happiness + 1);
    message = `I fed ${rel.firstName}.`;
    log(p, message, "positive");
  } else if (action === "vet") {
    if (p.money < 150) return { ok: false, message: "A vet visit costs $150." };
    p.money -= 150;
    rel.closeness = clamp(rel.closeness + 4);
    message = `I took ${rel.firstName} to the vet.`;
    log(p, message, "neutral");
  } else if (action === "visit") {
    p.stats.happiness = clamp(p.stats.happiness + 2);
    message = `I visited ${rel.firstName}'s grave and remembered the good times.`;
    log(p, message, "neutral");
  } else {
    return { ok: false, message: "Unknown action." };
  }

  rel.lastInteractions[action] = p.age;
  save();
  return { ok: true, message };
}

export function buyAsset(catalogId) {
  const p = store.profile;
  const item = ASSET_MAP[catalogId];
  if (!p || !item) return { ok: false, message: "Item not found." };
  if (p.age < 18) return { ok: false, message: "You must be 18 to buy this." };
  if (p.money < item.price) return { ok: false, message: "You can't afford that yet." };
  p.money -= item.price;
  p.assets.push({
    ...item,
    uid: Math.random().toString(36).slice(2, 10),
    purchasePrice: item.price,
    value: item.price,
    boughtAt: p.age
  });
  p.stats.happiness = clamp(p.stats.happiness + (item.happiness || 0));
  log(p, `I bought a ${item.name} for ${fmtMoney(item.price, p)}.`, "money");
  save();
  return { ok: true, message: `You bought a ${item.name}!` };
}

export function sellAsset(uid) {
  const p = store.profile;
  const idx = p.assets.findIndex(a => a.uid === uid);
  if (idx < 0) return { ok: false, message: "Asset not found." };
  const item = p.assets[idx];
  const value = Math.round((item.value || item.price) * 0.75);
  p.money += value;
  p.assets.splice(idx, 1);
  p.stats.happiness = clamp(p.stats.happiness - 2);
  log(p, `I sold my ${item.name} for ${fmtMoney(value, p)}.`, "money");
  save();
  return { ok: true, message: `Sold ${item.name} for ${fmtMoney(value, p)}.` };
}

export function investMoney(amount) {
  const p = store.profile;
  const amt = Math.round(Number(amount) || 0);
  if (amt <= 0) return { ok: false, message: "Enter a valid amount." };
  if (p.money < amt) return { ok: false, message: "You don't have that much money." };
  p.money -= amt;
  p.investments += amt;
  log(p, `I invested ${fmtMoney(amt, p)}.`, "money");
  save();
  return { ok: true, message: `Invested ${fmtMoney(amt, p)}.` };
}

export function withdrawInvestments() {
  const p = store.profile;
  if (p.investments <= 0) return { ok: false, message: "You have no investments." };
  const amount = p.investments;
  p.money += amount;
  p.investments = 0;
  log(p, `I withdrew ${fmtMoney(amount, p)} from my investments.`, "money");
  save();
  return { ok: true, message: `Withdrew ${fmtMoney(amount, p)}.` };
}

export function borrowMoney(amount) {
  const p = store.profile;
  const amt = Math.round(Number(amount) || 0);
  if (amt <= 0) return { ok: false, message: "Enter a valid amount." };
  if (p.age < 18) return { ok: false, message: "You must be 18 to take a loan." };
  if (p.debt + amt > 200000) return { ok: false, message: "The bank won't lend you that much." };
  p.money += amt;
  p.debt += amt;
  log(p, `I took out a loan for ${fmtMoney(amt, p)}.`, "neutral");
  save();
  return { ok: true, message: `You borrowed ${fmtMoney(amt, p)}.` };
}

export function repayDebt(amount) {
  const p = store.profile;
  const amt = Math.min(Math.round(Number(amount) || 0), p.debt, p.money);
  if (amt <= 0) return { ok: false, message: "Nothing to repay." };
  p.money -= amt;
  p.debt = Math.max(0, p.debt - amt);
  log(p, `I paid off ${fmtMoney(amt, p)} of my debt.`, "positive");
  save();
  return { ok: true, message: `Repaid ${fmtMoney(amt, p)}.` };
}

export function setSetting(key, value) {
  store.settings[key] = value;
  save();
}
