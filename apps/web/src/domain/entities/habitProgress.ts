import {
  NEW_HABIT_ADHERENCE_WINDOW_DAYS,
  NEW_HABIT_MIN_ADHERENCE,
  NEW_HABIT_MIN_ANSWERED_DAYS,
} from '../config/habits';
import { daysBefore, type DayKey } from '../shared/dayKey';
import { domainError, type DomainError } from '../shared/domainError';
import { err, ok, type Result } from '../shared/result';
import { createHabit, kindOf, type Habit, type HabitTemplateId } from './habit';
import type { HabitLog } from './habitLog';

export type HabitAdditionCheck =
  | { readonly allowed: true }
  | { readonly allowed: false; readonly reason: 'already_active' }
  | { readonly allowed: false; readonly reason: 'not_enough_data'; readonly answeredDays: number }
  | { readonly allowed: false; readonly reason: 'low_adherence'; readonly adherence: number };

export interface HabitAdditionInput {
  readonly templateId: HabitTemplateId;
  readonly activeHabits: readonly Habit[];
  /** Logs of the last days; anything outside the window is ignored. */
  readonly recentLogs: readonly HabitLog[];
  readonly today: DayKey;
}

/**
 * A new habit to build only once the current ones hold (docs/cahier-des-charges.md, section 4).
 * Habits to reduce can always be added: they ask nothing more of the day.
 */
export function checkHabitAddition(input: HabitAdditionInput): HabitAdditionCheck {
  const { templateId, activeHabits } = input;
  if (activeHabits.some((habit) => habit.templateId === templateId)) {
    return { allowed: false, reason: 'already_active' };
  }
  const habitsToBuild = activeHabits.filter((habit) => habit.kind === 'do');
  if (kindOf(templateId) === 'reduce' || habitsToBuild.length === 0) {
    return { allowed: true };
  }
  return checkAdherence(habitsToBuild, input);
}

/** First day whose logs count in the adherence check. */
export function adherenceWindowStart(today: DayKey): DayKey {
  return daysBefore(today, NEW_HABIT_ADHERENCE_WINDOW_DAYS).at(-1) ?? today;
}

export function addHabit(input: HabitAdditionInput): Result<Habit, DomainError> {
  const check = checkHabitAddition(input);
  if (!check.allowed) {
    return err(domainError('invalid_input', check.reason));
  }
  return ok(createHabit(input.templateId, input.today));
}

/**
 * Consecutive days without, back from the last answered day. Unanswered days are skipped:
 * they neither count nor break the run, so no answer is ever invented.
 */
export function daysWithout(logs: readonly HabitLog[]): number {
  const mostRecentFirst = [...logs].sort((a, b) => b.day.localeCompare(a.day));
  const lastTime = mostRecentFirst.findIndex((log) => log.level === 'none');
  return lastTime === -1 ? mostRecentFirst.length : lastTime;
}

function checkAdherence(
  habitsToBuild: readonly Habit[],
  { recentLogs, today }: HabitAdditionInput,
): HabitAdditionCheck {
  const window = new Set(daysBefore(today, NEW_HABIT_ADHERENCE_WINDOW_DAYS));
  const counted = recentLogs.filter(
    (log) =>
      window.has(log.day) && habitsToBuild.some((habit) => habit.templateId === log.templateId),
  );
  const answeredDays = new Set(counted.map((log) => log.day)).size;
  if (answeredDays < NEW_HABIT_MIN_ANSWERED_DAYS) {
    return { allowed: false, reason: 'not_enough_data', answeredDays };
  }
  const adherence = counted.filter((log) => log.level !== 'none').length / counted.length;
  if (adherence < NEW_HABIT_MIN_ADHERENCE) {
    return { allowed: false, reason: 'low_adherence', adherence };
  }
  return { allowed: true };
}
