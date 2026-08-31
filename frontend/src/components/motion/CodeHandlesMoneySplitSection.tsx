import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Scale, Sparkles, CheckCircle2, Code } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Reveal, MOTION_SPRINGS } from './MotionSystem';

export const CodeHandlesMoneySplitSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const deterministicPoints = [
    { label: 'Financial Arithmetic', detail: 'Summing amounts, comparing decimal totals with zero float rounding errors' },
    { label: 'Multi-Way Matching', detail: 'Correlating order gross, gateway net, and bank credit with hash lookups' },
    { label: 'Tolerance Enforcement', detail: 'Strict boundary verification (|Δ| <= ₹0.01 and date window <= 3 days)' },
    { label: 'Batch Netting Solver', detail: 'Reconstructing Gross - Fees - GST - Refunds - Chargebacks = Bank Payout' }
  ];

  const aiPoints = [
    { label: 'Exception Classification', detail: 'Categorizing discrepancies into taxonomy (Timing, Fee Mismatch, etc.)' },
    { label: 'Root-Cause Synthesis', detail: 'Writing plain-English explanations for controllers and treasury' },
    { label: 'Actionable Next Steps', detail: 'Directing human teams to file disputes, adjust MDR schedules, or investigate' },
    { label: 'Suggested Journal Entries', detail: 'Drafting structured debit and credit accounts (e.g. Chargeback Expense)' }
  ];

  return (
    <section className="py-16 relative">
      <div className="max-w-4xl mx-auto text-center mb-10 space-y-3">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider">
            Core Philosophy
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            <span className="text-[#0077B6] dark:text-[#48CAE4]">Code</span> handles money.{' '}
            <span className="text-emerald-600 dark:text-emerald-400">AI</span> handles meaning.
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-sm text-[var(--text-muted)] max-w-xl mx-auto leading-relaxed">
            We never ask an LLM to sum columns or guess financial balances. Python handles mathematical truth; AI translates anomalies into human clarity.
          </p>
        </Reveal>
      </div>

      {/* Split Screen Cards */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Deterministic Engine */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={MOTION_SPRINGS.normal}
          className="p-6 sm:p-8 bg-[#0F172A] text-white rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
            <Code className="w-32 h-32 text-sky-400" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0077B6] text-white flex items-center justify-center font-bold">
                  <Code className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-sky-400 block font-mono">DETERMINISTIC ENGINE</span>
                  <h3 className="font-extrabold text-base text-white">Mathematical Truth</h3>
                </div>
              </div>
              <Badge variant="blue">Python / Pandas</Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Zero tolerance for hallucination. All financial calculations, fee reconciliations, and batch decompositions are executed by deterministic code.
            </p>

            <div className="space-y-3">
              {deterministicPoints.map((p) => (
                <div key={p.label} className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#48CAE4] shrink-0" />
                    <span className="text-xs font-bold text-white">{p.label}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 pl-5.5">{p.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
            <span>Precision Guarantee</span>
            <span className="text-sky-400 font-bold">100% Exact Math</span>
          </div>
        </motion.div>

        {/* Right Card: AI Intelligence Layer */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
          whileInView={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={MOTION_SPRINGS.normal}
          className="p-6 sm:p-8 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl border-2 border-emerald-300 dark:border-emerald-800/80 shadow-xl flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-emerald-600">
            <Sparkles className="w-32 h-32" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 block font-mono">AI INTELLIGENCE LAYER</span>
                  <h3 className="font-extrabold text-base text-[var(--text-primary)]">Context & Synthesis</h3>
                </div>
              </div>
              <Badge variant="success">Google Gemini / Synthesis</Badge>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed mb-6">
              AI receives established mathematical facts and produces plain-English financial intelligence, journal entries, and action guidance.
            </p>

            <div className="space-y-3">
              {aiPoints.map((p) => (
                <div key={p.label} className="p-3 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)] shadow-2xs">
                  <div className="flex items-center gap-2 mb-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">{p.label}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] pl-5.5">{p.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--border-card)] text-[11px] text-[var(--text-muted)] flex items-center justify-between font-mono">
            <span>Executive Output</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Actionable Clarity</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
