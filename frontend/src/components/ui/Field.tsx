import React, { useId } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '../../lib/cn';

const controlBase =
  'w-full rounded-control border border-line bg-surface text-fg placeholder:text-fg-faint ' +
  'shadow-e1 transition-[border-color,box-shadow] duration-150 outline-none ' +
  'hover:border-line-strong focus-visible:border-accent disabled:opacity-50';

const controlSize = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-9 px-3 text-sm'
} as const;

interface FieldProps {
  label?: string;
  hint?: React.ReactNode;
  error?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** Label + control + hint/error stack, wired up with matching ids. */
const Field: React.FC<
  FieldProps & { id: string; children: React.ReactNode }
> = ({ label, hint, error, id, className = '', children }) => (
  <div className={cn('min-w-0', className)}>
    {label && (
      <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-fg">
        {label}
      </label>
    )}
    {children}
    {(hint || error) && (
      <p
        id={`${id}-hint`}
        className={cn('mt-1.5 text-[11px] leading-relaxed', error ? 'text-danger-text' : 'text-fg-muted')}
      >
        {error || hint}
      </p>
    )}
  </div>
);

export const Input: React.FC<
  Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> & FieldProps & { mono?: boolean }
> = ({ label, hint, error, size = 'md', className = '', mono = false, ...props }) => {
  const autoId = useId();
  const id = props.id ?? autoId;
  return (
    <Field label={label} hint={hint} error={error} id={id} className={className}>
      <input
        {...props}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={hint || error ? `${id}-hint` : undefined}
        className={cn(
          controlBase,
          controlSize[size],
          mono && 'mono tabular-nums',
          error && 'border-danger-line focus-visible:border-danger'
        )}
      />
    </Field>
  );
};

/** Search box with a leading icon and a clear affordance once populated. */
export const SearchInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}> = ({ value, onChange, placeholder = 'Search…', label, size = 'sm', className = '' }) => {
  const id = useId();
  return (
    <div className={cn('relative', className)}>
      <label htmlFor={id} className="sr-only">
        {label || placeholder}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-fg-faint"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          controlBase,
          controlSize[size],
          'pl-8',
          value && 'pr-8',
          '[&::-webkit-search-cancel-button]:hidden'
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear search"
          className="absolute top-1/2 right-1.5 -translate-y-1/2 cursor-pointer rounded p-1 text-fg-faint transition-colors hover:text-fg"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
};

/**
 * Styled native select. Native is deliberate here: it gives correct keyboard
 * behaviour and mobile pickers for free, which a custom listbox would have to
 * re-implement. The chevron is drawn on top with appearance-none.
 */
export const Select: React.FC<
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> &
    FieldProps & { options?: { value: string; label: string }[] }
> = ({ label, hint, error, size = 'sm', className = '', options, children, ...props }) => {
  const autoId = useId();
  const id = props.id ?? autoId;
  return (
    <Field label={label} hint={hint} error={error} id={id} className={className}>
      <div className="relative">
        <select
          {...props}
          id={id}
          className={cn(
            controlBase,
            controlSize[size],
            'cursor-pointer appearance-none pr-8 font-semibold'
          )}
        >
          {options
            ? options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-fg-muted"
          aria-hidden="true"
        />
      </div>
    </Field>
  );
};

/** Inline label + select for toolbars, where a stacked label wastes height. */
export const InlineSelect: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }
> = ({ label, className = '', children, ...props }) => {
  const autoId = useId();
  const id = props.id ?? autoId;
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <label htmlFor={id} className="shrink-0 text-xs font-medium text-fg-muted">
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          id={id}
          className={cn(controlBase, controlSize.sm, 'cursor-pointer appearance-none pr-8 font-semibold')}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-fg-muted"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
