import { describe, expect, it } from 'vitest';
import {
  CONSENT_PURPOSES,
  defaultConsents,
  grantConsent,
  isGranted,
  revokeConsent,
  type ConsentSet,
} from './consent';

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
