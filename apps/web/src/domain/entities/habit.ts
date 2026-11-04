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

export type HabitTemplateId = (typeof HABIT_CATALOGUE)[number]['id'];

export interface Habit {
  readonly templateId: HabitTemplateId;
  readonly kind: HabitKind;
  readonly tier: HabitTier;
  readonly active: boolean;
  readonly createdOn: DayKey;
}

/** Start small: the minimum tier, or "normal" when the habit has no minimum. */
export function startingTier(templateId: HabitTemplateId): HabitTier {
  const template = HABIT_CATALOGUE.find(({ id }) => id === templateId);
  return template?.hasMinimum === false ? 'normal' : 'min';
}

export function chooseFirstGoals(
  templateIds: readonly HabitTemplateId[],
  day: DayKey,
): Result<Habit[], DomainError> {
  const unique = [...new Set(templateIds)];
  if (unique.length === 0 || unique.length > MAX_FIRST_GOALS) {
    return err(
      domainError('invalid_input', `choose between 1 and ${String(MAX_FIRST_GOALS)} goals`),
    );
  }
  return ok(
    unique.map((templateId) => ({
      templateId,
      kind: 'do',
      tier: startingTier(templateId),
      active: true,
      createdOn: day,
    })),
  );
}
