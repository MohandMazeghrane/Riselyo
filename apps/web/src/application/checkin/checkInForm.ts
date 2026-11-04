import {
  CHECK_IN_SCALE_MAX,
  CHECK_IN_SCALE_MIN,
  PRIORITY_MAX_LENGTH,
  VICTORY_MAX_LENGTH,
} from '../../domain/config/checkIn';
import type { DailyPriority } from '../../domain/entities/dayEntry';
import type { HabitTemplateId } from '../../domain/entities/habit';
import {
  levelsAvailableFor,
  type HabitLevel,
  type HabitLevelAnswers,
} from '../../domain/entities/habitLog';

/** What the check-in screens need to build their forms, without touching domain logic. */
export const CHECK_IN_FORM = {
  scaleMin: CHECK_IN_SCALE_MIN,
  scaleMax: CHECK_IN_SCALE_MAX,
  priorityMaxLength: PRIORITY_MAX_LENGTH,
  victoryMaxLength: VICTORY_MAX_LENGTH,
} as const;

/** The morning as typed in the form: times are still plain HH:MM strings. */
export interface MorningForm {
  readonly bedtime: string;
  readonly wakeTime: string;
  readonly sleepQuality: number | undefined;
  readonly energy: number | undefined;
  readonly priority: DailyPriority | null;
}

export interface EveningForm {
  readonly mood: number | undefined;
  readonly stress: number | undefined;
  readonly priorityKept: boolean | null;
  readonly victory: string;
  readonly habitLevels: HabitLevelAnswers;
}

export function habitLevelsFor(templateId: HabitTemplateId): HabitLevel[] {
  return levelsAvailableFor(templateId);
}
