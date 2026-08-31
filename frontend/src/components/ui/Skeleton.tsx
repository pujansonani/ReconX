import React from 'react';
import { cn } from '../../lib/cn';

/** Base shimmer block. Give it explicit sizing via className. */
export const Skeleton: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className = '',
  style
}) => <div className={cn('skeleton', className)} style={style} aria-hidden="true" />;

/**
 * Wraps loading placeholders with the right assistive-tech semantics so
 * screen readers announce "loading" instead of reading empty boxes.
 */
export const SkeletonRegion: React.FC<{
  label?: string;
  className?: string;
  children: React.ReactNode;
}> = ({ label = 'Loading', className = '', children }) => (
  <div role="status" aria-busy="true" aria-label={label} className={className}>
    {children}
    <span className="sr-only">{label}…</span>
  </div>
);

/** Matches the footprint of a MetricCard tile. */
export const SkeletonStat: React.FC = () => (
  <div className="rounded-card border border-line bg-surface p-4 shadow-e1">
    <div className="mb-3 flex items-center justify-between gap-2">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="size-6 rounded-tile" />
    </div>
    <Skeleton className="h-6 w-20" />
    <div className="mt-3 flex items-center justify-between gap-2 border-t border-line pt-2.5">
      <Skeleton className="h-2.5 w-28" />
      <Skeleton className="h-4 w-14 rounded-md" />
    </div>
  </div>
);

/** Chart card placeholder with a fake bar silhouette. */
export const SkeletonChart: React.FC<{ height?: number; className?: string }> = ({
  height = 220,
  className = ''
}) => (
  <div className={cn('rounded-card border border-line bg-surface p-5 shadow-e1', className)}>
    <Skeleton className="h-3.5 w-40" />
    <Skeleton className="mt-2 h-2.5 w-56" />
    <div className="mt-5 flex items-end gap-2" style={{ height }}>
      {[62, 45, 78, 38, 88, 55, 70, 48, 82, 60].map((h, i) => (
        <Skeleton key={i} className="flex-1 rounded-t-md" style={{ height: `${h}%` }} />
      ))}
    </div>
  </div>
);

/** Table placeholder — keeps column rhythm so the swap-in is not jarring. */
export const SkeletonTable: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 6,
  columns = 6
}) => (
  <div className="space-y-px overflow-hidden rounded-tile border border-line">
    <div className="flex gap-4 bg-subtle px-3 py-2.5">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-2.5 flex-1" />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, r) => (
      <div key={r} className="flex items-center gap-4 border-t border-line bg-surface px-3 py-3">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={c} className={cn('h-3 flex-1', c === 0 && 'max-w-40')} />
        ))}
      </div>
    ))}
  </div>
);

/** Generic multi-line text placeholder. */
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = ''
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
    ))}
  </div>
);
