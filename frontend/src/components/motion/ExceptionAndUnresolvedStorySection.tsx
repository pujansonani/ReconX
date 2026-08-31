import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, ArrowRight, ShieldAlert, Ban } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Reveal } from './MotionSystem';

export const ExceptionAndUnresolvedStorySection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="py-16 relative space-y-16">
      {/* 1. Exception Flow Narrative */}
      <div>
        <div className="max-w-4xl mx-auto text-center mb-10 space-y-3">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
              Exception Storytelling
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
              From Discrepancy to <span className="text-amber-600 dark:text-amber-400">Actionable Resolution</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
              When a transaction deviates, ReconX isolates it instantly, synthesizes an AI root cause, and drafts the necessary double-entry journal lines.
            </p>
          </Reveal>
        </div>

        {/* Exception Flow Animation Card */}
        <Card className="max-w-4xl mx-auto p-6 md:p-8 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-md">
          {/* Normal stream vs exception point */}
          <div className="flex items-center justify-between p-4 bg-[var(--bg-card-subtle)] rounded-2xl border border-[var(--border-card)] mb-6 overflow-x-auto gap-3">
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">✓ TXN-101</span>
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">✓ TXN-102</span>
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">✓ TXN-103</span>
              <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">✓ TXN-104</span>
            </div>

            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
              <motion.span
                animate={shouldReduceMotion ? {} : { scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold text-xs border border-amber-300 dark:border-amber-800 flex items-center gap-1.5 shrink-0"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                ⚠ TXN-105: Fee Mismatch (3.5% vs 1.8%)
              </motion.span>
            </div>
          </div>

          {/* AI Analysis Stagger Container */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)] space-y-2">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block font-mono">1. Root Cause</span>
              <h4 className="font-bold text-xs text-[var(--text-primary)]">Contractual Overcharge</h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Payment gateway charged 3.50% MDR on domestic card transaction instead of agreed 1.80% rate.
              </p>
            </div>

            <div className="p-4 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)] space-y-2">
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block font-mono">2. Recommended Action</span>
              <h4 className="font-bold text-xs text-[var(--text-primary)]">MDR Dispute Escalation</h4>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                File fee adjustment credit claim with gateway relationship manager for ₹1,240.50 variance.
              </p>
            </div>

            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 block font-mono">3. Suggested Journal</span>
              <h4 className="font-bold text-xs text-emerald-900 dark:text-emerald-100">Debit Dispute Receivable</h4>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-200 leading-relaxed font-mono">
                Dr. Gateway Dispute A/c ₹1,240.50<br />
                Cr. Gateway MDR Expense ₹1,240.50
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Unresolved Anomaly & Zero Forced Matches Guarantee */}
      <div>
        <div className="max-w-4xl mx-auto text-center mb-10 space-y-3">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider">
              Safety Guarantee
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Refusing to Hallucinate. <span className="text-rose-600 dark:text-rose-400">Zero Forced Matches.</span>
            </h2>
          </Reveal>
          <Reveal delay={0.2}>
            <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
              When no defensible combination of order or gateway records explains a deposit, ReconX refuses to invent a match.
            </p>
          </Reveal>
        </div>

        {/* Unresolved Safety Showcase Card */}
        <Card className="max-w-4xl mx-auto p-6 md:p-8 bg-[#0F172A] text-white rounded-3xl border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-bold">
                <Ban className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-400 font-mono block">
                  DELIBERATE ADVERSARIAL ANOMALY
                </span>
                <h3 className="font-extrabold text-lg text-white">Unallocated Bank Credit: ₹75,420.00</h3>
              </div>
            </div>

            <Badge variant="danger">Forced Matches = 0 Guaranteed</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
              <span className="text-slate-400 block font-bold">Candidate Matching Attempts:</span>
              <div className="space-y-1 text-slate-400 font-mono text-[11px]">
                <div className="line-through text-rose-400/80">✗ Batch candidate ₹68,200.00 (Amount delta &gt; ₹0.01)</div>
                <div className="line-through text-rose-400/80">✗ Order candidate ₹75,420.00 (Date window &gt; 3 days)</div>
                <div className="line-through text-rose-400/80">✗ Multi-order subset (Unmatched UTR identifier)</div>
              </div>
            </div>

            <div className="p-4 bg-rose-950/40 rounded-2xl border border-rose-800/60 space-y-2">
              <div className="flex items-center gap-2 text-rose-400 font-bold">
                <ShieldAlert className="w-4 h-4" />
                <span>Deterministic Escalation Result:</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                ReconX marks this transaction as <strong>Tier 4 UNRESOLVED</strong> and routes it to treasury operations without guessing or hallucinating associations.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
};
