import { describe, expect, it } from 'vitest';
import { FakeClock } from '../../../test/fakes/fakeClock';
import { parseDayKey, type DayKey } from '../../domain/shared/dayKey';
import { createGetCurrentDay } from './getCurrentDay';

const day = (value: string): DayKey => {
  const result = parseDayKey(value);
  if (!result.ok) {
    throw new Error(`invalid test fixture ${value}`);
  }
  return result.value;
};

describe('getCurrentDay', () => {
  it('returns the calendar day during the day', () => {
    const clock = new FakeClock(new Date('2026-11-04T09:00:00Z'), {
      date: day('2026-11-04'),
      hour: 10,
      minute: 0,
    });
    const getCurrentDay = createGetCurrentDay({ clock });

    expect(getCurrentDay()).toBe('2026-11-04');
  });

  it('still returns yesterday in the middle of the night', () => {
    const clock = new FakeClock(new Date('2026-11-04T01:30:00Z'), {
      date: day('2026-11-04'),
      hour: 2,
      minute: 30,
    });
    const getCurrentDay = createGetCurrentDay({ clock });

    expect(getCurrentDay()).toBe('2026-11-03');
  });
});
