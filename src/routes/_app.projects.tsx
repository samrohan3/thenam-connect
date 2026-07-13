import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Plus, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjects } from "@/lib/api-hooks";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({ meta: [{ title: "Projects — Thenam ERP" }] }),
  component: ProjectsPage,
});

const projectStatuses = [
  { key: "Planning", title: "Planning", tint: "royal" },
  { key: "In Progress", title: "In Progress", tint: "gold" },
  { key: "Testing", title: "Testing", tint: "royal" },
  { key: "Completed", title: "Completed", tint: "emerald" },
  { key: "On Hold", title: "On Hold", tint: "royal" },
];

const columnAccent: Record<string, string> = {
  royal: "bg-royal",
  emerald: "bg-emerald",
  gold: "bg-gold",
};

function ProjectsPage() {
  const { data: projects, isLoading } = useProjects();

  return (
    <PageContainer>
      <PageHeader
        title="Projects"
        subtitle="Track work across every stage of delivery."
        actions={
          <Button className="rounded-xl gradient-royal text-white gap-1.5">
            <Plus className="h-4 w-4" /> New project
          </Button>
        }
      />

      <div className="grid grid-flow-col auto-cols-[minmax(280px,1fr)] gap-4 overflow-x-auto pb-4 h-[calc(100vh-140px)]">
        {projectStatuses.map((col, ci) => {
          const colProjects = projects?.filter((p: any) => p.status === col.key) || [];
          return (
            <motion.div
              key={col.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: ci * 0.05 }}
              className="rounded-2xl border border-border bg-card/60 p-4 flex flex-col"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full", columnAccent[col.tint])} />
                <h3 className="text-sm font-semibold">{col.title}</h3>
                <Badge variant="secondary" className="ml-auto rounded-full">{isLoading ? '...' : colProjects.length}</Badge>
              </div>
              
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                  {isLoading ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                          <p className="text-xs text-muted-foreground">Loading...</p>
                      </div>
                  ) : colProjects.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                        <FolderKanban className="h-8 w-8 text-muted-foreground opacity-30" />
                        <p className="text-xs text-muted-foreground">No projects yet</p>
                      </div>
                  ) : (
                      colProjects.map((p: any) => (
                          <div key={p._id} className="bg-slate-900 border border-border rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                              <h4 className="font-medium text-sm text-foreground mb-1">{p.name}</h4>
                              {p.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{p.description}</p>}
                              
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <Clock className="w-3.5 h-3.5" />
                                      <span>{new Date(p.deadline || p.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <div className="w-6 h-6 rounded-full bg-slate-800 border border-border flex items-center justify-center text-[10px] font-medium text-slate-400">
                                      {/* Project Manager Initials */}
                                      {p.projectManager?.name?.charAt(0) || '?'}
                                  </div>
                              </div>
                          </div>
                      ))
                  )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </PageContainer>
  );
}
