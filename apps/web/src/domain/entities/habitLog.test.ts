import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import { parseDayKey } from '../shared/dayKey';
import { chooseFirstGoals } from './habit';
import { createHabitLogs, levelsAvailableFor } from './habitLog';

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
