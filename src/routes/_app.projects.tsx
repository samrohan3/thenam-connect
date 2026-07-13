import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({ meta: [{ title: "Projects — Thenam ERP" }] }),
  component: ProjectsPage,
});

const emptyColumns = [
  { key: "planning", title: "Planning", tint: "royal" },
  { key: "uiux", title: "UI/UX", tint: "gold" },
  { key: "dev", title: "Development", tint: "royal" },
  { key: "testing", title: "Testing", tint: "gold" },
  { key: "done", title: "Completed", tint: "emerald" },
];

const columnAccent: Record<string, string> = {
  royal: "bg-royal",
  emerald: "bg-emerald",
  gold: "bg-gold",
};

function ProjectsPage() {
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

      <div className="grid grid-flow-col auto-cols-[minmax(280px,1fr)] gap-4 overflow-x-auto pb-4">
        {emptyColumns.map((col, ci) => (
          <motion.div
            key={col.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: ci * 0.05 }}
            className="rounded-2xl border border-border bg-card/60 p-4"
          >
            <div className="mb-3 flex items-center gap-2">
              <span className={cn("h-2 w-2 rounded-full", columnAccent[col.tint])} />
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <Badge variant="secondary" className="ml-auto rounded-full">0</Badge>
            </div>
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <FolderKanban className="h-8 w-8 text-muted-foreground opacity-30" />
              <p className="text-xs text-muted-foreground">No projects yet</p>
            </div>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
}
