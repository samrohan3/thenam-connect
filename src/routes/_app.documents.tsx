import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, FolderPlus, Search, Upload, Download, Trash2, FileCode, Image, File } from "lucide-react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Documents — Thenam ERP" }] }),
  component: DocumentsPage,
});

interface DocFile {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  createdAt: string;
}

function DocumentsPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Initial demo documents list with persistent memory state
  const [documents, setDocuments] = useState<DocFile[]>([
    {
      id: "doc-1",
      name: "Thenam_Software_Corporate_Policy_2026.pdf",
      size: "2.4 MB",
      type: "pdf",
      url: "#",
      createdAt: "2026-07-20",
    },
    {
      id: "doc-2",
      name: "Venture_Financial_Audit_Q2.xlsx",
      size: "1.8 MB",
      type: "excel",
      url: "#",
      createdAt: "2026-07-21",
    },
    {
      id: "doc-3",
      name: "ERP_Architecture_Blueprint.png",
      size: "4.1 MB",
      type: "image",
      url: "#",
      createdAt: "2026-07-22",
    }
  ]);

  const filteredDocs = useMemo(() => {
    if (!q) return documents;
    return documents.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()));
  }, [documents, q]);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload.");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await api.post("/upload/single", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const newDoc: DocFile = {
        id: `doc-${Date.now()}`,
        name: selectedFile.name,
        size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
        type: selectedFile.type.includes("image") ? "image" : selectedFile.type.includes("pdf") ? "pdf" : "file",
        url: res.data.data?.path || "#",
        createdAt: new Date().toISOString().slice(0, 10),
      };

      setDocuments((prev) => [newDoc, ...prev]);
      toast.success("Document uploaded successfully!");
      setOpen(false);
      setSelectedFile(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "File upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type === "pdf") return <FileText className="h-5 w-5 text-rose-400" />;
    if (type === "image") return <Image className="h-5 w-5 text-indigo-400" />;
    if (type === "excel") return <FileCode className="h-5 w-5 text-emerald-400" />;
    return <File className="h-5 w-5 text-slate-400" />;
  };

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        subtitle="Central repository for policies, contracts and knowledge."
        actions={
          <>
            <Button className="rounded-xl gradient-royal text-white gap-1.5 cursor-pointer" onClick={() => setOpen(true)}>
              <Upload className="h-4 w-4" /> Upload document
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mb-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents…" className="pl-9 h-11 rounded-xl" />
        </div>
      </div>

      <SectionCard title="Recent files" description={`${filteredDocs.length} documents in workspace`}>
        {filteredDocs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center gap-4"
          >
            <div className="grid h-20 w-20 place-items-center rounded-3xl gradient-royal text-white shadow-elevated">
              <FileText className="h-9 w-9" />
            </div>
            <div>
              <p className="text-lg font-semibold">No matching documents</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload files to build your central knowledge repository.
              </p>
            </div>
            <Button className="rounded-xl gradient-royal text-white gap-1.5 mt-2 cursor-pointer" onClick={() => setOpen(true)}>
              <Upload className="h-4 w-4" /> Upload document
            </Button>
          </motion.div>
        ) : (
          <div className="mt-4 space-y-3">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="p-4 rounded-xl bg-slate-900 border border-border flex items-center justify-between">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2.5 rounded-xl bg-slate-800 flex items-center justify-center">
                    {getFileIcon(doc.type)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.size} • Uploaded on {doc.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg gap-1.5 cursor-pointer" onClick={() => toast.success(`Downloading ${doc.name}...`)}>
                    <Download className="h-3.5 w-3.5" /> Download
                  </Button>
                  <Button variant="ghost" size="icon" className="text-rose-400 hover:text-rose-300 rounded-lg" onClick={() => setDocuments(docs => docs.filter(d => d.id !== doc.id))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md bg-slate-950 text-foreground border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Upload files to store them securely in the ERP system.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUploadSubmit} className="space-y-4 py-2">
            <div>
              <Label htmlFor="docFile">Choose File</Label>
              <Input
                id="docFile"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="mt-1.5 rounded-xl border-border bg-slate-900 file:text-foreground file:font-semibold"
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={uploading} className="rounded-xl gradient-royal text-white">
                {uploading ? "Uploading..." : "Upload File"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </PageContainer>
  );
}
