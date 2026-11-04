import type { ReactNode } from 'react';

/** Keeps the main actions at the bottom, within thumb reach. */
export function FooterActions({ children }: { readonly children: ReactNode }): ReactNode {
  return <div className="mt-auto flex flex-col gap-3 pt-2">{children}</div>;
}
