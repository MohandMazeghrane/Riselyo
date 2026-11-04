import { ONBOARDING_STEPS } from '../../../domain/entities/onboarding';
import { parseFirstName, parseWhy, type Profile } from '../../../domain/entities/profile';
import { createRhythm, WEEKDAYS, type Rhythm } from '../../../domain/entities/rhythm';
import { parseDayKey } from '../../../domain/shared/dayKey';
import { parseTimeOfDay } from '../../../domain/shared/timeOfDay';
import { asFields, textOrEmpty } from '../storageResult';

/** The single profile row; its id is always "me". */
export const PROFILE_ID = 'me';

export interface ProfileRecord {
  readonly id: typeof PROFILE_ID;
  readonly firstName: string;
  readonly dayZero: string;
  readonly why: string | null;
  readonly rhythm: Rhythm | null;
  readonly completedSteps: readonly string[];
}

export function toProfileRecord(profile: Profile): ProfileRecord {
  return { id: PROFILE_ID, ...profile };
}

/** Rebuilds the entity through the domain rules; null when the row cannot be trusted. */
export function fromProfileRecord(value: unknown): Profile | null {
  const fields = asFields<keyof ProfileRecord>(value);
  if (fields === null) {
    return null;
  }
  const firstName = parseFirstName(textOrEmpty(fields.firstName));
  const dayZero = parseDayKey(textOrEmpty(fields.dayZero));
  const why = parseWhy(textOrEmpty(fields.why));
  const rhythm = fields.rhythm === null ? null : fromRhythmRecord(fields.rhythm);
  if (!firstName.ok || !dayZero.ok || !why.ok || rhythm === undefined) {
    return null;
  }
  return {
    firstName: firstName.value,
    dayZero: dayZero.value,
    why: why.value,
    rhythm,
    completedSteps: readList(fields.completedSteps, ONBOARDING_STEPS),
  };
}

/** Undefined when the stored rhythm is damaged. */
function fromRhythmRecord(value: unknown): Rhythm | undefined {
  const fields = asFields<keyof Rhythm>(value);
  if (fields === null || typeof fields.sleepTargetMinutes !== 'number') {
    return undefined;
  }
  const wakeTime = parseTimeOfDay(textOrEmpty(fields.wakeTime));
  const bedtime = parseTimeOfDay(textOrEmpty(fields.bedtime));
  const eveningCheckInTime = parseTimeOfDay(textOrEmpty(fields.eveningCheckInTime));
  if (!wakeTime.ok || !bedtime.ok || !eveningCheckInTime.ok) {
    return undefined;
  }
  const rhythm = createRhythm({
    wakeTime: wakeTime.value,
    bedtime: bedtime.value,
    eveningCheckInTime: eveningCheckInTime.value,
    sleepTargetMinutes: fields.sleepTargetMinutes,
    sportDays: readList(fields.sportDays, WEEKDAYS),
  });
  return rhythm.ok ? rhythm.value : undefined;
}

function readList<T extends string>(value: unknown, allowed: readonly T[]): T[] {
  return Array.isArray(value) ? allowed.filter((item) => value.includes(item)) : [];
}
