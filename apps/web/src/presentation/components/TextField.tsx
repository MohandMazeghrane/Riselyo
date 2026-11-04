import { useId, type InputHTMLAttributes, type ReactNode } from 'react';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  readonly label: string;
  readonly hint?: string;
}

/** Labelled input with an optional hint, at least 44 px high. */
export function TextField({ label, hint, className = '', ...props }: TextFieldProps): ReactNode {
  const id = useId();
  const hintId = `${id}-hint`;
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label htmlFor={id} className="font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={hint === undefined ? undefined : hintId}
        className="min-h-12 rounded-xl bg-white px-4 text-base ring-1 ring-slate-300 focus:ring-2 focus:ring-brand-600 focus:outline-none"
        {...props}
      />
      {hint !== undefined && (
        <p id={hintId} className="text-sm text-slate-600">
          {hint}
        </p>
      )}
    </div>
  );
}
