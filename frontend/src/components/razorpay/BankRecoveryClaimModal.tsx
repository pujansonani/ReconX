import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  FileText,
  Copy,
  Check,
  Download,
  X,
  ShieldCheck,
  Building2,
  Send,
  Sparkles
} from 'lucide-react';

interface BankRecoveryClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  claimData: {
    letter_text: string;
    ref_no: string;
    overcharge_amount: number;
    bank_name: string;
    generated_at: string;
  } | null;
}

export const BankRecoveryClaimModal: React.FC<BankRecoveryClaimModalProps> = ({
  isOpen,
  onClose,
  claimData
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !claimData) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(claimData.letter_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Recovery Claim Dispute - ${claimData.ref_no}</title>
            <style>
              body { font-family: monospace; padding: 40px; line-height: 1.5; color: #1e293b; }
              pre { white-space: pre-wrap; font-size: 13px; }
            </style>
          </head>
          <body>
            <pre>${claimData.letter_text}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400 flex items-center justify-center text-purple-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">
                Formal RBI-Compliant Bank Recovery Dispute Letter
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                Ref: {claimData.ref_no}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Claim Summary Badge Strip */}
        <div className="px-6 py-3 bg-purple-50 dark:bg-purple-950/50 border-b border-purple-200 dark:border-purple-800/60 flex flex-wrap items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-purple-700 dark:text-purple-300" />
            <span className="font-bold text-purple-900 dark:text-purple-200">
              Disputed Acquirer: {claimData.bank_name}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-muted)]">Recovery Claim Amount:</span>
            <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400 text-sm">
              ₹{claimData.overcharge_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Letter Text Body */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-[var(--text-primary)] leading-relaxed bg-[var(--bg-card-subtle)] whitespace-pre-wrap select-all">
          {claimData.letter_text}
        </div>

        {/* Actions Footer */}
        <div className="p-4 bg-[var(--bg-card)] border-t border-[var(--border-card)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>AI Legal & Regulatory Verifications Certified (PSSA 2007)</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            >
              {copied ? 'Copied to Clipboard' : 'Copy Notice'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              icon={<Download className="w-3.5 h-3.5" />}
            >
              Print / Save PDF
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onClose}
            >
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
