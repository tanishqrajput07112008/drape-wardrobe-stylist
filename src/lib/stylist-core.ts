// Pure, client-safe stylist logic: shared types, AI output validation and
// the deterministic rule-based fallback matcher. No server or network imports.
import { occasionById, slotForCategory, type Slot } from "./constants";

export interface StylistItem {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  colors: string[];
  pattern: string | null;
  fabric: string | null;
  formality: number;
  seasons: string[];
  occasions: string[];
  style_tags: string[];
  availability: string;
  favorite: boolean;
  last_worn_at: string | null;
}

export interface StylistRequest {
  occasion: string;
  date?: string;
  weather?: string;
  formality?: number;
  vibe?: string;
  comfort?: string;
  includeColors?: string[];
  avoidColors?: string[];
  mustWearId?: string;
  wardrobeOnly: boolean;
  extra?: string;
}

export interface LookSlot {
  slot: Slot;
  item_id: string;
}

export interface Look {
  name: string;
  occasion_fit: string;
  slots: LookSlot[];
  colour_story: string;
  why: string;
  weather_note: string;
  swaps: { slot: Slot; item_id: string; note: string }[];
  missing: string[];
}

export interface StylistResult {
  source: "ai" | "rules";
  notice?: string;
  looks: Look[];
}

/** Keep only looks/slots/swaps whose item IDs belong to the user's available wardrobe. */
export function validateLooks(raw: unknown, items: StylistItem[]): Look[] {
  const byId = new Map(items.filter((i) => i.availability === "clean").map((i) => [i.id, i]));
  const arr = Array.isArray(raw) ? raw : (raw as { looks?: unknown })?.looks;
  if (!Array.isArray(arr)) return [];
  const out: Look[] = [];
  for (const l of arr.slice(0, 4)) {
    if (!l || typeof l !== "object") continue;
    const r = l as Record<string, unknown>;
    const seen = new Set<string>();
    const slots: LookSlot[] = [];
    for (const s of Array.isArray(r.slots) ? r.slots : []) {
      const id = (s as { item_id?: unknown })?.item_id;
      if (typeof id !== "string" || !byId.has(id) || seen.has(id)) continue;
      seen.add(id);
      slots.push({ slot: slotForCategory(items.find((item) => item.id === id)?.category ?? ""), item_id: id });
    }
    const hasCore =
      slots.some((s) => s.slot === "full") ||
      (slots.some((s) => s.slot === "top") && slots.some((s) => s.slot === "bottom"));
    if (!hasCore) continue;
    const swaps = (Array.isArray(r.swaps) ? r.swaps : [])
      .map((s) => s as { item_id?: unknown; note?: unknown })
      .filter((s) => typeof s.item_id === "string" && byId.has(s.item_id) && !seen.has(s.item_id))
      .slice(0, 4)
      .map((s) => ({
        slot: slotForCategory(items.find((item) => item.id === s.item_id)?.category ?? ""),
        item_id: s.item_id as string,
        note: typeof s.note === "string" ? s.note : "",
      }));
    const str = (v: unknown) => (typeof v === "string" ? v.slice(0, 600) : "");
    out.push({
      name: str(r.name) || "Untitled look",
      occasion_fit: str(r.occasion_fit),
      slots,
      colour_story: str(r.colour_story),
      why: str(r.why),
      weather_note: str(r.weather_note),
      swaps,
      missing: (Array.isArray(r.missing) ? r.missing : []).filter((m): m is string => typeof m === "string").slice(0, 4),
    });
  }
  return out;
}

const DAY = 86_400_000;

function score(item: StylistItem, req: StylistRequest, rejected: Set<string>, now: number): number {
  const occ = occasionById(req.occasion);
  const target = req.formality ?? occ?.formality ?? 3;
  let s = 10 - Math.abs(item.formality - target) * 3;
  if (occ && item.occasions.map((o) => o.toLowerCase()).includes(occ.label.toLowerCase())) s += 4;
  const traditional = item.category.startsWith("Traditional") || item.category === "Scarf / dupatta";
  if (occ?.traditional) s += traditional ? 5 : -2;
  const colors = item.colors.map((c) => c.toLowerCase());
  if (req.includeColors?.some((c) => colors.includes(c.toLowerCase()))) s += 3;
  if (req.avoidColors?.some((c) => colors.includes(c.toLowerCase()))) s -= 20;
  if (item.favorite) s += 1;
  if (item.last_worn_at && now - new Date(item.last_worn_at).getTime() < 3 * DAY) s -= 4;
  if (rejected.has(item.id)) s -= 3;
  return s;
}

/**
 * Deterministic wardrobe matcher used when AI is unavailable.
 * Returns up to 3 looks built only from the supplied (available) items.
 */
export function ruleBasedLooks(
  items: StylistItem[],
  req: StylistRequest,
  rejectedIds: string[] = [],
  now = Date.now(),
): Look[] {
  const rejected = new Set(rejectedIds);
  const pool = items.filter((i) => i.availability === "clean" && !req.avoidColors?.some((c) => i.colors.map((x) => x.toLowerCase()).includes(c.toLowerCase())));
  const bySlot = (slot: Slot) =>
    pool
      .filter((i) => slotForCategory(i.category) === slot)
      .sort((a, b) => score(b, req, rejected, now) - score(a, req, rejected, now) || a.name.localeCompare(b.name));
  const tops = bySlot("top");
  const bottoms = bySlot("bottom");
  const full = bySlot("full");
  const layers = bySlot("outerwear");
  const shoes = bySlot("footwear");
  const acc = bySlot("accessory");
  const must = req.mustWearId ? pool.find((i) => i.id === req.mustWearId) : undefined;
  const occ = occasionById(req.occasion);
  const target = req.formality ?? occ?.formality ?? 3;

  type Base = StylistItem[];
  const bases: Base[] = [];
  const preferFull = occ?.traditional || target >= 4;
  const fullBases = full.map((f) => [f]);
  const sepBases: Base[] = [];
  tops.slice(0, 4).forEach((t, ti) => {
    bottoms.slice(0, 4).forEach((b, bi) => {
      if ((ti + bi) % 1 === 0) sepBases.push([t, b]);
    });
  });
  sepBases.sort((a, b) => b.reduce((sum, i) => sum + score(i, req, rejected, now), 0) - a.reduce((sum, i) => sum + score(i, req, rejected, now), 0));
  bases.push(...(preferFull ? [...fullBases, ...sepBases] : [...sepBases, ...fullBases]));

  const used = new Map<string, number>();
  const looks: Look[] = [];
  for (const base of bases) {
    if (looks.length >= 3) break;
    let pieces = [...base];
    if (must) {
      const ms = slotForCategory(must.category);
      if (ms === "full" && !pieces.includes(must)) pieces = [must];
      else if (ms === "top" || ms === "bottom") {
        if (pieces.some((p) => slotForCategory(p.category) === "full")) continue;
        pieces = pieces.filter((p) => slotForCategory(p.category) !== ms).concat(must);
      }
    }
    const key = pieces.map((p) => p.id).sort().join("|");
    if (looks.some((l) => l.slots.filter((s) => s.slot !== "footwear" && s.slot !== "accessory" && s.slot !== "outerwear").map((s) => s.item_id).sort().join("|") === key)) continue;
    if (pieces.some((p) => (used.get(p.id) ?? 0) >= 2 && p !== must)) continue;

    const pick = (list: StylistItem[]) => [...list].sort((a, b) => (used.get(a.id) ?? 0) - (used.get(b.id) ?? 0))[0];
    const layer = target >= 3 && layers.length ? pick(layers) : undefined;
    const shoe = shoes.length ? pick(shoes) : undefined;
    const accessories = [...acc].sort((a, b) => (used.get(a.id) ?? 0) - (used.get(b.id) ?? 0)).slice(0, occ?.traditional ? 3 : 2);
    let all = [...pieces, ...(layer ? [layer] : []), ...(shoe ? [shoe] : []), ...accessories];
    if (must && !all.includes(must)) all = [...all.filter((p) => slotForCategory(p.category) !== slotForCategory(must.category)), must];
    all.forEach((p) => used.set(p.id, (used.get(p.id) ?? 0) + 1));

    const colors = [...new Set(all.flatMap((p) => p.colors))].slice(0, 4);
    const missing: string[] = [];
    if (!shoe) missing.push("No ready-to-wear footwear in your wardrobe yet — add a pair to complete looks.");
    if (occ?.traditional && !pieces.some((p) => p.category.startsWith("Traditional")))
      missing.push("No traditional pieces are available, so this look leans Indo-western.");

    const swaps = [...shoes, ...layers, ...(accessories.length ? acc : [])]
      .filter((i) => !all.includes(i))
      .slice(0, 3)
      .map((i) => ({ slot: slotForCategory(i.category), item_id: i.id, note: `Swap in ${i.name}` }));

    looks.push({
      name: `${occ?.label ?? "Everyday"} look ${looks.length + 1}`,
      occasion_fit: `Matched to a ${occ?.label.toLowerCase() ?? "general"} setting by formality and occasion tags.`,
      slots: all.map((p) => ({ slot: slotForCategory(p.category), item_id: p.id })),
      colour_story: colors.length ? colors.join(", ") : "Neutral",
      why: `Pieces were chosen for formality close to level ${target}${occ?.traditional ? ", with traditional layers preferred" : ""}${req.includeColors?.length ? ` and your requested colours` : ""}.`,
      weather_note: req.weather ? `Check fabrics against "${req.weather}".` : "Add weather to get fabric guidance.",
      swaps,
      missing,
    });
  }
  return looks;
}

export function buildStylistPrompt(args: {
  items: StylistItem[];
  profile: Record<string, unknown> | null;
  req: StylistRequest;
  feedback: { useful: boolean; reasons: string[]; outfit_name: string | null }[];
  recentlyPlannedIds: string[];
}): string {
  const { items, profile, req, feedback, recentlyPlannedIds } = args;
  const occ = occasionById(req.occasion);
  const wardrobe = items.map((i) => ({
    id: i.id,
    name: i.name,
    category: i.category,
    sub: i.subcategory,
    colors: i.colors,
    pattern: i.pattern,
    fabric: i.fabric,
    formality: i.formality,
    seasons: i.seasons,
    occasions: i.occasions,
    tags: i.style_tags,
    fav: i.favorite,
    recently_worn: i.last_worn_at,
  }));
  return [
    "You are Drape, a warm, inclusive personal stylist for an Indian context. You style people of every gender based on the clothing categories they choose, never assumptions.",
    "Rules: Use ONLY item ids from WARDROBE. Never invent items. Never rate appearance, judge bodies, or push purchases. Do not claim certainty about skin tone or body. Be concise and specific.",
    `Create ${req.wardrobeOnly ? "2-4" : "2-4"} complete looks. Each look needs either a full ensemble (saree/lehenga/sherwani/salwar suit/dress etc.) OR a top + bottom, plus footwear and fitting accessories when available. For Indian occasions, layer traditionally (e.g. kurta + churidar + Nehru jacket + mojaris; saree + blouse + jhumkas + potli).`,
    "If an essential piece is missing, say so honestly in `missing` (you may phrase as 'if you already own…'). Prefer not repeating RECENTLY_PLANNED items.",
    `REQUEST: ${JSON.stringify({ ...req, occasion_label: occ?.label })}`,
    `PROFILE (self-described, optional): ${JSON.stringify(profile ?? {})}`,
    `RECENT_FEEDBACK: ${JSON.stringify(feedback.slice(0, 15))}`,
    `RECENTLY_PLANNED_ITEM_IDS: ${JSON.stringify(recentlyPlannedIds)}`,
    `WARDROBE: ${JSON.stringify(wardrobe)}`,
    'Respond with JSON only: {"looks":[{"name":string,"occasion_fit":string,"slots":[{"slot":"top|bottom|outerwear|full|footwear|accessory","item_id":string}],"colour_story":string,"why":string,"weather_note":string,"swaps":[{"item_id":string,"note":string}],"missing":[string]}]}',
  ].join("\n\n");
}