import type Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { memoryIndexedDb } from '../../../../test/fakes/memoryIndexedDb';
import { unwrap } from '../../../../test/fixtures/unwrap';
import { chooseFirstGoals, createHabit } from '../../../domain/entities/habit';
import { LIFE_DOMAINS, type LifeDomain } from '../../../domain/entities/lifeWheel';
import { markStepCompleted, startProfile, type Profile } from '../../../domain/entities/profile';
import { defaultRhythm } from '../../../domain/entities/rhythm';
import { parseDayKey } from '../../../domain/shared/dayKey';
import { createRiselyoDatabase } from '../database';
import { DexieBodyMeasurementsRepository } from './dexieBodyMeasurementsRepository';
import { DexieHabitRepository } from './dexieHabitRepository';
import { DexieLifeWheelRepository } from './dexieLifeWheelRepository';
import { DexieProfileRepository } from './dexieProfileRepository';

const DAY = unwrap(parseDayKey('2026-11-04'));
const SCORES = Object.fromEntries(LIFE_DOMAINS.map((domain) => [domain, 4])) as Record<
  LifeDomain,
  number
>;

let db: Dexie;

beforeEach(() => {
  db = createRiselyoDatabase(memoryIndexedDb());
});

afterEach(() => {
  db.close();
});

describe('DexieProfileRepository', () => {
  const complete: Profile = {
    ...markStepCompleted(startProfile('Sam', DAY), 'rhythm'),
    why: 'pour aller mieux',
    rhythm: { ...defaultRhythm(), sportDays: ['mon', 'thu'] },
  };

  it('returns null before the onboarding starts', async () => {
    expect(await new DexieProfileRepository(db).load()).toEqual({ ok: true, value: null });
  });

  it('saves and reloads the whole profile', async () => {
    const repository = new DexieProfileRepository(db);
    unwrap(await repository.save(complete));

    expect(await repository.load()).toEqual({ ok: true, value: complete });
  });

  it('reports a damaged profile instead of inventing one', async () => {
    await db.table('profile').put({ id: 'me', firstName: '', dayZero: 'hier' });

    expect(await new DexieProfileRepository(db).load()).toMatchObject({
      ok: false,
      error: { code: 'storage_failure' },
    });
  });

  it('reports a damaged rhythm', async () => {
    await db
      .table('profile')
      .put({ id: 'me', firstName: 'Sam', dayZero: DAY, rhythm: { wakeTime: 7 } });

    expect((await new DexieProfileRepository(db).load()).ok).toBe(false);
  });

  it('reports storage failures', async () => {
    db.close();
    const repository = new DexieProfileRepository(db);

    expect((await repository.load()).ok).toBe(false);
    expect((await repository.save(complete)).ok).toBe(false);
  });
});

describe('DexieLifeWheelRepository', () => {
  it('saves one wheel per day and finds it back', async () => {
    const repository = new DexieLifeWheelRepository(db);
    unwrap(await repository.save({ day: DAY, scores: SCORES }));
    unwrap(await repository.save({ day: DAY, scores: { ...SCORES, mood: 9 } }));

    expect(await repository.findByDay(DAY)).toEqual({
      ok: true,
      value: { day: DAY, scores: { ...SCORES, mood: 9 } },
    });
    expect(await db.table('lifeWheels').count()).toBe(1);
  });

  it('returns null for a day without wheel', async () => {
    expect(await new DexieLifeWheelRepository(db).findByDay(DAY)).toEqual({
      ok: true,
      value: null,
    });
  });

  it('reports a damaged wheel', async () => {
    await db.table('lifeWheels').put({ day: DAY, scores: { mood: 42 } });

    expect((await new DexieLifeWheelRepository(db).findByDay(DAY)).ok).toBe(false);
  });
});

describe('DexieBodyMeasurementsRepository', () => {
  it('keeps one row per day, replaced on a second save', async () => {
    const repository = new DexieBodyMeasurementsRepository(db);
    unwrap(await repository.save({ day: DAY, weightKg: 80 }));
    unwrap(await repository.save({ day: DAY, weightKg: 79, pushUps: 10 }));

    const rows: unknown[] = await db.table('measurements').toArray();

    expect(rows).toEqual([{ id: 1, date: DAY, weightKg: 79, pushUps: 10 }]);
  });
});

describe('DexieHabitRepository', () => {
  it('replaces the active habits and lists them back', async () => {
    const repository = new DexieHabitRepository(db);
    unwrap(await repository.replaceActive(unwrap(chooseFirstGoals(['walk', 'read'], DAY))));
    unwrap(await repository.replaceActive(unwrap(chooseFirstGoals(['water'], DAY))));

    expect(await repository.listActive()).toEqual({
      ok: true,
      value: [{ templateId: 'water', kind: 'do', tier: 'min', active: true, createdOn: DAY }],
    });
  });

  it('saves a habit in place of the one with the same template', async () => {
    const repository = new DexieHabitRepository(db);
    const read = createHabit('read', DAY);
    unwrap(await repository.replaceActive([createHabit('walk', DAY)]));
    unwrap(await repository.save(read));
    unwrap(await repository.save({ ...read, tier: 'excellent' }));
    unwrap(await repository.save({ ...createHabit('walk', DAY), active: false }));

    expect(unwrap(await repository.listActive())).toEqual([{ ...read, tier: 'excellent' }]);
    expect(await db.table('habits').count()).toBe(2);
  });

  it('keeps one row per template when the first goals are chosen again', async () => {
    const repository = new DexieHabitRepository(db);
    unwrap(await repository.save({ ...createHabit('walk', DAY), active: false }));
    unwrap(await repository.replaceActive([createHabit('walk', DAY)]));

    expect(await db.table('habits').count()).toBe(1);
  });

  it('skips damaged rows', async () => {
    await db
      .table('habits')
      .add({ templateId: 'fly', kind: 'do', tier: 'min', active: 1, createdOn: DAY });

    expect(await new DexieHabitRepository(db).listActive()).toEqual({ ok: true, value: [] });
  });

  it('reports storage failures', async () => {
    db.close();
    const repository = new DexieHabitRepository(db);

    expect((await repository.listActive()).ok).toBe(false);
    expect((await repository.replaceActive([])).ok).toBe(false);
    expect((await repository.save(createHabit('walk', DAY))).ok).toBe(false);
  });
});
