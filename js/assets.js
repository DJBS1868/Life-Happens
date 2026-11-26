export const ASSET_CATALOG = [
  { id: "studio", type: "home", name: "Studio Apartment", icon: "🏢", price: 85000, upkeep: 4800, happiness: 5, desc: "A small place to call your own." },
  { id: "townhouse", type: "home", name: "Townhouse", icon: "🏘️", price: 210000, upkeep: 9600, happiness: 8, desc: "Two floors, one friendly neighborhood." },
  { id: "suburban", type: "home", name: "Suburban House", icon: "🏡", price: 340000, upkeep: 14000, happiness: 11, desc: "A yard, a driveway, and room to grow." },
  { id: "beach", type: "home", name: "Beach House", icon: "🏖️", price: 850000, upkeep: 38000, happiness: 16, desc: "Wake up to the sound of waves." },
  { id: "penthouse", type: "home", name: "City Penthouse", icon: "🌆", price: 2100000, upkeep: 96000, happiness: 20, desc: "A skyline view from the top floor." },
  { id: "mansion", type: "home", name: "Country Mansion", icon: "🏰", price: 5200000, upkeep: 240000, happiness: 25, desc: "Too many rooms. Perfect." },

  { id: "used_car", type: "vehicle", name: "Used Sedan", icon: "🚗", price: 7500, upkeep: 2200, happiness: 4, desc: "It runs. Mostly." },
  { id: "new_car", type: "vehicle", name: "New Sedan", icon: "🚙", price: 28000, upkeep: 3400, happiness: 6, desc: "That new car smell." },
  { id: "suv", type: "vehicle", name: "Family SUV", icon: "🚐", price: 46000, upkeep: 4200, happiness: 7, desc: "Room for everyone and everything." },
  { id: "sports", type: "vehicle", name: "Sports Car", icon: "🏎️", price: 125000, upkeep: 12000, happiness: 12, desc: "Loud, fast, and impractical." },
  { id: "ev", type: "vehicle", name: "Luxury Electric", icon: "⚡", price: 95000, upkeep: 5200, happiness: 10, desc: "Silent, sleek, and plugged in." },
  { id: "boat", type: "vehicle", name: "Motor Yacht", icon: "🛥️", price: 950000, upkeep: 85000, happiness: 18, desc: "Weekends on the water." },
  { id: "jet", type: "vehicle", name: "Private Jet", icon: "✈️", price: 8500000, upkeep: 600000, happiness: 26, desc: "Skip the airport entirely." },

  { id: "watch", type: "luxury", name: "Designer Watch", icon: "⌚", price: 8500, upkeep: 0, happiness: 4, desc: "Tell time in style." },
  { id: "art", type: "luxury", name: "Art Collection", icon: "🖼️", price: 65000, upkeep: 1200, happiness: 8, desc: "Culture on the walls." },
  { id: "jewelry", type: "luxury", name: "Fine Jewelry", icon: "💎", price: 42000, upkeep: 0, happiness: 7, desc: "A little sparkle never hurts." },
  { id: "piano", type: "luxury", name: "Grand Piano", icon: "🎹", price: 38000, upkeep: 800, happiness: 7, desc: "Learn one song. Play it forever." },
  { id: "wine", type: "luxury", name: "Wine Cellar", icon: "🍷", price: 120000, upkeep: 2400, happiness: 10, desc: "Aged to perfection." },
  { id: "island", type: "luxury", name: "Private Island", icon: "🏝️", price: 18000000, upkeep: 900000, happiness: 30, desc: "Your own patch of paradise." }
];

export const ASSET_MAP = Object.fromEntries(ASSET_CATALOG.map(a => [a.id, a]));

export const ASSET_TYPES = [
  { id: "home", name: "Properties", icon: "🏠", blurb: "A place to call home." },
  { id: "vehicle", name: "Vehicles", icon: "🚗", blurb: "Get around in style." },
  { id: "luxury", name: "Luxury", icon: "💎", blurb: "The finer things in life." }
];
