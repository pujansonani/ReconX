import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  FileSpreadsheet,
  Coins,
  Send,
  Building2,
  Scale,
  FileCheck
} from 'lucide-react';
import { ExceptionDetail } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MOTION_SPRINGS, MOTION_DURATIONS } from '../motion/MotionSystem';

interface ExceptionDetailDrawerProps {
  exception: ExceptionDetail | null;
  onClose: () => void;
  onAction: (id: string, action: 'RESOLVED' | 'ESCALATED' | 'IGNORED', notes?: string) => void;
  isActionLoading?: boolean;
}

export const ExceptionDetailDrawer: React.FC<ExceptionDetailDrawerProps> = ({
  exception,
  onClose,
  onAction,
  isActionLoading = false
}) => {
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'evidence' | 'journal' | 'audit'>('evidence');
  const shouldReduceMotion = useReducedMotion();

  if (!exception) return null;

  const isUnresolvedAnomaly = exception.category === 'UNRESOLVED';
  const ev = exception.evidence_summary || {};
  const journal = exception.suggested_journal_entry;

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <Badge variant="danger">CRITICAL</Badge>;
      case 'HIGH':
        return <Badge variant="danger">HIGH</Badge>;
      case 'MEDIUM':
        return <Badge variant="warning">MEDIUM</Badge>;
      default:
        return <Badge variant="neutral">LOW</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <Badge variant="success">RESOLVED</Badge>;
      case 'ESCALATED':
        return <Badge variant="danger">ESCALATED</Badge>;
      case 'IGNORED':
        return <Badge variant="neutral">IGNORED</Badge>;
      default:
        return <Badge variant="warning">REQUIRES REVIEW</Badge>;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-over Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={shouldReduceMotion ? { duration: 0.1 } : MOTION_SPRINGS.snappy}
          className="relative w-full max-w-2xl bg-[var(--bg-card)] border-l border-[var(--border-card)] shadow-2xl z-10 h-full flex flex-col overflow-y-auto text-[var(--text-primary)]"
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-[var(--border-card)] bg-[var(--bg-card-subtle)] sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-base text-[var(--text-primary)]">
                  Exception #{exception.exception_code}
                </span>
                {getSeverityBadge(exception.severity)}
                {getStatusBadge(exception.status)}
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-[var(--text-muted)] font-medium">Discrepancy Category</span>
                <h3 className="font-bold text-lg text-[var(--text-primary)]">{exception.category.replace(/_/g, ' ')}</h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-[var(--text-muted)] font-medium">Discrepancy Variance</span>
                <div className="font-mono text-xl font-bold text-rose-600 dark:text-rose-400">
                  ₹{exception.discrepancy_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
          </div>

          {/* Drawer Body Content */}
          <div className="p-6 space-y-6 flex-1 text-xs">
            {/* Special Deliberate Unresolvable Banner if Critical */}
            {isUnresolvedAnomaly && (
              <motion.div
                initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl space-y-2"
              >
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>Defensible Match Prevented (Zero Forced Matches)</span>
                </div>
                <p className="text-rose-900 dark:text-rose-200 leading-relaxed font-medium">
                  ReconX identified this unallocated bank credit with zero matching orders or gateway payouts. Under the core safety principle <strong>"Code handles money, AI handles meaning"</strong>, this transaction is strictly escalated without fabricating numbers or hallucinating associations.
                </p>
              </motion.div>
            )}

            {/* AI Executive Root-Cause Card */}
            <motion.div
              initial={shouldReduceMotion ? {} : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-4 rounded-xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/70 dark:bg-sky-950/30 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold text-sm text-[#0077B6] dark:text-[#48CAE4]">
                  <Sparkles className="w-4 h-4 text-[#0077B6] dark:text-[#48CAE4]" />
                  <span>AI Executive Root-Cause Synthesis</span>
                </div>
                <span className="text-[11px] font-mono font-bold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/60 px-2 py-0.5 rounded-md">
                  {exception.ai_confidence ? `${(exception.ai_confidence > 1 ? exception.ai_confidence : exception.ai_confidence * 100).toFixed(1)}% Confidence` : 'Synthesized'}
                </span>
              </div>

              <p className="text-[var(--text-primary)] leading-relaxed text-xs font-medium">
                {exception.ai_explanation || exception.deterministic_reason}
              </p>

              <div className="p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-card)] flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[var(--text-primary)] block">Recommended Controller Action:</span>
                  <span className="text-[var(--text-secondary)]">{exception.recommended_action || 'Review and take appropriate action.'}</span>
                </div>
              </div>
            </motion.div>

            {/* Tabs for Detailed Evidence, Suggested Journal, and Audit Log */}
            <div className="border-b border-[var(--border-card)] flex gap-4 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('evidence')}
                className={`pb-2 border-b-2 flex items-center gap-1 transition-colors cursor-pointer ${
                  activeTab === 'evidence'
                    ? 'border-[#0077B6] dark:border-[#48CAE4] text-[#0077B6] dark:text-[#48CAE4] font-bold'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Source Ledger Evidence
              </button>

              <button
                onClick={() => setActiveTab('journal')}
                className={`pb-2 border-b-2 flex items-center gap-1 transition-colors cursor-pointer ${
                  activeTab === 'journal'
                    ? 'border-[#0077B6] dark:border-[#48CAE4] text-[#0077B6] dark:text-[#48CAE4] font-bold'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                Suggested Journal Entry
              </button>

              <button
                onClick={() => setActiveTab('audit')}
                className={`pb-2 border-b-2 flex items-center gap-1 transition-colors cursor-pointer ${
                  activeTab === 'audit'
                    ? 'border-[#0077B6] dark:border-[#48CAE4] text-[#0077B6] dark:text-[#48CAE4] font-bold'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                Audit Trail & History
              </button>
            </div>

            {/* Tab 1: Source Ledger Evidence */}
            {activeTab === 'evidence' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Order Ledger Box */}
                  <div className="p-3 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                      Merchant Order
                    </span>
                    <span className="font-mono font-bold text-[var(--text-primary)] block truncate">
                      {ev.order_id || 'N/A'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] mono mt-1 block">
                      Amount: <strong>{ev.order_amount != null ? `₹${ev.order_amount.toFixed(2)}` : 'N/A'}</strong>
                    </span>
                  </div>

                  {/* Gateway Box */}
                  <div className="p-3 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                      Payment Gateway
                    </span>
                    <span className="font-mono font-bold text-[var(--text-primary)] block truncate">
                      {ev.gateway_txn_id || 'N/A'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] mono mt-1 block">
                      Gross: <strong>{ev.gateway_amount != null ? `₹${ev.gateway_amount.toFixed(2)}` : 'N/A'}</strong>
                    </span>
                  </div>

                  {/* Bank Box */}
                  <div className="p-3 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)]">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">
                      Bank Statement
                    </span>
                    <span className="font-mono font-bold text-[var(--text-primary)] block truncate">
                      {ev.bank_ref || 'N/A'}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] mono mt-1 block">
                      Credit: <strong>{ev.bank_amount != null ? `₹${ev.bank_amount.toFixed(2)}` : 'N/A'}</strong>
                    </span>
                  </div>
                </div>

                {/* Evidence Key-Value Pairs */}
                <div className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-card)] space-y-2">
                  <span className="font-bold text-xs text-[var(--text-primary)] block">Deterministic Telemetry Metadata</span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-[var(--text-secondary)]">
                    {Object.entries(ev).map(([k, v]) => (
                      <div key={k} className="p-2 bg-[var(--bg-card-subtle)] rounded-lg flex flex-col">
                        <span className="text-[10px] text-[var(--text-muted)] uppercase">{k.replace(/_/g, ' ')}</span>
                        <span className="font-semibold text-[var(--text-primary)] truncate">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Suggested Journal Entry */}
            {activeTab === 'journal' && (
              <div className="space-y-4">
                {journal ? (
                  <div className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-card)] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[var(--text-primary)]">Proposed Double-Entry Journal</span>
                      <Badge variant="blue">Automated Draft</Badge>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-mono border-collapse">
                        <thead>
                          <tr className="bg-[var(--bg-card-subtle)] text-[var(--text-muted)] text-[10px] uppercase">
                            <th className="py-2 px-3 text-left">Account Name</th>
                            <th className="py-2 px-3 text-right">Debit (Dr)</th>
                            <th className="py-2 px-3 text-right">Credit (Cr)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border-card)] text-[var(--text-primary)]">
                          {journal.entries?.map((line, idx) => (
                            <tr key={idx} className="hover:bg-[var(--bg-card-subtle)]">
                              <td className="py-2 px-3 font-semibold">{line.account_name} ({line.account_code})</td>
                              <td className="py-2 px-3 text-right font-bold text-sky-600 dark:text-sky-400">
                                {line.debit > 0 ? `₹${line.debit.toFixed(2)}` : '—'}
                              </td>
                              <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                {line.credit > 0 ? `₹${line.credit.toFixed(2)}` : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="pt-2 border-t border-[var(--border-card)] text-[11px] text-[var(--text-muted)]">
                      <span>Memo: </span>
                      <strong className="text-[var(--text-primary)] font-normal">{journal.memo}</strong>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-[var(--text-muted)] bg-[var(--bg-card-subtle)] rounded-xl">
                    <Coins className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    <p>No double-entry adjustment required for this exception category.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Audit Trail */}
            {activeTab === 'audit' && (
              <div className="space-y-3">
                <div className="p-3 bg-[var(--bg-card)] rounded-xl border border-[var(--border-card)] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--text-primary)]">Automated Exception Ingested</span>
                    <span className="text-[var(--text-muted)] font-mono">{new Date(exception.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-[var(--text-secondary)] text-[11px]">
                    Classified as {exception.category} with severity {exception.severity} by multi-tier matching cascade.
                  </p>
                </div>

                {exception.resolution_notes && (
                  <div className="p-3 bg-sky-50 dark:bg-sky-950/40 rounded-xl border border-sky-200 dark:border-sky-800/60 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[#0077B6] dark:text-[#48CAE4]">
                      <span>Controller Resolution Note</span>
                      <span className="text-[10px] font-mono">{exception.status}</span>
                    </div>
                    <p className="text-[var(--text-primary)] text-xs">{exception.resolution_notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Human Resolution Actions Section */}
            <div className="p-4 bg-[var(--bg-card)] rounded-xl border border-[var(--border-card)] space-y-3">
              <span className="font-bold text-xs text-[var(--text-primary)] block">Take Action on Exception</span>

              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter controller resolution comments or escalation instructions..."
                rows={2}
                className="w-full p-2.5 rounded-lg border border-[var(--border-card)] bg-[var(--bg-card-subtle)] text-xs text-[var(--text-primary)] focus:ring-2 focus:ring-[#0077B6] outline-none"
              />

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  variant="success"
                  size="sm"
                  loading={isActionLoading}
                  onClick={() => onAction(exception.id, 'RESOLVED', resolutionNotes)}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Approve & Mark Resolved
                </Button>

                <Button
                  variant="danger"
                  size="sm"
                  loading={isActionLoading}
                  onClick={() => onAction(exception.id, 'ESCALATED', resolutionNotes)}
                  icon={<AlertTriangle className="w-3.5 h-3.5" />}
                >
                  Escalate to Treasury
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  loading={isActionLoading}
                  onClick={() => onAction(exception.id, 'IGNORED', resolutionNotes)}
                >
                  Ignore Variance
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
