import type { MeasurementValues } from '../../../domain/entities/bodyMeasurements';
import { parseNumberInput } from '../../forms/parseNumberInput';

const SECONDS_PER_MINUTE = 60;

/** What the user typed, field by field; the 1 km walk is split into minutes and seconds. */
export interface MeasurementsDraft {
  readonly weightKg: string;
  readonly waistCm: string;
  readonly pushUps: string;
  readonly plankSeconds: string;
  readonly brisk1kmMinutes: string;
  readonly brisk1kmSeconds: string;
}

export const EMPTY_MEASUREMENTS_DRAFT: MeasurementsDraft = {
  weightKg: '',
  waistCm: '',
  pushUps: '',
  plankSeconds: '',
  brisk1kmMinutes: '',
  brisk1kmSeconds: '',
};

/** Only filled fields are sent: an empty form means the screen was skipped. */
export function draftToValues(draft: MeasurementsDraft): MeasurementValues {
  const entries = Object.entries({
    weightKg: parseNumberInput(draft.weightKg),
    waistCm: parseNumberInput(draft.waistCm),
    pushUps: parseNumberInput(draft.pushUps),
    plankSeconds: parseNumberInput(draft.plankSeconds),
    brisk1kmSeconds: walkSeconds(draft),
  }).filter(([, value]) => value !== undefined);
  return Object.fromEntries(entries);
}

function walkSeconds(draft: MeasurementsDraft): number | undefined {
  const minutes = parseNumberInput(draft.brisk1kmMinutes);
  const seconds = parseNumberInput(draft.brisk1kmSeconds);
  if (minutes === undefined && seconds === undefined) {
    return undefined;
  }
  return (minutes ?? 0) * SECONDS_PER_MINUTE + (seconds ?? 0);
}
