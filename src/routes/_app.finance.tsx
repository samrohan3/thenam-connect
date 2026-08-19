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

import { useFinanceSummary, useTransactions, useAddRevenue, useRecordExpense, useTransferFunds, useVentures, useUpdateTransaction } from "@/lib/api-hooks";
import { useAuthStore } from "@/store/authStore";
import { InvoicePreviewModal } from "@/components/finance/InvoicePreviewModal";
import { canAccessRoute, hasPermission, normalizeRole } from "@/lib/permissions";
import { AccessDenied } from "@/components/rbac/AccessDenied";
import { RoleGuard } from "@/components/rbac/RoleGuard";

export const Route = createFileRoute("/_app/finance")({
  head: () => ({ meta: [{ title: "Finance — Thenam ERP" }] }),
  component: FinancePage,
});

function FinancePage() {
  const { user } = useAuthStore();

  // Route Protection Check
  if (!canAccessRoute(user?.role, "/finance")) {
    return <AccessDenied resource="Finance" />;
  }

  const role = normalizeRole(user?.role);
  const isCustomer = false; // Legacy check removed

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

  // Preview & Edit states
  const [selectedPreviewTx, setSelectedPreviewTx] = useState<any>(null);
  const [editingTx, setEditingTx] = useState<any>(null);
  const updateTxMutation = useUpdateTransaction();

  // Reset helper functions
  const resetRevenueForm = () => {
    setRevVenture("");
    setRevAmount("");
    setRevCategory("Client Payment");
    setRevReason("");
    setRevMethod("Bank Transfer");
    setRevDesc("");
    setRevClientName("");
    setRevProof("");
    setRevProofImage("");
  };

  const resetExpenseForm = () => {
    setExpVenture("");
    setExpAmount("");
    setExpCategory("Operating Expense");
    setExpReason("");
    setExpMethod("Bank Transfer");
    setExpDesc("");
    setExpClientName("");
    setExpProof("");
    setExpProofImage("");
  };

  const handleStartEdit = (tx: any) => {
    setEditingTx(tx);
    setSelectedPreviewTx(null);
    if (tx.type === "Money In") {
      setRevVenture(tx.venture?._id || tx.venture || "");
      setRevAmount(tx.amount.toString());
      setRevCategory(tx.category || "Client Payment");
      setRevReason(tx.reason || "");
      setRevMethod(tx.paymentMethod || "Bank Transfer");
      setRevDesc(tx.description || "");
      setRevClientName(tx.clientName || "");
      setRevProof(tx.proof || "");
      setRevProofImage(tx.proofImage || "");
      setRevenueOpen(true);
    } else if (tx.type === "Money Out") {
      setExpVenture(tx.venture?._id || tx.venture || "");
      setExpAmount(tx.amount.toString());
      setExpCategory(tx.category || "Operating Expense");
      setExpReason(tx.reason || "");
      setExpMethod(tx.paymentMethod || "Bank Transfer");
      setExpDesc(tx.description || "");
      setExpClientName(tx.clientName || "");
      setExpProof(tx.proof || "");
      setExpProofImage(tx.proofImage || "");
      setExpenseOpen(true);
    }
  };

  // Revenue Form
  const [revVenture, setRevVenture] = useState("");
  const [revAmount, setRevAmount] = useState("");
  const [revCategory, setRevCategory] = useState("Client Payment");
  const [revReason, setRevReason] = useState("");
  const [revMethod, setRevMethod] = useState("Bank Transfer");
  const [revDesc, setRevDesc] = useState("");
  const [revClientName, setRevClientName] = useState("");
  const [revProof, setRevProof] = useState("");
  const [revProofImage, setRevProofImage] = useState("");

  // Expense Form
  const [expVenture, setExpVenture] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState("Operating Expense");
  const [expReason, setExpReason] = useState("");
  const [expMethod, setExpMethod] = useState("Bank Transfer");
  const [expDesc, setExpDesc] = useState("");
  const [expClientName, setExpClientName] = useState("");
  const [expProof, setExpProof] = useState("");
  const [expProofImage, setExpProofImage] = useState("");

  // Transfer Form
  const [fromVenture, setFromVenture] = useState("");
  const [toVenture, setToVenture] = useState("");
  const [trnAmount, setTrnAmount] = useState("");
  const [trnReason, setTrnReason] = useState("Inter-venture transfer");
  const [trnDesc, setTrnDesc] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setBase64: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddRevenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!revVenture || !revAmount) {
      toast.error("Venture and Amount are required.");
      return;
    }
    const payload = {
      venture: revVenture,
      amount: Number(revAmount),
      category: revCategory,
      reason: revReason,
      paymentMethod: revMethod,
      description: revDesc,
      clientName: revClientName,
      proof: revProof,
      proofImage: revProofImage
    };

    if (editingTx) {
      updateTxMutation.mutate({
        id: editingTx._id,
        ...payload
      }, {
        onSuccess: () => {
          toast.success("Revenue updated successfully");
          setRevenueOpen(false);
          setEditingTx(null);
          resetRevenueForm();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to update revenue");
        }
      });
    } else {
      addRevenueMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Revenue recorded successfully");
          setRevenueOpen(false);
          resetRevenueForm();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to record revenue");
        }
      });
    }
  };

  const handleRecordExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expVenture || !expAmount) {
      toast.error("Venture and Amount are required.");
      return;
    }
    const payload = {
      venture: expVenture,
      amount: Number(expAmount),
      category: expCategory,
      reason: expReason,
      paymentMethod: expMethod,
      description: expDesc,
      clientName: expClientName,
      proof: expProof,
      proofImage: expProofImage
    };

    if (editingTx) {
      updateTxMutation.mutate({
        id: editingTx._id,
        ...payload
      }, {
        onSuccess: () => {
          toast.success("Expense updated successfully");
          setExpenseOpen(false);
          setEditingTx(null);
          resetExpenseForm();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to update expense");
        }
      });
    } else {
      recordExpenseMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Expense recorded successfully");
          setExpenseOpen(false);
          resetExpenseForm();
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to record expense");
        }
      });
    }
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

  const canCreate = hasPermission(user?.role, "finance", "create");

  return (
    <PageContainer>
      <PageHeader
        title={isCustomer ? "My Invoices & Payments" : "Finance"}
        subtitle={isCustomer ? "View your project invoices and billing statement." : "Wallets, money in and out, and inter-venture transfers across ventures."}
      />

      {!isCustomer && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <SectionCard title="Company Wallet" className="bg-card">
            <div className="text-3xl font-bold mt-2 text-foreground">
              ₹{isSummaryLoading ? "..." : (summary?.walletBalance ?? 0).toLocaleString()}
            </div>
          </SectionCard>
          <SectionCard title="Money In Today" className="bg-card">
            <div className="text-3xl font-bold mt-2 text-emerald-500 font-extrabold">
              ₹{isSummaryLoading ? "..." : (summary?.inToday ?? 0).toLocaleString()}
            </div>
          </SectionCard>
          <SectionCard title="Money Out Today" className="bg-card">
            <div className="text-3xl font-bold mt-2 text-rose-500 font-extrabold">
              ₹{isSummaryLoading ? "..." : (summary?.outToday ?? 0).toLocaleString()}
            </div>
          </SectionCard>
          <SectionCard title="Monthly Profit" className="bg-card">
            <div className="text-3xl font-bold mt-2 text-indigo-500 font-extrabold">
              ₹{isSummaryLoading ? "..." : (summary?.monthProfit ?? 0).toLocaleString()}
            </div>
          </SectionCard>
        </div>
      )}

      {canCreate && (
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
      )}

      <SectionCard
        title={isCustomer ? "Invoices & Receipts" : "Recent Transactions"}
        className="mt-8"
      >
        {isTxsLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading transactions...</div>
        ) : !txs || txs.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <div className="w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
            </div>
            {isCustomer ? "No invoices found for your account." : "No transactions found."}
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
                  <th className="px-4 py-3 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody>
                {txs.map((tx: any) => (
                  <tr key={tx._id} className="border-b border-border bg-card/50">
                    <td className="px-4 py-3 font-medium text-foreground">{tx.referenceNumber}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-primary">{tx.venture?.name || "None"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tx.type === 'Money In' ? 'bg-emerald-500/10 text-emerald-500' : tx.type === 'Money Out' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{tx.category || "General"}</td>
                    <td className="px-4 py-3 font-bold text-foreground">₹{tx.amount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      {(tx.type === 'Money In' || tx.type === 'Money Out' || tx.proofImage) ? (
                        <button
                          onClick={() => setSelectedPreviewTx(tx)}
                          className="text-xs text-blue-500 hover:underline cursor-pointer bg-transparent border-0 p-0"
                        >
                          Review Invoice
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Dialog for Add Revenue */}
      <Dialog open={revenueOpen} onOpenChange={(open) => { setRevenueOpen(open); if (!open) { setEditingTx(null); resetRevenueForm(); } }}>
        <DialogContent className="max-w-md bg-background text-foreground border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingTx ? "Edit Revenue" : "Add Revenue (Money In)"}</DialogTitle>
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
              <Label htmlFor="revClient">Client Name</Label>
              <Input id="revClient" value={revClientName} onChange={(e) => setRevClientName(e.target.value)} placeholder="Acme Corp / John Doe" className="mt-1.5 rounded-xl border-border" />
            </div>
            <div>
              <Label htmlFor="revReas">Reason</Label>
              <Input id="revReas" value={revReason} onChange={(e) => setRevReason(e.target.value)} placeholder="Invoice #2026-01" className="mt-1.5 rounded-xl border-border" />
            </div>
            <div>
              <Label htmlFor="revProof">Proof of Amount / Note</Label>
              <Input id="revProof" value={revProof} onChange={(e) => setRevProof(e.target.value)} placeholder="Receipt / Bank Reference No." className="mt-1.5 rounded-xl border-border" />
            </div>
            <div>
              <Label htmlFor="revProofImg">Proof Image Upload</Label>
              <Input id="revProofImg" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setRevProofImage)} className="mt-1.5 rounded-xl border-border file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary/20 file:text-primary cursor-pointer" />
              {revProofImage && (
                <img src={revProofImage} alt="Proof preview" className="mt-2 h-16 w-auto rounded-lg border border-border object-cover" />
              )}
            </div>
            <div>
              <Label htmlFor="revDsc">Notes</Label>
              <Textarea id="revDsc" value={revDesc} onChange={(e) => setRevDesc(e.target.value)} className="mt-1.5 rounded-xl border-border" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => { setRevenueOpen(false); setEditingTx(null); resetRevenueForm(); }}>Cancel</Button>
              <Button type="submit" disabled={addRevenueMutation.isPending || updateTxMutation.isPending} className="rounded-xl gradient-emerald text-white">
                {addRevenueMutation.isPending || updateTxMutation.isPending ? "Saving..." : editingTx ? "Save Changes" : "Record Revenue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Record Expense */}
      <Dialog open={expenseOpen} onOpenChange={(open) => { setExpenseOpen(open); if (!open) { setEditingTx(null); resetExpenseForm(); } }}>
        <DialogContent className="max-w-md bg-background text-foreground border-border rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingTx ? "Edit Expense" : "Record Expense (Money Out)"}</DialogTitle>
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
              <Label htmlFor="expClient">Client / Vendor Name</Label>
              <Input id="expClient" value={expClientName} onChange={(e) => setExpClientName(e.target.value)} placeholder="Vendor / Service Provider" className="mt-1.5 rounded-xl border-border" />
            </div>
            <div>
              <Label htmlFor="expReas">Reason</Label>
              <Input id="expReas" value={expReason} onChange={(e) => setExpReason(e.target.value)} placeholder="Office Supplies" className="mt-1.5 rounded-xl border-border" />
            </div>
            <div>
              <Label htmlFor="expProof">Proof of Amount / Note</Label>
              <Input id="expProof" value={expProof} onChange={(e) => setExpProof(e.target.value)} placeholder="Invoice / Bill Reference No." className="mt-1.5 rounded-xl border-border" />
            </div>
            <div>
              <Label htmlFor="expProofImg">Proof Image Upload</Label>
              <Input id="expProofImg" type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setExpProofImage)} className="mt-1.5 rounded-xl border-border file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary/20 file:text-primary cursor-pointer" />
              {expProofImage && (
                <img src={expProofImage} alt="Proof preview" className="mt-2 h-16 w-auto rounded-lg border border-border object-cover" />
              )}
            </div>
            <div>
              <Label htmlFor="expDsc">Notes</Label>
              <Textarea id="expDsc" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} className="mt-1.5 rounded-xl border-border" />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="ghost" className="rounded-xl" onClick={() => { setExpenseOpen(false); setEditingTx(null); resetExpenseForm(); }}>Cancel</Button>
              <Button type="submit" disabled={recordExpenseMutation.isPending || updateTxMutation.isPending} className="rounded-xl gradient-gold text-[color:var(--gold-foreground)] font-semibold">
                {recordExpenseMutation.isPending || updateTxMutation.isPending ? "Saving..." : editingTx ? "Save Changes" : "Record Expense"}
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
      <InvoicePreviewModal
        isOpen={selectedPreviewTx !== null}
        onClose={() => setSelectedPreviewTx(null)}
        transaction={selectedPreviewTx}
        onEdit={handleStartEdit}
      />
      <Toaster />
    </PageContainer>
  );
}
