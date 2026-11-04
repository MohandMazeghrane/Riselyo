import { describe, expect, it } from 'vitest';
import { DAY_ROLLOVER_HOUR } from '../config/time';
import { dayKeyOf, daysBefore, parseDayKey, previousDayKey, type DayKey } from './dayKey';

const day = (value: string): DayKey => {
  const result = parseDayKey(value);
  if (!result.ok) {
    throw new Error(`invalid test fixture ${value}`);
  }
  return result.value;
};

describe('parseDayKey', () => {
  it('accepts a valid calendar date', () => {
    expect(parseDayKey('2026-11-04')).toEqual({ ok: true, value: '2026-11-04' });
  });

  it.each(['2026-1-04', '04/11/2026', '2026-11-04T10:00', '', '2026-13-01', '2026-02-30'])(
    'rejects %j',
    (input) => {
      const result = parseDayKey(input);

      expect(result).toMatchObject({ ok: false, error: { code: 'invalid_input' } });
    },
  );

  it('accepts 29 February on a leap year only', () => {
    expect(parseDayKey('2028-02-29').ok).toBe(true);
    expect(parseDayKey('2026-02-29').ok).toBe(false);
  });
});

describe('previousDayKey', () => {
  it('crosses month and year boundaries', () => {
    expect(previousDayKey(day('2026-03-01'))).toBe('2026-02-28');
    expect(previousDayKey(day('2027-01-01'))).toBe('2026-12-31');
  });
});

describe('dayKeyOf', () => {
  it('keeps the calendar date from the rollover hour onwards', () => {
    const key = dayKeyOf({ date: day('2026-11-04'), hour: DAY_ROLLOVER_HOUR, minute: 0 });

    expect(key).toBe('2026-11-04');
  });

  it('belongs to the previous day just before the rollover hour', () => {
    const key = dayKeyOf({ date: day('2026-11-04'), hour: DAY_ROLLOVER_HOUR - 1, minute: 59 });

    expect(key).toBe('2026-11-03');
  });

  it('belongs to the previous day right after midnight', () => {
    expect(dayKeyOf({ date: day('2026-11-04'), hour: 0, minute: 0 })).toBe('2026-11-03');
  });
});

describe('daysBefore', () => {
  it('lists the given number of days before a day, most recent first', () => {
    expect(daysBefore(day('2026-03-02'), 3)).toEqual(['2026-03-01', '2026-02-28', '2026-02-27']);
  });

  it('lists nothing for zero days', () => {
    expect(daysBefore(day('2026-03-02'), 0)).toEqual([]);
  });
});
