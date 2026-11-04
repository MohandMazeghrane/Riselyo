import { emptyDayEntry, type DayEntry } from '../../domain/entities/dayEntry';
import type { Habit } from '../../domain/entities/habit';
import type { HabitLog } from '../../domain/entities/habitLog';
import type { Rhythm } from '../../domain/entities/rhythm';
import type {
  DayEntryRepository,
  HabitLogRepository,
} from '../../domain/ports/checkInRepositories';
import type { Clock } from '../../domain/ports/clock';
import type { HabitRepository, ProfileRepository } from '../../domain/ports/onboardingRepositories';
import { dayKeyOf, type DayKey } from '../../domain/shared/dayKey';
import type { DomainError } from '../../domain/shared/domainError';
import { ok, type Result } from '../../domain/shared/result';

/** Everything the check-in screens need to show and pre-fill today's answers. */
export interface CheckInDay {
  readonly day: DayKey;
  readonly entry: DayEntry;
  readonly activeHabits: readonly Habit[];
  readonly habitLogs: readonly HabitLog[];
  readonly rhythm: Rhythm | null;
}

export interface CheckInDayDeps {
  readonly clock: Clock;
  readonly profiles: ProfileRepository;
  readonly dayEntries: DayEntryRepository;
  readonly habits: HabitRepository;
  readonly habitLogs: HabitLogRepository;
}

export type GetCheckInDay = () => Promise<Result<CheckInDay, DomainError>>;

export function createGetCheckInDay(deps: CheckInDayDeps): GetCheckInDay {
  return async () => {
    const day = dayKeyOf(deps.clock.localNow());
    const [profile, entry, habits, logs] = await Promise.all([
      deps.profiles.load(),
      deps.dayEntries.findByDay(day),
      deps.habits.listActive(),
      deps.habitLogs.listByDay(day),
    ]);
    if (!profile.ok) {
      return profile;
    }
    if (!entry.ok) {
      return entry;
    }
    if (!habits.ok) {
      return habits;
    }
    if (!logs.ok) {
      return logs;
    }
    return ok({
      day,
      entry: entry.value ?? emptyDayEntry(day),
      activeHabits: habits.value,
      habitLogs: logs.value,
      rhythm: profile.value?.rhythm ?? null,
    });
  };
}
