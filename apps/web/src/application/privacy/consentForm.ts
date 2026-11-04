import {
  CONSENT_PURPOSES,
  consentPrerequisite,
  type ConsentChoices,
  type ConsentPurpose,
} from '../../domain/entities/consent';

/** What the consent screens need, without reaching into the domain logic. */
export const CONSENT_FORM = {
  purposes: CONSENT_PURPOSES,
  prerequisiteOf: (purpose: ConsentPurpose): ConsentPurpose | undefined =>
    consentPrerequisite(purpose),
} as const;

/** The onboarding screen starts with everything off: privacy by default. */
export function noConsentChoices(): ConsentChoices {
  return { ai: false, aiJournal: false, health: false, notifications: false };
}

/** Switching a purpose off also switches off what depends on it, as the domain does. */
export function withChoice(
  choices: ConsentChoices,
  purpose: ConsentPurpose,
  granted: boolean,
): ConsentChoices {
  const dependants = CONSENT_PURPOSES.filter((other) => consentPrerequisite(other) === purpose);
  const next = { ...choices, [purpose]: granted };
  return granted ? next : dependants.reduce((acc, other) => ({ ...acc, [other]: false }), next);
}
