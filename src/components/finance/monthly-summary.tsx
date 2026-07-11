import { SectionCard } from "@/components/ui-ext/section-card";
import { TrendingUp, TrendingDown, PiggyBank, Building2, Layers, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toLocaleString()}`;
}

export function MonthlySummary({
  inMonth,
  outMonth,
  monthProfit,
  topVenture,
  topCategory,
  txThisMonth,
}: {
  inMonth: number;
  outMonth: number;
  monthProfit: number;
  topVenture: string;
  topCategory: string;
  txThisMonth: number;
}) {
  const rows = [
    { icon: <TrendingUp className="h-4 w-4" />, label: "Total Revenue", value: fmt(inMonth), tone: "text-emerald" },
    { icon: <TrendingDown className="h-4 w-4" />, label: "Total Expenses", value: fmt(outMonth), tone: "text-destructive" },
    { icon: <PiggyBank className="h-4 w-4" />, label: "Net Profit", value: fmt(monthProfit), tone: monthProfit >= 0 ? "text-emerald" : "text-destructive" },
    { icon: <Building2 className="h-4 w-4" />, label: "Highest Revenue Venture", value: topVenture, tone: "text-foreground" },
    { icon: <Layers className="h-4 w-4" />, label: "Highest Expense Category", value: topCategory, tone: "text-foreground" },
    { icon: <Receipt className="h-4 w-4" />, label: "Transactions This Month", value: String(txThisMonth), tone: "text-foreground" },
  ];
  return (
    <SectionCard title="Monthly Summary" description="Snapshot for the current month" className="mt-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-background border border-border">{r.icon}</span>
              <span className="truncate">{r.label}</span>
            </div>
            <span className={cn("font-semibold tabular-nums truncate", r.tone)}>{r.value}</span>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
