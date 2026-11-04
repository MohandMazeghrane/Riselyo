import { describe, expect, it } from 'vitest';
import { InMemoryLocalDataEraser } from '../../../test/fakes/inMemoryRepositories';
import { createEraseAllData } from './eraseAllData';

function setup() {
  const eraser = new InMemoryLocalDataEraser();
  return { eraser, erase: createEraseAllData({ eraser }) };
}

describe('eraseAllData', () => {
  it('erases the data first, then the caches', async () => {
    const app = setup();
    expect(await app.erase()).toEqual({ ok: true, value: undefined });
    expect(app.eraser.calls).toEqual(['database', 'caches']);
  });

  it('keeps the caches when the data could not be erased, and says so', async () => {
    const app = setup();
    app.eraser.failing = 'database';
    expect((await app.erase()).ok).toBe(false);
    expect(app.eraser.calls).toEqual([]);
  });

  it('reports a cache failure after the data is gone', async () => {
    const app = setup();
    app.eraser.failing = 'caches';
    expect((await app.erase()).ok).toBe(false);
    expect(app.eraser.calls).toEqual(['database']);
  });
});
