import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function Logo({ className, to = "/" }: { className?: string; to?: "/" | "/dashboard" }) {
  return (
    <Link to={to} className={cn("group inline-flex items-baseline gap-1.5", className)} aria-label="Drape home">
      <span className="relative font-display text-2xl font-semibold italic leading-none tracking-tight text-foreground">
        Drape
        <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-50 bg-terracotta transition-transform duration-500 group-hover:scale-x-100" />
      </span>
      <span className="size-1.5 rounded-full bg-olive" aria-hidden />
    </Link>
  );
}

export const TAGLINE = "Wear what you own. Show up as yourself.";