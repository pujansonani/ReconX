import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Meter } from '../ui/Meter';
import { TableWrap, THead, TH, TBody, TR, TD } from '../ui/Table';
import { EmptyState } from '../ui/EmptyState';
import { ReconciliationRunSummary } from '../../types';
import { ChevronRight, Inbox } from 'lucide-react';

interface RecentReconciliationsProps {
  runs: ReconciliationRunSummary[];
  onSelectRun: (runId: string) => void;
  onViewAll: () => void;
  onNewRecon?: () => void;
}

export const RecentReconciliations: React.FC<RecentReconciliationsProps> = ({
  runs,
  onSelectRun,
  onViewAll,
  onNewRecon
}) => {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-fg">Recent Reconciliation Executions</h3>
          <p className="text-xs text-fg-muted">Latest automated payment settlement runs</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewAll}
          iconRight={<ChevronRight className="size-4" />}
        >
          View All Runs
        </Button>
      </div>

      {runs.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-6" />}
          title="No reconciliation runs yet"
          description="Load the 2,000-transaction demo or upload your own ledgers to see matched volumes, exceptions, and variance here."
          action={
            onNewRecon ? (
              <Button variant="primary" size="sm" onClick={onNewRecon}>
                New Reconciliation
              </Button>
            ) : undefined
          }
          size="sm"
        />
      ) : (
        <TableWrap caption="Recent reconciliation runs">
          <THead>
            <TH>Run Name &amp; ID</TH>
            <TH>Scenario</TH>
            <TH numeric>Total Records</TH>
            <TH numeric>Reconciled</TH>
            <TH numeric>Exceptions</TH>
            <TH>Match Rate</TH>
            <TH numeric>Net Variance</TH>
            <TH align="right">Actions</TH>
          </THead>
          <TBody>
            {runs.slice(0, 5).map((run) => (
              <TR
                key={run.id}
                onClick={() => onSelectRun(run.id)}
                activateLabel={`Open ${run.name}`}
              >
                <TD>
                  <div className="font-bold text-fg transition-colors group-hover:text-accent-text">
                    {run.name}
                  </div>
                  <div className="mono text-[11px] text-fg-faint">
                    ID: {run.id.slice(0, 8)} • {new Date(run.created_at).toLocaleDateString()}
                  </div>
                </TD>
                <TD>
                  <Badge
                    variant={
                      run.scenario_type === 'CLEAN'
                        ? 'success'
                        : run.scenario_type === 'MESSY'
                          ? 'warning'
                          : 'purple'
                    }
                  >
                    {run.scenario_type}
                  </Badge>
                </TD>
                <TD numeric className="text-fg-secondary">
                  {run.total_records.toLocaleString()}
                </TD>
                <TD numeric className="font-semibold text-ok-text">
                  {run.reconciled_count.toLocaleString()}
                </TD>
                <TD numeric className="font-semibold text-warn-text">
                  {run.exception_count}
                </TD>
                <TD>
                  <div className="flex items-center gap-2">
                    <Meter
                      value={run.match_rate}
                      tone={run.match_rate >= 95 ? 'ok' : run.match_rate >= 85 ? 'accent' : 'warn'}
                      label={`Match rate for ${run.name}`}
                      className="w-16"
                    />
                    <span className="num font-bold text-fg">{run.match_rate}%</span>
                  </div>
                </TD>
                <TD numeric className="font-semibold text-fg">
                  ₹{run.financial_difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TD>
                <TD align="right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRun(run.id);
                    }}
                  >
                    Explore
                  </Button>
                </TD>
              </TR>
            ))}
          </TBody>
        </TableWrap>
      )}
    </Card>
  );
};
