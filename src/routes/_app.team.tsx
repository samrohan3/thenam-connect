import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Users, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { useEmployees } from "@/lib/api-hooks";

export const Route = createFileRoute("/_app/team")({
  head: () => ({ meta: [{ title: "Team — Thenam ERP" }] }),
  component: TeamPage,
});

function TeamPage() {
  const { data: employees, isLoading } = useEmployees();

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

      <SectionCard title="Employees" description={`${employees?.length || 0} employees found`}>
        {isLoading ? (
            <div className="py-20 text-center text-muted-foreground">Loading team data...</div>
        ) : !employees || employees.length === 0 ? (
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
        ) : (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {employees.map((emp: any) => (
                    <div key={emp._id} className="p-4 rounded-xl bg-slate-900 border border-border flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                             {emp.avatar ? <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover"/> : <Users className="h-6 w-6 text-slate-400" />}
                        </div>
                        <div>
                            <h4 className="font-medium text-foreground">{emp.name}</h4>
                            <p className="text-sm text-muted-foreground">{emp.role} • {emp.department}</p>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </SectionCard>
    </PageContainer>
  );
}
