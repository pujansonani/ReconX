import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Meter } from '../components/ui/Meter';
import { PageHeader } from '../components/ui/PageHeader';
import { Select, SearchInput } from '../components/ui/Field';
import { TableWrap, THead, TH, TBody, TR, TD } from '../components/ui/Table';
import { EmptyState } from '../components/ui/EmptyState';
import { ReconciliationRunSummary } from '../types';
import { PlusCircle, Download, Zap, Inbox, SearchX } from 'lucide-react';
import { api } from '../services/api';

interface ReconciliationsPageProps {
  runs: ReconciliationRunSummary[];
  onSelectRun: (runId: string) => void;
  onNewRecon: () => void;
  onTryDemo: () => void;
  loadingDemo?: boolean;
}

const SCENARIO_OPTIONS = [
  { value: 'ALL', label: 'All Scenarios' },
  { value: 'CLEAN', label: 'Clean (Clean Matches)' },
  { value: 'MESSY', label: 'Messy (Variances)' },
  { value: 'ADVERSARIAL', label: 'Adversarial (Edge Cases)' },
  { value: 'CUSTOM', label: 'Custom Uploads' }
];

export const ReconciliationsPage: React.FC<ReconciliationsPageProps> = ({
  runs,
  onSelectRun,
  onNewRecon,
  onTryDemo,
  loadingDemo = false
}) => {
  const [search, setSearch] = useState('');
  const [scenarioFilter, setScenarioFilter] = useState('ALL');

  const filteredRuns = runs.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    const matchesScenario = scenarioFilter === 'ALL' || r.scenario_type === scenarioFilter;
    return matchesSearch && matchesScenario;
  });

  const hasFilters = search.trim() !== '' || scenarioFilter !== 'ALL';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reconciliation Directory"
        meta={<Badge variant="blue">{runs.length} Runs Recorded</Badge>}
        description="Historical settlement audit runs, multi-tier match rates, and exports"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={onTryDemo}
              loading={loadingDemo}
              icon={<Zap className="size-3.5 fill-warn text-warn" />}
              className="border-warn-line bg-warn-soft font-semibold text-warn-text hover:border-warn"
            >
              Preload 2,000 tx Demo
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onNewRecon}
              icon={<PlusCircle className="size-3.5" />}
              className="font-semibold"
            >
              New Reconciliation
            </Button>
          </>
        }
      />

      <Card className="p-5">
        <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <Select
            value={scenarioFilter}
            onChange={(e) => setScenarioFilter(e.target.value)}
            options={SCENARIO_OPTIONS}
            className="w-full sm:w-56"
          />
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search by run name or ID…"
            label="Search reconciliation runs"
            className="w-full sm:w-64"
          />
        </div>

        {filteredRuns.length === 0 ? (
          hasFilters ? (
            <EmptyState
              icon={<SearchX className="size-6" />}
              title="No runs match your filters"
              description="Try a different scenario or clear the search to see every recorded run."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setScenarioFilter('ALL');
                  }}
                >
                  Clear filters
                </Button>
              }
              size="sm"
            />
          ) : (
            <EmptyState
              icon={<Inbox className="size-6" />}
              title="No reconciliation runs yet"
              description="Load the 2,000-transaction demo or start a new reconciliation to populate the directory with match rates, exceptions, and variance."
              action={
                <Button variant="primary" size="sm" onClick={onNewRecon} icon={<PlusCircle className="size-3.5" />}>
                  New Reconciliation
                </Button>
              }
              secondaryAction={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onTryDemo}
                  loading={loadingDemo}
                  icon={<Zap className="size-3.5 fill-warn text-warn" />}
                >
                  Preload Demo
                </Button>
              }
              size="sm"
            />
          )
        ) : (
          <TableWrap caption="Reconciliation directory">
            <THead>
              <TH>Run Name &amp; Execution ID</TH>
              <TH>Scenario</TH>
              <TH numeric>Total Records</TH>
              <TH numeric>Reconciled</TH>
              <TH numeric>Exceptions</TH>
              <TH>Match Rate</TH>
              <TH numeric>Net Variance</TH>
              <TH>Created</TH>
              <TH align="right">Actions</TH>
            </THead>
            <TBody>
              {filteredRuns.map((r) => (
                <TR key={r.id} onClick={() => onSelectRun(r.id)} activateLabel={`Open ${r.name}`}>
                  <TD>
                    <div className="font-bold text-fg transition-colors group-hover:text-accent-text">
                      {r.name}
                    </div>
                    <div className="mono text-[11px] text-fg-faint">ID: {r.id.slice(0, 8)}…</div>
                  </TD>
                  <TD>
                    <Badge
                      variant={
                        r.scenario_type === 'CLEAN'
                          ? 'success'
                          : r.scenario_type === 'MESSY'
                            ? 'warning'
                            : 'purple'
                      }
                    >
                      {r.scenario_type}
                    </Badge>
                  </TD>
                  <TD numeric className="text-fg-secondary">
                    {r.total_records.toLocaleString()}
                  </TD>
                  <TD numeric className="font-bold text-ok-text">
                    {r.reconciled_count.toLocaleString()}
                  </TD>
                  <TD numeric className="font-bold text-warn-text">
                    {r.exception_count}
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <Meter
                        value={r.match_rate}
                        tone={r.match_rate >= 95 ? 'ok' : r.match_rate >= 85 ? 'accent' : 'warn'}
                        label={`Match rate for ${r.name}`}
                        className="w-14"
                      />
                      <span className="num font-bold text-fg">{r.match_rate}%</span>
                    </div>
                  </TD>
                  <TD numeric className="font-semibold text-fg">
                    ₹{r.financial_difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TD>
                  <TD className="text-fg-muted">{new Date(r.created_at).toLocaleDateString()}</TD>
                  <TD align="right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => window.open(api.getExportUrl(r.id), '_blank')}
                        className="cursor-pointer rounded-md p-1.5 text-fg-muted transition-colors hover:bg-subtle hover:text-fg focus-visible:bg-subtle"
                        title="Export CSV"
                        aria-label={`Export ${r.name} as CSV`}
                      >
                        <Download className="size-4" />
                      </button>
                      <Button variant="outline" size="sm" onClick={() => onSelectRun(r.id)}>
                        Open
                      </Button>
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </TableWrap>
        )}
      </Card>
    </div>
  );
};
