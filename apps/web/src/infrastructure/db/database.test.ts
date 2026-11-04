import { describe, expect, it } from 'vitest';
import { memoryIndexedDb } from '../../../test/fakes/memoryIndexedDb';
import { createRiselyoDatabase, SCHEMA_VERSIONS } from './database';
import { SCHEMA_V1, SCHEMA_V2 } from './schema';

/** Copy of version 1 as published. If this test fails, add a new version instead. */
const PUBLISHED_V1 = {
  profile: '&id',
  consents: '&key',
  coachProfile: '&id',
  coachMemory: '++id, createdAt',
  dayEntries: '&date',
  healthDays: '&date, importedAt',
  habits: '++id, kind, active',
  habitLogs: '++id, [habitId+date], date',
  measurements: '++id, date',
  photos: '++id, date',
  reviews: '++id, type, periodStart',
  journal: '++id, date, expiresAt',
  conversations: '++id, startedAt, mode',
  messages: '++id, conversationId, createdAt',
  progression: '&id',
  aiUsage: '++id, date, task',
  settings: '&key',
};

/** Copy of version 2 as published (task 1.6). */
const PUBLISHED_V2 = { lifeWheels: '&day' };

const LATEST_VERSION = 2;

describe('schema history', () => {
  it('keeps version 1 exactly as published', () => {
    expect(SCHEMA_V1).toEqual(PUBLISHED_V1);
    expect(SCHEMA_VERSIONS[0]).toEqual({ version: 1, stores: PUBLISHED_V1 });
  });

  it('keeps version 2 exactly as published', () => {
    expect(SCHEMA_V2).toEqual(PUBLISHED_V2);
    expect(SCHEMA_VERSIONS[1]).toEqual({ version: 2, stores: PUBLISHED_V2 });
  });

  it('lists versions in strictly increasing order starting at 1', () => {
    const versions = SCHEMA_VERSIONS.map(({ version }) => version);

    expect(versions[0]).toBe(1);
    expect(versions).toEqual([...versions].sort((a, b) => a - b));
    expect(new Set(versions).size).toBe(versions.length);
  });
});

describe('createRiselyoDatabase', () => {
  it('creates every store of the latest version on a fresh install', async () => {
    const db = createRiselyoDatabase(memoryIndexedDb());
    await db.open();

    const stores = db.tables.map((table) => table.name).sort();

    expect(stores).toEqual(Object.keys({ ...PUBLISHED_V1, ...PUBLISHED_V2 }).sort());
    expect(db.verno).toBe(LATEST_VERSION);
    db.close();
  });

  it('declares the compound index used to find a habit log by day', async () => {
    const db = createRiselyoDatabase(memoryIndexedDb());
    await db.open();

    const indexes = db.table('habitLogs').schema.indexes.map((index) => index.name);

    expect(indexes).toEqual(expect.arrayContaining(['[habitId+date]', 'date']));
    db.close();
  });

  it('keeps data when the app is reopened', async () => {
    const storage = memoryIndexedDb();
    const first = createRiselyoDatabase(storage);
    await first.table('settings').put({ key: 'probe', value: 42 });
    first.close();

    const reopened = createRiselyoDatabase(storage);

    expect(await reopened.table('settings').get('probe')).toEqual({ key: 'probe', value: 42 });
    reopened.close();
  });

  it('can stop at an older version to prepare migration tests', async () => {
    const db = createRiselyoDatabase({ ...memoryIndexedDb(), upToVersion: 1 });
    await db.open();

    expect(db.verno).toBe(1);
    db.close();
  });
});

describe('migration v1 → v2', () => {
  it('keeps existing data and adds the life wheels store', async () => {
    const storage = memoryIndexedDb();
    const v1 = createRiselyoDatabase({ ...storage, upToVersion: 1 });
    await v1.table('consents').put({ key: 'health', granted: true, decidedAt: null });
    v1.close();

    const v2 = createRiselyoDatabase(storage);
    await v2.open();

    expect(v2.verno).toBe(2);
    expect(await v2.table('consents').get('health')).toMatchObject({ granted: true });
    expect(v2.table('lifeWheels').schema.primKey.name).toBe('day');
    v2.close();
  });
});
