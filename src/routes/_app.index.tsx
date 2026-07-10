import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  Users,
  CheckCircle2,
  ClipboardList,
  Plus,
  ArrowRight,
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { StatCard } from "@/components/ui-ext/stat-card";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  expenseBreakdown,
  productivity,
  projectStatus,
  revenueSeries,
  stats,
} from "@/lib/mock-data";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Thenam Software Solutions ERP" },
      { name: "description", content: "Executive dashboard for ventures, finance, teams and projects." },
    ],
  }),
  component: DashboardPage,
});

const chartColors = ["var(--royal)", "var(--emerald)", "var(--gold)", "var(--chart-4)", "var(--chart-5)"];
const iconFor = [DollarSign, TrendingUp, Briefcase, Users, CheckCircle2, ClipboardList];

function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Welcome back, Aarav"
        subtitle="Here's what's happening across Thenam ventures today."
        actions={
          <>
            <Button variant="outline" className="rounded-xl">Last 30 days</Button>
            <Button className="rounded-xl gradient-royal text-white hover:opacity-90 gap-1.5">
              <Plus className="h-4 w-4" /> New report
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, i) => {
          const Icon = iconFor[i];
          return (
            <StatCard
              key={s.label}
              label={s.label}
              value={s.value}
              delta={s.delta}
              tone={s.tone as "royal" | "emerald" | "gold"}
              icon={<Icon className="h-5 w-5" />}
              index={i}
            />
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
        <SectionCard
          className="xl:col-span-2"
          title="Revenue overview"
          description="Monthly revenue vs expenses"
          actions={<Badge variant="secondary" className="rounded-full">FY 2026</Badge>}
        >
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries} margin={{ left: -10, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="revA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--royal)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--royal)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--emerald)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--emerald)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Area type="monotone" dataKey="revenue" stroke="var(--royal)" strokeWidth={2.5} fill="url(#revA)" />
                <Area type="monotone" dataKey="expense" stroke="var(--emerald)" strokeWidth={2.5} fill="url(#expA)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Expense breakdown" description="Where the money goes" delay={0.05}>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {expenseBreakdown.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Profit trend" description="Rolling 12 months" delay={0.05}>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSeries} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Line type="monotone" dataKey="profit" stroke="var(--gold)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Employee productivity" description="Team performance index" delay={0.1}>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivity} margin={{ left: -20, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="team" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="var(--royal)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Project status" description="Across all ventures" delay={0.15}>
          <div className="space-y-3">
            {projectStatus.map((s) => (
              <div key={s.name} className="grid grid-cols-[100px_1fr_auto] items-center gap-3">
                <span className="text-xs text-muted-foreground truncate">{s.name}</span>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-royal"
                    style={{ width: `${(s.value / 25) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold tabular-nums">{s.value}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard
        className="mt-4"
        title="Quick actions"
        description="Jump into common workflows"
        delay={0.15}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Create project", tone: "gradient-royal" },
            { label: "Add employee", tone: "gradient-emerald" },
            { label: "Record payment", tone: "gradient-gold" },
            { label: "Generate report", tone: "gradient-brand" },
          ].map((a) => (
            <button
              key={a.label}
              className={`group relative overflow-hidden rounded-2xl ${a.tone} p-4 text-left text-white shadow-elevated card-hover`}
            >
              <p className="text-sm font-medium">{a.label}</p>
              <ArrowRight className="mt-6 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          ))}
        </div>
      </SectionCard>
    </PageContainer>
  );
}
