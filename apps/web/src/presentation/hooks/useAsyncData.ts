import { useCallback, useEffect, useState } from 'react';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';

export type AsyncData<T> =
  | { readonly status: 'loading' }
  | { readonly status: 'error' }
  | { readonly status: 'ready'; readonly data: T };

/** Loads data once (and again on retry); every screen renders loading, error and ready. */
export function useAsyncData<T>(
  load: () => Promise<Result<T, DomainError>>,
): AsyncData<T> & { readonly retry: () => void } {
  const [state, setState] = useState<AsyncData<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    void load().then((result) => {
      if (current) {
        setState(result.ok ? { status: 'ready', data: result.value } : { status: 'error' });
      }
    });
    return () => {
      current = false;
    };
  }, [load, attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((value) => value + 1);
  }, []);

  return { ...state, retry };
}
