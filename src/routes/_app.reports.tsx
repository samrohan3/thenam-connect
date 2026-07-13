import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { StatCard } from "@/components/ui-ext/stat-card";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, TrendingUp, PieChart, Activity, Percent } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — Thenam ERP" }] }),
  component: ReportsPage,
});

const reportTypes = [
  "Monthly Financial Summary",
  "Quarterly Investor Report",
  "Venture Performance Snapshot",
  "Team Productivity Analysis",
  "Marketing ROI Breakdown",
  "Operations Health Check",
];

function ReportsPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        subtitle="Financial and operational reports across ventures."
        actions={
          <>
            <Button variant="outline" className="rounded-xl gap-1.5"><FileSpreadsheet className="h-4 w-4" /> Export Excel</Button>
            <Button className="rounded-xl gradient-royal text-white gap-1.5"><FileDown className="h-4 w-4" /> Export PDF</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Revenue" value="—" delta="—" tone="royal" icon={<TrendingUp className="h-5 w-5" />} index={0} />
        <StatCard label="ROI" value="—" delta="—" tone="emerald" icon={<Percent className="h-5 w-5" />} index={1} />
        <StatCard label="Growth" value="—" delta="—" tone="gold" icon={<PieChart className="h-5 w-5" />} index={2} />
        <StatCard label="Performance" value="—" delta="—" tone="royal" icon={<Activity className="h-5 w-5" />} index={3} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Monthly report" description="Connect backend to view revenue data">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center space-y-2">
              <TrendingUp className="h-10 w-10 mx-auto opacity-30" />
              <p>No report data yet</p>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Team performance" description="Connect backend to view productivity data">
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center space-y-2">
              <Activity className="h-10 w-10 mx-auto opacity-30" />
              <p>No performance data yet</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Report library" description="Recurring reports" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportTypes.map((r) => (
            <div key={r} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-4 card-hover">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{r}</p>
                <p className="text-xs text-muted-foreground">Generated automatically · Monthly</p>
              </div>
              <Button variant="ghost" size="sm" className="gap-1"><FileDown className="h-4 w-4" /> PDF</Button>
            </div>
          ))}
        </div>
      </SectionCard>
    </PageContainer>
  );
}
