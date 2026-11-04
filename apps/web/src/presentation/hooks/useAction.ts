import { useState } from 'react';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';

export interface ActionRunner {
  readonly run: (action: () => Promise<Result<void, DomainError>>) => void;
  readonly pending: boolean;
  readonly error: DomainError | null;
}

/** One tap, one change: ignores taps while saving, then lets the screen reload its data. */
export function useAction(onDone: () => void): ActionRunner {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<DomainError | null>(null);

  const run = (action: () => Promise<Result<void, DomainError>>): void => {
    if (pending) {
      return;
    }
    setPending(true);
    setError(null);
    void action().then((result) => {
      setPending(false);
      if (!result.ok) {
        setError(result.error);
      }
      onDone();
    });
  };

  return { run, pending, error };
}
