import { nextOnboardingStep, type OnboardingStep } from '../../domain/entities/onboarding';
import type { Profile } from '../../domain/entities/profile';
import type { ProfileRepository } from '../../domain/ports/onboardingRepositories';
import type { DomainError } from '../../domain/shared/domainError';
import { ok, type Result } from '../../domain/shared/result';

export interface OnboardingStatus {
  readonly nextStep: OnboardingStep | 'done';
  /** Already answered values, to pre-fill the screens when the user comes back. */
  readonly profile: Profile | null;
}

export type GetOnboardingStatus = () => Promise<Result<OnboardingStatus, DomainError>>;

export function createGetOnboardingStatus(deps: {
  readonly profiles: ProfileRepository;
}): GetOnboardingStatus {
  return async () => {
    const loaded = await deps.profiles.load();
    if (!loaded.ok) {
      return loaded;
    }
    const profile = loaded.value;
    return ok({ nextStep: nextOnboardingStep(profile?.completedSteps ?? []), profile });
  };
}
