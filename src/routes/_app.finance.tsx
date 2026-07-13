import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightLeft, Minus, Plus } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

import { useFinanceSummary, useTransactions, useAddRevenue, useRecordExpense, useTransferFunds } from "@/lib/api-hooks";

export const Route = createFileRoute("/_app/finance")({
  head: () => ({ meta: [{ title: "Finance — Thenam ERP" }] }),
  component: FinancePage,
});

function FinancePage() {
  const { data: summary, isLoading: isSummaryLoading } = useFinanceSummary();
  const { data: txs, isLoading: isTxsLoading } = useTransactions();
  
  const addRevenueMutation = useAddRevenue();
  const recordExpenseMutation = useRecordExpense();
  const transferMutation = useTransferFunds();

  const handleAddRevenue = () => {
     addRevenueMutation.mutate({
         venture: "some_venture_id", // Would come from form
         amount: 1000,
         reason: "Service Payment",
         method: "Bank Transfer",
         date: new Date().toISOString(),
         status: "Completed"
     }, {
         onSuccess: () => toast.success("Revenue recorded")
     });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Finance"
        subtitle="Wallets, money in and out, and inter-venture transfers across ventures."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <SectionCard title="Company Wallet" className="bg-slate-900 text-white">
              <div className="text-3xl font-bold mt-2">
                  ${summary ? summary.walletBalance.toLocaleString() : "0"}
              </div>
          </SectionCard>
          <SectionCard title="Money In Today" className="bg-slate-900 text-white">
              <div className="text-3xl font-bold mt-2 text-emerald-400">
                  ${summary ? summary.inToday.toLocaleString() : "0"}
              </div>
          </SectionCard>
          <SectionCard title="Money Out Today" className="bg-slate-900 text-white">
              <div className="text-3xl font-bold mt-2 text-rose-400">
                  ${summary ? summary.outToday.toLocaleString() : "0"}
              </div>
          </SectionCard>
          <SectionCard title="Monthly Profit" className="bg-slate-900 text-white">
              <div className="text-3xl font-bold mt-2 text-blue-400">
                  ${summary ? summary.monthProfit.toLocaleString() : "0"}
              </div>
          </SectionCard>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button className="rounded-xl gradient-emerald text-white gap-1.5" onClick={() => toast.info("Form coming soon")}>
          <Plus className="h-4 w-4" /> Add Revenue
        </Button>
        <Button className="rounded-xl gradient-gold text-[color:var(--gold-foreground)] gap-1.5" onClick={() => toast.info("Form coming soon")}>
          <Minus className="h-4 w-4" /> Money Out
        </Button>
        <Button className="rounded-xl gradient-royal text-white gap-1.5" onClick={() => toast.info("Form coming soon")}>
          <ArrowRightLeft className="h-4 w-4" /> Transfer Between Ventures
        </Button>
      </div>

      <SectionCard
        title="Recent Transactions"
        className="mt-8"
      >
        {isTxsLoading ? (
            <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>
        ) : !txs || txs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
                <div className="w-12 h-12 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <ArrowRightLeft className="h-6 w-6 text-slate-400" />
                </div>
                No transactions found. Add revenue or record an expense to get started.
            </div>
        ) : (
            <div className="mt-4">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-slate-900 border-b border-border">
                        <tr>
                            <th className="px-4 py-3">Reference</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {txs.map((tx: any) => (
                            <tr key={tx._id} className="border-b border-border bg-slate-900/50">
                                <td className="px-4 py-3 font-medium">{tx.referenceNumber}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs ${tx.type === 'Money In' ? 'bg-emerald-500/10 text-emerald-400' : tx.type === 'Money Out' ? 'bg-rose-500/10 text-rose-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3">${tx.amount.toLocaleString()}</td>
                                <td className="px-4 py-3">{new Date(tx.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </SectionCard>

      <Toaster />
    </PageContainer>
  );
}

