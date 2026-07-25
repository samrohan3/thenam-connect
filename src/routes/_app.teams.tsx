import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SectionCard } from "@/components/ui-ext/section-card";
import {
  Users2,
  Plus,
  Search,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  UserCheck,
  Building2,
  FolderKanban,
  Calendar,
  CheckCircle,
  XCircle,
  UserPlus,
  UserMinus
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuthStore } from "@/store/authStore";
import { canAccessRoute, hasPermission } from "@/lib/permissions";
import { AccessDenied } from "@/components/rbac/AccessDenied";
import { RoleGuard } from "@/components/rbac/RoleGuard";
import {
  useTeams,
  useCreateTeam,
  useUpdateTeam,
  useDeleteTeam,
  useVentures,
  useEmployees
} from "@/lib/api-hooks";

export const Route = createFileRoute("/_app/teams")({
  head: () => ({ meta: [{ title: "Teams — Thenam ERP" }] }),
  component: TeamsPage,
});

function TeamsPage() {
  const { user } = useAuthStore();

  // Route protection
  if (!canAccessRoute(user?.role, "/teams")) {
    return <AccessDenied resource="Teams" />;
  }

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenture, setSelectedVenture] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedLead, setSelectedLead] = useState("all");

  const { data: teams, isLoading: isTeamsLoading } = useTeams();
  const { data: ventures } = useVentures();
  const { data: employees } = useEmployees();

  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam();
  const deleteTeam = useDeleteTeam();

  // Modal State
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [teamName, setTeamName] = useState("");
  const [ventureId, setVentureId] = useState("");
  const [teamLeadId, setTeamLeadId] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Active");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  const filteredTeams = useMemo(() => {
    if (!teams) return [];
    return teams.filter((t: any) => {
      const matchesSearch =
        !searchQuery.trim() ||
        t.teamName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.venture?.name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesVenture =
        selectedVenture === "all" ||
        t.venture?._id === selectedVenture ||
        t.venture === selectedVenture;

      const matchesStatus =
        selectedStatus === "all" || t.status === selectedStatus;

      const matchesLead =
        selectedLead === "all" ||
        t.teamLead?._id === selectedLead ||
        t.teamLead === selectedLead;

      return matchesSearch && matchesVenture && matchesStatus && matchesLead;
    });
  }, [teams, searchQuery, selectedVenture, selectedStatus, selectedLead]);

  const openNew = () => {
    setEditingId(null);
    setTeamName("");
    setVentureId(ventures && ventures.length > 0 ? ventures[0]._id : "");
    setTeamLeadId("");
    setDescription("");
    setStatus("Active");
    setSelectedMembers([]);
    setMemberSearch("");
    setOpen(true);
  };

  const openEdit = (t: any) => {
    setEditingId(t._id || t.id);
    setTeamName(t.teamName || "");
    setVentureId(t.venture?._id || t.venture || "");
    setTeamLeadId(t.teamLead?._id || t.teamLead || "");
    setDescription(t.description || "");
    setStatus(t.status || "Active");
    setSelectedMembers(t.members ? t.members.map((m: any) => m._id || m) : []);
    setMemberSearch("");
    setOpen(true);
  };

  const toggleMemberSelection = (empId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !ventureId) {
      toast.error("Team Name and Venture are required.");
      return;
    }

    const payload = {
      teamName,
      venture: ventureId,
      teamLead: teamLeadId || null,
      description,
      status,
      members: selectedMembers,
    };

    if (editingId) {
      updateTeam.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast.success("Team Updated successfully");
            setOpen(false);
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update team");
          },
        }
      );
    } else {
      createTeam.mutate(payload, {
        onSuccess: () => {
          toast.success("Team Created successfully");
          setOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to create team");
        },
      });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete team "${name}"? Members will be moved to Unassigned.`)) {
      deleteTeam.mutate(id, {
        onSuccess: () => toast.success("Team Deleted successfully"),
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete team"),
      });
    }
  };

  const canCreate = hasPermission(user?.role, "team", "create");
  const canEdit = hasPermission(user?.role, "team", "update");
  const canDelete = hasPermission(user?.role, "team", "delete");

  // Filter member search list inside modal
  const searchableEmployees = useMemo(() => {
    if (!employees) return [];
    const term = memberSearch.toLowerCase().trim();
    return employees.filter(
      (emp: any) =>
        !term ||
        emp.name?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term) ||
        emp.designation?.toLowerCase().includes(term)
    );
  }, [employees, memberSearch]);

  return (
    <PageContainer>
      <PageHeader
        title="Teams"
        subtitle="Manage cross-venture teams, team leads, and assigned members."
        actions={
          <RoleGuard resource="team" action="create">
            <Button className="rounded-xl gradient-royal text-white gap-1.5 cursor-pointer" onClick={openNew}>
              <Plus className="h-4 w-4" /> Create Team
            </Button>
          </RoleGuard>
        }
      />

      {/* Filter Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search teams or ventures..."
              className="pl-9 h-10 rounded-xl bg-card border-border"
            />
          </div>

          <select
            value={selectedVenture}
            onChange={(e) => setSelectedVenture(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none"
          >
            <option value="all">All Ventures</option>
            {ventures?.map((v: any) => (
              <option key={v._id} value={v._id}>{v.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <select
            value={selectedLead}
            onChange={(e) => setSelectedLead(e.target.value)}
            className="h-10 px-3 rounded-xl border border-border bg-card text-xs text-foreground focus:outline-none"
          >
            <option value="all">All Leads</option>
            {employees?.map((emp: any) => (
              <option key={emp._id} value={emp._id}>{emp.name}</option>
            ))}
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

      <SectionCard title="All Teams">
        {isTeamsLoading ? (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading teams...</div>
        ) : filteredTeams.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Users2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-base">No teams found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new team.</p>
            </div>
            {canCreate && (
              <Button className="rounded-xl gradient-royal text-white gap-1.5 mt-2 cursor-pointer" onClick={openNew}>
                <Plus className="h-4 w-4" /> Create Team
              </Button>
            )}
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeams.map((team: any) => (
              <div
                key={team._id}
                className="p-5 border border-border rounded-2xl bg-card hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{team.teamName}</h3>
                      <div className="flex items-center gap-1 text-xs text-primary font-medium mt-0.5">
                        <Building2 className="w-3.5 h-3.5" /> {team.venture?.name || "Unassigned Venture"}
                      </div>
                    </div>
                    <Badge
                      className={`rounded-full text-[11px] capitalize ${
                        team.status === "Active"
                          ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {team.status || "Active"}
                    </Badge>
                  </div>

                  {team.description && (
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{team.description}</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-border/50 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Team Lead:
                      </span>
                      <span className="font-semibold text-foreground">
                        {team.teamLead?.name || "Not Assigned"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <Users2 className="w-3.5 h-3.5 text-indigo-400" /> Members:
                      </span>
                      <span className="font-semibold text-foreground">{team.memberCount || 0} Members</span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <FolderKanban className="w-3.5 h-3.5 text-amber-400" /> Active Projects:
                      </span>
                      <span className="font-semibold text-foreground">{team.activeProjectsCount || 0}</span>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-muted-foreground" /> Created:
                      </span>
                      <span>{new Date(team.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {(canEdit || canDelete) && (
                  <div className="flex items-center justify-end gap-2 mt-5 pt-3 border-t border-border/50">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg h-8 px-2.5 text-xs"
                        onClick={() => openEdit(team)}
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg h-8 px-2.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        onClick={() => handleDelete(team._id, team.teamName)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          /* List View Table */
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-card border-b border-border">
                <tr>
                  <th className="px-4 py-3">Team Name</th>
                  <th className="px-4 py-3">Venture</th>
                  <th className="px-4 py-3">Team Lead</th>
                  <th className="px-4 py-3">Members</th>
                  <th className="px-4 py-3">Active Projects</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((t: any) => (
                  <tr key={t._id} className="border-b border-border bg-card/40 hover:bg-card">
                    <td className="px-4 py-3 font-semibold text-foreground">{t.teamName}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-primary">{t.venture?.name || "None"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{t.teamLead?.name || "Unassigned"}</td>
                    <td className="px-4 py-3 text-xs font-semibold">{t.memberCount || 0}</td>
                    <td className="px-4 py-3 text-xs">{t.activeProjectsCount || 0}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(canEdit || canDelete) && (
                        <div className="flex items-center justify-end gap-1">
                          {canEdit && (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(t)}>
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-rose-500" onClick={() => handleDelete(t._id, t.teamName)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Create / Edit Team Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto bg-background text-foreground border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Team" : "Create New Team"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {editingId ? "Update team information, lead, and members." : "Define a new team under a venture and assign team lead & members."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tmName">Team Name *</Label>
                <Input
                  id="tmName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Frontend Core"
                  className="mt-1.5 rounded-xl border-border"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tmVent">Assign Venture *</Label>
                <select
                  id="tmVent"
                  value={ventureId}
                  onChange={(e) => setVentureId(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                  required
                >
                  <option value="">Select Venture</option>
                  {ventures?.map((v: any) => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="tmLead">Assign Team Lead</Label>
                <select
                  id="tmLead"
                  value={teamLeadId}
                  onChange={(e) => setTeamLeadId(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="">No Lead Assigned</option>
                  {employees?.map((emp: any) => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.designation || emp.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="tmStatus">Status</Label>
                <select
                  id="tmStatus"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="tmDesc">Description</Label>
              <Textarea
                id="tmDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Team responsibilities and deliverables..."
                className="mt-1.5 rounded-xl border-border"
              />
            </div>

            {/* Member Selection Section */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">
                  Team Members ({selectedMembers.length} selected)
                </Label>
                <span className="text-xs text-muted-foreground">Click employee to add/remove</span>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  placeholder="Search employees to add..."
                  className="pl-8 h-8 text-xs rounded-xl bg-card border-border"
                />
              </div>

              <div className="max-h-48 overflow-y-auto border border-border rounded-xl p-2 space-y-1 bg-card/40">
                {searchableEmployees.length === 0 ? (
                  <p className="text-xs text-muted-foreground p-3 text-center">No matching employees found.</p>
                ) : (
                  searchableEmployees.map((emp: any) => {
                    const isSelected = selectedMembers.includes(emp._id);
                    return (
                      <div
                        key={emp._id}
                        onClick={() => toggleMemberSelection(emp._id)}
                        className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition ${
                          isSelected ? "bg-primary/10 border border-primary/30 text-foreground" : "hover:bg-card text-muted-foreground"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={emp.avatar || emp.photo} />
                            <AvatarFallback>{emp.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-semibold text-foreground">{emp.name}</span>
                            <span className="text-[10px] text-muted-foreground ml-2">({emp.designation || emp.role})</span>
                          </div>
                        </div>
                        {isSelected ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 text-[10px] gap-1">
                            <CheckCircle className="h-3 w-3" /> Added
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground hover:text-foreground">Click to add</span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <DialogFooter className="pt-3">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createTeam.isPending || updateTeam.isPending}
                className="rounded-xl gradient-royal text-white hover:opacity-90"
              >
                {createTeam.isPending || updateTeam.isPending
                  ? "Saving..."
                  : editingId
                  ? "Update Team"
                  : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </PageContainer>
  );
}
