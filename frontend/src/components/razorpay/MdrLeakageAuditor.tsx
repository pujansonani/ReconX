import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Building2,
  FileText,
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api';
import { BankRecoveryClaimModal } from './BankRecoveryClaimModal';

interface DiscrepancyItem {
  id: string;
  bank: string;
  batch_utr: string;
  gross_volume: number;
  contracted_mdr_pct: number;
  applied_mdr_pct: number;
  expected_fee: number;
  actual_deducted_fee: number;
  overcharge_amount: number;
  reason: string;
  recovery_status: string;
  detected_at: string;
}

interface MdrLeakageAuditorProps {
  data: {
    total_leakage_identified: number;
    batches_audited: number;
    discrepancy_batches_count: number;
    recovered_to_date: number;
    pending_recovery_claims: number;
    discrepancy_items: DiscrepancyItem[];
  };
}

export const MdrLeakageAuditor: React.FC<MdrLeakageAuditorProps> = ({ data }) => {
  const [selectedDiscrepancy, setSelectedDiscrepancy] = useState<DiscrepancyItem | null>(null);
  const [claimData, setClaimData] = useState<any | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleGenerateClaimLetter = async (item: DiscrepancyItem) => {
    try {
      setIsGenerating(true);
      setSelectedDiscrepancy(item);
      const res = await api.generateBankClaimLetter({
        bank_name: item.bank,
        gateway_name: 'Razorpay',
        batch_utr: item.batch_utr,
        overcharged_amount: item.overcharge_amount,
        contracted_mdr: item.contracted_mdr_pct,
        applied_mdr: item.applied_mdr_pct,
        transaction_count: 4,
        period_start: '2026-08-25',
        period_end: '2026-08-30'
      });
      setClaimData(res);
      setModalOpen(true);
    } catch (e) {
      console.error('Error generating claim letter:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Leakage KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Total Partner Bank Overcharge Leakage
          </span>
          <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mono">
            ₹{data.total_leakage_identified.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-rose-500 font-semibold flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Across {data.discrepancy_batches_count} Discrepant Batches
          </span>
        </Card>

        <Card className="p-4 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Audited Batch Settlements
          </span>
          <div className="text-xl font-extrabold text-[var(--text-primary)] mono">
            {data.batches_audited} Batches
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">
            Continuous automated UTR reconciliation
          </span>
        </Card>

        <Card className="p-4 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Recovered from Partner Banks
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mono">
            ₹{data.recovered_to_date.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Credit adjustments credited
          </span>
        </Card>

        <Card className="p-4 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Pending Recovery Claims
          </span>
          <div className="text-xl font-extrabold text-amber-500 mono">
            ₹{data.pending_recovery_claims.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">
            Ready for formal Nodal Officer notice
          </span>
        </Card>
      </div>

      {/* Discrepancy List Table */}
      <Card className="p-5 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-rose-500" />
            <h4 className="font-extrabold text-xs text-[var(--text-primary)] uppercase tracking-wider">
              Autonomous Partner Bank Fee Leakage Audit Log
            </h4>
          </div>
          <Badge variant="danger">{data.discrepancy_items.length} Discrepancies Flagged</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-card)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[10px] bg-[var(--bg-card-subtle)]">
                <th className="py-2.5 px-3">Discrepancy Ref</th>
                <th className="py-2.5 px-3">Partner Bank</th>
                <th className="py-2.5 px-3">Batch UTR</th>
                <th className="py-2.5 px-3">Gross Volume</th>
                <th className="py-2.5 px-3">Contracted MDR</th>
                <th className="py-2.5 px-3">Bank Applied</th>
                <th className="py-2.5 px-3">Overcharge Amount</th>
                <th className="py-2.5 px-3">Root Cause Reason</th>
                <th className="py-2.5 px-3 text-right">Recovery Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-card)] font-medium text-[var(--text-primary)]">
              {data.discrepancy_items.map((item) => (
                <tr key={item.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                  <td className="py-3 px-3 mono font-bold text-[var(--text-primary)]">
                    {item.id}
                  </td>
                  <td className="py-3 px-3 font-semibold text-[var(--text-primary)]">
                    {item.bank}
                  </td>
                  <td className="py-3 px-3 mono text-[var(--text-muted)] text-[11px]">
                    {item.batch_utr}
                  </td>
                  <td className="py-3 px-3 mono tabular-nums text-[var(--text-primary)]">
                    ₹{item.gross_volume.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {item.contracted_mdr_pct.toFixed(2)}%
                  </td>
                  <td className="py-3 px-3 mono text-rose-600 dark:text-rose-400 font-bold">
                    {item.applied_mdr_pct.toFixed(2)}%
                  </td>
                  <td className="py-3 px-3 mono font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                    +₹{item.overcharge_amount.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 text-[11px] text-[var(--text-muted)] max-w-xs leading-relaxed">
                    {item.reason}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => handleGenerateClaimLetter(item)}
                      disabled={isGenerating && selectedDiscrepancy?.id === item.id}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs shrink-0 inline-flex"
                      title="Generate formal RBI Bank Nodal Dispute Notice"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{isGenerating && selectedDiscrepancy?.id === item.id ? 'Generating...' : 'Generate Claim Letter'}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <BankRecoveryClaimModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        claimData={claimData}
      />
    </div>
  );
};
