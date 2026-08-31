import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { MatchDetail } from '../../types';
import { Search, Eye, CheckCircle2, ShieldCheck, Scale, Layers } from 'lucide-react';

interface TransactionTableProps {
  matches: MatchDetail[];
  totalMatches: number;
  selectedTier: string;
  onSelectTier: (tier: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  matches,
  totalMatches,
  selectedTier,
  onSelectTier,
  searchQuery,
  onSearchChange
}) => {
  const [inspectMatch, setInspectMatch] = useState<MatchDetail | null>(null);

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'TIER_1_EXACT':
        return (
          <Badge variant="blue" size="sm">
            <ShieldCheck className="w-3 h-3" /> Tier 1 Exact
          </Badge>
        );
      case 'TIER_2_DATE_AMOUNT':
        return (
          <Badge variant="purple" size="sm">
            <Scale className="w-3 h-3" /> Tier 2 Fuzzy
          </Badge>
        );
      case 'TIER_3_NET_BATCH':
        return (
          <Badge variant="success" size="sm">
            <Layers className="w-3 h-3" /> Tier 3 Batch
          </Badge>
        );
      default:
        return <Badge variant="neutral">{tier}</Badge>;
    }
  };

  return (
    <Card className="p-5 bg-[var(--bg-card)] border border-[var(--border-card)]">
      {/* Filters & Search Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full sm:w-auto">
          {[
            { id: 'ALL', label: 'All Matches' },
            { id: 'TIER_1_EXACT', label: 'Tier 1 Exact' },
            { id: 'TIER_2_DATE_AMOUNT', label: 'Tier 2 Amount/Date' },
            { id: 'TIER_3_NET_BATCH', label: 'Tier 3 Netted Batch' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => onSelectTier(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTier === tab.id
                  ? 'bg-[#0077B6] text-white font-bold shadow-xs'
                  : 'bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-card)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by ID or Reference..."
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-[var(--border-card)] focus:outline-none focus:ring-2 focus:ring-[#0077B6] bg-[var(--bg-card)] text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* Dense Transaction Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-card)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[10px] bg-[var(--bg-card-subtle)]">
              <th className="py-2.5 px-3">Matching Tier</th>
              <th className="py-2.5 px-3">Order ID(s)</th>
              <th className="py-2.5 px-3">Gateway Tx ID(s)</th>
              <th className="py-2.5 px-3">Bank Reference</th>
              <th className="py-2.5 px-3">Gross Amount</th>
              <th className="py-2.5 px-3">Gateway Fees</th>
              <th className="py-2.5 px-3">Net Settlement</th>
              <th className="py-2.5 px-3">Confidence</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-card)] font-medium text-[var(--text-primary)]">
            {matches.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-8 text-center text-[var(--text-muted)]">
                  No matching transactions found matching the filter criteria.
                </td>
              </tr>
            ) : (
              matches.map((m) => (
                <tr key={m.id} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                  <td className="py-3 px-3">{getTierBadge(m.match_tier)}</td>
                  <td className="py-3 px-3 font-semibold text-[var(--text-primary)] mono">
                    {m.order_ids.length > 1
                      ? `${m.order_ids[0]} (+${m.order_ids.length - 1} more)`
                      : m.order_ids[0] || 'N/A'}
                  </td>
                  <td className="py-3 px-3 mono text-[var(--text-secondary)]">
                    {m.gateway_ids.length > 1
                      ? `${m.gateway_ids[0]} (+${m.gateway_ids.length - 1} txs)`
                      : m.gateway_ids[0] || 'N/A'}
                  </td>
                  <td className="py-3 px-3 mono text-[var(--text-muted)]">
                    {m.bank_ids[0] || 'Inward Batch Payout'}
                  </td>
                  <td className="py-3 px-3 mono tabular-nums text-[var(--text-primary)] font-semibold">
                    ₹{m.gross_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 mono tabular-nums text-rose-600 dark:text-rose-400">
                    ₹{m.gateway_fees.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 mono tabular-nums text-emerald-600 dark:text-emerald-400 font-bold">
                    ₹{m.net_settlement.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 mono tabular-nums">
                    <span className="font-bold text-[var(--text-primary)]">{m.confidence_score}%</span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setInspectMatch(m)}
                      className="p-1.5 rounded-lg hover:bg-[var(--bg-card-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border border-[var(--border-card)]"
                      title="Inspect side-by-side evidence"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Side-by-Side Match Inspection Modal */}
      <Modal
        isOpen={!!inspectMatch}
        onClose={() => setInspectMatch(null)}
        title={
          <div className="flex items-center gap-2">
            <span>Match Evidence Verification</span>
            {inspectMatch && getTierBadge(inspectMatch.match_tier)}
          </div>
        }
        maxWidth="4xl"
      >
        {inspectMatch && (
          <div className="space-y-5 text-[var(--text-primary)]">
            {/* Top Summary Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 bg-[var(--bg-card-subtle)] rounded-2xl border border-[var(--border-card)] text-xs">
              <div>
                <span className="text-[var(--text-muted)] font-semibold block">Confidence Score</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mono">{inspectMatch.confidence_score}% Match</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-semibold block">Match Method</span>
                <span className="font-semibold text-[var(--text-primary)] mono">{inspectMatch.match_method}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-semibold block">Net Payout to Bank</span>
                <span className="text-base font-bold text-[var(--text-primary)] mono">₹{inspectMatch.net_settlement.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[var(--text-muted)] font-semibold block">Mathematical Variance</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mono">₹{inspectMatch.difference.toFixed(2)}</span>
              </div>
            </div>

            {/* 3-Way Side-by-Side Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Merchant Order Card */}
              <div className="p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] shadow-2xs space-y-2">
                <div className="font-bold text-[var(--text-primary)] pb-2 mb-2 border-b border-[var(--border-card)] flex items-center justify-between">
                  <span>① Merchant Order</span>
                  <Badge variant="blue">Order Ledger</Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px]">Order ID</span>
                    <span className="font-semibold text-[var(--text-primary)] mono">{inspectMatch.order_ids.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px]">Gross Amount</span>
                    <span className="font-bold text-[var(--text-primary)] mono">₹{inspectMatch.gross_amount.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px]">Status</span>
                    <span className="font-medium text-emerald-600 dark:text-emerald-400">COMPLETED</span>
                  </div>
                </div>
              </div>

              {/* Gateway Settlement Card */}
              <div className="p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] shadow-2xs space-y-2">
                <div className="font-bold text-[var(--text-primary)] pb-2 mb-2 border-b border-[var(--border-card)] flex items-center justify-between">
                  <span>② Payment Gateway</span>
                  <Badge variant="purple">Gateway Settlement</Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px]">Transaction ID(s)</span>
                    <span className="font-semibold text-[var(--text-primary)] mono truncate block">{inspectMatch.gateway_ids.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-[var(--text-muted)] block text-[11px]">Fee (1.8%)</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400 mono">₹{inspectMatch.gateway_fees.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block text-[11px]">GST (18%)</span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400 mono">₹{inspectMatch.gst_amount.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px]">Net Payout Amount</span>
                    <span className="font-bold text-[var(--text-primary)] mono">₹{inspectMatch.net_settlement.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Bank Statement Card */}
              <div className="p-4 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] shadow-2xs space-y-2">
                <div className="font-bold text-[var(--text-primary)] pb-2 mb-2 border-b border-[var(--border-card)] flex items-center justify-between">
                  <span>③ Bank Statement</span>
                  <Badge variant="success">Bank Feed</Badge>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px]">Bank Entry ID</span>
                    <span className="font-semibold text-[var(--text-primary)] mono">{inspectMatch.bank_ids.join(', ')}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px]">Inward Credit Amount</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 mono">₹{inspectMatch.bank_settlement.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block text-[11px]">Reconciliation Status</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled (₹0.00 Variance)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Evidence Metadata */}
            <div className="p-3.5 bg-slate-900 rounded-2xl text-slate-200 text-xs mono border border-slate-800">
              <span className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">Deterministic Engine Audit Log:</span>
              <pre className="whitespace-pre-wrap text-[11px] overflow-x-auto">{JSON.stringify(inspectMatch.evidence, null, 2)}</pre>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};
