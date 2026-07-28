import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  TrendingUp,
  Briefcase,
  Users,
  Users2,
  CheckCircle2,
  ClipboardList,
  Plus,
  Wallet,
  UserPlus,
  Layers
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { StatCard } from "@/components/ui-ext/stat-card";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useDashboardStats, useDashboardCharts, useRecentActivities } from "@/lib/api-hooks";
import { useAuthStore } from "@/store/authStore";
import { canAccessRoute, hasPermission, normalizeRole } from "@/lib/permissions";
import { RoleGuard } from "@/components/rbac/RoleGuard";
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
  const { user } = useAuthStore();
  const role = normalizeRole(user?.role);

  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const { data: chartData, isLoading: isChartsLoading } = useDashboardCharts();
  const { data: recentActivities, isLoading: isActivitiesLoading } = useRecentActivities();

  const canSeeFinance = hasPermission(user?.role, "finance", "read");
  const canSeeVentures = canAccessRoute(user?.role, "/ventures");
  const canSeeTeam = canAccessRoute(user?.role, "/team");
  const canSeeTeams = canAccessRoute(user?.role, "/teams");
  const canSeeProjects = canAccessRoute(user?.role, "/projects");
  const canSeeTasks = canAccessRoute(user?.role, "/tasks");

  const quickActions = [
    { label: "Create venture", tone: "gradient-royal", path: "/ventures", resource: "ventures", action: "create" },
    { label: "Create team", tone: "gradient-brand", path: "/teams", resource: "teams", action: "create" },
    { label: "Add employee", tone: "gradient-emerald", path: "/team", resource: "team", action: "create" },
    { label: "Record payment", tone: "gradient-gold", path: "/finance", resource: "finance", action: "create" },
  ].filter(a => hasPermission(user?.role, a.resource as any, a.action as any));

  return (
    <PageContainer>
      <PageHeader
        title={`Welcome back, ${user?.name || "User"}`}
        subtitle={`${role} Dashboard — Overview across Thenam ventures & teams.`}
        actions={
          <RoleGuard resource="ventures" action="create">
            <Button className="rounded-xl gradient-royal text-white hover:opacity-90 gap-1.5 cursor-pointer" onClick={() => navigate({ to: "/ventures" })}>
              <Plus className="h-4 w-4" /> New venture
            </Button>
          </RoleGuard>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {canSeeFinance && (
          <StatCard
            label="Total Revenue"
            value={isStatsLoading ? "..." : `₹${stats?.totalRevenue?.toLocaleString() || "0"}`}
            delta="—"
            tone="royal"
            icon={<Wallet className="h-5 w-5" />}
            index={0}
          />
        )}
        {canSeeFinance && (
          <StatCard
            label="Monthly Profit"
            value={isStatsLoading ? "..." : `₹${stats?.profit?.toLocaleString() || "0"}`}
            delta="—"
            tone="emerald"
            icon={<TrendingUp className="h-5 w-5" />}
            index={1}
          />
        )}
        {canSeeVentures && (
          <StatCard
            label="Active Ventures"
            value={isStatsLoading ? "..." : String(stats?.activeVentures || 0)}
            delta="—"
            tone="gold"
            icon={<Briefcase className="h-5 w-5" />}
            index={2}
          />
        )}
        {canSeeTeams && (
          <StatCard
            label="Total Teams"
            value={isStatsLoading ? "..." : String(stats?.totalTeams || 0)}
            delta="—"
            tone="royal"
            icon={<Users2 className="h-5 w-5" />}
            index={3}
          />
        )}
        {canSeeTeam && (
          <StatCard
            label="Employees"
            value={isStatsLoading ? "..." : String(stats?.activeEmployees || stats?.totalEmployees || 0)}
            delta="—"
            tone="emerald"
            icon={<Users className="h-5 w-5" />}
            index={4}
          />
        )}
        {canSeeProjects && (
          <StatCard
            label="Completed Projects"
            value={isStatsLoading ? "..." : String(stats?.completedProjects || 0)}
            delta="—"
            tone="gold"
            icon={<CheckCircle2 className="h-5 w-5" />}
            index={5}
          />
        )}
      </div>

      {/* Team Distribution & Recent Joinings Widgets */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Teams Breakdown Widget */}
        <SectionCard title="Active Teams Overview" description="Member distribution per team & venture">
          {isStatsLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading teams data...</div>
          ) : !stats?.teamDistribution || stats.teamDistribution.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No active teams created yet.</div>
          ) : (
            <div className="space-y-3 mt-3">
              {stats.teamDistribution.slice(0, 5).map((t: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{t.teamName}</p>
                      <p className="text-[10px] text-muted-foreground">{t.ventureName || "Venture Team"}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {t.memberCount || 0} Members
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        {/* Recent Joinings Widget */}
        <SectionCard title="Recent Joinings" description="Newly onboarded team members">
          {isStatsLoading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Loading recent joinings...</div>
          ) : !stats?.recentJoinings || stats.recentJoinings.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">No recent employee joinings recorded.</div>
          ) : (
            <div className="space-y-3 mt-3">
              {stats.recentJoinings.map((emp: any) => (
                <div key={emp._id} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={emp.avatar || emp.photo} />
                      <AvatarFallback>{emp.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-bold text-foreground">{emp.name}</p>
                      <p className="text-[10px] text-muted-foreground">{emp.designation || emp.role} • {emp.venture?.name || "Venture"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="font-mono text-[10px] text-primary">
                      {emp.employeeId || "EMP"}
                    </Badge>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      Joined {new Date(emp.joiningDate || emp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Venture Credit Summary Widget */}
      <div className="mt-6">
        <SectionCard
          title="Credit Amount per Venture"
          description="Total credited revenue and funds received by venture"
        >
          {isStatsLoading ? (
            <div className="py-6 text-center text-xs text-muted-foreground">Loading venture credits...</div>
          ) : !stats?.ventureCredits || stats.ventureCredits.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">No venture credit data available.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {stats.ventureCredits.map((vc: any) => (
                <div
                  key={vc.ventureId}
                  className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between shadow-sm"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground">{vc.ventureName}</p>
                      <p className="text-[10px] text-muted-foreground">Credited Funds</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs text-emerald-500 font-bold bg-emerald-500/10 border-0">
                    ₹{vc.creditAmount?.toLocaleString() || "0"} credit
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Revenue chart (Only for roles with finance access) */}
      {canSeeFinance && (
        <div className="mt-6">
          <SectionCard
            title="Revenue Overview"
            description="Revenue vs Expenses performance summary"
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
                        <stop offset="5%" stopColor="var(--color-royal)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-royal)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-gold)" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="var(--color-gold)" stopOpacity={0}/>
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
                      tickFormatter={(value) => `₹${value}`}
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
                      stroke="var(--color-royal)"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Expense"
                      stroke="var(--color-gold)"
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
      )}

      {/* Quick actions and Activity logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {quickActions.length > 0 && (
          <div className="lg:col-span-2">
            <SectionCard
              title="Quick Actions"
              description="Jump into common workflows"
            >
              <div className="grid grid-cols-2 gap-3 mt-4">
                {quickActions.map((a) => (
                  <button
                    key={a.label}
                    onClick={() => navigate({ to: a.path as any })}
                    className={`group relative overflow-hidden rounded-2xl ${a.tone} p-5 text-left text-white shadow-elevated card-hover cursor-pointer`}
                  >
                    <p className="text-sm font-semibold">{a.label}</p>
                  </button>
                ))}
              </div>
            </SectionCard>
          </div>
        )}

        <div className={quickActions.length === 0 ? "lg:col-span-3" : ""}>
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
                            <span className="h-8 w-8 rounded-full bg-muted flex items-center justify-center ring-4 ring-slate-900 text-xs font-semibold text-muted-foreground">
                              {act.userName?.charAt(0) || act.user?.name?.charAt(0) || 'A'}
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-xs text-foreground">
                                <span className="font-semibold text-muted-foreground">{act.userName || act.user?.name || "System"}</span>{" "}
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
