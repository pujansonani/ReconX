import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Meter } from '../ui/Meter';
import { EmptyState } from '../ui/EmptyState';
import { Select } from '../ui/Field';
import {
  Building2,
  Split,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Receipt,
  Wallet,
  Radio,
  Landmark
} from 'lucide-react';

/* ------------------------------------------------------------------ *
 * Smart Collect+ · Virtual Account Auto-Allocation
 * ------------------------------------------------------------------ *
 * Razorpay Smart Collect credits a virtual account and stops at
 * "money landed". This console takes that same credit and reconciles
 * it against the merchant's OPEN RECEIVABLES — splitting lump sums,
 * applying partials (FIFO), parking overpayments as advances, and
 * refusing to force ambiguous matches (0 forced matches).
 *
 * Fully client-side: no backend endpoint required, mirroring the
 * other self-contained Sentinel simulators.
 * ------------------------------------------------------------------ */

type InvoiceStatus = 'OPEN' | 'PARTIAL' | 'PAID';

interface Invoice {
  id: string;
  amount: number;
  allocated: number;
  status: InvoiceStatus;
}

interface Customer {
  id: string;
  name: string;
  va: string;
  invoices: Invoice[];
}

type Rail = 'UPI' | 'IMPS' | 'NEFT' | 'RTGS';

type AllocTier =
  | 'EXACT'
  | 'REFERENCED'
  | 'LUMP_SUM'
  | 'OVERPAYMENT'
  | 'PARTIAL'
  | 'UNRESOLVED';

interface AllocationLine {
  invoiceId: string;
  amount: number;
}

interface Credit {
  utr: string;
  customerId: string | null;
  customerName: string;
  va: string;
  payerName: string;
  payerVpa: string;
  rail: Rail;
  amount: number;
  remark: string;
  tier: AllocTier;
  confidence: number;
  lines: AllocationLine[];
  advance: number;
  note: string;
}

type Scenario =
  | 'AUTO'
  | 'EXACT'
  | 'LUMP_SUM'
  | 'PARTIAL'
  | 'OVERPAYMENT'
  | 'AMBIGUOUS';

const SCENARIO_OPTIONS = [
  { value: 'AUTO', label: 'Auto · realistic mix' },
  { value: 'EXACT', label: 'Exact single-invoice match' },
  { value: 'LUMP_SUM', label: 'Lump sum across invoices' },
  { value: 'PARTIAL', label: 'Partial payment (FIFO)' },
  { value: 'OVERPAYMENT', label: 'Overpayment → advance' },
  { value: 'AMBIGUOUS', label: 'Ambiguous → held (0 forced)' }
];

const RAILS: Rail[] = ['UPI', 'IMPS', 'NEFT', 'RTGS'];

const PAYERS = [
  { name: 'Ananya Traders', vpa: 'ananya@okhdfcbank' },
  { name: 'Meridian Wholesale', vpa: 'meridian.pay@ybl' },
  { name: 'S. Krishnan', vpa: 'skrishnan@okaxis' },
  { name: 'Vertex Supplies LLP', vpa: 'vertex@icici' },
  { name: 'Global Mart Pvt Ltd', vpa: 'globalmart@okicici' }
];

/** Seed receivables ledger — round-ish INR amounts, some deliberate collisions. */
function seedCustomers(): Customer[] {
  return [
    {
      id: 'c1',
      name: 'Zappy Retail Pvt Ltd',
      va: 'RZRXVA0ZAPPY01',
      invoices: [
        { id: 'INV-4471', amount: 18500, allocated: 0, status: 'OPEN' },
        { id: 'INV-4472', amount: 12000, allocated: 0, status: 'OPEN' },
        { id: 'INV-4489', amount: 7250, allocated: 0, status: 'OPEN' }
      ]
    },
    {
      id: 'c2',
      name: 'Nimbus Logistics',
      va: 'RZRXVA0NIMBUS2',
      invoices: [
        { id: 'INV-2231', amount: 45000, allocated: 0, status: 'OPEN' },
        { id: 'INV-2240', amount: 9900, allocated: 0, status: 'OPEN' }
      ]
    },
    {
      id: 'c3',
      name: 'Kite Academy',
      va: 'RZRXVA0KITE003',
      // Two identical ₹5,000 invoices — a ₹5,000 credit is genuinely ambiguous.
      invoices: [
        { id: 'INV-0087', amount: 5000, allocated: 0, status: 'OPEN' },
        { id: 'INV-0091', amount: 5000, allocated: 0, status: 'OPEN' },
        { id: 'INV-0092', amount: 15300, allocated: 0, status: 'OPEN' }
      ]
    },
    {
      id: 'c4',
      name: 'Orbit Pharma',
      va: 'RZRXVA0ORBIT04',
      invoices: [
        { id: 'INV-7781', amount: 28750, allocated: 0, status: 'OPEN' },
        { id: 'INV-7799', amount: 3120, allocated: 0, status: 'OPEN' }
      ]
    }
  ];
}

const inr = (n: number) =>
  '₹' + Math.round(n).toLocaleString('en-IN');

const remaining = (inv: Invoice) => inv.amount - inv.allocated;
const isOpen = (inv: Invoice) => inv.status !== 'PAID';

function randOf<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeUtr(): string {
  let s = '';
  for (let i = 0; i < 12; i++) s += Math.floor(Math.random() * 10);
  return 'UTR' + s;
}

/** All non-empty subsets of open invoices whose remaining sums to `amount`. */
function matchingSubsets(open: Invoice[], amount: number): Invoice[][] {
  const matches: Invoice[][] = [];
  const n = open.length;
  for (let mask = 1; mask < 1 << n; mask++) {
    let sum = 0;
    const subset: Invoice[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        subset.push(open[i]);
        sum += remaining(open[i]);
      }
    }
    if (Math.abs(sum - amount) < 0.5) matches.push(subset);
  }
  // Prefer fewer invoices first (a cleaner allocation) when reporting.
  matches.sort((a, b) => a.length - b.length);
  return matches;
}

interface AllocationResult {
  tier: AllocTier;
  confidence: number;
  lines: AllocationLine[];
  advance: number;
  note: string;
  /** Invoice mutations to apply: id -> amount to add to `allocated`. */
  apply: Record<string, number>;
}

/**
 * Deterministic allocation cascade. The ambiguity branches (multiple exact
 * matches, multiple valid combinations, unknown payer) are escalated rather
 * than guessed — the "zero forced matches" guarantee.
 */
function allocate(customer: Customer | null, amount: number, remark: string): AllocationResult {
  if (!customer) {
    return {
      tier: 'UNRESOLVED',
      confidence: 0,
      lines: [],
      advance: 0,
      note: 'Payer virtual account is not linked to any receivable ledger. Held for manual review — not force-matched.',
      apply: {}
    };
  }

  const open = customer.invoices.filter(isOpen);

  if (open.length === 0) {
    return {
      tier: 'OVERPAYMENT',
      confidence: 90,
      lines: [],
      advance: amount,
      note: 'No open receivables for this customer — full amount parked as an unapplied advance / credit note.',
      apply: {}
    };
  }

  // 1) Remark references a specific open invoice, and the amount fits it.
  const referenced = open.find((inv) => remark.includes(inv.id));
  if (referenced && amount <= remaining(referenced) + 0.5) {
    return {
      tier: 'REFERENCED',
      confidence: 99,
      lines: [{ invoiceId: referenced.id, amount }],
      advance: 0,
      note: `Customer cited ${referenced.id} in the payment remark — applied directly (Razorpay never reads the remark).`,
      apply: { [referenced.id]: amount }
    };
  }

  // 2) Exact / lump-sum subset matches.
  const subsets = matchingSubsets(open, amount);
  if (subsets.length === 1) {
    const subset = subsets[0];
    const lines = subset.map((inv) => ({ invoiceId: inv.id, amount: remaining(inv) }));
    const apply: Record<string, number> = {};
    subset.forEach((inv) => (apply[inv.id] = remaining(inv)));
    if (subset.length === 1) {
      return {
        tier: 'EXACT',
        confidence: 100,
        lines,
        advance: 0,
        note: `Exact 1:1 match against ${subset[0].id}. Settled deterministically.`,
        apply
      };
    }
    return {
      tier: 'LUMP_SUM',
      confidence: 97,
      lines,
      advance: 0,
      note: `Single lump-sum credit decomposed across ${subset.length} open invoices — the split Smart Collect can't do.`,
      apply
    };
  }
  if (subsets.length > 1) {
    return {
      tier: 'UNRESOLVED',
      confidence: 0,
      lines: [],
      advance: 0,
      note: `${subsets.length} different invoice combinations satisfy ${inr(amount)}. Ambiguous — escalated instead of guessing (0 forced matches).`,
      apply: {}
    };
  }

  // 3) Overpayment — clears everything, remainder becomes an advance.
  const totalRemaining = open.reduce((s, inv) => s + remaining(inv), 0);
  if (amount > totalRemaining + 0.5) {
    const lines = open.map((inv) => ({ invoiceId: inv.id, amount: remaining(inv) }));
    const apply: Record<string, number> = {};
    open.forEach((inv) => (apply[inv.id] = remaining(inv)));
    return {
      tier: 'OVERPAYMENT',
      confidence: 93,
      lines,
      advance: amount - totalRemaining,
      note: `Cleared all ${open.length} open invoices; ${inr(amount - totalRemaining)} parked as an unapplied advance.`,
      apply
    };
  }

  // 4) Partial — FIFO application to the oldest invoices (a documented policy,
  //    not a forced identity guess).
  const lines: AllocationLine[] = [];
  const apply: Record<string, number> = {};
  let left = amount;
  for (const inv of open) {
    if (left <= 0.5) break;
    const take = Math.min(left, remaining(inv));
    lines.push({ invoiceId: inv.id, amount: take });
    apply[inv.id] = take;
    left -= take;
  }
  return {
    tier: 'PARTIAL',
    confidence: 78,
    lines,
    advance: 0,
    note: 'No exact match — applied FIFO to the oldest open invoice(s). Balance stays open and tracked.',
    apply
  };
}

/** Craft a credit that will exercise the requested scenario against the ledger. */
function craftCredit(customers: Customer[], scenario: Scenario): { customer: Customer | null; amount: number; remark: string } {
  const withOpen = customers.filter((c) => c.invoices.some(isOpen));
  const pickCustomer = () => (withOpen.length ? randOf(withOpen) : randOf(customers));

  if (scenario === 'AMBIGUOUS') {
    // 40% unknown payer, else an amount matching two invoices in one customer.
    if (Math.random() < 0.4 || !withOpen.length) {
      return { customer: null, amount: Math.round((3000 + Math.random() * 40000) / 10) * 10, remark: '' };
    }
    const kite = customers.find((c) => c.id === 'c3');
    const twins = kite?.invoices.filter((i) => isOpen(i) && Math.abs(remaining(i) - 5000) < 0.5) ?? [];
    if (twins.length >= 2) return { customer: kite!, amount: 5000, remark: '' };
    // Fallback: any customer with two equal open invoices.
    for (const c of withOpen) {
      const open = c.invoices.filter(isOpen);
      for (let i = 0; i < open.length; i++)
        for (let j = i + 1; j < open.length; j++)
          if (Math.abs(remaining(open[i]) - remaining(open[j])) < 0.5)
            return { customer: c, amount: remaining(open[i]), remark: '' };
    }
    return { customer: null, amount: 12345, remark: '' };
  }

  const customer = pickCustomer();
  const open = customer.invoices.filter(isOpen);

  if (scenario === 'EXACT' && open.length) {
    const inv = randOf(open);
    return { customer, amount: remaining(inv), remark: Math.random() < 0.5 ? inv.id : '' };
  }
  if (scenario === 'LUMP_SUM' && open.length >= 2) {
    const shuffled = [...open].sort(() => Math.random() - 0.5).slice(0, 2 + (Math.random() < 0.4 ? 1 : 0));
    return { customer, amount: shuffled.reduce((s, i) => s + remaining(i), 0), remark: '' };
  }
  if (scenario === 'PARTIAL' && open.length) {
    const inv = open[0];
    return { customer, amount: Math.round((remaining(inv) * (0.35 + Math.random() * 0.35)) / 10) * 10, remark: '' };
  }
  if (scenario === 'OVERPAYMENT' && open.length) {
    const total = open.reduce((s, i) => s + remaining(i), 0);
    return { customer, amount: total + Math.round((500 + Math.random() * 6000) / 10) * 10, remark: '' };
  }

  // AUTO — weighted realistic mix.
  const roll = Math.random();
  if (roll < 0.34 && open.length) {
    const inv = randOf(open);
    return { customer, amount: remaining(inv), remark: Math.random() < 0.4 ? inv.id : '' };
  }
  if (roll < 0.58 && open.length >= 2) {
    const shuffled = [...open].sort(() => Math.random() - 0.5).slice(0, 2);
    return { customer, amount: shuffled.reduce((s, i) => s + remaining(i), 0), remark: '' };
  }
  if (roll < 0.78 && open.length) {
    const inv = open[0];
    return { customer, amount: Math.round((remaining(inv) * (0.4 + Math.random() * 0.4)) / 10) * 10, remark: '' };
  }
  if (roll < 0.9 && open.length) {
    const total = open.reduce((s, i) => s + remaining(i), 0);
    return { customer, amount: total + Math.round((400 + Math.random() * 4000) / 10) * 10, remark: '' };
  }
  return { customer: Math.random() < 0.5 ? null : customer, amount: Math.round((2000 + Math.random() * 20000) / 10) * 10, remark: '' };
}

const TIER_META: Record<AllocTier, { label: string; variant: React.ComponentProps<typeof Badge>['variant']; icon: React.ReactNode }> = {
  EXACT: { label: 'Exact match', variant: 'success', icon: <CheckCircle2 className="size-3" /> },
  REFERENCED: { label: 'Remark-referenced', variant: 'blue', icon: <Receipt className="size-3" /> },
  LUMP_SUM: { label: 'Lump-sum split', variant: 'purple', icon: <Split className="size-3" /> },
  OVERPAYMENT: { label: 'Overpayment → advance', variant: 'warning', icon: <Wallet className="size-3" /> },
  PARTIAL: { label: 'Partial · FIFO', variant: 'warning', icon: <Split className="size-3" /> },
  UNRESOLVED: { label: 'Held · 0 forced', variant: 'danger', icon: <AlertTriangle className="size-3" /> }
};

const RAIL_TONE: Record<Rail, string> = {
  UPI: 'text-ok-text bg-ok-soft border-ok-line',
  IMPS: 'text-accent-text bg-accent-soft border-accent-soft-line',
  NEFT: 'text-info-text bg-info-soft border-info-line',
  RTGS: 'text-warn-text bg-warn-soft border-warn-line'
};

const StatTile: React.FC<{ label: string; value: string; sub?: string; tone?: 'fg' | 'ok' | 'warn' | 'danger' | 'accent' }> = ({
  label,
  value,
  sub,
  tone = 'fg'
}) => {
  const valueTone =
    tone === 'ok' ? 'text-ok-text' : tone === 'warn' ? 'text-warn-text' : tone === 'danger' ? 'text-danger-text' : tone === 'accent' ? 'text-accent-text' : 'text-fg';
  return (
    <div className="rounded-tile border border-line bg-surface p-3 shadow-e1">
      <span className="block text-[10px] font-bold uppercase tracking-wide text-fg-muted">{label}</span>
      <span className={`mono tabular-nums mt-1 block text-lg font-extrabold ${valueTone}`}>{value}</span>
      {sub && <span className="mt-0.5 block text-[10px] text-fg-faint">{sub}</span>}
    </div>
  );
};

export const SmartCollectAllocator: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);
  const [credits, setCredits] = useState<Credit[]>([]);
  const [scenario, setScenario] = useState<Scenario>('AUTO');
  const [autoPlay, setAutoPlay] = useState(false);

  // Keep a ref of latest ledger so the interval always allocates against fresh state.
  const customersRef = useRef(customers);
  customersRef.current = customers;

  const simulate = () => {
    const current = customersRef.current;
    const { customer, amount, remark } = craftCredit(current, scenario);
    const result = allocate(customer, amount, remark);
    const payer = randOf(PAYERS);

    if (Object.keys(result.apply).length > 0) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (customer && c.id !== customer.id) return c;
          return {
            ...c,
            invoices: c.invoices.map((inv) => {
              const add = result.apply[inv.id];
              if (!add) return inv;
              const allocated = inv.allocated + add;
              const status: InvoiceStatus = allocated >= inv.amount - 0.5 ? 'PAID' : allocated > 0 ? 'PARTIAL' : 'OPEN';
              return { ...inv, allocated, status };
            })
          };
        })
      );
    }

    const credit: Credit = {
      utr: makeUtr(),
      customerId: customer?.id ?? null,
      customerName: customer?.name ?? 'Unrecognised payer',
      va: customer?.va ?? 'RZRXVA0??????',
      payerName: payer.name,
      payerVpa: payer.vpa,
      rail: randOf(RAILS),
      amount,
      remark,
      tier: result.tier,
      confidence: result.confidence,
      lines: result.lines,
      advance: result.advance,
      note: result.note
    };
    setCredits((prev) => [credit, ...prev].slice(0, 40));
  };

  const reset = () => {
    setAutoPlay(false);
    setCustomers(seedCustomers());
    setCredits([]);
  };

  const allPaid = customers.every((c) => c.invoices.every((inv) => inv.status === 'PAID'));

  useEffect(() => {
    if (!autoPlay) return;
    if (allPaid) {
      setAutoPlay(false);
      return;
    }
    const id = setInterval(simulate, 2200);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, scenario, allPaid]);

  const stats = useMemo(() => {
    const received = credits.reduce((s, c) => s + c.amount, 0);
    const allocated = credits.reduce((s, c) => s + c.lines.reduce((t, l) => t + l.amount, 0), 0);
    const advances = credits.reduce((s, c) => s + c.advance, 0);
    const escalated = credits.filter((c) => c.tier === 'UNRESOLVED').length;
    const invoicesClosed = customers.reduce((s, c) => s + c.invoices.filter((i) => i.status === 'PAID').length, 0);
    const openRemaining = customers.reduce((s, c) => s + c.invoices.filter(isOpen).reduce((t, i) => t + remaining(i), 0), 0);
    const autoRate = received > 0 ? (allocated / received) * 100 : 0;
    return { received, allocated, advances, escalated, invoicesClosed, openRemaining, autoRate };
  }, [credits, customers]);

  const totalInvoices = customers.reduce((s, c) => s + c.invoices.length, 0);

  return (
    <div className="space-y-5">
      {/* Positioning banner — stable brand navy in both themes */}
      <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-brand-900 to-brand-800 p-5 text-white shadow-e3 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-tile bg-white/15 p-1.5">
                <Landmark className="size-5" />
              </span>
              <h2 className="text-lg font-bold">Smart Collect+ · Virtual Account Auto-Allocation</h2>
              <Badge variant="purple" className="border-white/20 bg-white/15 text-white">Beyond Razorpay Smart Collect</Badge>
            </div>
            <p className="max-w-2xl text-xs leading-relaxed text-brand-100/80">
              Razorpay Smart Collect credits a virtual account and stops at <em>“money landed.”</em> ReconX takes the
              same credit and reconciles it against your <strong>open receivables</strong> — decomposing lump sums,
              applying partials, parking overpayments as advances, and <strong>refusing to force ambiguous matches</strong>.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-semibold">
              <span className="rounded-full bg-white/10 px-2.5 py-1">Credit lands in VA</span>
              <ArrowRight className="size-3.5 text-brand-100/60" />
              <span className="rounded-full bg-white/10 px-2.5 py-1">ReconX allocates to invoices</span>
              <ArrowRight className="size-3.5 text-brand-100/60" />
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                <ShieldCheck className="size-3.5" /> Zero forced matches
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as Scenario)}
              options={SCENARIO_OPTIONS}
              className="w-full sm:w-64"
              aria-label="Incoming credit scenario"
            />
            <Button variant="primary" size="sm" onClick={simulate} icon={<Play className="size-3.5 fill-current" />}>
              Simulate incoming credit
            </Button>
            <Button
              variant={autoPlay ? 'accent-soft' : 'outline'}
              size="sm"
              onClick={() => setAutoPlay((v) => !v)}
              icon={autoPlay ? <Pause className="size-3.5" /> : <Radio className="size-3.5" />}
            >
              {autoPlay ? 'Pause live feed' : 'Auto-play live feed'}
            </Button>
          </div>
          <Button variant="ghost" size="sm" onClick={reset} icon={<RotateCcw className="size-3.5" />}>
            Reset ledger
          </Button>
        </div>
      </Card>

      {/* Metric row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StatTile label="Collected" value={inr(stats.allocated)} sub={`of ${inr(stats.received)} received`} tone="ok" />
        <StatTile label="Auto-allocated" value={`${stats.autoRate.toFixed(1)}%`} sub="credit → invoices" tone="accent" />
        <StatTile label="Invoices closed" value={`${stats.invoicesClosed}/${totalInvoices}`} sub="across all VAs" />
        <StatTile label="Open balance" value={inr(stats.openRemaining)} sub="still receivable" tone="warn" />
        <StatTile label="Advances" value={inr(stats.advances)} sub="unapplied credit" tone="warn" />
        <StatTile label="Escalated" value={`${stats.escalated}`} sub="held, 0 forced" tone="danger" />
      </div>

      <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-5">
        {/* Open Receivables Ledger */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-accent" />
              <h3 className="text-sm font-bold text-fg">Open Receivables Ledger</h3>
            </div>
            <Badge variant="blue">{customers.length} virtual accounts</Badge>
          </div>
          <div className="space-y-3">
            {customers.map((c) => {
              const total = c.invoices.reduce((s, i) => s + i.amount, 0);
              const collected = c.invoices.reduce((s, i) => s + i.allocated, 0);
              const pct = total > 0 ? (collected / total) * 100 : 0;
              return (
                <div key={c.id} className="rounded-tile border border-line bg-subtle p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold text-fg">{c.name}</div>
                      <div className="mono text-[10px] text-fg-faint">{c.va}</div>
                    </div>
                    <span className="num shrink-0 text-[11px] font-bold text-fg">{pct.toFixed(0)}%</span>
                  </div>
                  <Meter value={pct} tone={pct >= 100 ? 'ok' : pct > 0 ? 'accent' : 'neutral'} size="xs" className="mt-2" label={`${c.name} collected`} />
                  <div className="mt-2.5 space-y-1">
                    {c.invoices.map((inv) => (
                      <div key={inv.id} className="flex items-center justify-between text-[11px]">
                        <span className="mono text-fg-muted">{inv.id}</span>
                        <div className="flex items-center gap-2">
                          <span className="num text-fg-secondary">
                            {inr(inv.allocated)} / {inr(inv.amount)}
                          </span>
                          <StatusPill status={inv.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Live Credit Allocation Feed */}
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-accent" />
              <h3 className="text-sm font-bold text-fg">Live Credit Allocation Feed</h3>
            </div>
            <Badge variant={autoPlay ? 'success' : 'neutral'} dot pulse={autoPlay}>
              {autoPlay ? 'Streaming' : `${credits.length} processed`}
            </Badge>
          </div>

          {credits.length === 0 ? (
            <div className="p-5">
              <EmptyState
                icon={<Landmark className="size-6" />}
                title="No credits ingested yet"
                description="Simulate an incoming bank credit (UPI / IMPS / NEFT / RTGS) to a virtual account and watch ReconX allocate it across the customer's open invoices — the step Razorpay Smart Collect leaves to your finance team."
                action={
                  <Button variant="primary" size="sm" onClick={simulate} icon={<Play className="size-3.5 fill-current" />}>
                    Simulate incoming credit
                  </Button>
                }
                size="sm"
              />
            </div>
          ) : (
            <div className="max-h-[560px] space-y-2.5 overflow-y-auto p-4">
              <AnimatePresence initial={false}>
                {credits.map((c) => (
                  <motion.div
                    key={c.utr}
                    layout={!shouldReduceMotion}
                    initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <CreditRow credit={c} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

const StatusPill: React.FC<{ status: InvoiceStatus }> = ({ status }) => {
  const map: Record<InvoiceStatus, { label: string; cls: string }> = {
    OPEN: { label: 'Open', cls: 'bg-subtle text-fg-muted border-line' },
    PARTIAL: { label: 'Partial', cls: 'bg-warn-soft text-warn-text border-warn-line' },
    PAID: { label: 'Paid', cls: 'bg-ok-soft text-ok-text border-ok-line' }
  };
  const { label, cls } = map[status];
  return <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase ${cls}`}>{label}</span>;
};

const CreditRow: React.FC<{ credit: Credit }> = ({ credit }) => {
  const meta = TIER_META[credit.tier];
  const held = credit.tier === 'UNRESOLVED';
  return (
    <div className={`rounded-tile border p-3 ${held ? 'border-danger-line bg-danger-soft/40' : 'border-line bg-surface'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="truncate text-xs font-bold text-fg">{credit.payerName}</span>
            <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold ${RAIL_TONE[credit.rail]}`}>{credit.rail}</span>
          </div>
          <div className="mono mt-0.5 truncate text-[10px] text-fg-faint">
            {credit.payerVpa} → {credit.va} · {credit.utr}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="num text-sm font-extrabold text-fg">{inr(credit.amount)}</div>
          <Badge variant={meta.variant} icon={meta.icon} className="mt-1">{meta.label}</Badge>
        </div>
      </div>

      {!held && credit.lines.length > 0 && (
        <div className="mt-2.5 space-y-1 border-t border-line pt-2.5">
          {credit.lines.map((l) => (
            <div key={l.invoiceId} className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-fg-muted">
                <ArrowRight className="size-3 text-accent" />
                <span className="mono">{l.invoiceId}</span>
              </span>
              <span className="num font-semibold text-ok-text">{inr(l.amount)}</span>
            </div>
          ))}
          {credit.advance > 0 && (
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-warn-text">
                <Wallet className="size-3" />
                <span>Unapplied advance</span>
              </span>
              <span className="num font-semibold text-warn-text">{inr(credit.advance)}</span>
            </div>
          )}
        </div>
      )}

      <div className={`mt-2 flex items-start gap-1.5 text-[10px] leading-relaxed ${held ? 'text-danger-text' : 'text-fg-muted'}`}>
        {held ? <AlertTriangle className="mt-px size-3 shrink-0" /> : <ShieldCheck className="mt-px size-3 shrink-0 text-ok" />}
        <span>
          {credit.note}
          {!held && <span className="text-fg-faint"> · confidence {credit.confidence}%</span>}
        </span>
      </div>
    </div>
  );
};
