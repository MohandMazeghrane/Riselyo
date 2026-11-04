import {
  DEFAULT_BEDTIME,
  DEFAULT_EVENING_CHECK_IN_TIME,
  DEFAULT_WAKE_TIME,
  SLEEP_ALERT_MAX_MINUTES,
  SLEEP_ALERT_MIN_MINUTES,
} from '../config/onboarding';
import { domainError, type DomainError } from '../shared/domainError';
import { err, ok, type Result } from '../shared/result';
import { MINUTES_PER_DAY, minutesBetween, type TimeOfDay } from '../shared/timeOfDay';

export const WEEKDAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

export type Weekday = (typeof WEEKDAYS)[number];

/** The user's usual day: feeds the sleep score, notifications and reminders later on. */
export interface Rhythm {
  readonly wakeTime: TimeOfDay;
  readonly bedtime: TimeOfDay;
  readonly sleepTargetMinutes: number;
  readonly eveningCheckInTime: TimeOfDay;
  readonly sportDays: readonly Weekday[];
}

export type RhythmInput = Rhythm;

export type SleepWarning = 'too_short' | 'too_long';

export function defaultRhythm(): Rhythm {
  const wakeTime = DEFAULT_WAKE_TIME as TimeOfDay;
  const bedtime = DEFAULT_BEDTIME as TimeOfDay;
  return {
    wakeTime,
    bedtime,
    sleepTargetMinutes: suggestedSleepMinutes(bedtime, wakeTime),
    eveningCheckInTime: DEFAULT_EVENING_CHECK_IN_TIME as TimeOfDay,
    sportDays: [],
  };
}

export function suggestedSleepMinutes(bedtime: TimeOfDay, wakeTime: TimeOfDay): number {
  return minutesBetween(bedtime, wakeTime);
}

export function sleepDurationWarning(minutes: number): SleepWarning | null {
  if (minutes < SLEEP_ALERT_MIN_MINUTES) {
    return 'too_short';
  }
  return minutes > SLEEP_ALERT_MAX_MINUTES ? 'too_long' : null;
}

export function createRhythm(input: RhythmInput): Result<Rhythm, DomainError> {
  const { sleepTargetMinutes } = input;
  if (
    !Number.isInteger(sleepTargetMinutes) ||
    sleepTargetMinutes <= 0 ||
    sleepTargetMinutes > MINUTES_PER_DAY
  ) {
    return err(domainError('invalid_input', 'sleep target must be whole minutes within a day'));
  }
  return ok({ ...input, sportDays: WEEKDAYS.filter((day) => input.sportDays.includes(day)) });
}
