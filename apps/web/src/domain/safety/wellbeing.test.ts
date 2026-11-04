import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import { emptyDayEntry, type DayEntry } from '../entities/dayEntry';
import { daysBefore, parseDayKey, type DayKey } from '../shared/dayKey';
import { wellbeingSignal } from './wellbeing';

const TODAY = unwrap(parseDayKey('2026-11-20'));
const PAST = daysBefore(TODAY, 8);
const AT = new Date('2026-11-20T20:00:00Z');

/** `ago(0)` is today. */
function ago(days: number): DayKey {
  const day = days === 0 ? TODAY : PAST[days - 1];
  if (day === undefined) {
    throw new Error(`no fixture day ${String(days)} days ago`);
  }
  return day;
}

function evening(days: number, mood: number, stress = 2): DayEntry {
  return {
    ...emptyDayEntry(ago(days)),
    evening: { mood, stress, priorityKept: null, victory: null, completedAt: AT },
  };
}

const moods = (values: readonly number[]): DayEntry[] =>
  values.map((mood, index) => evening(index, mood));

describe('wellbeingSignal', () => {
  it('stays quiet on ordinary days', () => {
    expect(wellbeingSignal(moods([3, 4, 2, 3, 4, 3, 5]), TODAY)).toBeNull();
  });

  it('notices a low mood on every answered evening of the week (boundary: 4 evenings)', () => {
    expect(wellbeingSignal(moods([2, 1, 2, 2]), TODAY)).toBe('low_mood');
    expect(wellbeingSignal(moods([2, 1, 2]), TODAY)).toBeNull();
  });

  it('does not count unanswered days, nor days outside the week', () => {
    const entries = [
      evening(0, 2),
      evening(2, 1),
      evening(4, 2),
      evening(7, 1),
      emptyDayEntry(ago(1)),
    ];
    expect(wellbeingSignal(entries, TODAY)).toBeNull();
    expect(wellbeingSignal([...entries, evening(6, 2)], TODAY)).toBe('low_mood');
  });

  it('does not count a mood of 3 as low (boundary)', () => {
    expect(wellbeingSignal(moods([2, 2, 2, 3, 2]), TODAY)).toBeNull();
  });

  it('notices stress at 5 on 3 evenings of the week (boundary)', () => {
    const twice = [evening(0, 3, 5), evening(3, 4, 5), evening(5, 3, 4)];
    expect(wellbeingSignal(twice, TODAY)).toBeNull();
    expect(wellbeingSignal([...twice, evening(6, 4, 5)], TODAY)).toBe('high_stress');
  });

  it('speaks about the mood first when both happen', () => {
    const entries = [0, 1, 2, 3].map((days) => evening(days, 1, 5));
    expect(wellbeingSignal(entries, TODAY)).toBe('low_mood');
  });
});
