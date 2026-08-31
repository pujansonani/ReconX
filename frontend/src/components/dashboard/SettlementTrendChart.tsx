import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import { Card } from '../ui/Card';
import { chartTooltipStyle, chartTooltipItemStyle, chartTooltipLabelStyle, chartAxisTick, chartGridStroke } from '../../lib/chartTheme';
import { TrendingUp } from 'lucide-react';

interface SettlementTrendChartProps {
  trendData: Array<{
    run_id: string;
    name: string;
    date: string;
    match_rate: number;
    total_records: number;
    reconciled: number;
    exceptions: number;
    difference: number;
  }>;
}

export const SettlementTrendChart: React.FC<SettlementTrendChartProps> = ({ trendData }) => {
  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Historical Settlement Match Rate Trend</h3>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0077B6] dark:text-[#48CAE4] bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800/60">
              <TrendingUp className="w-3.5 h-3.5" />
              Automated Accuracy
            </span>
          </div>
          <span className="text-xs text-[var(--text-muted)] font-medium">Last 10 Reconciliation Runs</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4">Tracking match rates and settled financial volumes over time</p>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="matchRateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0077B6" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#0077B6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridStroke} />
              <XAxis dataKey="date" tick={chartAxisTick} />
              <YAxis domain={[60, 100]} tick={chartAxisTick} unit="%" />
              <Tooltip
                formatter={(val: any) => [`${val}%`, 'Match Rate']}
                labelFormatter={(label, payload) => payload?.[0]?.payload?.name || label}
                contentStyle={chartTooltipStyle}
                itemStyle={chartTooltipItemStyle}
                labelStyle={chartTooltipLabelStyle}
              />
              <Area
                type="monotone"
                dataKey="match_rate"
                stroke="#0077B6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#matchRateGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Average Run Accuracy: <strong className="text-[var(--text-primary)]">96.8%</strong></span>
        <span>Standard Deviation: <strong className="text-[var(--text-primary)]">±1.2%</strong></span>
      </div>
    </Card>
  );
};
