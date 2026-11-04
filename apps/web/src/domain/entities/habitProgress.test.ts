import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import { NEW_HABIT_ADHERENCE_WINDOW_DAYS, NEW_HABIT_MIN_ANSWERED_DAYS } from '../config/habits';
import { daysBefore, parseDayKey, type DayKey } from '../shared/dayKey';
import { createHabit, type Habit, type HabitTemplateId } from './habit';
import type { HabitLevel, HabitLog } from './habitLog';
import { addHabit, checkHabitAddition, daysWithout } from './habitProgress';

const TODAY = unwrap(parseDayKey('2026-11-20'));
const PAST = daysBefore(TODAY, NEW_HABIT_ADHERENCE_WINDOW_DAYS + 1);
const ACTIVE: readonly Habit[] = [createHabit('walk', TODAY), createHabit('read', TODAY)];

/** `ago(1)` is yesterday. */
function ago(days: number): DayKey {
  const day = PAST[days - 1];
  if (day === undefined) {
    throw new Error(`no fixture day ${String(days)} days ago`);
  }
  return day;
}

const log = (templateId: HabitTemplateId, day: DayKey, level: HabitLevel): HabitLog => ({
  templateId,
  day,
  level,
});

/** One [walk, read] pair per day, starting yesterday. */
function history(days: readonly (readonly [HabitLevel, HabitLevel])[]): HabitLog[] {
  return days.flatMap(([walk, read], index) => [
    log('walk', ago(index + 1), walk),
    log('read', ago(index + 1), read),
  ]);
}

const ALL_NORMAL = history([
  ['normal', 'normal'],
  ['normal', 'normal'],
  ['normal', 'normal'],
]);

const check = (recentLogs: readonly HabitLog[], activeHabits = ACTIVE) =>
  checkHabitAddition({ templateId: 'water', activeHabits, recentLogs, today: TODAY });

describe('checkHabitAddition', () => {
  it('allows a new habit when the current ones hold at 70 % (boundary)', () => {
    const logs = history([
      ['min', 'normal'],
      ['excellent', 'none'],
      ['normal', 'normal'],
      ['min', 'none'],
      ['none', 'min'],
    ]);
    expect(check(logs)).toEqual({ allowed: true });
  });

  it('waits when they hold at less than 70 %', () => {
    const logs = history([
      ['min', 'none'],
      ['none', 'normal'],
      ['normal', 'min'],
    ]);
    expect(check(logs)).toEqual({ allowed: false, reason: 'low_adherence', adherence: 4 / 6 });
  });

  it(`needs ${String(NEW_HABIT_MIN_ANSWERED_DAYS)} answered days to judge (boundary)`, () => {
    const twoDays = ALL_NORMAL.slice(0, 4);
    expect(check(twoDays)).toEqual({ allowed: false, reason: 'not_enough_data', answeredDays: 2 });
    expect(check(ALL_NORMAL)).toEqual({ allowed: true });
  });

  it('ignores today, days older than the window and inactive habits', () => {
    const ignored = [
      log('walk', TODAY, 'none'),
      log('walk', ago(NEW_HABIT_ADHERENCE_WINDOW_DAYS + 1), 'none'),
      log('tidy', ago(1), 'none'),
    ];
    expect(check([...ALL_NORMAL, ...ignored])).toEqual({ allowed: true });
  });

  it('counts the last day of the window', () => {
    const lastDay = [
      log('walk', ago(NEW_HABIT_ADHERENCE_WINDOW_DAYS), 'none'),
      log('read', ago(NEW_HABIT_ADHERENCE_WINDOW_DAYS), 'none'),
    ];
    expect(check([...ALL_NORMAL, ...lastDay])).toEqual({ allowed: true });
    expect(check([...ALL_NORMAL.slice(0, 4), ...lastDay])).toMatchObject({
      reason: 'low_adherence',
    });
  });

  it('does not count habits to reduce in the adherence', () => {
    const active = [...ACTIVE, createHabit('snacking', TODAY)];
    expect(check([...ALL_NORMAL, log('snacking', ago(1), 'none')], active)).toEqual({
      allowed: true,
    });
  });

  it('allows a habit when no habit to build is active', () => {
    expect(check([], [])).toEqual({ allowed: true });
  });

  it('always allows a habit to reduce', () => {
    const result = checkHabitAddition({
      templateId: 'tobacco',
      activeHabits: ACTIVE,
      recentLogs: [],
      today: TODAY,
    });
    expect(result).toEqual({ allowed: true });
  });

  it('refuses a habit that is already active', () => {
    const result = checkHabitAddition({
      templateId: 'walk',
      activeHabits: ACTIVE,
      recentLogs: ALL_NORMAL,
      today: TODAY,
    });
    expect(result).toEqual({ allowed: false, reason: 'already_active' });
  });
});

describe('addHabit', () => {
  it('creates the habit when it is allowed', () => {
    const input = {
      templateId: 'alcohol' as const,
      activeHabits: ACTIVE,
      recentLogs: [],
      today: TODAY,
    };
    expect(addHabit(input)).toEqual({ ok: true, value: createHabit('alcohol', TODAY) });
  });

  it('says why it is not allowed', () => {
    const input = {
      templateId: 'water' as const,
      activeHabits: ACTIVE,
      recentLogs: [],
      today: TODAY,
    };
    expect(addHabit(input)).toMatchObject({
      ok: false,
      error: { code: 'invalid_input', detail: 'not_enough_data' },
    });
  });
});

describe('daysWithout', () => {
  it('counts the days without since the last time it happened', () => {
    const logs = [
      log('snacking', ago(4), 'none'),
      log('snacking', ago(1), 'normal'),
      log('snacking', ago(2), 'normal'),
      log('snacking', ago(3), 'normal'),
    ];
    expect(daysWithout(logs)).toBe(3);
  });

  it('includes today when it is already answered', () => {
    expect(daysWithout([log('snacking', TODAY, 'normal'), log('snacking', ago(1), 'normal')])).toBe(
      2,
    );
  });

  it('neither counts nor breaks on days left unanswered', () => {
    expect(
      daysWithout([log('snacking', ago(1), 'normal'), log('snacking', ago(6), 'normal')]),
    ).toBe(2);
  });

  it('is zero when it happened on the last answered day, or without any answer', () => {
    expect(daysWithout([log('snacking', ago(1), 'none'), log('snacking', ago(2), 'normal')])).toBe(
      0,
    );
    expect(daysWithout([])).toBe(0);
  });
});
