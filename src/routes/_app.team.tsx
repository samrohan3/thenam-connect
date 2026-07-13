import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Users, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/team")({
  head: () => ({ meta: [{ title: "Team — Thenam ERP" }] }),
  component: TeamPage,
});

function TeamPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Team"
        subtitle="People across all ventures."
        actions={
          <Button className="rounded-xl gradient-royal text-white gap-1.5">
            <UserPlus className="h-4 w-4" /> Add employee
          </Button>
        }
      />

      <SectionCard title="Employees" description="No employees found yet">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center gap-4"
        >
          <div className="grid h-20 w-20 place-items-center rounded-3xl gradient-emerald text-white shadow-elevated">
            <Users className="h-9 w-9" />
          </div>
          <div>
            <p className="text-lg font-semibold">No team members yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add employees to track performance, roles and departments.
            </p>
          </div>
          <Button className="rounded-xl gradient-emerald text-white gap-1.5 mt-2">
            <UserPlus className="h-4 w-4" /> Add employee
          </Button>
        </motion.div>
      </SectionCard>
    </PageContainer>
  );
}
