import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Wallet, TrendingUp, TrendingDown, Scale, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

function fmt(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `${sign}$${(abs / 1_000).toFixed(1)}K`;
  return `${sign}$${abs.toLocaleString()}`;
}

interface Summary {
  walletBalance: number;
  inToday: number;
  outToday: number;
  netToday: number;
  todayChange: number;
  monthProfit: number;
}

const tones = {
  royal: "gradient-royal text-white",
  emerald: "gradient-emerald text-white",
  gold: "gradient-gold text-[color:var(--gold-foreground)]",
} as const;

function Card({
  label,
  value,
  delta,
  positive,
  tone,
  icon,
  index,
}: {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
  tone: keyof typeof tones;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 card-hover"
    >
      <div className={cn("absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-25 blur-2xl", tones[tone])} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        </div>
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl shadow-elevated", tones[tone])}>
          {icon}
        </div>
      </div>
      {delta !== undefined && (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
              positive ? "bg-emerald/10 text-emerald" : "bg-destructive/10 text-destructive",
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </span>
          <span className="text-muted-foreground">today</span>
        </div>
      )}
    </motion.div>
  );
}

export function FinanceSummaryCards({ s }: { s: Summary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      <Card
        index={0}
        tone="royal"
        icon={<Wallet className="h-5 w-5" />}
        label="Company Wallet"
        value={fmt(s.walletBalance)}
        delta={`${s.todayChange >= 0 ? "+" : ""}${fmt(s.todayChange)}`}
        positive={s.todayChange >= 0}
      />
      <Card
        index={1}
        tone="emerald"
        icon={<TrendingUp className="h-5 w-5" />}
        label="Money In Today"
        value={fmt(s.inToday)}
        delta={fmt(s.inToday)}
        positive
      />
      <Card
        index={2}
        tone="gold"
        icon={<TrendingDown className="h-5 w-5" />}
        label="Money Out Today"
        value={fmt(s.outToday)}
        delta={fmt(s.outToday)}
        positive={false}
      />
      <Card
        index={3}
        tone="royal"
        icon={<Scale className="h-5 w-5" />}
        label="Net Balance Today"
        value={fmt(s.netToday)}
        delta={`${s.netToday >= 0 ? "+" : ""}${fmt(s.netToday)}`}
        positive={s.netToday >= 0}
      />
      <Card
        index={4}
        tone="emerald"
        icon={<PiggyBank className="h-5 w-5" />}
        label="Monthly Profit"
        value={fmt(s.monthProfit)}
        delta={`${s.monthProfit >= 0 ? "+" : ""}${fmt(s.monthProfit)}`}
        positive={s.monthProfit >= 0}
      />
    </div>
  );
}
