import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { StatCard } from "@/components/ui-ext/stat-card";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { FileDown, FileSpreadsheet, TrendingUp, PieChart, Activity, Percent } from "lucide-react";
import {
  useFinanceSummary,
  useDashboardStats,
  useDashboardCharts,
  useVentures,
  useProjects
} from "@/lib/api-hooks";
import {
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/authStore";
import { canAccessRoute } from "@/lib/permissions";
import { AccessDenied } from "@/components/rbac/AccessDenied";

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

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function ReportsPage() {
  const { user } = useAuthStore();

  // Route Protection Check
  if (!canAccessRoute(user?.role, "/reports")) {
    return <AccessDenied resource="Reports" />;
  }

  const { data: summary, isLoading: isSumLoading } = useFinanceSummary();
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const { data: chartData, isLoading: isChartLoading } = useDashboardCharts();
  const { data: ventures } = useVentures();
  const { data: projects } = useProjects();

  const handleExportCSV = (title = "Financial_Summary_Report") => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n"
      + `Total Revenue,₹${summary?.walletBalance || 0}\n`
      + `Money In Today,₹${summary?.inToday || 0}\n`
      + `Money Out Today,₹${summary?.outToday || 0}\n`
      + `Monthly Profit,₹${summary?.monthProfit || 0}\n`
      + `Active Ventures,${stats?.activeVentures || 0}\n`
      + `Active Projects,${stats?.activeProjects || 0}\n`
      + `Completed Tasks,${stats?.completedTasks || 0}\n`;
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${title} exported successfully!`);
  };

  const projectStatusData = [
    { name: 'Planning', value: projects?.filter((p: any) => p.status === 'Planning').length || 0 },
    { name: 'In Progress', value: projects?.filter((p: any) => p.status === 'Active' || p.status === 'In Progress').length || 0 },
    { name: 'Testing', value: projects?.filter((p: any) => p.status === 'Testing').length || 0 },
    { name: 'Completed', value: projects?.filter((p: any) => p.status === 'Completed').length || 0 },
  ].filter(d => d.value > 0);

  return (
    <PageContainer>
      <PageHeader
        title="Reports"
        subtitle="Financial and operational reports across ventures."
        actions={
          <>
            <Button variant="outline" className="rounded-xl gap-1.5 cursor-pointer" onClick={() => handleExportCSV("Financial_Report_Excel")}>
              <FileSpreadsheet className="h-4 w-4" /> Export CSV / Excel
            </Button>
            <Button className="rounded-xl gradient-royal text-white gap-1.5 cursor-pointer" onClick={() => handleExportCSV("Executive_Summary_PDF")}>
              <FileDown className="h-4 w-4" /> Export Report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={isSumLoading ? "..." : `₹${(summary?.walletBalance || 0).toLocaleString()}`}
          delta="—"
          tone="royal"
          icon={<TrendingUp className="h-5 w-5" />}
          index={0}
        />
        <StatCard
          label="Monthly Profit Margin"
          value={isSumLoading || !summary?.walletBalance ? "..." : `${Math.round(((summary.monthProfit || 0) / Math.max(1, summary.walletBalance)) * 100)}%`}
          delta="—"
          tone="emerald"
          icon={<Percent className="h-5 w-5" />}
          index={1}
        />
        <StatCard
          label="Active Ventures"
          value={isStatsLoading ? "..." : String(stats?.activeVentures || ventures?.length || 0)}
          delta="—"
          tone="gold"
          icon={<PieChart className="h-5 w-5" />}
          index={2}
        />
        <StatCard
          label="Completed Projects"
          value={isStatsLoading ? "..." : String(stats?.completedProjects || 0)}
          delta="—"
          tone="royal"
          icon={<Activity className="h-5 w-5" />}
          index={3}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Monthly report" description="Revenue vs Expenses monthly breakdown">
          {isChartLoading ? (
            <div className="h-[300px] flex items-center justify-center text-xs text-muted-foreground">Loading revenue data...</div>
          ) : (
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData?.revenueSeries || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                  <YAxis tickFormatter={(v) => `₹${v}`} tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Project Delivery" description="Project status distribution">
          {projectStatusData.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-xs text-muted-foreground">No project data recorded</div>
          ) : (
            <div className="h-[300px] w-full mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {projectStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px' }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Report library" description="Generate & export recurring reports" className="mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportTypes.map((r) => (
            <div key={r} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-4 card-hover">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{r}</p>
                <p className="text-xs text-muted-foreground">Generated automatically · Live</p>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 cursor-pointer" onClick={() => handleExportCSV(r.replace(/\s+/g, '_'))}>
                <FileDown className="h-4 w-4" /> Download
              </Button>
            </div>
          ))}
        </div>
      </SectionCard>
      <Toaster />
    </PageContainer>
  );
}
