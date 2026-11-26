import {
  store, clamp, randomInt, fmtMoney, log, save, applyEffects, addPartner,
  addChild, addPet, addFriend, addGrandchild, removeRelationship, takeQueue, pushQueue
} from "./engine.js";
import { ACTIVITY_MAP } from "./activities.js";
import { die, retirePerson } from "./lifecycle.js";
import { enrollTrade } from "./actions-life.js";

function resultType(effects = {}) {
  if ((effects.happiness || 0) < 0 || (effects.health || 0) < 0 || (effects.money || 0) < 0) return "negative";
  if ((effects.money || 0) > 0 || (effects.happiness || 0) > 0 || (effects.health || 0) > 0) return "positive";
  return "neutral";
}

export function resolveEvent(event, choiceIndex) {
  const p = store.profile;
  if (!p || !event) return { ok: false, message: "No active event." };
  const choice = event.choices?.[choiceIndex];
  if (!choice) return { ok: false, message: "Invalid choice." };
  if (choice.requires?.money && p.money < choice.requires.money) {
    return { ok: false, message: `You need ${fmtMoney(choice.requires.money, p)} for that.` };
  }

  applyEffects(p, choice.effects || {});
  let message = choice.result || "";
  let skipLog = false;
  let openMajor = false;
  const action = choice.action;

  if (action === "college_major") {
    openMajor = true;
    skipLog = true;
    message = "";
  } else if (action === "trade") {
    const res = enrollTrade();
    message = res.message;
    skipLog = true;
  } else if (action === "retire") {
    retirePerson(p);
    message = "You retired. Enjoy the golden years.";
    skipLog = true;
  } else if (action === "raise_job") {
    if (p.job) {
      p.job.salary = Math.round(p.job.salary * 1.15);
      message += ` My new salary is ${fmtMoney(p.job.salary, p)}.`;
    }
  } else if (action === "better_job") {
    if (p.job) {
      p.job.salary = Math.round(p.job.salary * 1.2);
      p.job.company = "New Horizons Inc.";
      message += ` My new salary is ${fmtMoney(p.job.salary, p)}.`;
    }
  } else if (action === "losejob") {
    if (p.job) {
      message += ` I lost my job as a ${p.job.title}.`;
      p.job = null;
    }
  } else if (action === "keepjob") {
    if (p.job && Math.random() < 0.5) {
      message = "I convinced them to keep me on. I still have my job.";
    } else if (p.job) {
      message = `I lost my job as a ${p.job.title}.`;
      p.job = null;
    }
    skipLog = true;
  } else if (action === "lottery") {
    if (Math.random() < 0.012) {
      const win = randomInt(1000, 1000000);
      p.money += win;
      p.flags.lotteryWins = (p.flags.lotteryWins || 0) + 1;
      message = `I won ${fmtMoney(win, p)} in the lottery!`;
      p.stats.happiness = clamp(p.stats.happiness + 20);
    } else {
      message = "My lottery ticket was worthless. Maybe next time.";
    }
  } else if (action === "invest_risk") {
    const amount = 5000;
    if (Math.random() < 0.55) {
      p.money += amount * 2;
      message = `The investment paid off. I made ${fmtMoney(amount, p)} profit.`;
      p.stats.happiness = clamp(p.stats.happiness + 5);
    } else {
      message = `The investment tanked. I lost ${fmtMoney(amount, p)}.`;
      p.stats.happiness = clamp(p.stats.happiness - 5);
    }
  } else if (action === "startup_risk") {
    const amount = 10000;
    if (Math.random() < 0.25) {
      p.money += amount * 5;
      message = `The startup took off! My investment is now worth ${fmtMoney(amount * 5, p)}.`;
      p.stats.happiness = clamp(p.stats.happiness + 12);
    } else {
      message = `The startup folded. I lost ${fmtMoney(amount, p)}.`;
      p.stats.happiness = clamp(p.stats.happiness - 8);
    }
  } else if (action === "crypto_risk") {
    const amount = 2000;
    if (Math.random() < 0.4) {
      p.money += amount * 3;
      message = `My crypto investment tripled. I made ${fmtMoney(amount * 2, p)} profit.`;
      p.stats.happiness = clamp(p.stats.happiness + 6);
    } else {
      message = `The crypto crashed. I lost ${fmtMoney(amount, p)}.`;
      p.stats.happiness = clamp(p.stats.happiness - 6);
    }
  } else if (action === "tax_evade") {
    if (Math.random() < 0.5) {
      message = "They never caught on. I got away with it. This time.";
      p.karma = clamp(p.karma - 10);
    } else {
      p.money -= 20000;
      p.inPrison = Math.max(p.inPrison, 2);
      p.job = null;
      message = "I was caught evading taxes. I was fined and sent to prison.";
      p.stats.happiness = clamp(p.stats.happiness - 20);
    }
  } else if (action === "mayor_race") {
    if (Math.random() < 0.3) {
      p.job = { id: "mayor", title: "Mayor", baseTitle: "Mayor", company: "City Government", icon: "🏛️", salary: 110000, level: 1, performance: 60, years: 0, field: "politics" };
      p.fame = clamp(p.fame + 20);
      message = "I won the election! I'm the new mayor.";
      p.stats.happiness = clamp(p.stats.happiness + 15);
    } else {
      message = "I lost the election. Maybe politics isn't for me.";
      p.stats.happiness = clamp(p.stats.happiness - 8);
    }
  } else if (action === "president_race") {
    if (Math.random() < 0.15) {
      p.job = { id: "president", title: "President", baseTitle: "President", company: "Government", icon: "🇺🇸", salary: 400000, level: 1, performance: 65, years: 0, field: "politics" };
      p.fame = clamp(p.fame + 30);
      message = "I won the presidential election. I'm the President!";
      p.stats.happiness = clamp(p.stats.happiness + 25);
    } else {
      message = "My presidential campaign fell short. It was an honor to run.";
      p.stats.happiness = clamp(p.stats.happiness - 10);
    }
  } else if (action === "viral") {
    if (Math.random() < 0.35) {
      const cash = randomInt(500, 5000);
      p.money += cash;
      p.fame = clamp(p.fame + 10);
      message = `I went viral! I gained followers and ${fmtMoney(cash, p)}.`;
      p.stats.happiness = clamp(p.stats.happiness + 8);
    } else {
      message = "My video flopped. The internet moved on.";
      p.stats.happiness = clamp(p.stats.happiness - 2);
    }
  } else if (action === "business") {
    if (Math.random() < 0.5) {
      const profit = randomInt(5000, 30000);
      p.money += profit;
      p.flags.businesses = (p.flags.businesses || 0) + 1;
      message = `My business is profitable! I made ${fmtMoney(profit, p)}.`;
      p.stats.happiness = clamp(p.stats.happiness + 8);
    } else {
      p.flags.businesses = (p.flags.businesses || 0) + 1;
      message = "My business struggled. I lost my initial investment.";
      p.stats.happiness = clamp(p.stats.happiness - 6);
    }
  } else if (action === "recover_money") {
    if (Math.random() < 0.5) {
      p.money += 3000;
      message = "The bank recovered some of the stolen money.";
    } else {
      message = "The bank couldn't recover the stolen money.";
    }
  } else if (action === "gift_car") {
    p.assets.push({
      id: "midlife_car", type: "vehicle", name: "Sports Car", icon: "🏎️",
      value: 30000, upkeep: 6000, purchasePrice: 30000, happiness: 8,
      uid: Math.random().toString(36).slice(2, 10), boughtAt: p.age
    });
    message = "I bought a shiny sports car. Practical? No. Fun? Absolutely.";
  } else if (action === "party") {
    if (Math.random() < 0.4) {
      const friend = addFriend();
      message += ` I met ${friend.firstName} and we hit it off.`;
    }
    if (Math.random() < 0.18 && !p.relationships.some(r => ["partner", "spouse"].includes(r.type) && r.alive !== false)) {
      const partner = addPartner();
      if (partner) message += ` I also met ${partner.firstName}, and we exchanged numbers.`;
    }
  } else if (action === "crush") {
    if (Math.random() < 0.6) {
      const partner = addPartner({ age: p.age + randomInt(-1, 1) });
      if (partner) message = `They said yes! I'm now dating ${partner.firstName}.`;
    } else {
      message = "They said no. I'll survive. Probably.";
      p.stats.happiness = clamp(p.stats.happiness - 4);
    }
  } else if (action === "blind_date") {
    if (Math.random() < 0.7) {
      const partner = addPartner();
      if (partner) message = `The date went great. I'm now seeing ${partner.firstName}.`;
    } else {
      message = "The date was awkward. We didn't click.";
      p.stats.happiness = clamp(p.stats.happiness - 2);
    }
  } else if (action === "breakup") {
    const rel = p.relationships.find(r => ["partner", "spouse"].includes(r.type) && r.alive !== false);
    if (rel) {
      removeRelationship(rel, "ex");
      p.flags.married = false;
      message = `I broke up with ${rel.firstName}.`;
    }
  } else if (action === "baby") {
    const child = addChild();
    message = `We welcomed a baby ${child.gender === "female" ? "girl" : "boy"}, ${child.firstName}.`;
  } else if (action === "adopt") {
    const child = addChild({ adopted: true });
    message = `We adopted a child, ${child.firstName}.`;
  } else if (action === "propose_event") {
    const rel = p.relationships.find(r => r.type === "partner" && r.alive !== false);
    if (rel) {
      rel.type = "spouse";
      rel.closeness = clamp(rel.closeness + 10);
      p.flags.married = true;
      p.flags.marriages = (p.flags.marriages || 0) + 1;
      p.stats.happiness = clamp(p.stats.happiness + 10);
      message = `${rel.firstName} said yes! We're engaged.`;
    }
  } else if (action === "pet") {
    const pet = addPet();
    message = `I adopted a ${pet.species} named ${pet.firstName}.`;
  } else if (action === "grandchild") {
    addGrandchild();
  } else if (action === "license") {
    if (Math.random() < 0.7) {
      p.flags.license = true;
      message = "I passed my driving test! I finally have my license.";
      p.stats.happiness = clamp(p.stats.happiness + 5);
    } else {
      message = "I failed my driving test. Parallel parking is impossible.";
      p.stats.happiness = clamp(p.stats.happiness - 3);
    }
  } else if (action === "cheat") {
    if (Math.random() < 0.55) {
      p.stats.smarts = clamp(p.stats.smarts + 4);
      p.stats.happiness = clamp(p.stats.happiness + 3);
      message = "I got away with cheating. I aced the exam.";
    } else {
      p.stats.smarts = clamp(p.stats.smarts - 3);
      p.stats.happiness = clamp(p.stats.happiness - 6);
      message = "I got caught cheating. The teacher called my parents.";
    }
  } else if (action === "vacation") {
    p.flags.vacations = (p.flags.vacations || 0) + 1;
    message = "I had an amazing vacation. I feel refreshed.";
  } else if (action === "payfine") {
    message = "I paid the fine and walked away.";
  } else if (action === "prison") {
    p.inPrison = Math.max(p.inPrison, 3);
    p.job = null;
    p.stats.happiness = clamp(p.stats.happiness - 15);
    message = "I was sentenced to 3 years in prison.";
  } else if (action === "death") {
    die("a tragic accident");
    return { ok: true, died: true, message: "I didn't make it." };
  }

  if (!skipLog && message) {
    log(p, message, resultType(choice.effects));
  }

  if (p.stats.health <= 0) {
    die("health complications");
    return { ok: true, died: true, message };
  }

  save();
  return { ok: true, message, next: takeQueue(), openMajor, died: false };
}

export function doActivity(id) {
  const p = store.profile;
  const a = ACTIVITY_MAP[id];
  if (!p || !a) return { ok: false, message: "Activity not found." };
  if (p.inPrison > 0) return { ok: false, message: "You can't do that while in prison." };
  if (p.age < (a.minAge || 0) || p.age > (a.maxAge ?? 120)) return { ok: false, message: "You're not the right age for that." };
  if (p.usedActivities.includes(id)) return { ok: false, message: "You already did that this year." };
  if (a.special === "invest") return { ok: true, openInvest: true, message: "" };
  const cost = a.cost || 0;
  if (p.money < cost) return { ok: false, message: `You need ${fmtMoney(cost, p)} for that.` };

  p.usedActivities.push(id);
  p.money -= cost;

  let message = a.result || "";
  let modal = null;

  if (a.special === "surgery") {
    applyEffects(p, a.effects);
    p.flags.surgeries = (p.flags.surgeries || 0) + 1;
    if (Math.random() < 0.16) {
      p.stats.looks = clamp(p.stats.looks - 10);
      p.stats.health = clamp(p.stats.health - 4);
      message = "The surgery was botched. I don't look the way I hoped.";
    } else {
      message = "The surgery was a success. I love the new look.";
    }
  } else if (a.special === "gamble") {
    applyEffects(p, a.effects);
    if (Math.random() < 0.45) {
      const win = randomInt(200, 6000);
      p.money += win;
      message = `I won ${fmtMoney(win, p)} at the casino!`;
      p.stats.happiness = clamp(p.stats.happiness + 5);
    } else {
      message = "I lost my money at the casino. The house always wins.";
      p.stats.happiness = clamp(p.stats.happiness - 3);
    }
  } else if (a.special === "lottery") {
    if (Math.random() < 0.015) {
      const win = randomInt(1000, 1000000);
      p.money += win;
      p.flags.lotteryWins = (p.flags.lotteryWins || 0) + 1;
      message = `I won ${fmtMoney(win, p)} in the lottery!`;
      p.stats.happiness = clamp(p.stats.happiness + 20);
    } else {
      message = "My lottery ticket was a loser. Maybe next time.";
    }
  } else if (a.special === "date") {
    applyEffects(p, a.effects);
    const existing = p.relationships.find(r => ["partner", "spouse"].includes(r.type) && r.alive !== false);
    if (existing) {
      existing.closeness = clamp(existing.closeness + 8);
      message = `I had a lovely date with ${existing.firstName}.`;
    } else if (Math.random() < 0.62) {
      const partner = addPartner();
      if (partner) message = `I met ${partner.firstName} and we hit it off. We're dating now.`;
    } else {
      message = "The date didn't go well. We didn't click.";
      p.stats.happiness = clamp(p.stats.happiness - 2);
    }
  } else if (a.special === "party") {
    applyEffects(p, a.effects);
    if (Math.random() < 0.4) {
      const friend = addFriend();
      message += ` I met ${friend.firstName} and we became friends.`;
    }
    if (Math.random() < 0.18 && !p.relationships.some(r => ["partner", "spouse"].includes(r.type) && r.alive !== false)) {
      const partner = addPartner();
      if (partner) message += ` I also met ${partner.firstName}, and we exchanged numbers.`;
    }
  } else if (a.special === "social") {
    applyEffects(p, a.effects);
    if (Math.random() < 0.3) {
      const cash = randomInt(500, 5000);
      p.money += cash;
      p.fame = clamp(p.fame + 6);
      message = `One of my posts went viral! I gained followers and ${fmtMoney(cash, p)}.`;
      p.stats.happiness = clamp(p.stats.happiness + 6);
    }
  } else if (a.special === "vacation") {
    applyEffects(p, a.effects);
    p.flags.vacations = (p.flags.vacations || 0) + 1;
    const places = ["the beach", "the mountains", "a new city", "a tropical island", "the countryside"];
    message = `I went on vacation to ${places[randomInt(0, places.length - 1)]} and came back refreshed.`;
  } else if (a.special === "risk") {
    applyEffects(p, a.effects);
    p.flags.skydives = (p.flags.skydives || 0) + 1;
    if (Math.random() < 0.05) {
      p.stats.health = clamp(p.stats.health - 25);
      message = "My parachute didn't open properly. I survived, but it was terrifying.";
    } else {
      message = "I jumped out of a plane and screamed the whole way down. Incredible.";
    }
  } else if (a.special === "audition") {
    const chance = clamp(0.18 + p.stats.looks / 250 + p.fame / 200, 0.1, 0.85);
    if (Math.random() < chance) {
      const cash = randomInt(2000, 25000);
      p.money += cash;
      p.fame = clamp(p.fame + 10);
      p.stats.happiness = clamp(p.stats.happiness + 8);
      message = `I nailed the audition! I booked the role and earned ${fmtMoney(cash, p)}.`;
    } else {
      message = "I didn't get the part. The director said I wasn't right for it.";
      p.stats.happiness = clamp(p.stats.happiness - 3);
    }
  } else if (a.special === "pet") {
    applyEffects(p, a.effects);
    const pet = addPet();
    message = `I adopted a ${pet.species} named ${pet.firstName}.`;
  } else if (a.special === "business") {
    applyEffects(p, a.effects);
    if (Math.random() < 0.5) {
      const profit = randomInt(5000, 30000);
      p.money += profit;
      p.flags.businesses = (p.flags.businesses || 0) + 1;
      message = `My business is profitable! I made ${fmtMoney(profit, p)}.`;
      p.stats.happiness = clamp(p.stats.happiness + 8);
    } else {
      p.flags.businesses = (p.flags.businesses || 0) + 1;
      message = "My business struggled. I lost my initial investment.";
      p.stats.happiness = clamp(p.stats.happiness - 6);
    }
  } else if (a.special === "crime") {
    applyEffects(p, a.effects);
    p.flags.crimes = (p.flags.crimes || 0) + 1;
    const successChance = a.crime.prison ? 0.32 : 0.55;
    if (Math.random() < successChance) {
      const haul = randomInt(50, a.crime.max || 500);
      p.money += haul;
      p.karma = clamp(p.karma - 8);
      message = `I got away with ${a.crime.name} and made ${fmtMoney(haul, p)}.`;
      p.stats.happiness = clamp(p.stats.happiness + 3);
    } else {
      const fine = Math.min(Math.max(250, Math.round((a.crime.max || 500) * 0.7)), 20000);
      const prison = a.crime.prison || 1;
      modal = {
        id: "crime_arrest",
        kicker: `Age ${p.age} • Trouble`,
        title: "Caught Red-Handed",
        icon: "🚔",
        age: p.age,
        text: `I was caught ${a.crime.name}. The police are asking questions, and my options are not great.`,
        choices: [
          { label: "Pay the fine", sub: `-${fmtMoney(fine, p)}`, requires: { money: fine }, effects: { money: -fine, happiness: -5 }, action: "payfine", result: "I paid the fine and walked away." },
          { label: "Take the sentence", sub: `${prison} year${prison === 1 ? "" : "s"} in prison`, effects: { happiness: -15 }, action: "prison", result: "I was sentenced to prison." }
        ]
      };
      save();
      return { ok: true, message: "", modal };
    }
  } else {
    applyEffects(p, a.effects);
  }

  if (message) log(p, message, resultType(a.effects));
  if (p.stats.health <= 0) {
    die("health complications");
    return { ok: true, died: true, message };
  }
  save();
  return { ok: true, message };
}
