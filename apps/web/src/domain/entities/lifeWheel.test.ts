import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import { LIFE_WHEEL_MAX_SCORE, LIFE_WHEEL_MIN_SCORE } from '../config/onboarding';
import { parseDayKey } from '../shared/dayKey';
import { createLifeWheel, LIFE_DOMAINS, type LifeDomain } from './lifeWheel';

const DAY = unwrap(parseDayKey('2026-11-04'));

function allScores(score: number): Record<LifeDomain, number> {
  return Object.fromEntries(LIFE_DOMAINS.map((domain) => [domain, score])) as Record<
    LifeDomain,
    number
  >;
}

describe('createLifeWheel', () => {
  it('has the 8 domains of the specification', () => {
    expect(LIFE_DOMAINS).toHaveLength(8);
  });

  it('creates a dated wheel when every domain is scored', () => {
    expect(createLifeWheel(DAY, allScores(6))).toEqual({
      ok: true,
      value: { day: DAY, scores: allScores(6) },
    });
  });

  it('accepts both ends of the scale', () => {
    expect(createLifeWheel(DAY, allScores(LIFE_WHEEL_MIN_SCORE)).ok).toBe(true);
    expect(createLifeWheel(DAY, allScores(LIFE_WHEEL_MAX_SCORE)).ok).toBe(true);
  });

  it.each([LIFE_WHEEL_MIN_SCORE - 1, LIFE_WHEEL_MAX_SCORE + 1, 5.5, Number.NaN])(
    'rejects the score %s',
    (score) => {
      expect(createLifeWheel(DAY, { ...allScores(5), mood: score }).ok).toBe(false);
    },
  );

  it('requires every domain (no default value)', () => {
    const partial: Partial<Record<LifeDomain, number>> = allScores(5);
    delete partial.sleep;

    expect(createLifeWheel(DAY, partial)).toMatchObject({
      ok: false,
      error: { code: 'invalid_input' },
    });
  });
});
