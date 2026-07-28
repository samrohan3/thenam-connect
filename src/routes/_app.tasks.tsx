import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { SectionCard } from "@/components/ui-ext/section-card";
import { ClipboardList, Plus, Clock, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useTasks, useCreateTask, useUpdateTaskStatus, useProjects, useEmployees, useVentures, useDeleteTask, useUpdateTask } from "@/lib/api-hooks";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/badge";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
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
import { canAccessRoute, hasPermission } from "@/lib/permissions";
import { AccessDenied } from "@/components/rbac/AccessDenied";
import { RoleGuard } from "@/components/rbac/RoleGuard";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Tasks — Thenam ERP" }] }),
  component: TasksPage,
});

const taskStatuses = ["Pending", "In Progress", "Review", "Completed"];

export function TasksPage() {
  const { user } = useAuthStore();

  // Route Protection Check
  if (!canAccessRoute(user?.role, "/tasks")) {
    return <AccessDenied resource="Tasks" />;
  }

  const { data: tasks, isLoading } = useTasks();
  const { data: projects } = useProjects();
  const { data: employees } = useEmployees();
  const { data: ventures } = useVentures();

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const updateTaskStatus = useUpdateTaskStatus();
  const deleteTask = useDeleteTask();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");
  const [ventureId, setVentureId] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("Pending");
  const [deadline, setDeadline] = useState("");

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const newStatus = destination.droppableId;
    updateTaskStatus.mutate(
      { id: draggableId, status: newStatus },
      {
        onSuccess: () => toast.success(`Task moved to ${newStatus}`),
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update status"),
      }
    );
  };

  const openNew = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setProjectId("");
    setVentureId(ventures && ventures.length > 0 ? ventures[0]._id : "");
    setAssigneeId("");
    setPriority("Medium");
    setStatus("Pending");
    setDeadline("");
    setOpen(true);
  };

  const openEdit = (t: any) => {
    setEditingId(t._id || t.id);
    setTitle(t.title || "");
    setDescription(t.description || "");
    setProjectId(t.project?._id || t.project || "");
    setVentureId(t.venture?._id || t.venture || "");
    setAssigneeId(t.assignedTo?._id || t.assignedTo || "");
    setPriority(t.priority || "Medium");
    setStatus(t.status || "Pending");
    setDeadline(t.deadline ? new Date(t.deadline).toISOString().split("T")[0] : "");
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !ventureId) {
      toast.error("Venture and Task Title are required.");
      return;
    }

    const payload = {
      title,
      description,
      project: projectId || null,
      venture: ventureId,
      assignedTo: assigneeId || null,
      priority,
      status,
      deadline: deadline ? new Date(deadline).toISOString() : undefined,
    };

    if (editingId) {
      updateTask.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast.success("Task updated successfully");
            setOpen(false);
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update task");
          },
        }
      );
    } else {
      createTask.mutate(payload, {
        onSuccess: () => {
          toast.success("Task created successfully");
          setOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to create task");
        },
      });
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    updateTaskStatus.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => toast.success(`Task moved to ${newStatus}`),
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update status"),
      }
    );
  };

  const handleDelete = (id: string, taskTitle: string) => {
    if (confirm(`Are you sure you want to delete task "${taskTitle}"?`)) {
      deleteTask.mutate(id, {
        onSuccess: () => toast.success("Task deleted successfully"),
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete task"),
      });
    }
  };

  const canCreate = hasPermission(user?.role, "tasks", "create");
  const canEdit = hasPermission(user?.role, "tasks", "update");
  const canDelete = hasPermission(user?.role, "tasks", "delete");

  return (
    <PageContainer>
      <PageHeader
        title="Tasks"
        subtitle="Everything on your plate — timelines, priorities, progress."
        actions={
          <RoleGuard resource="tasks" action="create">
            <Button className="rounded-xl gradient-royal text-white gap-1.5 cursor-pointer" onClick={openNew}>
              <Plus className="h-4 w-4" /> New task
            </Button>
          </RoleGuard>
        }
      />

      <SectionCard title="Task Board">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading tasks...</div>
        ) : !tasks || tasks.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <ClipboardList className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-base">No tasks found</h3>
              <p className="text-sm text-muted-foreground">Create a new task to organize your workflow.</p>
            </div>
            {canCreate && (
              <Button className="rounded-xl gradient-royal text-white gap-1.5 mt-2 cursor-pointer" onClick={openNew}>
                <Plus className="h-4 w-4" /> New task
              </Button>
            )}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {taskStatuses.map((st) => {
                const statusTasks = tasks.filter((t: any) => t.status === st);
                return (
                  <Droppable key={st} droppableId={st}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="rounded-2xl border border-border bg-card/60 p-4 flex flex-col min-h-[340px]"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-semibold">{st}</h3>
                          <Badge variant="secondary" className="rounded-full">
                            {statusTasks.length}
                          </Badge>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto min-h-[200px]">
                          {statusTasks.length === 0 ? (
                            <p className="text-xs text-muted-foreground text-center py-6">No tasks in {st}</p>
                          ) : (
                            statusTasks.map((t: any, index: number) => {
                              const taskId = t._id || t.id;
                              return (
                                <Draggable key={taskId} draggableId={taskId} index={index}>
                                  {(draggableProvided, snapshot) => (
                                    <div
                                      ref={draggableProvided.innerRef}
                                      {...draggableProvided.draggableProps}
                                      {...draggableProvided.dragHandleProps}
                                      className={`p-3 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between cursor-grab active:cursor-grabbing ${
                                        snapshot.isDragging ? "ring-2 ring-primary shadow-lg" : ""
                                      }`}
                                    >
                                      <div>
                                        <div className="flex items-start justify-between gap-1">
                                          <h4 className="font-medium text-sm text-foreground">{t.title}</h4>
                                          {(canEdit || canDelete) && (
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                              {canEdit && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEdit(t);
                                                  }}
                                                  className="p-1 text-muted-foreground hover:text-foreground rounded"
                                                >
                                                  <Edit2 className="w-3.5 h-3.5" />
                                                </button>
                                              )}
                                              {canDelete && (
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(taskId, t.title);
                                                  }}
                                                  className="p-1 text-muted-foreground hover:text-rose-500 rounded"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                              )}
                                            </div>
                                          )}
                                        </div>

                                        {t.description && (
                                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.description}</p>
                                        )}
                                      </div>

                                      <div className="mt-3 pt-2 border-t border-border/50 flex items-center justify-between text-xs">
                                        <select
                                          value={t.status}
                                          onChange={(e) => handleStatusChange(taskId, e.target.value)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="text-[11px] bg-muted/60 border border-border rounded-md px-1.5 py-0.5 text-foreground focus:outline-none"
                                        >
                                          {taskStatuses.map((s) => (
                                            <option key={s} value={s}>
                                              {s}
                                            </option>
                                          ))}
                                        </select>

                                        <Badge
                                          variant="outline"
                                          className={`text-[10px] rounded-md ${
                                            t.priority === "Critical"
                                              ? "text-rose-500 border-rose-500/30"
                                              : t.priority === "High"
                                              ? "text-amber-500 border-amber-500/30"
                                              : "text-muted-foreground"
                                          }`}
                                        >
                                          {t.priority || "Medium"}
                                        </Badge>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              );
                            })
                          )}
                          {provided.placeholder}
                        </div>
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-background text-foreground border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Task" : "Create New Task"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {editingId ? "Update task information and assignments." : "Add a new task to your team workflow."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <Label htmlFor="taskTitle">Task Title *</Label>
              <Input
                id="taskTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design Landing Page"
                className="mt-1.5 rounded-xl border-border"
                required
              />
            </div>

            <div>
              <Label htmlFor="taskDesc">Description</Label>
              <Textarea
                id="taskDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed instructions or acceptance criteria..."
                className="mt-1.5 rounded-xl border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="taskVenture">Venture *</Label>
                <select
                  id="taskVenture"
                  value={ventureId}
                  onChange={(e) => setVentureId(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                  required
                >
                  <option value="">Select Venture</option>
                  {ventures?.map((v: any) => (
                    <option key={v._id || v.id} value={v._id || v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="taskProject">Project</Label>
                <select
                  id="taskProject"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="">No Project</option>
                  {projects
                    ?.filter((p: any) => !ventureId || p.venture?._id === ventureId || p.venture === ventureId)
                    .map((p: any) => (
                      <option key={p._id || p.id} value={p._id || p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="taskAssignee">Assignee</Label>
                <select
                  id="taskAssignee"
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {employees?.map((emp: any) => (
                    <option key={emp._id || emp.id} value={emp._id || emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="taskPriority">Priority</Label>
                <select
                  id="taskPriority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              <div>
                <Label htmlFor="taskStatus">Status</Label>
                <select
                  id="taskStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="taskDeadline">Deadline</Label>
              <Input
                id="taskDeadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="mt-1.5 rounded-xl border-border"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={editingId ? updateTask.isPending : createTask.isPending}
                className="rounded-xl gradient-royal text-white hover:opacity-90"
              >
                {editingId
                  ? updateTask.isPending
                    ? "Updating..."
                    : "Update Task"
                  : createTask.isPending
                  ? "Creating..."
                  : "Create Task"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </PageContainer>
  );
}
