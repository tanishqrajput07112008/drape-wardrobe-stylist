import type { TablesInsert } from "@/integrations/supabase/types";

type Demo = Omit<TablesInsert<"wardrobe_items">, "user_id" | "kind" | "is_demo">;

export const DEMO_ITEMS: Demo[] = [
  { name: "White oxford shirt", category: "Top", subcategory: "Shirt", colors: ["white"], fabric: "Cotton", pattern: "Solid", formality: 3, seasons: ["All-season"], occasions: ["Office", "Interview", "Date"], style_tags: ["classic"] },
  { name: "Navy polo", category: "Top", subcategory: "Polo", colors: ["navy"], fabric: "Knit", pattern: "Solid", formality: 2, seasons: ["Summer"], occasions: ["College", "Casual outing"], style_tags: ["smart casual"] },
  { name: "Black ribbed top", category: "Top", subcategory: "Top", colors: ["black"], fabric: "Knit", pattern: "Solid", formality: 2, seasons: ["All-season"], occasions: ["Date", "Party"], style_tags: ["minimal"] },
  { name: "Beige chinos", category: "Bottom", subcategory: "Chinos", colors: ["beige"], fabric: "Cotton", pattern: "Solid", formality: 3, seasons: ["All-season"], occasions: ["Office", "Date"], style_tags: ["classic"] },
  { name: "Dark indigo jeans", category: "Bottom", subcategory: "Jeans", colors: ["navy"], fabric: "Denim", pattern: "Solid", formality: 2, seasons: ["Winter", "All-season"], occasions: ["College", "Casual outing", "Party"], style_tags: ["streetwear"] },
  { name: "Charcoal blazer", category: "Outerwear", subcategory: "Blazer", colors: ["charcoal"], fabric: "Wool", pattern: "Solid", formality: 4, seasons: ["Winter", "All-season"], occasions: ["Interview", "Reception"], style_tags: ["formal"] },
  { name: "Ivory chikankari kurta", category: "Traditional top", subcategory: "Kurta", colors: ["ivory"], fabric: "Cotton", pattern: "Embroidered", formality: 3, seasons: ["Summer"], occasions: ["Puja / festival", "Mehendi", "Haldi"], style_tags: ["ethnic"] },
  { name: "White churidar", category: "Traditional bottom", subcategory: "Churidar", colors: ["white"], fabric: "Cotton", pattern: "Solid", formality: 3, seasons: ["All-season"], occasions: ["Puja / festival", "Sangeet"], style_tags: ["ethnic"] },
  { name: "Bottle-green Nehru jacket", category: "Traditional layer", subcategory: "Nehru jacket", colors: ["bottle green"], fabric: "Silk", pattern: "Textured", formality: 4, seasons: ["All-season"], occasions: ["Indian wedding", "Sangeet", "Reception"], style_tags: ["ethnic", "festive"] },
  { name: "Rani pink Banarasi saree", category: "Traditional ensemble", subcategory: "Saree", colors: ["rani pink", "gold"], fabric: "Silk", pattern: "Zari / brocade", formality: 5, seasons: ["All-season"], occasions: ["Indian wedding", "Reception", "Puja / festival"], style_tags: ["ethnic", "festive"] },
  { name: "Mustard anarkali set", category: "Traditional ensemble", subcategory: "Anarkali", colors: ["mustard"], fabric: "Georgette", pattern: "Block print", formality: 3, seasons: ["Summer", "Monsoon"], occasions: ["Haldi", "Mehendi"], style_tags: ["ethnic"] },
  { name: "Tan leather loafers", category: "Footwear", subcategory: "Loafers", colors: ["tan"], fabric: "Leather", formality: 3, seasons: ["All-season"], occasions: ["Office", "Date"], style_tags: ["classic"] },
  { name: "Gold embroidered mojaris", category: "Footwear", subcategory: "Mojaris", colors: ["gold"], fabric: "Leather", formality: 4, seasons: ["All-season"], occasions: ["Indian wedding", "Sangeet"], style_tags: ["ethnic"] },
  { name: "White sneakers", category: "Footwear", subcategory: "Sneakers", colors: ["white"], fabric: "Leather", formality: 1, seasons: ["All-season"], occasions: ["College", "Travel", "Casual outing"], style_tags: ["minimal"] },
  { name: "Antique gold jhumkas", category: "Jewellery", subcategory: "Jhumkas", colors: ["gold"], fabric: "Metal", formality: 4, seasons: ["All-season"], occasions: ["Indian wedding", "Puja / festival"], style_tags: ["ethnic"] },
  { name: "Steel analog watch", category: "Watch", subcategory: "Analog", colors: ["silver"], fabric: "Metal", formality: 3, seasons: ["All-season"], occasions: ["Office", "Interview"], style_tags: ["classic"] },
  { name: "Brown leather belt", category: "Belt", subcategory: "Leather belt", colors: ["brown"], fabric: "Leather", formality: 3, seasons: ["All-season"], occasions: ["Office"], style_tags: ["classic"] },
  { name: "Embroidered potli", category: "Bag", subcategory: "Potli", colors: ["maroon", "gold"], fabric: "Silk", formality: 4, seasons: ["All-season"], occasions: ["Indian wedding", "Sangeet"], style_tags: ["ethnic"] },
];