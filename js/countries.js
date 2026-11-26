export const COUNTRIES = {
  US: {
    code: "US", name: "United States", flag: "🇺🇸", demonym: "American",
    currency: { symbol: "$", code: "USD", rate: 1, locale: "en-US" },
    cities: ["New York", "Los Angeles", "Chicago", "Houston", "Miami", "Seattle", "Denver", "Boston"],
    names: {
      male: ["James", "Michael", "Ethan", "Noah", "Liam", "Mason", "Lucas", "Benjamin", "Henry", "Daniel"],
      female: ["Olivia", "Emma", "Ava", "Sophia", "Isabella", "Mia", "Charlotte", "Amelia", "Harper", "Evelyn"],
      last: ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
    }
  },
  GB: {
    code: "GB", name: "United Kingdom", flag: "🇬🇧", demonym: "British",
    currency: { symbol: "£", code: "GBP", rate: 0.79, locale: "en-GB" },
    cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Bristol", "Edinburgh"],
    names: {
      male: ["Oliver", "Harry", "Jack", "George", "Charlie", "Thomas", "Oscar", "William", "James", "Henry"],
      female: ["Amelia", "Olivia", "Isla", "Emily", "Poppy", "Ava", "Isabella", "Jessica", "Lily", "Sophie"],
      last: ["Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson", "Davies"]
    }
  },
  CA: {
    code: "CA", name: "Canada", flag: "🇨🇦", demonym: "Canadian",
    currency: { symbol: "$", code: "CAD", rate: 1.36, locale: "en-CA" },
    cities: ["Toronto", "Vancouver", "Montreal", "Calgary", "Ottawa", "Edmonton", "Winnipeg", "Halifax"],
    names: {
      male: ["Liam", "Noah", "William", "Benjamin", "Lucas", "Logan", "Jack", "Owen", "Ethan", "Nathan"],
      female: ["Olivia", "Emma", "Charlotte", "Amelia", "Sophia", "Ava", "Chloe", "Ella", "Abigail", "Grace"],
      last: ["Smith", "Brown", "Tremblay", "Martin", "Roy", "Wilson", "MacDonald", "Gagnon"]
    }
  },
  AU: {
    code: "AU", name: "Australia", flag: "🇦🇺", demonym: "Australian",
    currency: { symbol: "$", code: "AUD", rate: 1.52, locale: "en-AU" },
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Hobart"],
    names: {
      male: ["Oliver", "Jack", "William", "Noah", "Thomas", "Henry", "Leo", "Charlie", "Lucas", "Cooper"],
      female: ["Charlotte", "Olivia", "Amelia", "Isla", "Mia", "Ava", "Grace", "Chloe", "Harper", "Ruby"],
      last: ["Smith", "Jones", "Williams", "Brown", "Wilson", "Taylor", "Nguyen", "Martin"]
    }
  },
  IN: {
    code: "IN", name: "India", flag: "🇮🇳", demonym: "Indian",
    currency: { symbol: "₹", code: "INR", rate: 83.5, locale: "en-IN" },
    cities: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Kolkata", "Pune", "Jaipur"],
    names: {
      male: ["Aarav", "Vivaan", "Aditya", "Arjun", "Rohan", "Kabir", "Ishaan", "Reyansh", "Krishna", "Dhruv"],
      female: ["Aadhya", "Ananya", "Diya", "Saanvi", "Aarohi", "Ishita", "Kavya", "Meera", "Riya", "Priya"],
      last: ["Sharma", "Patel", "Singh", "Kumar", "Gupta", "Reddy", "Nair", "Iyer"]
    }
  },
  JP: {
    code: "JP", name: "Japan", flag: "🇯🇵", demonym: "Japanese",
    currency: { symbol: "¥", code: "JPY", rate: 151, locale: "ja-JP" },
    cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Sapporo", "Nagoya", "Fukuoka", "Kobe"],
    names: {
      male: ["Haruto", "Yuto", "Sota", "Yuki", "Ren", "Kaito", "Riku", "Daiki", "Takumi", "Hiro"],
      female: ["Yui", "Aoi", "Hina", "Sakura", "Rin", "Mei", "Yuna", "Akari", "Mio", "Hana"],
      last: ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura"]
    }
  },
  BR: {
    code: "BR", name: "Brazil", flag: "🇧🇷", demonym: "Brazilian",
    currency: { symbol: "R$", code: "BRL", rate: 5.0, locale: "pt-BR" },
    cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Curitiba", "Recife", "Porto Alegre"],
    names: {
      male: ["Miguel", "Arthur", "Heitor", "Bernardo", "Gabriel", "Lucas", "Matheus", "Rafael", "Pedro", "Thiago"],
      female: ["Alice", "Sophia", "Helena", "Valentina", "Laura", "Isabella", "Manuela", "Júlia", "Heloísa", "Beatriz"],
      last: ["Silva", "Santos", "Oliveira", "Souza", "Rodrigues", "Ferreira", "Alves", "Lima"]
    }
  },
  MX: {
    code: "MX", name: "Mexico", flag: "🇲🇽", demonym: "Mexican",
    currency: { symbol: "$", code: "MXN", rate: 17.2, locale: "es-MX" },
    cities: ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "Cancún", "Mérida", "Querétaro"],
    names: {
      male: ["Santiago", "Mateo", "Sebastián", "Leonardo", "Emiliano", "Diego", "Miguel", "Daniel", "Alejandro", "Carlos"],
      female: ["Sofía", "Valentina", "Camila", "Isabella", "Ximena", "María", "Regina", "Renata", "Fernanda", "Lucía"],
      last: ["Hernández", "García", "Martínez", "López", "González", "Pérez", "Sánchez", "Ramírez"]
    }
  },
  DE: {
    code: "DE", name: "Germany", flag: "🇩🇪", demonym: "German",
    currency: { symbol: "€", code: "EUR", rate: 0.92, locale: "de-DE" },
    cities: ["Berlin", "Munich", "Hamburg", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig"],
    names: {
      male: ["Lukas", "Maximilian", "Felix", "Jonas", "Leon", "Paul", "Elias", "Noah", "Ben", "Finn"],
      female: ["Emma", "Mia", "Hannah", "Lena", "Sophie", "Marie", "Lea", "Anna", "Emilia", "Clara"],
      last: ["Müller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker"]
    }
  },
  FR: {
    code: "FR", name: "France", flag: "🇫🇷", demonym: "French",
    currency: { symbol: "€", code: "EUR", rate: 0.92, locale: "fr-FR" },
    cities: ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Bordeaux", "Lille"],
    names: {
      male: ["Lucas", "Gabriel", "Louis", "Raphael", "Arthur", "Hugo", "Jules", "Adam", "Nathan", "Theo"],
      female: ["Emma", "Louise", "Jade", "Alice", "Chloé", "Léa", "Manon", "Camille", "Inès", "Sarah"],
      last: ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand"]
    }
  },
  NG: {
    code: "NG", name: "Nigeria", flag: "🇳🇬", demonym: "Nigerian",
    currency: { symbol: "₦", code: "NGN", rate: 1500, locale: "en-NG" },
    cities: ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Kano", "Benin City", "Enugu", "Abeokuta"],
    names: {
      male: ["Chinedu", "Emeka", "Tunde", "Damilola", "Ifeanyi", "Kunle", "Segun", "Obinna", "Adewale", "Femi"],
      female: ["Adaeze", "Chiamaka", "Ngozi", "Amara", "Folake", "Zainab", "Ifeoma", "Temi", "Ada", "Bisi"],
      last: ["Okafor", "Adeyemi", "Eze", "Okonkwo", "Balogun", "Ogunleye", "Nwosu", "Adebayo"]
    }
  },
  ZA: {
    code: "ZA", name: "South Africa", flag: "🇿🇦", demonym: "South African",
    currency: { symbol: "R", code: "ZAR", rate: 18.5, locale: "en-ZA" },
    cities: ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "Stellenbosch", "Soweto"],
    names: {
      male: ["Thabo", "Sipho", "Liam", "Daniel", "Sibusiso", "Johan", "Kagiso", "Themba", "Pieter", "Lwazi"],
      female: ["Thandiwe", "Naledi", "Amahle", "Zanele", "Lerato", "Nomsa", "Anika", "Ayanda", "Precious", "Elsa"],
      last: ["Dlamini", "Nkosi", "Botha", "van der Merwe", "Khumalo", "Mokoena", "Naidoo", "Smith"]
    }
  },
  PH: {
    code: "PH", name: "Philippines", flag: "🇵🇭", demonym: "Filipino",
    currency: { symbol: "₱", code: "PHP", rate: 56.5, locale: "en-PH" },
    cities: ["Manila", "Quezon City", "Cebu City", "Davao", "Makati", "Iloilo", "Baguio", "Cagayan de Oro"],
    names: {
      male: ["Miguel", "Jose", "Angelo", "Gabriel", "Rafael", "Marco", "Paolo", "Carlo", "Luis", "Diego"],
      female: ["Maria", "Angelica", "Sofia", "Bea", "Camille", "Jasmine", "Nicole", "Andrea", "Isabel", "Liza"],
      last: ["Santos", "Reyes", "Cruz", "Bautista", "Garcia", "Mendoza", "Torres", "Flores"]
    }
  },
  KR: {
    code: "KR", name: "South Korea", flag: "🇰🇷", demonym: "South Korean",
    currency: { symbol: "₩", code: "KRW", rate: 1340, locale: "ko-KR" },
    cities: ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Jeju"],
    names: {
      male: ["Min-jun", "Ji-ho", "Seo-jun", "Do-yun", "Ha-jun", "Eun-woo", "Si-woo", "Joon", "Hyun", "Tae-yang"],
      female: ["Seo-yeon", "Ji-woo", "Min-seo", "Ha-eun", "Soo-ah", "Ye-jin", "Da-eun", "Chae-won", "Yu-na", "Eun-bi"],
      last: ["Kim", "Lee", "Park", "Choi", "Jung", "Kang", "Cho", "Yoon"]
    }
  },
  ES: {
    code: "ES", name: "Spain", flag: "🇪🇸", demonym: "Spanish",
    currency: { symbol: "€", code: "EUR", rate: 0.92, locale: "es-ES" },
    cities: ["Madrid", "Barcelona", "Valencia", "Seville", "Bilbao", "Málaga", "Zaragoza", "Granada"],
    names: {
      male: ["Hugo", "Mateo", "Daniel", "Pablo", "Alejandro", "Adrián", "David", "Javier", "Sergio", "Carlos"],
      female: ["Lucía", "Sofía", "Martina", "Paula", "Julia", "Alba", "Carmen", "Sara", "Elena", "Valeria"],
      last: ["García", "Fernández", "González", "Rodríguez", "López", "Martínez", "Sánchez", "Pérez"]
    }
  },
  IT: {
    code: "IT", name: "Italy", flag: "🇮🇹", demonym: "Italian",
    currency: { symbol: "€", code: "EUR", rate: 0.92, locale: "it-IT" },
    cities: ["Rome", "Milan", "Naples", "Turin", "Florence", "Bologna", "Venice", "Palermo"],
    names: {
      male: ["Leonardo", "Francesco", "Alessandro", "Lorenzo", "Matteo", "Andrea", "Gabriele", "Riccardo", "Tommaso", "Marco"],
      female: ["Sofia", "Giulia", "Aurora", "Alice", "Ginevra", "Emma", "Giorgia", "Greta", "Beatrice", "Chiara"],
      last: ["Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci"]
    }
  },
  SE: {
    code: "SE", name: "Sweden", flag: "🇸🇪", demonym: "Swedish",
    currency: { symbol: "kr", code: "SEK", rate: 10.5, locale: "sv-SE" },
    cities: ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Linköping", "Örebro", "Helsingborg", "Kiruna"],
    names: {
      male: ["William", "Liam", "Noah", "Hugo", "Elias", "Oscar", "Adam", "Leo", "Axel", "Filip"],
      female: ["Alice", "Maja", "Elsa", "Astrid", "Alma", "Vera", "Selma", "Ella", "Wilma", "Freja"],
      last: ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson"]
    }
  },
  AE: {
    code: "AE", name: "United Arab Emirates", flag: "🇦🇪", demonym: "Emirati",
    currency: { symbol: "د.إ", code: "AED", rate: 3.67, locale: "en-AE" },
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Al Ain", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain"],
    names: {
      male: ["Mohammed", "Ahmed", "Ali", "Omar", "Khalid", "Rashid", "Hamdan", "Saeed", "Yousef", "Faisal"],
      female: ["Fatima", "Aisha", "Maryam", "Noura", "Layla", "Hessa", "Shamma", "Amal", "Salma", "Reem"],
      last: ["Al Maktoum", "Al Nahyan", "Al Falasi", "Al Mansoori", "Al Suwaidi", "Al Marri", "Al Hashimi", "Al Ali"]
    }
  }
};

export const COUNTRY_LIST = Object.values(COUNTRIES);

export const MAJORS = [
  { id: "cs", name: "Computer Science", icon: "💻", desc: "Software, AI, and the future.", field: "tech", smarts: 4 },
  { id: "business", name: "Business", icon: "📈", desc: "Management, finance, and startups.", field: "business", smarts: 2 },
  { id: "medicine", name: "Pre-Medicine", icon: "🩺", desc: "The long road to becoming a doctor.", field: "medical", smarts: 5 },
  { id: "law", name: "Political Science", icon: "⚖️", desc: "Law, government, and debate.", field: "law", smarts: 4 },
  { id: "engineering", name: "Engineering", icon: "⚙️", desc: "Build the things that build the world.", field: "engineering", smarts: 5 },
  { id: "arts", name: "Fine Arts", icon: "🎨", desc: "Create, perform, and inspire.", field: "arts", smarts: 1 },
  { id: "education", name: "Education", icon: "📚", desc: "Shape the next generation.", field: "education", smarts: 2 },
  { id: "nursing", name: "Nursing", icon: "🏥", desc: "Care for people when they need it most.", field: "medical", smarts: 3 },
  { id: "psychology", name: "Psychology", icon: "🧠", desc: "Understand the human mind.", field: "science", smarts: 3 },
  { id: "biology", name: "Biology", icon: "🧬", desc: "Study life itself.", field: "science", smarts: 4 }
];

export function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

export function randomName(countryCode, gender) {
  const c = COUNTRIES[countryCode] || COUNTRIES.US;
  const pool = gender === "female" ? c.names.female : c.names.male;
  return { first: randomFrom(pool), last: randomFrom(c.names.last) };
}
