import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  Zap,
  AlertTriangle,
  Layers,
  CheckCircle2,
  Pause,
  Play,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Coins
} from 'lucide-react';
import { useLiveRecon, LiveEvent } from '../../context/LiveReconContext';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export const LiveActivityStream: React.FC = () => {
  const {
    isConnected,
    isStreaming,
    liveEvents,
    liveMetrics,
    toggleStreaming,
    injectEvent,
    clearEvents
  } = useLiveRecon();

  const [isInjecting, setIsInjecting] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<LiveEvent | null>(null);

  const handleInject = async (category: 'TIER_1_EXACT' | 'FEE_MISMATCH' | 'CHARGEBACK') => {
    setIsInjecting(true);
    await injectEvent(category);
    setIsInjecting(false);
  };

  const latestEvent = liveEvents[0];

  return (
    <Card className="p-4 sm:p-5 overflow-hidden relative">
      {/* Top Header with Live Indicator & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-card)]">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {isConnected && (
              <span className="absolute w-5 h-5 rounded-full bg-emerald-500/40 animate-ping" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-[var(--text-primary)]">
                Autonomous Real-Time Reconciliation Stream
              </h3>
              <Badge variant={isConnected ? 'success' : 'warning'}>
                {isConnected ? (isStreaming ? 'LIVE INGESTION ACTIVE' : 'PAUSED') : 'CONNECTING...'}
              </Badge>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Continuous 3-way ledger event matching • Latency: <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">0.32 ms</span>
            </p>
          </div>
        </div>

        {/* Live Simulator Trigger Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleInject('TIER_1_EXACT')}
            disabled={isInjecting}
            className="px-3 py-1.5 rounded-xl border border-sky-300 dark:border-sky-700 bg-sky-50 dark:bg-sky-950/60 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-[#0077B6] dark:text-[#48CAE4] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Simulate incoming clean 3-way matched transaction"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>+ Ingest Live Match</span>
          </button>

          <button
            onClick={() => handleInject('CHARGEBACK')}
            disabled={isInjecting}
            className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Simulate incoming real-time dispute"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>+ Ingest Dispute</span>
          </button>

          <button
            onClick={toggleStreaming}
            className="p-1.5 rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-subtle)] text-[var(--text-primary)] transition-all cursor-pointer"
            title={isStreaming ? 'Pause Real-Time Stream' : 'Resume Real-Time Stream'}
          >
            {isStreaming ? <Pause className="w-4 h-4 text-amber-500" /> : <Play className="w-4 h-4 text-emerald-500" />}
          </button>
        </div>
      </div>

      {/* Live Activity Ticker Cards */}
      <div className="pt-3 space-y-2">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] px-1">
          <span className="font-semibold">Live Event Log (Latest {liveEvents.length} transactions processed)</span>
          <span className="font-mono text-[11px]">Real-time SSE channel #reconx-live-stream</span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          <AnimatePresence initial={false}>
            {liveEvents.slice(0, 5).map((evt) => {
              const isMatch = evt.type === 'MATCH_SUCCESS';
              const isBatch = evt.type === 'BATCH_SOLVED';
              const isExc = evt.type === 'EXCEPTION_FLAGGED';

              return (
                <motion.div
                  key={evt.id}
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`p-2.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono transition-colors ${
                    isExc
                      ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/60'
                      : isBatch
                      ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800/60'
                      : 'bg-[var(--bg-card-subtle)] border-[var(--border-card)]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1 rounded-lg shrink-0">
                      {isExc ? (
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                      ) : isBatch ? (
                        <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[var(--text-primary)] truncate">{evt.title}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{evt.time}</span>
                      </div>
                      <p className="text-[11px] text-[var(--text-secondary)] font-sans truncate">{evt.message}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    {evt.gross_amount != null && (
                      <span className="font-bold text-[var(--text-primary)]">
                        ₹{evt.gross_amount.toFixed(2)}
                      </span>
                    )}
                    <Badge variant={isExc ? 'danger' : isBatch ? 'blue' : 'success'}>
                      {evt.status}
                    </Badge>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </Card>
  );
};
