import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import { MAX_FIRST_GOALS } from '../config/onboarding';
import { parseDayKey } from '../shared/dayKey';
import {
  changeTarget,
  chooseFirstGoals,
  createHabit,
  HABIT_CATALOGUE,
  kindOf,
  REDUCE_HABIT_CATALOGUE,
  startingTier,
  type Habit,
} from './habit';

const DAY = unwrap(parseDayKey('2026-11-04'));
const LATER = unwrap(parseDayKey('2026-11-20'));

describe('HABIT_CATALOGUE', () => {
  it('lists the 10 habits of the specification', () => {
    expect(HABIT_CATALOGUE).toHaveLength(10);
  });

  it('lists 4 habits to reduce', () => {
    expect(REDUCE_HABIT_CATALOGUE.map(({ id }) => id)).toEqual([
      'snacking',
      'alcohol',
      'eveningSocialMedia',
      'tobacco',
    ]);
  });
});

describe('kindOf', () => {
  it('tells habits to build from habits to reduce', () => {
    expect(kindOf('walk')).toBe('do');
    expect(kindOf('tobacco')).toBe('reduce');
  });
});

describe('startingTier', () => {
  it('starts at the minimum (start small)', () => {
    expect(startingTier('walk')).toBe('min');
  });

  it('starts "no alcohol" at normal because it has no minimum', () => {
    expect(startingTier('noAlcohol')).toBe('normal');
  });

  it('gives habits to reduce a single "day without" tier', () => {
    expect(startingTier('snacking')).toBe('normal');
  });
});

describe('createHabit', () => {
  it('creates an active habit of the right kind at its starting tier', () => {
    expect(createHabit('read', DAY)).toEqual({
      templateId: 'read',
      kind: 'do',
      tier: 'min',
      active: true,
      createdOn: DAY,
    });
    expect(createHabit('alcohol', DAY)).toMatchObject({ kind: 'reduce', tier: 'normal' });
  });
});

describe('changeTarget', () => {
  const walk: Habit = createHabit('walk', DAY);

  it('moves a habit to another tier', () => {
    expect(changeTarget(walk, 'excellent')).toEqual({
      ok: true,
      value: { ...walk, tier: 'excellent' },
    });
  });

  it('refuses the minimum for "no alcohol"', () => {
    expect(changeTarget(createHabit('noAlcohol', DAY), 'min').ok).toBe(false);
  });

  it('refuses any tier change for a habit to reduce', () => {
    expect(changeTarget(createHabit('tobacco', DAY), 'excellent')).toMatchObject({
      ok: false,
      error: { code: 'invalid_input' },
    });
  });

  it('keeps the creation day', () => {
    expect(unwrap(changeTarget({ ...walk, createdOn: LATER }, 'normal')).createdOn).toBe(LATER);
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
