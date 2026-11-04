import type { ConsentSet } from '../entities/consent';
import type { DomainError } from '../shared/domainError';
import type { Result } from '../shared/result';

export interface ConsentRepository {
  /** Returns the stored decisions; purposes never decided come back as denied. */
  load(): Promise<Result<ConsentSet, DomainError>>;
  save(consents: ConsentSet): Promise<Result<void, DomainError>>;
}
