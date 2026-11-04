import { emptyDayEntry } from '../../domain/entities/dayEntry';
import type { Habit } from '../../domain/entities/habit';
import type { HabitLevel, HabitLog } from '../../domain/entities/habitLog';
import { daysWithout } from '../../domain/entities/habitProgress';
import type { QuickCounts } from '../../domain/entities/quickCounts';
import type { HabitLogRepository } from '../../domain/ports/checkInRepositories';
import { dayKeyOf, type DayKey } from '../../domain/shared/dayKey';
import type { DomainError } from '../../domain/shared/domainError';
import { ok, type Result } from '../../domain/shared/result';
import type { HabitDeps } from './habitDeps';

export interface TodayHabit {
  readonly habit: Habit;
  /** Undefined while nothing is logged for today. */
  readonly level: HabitLevel | undefined;
  /** Only for a habit to reduce. */
  readonly daysWithout: number | null;
}

export interface TodayHabits {
  readonly day: DayKey;
  readonly habits: readonly TodayHabit[];
  readonly quick: QuickCounts;
}

export type GetTodayHabits = () => Promise<Result<TodayHabits, DomainError>>;

/** The day's habits with their level, and what the quick buttons added up to. */
export function createGetTodayHabits(deps: HabitDeps): GetTodayHabits {
  return async () => {
    const day = dayKeyOf(deps.clock.localNow());
    const [active, logs, entry] = await Promise.all([
      deps.habits.listActive(),
      deps.habitLogs.listByDay(day),
      deps.dayEntries.findByDay(day),
    ]);
    if (!active.ok) {
      return active;
    }
    if (!logs.ok) {
      return logs;
    }
    if (!entry.ok) {
      return entry;
    }
    const habits = await describeHabits(active.value, logs.value, deps.habitLogs);
    if (!habits.ok) {
      return habits;
    }
    const quick = (entry.value ?? emptyDayEntry(day)).quick;
    return ok({ day, habits: habits.value, quick });
  };
}

async function describeHabits(
  habits: readonly Habit[],
  todayLogs: readonly HabitLog[],
  habitLogs: HabitLogRepository,
): Promise<Result<TodayHabit[], DomainError>> {
  const described: TodayHabit[] = [];
  for (const habit of habits) {
    const level = todayLogs.find((log) => log.templateId === habit.templateId)?.level;
    if (habit.kind === 'do') {
      described.push({ habit, level, daysWithout: null });
      continue;
    }
    const history = await habitLogs.listForHabit(habit.templateId);
    if (!history.ok) {
      return history;
    }
    described.push({ habit, level, daysWithout: daysWithout(history.value) });
  }
  return ok(described);
}
