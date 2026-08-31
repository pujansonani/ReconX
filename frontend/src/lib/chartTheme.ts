import type { CSSProperties } from 'react';

/**
 * Recharts renders tooltips/axes with inline styles, so Tailwind utilities and
 * `dark:` variants can't reach them. Referencing our CSS custom properties here
 * lets the same object resolve to the right colours in both themes — the values
 * are read at paint time from whichever `:root` / `html.dark` scope is active.
 */
export const chartTooltipStyle: CSSProperties = {
  backgroundColor: 'var(--color-raised)',
  color: 'var(--color-fg)',
  border: '1px solid var(--color-line)',
  borderRadius: '10px',
  fontSize: '12px',
  boxShadow: 'var(--shadow-e3)',
  padding: '8px 12px'
};

export const chartTooltipItemStyle: CSSProperties = {
  color: 'var(--color-fg)'
};

export const chartTooltipLabelStyle: CSSProperties = {
  color: 'var(--color-fg-muted)',
  fontWeight: 600,
  marginBottom: '2px'
};

/** Cursor fill for bar/area hover — a faint neutral wash that reads on both themes. */
export const chartCursorFill = 'color-mix(in oklab, var(--color-fg) 8%, transparent)';

/** Axis tick + grid colours, for use in `tick={{ fill: ... }}` / `stroke`. */
export const chartAxisTick = { fontSize: 11, fill: 'var(--color-fg-muted)' };
export const chartGridStroke = 'var(--color-line)';
