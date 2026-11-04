import { decideConsent, type ConsentChoice, type ConsentSet } from '../../domain/entities/consent';
import type { Clock } from '../../domain/ports/clock';
import type { ConsentRepository } from '../../domain/ports/consentRepository';
import type { DomainError } from '../../domain/shared/domainError';
import { ok, type Result } from '../../domain/shared/result';

export type UpdateConsent = (choice: ConsentChoice) => Promise<Result<ConsentSet, DomainError>>;

/** Profile → Confidentialité: one switch at a time, dated, revocable at any moment. */
export function createUpdateConsent(deps: {
  readonly consents: ConsentRepository;
  readonly clock: Clock;
}): UpdateConsent {
  return async (choice) => {
    const current = await deps.consents.load();
    if (!current.ok) {
      return current;
    }
    const decided = decideConsent(current.value, choice, deps.clock.now());
    if (!decided.ok) {
      return decided;
    }
    const saved = await deps.consents.save(decided.value);
    return saved.ok ? ok(decided.value) : saved;
  };
}
