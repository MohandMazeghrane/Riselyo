import { type HabitTemplateId } from '../../domain/entities/habit';
import { addHabit, adherenceWindowStart } from '../../domain/entities/habitProgress';
import { dayKeyOf } from '../../domain/shared/dayKey';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import type { HabitDeps } from './habitDeps';

export type AddHabit = (templateId: HabitTemplateId) => Promise<Result<void, DomainError>>;

/** Adds a habit at its smallest tier; a habit stopped earlier starts small again. */
export function createAddHabit(deps: Pick<HabitDeps, 'clock' | 'habits' | 'habitLogs'>): AddHabit {
  return async (templateId) => {
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
    const habit = addHabit({
      templateId,
      activeHabits: active.value,
      recentLogs: recentLogs.value,
      today,
    });
    return habit.ok ? deps.habits.save(habit.value) : habit;
  };
}
