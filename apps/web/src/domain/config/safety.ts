/** Business constants of the safety net (CLAUDE.md, section 10). */

/** A single-word keyword this long or longer still matches with one typo ("sucide"). */
export const DISTRESS_TYPO_MIN_KEYWORD_LENGTH = 7;
export const DISTRESS_TYPO_MAX_DISTANCE = 1;

/** The caring card looks at the last days, today included. */
export const WELLBEING_WINDOW_DAYS = 7;

/** Low mood: every answered evening at or below this mood… */
export const LOW_MOOD_MAX = 2;
/** …with at least this many answered evenings, so that a single bad day never triggers it. */
export const LOW_MOOD_MIN_ANSWERED_EVENINGS = 4;

/** High stress: at least this many evenings at the top of the scale. */
export const HIGH_STRESS_LEVEL = 5;
export const HIGH_STRESS_MIN_EVENINGS = 3;
