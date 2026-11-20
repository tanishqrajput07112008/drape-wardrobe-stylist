import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import type { FormEvent } from "react";
import { Loader2, MessageCircle, Send, Sparkles } from "lucide-react";
import { chatQuery } from "@/lib/data";
import { chatWithStylist } from "@/lib/stylist.functions";
import { pageHead } from "@/lib/page-head";
import { PageHeader } from "@/components/drape/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/chat")({
  head: () => pageHead("Misty AI", "Your personal wardrobe and outfit assistant."),
  loader: ({ context }) => context.queryClient.ensureQueryData(chatQuery),
  component: MistyChat,
});

const STARTERS = [
  "Help me choose an outfit for college",
  "What can I wear to a party?",
  "Suggest a look for an Indian wedding",
  "How can I style a white shirt differently?",
];

function MistyChat() {
  const { data: messages } = useSuspenseQuery(chatQuery);
  const queryClient = useQueryClient();
  const sendMessage = useServerFn(chatWithStylist);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || busy) return;
    setBusy(true);
    setError("");
    setDraft("");
    try {
      const result = await sendMessage({ data: { message } });
      if (result.error || !result.reply) {
        setError(result.error ?? "Misty couldn't reply just now. Please try again.");
      }
      await queryClient.invalidateQueries({ queryKey: ["chat"] });
    } catch {
      setDraft(message);
      setError("I couldn't reach Misty. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHeader eyebrow="Your personal style companion" title="Meet Misty">
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-olive" /> Wardrobe-aware assistant
        </span>
      </PageHeader>

      <section className="mx-auto flex min-h-[62vh] max-w-3xl flex-col overflow-hidden rounded-2xl border bg-card">
        <div className="flex items-center gap-3 border-b px-5 py-4">
          <div className="flex size-11 items-center justify-center rounded-full bg-muted text-olive">
            <Sparkles className="size-5" />
          </div>
          <div>
            <p className="font-display text-xl">Misty</p>
            <p className="text-xs text-muted-foreground">Styling ideas built around what you own</p>
          </div>
        </div>

        <div className="flex-1 space-y-4 p-4 sm:p-6" aria-live="polite">
          {messages.length === 0 ? (
            <div className="py-8 text-center">
              <MessageCircle className="mx-auto mb-3 size-8 text-olive" />
              <h2 className="font-display text-2xl">Hi, I’m Misty.</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                Tell me where you’re going, what mood you have in mind, or which piece you want to style. I’ll use your saved wardrobe and preferences.
              </p>
              <div className="mx-auto mt-6 grid max-w-lg gap-2 sm:grid-cols-2">
                {STARTERS.map((starter) => (
                  <button key={starter} type="button" onClick={() => setDraft(starter)} className="rounded-xl border px-3 py-3 text-left text-sm transition-colors hover:bg-muted">
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {message.content}
                </div>
              </div>
            ))
          )}
          {busy && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" /> Misty is thinking…
              </div>
            </div>
          )}
          {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{error}</p>}
        </div>

        <form onSubmit={submit} className="flex items-center gap-2 border-t p-3 sm:p-4">
          <Input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask Misty about an outfit…" maxLength={2000} disabled={busy} aria-label="Message Misty" />
          <Button type="submit" disabled={busy || !draft.trim()} aria-label="Send message">
            {busy ? <Loader2 className="animate-spin" /> : <Send />}
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <p className="px-4 pb-3 text-center text-[11px] text-muted-foreground">
          Misty can make mistakes. Check important details and use your own judgement.
        </p>
      </section>
    </>
  );
}
