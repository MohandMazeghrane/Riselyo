import { FIRST_NAME_MAX_LENGTH, WHY_MAX_LENGTH } from '../config/onboarding';
import type { DayKey } from '../shared/dayKey';
import { domainError, type DomainError } from '../shared/domainError';
import { err, ok, type Result } from '../shared/result';
import { completeStep, type OnboardingStep } from './onboarding';
import type { Rhythm } from './rhythm';

/** The single user. Only the first name is kept: never a family name or an e-mail. */
export interface Profile {
  readonly firstName: string;
  /** Day the onboarding started: everything is compared to this "day 0". */
  readonly dayZero: DayKey;
  readonly why: string | null;
  readonly rhythm: Rhythm | null;
  readonly completedSteps: readonly OnboardingStep[];
}

/** Created when the welcome screen is validated: that day becomes day 0. */
export function startProfile(firstName: string, dayZero: DayKey): Profile {
  return { firstName, dayZero, why: null, rhythm: null, completedSteps: ['welcome'] };
}

export function markStepCompleted(profile: Profile, step: OnboardingStep): Profile {
  return { ...profile, completedSteps: completeStep(profile.completedSteps, step) };
}

export function parseFirstName(input: string): Result<string, DomainError> {
  const firstName = input.trim().replace(/\s+/g, ' ');
  if (firstName.length === 0) {
    return err(domainError('invalid_input', 'first name is required'));
  }
  if (firstName.length > FIRST_NAME_MAX_LENGTH) {
    return err(domainError('invalid_input', 'first name is too long'));
  }
  return ok(firstName);
}

/** The optional "why": blank means the user chose not to answer. */
export function parseWhy(input: string): Result<string | null, DomainError> {
  const why = input.trim();
  if (why.length > WHY_MAX_LENGTH) {
    return err(domainError('invalid_input', 'why is too long'));
  }
  return ok(why.length === 0 ? null : why);
}
