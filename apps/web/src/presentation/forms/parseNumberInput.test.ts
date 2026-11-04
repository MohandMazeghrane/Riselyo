import { describe, expect, it } from 'vitest';
import { parseNumberInput } from './parseNumberInput';

describe('parseNumberInput', () => {
  it('reads a French decimal comma', () => {
    expect(parseNumberInput(' 78,5 ')).toBe(78.5);
  });

  it('treats an empty field as not given', () => {
    expect(parseNumberInput('  ')).toBeUndefined();
  });

  it('turns unreadable text into NaN so it gets rejected', () => {
    expect(parseNumberInput('abc')).toBeNaN();
  });
});
