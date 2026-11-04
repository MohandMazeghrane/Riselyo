import { describe, expect, it } from 'vitest';
import { memoryIndexedDb } from '../../../../test/fakes/memoryIndexedDb';
import { unwrap } from '../../../../test/fixtures/unwrap';
import { createRiselyoDatabase } from '../database';
import { DexieStoredDataInventory } from './dexieStoredDataInventory';

describe('DexieStoredDataInventory', () => {
  it('counts the records of each kind, tables mapped to kinds', async () => {
    const db = createRiselyoDatabase(memoryIndexedDb());
    await db.table('dayEntries').bulkPut([
      { date: '2026-11-04', morning: null, evening: null },
      { date: '2026-11-05', morning: null, evening: null },
    ]);
    await db.table('habitLogs').add({ habitId: 'walk', date: '2026-11-05', level: 'min' });

    expect(unwrap(await new DexieStoredDataInventory(db).count())).toEqual({
      profile: 0,
      consents: 0,
      days: 2,
      habits: 0,
      habitLogs: 1,
      measurements: 0,
      lifeWheels: 0,
    });
    db.close();
  });

  it('reports a storage failure', async () => {
    const db = createRiselyoDatabase(memoryIndexedDb());
    db.close();
    expect((await new DexieStoredDataInventory(db).count()).ok).toBe(false);
  });
});
