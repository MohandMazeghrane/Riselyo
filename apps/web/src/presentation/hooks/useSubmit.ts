import { useState } from 'react';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';

export interface Submission<A> {
  readonly submit: (input: A) => void;
  readonly pending: boolean;
  readonly error: DomainError | null;
}

/** Runs a use case from a form, tracks the pending state and moves on when it succeeds. */
export function useSubmit<A>(
  action: (input: A) => Promise<Result<void, DomainError>>,
  onSuccess: () => void,
): Submission<A> {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<DomainError | null>(null);

  const submit = (input: A): void => {
    setPending(true);
    setError(null);
    void action(input).then((result) => {
      setPending(false);
      if (result.ok) {
        onSuccess();
        return;
      }
      setError(result.error);
    });
  };

  return { submit, pending, error };
}
