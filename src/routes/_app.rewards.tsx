import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { leaderboard } from "@/lib/mock-data";
import { Award, Crown, Medal, Star, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/rewards")({
  head: () => ({ meta: [{ title: "Rewards — Thenam ERP" }] }),
  component: RewardsPage,
});

const trophy = ["gradient-gold", "gradient-royal", "gradient-emerald"];

function RewardsPage() {
  const [first, second, third, ...rest] = leaderboard;

  return (
    <PageContainer>
      <PageHeader
        title="Rewards"
        subtitle="Leaderboard, badges and team achievements."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[first, second, third].map((p, i) => (
          <motion.div
            key={p.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className={cn(
              "relative overflow-hidden rounded-3xl border border-border p-6 text-white card-hover",
              trophy[i],
            )}
          >
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/20 backdrop-blur">
                {i === 0 ? <Crown className="h-6 w-6" /> : i === 1 ? <Medal className="h-6 w-6" /> : <Award className="h-6 w-6" />}
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80">Rank #{i + 1}</p>
                <p className="text-xl font-semibold">{p.name}</p>
                <p className="text-xs opacity-80">{p.role}</p>
              </div>
            </div>
            <div className="mt-6 flex items-end justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider opacity-80">Points</p>
                <p className="text-3xl font-bold tabular-nums">{p.points.toLocaleString()}</p>
              </div>
              <div className="flex gap-1 text-2xl">
                {p.badges.map((b, bi) => <span key={bi}>{b}</span>)}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Leaderboard" description="Top performers this quarter" className="lg:col-span-2">
          <ul className="divide-y divide-border">
            {rest.map((p, i) => (
              <li key={p.name} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 py-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-muted text-sm font-semibold">
                  {i + 4}
                </span>
                <div className="min-w-0 flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://i.pravatar.cc/60?img=${(i + 30)}`} />
                    <AvatarFallback>{p.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{p.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex gap-1 text-lg">{p.badges.map((b, bi) => <span key={bi}>{b}</span>)}</div>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary tabular-nums">
                    {p.points.toLocaleString()} pts
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="Best team">
            <div className="rounded-2xl gradient-brand p-5 text-white">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8" />
                <div>
                  <p className="text-xs uppercase tracking-wider opacity-80">Winner</p>
                  <p className="text-lg font-semibold">Engineering</p>
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold">18,240 pts</p>
              <p className="text-xs opacity-80">+24% vs last quarter</p>
            </div>
          </SectionCard>

          <SectionCard title="Recent achievements">
            <ul className="space-y-3 text-sm">
              {[
                { icon: Star, text: "Neha unlocked 'Speed Demon' badge", tone: "text-gold" },
                { icon: Award, text: "PaperHeros hit 10k active users", tone: "text-emerald" },
                { icon: Medal, text: "Kabir earned 'Zero Downtime' cert", tone: "text-royal" },
              ].map((a, i) => (
                <li key={i} className="flex items-start gap-2">
                  <a.icon className={cn("h-4 w-4 mt-0.5 shrink-0", a.tone)} />
                  <span>{a.text}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
