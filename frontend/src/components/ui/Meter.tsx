import React from 'react';
import { cn } from '../../lib/cn';

type MeterTone = 'accent' | 'ok' | 'warn' | 'danger' | 'info' | 'neutral';

const toneStyles: Record<MeterTone, string> = {
  accent: 'bg-accent',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-fg-faint'
};

interface MeterProps {
  /** 0–100. Values outside the range are clamped. */
  value: number;
  tone?: MeterTone;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  /** Accessible description, e.g. "Match rate". */
  label?: string;
  /** Skip the ARIA meter role when the bar is decorative. */
  decorative?: boolean;
}

export const Meter: React.FC<MeterProps> = ({
  value,
  tone = 'accent',
  size = 'sm',
  className = '',
  label,
  decorative = false
}) => {
  const pct = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div
      {...(decorative
        ? { 'aria-hidden': true }
        : {
            role: 'progressbar',
            'aria-valuenow': Math.round(pct),
            'aria-valuemin': 0,
            'aria-valuemax': 100,
            'aria-label': label
          })}
      className={cn(
        'w-full overflow-hidden rounded-full bg-inset',
        size === 'xs' ? 'h-1' : size === 'sm' ? 'h-1.5' : 'h-2.5',
        className
      )}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', toneStyles[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

/** Match-rate style readout: a meter plus its numeric value, aligned. */
export const MeterWithValue: React.FC<{
  value: number;
  tone?: MeterTone;
  label?: string;
  suffix?: string;
  className?: string;
  meterClassName?: string;
}> = ({ value, tone = 'accent', label, suffix = '%', className = '', meterClassName = 'w-14' }) => (
  <div className={cn('flex items-center gap-2', className)}>
    <Meter value={value} tone={tone} label={label} className={meterClassName} />
    <span className="num shrink-0 text-xs font-semibold text-fg">
      {value.toFixed(1).replace(/\.0$/, '')}
      {suffix}
    </span>
  </div>
);
