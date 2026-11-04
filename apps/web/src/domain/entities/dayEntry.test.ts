import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import {
  CHECK_IN_SCALE_MAX,
  CHECK_IN_SCALE_MIN,
  PRIORITY_MAX_LENGTH,
  VICTORY_MAX_LENGTH,
} from '../config/checkIn';
import { parseDayKey } from '../shared/dayKey';
import { parseTimeOfDay } from '../shared/timeOfDay';
import {
  createEveningCheckIn,
  createMorningCheckIn,
  emptyDayEntry,
  sleptMinutes,
  type MorningCheckIn,
  type MorningInput,
} from './dayEntry';
import { emptyQuickCounts } from './quickCounts';

const DAY = unwrap(parseDayKey('2026-11-05'));
const AT = new Date('2026-11-05T07:10:00Z');
const time = (value: string) => unwrap(parseTimeOfDay(value));

const MORNING: MorningInput = {
  bedtime: time('23:40'),
  wakeTime: time('07:05'),
  sleepQuality: 4,
  energy: 3,
  priority: { kind: 'habit', templateId: 'walk' },
};

const morningWith = (input: Partial<MorningInput>) =>
  createMorningCheckIn({ ...MORNING, ...input }, AT);

describe('emptyDayEntry', () => {
  it('starts a day without any check-in', () => {
    expect(emptyDayEntry(DAY)).toEqual({
      day: DAY,
      morning: null,
      evening: null,
      quick: emptyQuickCounts(),
    });
  });
});

describe('createMorningCheckIn', () => {
  it('keeps the answers and the time of the check-in', () => {
    expect(createMorningCheckIn(MORNING, AT)).toEqual({
      ok: true,
      value: { ...MORNING, completedAt: AT },
    });
  });

  it('accepts both ends of the 1-to-5 scale and nothing else', () => {
    expect(morningWith({ energy: CHECK_IN_SCALE_MIN }).ok).toBe(true);
    expect(morningWith({ energy: CHECK_IN_SCALE_MAX }).ok).toBe(true);
    expect(morningWith({ energy: CHECK_IN_SCALE_MAX + 1 }).ok).toBe(false);
    expect(morningWith({ sleepQuality: CHECK_IN_SCALE_MIN - 1 }).ok).toBe(false);
    expect(morningWith({ sleepQuality: 2.5 }).ok).toBe(false);
  });

  it('requires the two ratings', () => {
    expect(morningWith({ sleepQuality: undefined }).ok).toBe(false);
    expect(morningWith({ energy: undefined }).ok).toBe(false);
  });

  it('lets the priority be skipped', () => {
    expect(morningWith({ priority: null })).toMatchObject({ ok: true, value: { priority: null } });
  });

  it('trims a free priority and refuses an empty or too long one', () => {
    expect(morningWith({ priority: { kind: 'free', text: '  Appeler maman ' } })).toMatchObject({
      ok: true,
      value: { priority: { kind: 'free', text: 'Appeler maman' } },
    });
    expect(morningWith({ priority: { kind: 'free', text: '   ' } }).ok).toBe(false);
    expect(
      morningWith({ priority: { kind: 'free', text: 'a'.repeat(PRIORITY_MAX_LENGTH) } }).ok,
    ).toBe(true);
    expect(
      morningWith({ priority: { kind: 'free', text: 'a'.repeat(PRIORITY_MAX_LENGTH + 1) } }).ok,
    ).toBe(false);
  });
});

describe('sleptMinutes', () => {
  it('is the time between bedtime and waking up, across midnight', () => {
    const morning = unwrap(createMorningCheckIn(MORNING, AT));

    expect(sleptMinutes(morning)).toBe(445);
  });
});

describe('createEveningCheckIn', () => {
  const morning: MorningCheckIn = unwrap(createMorningCheckIn(MORNING, AT));
  const EVENING = { mood: 4, stress: 2, priorityKept: true, victory: '  Marché 20 min ' };

  it('keeps the answers, trims the victory and dates the check-in', () => {
    expect(createEveningCheckIn(EVENING, morning, AT)).toEqual({
      ok: true,
      value: { mood: 4, stress: 2, priorityKept: true, victory: 'Marché 20 min', completedAt: AT },
    });
  });

  it('treats a blank victory as no victory', () => {
    expect(createEveningCheckIn({ ...EVENING, victory: ' ' }, morning, AT)).toMatchObject({
      ok: true,
      value: { victory: null },
    });
  });

  it('refuses a victory longer than one line', () => {
    const victory = 'a'.repeat(VICTORY_MAX_LENGTH + 1);

    expect(createEveningCheckIn({ ...EVENING, victory }, morning, AT).ok).toBe(false);
  });

  it('requires mood and stress on the 1-to-5 scale', () => {
    expect(createEveningCheckIn({ ...EVENING, mood: undefined }, morning, AT).ok).toBe(false);
    expect(createEveningCheckIn({ ...EVENING, stress: 6 }, morning, AT).ok).toBe(false);
  });

  it('asks whether the priority was kept only when there was one', () => {
    expect(createEveningCheckIn({ ...EVENING, priorityKept: null }, morning, AT).ok).toBe(false);
    expect(createEveningCheckIn(EVENING, null, AT)).toMatchObject({
      ok: true,
      value: { priorityKept: null },
    });
    expect(createEveningCheckIn(EVENING, { ...morning, priority: null }, AT)).toMatchObject({
      ok: true,
      value: { priorityKept: null },
    });
  });
});
