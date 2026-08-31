import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Download,
  Play,
  Sliders,
  Trash2,
  Zap
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Input } from '../ui/Field';
import { cn } from '../../lib/cn';
import { api } from '../../services/api';

interface FileUploadZoneProps {
  onStartReconciliation: (
    orders: File,
    gateway: File,
    bank: File,
    name: string,
    tolerance: number,
    days: number
  ) => void;
  isLoading?: boolean;
}

export const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onStartReconciliation,
  isLoading = false
}) => {
  const [ordersFile, setOrdersFile] = useState<File | null>(null);
  const [gatewayFile, setGatewayFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);

  const [runName, setRunName] = useState('Payment Settlement Reconciliation Run');
  const [amountTolerance, setAmountTolerance] = useState(0.01);
  const [dateWindowDays, setDateWindowDays] = useState(3);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const ordersInputRef = useRef<HTMLInputElement>(null);
  const gatewayInputRef = useRef<HTMLInputElement>(null);
  const bankInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadSample = (type: 'orders' | 'gateway' | 'bank') => {
    window.open(api.getSampleCsvUrl(type), '_blank');
  };

  const handleLoadSamplesDirectly = async () => {
    try {
      const fetchAndCreateFile = async (url: string, name: string) => {
        const res = await fetch(url);
        const blob = await res.blob();
        return new File([blob], name, { type: 'text/csv' });
      };

      const [oFile, gFile, bFile] = await Promise.all([
        fetchAndCreateFile(api.getSampleCsvUrl('orders'), 'orders.csv'),
        fetchAndCreateFile(api.getSampleCsvUrl('gateway'), 'gateway_settlement.csv'),
        fetchAndCreateFile(api.getSampleCsvUrl('bank'), 'bank_statement.csv')
      ]);

      setOrdersFile(oFile);
      setGatewayFile(gFile);
      setBankFile(bFile);
    } catch (e) {
      console.error('Error loading sample CSVs:', e);
    }
  };

  const canSubmit = ordersFile && gatewayFile && bankFile;

  const renderUploadCard = (
    title: string,
    file: File | null,
    setFile: (f: File | null) => void,
    inputRef: React.RefObject<HTMLInputElement | null>,
    sampleType: 'orders' | 'gateway' | 'bank',
    recommendedCols: string[],
    desc: string
  ) => {
    return (
      <Card
        elevation="none"
        className={cn(
          'flex flex-col justify-between border-2 p-5 transition-colors',
          file
            ? 'border-ok-line bg-ok-soft/40'
            : 'border-dashed border-line-strong bg-surface hover:border-accent'
        )}
      >
        <input
          type="file"
          ref={inputRef as React.RefObject<HTMLInputElement>}
          accept=".csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.[0]) setFile(e.target.files[0]);
          }}
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'rounded-tile p-2',
                  file ? 'bg-ok-soft text-ok-text' : 'bg-subtle text-fg-muted'
                )}
              >
                <FileText className="size-4" />
              </div>
              <h4 className="text-sm font-bold text-fg">{title}</h4>
            </div>
            {file ? (
              <Badge variant="success" dot>
                Loaded
              </Badge>
            ) : (
              <button
                type="button"
                onClick={() => handleDownloadSample(sampleType)}
                className="flex cursor-pointer items-center gap-1 text-[11px] font-semibold text-accent-text hover:underline"
              >
                <Download className="size-3" />
                Sample CSV
              </button>
            )}
          </div>

          <p className="mb-3 text-xs text-fg-muted">{desc}</p>

          {file ? (
            <div className="mb-3 flex items-center justify-between rounded-tile border border-ok-line bg-surface p-3">
              <div className="truncate pr-2">
                <div className="truncate text-xs font-semibold text-fg">{file.name}</div>
                <div className="mono text-[10px] text-fg-muted">
                  {(file.size / 1024).toFixed(1)} KB • CSV Format
                </div>
              </div>
              <button
                onClick={() => setFile(null)}
                className="p-1 text-fg-faint transition-colors hover:text-danger"
                title="Remove file"
                aria-label={`Remove ${title} file`}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mb-3 flex w-full cursor-pointer flex-col items-center justify-center rounded-tile border border-line bg-subtle/70 px-4 py-6 text-center transition-colors hover:bg-accent-soft"
            >
              <UploadCloud className="mb-2 size-7 text-fg-faint" />
              <span className="text-xs font-semibold text-fg-secondary">
                Click to upload or drag &amp; drop
              </span>
              <span className="mt-0.5 text-[10px] text-fg-faint">Supports CSV formatted files</span>
            </button>
          )}
        </div>

        <div className="border-t border-line pt-2">
          <span className="mb-1 block text-[10px] font-bold text-fg-faint uppercase">
            Expected Schema / Columns:
          </span>
          <div className="flex flex-wrap gap-1">
            {recommendedCols.map((col) => (
              <span
                key={col}
                className="mono rounded bg-subtle px-1.5 py-0.5 text-[10px] font-medium text-fg-muted"
              >
                {col}
              </span>
            ))}
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Quick Populate helper */}
      <div className="flex flex-col items-start justify-between gap-3 rounded-card border border-accent-soft-line bg-accent-soft p-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-tile bg-accent text-accent-fg">
            <Zap className="size-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-accent-text">Fast Testing with Realistic Data</h4>
            <p className="text-[11px] text-accent-text/80">
              Need sample datasets? Click to auto-fill with 500+ realistic multi-source payment records.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLoadSamplesDirectly} className="shrink-0">
          Auto-Fill 3 Sample CSVs
        </Button>
      </div>

      {/* 3 Upload Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {renderUploadCard(
          '① Merchant Orders',
          ordersFile,
          setOrdersFile,
          ordersInputRef,
          'orders',
          ['order_id', 'transaction_id', 'order_date', 'gross_amount', 'status'],
          'Internal store order ledger from Shopify, Magento, or custom ERP.'
        )}

        {renderUploadCard(
          '② Payment Gateway',
          gatewayFile,
          setGatewayFile,
          gatewayInputRef,
          'gateway',
          ['transaction_id', 'gateway_ref', 'gross_amount', 'fee', 'net_amount'],
          'Settlement report downloaded from Stripe, Razorpay, or Adyen.'
        )}

        {renderUploadCard(
          '③ Bank Statement',
          bankFile,
          setBankFile,
          bankInputRef,
          'bank',
          ['bank_tx_id', 'date', 'description', 'credit_amount', 'reference'],
          'Inward bank statement feed (HDFC, Chase, SVB, or Barclays).'
        )}
      </div>

      {/* Run Parameters & Execution */}
      <Card className="p-5">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <Input
            label="Reconciliation Run Name"
            value={runName}
            onChange={(e) => setRunName(e.target.value)}
            placeholder="e.g. January 2026 Monthly Gateway Settlement"
            className="w-full sm:w-1/2"
          />

          <div className="flex w-full items-center justify-end gap-3 sm:w-auto">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowAdvanced(!showAdvanced)}
              icon={<Sliders className="size-4" />}
            >
              {showAdvanced ? 'Hide Config' : 'Tolerance Settings'}
            </Button>

            <Button
              variant="primary"
              size="lg"
              disabled={!canSubmit}
              loading={isLoading}
              onClick={() => {
                if (ordersFile && gatewayFile && bankFile) {
                  onStartReconciliation(
                    ordersFile,
                    gatewayFile,
                    bankFile,
                    runName,
                    amountTolerance,
                    dateWindowDays
                  );
                }
              }}
              icon={<Play className="size-4 fill-current" />}
            >
              Run Reconciliation
            </Button>
          </div>
        </div>

        {/* Advanced Config Section */}
        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 gap-4 border-t border-line pt-4 sm:grid-cols-2">
            <Input
              label="Monetary Amount Tolerance (₹ / Currency)"
              type="number"
              step="0.01"
              min="0.0"
              mono
              value={amountTolerance}
              onChange={(e) => setAmountTolerance(parseFloat(e.target.value) || 0.0)}
              hint="Acceptable rounding difference for Tier 2 fuzzy matches (Default: ₹0.01)"
            />

            <Input
              label="Date Settlement Window (Days)"
              type="number"
              step="1"
              min="0"
              max="30"
              mono
              value={dateWindowDays}
              onChange={(e) => setDateWindowDays(parseInt(e.target.value) || 3)}
              hint="Maximum allowed days delta between order, gateway, and bank settlement"
            />
          </div>
        )}
      </Card>
    </div>
  );
};
