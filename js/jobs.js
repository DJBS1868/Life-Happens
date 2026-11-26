export const JOBS = [
  { id: "barista", title: "Barista", company: "Daily Grind Coffee", icon: "☕", salary: 26000, category: "Part-time", field: "service", req: { age: 16 }, desc: "Pull espresso shots and remember complicated orders." },
  { id: "cashier", title: "Cashier", company: "FreshMart", icon: "🛒", salary: 27000, category: "Part-time", field: "service", req: { age: 16 }, desc: "Scan groceries and small talk with strangers." },
  { id: "retail", title: "Retail Associate", company: "Thread & Co.", icon: "👕", salary: 28000, category: "Part-time", field: "service", req: { age: 16 }, desc: "Fold clothes and help shoppers find the right size." },
  { id: "delivery", title: "Delivery Driver", company: "QuickBite", icon: "🛵", salary: 32000, category: "Full-time", field: "service", req: { age: 18 }, desc: "Deliver food before it gets cold." },
  { id: "janitor", title: "Janitor", company: "Bright Facilities", icon: "🧹", salary: 30000, category: "Full-time", field: "service", req: { age: 18 }, desc: "Keep the building spotless." },
  { id: "chef", title: "Line Cook", company: "The Copper Pan", icon: "🍳", salary: 38000, category: "Full-time", field: "service", req: { age: 18 }, desc: "Work the line in a busy kitchen." },
  { id: "mechanic", title: "Mechanic", company: "Torque Auto", icon: "🔧", salary: 42000, category: "Full-time", field: "trade", req: { age: 18, edu: "trade" }, desc: "Fix engines and diagnose strange noises." },
  { id: "electrician", title: "Electrician", company: "Volt Electric", icon: "⚡", salary: 55000, category: "Full-time", field: "trade", req: { age: 18, edu: "trade" }, desc: "Wire homes and commercial buildings." },
  { id: "admin", title: "Administrative Assistant", company: "Northstar Group", icon: "🗂️", salary: 38000, category: "Full-time", field: "business", req: { age: 18, edu: "hs" }, desc: "Keep the office running smoothly." },
  { id: "police", title: "Police Officer", company: "City Police Department", icon: "🚓", salary: 60000, category: "Full-time", field: "public", req: { age: 21, edu: "hs", health: 65 }, desc: "Protect and serve the community." },
  { id: "firefighter", title: "Firefighter", company: "City Fire Department", icon: "🚒", salary: 58000, category: "Full-time", field: "public", req: { age: 21, edu: "hs", health: 75 }, desc: "Run toward danger when everyone else runs away." },
  { id: "teacher", title: "Teacher", company: "Public School District", icon: "🍎", salary: 55000, category: "Full-time", field: "education", req: { age: 22, edu: "bachelor", smarts: 55 }, desc: "Inspire the next generation, one lesson at a time." },
  { id: "accountant", title: "Accountant", company: "Ledger & Co.", icon: "🧾", salary: 65000, category: "Full-time", field: "business", req: { age: 22, edu: "bachelor", smarts: 60 }, desc: "Make the numbers make sense." },
  { id: "realtor", title: "Real Estate Agent", company: "Key & Key", icon: "🔑", salary: 70000, category: "Full-time", field: "business", req: { age: 22, edu: "hs", looks: 50 }, desc: "Sell dream homes and negotiate deals." },
  { id: "nurse", title: "Registered Nurse", company: "Mercy General Hospital", icon: "🏥", salary: 75000, category: "Full-time", field: "medical", req: { age: 22, edu: "bachelor", smarts: 65 }, desc: "Care for patients through long shifts." },
  { id: "architect", title: "Architect", company: "Form & Function", icon: "📐", salary: 80000, category: "Full-time", field: "engineering", req: { age: 22, edu: "bachelor", smarts: 70 }, desc: "Design buildings people live and work in." },
  { id: "scientist", title: "Research Scientist", company: "Apex Labs", icon: "🔬", salary: 90000, category: "Full-time", field: "science", req: { age: 24, edu: "master", smarts: 75 }, desc: "Ask questions nobody has answered yet." },
  { id: "gamedev", title: "Game Developer", company: "Pixel Forge", icon: "🎮", salary: 95000, category: "Full-time", field: "tech", req: { age: 22, edu: "bachelor", smarts: 70 }, desc: "Build worlds that people get lost in." },
  { id: "engineer", title: "Software Engineer", company: "Nimbus Tech", icon: "💻", salary: 105000, category: "Full-time", field: "tech", req: { age: 22, edu: "bachelor", smarts: 72 }, desc: "Ship code, fix bugs, repeat." },
  { id: "engineer2", title: "Mechanical Engineer", company: "Titan Industries", icon: "⚙️", salary: 95000, category: "Full-time", field: "engineering", req: { age: 22, edu: "bachelor", smarts: 72 }, desc: "Design machines that move the world." },
  { id: "pilot", title: "Commercial Pilot", company: "Skyline Air", icon: "✈️", salary: 120000, category: "Full-time", field: "transport", req: { age: 23, edu: "bachelor", health: 80 }, desc: "Fly people across the world." },
  { id: "lawyer", title: "Lawyer", company: "Whitmore & Hale", icon: "⚖️", salary: 130000, category: "Full-time", field: "law", req: { age: 25, edu: "master", smarts: 78 }, desc: "Argue, advise, and win." },
  { id: "investment", title: "Investment Banker", company: "Sterling Capital", icon: "📈", salary: 150000, category: "Full-time", field: "business", req: { age: 22, edu: "bachelor", smarts: 80 }, desc: "Chase deals and big numbers." },
  { id: "vet", title: "Veterinarian", company: "Paws & Claws Clinic", icon: "🐾", salary: 85000, category: "Full-time", field: "medical", req: { age: 25, edu: "master", smarts: 75 }, desc: "Heal animals and reassure their humans." },
  { id: "doctor", title: "Physician", company: "Mercy General Hospital", icon: "🩺", salary: 220000, category: "Full-time", field: "medical", req: { age: 26, edu: "master", smarts: 85 }, desc: "Diagnose, treat, and save lives." },
  { id: "surgeon", title: "Surgeon", company: "St. Jude Medical Center", icon: "🩸", salary: 350000, category: "Full-time", field: "medical", req: { age: 28, edu: "master", smarts: 90, health: 80 }, desc: "Steady hands. High stakes." },
  { id: "astronaut", title: "Astronaut", company: "Global Space Agency", icon: "🚀", salary: 150000, category: "Full-time", field: "science", req: { age: 28, edu: "master", smarts: 92, health: 90 }, desc: "Leave the planet for a while." },
  { id: "actor", title: "Actor", company: "Silver Screen Studios", icon: "🎬", salary: 45000, category: "Full-time", field: "arts", req: { age: 18, looks: 60 }, desc: "Bring characters to life." },
  { id: "musician", title: "Musician", company: "Indie Records", icon: "🎸", salary: 40000, category: "Full-time", field: "arts", req: { age: 16 }, desc: "Write songs and play for crowds." },
  { id: "model", title: "Model", company: "Vogue Agency", icon: "📸", salary: 60000, category: "Full-time", field: "arts", req: { age: 18, looks: 80 }, desc: "Pose, strut, and make it look effortless." },
  { id: "influencer", title: "Influencer", company: "Self-Employed", icon: "📱", salary: 50000, category: "Full-time", field: "media", req: { age: 18, looks: 55, fame: 20 }, desc: "Turn followers into a career." },
  { id: "athlete", title: "Professional Athlete", company: "City Sharks", icon: "🏆", salary: 500000, category: "Full-time", field: "sports", req: { age: 18, health: 90 }, desc: "Compete at the highest level." },
  { id: "politician", title: "City Council Member", company: "City Government", icon: "🏛️", salary: 80000, category: "Full-time", field: "politics", req: { age: 25, edu: "hs", fame: 25 }, desc: "Represent your constituents." },
  { id: "mayor", title: "Mayor", company: "City Government", icon: "🏛️", salary: 110000, category: "Full-time", field: "politics", req: { age: 30, edu: "bachelor", fame: 50 }, desc: "Run the city." },
  { id: "ceo", title: "Chief Executive Officer", company: "Meridian Corp", icon: "🏢", salary: 320000, category: "Full-time", field: "business", req: { age: 30, edu: "bachelor", smarts: 80 }, desc: "Make the big decisions." }
];

export const JOB_MAP = Object.fromEntries(JOBS.map(j => [j.id, j]));

export const EDU_RANK = { none: 0, hs: 1, trade: 1, bachelor: 2, master: 3 };

export const CAREER_PREFIXES = ["", "Senior", "Lead", "Manager", "Director", "Vice President", "Chief"];

export function jobTitleForLevel(base, level) {
  if (level <= 1) return base;
  const prefix = CAREER_PREFIXES[Math.min(level - 1, CAREER_PREFIXES.length - 1)];
  return prefix ? `${prefix} ${base}` : base;
}

export function jobRequirementText(job) {
  const parts = [];
  if (job.req.age) parts.push(`${job.req.age}+`);
  if (job.req.edu) {
    const label = { hs: "High school", trade: "Trade school", bachelor: "Bachelor's", master: "Master's" }[job.req.edu] || job.req.edu;
    parts.push(label);
  }
  if (job.req.smarts) parts.push(`Smarts ${job.req.smarts}+`);
  if (job.req.looks) parts.push(`Looks ${job.req.looks}+`);
  if (job.req.health) parts.push(`Health ${job.req.health}+`);
  if (job.req.fame) parts.push(`Fame ${job.req.fame}+`);
  return parts.join(" • ");
}

export function jobMeetsRequirements(job, p) {
  if (p.age < (job.req.age || 0)) return false;
  if (job.req.edu && (EDU_RANK[p.education.level] || 0) < (EDU_RANK[job.req.edu] || 0)) return false;
  if (job.req.smarts && p.stats.smarts < job.req.smarts) return false;
  if (job.req.looks && p.stats.looks < job.req.looks) return false;
  if (job.req.health && p.stats.health < job.req.health) return false;
  if (job.req.fame && p.fame < job.req.fame) return false;
  if (p.inPrison > 0) return false;
  return true;
}
