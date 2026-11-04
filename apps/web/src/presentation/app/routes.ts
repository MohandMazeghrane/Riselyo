import type { OnboardingStep } from '../../domain/entities/onboarding';

/** French paths; never any personal data in a URL (CLAUDE.md, section 11). */
export const ROUTES = {
  today: '/',
  help: '/aide',
  welcome: '/demarrage',
  lifeWheel: '/demarrage/roue-de-vie',
  lifeWheelResult: '/demarrage/point-de-depart',
  measurements: '/demarrage/mesures',
  rhythm: '/demarrage/rythme',
  why: '/demarrage/pourquoi',
  goals: '/demarrage/objectifs',
} as const;

export const STEP_ROUTES: Readonly<Record<OnboardingStep, string>> = {
  welcome: ROUTES.welcome,
  lifeWheel: ROUTES.lifeWheel,
  measurements: ROUTES.measurements,
  rhythm: ROUTES.rhythm,
  why: ROUTES.why,
  goals: ROUTES.goals,
};

export const ONBOARDING_SCREEN_COUNT = 6;
