import { describe, expect, it } from 'vitest';
import { unwrap } from '../../../test/fixtures/unwrap';
import { FIRST_NAME_MAX_LENGTH, WHY_MAX_LENGTH } from '../config/onboarding';
import { parseDayKey } from '../shared/dayKey';
import { markStepCompleted, parseFirstName, parseWhy, startProfile } from './profile';

const DAY_ZERO = unwrap(parseDayKey('2026-11-04'));

describe('startProfile', () => {
  it('starts on day 0 with only the welcome step done', () => {
    expect(startProfile('Sam', DAY_ZERO)).toEqual({
      firstName: 'Sam',
      dayZero: DAY_ZERO,
      why: null,
      rhythm: null,
      completedSteps: ['welcome'],
    });
  });
});

describe('markStepCompleted', () => {
  it('records the step without touching the rest of the profile', () => {
    const profile = markStepCompleted(startProfile('Sam', DAY_ZERO), 'lifeWheel');

    expect(profile.completedSteps).toEqual(['welcome', 'lifeWheel']);
    expect(profile.firstName).toBe('Sam');
  });
});

describe('parseFirstName', () => {
  it('trims and collapses spaces', () => {
    expect(parseFirstName('  Jean   Pierre ')).toEqual({ ok: true, value: 'Jean Pierre' });
  });

  it('is required', () => {
    expect(parseFirstName('   ')).toMatchObject({ ok: false, error: { code: 'invalid_input' } });
  });

  it('accepts the maximum length and rejects one more', () => {
    expect(parseFirstName('a'.repeat(FIRST_NAME_MAX_LENGTH)).ok).toBe(true);
    expect(parseFirstName('a'.repeat(FIRST_NAME_MAX_LENGTH + 1)).ok).toBe(false);
  });
});

describe('parseWhy', () => {
  it('is optional: blank means no answer', () => {
    expect(parseWhy('  ')).toEqual({ ok: true, value: null });
  });

  it('keeps the sentence trimmed', () => {
    expect(parseWhy(' je veux retrouver de l’énergie ')).toEqual({
      ok: true,
      value: 'je veux retrouver de l’énergie',
    });
  });

  it('accepts the maximum length and rejects one more', () => {
    expect(parseWhy('a'.repeat(WHY_MAX_LENGTH)).ok).toBe(true);
    expect(parseWhy('a'.repeat(WHY_MAX_LENGTH + 1))).toMatchObject({ ok: false });
  });
});
