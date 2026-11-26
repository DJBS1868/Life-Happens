export const ACTIVITY_CATEGORIES = [
  { id: "health", name: "Health & Fitness", icon: "💪", color: "#e8f8ef" },
  { id: "mind", name: "Mind & Skills", icon: "🧠", color: "#eaf1ff" },
  { id: "fun", name: "Fun & Leisure", icon: "🎉", color: "#fff2e3" },
  { id: "social", name: "Social & Love", icon: "❤️", color: "#ffe9f0" },
  { id: "money", name: "Money & Career", icon: "💰", color: "#fff8dc" },
  { id: "risky", name: "Risky Business", icon: "🎲", color: "#f3e9ff" },
  { id: "life", name: "Life & Growth", icon: "🌱", color: "#e8f7f7" }
];

export const ACTIVITIES = [
  { id: "gym", name: "Gym", icon: "🏋️", category: "health", cost: 20, minAge: 12, effects: { health: 3, looks: 1, happiness: 1 }, desc: "Get a solid workout in.", result: "I hit the gym and felt the burn." },
  { id: "doctor", name: "See a Doctor", icon: "🩺", category: "health", cost: 150, minAge: 0, effects: { health: 6, happiness: 1 }, desc: "Get a checkup and patch yourself up.", result: "The doctor gave me a clean bill of health." },
  { id: "therapy", name: "Therapy", icon: "🛋️", category: "health", cost: 200, minAge: 12, effects: { happiness: 8 }, desc: "Talk through what is on your mind.", result: "I talked through my feelings with a therapist. It helped." },
  { id: "spa", name: "Spa Day", icon: "💆", category: "health", cost: 120, minAge: 16, effects: { looks: 3, happiness: 3, health: 1 }, desc: "Relax, unwind, and glow.", result: "I spent the day at the spa and came out feeling brand new." },
  { id: "salon", name: "Salon", icon: "💇", category: "health", cost: 80, minAge: 5, effects: { looks: 2, happiness: 1 }, desc: "A fresh cut and a confidence boost.", result: "I got a fresh new look at the salon." },
  { id: "dentist", name: "Dentist", icon: "🦷", category: "health", cost: 100, minAge: 3, effects: { looks: 2, health: 1 }, desc: "Keep that smile in shape.", result: "The dentist said my teeth looked great." },
  { id: "yoga", name: "Yoga Class", icon: "🧘", category: "health", cost: 30, minAge: 10, effects: { health: 2, happiness: 2 }, desc: "Stretch, breathe, and center yourself.", result: "I flowed through a yoga class and found my center." },
  { id: "walk", name: "Long Walk", icon: "🚶", category: "health", cost: 0, minAge: 3, effects: { health: 1, happiness: 1 }, desc: "Clear your head with some fresh air.", result: "I took a long walk and cleared my head." },
  { id: "meditate", name: "Meditate", icon: "🕯️", category: "health", cost: 0, minAge: 8, effects: { happiness: 3, health: 1 }, desc: "Find a little inner calm.", result: "I meditated and found some inner calm." },

  { id: "library", name: "Library", icon: "📚", category: "mind", cost: 0, minAge: 5, effects: { smarts: 3, happiness: 1 }, desc: "Spend the afternoon with a good book.", result: "I spent the afternoon at the library." },
  { id: "course", name: "Online Course", icon: "🖥️", category: "mind", cost: 500, minAge: 16, effects: { smarts: 5, happiness: 1 }, desc: "Learn a new skill from home.", result: "I finished an online course and learned something new." },
  { id: "read", name: "Read a Book", icon: "📖", category: "mind", cost: 0, minAge: 5, effects: { smarts: 1, happiness: 2 }, desc: "Get lost in a story.", result: "I curled up with a good book." },
  { id: "museum", name: "Museum", icon: "🏛️", category: "mind", cost: 40, minAge: 6, effects: { smarts: 2, happiness: 2 }, desc: "Feed your curiosity.", result: "I wandered through a museum and learned something new." },
  { id: "write", name: "Write", icon: "✍️", category: "mind", cost: 0, minAge: 10, effects: { smarts: 1, happiness: 2 }, desc: "Put your thoughts on paper.", result: "I spent the evening writing." },

  { id: "party", name: "Go to a Party", icon: "🎉", category: "fun", cost: 100, minAge: 14, effects: { happiness: 6, health: -2 }, desc: "Dance, mingle, and stay out late.", result: "I went to a party and had a great time.", special: "party" },
  { id: "club", name: "Nightclub", icon: "🪩", category: "fun", cost: 80, minAge: 18, effects: { happiness: 5, health: -1 }, desc: "Lights, music, and a late night.", result: "I danced until the club closed." },
  { id: "games", name: "Video Games", icon: "🎮", category: "fun", cost: 0, minAge: 6, effects: { happiness: 3, health: -1 }, desc: "Lose track of time in another world.", result: "I spent the day gaming. Worth it." },
  { id: "concert", name: "Concert", icon: "🎤", category: "fun", cost: 150, minAge: 14, effects: { happiness: 8 }, desc: "See your favorite artist live.", result: "I saw a live concert and sang every word." },
  { id: "dining", name: "Dinner Out", icon: "🍽️", category: "fun", cost: 60, minAge: 8, effects: { happiness: 4, health: -1 }, desc: "Treat yourself to a nice meal.", result: "I had a delicious dinner out." },
  { id: "shopping", name: "Shopping Spree", icon: "🛍️", category: "fun", cost: 300, minAge: 12, effects: { happiness: 5, looks: 1 }, desc: "Retail therapy is real therapy.", result: "I went on a shopping spree and treated myself." },
  { id: "themepark", name: "Theme Park", icon: "🎢", category: "fun", cost: 100, minAge: 6, effects: { happiness: 7, health: -1 }, desc: "Roller coasters and cotton candy.", result: "I spent the day at a theme park." },
  { id: "vacation", name: "Vacation", icon: "✈️", category: "fun", cost: 2000, minAge: 16, effects: { happiness: 12, health: 2 }, desc: "Get away for a while.", result: "I went on a much-needed vacation.", special: "vacation" },
  { id: "staycation", name: "Staycation", icon: "🏠", category: "fun", cost: 100, minAge: 16, effects: { happiness: 5, health: 1 }, desc: "Relax at home without the airfare.", result: "I took a relaxing staycation." },

  { id: "date", name: "Go on a Date", icon: "💕", category: "social", cost: 80, minAge: 18, effects: { happiness: 4 }, desc: "See where the night takes you.", result: "I went on a date.", special: "date" },
  { id: "datingapp", name: "Dating App", icon: "📱", category: "social", cost: 20, minAge: 18, effects: { happiness: 2 }, desc: "Swipe and see who matches.", result: "I spent some time swiping on a dating app.", special: "date" },
  { id: "social", name: "Social Media", icon: "💬", category: "social", cost: 0, minAge: 12, effects: { happiness: 2, fame: 1 }, desc: "Post, scroll, and chase the algorithm.", result: "I posted online and scrolled for way too long.", special: "social" },
  { id: "volunteer", name: "Volunteer", icon: "🤝", category: "social", cost: 0, minAge: 12, effects: { happiness: 3, karma: 5 }, desc: "Give a little back.", result: "I volunteered and helped people in my community." },
  { id: "pray", name: "Pray", icon: "🙏", category: "social", cost: 0, minAge: 6, effects: { happiness: 2, karma: 2 }, desc: "Take a quiet moment.", result: "I took a quiet moment to pray and reflect." },

  { id: "gamble", name: "Casino", icon: "🎰", category: "money", cost: 100, minAge: 18, effects: { happiness: 2 }, desc: "Try your luck at the tables.", result: "I hit the casino.", special: "gamble" },
  { id: "lottery", name: "Lottery Ticket", icon: "🎟️", category: "money", cost: 10, minAge: 18, effects: {}, desc: "Somebody has to win.", result: "I bought a lottery ticket.", special: "lottery" },
  { id: "invest", name: "Invest", icon: "📈", category: "money", cost: 0, minAge: 18, effects: {}, desc: "Put your money to work.", result: "I reviewed my investments.", special: "invest" },
  { id: "openshop", name: "Open a Business", icon: "🏪", category: "money", cost: 20000, minAge: 22, effects: { happiness: 6 }, desc: "Be your own boss.", result: "I opened a small business.", special: "business" },

  { id: "skydive", name: "Skydiving", icon: "🪂", category: "risky", cost: 400, minAge: 18, effects: { happiness: 10, health: -2 }, desc: "Jump out of a perfectly good plane.", result: "I went skydiving and screamed the whole way down.", special: "risk" },
  { id: "shoplift", name: "Shoplift", icon: "🛍️", category: "risky", cost: 0, minAge: 12, effects: { happiness: 2 }, desc: "A five-finger discount. Risky.", result: "I tried to shoplift.", special: "crime", crime: { name: "shoplifting", max: 400 } },
  { id: "pickpocket", name: "Pickpocket", icon: "🫳", category: "risky", cost: 0, minAge: 12, effects: { happiness: 1 }, desc: "Lift a wallet in a crowd.", result: "I tried to pickpocket someone.", special: "crime", crime: { name: "pickpocketing", max: 900 } },
  { id: "robbery", name: "Rob a Store", icon: "🏦", category: "risky", cost: 0, minAge: 18, effects: { happiness: 3 }, desc: "A very bad idea with a big payout.", result: "I tried to rob a store.", special: "crime", crime: { name: "armed robbery", max: 12000, prison: 4 } },
  { id: "drugs", name: "Sell Drugs", icon: "💊", category: "risky", cost: 0, minAge: 16, effects: { happiness: 2, health: -2 }, desc: "Fast money. Serious consequences.", result: "I got involved in the drug trade.", special: "crime", crime: { name: "drug dealing", max: 6000, prison: 3 } },
  { id: "streetrace", name: "Street Race", icon: "🏁", category: "risky", cost: 200, minAge: 18, effects: { happiness: 5, health: -3 }, desc: "Race for cash and bragging rights.", result: "I entered an illegal street race.", special: "crime", crime: { name: "street racing", max: 3000 } },

  { id: "audition", name: "Audition", icon: "🎬", category: "life", cost: 0, minAge: 16, effects: {}, desc: "Chase a shot at fame.", result: "I went to an audition.", special: "audition" },
  { id: "openmic", name: "Open Mic Night", icon: "🎙️", category: "life", cost: 0, minAge: 16, effects: { happiness: 3, fame: 2 }, desc: "Get on stage and perform.", result: "I performed at an open mic night." },
  { id: "adoptpet", name: "Adopt a Pet", icon: "🐶", category: "life", cost: 500, minAge: 8, effects: { happiness: 8 }, desc: "Bring home a new best friend.", result: "I adopted a pet.", special: "pet" },
  { id: "tattoo", name: "Get a Tattoo", icon: "🖋️", category: "life", cost: 200, minAge: 18, effects: { happiness: 2, looks: 1 }, desc: "Permanent art. No regrets.", result: "I got a new tattoo." },
  { id: "surgery", name: "Plastic Surgery", icon: "💉", category: "life", cost: 8000, minAge: 18, effects: { looks: 8, health: -2 }, desc: "A dramatic change. Some risk.", result: "I went under the knife for plastic surgery.", special: "surgery" },
  { id: "play", name: "Play with Toys", icon: "🧸", category: "life", cost: 0, minAge: 1, maxAge: 10, effects: { happiness: 3, smarts: 1 }, desc: "Use your imagination.", result: "I spent the day playing with my toys." },
  { id: "nap", name: "Take a Nap", icon: "😴", category: "life", cost: 0, minAge: 0, maxAge: 5, effects: { health: 1, happiness: 1 }, desc: "Growing is hard work.", result: "I took a nice long nap." }
];

export const ACTIVITY_MAP = Object.fromEntries(ACTIVITIES.map(a => [a.id, a]));
