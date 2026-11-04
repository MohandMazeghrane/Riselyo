import Dexie from 'dexie';
import { ALL_HABIT_IDS, type HabitTemplateId } from '../../../domain/entities/habit';
import { HABIT_LEVELS, type HabitLevel, type HabitLog } from '../../../domain/entities/habitLog';
import type { HabitLogRepository } from '../../../domain/ports/checkInRepositories';
import { parseDayKey, type DayKey } from '../../../domain/shared/dayKey';
import type { DomainError } from '../../../domain/shared/domainError';
import { ok, type Result } from '../../../domain/shared/result';
import { asFields, storageResult, textOrEmpty } from '../storageResult';

/** Stored level, as documented in CLAUDE.md (section 5): "not done" is 0. */
type StoredLevel = 0 | Exclude<HabitLevel, 'none'>;

const NOT_DONE = 0;

/** Logs are keyed by habit template: there is one habit per template. */
export class DexieHabitLogRepository implements HabitLogRepository {
  constructor(private readonly db: Dexie) {}

  listByDay(day: DayKey): Promise<Result<HabitLog[], DomainError>> {
    return this.read(() => this.db.table('habitLogs').where('date').equals(day).toArray());
  }

  listSince(day: DayKey): Promise<Result<HabitLog[], DomainError>> {
    return this.read(() => this.db.table('habitLogs').where('date').aboveOrEqual(day).toArray());
  }

  listForHabit(templateId: HabitTemplateId): Promise<Result<HabitLog[], DomainError>> {
    return this.read(() =>
      this.db
        .table('habitLogs')
        .where('[habitId+date]')
        .between([templateId, Dexie.minKey], [templateId, Dexie.maxKey])
        .toArray(),
    );
  }

  save(log: HabitLog): Promise<Result<void, DomainError>> {
    const table = this.db.table('habitLogs');
    return storageResult('could not save the habit log', () =>
      this.db.transaction('rw', table, async () => {
        await table.where('[habitId+date]').equals([log.templateId, log.day]).delete();
        await table.add(toRecord(log));
      }),
    );
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

  private async read(query: () => Promise<unknown[]>): Promise<Result<HabitLog[], DomainError>> {
    const read = await storageResult('could not read the habit logs', query);
    if (!read.ok) {
      return read;
    }
    return ok(read.value.map(fromRecord).filter((log) => log !== null));
  }
}

function toRecord({ templateId, day, level }: HabitLog): object {
  const stored: StoredLevel = level === 'none' ? NOT_DONE : level;
  return { habitId: templateId, date: day, level: stored };
}

/** Unknown or damaged rows are skipped rather than shown wrong. */
function fromRecord(value: unknown): HabitLog | null {
  const fields = asFields<'habitId' | 'date' | 'level'>(value);
  const templateId = ALL_HABIT_IDS.find((id) => id === fields?.habitId);
  const day = parseDayKey(textOrEmpty(fields?.date));
  const level =
    fields?.level === NOT_DONE
      ? 'none'
      : HABIT_LEVELS.find((candidate) => candidate === fields?.level);
  if (templateId === undefined || !day.ok || level === undefined) {
    return null;
  }
  return { templateId, day: day.value, level };
}
