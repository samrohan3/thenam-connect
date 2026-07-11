import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VENTURES, type Transaction, type Venture } from "@/lib/finance-data";

export function TransferModal({
  open,
  onOpenChange,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (transfer: {
    from: Venture;
    to: Venture;
    amount: number;
    reason: string;
    username: string;
    reference?: string;
    date: string;
  }) => void;
}) {
  const [from, setFrom] = useState<Venture>(VENTURES[0]);
  const [to, setTo] = useState<Venture>(VENTURES[1]);
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [username, setUsername] = useState("");
  const [reference, setReference] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!open) return;
    setFrom(VENTURES[0]);
    setTo(VENTURES[1]);
    setAmount("");
    setReason("");
    setUsername("");
    setReference("");
    setDate(new Date().toISOString().slice(0, 10));
  }, [open]);

  function handleTransfer() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || from === to) return;
    onSubmit({
      from,
      to,
      amount: amt,
      reason: reason || "Inter-venture transfer",
      username: username || "Admin",
      reference: reference || undefined,
      date: new Date(date).toISOString(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Transfer Between Ventures</DialogTitle>
          <DialogDescription>Move funds from one venture wallet to another.</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">From Venture</Label>
            <Select value={from} onValueChange={(v) => setFrom(v as Venture)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{VENTURES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">To Venture</Label>
            <Select value={to} onValueChange={(v) => setTo(v as Venture)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>{VENTURES.map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Amount</Label>
            <Input className="mt-1" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Date</Label>
            <Input className="mt-1" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label className="text-xs text-muted-foreground">Reason</Label>
            <Input className="mt-1" placeholder="Purpose of transfer" value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Username</Label>
            <Input className="mt-1" placeholder="Initiated by" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Reference</Label>
            <Input className="mt-1" placeholder="TRF-XXXX" value={reference} onChange={(e) => setReference(e.target.value)} />
          </div>
        </div>

        {from === to && (
          <p className="text-xs text-destructive">From and To ventures must differ.</p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="gradient-royal text-white" onClick={handleTransfer} disabled={from === to}>
            Transfer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// helper: build the pair of linked transactions for a transfer
export function buildTransferPair(input: {
  from: Venture;
  to: Venture;
  amount: number;
  reason: string;
  username: string;
  reference?: string;
  date: string;
  idA: string;
  idB: string;
}): [Transaction, Transaction] {
  const ref = input.reference || `TRF-${Date.now().toString().slice(-6)}`;
  const outTx: Transaction = {
    id: input.idA,
    date: input.date,
    type: "Transfer",
    amount: input.amount,
    reason: input.reason,
    source: `${input.from} Wallet`,
    destination: `${input.to} Wallet`,
    username: input.username,
    venture: input.from,
    method: "Bank Transfer",
    status: "Completed",
    reference: ref,
    remarks: "Transfer out",
  };
  const inTx: Transaction = {
    ...outTx,
    id: input.idB,
    venture: input.to,
    remarks: "Transfer in",
  };
  return [outTx, inTx];
}
