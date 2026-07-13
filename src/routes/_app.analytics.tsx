import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { StatCard } from "@/components/ui-ext/stat-card";
import { Activity, LineChart, Target, Users } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Thenam ERP" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        subtitle="Cross-venture performance intelligence."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Active users" value="—" delta="—" tone="royal" icon={<Users className="h-5 w-5" />} index={0} />
        <StatCard label="Conversion" value="—" delta="—" tone="emerald" icon={<Target className="h-5 w-5" />} index={1} />
        <StatCard label="Engagement" value="—" delta="—" tone="gold" icon={<Activity className="h-5 w-5" />} index={2} />
        <StatCard label="MRR" value="—" delta="—" tone="royal" icon={<LineChart className="h-5 w-5" />} index={3} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Growth trajectory" description="Connect backend to view real data">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-[280px] flex items-center justify-center text-muted-foreground text-sm"
          >
            <div className="text-center space-y-2">
              <LineChart className="h-10 w-10 mx-auto opacity-30" />
              <p>No analytics data yet</p>
            </div>
          </motion.div>
        </SectionCard>

        <SectionCard title="Team productivity" description="Connect backend to view real data">
          <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center space-y-2">
              <Users className="h-10 w-10 mx-auto opacity-30" />
              <p>No productivity data yet</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Profit trajectory" className="mt-4" description="Connect backend to view real data">
        <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
          <div className="text-center space-y-2">
            <Activity className="h-10 w-10 mx-auto opacity-30" />
            <p>No profit data yet</p>
            <p className="text-xs">Add your MongoDB Atlas URI to get started</p>
          </div>
        </div>
      </SectionCard>
    </PageContainer>
  );
}
