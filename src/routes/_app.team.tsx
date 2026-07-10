import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { employees } from "@/lib/mock-data";
import { Search, UserPlus } from "lucide-react";

export const Route = createFileRoute("/_app/team")({
  head: () => ({ meta: [{ title: "Team — Thenam ERP" }] }),
  component: TeamPage,
});

const departments = ["All", "Design", "Engineering", "Marketing", "Sales", "Support", "Operations"];
const PAGE_SIZE = 8;

function TeamPage() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return employees.filter((e) => {
      const okQ = e.name.toLowerCase().includes(q.toLowerCase()) || e.role.toLowerCase().includes(q.toLowerCase());
      const okD = dept === "All" || e.department === dept;
      return okQ && okD;
    });
  }, [q, dept]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <PageContainer>
      <PageHeader
        title="Team"
        subtitle={`${employees.length} people across all ventures.`}
        actions={
          <Button className="rounded-xl gradient-royal text-white gap-1.5">
            <UserPlus className="h-4 w-4" /> Add employee
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-3 mb-5">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search employees…"
            className="pl-9 h-11 rounded-xl"
          />
        </div>
        <Select value={dept} onValueChange={(v) => { setDept(v); setPage(1); }}>
          <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {current.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.03 }}
            className="rounded-2xl border border-border bg-card p-5 card-hover"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14 ring-2 ring-primary/10">
                <AvatarImage src={e.avatar} />
                <AvatarFallback>{e.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-semibold">{e.name}</p>
                <p className="truncate text-xs text-muted-foreground">{e.role}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <Badge variant="secondary" className="rounded-full">{e.department}</Badge>
              <span className={e.status === "Active" ? "text-emerald" : "text-muted-foreground"}>● {e.status}</span>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Performance</span>
                <span className="font-semibold text-foreground">{e.performance}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full gradient-emerald" style={{ width: `${e.performance}%` }} />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{e.projects} projects</span>
              <Button size="sm" variant="ghost" className="h-8">View</Button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} />
            </PaginationItem>
            {Array.from({ length: pages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)}>
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setPage((p) => Math.min(pages, p + 1))} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </PageContainer>
  );
}
