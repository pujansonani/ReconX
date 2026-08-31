import React, { useId, useState } from 'react';
import { cn } from '../../lib/cn';

type Side = 'top' | 'bottom' | 'left' | 'right';

const sideStyles: Record<Side, string> = {
  top: 'bottom-full left-1/2 mb-1.5 -translate-x-1/2',
  bottom: 'top-full left-1/2 mt-1.5 -translate-x-1/2',
  left: 'top-1/2 right-full mr-1.5 -translate-y-1/2',
  right: 'top-1/2 left-full ml-1.5 -translate-y-1/2'
};

/**
 * CSS-driven tooltip that also opens on keyboard focus, so the hint is not
 * mouse-only. Kept intentionally simple — no portal, so the trigger must not
 * live inside an `overflow: hidden` box smaller than the tip.
 */
export const Tooltip: React.FC<{
  content: React.ReactNode;
  side?: Side;
  children: React.ReactElement;
  className?: string;
}> = ({ content, side = 'top', children, className = '' }) => {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {React.cloneElement(children as React.ReactElement<{ 'aria-describedby'?: string }>, {
        'aria-describedby': id
      })}
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute z-50 w-max max-w-56 rounded-control border border-line',
          'bg-raised px-2 py-1.5 text-[11px] leading-snug font-medium text-fg shadow-e3',
          'transition-opacity duration-150',
          sideStyles[side],
          open ? 'opacity-100' : 'opacity-0'
        )}
      >
        {content}
      </span>
    </span>
  );
};
