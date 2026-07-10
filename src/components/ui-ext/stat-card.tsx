import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

const tones = {
  royal: "gradient-royal text-white",
  emerald: "gradient-emerald text-white",
  gold: "gradient-gold text-[color:var(--gold-foreground)]",
} as const;

export function StatCard({
  label,
  value,
  delta,
  tone = "royal",
  icon,
  index = 0,
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: keyof typeof tones;
  icon?: ReactNode;
  index?: number;
}) {
  const positive = delta ? !delta.trim().startsWith("-") : true;
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
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className={cn("grid h-10 w-10 place-items-center rounded-xl shadow-elevated", tones[tone])}>
          {icon}
        </div>
      </div>
      {delta && (
        <div className="mt-4 flex items-center gap-1 text-xs font-medium">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5",
              positive
                ? "bg-emerald/10 text-emerald"
                : "bg-destructive/10 text-destructive",
            )}
          >
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </motion.div>
  );
}
