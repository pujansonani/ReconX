import React from 'react';
import { MetricCards } from '../components/dashboard/MetricCards';
import { TierBreakdownChart } from '../components/dashboard/TierBreakdownChart';
import { ExceptionCategoryChart } from '../components/dashboard/ExceptionCategoryChart';
import { SettlementTrendChart } from '../components/dashboard/SettlementTrendChart';
import { RecentReconciliations } from '../components/dashboard/RecentReconciliations';
import { LiveActivityStream } from '../components/live/LiveActivityStream';
import { ReconciliationRunSummary, DashboardAnalytics } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PageHeader } from '../components/ui/PageHeader';
import { Skeleton, SkeletonRegion, SkeletonStat, SkeletonChart, SkeletonTable } from '../components/ui/Skeleton';
import { PlusCircle, FlaskConical } from 'lucide-react';

interface DashboardPageProps {
  analytics: DashboardAnalytics | null;
  runs: ReconciliationRunSummary[];
  onSelectRun: (runId: string) => void;
  onNewRecon: () => void;
  onTryDemo: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectCategoryFilter?: (cat: string) => void;
  loading?: boolean;
  loadingDemo?: boolean;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  analytics,
  runs,
  onSelectRun,
  onNewRecon,
  onTryDemo,
  onNavigateTab,
  onSelectCategoryFilter,
  loading = false,
  loadingDemo = false
}) => {
  const latestRun = analytics?.latest_run || (runs.length > 0 ? runs[0] : null);
  const isInitialLoad = loading && !analytics && runs.length === 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Settlement Operations Dashboard"
        meta={<Badge variant="success">Real-Time Sync Active</Badge>}
        description="Autonomous 3-way matching across Merchant Orders, Gateway Settlements, and Bank Statements"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('evaluation')}
              icon={<FlaskConical className="w-3.5 h-3.5" />}
            >
              Zero Forced Matches Standard
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={onNewRecon}
              icon={<PlusCircle className="w-3.5 h-3.5" />}
            >
              New Reconciliation
            </Button>
          </>
        }
      />

      {/* Real-Time Stream Ingestion Ticker & Simulator Bar */}
      <LiveActivityStream />

      {isInitialLoad ? (
        <SkeletonRegion label="Loading settlement operations dashboard" className="space-y-6">
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonStat key={i} />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <SkeletonChart className="lg:col-span-1" height={180} />
            <SkeletonChart className="lg:col-span-2" height={180} />
          </div>
          <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-12">
            <SkeletonChart className="lg:col-span-7" />
            <div className="rounded-card border border-line bg-surface p-5 shadow-e1 lg:col-span-5">
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="mt-2 h-2.5 w-40" />
              <div className="mt-4">
                <SkeletonTable rows={5} columns={5} />
              </div>
            </div>
          </div>
        </SkeletonRegion>
      ) : (
        <>
          {/* Real-Time Operations Telemetry Metrics */}
          <MetricCards summary={latestRun} platformSummary={analytics?.summary} />

          {/* Interactive Operational Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Tier Matching Cascade Distribution */}
            <div className="lg:col-span-1">
              <TierBreakdownChart
                tierData={analytics?.tier_distribution || {}}
                totalRecords={analytics?.summary?.total_records || latestRun?.total_records || 2000}
              />
            </div>

            {/* Exception Taxonomy Breakdown */}
            <div className="lg:col-span-2">
              <ExceptionCategoryChart
                categories={analytics?.exception_breakdown || {}}
                onSelectCategory={(cat) => {
                  if (onSelectCategoryFilter) onSelectCategoryFilter(cat);
                  onNavigateTab('exceptions');
                }}
              />
            </div>
          </div>

          {/* Settlement Match Rate Trend & Recents */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-7">
              <SettlementTrendChart trendData={analytics?.trend || []} />
            </div>

            <div className="lg:col-span-5">
              <RecentReconciliations
                runs={runs.slice(0, 5)}
                onSelectRun={onSelectRun}
                onViewAll={() => onNavigateTab('reconciliations')}
                onNewRecon={onNewRecon}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
