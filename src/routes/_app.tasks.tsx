import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui-ext/section-card";
import { ClipboardList, Plus, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { useTasks } from "@/lib/api-hooks";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Thenam ERP" }] }),
  component: TasksPage,
});

function TasksPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { data: tasks, isLoading } = useTasks();

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
          <TabsTrigger value="calendar" className="gap-1.5">
            <CalendarDays className="h-4 w-4" /> Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <SectionCard title="All tasks" description={`${tasks?.length || 0} tasks found`}>
            {isLoading ? (
                <div className="py-20 text-center text-muted-foreground">Loading tasks...</div>
            ) : !tasks || tasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-20 text-center gap-4"
                >
                  <div className="grid h-20 w-20 place-items-center rounded-3xl gradient-royal text-white shadow-elevated">
                    <ClipboardList className="h-9 w-9" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold">No tasks yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Create tasks and assign them to team members to track progress.
                    </p>
                  </div>
                  <Button className="rounded-xl gradient-royal text-white gap-1.5 mt-2">
                    <Plus className="h-4 w-4" /> New task
                  </Button>
                </motion.div>
            ) : (
                <div className="mt-4 space-y-3">
                    {tasks.map((task: any) => (
                        <div key={task._id} className="p-4 rounded-xl bg-slate-900 border border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${task.status === 'Completed' ? 'bg-emerald-500' : task.status === 'In Progress' ? 'bg-gold-500' : 'bg-royal-500'}`} />
                                <div>
                                    <h4 className="font-medium text-foreground">{task.title}</h4>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] uppercase font-semibold tracking-wider">
                                            {task.priority}
                                        </Badge>
                                        <span>•</span>
                                        <span>Project: {task.project?.name || 'None'}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-medium text-foreground">{task.assignee?.name || 'Unassigned'}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                                        <Clock className="w-3 h-3" />
                                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" className="rounded-lg">View</Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
            <SectionCard title="Calendar">
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-xl" />
            </SectionCard>
            <SectionCard title="Deadlines this week">
              <p className="text-sm text-muted-foreground py-8 text-center">Calendar view coming soon</p>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
