import React from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'subtle'
  | 'danger'
  | 'ghost'
  | 'success'
  | 'accent-soft';

type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-accent-fg shadow-e1 hover:bg-accent-hover hover:shadow-e2 active:shadow-none',
  secondary:
    'bg-fg text-page font-semibold shadow-e1 hover:opacity-90 active:opacity-100',
  outline:
    'bg-surface text-fg border border-line shadow-e1 hover:bg-subtle hover:border-line-strong',
  subtle: 'bg-subtle text-fg border border-transparent hover:bg-inset',
  'accent-soft':
    'bg-accent-soft text-accent-text border border-accent-soft-line hover:border-accent',
  danger: 'bg-danger text-white shadow-e1 hover:brightness-110 active:brightness-100',
  success: 'bg-ok text-white font-semibold shadow-e1 hover:brightness-110 active:brightness-100',
  ghost: 'bg-transparent text-fg hover:bg-subtle'
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-[11px] gap-1.5 rounded-control',
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-control',
  md: 'h-9 px-4 text-sm gap-2 rounded-control',
  lg: 'h-11 px-5 text-sm gap-2.5 rounded-tile'
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconRight,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center font-semibold whitespace-nowrap',
        'transition-[background-color,border-color,box-shadow,opacity,filter,transform] duration-150',
        'active:translate-y-px disabled:pointer-events-none disabled:opacity-45',
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Spinner />
      ) : icon ? (
        <span className="flex shrink-0 items-center" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="flex shrink-0 items-center" aria-hidden="true">
          {iconRight}
        </span>
      )}
    </button>
  );
};

const Spinner: React.FC = () => (
  <svg
    className="size-3.5 shrink-0 animate-spin text-current"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-90"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

/** Square icon-only button. Requires `label` for assistive technology. */
export const IconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    label: string;
    size?: 'sm' | 'md';
    variant?: 'ghost' | 'outline' | 'subtle';
  }
> = ({ label, size = 'md', variant = 'ghost', className = '', children, ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={cn(
      'inline-flex cursor-pointer items-center justify-center rounded-control text-fg-muted',
      'transition-colors duration-150 hover:text-fg disabled:pointer-events-none disabled:opacity-45',
      variant === 'ghost' && 'hover:bg-subtle',
      variant === 'subtle' && 'bg-subtle hover:bg-inset',
      variant === 'outline' && 'border border-line bg-surface hover:bg-subtle',
      size === 'sm' ? 'size-7' : 'size-9',
      className
    )}
    {...props}
  >
    {children}
  </button>
);
