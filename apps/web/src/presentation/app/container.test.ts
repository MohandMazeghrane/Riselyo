import { describe, expect, it } from 'vitest';
import { parseDayKey } from '../../domain/shared/dayKey';
import { createContainer } from './container';

describe('createContainer', () => {
  it('wires use cases to real adapters', () => {
    const container = createContainer();

    expect(parseDayKey(container.getCurrentDay()).ok).toBe(true);
  });
});
