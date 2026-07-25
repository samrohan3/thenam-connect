import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Building2,
  Users2,
  FolderKanban,
  CheckSquare,
  CalendarCheck,
  FileText,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Shield,
  Upload,
  Clock
} from "lucide-react";
import { useTasks, useProjects } from "@/lib/api-hooks";

interface EmployeeProfileModalProps {
  employee: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EmployeeProfileModal({
  employee,
  open,
  onOpenChange,
}: EmployeeProfileModalProps) {
  if (!employee) return null;

  const { data: allProjects } = useProjects();
  const { data: allTasks } = useTasks();

  const assignedProjects = allProjects?.filter(
    (p: any) => p.manager?._id === employee._id || p.manager === employee._id
  ) || [];

  const assignedTasks = allTasks?.filter(
    (t: any) => t.assignedTo?._id === employee._id || t.assignedTo === employee._id
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background text-foreground border-border rounded-2xl p-6">
        <DialogHeader className="pb-4 border-b border-border">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20 ring-4 ring-primary/20">
              <AvatarImage src={employee.avatar || employee.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${employee.name}`} />
              <AvatarFallback className="text-xl font-bold">{employee.name?.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <DialogTitle className="text-2xl font-bold">{employee.name}</DialogTitle>
                <Badge variant="outline" className="font-mono text-xs text-primary border-primary/30">
                  {employee.employeeId || "EMP-1001"}
                </Badge>
                <Badge
                  className={`text-xs capitalize ${
                    employee.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                  }`}
                >
                  {employee.status || "Active"}
                </Badge>
              </div>

              <p className="text-sm font-medium text-muted-foreground mt-1">
                {employee.designation || employee.role} • {employee.department}
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground flex-wrap">
                <div className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-primary" /> {employee.email}
                </div>
                {employee.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-primary" /> {employee.phone}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Shield className="h-3.5 w-3.5 text-emerald-400" /> Role: {employee.role}
                </div>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="mt-4">
          <TabsList className="rounded-xl mb-4 flex-wrap h-auto">
            <TabsTrigger value="info" className="gap-1.5"><User className="h-3.5 w-3.5" /> Overview</TabsTrigger>
            <TabsTrigger value="venture-team" className="gap-1.5"><Building2 className="h-3.5 w-3.5" /> Venture & Team</TabsTrigger>
            <TabsTrigger value="projects" className="gap-1.5"><FolderKanban className="h-3.5 w-3.5" /> Projects ({assignedProjects.length})</TabsTrigger>
            <TabsTrigger value="tasks" className="gap-1.5"><CheckSquare className="h-3.5 w-3.5" /> Tasks ({assignedTasks.length})</TabsTrigger>
            <TabsTrigger value="attendance" className="gap-1.5"><CalendarCheck className="h-3.5 w-3.5" /> Attendance</TabsTrigger>
            <TabsTrigger value="documents" className="gap-1.5"><FileText className="h-3.5 w-3.5" /> Documents</TabsTrigger>
          </TabsList>

          {/* TAB 1: Personal Overview */}
          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Employment Info</h4>
                <div className="text-xs space-y-1.5">
                  <p><strong className="text-foreground">Designation:</strong> {employee.designation || "Not specified"}</p>
                  <p><strong className="text-foreground">Department:</strong> {employee.department}</p>
                  <p><strong className="text-foreground">System Role:</strong> {employee.role}</p>
                  <p><strong className="text-foreground">Joining Date:</strong> {new Date(employee.joiningDate || employee.createdAt || Date.now()).toLocaleDateString()}</p>
                  {employee.salary ? <p><strong className="text-foreground">Salary:</strong> ₹{employee.salary.toLocaleString()} / year</p> : null}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-card border border-border space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Reporting & Structure</h4>
                <div className="text-xs space-y-1.5">
                  <p><strong className="text-foreground">Assigned Venture:</strong> {employee.venture?.name || "Unassigned"}</p>
                  <p><strong className="text-foreground">Assigned Team:</strong> {employee.team?.teamName || "Unassigned"}</p>
                  <p><strong className="text-foreground">Reporting Manager:</strong> {employee.reportingManager?.name || "None"}</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Venture & Team Details */}
          <TabsContent value="venture-team" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{employee.venture?.name || "No Venture Assigned"}</h4>
                    <p className="text-xs text-muted-foreground">{employee.venture?.category || "Business Unit"}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Primary corporate venture for project allocations and resource management.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Users2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{employee.team?.teamName || "Unassigned Team"}</h4>
                    <p className="text-xs text-muted-foreground">{employee.team?.description || "Functional Unit"}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Team collaboration unit reporting to designated team lead.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: Projects */}
          <TabsContent value="projects" className="space-y-3">
            {assignedProjects.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground border border-border rounded-xl">
                No active projects assigned to this employee.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {assignedProjects.map((p: any) => (
                  <div key={p._id} className="p-3.5 rounded-xl bg-card border border-border flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-sm">{p.name}</h4>
                      <p className="text-xs text-muted-foreground">Priority: {p.priority}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">{p.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 4: Tasks */}
          <TabsContent value="tasks" className="space-y-3">
            {assignedTasks.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground border border-border rounded-xl">
                No pending tasks assigned to this employee.
              </div>
            ) : (
              <div className="space-y-2">
                {assignedTasks.map((t: any) => (
                  <div key={t._id} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-sm">{t.title}</h4>
                      <p className="text-xs text-muted-foreground">Priority: {t.priority}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">{t.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* TAB 5: Attendance Placeholder */}
          <TabsContent value="attendance" className="space-y-4">
            <div className="p-5 rounded-2xl bg-card border border-border flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-foreground">Attendance Summary</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Calculated over past 30 working days</p>
              </div>
              <div className="text-2xl font-extrabold text-emerald-400">98.5%</div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-card border border-border">
                <p className="text-xs text-muted-foreground">Present Days</p>
                <p className="text-lg font-bold text-foreground">22 / 22</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <p className="text-xs text-muted-foreground">On Leave</p>
                <p className="text-lg font-bold text-amber-400">1 Day</p>
              </div>
              <div className="p-3 rounded-xl bg-card border border-border">
                <p className="text-xs text-muted-foreground">Late Arrivals</p>
                <p className="text-lg font-bold text-indigo-400">0</p>
              </div>
            </div>
          </TabsContent>

          {/* TAB 6: Documents Placeholder */}
          <TabsContent value="documents" className="space-y-3">
            <div className="p-4 rounded-xl border border-dashed border-border text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2 opacity-50" />
              <p className="text-xs font-semibold text-foreground">Employee Document Repository</p>
              <p className="text-[11px] text-muted-foreground">Identity proof, contract agreement, NDA</p>
            </div>

            <div className="space-y-2">
              {[
                { name: "Employment_Offer_Letter.pdf", date: "Jan 15, 2026", size: "1.2 MB" },
                { name: "Non_Disclosure_Agreement.pdf", date: "Jan 15, 2026", size: "840 KB" },
                { name: "Government_ID_Verification.pdf", date: "Jan 16, 2026", size: "2.1 MB" },
              ].map((doc, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-card border border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-xs font-semibold">{doc.name}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.date} • {doc.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs">View</Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
