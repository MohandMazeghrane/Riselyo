import { describe, expect, it } from 'vitest';
import { InMemoryStoredDataInventory } from '../../../test/fakes/inMemoryRepositories';
import { createGetStoredData, STORED_DATA_ORDER } from './getStoredData';

describe('getStoredData', () => {
  it('returns how many records of each kind are on the phone', async () => {
    const inventory = new InMemoryStoredDataInventory();
    inventory.counts = { ...inventory.counts, days: 12, habits: 3 };

    expect(await createGetStoredData({ inventory })()).toMatchObject({
      ok: true,
      value: { days: 12, habits: 3, profile: 0 },
    });
  });

  it('reports a storage failure', async () => {
    const inventory = new InMemoryStoredDataInventory();
    inventory.failing = true;
    expect((await createGetStoredData({ inventory })()).ok).toBe(false);
  });

  it('lists the 7 kinds of data kept today', () => {
    expect(STORED_DATA_ORDER).toHaveLength(7);
  });
});
