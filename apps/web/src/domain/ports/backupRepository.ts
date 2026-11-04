import type { DomainError } from '../shared/domainError';
import type { Result } from '../shared/result';

/** Why a backup file was refused; reported as the detail of an `invalid_input` error. */
export const BACKUP_REFUSALS = [
  'too_large',
  'not_json',
  'not_a_backup',
  'newer_version',
  'invalid_data',
] as const;

export type BackupRefusal = (typeof BACKUP_REFUSALS)[number];

/** Whole-database backup, in the stored format (CLAUDE.md, section 12: access and portability). */
export interface BackupRepository {
  /** Every stored record as one JSON document. */
  exportSnapshot(exportedAt: Date): Promise<Result<string, DomainError>>;
  /** Checks the whole document first, then replaces all data at once; nothing changes if refused. */
  restoreSnapshot(content: string): Promise<Result<void, DomainError>>;
}
