import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/rewards")({
  head: () => ({ meta: [{ title: "Rewards — Thenam ERP" }] }),
  component: RewardsPage,
});

function RewardsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Rewards"
        subtitle="Leaderboard, badges and team achievements."
      />

      <SectionCard title="Leaderboard" description="Top performers this quarter">
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
      </SectionCard>
    </PageContainer>
  );
}
