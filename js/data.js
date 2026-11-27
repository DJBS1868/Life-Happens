// ---------------------------------------------------------------------------
// Static content for Life Happens
// ---------------------------------------------------------------------------

export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'ES', name: 'Spain' },
  { code: 'IT', name: 'Italy' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IN', name: 'India' },
  { code: 'BR', name: 'Brazil' },
  { code: 'MX', name: 'Mexico' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'PH', name: 'Philippines' },
  { code: 'SG', name: 'Singapore' },
  { code: 'EG', name: 'Egypt' },
];

export const FIRST_NAMES = {
  female: ['Ava', 'Mia', 'Sofia', 'Isla', 'Luna', 'Zoe', 'Chloe', 'Nora', 'Ruby', 'Ivy', 'Elena', 'Amara', 'Priya', 'Yuki', 'Camila', 'Leila', 'Grace', 'Hazel', 'Maya', 'Freya', 'Aaliyah', 'Rosa', 'Nina', 'Talia', 'Sana', 'Jade', 'Iris', 'Clara', 'Daisy', 'Noemi'],
  male: ['Liam', 'Noah', 'Ethan', 'Lucas', 'Mateo', 'Kai', 'Leo', 'Owen', 'Ezra', 'Milo', 'Arjun', 'Hiro', 'Diego', 'Omar', 'Felix', 'Jonah', 'Theo', 'Ravi', 'Andre', 'Malik', 'Nico', 'Sam', 'Isaac', 'Elias', 'Rowan', 'Jude', 'Tariq', 'Marco', 'Dylan', 'Rafael'],
};

export const LAST_NAMES = ['Rivera', 'Bennett', 'Kim', 'Okafor', 'Silva', 'Novak', 'Haddad', 'Chen', 'Patel', 'Moreau', 'Rossi', 'Andersen', 'Walker', 'Sato', 'Costa', 'Mensah', 'Kowalski', 'Fischer', 'Lopez', 'Turner', 'Nakamura', 'Osei', 'Dubois', 'Ibrahim', 'Santos', 'Murphy', 'Varga', 'Reyes', 'Kaur', 'Lindqvist'];

export const SKIN_TONES = [
  { base: '#f6d6bd', shade: '#e5b99a', light: '#fce7d6' },
  { base: '#efc4a2', shade: '#dba57f', light: '#f8dcc6' },
  { base: '#e3ab7e', shade: '#c98d61', light: '#f0c6a3' },
  { base: '#c98a5e', shade: '#ad6f47', light: '#daa47c' },
  { base: '#a96a43', shade: '#8d5231', light: '#bd825c' },
  { base: '#8a4f2e', shade: '#703d21', light: '#9d6441' },
  { base: '#6b3b23', shade: '#552c18', light: '#7f4d33' },
  { base: '#4d2a18', shade: '#3a1e10', light: '#603a26' },
];

export const HAIR_COLORS = [
  { name: 'Black', base: '#161210', hi: '#3a3029' },
  { name: 'Dark Brown', base: '#2e1e14', hi: '#523728' },
  { name: 'Brown', base: '#4a2f1e', hi: '#6d4a32' },
  { name: 'Auburn', base: '#6b2f1c', hi: '#8f4a2f' },
  { name: 'Blonde', base: '#c99a45', hi: '#e8c274' },
  { name: 'Platinum', base: '#d8cfb8', hi: '#f0e9d8' },
  { name: 'Red', base: '#a33b1c', hi: '#c95a30' },
  { name: 'Gray', base: '#8c8c8c', hi: '#b8b8b8' },
  { name: 'White', base: '#e6e3dc', hi: '#f7f5ef' },
  { name: 'Blue', base: '#2f5c8f', hi: '#4f87bd' },
  { name: 'Pink', base: '#b44d7a', hi: '#d6749c' },
  { name: 'Green', base: '#3d6b42', hi: '#5d915f' },
];

export const HAIR_STYLES = ['Short', 'Buzz', 'Curly', 'Afro', 'Long', 'Bob', 'Ponytail', 'Bald', 'Mohawk', 'Bun', 'Wavy'];

export const EYE_COLORS = [
  { name: 'Brown', base: '#4a2d1c' },
  { name: 'Dark', base: '#2a1a12' },
  { name: 'Hazel', base: '#7a5a2a' },
  { name: 'Green', base: '#3d6b4a' },
  { name: 'Blue', base: '#3c6f9c' },
  { name: 'Gray', base: '#6a7a80' },
];

export const CLOTHES = ['#33475c', '#5a3d5c', '#2f5d50', '#6b3b34', '#3b3b46', '#7a5a2e', '#244a6b', '#5c2f3d', '#465a34', '#4b3f63'];

export const OCCUPATION_EMOJI = {
  none: '🚼',
  student: '🎒',
  unemployed: '😐',
  retired: '🌴',
  prisoner: '⛓️',
};

export const EDUCATION_LABEL = {
  none: 'No Education',
  hs: 'High School',
  uni: 'University',
  grad: 'Graduate School',
};

export const JOBS = [
  { id: 'fastfood', title: 'Fast Food Worker', icon: '🍔', salary: 19000, edu: 'none', smarts: 0, looks: 0, minAge: 16, category: 'Service' },
  { id: 'cashier', title: 'Cashier', icon: '🛒', salary: 24000, edu: 'none', smarts: 5, looks: 0, minAge: 16, category: 'Retail' },
  { id: 'janitor', title: 'Janitor', icon: '🧹', salary: 27000, edu: 'none', smarts: 0, looks: 0, minAge: 18, category: 'Service' },
  { id: 'driver', title: 'Delivery Driver', icon: '🚚', salary: 32000, edu: 'none', smarts: 10, looks: 0, minAge: 18, category: 'Transport' },
  { id: 'barista', title: 'Barista', icon: '☕', salary: 29000, edu: 'hs', smarts: 10, looks: 10, minAge: 16, category: 'Service' },
  { id: 'sales', title: 'Sales Associate', icon: '👔', salary: 38000, edu: 'hs', smarts: 20, looks: 20, minAge: 18, category: 'Retail' },
  { id: 'mechanic', title: 'Mechanic', icon: '🔧', salary: 46000, edu: 'hs', smarts: 25, looks: 0, minAge: 18, category: 'Trades' },
  { id: 'electrician', title: 'Electrician', icon: '⚡', salary: 58000, edu: 'hs', smarts: 30, looks: 0, minAge: 18, category: 'Trades' },
  { id: 'security', title: 'Security Guard', icon: '🛡️', salary: 35000, edu: 'hs', smarts: 10, looks: 10, minAge: 18, category: 'Service' },
  { id: 'teacher', title: 'Teacher', icon: '📚', salary: 54000, edu: 'uni', smarts: 55, looks: 0, minAge: 21, category: 'Education' },
  { id: 'nurse', title: 'Nurse', icon: '🩺', salary: 79000, edu: 'uni', smarts: 60, looks: 0, minAge: 21, category: 'Healthcare' },
  { id: 'engineer', title: 'Software Engineer', icon: '💻', salary: 98000, edu: 'uni', smarts: 65, looks: 0, minAge: 21, category: 'Tech' },
  { id: 'accountant', title: 'Accountant', icon: '🧾', salary: 70000, edu: 'uni', smarts: 55, looks: 0, minAge: 21, category: 'Finance' },
  { id: 'marketer', title: 'Marketing Manager', icon: '📈', salary: 76000, edu: 'uni', smarts: 50, looks: 30, minAge: 21, category: 'Business' },
  { id: 'model', title: 'Model', icon: '📸', salary: 62000, edu: 'hs', smarts: 10, looks: 70, minAge: 18, category: 'Fashion' },
  { id: 'actor', title: 'Actor', icon: '🎬', salary: 88000, edu: 'hs', smarts: 25, looks: 60, minAge: 18, category: 'Entertainment' },
  { id: 'musician', title: 'Musician', icon: '🎸', salary: 57000, edu: 'hs', smarts: 20, looks: 40, minAge: 18, category: 'Entertainment' },
  { id: 'influencer', title: 'Influencer', icon: '📱', salary: 67000, edu: 'hs', smarts: 25, looks: 50, minAge: 18, category: 'Media' },
  { id: 'lawyer', title: 'Lawyer', icon: '⚖️', salary: 145000, edu: 'grad', smarts: 75, looks: 0, minAge: 25, category: 'Legal' },
  { id: 'doctor', title: 'Doctor', icon: '🥼', salary: 225000, edu: 'grad', smarts: 85, looks: 0, minAge: 26, category: 'Healthcare' },
  { id: 'ceo', title: 'CEO', icon: '🏢', salary: 280000, edu: 'grad', smarts: 80, looks: 30, minAge: 30, category: 'Business' },
  { id: 'pilot', title: 'Airline Pilot', icon: '✈️', salary: 132000, edu: 'uni', smarts: 65, looks: 20, minAge: 23, category: 'Transport' },
  { id: 'chef', title: 'Head Chef', icon: '👨‍🍳', salary: 61000, edu: 'hs', smarts: 30, looks: 0, minAge: 20, category: 'Food' },
  { id: 'artist', title: 'Artist', icon: '🎨', salary: 42000, edu: 'hs', smarts: 30, looks: 10, minAge: 18, category: 'Creative' },
];

export const COMPANIES = ['ByteWorks', 'Northstar Health', 'Apex Financial', 'Studio Nova', 'Metro Schools', 'Luxe Models', 'Vanguard Legal', 'St. Mercy Hospital', 'QuickBite', 'MegaMart', 'Orbit Labs', 'Silverline Media', 'Union Trades', 'Bluebird Cafe', 'Summit Group', 'Neon Records'];

export const ASSETS = [
  { id: 'sedan', name: 'Used Sedan', icon: '🚗', type: 'Vehicle', value: 4500, upkeep: 500, joy: 2, minAge: 16 },
  { id: 'suv', name: 'Family SUV', icon: '🚙', type: 'Vehicle', value: 32000, upkeep: 1400, joy: 4, minAge: 18 },
  { id: 'sports', name: 'Sports Car', icon: '🏎️', type: 'Vehicle', value: 85000, upkeep: 4200, joy: 8, minAge: 18 },
  { id: 'luxsuv', name: 'Luxury SUV', icon: '🚘', type: 'Vehicle', value: 120000, upkeep: 6000, joy: 9, minAge: 18 },
  { id: 'supercar', name: 'Supercar', icon: '🏁', type: 'Vehicle', value: 350000, upkeep: 16000, joy: 14, minAge: 18 },
  { id: 'studio', name: 'Studio Apartment', icon: '🏢', type: 'Property', value: 95000, upkeep: 3200, joy: 6, minAge: 18 },
  { id: 'house', name: 'Suburban House', icon: '🏠', type: 'Property', value: 320000, upkeep: 8500, joy: 10, minAge: 18 },
  { id: 'beach', name: 'Beach House', icon: '🏖️', type: 'Property', value: 1200000, upkeep: 24000, joy: 16, minAge: 18 },
  { id: 'penthouse', name: 'Penthouse', icon: '🌆', type: 'Property', value: 4500000, upkeep: 70000, joy: 22, minAge: 18 },
  { id: 'mansion', name: 'Mansion', icon: '🏰', type: 'Property', value: 12000000, upkeep: 180000, joy: 30, minAge: 18 },
  { id: 'watch', name: 'Designer Watch', icon: '⌚', type: 'Luxury', value: 8000, upkeep: 200, joy: 3, minAge: 16 },
  { id: 'ring', name: 'Diamond Ring', icon: '💍', type: 'Luxury', value: 25000, upkeep: 100, joy: 4, minAge: 16 },
  { id: 'art', name: 'Art Collection', icon: '🖼️', type: 'Luxury', value: 75000, upkeep: 1200, joy: 6, minAge: 18 },
  { id: 'yacht', name: 'Yacht', icon: '🛥️', type: 'Luxury', value: 2500000, upkeep: 120000, joy: 20, minAge: 18 },
  { id: 'jet', name: 'Private Jet', icon: '🛩️', type: 'Luxury', value: 18000000, upkeep: 800000, joy: 35, minAge: 18 },
  { id: 'phone', name: 'Latest Phone', icon: '📱', type: 'Tech', value: 1200, upkeep: 0, joy: 2, minAge: 10 },
  { id: 'pc', name: 'Gaming PC', icon: '🖥️', type: 'Tech', value: 2500, upkeep: 0, joy: 3, minAge: 10 },
  { id: 'theater', name: 'Home Theater', icon: '📺', type: 'Tech', value: 15000, upkeep: 300, joy: 5, minAge: 18 },
];

export const ACTIVITY_CATEGORIES = [
  {
    id: 'education', name: 'Education', icon: '🎓', desc: 'School, skills and degrees',
    actions: [
      { id: 'study', name: 'Study Harder', icon: '📖', sub: 'Improve your smarts', cost: 0 },
      { id: 'library', name: 'Go to the Library', icon: '📚', sub: 'Free knowledge', cost: 0 },
      { id: 'university', name: 'Enroll in University', icon: '🏫', sub: '4 years · $48,000', cost: 48000, minAge: 18 },
      { id: 'gradschool', name: 'Enroll in Grad School', icon: '🎓', sub: '2 years · $72,000', cost: 72000, minAge: 22 },
      { id: 'tradeschool', name: 'Trade School', icon: '🔧', sub: '1 year · $8,000', cost: 8000, minAge: 18 },
    ],
  },
  {
    id: 'health', name: 'Health & Fitness', icon: '💪', desc: 'Take care of your body',
    actions: [
      { id: 'gym', name: 'Go to the Gym', icon: '🏋️', sub: '$40 · Health up', cost: 40 },
      { id: 'doctor', name: 'Visit the Doctor', icon: '🩺', sub: '$120 · Health up', cost: 120 },
      { id: 'dentist', name: 'Visit the Dentist', icon: '🦷', sub: '$90 · Looks up', cost: 90 },
      { id: 'spa', name: 'Go to the Spa', icon: '💆', sub: '$220 · Looks & happiness', cost: 220, minAge: 16 },
      { id: 'meditate', name: 'Meditate', icon: '🧘', sub: 'Free · Happiness up', cost: 0 },
      { id: 'surgery', name: 'Plastic Surgery', icon: '💉', sub: '$9,500 · Risky', cost: 9500, minAge: 18 },
    ],
  },
  {
    id: 'fun', name: 'Entertainment', icon: '🎬', desc: 'Enjoy the good things',
    actions: [
      { id: 'movies', name: 'Go to the Movies', icon: '🍿', sub: '$25 · Happiness up', cost: 25 },
      { id: 'concert', name: 'Go to a Concert', icon: '🎤', sub: '$150 · Happiness up', cost: 150, minAge: 16 },
      { id: 'vacation', name: 'Take a Vacation', icon: '✈️', sub: '$2,500 · Big happiness', cost: 2500 },
      { id: 'games', name: 'Play Video Games', icon: '🎮', sub: 'Free · Happiness up', cost: 0 },
      { id: 'party', name: 'Go to a Party', icon: '🎉', sub: 'Free · Happiness up, health down', cost: 0, minAge: 16 },
      { id: 'pet', name: 'Adopt a Pet', icon: '🐶', sub: '$600 · A new friend', cost: 600 },
    ],
  },
  {
    id: 'money', name: 'Money & Finance', icon: '💰', desc: 'Grow your bank balance',
    actions: [
      { id: 'lottery', name: 'Buy a Lottery Ticket', icon: '🎟️', sub: '$10 · Scratch to win', cost: 10, minAge: 18 },
      { id: 'casino', name: 'Gamble at the Casino', icon: '🎰', sub: 'Slots & blackjack · $1,000', cost: 1000, minAge: 18 },
      { id: 'stocks', name: 'Invest in Stocks', icon: '📈', sub: '$5,000 · Risky', cost: 5000, minAge: 18 },
      { id: 'charity', name: 'Donate to Charity', icon: '🤝', sub: '$1,000 · Karma up', cost: 1000 },
      { id: 'loan', name: 'Take a Bank Loan', icon: '🏦', sub: 'Borrow $10,000', cost: 0, minAge: 18 },
    ],
  },
  {
    id: 'social', name: 'Social & Dating', icon: '💬', desc: 'Meet new people',
    actions: [
      { id: 'date', name: 'Find Love', icon: '💘', sub: 'Go on a date', cost: 0, minAge: 16 },
      { id: 'friend', name: 'Make a Friend', icon: '🤝', sub: 'Meet someone new', cost: 0 },
      { id: 'socialmedia', name: 'Post on Social Media', icon: '📱', sub: 'Free · Fame up', cost: 0, minAge: 13 },
      { id: 'nightout', name: 'Night Out', icon: '🍸', sub: '$300 · Happiness up', cost: 300, minAge: 18 },
    ],
  },
  {
    id: 'crime', name: 'Crime', icon: '🚨', desc: 'Break the law. Risk it all.',
    actions: [
      { id: 'shoplift', name: 'Shoplift', icon: '🛍️', sub: 'Timing minigame · Small risk', cost: 0, minAge: 10 },
      { id: 'pickpocket', name: 'Pickpocket', icon: '🕵️', sub: 'Timing minigame · Cash', cost: 0, minAge: 12 },
      { id: 'carjack', name: 'Steal a Car', icon: '🔑', sub: 'Timing minigame · Big reward', cost: 0, minAge: 16 },
      { id: 'bankrob', name: 'Rob a Bank', icon: '🏦', sub: 'Timing minigame · Huge reward', cost: 0, minAge: 18 },
      { id: 'assault', name: 'Start a Fight', icon: '🥊', sub: 'Timing minigame · Prison risk', cost: 0, minAge: 16 },
    ],
  },
];

export const ACTIVITY_ACTIONS = Object.fromEntries(
  ACTIVITY_CATEGORIES.flatMap(c => c.actions.map(a => [a.id, { ...a, category: c.id }]))
);

export const ACHIEVEMENTS = [
  { id: 'first_steps', name: 'First Steps', desc: 'Reach age 2', icon: '👣' },
  { id: 'student', name: 'Honor Roll', desc: 'Reach 80 Smarts', icon: '🎓' },
  { id: 'first_job', name: 'Employed', desc: 'Get your first job', icon: '💼' },
  { id: 'promotion', name: 'Climbing the Ladder', desc: 'Earn a promotion', icon: '📈' },
  { id: 'degree', name: 'College Graduate', desc: 'Graduate from university', icon: '🏫' },
  { id: 'married', name: 'Tying the Knot', desc: 'Get married', icon: '💍' },
  { id: 'parent', name: 'Family Tree', desc: 'Have a child', icon: '👶' },
  { id: 'homeowner', name: 'Home Sweet Home', desc: 'Buy a property', icon: '🏠' },
  { id: 'millionaire', name: 'Millionaire', desc: 'Reach $1,000,000 net worth', icon: '💰' },
  { id: 'criminal', name: 'Life of Crime', desc: 'Go to prison', icon: '⛓️' },
  { id: 'centenarian', name: 'Centenarian', desc: 'Reach age 100', icon: '🎂' },
  { id: 'world', name: 'Jet Setter', desc: 'Take 5 vacations', icon: '✈️' },
  { id: 'famous', name: 'Internet Famous', desc: 'Reach 1M followers', icon: '🌟' },
  { id: 'legacy', name: 'Legacy', desc: 'Continue as your child', icon: '🧬' },
];

export const CHALLENGE = {
  id: 'full_life',
  title: 'Live a Full Life',
  desc: 'Reach age 80 with at least 60 Happiness.',
  reward: 25000,
  check: p => p.age >= 80 && p.stats.happiness >= 60,
};

export const TITLES = [
  'Professional Couch Potato', 'Certified Citizen', 'Chaos Coordinator', 'Local Legend',
  'Retired Overachiever', 'Weekend Millionaire', 'Neighborhood Icon', 'Main Character',
];

export function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
export function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
export function chance(p) { return Math.random() < p; }
export function clamp(n, min = 0, max = 100) { return Math.max(min, Math.min(max, n)); }

export function money(n) {
  const neg = n < 0;
  const v = Math.abs(Math.round(n));
  let out;
  if (v >= 1_000_000_000) out = (v / 1_000_000_000).toFixed(v >= 10_000_000_000 ? 0 : 2).replace(/\.00$/, '') + 'B';
  else if (v >= 1_000_000) out = (v / 1_000_000).toFixed(v >= 10_000_000 ? 1 : 2).replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1') + 'M';
  else if (v >= 10_000) out = (v / 1_000).toFixed(0) + 'K';
  else out = v.toLocaleString('en-US');
  return (neg ? '-$' : '$') + out;
}

export function moneyFull(n) {
  return (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US');
}

export function fullName(p) { return `${p.firstName} ${p.lastName}`.trim(); }
