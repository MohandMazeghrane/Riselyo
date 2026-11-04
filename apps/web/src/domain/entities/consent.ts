import { domainError, type DomainError } from '../shared/domainError';
import { err, ok, type Result } from '../shared/result';

/** Each processing the user can accept or refuse separately (CLAUDE.md, section 12). */
export const CONSENT_PURPOSES = ['ai', 'aiJournal', 'health', 'notifications'] as const;

export type ConsentPurpose = (typeof CONSENT_PURPOSES)[number];

export interface ConsentDecision {
  readonly granted: boolean;
  /** When the user last decided; null while they never did. */
  readonly decidedAt: Date | null;
}

export type ConsentSet = Readonly<Record<ConsentPurpose, ConsentDecision>>;

/** Purposes that only make sense while another one is granted. */
const REQUIRES: Partial<Record<ConsentPurpose, ConsentPurpose>> = { aiJournal: 'ai' };

const UNDECIDED: ConsentDecision = { granted: false, decidedAt: null };

export function defaultConsents(): ConsentSet {
  return { ai: UNDECIDED, aiJournal: UNDECIDED, health: UNDECIDED, notifications: UNDECIDED };
}

export function isGranted(consents: ConsentSet, purpose: ConsentPurpose): boolean {
  return consents[purpose].granted;
}

export function grantConsent(
  consents: ConsentSet,
  purpose: ConsentPurpose,
  at: Date,
): Result<ConsentSet, DomainError> {
  const prerequisite = REQUIRES[purpose];
  if (prerequisite !== undefined && !isGranted(consents, prerequisite)) {
    return err(domainError('invalid_input', `${purpose} requires ${prerequisite} to be granted`));
  }
  return ok({ ...consents, [purpose]: { granted: true, decidedAt: at } });
}

export function revokeConsent(consents: ConsentSet, purpose: ConsentPurpose, at: Date): ConsentSet {
  const revoked: ConsentDecision = { granted: false, decidedAt: at };
  const dependants = CONSENT_PURPOSES.filter(
    (candidate) => REQUIRES[candidate] === purpose && isGranted(consents, candidate),
  );
  return dependants.reduce<ConsentSet>((set, dependant) => ({ ...set, [dependant]: revoked }), {
    ...consents,
    [purpose]: revoked,
  });
}

export type ConsentChoices = Readonly<Record<ConsentPurpose, boolean>>;

export interface ConsentChoice {
  readonly purpose: ConsentPurpose;
  readonly granted: boolean;
}

export function decideConsent(
  consents: ConsentSet,
  { purpose, granted }: ConsentChoice,
  at: Date,
): Result<ConsentSet, DomainError> {
  return granted ? grantConsent(consents, purpose, at) : ok(revokeConsent(consents, purpose, at));
}

/**
 * Applies the whole consent screen at once. Prerequisites come first in CONSENT_PURPOSES,
 * so "AI" is granted before "journal sent to the AI" is checked.
 */
export function applyConsentChoices(
  consents: ConsentSet,
  choices: ConsentChoices,
  at: Date,
): Result<ConsentSet, DomainError> {
  let current = consents;
  for (const purpose of CONSENT_PURPOSES) {
    const decided = decideConsent(current, { purpose, granted: choices[purpose] }, at);
    if (!decided.ok) {
      return decided;
    }
    current = decided.value;
  }
  return ok(current);
}

/** The purpose that must be granted first, if any (the journal needs the AI). */
export function consentPrerequisite(purpose: ConsentPurpose): ConsentPurpose | undefined {
  return REQUIRES[purpose];
}
