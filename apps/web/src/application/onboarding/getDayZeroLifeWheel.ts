import type { LifeWheel } from '../../domain/entities/lifeWheel';
import type {
  LifeWheelRepository,
  ProfileRepository,
} from '../../domain/ports/onboardingRepositories';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import { loadStartedProfile } from './loadStartedProfile';

export type GetDayZeroLifeWheel = () => Promise<Result<LifeWheel | null, DomainError>>;

/** The starting point shown on the radar after screen A1. */
export function createGetDayZeroLifeWheel(deps: {
  readonly profiles: ProfileRepository;
  readonly lifeWheels: LifeWheelRepository;
}): GetDayZeroLifeWheel {
  return async () => {
    const profile = await loadStartedProfile(deps.profiles);
    if (!profile.ok) {
      return profile;
    }
    return deps.lifeWheels.findByDay(profile.value.dayZero);
  };
}
