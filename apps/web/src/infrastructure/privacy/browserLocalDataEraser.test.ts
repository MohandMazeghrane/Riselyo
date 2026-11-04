import type Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { memoryIndexedDb } from '../../../test/fakes/memoryIndexedDb';
import { unwrap } from '../../../test/fixtures/unwrap';
import { createRiselyoDatabase } from '../db/database';
import { BrowserLocalDataEraser, type BrowserStorage } from './browserLocalDataEraser';

let db: Dexie;

beforeEach(async () => {
  db = createRiselyoDatabase(memoryIndexedDb());
  await db.table('profile').put({ id: 'me', firstName: 'Sam' });
  await db.table('dayEntries').put({ date: '2026-11-05', morning: null, evening: null });
  await db.table('habitLogs').add({ habitId: 'walk', date: '2026-11-05', level: 'min' });
});

afterEach(() => {
  db.close();
});

function fakeBrowser() {
  const cacheNames = new Set(['workbox-precache-v2', 'other']);
  const unregistered: string[] = [];
  const browser: BrowserStorage = {
    caches: {
      keys: () => Promise.resolve([...cacheNames]),
      delete: (name: string) => Promise.resolve(cacheNames.delete(name)),
    },
    serviceWorker: {
      getRegistrations: () =>
        Promise.resolve([
          {
            unregister: () => {
              unregistered.push('sw');
              return Promise.resolve(true);
            },
          } as unknown as ServiceWorkerRegistration,
        ]),
    },
  };
  return { browser, cacheNames, unregistered };
}

async function totalRows(): Promise<number> {
  const counts = await Promise.all(db.tables.map((table) => table.count()));
  return counts.reduce((sum, count) => sum + count, 0);
}

describe('BrowserLocalDataEraser', () => {
  it('empties every table but keeps the schema usable', async () => {
    expect(await totalRows()).toBe(3);
    unwrap(await new BrowserLocalDataEraser(db, fakeBrowser().browser).eraseDatabase());

    expect(await totalRows()).toBe(0);
    await db.table('profile').put({ id: 'me', firstName: 'Léa' });
    expect(await db.table('profile').count()).toBe(1);
  });

  it('deletes every cache and unregisters the service worker', async () => {
    const fake = fakeBrowser();
    unwrap(await new BrowserLocalDataEraser(db, fake.browser).eraseCaches());

    expect(fake.cacheNames.size).toBe(0);
    expect(fake.unregistered).toEqual(['sw']);
  });

  it('works where the browser has no caches or service worker', async () => {
    const eraser = new BrowserLocalDataEraser(db, { caches: undefined, serviceWorker: undefined });
    expect(await eraser.eraseCaches()).toEqual({ ok: true, value: undefined });
  });

  it('reports failures', async () => {
    const failing: BrowserStorage = {
      caches: {
        keys: () => Promise.reject(new Error('denied')),
        delete: () => Promise.resolve(false),
      },
      serviceWorker: undefined,
    };
    const eraser = new BrowserLocalDataEraser(db, failing);
    expect((await eraser.eraseCaches()).ok).toBe(false);
    db.close();
    expect((await eraser.eraseDatabase()).ok).toBe(false);
  });
});
