import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import { QUICK_COUNT_MAX } from '../config/habits';
import { parseDayKey } from '../shared/dayKey';
import { createHabit } from './habit';
import {
  adjustQuickCount,
  emptyQuickCounts,
  quickCountsFrom,
  suggestedHabitLevels,
  type QuickCounts,
} from './quickCounts';

const DAY = unwrap(parseDayKey('2026-11-05'));
const ZERO = emptyQuickCounts();

describe('emptyQuickCounts', () => {
  it('starts the day at zero everywhere', () => {
    expect(ZERO).toEqual({
      waterGlasses: 0,
      walkMinutes: 0,
      workouts: 0,
      healthyMeals: 0,
      cravingsResisted: 0,
    });
  });
});

describe('adjustQuickCount', () => {
  it('adds one step per tap', () => {
    expect(unwrap(adjustQuickCount(ZERO, 'waterGlasses', 'add')).waterGlasses).toBe(1);
    expect(unwrap(adjustQuickCount(ZERO, 'walkMinutes', 'add')).walkMinutes).toBe(10);
  });

  it('removes one step to undo a tap', () => {
    const counts: QuickCounts = { ...ZERO, walkMinutes: 20 };
    expect(unwrap(adjustQuickCount(counts, 'walkMinutes', 'remove')).walkMinutes).toBe(10);
  });

  it('never goes below zero', () => {
    expect(adjustQuickCount(ZERO, 'workouts', 'remove')).toMatchObject({
      ok: false,
      error: { code: 'invalid_input' },
    });
  });

  it('stops at the plausibility limit (boundary)', () => {
    const almost: QuickCounts = { ...ZERO, healthyMeals: QUICK_COUNT_MAX.healthyMeals - 1 };
    const full = unwrap(adjustQuickCount(almost, 'healthyMeals', 'add'));
    expect(full.healthyMeals).toBe(QUICK_COUNT_MAX.healthyMeals);
    expect(adjustQuickCount(full, 'healthyMeals', 'add').ok).toBe(false);
  });
});

describe('quickCountsFrom', () => {
  it('keeps valid counters and resets anything else to zero', () => {
    const stored = { waterGlasses: 3, walkMinutes: -10, workouts: 1.5, healthyMeals: 'x' };
    expect(quickCountsFrom(stored)).toEqual({ ...ZERO, waterGlasses: 3 });
  });

  it('resets a counter above its limit', () => {
    const stored = { cravingsResisted: QUICK_COUNT_MAX.cravingsResisted + 1 };
    expect(quickCountsFrom(stored)).toEqual(ZERO);
  });

  it('reads a missing value as zero', () => {
    expect(quickCountsFrom(undefined)).toEqual(ZERO);
  });
});

describe('suggestedHabitLevels', () => {
  const habits = [createHabit('water', DAY), createHabit('walk', DAY)];

  it('suggests the tier reached by the water and walk counters', () => {
    const counts: QuickCounts = { ...ZERO, waterGlasses: 6, walkMinutes: 60 };
    expect(suggestedHabitLevels(counts, habits)).toEqual({ water: 'normal', walk: 'excellent' });
  });

  it('suggests each tier from its exact threshold', () => {
    expect(suggestedHabitLevels({ ...ZERO, waterGlasses: 3, walkMinutes: 10 }, habits)).toEqual({
      walk: 'min',
    });
    expect(suggestedHabitLevels({ ...ZERO, waterGlasses: 4, walkMinutes: 30 }, habits)).toEqual({
      water: 'min',
      walk: 'normal',
    });
    expect(suggestedHabitLevels({ ...ZERO, waterGlasses: 8 }, habits)).toEqual({
      water: 'excellent',
    });
  });

  it('suggests nothing for a habit that is not active', () => {
    expect(suggestedHabitLevels({ ...ZERO, waterGlasses: 8 }, [])).toEqual({});
  });
});
