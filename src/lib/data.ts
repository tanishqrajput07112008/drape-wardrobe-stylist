// Client data hooks. All queries go through the signed-in user's session;
// row-level security on every table restricts rows to their owner.
import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { kindForCategory } from "./constants";
import { DEMO_ITEMS } from "./demo";
import type { Look } from "./stylist-core";

export type Item = Tables<"wardrobe_items"> & { image_url?: string | null };
export type Profile = Tables<"profiles">;
export type Outfit = Tables<"outfits"> & { outfit_items: { item_id: string; slot: string }[] };
export type PlannerEvent = Tables<"planner_events">;

async function uid() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export const profileQuery = queryOptions({
  queryKey: ["profile"],
  queryFn: async () => {
    const id = await uid();
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (error) throw error;
    if (!data) {
      const { data: created, error: e2 } = await supabase.from("profiles").insert({ id }).select("*").single();
      if (e2) throw e2;
      return created;
    }
    return data;
  },
});

export const itemsQuery = queryOptions({
  queryKey: ["items"],
  queryFn: async (): Promise<Item[]> => {
    const { data, error } = await supabase.from("wardrobe_items").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    const paths = (data ?? []).map((i) => i.image_path).filter((p): p is string => !!p);
    const urls = new Map<string, string>();
    if (paths.length) {
      const { data: signed } = await supabase.storage.from("wardrobe").createSignedUrls(paths, 3600);
      signed?.forEach((s) => s.path && s.signedUrl && urls.set(s.path, s.signedUrl));
    }
    return (data ?? []).map((i) => ({ ...i, image_url: i.image_path ? urls.get(i.image_path) ?? null : null }));
  },
});

export const outfitsQuery = queryOptions({
  queryKey: ["outfits"],
  queryFn: async (): Promise<Outfit[]> => {
    const { data, error } = await supabase
      .from("outfits")
      .select("*, outfit_items(item_id, slot)")
      .eq("saved", true)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as Outfit[];
  },
});

export const eventsQuery = queryOptions({
  queryKey: ["events"],
  queryFn: async () => {
    const { data, error } = await supabase.from("planner_events").select("*").order("event_date");
    if (error) throw error;
    return data ?? [];
  },
});

export const tripsQuery = queryOptions({
  queryKey: ["trips"],
  queryFn: async () => {
    const { data, error } = await supabase.from("trips").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  },
});

export const chatQuery = queryOptions({
  queryKey: ["chat"],
  queryFn: async () => {
    const { data, error } = await supabase.from("chat_messages").select("*").order("created_at").limit(100);
    if (error) throw error;
    return data ?? [];
  },
});

export function useInvalidate() {
  const qc = useQueryClient();
  return (...keys: string[]) => Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: [k] })));
}

export async function uploadItemImage(file: File): Promise<string> {
  const id = await uid();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${id}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("wardrobe").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

export function useSaveItem() {
  const inv = useInvalidate();
  return useMutation({
    mutationFn: async (input: { id?: string; values: Omit<TablesInsert<"wardrobe_items">, "user_id" | "kind"> }) => {
      const values = { ...input.values, kind: kindForCategory(input.values.category) };
      if (input.id) {
        const { error } = await supabase.from("wardrobe_items").update(values).eq("id", input.id);
        if (error) throw error;
        return input.id;
      }
      const { data, error } = await supabase.from("wardrobe_items").insert({ ...values, user_id: await uid() }).select("id").single();
      if (error) throw error;
      return data.id;
    },
    onSuccess: () => inv("items"),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: TablesUpdate<"wardrobe_items"> }) => {
      const { error } = await supabase.from("wardrobe_items").update(patch).eq("id", id);
      if (error) throw error;
    },
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: ["items"] });
      const prev = qc.getQueryData<Item[]>(["items"]);
      qc.setQueryData<Item[]>(["items"], (old) => old?.map((i) => (i.id === id ? { ...i, ...patch } : i)));
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(["items"], ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: ["items"] }),
  });
}

export async function deleteItem(item: Item) {
  const { error } = await supabase.from("wardrobe_items").delete().eq("id", item.id);
  if (error) throw error;
  if (item.image_path) await supabase.storage.from("wardrobe").remove([item.image_path]);
}

export async function markWorn(itemIds: string[], items: Item[]) {
  const now = new Date().toISOString();
  await Promise.all(
    itemIds.map((id) => {
      const it = items.find((i) => i.id === id);
      return supabase.from("wardrobe_items").update({ last_worn_at: now, wear_count: (it?.wear_count ?? 0) + 1 }).eq("id", id);
    }),
  );
}

export async function loadDemoCloset() {
  const id = await uid();
  const rows = DEMO_ITEMS.map((d) => ({ ...d, user_id: id, kind: kindForCategory(d.category), is_demo: true }));
  const { error } = await supabase.from("wardrobe_items").insert(rows);
  if (error) throw error;
}

export async function clearDemoCloset() {
  const { error } = await supabase.from("wardrobe_items").delete().eq("is_demo", true);
  if (error) throw error;
}

export async function saveLook(look: Look, occasion: string, source: string) {
  const user_id = await uid();
  const { data, error } = await supabase
    .from("outfits")
    .insert({
      user_id,
      name: look.name,
      occasion,
      source,
      details: { occasion_fit: look.occasion_fit, colour_story: look.colour_story, why: look.why, weather_note: look.weather_note, missing: look.missing },
    })
    .select("id")
    .single();
  if (error) throw error;
  const { error: e2 } = await supabase
    .from("outfit_items")
    .insert(look.slots.map((s) => ({ user_id, outfit_id: data.id, item_id: s.item_id, slot: s.slot })));
  if (e2) throw e2;
  return data.id;
}

export async function sendFeedback(input: { look: Look; outfitId?: string; useful: boolean; reasons: string[] }) {
  const user_id = await uid();
  const { error } = await supabase.from("feedback").insert({
    user_id,
    outfit_name: input.look.name,
    outfit_id: input.outfitId ?? null,
    useful: input.useful,
    reasons: input.reasons,
    item_ids: input.look.slots.map((s) => s.item_id),
  });
  if (error) throw error;
  // Learned preferences: simple reason counters the stylist reads from the profile.
  const { data: p } = await supabase.from("profiles").select("learned_prefs").eq("id", user_id).single();
  const lp = (p?.learned_prefs as Record<string, number> | null) ?? {};
  for (const r of input.reasons) lp[r] = (lp[r] ?? 0) + 1;
  lp[input.useful ? "useful" : "not_useful"] = (lp[input.useful ? "useful" : "not_useful"] ?? 0) + 1;
  await supabase.from("profiles").update({ learned_prefs: lp }).eq("id", user_id);
}