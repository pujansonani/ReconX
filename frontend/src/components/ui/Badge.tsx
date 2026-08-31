import React from 'react';
import { cn } from '../../lib/cn';

type BadgeVariant =
  | 'default'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'purple'
  | 'blue'
  | 'outline';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  /** Leading status dot, tinted to match the variant. */
  dot?: boolean;
  /** Animate the dot — for genuinely live states only. */
  pulse?: boolean;
  icon?: React.ReactNode;
  className?: string;
  title?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-subtle text-fg-secondary border-line',
  neutral: 'bg-subtle text-fg-secondary border-line',
  blue: 'bg-accent-soft text-accent-text border-accent-soft-line',
  purple: 'bg-info-soft text-info-text border-info-line',
  success: 'bg-ok-soft text-ok-text border-ok-line',
  warning: 'bg-warn-soft text-warn-text border-warn-line',
  danger: 'bg-danger-soft text-danger-text border-danger-line',
  outline: 'bg-transparent text-fg-muted border-line'
};

const dotStyles: Record<BadgeVariant, string> = {
  default: 'bg-fg-faint',
  neutral: 'bg-fg-faint',
  blue: 'bg-accent',
  purple: 'bg-info',
  success: 'bg-ok',
  warning: 'bg-warn',
  danger: 'bg-danger',
  outline: 'bg-fg-faint'
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  dot = false,
  pulse = false,
  icon,
  className = '',
  title
}) => {
  return (
    <span
      title={title}
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-md border font-semibold',
        'whitespace-nowrap tracking-tight',
        variantStyles[variant],
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        className
      )}
    >
      {dot && (
        <span className="relative flex size-1.5 shrink-0" aria-hidden="true">
          {pulse && (
            <span
              className={cn('absolute inset-0 animate-ping rounded-full opacity-70', dotStyles[variant])}
            />
          )}
          <span className={cn('relative size-1.5 rounded-full', dotStyles[variant])} />
        </span>
      )}
      {icon && (
        <span className="flex shrink-0 items-center" aria-hidden="true">
          {icon}
        </span>
      )}
      <span className="truncate">{children}</span>
    </span>
  );
};
