import React, { useState, useEffect } from 'react';
import {
  ReconciliationRunSummary,
  MatchDetail,
  ExceptionDetail
} from '../types';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { MetricCards } from '../components/dashboard/MetricCards';
import { TierBreakdownChart } from '../components/dashboard/TierBreakdownChart';
import { TransactionTable } from '../components/reconciliation/TransactionTable';
import { BatchDecompositionView } from '../components/reconciliation/BatchDecompositionView';
import { ExceptionTable } from '../components/exceptions/ExceptionTable';
import { ExceptionDetailDrawer } from '../components/exceptions/ExceptionDetailDrawer';
import {
  ArrowLeft,
  Download,
  FileCheck2,
  Layers,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Info,
  ArrowRight
} from 'lucide-react';

interface ReconciliationDetailPageProps {
  runId: string;
  onBack: () => void;
}

export const ReconciliationDetailPage: React.FC<ReconciliationDetailPageProps> = ({
  runId,
  onBack
}) => {
  const [run, setRun] = useState<ReconciliationRunSummary | null>(null);
  const [matches, setMatches] = useState<MatchDetail[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [exceptions, setExceptions] = useState<ExceptionDetail[]>([]);
  const [batches, setBatches] = useState<MatchDetail[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'overview' | 'matches' | 'batches' | 'exceptions'
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'batches' | 'exceptions'>('overview');

  // Match filters
  const [matchTierFilter, setMatchTierFilter] = useState('ALL');
  const [matchSearch, setMatchSearch] = useState('');

  // Exception filters
  const [excCategoryFilter, setExcCategoryFilter] = useState('ALL');
  const [excSeverityFilter, setExcSeverityFilter] = useState('ALL');
  const [excStatusFilter, setExcStatusFilter] = useState('ALL');
  const [excSearch, setExcSearch] = useState('');

  // Active exception for drawer
  const [activeException, setActiveException] = useState<ExceptionDetail | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchRunData = async () => {
    try {
      setLoading(true);
      const [runData, matchesData, excData, batchData] = await Promise.all([
        api.getReconciliation(runId),
        api.getMatches(runId, matchTierFilter !== 'ALL' ? matchTierFilter : undefined, matchSearch),
        api.getExceptions(runId, excCategoryFilter !== 'ALL' ? excCategoryFilter : undefined, excStatusFilter !== 'ALL' ? excStatusFilter : undefined, excSeverityFilter !== 'ALL' ? excSeverityFilter : undefined),
        api.getBatches(runId)
      ]);
      setRun(runData);
      setMatches(matchesData.matches);
      setTotalMatches(matchesData.total);
      setExceptions(excData.exceptions);
      setBatches(batchData);
    } catch (e) {
      console.error('Error fetching reconciliation run data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRunData();
  }, [runId, matchTierFilter, matchSearch, excCategoryFilter, excSeverityFilter, excStatusFilter]);

  const handleExceptionAction = async (
    exceptionId: string,
    action: 'RESOLVED' | 'ESCALATED' | 'IGNORED',
    notes?: string
  ) => {
    try {
      setIsActionLoading(true);
      const updated = await api.actionException(exceptionId, action, notes);
      setExceptions(prev => prev.map(e => e.id === exceptionId ? updated : e));
      if (activeException && activeException.id === exceptionId) {
        setActiveException(updated);
      }
    } catch (e) {
      console.error('Error updating exception:', e);
    } finally {
      setIsActionLoading(false);
    }
  };

  if (loading && !run) {
    return (
      <div className="py-20 text-center text-[var(--text-muted)]">
        <div className="animate-spin w-8 h-8 border-2 border-[#0077B6] border-t-transparent rounded-full mx-auto mb-3"></div>
        <p className="text-xs font-semibold">Loading reconciliation dataset...</p>
      </div>
    );
  }

  if (!run) {
    return (
      <div className="py-12 text-center text-[var(--text-muted)]">
        <p>Reconciliation run not found.</p>
        <Button variant="outline" size="sm" onClick={onBack} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-primary)] transition-colors shadow-2xs cursor-pointer"
            title="Back to Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">{run.name}</h1>
              <Badge variant={run.scenario_type === 'CLEAN' ? 'success' : run.scenario_type === 'MESSY' ? 'warning' : 'purple'}>
                {run.scenario_type}
              </Badge>
              <Badge variant="success">Completed</Badge>
            </div>
            <p className="text-xs text-[var(--text-muted)] font-mono">
              Run ID: {run.id} • Created on {new Date(run.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(api.getExportUrl(run.id), '_blank')}
            icon={<Download className="w-3.5 h-3.5" />}
            className="font-semibold shadow-xs"
          >
            Export CSV Audit Report
          </Button>
        </div>
      </div>

      {/* Metric Cards Summary */}
      <MetricCards summary={run} />

      {/* Tabs Navigation */}
      <div className="border-b border-[var(--border-card)] flex gap-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'border-[#0077B6] dark:border-[#48CAE4] text-[#0077B6] dark:text-[#48CAE4] font-bold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          Run Overview
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'matches'
              ? 'border-[#0077B6] dark:border-[#48CAE4] text-[#0077B6] dark:text-[#48CAE4] font-bold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FileCheck2 className="w-3.5 h-3.5" />
          Matched Transactions ({totalMatches.toLocaleString()})
        </button>

        <button
          onClick={() => setActiveTab('batches')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'batches'
              ? 'border-[#0077B6] dark:border-[#48CAE4] text-[#0077B6] dark:text-[#48CAE4] font-bold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Tier 3 Netted Batches ({batches.length})
        </button>

        <button
          onClick={() => setActiveTab('exceptions')}
          className={`pb-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
            activeTab === 'exceptions'
              ? 'border-[#0077B6] dark:border-[#48CAE4] text-[#0077B6] dark:text-[#48CAE4] font-bold'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          Discrepancy Exceptions ({exceptions.length})
        </button>
      </div>

      {/* Tab 1: Run Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <TierBreakdownChart
              tierData={{
                'Exact Reference (Tier 1)': run.tier1_exact_count,
                'Amount + Date Window (Tier 2)': run.tier2_fuzzy_count,
                'Batch Decomposition (Tier 3)': run.tier3_batch_count,
                'Exceptions / Unresolved (Tier 4)': run.exception_count
              }}
              totalRecords={run.total_records}
            />

            <Card className="p-5 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-[var(--text-primary)] mb-1">Financial Reconciliation Ledger Balance</h3>
                <p className="text-xs text-[var(--text-muted)] mb-4">Deterministic sum of monetary values across all three sources</p>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)]">
                    <span className="text-[var(--text-muted)] font-medium">Total Merchant Orders Gross</span>
                    <span className="font-bold text-[var(--text-primary)] mono">
                      ₹{run.total_order_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)]">
                    <span className="text-[var(--text-muted)] font-medium">Gateway Settled Gross</span>
                    <span className="font-bold text-[var(--text-primary)] mono">
                      ₹{run.total_gateway_gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)]">
                    <span className="text-[var(--text-muted)] font-medium">Total Deducted Gateway Fees (MDR)</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 mono">
                      -₹{run.total_gateway_fees.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-[var(--bg-card-subtle)] rounded-xl border border-[var(--border-card)]">
                    <span className="text-[var(--text-muted)] font-medium">Net Expected Gateway Settlement</span>
                    <span className="font-bold text-[var(--text-primary)] mono">
                      ₹{run.total_gateway_net.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 dark:bg-emerald-950/50 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">Total Inward Bank Statement Credit</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-300 mono">
                      ₹{run.total_bank_credit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] font-medium">Net Ledger Discrepancy Variance:</span>
                <span className={`font-bold mono text-sm ${run.financial_difference === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  ₹{run.financial_difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </Card>
          </div>

          {/* Quick Previews of All 3 Datasets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 1. Matched Transactions Card */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <h4 className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">Matched Transactions</h4>
                  </div>
                  <Badge variant="success">{totalMatches} Reconciled</Badge>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  Tiers 1 & 2 exact and date-window correlated records.
                </p>
                <div className="space-y-1.5 text-xs mono">
                  {matches.slice(0, 3).map((m) => (
                    <div key={m.id} className="p-2 bg-[var(--bg-card-subtle)] rounded-lg border border-[var(--border-card)] flex items-center justify-between">
                      <span className="truncate font-medium text-[var(--text-primary)]">{m.order_ids[0] || m.gateway_ids[0] || m.id.slice(0, 8)}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{m.gross_amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('matches')}
                className="mt-4 w-full"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Open Match Explorer ({totalMatches})
              </Button>
            </Card>

            {/* 2. Netted Batch Settlements Card */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#0077B6] dark:text-[#48CAE4]" />
                    <h4 className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">Tier 3 Netted Batches</h4>
                  </div>
                  <Badge variant="blue">{batches.length} Solved</Badge>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  Multi-charge consolidated bank payouts decomposed to ₹0.00.
                </p>
                <div className="space-y-1.5 text-xs mono">
                  {batches.slice(0, 3).map((b) => (
                    <div key={b.id} className="p-2 bg-[var(--bg-card-subtle)] rounded-lg border border-[var(--border-card)] flex items-center justify-between">
                      <span className="truncate font-medium text-[var(--text-primary)]">{b.bank_ids[0] || b.id.slice(0, 8)}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{b.bank_settlement.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('batches')}
                className="mt-4 w-full"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Inspect Batch Solver ({batches.length})
              </Button>
            </Card>

            {/* 3. Discrepancy Exceptions Card */}
            <Card className="p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    <h4 className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider">Discrepancy Exceptions</h4>
                  </div>
                  <Badge variant="danger">{exceptions.length} Flagged</Badge>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-3">
                  AI root causes and double-entry journal entry drafts.
                </p>
                <div className="space-y-1.5 text-xs mono">
                  {exceptions.slice(0, 3).map((e) => (
                    <div key={e.id} className="p-2 bg-[var(--bg-card-subtle)] rounded-lg border border-[var(--border-card)] flex items-center justify-between">
                      <span className="truncate font-medium text-[var(--text-primary)]">{e.category}</span>
                      <span className="text-rose-600 dark:text-rose-400 font-bold">₹{e.discrepancy_amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('exceptions')}
                className="mt-4 w-full"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Investigate Exceptions ({exceptions.length})
              </Button>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: Matched Transactions (Tier 1 & 2) */}
      {activeTab === 'matches' && (
        <TransactionTable
          matches={matches}
          totalMatches={totalMatches}
          selectedTier={matchTierFilter}
          onSelectTier={setMatchTierFilter}
          searchQuery={matchSearch}
          onSearchChange={setMatchSearch}
        />
      )}

      {/* Tab 3: Netted Batch Decomposition (Tier 3) */}
      {activeTab === 'batches' && (
        <BatchDecompositionView batches={batches} />
      )}

      {/* Tab 4: Discrepancy Exceptions (Tier 4) */}
      {activeTab === 'exceptions' && (
        <ExceptionTable
          exceptions={exceptions}
          onInspectException={(exc) => setActiveException(exc)}
          selectedCategory={excCategoryFilter}
          onSelectCategory={setExcCategoryFilter}
          selectedSeverity={excSeverityFilter}
          onSelectSeverity={setExcSeverityFilter}
          selectedStatus={excStatusFilter}
          onSelectStatus={setExcStatusFilter}
          searchQuery={excSearch}
          onSearchChange={setExcSearch}
        />
      )}

      {/* Exception Investigation Drawer */}
      <ExceptionDetailDrawer
        exception={activeException}
        onClose={() => setActiveException(null)}
        onAction={handleExceptionAction}
        isActionLoading={isActionLoading}
      />
    </div>
  );
};
