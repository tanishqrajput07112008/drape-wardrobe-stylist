import { cn } from "@/lib/utils";
import { swatch } from "@/lib/constants";

export function Chips({
  options,
  value,
  onChange,
  multiple = true,
  colors = false,
  label,
}: {
  options: readonly string[];
  value: string[];
  onChange: (v: string[]) => void;
  multiple?: boolean;
  colors?: boolean;
  label: string;
}) {
  function toggle(o: string) {
    if (!multiple) return onChange(value[0] === o ? [] : [o]);
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  }
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(o)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              on ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-muted",
            )}
          >
            {colors && <span className="size-3 rounded-full border" style={{ background: swatch(o) }} aria-hidden />}
            {o}
          </button>
        );
      })}
    </div>
  );
}