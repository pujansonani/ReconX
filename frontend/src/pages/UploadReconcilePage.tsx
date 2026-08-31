import React, { useState } from 'react';
import { FileUploadZone } from '../components/reconciliation/FileUploadZone';
import { PipelineAnimation } from '../components/reconciliation/PipelineAnimation';
import { api } from '../services/api';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AlertTriangle } from 'lucide-react';

interface UploadReconcilePageProps {
  onReconciliationCompleted: (runId: string) => void;
}

export const UploadReconcilePage: React.FC<UploadReconcilePageProps> = ({
  onReconciliationCompleted
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdRunId, setCreatedRunId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartReconciliation = async (
    orders: File,
    gateway: File,
    bank: File,
    name: string,
    tolerance: number,
    days: number
  ) => {
    try {
      setErrorMessage(null);
      setIsProcessing(true);
      const res = await api.uploadAndReconcile(orders, gateway, bank, name, tolerance, days);
      setCreatedRunId(res.run_id);
    } catch (e: any) {
      console.error('Error starting reconciliation:', e);
      setErrorMessage(e.message || 'Failed to start reconciliation pipeline. Please check file formats.');
      setIsProcessing(false);
    }
  };

  const handlePipelineAnimationFinished = () => {
    setIsProcessing(false);
    if (createdRunId) {
      onReconciliationCompleted(createdRunId);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-extrabold text-[var(--text-primary)] tracking-tight">
            Create New Payment Settlement Reconciliation
          </h1>
          <Badge variant="blue">Multi-Source Ingest</Badge>
        </div>
        <p className="text-xs text-[var(--text-muted)] font-medium">
          Upload Order Ledger, Payment Gateway Settlement Report, and Bank Statement CSVs
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Upload Zone */}
      <FileUploadZone
        onStartReconciliation={handleStartReconciliation}
        isLoading={isProcessing}
      />

      {/* Live Pipeline Tracker Modal */}
      <PipelineAnimation
        isRunning={isProcessing}
        onComplete={handlePipelineAnimationFinished}
      />

      {/* Methodology Guide Footer */}
      <Card className="p-5 bg-[var(--bg-card-subtle)] border border-[var(--border-card)]">
        <h4 className="font-bold text-xs text-[var(--text-primary)] uppercase tracking-wider mb-2">
          ReconX Reconciliation Standards & Normalization
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[var(--text-secondary)]">
          <div>
            <span className="font-bold text-[var(--text-primary)] block mb-0.5">Flexible Column Mapping</span>
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              Auto-detects alias variants (e.g. <code>txn_id</code>, <code>payment_reference</code>, <code>utr</code>, <code>gross_amount</code>) across different gateway providers.
            </p>
          </div>
          <div>
            <span className="font-bold text-[var(--text-primary)] block mb-0.5">Strict Mathematical Balance</span>
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              Verifies: <code>Net Settlement = Gross Sales - Gateway Fee - GST - Refunds - Chargebacks</code>.
            </p>
          </div>
          <div>
            <span className="font-bold text-[var(--text-primary)] block mb-0.5">Zero Hallucinated Payouts</span>
            <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
              Unaccounted lump sums are flagged as <code>UNRESOLVED</code> to prevent artificial matches.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
