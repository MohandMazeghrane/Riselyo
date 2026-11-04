import { createLifeWheel, type LifeDomain } from '../../domain/entities/lifeWheel';
import { markStepCompleted } from '../../domain/entities/profile';
import type {
  LifeWheelRepository,
  ProfileRepository,
} from '../../domain/ports/onboardingRepositories';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import { loadStartedProfile } from './loadStartedProfile';

export type SubmitLifeWheel = (
  scores: Partial<Record<LifeDomain, number>>,
) => Promise<Result<void, DomainError>>;

/** Screen A1. The wheel is dated day 0, the reference for the monthly comparison. */
export function createSubmitLifeWheel(deps: {
  readonly profiles: ProfileRepository;
  readonly lifeWheels: LifeWheelRepository;
}): SubmitLifeWheel {
  return async (scores) => {
    const profile = await loadStartedProfile(deps.profiles);
    if (!profile.ok) {
      return profile;
    }
    const wheel = createLifeWheel(profile.value.dayZero, scores);
    if (!wheel.ok) {
      return wheel;
    }
    const saved = await deps.lifeWheels.save(wheel.value);
    if (!saved.ok) {
      return saved;
    }
    return deps.profiles.save(markStepCompleted(profile.value, 'lifeWheel'));
  };
}
