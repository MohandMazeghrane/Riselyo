import type { RetentionCutoffs } from '../privacy/retention';
import type { DomainError } from '../shared/domainError';
import type { Result } from '../shared/result';

/** How many records were removed, by kind. */
export interface PurgeReport {
  readonly journal: number;
  readonly conversations: number;
  readonly messages: number;
  readonly aiUsage: number;
}

export interface ExpiredDataPurger {
  /** Removes everything past its retention period, in one go (CLAUDE.md, section 12). */
  purge(cutoffs: RetentionCutoffs): Promise<Result<PurgeReport, DomainError>>;
}
