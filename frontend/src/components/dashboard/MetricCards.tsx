import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  FileCheck2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Ban,
  Scale
} from 'lucide-react';
import { ReconciliationRunSummary } from '../../types';
import { AnimatedNumber, MOTION_SPRINGS } from '../motion/MotionSystem';

interface MetricCardsProps {
  summary?: ReconciliationRunSummary | null;
  platformSummary?: {
    total_runs: number;
    total_records: number;
    total_reconciled: number;
    total_exceptions: number;
    total_unresolved: number;
    match_rate: number;
    financial_difference: number;
  };
}

export const MetricCards: React.FC<MetricCardsProps> = ({ summary, platformSummary }) => {
  const shouldReduceMotion = useReducedMotion();

  const totalRecords = summary ? summary.total_records : (platformSummary?.total_records || 0);
  const reconciled = summary ? summary.reconciled_count : (platformSummary?.total_reconciled || 0);
  const exceptions = summary ? summary.exception_count : (platformSummary?.total_exceptions || 0);
  const matchRate = summary ? summary.match_rate : (platformSummary?.match_rate || 0);
  const unresolved = summary ? summary.unresolved_count : (platformSummary?.total_unresolved || 0);
  const financialDiff = summary ? summary.financial_difference : (platformSummary?.financial_difference || 0);

  const cards = [
    {
      title: 'Total Ingested Records',
      value: totalRecords,
      isCurrency: false,
      isPercent: false,
      badge: summary?.scenario_type ? `${summary.scenario_type}` : 'All Batches',
      badgeVariant: 'blue' as const,
      subtext: summary ? `${summary.total_orders || Math.round(totalRecords * 0.45)} orders • ${summary.total_gateway_records || Math.round(totalRecords * 0.45)} gateway` : 'Aggregated across runs',
      icon: Layers,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-50 dark:bg-sky-950/60'
    },
    {
      title: 'Auto-Reconciled Records',
      value: reconciled,
      isCurrency: false,
      isPercent: false,
      badge: `${matchRate}% Rate`,
      badgeVariant: 'success' as const,
      subtext: summary ? `T1 Exact: ${summary.tier1_exact_count} • T2 Fuzzy: ${summary.tier2_fuzzy_count}` : 'Resolved automatically',
      icon: FileCheck2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/60'
    },
    {
      title: 'Discrepancy Exceptions',
      value: exceptions,
      isCurrency: false,
      isPercent: false,
      badge: 'Action Required',
      badgeVariant: 'warning' as const,
      subtext: 'Flagged for AI root-cause synthesis',
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/60'
    },
    {
      title: 'Settlement Match Rate',
      value: matchRate,
      isCurrency: false,
      isPercent: true,
      badge: matchRate >= 95 ? 'Optimal' : 'Investigating',
      badgeVariant: matchRate >= 95 ? ('success' as const) : ('warning' as const),
      subtext: 'Deterministic precision target >= 95%',
      icon: ArrowUpRight,
      color: 'text-[#0077B6] dark:text-[#48CAE4]',
      bg: 'bg-sky-50 dark:bg-sky-950/60'
    },
    {
      title: 'Unresolved (Zero Forced)',
      value: unresolved,
      isCurrency: false,
      isPercent: false,
      badge: unresolved === 0 ? 'Safe' : 'Treasury Escalated',
      badgeVariant: unresolved === 0 ? ('success' as const) : ('danger' as const),
      subtext: 'Zero forced matches guarantee',
      icon: Ban,
      color: unresolved === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
      bg: unresolved === 0 ? 'bg-emerald-50 dark:bg-emerald-950/60' : 'bg-rose-50 dark:bg-rose-950/60'
    },
    {
      title: 'Net Financial Discrepancy',
      value: financialDiff,
      isCurrency: true,
      isPercent: false,
      badge: financialDiff === 0 ? 'Balanced' : '₹ Variance',
      badgeVariant: financialDiff === 0 ? ('success' as const) : ('danger' as const),
      subtext: 'Sum of order vs gateway vs bank delta',
      icon: Scale,
      color: financialDiff === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400',
      bg: financialDiff === 0 ? 'bg-emerald-50 dark:bg-emerald-950/60' : 'bg-rose-50 dark:bg-rose-950/60'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, ...MOTION_SPRINGS.normal }}
            whileHover={shouldReduceMotion ? {} : { y: -3, transition: MOTION_SPRINGS.snappy }}
            className="bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-xs p-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-semibold text-[var(--text-muted)] truncate">{card.title}</span>
                <div className={`p-1.5 rounded-lg ${card.bg} ${card.color} shrink-0`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl font-extrabold text-[var(--text-primary)] mono tabular-nums">
                  <AnimatedNumber
                    value={card.value}
                    prefix={card.isCurrency ? '₹' : ''}
                    suffix={card.isPercent ? '%' : ''}
                    decimals={card.isCurrency ? 2 : card.isPercent ? 1 : 0}
                  />
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-card)] flex items-center justify-between gap-2">
              <span className="text-[11px] text-[var(--text-muted)] truncate">{card.subtext}</span>
              <Badge variant={card.badgeVariant}>{card.badge}</Badge>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
