import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { api } from '../services/api';
import { NodalFloatRadar } from '../components/razorpay/NodalFloatRadar';
import { MdrLeakageAuditor } from '../components/razorpay/MdrLeakageAuditor';
import { RouteArbitrageSimulator } from '../components/razorpay/RouteArbitrageSimulator';
import { LiveWebhookStreamSimulator } from '../components/razorpay/LiveWebhookStreamSimulator';
import { SmartCollectAllocator } from '../components/razorpay/SmartCollectAllocator';
import {
  ShieldAlert,
  Zap,
  Sparkles,
  RefreshCw,
  Building2,
  Lock,
  ArrowUpRight,
  TrendingDown,
  Layers,
  FileCheck,
  Landmark
} from 'lucide-react';

export const RazorpaySentinelPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'smartcollect' | 'nodal' | 'leakage' | 'arbitrage' | 'webhook'>('smartcollect');

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const data = await api.getRazorpaySentinelMetrics();
      setMetrics(data);
    } catch (e) {
      console.error('Error loading Sentinel metrics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Razorpay Settlement Sentinel & MDR Leakage Copilot
            </h1>
            <Badge variant="purple">Novel Industry AI</Badge>
          </div>
          <p className="text-xs text-[var(--text-muted)] font-medium mt-1 max-w-3xl">
            Autonomous multi-rail settlement auditing tailored for Razorpay & enterprise merchants: virtual-account invoice auto-allocation, RBI Nodal Float telemetry, partner bank MDR overcharge detection, automated recovery dispute letters, and route fee arbitrage.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            loading={loading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Telemetry
          </Button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--border-card)] pb-3">
        <button
          onClick={() => setActiveSubTab('smartcollect')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'smartcollect'
              ? 'bg-[#0077B6] text-white shadow-md'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-card)]'
          }`}
        >
          <Landmark className="w-3.5 h-3.5" />
          <span>Smart Collect+ Auto-Allocation</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px]">
            NEW
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('leakage')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'leakage'
              ? 'bg-[#0077B6] text-white shadow-md'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-card)]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Partner Bank MDR Leakage Auditor</span>
          {metrics && (
            <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px]">
              ₹{(metrics.mdr_leakage_audit.total_leakage_identified / 1000).toFixed(1)}k
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('nodal')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'nodal'
              ? 'bg-[#0077B6] text-white shadow-md'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-card)]'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Nodal Escrow Float & Latency Radar</span>
          <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px]">
            RBI 100%
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('arbitrage')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'arbitrage'
              ? 'bg-[#0077B6] text-white shadow-md'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-card)]'
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Multi-Rail Route Arbitrage Simulator</span>
        </button>

        <button
          onClick={() => setActiveSubTab('webhook')}
          className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'webhook'
              ? 'bg-[#0077B6] text-white shadow-md'
              : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-card)]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Live Razorpay Webhook Simulator</span>
        </button>
      </div>

      {/* Main Tab View Contents */}
      {activeSubTab === 'smartcollect' ? (
        <SmartCollectAllocator />
      ) : loading && !metrics ? (
        <div className="p-16 text-center text-xs text-[var(--text-muted)] space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#0077B6]" />
          <span>Loading Razorpay Sentinel telemetry...</span>
        </div>
      ) : metrics ? (
        <div className="space-y-6">
          {activeSubTab === 'leakage' && (
            <MdrLeakageAuditor data={metrics.mdr_leakage_audit} />
          )}

          {activeSubTab === 'nodal' && (
            <NodalFloatRadar data={metrics.nodal_escrow} />
          )}

          {activeSubTab === 'arbitrage' && (
            <RouteArbitrageSimulator />
          )}

          {activeSubTab === 'webhook' && (
            <LiveWebhookStreamSimulator />
          )}
        </div>
      ) : null}
    </div>
  );
};
