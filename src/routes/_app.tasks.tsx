import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { kanbanColumns } from "@/lib/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Thenam ERP" }] }),
  component: TasksPage,
});

const priorityTone: Record<string, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-gold/15 text-[color:var(--gold-foreground)]",
  Low: "bg-emerald/10 text-emerald",
};

function TasksPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const allTasks = kanbanColumns.flatMap((c) => c.tasks.map((t) => ({ ...t, stage: c.title })));

  return (
    <PageContainer>
      <PageHeader
        title="Tasks"
        subtitle="Everything on your plate — timelines, priorities, progress."
        actions={
          <Button className="rounded-xl gradient-royal text-white gap-1.5">
            <Plus className="h-4 w-4" /> New task
          </Button>
        }
      />

      <Tabs defaultValue="list">
        <TabsList className="mb-4 rounded-xl">
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5"><CalendarDays className="h-4 w-4" /> Calendar</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <SectionCard title="All tasks" description={`${allTasks.length} tasks tracked`}>
            <ul className="divide-y divide-border">
              {allTasks.map((t) => (
                <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 py-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold">{t.title}</p>
                      <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium", priorityTone[t.priority])}>
                        {t.priority}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{t.assignee}</span>
                      <span>·</span>
                      <Badge variant="secondary" className="rounded-full">{t.stage}</Badge>
                      <span>Due {t.due}</span>
                    </div>
                    <div className="mt-2 h-1.5 max-w-md rounded-full bg-muted overflow-hidden">
                      <div className="h-full gradient-royal" style={{ width: `${t.progress}%` }} />
                    </div>
                  </div>
                  <div className="text-sm font-semibold tabular-nums">{t.progress}%</div>
                </li>
              ))}
            </ul>
          </SectionCard>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
            <SectionCard title="Calendar">
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-xl" />
            </SectionCard>
            <SectionCard title="Deadlines this week">
              <ul className="space-y-3">
                {allTasks.slice(0, 6).map((t) => (
                  <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{t.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{t.assignee} · Due {t.due}</p>
                    </div>
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", priorityTone[t.priority])}>
                      {t.priority}
                    </span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
