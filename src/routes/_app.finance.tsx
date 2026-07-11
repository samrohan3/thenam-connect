import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightLeft, Minus, Plus } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";


import { FinanceSummaryCards } from "@/components/finance/finance-summary-cards";
import { TransactionFormModal } from "@/components/finance/transaction-form-modal";
import { TransferModal, buildTransferPair } from "@/components/finance/transfer-modal";
import { TransactionTable } from "@/components/finance/transaction-table";
import { FinanceFilters, applyFilters, defaultFilters, type FiltersState } from "@/components/finance/finance-filters";
import { FinanceCharts } from "@/components/finance/finance-charts";
import { MonthlySummary } from "@/components/finance/monthly-summary";
import {
  computeSummary,
  initialTransactions,
  newTransactionId,
  type Transaction,
} from "@/lib/finance-data";

export const Route = createFileRoute("/_app/finance")({
  head: () => ({ meta: [{ title: "Finance — Thenam ERP" }] }),
  component: FinancePage,
});

function FinancePage() {
  const [txs, setTxs] = useState<Transaction[]>(initialTransactions);
  const [filters, setFilters] = useState<FiltersState>(defaultFilters);
  const [openIn, setOpenIn] = useState(false);
  const [openOut, setOpenOut] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);

  const summary = useMemo(() => computeSummary(txs), [txs]);
  const filtered = useMemo(() => applyFilters(txs, filters), [txs, filters]);

  function addTransaction(base: Omit<Transaction, "id" | "status">) {
    const tx: Transaction = { ...base, id: newTransactionId(txs), status: "Completed" };
    setTxs((prev) => [tx, ...prev]);
    toast.success(`${tx.type} recorded`, { description: `${tx.id} · $${tx.amount.toLocaleString()}` });
  }

  function handleTransfer(input: { from: import("@/lib/finance-data").Venture; to: import("@/lib/finance-data").Venture; amount: number; reason: string; username: string; reference?: string; date: string; }) {
    const idA = newTransactionId(txs);
    const idB = `TX-${parseInt(idA.replace(/\D/g, ""), 10) + 1}`;
    const [outTx, inTx] = buildTransferPair({ ...input, idA, idB });
    setTxs((prev) => [inTx, outTx, ...prev]);
    toast.success("Transfer completed", { description: `${input.from} → ${input.to} · $${input.amount.toLocaleString()}` });
  }

  function handleDelete(tx: Transaction) {
    setTxs((prev) => prev.filter((t) => t.id !== tx.id));
    toast.message("Transaction deleted", { description: tx.id });
  }

  return (
    <PageContainer>
      <PageHeader
        title="Finance"
        subtitle="Wallets, money in and out, and inter-venture transfers across ventures."
      />

      <FinanceSummaryCards s={summary} />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button className="rounded-xl gradient-emerald text-white gap-1.5" onClick={() => setOpenIn(true)}>
          <Plus className="h-4 w-4" /> Add Revenue
        </Button>
        <Button className="rounded-xl gradient-gold text-[color:var(--gold-foreground)] gap-1.5" onClick={() => setOpenOut(true)}>
          <Minus className="h-4 w-4" /> Money Out
        </Button>
        <Button className="rounded-xl gradient-royal text-white gap-1.5" onClick={() => setOpenTransfer(true)}>
          <ArrowRightLeft className="h-4 w-4" /> Transfer Between Ventures
        </Button>
      </div>

      <div className="mt-6">
        <FinanceCharts
          txs={txs}
          ventureRevenue={summary.ventureRevenue}
          categoryExpense={summary.categoryExpense}
        />
      </div>

      <MonthlySummary
        inMonth={summary.inMonth}
        outMonth={summary.outMonth}
        monthProfit={summary.monthProfit}
        topVenture={summary.topVenture}
        topCategory={summary.topCategory}
        txThisMonth={summary.txThisMonth}
      />

      <SectionCard
        title="Transactions"
        description={`${filtered.length} of ${txs.length} shown`}
        className="mt-4"
      >
        <div className="mb-4">
          <FinanceFilters value={filters} onChange={setFilters} />
        </div>
        <TransactionTable
          data={filtered}
          onView={(t) => toast.message(t.id, { description: `${t.type} · ${t.venture} · $${t.amount.toLocaleString()}` })}
          onEdit={(t) => toast.info("Edit coming soon", { description: t.id })}
          onDelete={handleDelete}
        />
      </SectionCard>

      <TransactionFormModal open={openIn} onOpenChange={setOpenIn} mode="in" onSubmit={addTransaction} />
      <TransactionFormModal open={openOut} onOpenChange={setOpenOut} mode="out" onSubmit={addTransaction} />
      <TransferModal open={openTransfer} onOpenChange={setOpenTransfer} onSubmit={handleTransfer} />
      <Toaster />
    </PageContainer>
  );
}
