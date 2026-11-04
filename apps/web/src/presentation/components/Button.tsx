import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: Variant;
}

const BASE =
  'min-h-12 w-full rounded-2xl px-5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white active:bg-brand-700',
  /** Irreversible actions only (erasing data). */
  danger: 'bg-red-700 text-white active:bg-red-800',
  secondary: 'bg-white text-brand-700 ring-1 ring-slate-300 active:bg-brand-50',
};

export function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}: ButtonProps): ReactNode {
  return <button type={type} className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />;
}
