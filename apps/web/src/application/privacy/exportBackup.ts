import type { BackupRepository } from '../../domain/ports/backupRepository';
import type { Clock } from '../../domain/ports/clock';
import { dayKeyOf } from '../../domain/shared/dayKey';
import type { DomainError } from '../../domain/shared/domainError';
import { ok, type Result } from '../../domain/shared/result';
import type { DownloadFile } from './downloadFile';

export type ExportBackup = () => Promise<Result<DownloadFile, DomainError>>;

/** Profile → my data: everything stored, as one JSON file that can be imported again. */
export function createExportBackup(deps: {
  readonly clock: Clock;
  readonly backup: BackupRepository;
}): ExportBackup {
  return async () => {
    const content = await deps.backup.exportSnapshot(deps.clock.now());
    if (!content.ok) {
      return content;
    }
    const day = dayKeyOf(deps.clock.localNow());
    return ok({
      fileName: `riselyo-sauvegarde-${day}.json`,
      mimeType: 'application/json',
      content: content.value,
    });
  };
}
