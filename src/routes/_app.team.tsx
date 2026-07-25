import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui-ext/section-card";
import {
  Users,
  UserPlus,
  Search,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  Building2,
  Users2,
  Mail,
  Phone,
  Eye,
  Shield,
  Briefcase
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/authStore";
import { canAccessRoute, hasPermission, normalizeRole } from "@/lib/permissions";
import { AccessDenied } from "@/components/rbac/AccessDenied";
import { RoleGuard } from "@/components/rbac/RoleGuard";
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useVentures,
  useTeams,
  useVentureTeams
} from "@/lib/api-hooks";
import { EmployeeProfileModal } from "@/components/employees/EmployeeProfileModal";

export const Route = createFileRoute("/_app/team")({
  head: () => ({ meta: [{ title: "Employees — Thenam ERP" }] }),
  component: EmployeesPage,
});

function EmployeesPage() {
  const { user } = useAuthStore();

  // Route protection
  if (!canAccessRoute(user?.role, "/team")) {
    return <AccessDenied resource="Employees" />;
  }

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterVenture, setFilterVenture] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const { data: employees, isLoading: isEmployeesLoading } = useEmployees();
  const { data: ventures } = useVentures();
  const { data: teams } = useTeams();

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  // Modal & Profile Drawer States
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [profileEmployee, setProfileEmployee] = useState<any | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("Employee");
  const [designation, setDesignation] = useState("Software Engineer");
  const [department, setDepartment] = useState("Engineering");
  const [formVentureId, setFormVentureId] = useState("");
  const [formTeamId, setFormTeamId] = useState("");
  const [reportingManagerId, setReportingManagerId] = useState("");
  const [salary, setSalary] = useState("60000");
  const [status, setStatus] = useState("Active");
  const [photoUrl, setPhotoUrl] = useState("");

  // Cascading Teams based on selected Venture in form
  const { data: ventureTeams } = useVentureTeams(formVentureId);

  const filteredEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.filter((emp: any) => {
      const matchesSearch =
        !searchQuery.trim() ||
        emp.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.designation?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = filterRole === "all" || normalizeRole(emp.role) === normalizeRole(filterRole);
      const matchesDept = filterDepartment === "all" || emp.department === filterDepartment;
      const matchesVenture = filterVenture === "all" || emp.venture?._id === filterVenture || emp.venture === filterVenture;
      const matchesTeam = filterTeam === "all" || emp.team?._id === filterTeam || emp.team === filterTeam;
      const matchesStatus = filterStatus === "all" || emp.status === filterStatus;

      return matchesSearch && matchesRole && matchesDept && matchesVenture && matchesTeam && matchesStatus;
    });
  }, [employees, searchQuery, filterRole, filterDepartment, filterVenture, filterTeam, filterStatus]);

  const openNew = () => {
    setEditingId(null);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setRole("Employee");
    setDesignation("Software Engineer");
    setDepartment("Engineering");
    setFormVentureId(ventures && ventures.length > 0 ? ventures[0]._id : "");
    setFormTeamId("");
    setReportingManagerId("");
    setSalary("60000");
    setStatus("Active");
    setPhotoUrl("");
    setOpen(true);
  };

  const openEdit = (emp: any) => {
    setEditingId(emp._id || emp.id);
    const parts = (emp.name || "").split(" ");
    setFirstName(parts[0] || "");
    setLastName(parts.slice(1).join(" ") || "");
    setEmail(emp.email || "");
    setPhone(emp.phone || "");
    setRole(emp.role || "Employee");
    setDesignation(emp.designation || "");
    setDepartment(emp.department || "Engineering");
    setFormVentureId(emp.venture?._id || emp.venture || "");
    setFormTeamId(emp.team?._id || emp.team || "");
    setReportingManagerId(emp.reportingManager?._id || emp.reportingManager || "");
    setSalary(String(emp.salary || 60000));
    setStatus(emp.status || "Active");
    setPhotoUrl(emp.avatar || emp.photo || "");
    setOpen(true);
  };

  const openProfile = (emp: any) => {
    setProfileEmployee(emp);
    setProfileOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email || !formVentureId) {
      toast.error("First Name, Email, and Venture assignment are required.");
      return;
    }

    const payload = {
      name: `${firstName} ${lastName}`.trim(),
      firstName,
      lastName,
      email,
      phone,
      role,
      designation,
      department,
      venture: formVentureId,
      ventureId: formVentureId,
      team: formTeamId || null,
      teamId: formTeamId || null,
      reportingManager: reportingManagerId || null,
      salary: Number(salary),
      status,
      avatar: photoUrl || null,
      photo: photoUrl || null
    };

    if (editingId) {
      updateEmployee.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast.success("Employee Updated successfully");
            setOpen(false);
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update employee");
          }
        }
      );
    } else {
      createEmployee.mutate(payload, {
        onSuccess: () => {
          toast.success("Employee Added successfully");
          setOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to add employee");
        }
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete employee "${name}"?`)) {
      deleteEmployee.mutate(id, {
        onSuccess: () => toast.success("Employee Deleted successfully"),
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete employee")
      });
    }
  };

  const canCreate = hasPermission(user?.role, "team", "create");
  const canEdit = hasPermission(user?.role, "team", "update");
  const canDelete = hasPermission(user?.role, "team", "delete");

  return (
    <PageContainer>
      <PageHeader
        title="Employees & Team Members"
        subtitle="Manage employees, assignments, designations, and organizational structure."
        actions={
          <RoleGuard resource="team" action="create">
            <Button className="rounded-xl gradient-royal text-white gap-1.5 cursor-pointer" onClick={openNew}>
              <UserPlus className="h-4 w-4" /> Add Employee
            </Button>
          </RoleGuard>
        }
      />

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, ID..."
              className="pl-9 h-10 rounded-xl bg-card border-border text-xs"
            />
          </div>

          <select
            value={filterVenture}
            onChange={(e) => setFilterVenture(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none"
          >
            <option value="all">All Ventures</option>
            {ventures?.map((v: any) => (
              <option key={v._id} value={v._id}>{v.name}</option>
            ))}
          </select>

          <select
            value={filterTeam}
            onChange={(e) => setFilterTeam(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none"
          >
            <option value="all">All Teams</option>
            {teams?.map((t: any) => (
              <option key={t._id} value={t._id}>{t.teamName}</option>
            ))}
          </select>

          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="Founder">Founder</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Finance">Finance</option>
            <option value="Employee">Employee</option>
            <option value="Customer">Customer</option>
          </select>

          <select
            value={filterDepartment}
            onChange={(e) => setFilterDepartment(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none"
          >
            <option value="all">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Sales">Sales</option>
            <option value="Marketing">Marketing</option>
            <option value="HR">HR</option>
            <option value="Finance">Finance</option>
            <option value="Operations">Operations</option>
            <option value="Design">Design</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="On leave">On Leave</option>
            <option value="Terminated">Terminated</option>
          </select>
        </div>

        <div className="flex items-center gap-1 border border-border rounded-xl p-1 bg-card self-end md:self-auto">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="h-8 px-2.5 rounded-lg"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
            className="h-8 px-2.5 rounded-lg"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <SectionCard title="Employee Directory" description={`${filteredEmployees.length} employees found`}>
        {isEmployeesLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading employee directory...</div>
        ) : filteredEmployees.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-base">No employees found</h3>
              <p className="text-sm text-muted-foreground">Adjust filters or add a new team member.</p>
            </div>
            {canCreate && (
              <Button className="rounded-xl gradient-royal text-white gap-1.5 mt-2 cursor-pointer" onClick={openNew}>
                <UserPlus className="h-4 w-4" /> Add Employee
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((emp: any) => (
              <div
                key={emp._id}
                className="p-5 border border-border rounded-2xl bg-card hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                        <AvatarImage src={emp.avatar || emp.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${emp.name}`} />
                        <AvatarFallback>{emp.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-base text-foreground">{emp.name}</h4>
                        <p className="text-xs text-muted-foreground">{emp.designation || emp.role}</p>
                      </div>
                    </div>

                    <Badge
                      className={`text-[10px] capitalize ${
                        emp.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}
                    >
                      {emp.status}
                    </Badge>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="font-medium">ID:</span>
                      <Badge variant="outline" className="font-mono text-[10px] text-primary">{emp.employeeId || "EMP-1001"}</Badge>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium"><Building2 className="w-3.5 h-3.5 text-primary" /> Venture:</span>
                      <span className="font-semibold text-foreground">{emp.venture?.name || "Unassigned"}</span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium"><Users2 className="w-3.5 h-3.5 text-indigo-400" /> Team:</span>
                      <span className="font-semibold text-foreground">{emp.team?.teamName || "Unassigned"}</span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium"><Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> Manager:</span>
                      <span>{emp.reportingManager?.name || "None"}</span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium"><Mail className="w-3.5 h-3.5 text-muted-foreground" /> Email:</span>
                      <span className="truncate max-w-[160px]">{emp.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-border/50">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg h-8 px-2.5 text-xs gap-1"
                    onClick={() => openProfile(emp)}
                  >
                    <Eye className="w-3.5 h-3.5" /> View Profile
                  </Button>

                  {(canEdit || canDelete) && (
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg h-8 w-8 p-0"
                          onClick={() => openEdit(emp)}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-lg h-8 w-8 p-0 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                          onClick={() => handleDelete(emp._id, emp.name)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-card border-b border-border">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Role / Designation</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Venture</th>
                  <th className="px-4 py-3">Team</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp: any) => (
                  <tr key={emp._id} className="border-b border-border bg-card/40 hover:bg-card">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">{emp.employeeId || "EMP-1001"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={emp.avatar || emp.photo} />
                          <AvatarFallback>{emp.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground">{emp.name}</p>
                          <p className="text-[11px] text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium text-foreground">{emp.designation || emp.role}</p>
                      <p className="text-[10px] text-muted-foreground">Role: {emp.role}</p>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{emp.department}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-primary">{emp.venture?.name || "None"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{emp.team?.teamName || "Unassigned"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${emp.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openProfile(emp)}>
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                        {canEdit && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(emp)}>
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-rose-500" onClick={() => handleDelete(emp._id, emp.name)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Add / Edit Employee Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background text-foreground border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Employee" : "Add New Employee"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {editingId ? "Update employee information and team assignment." : "Add a new team member and assign them to a Venture & Team."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="eFirst">First Name *</Label>
                <Input
                  id="eFirst"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Aarav"
                  className="mt-1.5 rounded-xl border-border"
                  required
                />
              </div>
              <div>
                <Label htmlFor="eLast">Last Name</Label>
                <Input
                  id="eLast"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Sharma"
                  className="mt-1.5 rounded-xl border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="eEmail">Email Address *</Label>
                <Input
                  id="eEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav@thenam.com"
                  className="mt-1.5 rounded-xl border-border"
                  required
                />
              </div>
              <div>
                <Label htmlFor="ePhone">Phone Number</Label>
                <Input
                  id="ePhone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-1.5 rounded-xl border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="eRole">System Role *</Label>
                <select
                  id="eRole"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="Founder">Founder</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Finance">Finance</option>
                  <option value="Employee">Employee</option>
                  <option value="Customer">Customer</option>
                </select>
              </div>

              <div>
                <Label htmlFor="eDesig">Designation</Label>
                <Input
                  id="eDesig"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="Senior Developer"
                  className="mt-1.5 rounded-xl border-border"
                />
              </div>

              <div>
                <Label htmlFor="eDept">Department</Label>
                <select
                  id="eDept"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Marketing">Marketing</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Design">Design</option>
                </select>
              </div>
            </div>

            {/* Venture Assignment Cascading to Team Selection */}
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div>
                <Label htmlFor="eVent">Assign Venture *</Label>
                <select
                  id="eVent"
                  value={formVentureId}
                  onChange={(e) => {
                    setFormVentureId(e.target.value);
                    setFormTeamId(""); // Reset team selection when venture changes
                  }}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                  required
                >
                  <option value="">Select Venture</option>
                  {ventures?.map((v: any) => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="eTeam">Assign Team (Cascaded)</Label>
                <select
                  id="eTeam"
                  value={formTeamId}
                  onChange={(e) => setFormTeamId(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                  disabled={!formVentureId}
                >
                  <option value="">
                    {!formVentureId ? "Select Venture First" : "Unassigned Team"}
                  </option>
                  {ventureTeams?.map((t: any) => (
                    <option key={t._id} value={t._id}>{t.teamName}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="eManager">Reporting Manager</Label>
                <select
                  id="eManager"
                  value={reportingManagerId}
                  onChange={(e) => setReportingManagerId(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="">None</option>
                  {employees?.filter((emp: any) => emp._id !== editingId).map((emp: any) => (
                    <option key={emp._id} value={emp._id}>{emp.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="eSalary">Salary (₹/yr)</Label>
                <Input
                  id="eSalary"
                  type="number"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="mt-1.5 rounded-xl border-border"
                />
              </div>

              <div>
                <Label htmlFor="eStatus">Status</Label>
                <select
                  id="eStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="On leave">On Leave</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="ePhoto">Photo URL</Label>
              <Input
                id="ePhoto"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://i.pravatar.cc/150?img=10"
                className="mt-1.5 rounded-xl border-border"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEmployee.isPending || updateEmployee.isPending}
                className="rounded-xl gradient-royal text-white hover:opacity-90"
              >
                {createEmployee.isPending || updateEmployee.isPending
                  ? "Saving..."
                  : editingId
                  ? "Update Employee"
                  : "Add Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Employee Profile Detail Drawer/Modal */}
      <EmployeeProfileModal
        employee={profileEmployee}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />

      <Toaster />
    </PageContainer>
  );
}
