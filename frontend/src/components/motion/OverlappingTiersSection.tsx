import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Hash, Calendar, Layers, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Reveal, MOTION_SPRINGS } from './MotionSystem';

export const OverlappingTiersSection: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();

  const tiers = [
    {
      number: '01',
      tier: 'Tier 1',
      title: 'Exact Reference Match',
      confidence: '100% Confidence',
      badgeVariant: 'success' as const,
      icon: Hash,
      borderStyle: 'border-emerald-300 dark:border-emerald-700/60',
      badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300',
      description:
        'Deterministic 3-way hash matching linking transaction IDs, gateway references, and bank descriptions. Verifies gross amounts, exact fee schedules (1.8%), and zero unhandled refunds/chargebacks.',
      specs: ['Zero tolerance ($0.00)', 'Same-day instant hash lookup', 'Exact fee rate validation']
    },
    {
      number: '02',
      tier: 'Tier 2',
      title: 'Amount + Date Proximity Match',
      confidence: '90–98% Confidence',
      badgeVariant: 'blue' as const,
      icon: Calendar,
      borderStyle: 'border-sky-300 dark:border-sky-700/60',
      badgeBg: 'bg-sky-50 dark:bg-sky-950/60 text-[#0077B6] dark:text-[#48CAE4]',
      description:
        'Recovers unreferenced transactions where bank narrations omit or truncate transaction IDs. Correlates records within tight monetary rounding limits and authorization-to-settlement temporal windows.',
      specs: ['Amount delta <= ₹0.01', 'Settlement window <= 3 days', 'Filters out chargebacks & disputes']
    },
    {
      number: '03',
      tier: 'Tier 3',
      title: 'Netted Batch Settlement Solver',
      confidence: '₹0.00 Math Variance',
      badgeVariant: 'purple' as const,
      icon: Layers,
      borderStyle: 'border-purple-300 dark:border-purple-700/60',
      badgeBg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300',
      description:
        'Reconstructs multi-transaction consolidated lump-sum bank payouts. Solves the linear netting formula accounting for gross sales, deducted gateway fees, 18% GST, customer refunds, and chargebacks.',
      specs: ['Linear batch decomposition', 'Zero residual variance', 'Candidate window pruning']
    },
    {
      number: '04',
      tier: 'Tier 4',
      title: 'Exception Intelligence & Safety',
      confidence: 'Zero Forced Matches',
      badgeVariant: 'warning' as const,
      icon: ShieldAlert,
      borderStyle: 'border-amber-300 dark:border-amber-700/60',
      badgeBg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300',
      description:
        'Taxonomizes variances into actionable categories (Fee Mismatch, Timing Difference, Chargeback, Missing Record, Unresolved). Synthesizes AI plain-English root causes and suggested double-entry journal entries.',
      specs: ['7-category taxonomy', 'Suggested journal entry lines', 'Mandatory human escalation']
    }
  ];

  return (
    <section className="py-16 relative">
      <div className="max-w-4xl mx-auto text-center mb-10 space-y-3">
        <Reveal>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-[#0077B6] dark:text-[#48CAE4] text-xs font-bold uppercase tracking-wider">
            Cascading Logic
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            One engine. <span className="text-[#0077B6] dark:text-[#48CAE4]">Four levels of reconciliation.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.2}>
          <p className="text-sm text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed">
            ReconX executes an intelligent multi-stage cascade. Each tier resolves transactions deterministically before passing remaining complex cases to the next specialized level.
          </p>
        </Reveal>
      </div>

      {/* Clean Stacked Cards (Non-overlapping, responsive) */}
      <div className="max-w-4xl mx-auto space-y-4">
        {tiers.map((t, idx) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={t.tier}
              initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: idx * 0.08, ...MOTION_SPRINGS.normal }}
              whileHover={shouldReduceMotion ? {} : { y: -3, transition: MOTION_SPRINGS.snappy }}
              className={`p-6 sm:p-7 rounded-3xl bg-[var(--bg-card)] border-2 ${t.borderStyle} shadow-sm relative overflow-hidden transition-shadow hover:shadow-lg`}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-sm border border-slate-700">
                    {t.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold uppercase text-[var(--text-muted)]">{t.tier}</span>
                      <Badge variant={t.badgeVariant}>{t.confidence}</Badge>
                    </div>
                    <h3 className="text-lg font-extrabold text-[var(--text-primary)]">{t.title}</h3>
                  </div>
                </div>

                <div className={`p-2 rounded-xl ${t.badgeBg}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-4">
                {t.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-[var(--border-card)]">
                {t.specs.map((spec) => (
                  <div key={spec} className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0077B6] dark:text-[#48CAE4] shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
