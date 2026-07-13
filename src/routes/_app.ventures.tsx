import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Building2, ArrowRight } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui-ext/section-card";
import { useVentures } from "@/lib/api-hooks";

export const Route = createFileRoute("/_app/ventures")({
  head: () => ({ meta: [{ title: "Ventures — Thenam ERP" }] }),
  component: VenturesPage,
});

function VenturesPage() {
  const { data: ventures, isLoading } = useVentures();

  return (
    <PageContainer>
      <PageHeader
        title="Ventures"
        subtitle="Every business under the Thenam umbrella."
        actions={<Button className="rounded-xl gradient-royal text-white">New venture</Button>}
      />

      <SectionCard title="Your ventures" description={`${ventures?.length || 0} ventures found`}>
        {isLoading ? (
            <div className="py-20 text-center text-muted-foreground">Loading ventures...</div>
        ) : !ventures || ventures.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center gap-4"
            >
              <div className="grid h-20 w-20 place-items-center rounded-3xl gradient-royal text-white shadow-elevated">
                <Building2 className="h-9 w-9" />
              </div>
              <div>
                <p className="text-lg font-semibold">No ventures yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first venture to start tracking revenue, teams and projects.
                </p>
              </div>
              <Button className="rounded-xl gradient-royal text-white gap-1.5 mt-2">
                <ArrowRight className="h-4 w-4" /> Create venture
              </Button>
            </motion.div>
        ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ventures.map((venture: any) => (
                    <div key={venture._id} className="p-5 rounded-2xl bg-slate-900 border border-border">
                        <div className="flex justify-between items-start mb-4">
                            <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-800 text-slate-300">
                                <Building2 className="h-6 w-6" />
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${venture.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                                {venture.status}
                            </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{venture.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{venture.description}</p>
                        
                        <div className="flex gap-4 text-sm mt-4 pt-4 border-t border-border/50">
                            <div className="flex flex-col">
                                <span className="text-muted-foreground">Type</span>
                                <span className="font-medium text-foreground capitalize">{venture.type}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </SectionCard>
    </PageContainer>
  );
}
