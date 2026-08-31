import React from 'react';
import { TierBreakdownChart } from '../components/dashboard/TierBreakdownChart';
import { ExceptionCategoryChart } from '../components/dashboard/ExceptionCategoryChart';
import { SettlementTrendChart } from '../components/dashboard/SettlementTrendChart';
import { MetricCards } from '../components/dashboard/MetricCards';
import { DashboardAnalytics, ReconciliationRunSummary } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

interface AnalyticsPageProps {
  analytics: DashboardAnalytics | null;
  runs: ReconciliationRunSummary[];
  onSelectCategoryFilter?: (cat: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  analytics,
  runs,
  onSelectCategoryFilter,
  onNavigateTab
}) => {
  const latestRun = analytics?.latest_run || (runs.length > 0 ? runs[0] : null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Reconciliation Analytics & Trends</h1>
          <Badge variant="blue">Multi-Cycle Telemetry</Badge>
        </div>
        <p className="text-xs text-[var(--text-muted)] font-medium">
          Comprehensive match rate trends, tier performance breakdown, and exception category analytics
        </p>
      </div>

      {/* Aggregate KPI Cards */}
      <MetricCards summary={latestRun} platformSummary={analytics?.summary} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <TierBreakdownChart
          tierData={analytics?.tier_distribution || {}}
          totalRecords={latestRun ? latestRun.total_records : 0}
        />

        <ExceptionCategoryChart
          categories={analytics?.exception_breakdown || {}}
          onSelectCategory={(cat) => {
            if (onSelectCategoryFilter) onSelectCategoryFilter(cat);
            onNavigateTab('exceptions');
          }}
        />
      </div>

      {/* Full Width Settlement Trend */}
      <div>
        <SettlementTrendChart trendData={analytics?.trend || []} />
      </div>

      {/* Performance Standards Card */}
      <Card className="p-6 bg-[#0F172A] text-white border border-slate-800 rounded-3xl shadow-xl">
        <h3 className="font-extrabold text-sm text-white mb-3">Reconciliation Engine Performance Standards</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Tier 1: Exact Match</span>
            <span className="text-base font-bold text-sky-400 mono">100% Confidence</span>
            <p className="text-[11px] text-slate-400 mt-1">Hash index lookup across transaction and gateway references</p>
          </div>
          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Tier 2: Amount/Date</span>
            <span className="text-base font-bold text-sky-400 mono">90-98% Confidence</span>
            <p className="text-[11px] text-slate-400 mt-1">Bounded by +/- ₹0.01 tolerance and +/- 3 day settlement window</p>
          </div>
          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Tier 3: Batch Solver</span>
            <span className="text-base font-bold text-emerald-400 mono">₹0.00 Variance</span>
            <p className="text-[11px] text-slate-400 mt-1">Reconstructs gross, fees, GST, refunds, and chargebacks</p>
          </div>
          <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Tier 4: Safety</span>
            <span className="text-base font-bold text-emerald-400 mono">0 Forced Matches</span>
            <p className="text-[11px] text-slate-400 mt-1">Deliberate unresolvable anomalies are escalated directly</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
