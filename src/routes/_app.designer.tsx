import { createFileRoute } from "@tanstack/react-router";
import { 
  PenTool, ExternalLink, Image, LayoutTemplate, Plus, MoreVertical, 
  Share, Edit2, Archive, Link as LinkIcon, Github, Globe, 
  FileText, FileSpreadsheet, Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";
import { hasPermission } from "@/lib/permissions";
import { RoleGuard } from "@/components/rbac/RoleGuard";
import { 
  useWorkspaceLinks, 
  useCreateWorkspaceLink, 
  useUpdateWorkspaceLink, 
  useArchiveWorkspaceLink,
  useDeleteWorkspaceLink,
  useRecentWorkspaceLinks,
  useTrackWorkspaceLinkOpen
} from "@/lib/api-hooks";

export const Route = createFileRoute("/_app/designer")({
  head: () => ({ meta: [{ title: "Designer Space — Thenam ERP" }] }),
  component: DesignerPage,
});

function getIconForType(type: string) {
  switch (type?.toLowerCase()) {
    case 'google drive': return <Image className="w-4 h-4 text-emerald-500" />;
    case 'figma': return <PenTool className="w-4 h-4 text-pink-500" />;
    case 'google sheets':
    case 'excel': return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
    case 'google docs':
    case 'word': return <FileText className="w-4 h-4 text-blue-500" />;
    case 'github': return <Github className="w-4 h-4 text-foreground" />;
    case 'website': return <Globe className="w-4 h-4 text-indigo-400" />;
    default: return <LinkIcon className="w-4 h-4 text-muted-foreground" />;
  }
}

function DesignerPage() {
  const { user } = useAuthStore();
  const { data: links, isLoading } = useWorkspaceLinks({ workspace: "designer" });
  const { data: recentLinks } = useRecentWorkspaceLinks("designer");
  
  const createLink = useCreateWorkspaceLink();
  const updateLink = useUpdateWorkspaceLink();
  const archiveLink = useArchiveWorkspaceLink();
  const deleteLink = useDeleteWorkspaceLink();
  const trackOpen = useTrackWorkspaceLinkOpen();

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [type, setType] = useState("Other");
  const [category, setCategory] = useState("Design");
  const [visibility, setVisibility] = useState("Everyone");

  const canCreate = hasPermission(user?.role, "workspace_links", "create");
  const canEdit = hasPermission(user?.role, "workspace_links", "update");
  const canDelete = hasPermission(user?.role, "workspace_links", "delete");
  const canShare = hasPermission(user?.role, "workspace_links", "read");

  const openNew = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setUrl("");
    setType("Other");
    setCategory("Design");
    setVisibility("Everyone");
    setOpen(true);
  };

  const openEdit = (link: any) => {
    setEditingId(link._id);
    setName(link.name);
    setDescription(link.description || "");
    setUrl(link.url);
    setType(link.type || "Other");
    setCategory(link.category || "Design");
    setVisibility(link.visibility || "Everyone");
    setOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !url) {
      toast.error("Name and URL are required.");
      return;
    }
    
    // Basic URL validation
    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid URL.");
      return;
    }

    const payload = {
      name, description, url, type, category, visibility, workspace: "designer"
    };

    if (editingId) {
      updateLink.mutate({ id: editingId, data: payload }, {
        onSuccess: () => {
          toast.success("Link updated successfully");
          setOpen(false);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to update link")
      });
    } else {
      createLink.mutate(payload, {
        onSuccess: () => {
          toast.success("Link added successfully");
          setOpen(false);
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to add link")
      });
    }
  };

  const handleArchive = (id: string) => {
    if (confirm("Are you sure you want to archive this link?")) {
      archiveLink.mutate(id, {
        onSuccess: () => toast.success("Link archived successfully"),
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to archive link")
      });
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to permanently delete this link?")) {
      deleteLink.mutate(id, {
        onSuccess: () => toast.success("Link deleted successfully"),
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed to delete link")
      });
    }
  };

  const handleShare = async (link: any) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: link.name,
          text: link.description,
          url: link.url
        });
      } else {
        await navigator.clipboard.writeText(link.url);
        toast.success("Link copied to clipboard");
      }
    } catch (err) {
      // User cancelled share or other error, handled silently unless it's a clipboard error
    }
  };

  const handleOpenLink = (link: any) => {
    trackOpen.mutate(link._id);
    window.open(link.url, '_blank', 'noopener,noreferrer');
  };

  const displayedLinks = links?.filter((l: any) => showArchived ? true : l.status !== "Archived") || [];

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="p-2.5 bg-pink-500/10 text-pink-500 rounded-xl">
          <PenTool className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Designer Space</h1>
          <p className="text-sm text-muted-foreground">Creative tasks, assets, and design links.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border bg-card/50 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <LayoutTemplate className="w-5 h-5 text-indigo-400" /> Quick Links
            </div>
            {canCreate && (
              <Button size="sm" variant="outline" className="h-8 rounded-lg gap-1.5" onClick={openNew}>
                <Plus className="w-3.5 h-3.5" /> Add Link
              </Button>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground">Access your external creative tools directly from here.</p>
          
          {canEdit && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowArchived(!showArchived)} className="text-xs h-7">
                {showArchived ? "Hide Archived" : "Show Archived"}
              </Button>
            </div>
          )}

          <div className="grid gap-3">
            {isLoading ? (
              <div className="text-sm text-muted-foreground py-4 text-center">Loading links...</div>
            ) : displayedLinks.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-xl border-border">
                No links found.
              </div>
            ) : (
              displayedLinks.map((link: any) => (
                <div key={link._id} className={`flex items-center justify-between p-3 border rounded-xl bg-card hover:border-primary/50 transition-colors ${link.status === 'Archived' ? 'opacity-60' : ''}`}>
                  <div className="flex-1 cursor-pointer" onClick={() => handleOpenLink(link)}>
                    <div className="flex items-center gap-2 font-medium text-sm">
                      {getIconForType(link.type)}
                      <span className="truncate">{link.name}</span>
                      {link.status === "Archived" && <Badge variant="outline" className="text-[10px] ml-2 h-4 px-1.5">Archived</Badge>}
                    </div>
                    {link.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate pl-6">{link.description}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/70 mt-1 pl-6">{link.type} • {link.category}</p>
                  </div>
                  
                  <div className="flex items-center gap-1 pl-3">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenLink(link)} title="Open">
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-3.5 h-3.5 opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40 rounded-xl">
                        <DropdownMenuItem onClick={() => handleOpenLink(link)}>
                          <ExternalLink className="mr-2 h-4 w-4" /> Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(link.url); toast.success("Link copied!"); }}>
                          <LinkIcon className="mr-2 h-4 w-4" /> Copy Link
                        </DropdownMenuItem>
                        {canShare && (
                          <DropdownMenuItem onClick={() => handleShare(link)}>
                            <Share className="mr-2 h-4 w-4" /> Share
                          </DropdownMenuItem>
                        )}
                        {canEdit && (
                          <DropdownMenuItem onClick={() => openEdit(link)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete && link.status !== "Archived" && (
                          <DropdownMenuItem onClick={() => handleArchive(link._id)} className="text-amber-500 focus:text-amber-500">
                            <Archive className="mr-2 h-4 w-4" /> Archive
                          </DropdownMenuItem>
                        )}
                        {canDelete && link.status === "Archived" && (
                          <DropdownMenuItem onClick={() => handleDelete(link._id)} className="text-rose-500 focus:text-rose-500">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-6 rounded-2xl border bg-card/50 space-y-4">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <LayoutTemplate className="w-5 h-5 text-rose-400" /> Recently Opened Links
          </div>
          <p className="text-sm text-muted-foreground">Your most recently accessed workspace links.</p>
          
          <div className="space-y-3">
            {!recentLinks || recentLinks.length === 0 ? (
              <div className="flex items-center justify-center h-32 border border-dashed rounded-xl border-border">
                <p className="text-sm text-muted-foreground">No recently opened links.</p>
              </div>
            ) : (
              recentLinks.map((link: any) => (
                <div 
                  key={`recent-${link._id}`} 
                  onClick={() => handleOpenLink(link)}
                  className="flex items-center gap-3 p-3 border rounded-xl bg-card hover:bg-muted/50 cursor-pointer transition-colors"
                >
                  <div className="p-2 bg-muted rounded-lg shrink-0">
                    {getIconForType(link.type)}
                  </div>
                  <div className="overflow-hidden flex-1">
                    <p className="font-medium text-sm truncate">{link.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 opacity-40 shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Link" : "Add New Link"}</DialogTitle>
            <DialogDescription>
              {editingId ? "Update details for this designer link." : "Add a new external link to the Designer Space."}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="lName">Link Name *</Label>
              <Input 
                id="lName" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="e.g., Company Google Drive" 
                className="rounded-xl"
                required 
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="lDesc">Description</Label>
              <Input 
                id="lDesc" 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Brief description of what this link contains" 
                className="rounded-xl"
              />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="lUrl">Link URL *</Label>
              <Input 
                id="lUrl" 
                type="url"
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                placeholder="https://..." 
                className="rounded-xl"
                required 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lType">Link Type</Label>
                <select
                  id="lType"
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus:outline-none"
                >
                  <option value="Google Drive">Google Drive</option>
                  <option value="Google Docs">Google Docs</option>
                  <option value="Google Sheets">Google Sheets</option>
                  <option value="Figma">Figma</option>
                  <option value="Canva">Canva</option>
                  <option value="Notion">Notion</option>
                  <option value="GitHub">GitHub</option>
                  <option value="Website">Website</option>
                  <option value="Other">Other / Custom</option>
                </select>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="lCat">Category</Label>
                <select
                  id="lCat"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus:outline-none"
                >
                  <option value="Design">Design</option>
                  <option value="Documents">Documents</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Development">Development</option>
                  <option value="General">General</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lVis">Visibility</Label>
              <select
                id="lVis"
                value={visibility}
                onChange={e => setVisibility(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-input bg-transparent text-sm focus:outline-none"
              >
                <option value="Everyone">Everyone</option>
                <option value="Admin Only">Admin Only</option>
              </select>
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
              <Button type="submit" className="rounded-xl gradient-royal text-white">
                {createLink.isPending || updateLink.isPending ? "Saving..." : "Save Link"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
