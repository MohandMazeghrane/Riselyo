import type { HabitTemplateId } from '../../domain/entities/habit';
import type { HabitRepository } from '../../domain/ports/onboardingRepositories';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import { findActiveHabit } from './habitDeps';

export type StopHabit = (templateId: HabitTemplateId) => Promise<Result<void, DomainError>>;

/** Stops following a habit; its past logs stay in the history. */
export function createStopHabit(deps: { readonly habits: HabitRepository }): StopHabit {
  return async (templateId) => {
    const habit = await findActiveHabit(deps.habits, templateId);
    return habit.ok ? deps.habits.save({ ...habit.value, active: false }) : habit;
  };
}
