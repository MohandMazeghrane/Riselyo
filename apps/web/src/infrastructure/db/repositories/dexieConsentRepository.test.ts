import type Dexie from 'dexie';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { memoryIndexedDb } from '../../../../test/fakes/memoryIndexedDb';
import { defaultConsents, grantConsent, type ConsentSet } from '../../../domain/entities/consent';
import { createRiselyoDatabase } from '../database';
import { DexieConsentRepository } from './dexieConsentRepository';

const DECIDED_AT = new Date('2026-11-04T08:00:00Z');

function withHealthGranted(): ConsentSet {
  const result = grantConsent(defaultConsents(), 'health', DECIDED_AT);
  if (!result.ok) {
    throw new Error('fixture');
  }
  return result.value;
}

describe('DexieConsentRepository', () => {
  let db: Dexie;
  let repository: DexieConsentRepository;

  beforeEach(() => {
    db = createRiselyoDatabase(memoryIndexedDb());
    repository = new DexieConsentRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('returns everything denied on a fresh install', async () => {
    expect(await repository.load()).toEqual({ ok: true, value: defaultConsents() });
  });

  it('saves and reloads the decisions with their date', async () => {
    await repository.save(withHealthGranted());

    expect(await repository.load()).toEqual({ ok: true, value: withHealthGranted() });
  });

  it('stores dates as ISO strings, one record per purpose', async () => {
    await repository.save(withHealthGranted());

    expect(await db.table('consents').get('health')).toEqual({
      key: 'health',
      granted: true,
      decidedAt: '2026-11-04T08:00:00.000Z',
    });
    expect(await db.table('consents').count()).toBe(4);
  });

  it('treats an unreadable record as denied rather than granted', async () => {
    await db.table('consents').put({ key: 'ai', granted: 'yes', decidedAt: 12 });

    const result = await repository.load();

    expect(result).toEqual({ ok: true, value: defaultConsents() });
  });

  it('ignores unknown purposes', async () => {
    await db.table('consents').put({ key: 'tracking', granted: true, decidedAt: null });

    expect(await repository.load()).toEqual({ ok: true, value: defaultConsents() });
  });

  it('reports a storage failure instead of throwing', async () => {
    db.close();

    const loaded = await repository.load();
    const saved = await repository.save(defaultConsents());

    expect(loaded).toMatchObject({ ok: false, error: { code: 'storage_failure' } });
    expect(saved).toMatchObject({ ok: false, error: { code: 'storage_failure' } });
  });
});
