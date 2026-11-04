import type Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { memoryIndexedDb } from '../../../../test/fakes/memoryIndexedDb';
import { unwrap } from '../../../../test/fixtures/unwrap';
import type { RetentionCutoffs } from '../../../domain/privacy/retention';
import type { DayKey } from '../../../domain/shared/dayKey';
import { createRiselyoDatabase } from '../database';
import { DexieExpiredDataPurger } from './dexieExpiredDataPurger';

const CUTOFFS: RetentionCutoffs = {
  journalExpiredAt: new Date('2026-11-20T08:00:00.000Z'),
  conversationsStartedBefore: new Date('2026-08-22T08:00:00.000Z'),
  aiUsageBefore: '2025-11-20' as DayKey,
};

let db: Dexie;

beforeEach(async () => {
  db = createRiselyoDatabase(memoryIndexedDb());
  await db.table('journal').bulkAdd([
    { date: '2026-11-19', expiresAt: '2026-11-20T07:59:59.999Z' },
    { date: '2026-11-19', expiresAt: '2026-11-20T08:00:00.000Z' },
    { date: '2026-11-20', expiresAt: '2026-11-20T08:00:00.001Z' },
  ]);
  const oldId: unknown = await db
    .table('conversations')
    .add({ startedAt: '2026-08-22T07:59:59.999Z', mode: 'free' });
  const recentId: unknown = await db
    .table('conversations')
    .add({ startedAt: '2026-08-22T08:00:00.000Z', mode: 'free' });
  await db.table('messages').bulkAdd([
    { conversationId: oldId, createdAt: '2026-08-22T07:59:59.999Z' },
    { conversationId: oldId, createdAt: '2026-08-22T08:05:00.000Z' },
    { conversationId: recentId, createdAt: '2026-08-22T08:01:00.000Z' },
  ]);
  await db.table('aiUsage').bulkAdd([
    { date: '2025-11-19', task: 'daily_line' },
    { date: '2025-11-20', task: 'daily_line' },
  ]);
  await db.table('dayEntries').put({ date: '2020-01-01', morning: null, evening: null });
});

afterEach(() => {
  db.close();
});

describe('DexieExpiredDataPurger', () => {
  it('removes only what is past its limit (boundaries included)', async () => {
    const report = unwrap(await new DexieExpiredDataPurger(db).purge(CUTOFFS));

    expect(report).toEqual({ journal: 2, conversations: 1, messages: 2, aiUsage: 1 });
    expect(await db.table('journal').count()).toBe(1);
    expect(await db.table('conversations').count()).toBe(1);
    expect(await db.table('messages').count()).toBe(1);
    expect(await db.table('aiUsage').count()).toBe(1);
  });

  it('never touches data without a retention period', async () => {
    unwrap(await new DexieExpiredDataPurger(db).purge(CUTOFFS));
    expect(await db.table('dayEntries').count()).toBe(1);
  });

  it('removes nothing the second time', async () => {
    const purger = new DexieExpiredDataPurger(db);
    unwrap(await purger.purge(CUTOFFS));
    expect(unwrap(await purger.purge(CUTOFFS))).toEqual({
      journal: 0,
      conversations: 0,
      messages: 0,
      aiUsage: 0,
    });
  });

  it('reports a storage failure', async () => {
    db.close();
    expect((await new DexieExpiredDataPurger(db).purge(CUTOFFS)).ok).toBe(false);
  });
});
