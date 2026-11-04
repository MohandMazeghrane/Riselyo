import { LIFE_WHEEL_MAX_SCORE, LIFE_WHEEL_MIN_SCORE } from '../config/onboarding';
import type { DayKey } from '../shared/dayKey';
import { domainError, type DomainError } from '../shared/domainError';
import { err, ok, type Result } from '../shared/result';

export const LIFE_DOMAINS = [
  'energy',
  'mood',
  'sleep',
  'fitness',
  'nutrition',
  'selfConfidence',
  'social',
  'organisation',
] as const;

export type LifeDomain = (typeof LIFE_DOMAINS)[number];

/** A dated self-assessment on 8 domains; day 0 is redone every 30 days for comparison. */
export interface LifeWheel {
  readonly day: DayKey;
  readonly scores: Readonly<Record<LifeDomain, number>>;
}

export function createLifeWheel(
  day: DayKey,
  scores: Partial<Record<LifeDomain, number>>,
): Result<LifeWheel, DomainError> {
  const complete: Partial<Record<LifeDomain, number>> = {};
  for (const domain of LIFE_DOMAINS) {
    const score = scores[domain];
    if (score === undefined || !isValidScore(score)) {
      return err(domainError('invalid_input', `${domain} needs a whole score from 1 to 10`));
    }
    complete[domain] = score;
  }
  return ok({ day, scores: complete as Record<LifeDomain, number> });
}

function isValidScore(score: number): boolean {
  return Number.isInteger(score) && score >= LIFE_WHEEL_MIN_SCORE && score <= LIFE_WHEEL_MAX_SCORE;
}
