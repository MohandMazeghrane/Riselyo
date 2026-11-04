import type { ReactNode } from 'react';
import { fr } from '../content/fr';
import { Button } from './Button';

interface LoadStateProps {
  readonly status: 'loading' | 'error';
  readonly onRetry: () => void;
}

/** Shown while data loads or when it could not be read: never a blank screen. */
export function LoadState({ status, onRetry }: LoadStateProps): ReactNode {
  if (status === 'loading') {
    return (
      <p role="status" className="p-5 text-slate-600">
        {fr.common.loading}
      </p>
    );
  }
  return (
    <div role="alert" className="flex flex-col gap-4 p-5">
      <p>{fr.common.loadError}</p>
      <Button variant="secondary" onClick={onRetry}>
        {fr.common.retry}
      </Button>
    </div>
  );
}
