import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Trophy, Award } from "lucide-react";
import { motion } from "framer-motion";
import { useRewards } from "@/lib/api-hooks";

export const Route = createFileRoute("/_app/rewards")({
  head: () => ({ meta: [{ title: "Rewards — Thenam ERP" }] }),
  component: RewardsPage,
});

function RewardsPage() {
  const { data: rewards, isLoading } = useRewards();

  return (
    <PageContainer>
      <PageHeader
        title="Rewards"
        subtitle="Leaderboard, badges and team achievements."
      />

      <SectionCard title="Leaderboard" description={`${rewards?.length || 0} achievements recorded`}>
        {isLoading ? (
          <div className="py-20 text-center text-muted-foreground">Loading rewards leaderboard...</div>
        ) : !rewards || rewards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center gap-4"
          >
            <div className="grid h-20 w-20 place-items-center rounded-3xl gradient-gold text-white shadow-elevated">
              <Trophy className="h-9 w-9" />
            </div>
            <div>
              <p className="text-lg font-semibold">No rewards data yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Employee activity will populate the leaderboard automatically.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rewards.map((rew: any, idx: number) => (
              <div key={rew._id} className="p-5 rounded-2xl bg-slate-900 border border-border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : idx === 1 ? 'bg-slate-300/20 text-slate-200' : 'bg-slate-800 text-slate-400'}`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground text-sm">{rew.employee?.name || "Employee"}</h4>
                    <p className="text-xs text-muted-foreground">{rew.title}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{rew.employee?.department || "Team"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1.5 rounded-xl font-bold text-sm">
                  <Award className="w-4 h-4" />
                  <span>+{rew.points}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </PageContainer>
  );
}
