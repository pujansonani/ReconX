import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Select, SearchInput } from '../ui/Field';
import { TableWrap, THead, TH, TBody, TR, TD } from '../ui/Table';
import { EmptyState } from '../ui/EmptyState';
import { ExceptionDetail } from '../../types';
import { SearchX, Sparkles } from 'lucide-react';

interface ExceptionTableProps {
  exceptions: ExceptionDetail[];
  onInspectException: (exc: ExceptionDetail) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedSeverity: string;
  onSelectSeverity: (sev: string) => void;
  selectedStatus: string;
  onSelectStatus: (status: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const ExceptionTable: React.FC<ExceptionTableProps> = ({
  exceptions,
  onInspectException,
  selectedCategory,
  onSelectCategory,
  selectedSeverity,
  onSelectSeverity,
  selectedStatus,
  onSelectStatus,
  searchQuery,
  onSearchChange
}) => {
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
    <Card className="p-5">
      {/* Search & Filters */}
      <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <Select
            aria-label="Filter by category"
            value={selectedCategory}
            onChange={(e) => onSelectCategory(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            <option value="TIMING_DIFFERENCE">Timing Difference</option>
            <option value="FEE_MISMATCH">Fee Mismatch</option>
            <option value="PARTIAL_REFUND">Partial Refund</option>
            <option value="CHARGEBACK">Chargeback</option>
            <option value="MISSING_ORDER">Missing Order</option>
            <option value="MISSING_GATEWAY_RECORD">Missing Gateway Record</option>
            <option value="UNRESOLVED">Unresolved (Critical)</option>
          </Select>

          <Select
            aria-label="Filter by severity"
            value={selectedSeverity}
            onChange={(e) => onSelectSeverity(e.target.value)}
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </Select>

          <Select
            aria-label="Filter by status"
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="REQUIRES_REVIEW">Requires Review</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated</option>
            <option value="IGNORED">Ignored</option>
          </Select>
        </div>

        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search exceptions…"
          label="Search exceptions"
          className="w-full sm:w-64"
        />
      </div>

      {/* Exception Table */}
      {exceptions.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" />}
          title="No matching exceptions"
          description="No exceptions match the current filters. Try widening the category, severity, or status filter — or clear your search."
          action={
            searchQuery ? (
              <Button variant="outline" size="sm" onClick={() => onSearchChange('')}>
                Clear search
              </Button>
            ) : undefined
          }
          size="sm"
        />
      ) : (
        <TableWrap caption="Reconciliation exceptions">
          <THead>
            <TH>Code &amp; IDs</TH>
            <TH>Category</TH>
            <TH>Severity</TH>
            <TH numeric>Discrepancy Amount</TH>
            <TH>AI Narrative</TH>
            <TH>Status</TH>
            <TH align="right">Action</TH>
          </THead>
          <TBody>
            {exceptions.map((exc) => (
              <TR
                key={exc.id}
                onClick={() => onInspectException(exc)}
                tone={exc.category === 'UNRESOLVED' ? 'danger' : 'default'}
                activateLabel={`Investigate exception ${exc.exception_code}`}
              >
                <TD>
                  <div className="mono font-bold text-fg">{exc.exception_code}</div>
                  <div className="mono text-[11px] text-fg-faint">
                    {exc.gateway_ids[0] || exc.order_ids[0] || exc.bank_ids[0] || 'Unlinked'}
                  </div>
                </TD>
                <TD className="font-semibold text-fg">{exc.category.replace(/_/g, ' ')}</TD>
                <TD>{getSeverityBadge(exc.severity)}</TD>
                <TD numeric className="font-bold text-danger-text">
                  ₹{exc.discrepancy_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TD>
                <TD className="max-w-xs">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="size-3 shrink-0 text-accent" aria-hidden="true" />
                    <span className="truncate">{exc.ai_explanation || exc.deterministic_reason}</span>
                  </span>
                </TD>
                <TD>{getStatusBadge(exc.status)}</TD>
                <TD align="right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectException(exc);
                    }}
                  >
                    Investigate
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
