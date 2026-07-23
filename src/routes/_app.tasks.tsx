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
import { useTasks, useCreateTask, useUpdateTaskStatus, useProjects, useEmployees, useVentures } from "@/lib/api-hooks";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Thenam ERP" }] }),
  component: TasksPage,
});

function TasksPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  const { data: tasks, isLoading } = useTasks();
  const { data: projects } = useProjects();
  const { data: employees } = useEmployees();
  const { data: ventures } = useVentures();
  
  const createTask = useCreateTask();
  const updateTaskStatus = useUpdateTaskStatus();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [ventureId, setVentureId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !ventureId) {
      toast.error("Venture and Task Title are required.");
      return;
    }

    createTask.mutate({
      title,
      description,
      project: projectId || null,
      venture: ventureId,
      assignedTo: assigneeId || null,
      priority,
      status,
      deadline: deadline ? new Date(deadline).toISOString() : undefined
    }, {
      onSuccess: () => {
        toast.success("Task created successfully");
        setOpen(false);
        setTitle("");
        setDescription("");
        setProjectId("");
        setVentureId("");
        setAssigneeId("");
        setPriority("Medium");
        setStatus("Pending");
        setDeadline("");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to create task");
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Tasks"
        subtitle="Everything on your plate — timelines, priorities, progress."
        actions={
          <Button className="rounded-xl gradient-royal text-white gap-1.5 cursor-pointer" onClick={() => setOpen(true)}>
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
                  <Button className="rounded-xl gradient-royal text-white gap-1.5 mt-2 cursor-pointer" onClick={() => setOpen(true)}>
                    <Plus className="h-4 w-4" /> New task
                  </Button>
                </motion.div>
            ) : (
                <div className="mt-4 space-y-3">
                    {tasks.map((task: any) => (
                        <div key={task._id} className="p-4 rounded-xl bg-slate-900 border border-border flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full ${task.status === 'Completed' ? 'bg-emerald' : task.status === 'In Progress' ? 'bg-gold' : 'bg-royal'}`} />
                                <div>
                                    <h4 className="font-medium text-foreground">{task.title}</h4>
                                    <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                                        <Badge variant="outline" className="text-[10px] uppercase font-semibold tracking-wider">
                                            {task.priority}
                                        </Badge>
                                        <span>•</span>
                                        <span className="text-primary font-medium text-xs">{task.venture?.name || 'No Venture'}</span>
                                        <span>•</span>
                                        <span>Project: {task.project?.name || 'None'}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-medium text-foreground">{task.assignedTo?.name || 'Unassigned'}</p>
                                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                                    </p>
                                </div>
                                {task.status !== 'Completed' && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="rounded-lg border-emerald/30 text-emerald hover:bg-emerald/10 cursor-pointer"
                                      onClick={() => {
                                        updateTaskStatus.mutate({ id: task._id, status: 'Completed' }, {
                                          onSuccess: () => toast.success("Task marked as completed!")
                                        });
                                      }}
                                    >
                                      Complete
                                    </Button>
                                )}
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-slate-950 text-foreground border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Define a task and assign it to employees.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <Label htmlFor="tTitle">Task Title</Label>
              <Input id="tTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Design Dashboard UI" className="mt-1.5 rounded-xl border-border" required />
            </div>
            <div>
              <Label htmlFor="tDesc">Description</Label>
              <Textarea id="tDesc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed requirements..." className="mt-1.5 rounded-xl border-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tVenture">Venture</Label>
                <select
                  id="tVenture"
                  value={ventureId}
                  onChange={(e) => setVentureId(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-slate-900 text-sm text-foreground focus:outline-none"
                  required
                >
                  <option value="">Select Venture</option>
                  {ventures?.map((v: any) => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="tProject">Project</Label>
                <select
                  id="tProject"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-slate-900 text-sm text-foreground focus:outline-none"
                >
                  <option value="">No Project</option>
                  {projects?.filter((p: any) => !ventureId || p.venture?._id === ventureId || p.venture === ventureId).map((proj: any) => (
                    <option key={proj._id} value={proj._id}>{proj.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tAssignee">Assignee</Label>
                <select
                  id="tAssignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-slate-900 text-sm text-foreground focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {employees?.filter((emp: any) => !ventureId || emp.venture?._id === ventureId || emp.venture === ventureId).map((emp: any) => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="tDeadline">Deadline</Label>
                <Input id="tDeadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="mt-1.5 rounded-xl border-border" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tPriority">Priority</Label>
                <select
                  id="tPriority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-slate-900 text-sm text-foreground focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              <div>
                <Label htmlFor="tStatus">Status</Label>
                <select
                  id="tStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-slate-900 text-sm text-foreground focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createTask.isPending} className="rounded-xl gradient-royal text-white hover:opacity-90">
                {createTask.isPending ? "Creating..." : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </PageContainer>
  );
}
