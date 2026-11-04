import type { DayKey } from '../shared/dayKey';
import { domainError, type DomainError } from '../shared/domainError';
import { err, ok, type Result } from '../shared/result';
import { HABIT_CATALOGUE, type Habit, type HabitTemplateId } from './habit';

/** What the evening check-in asks for each habit: not done, or the tier reached. */
export const HABIT_LEVELS = ['none', 'min', 'normal', 'excellent'] as const;

export type HabitLevel = (typeof HABIT_LEVELS)[number];

export interface HabitLog {
  readonly templateId: HabitTemplateId;
  readonly day: DayKey;
  readonly level: HabitLevel;
}

export type HabitLevelAnswers = Partial<Record<HabitTemplateId, HabitLevel>>;

/** "No alcohol" has no minimum tier, so "minimum" cannot be answered for it. */
export function levelsAvailableFor(templateId: HabitTemplateId): HabitLevel[] {
  const template = HABIT_CATALOGUE.find(({ id }) => id === templateId);
  return template?.hasMinimum === false
    ? HABIT_LEVELS.filter((level) => level !== 'min')
    : [...HABIT_LEVELS];
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
    if (!levelsAvailableFor(templateId).includes(level)) {
      return err(domainError('invalid_input', `${templateId} has no ${level} tier`));
    }
    logs.push({ templateId, day, level });
  }
  return ok(logs);
}
