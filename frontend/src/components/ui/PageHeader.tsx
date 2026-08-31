import React from 'react';
import { cn } from '../../lib/cn';

interface PageHeaderProps {
  title: string;
  description?: React.ReactNode;
  /** Rendered inline after the title — status badges belong here. */
  meta?: React.ReactNode;
  actions?: React.ReactNode;
  /** Optional breadcrumb / back affordance rendered above the title. */
  eyebrow?: React.ReactNode;
  className?: string;
}

/**
 * Consistent page-level heading block. Every page used to hand-roll this with
 * slightly different sizes and spacing; routing it through one component keeps
 * the vertical rhythm identical across the app.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  meta,
  actions,
  eyebrow,
  className = ''
}) => (
  <div
    className={cn(
      'flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-start lg:justify-between',
      className
    )}
  >
    <div className="min-w-0">
      {eyebrow && <div className="mb-2">{eyebrow}</div>}
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <h1 className="text-lg font-bold text-fg sm:text-xl">{title}</h1>
        {meta}
      </div>
      {description && (
        <p className="mt-1.5 max-w-3xl text-xs leading-relaxed text-fg-muted sm:text-[13px]">
          {description}
        </p>
      )}
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);
