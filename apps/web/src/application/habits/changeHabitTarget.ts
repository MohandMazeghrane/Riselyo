import { changeTarget, type HabitTemplateId, type HabitTier } from '../../domain/entities/habit';
import type { HabitRepository } from '../../domain/ports/onboardingRepositories';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import { findActiveHabit } from './habitDeps';

export type ChangeHabitTarget = (
  templateId: HabitTemplateId,
  tier: HabitTier,
) => Promise<Result<void, DomainError>>;

/** The user moves a habit to another tier; nothing changes without their choice. */
export function createChangeHabitTarget(deps: {
  readonly habits: HabitRepository;
}): ChangeHabitTarget {
  return async (templateId, tier) => {
    const habit = await findActiveHabit(deps.habits, templateId);
    if (!habit.ok) {
      return habit;
    }
    const changed = changeTarget(habit.value, tier);
    return changed.ok ? deps.habits.save(changed.value) : changed;
  };
}
