import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { BookOpen, CalendarDays, Home, LineChart, LogOut, MessageCircle, Plane, Settings, Shirt, Sparkles, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "./Logo";

const NAV = [
  { to: "/dashboard", label: "Today", icon: Home },
  { to: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { to: "/stylist", label: "Create outfit", icon: Sparkles },
  { to: "/chat", label: "Ask Drape", icon: MessageCircle },
  { to: "/looks", label: "Lookbook", icon: Bookmark },
  { to: "/planner", label: "Planner", icon: CalendarDays },
  { to: "/insights", label: "Insights", icon: LineChart },
  { to: "/trips", label: "Trips", icon: Plane },
  { to: "/notes", label: "Style notes", icon: BookOpen },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE = ["/dashboard", "/wardrobe", "/stylist", "/looks", "/planner"];

export function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="min-h-screen md:grid md:grid-cols-[232px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r bg-sidebar px-4 py-6 md:flex">
        <Logo to="/dashboard" className="px-2" />
        <nav className="mt-8 flex flex-1 flex-col gap-0.5" aria-label="Main">
          {NAV.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent !text-sidebar-accent-foreground font-medium" }}
            >
              <n.icon className="size-4" aria-hidden /> {n.label}
            </Link>
          ))}
        </nav>
        <button onClick={signOut} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent">
          <LogOut className="size-4" aria-hidden /> Sign out
        </button>
      </aside>
      <div className="flex min-h-screen flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur md:hidden">
          <Logo to="/dashboard" />
          <div className="flex gap-1">
            <Link to="/chat" className="rounded-full p-2 hover:bg-muted" aria-label="Ask Drape"><MessageCircle className="size-5" /></Link>
            <Link to="/settings" className="rounded-full p-2 hover:bg-muted" aria-label="Settings"><Settings className="size-5" /></Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 md:px-10 md:py-10">{children}</main>
        <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t bg-card md:hidden" aria-label="Mobile">
          {NAV.filter((n) => MOBILE.includes(n.to)).map((n) => (
            <Link key={n.to} to={n.to} className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground" activeProps={{ className: "!text-foreground font-medium" }}>
              <n.icon className="size-5" aria-hidden />
              {n.label.split(" ")[0]}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between fade-up">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-display text-4xl font-medium md:text-5xl">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="editorial-card editorial-wash flex flex-col items-center px-6 py-14 text-center">
      <p className="font-display text-2xl italic">{title}</p>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}