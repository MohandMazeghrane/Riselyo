import { domainError, type DomainError } from '../../domain/shared/domainError';
import { err, ok, type Result } from '../../domain/shared/result';

/** Runs an IndexedDB operation and turns any exception into a storage failure. */
export async function storageResult<T>(
  detail: string,
  operation: () => Promise<T>,
): Promise<Result<T, DomainError>> {
  try {
    return ok(await operation());
  } catch {
    return err(domainError('storage_failure', detail));
  }
}

export function unreadableRecord(table: string): DomainError {
  return domainError('storage_failure', `a ${table} record is unreadable`);
}

/** A stored row seen as untrusted fields, each of which still has to be checked. */
export type UntrustedFields<K extends string> = Readonly<Partial<Record<K, unknown>>>;

export function asFields<K extends string>(value: unknown): UntrustedFields<K> | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }
  return value as UntrustedFields<K>;
}

export function textOrEmpty(value: unknown): string {
  return typeof value === 'string' ? value : '';
}
