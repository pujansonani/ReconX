import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  FileCheck2,
  Coins,
  Building,
  Scale
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { MagneticButton, MOTION_SPRINGS } from '../motion/MotionSystem';

export const ReconArtHero: React.FC<{
  onTryDemo: () => void;
  onNewRecon: () => void;
  loadingDemo?: boolean;
}> = ({ onTryDemo, onNewRecon, loadingDemo = false }) => {
  const [activeTab, setActiveTab] = useState<'3way' | 'batch' | 'exception'>('3way');

  return (
    <section className="py-6 sm:py-10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Top Authority Header & CTA */}
        <div className="text-center max-w-4xl mx-auto space-y-5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[#0077B6] dark:text-[#48CAE4] text-xs font-extrabold tracking-wide uppercase"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0096C7] dark:text-[#48CAE4]" />
            <span>Autonomous Financial Settlement Reconciliation</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--text-primary)] tracking-tight leading-tight"
          >
            Enterprise Financial Reconciliation,{' '}
            <span className="bg-gradient-to-r from-[#0077B6] via-[#0096C7] to-[#00B4D8] bg-clip-text text-transparent">
              Settlement Matching
            </span>{' '}
            &{' '}
            <span className="text-[#0077B6] dark:text-[#48CAE4] underline decoration-[#00B4D8] decoration-4 underline-offset-8">
              Exception AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed font-medium"
          >
            Complete 3-way automation across <strong>Merchant Orders</strong>, <strong>Payment Gateway Settlements</strong>, and <strong>Bank Statements</strong>. Deterministic arithmetic eliminates human error; AI accelerates exception investigation.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3 pt-2"
          >
            <MagneticButton strength={6}>
              <button
                onClick={onTryDemo}
                disabled={loadingDemo}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#0077B6] via-[#0096C7] to-[#00B4D8] hover:opacity-95 text-white font-extrabold text-sm shadow-lg shadow-[#0096C7]/20 flex items-center gap-2 transition-all cursor-pointer border border-[#00B4D8]/50"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Launch Interactive Demo (2,000 Records)</span>
              </button>
            </MagneticButton>

            <MagneticButton strength={6}>
              <button
                onClick={onNewRecon}
                className="px-6 py-3 rounded-xl bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-primary)] border-2 border-[var(--border-card)] font-extrabold text-sm shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <ArrowRight className="w-4 h-4 text-[#0096C7] dark:text-[#48CAE4]" />
                <span>Upload CSV Ledgers</span>
              </button>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Enterprise Live UI Workspace Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, ...MOTION_SPRINGS.smooth }}
          className="max-w-6xl mx-auto rounded-3xl bg-[var(--bg-card)] border-2 border-[var(--border-card)] shadow-2xl overflow-hidden"
        >
          {/* Top Control Bar of the Mockup */}
          <div className="p-4 bg-[#080C14] text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="RX"
                className="w-6 h-6 object-contain rounded-md shadow-xs"
              />
              <span className="font-bold text-xs text-[#ADE8F4] font-mono tracking-wide pl-2 border-l border-white/20">
                RECONX WORKSPACE // CYCLE-2026-Q3 // ACTIVE RUN #RN-89210
              </span>
            </div>

            {/* Quick Workspace Switcher Tabs */}
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl text-xs font-semibold border border-slate-800">
              <button
                onClick={() => setActiveTab('3way')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === '3way'
                    ? 'bg-[#0077B6] text-white font-extrabold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3-Way Match Matrix
              </button>
              <button
                onClick={() => setActiveTab('batch')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'batch'
                    ? 'bg-[#0077B6] text-white font-extrabold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Netted Batch Solver
              </button>
              <button
                onClick={() => setActiveTab('exception')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'exception'
                    ? 'bg-[#0077B6] text-white font-extrabold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Exception Intelligence
              </button>
            </div>
          </div>

          {/* Interactive Workspace Body */}
          <div className="p-6 sm:p-8 bg-[var(--bg-card-subtle)] space-y-6">
            {/* KPI Telemetry Header */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#0077B6] dark:text-[#48CAE4] block">Total Processed</span>
                <span className="text-xl font-extrabold text-[var(--text-primary)] mono">2,000 txs</span>
                <span className="text-[11px] text-[var(--text-muted)] block mt-0.5 font-medium">₹4,89,700.00 Volume</span>
              </div>

              <div className="p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#0077B6] dark:text-[#48CAE4] block">Auto-Reconciled</span>
                <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mono">1,948 txs (97.4%)</span>
                <span className="text-[11px] text-[var(--text-muted)] block mt-0.5 font-medium">T1 Exact + T2 Fuzzy + T3 Batch</span>
              </div>

              <div className="p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Exceptions Flagged</span>
                <span className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mono">52 cases</span>
                <span className="text-[11px] text-[var(--text-muted)] block mt-0.5 font-medium">AI Root Cause Prepared</span>
              </div>

              <div className="p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] shadow-xs">
                <span className="text-[10px] uppercase font-bold text-[#0077B6] dark:text-[#48CAE4] block">Forced False Matches</span>
                <span className="text-xl font-extrabold text-[#0077B6] dark:text-[#48CAE4] mono">0 (Certified)</span>
                <span className="text-[11px] text-[var(--text-muted)] block mt-0.5 font-medium">Zero Hallucination Guarantee</span>
              </div>
            </div>

            {/* Tab 1 View: 3-Way Match Matrix */}
            {activeTab === '3way' && (
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] overflow-hidden shadow-xs">
                <div className="p-3.5 bg-[var(--bg-card-subtle)] border-b border-[var(--border-card)] flex items-center justify-between text-xs">
                  <span className="font-bold text-[var(--text-primary)]">Automated 3-Way Reference Correlation Grid</span>
                  <Badge variant="success">97.4% High Confidence Match</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse font-medium">
                    <thead>
                      <tr className="border-b border-[var(--border-card)] text-[var(--text-muted)] font-bold uppercase text-[10px] bg-[var(--bg-card-subtle)]">
                        <th className="py-2.5 px-4">Merchant Order</th>
                        <th className="py-2.5 px-4">Gateway Reference</th>
                        <th className="py-2.5 px-4">Bank Statement Entry</th>
                        <th className="py-2.5 px-4 text-right">Gross Amount</th>
                        <th className="py-2.5 px-4 text-right">Gateway MDR Fee</th>
                        <th className="py-2.5 px-4 text-right">Net Credited</th>
                        <th className="py-2.5 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-card)] text-xs text-[var(--text-primary)]">
                      <tr className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                        <td className="py-2.5 px-4 mono font-bold text-[var(--text-primary)]">ORD-982101</td>
                        <td className="py-2.5 px-4 mono text-[var(--text-secondary)]">pay_N7x8A9kL21m</td>
                        <td className="py-2.5 px-4 mono text-[var(--text-secondary)]">CMS/RAZORPAY/ORD-982101</td>
                        <td className="py-2.5 px-4 mono text-right text-[var(--text-primary)] font-bold">₹12,450.00</td>
                        <td className="py-2.5 px-4 mono text-right text-rose-600 dark:text-rose-400">−₹224.10</td>
                        <td className="py-2.5 px-4 mono text-right text-emerald-600 dark:text-emerald-400 font-bold">₹12,225.90</td>
                        <td className="py-2.5 px-4 text-center"><Badge variant="success">Tier 1 Matched</Badge></td>
                      </tr>
                      <tr className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                        <td className="py-2.5 px-4 mono font-bold text-[var(--text-primary)]">ORD-982102</td>
                        <td className="py-2.5 px-4 mono text-[var(--text-secondary)]">pay_N7x8B0pQ99z</td>
                        <td className="py-2.5 px-4 mono text-[var(--text-secondary)]">CMS/RAZORPAY/BATCH-9281</td>
                        <td className="py-2.5 px-4 mono text-right text-[var(--text-primary)] font-bold">₹8,900.00</td>
                        <td className="py-2.5 px-4 mono text-right text-rose-600 dark:text-rose-400">−₹160.20</td>
                        <td className="py-2.5 px-4 mono text-right text-emerald-600 dark:text-emerald-400 font-bold">₹8,739.80</td>
                        <td className="py-2.5 px-4 text-center"><Badge variant="blue">Tier 2 Fuzzy</Badge></td>
                      </tr>
                      <tr className="hover:bg-[var(--bg-card-subtle)] transition-colors bg-amber-500/5">
                        <td className="py-2.5 px-4 mono font-bold text-[var(--text-primary)]">ORD-982103</td>
                        <td className="py-2.5 px-4 mono text-[var(--text-secondary)]">pay_N7x8C1kX77a</td>
                        <td className="py-2.5 px-4 mono text-amber-600 dark:text-amber-400 font-bold">UNSETTLED (Cutoff)</td>
                        <td className="py-2.5 px-4 mono text-right text-[var(--text-primary)] font-bold">₹15,000.00</td>
                        <td className="py-2.5 px-4 mono text-right text-[var(--text-muted)]">−₹270.00</td>
                        <td className="py-2.5 px-4 mono text-right text-[var(--text-muted)]">₹0.00</td>
                        <td className="py-2.5 px-4 text-center"><Badge variant="warning">Timing Diff</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2 View: Netted Batch Solver */}
            {activeTab === 'batch' && (
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
                  <span className="font-bold text-xs text-[var(--text-primary)]">Batch Settlement Mathematical Netting Breakdown</span>
                  <span className="font-mono text-xs font-extrabold text-[#0077B6] dark:text-[#48CAE4]">UTR: CMS/RAZORPAY/BATCH-92810/HDFC</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs font-mono">
                  <div className="p-3 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">Gross Charges</span>
                    <span className="font-bold text-[var(--text-primary)] text-sm">+₹4,89,700.00</span>
                  </div>
                  <div className="p-3 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)]">
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 block">Gateway MDR (1.8%)</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">−₹8,814.60</span>
                  </div>
                  <div className="p-3 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)]">
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 block">GST on Fee (18%)</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">−₹1,586.63</span>
                  </div>
                  <div className="p-3 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)]">
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 block">Refunds & Chargebacks</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">−₹3,185.33</span>
                  </div>
                  <div className="p-3 bg-sky-50 dark:bg-sky-950/60 rounded-xl border border-sky-300 dark:border-sky-800">
                    <span className="text-[10px] text-[#0077B6] dark:text-[#48CAE4] font-bold block">Net Bank Payout</span>
                    <span className="font-bold text-[#0077B6] dark:text-[#48CAE4] text-sm">₹4,76,113.44</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3 View: Exception Intelligence */}
            {activeTab === 'exception' && (
              <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border-card)]">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#0096C7] dark:text-[#48CAE4]" />
                    <span className="font-bold text-xs text-[var(--text-primary)]">AI Root-Cause Narrative & Suggested Journal</span>
                  </div>
                  <Badge variant="danger">Dispute #CB-1042</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)] space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">AI Executive Explanation</span>
                    <p className="text-[var(--text-primary)] leading-relaxed font-medium">
                      Gateway deducted ₹1,086.56 dispute chargeback. Store ledger not notified; inventory was already dispatched.
                    </p>
                  </div>
                  <div className="p-3.5 bg-sky-50 dark:bg-sky-950/50 rounded-xl border border-sky-200 dark:border-sky-800 space-y-1.5 font-mono">
                    <span className="text-[10px] uppercase font-bold text-[#0077B6] dark:text-[#48CAE4] block">Suggested Double-Entry Draft</span>
                    <div className="text-[11px] text-[#0077B6] dark:text-[#48CAE4] font-bold">
                      Dr. Chargeback Expense A/c ₹1,086.56<br />
                      Cr. Gateway Settlement Receivable ₹1,086.56
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
