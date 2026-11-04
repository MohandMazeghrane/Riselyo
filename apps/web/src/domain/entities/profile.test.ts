import { describe, expect, it } from 'vitest';
import { FIRST_NAME_MAX_LENGTH, WHY_MAX_LENGTH } from '../config/onboarding';
import { parseFirstName, parseWhy } from './profile';

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
