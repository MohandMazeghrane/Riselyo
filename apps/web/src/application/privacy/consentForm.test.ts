import { describe, expect, it } from 'vitest';
import { CONSENT_FORM, noConsentChoices, withChoice } from './consentForm';

describe('consent form helpers', () => {
  it('starts with everything off', () => {
    expect(Object.values(noConsentChoices()).some(Boolean)).toBe(false);
  });

  it('switching the AI off also switches the journal off', () => {
    const both = withChoice(withChoice(noConsentChoices(), 'ai', true), 'aiJournal', true);

    expect(withChoice(both, 'ai', false)).toMatchObject({ ai: false, aiJournal: false });
  });

  it('leaves the other choices alone', () => {
    const choices = withChoice(withChoice(noConsentChoices(), 'health', true), 'ai', false);

    expect(choices.health).toBe(true);
  });

  it('exposes the purposes and their prerequisite', () => {
    expect(CONSENT_FORM.purposes).toHaveLength(4);
    expect(CONSENT_FORM.prerequisiteOf('aiJournal')).toBe('ai');
  });
});
