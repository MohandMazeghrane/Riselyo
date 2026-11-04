import type { DayKey } from '../shared/dayKey';
import { domainError, type DomainError } from '../shared/domainError';
import { err, ok, type Result } from '../shared/result';
import {
  hasMinimumTier,
  kindOf,
  REDUCE_HABIT_TIER,
  type Habit,
  type HabitTemplateId,
} from './habit';

/**
 * Not done, or the tier reached. For a habit to reduce, the only tier means "a day without"
 * and "none" means it happened that day.
 */
export const HABIT_LEVELS = ['none', 'min', 'normal', 'excellent'] as const;

export type HabitLevel = (typeof HABIT_LEVELS)[number];

export interface HabitLog {
  readonly templateId: HabitTemplateId;
  readonly day: DayKey;
  readonly level: HabitLevel;
}

export type HabitLevelAnswers = Partial<Record<HabitTemplateId, HabitLevel>>;

export function levelsAvailableFor(templateId: HabitTemplateId): HabitLevel[] {
  if (kindOf(templateId) === 'reduce') {
    return ['none', REDUCE_HABIT_TIER];
  }
  return hasMinimumTier(templateId)
    ? [...HABIT_LEVELS]
    : HABIT_LEVELS.filter((level) => level !== 'min');
}

/** One tap on a habit: up one tier, then back to "not done"; the first tap logs the lowest tier. */
export function nextLevel(
  templateId: HabitTemplateId,
  current: HabitLevel | undefined,
): HabitLevel {
  const levels = levelsAvailableFor(templateId);
  const cycle = [...levels.slice(1), ...levels.slice(0, 1)];
  const index = current === undefined ? -1 : cycle.indexOf(current);
  return cycle[(index + 1) % cycle.length] ?? 'none';
}

/** Checks one log: the habit must be active and have the level logged. */
export function createHabitLog(
  activeHabits: readonly Habit[],
  log: HabitLog,
): Result<HabitLog, DomainError> {
  const { templateId, level } = log;
  if (!activeHabits.some((habit) => habit.templateId === templateId)) {
    return err(domainError('not_found', `${templateId} is not an active habit`));
  }
  if (!levelsAvailableFor(templateId).includes(level)) {
    return err(domainError('invalid_input', `${templateId} has no ${level} tier`));
  }
  return ok(log);
}

/** One log per active habit the user answered; a habit left blank is not invented. */
export function createHabitLogs(
  day: DayKey,
  activeHabits: readonly Habit[],
  answers: HabitLevelAnswers,
): Result<HabitLog[], DomainError> {
  const logs: HabitLog[] = [];
  for (const { templateId } of activeHabits) {
    const level = answers[templateId];
    if (level === undefined) {
      continue;
    }
    const log = createHabitLog(activeHabits, { templateId, day, level });
    if (!log.ok) {
      return log;
    }
    logs.push(log.value);
  }
  return ok(logs);
}
