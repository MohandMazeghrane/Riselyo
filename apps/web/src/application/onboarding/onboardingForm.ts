import {
  HABIT_CATALOGUE,
  startingTier,
  type HabitTemplateId,
  type HabitTier,
} from '../../domain/entities/habit';
import { LIFE_DOMAINS } from '../../domain/entities/lifeWheel';
import {
  defaultRhythm,
  sleepDurationWarning,
  suggestedSleepMinutes,
  WEEKDAYS,
  type SleepWarning,
  type Weekday,
} from '../../domain/entities/rhythm';
import {
  FIRST_NAME_MAX_LENGTH,
  LIFE_WHEEL_MAX_SCORE,
  LIFE_WHEEL_MIN_SCORE,
  MAX_FIRST_GOALS,
  WHY_MAX_LENGTH,
} from '../../domain/config/onboarding';
import { parseTimeOfDay } from '../../domain/shared/timeOfDay';

/** What the onboarding screens need to build their forms, without touching domain logic. */
export const ONBOARDING_FORM = {
  firstNameMaxLength: FIRST_NAME_MAX_LENGTH,
  whyMaxLength: WHY_MAX_LENGTH,
  lifeDomains: LIFE_DOMAINS,
  lifeWheelMinScore: LIFE_WHEEL_MIN_SCORE,
  lifeWheelMaxScore: LIFE_WHEEL_MAX_SCORE,
  habitTemplateIds: HABIT_CATALOGUE.map(({ id }) => id),
  maxFirstGoals: MAX_FIRST_GOALS,
  weekdays: WEEKDAYS,
} as const;

/** The rhythm as typed in the form: times are still plain HH:MM strings. */
export interface RhythmForm {
  readonly wakeTime: string;
  readonly bedtime: string;
  readonly sleepTargetMinutes: number;
  readonly eveningCheckInTime: string;
  readonly sportDays: readonly Weekday[];
}

export function defaultRhythmForm(): RhythmForm {
  return defaultRhythm();
}

export function startingTierOf(templateId: HabitTemplateId): HabitTier {
  return startingTier(templateId);
}

/** Sleep duration implied by the two times, or null while one of them is incomplete. */
export function suggestSleepMinutes(bedtime: string, wakeTime: string): number | null {
  const bed = parseTimeOfDay(bedtime);
  const wake = parseTimeOfDay(wakeTime);
  return bed.ok && wake.ok ? suggestedSleepMinutes(bed.value, wake.value) : null;
}

export function sleepWarning(sleepTargetMinutes: number): SleepWarning | null {
  return sleepDurationWarning(sleepTargetMinutes);
}
