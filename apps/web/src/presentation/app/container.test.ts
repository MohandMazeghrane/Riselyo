import { describe, expect, it } from 'vitest';
import { createContainer } from './container';

describe('createContainer', () => {
  it('wires use cases to real adapters', () => {
    const container = createContainer();

    expect(container.getCurrentDay()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Object.keys(container.onboarding)).toHaveLength(8);
  });
});
