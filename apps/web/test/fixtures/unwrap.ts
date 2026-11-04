import type { Result } from '../../src/domain/shared/result';

/** Test helper: the value of an expected success, or a failing test. */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (!result.ok) {
    throw new Error(`expected ok, got error ${JSON.stringify(result.error)}`);
  }
  return result.value;
}
