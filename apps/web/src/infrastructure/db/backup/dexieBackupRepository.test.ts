import type Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { memoryIndexedDb } from '../../../../test/fakes/memoryIndexedDb';
import { unwrap } from '../../../../test/fixtures/unwrap';
import { grantConsent, defaultConsents } from '../../../domain/entities/consent';
import {
  createEveningCheckIn,
  createMorningCheckIn,
  type DayEntry,
} from '../../../domain/entities/dayEntry';
import { chooseFirstGoals, createHabit } from '../../../domain/entities/habit';
import { createLifeWheel, LIFE_DOMAINS } from '../../../domain/entities/lifeWheel';
import { startProfile } from '../../../domain/entities/profile';
import { emptyQuickCounts } from '../../../domain/entities/quickCounts';
import { defaultRhythm } from '../../../domain/entities/rhythm';
import { parseDayKey } from '../../../domain/shared/dayKey';
import { parseTimeOfDay } from '../../../domain/shared/timeOfDay';
import { createRiselyoDatabase } from '../database';
import { DexieBodyMeasurementsRepository } from '../repositories/dexieBodyMeasurementsRepository';
import { DexieConsentRepository } from '../repositories/dexieConsentRepository';
import { DexieDayEntryRepository } from '../repositories/dexieDayEntryRepository';
import { DexieHabitLogRepository } from '../repositories/dexieHabitLogRepository';
import { DexieHabitRepository } from '../repositories/dexieHabitRepository';
import { DexieLifeWheelRepository } from '../repositories/dexieLifeWheelRepository';
import { DexieProfileRepository } from '../repositories/dexieProfileRepository';
import { DexieBackupRepository } from './dexieBackupRepository';

const DAY = unwrap(parseDayKey('2026-11-05'));
const AT = new Date('2026-11-05T20:00:00Z');

const morning = unwrap(
  createMorningCheckIn(
    {
      bedtime: unwrap(parseTimeOfDay('23:40')),
      wakeTime: unwrap(parseTimeOfDay('07:05')),
      sleepQuality: 4,
      energy: 3,
      priority: { kind: 'free', text: 'Appeler Léa' },
    },
    AT,
  ),
);
const DAY_ENTRY: DayEntry = {
  day: DAY,
  morning,
  evening: unwrap(
    createEveningCheckIn(
      { mood: 4, stress: 2, priorityKept: true, victory: 'Marché' },
      morning,
      AT,
    ),
  ),
  quick: { ...emptyQuickCounts(), waterGlasses: 5 },
};

let source: Dexie;
let target: Dexie;

beforeEach(() => {
  source = createRiselyoDatabase(memoryIndexedDb());
  target = createRiselyoDatabase(memoryIndexedDb());
});

afterEach(() => {
  source.close();
  target.close();
});

async function fillWithEverything(db: Dexie): Promise<void> {
  unwrap(
    await new DexieProfileRepository(db).save({
      ...startProfile('Sam', DAY),
      rhythm: defaultRhythm(),
    }),
  );
  unwrap(
    await new DexieConsentRepository(db).save(
      unwrap(grantConsent(defaultConsents(), 'health', AT)),
    ),
  );
  unwrap(await new DexieDayEntryRepository(db).save(DAY_ENTRY));
  unwrap(await new DexieHabitRepository(db).replaceActive(unwrap(chooseFirstGoals(['walk'], DAY))));
  unwrap(await new DexieHabitRepository(db).save(createHabit('snacking', DAY)));
  unwrap(
    await new DexieHabitLogRepository(db).save({ templateId: 'walk', day: DAY, level: 'none' }),
  );
  unwrap(
    await new DexieBodyMeasurementsRepository(db).save({ day: DAY, weightKg: 80.5, pushUps: 12 }),
  );
  const scores = Object.fromEntries(LIFE_DOMAINS.map((domain) => [domain, 6]));
  unwrap(await new DexieLifeWheelRepository(db).save(unwrap(createLifeWheel(DAY, scores))));
}

async function exported(db: Dexie): Promise<string> {
  return unwrap(await new DexieBackupRepository(db).exportSnapshot(AT));
}

function edited(content: string, change: (document: Record<string, unknown>) => void): string {
  const document = JSON.parse(content) as Record<string, unknown>;
  change(document);
  return JSON.stringify(document);
}

type Rows = Record<string, Record<string, unknown>[]>;

function firstRow(tables: Rows, name: string): Record<string, unknown> {
  const row = tables[name]?.[0];
  if (row === undefined) {
    throw new Error(`no ${name} row in the fixture`);
  }
  return row;
}

describe('DexieBackupRepository', () => {
  it('exports every table with its version and date', async () => {
    await fillWithEverything(source);
    const document = JSON.parse(await exported(source)) as Record<string, unknown>;

    expect(document).toMatchObject({
      app: 'riselyo',
      format: 1,
      schemaVersion: 2,
      exportedAt: AT.toISOString(),
    });
    expect(Object.keys(document['tables'] as object)).toHaveLength(18);
  });

  it('restores a backup into another database, record for record', async () => {
    await fillWithEverything(source);
    unwrap(await new DexieBackupRepository(target).restoreSnapshot(await exported(source)));

    expect(JSON.parse(await exported(target))).toEqual(JSON.parse(await exported(source)));
    expect(unwrap(await new DexieDayEntryRepository(target).findByDay(DAY))).toEqual(DAY_ENTRY);
    expect(unwrap(await new DexieHabitRepository(target).listActive())).toHaveLength(2);
    expect(unwrap(await new DexieProfileRepository(target).load())?.firstName).toBe('Sam');
  });

  it('replaces what was there before', async () => {
    unwrap(
      await new DexieDayEntryRepository(target).save({
        ...DAY_ENTRY,
        day: unwrap(parseDayKey('2026-01-01')),
      }),
    );
    await fillWithEverything(source);
    unwrap(await new DexieBackupRepository(target).restoreSnapshot(await exported(source)));

    expect(await target.table('dayEntries').count()).toBe(1);
  });

  it.each([
    ['not_json', () => 'pas du json'],
    ['not_a_backup', () => '{"hello":"world"}'],
  ])('refuses a file that is %s', async (reason, content) => {
    expect(await new DexieBackupRepository(target).restoreSnapshot(content())).toEqual({
      ok: false,
      error: { code: 'invalid_input', detail: reason },
    });
  });

  it('refuses a backup made by a newer version of the app', async () => {
    const content = edited(await exported(source), (document) => {
      document['schemaVersion'] = 99;
    });
    expect(await new DexieBackupRepository(target).restoreSnapshot(content)).toMatchObject({
      error: { detail: 'newer_version' },
    });
  });

  it.each<[string, (tables: Record<string, Record<string, unknown>[]>) => void]>([
    [
      'a mood out of the scale',
      (tables) => {
        const day = tables['dayEntries']?.[0];
        (day?.['evening'] as Record<string, unknown>)['mood'] = 9;
      },
    ],
    [
      'an unknown field',
      (tables) => {
        firstRow(tables, 'habits')['secret'] = 'x';
      },
    ],
    [
      'an unknown habit',
      (tables) => {
        firstRow(tables, 'habitLogs')['habitId'] = 'fly';
      },
    ],
    [
      'a row in a table not used yet',
      (tables) => {
        tables['journal'] = [{ id: 1, text: 'x' }];
      },
    ],
    [
      'an unknown table',
      (tables) => {
        tables['spy'] = [];
      },
    ],
    [
      'the same day twice',
      (tables) => {
        tables['dayEntries']?.push({ ...firstRow(tables, 'dayEntries') });
      },
    ],
    [
      'an invalid date',
      (tables) => {
        firstRow(tables, 'dayEntries')['date'] = '2026-02-30';
      },
    ],
  ])('refuses data with %s, and changes nothing', async (_name, change) => {
    await fillWithEverything(source);
    await fillWithEverything(target);
    const before = await exported(target);
    const content = edited(await exported(source), (document) => {
      change(document['tables'] as Record<string, Record<string, unknown>[]>);
    });

    expect(await new DexieBackupRepository(target).restoreSnapshot(content)).toMatchObject({
      error: { detail: 'invalid_data' },
    });
    expect(await exported(target)).toBe(before);
  });

  it('accepts a day saved before the quick buttons existed', async () => {
    await fillWithEverything(source);
    const content = edited(await exported(source), (document) => {
      const tables = document['tables'] as Record<string, Record<string, unknown>[]>;
      delete tables['dayEntries']?.[0]?.['quick'];
    });
    unwrap(await new DexieBackupRepository(target).restoreSnapshot(content));
    expect(unwrap(await new DexieDayEntryRepository(target).findByDay(DAY))?.quick).toEqual(
      emptyQuickCounts(),
    );
  });

  it('reports storage failures', async () => {
    const content = await exported(source);
    target.close();
    const repository = new DexieBackupRepository(target);
    expect((await repository.exportSnapshot(AT)).ok).toBe(false);
    expect(await repository.restoreSnapshot(content)).toMatchObject({
      error: { code: 'storage_failure' },
    });
  });
});
