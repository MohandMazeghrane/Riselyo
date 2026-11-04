import {
  createMorningCheckIn,
  emptyDayEntry,
  type MorningCheckIn,
} from '../../domain/entities/dayEntry';
import type { DayEntryRepository } from '../../domain/ports/checkInRepositories';
import type { Clock } from '../../domain/ports/clock';
import { dayKeyOf } from '../../domain/shared/dayKey';
import { domainError, type DomainError } from '../../domain/shared/domainError';
import { err, type Result } from '../../domain/shared/result';
import { parseTimeOfDay } from '../../domain/shared/timeOfDay';
import type { MorningForm } from './checkInForm';

export type SubmitMorningCheckIn = (form: MorningForm) => Promise<Result<void, DomainError>>;

/** Morning check-in of the current day; doing it again replaces the previous answers. */
export function createSubmitMorningCheckIn(deps: {
  readonly clock: Clock;
  readonly dayEntries: DayEntryRepository;
}): SubmitMorningCheckIn {
  return async (form) => {
    const day = dayKeyOf(deps.clock.localNow());
    const morning = morningFromForm(form, deps.clock.now());
    if (!morning.ok) {
      return morning;
    }
    const existing = await deps.dayEntries.findByDay(day);
    if (!existing.ok) {
      return existing;
    }
    const entry = existing.value ?? emptyDayEntry(day);
    return deps.dayEntries.save({ ...entry, morning: morning.value });
  };
}

function morningFromForm(form: MorningForm, at: Date): Result<MorningCheckIn, DomainError> {
  const bedtime = parseTimeOfDay(form.bedtime);
  const wakeTime = parseTimeOfDay(form.wakeTime);
  if (!bedtime.ok || !wakeTime.ok) {
    return err(domainError('invalid_input', 'bedtime and wake time must be formatted HH:MM'));
  }
  return createMorningCheckIn({ ...form, bedtime: bedtime.value, wakeTime: wakeTime.value }, at);
}
