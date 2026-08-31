import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Webhook,
  Play,
  CheckCircle2,
  Lock,
  Code2,
  ArrowRight,
  Sparkles,
  Zap,
  RefreshCw
} from 'lucide-react';
import { api } from '../../services/api';

export const LiveWebhookStreamSimulator: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<string>('settlement.processed');
  const [testAmount, setTestAmount] = useState<number>(14500.0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastResult, setLastResult] = useState<any | null>(null);

  const handleSimulateWebhook = async () => {
    try {
      setIsSimulating(true);
      const res = await api.simulateRazorpayWebhook({
        event: selectedEvent,
        amount: testAmount,
        order_id: `order_recon_${Math.floor(Math.random() * 90000 + 10000)}`
      });
      setLastResult(res);
    } catch (e) {
      console.error('Error simulating webhook:', e);
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <Card className="p-6 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[var(--border-card)]">
        <div className="flex items-center gap-2">
          <Webhook className="w-4 h-4 text-emerald-500" />
          <div>
            <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
              Razorpay Webhook Payload Ingest & Signature Verification Simulator
            </h3>
            <span className="text-[11px] text-[var(--text-muted)]">
              Simulate incoming webhook events with HMAC SHA-256 signature verification & immediate 3-way reconciliation
            </span>
          </div>
        </div>
        <Badge variant="success">HMAC-SHA256 Ready</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls */}
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1">
              Select Razorpay Event Type
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-xs outline-none focus:ring-2 focus:ring-[#0077B6]"
            >
              <option value="settlement.processed">settlement.processed (Batch Payout Cleared)</option>
              <option value="payment.captured">payment.captured (Instant Merchant Charge)</option>
              <option value="refund.processed">refund.processed (Customer Refund Adjusted)</option>
              <option value="dispute.created">dispute.created (Chargeback Debit Anomaly)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-[var(--text-primary)] block mb-1">
              Gross Transaction Amount (₹)
            </label>
            <input
              type="number"
              value={testAmount}
              onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] font-mono text-xs outline-none focus:ring-2 focus:ring-[#0077B6]"
            />
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleSimulateWebhook}
            loading={isSimulating}
            icon={<Play className="w-4 h-4 fill-current" />}
            className="w-full font-bold shadow-sm"
          >
            Dispatch & Verify Webhook
          </Button>
        </div>

        {/* Payload / Result Output */}
        <div className="lg:col-span-2 p-4 bg-[var(--bg-card-subtle)] rounded-2xl border border-[var(--border-card)] space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-card)]">
            <span className="font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#0077B6]" />
              Verified Event Payload & Cryptographic Signature
            </span>
            {lastResult && (
              <Badge variant="success" size="sm">
                <CheckCircle2 className="w-3 h-3" /> Signature Validated (Latency: {lastResult.latency_ms}ms)
              </Badge>
            )}
          </div>

          {lastResult ? (
            <div className="space-y-2">
              <div className="p-2.5 bg-slate-900 text-slate-200 rounded-xl overflow-x-auto text-[11px] max-h-48">
                <pre>{JSON.stringify(lastResult.payload, null, 2)}</pre>
              </div>

              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 font-sans flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-bold">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  X-Razorpay-Signature: {lastResult.signature.slice(0, 24)}...
                </span>
                <Badge variant="success" size="sm">Matched in Ledger</Badge>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-[var(--text-muted)] font-sans text-xs">
              Click <strong>"Dispatch & Verify Webhook"</strong> to simulate an instant Razorpay webhook event.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
