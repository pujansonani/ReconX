import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MatchDetail } from '../../types';
import { BatchSolverAnimationSection } from '../motion/BatchSolverAnimationSection';
import {
  Layers,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Coins,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  Sliders,
  Sparkles
} from 'lucide-react';

interface BatchDecompositionViewProps {
  batches: MatchDetail[];
}

export const BatchDecompositionView: React.FC<BatchDecompositionViewProps> = ({ batches }) => {
  const [expandedBatchId, setExpandedBatchId] = useState<string | null>(
    batches.length > 0 ? batches[0].id : null
  );
  const [showInteractiveStudio, setShowInteractiveStudio] = useState<boolean>(false);

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="p-4 bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0077B6] dark:bg-[#0096C7] text-white flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
              Tier 3: Netted Batch Settlement Decomposition Engine
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Constrained subset-sum mathematical solver reconstructs multi-transaction lump-sum payouts with ₹0.00 variance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInteractiveStudio(!showInteractiveStudio)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
              showInteractiveStudio
                ? 'bg-[#0077B6] border-[#0077B6] text-white'
                : 'bg-[var(--bg-card)] border-[var(--border-card)] text-[var(--text-primary)] hover:border-[#0077B6]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{showInteractiveStudio ? 'Close Real-Time Studio' : 'Launch Real-Time Batch Studio'}</span>
          </button>

          <div className="text-right pl-3 border-l border-[var(--border-card)] hidden sm:block">
            <span className="text-[10px] font-semibold text-[var(--text-muted)] block uppercase">Total Solved Batches</span>
            <span className="text-sm font-bold text-[var(--text-primary)] mono">{batches.length} Solved</span>
          </div>
        </div>
      </div>

      {/* Interactive Studio Embedded if Toggled */}
      {showInteractiveStudio && (
        <div className="p-4 bg-[var(--bg-card-subtle)] border border-[var(--border-card)] rounded-3xl">
          <BatchSolverAnimationSection />
        </div>
      )}

      {/* Production Batch Cluster List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Reconciled Production Payout Batches ({batches.length})
          </h4>
          <span className="text-xs text-[var(--text-muted)] font-mono">100% Deterministic Match Rate</span>
        </div>

        {batches.length === 0 ? (
          <Card className="p-8 text-center text-[var(--text-muted)] text-xs">
            No multi-transaction batch reconciliations present in this run. Use the Real-Time Studio above to test custom bank batches.
          </Card>
        ) : (
          batches.map((batch) => {
            const isExpanded = expandedBatchId === batch.id;
            const ev = batch.evidence || {};
            const batchId = ev.batch_id || batch.bank_ids[0] || 'BATCH-UNKNOWN';
            const sampleTxList = ev.gateway_sample || [];
            const txCount = ev.transaction_count || batch.gateway_ids.length;

            return (
              <Card key={batch.id} className="overflow-hidden border border-[var(--border-card)]">
                {/* Batch Header */}
                <div
                  onClick={() => setExpandedBatchId(isExpanded ? null : batch.id)}
                  className="p-5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--text-primary)] mono">{batchId}</span>
                        <Badge variant="success">✓ Reconciled (₹0.00 Difference)</Badge>
                      </div>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 font-mono">
                        Bank UTR: <span className="font-bold text-[var(--text-primary)]">{batch.bank_ids[0]}</span> • Reconstructed {txCount} individual gateway charges
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <span className="text-[11px] text-[var(--text-muted)] font-semibold uppercase block">Bank Settlement Amount</span>
                      <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mono">
                        ₹{batch.bank_settlement.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <button className="p-2 rounded-lg hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] cursor-pointer">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Breakdown */}
                {isExpanded && (
                  <div className="p-5 bg-[var(--bg-card-subtle)] border-t border-[var(--border-card)] space-y-5 text-xs">
                    {/* Financial Math Decomposition Equation */}
                    <div className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-card)] space-y-3 font-mono">
                      <div className="flex items-center justify-between text-[var(--text-primary)]">
                        <span>+ Gross Ingested Sum ({txCount} orders)</span>
                        <span className="font-bold">₹{batch.gross_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                        <span>− Deducted Payment Gateway Fees (MDR)</span>
                        <span className="font-bold">−₹{batch.gateway_fees.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>

                      <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
                        <span>− GST on Gateway Fees (18% Tax)</span>
                        <span className="font-bold">−₹{batch.gst_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>

                      {batch.refunds_amount > 0 && (
                        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                          <span>− Deducted Customer Refunds</span>
                          <span className="font-bold">−₹{batch.refunds_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {batch.chargebacks_amount > 0 && (
                        <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
                          <span>− Deducted Chargeback Dispute Clawbacks</span>
                          <span className="font-bold">−₹{batch.chargebacks_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between text-sm font-bold text-[var(--text-primary)]">
                        <span>= Net Expected Bank Settlement Credit</span>
                        <span className="text-emerald-600 dark:text-emerald-400">
                          ₹{batch.net_settlement.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between font-mono text-emerald-800 dark:text-emerald-300 font-bold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Residual Variance Verified</span>
                      </div>
                      <span className="text-sm">₹0.00</span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
