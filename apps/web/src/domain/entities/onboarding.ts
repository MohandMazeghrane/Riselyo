/** Screens A0 to A6, in the order they are shown. */
export const ONBOARDING_STEPS = [
  'welcome',
  'lifeWheel',
  'measurements',
  'rhythm',
  'why',
  'goals',
  'consents',
] as const;

export type OnboardingStep = (typeof ONBOARDING_STEPS)[number];

/** Where to resume: the first step not completed yet. */
export function nextOnboardingStep(completed: readonly OnboardingStep[]): OnboardingStep | 'done' {
  return ONBOARDING_STEPS.find((step) => !completed.includes(step)) ?? 'done';
}

export function completeStep(
  completed: readonly OnboardingStep[],
  step: OnboardingStep,
): OnboardingStep[] {
  return ONBOARDING_STEPS.filter(
    (candidate) => candidate === step || completed.includes(candidate),
  );
}
