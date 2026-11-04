import {
  QUICK_ACTION_STEPS,
  QUICK_COUNT_MAX,
  WALK_MINUTES_PER_TIER,
  WATER_GLASSES_PER_TIER,
} from '../config/habits';
import { domainError, type DomainError } from '../shared/domainError';
import { err, ok, type Result } from '../shared/result';
import type { Habit, HabitTier } from './habit';
import type { HabitLevelAnswers } from './habitLog';

/** The quick buttons of the home screen (docs/cahier-des-charges.md, section 3). */
export const QUICK_ACTIONS = [
  'waterGlasses',
  'walkMinutes',
  'workouts',
  'healthyMeals',
  'cravingsResisted',
] as const;

export type QuickAction = (typeof QUICK_ACTIONS)[number];

/** What the quick buttons added up to during one day. */
export type QuickCounts = Readonly<Record<QuickAction, number>>;

export type QuickAdjustment = 'add' | 'remove';

export function emptyQuickCounts(): QuickCounts {
  return {
    waterGlasses: 0,
    walkMinutes: 0,
    workouts: 0,
    healthyMeals: 0,
    cravingsResisted: 0,
  };
}

/** One tap adds a step; "remove" undoes a tap. Never below zero, never past the limit. */
export function adjustQuickCount(
  counts: QuickCounts,
  action: QuickAction,
  adjustment: QuickAdjustment,
): Result<QuickCounts, DomainError> {
  const step = QUICK_ACTION_STEPS[action];
  const value = counts[action] + (adjustment === 'add' ? step : -step);
  if (!isValidCount(action, value)) {
    return err(domainError('invalid_input', `${action} must stay between 0 and its limit`));
  }
  return ok({ ...counts, [action]: value });
}

/** Rebuilds counters from untrusted stored values: anything invalid counts as zero. */
export function quickCountsFrom(stored: unknown): QuickCounts {
  const values: Partial<Record<QuickAction, unknown>> =
    typeof stored === 'object' && stored !== null ? stored : {};
  const counts = emptyQuickCounts();
  return Object.fromEntries(
    QUICK_ACTIONS.map((action) => {
      const value = values[action];
      return [action, isValidCount(action, value) ? value : counts[action]];
    }),
  ) as Record<QuickAction, number>;
}

/** Tiers reached by the water and walk counters, for active habits only. Never stored as such. */
export function suggestedHabitLevels(
  counts: QuickCounts,
  activeHabits: readonly Habit[],
): HabitLevelAnswers {
  const suggestions: HabitLevelAnswers = {};
  const isActive = (id: string): boolean => activeHabits.some((habit) => habit.templateId === id);
  const water = tierReached(counts.waterGlasses, WATER_GLASSES_PER_TIER);
  const walk = tierReached(counts.walkMinutes, WALK_MINUTES_PER_TIER);
  if (water !== null && isActive('water')) {
    suggestions.water = water;
  }
  if (walk !== null && isActive('walk')) {
    suggestions.walk = walk;
  }
  return suggestions;
}

function tierReached(
  value: number,
  thresholds: Readonly<Record<HabitTier, number>>,
): HabitTier | null {
  const reached = (['excellent', 'normal', 'min'] as const).find(
    (tier) => value >= thresholds[tier],
  );
  return reached ?? null;
}

function isValidCount(action: QuickAction, value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= QUICK_COUNT_MAX[action]
  );
}
