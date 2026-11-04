import type { DayEntry } from '../../src/domain/entities/dayEntry';
import type { HabitLog } from '../../src/domain/entities/habitLog';
import type {
  DayEntryRepository,
  HabitLogRepository,
} from '../../src/domain/ports/checkInRepositories';
import { defaultConsents, type ConsentSet } from '../../src/domain/entities/consent';
import type { ConsentRepository } from '../../src/domain/ports/consentRepository';
import type { BodyMeasurements } from '../../src/domain/entities/bodyMeasurements';
import type { Habit } from '../../src/domain/entities/habit';
import type { LifeWheel } from '../../src/domain/entities/lifeWheel';
import type { Profile } from '../../src/domain/entities/profile';
import type {
  BodyMeasurementsRepository,
  HabitRepository,
  LifeWheelRepository,
  ProfileRepository,
} from '../../src/domain/ports/onboardingRepositories';
import type { DayKey } from '../../src/domain/shared/dayKey';
import { domainError, type DomainError } from '../../src/domain/shared/domainError';
import { err, ok, type Result } from '../../src/domain/shared/result';

/** Base for in-memory fakes: flip `failing` to simulate a storage failure. */
class FakeStore {
  failing = false;

  protected attempt<T>(value: () => T): Promise<Result<T, DomainError>> {
    if (this.failing) {
      return Promise.resolve(err(domainError('storage_failure', 'simulated failure')));
    }
    return Promise.resolve(ok(value()));
  }
}

export class InMemoryProfileRepository extends FakeStore implements ProfileRepository {
  profile: Profile | null = null;

  load(): Promise<Result<Profile | null, DomainError>> {
    return this.attempt(() => this.profile);
  }

  save(profile: Profile): Promise<Result<void, DomainError>> {
    return this.attempt(() => {
      this.profile = profile;
    });
  }
}

export class InMemoryLifeWheelRepository extends FakeStore implements LifeWheelRepository {
  readonly wheels = new Map<DayKey, LifeWheel>();

  save(wheel: LifeWheel): Promise<Result<void, DomainError>> {
    return this.attempt(() => {
      this.wheels.set(wheel.day, wheel);
    });
  }

  findByDay(day: DayKey): Promise<Result<LifeWheel | null, DomainError>> {
    return this.attempt(() => this.wheels.get(day) ?? null);
  }
}

export class InMemoryBodyMeasurementsRepository
  extends FakeStore
  implements BodyMeasurementsRepository
{
  readonly saved = new Map<DayKey, BodyMeasurements>();

  save(measurements: BodyMeasurements): Promise<Result<void, DomainError>> {
    return this.attempt(() => {
      this.saved.set(measurements.day, measurements);
    });
  }
}

export class InMemoryHabitRepository extends FakeStore implements HabitRepository {
  habits: Habit[] = [];

  listActive(): Promise<Result<Habit[], DomainError>> {
    return this.attempt(() => this.habits.filter((habit) => habit.active));
  }

  replaceActive(habits: readonly Habit[]): Promise<Result<void, DomainError>> {
    return this.attempt(() => {
      this.habits = [...habits];
    });
  }
}

export class InMemoryConsentRepository extends FakeStore implements ConsentRepository {
  consents: ConsentSet = defaultConsents();

  load(): Promise<Result<ConsentSet, DomainError>> {
    return this.attempt(() => this.consents);
  }

  save(consents: ConsentSet): Promise<Result<void, DomainError>> {
    return this.attempt(() => {
      this.consents = consents;
    });
  }
}

export class InMemoryDayEntryRepository extends FakeStore implements DayEntryRepository {
  readonly entries = new Map<DayKey, DayEntry>();

  findByDay(day: DayKey): Promise<Result<DayEntry | null, DomainError>> {
    return this.attempt(() => this.entries.get(day) ?? null);
  }

  save(entry: DayEntry): Promise<Result<void, DomainError>> {
    return this.attempt(() => {
      this.entries.set(entry.day, entry);
    });
  }
}

export class InMemoryHabitLogRepository extends FakeStore implements HabitLogRepository {
  logs: HabitLog[] = [];

  listByDay(day: DayKey): Promise<Result<HabitLog[], DomainError>> {
    return this.attempt(() => this.logs.filter((log) => log.day === day));
  }

  replaceForDay(day: DayKey, logs: readonly HabitLog[]): Promise<Result<void, DomainError>> {
    return this.attempt(() => {
      this.logs = [...this.logs.filter((log) => log.day !== day), ...logs];
    });
  }
}
