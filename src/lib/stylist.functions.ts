import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { OpenAIChatMessage } from "@lovable.dev/ai-gateway";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  buildStylistPrompt,
  ruleBasedLooks,
  validateLooks,
  type StylistItem,
  type StylistResult,
} from "./stylist-core";

const MODEL = "openai/gpt-6-astra" as const;

type ChatMsg = OpenAIChatMessage;

async function callAI(messages: ChatMsg[], json: boolean): Promise<string> {
  const { generateChatCompletion } = await import("@lovable.dev/ai-gateway");
  const res = await generateChatCompletion({
    model: MODEL,
    messages,
    ...(json ? { response_format: { type: "json_object" as const } } : {}),
  });
  const content = res.choices?.[0]?.message?.content;
  if (typeof content !== "string" || !content.trim()) throw new Error("Empty AI response");
  return content;
}

function friendlyAIError(e: unknown): string {
  const name = (e as { name?: string })?.name ?? "";
  if (name.includes("RateLimit")) return "The stylist is busy right now. Please try again in a minute.";
  if (name.includes("PaymentRequired")) return "AI credits for this workspace have run out.";
  return "The AI stylist couldn't respond just now.";
}

const requestSchema = z.object({
  occasion: z.string().min(1).max(60),
  date: z.string().max(40).optional(),
  weather: z.string().max(120).optional(),
  formality: z.number().int().min(1).max(5).optional(),
  vibe: z.string().max(200).optional(),
  comfort: z.string().max(300).optional(),
  includeColors: z.array(z.string().max(30)).max(10).optional(),
  avoidColors: z.array(z.string().max(30)).max(10).optional(),
  mustWearId: z.string().uuid().optional(),
  wardrobeOnly: z.boolean(),
  extra: z.string().max(500).optional(),
});

const ITEM_COLS =
  "id,name,category,subcategory,colors,pattern,fabric,formality,seasons,occasions,style_tags,availability,favorite,last_worn_at";

export const generateOutfits = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => requestSchema.parse(d))
  .handler(async ({ data, context }): Promise<StylistResult> => {
    const { supabase } = context;
    const [itemsRes, profileRes, fbRes, planRes] = await Promise.all([
      supabase.from("wardrobe_items").select(ITEM_COLS).eq("availability", "clean").limit(400),
      supabase
        .from("profiles")
        .select("style_prefs,preferred_colors,avoid_colors,climate,comfort_notes,modesty_notes,clothing_categories,undertone,fit_prefs,lifestyle,learned_prefs")
        .maybeSingle(),
      supabase.from("feedback").select("useful,reasons,outfit_name,item_ids").order("created_at", { ascending: false }).limit(20),
      supabase
        .from("planner_events")
        .select("outfit_id, outfits(outfit_items(item_id))")
        .gte("event_date", new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10))
        .limit(30),
    ]);
    if (itemsRes.error) throw new Error("Could not load your wardrobe.");
    const items = (itemsRes.data ?? []) as StylistItem[];
    if (items.length === 0) {
      return { source: "rules", looks: [], notice: "Add a few ready-to-wear items to your wardrobe to get looks." };
    }
    const feedback = fbRes.data ?? [];
    const rejectedIds = feedback.filter((f) => !f.useful).flatMap((f) => f.item_ids ?? []);
    const recentlyPlannedIds = (planRes.data ?? []).flatMap(
      (p) => ((p.outfits as { outfit_items?: { item_id: string }[] } | null)?.outfit_items ?? []).map((x) => x.item_id),
    );
    const req = {
      ...data,
      avoidColors: [...(data.avoidColors ?? []), ...((profileRes.data?.avoid_colors as string[]) ?? [])],
    };

    try {
      const prompt = buildStylistPrompt({ items, profile: profileRes.data, req, feedback, recentlyPlannedIds });
      const text = await callAI([{ role: "user", content: prompt }], true);
      const looks = validateLooks(JSON.parse(text), items).filter((look) => (!req.mustWearId || look.slots.some((slot) => slot.item_id === req.mustWearId)) && !look.slots.some((slot) => items.find((item) => item.id === slot.item_id)?.colors.some((c) => req.avoidColors.includes(c))));
      if (looks.length > 0) return { source: "ai", looks };
      throw new Error("AI returned no valid looks");
    } catch (e) {
      console.error("stylist AI failed", e);
      const looks = ruleBasedLooks(items, req, rejectedIds);
      return {
        source: "rules",
        looks,
        notice: `${friendlyAIError(e)} Showing rule-based matches from your wardrobe instead (not AI).`,
      };
    }
  });

export const chatWithStylist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ message: z.string().min(1).max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [itemsRes, profileRes, histRes] = await Promise.all([
      supabase.from("wardrobe_items").select("name,category,subcategory,colors,formality,availability,occasions").limit(300),
      supabase.from("profiles").select("display_name,style_prefs,preferred_colors,avoid_colors,climate,comfort_notes,modesty_notes,clothing_categories,undertone,fit_prefs").maybeSingle(),
      supabase.from("chat_messages").select("role,content").order("created_at", { ascending: false }).limit(16),
    ]);
    await supabase.from("chat_messages").insert({ user_id: userId, role: "user", content: data.message });
    const history = (histRes.data ?? []).reverse().map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    const system = [
      "You are Drape, a kind, practical personal stylist for an Indian context, inclusive of all genders.",
      "Answer using the user's own wardrobe below. Reference items by their exact names. Never invent owned items, never rate looks or bodies, never push shopping. Keep answers short (under 180 words), with bullet points when listing.",
      "For Indian occasions, offer etiquette-aware but non-prescriptive notes.",
      `PROFILE: ${JSON.stringify(profileRes.data ?? {})}`,
      `WARDROBE: ${JSON.stringify(itemsRes.data ?? [])}`,
    ].join("\n");
    try {
      const reply = await callAI([{ role: "system", content: system }, ...history, { role: "user", content: data.message }], false);
      await supabase.from("chat_messages").insert({ user_id: userId, role: "assistant", content: reply });
      return { reply, error: null as string | null };
    } catch (e) {
      console.error("chat AI failed", e);
      return { reply: null, error: friendlyAIError(e) };
    }
  });

const describeSchema = z.object({
  imagePath: z.string().max(300).optional(),
  text: z.string().max(500).optional(),
});

export const describeItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => describeSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    if (!data.imagePath && !data.text) return { fields: null, error: "Add a photo or a short description first." };
    let imageUrl: string | null = null;
    if (data.imagePath) {
      if (!data.imagePath.startsWith(`${userId}/`)) return { fields: null, error: "Not your image." };
      const { data: signed } = await supabase.storage.from("wardrobe").createSignedUrl(data.imagePath, 300);
      imageUrl = signed?.signedUrl ?? null;
    }
    const instructions = `Describe this single clothing or accessory item for a wardrobe app. Return JSON only:
{"name":string,"category":one of ["Top","Bottom","Outerwear","One-piece","Traditional ensemble","Traditional top","Traditional bottom","Traditional layer","Footwear","Jewellery","Bag","Watch","Belt","Scarf / dupatta","Headwear","Eyewear","Other accessory"],"subcategory":string,"colors":[lowercase simple colour names],"pattern":string,"fabric":string,"fit":string,"formality":1-5,"seasons":[from "Summer","Monsoon","Winter","All-season"],"occasions":[short occasion names],"style_tags":[short tags]}
Only describe the garment, never the person. If unsure, give your best guess.${data.text ? `\nUser description: ${data.text}` : ""}`;
    const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }> = [{ type: "text", text: instructions }];
    if (imageUrl) content.push({ type: "image_url", image_url: { url: imageUrl } });
    try {
      const text = await callAI([{ role: "user", content }], true);
      const parsed = JSON.parse(text) as Record<string, unknown>;
      return { fields: parsed, error: null as string | null };
    } catch (e) {
      console.error("describe AI failed", e);
      return { fields: null, error: `${friendlyAIError(e)} Please fill in the details manually.` };
    }
  });

export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: files } = await supabase.storage.from("wardrobe").list(userId, { limit: 1000 });
    if (files?.length) await supabase.storage.from("wardrobe").remove(files.map((f) => `${userId}/${f.name}`));
    for (const t of ["chat_messages", "trips", "planner_events", "feedback", "outfit_items", "outfits", "wardrobe_items"] as const) {
      await supabase.from(t).delete().eq("user_id", userId);
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) throw new Error("Could not delete account. Please try again.");
    return { ok: true };
  });