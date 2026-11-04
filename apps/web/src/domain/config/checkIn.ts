/** Business constants of the daily check-ins (docs/cahier-des-charges.md, section 3). */

/** Sleep quality, energy, mood and stress are all rated on the same 1-to-5 scale. */
export const CHECK_IN_SCALE_MIN = 1;
export const CHECK_IN_SCALE_MAX = 5;

/** One short action: the priority of the day must fit on a line. */
export const PRIORITY_MAX_LENGTH = 80;

/** The evening victory is optional and fits on one line. */
export const VICTORY_MAX_LENGTH = 120;
