import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { useVentures, useCreateVenture, useUpdateVenture, useDeleteVenture } from "@/lib/api-hooks";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Building2, Plus, Trash2, Edit2, Globe, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
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
import { useAuthStore } from "@/store/authStore";
import { canAccessRoute, hasPermission } from "@/lib/permissions";
import { AccessDenied } from "@/components/rbac/AccessDenied";
import { RoleGuard } from "@/components/rbac/RoleGuard";

export const Route = createFileRoute("/_app/ventures")({
  head: () => ({ meta: [{ title: "Ventures — Thenam ERP" }] }),
  component: VenturesPage,
});

function VenturesPage() {
  const { user } = useAuthStore();

  // Route protection
  if (!canAccessRoute(user?.role, "/ventures")) {
    return <AccessDenied resource="Ventures" />;
  }

  const { data: ventures, isLoading } = useVentures();
  const createVenture = useCreateVenture();
  const updateVenture = useUpdateVenture();
  const deleteVenture = useDeleteVenture();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [tagline, setTagline] = useState("");
  const [industry, setIndustry] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");

  const openNew = () => {
    setEditingId(null);
    setName("");
    setKey("");
    setTagline("");
    setIndustry("");
    setDescription("");
    setWebsite("");
    setOpen(true);
  };

  const openEdit = (venture: any) => {
    setEditingId(venture._id || venture.id);
    setName(venture.name || "");
    setKey(venture.key || "");
    setTagline(venture.tagline || "");
    setIndustry(venture.industry || "");
    setDescription(venture.description || "");
    setWebsite(venture.website || "");
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Venture name is required.");
      return;
    }

    const payload = {
      name,
      key: key || name.toLowerCase().replace(/[^a-z0-9]/g, ""),
      tagline,
      industry,
      description,
      website,
    };

    if (editingId) {
      updateVenture.mutate(
        { id: editingId, data: payload },
        {
          onSuccess: () => {
            toast.success("Venture updated successfully");
            setOpen(false);
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update venture");
          },
        }
      );
    } else {
      createVenture.mutate(payload, {
        onSuccess: () => {
          toast.success("Venture created successfully");
          setOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to create venture");
        },
      });
    }
  };

  const handleDelete = (id: string, vName: string) => {
    if (confirm(`Are you sure you want to delete venture "${vName}"?`)) {
      deleteVenture.mutate(id, {
        onSuccess: () => toast.success("Venture deleted successfully"),
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete venture"),
      });
    }
  };

  const canCreate = hasPermission(user?.role, "ventures", "create");
  const canEdit = hasPermission(user?.role, "ventures", "update");
  const canDelete = hasPermission(user?.role, "ventures", "delete");

  return (
    <PageContainer>
      <PageHeader
        title="Ventures"
        subtitle="Manage company ventures and business units."
        actions={
          <RoleGuard resource="ventures" action="create">
            <Button className="rounded-xl gradient-royal text-white gap-1.5 cursor-pointer" onClick={openNew}>
              <Plus className="h-4 w-4" /> Add Venture
            </Button>
          </RoleGuard>
        }
      />

      <SectionCard title="All Ventures">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading ventures...</div>
        ) : !ventures || ventures.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-base">No ventures found</h3>
              <p className="text-sm text-muted-foreground">Create your first venture to get started.</p>
            </div>
            {canCreate && (
              <Button className="rounded-xl gradient-royal text-white gap-1.5 mt-2 cursor-pointer" onClick={openNew}>
                <Plus className="h-4 w-4" /> Add Venture
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ventures.map((v: any) => (
              <div
                key={v._id || v.id}
                className="p-5 border border-border rounded-2xl bg-card hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{v.name}</h3>
                      {v.tagline && <p className="text-xs text-muted-foreground mt-0.5">{v.tagline}</p>}
                    </div>
                    <Badge variant="secondary" className="rounded-full text-[11px] capitalize">
                      {v.status || "active"}
                    </Badge>
                  </div>

                  {v.description && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{v.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {v.industry && (
                      <Badge variant="outline" className="rounded-lg text-xs gap-1">
                        <Tag className="w-3 h-3" /> {v.industry}
                      </Badge>
                    )}
                    {v.website && (
                      <Badge variant="outline" className="rounded-lg text-xs gap-1">
                        <Globe className="w-3 h-3" /> {v.website}
                      </Badge>
                    )}
                  </div>
                </div>

                {(canEdit || canDelete) && (
                  <div className="flex items-center justify-end gap-2 mt-6 pt-3 border-t border-border/50">
                    {canEdit && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg h-8 px-2.5 text-xs"
                        onClick={() => openEdit(v)}
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg h-8 px-2.5 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                        onClick={() => handleDelete(v._id || v.id, v.name)}
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-background text-foreground border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Venture" : "Add New Venture"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {editingId ? "Update existing venture details." : "Create a new business unit or venture."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div>
              <Label htmlFor="vName">Venture Name *</Label>
              <Input
                id="vName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. PaperHeros"
                className="mt-1.5 rounded-xl border-border"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="vKey">Key / Identifier</Label>
                <Input
                  id="vKey"
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="e.g. paperheros"
                  className="mt-1.5 rounded-xl border-border"
                />
              </div>
              <div>
                <Label htmlFor="vIndustry">Industry</Label>
                <Input
                  id="vIndustry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Technology"
                  className="mt-1.5 rounded-xl border-border"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="vTagline">Tagline</Label>
              <Input
                id="vTagline"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Sustainable paper products"
                className="mt-1.5 rounded-xl border-border"
              />
            </div>

            <div>
              <Label htmlFor="vWebsite">Website URL</Label>
              <Input
                id="vWebsite"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="e.g. https://paperheros.com"
                className="mt-1.5 rounded-xl border-border"
              />
            </div>

            <div>
              <Label htmlFor="vDesc">Description</Label>
              <Textarea
                id="vDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Business unit summary and goals..."
                className="mt-1.5 rounded-xl border-border"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createVenture.isPending || updateVenture.isPending}
                className="rounded-xl gradient-royal text-white hover:opacity-90"
              >
                {createVenture.isPending || updateVenture.isPending
                  ? "Saving..."
                  : editingId
                  ? "Update Venture"
                  : "Create Venture"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Toaster />
    </PageContainer>
  );
}
