import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
} from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { StatCard } from "@/components/ui-ext/stat-card";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";

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

const iconFor = [DollarSign, TrendingUp, Briefcase, Users, CheckCircle2, ClipboardList];
const statLabels = ["Total Revenue", "Monthly Profit", "Active Ventures", "Employees", "Completed Projects", "Pending Tasks"];

function DashboardPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Welcome back"
        subtitle="Connect your backend to see live data across Thenam ventures."
        actions={
          <>
            <Button variant="outline" className="rounded-xl">Last 30 days</Button>
            <Button className="rounded-xl gradient-royal text-white hover:opacity-90 gap-1.5">
              <Plus className="h-4 w-4" /> New report
            </Button>
          </>
        }
      />

      {/* Stat cards — empty state */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statLabels.map((label, i) => {
          const Icon = iconFor[i];
          return (
            <StatCard
              key={label}
              label={label}
              value="—"
              delta="—"
              tone={["royal", "emerald", "gold"][i % 3] as "royal" | "emerald" | "gold"}
              icon={<Icon className="h-5 w-5" />}
              index={i}
            />
          );
        })}
      </div>

      {/* Revenue chart — empty state */}
      <div className="mt-6">
        <SectionCard
          title="Revenue overview"
          description="Connect your backend to see real revenue data"
        >
          <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
            <div className="text-center space-y-2">
              <TrendingUp className="h-10 w-10 mx-auto opacity-30" />
              <p>No data available yet</p>
              <p className="text-xs">Add your MongoDB Atlas URI to get started</p>
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
