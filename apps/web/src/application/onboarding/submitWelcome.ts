import { markStepCompleted, parseFirstName, startProfile } from '../../domain/entities/profile';
import type { Clock } from '../../domain/ports/clock';
import type { ProfileRepository } from '../../domain/ports/onboardingRepositories';
import { dayKeyOf } from '../../domain/shared/dayKey';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';

export type SubmitWelcome = (firstName: string) => Promise<Result<void, DomainError>>;

/** Screen A0. The first validation creates the profile and fixes day 0. */
export function createSubmitWelcome(deps: {
  readonly profiles: ProfileRepository;
  readonly clock: Clock;
}): SubmitWelcome {
  return async (input) => {
    const firstName = parseFirstName(input);
    if (!firstName.ok) {
      return firstName;
    }
    const loaded = await deps.profiles.load();
    if (!loaded.ok) {
      return loaded;
    }
    const profile =
      loaded.value === null
        ? startProfile(firstName.value, dayKeyOf(deps.clock.localNow()))
        : markStepCompleted({ ...loaded.value, firstName: firstName.value }, 'welcome');
    return deps.profiles.save(profile);
  };
}
