/** Business constants of the onboarding, part A (docs/cahier-des-charges.md, section 2). */

export const FIRST_NAME_MAX_LENGTH = 40;
export const WHY_MAX_LENGTH = 200;

export const LIFE_WHEEL_MIN_SCORE = 1;
export const LIFE_WHEEL_MAX_SCORE = 10;

export const MAX_FIRST_GOALS = 3;

export const DEFAULT_WAKE_TIME = '07:00';
export const DEFAULT_BEDTIME = '23:30';
export const DEFAULT_EVENING_CHECK_IN_TIME = '21:30';

/** Below or above these sleep targets, a gentle (never blocking) warning is shown. */
export const SLEEP_ALERT_MIN_MINUTES = 5 * 60;
export const SLEEP_ALERT_MAX_MINUTES = 11 * 60;

/** Plausibility limits: they catch typing mistakes, they are not health targets. */
export const MEASUREMENT_LIMITS = {
  weightKg: { min: 30, max: 300, wholeNumber: false },
  waistCm: { min: 40, max: 200, wholeNumber: false },
  pushUps: { min: 0, max: 500, wholeNumber: true },
  plankSeconds: { min: 0, max: 3600, wholeNumber: true },
  brisk1kmSeconds: { min: 3 * 60, max: 30 * 60, wholeNumber: true },
} as const;
