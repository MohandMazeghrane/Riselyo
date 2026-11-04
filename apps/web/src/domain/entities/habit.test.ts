import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import { MAX_FIRST_GOALS } from '../config/onboarding';
import { parseDayKey } from '../shared/dayKey';
import { chooseFirstGoals, HABIT_CATALOGUE, startingTier } from './habit';

const DAY = unwrap(parseDayKey('2026-11-04'));

describe('HABIT_CATALOGUE', () => {
  it('lists the 10 habits of the specification', () => {
    expect(HABIT_CATALOGUE).toHaveLength(10);
  });
});

describe('startingTier', () => {
  it('starts at the minimum (start small)', () => {
    expect(startingTier('walk')).toBe('min');
  });

  it('starts "no alcohol" at normal because it has no minimum', () => {
    expect(startingTier('noAlcohol')).toBe('normal');
  });
});

describe('chooseFirstGoals', () => {
  it('creates active "do" habits at their starting tier', () => {
    expect(chooseFirstGoals(['walk', 'noAlcohol'], DAY)).toEqual({
      ok: true,
      value: [
        { templateId: 'walk', kind: 'do', tier: 'min', active: true, createdOn: DAY },
        { templateId: 'noAlcohol', kind: 'do', tier: 'normal', active: true, createdOn: DAY },
      ],
    });
  });

  it(`accepts ${String(MAX_FIRST_GOALS)} goals and refuses one more`, () => {
    expect(chooseFirstGoals(['walk', 'read', 'water'], DAY).ok).toBe(true);
    expect(chooseFirstGoals(['walk', 'read', 'water', 'tidy'], DAY)).toMatchObject({
      ok: false,
      error: { code: 'invalid_input' },
    });
  });

  it('needs at least one goal', () => {
    expect(chooseFirstGoals([], DAY).ok).toBe(false);
  });

  it('ignores a goal chosen twice', () => {
    expect(unwrap(chooseFirstGoals(['walk', 'walk'], DAY))).toHaveLength(1);
  });
});
