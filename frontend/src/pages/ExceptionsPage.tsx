import React, { useState, useEffect } from 'react';
import { ExceptionTable } from '../components/exceptions/ExceptionTable';
import { ExceptionDetailDrawer } from '../components/exceptions/ExceptionDetailDrawer';
import { ExceptionDetail, ReconciliationRunSummary } from '../types';
import { api } from '../services/api';
import { updateExceptionInFirestore } from '../services/firestoreService';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ShieldAlert } from 'lucide-react';

interface ExceptionsPageProps {
  runs: ReconciliationRunSummary[];
  initialCategory?: string;
}

export const ExceptionsPage: React.FC<ExceptionsPageProps> = ({
  runs,
  initialCategory = 'ALL'
}) => {
  const [selectedRunId, setSelectedRunId] = useState<string>(runs.length > 0 ? runs[0].id : '');
  const [exceptions, setExceptions] = useState<ExceptionDetail[]>([]);
  const [activeException, setActiveException] = useState<ExceptionDetail | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchExceptions = async () => {
    if (!selectedRunId) return;
    try {
      setLoading(true);
      const res = await api.getExceptions(
        selectedRunId,
        categoryFilter !== 'ALL' ? categoryFilter : undefined,
        statusFilter !== 'ALL' ? statusFilter : undefined,
        severityFilter !== 'ALL' ? severityFilter : undefined
      );
      setExceptions(res.exceptions);
    } catch (e) {
      console.error('Error fetching exceptions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (runs.length > 0 && !selectedRunId) {
      setSelectedRunId(runs[0].id);
    }
  }, [runs]);

  useEffect(() => {
    fetchExceptions();
  }, [selectedRunId, categoryFilter, severityFilter, statusFilter]);

  const handleAction = async (
    id: string,
    action: 'RESOLVED' | 'ESCALATED' | 'IGNORED',
    notes?: string
  ) => {
    try {
      setIsActionLoading(true);
      const updated = await api.actionException(id, action, notes);
      setExceptions(prev => prev.map(e => e.id === id ? updated : e));
      if (activeException && activeException.id === id) {
        setActiveException(updated);
      }

      // Synchronize update to Cloud Firestore in real time
      await updateExceptionInFirestore(selectedRunId, id, {
        status: action,
        resolution_notes: notes,
        resolved_by: 'Controller (Firebase Auth)',
        action: action
      });
    } catch (e) {
      console.error('Error updating exception:', e);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">Exception Investigation Hub</h1>
            <Badge variant="warning">{exceptions.length} Flagged</Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-medium">
            AI root-cause classification, double-entry journal suggestions, and human-in-the-loop audit actions
          </p>
        </div>

        {/* Run Selector */}
        {runs.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-muted)] font-semibold">Active Run:</span>
            <select
              value={selectedRunId}
              onChange={(e) => setSelectedRunId(e.target.value)}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-2xs outline-none"
            >
              {runs.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.exception_count} exc)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Critical Highlight Banner for Deliberate Unresolvable Anomaly */}
      <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-rose-950 dark:text-rose-200">
              Zero-Forced-Match Policy Enforcement
            </h3>
            <p className="text-xs text-rose-900 dark:text-rose-300">
              When no defensible financial arithmetic combination exists (e.g. ₹75,420 unexplained bank credit), ReconX strictly escalates without guessing or fabricating numbers.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setCategoryFilter('UNRESOLVED');
          }}
          className="bg-[var(--bg-card)] border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 shrink-0 font-semibold"
        >
          View Unresolvable Cases
        </Button>
      </div>

      {/* Exception Table */}
      <ExceptionTable
        exceptions={exceptions}
        onInspectException={(exc) => setActiveException(exc)}
        selectedCategory={categoryFilter}
        onSelectCategory={setCategoryFilter}
        selectedSeverity={severityFilter}
        onSelectSeverity={setSeverityFilter}
        selectedStatus={statusFilter}
        onSelectStatus={setStatusFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Detail Drawer */}
      <ExceptionDetailDrawer
        exception={activeException}
        onClose={() => setActiveException(null)}
        onAction={handleAction}
        isActionLoading={isActionLoading}
      />
    </div>
  );
};
