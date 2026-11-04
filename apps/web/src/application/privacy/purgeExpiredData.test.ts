import { describe, expect, it } from 'vitest';
import { FakeClock } from '../../../test/fakes/fakeClock';
import { InMemoryExpiredDataPurger } from '../../../test/fakes/inMemoryRepositories';
import { unwrap } from '../../../test/fixtures/unwrap';
import { parseDayKey } from '../../domain/shared/dayKey';
import { createPurgeExpiredData } from './purgeExpiredData';

const NOW = new Date('2026-11-20T02:30:00.000Z');

describe('purgeExpiredData', () => {
  it('purges with the limits of today, the local day (4 a.m. rollover) for AI usage', async () => {
    const clock = new FakeClock(NOW, {
      date: unwrap(parseDayKey('2026-11-20')),
      hour: 3,
      minute: 30,
    });
    const purger = new InMemoryExpiredDataPurger();

    unwrap(await createPurgeExpiredData({ clock, purger })());

    expect(purger.received).toEqual([
      {
        journalExpiredAt: NOW,
        conversationsStartedBefore: new Date('2026-08-22T02:30:00.000Z'),
        aiUsageBefore: '2025-11-19',
      },
    ]);
  });

  it('reports a storage failure', async () => {
    const clock = new FakeClock(NOW, {
      date: unwrap(parseDayKey('2026-11-20')),
      hour: 10,
      minute: 0,
    });
    const purger = new InMemoryExpiredDataPurger();
    purger.failing = true;
    expect((await createPurgeExpiredData({ clock, purger })()).ok).toBe(false);
  });
});
