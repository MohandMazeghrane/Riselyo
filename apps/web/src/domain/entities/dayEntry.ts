import {
  CHECK_IN_SCALE_MAX,
  CHECK_IN_SCALE_MIN,
  PRIORITY_MAX_LENGTH,
  VICTORY_MAX_LENGTH,
} from '../config/checkIn';
import type { DayKey } from '../shared/dayKey';
import { domainError, type DomainError } from '../shared/domainError';
import { err, ok, type Result } from '../shared/result';
import { minutesBetween, type TimeOfDay } from '../shared/timeOfDay';
import type { HabitTemplateId } from './habit';

/** One single action for the day: one of the goals, or written freely. */
export type DailyPriority =
  | { readonly kind: 'habit'; readonly templateId: HabitTemplateId }
  | { readonly kind: 'free'; readonly text: string };

export interface MorningInput {
  readonly bedtime: TimeOfDay;
  readonly wakeTime: TimeOfDay;
  readonly sleepQuality: number | undefined;
  readonly energy: number | undefined;
  readonly priority: DailyPriority | null;
}

export interface MorningCheckIn extends MorningInput {
  readonly sleepQuality: number;
  readonly energy: number;
  readonly completedAt: Date;
}

export interface EveningInput {
  readonly mood: number | undefined;
  readonly stress: number | undefined;
  /** Null when there was no priority this morning. */
  readonly priorityKept: boolean | null;
  readonly victory: string;
}

export interface EveningCheckIn {
  readonly mood: number;
  readonly stress: number;
  readonly priorityKept: boolean | null;
  readonly victory: string | null;
  readonly completedAt: Date;
}

/** Everything declared about one day (a day ends at 4 a.m., see DAY_ROLLOVER_HOUR). */
export interface DayEntry {
  readonly day: DayKey;
  readonly morning: MorningCheckIn | null;
  readonly evening: EveningCheckIn | null;
}

export function emptyDayEntry(day: DayKey): DayEntry {
  return { day, morning: null, evening: null };
}

export function createMorningCheckIn(
  input: MorningInput,
  at: Date,
): Result<MorningCheckIn, DomainError> {
  const { sleepQuality, energy } = input;
  if (!isOnScale(sleepQuality) || !isOnScale(energy)) {
    return err(domainError('invalid_input', 'sleep quality and energy go from 1 to 5'));
  }
  const priority = parsePriority(input.priority);
  if (!priority.ok) {
    return priority;
  }
  return ok({ ...input, sleepQuality, energy, priority: priority.value, completedAt: at });
}

export function createEveningCheckIn(
  input: EveningInput,
  morning: MorningCheckIn | null,
  at: Date,
): Result<EveningCheckIn, DomainError> {
  const { mood, stress } = input;
  if (!isOnScale(mood) || !isOnScale(stress)) {
    return err(domainError('invalid_input', 'mood and stress go from 1 to 5'));
  }
  const hadPriority = (morning?.priority ?? null) !== null;
  if (hadPriority && input.priorityKept === null) {
    return err(domainError('invalid_input', 'say whether the priority was kept'));
  }
  const victory = parseVictory(input.victory);
  if (!victory.ok) {
    return victory;
  }
  const priorityKept = hadPriority ? input.priorityKept : null;
  return ok({ mood, stress, priorityKept, victory: victory.value, completedAt: at });
}

export function sleptMinutes(morning: MorningCheckIn): number {
  return minutesBetween(morning.bedtime, morning.wakeTime);
}

function isOnScale(value: number | undefined): value is number {
  return (
    value !== undefined &&
    Number.isInteger(value) &&
    value >= CHECK_IN_SCALE_MIN &&
    value <= CHECK_IN_SCALE_MAX
  );
}

function parsePriority(priority: DailyPriority | null): Result<DailyPriority | null, DomainError> {
  if (priority?.kind !== 'free') {
    return ok(priority);
  }
  const text = priority.text.trim();
  if (text.length === 0 || text.length > PRIORITY_MAX_LENGTH) {
    return err(domainError('invalid_input', 'a free priority is one short line'));
  }
  return ok({ kind: 'free', text });
}

function parseVictory(input: string): Result<string | null, DomainError> {
  const victory = input.trim();
  if (victory.length > VICTORY_MAX_LENGTH) {
    return err(domainError('invalid_input', 'the victory fits on one line'));
  }
  return ok(victory.length === 0 ? null : victory);
}
