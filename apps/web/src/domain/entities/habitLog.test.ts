import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import { parseDayKey } from '../shared/dayKey';
import { chooseFirstGoals } from './habit';
import { createHabitLog, createHabitLogs, levelsAvailableFor, nextLevel } from './habitLog';

const DAY = unwrap(parseDayKey('2026-11-05'));
const HABITS = unwrap(chooseFirstGoals(['walk', 'noAlcohol'], DAY));

describe('levelsAvailableFor', () => {
  it('offers the 4 answers for a habit with a minimum', () => {
    expect(levelsAvailableFor('walk')).toEqual(['none', 'min', 'normal', 'excellent']);
  });

  it('has no minimum answer for "no alcohol"', () => {
    expect(levelsAvailableFor('noAlcohol')).toEqual(['none', 'normal', 'excellent']);
  });
});

describe('createHabitLogs', () => {
  it('logs each answered active habit for the day', () => {
    expect(createHabitLogs(DAY, HABITS, { walk: 'min', noAlcohol: 'none' })).toEqual({
      ok: true,
      value: [
        { templateId: 'walk', day: DAY, level: 'min' },
        { templateId: 'noAlcohol', day: DAY, level: 'none' },
      ],
    });
  });

  it('does not invent an answer for a habit left blank', () => {
    expect(unwrap(createHabitLogs(DAY, HABITS, { walk: 'normal' }))).toEqual([
      { templateId: 'walk', day: DAY, level: 'normal' },
    ]);
  });

  it('ignores habits that are not active', () => {
    expect(unwrap(createHabitLogs(DAY, HABITS, { read: 'normal' }))).toEqual([]);
  });

  it('refuses a level the habit does not have', () => {
    expect(createHabitLogs(DAY, HABITS, { noAlcohol: 'min' })).toMatchObject({
      ok: false,
      error: { code: 'invalid_input' },
    });
  });
});

describe('levelsAvailableFor a habit to reduce', () => {
  it('only asks whether the day was without it', () => {
    expect(levelsAvailableFor('snacking')).toEqual(['none', 'normal']);
  });
});

describe('nextLevel', () => {
  it('starts at the first level reached when nothing is logged yet', () => {
    expect(nextLevel('walk', undefined)).toBe('min');
    expect(nextLevel('noAlcohol', undefined)).toBe('normal');
    expect(nextLevel('snacking', undefined)).toBe('normal');
  });

  it('goes up one tier per tap, then back to "not done"', () => {
    expect(nextLevel('walk', 'min')).toBe('normal');
    expect(nextLevel('walk', 'normal')).toBe('excellent');
    expect(nextLevel('walk', 'excellent')).toBe('none');
    expect(nextLevel('walk', 'none')).toBe('min');
  });

  it('skips the tiers a habit does not have', () => {
    expect(nextLevel('noAlcohol', 'none')).toBe('normal');
    expect(nextLevel('snacking', 'normal')).toBe('none');
  });
});

describe('createHabitLog', () => {
  it('logs one level for an active habit', () => {
    expect(createHabitLog(HABITS, { templateId: 'walk', day: DAY, level: 'excellent' })).toEqual({
      ok: true,
      value: { templateId: 'walk', day: DAY, level: 'excellent' },
    });
  });

  it('refuses a habit that is not active', () => {
    expect(createHabitLog(HABITS, { templateId: 'read', day: DAY, level: 'min' })).toMatchObject({
      ok: false,
      error: { code: 'not_found' },
    });
  });

  it('refuses a level the habit does not have', () => {
    expect(createHabitLog(HABITS, { templateId: 'noAlcohol', day: DAY, level: 'min' }).ok).toBe(
      false,
    );
  });
});
