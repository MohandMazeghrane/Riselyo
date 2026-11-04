import { describe, expect, it } from 'vitest';
import { completeStep, nextOnboardingStep, ONBOARDING_STEPS } from './onboarding';

describe('nextOnboardingStep', () => {
  it('starts with the welcome screen', () => {
    expect(nextOnboardingStep([])).toBe('welcome');
  });

  it('resumes at the first step not completed yet', () => {
    expect(nextOnboardingStep(['welcome', 'lifeWheel'])).toBe('measurements');
  });

  it('is done once every step is completed', () => {
    expect(nextOnboardingStep(ONBOARDING_STEPS)).toBe('done');
  });
});

describe('completeStep', () => {
  it('adds the step in the specification order', () => {
    expect(completeStep(['welcome', 'rhythm'], 'lifeWheel')).toEqual([
      'welcome',
      'lifeWheel',
      'rhythm',
    ]);
  });

  it('does not add a step twice', () => {
    expect(completeStep(['welcome'], 'welcome')).toEqual(['welcome']);
  });
});
