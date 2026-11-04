import { domainError, type DomainError } from './domainError';
import { err, ok, type Result } from './result';

/** A wall-clock time formatted HH:MM (24 h). */
export type TimeOfDay = string & { readonly __brand: 'TimeOfDay' };

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;
const MINUTES_PER_HOUR = 60;
export const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR;

export function parseTimeOfDay(input: string): Result<TimeOfDay, DomainError> {
  if (!TIME_PATTERN.test(input)) {
    return err(domainError('invalid_input', 'time must be formatted HH:MM'));
  }
  return ok(input as TimeOfDay);
}

export function minutesSinceMidnight(time: TimeOfDay): number {
  const [hours, minutes] = time.split(':').map(Number) as [number, number];
  return hours * MINUTES_PER_HOUR + minutes;
}

/** Minutes from `start` to the next occurrence of `end`, crossing midnight if needed. */
export function minutesBetween(start: TimeOfDay, end: TimeOfDay): number {
  const difference = minutesSinceMidnight(end) - minutesSinceMidnight(start);
  return difference > 0 ? difference : difference + MINUTES_PER_DAY;
}
