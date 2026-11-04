import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import { SLEEP_ALERT_MAX_MINUTES, SLEEP_ALERT_MIN_MINUTES } from '../config/onboarding';
import { parseTimeOfDay } from '../shared/timeOfDay';
import {
  createRhythm,
  defaultRhythm,
  sleepDurationWarning,
  suggestedSleepMinutes,
  type RhythmInput,
} from './rhythm';

const time = (value: string) => unwrap(parseTimeOfDay(value));

describe('defaultRhythm', () => {
  it('matches the specification defaults', () => {
    expect(defaultRhythm()).toEqual({
      wakeTime: '07:00',
      bedtime: '23:30',
      sleepTargetMinutes: 450,
      eveningCheckInTime: '21:30',
      sportDays: [],
    });
  });
});

describe('suggestedSleepMinutes', () => {
  it('is the time between bedtime and waking up', () => {
    expect(suggestedSleepMinutes(time('22:45'), time('06:15'))).toBe(450);
  });
});

describe('sleepDurationWarning', () => {
  it('warns gently below the minimum, not at it', () => {
    expect(sleepDurationWarning(SLEEP_ALERT_MIN_MINUTES - 1)).toBe('too_short');
    expect(sleepDurationWarning(SLEEP_ALERT_MIN_MINUTES)).toBeNull();
  });

  it('warns gently above the maximum, not at it', () => {
    expect(sleepDurationWarning(SLEEP_ALERT_MAX_MINUTES + 1)).toBe('too_long');
    expect(sleepDurationWarning(SLEEP_ALERT_MAX_MINUTES)).toBeNull();
  });
});

describe('createRhythm', () => {
  const valid: RhythmInput = { ...defaultRhythm(), sportDays: ['tue', 'sat'] };

  it('keeps sport days in weekday order without duplicates', () => {
    const rhythm = createRhythm({ ...valid, sportDays: ['sat', 'tue', 'sat'] });

    expect(rhythm).toMatchObject({ ok: true, value: { sportDays: ['tue', 'sat'] } });
  });

  it('accepts a sleep target that triggers a warning (never blocking)', () => {
    expect(createRhythm({ ...valid, sleepTargetMinutes: 240 }).ok).toBe(true);
  });

  it.each([0, -30, 1441, 450.5])('rejects the sleep target %s', (minutes) => {
    expect(createRhythm({ ...valid, sleepTargetMinutes: minutes }).ok).toBe(false);
  });
});
