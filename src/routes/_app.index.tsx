import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  Briefcase,
  Users,
  CheckCircle2,
  ClipboardList,
  Plus,
  Wallet
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { StatCard } from "@/components/ui-ext/stat-card";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { useDashboardStats } from "@/lib/api-hooks";

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
  const { data: stats, isLoading } = useDashboardStats();

  return (
    <PageContainer>
      <PageHeader
        title="Welcome back"
        subtitle="Live data across Thenam ventures."
        actions={
          <>
            <Button variant="outline" className="rounded-xl">Last 30 days</Button>
            <Button className="rounded-xl gradient-royal text-white hover:opacity-90 gap-1.5">
              <Plus className="h-4 w-4" /> New report
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard
            label="Total Revenue"
            value={isLoading ? "..." : `$${stats?.totalRevenue?.toLocaleString() || "0"}`}
            delta="—"
            tone="royal"
            icon={<Wallet className="h-5 w-5" />}
            index={0}
          />
          <StatCard
            label="Monthly Profit"
            value={isLoading ? "..." : `$${stats?.profit?.toLocaleString() || "0"}`}
            delta="—"
            tone="emerald"
            icon={<TrendingUp className="h-5 w-5" />}
            index={1}
          />
          <StatCard
            label="Active Ventures"
            value={isLoading ? "..." : String(stats?.activeVentures || 0)}
            delta="—"
            tone="gold"
            icon={<Briefcase className="h-5 w-5" />}
            index={2}
          />
          <StatCard
            label="Employees"
            value={isLoading ? "..." : String(stats?.activeEmployees || 0)}
            delta="—"
            tone="royal"
            icon={<Users className="h-5 w-5" />}
            index={3}
          />
          <StatCard
            label="Completed Projects"
            value={isLoading ? "..." : String(stats?.completedTasks || 0)} // Placeholder, we didn't add completedProjects to backend stats yet
            delta="—"
            tone="emerald"
            icon={<CheckCircle2 className="h-5 w-5" />}
            index={4}
          />
          <StatCard
            label="Pending Tasks"
            value={isLoading ? "..." : String(stats?.pendingTasks || 0)}
            delta="—"
            tone="gold"
            icon={<ClipboardList className="h-5 w-5" />}
            index={5}
          />
      </div>

      {/* Revenue chart — empty state for now until chart hook is implemented */}
      <div className="mt-6">
        <SectionCard
          title="Revenue overview"
          description="Revenue vs Expenses this year"
        >
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center space-y-2">
              <TrendingUp className="h-10 w-10 mx-auto opacity-30" />
              <p>Chart coming soon</p>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Quick actions */}
      <SectionCard
        className="mt-4"
        title="Quick actions"
        description="Jump into common workflows"
        delay={0.15}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Create venture", tone: "gradient-royal" },
            { label: "Add employee", tone: "gradient-emerald" },
            { label: "Record payment", tone: "gradient-gold" },
            { label: "Generate report", tone: "gradient-brand" },
          ].map((a) => (
            <button
              key={a.label}
              className={`group relative overflow-hidden rounded-2xl ${a.tone} p-4 text-left text-white shadow-elevated card-hover`}
            >
              <p className="text-sm font-medium">{a.label}</p>
            </button>
          ))}
        </div>
      </SectionCard>
    </PageContainer>
  );
}
