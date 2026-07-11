import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
import {
  PAYMENT_METHODS,
  VENTURES,
  EXPENSE_CATEGORIES,
  type PaymentMethod,
  type Transaction,
  type Venture,
} from "@/lib/finance-data";

type Mode = "in" | "out";

export function TransactionFormModal({
  open,
  onOpenChange,
  mode,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: Mode;
  onSubmit: (tx: Omit<Transaction, "id" | "status">) => void;
}) {
  const isIn = mode === "in";
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [username, setUsername] = useState("");
  const [venture, setVenture] = useState<Venture>(VENTURES[0]);
  const [method, setMethod] = useState<PaymentMethod>("Bank Transfer");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [remarks, setRemarks] = useState("");
  const [attachment, setAttachment] = useState<string>("");
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0]);

  useEffect(() => {
    if (!open) return;
    setAmount("");
    setReason("");
    setSource(isIn ? "Client Payment" : `${VENTURES[0]} Wallet`);
    setDestination(isIn ? `${VENTURES[0]} Wallet` : "Vendor Payment");
    setUsername("");
    setVenture(VENTURES[0]);
    setMethod("Bank Transfer");
    setReference("");
    setDate(new Date().toISOString().slice(0, 10));
    setRemarks("");
    setAttachment("");
    setCategory(EXPENSE_CATEGORIES[0]);
  }, [open, isIn]);

  useEffect(() => {
    if (!open) return;
    if (isIn) setDestination(`${venture} Wallet`);
    else setSource(`${venture} Wallet`);
  }, [venture, isIn, open]);

  function handleSave() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    onSubmit({
      date: new Date(date).toISOString(),
      type: isIn ? "Money In" : "Money Out",
      amount: amt,
      reason: reason || (isIn ? "Revenue" : "Expense"),
      source,
      destination,
      username: username || "Admin",
      venture,
      method,
      reference: reference || undefined,
      remarks: remarks || undefined,
      category: isIn ? undefined : category,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isIn ? "Add Revenue" : "Record Money Out"}</DialogTitle>
          <DialogDescription>
            {isIn ? "Record a new incoming transaction into a venture wallet." : "Record an outgoing payment from a venture wallet."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Amount">
            <Input type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Field>
          <Field label="Reason">
            <Input placeholder={isIn ? "e.g. Client retainer" : "e.g. Cloud services"} value={reason} onChange={(e) => setReason(e.target.value)} />
          </Field>
          <Field label={isIn ? "Source of Money" : "Source Wallet"}>
            <Input value={source} onChange={(e) => setSource(e.target.value)} />
          </Field>
          <Field label={isIn ? "Destination Wallet" : "Destination"}>
            <Input value={destination} onChange={(e) => setDestination(e.target.value)} />
          </Field>
          <Field label="Username">
            <Input placeholder="Recorded by" value={username} onChange={(e) => setUsername(e.target.value)} />
          </Field>
          <Field label="Select Venture">
            <Select value={venture} onValueChange={(v) => setVenture(v as Venture)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {VENTURES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Payment Method">
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          {!isIn && (
            <Field label="Expense Category">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
          )}
          <Field label="Reference Number">
            <Input placeholder="REF-XXXX" value={reference} onChange={(e) => setReference(e.target.value)} />
          </Field>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Remarks">
              <Textarea rows={2} placeholder="Optional notes" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </Field>
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs text-muted-foreground">Attachment</Label>
            <label className="mt-1 flex items-center gap-2 rounded-xl border border-dashed border-border bg-muted/30 px-3 py-4 text-sm text-muted-foreground cursor-pointer hover:bg-muted/50">
              <Upload className="h-4 w-4" />
              <span>{attachment || "Click to upload (UI only)"}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setAttachment(e.target.files?.[0]?.name ?? "")}
              />
            </label>
          </div>
        </div>

        <DialogFooter className="mt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            className={isIn ? "gradient-emerald text-white" : "gradient-gold text-[color:var(--gold-foreground)]"}
            onClick={handleSave}
          >
            {isIn ? "Save Revenue" : "Save Transaction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
