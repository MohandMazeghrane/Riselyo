import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import { MEASUREMENT_LIMITS } from '../config/onboarding';
import { parseDayKey } from '../shared/dayKey';
import { createBodyMeasurements } from './bodyMeasurements';

const DAY = unwrap(parseDayKey('2026-11-04'));

describe('createBodyMeasurements', () => {
  it('returns null when everything was skipped', () => {
    expect(createBodyMeasurements(DAY, {})).toEqual({ ok: true, value: null });
  });

  it('keeps only the values given', () => {
    expect(createBodyMeasurements(DAY, { weightKg: 78.5, pushUps: 12 })).toEqual({
      ok: true,
      value: { day: DAY, weightKg: 78.5, pushUps: 12 },
    });
  });

  it.each(Object.entries(MEASUREMENT_LIMITS))('accepts the bounds of %s', (field, limits) => {
    expect(createBodyMeasurements(DAY, { [field]: limits.min }).ok).toBe(true);
    expect(createBodyMeasurements(DAY, { [field]: limits.max }).ok).toBe(true);
  });

  it.each(Object.entries(MEASUREMENT_LIMITS))('rejects values outside %s', (field, limits) => {
    expect(createBodyMeasurements(DAY, { [field]: limits.max + 1 }).ok).toBe(false);
    expect(createBodyMeasurements(DAY, { [field]: limits.min - 1 }).ok).toBe(false);
  });

  it('expects whole numbers for counts and durations', () => {
    expect(createBodyMeasurements(DAY, { pushUps: 10.5 }).ok).toBe(false);
    expect(createBodyMeasurements(DAY, { plankSeconds: 30.2 }).ok).toBe(false);
  });
});
