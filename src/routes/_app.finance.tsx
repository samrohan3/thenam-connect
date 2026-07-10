import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowUpRight, Send, Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { StatCard } from "@/components/ui-ext/stat-card";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { expenseBreakdown, revenueSeries, transactions } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/finance")({
  head: () => ({ meta: [{ title: "Finance — Thenam ERP" }] }),
  component: FinancePage,
});

const chartColors = ["var(--royal)", "var(--emerald)", "var(--gold)", "var(--chart-4)", "var(--chart-5)"];

function FinancePage() {
  return (
    <PageContainer>
      <PageHeader
        title="Finance"
        subtitle="Wallets, revenue, expenses and investment health."
        actions={
          <Button className="rounded-xl gradient-emerald text-white gap-1.5">
            <Send className="h-4 w-4" /> Transfer funds
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Company Wallet" value="$1.28M" delta="+4.2%" tone="royal" icon={<Wallet className="h-5 w-5" />} index={0} />
        <StatCard label="Income" value="$402K" delta="+11%" tone="emerald" icon={<TrendingUp className="h-5 w-5" />} index={1} />
        <StatCard label="Expenses" value="$210K" delta="+3%" tone="gold" icon={<TrendingDown className="h-5 w-5" />} index={2} />
        <StatCard label="Investments" value="$540K" delta="+7%" tone="royal" icon={<PiggyBank className="h-5 w-5" />} index={3} />
        <StatCard label="Profit" value="$192K" delta="+9%" tone="emerald" icon={<ArrowUpRight className="h-5 w-5" />} index={4} />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Revenue chart" description="Rolling 12 months" className="lg:col-span-2">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueSeries} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)" }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="revenue" fill="var(--royal)" radius={[6,6,0,0]} />
                <Bar dataKey="expense" fill="var(--gold)" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard title="Expense categories" description="This quarter">
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={expenseBreakdown} dataKey="value" nameKey="name" outerRadius={95}>
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

      <SectionCard title="Recent transactions" description="Latest movements across all wallets" className="mt-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Party</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/40">
                  <TableCell className="font-mono text-xs">{t.id}</TableCell>
                  <TableCell className="font-medium">{t.party}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        t.type === "Income"
                          ? "bg-emerald/10 text-emerald hover:bg-emerald/10"
                          : "bg-gold/15 text-[color:var(--gold-foreground)] hover:bg-gold/15"
                      }
                    >
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">
                    {t.type === "Income" ? "+" : "-"}${t.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{t.date}</TableCell>
                  <TableCell>
                    <Badge variant={t.status === "Completed" ? "secondary" : "outline"}>{t.status}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </SectionCard>
    </PageContainer>
  );
}
