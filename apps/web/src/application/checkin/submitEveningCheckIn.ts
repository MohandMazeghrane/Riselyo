import { createEveningCheckIn, emptyDayEntry } from '../../domain/entities/dayEntry';
import { createHabitLogs } from '../../domain/entities/habitLog';
import type {
  DayEntryRepository,
  HabitLogRepository,
} from '../../domain/ports/checkInRepositories';
import type { Clock } from '../../domain/ports/clock';
import type { HabitRepository } from '../../domain/ports/onboardingRepositories';
import { dayKeyOf } from '../../domain/shared/dayKey';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import type { EveningForm } from './checkInForm';

export type SubmitEveningCheckIn = (form: EveningForm) => Promise<Result<void, DomainError>>;

export interface SubmitEveningDeps {
  readonly clock: Clock;
  readonly dayEntries: DayEntryRepository;
  readonly habits: HabitRepository;
  readonly habitLogs: HabitLogRepository;
}

/** Evening check-in: feelings, the day's habits and the priority; everything is validated first. */
export function createSubmitEveningCheckIn(deps: SubmitEveningDeps): SubmitEveningCheckIn {
  return async (form) => {
    const day = dayKeyOf(deps.clock.localNow());
    const [existing, habits] = await Promise.all([
      deps.dayEntries.findByDay(day),
      deps.habits.listActive(),
    ]);
    if (!existing.ok) {
      return existing;
    }
    if (!habits.ok) {
      return habits;
    }
    const entry = existing.value ?? emptyDayEntry(day);
    const evening = createEveningCheckIn(form, entry.morning, deps.clock.now());
    const logs = createHabitLogs(day, habits.value, form.habitLevels);
    if (!evening.ok) {
      return evening;
    }
    if (!logs.ok) {
      return logs;
    }
    const saved = await deps.dayEntries.save({ ...entry, evening: evening.value });
    return saved.ok ? deps.habitLogs.replaceForDay(day, logs.value) : saved;
  };
}
