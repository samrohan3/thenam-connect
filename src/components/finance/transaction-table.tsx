import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/lib/finance-data";

const typeStyles: Record<string, string> = {
  "Money In": "bg-emerald/10 text-emerald hover:bg-emerald/10",
  "Money Out": "bg-destructive/10 text-destructive hover:bg-destructive/10",
  Transfer: "bg-royal/10 text-royal hover:bg-royal/10",
};

const statusStyles: Record<string, string> = {
  Completed: "bg-emerald/10 text-emerald hover:bg-emerald/10",
  Pending: "bg-gold/15 text-[color:var(--gold-foreground)] hover:bg-gold/15",
  Cancelled: "bg-destructive/10 text-destructive hover:bg-destructive/10",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

export function TransactionTable({
  data,
  onView,
  onEdit,
  onDelete,
}: {
  data: Transaction[];
  onView?: (tx: Transaction) => void;
  onEdit?: (tx: Transaction) => void;
  onDelete?: (tx: Transaction) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Venture</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[52px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 && (
            <TableRow>
              <TableCell colSpan={12} className="text-center text-muted-foreground py-10">
                No transactions match the current filters.
              </TableCell>
            </TableRow>
          )}
          {data.map((t) => (
            <TableRow key={t.id} className="hover:bg-muted/40">
              <TableCell className="font-mono text-xs">{t.id}</TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">{formatDate(t.date)}</TableCell>
              <TableCell>
                <Badge className={cn(typeStyles[t.type])}>{t.type}</Badge>
              </TableCell>
              <TableCell className={cn("text-right tabular-nums font-semibold whitespace-nowrap",
                t.type === "Money In" && "text-emerald",
                t.type === "Money Out" && "text-destructive",
              )}>
                {t.type === "Money In" ? "+" : t.type === "Money Out" ? "-" : ""}${t.amount.toLocaleString()}
              </TableCell>
              <TableCell className="max-w-[180px] truncate">{t.reason}</TableCell>
              <TableCell className="max-w-[160px] truncate text-muted-foreground">{t.source}</TableCell>
              <TableCell className="max-w-[160px] truncate text-muted-foreground">{t.destination}</TableCell>
              <TableCell className="whitespace-nowrap">{t.username}</TableCell>
              <TableCell className="whitespace-nowrap">{t.venture}</TableCell>
              <TableCell className="whitespace-nowrap text-muted-foreground">{t.method}</TableCell>
              <TableCell>
                <Badge className={cn(statusStyles[t.status])}>{t.status}</Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(t)}>
                      <Eye className="h-4 w-4 mr-2" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit?.(t)}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete?.(t)}>
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
