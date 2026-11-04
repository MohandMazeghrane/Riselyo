import { z } from 'zod';
import {
  CHECK_IN_SCALE_MAX,
  CHECK_IN_SCALE_MIN,
  PRIORITY_MAX_LENGTH,
  VICTORY_MAX_LENGTH,
} from '../../../domain/config/checkIn';
import { QUICK_COUNT_MAX } from '../../../domain/config/habits';
import {
  FIRST_NAME_MAX_LENGTH,
  LIFE_WHEEL_MAX_SCORE,
  LIFE_WHEEL_MIN_SCORE,
  MEASUREMENT_LIMITS,
  WHY_MAX_LENGTH,
} from '../../../domain/config/onboarding';
import { CONSENT_PURPOSES } from '../../../domain/entities/consent';
import { ALL_HABIT_IDS, type HabitTemplateId } from '../../../domain/entities/habit';
import { LIFE_DOMAINS } from '../../../domain/entities/lifeWheel';
import { ONBOARDING_STEPS } from '../../../domain/entities/onboarding';
import { WEEKDAYS } from '../../../domain/entities/rhythm';
import { parseDayKey } from '../../../domain/shared/dayKey';
import { MINUTES_PER_DAY, parseTimeOfDay } from '../../../domain/shared/timeOfDay';

/**
 * Stored records, field by field: a backup is untrusted input (CLAUDE.md, section 11).
 * Every object is strict, so an unknown field is refused rather than silently imported.
 */
const dayKey = z.string().refine((value) => parseDayKey(value).ok);
const time = z.string().refine((value) => parseTimeOfDay(value).ok);
const instant = z.iso.datetime();
const scale = z.int().min(CHECK_IN_SCALE_MIN).max(CHECK_IN_SCALE_MAX);
const habitId = z.enum(ALL_HABIT_IDS as [HabitTemplateId, ...HabitTemplateId[]]);
const rowId = z.int().positive().optional();

const rhythm = z.strictObject({
  wakeTime: time,
  bedtime: time,
  sleepTargetMinutes: z.int().min(0).max(MINUTES_PER_DAY),
  eveningCheckInTime: time,
  sportDays: z.array(z.enum(WEEKDAYS)),
});

export const profileRecord = z.strictObject({
  id: z.literal('me'),
  firstName: z.string().min(1).max(FIRST_NAME_MAX_LENGTH),
  dayZero: dayKey,
  why: z.string().max(WHY_MAX_LENGTH).nullable(),
  rhythm: rhythm.nullable(),
  completedSteps: z.array(z.enum(ONBOARDING_STEPS)),
});

export const consentRecord = z.strictObject({
  key: z.enum(CONSENT_PURPOSES),
  granted: z.boolean(),
  decidedAt: instant.nullable(),
});

const priority = z.union([
  z.strictObject({ kind: z.literal('habit'), templateId: habitId }),
  z.strictObject({ kind: z.literal('free'), text: z.string().min(1).max(PRIORITY_MAX_LENGTH) }),
]);

const quickCounts = z.strictObject(
  Object.fromEntries(
    Object.entries(QUICK_COUNT_MAX).map(([action, max]) => [action, z.int().min(0).max(max)]),
  ) as Record<keyof typeof QUICK_COUNT_MAX, z.ZodInt>,
);

export const dayEntryRecord = z.strictObject({
  date: dayKey,
  morning: z
    .strictObject({
      bedtime: time,
      wakeTime: time,
      sleepQuality: scale,
      energy: scale,
      priority: priority.nullable(),
      completedAt: instant,
    })
    .nullable(),
  evening: z
    .strictObject({
      mood: scale,
      stress: scale,
      priorityKept: z.boolean().nullable(),
      victory: z.string().max(VICTORY_MAX_LENGTH).nullable(),
      completedAt: instant,
    })
    .nullable(),
  quick: quickCounts.optional(),
});

export const habitRecord = z.strictObject({
  id: rowId,
  templateId: habitId,
  kind: z.enum(['do', 'reduce']),
  tier: z.enum(['min', 'normal', 'excellent']),
  active: z.union([z.literal(0), z.literal(1)]),
  createdOn: dayKey,
});

export const habitLogRecord = z.strictObject({
  id: rowId,
  habitId,
  date: dayKey,
  level: z.union([z.literal(0), z.enum(['min', 'normal', 'excellent'])]),
});

export const measurementRecord = z.strictObject({
  id: rowId,
  date: dayKey,
  ...Object.fromEntries(
    Object.entries(MEASUREMENT_LIMITS).map(([field, { min, max }]) => [
      field,
      z.number().min(min).max(max).optional(),
    ]),
  ),
});

export const lifeWheelRecord = z.strictObject({
  day: dayKey,
  scores: z.strictObject(
    Object.fromEntries(
      LIFE_DOMAINS.map((domain) => [
        domain,
        z.int().min(LIFE_WHEEL_MIN_SCORE).max(LIFE_WHEEL_MAX_SCORE),
      ]),
    ),
  ),
});
