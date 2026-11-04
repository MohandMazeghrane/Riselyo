import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import { CONVERSATION_RETENTION_DAYS } from '../config/retention';
import { parseDayKey } from '../shared/dayKey';
import { retentionCutoffs } from './retention';

const day = (value: string) => unwrap(parseDayKey(value));

describe('retentionCutoffs', () => {
  const now = new Date('2026-11-20T08:00:00.000Z');
  const cutoffs = retentionCutoffs(now, day('2026-11-20'));

  it('expires journal entries whose expiry is now or past', () => {
    expect(cutoffs.journalExpiredAt).toEqual(now);
  });

  it(`keeps conversations started in the last ${String(CONVERSATION_RETENTION_DAYS)} days`, () => {
    expect(cutoffs.conversationsStartedBefore).toEqual(new Date('2026-08-22T08:00:00.000Z'));
  });

  it('keeps 12 months of AI usage, same day of the month', () => {
    expect(cutoffs.aiUsageBefore).toBe('2025-11-20');
  });

  it('falls back to the last day of a shorter month', () => {
    expect(retentionCutoffs(now, day('2028-02-29')).aiUsageBefore).toBe('2027-02-28');
  });
});
