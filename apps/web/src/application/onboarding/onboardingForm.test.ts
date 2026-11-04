import { describe, expect, it } from 'vitest';
import {
  defaultRhythmForm,
  ONBOARDING_FORM,
  sleepWarning,
  startingTierOf,
  suggestSleepMinutes,
} from './onboardingForm';

describe('onboarding form helpers', () => {
  it('exposes the lists the screens are built from', () => {
    expect(ONBOARDING_FORM.lifeDomains).toHaveLength(8);
    expect(ONBOARDING_FORM.habitTemplateIds).toHaveLength(10);
    expect(ONBOARDING_FORM.weekdays).toHaveLength(7);
    expect(ONBOARDING_FORM.maxFirstGoals).toBe(3);
  });

  it('pre-fills the rhythm with the specification defaults', () => {
    expect(defaultRhythmForm()).toMatchObject({ wakeTime: '07:00', sleepTargetMinutes: 450 });
  });

  it('suggests a sleep duration once both times are valid', () => {
    expect(suggestSleepMinutes('23:00', '06:30')).toBe(450);
    expect(suggestSleepMinutes('23:', '06:30')).toBeNull();
  });

  it('relays the gentle sleep warning and the starting tier', () => {
    expect(sleepWarning(200)).toBe('too_short');
    expect(sleepWarning(450)).toBeNull();
    expect(startingTierOf('noAlcohol')).toBe('normal');
  });
});
