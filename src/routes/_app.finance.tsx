import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightLeft, Minus, Plus } from "lucide-react";
import { PageContainer, PageHeader } from "@/components/layout/page";
import { SectionCard } from "@/components/ui-ext/section-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
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

import { useFinanceSummary, useTransactions, useAddRevenue, useRecordExpense, useTransferFunds, useVentures } from "@/lib/api-hooks";

export const Route = createFileRoute("/_app/finance")({
  head: () => ({ meta: [{ title: "Finance — Thenam ERP" }] }),
  component: FinancePage,
});

function FinancePage() {
  const { data: summary, isLoading: isSummaryLoading } = useFinanceSummary();
  const { data: txs, isLoading: isTxsLoading } = useTransactions();
  const { data: ventures } = useVentures();
  
  const addRevenueMutation = useAddRevenue();
  const recordExpenseMutation = useRecordExpense();
  const transferMutation = useTransferFunds();

  // Modal Open States
  const [revenueOpen, setRevenueOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  // Revenue Form
  const [revVenture, setRevVenture] = useState("");
  const [revAmount, setRevAmount] = useState("");
  const [revCategory, setRevCategory] = useState("Client Payment");
  const [revReason, setRevReason] = useState("");
  const [revMethod, setRevMethod] = useState("Bank Transfer");
  const [revDesc, setRevDesc] = useState("");

  // Expense Form
  const [expVenture, setExpVenture] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState("Operating Expense");
  const [expReason, setExpReason] = useState("");
  const [expMethod, setExpMethod] = useState("Bank Transfer");
  const [expDesc, setExpDesc] = useState("");

  // Transfer Form
  const [fromVenture, setFromVenture] = useState("");
  const [toVenture, setToVenture] = useState("");
  const [trnAmount, setTrnAmount] = useState("");
  const [trnReason, setTrnReason] = useState("Inter-venture transfer");
  const [trnDesc, setTrnDesc] = useState("");

  const handleAddRevenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revVenture || !revAmount) {
      toast.error("Venture and Amount are required.");
      return;
    }
    addRevenueMutation.mutate({
      venture: revVenture,
      amount: Number(revAmount),
      category: revCategory,
      reason: revReason,
      paymentMethod: revMethod,
      description: revDesc
    }, {
      onSuccess: () => {
        toast.success("Revenue recorded successfully");
        setRevenueOpen(false);
        setRevVenture("");
        setRevAmount("");
        setRevReason("");
        setRevDesc("");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to record revenue");
      }
    });
  };

  const handleRecordExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expVenture || !expAmount) {
      toast.error("Venture and Amount are required.");
      return;
    }
    recordExpenseMutation.mutate({
      venture: expVenture,
      amount: Number(expAmount),
      category: expCategory,
      reason: expReason,
      paymentMethod: expMethod,
      description: expDesc
    }, {
      onSuccess: () => {
        toast.success("Expense recorded successfully");
        setExpenseOpen(false);
        setExpVenture("");
        setExpAmount("");
        setExpReason("");
        setExpDesc("");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to record expense");
      }
    });
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromVenture || !toVenture || !trnAmount) {
      toast.error("Source, Destination, and Amount are required.");
      return;
    }
    if (fromVenture === toVenture) {
      toast.error("Source and destination ventures must be different.");
      return;
    }
    transferMutation.mutate({
      fromVenture,
      toVenture,
      amount: Number(trnAmount),
      reason: trnReason,
      description: trnDesc
    }, {
      onSuccess: () => {
        toast.success("Funds transferred successfully");
        setTransferOpen(false);
        setFromVenture("");
        setToVenture("");
        setTrnAmount("");
        setTrnReason("Inter-venture transfer");
        setTrnDesc("");
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || "Failed to transfer funds");
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        title="Finance"
        subtitle="Wallets, money in and out, and inter-venture transfers across ventures."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <SectionCard title="Company Wallet" className="bg-card text-white">
              <div className="text-3xl font-bold mt-2">
                  ₹{isSummaryLoading ? "..." : (summary?.walletBalance || 0).toLocaleString()}
              </div>
          </SectionCard>
          <SectionCard title="Money In Today" className="bg-card text-white">
              <div className="text-3xl font-bold mt-2 text-emerald-400">
                  ₹{isSummaryLoading ? "..." : (summary?.inToday || 0).toLocaleString()}
              </div>
          </SectionCard>
          <SectionCard title="Money Out Today" className="bg-card text-white">
              <div className="text-3xl font-bold mt-2 text-rose-400">
                  ₹{isSummaryLoading ? "..." : (summary?.outToday || 0).toLocaleString()}
              </div>
          </SectionCard>
          <SectionCard title="Monthly Profit" className="bg-card text-white">
              <div className="text-3xl font-bold mt-2 text-royal">
                  ₹{isSummaryLoading ? "..." : (summary?.monthProfit || 0).toLocaleString()}
              </div>
          </SectionCard>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button className="rounded-xl gradient-emerald text-white gap-1.5 cursor-pointer" onClick={() => setRevenueOpen(true)}>
          <Plus className="h-4 w-4" /> Add Revenue
        </Button>
        <Button className="rounded-xl gradient-gold text-[color:var(--gold-foreground)] gap-1.5 cursor-pointer" onClick={() => setExpenseOpen(true)}>
          <Minus className="h-4 w-4" /> Money Out
        </Button>
        <Button className="rounded-xl gradient-royal text-white gap-1.5 cursor-pointer" onClick={() => setTransferOpen(true)}>
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
                <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                    <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
                </div>
                No transactions found. Add revenue or record an expense to get started.
            </div>
        ) : (
            <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-card border-b border-border">
                        <tr>
                            <th className="px-4 py-3">Reference</th>
                            <th className="px-4 py-3">Venture</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {txs.map((tx: any) => (
                            <tr key={tx._id} className="border-b border-border bg-card/50">
                                <td className="px-4 py-3 font-medium">{tx.referenceNumber}</td>
                                <td className="px-4 py-3 text-xs font-semibold text-primary">{tx.venture?.name || "None"}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ₹{tx.type === 'Money In' ? 'bg-emerald/10 text-emerald' : tx.type === 'Money Out' ? 'bg-rose-500/10 text-rose-400' : 'bg-royal/10 text-royal'}`}>
                                        {tx.type}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground text-xs">{tx.category || "General"}</td>
                                <td className="px-4 py-3 font-semibold">₹{tx.amount.toLocaleString()}</td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </SectionCard>

      {/* Dialog for Add Revenue */}
      <Dialog open={revenueOpen} onOpenChange={setRevenueOpen}>
        <DialogContent className="max-w-md bg-background text-foreground border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add Revenue (Money In)</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record incoming client payments or funding.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRevenueSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="revVent">Venture</Label>
                <select
                  id="revVent"
                  value={revVenture}
                  onChange={(e) => setRevVenture(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                  required
                >
                  <option value="">Select Venture</option>
                  {ventures?.map((v: any) => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="revAmt">Amount (₹)</Label>
                <Input id="revAmt" type="number" value={revAmount} onChange={(e) => setRevAmount(e.target.value)} placeholder="1000" className="mt-1.5 rounded-xl border-border" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="revCat">Category</Label>
                <select
                  id="revCat"
                  value={revCategory}
                  onChange={(e) => setRevCategory(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="Client Payment">Client Payment</option>
                  <option value="Product Sales">Product Sales</option>
                  <option value="Investment">Investment</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="revMet">Method</Label>
                <select
                  id="revMet"
                  value={revMethod}
                  onChange={(e) => setRevMethod(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="revReas">Reason</Label>
              <Input id="revReas" value={revReason} onChange={(e) => setRevReason(e.target.value)} placeholder="Invoice #2026-01" className="mt-1.5 rounded-xl border-border" />
            </div>
            <div>
              <Label htmlFor="revDsc">Notes</Label>
              <Textarea id="revDsc" value={revDesc} onChange={(e) => setRevDesc(e.target.value)} className="mt-1.5 rounded-xl border-border" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setRevenueOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addRevenueMutation.isPending} className="rounded-xl gradient-emerald text-white">
                {addRevenueMutation.isPending ? "Recording..." : "Record Revenue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Record Expense */}
      <Dialog open={expenseOpen} onOpenChange={setExpenseOpen}>
        <DialogContent className="max-w-md bg-background text-foreground border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>Record Expense (Money Out)</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record business outflows, operating costs, or salary payouts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecordExpenseSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="expVent">Venture</Label>
                <select
                  id="expVent"
                  value={expVenture}
                  onChange={(e) => setExpVenture(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                  required
                >
                  <option value="">Select Venture</option>
                  {ventures?.map((v: any) => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="expAmt">Amount (₹)</Label>
                <Input id="expAmt" type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="500" className="mt-1.5 rounded-xl border-border" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="expCat">Category</Label>
                <select
                  id="expCat"
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="Operating Expense">Operating Expense</option>
                  <option value="Rent">Rent</option>
                  <option value="Salary">Salary</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <Label htmlFor="expMet">Method</Label>
                <select
                  id="expMet"
                  value={expMethod}
                  onChange={(e) => setExpMethod(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="UPI">UPI</option>
                  <option value="Cash">Cash</option>
                  <option value="Card">Card</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="expReas">Reason</Label>
              <Input id="expReas" value={expReason} onChange={(e) => setExpReason(e.target.value)} placeholder="Office Supplies" className="mt-1.5 rounded-xl border-border" />
            </div>
            <div>
              <Label htmlFor="expDsc">Notes</Label>
              <Textarea id="expDsc" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} className="mt-1.5 rounded-xl border-border" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setExpenseOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={recordExpenseMutation.isPending} className="rounded-xl gradient-gold text-[color:var(--gold-foreground)] font-semibold">
                {recordExpenseMutation.isPending ? "Recording..." : "Record Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Transfer Funds */}
      <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
        <DialogContent className="max-w-md bg-background text-foreground border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>Transfer Funds Between Ventures</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Move liquidity internally from one venture's wallet to another.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleTransferSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="trFrom">From Venture (Source)</Label>
                <select
                  id="trFrom"
                  value={fromVenture}
                  onChange={(e) => setFromVenture(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                  required
                >
                  <option value="">Select Venture</option>
                  {ventures?.map((v: any) => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="trTo">To Venture (Destination)</Label>
                <select
                  id="trTo"
                  value={toVenture}
                  onChange={(e) => setToVenture(e.target.value)}
                  className="w-full mt-1.5 h-10 px-3 rounded-xl border border-border bg-card text-sm text-foreground focus:outline-none"
                  required
                >
                  <option value="">Select Venture</option>
                  {ventures?.map((v: any) => (
                    <option key={v._id} value={v._id}>{v.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="trAmt">Amount (₹)</Label>
              <Input id="trAmt" type="number" value={trnAmount} onChange={(e) => setTrnAmount(e.target.value)} placeholder="5000" className="mt-1.5 rounded-xl border-border" required />
            </div>
            <div>
              <Label htmlFor="trReas">Reason</Label>
              <Input id="trReas" value={trnReason} onChange={(e) => setTrnReason(e.target.value)} placeholder="Liquidity balancing" className="mt-1.5 rounded-xl border-border" />
            </div>
            <div>
              <Label htmlFor="trDsc">Notes</Label>
              <Textarea id="trDsc" value={trnDesc} onChange={(e) => setTrnDesc(e.target.value)} className="mt-1.5 rounded-xl border-border" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => setTransferOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={transferMutation.isPending} className="rounded-xl gradient-royal text-white">
                {transferMutation.isPending ? "Transferring..." : "Transfer Funds"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Toaster />
    </PageContainer>
  );
}

