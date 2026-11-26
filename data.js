/* LifeHappens — game content. All names, events, and copy are original. */
(function () {
  "use strict";

  const COUNTRIES = {
    US: {
      name: "United States", flag: "🇺🇸", symbol: "$", demonym: "American",
      cities: ["Austin", "Brooklyn", "Chicago", "Denver", "Nashville", "Portland", "San Diego", "Savannah"],
      male: ["James", "Mateo", "Ethan", "Malik", "Noah", "Diego", "Liam", "Jordan"],
      female: ["Ava", "Maya", "Sofia", "Zoe", "Nora", "Imani", "Lily", "Camila"],
      last: ["Smith", "Johnson", "Garcia", "Williams", "Chen", "Patel", "Brooks", "Rivera", "Nguyen", "Bennett"]
    },
    UK: {
      name: "United Kingdom", flag: "🇬🇧", symbol: "£", demonym: "British",
      cities: ["London", "Manchester", "Bristol", "Edinburgh", "Leeds", "Cardiff", "Glasgow", "Brighton"],
      male: ["Oliver", "Harry", "Jack", "George", "Leo", "Arjun", "Theo", "Callum"],
      female: ["Amelia", "Isla", "Freya", "Poppy", "Aisha", "Maeve", "Ruby", "Florence"],
      last: ["Taylor", "Brown", "Wilson", "Evans", "Khan", "Murphy", "Clarke", "Hughes", "Wright", "Patel"]
    },
    CA: {
      name: "Canada", flag: "🇨🇦", symbol: "C$", demonym: "Canadian",
      cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Halifax", "Ottawa", "Winnipeg", "Victoria"],
      male: ["Liam", "Noah", "Lucas", "Owen", "Elias", "Arjun", "Félix", "Cameron"],
      female: ["Olivia", "Emma", "Chloé", "Mila", "Avery", "Priya", "Nora", "Sadie"],
      last: ["Tremblay", "Martin", "Roy", "Wilson", "Singh", "MacLeod", "Gagnon", "Lee", "Bouchard", "Campbell"]
    },
    AU: {
      name: "Australia", flag: "🇦🇺", symbol: "A$", demonym: "Australian",
      cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Hobart", "Darwin", "Newcastle"],
      male: ["Oliver", "Jack", "Noah", "Lachlan", "Cooper", "Ravi", "Finn", "Harrison"],
      female: ["Charlotte", "Matilda", "Isla", "Mia", "Zara", "Ruby", "Indie", "Grace"],
      last: ["Wilson", "Nguyen", "Kelly", "Singh", "Brown", "Taylor", "Walker", "Ryan", "Patel", "Mitchell"]
    },
    IN: {
      name: "India", flag: "🇮🇳", symbol: "₹", demonym: "Indian",
      cities: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Pune", "Kolkata", "Jaipur", "Chennai"],
      male: ["Aarav", "Vihaan", "Rohan", "Arjun", "Kabir", "Aditya", "Ishaan", "Dev"],
      female: ["Aanya", "Diya", "Anika", "Meera", "Saanvi", "Priya", "Isha", "Kavya"],
      last: ["Sharma", "Patel", "Singh", "Rao", "Mehta", "Iyer", "Kapoor", "Nair", "Gupta", "Joshi"]
    },
    BR: {
      name: "Brazil", flag: "🇧🇷", symbol: "R$", demonym: "Brazilian",
      cities: ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Salvador", "Curitiba", "Recife", "Fortaleza", "Porto Alegre"],
      male: ["Gabriel", "Lucas", "Pedro", "Rafael", "Thiago", "João", "Mateus", "Caio"],
      female: ["Ana", "Beatriz", "Camila", "Larissa", "Mariana", "Isabela", "Luiza", "Clara"],
      last: ["Silva", "Santos", "Oliveira", "Souza", "Costa", "Pereira", "Almeida", "Lima", "Ferreira", "Ribeiro"]
    },
    JP: {
      name: "Japan", flag: "🇯🇵", symbol: "¥", demonym: "Japanese",
      cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Nagoya", "Sapporo", "Fukuoka", "Kobe"],
      male: ["Haruto", "Ren", "Sota", "Yuto", "Riku", "Kaito", "Akira", "Takumi"],
      female: ["Yui", "Aoi", "Hina", "Sakura", "Mio", "Rin", "Akari", "Hana"],
      last: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Kato"]
    },
    DE: {
      name: "Germany", flag: "🇩🇪", symbol: "€", demonym: "German",
      cities: ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Leipzig", "Dresden"],
      male: ["Lukas", "Leon", "Felix", "Jonas", "Maximilian", "Emil", "Noah", "Oskar"],
      female: ["Mia", "Emma", "Hannah", "Lena", "Sophie", "Lea", "Clara", "Amelie"],
      last: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Hoffmann", "Schulz"]
    },
    MX: {
      name: "Mexico", flag: "🇲🇽", symbol: "MX$", demonym: "Mexican",
      cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Mérida", "Tijuana", "Oaxaca", "Querétaro"],
      male: ["Santiago", "Mateo", "Diego", "Emiliano", "Sebastián", "Luis", "Alejandro", "Iker"],
      female: ["Valentina", "Camila", "Ximena", "Renata", "Sofía", "Regina", "Lucía", "Mariana"],
      last: ["Hernández", "García", "Martínez", "López", "González", "Pérez", "Sánchez", "Ramírez", "Torres", "Flores"]
    },
    NG: {
      name: "Nigeria", flag: "🇳🇬", symbol: "₦", demonym: "Nigerian",
      cities: ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Enugu", "Benin City", "Kaduna"],
      male: ["Chinedu", "Tunde", "Emeka", "Ayodele", "Ibrahim", "Kelechi", "Femi", "Uche"],
      female: ["Amara", "Zainab", "Ifeoma", "Temi", "Ngozi", "Aisha", "Ada", "Funke"],
      last: ["Okafor", "Adeyemi", "Balogun", "Eze", "Okonkwo", "Ibrahim", "Ogunleye", "Nwosu", "Adebayo", "Chukwu"]
    }
  };

  const COUNTRY_ORDER = ["US", "UK", "CA", "AU", "IN", "BR", "JP", "DE", "MX", "NG"];

  const STAGES = [
    { max: 2, name: "Baby", avatar: "👶" },
    { max: 4, name: "Toddler", avatar: "🧒" },
    { max: 12, name: "Child", avatar: "🧒" },
    { max: 17, name: "Teen", avatar: "🧑" },
    { max: 24, name: "Young Adult", avatar: "🧑" },
    { max: 39, name: "Adult", avatar: "🧑" },
    { max: 64, name: "Middle-Aged", avatar: "🧓" },
    { max: 200, name: "Senior", avatar: "🧓" }
  ];

  const GENDER_AVATARS = {
    Female: ["👧", "👩", "👩‍🦰", "👩‍🦱", "👩‍🦳"],
    Male: ["👦", "👨", "👨‍🦰", "👨‍🦱", "👨‍🦳"],
    "Non-binary": ["🧒", "🧑", "🧑‍🎤", "🧑‍🎨", "🧑‍🚀"]
  };

  const ACTIVITIES = [
    { id: "park", category: "Fun", icon: "🌳", title: "Play outside", desc: "Fresh air, muddy shoes, and no plans.", cost: 0, effects: { happiness: 6, health: 1 }, minAge: 0 },
    { id: "storytime", category: "Growth", icon: "📖", title: "Story time", desc: "A story, a snack, and someone you love.", cost: 0, effects: { smarts: 3, happiness: 3 }, minAge: 0 },
    { id: "gym", category: "Wellness", icon: "🏋️", title: "Hit the gym", desc: "Sweat it out and feel stronger.", cost: 25, effects: { health: 5, looks: 3, happiness: 1 }, minAge: 12 },
    { id: "walk", category: "Wellness", icon: "🚶", title: "Go for a walk", desc: "A little movement, a little headspace.", cost: 0, effects: { health: 2, happiness: 2 }, minAge: 5 },
    { id: "doctor", category: "Wellness", icon: "🩺", title: "See a doctor", desc: "A checkup for whatever is bothering you.", cost: 90, effects: { health: 10 }, minAge: 0 },
    { id: "meditate", category: "Wellness", icon: "🧘", title: "Meditate", desc: "Slow down. Breathe. Reset.", cost: 0, effects: { happiness: 6, health: 2 }, minAge: 5 },
    { id: "salon", category: "Wellness", icon: "💇", title: "Fresh new look", desc: "A haircut and a little confidence.", cost: 65, effects: { looks: 7, happiness: 3 }, minAge: 6 },
    { id: "spa", category: "Wellness", icon: "🛀", title: "Spa day", desc: "An entire afternoon of nothing.", cost: 160, effects: { happiness: 7, health: 3, looks: 2 }, minAge: 18 },

    { id: "party", category: "Fun", icon: "🎉", title: "Go to a party", desc: "Music, snacks, and questionable decisions.", cost: 50, effects: { happiness: 8, health: -2, social: 2 }, minAge: 14 },
    { id: "vacation", category: "Fun", icon: "🏖️", title: "Take a vacation", desc: "A few days somewhere with better weather.", cost: 750, effects: { happiness: 14, health: 4 }, minAge: 0 },
    { id: "concert", category: "Fun", icon: "🎤", title: "See a concert", desc: "Loud music. Great night.", cost: 120, effects: { happiness: 9, social: 2 }, minAge: 10 },
    { id: "gaming", category: "Fun", icon: "🎮", title: "Game night", desc: "One more round. Probably.", cost: 20, effects: { happiness: 5, health: -1 }, minAge: 4 },
    { id: "restaurant", category: "Fun", icon: "🍜", title: "Eat somewhere good", desc: "A proper meal you did not have to cook.", cost: 45, effects: { happiness: 5, health: 1 }, minAge: 0 },

    { id: "library", category: "Growth", icon: "📚", title: "Read at the library", desc: "Learn something new for free.", cost: 0, effects: { smarts: 6 }, minAge: 5 },
    { id: "volunteer", category: "Growth", icon: "🤝", title: "Volunteer", desc: "Give a little time to something bigger.", cost: 0, effects: { happiness: 5, smarts: 2, social: 2 }, minAge: 10 },
    { id: "openmic", category: "Growth", icon: "🎙️", title: "Open mic night", desc: "Get on stage and see what happens.", cost: 0, effects: { looks: 3, happiness: 5, social: 2 }, minAge: 16 },
    { id: "language", category: "Growth", icon: "🗣️", title: "Learn a language", desc: "A few lessons and a lot of flashcards.", cost: 150, effects: { smarts: 7, happiness: 2 }, minAge: 8 },

    { id: "hustle", category: "Money", icon: "💼", title: "Work a side hustle", desc: "Trade a little energy for extra cash.", cost: 0, effects: { money: 320, health: -2 }, minAge: 14 },
    { id: "lottery", category: "Money", icon: "🎟️", title: "Buy a scratch-off", desc: "Tiny cost. Very tiny chance.", cost: 5, effects: {}, minAge: 18 },
    { id: "casino", category: "Money", icon: "🎰", title: "Try the casino", desc: "The house usually wins.", cost: 100, effects: {}, minAge: 18 }
  ];

  const JOBS = [
    { id: "barista", title: "Barista", icon: "☕", salary: 27000, education: "none", minAge: 16, smarts: 0, looks: 0, companies: ["Northstar Coffee", "Little Fern Café", "Steam & Stone"] },
    { id: "retail", title: "Retail Associate", icon: "🛍️", salary: 29500, education: "none", minAge: 16, smarts: 0, looks: 0, companies: ["Harbor & Co.", "The Corner Store", "Brightline Goods"] },
    { id: "delivery", title: "Delivery Driver", icon: "🚲", salary: 32500, education: "none", minAge: 18, smarts: 0, looks: 0, companies: ["Dash Local", "City Courier", "Parcel Loop"] },
    { id: "reception", title: "Receptionist", icon: "☎️", salary: 35000, education: "highschool", minAge: 18, smarts: 35, looks: 0, companies: ["Pinewood Clinic", "Lakeview Offices", "Meridian Dental"] },
    { id: "office", title: "Office Assistant", icon: "🗂️", salary: 39000, education: "highschool", minAge: 18, smarts: 45, looks: 0, companies: ["Juniper Finance", "Civic Works", "North & Pine"] },
    { id: "influencer", title: "Content Creator", icon: "📱", salary: 44000, education: "none", minAge: 18, smarts: 30, looks: 65, companies: ["Loop Studio", "Daily Bloom", "The Feed Co."] },
    { id: "chef", title: "Line Cook", icon: "🍳", salary: 46000, education: "trade", minAge: 18, smarts: 30, looks: 0, companies: ["Copper Kitchen", "Salt & Ember", "The Blue Plate"] },
    { id: "teacher", title: "Teacher", icon: "🍎", salary: 51000, education: "university", minAge: 21, smarts: 60, looks: 0, companies: ["Civic School District", "Maple Grove Academy", "Riverside Prep"] },
    { id: "electrician", title: "Electrician", icon: "🔌", salary: 57000, education: "trade", minAge: 19, smarts: 45, looks: 0, companies: ["Volt & Sons", "Brightwire", "CurrentWorks"] },
    { id: "accountant", title: "Accountant", icon: "📊", salary: 63000, education: "university", minAge: 21, smarts: 65, looks: 0, companies: ["Juniper Finance", "Ledger & Co.", "Northstar Audit"] },
    { id: "nurse", title: "Nurse", icon: "💉", salary: 69000, education: "university", minAge: 21, smarts: 65, looks: 0, companies: ["Atlas Health", "Pinewood Clinic", "Mercy General"] },
    { id: "marketing", title: "Marketing Manager", icon: "📣", salary: 76000, education: "university", minAge: 24, smarts: 60, looks: 45, companies: ["Orbit Media", "Bloom & Co.", "Signal House"] },
    { id: "engineer", title: "Software Engineer", icon: "💻", salary: 98000, education: "university", minAge: 21, smarts: 75, looks: 0, companies: ["Lumen Labs", "Cloud Nine", "Kite Systems"] },
    { id: "pilot", title: "Commercial Pilot", icon: "✈️", salary: 104000, education: "trade", minAge: 23, smarts: 65, looks: 45, companies: ["Bluebird Air", "Skyline Airways", "Northwind"] },
    { id: "lawyer", title: "Lawyer", icon: "⚖️", salary: 126000, education: "grad", minAge: 26, smarts: 75, looks: 0, companies: ["Hale & Mercer", "Bishop Legal", "The Justice Group"] },
    { id: "doctor", title: "Doctor", icon: "🩻", salary: 188000, education: "grad", minAge: 27, smarts: 82, looks: 0, companies: ["Atlas Health", "Mercy General", "Pinewood Clinic"] }
  ];

  const EDUCATION = [
    { id: "trade", title: "Trade School", icon: "🔧", years: 1, tuition: 8000, level: "trade", desc: "One year of hands-on training.", requires: "highschool" },
    { id: "university", title: "University", icon: "🎓", years: 4, tuition: 24000, level: "university", desc: "Four years, big possibilities.", requires: "highschool" },
    { id: "grad", title: "Graduate School", icon: "📜", years: 2, tuition: 30000, level: "grad", desc: "For law, medicine, and big dreams.", requires: "university" }
  ];

  const EDUCATION_LABELS = {
    none: "No diploma",
    highschool: "High school",
    trade: "Trade certificate",
    university: "University degree",
    grad: "Graduate degree"
  };

  const ASSETS = [
    { id: "console", name: "Game Console", icon: "🎮", price: 450, upkeep: 0, happiness: 5, minAge: 8, desc: "For the quiet evenings." },
    { id: "bike", name: "Bicycle", icon: "🚲", price: 600, upkeep: 60, happiness: 4, health: 2, minAge: 8, desc: "Fresh air and sore legs." },
    { id: "phone", name: "Nice Phone", icon: "📱", price: 900, upkeep: 0, happiness: 4, minAge: 12, desc: "A camera, a map, and a distraction." },
    { id: "pet", name: "Rescue Dog", icon: "🐶", price: 800, upkeep: 700, happiness: 12, health: 2, minAge: 12, desc: "A best friend with four paws." },
    { id: "car", name: "Used Car", icon: "🚗", price: 4200, upkeep: 900, happiness: 7, minAge: 16, desc: "It runs. Mostly." },
    { id: "condo", name: "Starter Condo", icon: "🏢", price: 46000, upkeep: 1800, happiness: 13, minAge: 18, desc: "A place that is actually yours." },
    { id: "business", name: "Small Business", icon: "🏪", price: 28000, upkeep: 1200, happiness: 10, income: 6000, minAge: 22, desc: "A little venture with a lot of heart." },
    { id: "house", name: "Family House", icon: "🏡", price: 165000, upkeep: 4200, happiness: 20, minAge: 24, desc: "Room to grow into." },
    { id: "boat", name: "Sailboat", icon: "⛵", price: 88000, upkeep: 3600, happiness: 17, minAge: 28, desc: "Mostly an excuse to be outside." },
    { id: "watch", name: "Luxury Watch", icon: "⌚", price: 12000, upkeep: 100, happiness: 9, looks: 3, minAge: 21, desc: "Small, shiny, and very expensive." }
  ];

  const ACHIEVEMENTS = [
    { id: "first_steps", icon: "👟", name: "First Steps", desc: "Reach your first birthday." },
    { id: "student", icon: "🎒", name: "Back to School", desc: "Start school." },
    { id: "graduate", icon: "🎓", name: "Cap and Gown", desc: "Graduate from a program." },
    { id: "first_job", icon: "💼", name: "First Paycheck", desc: "Get your first job." },
    { id: "independent", icon: "🔑", name: "Your Own Place", desc: "Move out on your own." },
    { id: "in_love", icon: "💞", name: "Head Over Heels", desc: "Find a partner." },
    { id: "married", icon: "💍", name: "The Big Day", desc: "Get married." },
    { id: "parent", icon: "🍼", name: "New Chapter", desc: "Welcome a child." },
    { id: "homeowner", icon: "🏡", name: "Home Sweet Home", desc: "Buy a home." },
    { id: "wheels", icon: "🚗", name: "On the Road", desc: "Buy a car." },
    { id: "six_figures", icon: "💵", name: "Six Figures", desc: "Earn $100,000 in a year." },
    { id: "millionaire", icon: "🤑", name: "Seven Digits", desc: "Reach a net worth of $1,000,000." },
    { id: "healthy", icon: "💪", name: "Feeling Great", desc: "Reach 95 health." },
    { id: "genius", icon: "🧠", name: "Big Brain", desc: "Reach 95 smarts." },
    { id: "popular", icon: "🫶", name: "Beloved", desc: "Reach 95 in a relationship." },
    { id: "eighty", icon: "🕰️", name: "The Long Game", desc: "Reach age 80." },
    { id: "centenarian", icon: "🕯️", name: "One Hundred", desc: "Reach age 100." },
    { id: "retired", icon: "🌅", name: "Golden Years", desc: "Retire from working life." }
  ];

  const MILESTONES = {
    1: { icon: "👣", title: "One year old", text: "You took your first wobbly steps and clapped for yourself. The whole room clapped too." },
    2: { icon: "🎂", title: "Two years old", text: "You learned the word “no” and immediately put it to constant use." },
    3: { icon: "🖍️", title: "Three years old", text: "You drew a very round sun on the kitchen wall. Your parents called it art, mostly." },
    4: { icon: "🧩", title: "Four years old", text: "You finished a whole puzzle by yourself and made everyone come look at it." },
    5: { icon: "🎒", title: "First day of school", text: "You started school with a new backpack, a nervous stomach, and a box of crayons." },
    6: { icon: "🦷", title: "Six years old", text: "A loose tooth finally came out. You were extremely proud and a little dramatic about it." },
    7: { icon: "🚲", title: "Seven years old", text: "You learned to ride a bike without training wheels. The scraped knee was worth it." },
    8: { icon: "📖", title: "Eight years old", text: "You found a book series you could not put down and read past bedtime with a flashlight." },
    9: { icon: "🏅", title: "Nine years old", text: "You got a ribbon at field day. It was for participation, but you framed it anyway." },
    10: { icon: "🔭", title: "Double digits", text: "You turned ten and stayed up late looking at the stars, wondering what your life would be like." },
    11: { icon: "🎸", title: "Eleven years old", text: "You discovered a song that felt like it was written exactly for you." },
    12: { icon: "🧑‍🤝‍🧑", title: "Twelve years old", text: "Your friendships got deeper and your secrets got more interesting." },
    13: { icon: "😤", title: "Teenager", text: "You became a teenager. Suddenly every adult seemed to be doing everything wrong." },
    14: { icon: "📱", title: "Fourteen years old", text: "You got a phone. Your screen time report became a family discussion." },
    15: { icon: "🎧", title: "Fifteen years old", text: "You built a playlist for a version of yourself you were still figuring out." },
    16: { icon: "🚦", title: "Sixteen years old", text: "You passed your learner's permit test. The open road felt very far away and very close." },
    17: { icon: "🌙", title: "Seventeen years old", text: "You stayed out late talking about the future. It felt enormous and possible." },
    18: { icon: "🎓", title: "High school graduate", text: "You finished high school. The next chapter was blank, and that was the scary, wonderful part." },
    21: { icon: "🥂", title: "Twenty-one", text: "You reached twenty-one. A small toast felt like a big milestone." },
    30: { icon: "🎈", title: "Thirty", text: "You turned thirty. Some things made more sense. Plenty still did not." },
    40: { icon: "🪞", title: "Forty", text: "You turned forty and started noticing how fast the years moved when you were not looking." },
    50: { icon: "🌻", title: "Fifty", text: "You turned fifty. You had opinions now, and you were not afraid to share them." },
    65: { icon: "🕰️", title: "Retirement age", text: "You reached retirement age. The idea of slowing down was both strange and appealing." },
    80: { icon: "🕊️", title: "Eighty", text: "You turned eighty. Your life had become a collection of stories you could tell in any order." }
  };

  const FLAVOR = {
    child: [
      "You spent a rainy afternoon building a blanket fort in the living room.",
      "You traded snacks at lunch and came home with a very questionable collection.",
      "You found a lucky rock and kept it in your pocket for a whole month.",
      "You made up a secret handshake with your best friend.",
      "You helped bake cookies and ate more dough than cookies.",
      "You got a gold star for being kind to a new kid.",
      "You stayed up late reading under the covers with a flashlight.",
      "You built an elaborate cardboard spaceship and refused to clean it up.",
      "You lost a tooth and negotiated with the tooth fairy.",
      "You spent the weekend at a sleepover and barely slept."
    ],
    teen: [
      "You discovered a new band and listened to the same album on repeat.",
      "You and your friends spent an entire afternoon doing absolutely nothing.",
      "You stayed up too late finishing a show and regretted it at school.",
      "You got a surprisingly good grade on a project you finished at the last minute.",
      "You had a long conversation about the future that changed your mind a little.",
      "You tried a new hobby and were terrible at it, but had fun.",
      "You cleaned your room and found something you thought was lost forever.",
      "You went for a walk and ended up at the park watching the sunset.",
      "You got caught in the rain without an umbrella and laughed the whole way home.",
      "You made a new friend in the most unexpected place."
    ],
    adult: [
      "You spent a quiet evening doing nothing in particular, and it was exactly what you needed.",
      "You tried a new recipe. It was edible, which counted as a success.",
      "You cleaned out a closet and found a box of old photos.",
      "You took a long walk and listened to an album you loved years ago.",
      "You called an old friend and talked for two hours.",
      "You finally fixed the thing you had been meaning to fix for months.",
      "You had a lazy Sunday and felt guilty about it for exactly four minutes.",
      "You watched the sunset from your window and felt oddly grateful.",
      "You spent the weekend doing a project that was not on any list.",
      "You treated yourself to a small, unnecessary, perfect thing."
    ],
    senior: [
      "You spent the morning on the porch with a warm drink and nowhere to be.",
      "You told a story you had told before. No one minded.",
      "You found a new bench in the park and decided it was your bench now.",
      "You wrote a letter to someone you had been meaning to write to.",
      "You sorted old photographs and let the memories take their time.",
      "You watched the neighborhood change and remembered how it used to look.",
      "You took a slow walk and stopped to talk to every dog you met.",
      "You had a long lunch with someone who knew you when you were young.",
      "You cleaned the kitchen, then sat down and decided that was enough for today.",
      "You listened to the radio and hummed along to every song."
    ]
  };

  const LIFE_EVENTS = [
    {
      id: "first_word", icon: "🗣️", title: "Your first word", minAge: 1, maxAge: 2,
      text: "The whole family is leaning in, waiting for your first word. You open your mouth.",
      choices: [
        { label: "Say “mama”", effects: { happiness: 3, family: 5 }, result: "Your mother tears up. Your father claims you actually said “dada” first." },
        { label: "Say “dada”", effects: { happiness: 3, family: 5 }, result: "Your father cheers. Your mother insists it was just a noise." },
        { label: "Blow a raspberry", effects: { happiness: 5, family: 1 }, result: "The room erupts. You have discovered comedy." }
      ]
    },
    {
      id: "toy_store", icon: "🧸", title: "The toy aisle", minAge: 3, maxAge: 6,
      text: "You are in the toy aisle. A very large stuffed bear is looking directly at you. Your parents say you can pick one small thing.",
      choices: [
        { label: "Ask for the big bear nicely", effects: { money: -35, happiness: 8, family: 2 }, result: "You carried the bear out like a trophy. It took up half your bed." },
        { label: "Throw a magnificent tantrum", effects: { happiness: 3, family: -5 }, result: "You got the bear. You also got a very long talk in the car." },
        { label: "Choose a puzzle instead", effects: { smarts: 4, family: 3, happiness: 3 }, result: "You picked a 500-piece puzzle. It became a family project for a week." }
      ]
    },
    {
      id: "lost_mall", icon: "🧭", title: "Lost at the mall", minAge: 4, maxAge: 8,
      text: "One second your parent was beside you. The next, the mall is a maze of strangers and shiny floors.",
      choices: [
        { label: "Stay exactly where you are", effects: { smarts: 3, family: 4, happiness: -2 }, result: "A few minutes later, your parent found you. They looked more scared than you were." },
        { label: "Go exploring", effects: { happiness: 5, family: -5 }, result: "You found the food court before anyone found you. It was worth it, mostly." },
        { label: "Ask a store worker for help", effects: { smarts: 4, family: 3 }, result: "A kind worker gave you a sticker and called your parent over the speaker." }
      ]
    },
    {
      id: "school_play", icon: "🎭", title: "The school play", minAge: 6, maxAge: 10,
      text: "Your class is putting on a play. The teacher asks who wants to audition for the lead.",
      choices: [
        { label: "Audition for the lead", effects: { looks: 4, happiness: 6, social: 3 }, result: "You got the part. Your one line was delivered with tremendous seriousness." },
        { label: "Join the stage crew", effects: { smarts: 4, happiness: 4 }, result: "You built the entire cardboard castle. It was the real star of the show." },
        { label: "Skip it", effects: { happiness: -2, smarts: 1 }, result: "You watched from the audience. Part of you wished you had tried out." }
      ]
    },
    {
      id: "class_pet", icon: "🐹", title: "The class pet", minAge: 7, maxAge: 11,
      text: "It is your turn to take home the class hamster for the weekend. Your parents have not been consulted.",
      choices: [
        { label: "Take excellent care of it", effects: { smarts: 3, happiness: 5, family: 2 }, result: "You made a little obstacle course. The hamster seemed genuinely impressed." },
        { label: "Forget about it for a day", effects: { happiness: -3, family: -3 }, result: "The hamster survived, but it gave you a long, judgmental look." },
        { label: "Let it explore the house", effects: { happiness: 5, family: -4 }, result: "The hamster had the best afternoon of its life. Finding it took three hours." }
      ]
    },
    {
      id: "report_card", icon: "📄", title: "Report card day", minAge: 8, maxAge: 15,
      text: "The report card is in your backpack. The grades are... mixed. Your parents are asking how school is going.",
      choices: [
        { label: "Show them honestly", effects: { family: 5, happiness: -2, smarts: 2 }, result: "They were disappointed but proud you told the truth. A tutor was mentioned." },
        { label: "Hide it at the bottom of your bag", effects: { family: -4, happiness: 2 }, result: "It stayed hidden until parent-teacher night. That was a fun surprise." },
        { label: "Change one grade with a pen", effects: { happiness: 3, family: -2 }, risk: { chance: 0.35, win: { happiness: 5 }, lose: { family: -12, happiness: -6 }, winText: "No one noticed. You felt like a criminal genius.", loseText: "Your teacher called home. The pen was a different color." } }
      ]
    },
    {
      id: "bully", icon: "🛡️", title: "Playground trouble", minAge: 7, maxAge: 13,
      text: "Someone keeps knocking your things out of your hands and calling it a joke. Today they do it again.",
      choices: [
        { label: "Stand up for yourself", effects: { happiness: 5, health: -2, looks: 2 }, result: "Your voice shook, but you said it. They backed off." },
        { label: "Tell a teacher", effects: { smarts: 3, family: 3, happiness: 2 }, result: "The teacher handled it. It felt less lonely after that." },
        { label: "Ignore it and walk away", effects: { happiness: -4, smarts: 1 }, result: "You kept walking, but the feeling followed you home." }
      ]
    },
    {
      id: "found_wallet", icon: "👛", title: "A wallet on the sidewalk", minAge: 8, maxAge: 16,
      text: "You find a wallet on the sidewalk. It has cash inside and a photo of a smiling family.",
      choices: [
        { label: "Find the owner and return it", effects: { happiness: 6, money: 20, family: 2 }, result: "The owner gave you a reward and told everyone you were a good kid." },
        { label: "Keep the cash", effects: { money: 90, happiness: -4 }, result: "You bought something you wanted. It did not feel as good as you expected." },
        { label: "Hand it to a nearby shop", effects: { happiness: 3, smarts: 2 }, result: "The shop called the owner. You never found out what happened, but you hoped it worked out." }
      ]
    },
    {
      id: "talent_show", icon: "🌟", title: "Talent show sign-ups", minAge: 9, maxAge: 14,
      text: "The sign-up sheet for the school talent show is on the wall. There is one empty slot left.",
      choices: [
        { label: "Sign up to sing", effects: { looks: 4, happiness: 7, social: 3 }, result: "Your voice cracked on the high note. The crowd cheered anyway." },
        { label: "Do a magic trick", effects: { smarts: 3, happiness: 6, social: 2 }, result: "The trick worked. You have no idea how, but it worked." },
        { label: "Cheer from the audience", effects: { happiness: 4, social: 2 }, result: "You made a sign for your friend and screamed louder than anyone." }
      ]
    },
    {
      id: "gaming_marathon", icon: "🕹️", title: "Game marathon", minAge: 10, maxAge: 16,
      text: "A new game just came out. Your friends want to play all weekend. You also have a big test on Monday.",
      choices: [
        { label: "Play all weekend", effects: { happiness: 8, health: -3, smarts: -1 }, result: "You reached the final level. The test did not go as well." },
        { label: "Study first, then play", effects: { smarts: 5, happiness: 3 }, result: "You studied for two hours and played for six. Balance." },
        { label: "Skip the game completely", effects: { smarts: 3, happiness: -3 }, result: "You aced the test, but heard about the game's ending from everyone." }
      ]
    },
    {
      id: "first_crush", icon: "💌", title: "A note in your locker", minAge: 12, maxAge: 16,
      text: "There is a folded note in your locker. It says: “I like you. Do you like me? Check yes or no.”",
      choices: [
        { label: "Check yes and pass it back", effects: { happiness: 8, looks: 2, social: 3 }, result: "You spent the rest of the day grinning at nothing." },
        { label: "Write back “let's be friends”", effects: { happiness: 3, social: 2, smarts: 1 }, result: "It was a little awkward, but you stayed friends." },
        { label: "Pretend you never saw it", effects: { happiness: -3, social: -1 }, result: "The note stayed in your locker. So did the wondering." }
      ]
    },
    {
      id: "party_invite", icon: "🎊", title: "The party invite", minAge: 14, maxAge: 17,
      text: "Someone with a car and very loose rules is throwing a party. Your parents think you are at a study group.",
      choices: [
        { label: "Go and have the night of your life", effects: { happiness: 10, health: -2, family: -6, social: 5 }, result: "The music was too loud, the snacks were terrible, and it was unforgettable." },
        { label: "Stay home and study", effects: { smarts: 4, family: 3, happiness: -2 }, result: "You studied. Your friends sent videos. You felt very mature and slightly left out." },
        { label: "Host a smaller hangout at home", effects: { money: -40, happiness: 7, family: 2, social: 4 }, result: "Your parents ordered pizza and pretended not to hear the music. A good night." }
      ]
    },
    {
      id: "exam_pressure", icon: "📝", title: "The big exam", minAge: 14, maxAge: 18,
      text: "The biggest exam of the year is tomorrow. You have not exactly been keeping up.",
      choices: [
        { label: "Cram all night", effects: { smarts: 5, health: -4, happiness: -1 }, result: "You drank too much coffee and remembered just enough." },
        { label: "Cheat off the person next to you", effects: { happiness: 2, smarts: -2 }, risk: { chance: 0.3, win: { smarts: 2, happiness: 4 }, lose: { smarts: -8, happiness: -8, family: -4 }, winText: "You got away with it. The guilt was louder than the grade.", loseText: "The teacher saw everything. Your parents were called." } },
        { label: "Wing it and hope", effects: { happiness: 2, smarts: 1 }, result: "You wrote something confident and mostly wrong. The essay was at least well organized." }
      ]
    },
    {
      id: "social_post", icon: "📸", title: "Post it or not?", minAge: 13, maxAge: 19,
      text: "You have a photo that would get a lot of attention. It is also a little embarrassing for someone else.",
      choices: [
        { label: "Post it", effects: { looks: 3, happiness: 5, social: 4 }, risk: { chance: 0.45, win: { social: 5, happiness: 3 }, lose: { social: -8, happiness: -5 }, winText: "The post blew up. Everyone was talking about it.", loseText: "It caused a fight. You deleted it, but the screenshots lived on." } },
        { label: "Keep it to yourself", effects: { happiness: 2, smarts: 2 }, result: "You kept the peace. It was the less exciting choice, and the right one." },
        { label: "Post something kind instead", effects: { happiness: 4, social: 3 }, result: "You posted a compliment for a friend. It made their whole week." }
      ]
    },
    {
      id: "part_time", icon: "🥤", title: "A part-time job", minAge: 15, maxAge: 17,
      text: "The café down the street is hiring. The pay is not great, but it is money and it is yours.",
      choices: [
        { label: "Take the job", effects: { money: 700, smarts: 2, happiness: -1 }, result: "You learned to make a perfect latte and hate the smell of burnt espresso." },
        { label: "Decline and focus on school", effects: { smarts: 4, happiness: 2 }, result: "You kept your weekends. Your bank account stayed exactly where it was." },
        { label: "Ask for more hours", effects: { money: 1100, health: -2, happiness: -2 }, result: "You worked almost every evening. The paycheck was worth it." }
      ]
    },
    {
      id: "prom", icon: "💃", title: "Prom night", minAge: 16, maxAge: 18,
      text: "Prom is coming up. The group chat is planning outfits, rides, and a very expensive photo package.",
      choices: [
        { label: "Go all out", effects: { money: -280, happiness: 11, looks: 4, social: 4 }, result: "The outfit, the photos, the terrible DJ — it was perfect." },
        { label: "Keep it low-key", effects: { money: -60, happiness: 7, social: 2 }, result: "You went with friends, skipped the fancy photos, and had more fun than anyone expected." },
        { label: "Skip it", effects: { smarts: 3, happiness: -3 }, result: "You stayed home. It felt like a big deal at the time, then it did not." }
      ]
    },
    {
      id: "found_money", icon: "💵", title: "Found on the ground", minAge: 18, maxAge: 70,
      text: "You spot a folded bill on the ground near a busy bus stop. No one around seems to be looking for it.",
      choices: [
        { label: "Leave it where it is", effects: { happiness: 3, smarts: 1 }, result: "Someone else might need it more. You walked on." },
        { label: "Keep it", effects: { money: 160, happiness: -3 }, result: "Free money is still money, even if it comes with a little guilt." },
        { label: "Give it to someone who looks like they need it", effects: { happiness: 7, social: 2 }, result: "The person looked surprised, then smiled. So did you." }
      ]
    },
    {
      id: "move_out", icon: "🔑", title: "A place of your own", minAge: 18, maxAge: 28,
      text: "A small apartment is available nearby. The rent is manageable, barely. Your parents' couch is free.",
      when: (s) => !s.flags.independent,
      choices: [
        { label: "Sign the lease", effects: { money: -1200, happiness: 9, independence: true }, result: "You got the keys, bought a mattress, and ate dinner on the floor. It was yours." },
        { label: "Stay home and save", effects: { money: 800, family: -2, happiness: -2 }, result: "You put the rent money into savings and tried not to think about the apartment." },
        { label: "Ask a friend to split it", effects: { money: -600, happiness: 7, social: 4, independence: true }, result: "You and a friend moved in together. The dishes situation was immediately a problem." }
      ]
    },
    {
      id: "side_hustle", icon: "🛠️", title: "A side hustle opportunity", minAge: 18, maxAge: 60,
      text: "A friend needs help with a weekend project and offers to pay. It is a lot of work for the money.",
      choices: [
        { label: "Take it", effects: { money: 1100, health: -3 }, result: "You gave up two weekends and came home exhausted. The payment cleared." },
        { label: "Pass", effects: { happiness: 2 }, result: "You protected your weekend. Your bank account did not notice." },
        { label: "Take it and ask for more work", effects: { money: 2300, health: -5, happiness: -2 }, result: "The project grew. So did the payment, and the exhaustion." }
      ]
    },
    {
      id: "blind_date", icon: "💘", title: "A friend's setup", minAge: 18, maxAge: 45,
      text: "A friend wants to set you up with someone. They say you will “totally get along.”",
      when: (s) => !s.partner,
      choices: [
        { label: "Go on the date", effects: { money: -45, happiness: 5, meet: 0.65 }, result: "You met at a small restaurant and talked until the staff started stacking chairs." },
        { label: "Cancel", effects: { happiness: -2, social: -2 }, result: "You stayed home. The friend was not thrilled." },
        { label: "Go, but keep it casual", effects: { happiness: 3, meet: 0.35 }, result: "It was nice. Not fireworks, but nice." }
      ]
    },
    {
      id: "gym_pitch", icon: "🏃", title: "The gym sales pitch", minAge: 18, maxAge: 60,
      text: "A very enthusiastic person at the gym offers you a membership. There is a sign-up fee if you join today.",
      choices: [
        { label: "Sign up", effects: { money: -300, health: 7, looks: 3 }, result: "You went four times in the first month and then developed a complicated relationship with the treadmill." },
        { label: "Pass", effects: { happiness: 1 }, result: "You kept your money and your evening. A win either way." },
        { label: "Do the free trial only", effects: { health: 3, happiness: 2 }, result: "You used every free class and left before the sales pitch could find you again." }
      ]
    },
    {
      id: "crypto_tip", icon: "📈", title: "A hot investment tip", minAge: 18, maxAge: 65,
      text: "Someone at work says they know a coin that is “about to explode.” They say it with a lot of confidence.",
      choices: [
        { label: "Put in $500", effects: { money: -500 }, risk: { chance: 0.35, win: { money: 1600, happiness: 6 }, lose: { happiness: -6 }, winText: "It went up. You sold at the right time and told no one.", loseText: "It went to zero. The person at work stopped mentioning it." } },
        { label: "Do some research first", effects: { smarts: 4, happiness: 1 }, result: "You read for an hour, learned a lot, and invested nothing. Probably wise." },
        { label: "Politely pass", effects: { money: 0, happiness: 1 }, result: "You kept your money. The coin did something dramatic without you." }
      ]
    },
    {
      id: "rent_increase", icon: "🏠", title: "The rent went up", minAge: 22, maxAge: 65,
      text: "Your landlord sends a letter: rent is increasing next month. The number is not small.",
      when: (s) => s.flags.independent,
      choices: [
        { label: "Try to negotiate", effects: { happiness: 2 }, risk: { chance: 0.5, win: { money: 600, happiness: 4 }, lose: { money: -400, happiness: -3 }, winText: "The landlord agreed to a smaller increase. You felt very adult.", loseText: "The landlord said no and seemed annoyed you asked." } },
        { label: "Pay it and move on", effects: { money: -900, happiness: -3 }, result: "You updated your budget and canceled a subscription you barely used." },
        { label: "Start looking for a cheaper place", effects: { money: -600, happiness: 2 }, result: "You moved somewhere smaller with better light. The boxes took a month to unpack." }
      ]
    },
    {
      id: "office_politics", icon: "🏢", title: "Office politics", minAge: 21, maxAge: 65,
      text: "A coworker takes credit for your idea in a meeting. Everyone nods. Your manager looks impressed.",
      when: (s) => Boolean(s.job),
      choices: [
        { label: "Speak up calmly", effects: { happiness: 5, smarts: 2, performance: 6 }, result: "You clarified the timeline without making it a fight. Your manager noticed." },
        { label: "Let it go", effects: { happiness: -4, performance: -2 }, result: "You let it slide. The idea did well. Your name was not on it." },
        { label: "Take credit for something of theirs", effects: { happiness: 2, performance: 3 }, risk: { chance: 0.4, win: { performance: 4 }, lose: { performance: -10, happiness: -6 }, winText: "It worked. The office felt a little colder after that.", loseText: "It backfired spectacularly. Everyone knew." } }
      ]
    },
    {
      id: "job_offer", icon: "📨", title: "Another offer", minAge: 22, maxAge: 65,
      text: "A recruiter calls with an offer from another company. The salary is better, but the place is unfamiliar.",
      when: (s) => Boolean(s.job),
      choices: [
        { label: "Take the leap", effects: { happiness: 4, jobBoost: 1.22 }, result: "You accepted. The first week was terrifying and exciting in equal measure." },
        { label: "Use it to ask for a raise", effects: { happiness: 2, performance: 5 }, risk: { chance: 0.6, win: { jobBoost: 1.12, happiness: 4 }, lose: { happiness: -4 }, winText: "Your current employer matched the offer. You stayed and felt appreciated.", loseText: "They wished you well. The offer was gone." } },
        { label: "Stay where you are", effects: { happiness: 2, performance: 2 }, result: "You stayed. The familiar routine felt like the right call." }
      ]
    },
    {
      id: "burnout", icon: "🫠", title: "Running on empty", minAge: 25, maxAge: 65,
      text: "You have been working too much for too long. Even small tasks feel heavy.",
      when: (s) => Boolean(s.job),
      choices: [
        { label: "Take a real break", effects: { money: -900, health: 9, happiness: 7 }, result: "You unplugged for a week. The world did not end. You felt human again." },
        { label: "Push through", effects: { health: -7, happiness: -3, money: 500 }, result: "You kept going. The work got done. Your body kept a careful record." },
        { label: "Quit and rethink everything", effects: { health: 5, happiness: 4, quitJob: true }, result: "You handed in your notice. The relief was immediate and a little terrifying." }
      ]
    },
    {
      id: "family_dinner", icon: "🍲", title: "Family dinner", minAge: 18, maxAge: 80,
      text: "Your family is planning a big dinner. The group chat has 47 messages and three different start times.",
      choices: [
        { label: "Show up early and help", effects: { family: 7, happiness: 4 }, result: "You chopped vegetables and heard stories you had never heard before." },
        { label: "Cancel at the last minute", effects: { family: -6, happiness: -1 }, result: "Something came up. Your mother said it was fine in a tone that meant it was not." },
        { label: "Bring someone new", effects: { family: 3, happiness: 5, partner: 3 }, result: "The table was fuller, the questions were endless, and it was a good night." }
      ]
    },
    {
      id: "old_friend", icon: "🫂", title: "An old friend reaches out", minAge: 25, maxAge: 70,
      text: "A message from an old friend: “I'm in town. Coffee?” It has been years.",
      choices: [
        { label: "Meet for coffee", effects: { money: -25, happiness: 7, social: 5 }, result: "You talked for three hours and picked up exactly where you left off." },
        { label: "Say you're too busy", effects: { happiness: -3, social: -3 }, result: "You meant to reschedule. The message stayed unanswered." },
        { label: "Offer to help with something", effects: { money: -300, happiness: 6, social: 7 }, result: "They needed a hand with a move. You spent the day carrying boxes and laughing." }
      ]
    },
    {
      id: "charity", icon: "❤️", title: "A request for help", minAge: 20, maxAge: 80,
      text: "A local shelter is short on supplies. They are asking for donations, money or time.",
      choices: [
        { label: "Donate money", effects: { money: -250, happiness: 6, social: 2 }, result: "You sent what you could. The thank-you note was short and sincere." },
        { label: "Volunteer for the day", effects: { happiness: 5, smarts: 2, social: 3 }, result: "You sorted donations and met people who made the work feel easy." },
        { label: "Pass this time", effects: { happiness: -1 }, result: "You were stretched thin. You promised yourself you would help next time." }
      ]
    },
    {
      id: "car_trouble", icon: "🔧", title: "A concerning noise", minAge: 20, maxAge: 75,
      text: "Your car starts making a noise that sounds expensive. The mechanic gives you a quote.",
      when: (s) => s.assets.includes("car"),
      choices: [
        { label: "Fix it properly", effects: { money: -650, happiness: 2 }, result: "The noise stopped. The bill was painful but the car was happy." },
        { label: "Turn up the radio", effects: { happiness: -2, health: -1 }, risk: { chance: 0.45, win: { happiness: 2 }, lose: { money: -1200, happiness: -6 }, winText: "It was nothing. You got lucky.", loseText: "It was not nothing. The car broke down on the highway." } },
        { label: "Sell it as-is", effects: { money: 1800, happiness: -4, removeAsset: "car" }, result: "Someone bought it for parts. You took the bus for a while." }
      ]
    },
    {
      id: "wedding_invite", icon: "💐", title: "A wedding invitation", minAge: 22, maxAge: 70,
      text: "A friend is getting married. The invitation is beautiful, the dress code is specific, and the registry is online.",
      choices: [
        { label: "Go and celebrate", effects: { money: -120, happiness: 5, social: 4 }, result: "You danced badly and cried a little during the speeches." },
        { label: "Send a generous gift", effects: { money: -300, happiness: 4, social: 6 }, result: "You could not make it, but your gift arrived with a heartfelt note." },
        { label: "Skip it", effects: { social: -4, happiness: -1 }, result: "You sent a text. The photos looked lovely." }
      ]
    },
    {
      id: "health_scare", icon: "🩺", title: "A worrying symptom", minAge: 35, maxAge: 80,
      text: "Something has been bothering you for a few weeks. It is probably nothing. Probably.",
      choices: [
        { label: "Get it checked out", effects: { money: -450, health: 8, happiness: 3 }, result: "The doctor said it was treatable and caught early. You left feeling grateful." },
        { label: "Ignore it and hope", effects: { health: -10, happiness: -4 }, result: "You kept busy and tried not to think about it. Your body kept sending reminders." },
        { label: "Change your habits first", effects: { money: -120, health: 4, happiness: 2 }, result: "You slept more, walked daily, and made an appointment anyway. Good call." }
      ]
    },
    {
      id: "midlife", icon: "🏎️", title: "A sudden urge", minAge: 40, maxAge: 55,
      text: "You wake up one morning and realize you have been doing the same thing for a long time. Something needs to change.",
      choices: [
        { label: "Buy the impractical sports car", effects: { money: -15000, happiness: 10, looks: 5 }, result: "The car was loud and ridiculous. You loved it more than you expected." },
        { label: "Take a class in something new", effects: { money: -800, smarts: 7, happiness: 5 }, result: "You signed up for pottery. Your first bowl was lopsided and perfect." },
        { label: "Sit with the feeling", effects: { happiness: -2, smarts: 3 }, result: "You did not buy anything. You started asking better questions instead." }
      ]
    },
    {
      id: "inheritance", icon: "📜", title: "An unexpected inheritance", minAge: 35, maxAge: 75,
      text: "A distant relative you barely knew has left you some money. It comes with a mix of gratitude and strange grief.",
      choices: [
        { label: "Invest it", effects: { money: 8000, smarts: 3 }, result: "You put it somewhere sensible. It felt like a small safety net appeared beneath you." },
        { label: "Spend it on something memorable", effects: { money: 8000, happiness: 10 }, result: "You took a trip you had been putting off for years. You thought about them the whole time." },
        { label: "Donate a portion", effects: { money: 6000, happiness: 9, social: 3 }, result: "You gave some to a cause that mattered to them. It made the loss feel shared." }
      ]
    },
    {
      id: "career_crossroads", icon: "🧭", title: "A career crossroads", minAge: 30, maxAge: 60,
      text: "You have an idea for something of your own. It would mean leaving stability behind.",
      when: (s) => Boolean(s.job),
      choices: [
        { label: "Bet on yourself", effects: { money: -5000, happiness: 5, health: -2 }, risk: { chance: 0.45, win: { money: 18000, happiness: 12, performance: 10 }, lose: { money: -4000, happiness: -8 }, winText: "It worked. Slowly, then all at once. You built something real.", loseText: "It did not work. You learned a lot and lost more than you wanted to." } },
        { label: "Keep the steady paycheck", effects: { happiness: 2, performance: 3 }, result: "You stayed. The idea stayed in a notebook, and that was okay." },
        { label: "Ask for a bigger role", effects: { happiness: 3, performance: 8 }, result: "You asked for more responsibility. They said yes, then immediately gave you more work." }
      ]
    },
    {
      id: "neighbor", icon: "🏘️", title: "A neighbor problem", minAge: 25, maxAge: 75,
      text: "Your neighbor's music is loud every night. You have asked nicely twice. It is now 11:47 p.m.",
      choices: [
        { label: "Talk to them again", effects: { happiness: 2, smarts: 2 }, result: "They apologized and turned it down. The peace lasted almost a week." },
        { label: "Ignore it and buy earplugs", effects: { money: -20, happiness: -2 }, result: "The earplugs worked. Your resentment did not." },
        { label: "File a complaint", effects: { happiness: 3, social: -3 }, risk: { chance: 0.6, win: { happiness: 4 }, lose: { happiness: -5 }, winText: "The building sent a warning. The music stopped.", loseText: "The complaint made things awkward. The music continued." } }
      ]
    },
    {
      id: "volunteer_day", icon: "🌱", title: "A day to give back", minAge: 18, maxAge: 80,
      text: "A community garden is looking for volunteers this weekend. The weather is supposed to be perfect.",
      choices: [
        { label: "Spend the day digging", effects: { happiness: 6, health: 2, social: 3 }, result: "You came home with dirt under your nails and a ridiculous amount of zucchini." },
        { label: "Donate supplies instead", effects: { money: -120, happiness: 5, social: 2 }, result: "You dropped off gloves and seeds. The organizer sent a photo of the first sprouts." },
        { label: "Stay home", effects: { happiness: -1 }, result: "You had a quiet weekend. The garden got planted without you." }
      ]
    },
    {
      id: "investment_tip", icon: "📊", title: "A serious investment", minAge: 30, maxAge: 80,
      text: "A financial advisor pitches a fund with impressive numbers. Past performance, they remind you, is not a guarantee.",
      choices: [
        { label: "Invest $2,000", effects: { money: -2000 }, risk: { chance: 0.58, win: { money: 3400, happiness: 4 }, lose: { money: 900, happiness: -3 }, winText: "The fund did well. You resisted checking the app every day.", loseText: "The market dipped. You held on and recovered some, but not all." } },
        { label: "Ask more questions", effects: { smarts: 4, happiness: 1 }, result: "You read the fine print and asked about fees. The advisor looked nervous." },
        { label: "Keep the cash", effects: { happiness: 1 }, result: "You decided you preferred knowing exactly where your money was." }
      ]
    },
    {
      id: "reunion", icon: "📸", title: "The reunion", minAge: 30, maxAge: 70,
      text: "Your school reunion is coming up. The group chat is full of old photos and people pretending they are not nervous.",
      choices: [
        { label: "Go and catch up", effects: { money: -80, happiness: 7, social: 5 }, result: "Everyone looked older and somehow exactly the same. You laughed until your face hurt." },
        { label: "Skip it", effects: { happiness: -2, social: -2 }, result: "You looked at the photos afterward and wondered if you should have gone." },
        { label: "Help organize it", effects: { money: -250, happiness: 8, social: 7 }, result: "You ended up running the whole thing. It was chaotic and wonderful." }
      ]
    },
    {
      id: "retirement_choice", icon: "🌅", title: "The retirement question", minAge: 60, maxAge: 70,
      text: "You are old enough to retire. The numbers work, if you are careful. But work has been part of your life for a long time.",
      when: (s) => Boolean(s.job) && !s.flags.retired,
      choices: [
        { label: "Retire", effects: { happiness: 8, health: 4, retire: true }, result: "You handed in your notice and woke up the next morning with nowhere to be. It was wonderful." },
        { label: "Keep working a while", effects: { money: 4000, health: -3, happiness: -2 }, result: "You stayed on. The routine was comforting, even when it was tiring." },
        { label: "Cut back to part-time", effects: { money: 1800, health: 2, happiness: 4, jobBoost: 0.6 }, result: "You negotiated fewer hours. The extra free time felt like a luxury." }
      ]
    },
    {
      id: "grandkid", icon: "🧸", title: "A visit from the little ones", minAge: 60, maxAge: 90,
      text: "Your children are asking if you can watch the grandkids for the weekend. They have a lot of energy.",
      when: (s) => s.relationships.some(r => r.role === "Child" && r.alive),
      choices: [
        { label: "Of course — bring them over", effects: { happiness: 8, health: -2, family: 4 }, result: "You built a pillow fort, made pancakes, and fell asleep before they did." },
        { label: "Offer to visit instead", effects: { happiness: 5, family: 3 }, result: "You spent the afternoon at their place and left before bedtime. Everyone won." },
        { label: "Say you need a quiet weekend", effects: { happiness: -2, family: -4 }, result: "They understood. You still felt a little guilty when the house stayed quiet." }
      ]
    },
    {
      id: "bucket_list", icon: "🪂", title: "The bucket list", minAge: 65, maxAge: 90,
      text: "You find a list you wrote years ago. There are still a few things on it.",
      choices: [
        { label: "Go skydiving", effects: { money: -450, happiness: 13, health: -5 }, risk: { chance: 0.82, win: { happiness: 6 }, lose: { health: -12, happiness: -4 }, winText: "You screamed the whole way down and would do it again.", loseText: "You landed badly. The view was incredible, though." } },
        { label: "Take a long trip", effects: { money: -2200, happiness: 11, health: 3 }, result: "You traveled somewhere you had always meant to go. You took too many photos." },
        { label: "Write your memoir", effects: { smarts: 4, happiness: 7, family: 3 }, result: "You wrote it all down. Your family read it and learned things they never knew." }
      ]
    },
    {
      id: "memory_lane", icon: "🕯️", title: "Memory lane", minAge: 70, maxAge: 95,
      text: "Someone asks what you are most proud of. The room gets quiet. You have a lot to choose from.",
      choices: [
        { label: "Tell them about the people you loved", effects: { happiness: 7, family: 5 }, result: "You talked about the small moments: kitchen dances, bad jokes, hands held in hospital waiting rooms." },
        { label: "Tell them about the risks you took", effects: { happiness: 6, smarts: 2 }, result: "You told the stories you usually kept to yourself. They listened to every word." },
        { label: "Keep it to yourself", effects: { happiness: 2, smarts: 3 }, result: "You smiled and said you would need more time. Some things were just yours." }
      ]
    }
  ];

  window.LIFE_DATA = {
    COUNTRIES, COUNTRY_ORDER, STAGES, GENDER_AVATARS, ACTIVITIES, JOBS, EDUCATION,
    EDUCATION_LABELS, ASSETS, ACHIEVEMENTS, MILESTONES, FLAVOR, LIFE_EVENTS
  };
})();
