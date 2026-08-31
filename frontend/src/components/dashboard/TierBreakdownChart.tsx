import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { Card } from '../ui/Card';
import { chartTooltipStyle, chartTooltipItemStyle } from '../../lib/chartTheme';
import { ShieldCheck } from 'lucide-react';

interface TierBreakdownChartProps {
  tierData: Record<string, number>;
  totalRecords: number;
}

export const TierBreakdownChart: React.FC<TierBreakdownChartProps> = ({
  tierData,
  totalRecords
}) => {
  const chartData = [
    { name: 'Tier 1: Exact Reference', value: tierData['Exact Reference (Tier 1)'] || tierData['TIER_1_EXACT'] || 0, color: '#0077B6' },
    { name: 'Tier 2: Amount + Date', value: tierData['Amount + Date Window (Tier 2)'] || tierData['TIER_2_DATE_AMOUNT'] || 0, color: '#00B4D8' },
    { name: 'Tier 3: Batch Decomposition', value: tierData['Batch Decomposition (Tier 3)'] || tierData['TIER_3_NET_BATCH'] || 0, color: '#48CAE4' },
    { name: 'Tier 4: Exceptions / Unresolved', value: tierData['Exceptions / Unresolved (Tier 4)'] || tierData['TIER_4_EXCEPTIONS'] || 0, color: '#F43F5E' }
  ].filter(d => d.value > 0);

  const total = chartData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-bold text-sm text-[var(--text-primary)]">Matching Tier Performance</h3>
          <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/60">
            <ShieldCheck className="w-3.5 h-3.5" />
            Deterministic Cascade
          </div>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4">Distribution of records matched by reconciliation stage</p>

        <div className="h-52 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="var(--color-surface)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => [`${val.toLocaleString()} records (${total > 0 ? ((val/total)*100).toFixed(1) : 0}%)`, 'Volume']}
                contentStyle={chartTooltipStyle}
                itemStyle={chartTooltipItemStyle}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-[var(--text-primary)] mono">{total.toLocaleString()}</span>
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Total Records</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[var(--border-card)] text-xs">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-2 rounded-xl bg-[var(--bg-card-subtle)] border border-[var(--border-card)]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-[var(--text-primary)] font-medium truncate text-[11px]">{item.name.split(':')[0]}</span>
            </div>
            <span className="font-bold text-[var(--text-primary)] mono text-[11px]">
              {total > 0 ? `${((item.value / total) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};
