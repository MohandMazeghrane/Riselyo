import type Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { memoryIndexedDb } from '../../../../test/fakes/memoryIndexedDb';
import { unwrap } from '../../../../test/fixtures/unwrap';
import {
  createEveningCheckIn,
  createMorningCheckIn,
  type DayEntry,
} from '../../../domain/entities/dayEntry';
import { emptyQuickCounts } from '../../../domain/entities/quickCounts';
import { parseDayKey } from '../../../domain/shared/dayKey';
import { parseTimeOfDay } from '../../../domain/shared/timeOfDay';
import { createRiselyoDatabase } from '../database';
import { DexieDayEntryRepository } from './dexieDayEntryRepository';
import { DexieHabitLogRepository } from './dexieHabitLogRepository';

const DAY = unwrap(parseDayKey('2026-11-05'));
const OTHER_DAY = unwrap(parseDayKey('2026-11-06'));
const AT = new Date('2026-11-05T07:30:00Z');

const morning = unwrap(
  createMorningCheckIn(
    {
      bedtime: unwrap(parseTimeOfDay('23:40')),
      wakeTime: unwrap(parseTimeOfDay('07:05')),
      sleepQuality: 4,
      energy: 3,
      priority: { kind: 'free', text: 'Appeler maman' },
    },
    AT,
  ),
);
const evening = unwrap(
  createEveningCheckIn({ mood: 4, stress: 2, priorityKept: false, victory: 'Marché' }, morning, AT),
);
const FULL_DAY: DayEntry = {
  day: DAY,
  morning,
  evening,
  quick: { ...emptyQuickCounts(), waterGlasses: 5, cravingsResisted: 2 },
};

let db: Dexie;

beforeEach(() => {
  db = createRiselyoDatabase(memoryIndexedDb());
});

afterEach(() => {
  db.close();
});

describe('DexieDayEntryRepository', () => {
  it('returns null for a day without check-in', async () => {
    expect(await new DexieDayEntryRepository(db).findByDay(DAY)).toEqual({ ok: true, value: null });
  });

  it('saves and reloads a full day, dates included', async () => {
    const repository = new DexieDayEntryRepository(db);
    unwrap(await repository.save(FULL_DAY));

    expect(await repository.findByDay(DAY)).toEqual({ ok: true, value: FULL_DAY });
  });

  it('keeps a habit priority and a day with only the morning', async () => {
    const repository = new DexieDayEntryRepository(db);
    const habitMorning = { ...morning, priority: { kind: 'habit', templateId: 'walk' } } as const;
    const entry = { day: DAY, morning: habitMorning, evening: null, quick: emptyQuickCounts() };
    unwrap(await repository.save(entry));

    expect(unwrap(await repository.findByDay(DAY))).toEqual(entry);
  });

  it('reads an entry saved before the quick buttons existed with zero counters', async () => {
    await db.table('dayEntries').put({ date: DAY, morning: null, evening: null });

    expect(unwrap(await new DexieDayEntryRepository(db).findByDay(DAY))?.quick).toEqual(
      emptyQuickCounts(),
    );
  });

  it('reports a damaged day instead of showing wrong answers', async () => {
    await db.table('dayEntries').put({ date: DAY, morning: { energy: 9 }, evening: null });

    expect(await new DexieDayEntryRepository(db).findByDay(DAY)).toMatchObject({
      ok: false,
      error: { code: 'storage_failure' },
    });
  });

  it('reports storage failures', async () => {
    db.close();
    const repository = new DexieDayEntryRepository(db);

    expect((await repository.findByDay(DAY)).ok).toBe(false);
    expect((await repository.save(FULL_DAY)).ok).toBe(false);
  });
});

describe('DexieHabitLogRepository', () => {
  it('stores "not done" as 0 and reads it back', async () => {
    const repository = new DexieHabitLogRepository(db);
    unwrap(await repository.replaceForDay(DAY, [{ templateId: 'walk', day: DAY, level: 'none' }]));

    const rows: unknown[] = await db.table('habitLogs').toArray();
    expect(rows).toMatchObject([{ habitId: 'walk', date: DAY, level: 0 }]);
    expect(await repository.listByDay(DAY)).toEqual({
      ok: true,
      value: [{ templateId: 'walk', day: DAY, level: 'none' }],
    });
  });

  it('replaces the logs of one day without touching the others', async () => {
    const repository = new DexieHabitLogRepository(db);
    unwrap(
      await repository.replaceForDay(OTHER_DAY, [
        { templateId: 'read', day: OTHER_DAY, level: 'min' },
      ]),
    );
    unwrap(await repository.replaceForDay(DAY, [{ templateId: 'walk', day: DAY, level: 'min' }]));
    unwrap(
      await repository.replaceForDay(DAY, [{ templateId: 'walk', day: DAY, level: 'excellent' }]),
    );

    expect(unwrap(await repository.listByDay(DAY))).toEqual([
      { templateId: 'walk', day: DAY, level: 'excellent' },
    ]);
    expect(unwrap(await repository.listByDay(OTHER_DAY))).toHaveLength(1);
  });

  it('saves one log, replacing the same habit on the same day only', async () => {
    const repository = new DexieHabitLogRepository(db);
    unwrap(await repository.save({ templateId: 'walk', day: DAY, level: 'min' }));
    unwrap(await repository.save({ templateId: 'read', day: DAY, level: 'min' }));
    unwrap(await repository.save({ templateId: 'walk', day: OTHER_DAY, level: 'min' }));
    unwrap(await repository.save({ templateId: 'walk', day: DAY, level: 'normal' }));

    expect(unwrap(await repository.listByDay(DAY))).toEqual(
      expect.arrayContaining([
        { templateId: 'walk', day: DAY, level: 'normal' },
        { templateId: 'read', day: DAY, level: 'min' },
      ]),
    );
    expect(await db.table('habitLogs').count()).toBe(3);
  });

  it('lists the logs since a day and the history of one habit', async () => {
    const repository = new DexieHabitLogRepository(db);
    unwrap(await repository.save({ templateId: 'snacking', day: DAY, level: 'none' }));
    unwrap(await repository.save({ templateId: 'snacking', day: OTHER_DAY, level: 'normal' }));
    unwrap(await repository.save({ templateId: 'walk', day: OTHER_DAY, level: 'min' }));

    expect(unwrap(await repository.listSince(OTHER_DAY))).toHaveLength(2);
    expect(unwrap(await repository.listForHabit('snacking'))).toEqual([
      { templateId: 'snacking', day: DAY, level: 'none' },
      { templateId: 'snacking', day: OTHER_DAY, level: 'normal' },
    ]);
  });

  it('skips damaged rows', async () => {
    await db.table('habitLogs').add({ habitId: 'walk', date: 'yesterday', level: 'min' });
    await db.table('habitLogs').add({ habitId: 'fly', date: DAY, level: 'min' });
    await db.table('habitLogs').add({ habitId: 'walk', date: DAY, level: 'huge' });

    expect(await new DexieHabitLogRepository(db).listByDay(DAY)).toEqual({ ok: true, value: [] });
  });

  it('reports storage failures', async () => {
    db.close();
    const repository = new DexieHabitLogRepository(db);

    expect((await repository.listByDay(DAY)).ok).toBe(false);
    expect((await repository.replaceForDay(DAY, [])).ok).toBe(false);
    expect((await repository.save({ templateId: 'walk', day: DAY, level: 'min' })).ok).toBe(false);
    expect((await repository.listSince(DAY)).ok).toBe(false);
    expect((await repository.listForHabit('walk')).ok).toBe(false);
  });
});
