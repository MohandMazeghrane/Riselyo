import { describe, expect, it } from 'vitest';
import { err, ok } from './result';

describe('Result', () => {
  it('ok wraps a value', () => {
    const result = ok(42);

    expect(result).toEqual({ ok: true, value: 42 });
  });

  it('err wraps an error', () => {
    const result = err('boom');

    expect(result).toEqual({ ok: false, error: 'boom' });
  });

  it('narrows on the ok flag', () => {
    const result = ok('valeur') as ReturnType<typeof ok<string>> | ReturnType<typeof err<string>>;

    const read = result.ok ? result.value : result.error;

    expect(read).toBe('valeur');
  });
});
