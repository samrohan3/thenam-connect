// Mock finance data + helpers. Replace service functions with API calls later.

export type TxType = "Money In" | "Money Out" | "Transfer";
export type TxStatus = "Completed" | "Pending" | "Cancelled";
export type PaymentMethod = "Cash" | "UPI" | "Bank Transfer" | "Card" | "Cheque";

export const VENTURES = [
  "Thenam Software Solutions",
  "PaperHeros",
  "PrintKada",
  "Zaymazone",
] as const;
export type Venture = (typeof VENTURES)[number];

export const PAYMENT_METHODS: PaymentMethod[] = ["Cash", "UPI", "Bank Transfer", "Card", "Cheque"];

export const EXPENSE_CATEGORIES = [
  "Payroll",
  "Operations",
  "Marketing",
  "Tools & SaaS",
  "Travel",
  "Utilities",
  "Other",
] as const;

export interface Transaction {
  id: string;
  date: string; // ISO
  type: TxType;
  amount: number;
  reason: string;
  source: string;
  destination: string;
  username: string;
  venture: Venture;
  method: PaymentMethod;
  status: TxStatus;
  reference?: string;
  remarks?: string;
  category?: string;
}

const USERS = ["Aarav Sharma", "Isha Patel", "Rohan Khan", "Priya Iyer", "Kabir Menon", "Neha Reddy", "Vikram Kapoor"];
const REVENUE_REASONS = ["Client Retainer", "Product Sale", "Subscription", "Consulting", "Licensing"];
const EXPENSE_REASONS = ["Payroll", "Cloud Services", "Office Rent", "Marketing Campaign", "Software Subscriptions", "Travel", "Utilities"];
const SOURCES_IN = ["Client Payment", "Retail Sale", "Bank Deposit", "Stripe Payout"];
const DESTINATIONS_OUT = ["Vendor Payment", "Payroll Account", "Utility Provider", "SaaS Vendor"];

function pick<T>(arr: readonly T[], i: number): T {
  return arr[i % arr.length];
}

function pad(n: number, w = 3) {
  return String(n).padStart(w, "0");
}

function daysAgoISO(days: number, seed: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(9 + (seed % 10), (seed * 7) % 60, 0, 0);
  return d.toISOString();
}

function generate(): Transaction[] {
  const txs: Transaction[] = [];
  let n = 1;

  for (let i = 0; i < 22; i++) {
    const venture = pick(VENTURES, i * 3 + 1);
    const amt = 4000 + ((i * 1373) % 42000);
    txs.push({
      id: `TX-${pad(1000 + n++)}`,
      date: daysAgoISO(i % 28, i + 1),
      type: "Money In",
      amount: Math.round(amt),
      reason: pick(REVENUE_REASONS, i),
      source: pick(SOURCES_IN, i),
      destination: `${venture} Wallet`,
      username: pick(USERS, i),
      venture,
      method: pick(PAYMENT_METHODS, i),
      status: i % 11 === 0 ? "Pending" : "Completed",
      reference: `REF-${1000 + i}`,
    });
  }

  for (let i = 0; i < 14; i++) {
    const venture = pick(VENTURES, i * 2);
    const category = pick(EXPENSE_CATEGORIES, i);
    const amt = 800 + ((i * 941) % 18000);
    txs.push({
      id: `TX-${pad(1000 + n++)}`,
      date: daysAgoISO(i % 28, i + 4),
      type: "Money Out",
      amount: Math.round(amt),
      reason: pick(EXPENSE_REASONS, i),
      source: `${venture} Wallet`,
      destination: pick(DESTINATIONS_OUT, i),
      username: pick(USERS, i + 2),
      venture,
      method: pick(PAYMENT_METHODS, i + 1),
      status: i % 9 === 0 ? "Pending" : i % 13 === 0 ? "Cancelled" : "Completed",
      reference: `REF-${2000 + i}`,
      category,
    });
  }

  for (let i = 0; i < 6; i++) {
    const from = pick(VENTURES, i);
    const to = pick(VENTURES, i + 1);
    const amt = 5000 + ((i * 2137) % 30000);
    const ref = `TRF-${3000 + i}`;
    txs.push({
      id: `TX-${pad(1000 + n++)}`,
      date: daysAgoISO(i * 2, i + 6),
      type: "Transfer",
      amount: Math.round(amt),
      reason: "Inter-venture transfer",
      source: `${from} Wallet`,
      destination: `${to} Wallet`,
      username: pick(USERS, i + 1),
      venture: from,
      method: "Bank Transfer",
      status: "Completed",
      reference: ref,
    });
  }

  return txs.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export const initialTransactions: Transaction[] = generate();

// ---- Service placeholders (swap for real API calls later) ----
export const financeService = {
  async listTransactions(): Promise<Transaction[]> {
    return initialTransactions;
  },
  async createTransaction(tx: Transaction): Promise<Transaction> {
    return tx;
  },
  async updateTransaction(tx: Transaction): Promise<Transaction> {
    return tx;
  },
  async deleteTransaction(id: string): Promise<{ id: string }> {
    return { id };
  },
};

// ---- Derived helpers ----
export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function computeSummary(txs: Transaction[], now = new Date()) {
  let walletBalance = 0;
  let inToday = 0;
  let outToday = 0;
  let inMonth = 0;
  let outMonth = 0;
  let inYesterday = 0;
  let outYesterday = 0;
  const y = new Date(now);
  y.setDate(now.getDate() - 1);

  const ventureRevenue: Record<string, number> = {};
  const categoryExpense: Record<string, number> = {};

  for (const t of txs) {
    if (t.status !== "Completed") continue;
    const d = new Date(t.date);
    if (t.type === "Money In") {
      walletBalance += t.amount;
      ventureRevenue[t.venture] = (ventureRevenue[t.venture] || 0) + t.amount;
      if (isSameDay(d, now)) inToday += t.amount;
      if (isSameDay(d, y)) inYesterday += t.amount;
      if (isSameMonth(d, now)) inMonth += t.amount;
    } else if (t.type === "Money Out") {
      walletBalance -= t.amount;
      const c = t.category || "Other";
      categoryExpense[c] = (categoryExpense[c] || 0) + t.amount;
      if (isSameDay(d, now)) outToday += t.amount;
      if (isSameDay(d, y)) outYesterday += t.amount;
      if (isSameMonth(d, now)) outMonth += t.amount;
    }
    // Transfers are wallet-internal; ignore for balance/profit.
  }

  const topVenture =
    Object.entries(ventureRevenue).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const topCategory =
    Object.entries(categoryExpense).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const txThisMonth = txs.filter((t) => isSameMonth(new Date(t.date), now)).length;

  return {
    walletBalance,
    inToday,
    outToday,
    netToday: inToday - outToday,
    todayChange: inToday - outToday,
    yesterdayNet: inYesterday - outYesterday,
    monthProfit: inMonth - outMonth,
    inMonth,
    outMonth,
    ventureRevenue,
    categoryExpense,
    topVenture,
    topCategory,
    txThisMonth,
  };
}

export function monthlySeries(txs: Transaction[]) {
  const map = new Map<string, { month: string; revenue: number; expense: number }>();
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    map.set(key, {
      month: d.toLocaleDateString("en-US", { month: "short" }),
      revenue: 0,
      expense: 0,
    });
  }
  for (const t of txs) {
    if (t.status !== "Completed") continue;
    const d = new Date(t.date);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const row = map.get(key);
    if (!row) continue;
    if (t.type === "Money In") row.revenue += t.amount;
    else if (t.type === "Money Out") row.expense += t.amount;
  }
  return Array.from(map.values()).map((r) => ({ ...r, profit: r.revenue - r.expense }));
}

export function dailyCashFlow(txs: Transaction[], days = 30) {
  const rows: { day: string; cash: number; net: number }[] = [];
  const now = new Date();
  let cash = 0;
  const buckets = new Map<string, { day: string; in: number; out: number }>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.set(key, { day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }), in: 0, out: 0 });
  }
  for (const t of txs) {
    if (t.status !== "Completed") continue;
    const key = t.date.slice(0, 10);
    const b = buckets.get(key);
    if (!b) continue;
    if (t.type === "Money In") b.in += t.amount;
    else if (t.type === "Money Out") b.out += t.amount;
  }
  for (const b of buckets.values()) {
    const net = b.in - b.out;
    cash += net;
    rows.push({ day: b.day, cash, net });
  }
  return rows;
}

export function newTransactionId(existing: Transaction[]) {
  const max = existing.reduce((m, t) => {
    const n = parseInt(t.id.replace(/\D/g, ""), 10);
    return isNaN(n) ? m : Math.max(m, n);
  }, 1000);
  return `TX-${max + 1}`;
}
