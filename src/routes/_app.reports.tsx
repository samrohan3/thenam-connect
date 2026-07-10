import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { StatCard } from "@/components/ui-ext/stat-card";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { revenueSeries, productivity } from "@/lib/mock-data";
import { FileDown, FileSpreadsheet, TrendingUp, PieChart, Activity, Percent } from "lucide-react";

export const Route = createFileRoute("/_app/reports")({
  head: () => ({ meta: [{ title: "Reports — Thenam ERP" }] }),
  component: ReportsPage,
});

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
        <StatCard label="Revenue" value="$2.4M" delta="+12%" tone="royal" icon={<TrendingUp className="h-5 w-5" />} index={0} />
        <StatCard label="ROI" value="34.2%" delta="+2.1%" tone="emerald" icon={<Percent className="h-5 w-5" />} index={1} />
        <StatCard label="Growth" value="+24%" delta="+3%" tone="gold" icon={<PieChart className="h-5 w-5" />} index={2} />
        <StatCard label="Performance" value="92 / 100" delta="+4" tone="royal" icon={<Activity className="h-5 w-5" />} index={3} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Monthly report" description="Revenue trajectory this year">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ left: -10, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="ra" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--emerald)" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="var(--emerald)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--emerald)" strokeWidth={2.5} fill="url(#ra)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Team performance" description="Productivity index">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivity} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="team" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Bar dataKey="value" fill="var(--royal)" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Report library" description="Recurring reports" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            "Monthly Financial Summary",
            "Quarterly Investor Report",
            "Venture Performance Snapshot",
            "Team Productivity Analysis",
            "Marketing ROI Breakdown",
            "Operations Health Check",
          ].map((r) => (
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
