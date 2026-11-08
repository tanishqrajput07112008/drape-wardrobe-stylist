import { swatch } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Item } from "@/lib/data";

/** Photo if present, otherwise an editorial colour-block card built from the item's colours. */
export function ItemThumb({ item, className }: { item: Pick<Item, "name" | "colors" | "image_url" | "subcategory" | "category">; className?: string }) {
  if (item.image_url) {
    return <img src={item.image_url} alt={item.name} loading="lazy" className={cn("aspect-[4/5] w-full rounded-lg object-cover", className)} />;
  }
  const cols = item.colors.length ? item.colors : ["beige"];
  return (
    <div className={cn("relative flex aspect-[4/5] w-full overflow-hidden rounded-lg border", className)} aria-label={`${item.name}, ${cols.join(", ")}`} role="img">
      {cols.slice(0, 3).map((c) => (
        <div key={c} className="flex-1" style={{ background: swatch(c) }} />
      ))}
      <span className="absolute bottom-2 left-2 rounded-full bg-card/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-foreground">
        {item.subcategory || item.category}
      </span>
    </div>
  );
}