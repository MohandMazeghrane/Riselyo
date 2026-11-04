import type { ExpiredDataPurger, PurgeReport } from '../../domain/ports/expiredDataPurger';
import type { Clock } from '../../domain/ports/clock';
import { retentionCutoffs } from '../../domain/privacy/retention';
import { dayKeyOf } from '../../domain/shared/dayKey';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';

export type PurgeExpiredData = () => Promise<Result<PurgeReport, DomainError>>;

/** Runs at every launch: data past its retention period disappears without asking. */
export function createPurgeExpiredData(deps: {
  readonly clock: Clock;
  readonly purger: ExpiredDataPurger;
}): PurgeExpiredData {
  return () => {
    const cutoffs = retentionCutoffs(deps.clock.now(), dayKeyOf(deps.clock.localNow()));
    return deps.purger.purge(cutoffs);
  };
}
