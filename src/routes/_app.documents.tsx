import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileText, FolderPlus, Search, Upload } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Documents — Thenam ERP" }] }),
  component: DocumentsPage,
});

function DocumentsPage() {
  const [q, setQ] = useState("");

  return (
    <PageContainer>
      <PageHeader
        title="Documents"
        subtitle="Central repository for policies, contracts and knowledge."
        actions={
          <>
            <Button variant="outline" className="rounded-xl gap-1.5"><FolderPlus className="h-4 w-4" /> New folder</Button>
            <Button className="rounded-xl gradient-royal text-white gap-1.5"><Upload className="h-4 w-4" /> Upload</Button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 mb-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search documents…" className="pl-9 h-11 rounded-xl" />
        </div>
      </div>

      <SectionCard title="Recent files" description="No documents yet">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 text-center gap-4"
        >
          <div className="grid h-20 w-20 place-items-center rounded-3xl gradient-royal text-white shadow-elevated">
            <FileText className="h-9 w-9" />
          </div>
          <div>
            <p className="text-lg font-semibold">No documents yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload files to build your central knowledge repository.
            </p>
          </div>
          <Button className="rounded-xl gradient-royal text-white gap-1.5 mt-2">
            <Upload className="h-4 w-4" /> Upload document
          </Button>
        </motion.div>
      </SectionCard>
    </PageContainer>
  );
}
