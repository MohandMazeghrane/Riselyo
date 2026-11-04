/** Retention periods (CLAUDE.md, section 12). Data without a period here is kept until erased. */

/** "Vider la tête" journal entries disappear after 24 hours (each entry stores its expiry). */
export const JOURNAL_RETENTION_HOURS = 24;

/** Coach conversations, purged after this many days (adjustable later in the settings). */
export const CONVERSATION_RETENTION_DAYS = 90;

/** AI usage records, kept this many months for the budget. */
export const AI_USAGE_RETENTION_MONTHS = 12;
