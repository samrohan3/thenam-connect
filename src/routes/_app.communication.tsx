import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { announcements, chatThreads } from "@/lib/mock-data";
import { Bell, Megaphone, Paperclip, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/communication")({
  head: () => ({ meta: [{ title: "Communication — Thenam ERP" }] }),
  component: CommunicationPage,
});

const initial = [
  { from: "Neha Reddy", me: false, text: "Deploy is queued, waiting on QA sign-off.", time: "12:02" },
  { from: "You", me: true, text: "Great — I'll ping Ananya now.", time: "12:03" },
  { from: "Kabir Menon", me: false, text: "Wallet API perf tests are green ✅", time: "12:04" },
];

const toneMap = { royal: "bg-royal", emerald: "bg-emerald", gold: "bg-gold" } as const;

function CommunicationPage() {
  const [active, setActive] = useState(chatThreads[0].name);
  const [messages, setMessages] = useState(initial);
  const [draft, setDraft] = useState("");

  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { from: "You", me: true, text: draft, time: "now" }]);
    setDraft("");
  };

  return (
    <PageContainer>
      <PageHeader
        title="Communication"
        subtitle="Chat, announcements and team updates in one place."
      />

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-4">
        <SectionCard title="Channels">
          <ul className="space-y-1">
            {chatThreads.map((t) => (
              <li key={t.name}>
                <button
                  onClick={() => setActive(t.name)}
                  className={cn(
                    "w-full grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl px-3 py-2.5 text-left transition",
                    active === t.name ? "bg-primary/10" : "hover:bg-muted",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">#{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.last}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{t.time}</span>
                </button>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title={`#${active}`} description="Team channel" className="flex flex-col">
          <div className="flex-1 space-y-3 max-h-[52vh] overflow-y-auto pr-1">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex items-end gap-2", m.me && "flex-row-reverse")}>
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={`https://i.pravatar.cc/60?img=${m.me ? 12 : i + 20}`} />
                  <AvatarFallback>{m.from[0]}</AvatarFallback>
                </Avatar>
                <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm",
                  m.me ? "gradient-royal text-white rounded-br-sm" : "bg-muted rounded-bl-sm")}>
                  {!m.me && <p className="text-[10px] font-semibold opacity-80 mb-0.5">{m.from}</p>}
                  <p className="leading-snug">{m.text}</p>
                  <p className={cn("mt-1 text-[10px]", m.me ? "text-white/70" : "text-muted-foreground")}>{m.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Write a message…"
              className="rounded-xl h-11"
            />
            <Button onClick={send} className="rounded-xl gradient-royal text-white gap-1.5">
              <Send className="h-4 w-4" /> Send
            </Button>
          </div>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Announcements" description="Latest from leadership">
            <ul className="space-y-3">
              {announcements.map((a) => (
                <li key={a.title} className="grid grid-cols-[auto_1fr] items-start gap-3">
                  <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white",
                    toneMap[a.tone as keyof typeof toneMap])}>
                    <Megaphone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug">{a.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{a.author} · {a.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard title="Notifications">
            <ul className="space-y-2">
              {["3 pull requests need review", "Payroll runs tomorrow at 9am", "New investor deck published"].map((n) => (
                <li key={n} className="flex items-start gap-2 text-sm">
                  <Bell className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span>{n}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
