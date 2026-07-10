import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { kanbanColumns } from "@/lib/mock-data";
import { Calendar, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/projects")({
  head: () => ({ meta: [{ title: "Projects — Thenam ERP" }] }),
  component: ProjectsPage,
});

const priorityTone: Record<string, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-gold/15 text-[color:var(--gold-foreground)]",
  Low: "bg-emerald/10 text-emerald",
};

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
        {kanbanColumns.map((col, ci) => (
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
              <Badge variant="secondary" className="ml-auto rounded-full">{col.tasks.length}</Badge>
            </div>
            <div className="space-y-3">
              {col.tasks.map((t) => (
                <motion.article
                  key={t.id}
                  whileHover={{ y: -3 }}
                  className="rounded-xl border border-border bg-card p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-tight">{t.title}</p>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", priorityTone[t.priority])}>
                      {t.priority}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.tags.map((tg) => (
                      <span key={tg} className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">#{tg}</span>
                    ))}
                  </div>
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full gradient-royal" style={{ width: `${t.progress}%` }} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate">{t.assignee}</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Calendar className="h-3 w-3" /> {t.due}
                    </span>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </PageContainer>
  );
}
