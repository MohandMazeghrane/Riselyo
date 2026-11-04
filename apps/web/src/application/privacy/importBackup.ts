import { BACKUP_MAX_CHARACTERS } from '../../domain/config/backup';
import type { BackupRefusal, BackupRepository } from '../../domain/ports/backupRepository';
import { domainError, type DomainError } from '../../domain/shared/domainError';
import { err, type Result } from '../../domain/shared/result';

export type ImportBackup = (content: string) => Promise<Result<void, DomainError>>;

/** Restores a backup: all current data is replaced, only once the whole file has been checked. */
export function createImportBackup(deps: { readonly backup: BackupRepository }): ImportBackup {
  return async (content) => {
    if (content.length > BACKUP_MAX_CHARACTERS) {
      return err(domainError('invalid_input', 'too_large' satisfies BackupRefusal));
    }
    return deps.backup.restoreSnapshot(content);
  };
}
