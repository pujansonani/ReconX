import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { Card } from '../ui/Card';
import { chartTooltipStyle, chartTooltipItemStyle, chartAxisTick, chartCursorFill } from '../../lib/chartTheme';
import { AlertCircle } from 'lucide-react';

interface ExceptionCategoryChartProps {
  categories: Record<string, number>;
  onSelectCategory?: (category: string) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  TIMING_DIFFERENCE: '#64748B',
  FEE_MISMATCH: '#F59E0B',
  PARTIAL_REFUND: '#0077B6',
  CHARGEBACK: '#F43F5E',
  DUPLICATE_PAYOUT: '#EC4899',
  MISSING_ORDER: '#6366F1',
  MISSING_GATEWAY_RECORD: '#D97706',
  ROUNDING_DIFFERENCE: '#10B981',
  UNRESOLVED: '#DC2626'
};

const CATEGORY_LABELS: Record<string, string> = {
  TIMING_DIFFERENCE: 'Timing Difference',
  FEE_MISMATCH: 'Fee Mismatch',
  PARTIAL_REFUND: 'Partial Refund',
  CHARGEBACK: 'Chargeback',
  DUPLICATE_PAYOUT: 'Duplicate Payout',
  MISSING_ORDER: 'Missing Order',
  MISSING_GATEWAY_RECORD: 'Missing Gateway Record',
  ROUNDING_DIFFERENCE: 'Rounding Variance',
  UNRESOLVED: 'Unresolved (Critical)'
};

export const ExceptionCategoryChart: React.FC<ExceptionCategoryChartProps> = ({
  categories,
  onSelectCategory
}) => {
  const chartData = Object.entries(categories).map(([key, count]) => ({
    categoryKey: key,
    name: CATEGORY_LABELS[key] || key.replace('_', ' '),
    count: count,
    color: CATEGORY_COLORS[key] || '#64748B'
  })).sort((a, b) => b.count - a.count);

  const totalExceptions = chartData.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <Card className="p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-[var(--text-primary)]">Exception Taxonomy Breakdown</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 mono">
              {totalExceptions}
            </span>
          </div>
          <div className="text-xs text-[var(--text-muted)] font-medium">Classified by Engine + AI</div>
        </div>
        <p className="text-xs text-[var(--text-muted)] mb-4">Discrepancy taxonomy across merchant, gateway, and bank ledgers</p>

        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                tick={chartAxisTick}
                width={130}
              />
              <Tooltip
                cursor={{ fill: chartCursorFill }}
                formatter={(val: any) => [`${val} exceptions`, 'Count']}
                contentStyle={chartTooltipStyle}
                itemStyle={chartTooltipItemStyle}
              />
              <Bar
                dataKey="count"
                radius={[0, 4, 4, 0]}
                onClick={(data: any) => onSelectCategory && onSelectCategory(data?.categoryKey || data?.payload?.categoryKey)}
                className="cursor-pointer"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="pt-3 border-t border-[var(--border-card)] flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>Click any bar to filter exceptions</span>
        <span className="font-semibold text-[var(--text-primary)]">9 Discrepancy Archetypes</span>
      </div>
    </Card>
  );
};
