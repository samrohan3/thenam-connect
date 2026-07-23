import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { StatCard } from "@/components/ui-ext/stat-card";
import { Activity, LineChart, Target, Users, TrendingUp } from "lucide-react";
import {
  useFinanceSummary,
  useDashboardStats,
  useDashboardCharts,
  useEmployees,
  useTasks
} from "@/lib/api-hooks";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export const Route = createFileRoute("/_app/analytics")({
  head: () => ({ meta: [{ title: "Analytics — Thenam ERP" }] }),
  component: AnalyticsPage,
});

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

function AnalyticsPage() {
  const { data: summary, isLoading: isSumLoading } = useFinanceSummary();
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const { data: chartData, isLoading: isChartLoading } = useDashboardCharts();
  const { data: employees } = useEmployees();
  const { data: tasks } = useTasks();

  // Calculate task distribution for productivity pie chart
  const taskStatusDistribution = [
    { name: 'Completed', value: tasks?.filter((t: any) => t.status === 'Completed').length || 0 },
    { name: 'In Progress', value: tasks?.filter((t: any) => t.status === 'In Progress').length || 0 },
    { name: 'Pending', value: tasks?.filter((t: any) => t.status === 'Pending').length || 0 },
    { name: 'Review', value: tasks?.filter((t: any) => t.status === 'Review').length || 0 },
  ].filter(d => d.value > 0);

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        subtitle="Cross-venture performance intelligence and analytics."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active users"
          value={isStatsLoading ? "..." : String(stats?.activeEmployees || employees?.length || 0)}
          delta="—"
          tone="royal"
          icon={<Users className="h-5 w-5" />}
          index={0}
        />
        <StatCard
          label="Task Completion Rate"
          value={isStatsLoading || !stats ? "..." : `${Math.round(((stats.completedTasks || 0) / Math.max(1, (stats.completedTasks || 0) + (stats.pendingTasks || 0))) * 100)}%`}
          delta="—"
          tone="emerald"
          icon={<Target className="h-5 w-5" />}
          index={1}
        />
        <StatCard
          label="Active Ventures"
          value={isStatsLoading ? "..." : String(stats?.activeVentures || 0)}
          delta="—"
          tone="gold"
          icon={<Activity className="h-5 w-5" />}
          index={2}
        />
        <StatCard
          label="Monthly MRR / Revenue"
          value={isSumLoading ? "..." : `$${(summary?.inMonth || summary?.walletBalance || 0).toLocaleString()}`}
          delta="—"
          tone="royal"
          icon={<LineChart className="h-5 w-5" />}
          index={3}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Growth trajectory" description="Monthly revenue trajectory across all ventures">
          {isChartLoading ? (
            <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground">Loading growth data...</div>
          ) : (
            <div className="h-[280px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData?.revenueSeries || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="anRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                  <YAxis tickFormatter={(v) => `$${v}`} tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#anRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Team productivity" description="Task completion breakdown">
          {taskStatusDistribution.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-xs text-muted-foreground">No task data recorded</div>
          ) : (
            <div className="h-[280px] w-full mt-4 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskStatusDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {taskStatusDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Profit trajectory" className="mt-4" description="Monthly Revenue vs Expenses comparison">
        {isChartLoading ? (
          <div className="h-[300px] flex items-center justify-center text-xs text-muted-foreground">Loading profit data...</div>
        ) : (
          <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData?.revenueSeries || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                <YAxis tickFormatter={(v) => `$${v}`} tick={{ fill: 'currentColor' }} tickLine={false} axisLine={false} className="text-xs text-muted-foreground" />
                <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', borderRadius: '12px' }} />
                <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>
    </PageContainer>
  );
}
