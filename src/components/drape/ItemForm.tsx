import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  ACCESSORY_CATEGORIES, ALL_CATEGORIES, AVAILABILITY, COLOR_NAMES, FABRICS, FORMALITY_LABEL,
  GARMENT_CATEGORIES, OCCASIONS, PATTERNS, SEASONS, SUBCATEGORY_HINTS,
} from "@/lib/constants";
import { uploadItemImage, useSaveItem, type Item } from "@/lib/data";
import { describeItem } from "@/lib/stylist.functions";
import { Chips } from "./Chips";

type Form = {
  name: string; category: string; subcategory: string; colors: string[]; pattern: string; fabric: string; fit: string;
  formality: number; seasons: string[]; occasions: string[]; style_tags: string; notes: string; brand: string;
  availability: string; image_path: string | null;
};

const empty: Form = {
  name: "", category: "Top", subcategory: "", colors: [], pattern: "", fabric: "", fit: "", formality: 3, seasons: [],
  occasions: [], style_tags: "", notes: "", brand: "", availability: "clean", image_path: null,
};

function fromItem(i: Item): Form {
  return {
    name: i.name, category: i.category, subcategory: i.subcategory ?? "", colors: i.colors, pattern: i.pattern ?? "",
    fabric: i.fabric ?? "", fit: i.fit ?? "", formality: i.formality, seasons: i.seasons, occasions: i.occasions,
    style_tags: i.style_tags.join(", "), notes: i.notes ?? "", brand: i.brand ?? "", availability: i.availability, image_path: i.image_path,
  };
}

const selectCls = "h-9 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function ItemForm({ item, open, onOpenChange }: { item?: Item; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [f, setF] = useState<Form>(item ? fromItem(item) : empty);
  const [preview, setPreview] = useState<string | null>(item?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [describing, setDescribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = useSaveItem();
  const describe = useServerFn(describeItem);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((p) => ({ ...p, [k]: v }));

  async function onFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 10 * 1024 * 1024) return toast.error("Images must be under 10 MB.");
    setUploading(true);
    try {
      setPreview(URL.createObjectURL(file));
      set("image_path", await uploadItemImage(file));
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function runDescribe() {
    setDescribing(true);
    try {
      const res = await describe({ data: { imagePath: f.image_path ?? undefined, text: f.name || f.notes || undefined } });
      if (res.error || !res.fields) return toast.error(res.error ?? "Couldn't describe this item.");
      const x = res.fields as Record<string, unknown>;
      const arr = (v: unknown) => (Array.isArray(v) ? v.filter((s): s is string => typeof s === "string") : []);
      setF((p) => ({
        ...p,
        name: p.name || (typeof x.name === "string" ? x.name : ""),
        category: typeof x.category === "string" && ALL_CATEGORIES.includes(x.category as never) ? x.category : p.category,
        subcategory: typeof x.subcategory === "string" ? x.subcategory : p.subcategory,
        colors: arr(x.colors).map((c) => c.toLowerCase()).filter((c) => COLOR_NAMES.includes(c)).length
          ? arr(x.colors).map((c) => c.toLowerCase()).filter((c) => COLOR_NAMES.includes(c))
          : p.colors,
        pattern: typeof x.pattern === "string" ? x.pattern : p.pattern,
        fabric: typeof x.fabric === "string" ? x.fabric : p.fabric,
        fit: typeof x.fit === "string" ? x.fit : p.fit,
        formality: typeof x.formality === "number" ? Math.min(5, Math.max(1, Math.round(x.formality))) : p.formality,
        seasons: arr(x.seasons).filter((s) => SEASONS.includes(s)),
        occasions: arr(x.occasions).length ? arr(x.occasions) : p.occasions,
        style_tags: arr(x.style_tags).join(", ") || p.style_tags,
      }));
      toast.success("AI suggested details — please review and edit.");
    } finally {
      setDescribing(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return setError("Give the item a name.");
    if (!f.category) return setError("Choose a category.");
    setError(null);
    try {
      await save.mutateAsync({
        id: item?.id,
        values: {
          name: f.name.trim(), category: f.category, subcategory: f.subcategory || null, colors: f.colors,
          pattern: f.pattern || null, fabric: f.fabric || null, fit: f.fit || null, formality: f.formality, seasons: f.seasons,
          occasions: f.occasions, style_tags: f.style_tags.split(",").map((s) => s.trim()).filter(Boolean),
          notes: f.notes || null, brand: f.brand || null, availability: f.availability, image_path: f.image_path,
        },
      });
      toast.success(item ? "Item updated" : "Added to your wardrobe");
      onOpenChange(false);
      if (!item) { setF(empty); setPreview(null); }
    } catch {
      toast.error("Couldn't save. Please try again.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{item ? "Edit item" : "Add to wardrobe"}</DialogTitle>
          <DialogDescription>Photos are private to your account. Only name and category are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-5" noValidate>
          <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
            <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border border-dashed bg-muted text-xs text-muted-foreground hover:bg-accent focus-within:ring-2 focus-within:ring-ring">
              {preview ? <img src={preview} alt="Item preview" className="size-full object-cover" /> : uploading ? <Loader2 className="size-5 animate-spin" /> : (<><Upload className="size-5" />Add photo</>)}
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} aria-label="Upload item photo" />
            </label>
            <div className="grid content-start gap-3">
              <Field label="Name *"><Input value={f.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ivory chikankari kurta" maxLength={120} /></Field>
              <Button type="button" variant="pill" onClick={runDescribe} disabled={describing || uploading || (!f.image_path && !f.name)}>
                {describing ? <Loader2 className="animate-spin" /> : <Sparkles />} Describe this item with AI
              </Button>
              <p className="text-xs text-muted-foreground">Uses your photo (or the name you typed) to suggest details. Always double-check — AI can be wrong.</p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category *">
              <select className={selectCls} value={f.category} onChange={(e) => set("category", e.target.value)}>
                <optgroup label="Garments">{GARMENT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</optgroup>
                <optgroup label="Footwear & accessories">{ACCESSORY_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</optgroup>
              </select>
            </Field>
            <Field label="Type">
              <Input list="subcats" value={f.subcategory} onChange={(e) => set("subcategory", e.target.value)} placeholder={SUBCATEGORY_HINTS[f.category]?.[0]} />
              <datalist id="subcats">{SUBCATEGORY_HINTS[f.category]?.map((s) => <option key={s} value={s} />)}</datalist>
            </Field>
            <Field label="Pattern">
              <select className={selectCls} value={f.pattern} onChange={(e) => set("pattern", e.target.value)}><option value="">—</option>{PATTERNS.map((p) => <option key={p}>{p}</option>)}</select>
            </Field>
            <Field label="Fabric">
              <select className={selectCls} value={f.fabric} onChange={(e) => set("fabric", e.target.value)}><option value="">—</option>{FABRICS.map((p) => <option key={p}>{p}</option>)}</select>
            </Field>
            <Field label="Fit / silhouette"><Input value={f.fit} onChange={(e) => set("fit", e.target.value)} placeholder="Relaxed, tailored, flared…" /></Field>
            <Field label="Brand (optional)"><Input value={f.brand} onChange={(e) => set("brand", e.target.value)} /></Field>
            <Field label="Availability">
              <select className={selectCls} value={f.availability} onChange={(e) => set("availability", e.target.value)}>{AVAILABILITY.map((a) => <option key={a.id} value={a.id}>{a.label}</option>)}</select>
            </Field>
            <Field label={`Formality — ${FORMALITY_LABEL[f.formality]}`}>
              <Slider min={1} max={5} step={1} value={[f.formality]} onValueChange={(v) => set("formality", v[0])} aria-label="Formality" className="py-3" />
            </Field>
          </div>
          <Field label="Colours"><Chips label="Colours" colors options={COLOR_NAMES} value={f.colors} onChange={(v) => set("colors", v)} /></Field>
          <Field label="Season"><Chips label="Season" options={SEASONS} value={f.seasons} onChange={(v) => set("seasons", v)} /></Field>
          <Field label="Good for"><Chips label="Occasions" options={OCCASIONS.map((o) => o.label)} value={f.occasions} onChange={(v) => set("occasions", v)} /></Field>
          <Field label="Style tags (comma separated)"><Input value={f.style_tags} onChange={(e) => set("style_tags", e.target.value)} placeholder="minimal, festive" /></Field>
          <Field label="Notes"><Textarea value={f.notes} onChange={(e) => set("notes", e.target.value)} rows={2} maxLength={500} /></Field>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={save.isPending || uploading}>{save.isPending && <Loader2 className="animate-spin" />}{item ? "Save changes" : "Add item"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  // Wrapping <label> associates the text with a single input; chip groups carry their own aria-label.
  return (
    <div className="grid gap-1.5">
      <Label asChild className="text-xs font-medium text-muted-foreground"><span>{label}</span></Label>
      {children}
    </div>
  );
}

export function LabeledField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}