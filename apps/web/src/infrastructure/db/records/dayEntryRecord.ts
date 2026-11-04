import {
  createEveningCheckIn,
  createMorningCheckIn,
  type DailyPriority,
  type DayEntry,
  type EveningCheckIn,
  type MorningCheckIn,
} from '../../../domain/entities/dayEntry';
import { ALL_HABIT_IDS, type HabitTemplateId } from '../../../domain/entities/habit';
import { quickCountsFrom, type QuickCounts } from '../../../domain/entities/quickCounts';
import { parseDayKey } from '../../../domain/shared/dayKey';
import { parseTimeOfDay } from '../../../domain/shared/timeOfDay';
import { asFields, textOrEmpty } from '../storageResult';

/** Stored shape: dates as ISO strings, the day under `date` (the table's key). */
export interface DayEntryRecord {
  readonly date: string;
  readonly morning: (Omit<MorningCheckIn, 'completedAt'> & { readonly completedAt: string }) | null;
  readonly evening: (Omit<EveningCheckIn, 'completedAt'> & { readonly completedAt: string }) | null;
  /** Missing in entries saved before task 1.9: read as zero. */
  readonly quick?: QuickCounts;
}

export function toDayEntryRecord({ day, morning, evening, quick }: DayEntry): DayEntryRecord {
  return {
    date: day,
    quick,
    morning:
      morning === null ? null : { ...morning, completedAt: morning.completedAt.toISOString() },
    evening:
      evening === null ? null : { ...evening, completedAt: evening.completedAt.toISOString() },
  };
}

/** Rebuilds the entry through the domain rules; null when the row cannot be trusted. */
export function fromDayEntryRecord(value: unknown): DayEntry | null {
  const fields = asFields<keyof DayEntryRecord>(value);
  const day = parseDayKey(textOrEmpty(fields?.date));
  if (fields === null || !day.ok) {
    return null;
  }
  const morning = fields.morning === null ? null : readMorning(fields.morning);
  const evening = fields.evening === null ? null : readEvening(fields.evening, morning ?? null);
  if (morning === undefined || evening === undefined) {
    return null;
  }
  return { day: day.value, morning, evening, quick: quickCountsFrom(fields.quick) };
}

function readMorning(value: unknown): MorningCheckIn | undefined {
  const fields = asFields<keyof MorningCheckIn>(value);
  const bedtime = parseTimeOfDay(textOrEmpty(fields?.bedtime));
  const wakeTime = parseTimeOfDay(textOrEmpty(fields?.wakeTime));
  const at = readDate(fields?.completedAt);
  if (fields === null || !bedtime.ok || !wakeTime.ok || at === null) {
    return undefined;
  }
  const morning = createMorningCheckIn(
    {
      bedtime: bedtime.value,
      wakeTime: wakeTime.value,
      sleepQuality: numberOrUndefined(fields.sleepQuality),
      energy: numberOrUndefined(fields.energy),
      priority: readPriority(fields.priority),
    },
    at,
  );
  return morning.ok ? morning.value : undefined;
}

function readEvening(value: unknown, morning: MorningCheckIn | null): EveningCheckIn | undefined {
  const fields = asFields<keyof EveningCheckIn>(value);
  const at = readDate(fields?.completedAt);
  if (fields === null || at === null) {
    return undefined;
  }
  const priorityKept = typeof fields.priorityKept === 'boolean' ? fields.priorityKept : null;
  const input = {
    mood: numberOrUndefined(fields.mood),
    stress: numberOrUndefined(fields.stress),
    priorityKept,
    victory: textOrEmpty(fields.victory),
  };
  const evening = createEveningCheckIn(input, morning, at);
  return evening.ok ? evening.value : undefined;
}

function isTemplateId(value: unknown): value is HabitTemplateId {
  return ALL_HABIT_IDS.some((id) => id === value);
}

function readPriority(value: unknown): DailyPriority | null {
  const fields = asFields<'kind' | 'templateId' | 'text'>(value);
  if (fields?.kind === 'habit' && isTemplateId(fields.templateId)) {
    return { kind: 'habit', templateId: fields.templateId };
  }
  return fields?.kind === 'free' ? { kind: 'free', text: textOrEmpty(fields.text) } : null;
}

function readDate(value: unknown): Date | null {
  const date = new Date(textOrEmpty(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function numberOrUndefined(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}
