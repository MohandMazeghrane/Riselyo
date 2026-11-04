import type { DayEntry } from '../entities/dayEntry';
import type { HabitTemplateId } from '../entities/habit';
import type { HabitLog } from '../entities/habitLog';
import type { DayKey } from '../shared/dayKey';
import type { DomainError } from '../shared/domainError';
import type { Result } from '../shared/result';

export interface DayEntryRepository {
  /** Null for a day without any check-in yet. */
  findByDay(day: DayKey): Promise<Result<DayEntry | null, DomainError>>;
  /** Every entry from `day` (included) onwards; an unreadable entry is skipped. */
  listSince(day: DayKey): Promise<Result<DayEntry[], DomainError>>;
  /** Replaces the entry of the same day. */
  save(entry: DayEntry): Promise<Result<void, DomainError>>;
}

export interface HabitLogRepository {
  listByDay(day: DayKey): Promise<Result<HabitLog[], DomainError>>;
  /** Every log from `day` (included) onwards. */
  listSince(day: DayKey): Promise<Result<HabitLog[], DomainError>>;
  listForHabit(templateId: HabitTemplateId): Promise<Result<HabitLog[], DomainError>>;
  /** Replaces the log of the same habit and day, if any. */
  save(log: HabitLog): Promise<Result<void, DomainError>>;
  /** The evening check-in can be redone: the day's logs are replaced, never duplicated. */
  replaceForDay(day: DayKey, logs: readonly HabitLog[]): Promise<Result<void, DomainError>>;
}
