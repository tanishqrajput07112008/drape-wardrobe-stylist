// Shared, client-safe styling vocabulary for Drape.

export type Slot = "top" | "bottom" | "outerwear" | "full" | "footwear" | "accessory";

export const GARMENT_CATEGORIES = [
  "Top",
  "Bottom",
  "Outerwear",
  "One-piece",
  "Traditional ensemble",
  "Traditional top",
  "Traditional bottom",
  "Traditional layer",
] as const;

export const ACCESSORY_CATEGORIES = [
  "Footwear",
  "Jewellery",
  "Bag",
  "Watch",
  "Belt",
  "Scarf / dupatta",
  "Headwear",
  "Eyewear",
  "Other accessory",
] as const;

export const ALL_CATEGORIES = [...GARMENT_CATEGORIES, ...ACCESSORY_CATEGORIES];

export const SUBCATEGORY_HINTS: Record<string, string[]> = {
  Top: ["Shirt", "T-shirt", "Polo", "Blouse", "Sweater", "Crop top", "Tank"],
  Bottom: ["Trousers", "Chinos", "Jeans", "Skirt", "Shorts", "Joggers"],
  Outerwear: ["Blazer", "Jacket", "Cardigan", "Overshirt", "Coat", "Shrug"],
  "One-piece": ["Dress", "Jumpsuit", "Co-ord set", "Suit"],
  "Traditional ensemble": ["Saree", "Lehenga", "Salwar suit", "Anarkali", "Sherwani", "Kurta set", "Sharara set"],
  "Traditional top": ["Kurta", "Kurti", "Saree blouse", "Choli", "Pathani"],
  "Traditional bottom": ["Churidar", "Salwar", "Palazzo", "Dhoti", "Patiala", "Pyjama"],
  "Traditional layer": ["Nehru jacket", "Bandhgala", "Waistcoat", "Shrug", "Achkan"],
  Footwear: ["Sneakers", "Loafers", "Oxfords", "Mojaris", "Juttis", "Kolhapuris", "Heels", "Sandals", "Boots"],
  Jewellery: ["Earrings", "Jhumkas", "Necklace", "Bangles", "Ring", "Maang tikka", "Kada", "Brooch"],
  Bag: ["Potli", "Clutch", "Tote", "Backpack", "Sling"],
  Watch: ["Analog", "Digital", "Smartwatch"],
  Belt: ["Leather belt", "Kamarbandh", "Fabric belt"],
  "Scarf / dupatta": ["Dupatta", "Stole", "Scarf", "Pocket square"],
  Headwear: ["Safa / pagdi", "Cap", "Hat"],
  Eyewear: ["Sunglasses", "Frames"],
  "Other accessory": ["Tie", "Cufflinks", "Hair accessory"],
};

export function kindForCategory(category: string): "garment" | "footwear" | "accessory" {
  if ((GARMENT_CATEGORIES as readonly string[]).includes(category)) return "garment";
  if (category === "Footwear") return "footwear";
  return "accessory";
}

export function slotForCategory(category: string): Slot {
  switch (category) {
    case "Top":
    case "Traditional top":
      return "top";
    case "Bottom":
    case "Traditional bottom":
      return "bottom";
    case "Outerwear":
    case "Traditional layer":
      return "outerwear";
    case "One-piece":
    case "Traditional ensemble":
      return "full";
    case "Footwear":
      return "footwear";
    default:
      return "accessory";
  }
}

export const SLOT_LABEL: Record<Slot, string> = {
  top: "Top",
  bottom: "Bottom",
  outerwear: "Layer",
  full: "Ensemble",
  footwear: "Footwear",
  accessory: "Accessory",
};

export interface OccasionDef {
  id: string;
  label: string;
  formality: number; // 1 casual – 5 very formal
  traditional: boolean; // Indian occasion — prefer traditional layers
}

export const OCCASIONS: OccasionDef[] = [
  { id: "college", label: "College", formality: 2, traditional: false },
  { id: "office", label: "Office", formality: 3, traditional: false },
  { id: "interview", label: "Interview", formality: 4, traditional: false },
  { id: "casual", label: "Casual outing", formality: 1, traditional: false },
  { id: "date", label: "Date", formality: 3, traditional: false },
  { id: "party", label: "Party", formality: 3, traditional: false },
  { id: "birthday", label: "Birthday", formality: 2, traditional: false },
  { id: "wedding-guest", label: "Wedding guest", formality: 4, traditional: false },
  { id: "indian-wedding", label: "Indian wedding", formality: 5, traditional: true },
  { id: "sangeet", label: "Sangeet", formality: 4, traditional: true },
  { id: "mehendi", label: "Mehendi", formality: 3, traditional: true },
  { id: "haldi", label: "Haldi", formality: 2, traditional: true },
  { id: "reception", label: "Reception", formality: 5, traditional: false },
  { id: "puja", label: "Puja / festival", formality: 3, traditional: true },
  { id: "travel", label: "Travel", formality: 1, traditional: false },
];

export function occasionById(id: string | null | undefined): OccasionDef | undefined {
  return OCCASIONS.find((o) => o.id === id);
}

export const FORMALITY_LABEL = ["", "Relaxed", "Smart casual", "Polished", "Formal", "Festive / black tie"];

export const AVAILABILITY = [
  { id: "clean", label: "Ready to wear" },
  { id: "laundry", label: "In laundry" },
  { id: "alteration", label: "At alteration" },
] as const;

export const SEASONS = ["Summer", "Monsoon", "Winter", "All-season"];
export const PATTERNS = ["Solid", "Stripes", "Checks", "Floral", "Print", "Embroidered", "Zari / brocade", "Bandhani", "Ikat", "Block print", "Textured"];
export const FABRICS = ["Cotton", "Linen", "Silk", "Denim", "Wool", "Chiffon", "Georgette", "Velvet", "Khadi", "Polyester", "Leather", "Metal", "Knit"];

export const STYLE_PREFS = ["Minimal", "Smart casual", "Streetwear", "Classic", "Ethnic / traditional", "Formal", "Experimental", "Boho", "Sporty", "Indo-western"];
export const PRIMARY_USES = ["Daily outfits", "College / work", "Dates & social events", "Weddings & festivals", "Travel"];
export const LIFESTYLES = ["Student", "Professional", "Creator", "Freelancer", "Homemaker", "Other"];
export const CLIMATES = ["Hot & humid", "Hot & dry", "Moderate", "Cold", "Monsoon-heavy"];

export const COLOR_SWATCH: Record<string, string> = {
  black: "oklch(0.2 0 0)",
  white: "oklch(0.98 0 0)",
  ivory: "oklch(0.96 0.02 90)",
  cream: "oklch(0.93 0.04 90)",
  beige: "oklch(0.86 0.05 80)",
  camel: "oklch(0.7 0.09 70)",
  brown: "oklch(0.45 0.07 55)",
  tan: "oklch(0.72 0.08 65)",
  grey: "oklch(0.65 0 0)",
  charcoal: "oklch(0.35 0.005 260)",
  navy: "oklch(0.3 0.08 265)",
  blue: "oklch(0.55 0.15 255)",
  "sky blue": "oklch(0.8 0.08 235)",
  teal: "oklch(0.55 0.09 195)",
  green: "oklch(0.55 0.12 145)",
  olive: "oklch(0.5 0.07 120)",
  "bottle green": "oklch(0.38 0.08 160)",
  mint: "oklch(0.88 0.07 160)",
  yellow: "oklch(0.88 0.15 95)",
  mustard: "oklch(0.72 0.13 85)",
  gold: "oklch(0.75 0.12 85)",
  orange: "oklch(0.7 0.16 55)",
  rust: "oklch(0.55 0.13 45)",
  red: "oklch(0.55 0.2 27)",
  maroon: "oklch(0.35 0.12 20)",
  pink: "oklch(0.8 0.1 0)",
  "rani pink": "oklch(0.58 0.22 355)",
  peach: "oklch(0.85 0.07 50)",
  lavender: "oklch(0.8 0.07 300)",
  purple: "oklch(0.45 0.15 305)",
  silver: "oklch(0.8 0.01 260)",
  multicolour: "conic-gradient(oklch(0.7 0.15 30), oklch(0.75 0.15 100), oklch(0.6 0.12 200), oklch(0.6 0.15 320), oklch(0.7 0.15 30))",
};

export const COLOR_NAMES = Object.keys(COLOR_SWATCH);

export function swatch(color: string): string {
  return COLOR_SWATCH[color.toLowerCase()] ?? "oklch(0.8 0.02 80)";
}

export const FEEDBACK_REASONS = [
  "Colour",
  "Comfort",
  "Too formal",
  "Too casual",
  "Doesn't feel like me",
  "Item unavailable",
];