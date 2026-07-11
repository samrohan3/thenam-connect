import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VENTURES } from "@/lib/finance-data";

export interface FiltersState {
  search: string;
  venture: string;
  type: string;
  status: string;
  from: string;
  to: string;
  sort: "latest" | "oldest" | "amount-desc" | "amount-asc";
}

export const defaultFilters: FiltersState = {
  search: "",
  venture: "all",
  type: "all",
  status: "all",
  from: "",
  to: "",
  sort: "latest",
};

export function FinanceFilters({ value, onChange }: { value: FiltersState; onChange: (v: FiltersState) => void }) {
  function patch(p: Partial<FiltersState>) {
    onChange({ ...value, ...p });
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3">
      <div className="relative col-span-2 md:col-span-2 xl:col-span-2">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search ID, party, reason…"
          className="pl-9 rounded-xl"
          value={value.search}
          onChange={(e) => patch({ search: e.target.value })}
        />
      </div>
      <Select value={value.venture} onValueChange={(v) => patch({ venture: v })}>
        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Venture" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ventures</SelectItem>
          {VENTURES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={value.type} onValueChange={(v) => patch({ type: v })}>
        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Type" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Money In">Money In</SelectItem>
          <SelectItem value="Money Out">Money Out</SelectItem>
          <SelectItem value="Transfer">Transfer</SelectItem>
        </SelectContent>
      </Select>
      <Select value={value.status} onValueChange={(v) => patch({ status: v })}>
        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Status" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="Completed">Completed</SelectItem>
          <SelectItem value="Pending">Pending</SelectItem>
          <SelectItem value="Cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>
      <Input type="date" className="rounded-xl" value={value.from} onChange={(e) => patch({ from: e.target.value })} />
      <Input type="date" className="rounded-xl" value={value.to} onChange={(e) => patch({ to: e.target.value })} />
      <Select value={value.sort} onValueChange={(v) => patch({ sort: v as FiltersState["sort"] })}>
        <SelectTrigger className="rounded-xl xl:col-span-1 col-span-2"><SelectValue placeholder="Sort" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="latest">Sort: Latest</SelectItem>
          <SelectItem value="oldest">Sort: Oldest</SelectItem>
          <SelectItem value="amount-desc">Sort: Amount ↓</SelectItem>
          <SelectItem value="amount-asc">Sort: Amount ↑</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export function applyFilters<T extends { id: string; date: string; type: string; status: string; venture: string; amount: number; reason: string; source: string; destination: string; username: string }>(
  txs: T[],
  f: FiltersState,
): T[] {
  const q = f.search.trim().toLowerCase();
  const from = f.from ? new Date(f.from).getTime() : -Infinity;
  const to = f.to ? new Date(f.to).getTime() + 86400000 : Infinity;
  const out = txs.filter((t) => {
    if (f.venture !== "all" && t.venture !== f.venture) return false;
    if (f.type !== "all" && t.type !== f.type) return false;
    if (f.status !== "all" && t.status !== f.status) return false;
    const time = new Date(t.date).getTime();
    if (time < from || time > to) return false;
    if (q) {
      const hay = `${t.id} ${t.reason} ${t.source} ${t.destination} ${t.username} ${t.venture}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  out.sort((a, b) => {
    switch (f.sort) {
      case "oldest": return a.date < b.date ? -1 : 1;
      case "amount-desc": return b.amount - a.amount;
      case "amount-asc": return a.amount - b.amount;
      default: return a.date < b.date ? 1 : -1;
    }
  });
  return out;
}
