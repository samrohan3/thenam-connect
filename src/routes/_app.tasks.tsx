import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui-ext/section-card";
import { ClipboardList, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Thenam ERP" }] }),
  component: TasksPage,
});

function TasksPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

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
          <SectionCard title="All tasks" description="No tasks yet">
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
          </SectionCard>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-4">
            <SectionCard title="Calendar">
              <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-xl" />
            </SectionCard>
            <SectionCard title="Deadlines this week">
              <p className="text-sm text-muted-foreground py-8 text-center">No upcoming deadlines</p>
            </SectionCard>
          </div>
        </TabsContent>
      </Tabs>
    </PageContainer>
  );
}
