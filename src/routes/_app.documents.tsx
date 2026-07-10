import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { documents } from "@/lib/mock-data";
import { FileText, FolderPlus, Search, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/documents")({
  head: () => ({ meta: [{ title: "Documents — Thenam ERP" }] }),
  component: DocumentsPage,
});

const categories = ["All", ...Array.from(new Set(documents.map((d) => d.category)))];

const catTone: Record<string, string> = {
  HR: "gradient-emerald",
  Finance: "gradient-royal",
  Design: "gradient-gold",
  Legal: "gradient-brand",
  Strategy: "gradient-royal",
  Security: "gradient-emerald",
  Marketing: "gradient-gold",
};

function DocumentsPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const list = useMemo(() => {
    return documents.filter((d) =>
      (cat === "All" || d.category === cat) &&
      d.name.toLowerCase().includes(q.toLowerCase())
    );
  }, [q, cat]);

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
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={cn(
                "rounded-xl px-3 py-2 text-xs font-medium transition",
                cat === c ? "gradient-royal text-white shadow-elevated" : "bg-muted text-muted-foreground hover:bg-muted/70",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <SectionCard title="Recent files" description={`${list.length} document${list.length === 1 ? "" : "s"}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {list.map((d, i) => (
            <motion.div
              key={d.name}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="group rounded-2xl border border-border bg-card p-4 card-hover"
            >
              <div className={cn("grid h-14 w-14 place-items-center rounded-2xl text-white shadow-elevated", catTone[d.category] ?? "gradient-royal")}>
                <FileText className="h-6 w-6" />
              </div>
              <p className="mt-4 truncate text-sm font-semibold">{d.name}</p>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary" className="rounded-full">{d.category}</Badge>
                <span>{d.size}</span>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">Updated {d.updated}</p>
            </motion.div>
          ))}
        </div>
      </SectionCard>
    </PageContainer>
  );
}
