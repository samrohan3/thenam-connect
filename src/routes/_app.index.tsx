import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  TrendingUp,
  Briefcase,
  Users,
  CheckCircle2,
  ClipboardList,
  Plus,
  Wallet,
  Activity
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { StatCard } from "@/components/ui-ext/stat-card";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useDashboardCharts, useRecentActivities } from "@/lib/api-hooks";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export const Route = createFileRoute("/_app/")(
  {
    head: () => ({
      meta: [
        { title: "Dashboard — Thenam Software Solutions ERP" },
        { name: "description", content: "Executive dashboard for ventures, finance, teams and projects." },
      ],
    }),
    component: DashboardPage,
  }
);

function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const { data: chartData, isLoading: isChartsLoading } = useDashboardCharts();
  const { data: recentActivities, isLoading: isActivitiesLoading } = useRecentActivities();

  return (
    <PageContainer>
      <PageHeader
        title="Welcome back"
        subtitle="Live data across Thenam ventures."
        actions={
          <>
            <Button variant="outline" className="rounded-xl">Last 30 days</Button>
            <Button className="rounded-xl gradient-royal text-white hover:opacity-90 gap-1.5" onClick={() => navigate({ to: "/ventures" })}>
              <Plus className="h-4 w-4" /> New venture
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            label="Total Revenue"
            value={isStatsLoading ? "..." : `$${stats?.totalRevenue?.toLocaleString() || "0"}`}
            delta="—"
            tone="royal"
            icon={<Wallet className="h-5 w-5" />}
            index={0}
          />
          <StatCard
            label="Monthly Profit"
            value={isStatsLoading ? "..." : `$${stats?.profit?.toLocaleString() || "0"}`}
            delta="—"
            tone="emerald"
            icon={<TrendingUp className="h-5 w-5" />}
            index={1}
          />
          <StatCard
            label="Active Ventures"
            value={isStatsLoading ? "..." : String(stats?.activeVentures || 0)}
            delta="—"
            tone="gold"
            icon={<Briefcase className="h-5 w-5" />}
            index={2}
          />
          <StatCard
            label="Employees"
            value={isStatsLoading ? "..." : String(stats?.activeEmployees || 0)}
            delta="—"
            tone="royal"
            icon={<Users className="h-5 w-5" />}
            index={3}
          />
          <StatCard
            label="Completed Projects"
            value={isStatsLoading ? "..." : String(stats?.completedProjects || 0)}
            delta="—"
            tone="emerald"
            icon={<CheckCircle2 className="h-5 w-5" />}
            index={4}
          />
          <StatCard
            label="Pending Tasks"
            value={isStatsLoading ? "..." : String(stats?.pendingTasks || 0)}
            delta="—"
            tone="gold"
            icon={<ClipboardList className="h-5 w-5" />}
            index={5}
          />
      </div>

      {/* Revenue chart */}
      <div className="mt-6">
        <SectionCard
          title="Revenue overview"
          description="Revenue vs Expenses this year"
        >
          {isChartsLoading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              Loading charts...
            </div>
          ) : !chartData?.revenueSeries || chartData.revenueSeries.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center space-y-2">
                <TrendingUp className="h-10 w-10 mx-auto opacity-30" />
                <p>No financial records this year</p>
              </div>
            </div>
          ) : (
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData.revenueSeries}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: 'currentColor' }}
                    tickLine={false}
                    axisLine={false}
                    className="text-xs text-muted-foreground"
                  />
                  <YAxis
                    tickFormatter={(value) => `$${value}`}
                    tick={{ fill: 'currentColor' }}
                    tickLine={false}
                    axisLine={false}
                    className="text-xs text-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.95)',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                    }}
                    labelClassName="text-sm font-semibold text-foreground mb-1"
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Quick actions and Activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <SectionCard
            title="Quick actions"
            description="Jump into common workflows"
          >
            <div className="grid grid-cols-2 gap-3 mt-4">
              {[
                { label: "Create venture", tone: "gradient-royal", path: "/ventures" },
                { label: "Add employee", tone: "gradient-emerald", path: "/team" },
                { label: "Record payment", tone: "gradient-gold", path: "/finance" },
                { label: "System settings", tone: "gradient-brand", path: "/settings" },
              ].map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate({ to: a.path })}
                  className={`group relative overflow-hidden rounded-2xl ${a.tone} p-5 text-left text-white shadow-elevated card-hover cursor-pointer`}
                >
                  <p className="text-sm font-semibold">{a.label}</p>
                </button>
              ))}
            </div>
          </SectionCard>
        </div>

        <div>
          <SectionCard
            title="Recent Activity"
            description="Real-time operational logs"
          >
            <div className="flow-root mt-4 max-h-[220px] overflow-y-auto pr-1">
              {isActivitiesLoading ? (
                <div className="py-8 text-center text-xs text-muted-foreground">Loading activities...</div>
              ) : !recentActivities || recentActivities.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">No recent activities.</div>
              ) : (
                <ul className="-mb-8">
                  {recentActivities.map((act: any, actIdx: number) => (
                    <li key={act._id}>
                      <div className="relative pb-8">
                        {actIdx !== recentActivities.length - 1 ? (
                          <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-border/30" aria-hidden="true" />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center ring-4 ring-slate-900 text-xs font-semibold text-slate-300">
                              {act.userName?.charAt(0) || act.user?.name?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-xs text-foreground">
                                <span className="font-semibold text-slate-300">{act.userName || act.user?.name || "System"}</span>{" "}
                                {act.action} <span className="font-semibold text-primary">{act.entityName || act.entity}</span>
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-[10px] text-muted-foreground">
                              {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageContainer>
  );
}
