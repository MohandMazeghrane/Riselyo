import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import { minutesBetween, parseTimeOfDay } from './timeOfDay';

const time = (value: string) => unwrap(parseTimeOfDay(value));

describe('parseTimeOfDay', () => {
  it.each(['00:00', '07:00', '23:59'])('accepts %s', (input) => {
    expect(parseTimeOfDay(input)).toEqual({ ok: true, value: input });
  });

  it.each(['24:00', '7:00', '07:60', '07h00', ''])('rejects %j', (input) => {
    expect(parseTimeOfDay(input)).toMatchObject({ ok: false, error: { code: 'invalid_input' } });
  });
});

describe('minutesBetween', () => {
  it('counts across midnight', () => {
    expect(minutesBetween(time('23:30'), time('07:00'))).toBe(450);
  });

  it('counts within the same day', () => {
    expect(minutesBetween(time('01:00'), time('09:15'))).toBe(495);
  });

  it('treats identical times as a full day', () => {
    expect(minutesBetween(time('07:00'), time('07:00'))).toBe(1440);
  });
});
