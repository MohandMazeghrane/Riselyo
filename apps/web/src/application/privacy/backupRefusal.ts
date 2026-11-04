import { BACKUP_REFUSALS, type BackupRefusal } from '../../domain/ports/backupRepository';
import type { DomainError } from '../../domain/shared/domainError';

/** Why an import was refused, or null when the failure is not about the file itself. */
export function backupRefusalOf(error: DomainError): BackupRefusal | null {
  if (error.code !== 'invalid_input') {
    return null;
  }
  return BACKUP_REFUSALS.find((refusal) => refusal === error.detail) ?? null;
}
