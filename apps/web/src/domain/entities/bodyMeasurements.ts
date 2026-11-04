import { MEASUREMENT_LIMITS } from '../config/onboarding';
import type { DayKey } from '../shared/dayKey';
import { domainError, type DomainError } from '../shared/domainError';
import { err, ok, type Result } from '../shared/result';

export type MeasurementField = keyof typeof MEASUREMENT_LIMITS;

export type MeasurementValues = Partial<Record<MeasurementField, number>>;

/** Optional body measurements and fitness tests. Stay on the phone, never sent to the AI. */
export type BodyMeasurements = { readonly day: DayKey } & Readonly<MeasurementValues>;

const MEASUREMENT_FIELDS = Object.keys(MEASUREMENT_LIMITS) as MeasurementField[];

/** Null when the user skipped everything: there is nothing to store. */
export function createBodyMeasurements(
  day: DayKey,
  values: MeasurementValues,
): Result<BodyMeasurements | null, DomainError> {
  const given = MEASUREMENT_FIELDS.filter((field) => values[field] !== undefined);
  const invalid = given.find((field) => !isPlausible(field, values[field]));
  if (invalid !== undefined) {
    return err(domainError('invalid_input', `${invalid} is outside plausible values`));
  }
  if (given.length === 0) {
    return ok(null);
  }
  return ok({ day, ...Object.fromEntries(given.map((field) => [field, values[field]])) });
}

function isPlausible(field: MeasurementField, value: number | undefined): boolean {
  const { min, max, wholeNumber } = MEASUREMENT_LIMITS[field];
  if (value === undefined || !Number.isFinite(value) || value < min || value > max) {
    return false;
  }
  return !wholeNumber || Number.isInteger(value);
}
