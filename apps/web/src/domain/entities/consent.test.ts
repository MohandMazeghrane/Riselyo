import { describe, expect, it } from 'vitest';
import {
  applyConsentChoices,
  consentPrerequisite,
  CONSENT_PURPOSES,
  decideConsent,
  defaultConsents,
  grantConsent,
  isGranted,
  revokeConsent,
  type ConsentSet,
} from './consent';

const ALL_REFUSED = { ai: false, aiJournal: false, health: false, notifications: false };

const MORNING = new Date('2026-11-04T08:00:00Z');
const EVENING = new Date('2026-11-04T20:00:00Z');

function grantedOrFail(set: ConsentSet, purpose: (typeof CONSENT_PURPOSES)[number]): ConsentSet {
  const result = grantConsent(set, purpose, MORNING);
  if (!result.ok) {
    throw new Error(`could not grant ${purpose}`);
  }
  return result.value;
}

describe('defaultConsents', () => {
  it('denies every purpose until the user decides (privacy by default)', () => {
    const consents = defaultConsents();

    for (const purpose of CONSENT_PURPOSES) {
      expect(consents[purpose]).toEqual({ granted: false, decidedAt: null });
    }
  });
});

describe('grantConsent', () => {
  it('grants a purpose and records when', () => {
    const consents = grantedOrFail(defaultConsents(), 'health');

    expect(consents.health).toEqual({ granted: true, decidedAt: MORNING });
    expect(isGranted(consents, 'health')).toBe(true);
  });

  it('does not modify the original set', () => {
    const original = defaultConsents();

    grantedOrFail(original, 'notifications');

    expect(original.notifications.granted).toBe(false);
  });

  it('refuses to send the journal to the AI without the AI consent', () => {
    const result = grantConsent(defaultConsents(), 'aiJournal', MORNING);

    expect(result).toMatchObject({ ok: false, error: { code: 'invalid_input' } });
  });

  it('allows the journal once the AI consent is granted', () => {
    const consents = grantedOrFail(grantedOrFail(defaultConsents(), 'ai'), 'aiJournal');

    expect(isGranted(consents, 'aiJournal')).toBe(true);
  });
});

describe('decideConsent', () => {
  it('grants or revokes depending on the choice', () => {
    const granted = decideConsent(defaultConsents(), { purpose: 'health', granted: true }, MORNING);
    const refused = decideConsent(
      defaultConsents(),
      { purpose: 'health', granted: false },
      MORNING,
    );

    expect(granted).toMatchObject({ ok: true, value: { health: { granted: true } } });
    expect(refused).toMatchObject({
      ok: true,
      value: { health: { granted: false, decidedAt: MORNING } },
    });
  });

  it('keeps the prerequisite rule', () => {
    expect(
      decideConsent(defaultConsents(), { purpose: 'aiJournal', granted: true }, MORNING).ok,
    ).toBe(false);
  });
});

describe('applyConsentChoices', () => {
  it('dates every decision, refusals included', () => {
    const result = applyConsentChoices(defaultConsents(), ALL_REFUSED, MORNING);

    for (const purpose of CONSENT_PURPOSES) {
      expect(result).toMatchObject({
        ok: true,
        value: { [purpose]: { granted: false, decidedAt: MORNING } },
      });
    }
  });

  it('accepts the journal in the same screen as the AI', () => {
    const result = applyConsentChoices(
      defaultConsents(),
      { ...ALL_REFUSED, ai: true, aiJournal: true },
      MORNING,
    );

    expect(result).toMatchObject({
      ok: true,
      value: { ai: { granted: true }, aiJournal: { granted: true } },
    });
  });

  it('refuses the journal without the AI', () => {
    const result = applyConsentChoices(
      defaultConsents(),
      { ...ALL_REFUSED, aiJournal: true },
      MORNING,
    );

    expect(result).toMatchObject({ ok: false, error: { code: 'invalid_input' } });
  });
});

describe('revokeConsent', () => {
  it('revokes a purpose and records when', () => {
    const consents = revokeConsent(grantedOrFail(defaultConsents(), 'health'), 'health', EVENING);

    expect(consents.health).toEqual({ granted: false, decidedAt: EVENING });
  });

  it('revoking the AI also stops sending the journal to it', () => {
    const withJournal = grantedOrFail(grantedOrFail(defaultConsents(), 'ai'), 'aiJournal');

    const consents = revokeConsent(withJournal, 'ai', EVENING);

    expect(consents.ai).toEqual({ granted: false, decidedAt: EVENING });
    expect(consents.aiJournal).toEqual({ granted: false, decidedAt: EVENING });
  });

  it('leaves the other purposes untouched', () => {
    const before = grantedOrFail(grantedOrFail(defaultConsents(), 'ai'), 'notifications');

    const consents = revokeConsent(before, 'ai', EVENING);

    expect(consents.notifications).toEqual({ granted: true, decidedAt: MORNING });
  });
});

describe('consentPrerequisite', () => {
  it('ties the journal to the AI and nothing else', () => {
    expect(consentPrerequisite('aiJournal')).toBe('ai');
    expect(consentPrerequisite('health')).toBeUndefined();
  });
});
