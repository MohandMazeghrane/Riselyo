/** Business constants of the habits and quick buttons (docs/cahier-des-charges.md, sections 3 and 4). */

/** A new "do" habit is offered only when the current ones hold at this rate or more. */
export const NEW_HABIT_MIN_ADHERENCE = 0.7;

/** Adherence is measured over the last completed days, today excluded. */
export const NEW_HABIT_ADHERENCE_WINDOW_DAYS = 7;

/** Fewer answered days than this is not enough to judge adherence. */
export const NEW_HABIT_MIN_ANSWERED_DAYS = 3;

/** What one tap on a quick button adds to the day. */
export const QUICK_ACTION_STEPS = {
  waterGlasses: 1,
  walkMinutes: 10,
  workouts: 1,
  healthyMeals: 1,
  cravingsResisted: 1,
} as const;

/** A day's counters stay plausible: they catch repeated taps, they are not targets. */
export const QUICK_COUNT_MAX = {
  waterGlasses: 30,
  walkMinutes: 600,
  workouts: 5,
  healthyMeals: 6,
  cravingsResisted: 50,
} as const;

/** Tier reached by the day's counters, as in the habit table of the specification. */
export const WATER_GLASSES_PER_TIER = { min: 4, normal: 6, excellent: 8 } as const;
export const WALK_MINUTES_PER_TIER = { min: 10, normal: 30, excellent: 60 } as const;
