import type { DomainError } from '../shared/domainError';
import type { Result } from '../shared/result';

/** Right to erasure, on the phone (CLAUDE.md, section 12). */
export interface LocalDataEraser {
  /** Empties every table at once; nothing is erased if it fails. */
  eraseDatabase(): Promise<Result<void, DomainError>>;
  /** Removes the offline caches and the service worker, so the app starts afresh next time. */
  eraseCaches(): Promise<Result<void, DomainError>>;
}
