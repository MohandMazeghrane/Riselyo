import { markStepCompleted, parseWhy } from '../../domain/entities/profile';
import type { ProfileRepository } from '../../domain/ports/onboardingRepositories';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import { loadStartedProfile } from './loadStartedProfile';

export type SubmitWhy = (why: string) => Promise<Result<void, DomainError>>;

/** Screen A4. Optional: an empty answer is accepted. */
export function createSubmitWhy(deps: { readonly profiles: ProfileRepository }): SubmitWhy {
  return async (input) => {
    const profile = await loadStartedProfile(deps.profiles);
    if (!profile.ok) {
      return profile;
    }
    const why = parseWhy(input);
    if (!why.ok) {
      return why;
    }
    return deps.profiles.save(markStepCompleted({ ...profile.value, why: why.value }, 'why'));
  };
}
