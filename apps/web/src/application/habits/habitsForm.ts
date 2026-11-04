import {
  NEW_HABIT_MIN_ADHERENCE,
  NEW_HABIT_MIN_ANSWERED_DAYS,
  QUICK_ACTION_STEPS,
} from '../../domain/config/habits';
import {
  HABIT_CATALOGUE,
  REDUCE_HABIT_CATALOGUE,
  type HabitTemplateId,
  type HabitTier,
} from '../../domain/entities/habit';
import { levelsAvailableFor, nextLevel, type HabitLevel } from '../../domain/entities/habitLog';
import { QUICK_ACTIONS } from '../../domain/entities/quickCounts';

const PERCENT = 100;

/** A ratio from 0 to 1 shown as a whole percentage. */
export function toPercent(ratio: number): number {
  return Math.round(ratio * PERCENT);
}

/** What the habit screens need, without touching domain logic. */
export const HABITS_FORM = {
  toBuild: HABIT_CATALOGUE.map(({ id }) => id),
  toReduce: REDUCE_HABIT_CATALOGUE.map(({ id }) => id),
  quickActions: QUICK_ACTIONS,
  quickSteps: QUICK_ACTION_STEPS,
  minAdherencePercent: toPercent(NEW_HABIT_MIN_ADHERENCE),
  minAnsweredDays: NEW_HABIT_MIN_ANSWERED_DAYS,
} as const;

/** Level after one tap on a habit of the home screen. */
export function levelAfterTap(
  templateId: HabitTemplateId,
  current: HabitLevel | undefined,
): HabitLevel {
  return nextLevel(templateId, current);
}

/** Tiers a habit to build can aim at ("no alcohol" has no minimum). */
export function targetTiersFor(templateId: HabitTemplateId): HabitTier[] {
  return levelsAvailableFor(templateId).filter((level): level is HabitTier => level !== 'none');
}
