import React from 'react';
import { cn } from '../../lib/cn';

/**
 * Table shell used by every data grid in the app. Handles the horizontal
 * scroll container, sticky header, zebra-free row separation, and consistent
 * cell padding so the three tables stop drifting apart visually.
 */
export const TableWrap: React.FC<{
  children: React.ReactNode;
  className?: string;
  /** Caption is read by screen readers to describe the grid. */
  caption?: string;
  /** Cap the height and scroll rows under a sticky header. */
  maxHeight?: string;
}> = ({ children, className = '', caption, maxHeight }) => (
  <div
    className={cn('-mx-1 overflow-x-auto overflow-y-auto px-1', className)}
    style={maxHeight ? { maxHeight } : undefined}
    tabIndex={0}
    role="region"
    aria-label={caption}
  >
    <table className="w-full border-collapse text-left text-xs">
      {caption && <caption className="sr-only">{caption}</caption>}
      {children}
    </table>
  </div>
);

export const THead: React.FC<{ children: React.ReactNode; sticky?: boolean }> = ({
  children,
  sticky = true
}) => (
  <thead className={cn(sticky && 'sticky top-0 z-10')}>
    <tr className="border-b border-line bg-surface">{children}</tr>
  </thead>
);

export const TH: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  className?: string;
  numeric?: boolean;
}> = ({ children, align = 'left', className = '', numeric = false }) => (
  <th
    scope="col"
    className={cn(
      'px-3 py-2.5 text-[10px] font-semibold tracking-wider text-fg-muted uppercase',
      align === 'right' && 'text-right',
      align === 'center' && 'text-center',
      numeric && 'text-right',
      className
    )}
  >
    {children}
  </th>
);

export const TBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <tbody className="divide-y divide-line">{children}</tbody>
);

export const TR: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  /** Tints the row to flag it (e.g. unresolved exceptions). */
  tone?: 'default' | 'danger' | 'warn';
  /** Accessible name for the row-activation affordance. */
  activateLabel?: string;
}> = ({ children, onClick, className = '', tone = 'default', activateLabel }) => (
  <tr
    onClick={onClick}
    {...(onClick
      ? {
          tabIndex: 0,
          role: 'button',
          'aria-label': activateLabel,
          onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick();
            }
          }
        }
      : {})}
    className={cn(
      'group transition-colors duration-100',
      tone === 'danger' && 'bg-danger-soft/50',
      tone === 'warn' && 'bg-warn-soft/50',
      onClick && 'cursor-pointer hover:bg-subtle focus-visible:bg-subtle',
      className
    )}
  >
    {children}
  </tr>
);

export const TD: React.FC<{
  children: React.ReactNode;
  className?: string;
  align?: 'left' | 'right' | 'center';
  numeric?: boolean;
  colSpan?: number;
}> = ({ children, className = '', align = 'left', numeric = false, colSpan }) => (
  <td
    colSpan={colSpan}
    className={cn(
      'px-3 py-2.5 align-middle text-fg-secondary',
      align === 'right' && 'text-right',
      align === 'center' && 'text-center',
      numeric && 'num text-right tabular-nums',
      className
    )}
  >
    {children}
  </td>
);
