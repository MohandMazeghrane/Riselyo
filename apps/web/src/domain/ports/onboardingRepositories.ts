import type { BodyMeasurements } from '../entities/bodyMeasurements';
import type { Habit } from '../entities/habit';
import type { LifeWheel } from '../entities/lifeWheel';
import type { Profile } from '../entities/profile';
import type { DayKey } from '../shared/dayKey';
import type { DomainError } from '../shared/domainError';
import type { Result } from '../shared/result';

export interface ProfileRepository {
  /** Null until the welcome screen has been completed. */
  load(): Promise<Result<Profile | null, DomainError>>;
  save(profile: Profile): Promise<Result<void, DomainError>>;
}

export interface LifeWheelRepository {
  /** Replaces the wheel of the same day, if any. */
  save(wheel: LifeWheel): Promise<Result<void, DomainError>>;
  findByDay(day: DayKey): Promise<Result<LifeWheel | null, DomainError>>;
}

export interface BodyMeasurementsRepository {
  /** Replaces the measurements of the same day, if any. */
  save(measurements: BodyMeasurements): Promise<Result<void, DomainError>>;
}

/** There is at most one habit per template: the template id identifies the habit. */
export interface HabitRepository {
  listActive(): Promise<Result<Habit[], DomainError>>;
  /** Onboarding only: the first goals replace whatever was chosen before. */
  replaceActive(habits: readonly Habit[]): Promise<Result<void, DomainError>>;
  /** Adds the habit, or replaces the one with the same template (active or not). */
  save(habit: Habit): Promise<Result<void, DomainError>>;
}
