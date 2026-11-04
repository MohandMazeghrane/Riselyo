import type Dexie from 'dexie';
import {
  HABIT_CATALOGUE,
  type Habit,
  type HabitKind,
  type HabitTemplateId,
  type HabitTier,
} from '../../../domain/entities/habit';
import type { HabitRepository } from '../../../domain/ports/onboardingRepositories';
import { parseDayKey } from '../../../domain/shared/dayKey';
import type { DomainError } from '../../../domain/shared/domainError';
import { ok, type Result } from '../../../domain/shared/result';
import { asFields, storageResult, textOrEmpty } from '../storageResult';

/** IndexedDB cannot index booleans, so `active` is stored as 1 or 0. */
const ACTIVE = 1;
const INACTIVE = 0;

const TIERS: readonly HabitTier[] = ['min', 'normal', 'excellent'];
const KINDS: readonly HabitKind[] = ['do', 'reduce'];
const TEMPLATE_IDS: readonly HabitTemplateId[] = HABIT_CATALOGUE.map(({ id }) => id);

export class DexieHabitRepository implements HabitRepository {
  constructor(private readonly db: Dexie) {}

  async listActive(): Promise<Result<Habit[], DomainError>> {
    const read = await storageResult('could not read the habits', () =>
      this.db.table('habits').where('active').equals(ACTIVE).toArray(),
    );
    if (!read.ok) {
      return read;
    }
    const records: unknown[] = read.value;
    return ok(records.map(fromHabitRecord).filter((habit) => habit !== null));
  }

  replaceActive(habits: readonly Habit[]): Promise<Result<void, DomainError>> {
    const table = this.db.table('habits');
    return storageResult('could not save the habits', () =>
      this.db.transaction('rw', table, async () => {
        await table.where('active').equals(ACTIVE).delete();
        await table.bulkAdd(
          habits.map((habit) => ({ ...habit, active: habit.active ? ACTIVE : INACTIVE })),
        );
      }),
    );
  }
}

/** Unknown or damaged rows are skipped rather than shown wrong. */
function fromHabitRecord(value: unknown): Habit | null {
  const fields = asFields<keyof Habit>(value);
  const createdOn = parseDayKey(textOrEmpty(fields?.createdOn));
  if (fields === null || !createdOn.ok) {
    return null;
  }
  const { templateId, kind, tier } = fields;
  if (!isOneOf(templateId, TEMPLATE_IDS) || !isOneOf(kind, KINDS) || !isOneOf(tier, TIERS)) {
    return null;
  }
  return { templateId, kind, tier, active: fields.active === ACTIVE, createdOn: createdOn.value };
}

function isOneOf<T extends string>(value: unknown, allowed: readonly T[]): value is T {
  return allowed.includes(value as T);
}
