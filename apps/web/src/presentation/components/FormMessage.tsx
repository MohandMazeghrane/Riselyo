import type { ReactNode } from 'react';

interface FormMessageProps {
  readonly tone: 'error' | 'info';
  readonly children: ReactNode;
}

/** Inline feedback: errors are announced right away, gentle notes politely. */
export function FormMessage({ tone, children }: FormMessageProps): ReactNode {
  if (tone === 'error') {
    return (
      <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
        {children}
      </p>
    );
  }
  return (
    <p role="status" className="rounded-xl bg-brand-50 p-3 text-sm text-brand-700">
      {children}
    </p>
  );
}
