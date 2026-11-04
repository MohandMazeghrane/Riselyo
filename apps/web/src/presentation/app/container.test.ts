import { describe, expect, it } from 'vitest';
import { createContainer } from './container';

describe('createContainer', () => {
  it('wires use cases to real adapters', () => {
    const container = createContainer();

    expect(container.getCurrentDay()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(Object.keys(container.onboarding)).toHaveLength(9);
    expect(Object.keys(container.privacy)).toHaveLength(5);
    expect(Object.keys(container.checkIn)).toHaveLength(3);
    expect(Object.keys(container.habits)).toHaveLength(7);
    expect(Object.keys(container.safety)).toHaveLength(1);
  });
});
