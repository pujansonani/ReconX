import React from 'react';
import { cn } from '../../lib/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  /** Primary next action — an empty state without one is a dead end. */
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  size?: 'sm' | 'md';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  className = ''
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center text-center',
      size === 'md' ? 'px-6 py-14' : 'px-4 py-9',
      className
    )}
  >
    {icon && (
      <div
        aria-hidden="true"
        className={cn(
          'mb-4 flex items-center justify-center rounded-card border border-line bg-subtle text-fg-faint',
          size === 'md' ? 'size-12' : 'size-10'
        )}
      >
        {icon}
      </div>
    )}
    <h3 className={cn('font-semibold text-fg', size === 'md' ? 'text-sm' : 'text-xs')}>{title}</h3>
    {description && (
      <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-fg-muted">{description}</p>
    )}
    {(action || secondaryAction) && (
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {action}
        {secondaryAction}
      </div>
    )}
  </div>
);
