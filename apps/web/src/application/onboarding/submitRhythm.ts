import { markStepCompleted } from '../../domain/entities/profile';
import { createRhythm, type RhythmInput } from '../../domain/entities/rhythm';
import type { ProfileRepository } from '../../domain/ports/onboardingRepositories';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import { loadStartedProfile } from './loadStartedProfile';

export type SubmitRhythm = (input: RhythmInput) => Promise<Result<void, DomainError>>;

/** Screen A3. */
export function createSubmitRhythm(deps: { readonly profiles: ProfileRepository }): SubmitRhythm {
  return async (input) => {
    const profile = await loadStartedProfile(deps.profiles);
    if (!profile.ok) {
      return profile;
    }
    const rhythm = createRhythm(input);
    if (!rhythm.ok) {
      return rhythm;
    }
    return deps.profiles.save(
      markStepCompleted({ ...profile.value, rhythm: rhythm.value }, 'rhythm'),
    );
  };
}
