import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightLeft, Minus, Plus, AlertTriangle, Loader2 } from "lucide-react";
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

import { useFinanceSummary, useTransactions, useAddRevenue, useRecordExpense, useTransferFunds, useVentures, useUpdateTransaction, useDirectRevertTransaction, useCreateRevertRequest } from "@/lib/api-hooks";
import { useAuthStore } from "@/store/authStore";
import api from "@/lib/api";
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
  const directRevertMutation = useDirectRevertTransaction();
  const requestRevertMutation = useCreateRevertRequest();
  const isAdmin = role === "admin" || role === "founder";

  // Modal Open States
  const [revenueOpen, setRevenueOpen] = useState(false);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  // Revert states
  const [revertingTx, setRevertingTx] = useState<any>(null);
  const [revertReason, setRevertReason] = useState("");
  const [revertConfirmOpen, setRevertConfirmOpen] = useState(false);

  // Validation state
  const [showRevErrors, setShowRevErrors] = useState(false);
  const [showExpErrors, setShowExpErrors] = useState(false);

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
    setShowRevErrors(false);
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
    setShowExpErrors(false);
  };

  const hasUnsavedRevenueData = () => {
    return !!(revVenture || revAmount || revClientName || revReason || revProof || revProofImage || revDesc);
  };

  const handleRevenueCloseRequest = (open: boolean) => {
    if (!open) {
      if (hasUnsavedRevenueData()) {
        const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
        if (!confirmClose) return;
      }
      setRevenueOpen(false);
      setEditingTx(null);
      resetRevenueForm();
    }
  };

  const hasUnsavedExpenseData = () => {
    return !!(expVenture || expAmount || expClientName || expReason || expProof || expProofImage || expDesc);
  };

  const handleExpenseCloseRequest = (open: boolean) => {
    if (!open) {
      if (hasUnsavedExpenseData()) {
        const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to discard them?");
        if (!confirmClose) return;
      }
      setExpenseOpen(false);
      setEditingTx(null);
      resetExpenseForm();
    }
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

  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setUrl: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFile(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await api.post("/upload/single", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        const url = res.data.data.url;
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        const hostUrl = apiBase.replace('/api', '');
        setUrl(`${hostUrl}${url}`);
        toast.success("File uploaded successfully");
      } catch (err) {
        console.error(err);
        toast.error("Failed to upload file to backend");
      } finally {
        setUploadingFile(false);
      }
    }
  };

  const handleAddRevenueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowRevErrors(true);
    if (!revVenture || !revAmount || Number(revAmount) <= 0) {
      toast.error("Please resolve the validation errors first.");
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
    setShowExpErrors(true);
    if (!expVenture || !expAmount || Number(expAmount) <= 0) {
      toast.error("Please resolve the validation errors first.");
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
                    <td className="px-4 py-3 text-right flex items-center justify-end gap-2.5 h-12">
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
                      {tx.status !== 'Cancelled' && (
                        <>
                          <span className="text-muted-foreground/30">|</span>
                          <button
                            onClick={() => {
                              setRevertingTx(tx);
                              setRevertReason("");
                              setRevertConfirmOpen(true);
                            }}
                            className="text-xs text-rose-500 hover:underline cursor-pointer bg-transparent border-0 p-0 font-medium"
                          >
                            Revert
                          </button>
                        </>
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
      <Dialog open={revenueOpen} onOpenChange={handleRevenueCloseRequest}>
        <DialogContent className="max-w-3xl bg-background text-foreground border-border rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>{editingTx ? "Edit Revenue" : "Add Revenue (Money In)"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record incoming client payments or funding.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRevenueSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="revVent" className="text-xs font-semibold">Venture <span className="text-rose-500">*</span></Label>
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
                {showRevErrors && !revVenture && (
                  <p className="text-[10px] text-rose-500 mt-1">Venture selection is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="revAmt" className="text-xs font-semibold">Amount (₹) <span className="text-rose-500">*</span></Label>
                <Input
                  id="revAmt"
                  type="number"
                  value={revAmount}
                  onChange={(e) => setRevAmount(e.target.value)}
                  placeholder="1000"
                  className="mt-1.5 rounded-xl border-border h-10"
                  required
                />
                {showRevErrors && (!revAmount || Number(revAmount) <= 0) ? (
                  <p className="text-[10px] text-rose-500 mt-1">Amount must be greater than 0</p>
                ) : (
                  Number(revAmount) > 0 && (
                    <p className="text-[10px] text-emerald-500 mt-1">Formatted: ₹{Number(revAmount).toLocaleString()}</p>
                  )
                )}
              </div>

              <div>
                <Label htmlFor="revCat" className="text-xs font-semibold">Category</Label>
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
                <Label htmlFor="revMet" className="text-xs font-semibold">Method</Label>
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

            <div className="space-y-4">
              <div>
                <Label htmlFor="revClient" className="text-xs font-semibold">Client Name</Label>
                <Input id="revClient" value={revClientName} onChange={(e) => setRevClientName(e.target.value)} placeholder="Acme Corp / John Doe" className="mt-1.5 rounded-xl border-border h-10" />
              </div>
              <div>
                <Label htmlFor="revReas" className="text-xs font-semibold">Reason</Label>
                <Input id="revReas" value={revReason} onChange={(e) => setRevReason(e.target.value)} placeholder="Invoice #2026-01" className="mt-1.5 rounded-xl border-border h-10" />
              </div>
              <div>
                <Label htmlFor="revProof" className="text-xs font-semibold">Proof of Amount / Note</Label>
                <Input id="revProof" value={revProof} onChange={(e) => setRevProof(e.target.value)} placeholder="Receipt / Bank Reference No." className="mt-1.5 rounded-xl border-border h-10" />
              </div>
              <div>
                <Label htmlFor="revProofImg" className="text-xs font-semibold">Proof Image Upload</Label>
                <div className="mt-1.5 flex items-center gap-4">
                  <Input
                    id="revProofImg"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setRevProofImage)}
                    disabled={uploadingFile}
                    className="rounded-xl border-border file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary/20 file:text-primary cursor-pointer flex-1 h-10"
                  />
                  {uploadingFile && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium shrink-0 animate-pulse">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Uploading...
                    </div>
                  )}
                </div>
                {revProofImage && (
                  <div className="mt-3 relative w-32 h-20 group border border-border/80 rounded-xl overflow-hidden shadow-sm">
                    <img src={revProofImage} alt="Proof preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setRevProofImage("")}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white text-[10px] transition-colors"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="revDsc" className="text-xs font-semibold">Notes</Label>
                <Textarea id="revDsc" value={revDesc} onChange={(e) => setRevDesc(e.target.value)} className="mt-1.5 rounded-xl border-border min-h-[80px]" />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/40 gap-2">
              <Button type="button" variant="ghost" className="rounded-xl h-10" onClick={() => handleRevenueCloseRequest(false)}>Cancel</Button>
              <Button type="submit" disabled={uploadingFile || addRevenueMutation.isPending || updateTxMutation.isPending} className="rounded-xl h-10 gradient-emerald text-white font-semibold shadow px-5">
                {addRevenueMutation.isPending || updateTxMutation.isPending ? "Saving..." : editingTx ? "Save Changes" : "Record Revenue"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Record Expense */}
      <Dialog open={expenseOpen} onOpenChange={handleExpenseCloseRequest}>
        <DialogContent className="max-w-3xl bg-background text-foreground border-border rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>{editingTx ? "Edit Expense" : "Record Expense (Money Out)"}</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Record business outflows, operating costs, or salary payouts.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRecordExpenseSubmit} className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expVent" className="text-xs font-semibold">Venture <span className="text-rose-500">*</span></Label>
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
                {showExpErrors && !expVenture && (
                  <p className="text-[10px] text-rose-500 mt-1">Venture selection is required</p>
                )}
              </div>
              <div>
                <Label htmlFor="expAmt" className="text-xs font-semibold">Amount (₹) <span className="text-rose-500">*</span></Label>
                <Input
                  id="expAmt"
                  type="number"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="500"
                  className="mt-1.5 rounded-xl border-border h-10"
                  required
                />
                {showExpErrors && (!expAmount || Number(expAmount) <= 0) ? (
                  <p className="text-[10px] text-rose-500 mt-1">Amount must be greater than 0</p>
                ) : (
                  Number(expAmount) > 0 && (
                    <p className="text-[10px] text-rose-500 mt-1">Formatted: ₹{Number(expAmount).toLocaleString()}</p>
                  )
                )}
              </div>

              <div>
                <Label htmlFor="expCat" className="text-xs font-semibold">Category</Label>
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
                <Label htmlFor="expMet" className="text-xs font-semibold">Method</Label>
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

            <div className="space-y-4">
              <div>
                <Label htmlFor="expClient" className="text-xs font-semibold">Client / Vendor Name</Label>
                <Input id="expClient" value={expClientName} onChange={(e) => setExpClientName(e.target.value)} placeholder="Vendor / Service Provider" className="mt-1.5 rounded-xl border-border h-10" />
              </div>
              <div>
                <Label htmlFor="expReas" className="text-xs font-semibold">Reason</Label>
                <Input id="expReas" value={expReason} onChange={(e) => setExpReason(e.target.value)} placeholder="Office Supplies" className="mt-1.5 rounded-xl border-border h-10" />
              </div>
              <div>
                <Label htmlFor="expProof" className="text-xs font-semibold">Proof of Amount / Note</Label>
                <Input id="expProof" value={expProof} onChange={(e) => setExpProof(e.target.value)} placeholder="Invoice / Bill Reference No." className="mt-1.5 rounded-xl border-border h-10" />
              </div>
              <div>
                <Label htmlFor="expProofImg" className="text-xs font-semibold">Proof Image Upload</Label>
                <div className="mt-1.5 flex items-center gap-4">
                  <Input
                    id="expProofImg"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setExpProofImage)}
                    disabled={uploadingFile}
                    className="rounded-xl border-border file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-primary/20 file:text-primary cursor-pointer flex-1 h-10"
                  />
                  {uploadingFile && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium shrink-0 animate-pulse">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Uploading...
                    </div>
                  )}
                </div>
                {expProofImage && (
                  <div className="mt-3 relative w-32 h-20 group border border-border/80 rounded-xl overflow-hidden shadow-sm">
                    <img src={expProofImage} alt="Proof preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setExpProofImage("")}
                      className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white text-[10px] transition-colors"
                      title="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="expDsc" className="text-xs font-semibold">Notes</Label>
                <Textarea id="expDsc" value={expDesc} onChange={(e) => setExpDesc(e.target.value)} className="mt-1.5 rounded-xl border-border min-h-[80px]" />
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/40 gap-2">
              <Button type="button" variant="ghost" className="rounded-xl h-10" onClick={() => handleExpenseCloseRequest(false)}>Cancel</Button>
              <Button type="submit" disabled={uploadingFile || recordExpenseMutation.isPending || updateTxMutation.isPending} className="rounded-xl h-10 gradient-gold text-[color:var(--gold-foreground)] font-semibold shadow px-5">
                {recordExpenseMutation.isPending || updateTxMutation.isPending ? "Saving..." : editingTx ? "Save Changes" : "Record Expense"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog for Reverting Transaction */}
      <Dialog open={revertConfirmOpen} onOpenChange={setRevertConfirmOpen}>
        <DialogContent className="max-w-md bg-background text-foreground border-border rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle>Confirm Transaction Reversion</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isAdmin 
                ? "This will cancel the transaction and immediately update account balances." 
                : "This will submit a revert request to the Admin for approval."}
            </DialogDescription>
          </DialogHeader>
          {revertingTx && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-muted/50 border border-border/60 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reference:</span>
                  <span className="font-bold font-mono">{revertingTx.referenceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className={`font-semibold ${revertingTx.type === 'Money In' ? 'text-emerald-500' : 'text-rose-500'}`}>{revertingTx.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-bold">₹{revertingTx.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Venture:</span>
                  <span className="font-semibold text-primary">{revertingTx.venture?.name || "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{revertingTx.category || "General"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span>{new Date(revertingTx.date).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Warning Alert */}
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl flex items-start gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <span className="font-bold">WARNING:</span> This operation will alter financial records. The transaction status will be marked as Cancelled, and the venture wallet balances will be recalculated.
                </div>
              </div>

              {/* Reason Input */}
              <div className="space-y-1.5">
                <Label htmlFor="revertReason" className="text-xs font-semibold text-foreground/90">Reason for Reverting <span className="text-rose-500">*</span></Label>
                <Input
                  id="revertReason"
                  placeholder="Enter specific reason for reversion..."
                  value={revertReason}
                  onChange={(e) => setRevertReason(e.target.value)}
                  className="rounded-xl border-border text-sm"
                  required
                />
              </div>

              <DialogFooter className="pt-2 gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="rounded-xl h-10 text-xs font-semibold" 
                  onClick={() => { setRevertConfirmOpen(false); setRevertingTx(null); }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="rounded-xl h-10 text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700"
                  disabled={!revertReason.trim() || directRevertMutation.isPending || requestRevertMutation.isPending}
                  onClick={() => {
                    const payload = { id: revertingTx._id, reason: revertReason };
                    if (isAdmin) {
                      directRevertMutation.mutate(payload, {
                        onSuccess: () => {
                          toast.success("Transaction reverted successfully.");
                          setRevertConfirmOpen(false);
                          setRevertingTx(null);
                        },
                        onError: (err: any) => {
                          toast.error(err.response?.data?.message || "Failed to revert transaction.");
                        }
                      });
                    } else {
                      requestRevertMutation.mutate(payload, {
                        onSuccess: () => {
                          toast.success("Revert request sent to Admin.");
                          setRevertConfirmOpen(false);
                          setRevertingTx(null);
                        },
                        onError: (err: any) => {
                          toast.error(err.response?.data?.message || "Failed to send revert request.");
                        }
                      });
                    }
                  }}
                >
                  {directRevertMutation.isPending || requestRevertMutation.isPending 
                    ? "Processing..." 
                    : isAdmin 
                    ? "Confirm Revert" 
                    : "Submit Revert Request"}
                </Button>
              </DialogFooter>
            </div>
          )}
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
