import { ALL_HABIT_IDS, type Habit, type HabitTemplateId } from '../../domain/entities/habit';
import {
  adherenceWindowStart,
  checkHabitAddition,
  type HabitAdditionCheck,
} from '../../domain/entities/habitProgress';
import { dayKeyOf } from '../../domain/shared/dayKey';
import type { DomainError } from '../../domain/shared/domainError';
import { ok, type Result } from '../../domain/shared/result';
import type { HabitDeps } from './habitDeps';

export interface AvailableHabit {
  readonly templateId: HabitTemplateId;
  /** Whether it can be added now, and if not, why. */
  readonly check: HabitAdditionCheck;
}

export interface HabitPlan {
  readonly active: readonly Habit[];
  readonly available: readonly AvailableHabit[];
}

export type GetHabitPlan = () => Promise<Result<HabitPlan, DomainError>>;

/** Profile → habits: the active ones, and the others with whether they can be added yet. */
export function createGetHabitPlan(
  deps: Pick<HabitDeps, 'clock' | 'habits' | 'habitLogs'>,
): GetHabitPlan {
  return async () => {
    const today = dayKeyOf(deps.clock.localNow());
    const [active, recentLogs] = await Promise.all([
      deps.habits.listActive(),
      deps.habitLogs.listSince(adherenceWindowStart(today)),
    ]);
    if (!active.ok) {
      return active;
    }
    if (!recentLogs.ok) {
      return recentLogs;
    }
    const activeHabits = active.value;
    const available = ALL_HABIT_IDS.filter(
      (templateId) => !activeHabits.some((habit) => habit.templateId === templateId),
    ).map((templateId) => ({
      templateId,
      check: checkHabitAddition({ templateId, activeHabits, recentLogs: recentLogs.value, today }),
    }));
    return ok({ active: activeHabits, available });
  };
}
