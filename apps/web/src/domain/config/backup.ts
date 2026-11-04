/** Business constants of the export and import (CLAUDE.md, section 12). */

/** Version of the backup document itself (not of the database schema). */
export const BACKUP_FORMAT_VERSION = 1;

/** Years of daily entries weigh far less: anything bigger is not a Riselyo backup. */
export const BACKUP_MAX_CHARACTERS = 10_000_000;

/** The earliest day an export looks at. */
export const EXPORT_FIRST_DAY = '2000-01-01';
