import type Dexie from 'dexie';
import { HABIT_CATALOGUE, type HabitTemplateId } from '../../../domain/entities/habit';
import { HABIT_LEVELS, type HabitLevel, type HabitLog } from '../../../domain/entities/habitLog';
import type { HabitLogRepository } from '../../../domain/ports/checkInRepositories';
import type { DayKey } from '../../../domain/shared/dayKey';
import type { DomainError } from '../../../domain/shared/domainError';
import { ok, type Result } from '../../../domain/shared/result';
import { asFields, storageResult } from '../storageResult';

/** Stored level, as documented in CLAUDE.md (section 5): "not done" is 0. */
type StoredLevel = 0 | Exclude<HabitLevel, 'none'>;

const NOT_DONE = 0;
const TEMPLATE_IDS: readonly HabitTemplateId[] = HABIT_CATALOGUE.map(({ id }) => id);

/** Logs are keyed by habit template: there is one habit per template. */
export class DexieHabitLogRepository implements HabitLogRepository {
  constructor(private readonly db: Dexie) {}

  async listByDay(day: DayKey): Promise<Result<HabitLog[], DomainError>> {
    const read = await storageResult('could not read the habit logs', () =>
      this.db.table('habitLogs').where('date').equals(day).toArray(),
    );
    if (!read.ok) {
      return read;
    }
    const records: unknown[] = read.value;
    return ok(records.map((record) => fromRecord(record, day)).filter((log) => log !== null));
  }

  replaceForDay(day: DayKey, logs: readonly HabitLog[]): Promise<Result<void, DomainError>> {
    const table = this.db.table('habitLogs');
    return storageResult('could not save the habit logs', () =>
      this.db.transaction('rw', table, async () => {
        await table.where('date').equals(day).delete();
        await table.bulkAdd(logs.map(toRecord));
      }),
    );
  }
}

function toRecord({ templateId, day, level }: HabitLog): object {
  const stored: StoredLevel = level === 'none' ? NOT_DONE : level;
  return { habitId: templateId, date: day, level: stored };
}

/** Unknown or damaged rows are skipped rather than shown wrong. */
function fromRecord(value: unknown, day: DayKey): HabitLog | null {
  const fields = asFields<'habitId' | 'level'>(value);
  const templateId = TEMPLATE_IDS.find((id) => id === fields?.habitId);
  const level =
    fields?.level === NOT_DONE
      ? 'none'
      : HABIT_LEVELS.find((candidate) => candidate === fields?.level);
  if (templateId === undefined || level === undefined) {
    return null;
  }
  return { templateId, day, level };
}
