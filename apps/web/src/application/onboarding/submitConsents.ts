import { applyConsentChoices, type ConsentChoices } from '../../domain/entities/consent';
import { markStepCompleted } from '../../domain/entities/profile';
import type { Clock } from '../../domain/ports/clock';
import type { ConsentRepository } from '../../domain/ports/consentRepository';
import type { ProfileRepository } from '../../domain/ports/onboardingRepositories';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import { loadStartedProfile } from './loadStartedProfile';

export type SubmitConsents = (choices: ConsentChoices) => Promise<Result<void, DomainError>>;

/** Screen A6: every switch is a dated decision, refusals included. */
export function createSubmitConsents(deps: {
  readonly profiles: ProfileRepository;
  readonly consents: ConsentRepository;
  readonly clock: Clock;
}): SubmitConsents {
  return async (choices) => {
    const profile = await loadStartedProfile(deps.profiles);
    if (!profile.ok) {
      return profile;
    }
    const current = await deps.consents.load();
    if (!current.ok) {
      return current;
    }
    const decided = applyConsentChoices(current.value, choices, deps.clock.now());
    if (!decided.ok) {
      return decided;
    }
    const saved = await deps.consents.save(decided.value);
    if (!saved.ok) {
      return saved;
    }
    return deps.profiles.save(markStepCompleted(profile.value, 'consents'));
  };
}
