const has = (p, types) => p.relationships.some(r => types.includes(r.type) && r.alive !== false);

export const MORE_EVENTS = [
  {
    id: "vacation_offer", title: "A Getaway", icon: "🏝️", min: 20, max: 80, weight: 7,
    text: "I found a great deal on a tropical vacation. Work can survive without me for a week, right?",
    choices: [
      { label: "Book the trip", sub: "-$2,500", requires: { money: 2500 }, effects: { money: -2500, happiness: 12, health: 2 }, action: "vacation", result: "I booked the trip. Paradise, here I come." },
      { label: "Stay home", sub: "Save the money", effects: { happiness: -1 }, result: "I stayed home and looked at photos of the beach." }
    ]
  },
  {
    id: "midlife", title: "Midlife Crisis", icon: "🏎️", min: 38, max: 55, weight: 5,
    text: "I woke up and realized I'm not young anymore. I have a sudden urge to do something dramatic.",
    choices: [
      { label: "Buy a sports car", sub: "-$30,000", requires: { money: 30000 }, effects: { money: -30000, happiness: 8 }, action: "gift_car", result: "I bought a ridiculous sports car." },
      { label: "Take up a hobby", sub: "-$1,000", requires: { money: 1000 }, effects: { money: -1000, happiness: 5, smarts: 2 }, result: "I took up a new hobby and felt alive again." },
      { label: "Do nothing", sub: "Ignore the feeling", effects: { happiness: -2 }, result: "I ignored the feeling and went back to work." }
    ]
  },
  {
    id: "health_scare", title: "A Health Scare", icon: "🫀", min: 40, max: 90, weight: 6,
    text: "I've been feeling strange chest pains for a few days. It's probably nothing. Probably.",
    choices: [
      { label: "See a doctor", sub: "-$500", requires: { money: 500 }, effects: { money: -500, health: 5, happiness: 2 }, result: "I got checked out. The doctor caught something early." },
      { label: "Ignore it", sub: "It'll pass", effects: { health: -8 }, result: "I ignored the pain. It didn't go away." }
    ]
  },
  {
    id: "gym_buddy", title: "Gym Buddy", icon: "🏋️", min: 20, max: 65, weight: 6,
    text: "A friend invited me to join their gym. They swear it changed their life and want me to come along.",
    choices: [
      { label: "Join the gym", sub: "-$500", requires: { money: 500 }, effects: { money: -500, health: 5, happiness: 2 }, result: "I joined the gym. My legs hate me, but I feel great." },
      { label: "Decline", sub: "Not your thing", effects: { happiness: 1 }, result: "I passed. I'll start exercising tomorrow. Probably." }
    ]
  },
  {
    id: "charity", title: "A Chance to Give", icon: "❤️", min: 25, max: 90, weight: 5,
    text: "A local charity is raising money for families who lost their homes in a fire. They're asking for donations.",
    choices: [
      { label: "Donate $1,000", sub: "-$1,000", requires: { money: 1000 }, effects: { money: -1000, karma: 10, happiness: 4 }, result: "I donated to the charity. It felt good to help." },
      { label: "Donate $100", sub: "-$100", requires: { money: 100 }, effects: { money: -100, karma: 4, happiness: 1 }, result: "I donated what I could." },
      { label: "Decline", sub: "Money is tight", effects: { karma: -2 }, result: "I declined. I told myself I'd help next time." }
    ]
  },
  {
    id: "tax_audit", title: "Tax Audit", icon: "🧾", min: 25, max: 85, weight: 3, cond: p => p.money > 80000,
    text: "I received a letter from the tax office. They want to audit my finances, and something tells me they won't like what they find.",
    choices: [
      { label: "Pay what you owe", sub: "-$10,000", requires: { money: 10000 }, effects: { money: -10000, happiness: -3, karma: 3 }, result: "I paid the back taxes and put it behind me." },
      { label: "Try to hide it", sub: "Risky", effects: {}, action: "tax_evade", result: "I decided to hide the money." }
    ]
  },
  {
    id: "scam_call", title: "Suspicious Call", icon: "📞", min: 60, max: 95, weight: 5,
    text: "Someone called claiming to be from my bank. They need my account details to 'verify a suspicious charge.'",
    choices: [
      { label: "Give them the info", sub: "They sounded official", effects: { money: -5000, happiness: -5, smarts: -1 }, result: "They cleaned out part of my account. I felt foolish." },
      { label: "Hang up", sub: "Call the bank yourself", effects: { smarts: 1, happiness: 1 }, result: "I hung up and called my bank directly. It was a scam." }
    ]
  },
  {
    id: "fall", title: "A Bad Fall", icon: "🩹", min: 68, max: 100, weight: 6,
    text: "I slipped on the stairs and landed hard. My hip is throbbing and I can barely stand.",
    choices: [
      { label: "Go to the hospital", sub: "-$2,000", requires: { money: 2000 }, effects: { money: -2000, health: 4 }, result: "I went to the hospital. It was a close call." },
      { label: "Walk it off", sub: "You've had worse", effects: { health: -8 }, result: "I tried to walk it off. That was a mistake." }
    ]
  },
  {
    id: "old_photo", title: "An Old Photograph", icon: "📷", min: 65, max: 110, weight: 6,
    text: "I found an old photo of myself when I was young, full of plans and possibilities.",
    choices: [
      { label: "Reminisce", sub: "Remember the good times", effects: { happiness: 6 }, result: "I spent the afternoon remembering. What a life." },
      { label: "Put it away", sub: "The past is the past", effects: { happiness: -2 }, result: "I put the photo back in the box." }
    ]
  },
  {
    id: "will", title: "Writing a Will", icon: "📜", min: 60, max: 100, weight: 4,
    text: "My lawyer suggested I write a will. It's morbid, but it would make things easier for my family.",
    choices: [
      { label: "Write the will", sub: "Get your affairs in order", effects: { karma: 5, happiness: 3 }, result: "I wrote my will and felt a strange sense of peace." },
      { label: "Not now", sub: "Too morbid", effects: { happiness: -1 }, result: "I decided to put it off." }
    ]
  },
  {
    id: "grandchild", title: "A New Generation", icon: "👶", min: 50, max: 95, weight: 4,
    cond: p => p.relationships.some(r => r.type === "child" && r.age >= 20 && r.alive !== false),
    text: "My child called with big news: I'm going to be a grandparent.",
    choices: [
      { label: "Celebrate", sub: "Welcome the baby", effects: { happiness: 10 }, action: "grandchild", result: "I celebrated the news. A new generation." },
      { label: "Offer advice", sub: "Share your wisdom", effects: { happiness: 5, smarts: 1 }, action: "grandchild", result: "I offered advice and promised to babysit." }
    ]
  },
  {
    id: "mayor_race", title: "Run for Mayor", icon: "🏛️", min: 30, max: 75, weight: 3, cond: p => p.fame >= 20,
    text: "Supporters are encouraging me to run for mayor. I could make a real difference in my city.",
    choices: [
      { label: "Run", sub: "-$10,000", requires: { money: 10000 }, effects: { money: -10000, fame: 8 }, action: "mayor_race", result: "I announced my campaign for mayor." },
      { label: "Decline", sub: "Politics isn't for you", effects: { happiness: 1 }, result: "I declined. I'd rather keep my weekends." }
    ]
  },
  {
    id: "movie_role", title: "A Movie Offer", icon: "🎬", min: 20, max: 75, weight: 3, cond: p => p.fame >= 25,
    text: "A director saw me online and wants me to audition for a role in their next film. It could be my big break.",
    choices: [
      { label: "Take the role", sub: "+$50,000", effects: { money: 50000, fame: 10, happiness: 5 }, result: "I took the role and filmed my scenes. I'm officially in a movie." },
      { label: "Pass", sub: "Stay out of the spotlight", effects: { happiness: 1 }, result: "I passed. The script wasn't for me." }
    ]
  },
  {
    id: "book_deal", title: "A Book Deal", icon: "📚", min: 25, max: 85, weight: 3, cond: p => p.stats.smarts >= 70,
    text: "A publisher read some of my writing online and wants to turn it into a book. They're offering an advance.",
    choices: [
      { label: "Accept the deal", sub: "+$20,000", effects: { money: 20000, fame: 8, happiness: 5 }, result: "I signed a book deal. My name is going on a cover." },
      { label: "Decline", sub: "Writing a book is a lot", effects: { happiness: 1 }, result: "I declined. Maybe someday." }
    ]
  },
  {
    id: "viral_video", title: "Going Viral", icon: "📱", min: 16, max: 60, weight: 5,
    text: "I posted a silly video last night. This morning it has thousands of views and the comments are wild.",
    choices: [
      { label: "Post more", sub: "Ride the wave", effects: {}, action: "viral", result: "I leaned into the attention." },
      { label: "Log off", sub: "This is too much", effects: { smarts: 1, happiness: 1 }, result: "I logged off and let the video do its thing." }
    ]
  },
  {
    id: "endorsement", title: "Brand Partnership", icon: "🤝", min: 20, max: 70, weight: 3, cond: p => p.fame >= 45,
    text: "A brand wants to pay me to promote their product. The money is good, but I've never been a sellout.",
    choices: [
      { label: "Take the deal", sub: "+$25,000", effects: { money: 25000, fame: 5, karma: -3 }, result: "I took the deal and posted the ad. The check cleared." },
      { label: "Decline", sub: "Protect your reputation", effects: { karma: 3, happiness: 2 }, result: "I declined. Some things matter more than money." }
    ]
  },
  {
    id: "scandal", title: "Public Scandal", icon: "📰", min: 20, max: 85, weight: 3, cond: p => p.fame >= 40,
    text: "A story about me is trending, and it's not flattering. The internet has opinions.",
    choices: [
      { label: "Apologize publicly", sub: "Own your mistakes", effects: { fame: -5, happiness: -5, karma: 5 }, result: "I apologized and tried to move on." },
      { label: "Deny everything", sub: "Never back down", effects: { fame: -10, happiness: -2, karma: -3 }, result: "I denied everything. The story got bigger." }
    ]
  },
  {
    id: "stalker", title: "A Strange Encounter", icon: "👤", min: 20, max: 80, weight: 2, cond: p => p.fame >= 60,
    text: "A fan has been showing up outside my house and sending increasingly personal messages.",
    choices: [
      { label: "Call the police", sub: "-$500", requires: { money: 500 }, effects: { money: -500, happiness: 2 }, result: "I called the police and filed a report. I felt safer." },
      { label: "Ignore it", sub: "Don't feed the attention", effects: { happiness: -5 }, result: "I ignored it and hoped they'd go away." }
    ]
  },
  {
    id: "natural_disaster", title: "A Storm Hits", icon: "🌪️", min: 15, max: 95, weight: 2,
    text: "A severe storm tore through my neighborhood. Trees are down and several homes are damaged.",
    choices: [
      { label: "Help your neighbors", sub: "Be there for your community", effects: { karma: 10, happiness: 3, health: -2 }, result: "I spent the day helping my neighbors clean up." },
      { label: "Stay inside", sub: "Stay safe", effects: { happiness: -2 }, result: "I stayed inside and watched the storm from the window." }
    ]
  },
  {
    id: "identity_theft", title: "Identity Theft", icon: "🕵️", min: 25, max: 80, weight: 3,
    text: "Someone opened credit cards in my name and racked up thousands in charges.",
    choices: [
      { label: "Report it", sub: "-$500", requires: { money: 500 }, effects: { money: -500, happiness: -2 }, action: "recover_money", result: "I reported the fraud and started the recovery process." },
      { label: "Ignore it", sub: "Maybe it'll go away", effects: { money: -3000, happiness: -5 }, result: "I ignored it. The charges kept coming." }
    ]
  },
  {
    id: "empty_nest", title: "The Empty Nest", icon: "🏠", min: 45, max: 70, weight: 3,
    cond: p => p.relationships.some(r => r.type === "child" && r.age >= 18 && r.alive !== false),
    text: "My child is moving out. The house feels too quiet already.",
    choices: [
      { label: "Help them move", sub: "-$5,000", requires: { money: 5000 }, effects: { money: -5000, happiness: 2, rel: { type: "child", amount: 10 } }, result: "I helped my child move into their first place. I cried on the drive home." },
      { label: "Let them go", sub: "They need to fly", effects: { happiness: -3, rel: { type: "child", amount: 3 } }, result: "I let them go. It's what parents do." }
    ]
  },
  {
    id: "free_tickets", title: "Free Concert Tickets", icon: "🎫", min: 16, max: 70, weight: 5,
    text: "A friend has two extra tickets to a huge concert tonight. They're free if I can make it.",
    choices: [
      { label: "Go", sub: "A night to remember", effects: { happiness: 6, health: -1 }, result: "I went to the concert and had the time of my life." },
      { label: "Sell them", sub: "+$100", effects: { money: 100, happiness: -1 }, result: "I sold the tickets and stayed home." }
    ]
  },
  {
    id: "road_trip", title: "Spontaneous Road Trip", icon: "🚗", min: 18, max: 50, weight: 5,
    text: "My friends are piling into a car and driving to the coast tonight. No plans, no hotel, just adventure.",
    choices: [
      { label: "Go", sub: "-$800", requires: { money: 800 }, effects: { money: -800, happiness: 8, health: -1 }, result: "I went on the road trip. We slept in the car and watched the sunrise." },
      { label: "Stay", sub: "You have responsibilities", effects: { happiness: -2 }, result: "I stayed home. Responsible, but a little boring." }
    ]
  },
  {
    id: "meditation_retreat", title: "A Quiet Retreat", icon: "🧘", min: 25, max: 80, weight: 4,
    text: "A meditation retreat is offering a weekend of silence and stillness. My phone would have to stay behind.",
    choices: [
      { label: "Go", sub: "-$500", requires: { money: 500 }, effects: { money: -500, happiness: 8, health: 2 }, result: "I went on the retreat and came back feeling lighter." },
      { label: "Stay connected", sub: "Not for you", effects: { happiness: 1 }, result: "I stayed home. I checked my phone immediately." }
    ]
  },
  {
    id: "volunteer_offer", title: "A Chance to Help", icon: "🤲", min: 14, max: 90, weight: 5,
    text: "A local shelter is looking for volunteers this weekend. They're short-handed and could really use the help.",
    choices: [
      { label: "Volunteer", sub: "Give your time", effects: { karma: 8, happiness: 4, health: -1 }, result: "I spent the weekend volunteering at the shelter." },
      { label: "Skip it", sub: "You're busy", effects: { karma: -2 }, result: "I skipped it. There's always next weekend." }
    ]
  },
  {
    id: "business_offer", title: "A Business Idea", icon: "💡", min: 22, max: 60, weight: 3, cond: p => p.money >= 20000,
    text: "I have an idea for a small business that could actually work. It would take most of my savings to get started.",
    choices: [
      { label: "Go for it", sub: "-$20,000", requires: { money: 20000 }, effects: { money: -20000, happiness: 6 }, action: "business", result: "I took the leap and started my business." },
      { label: "Keep the idea", sub: "Maybe someday", effects: { happiness: -1, smarts: 1 }, result: "I wrote the idea down and went back to my day job." }
    ]
  },
  {
    id: "president_run", title: "A Historic Campaign", icon: "🇺🇸", min: 35, max: 75, weight: 1,
    cond: p => p.fame >= 60 && p.money >= 100000,
    text: "Party leaders are asking me to run for the highest office in the land. The whole world would be watching.",
    choices: [
      { label: "Run for president", sub: "-$50,000", requires: { money: 50000 }, effects: { money: -50000, fame: 15 }, action: "president_race", result: "I announced my candidacy for president." },
      { label: "Decline", sub: "Too much pressure", effects: { happiness: 2 }, result: "I declined. Some doors are better left closed." }
    ]
  },
  {
    id: "retirement_offer", title: "The Golden Years", icon: "🌅", min: 64, max: 70, weight: 1, cond: p => !!p.job,
    text: "I've been working for decades. Maybe it's finally time to retire and enjoy the rest of my life.",
    choices: [
      { label: "Retire", sub: "Start your next chapter", effects: { happiness: 10 }, action: "retire", result: "I retired. No more alarm clocks." },
      { label: "Keep working", sub: "You're not done yet", effects: { happiness: -2, health: -1 }, result: "I decided to keep working for a while longer." }
    ]
  }
];
