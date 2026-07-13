import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Building2, ArrowRight } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui-ext/section-card";

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

      <SectionCard title="Your ventures" description="No ventures found yet">
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
      </SectionCard>
    </PageContainer>
  );
}
