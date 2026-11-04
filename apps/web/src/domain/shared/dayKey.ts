import { DAY_ROLLOVER_HOUR } from '../config/time';
import { domainError, type DomainError } from './domainError';
import { err, ok, type Result } from './result';

/** A validated local calendar date formatted YYYY-MM-DD. */
export type DayKey = string & { readonly __brand: 'DayKey' };

/** Wall-clock time in the app time zone, before the rollover rule is applied. */
export interface LocalDateTime {
  readonly date: DayKey;
  readonly hour: number;
  readonly minute: number;
}

const DAY_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_OFFSET = 1;
const ISO_DATE_LENGTH = 10;
const MONTHS_PER_YEAR = 12;

export function parseDayKey(input: string): Result<DayKey, DomainError> {
  const date = toUtcDate(input);
  if (date === null || formatUtcDate(date) !== input) {
    return err(domainError('invalid_input', 'day key must be a real date formatted YYYY-MM-DD'));
  }
  return ok(input as DayKey);
}

/** The day an instant belongs to: before DAY_ROLLOVER_HOUR, it still counts as the day before. */
export function dayKeyOf(local: LocalDateTime): DayKey {
  if (local.hour >= DAY_ROLLOVER_HOUR) {
    return local.date;
  }
  return previousDayKey(local.date);
}

export function previousDayKey(day: DayKey): DayKey {
  const [year, month, dayOfMonth] = day.split('-').map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - MONTH_OFFSET, dayOfMonth - 1));
  return formatUtcDate(date) as DayKey;
}

/** The `count` days before `day`, most recent first. */
export function daysBefore(day: DayKey, count: number): DayKey[] {
  const days: DayKey[] = [];
  let current = day;
  for (let index = 0; index < count; index += 1) {
    current = previousDayKey(current);
    days.push(current);
  }
  return days;
}

/** Same day `months` earlier, or the last day of that month when it is shorter. */
export function monthsBefore(day: DayKey, months: number): DayKey {
  const [year, month, dayOfMonth] = day.split('-').map(Number) as [number, number, number];
  const monthIndex = year * MONTHS_PER_YEAR + (month - MONTH_OFFSET) - months;
  const targetYear = Math.floor(monthIndex / MONTHS_PER_YEAR);
  const targetMonth = monthIndex - targetYear * MONTHS_PER_YEAR;
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const date = new Date(Date.UTC(targetYear, targetMonth, Math.min(dayOfMonth, lastDay)));
  return formatUtcDate(date) as DayKey;
}

function toUtcDate(input: string): Date | null {
  const match = DAY_KEY_PATTERN.exec(input);
  if (match === null) {
    return null;
  }
  // The pattern has exactly three capture groups, so the tuple is always complete.
  const [year, month, day] = match.slice(1).map(Number) as [number, number, number];
  return new Date(Date.UTC(year, month - MONTH_OFFSET, day));
}

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, ISO_DATE_LENGTH);
}
