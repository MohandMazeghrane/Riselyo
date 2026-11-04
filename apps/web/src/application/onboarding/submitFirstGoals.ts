import { chooseFirstGoals, type HabitTemplateId } from '../../domain/entities/habit';
import { markStepCompleted } from '../../domain/entities/profile';
import type { Clock } from '../../domain/ports/clock';
import type { HabitRepository, ProfileRepository } from '../../domain/ports/onboardingRepositories';
import { dayKeyOf } from '../../domain/shared/dayKey';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import { loadStartedProfile } from './loadStartedProfile';

export type SubmitFirstGoals = (
  templateIds: readonly HabitTemplateId[],
) => Promise<Result<void, DomainError>>;

/** Screen A5. Choosing again (after going back) replaces the previous choice. */
export function createSubmitFirstGoals(deps: {
  readonly profiles: ProfileRepository;
  readonly habits: HabitRepository;
  readonly clock: Clock;
}): SubmitFirstGoals {
  return async (templateIds) => {
    const profile = await loadStartedProfile(deps.profiles);
    if (!profile.ok) {
      return profile;
    }
    const goals = chooseFirstGoals(templateIds, dayKeyOf(deps.clock.localNow()));
    if (!goals.ok) {
      return goals;
    }
    const saved = await deps.habits.replaceActive(goals.value);
    if (!saved.ok) {
      return saved;
    }
    return deps.profiles.save(markStepCompleted(profile.value, 'goals'));
  };
}
