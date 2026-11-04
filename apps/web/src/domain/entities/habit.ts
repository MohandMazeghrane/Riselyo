import { MAX_FIRST_GOALS } from '../config/onboarding';
import type { DayKey } from '../shared/dayKey';
import { domainError, type DomainError } from '../shared/domainError';
import { err, ok, type Result } from '../shared/result';

export type HabitTier = 'min' | 'normal' | 'excellent';

export type HabitKind = 'do' | 'reduce';

/** Habits to build (docs/cahier-des-charges.md, section 4). Labels live in presentation/content. */
export const HABIT_CATALOGUE = [
  { id: 'walk', hasMinimum: true },
  { id: 'workout', hasMinimum: true },
  { id: 'regularBedtime', hasMinimum: true },
  { id: 'water', hasMinimum: true },
  { id: 'noScreenInBed', hasMinimum: true },
  { id: 'breathing', hasMinimum: true },
  { id: 'tidy', hasMinimum: true },
  { id: 'read', hasMinimum: true },
  { id: 'socialContact', hasMinimum: true },
  { id: 'noAlcohol', hasMinimum: false },
] as const;

/** Habits to reduce: a "days without" counter, no tiers (same section). */
export const REDUCE_HABIT_CATALOGUE = [
  { id: 'snacking' },
  { id: 'alcohol' },
  { id: 'eveningSocialMedia' },
  { id: 'tobacco' },
] as const;

export type DoHabitId = (typeof HABIT_CATALOGUE)[number]['id'];
export type ReduceHabitId = (typeof REDUCE_HABIT_CATALOGUE)[number]['id'];
export type HabitTemplateId = DoHabitId | ReduceHabitId;

export const ALL_HABIT_IDS: readonly HabitTemplateId[] = [
  ...HABIT_CATALOGUE.map(({ id }) => id),
  ...REDUCE_HABIT_CATALOGUE.map(({ id }) => id),
];

/** A habit to reduce is only ever logged at this tier, meaning "a day without". */
export const REDUCE_HABIT_TIER: HabitTier = 'normal';

export interface Habit {
  readonly templateId: HabitTemplateId;
  readonly kind: HabitKind;
  readonly tier: HabitTier;
  readonly active: boolean;
  readonly createdOn: DayKey;
}

export function kindOf(templateId: HabitTemplateId): HabitKind {
  return REDUCE_HABIT_CATALOGUE.some(({ id }) => id === templateId) ? 'reduce' : 'do';
}

export function hasMinimumTier(templateId: HabitTemplateId): boolean {
  return HABIT_CATALOGUE.some(({ id, hasMinimum }) => id === templateId && hasMinimum);
}

/** Start small: the minimum tier, or "normal" when the habit has no minimum. */
export function startingTier(templateId: HabitTemplateId): HabitTier {
  return hasMinimumTier(templateId) ? 'min' : 'normal';
}

export function createHabit(templateId: HabitTemplateId, day: DayKey): Habit {
  return {
    templateId,
    kind: kindOf(templateId),
    tier: startingTier(templateId),
    active: true,
    createdOn: day,
  };
}

/** The tier aimed at; habits to reduce have none, and "no alcohol" has no minimum. */
export function changeTarget(habit: Habit, tier: HabitTier): Result<Habit, DomainError> {
  if (habit.kind === 'reduce') {
    return err(domainError('invalid_input', 'a habit to reduce has no tier'));
  }
  if (tier === 'min' && !hasMinimumTier(habit.templateId)) {
    return err(domainError('invalid_input', `${habit.templateId} has no minimum tier`));
  }
  return ok({ ...habit, tier });
}

export function chooseFirstGoals(
  templateIds: readonly DoHabitId[],
  day: DayKey,
): Result<Habit[], DomainError> {
  const unique = [...new Set(templateIds)];
  if (unique.length === 0 || unique.length > MAX_FIRST_GOALS) {
    return err(
      domainError('invalid_input', `choose between 1 and ${String(MAX_FIRST_GOALS)} goals`),
    );
  }
  return ok(unique.map((templateId) => createHabit(templateId, day)));
}
