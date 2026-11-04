import type Dexie from 'dexie';
import type { DayEntry } from '../../../domain/entities/dayEntry';
import type { DayEntryRepository } from '../../../domain/ports/checkInRepositories';
import type { DayKey } from '../../../domain/shared/dayKey';
import type { DomainError } from '../../../domain/shared/domainError';
import { err, ok, type Result } from '../../../domain/shared/result';
import { fromDayEntryRecord, toDayEntryRecord } from '../records/dayEntryRecord';
import { storageResult, unreadableRecord } from '../storageResult';

export class DexieDayEntryRepository implements DayEntryRepository {
  constructor(private readonly db: Dexie) {}

  async findByDay(day: DayKey): Promise<Result<DayEntry | null, DomainError>> {
    const read = await storageResult('could not read the day', () =>
      this.db.table('dayEntries').get(day),
    );
    if (!read.ok || read.value === undefined) {
      return read.ok ? ok(null) : read;
    }
    const entry = fromDayEntryRecord(read.value);
    return entry === null ? err(unreadableRecord('dayEntries')) : ok(entry);
  }

  async listSince(day: DayKey): Promise<Result<DayEntry[], DomainError>> {
    const read = await storageResult('could not read the days', () =>
      this.db.table('dayEntries').where('date').aboveOrEqual(day).toArray(),
    );
    if (!read.ok) {
      return read;
    }
    const records: unknown[] = read.value;
    return ok(records.map(fromDayEntryRecord).filter((entry) => entry !== null));
  }

  save(entry: DayEntry): Promise<Result<void, DomainError>> {
    return storageResult('could not save the day', async () => {
      await this.db.table('dayEntries').put(toDayEntryRecord(entry));
    });
  }
}
