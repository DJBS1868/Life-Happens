const has = (p, types) => p.relationships.some(r => types.includes(r.type) && r.alive !== false);
const isSingle = p => !has(p, ["partner", "spouse"]);
const kids = p => p.relationships.filter(r => r.type === "child" && r.alive !== false);

export const BASE_EVENTS = [
  {
    id: "wallet", title: "A Wallet on the Ground", icon: "👛", min: 8, max: 90, weight: 8,
    text: "I found a wallet on the sidewalk with $200 inside. The ID says it belongs to someone who lives nearby.",
    choices: [
      { label: "Return it", sub: "Do the right thing", effects: { karma: 10, happiness: 4 }, result: "I returned the wallet. The owner was incredibly grateful." },
      { label: "Keep the cash", sub: "+$200", effects: { money: 200, karma: -12, happiness: -2 }, result: "I kept the cash and tossed the wallet. I felt a little guilty." }
    ]
  },
  {
    id: "found_money", title: "Lucky Find", icon: "🍀", min: 6, max: 90, weight: 6,
    text: "I spotted a $50 bill blowing down the street. Nobody else seemed to notice.",
    choices: [
      { label: "Grab it", sub: "+$50", effects: { money: 50, happiness: 2 }, result: "I caught the bill and treated myself." },
      { label: "Leave it", sub: "Someone else might need it", effects: { karma: 5 }, result: "I let the wind take it. Maybe it found someone who needed it." }
    ]
  },
  {
    id: "bully", title: "School Bully", icon: "😠", min: 8, max: 16, weight: 8,
    text: "A group of kids keeps picking on me at school. Today they knocked my books out of my hands.",
    choices: [
      { label: "Stand up to them", sub: "Fight back", effects: { happiness: 4, health: -3, karma: 3 }, result: "I stood up to the bully. It got physical, but they backed off." },
      { label: "Tell a teacher", sub: "Let an adult handle it", effects: { happiness: 2, smarts: 1 }, result: "I told a teacher. The bullying stopped after a serious talk." },
      { label: "Ignore them", sub: "Keep your head down", effects: { happiness: -5 }, result: "I ignored them and ate lunch alone. It hurt more than I expected." }
    ]
  },
  {
    id: "gifted", title: "Teacher's Praise", icon: "🌟", min: 6, max: 14, weight: 7,
    text: "My teacher pulled me aside and said I have real potential. She suggested I try harder assignments.",
    choices: [
      { label: "Study harder", sub: "Push yourself", effects: { smarts: 5, happiness: -1 }, result: "I started studying harder and surprised myself." },
      { label: "Coast", sub: "Enjoy being smart", effects: { happiness: 2 }, result: "I coasted on my natural talent. For now." }
    ]
  },
  {
    id: "cigarette", title: "A Bad Offer", icon: "🚬", min: 12, max: 18, weight: 7,
    text: "A classmate offered me a cigarette behind the school. They said everyone was doing it.",
    choices: [
      { label: "Try it", sub: "What's the harm?", effects: { health: -4, happiness: 3 }, result: "I tried a cigarette. It tasted terrible, but I felt cool for a minute." },
      { label: "Say no", sub: "Not worth it", effects: { smarts: 2, happiness: -1, karma: 2 }, result: "I said no. They shrugged and moved on." }
    ]
  },
  {
    id: "party_invite", title: "Party Invitation", icon: "🎉", min: 14, max: 22, weight: 9,
    text: "Someone I like invited me to a party this weekend. My parents want me to stay home and study.",
    choices: [
      { label: "Go to the party", sub: "You only live once", effects: { happiness: 6, health: -2, money: -50 }, action: "party", result: "I went to the party. It was worth it." },
      { label: "Stay home", sub: "Keep your head down", effects: { smarts: 2, happiness: -2 }, result: "I stayed home and studied. Responsible, but boring." }
    ]
  },
  {
    id: "crush", title: "A Crush", icon: "💘", min: 13, max: 19, weight: 8,
    text: "I have a crush on someone in my class. They smiled at me today and my heart nearly exploded.",
    choices: [
      { label: "Ask them out", sub: "Shoot your shot", effects: { happiness: 3 }, action: "crush", result: "I worked up the courage to ask them out." },
      { label: "Focus on school", sub: "Keep it to yourself", effects: { smarts: 2 }, result: "I decided to focus on school instead." }
    ]
  },
  {
    id: "exam_cheat", title: "Exam Pressure", icon: "📝", min: 13, max: 22, weight: 7, cond: p => !!p.education.stage,
    text: "I forgot to study for a big exam. The person next to me has all the answers written on their hand.",
    choices: [
      { label: "Cheat", sub: "Risk getting caught", effects: {}, action: "cheat", result: "I tried to cheat on the exam." },
      { label: "Study now", sub: "Cram all night", effects: { smarts: 4, happiness: -2 }, result: "I crammed all night and did better than expected." }
    ]
  },
  {
    id: "school_fight", title: "Hallway Fight", icon: "🥊", min: 10, max: 17, weight: 6,
    text: "Someone shoved me in the hallway and called me a name. A crowd is starting to gather.",
    choices: [
      { label: "Fight them", sub: "Show them you're not scared", effects: { health: -5, happiness: 3 }, result: "We fought. I got a bloody nose, but I earned some respect." },
      { label: "Walk away", sub: "Take the high road", effects: { smarts: 1, karma: 2, happiness: -1 }, result: "I walked away. It was harder than fighting would have been." }
    ]
  },
  {
    id: "driving", title: "Driving Lessons", icon: "🚦", min: 16, max: 22, weight: 7,
    text: "Everyone my age is getting their driver's license. Lessons are expensive, but freedom is calling.",
    choices: [
      { label: "Take lessons", sub: "-$300", requires: { money: 300 }, effects: { money: -300, happiness: 2 }, action: "license", result: "I signed up for driving lessons." },
      { label: "Wait", sub: "Save your money", effects: {}, result: "I decided to wait until I could afford lessons." }
    ]
  },
  {
    id: "school_trip", title: "School Trip", icon: "🚌", min: 8, max: 17, weight: 6,
    text: "My class is taking a trip to a science museum. The permission slip is sitting on the kitchen table.",
    choices: [
      { label: "Go", sub: "-$100", requires: { money: 100 }, effects: { money: -100, happiness: 5, smarts: 2 }, result: "I went on the school trip and had a great time." },
      { label: "Skip it", sub: "Stay home", effects: { happiness: -1 }, result: "I stayed home while everyone else went on the trip." }
    ]
  },
  {
    id: "talent_show", title: "Talent Show", icon: "🎤", min: 7, max: 18, weight: 6,
    text: "The school talent show is next week. Sign-ups close tomorrow and the whole class is watching.",
    choices: [
      { label: "Perform", sub: "Chase the spotlight", effects: { happiness: 4, fame: 3 }, result: "I performed in the talent show. The applause felt amazing." },
      { label: "Watch from the crowd", sub: "Support your classmates", effects: { happiness: 1 }, result: "I watched the talent show from the audience." }
    ]
  },
  {
    id: "sibling_rivalry", title: "Sibling Trouble", icon: "😤", min: 5, max: 25, weight: 5, cond: p => has(p, ["sibling"]),
    text: "My sibling borrowed something of mine without asking and broke it.",
    choices: [
      { label: "Talk it out", sub: "Give them a chance", effects: { happiness: 2, rel: { type: "sibling", amount: 8 } }, result: "We talked it out. They apologized and promised to make it up to me." },
      { label: "Start a fight", sub: "Let them have it", effects: { happiness: -2, rel: { type: "sibling", amount: -12 } }, result: "We got into a screaming match. The whole house heard it." }
    ]
  },
  {
    id: "parents_divorce", title: "Trouble at Home", icon: "💔", min: 6, max: 18, weight: 3, cond: p => has(p, ["mother", "father"]),
    text: "My parents have been arguing for weeks. Tonight they sat me down and said they might separate.",
    choices: [
      { label: "Support Mom", sub: "Stay close to her", effects: { happiness: -8, rel: { type: "mother", amount: 12 } }, result: "I told my mom I was on her side. She held me and cried." },
      { label: "Support Dad", sub: "Stay close to him", effects: { happiness: -8, rel: { type: "father", amount: 12 } }, result: "I told my dad I was on his side. He looked relieved." },
      { label: "Stay out of it", sub: "It's not your fight", effects: { happiness: -5 }, result: "I stayed out of it, but the silence at home was deafening." }
    ]
  },
  {
    id: "stray_pet", title: "A Stray Dog", icon: "🐕", min: 8, max: 80, weight: 6,
    text: "A skinny stray dog followed me home and sat by the door like it had always lived here.",
    choices: [
      { label: "Adopt it", sub: "-$300", requires: { money: 300 }, effects: { money: -300, happiness: 8, karma: 5 }, action: "pet", result: "I adopted the stray dog. Best decision ever." },
      { label: "Leave it", sub: "Not your responsibility", effects: { karma: -2, happiness: -2 }, result: "I closed the door. I still think about that dog." }
    ]
  },
  {
    id: "friend_loan", title: "A Friend in Need", icon: "🤝", min: 18, max: 80, weight: 7, cond: p => has(p, ["friend"]),
    text: "A close friend called me in tears. They need $2,000 to avoid losing their apartment.",
    choices: [
      { label: "Lend the money", sub: "-$2,000", requires: { money: 2000 }, effects: { money: -2000, karma: 8, rel: { type: "friend", amount: 12 } }, result: "I lent my friend the money. They promised to pay me back." },
      { label: "Say no", sub: "Protect your savings", effects: { rel: { type: "friend", amount: -10 }, happiness: -2 }, result: "I told my friend I couldn't help. The silence was awful." }
    ]
  },
  {
    id: "overtime", title: "Mandatory Overtime", icon: "💼", min: 22, max: 65, weight: 8, cond: p => !!p.job,
    text: "My boss asked me to work overtime for the next month. The extra money would help, but I'm already exhausted.",
    choices: [
      { label: "Accept", sub: "+$5,000", effects: { money: 5000, health: -2, happiness: -2 }, result: "I worked overtime all month. The paycheck was nice; the burnout was not." },
      { label: "Decline", sub: "Protect your time", effects: { happiness: 2 }, result: "I declined the overtime and protected my evenings." }
    ]
  },
  {
    id: "promotion_offer", title: "A Step Up", icon: "📈", min: 22, max: 65, weight: 7, cond: p => !!p.job,
    text: "My manager pulled me aside and offered me a bigger role with more responsibility and better pay.",
    choices: [
      { label: "Accept", sub: "+15% salary", effects: { happiness: 4 }, action: "raise_job", result: "I accepted the promotion." },
      { label: "Decline", sub: "Stay comfortable", effects: { happiness: 1 }, result: "I declined. The timing wasn't right." }
    ]
  },
  {
    id: "better_job", title: "A Competitor Calls", icon: "📞", min: 22, max: 65, weight: 6, cond: p => !!p.job,
    text: "A recruiter from a rival company called. They offered me a similar job with a 20% higher salary.",
    choices: [
      { label: "Take the offer", sub: "+20% salary", effects: { happiness: 5 }, action: "better_job", result: "I took the new job. A fresh start." },
      { label: "Stay loyal", sub: "Keep your current job", effects: { happiness: 1 }, result: "I turned down the offer and stayed where I was." }
    ]
  },
  {
    id: "layoff", title: "Company Downsizing", icon: "📉", min: 22, max: 64, weight: 4, cond: p => !!p.job,
    text: "My company announced layoffs. My name is on the list, but they're offering a severance package.",
    choices: [
      { label: "Take the severance", sub: "+$10,000", effects: { money: 10000, happiness: -8 }, action: "losejob", result: "I took the severance and cleaned out my desk." },
      { label: "Fight to keep your job", sub: "Plead your case", effects: {}, action: "keepjob", result: "I fought to keep my job." }
    ]
  },
  {
    id: "lottery", title: "Lucky Numbers", icon: "🎟️", min: 18, max: 90, weight: 5,
    text: "The jackpot is huge this week. The gas station is selling tickets and everyone is talking about it.",
    choices: [
      { label: "Buy a ticket", sub: "-$20", requires: { money: 20 }, effects: { money: -20 }, action: "lottery", result: "I bought a lottery ticket." },
      { label: "Save your money", sub: "The odds are terrible", effects: { smarts: 1 }, result: "I kept my money. Somebody else can dream." }
    ]
  },
  {
    id: "investment_tip", title: "Hot Investment Tip", icon: "💹", min: 22, max: 75, weight: 6,
    text: "A coworker swears they have a can't-miss investment. They're putting in $5,000 of their own money.",
    choices: [
      { label: "Invest $5,000", sub: "-$5,000", requires: { money: 5000 }, effects: { money: -5000 }, action: "invest_risk", result: "I put $5,000 into the investment." },
      { label: "Pass", sub: "Too good to be true", effects: { smarts: 1 }, result: "I passed on the investment. I've seen this movie before." }
    ]
  },
  {
    id: "startup", title: "A Startup Opportunity", icon: "🚀", min: 22, max: 55, weight: 4,
    text: "A friend is starting a company and wants me to invest. They have big plans and a convincing pitch deck.",
    choices: [
      { label: "Invest $10,000", sub: "-$10,000", requires: { money: 10000 }, effects: { money: -10000 }, action: "startup_risk", result: "I invested in my friend's startup." },
      { label: "Pass", sub: "Keep your savings", effects: { smarts: 1 }, result: "I passed. Their pitch deck had a lot of typos." }
    ]
  },
  {
    id: "crypto", title: "Crypto Craze", icon: "🪙", min: 20, max: 60, weight: 5,
    text: "Everyone online is talking about a new cryptocurrency. It's either the future or a very expensive lesson.",
    choices: [
      { label: "Buy $2,000", sub: "-$2,000", requires: { money: 2000 }, effects: { money: -2000 }, action: "crypto_risk", result: "I bought $2,000 worth of crypto." },
      { label: "Ignore it", sub: "Not your thing", effects: { smarts: 1 }, result: "I ignored the crypto hype." }
    ]
  },
  {
    id: "cheating", title: "A Difficult Discovery", icon: "💔", min: 18, max: 80, weight: 4, cond: p => has(p, ["partner", "spouse"]),
    text: "I found messages on my partner's phone that they definitely didn't want me to see.",
    choices: [
      { label: "Confront and forgive", sub: "Try to rebuild trust", effects: { happiness: -8, rel: { type: "partner", amount: 5 } }, result: "We had a long, painful talk. I chose to forgive, for now." },
      { label: "Break up", sub: "End it now", effects: { happiness: -10 }, action: "breakup", result: "I ended the relationship. It hurt, but I deserved better." }
    ]
  },
  {
    id: "baby_ask", title: "A Big Question", icon: "🍼", min: 20, max: 48, weight: 5, cond: p => has(p, ["spouse"]),
    text: "My spouse sat me down and said they're ready to start a family. They looked at me with so much hope.",
    choices: [
      { label: "Start a family", sub: "Try for a baby", effects: { happiness: 8 }, action: "baby", result: "We decided to start a family." },
      { label: "Not yet", sub: "You're not ready", effects: { happiness: -2, rel: { type: "spouse", amount: -5 } }, result: "I said I wasn't ready. The conversation ended quietly." }
    ]
  },
  {
    id: "proposal", title: "The Next Step", icon: "💍", min: 20, max: 80, weight: 5, cond: p => has(p, ["partner"]) && !has(p, ["spouse"]),
    text: "I've been with my partner for a while now. My friends keep asking when I'm going to pop the question.",
    choices: [
      { label: "Propose", sub: "-$2,000", requires: { money: 2000 }, effects: { money: -2000, happiness: 10 }, action: "propose_event", result: "I got down on one knee." },
      { label: "Wait", sub: "Not yet", effects: { happiness: -1 }, result: "I decided to wait a little longer." }
    ]
  },
  {
    id: "blind_date", title: "A Blind Date", icon: "🥂", min: 20, max: 55, weight: 6, cond: p => isSingle(p),
    text: "A friend set me up on a blind date. I know nothing about this person except that they're 'really nice.'",
    choices: [
      { label: "Go", sub: "What's the worst that could happen?", effects: { happiness: 3 }, action: "blind_date", result: "I went on the blind date." },
      { label: "Cancel", sub: "Stay home", effects: { happiness: -1 }, result: "I canceled. My couch was very comfortable." }
    ]
  },
  {
    id: "adoption", title: "A Growing Family", icon: "🏡", min: 28, max: 55, weight: 3, cond: p => has(p, ["spouse"]),
    text: "My spouse and I have been talking about adoption. There's a child who needs a home, and we have so much love to give.",
    choices: [
      { label: "Adopt", sub: "-$15,000", requires: { money: 15000 }, effects: { money: -15000, happiness: 10 }, action: "adopt", result: "We started the adoption process." },
      { label: "Not now", sub: "It's a big decision", effects: { happiness: -1 }, result: "We decided the timing wasn't right." }
    ]
  }
];

import { MORE_EVENTS } from "./events-more.js";
export const EVENTS = [...BASE_EVENTS, ...MORE_EVENTS];
