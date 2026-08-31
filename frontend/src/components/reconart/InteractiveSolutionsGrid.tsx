import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Layers,
  Sparkles,
  ShieldCheck,
  Scale,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export const InteractiveSolutionsGrid: React.FC = () => {
  const [selectedSolution, setSelectedSolution] = useState(0);

  const solutions = [
    {
      id: 'matching',
      title: 'High-Volume Multi-Way Transaction Matching',
      subtitle: 'Tiers 1 & 2 Cascading Engine',
      icon: Layers,
      color: 'border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/40 text-[#0077B6] dark:text-[#48CAE4]',
      description:
        'Eliminate manual spreadsheet lookups. ReconX deterministically links orders, payment gateway references, and bank statements across 1-to-1, 1-to-many, and many-to-many relationships in milliseconds.',
      features: [
        'Automated 3-way reference index matching',
        'Configurable monetary rounding tolerance (<= ₹0.01)',
        'Temporal settlement proximity windows (+/- 3 days)',
        'Zero float error decimal arithmetic'
      ],
      metrics: '97.4% Automated Match Rate'
    },
    {
      id: 'batch',
      title: 'Netted Batch Settlement Decomposition',
      subtitle: 'Tier 3 Mathematical Solver',
      icon: Scale,
      color: 'border-purple-300 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300',
      description:
        'Solve the mystery of consolidated bank credits. ReconX deconstructs lump-sum deposits into individual customer charges, deducted gateway fees, 18% GST tax, customer refunds, and chargebacks.',
      features: [
        'Linear netting equation solver with ₹0.00 residual variance',
        'Automatic Merchant Discount Rate (MDR) verification',
        'Tax withholding and GST reconciliation',
        'Multi-charge consolidated deposit breakdown'
      ],
      metrics: '₹0.00 Math Balance'
    },
    {
      id: 'exceptions',
      title: 'AI Exception Intelligence & Journal Drafting',
      subtitle: 'Tier 4 Root-Cause Synthesis',
      icon: Sparkles,
      color: 'border-amber-300 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300',
      description:
        'AI translates complex financial variances into clear executive explanations. Automatically classifies issues into standard discrepancy archetypes and drafts balanced double-entry journal entries.',
      features: [
        'Plain-English root-cause synthesis for controllers',
        'Actionable dispute and ledger adjustment guidance',
        'Automated debit/credit account line drafting',
        'Audited human-in-the-loop resolution workflows'
      ],
      metrics: '52 Flagged Exceptions Handled'
    },
    {
      id: 'audit',
      title: 'Zero Forced Matches & Financial Close Certification',
      subtitle: 'Treasury Safety Standard',
      icon: ShieldCheck,
      color: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300',
      description:
        'Never worry about artificial or hallucinated matches. When no defensible mathematical combination exists, ReconX strictly escalates to corporate treasury for audit substantiation.',
      features: [
        'Strict zero-forced-match safety guarantee',
        'Deliberate unresolvable anomaly escalation',
        'Complete historical CSV audit trail exports',
        'SOX and period-close readiness'
      ],
      metrics: '0 False Matches Certified'
    }
  ];

  return (
    <section className="py-16 relative">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="blue">Core Platform Solutions</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Complete Control Across the <span className="text-[#0077B6] dark:text-[#48CAE4]">Reconciliation Lifecycle</span>
          </h2>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            From raw transaction ingestion to automated period-end certification, ReconX replaces fragile manual spreadsheets with an enterprise-grade automated engine.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {solutions.map((s, idx) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.id}
                className="p-7 bg-[var(--bg-card)] border-2 border-[var(--border-card)] hover:border-[#0077B6]/40 transition-all rounded-3xl shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${s.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] font-mono block">
                          {s.subtitle}
                        </span>
                        <h3 className="font-extrabold text-base text-[var(--text-primary)]">{s.title}</h3>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed mb-5">
                    {s.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {s.features.map((f) => (
                      <div key={f} className="flex items-center gap-2 text-xs font-semibold text-[var(--text-secondary)]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0077B6] dark:text-[#48CAE4] shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border-card)] flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#0077B6] dark:text-[#48CAE4]">{s.metrics}</span>
                  <div className="flex items-center gap-1 text-[var(--text-muted)] font-bold">
                    <span>Deterministic Control</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
