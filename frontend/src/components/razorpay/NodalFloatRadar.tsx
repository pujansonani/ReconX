import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  Building2,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Layers
} from 'lucide-react';

interface RailBalance {
  bank: string;
  rail: string;
  float_balance: number;
  avg_settlement_latency_mins: number;
  success_rate: number;
  contracted_mdr: number;
  actual_effective_mdr: number;
  leakage_variance: number;
  status: string;
}

interface NodalFloatRadarProps {
  data: {
    total_float_balance: number;
    t1_clearing_ratio: number;
    t2_delayed_settlement_volume: number;
    rbi_compliance_score: number;
    rail_balances: RailBalance[];
  };
}

export const NodalFloatRadar: React.FC<NodalFloatRadarProps> = ({ data }) => {
  return (
    <div className="space-y-4">
      {/* Top Telemetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Total Nodal Escrow Float
          </span>
          <div className="text-xl font-extrabold text-[var(--text-primary)] mono">
            ₹{(data.total_float_balance / 10000000).toFixed(2)} Cr
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 100% Inward-Outward Matched
          </span>
        </Card>

        <Card className="p-4 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            T+1 Settlement SLA Ratio
          </span>
          <div className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mono">
            {data.t1_clearing_ratio}%
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">
            Target: &gt; 99.50% turnaround
          </span>
        </Card>

        <Card className="p-4 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Pending Bank Clearing Delay
          </span>
          <div className="text-xl font-extrabold text-amber-500 mono">
            ₹{(data.t2_delayed_settlement_volume / 1000).toFixed(1)}k
          </div>
          <span className="text-[11px] text-[var(--text-muted)]">
            Escrow Buffer within safety threshold
          </span>
        </Card>

        <Card className="p-4 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            RBI Escrow Audit Compliance
          </span>
          <div className="text-xl font-extrabold text-[#0077B6] dark:text-[#48CAE4] mono">
            {data.rbi_compliance_score}%
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Master Directions Certified
          </span>
        </Card>
      </div>

      {/* Partner Banking Rail Status Table */}
      <Card className="p-5 bg-[var(--bg-card)] border border-[var(--border-card)] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[var(--border-card)]">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#0077B6] dark:text-[#48CAE4]" />
            <h4 className="font-extrabold text-xs text-[var(--text-primary)] uppercase tracking-wider">
              Live Partner Bank Nodal Flow & Route Latency Monitor
            </h4>
          </div>
          <Badge variant="blue">4 Banking Rails Active</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[var(--border-card)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[10px] bg-[var(--bg-card-subtle)]">
                <th className="py-2.5 px-3">Banking Rail</th>
                <th className="py-2.5 px-3">Supported Instruments</th>
                <th className="py-2.5 px-3">Escrow Float Balance</th>
                <th className="py-2.5 px-3">Avg Latency</th>
                <th className="py-2.5 px-3">Success Rate</th>
                <th className="py-2.5 px-3">Contracted MDR</th>
                <th className="py-2.5 px-3">Actual Deducted</th>
                <th className="py-2.5 px-3">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-card)] font-medium text-[var(--text-primary)]">
              {data.rail_balances.map((rail, idx) => (
                <tr key={idx} className="hover:bg-[var(--bg-card-subtle)] transition-colors">
                  <td className="py-3 px-3 font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>{rail.bank}</span>
                  </td>
                  <td className="py-3 px-3 mono text-[var(--text-muted)] text-[11px]">{rail.rail}</td>
                  <td className="py-3 px-3 mono tabular-nums font-bold text-[var(--text-primary)]">
                    ₹{(rail.float_balance / 100000).toFixed(2)}L
                  </td>
                  <td className="py-3 px-3 mono text-[var(--text-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{rail.avg_settlement_latency_mins} mins</span>
                  </td>
                  <td className="py-3 px-3 mono font-bold text-emerald-600 dark:text-emerald-400">
                    {rail.success_rate}%
                  </td>
                  <td className="py-3 px-3 mono text-[var(--text-muted)]">{rail.contracted_mdr.toFixed(2)}%</td>
                  <td className="py-3 px-3 mono font-bold">
                    <span className={rail.actual_effective_mdr > rail.contracted_mdr ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                      {rail.actual_effective_mdr.toFixed(2)}%
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    {rail.status === 'LEAKAGE_DETECTED' ? (
                      <Badge variant="danger" size="sm">
                        <AlertTriangle className="w-3 h-3" /> +{rail.leakage_variance}% Overcharge
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 className="w-3 h-3" /> Optimal (0.00% Variance)
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
