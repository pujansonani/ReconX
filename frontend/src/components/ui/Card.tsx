import React from 'react';
import { cn } from '../../lib/cn';

type CardVariant = 'default' | 'subtle' | 'inset' | 'glass' | 'contrast';
type CardElevation = 'none' | 'e1' | 'e2' | 'e3';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** Adds hover affordance (border + lift). Implied when `onClick` is set. */
  hoverable?: boolean;
  variant?: CardVariant;
  elevation?: CardElevation;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-surface border-line',
  subtle: 'bg-subtle border-line',
  inset: 'bg-inset border-line',
  glass: 'glass border-line',
  // Inverted panel used for "engine spec" style callouts.
  contrast: 'bg-brand-950 border-brand-800/60 text-white dark:bg-[#0b1220] dark:border-line'
};

const elevationStyles: Record<CardElevation, string> = {
  none: '',
  e1: 'shadow-e1',
  e2: 'shadow-e2',
  e3: 'shadow-e3'
};

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  variant = 'default',
  elevation = 'e1',
  ...rest
}) => {
  const interactive = hoverable || Boolean(onClick);

  return (
    <div
      onClick={onClick}
      {...(onClick
        ? {
            role: 'button',
            tabIndex: 0,
            onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          }
        : {})}
      className={cn(
        'rounded-card border transition-[border-color,box-shadow,transform] duration-200',
        variantStyles[variant],
        elevationStyles[elevation],
        interactive &&
          'cursor-pointer hover:border-line-strong hover:shadow-e3 focus-visible:border-accent',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

/** Card section header with an optional trailing action slot. */
export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, icon, action, className = '' }) => (
  <div className={cn('flex items-start justify-between gap-3', className)}>
    <div className="flex min-w-0 items-start gap-2.5">
      {icon && (
        <span className="mt-px flex size-7 shrink-0 items-center justify-center rounded-tile bg-accent-soft text-accent-text ring-1 ring-accent-soft-line">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-fg">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-fg-muted">{subtitle}</p>}
      </div>
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = ''
}) => (
  <div className={cn('mt-4 flex items-center justify-between gap-3 border-t border-line pt-3', className)}>
    {children}
  </div>
);
