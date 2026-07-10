import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, TrendingUp, Users, FolderKanban, Wallet } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { ventures } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/ventures")({
  head: () => ({ meta: [{ title: "Ventures — Thenam ERP" }] }),
  component: VenturesPage,
});

function VenturesPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Ventures"
        subtitle="Every business under the Thenam umbrella."
        actions={<Button className="rounded-xl gradient-royal text-white">New venture</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
        {ventures.map((v, i) => (
          <motion.article
            key={v.key}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="group relative overflow-hidden rounded-3xl border border-border bg-card p-6 card-hover"
          >
            <div className={`absolute -right-16 -top-16 h-64 w-64 rounded-full ${v.gradient} opacity-20 blur-3xl`} />
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="min-w-0">
                <div className={`inline-flex items-center gap-2 rounded-full ${v.gradient} px-3 py-1 text-xs font-medium text-white shadow-elevated`}>
                  Active
                </div>
                <h3 className="mt-3 text-2xl font-semibold tracking-tight truncate">{v.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground truncate">{v.tagline}</p>
              </div>
              <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white text-lg font-bold ${v.gradient} shadow-elevated`}>
                {v.name[0]}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-4 gap-3">
              {[
                { icon: Wallet, label: "Revenue", value: v.revenue },
                { icon: FolderKanban, label: "Projects", value: v.projects },
                { icon: Users, label: "Team", value: v.employees },
                { icon: TrendingUp, label: "Growth", value: `+${v.growth}%` },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-border/60 bg-muted/40 p-3">
                  <m.icon className="h-4 w-4 text-muted-foreground" />
                  <p className="mt-2 text-[11px] text-muted-foreground">{m.label}</p>
                  <p className="text-sm font-semibold">{m.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((k) => (
                  <img
                    key={k}
                    src={`https://i.pravatar.cc/60?img=${k * 7 + i}`}
                    className="h-8 w-8 rounded-full ring-2 ring-card object-cover"
                    alt=""
                  />
                ))}
              </div>
              <Button variant="ghost" className="gap-1 group/btn">
                View details
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>
            </div>
          </motion.article>
        ))}
      </div>
    </PageContainer>
  );
}
