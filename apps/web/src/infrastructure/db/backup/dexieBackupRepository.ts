import type Dexie from 'dexie';
import { BACKUP_FORMAT_VERSION } from '../../../domain/config/backup';
import type { BackupRefusal, BackupRepository } from '../../../domain/ports/backupRepository';
import { domainError, type DomainError } from '../../../domain/shared/domainError';
import { err, ok, type Result } from '../../../domain/shared/result';
import { storageResult } from '../storageResult';
import type { BackupDocument } from './backupSchema';
import { ALL_TABLES } from './tableNames';

/** Whole-database export and restore, in the stored format, validated by Zod on the way in. */
export class DexieBackupRepository implements BackupRepository {
  constructor(private readonly db: Dexie) {}

  exportSnapshot(exportedAt: Date): Promise<Result<string, DomainError>> {
    return storageResult('could not read the data to export', async () => {
      const tables = this.db.tables.map((table) => table.name);
      const rows = await this.db.transaction('r', tables, () =>
        Promise.all(
          tables.map(async (name): Promise<[string, unknown[]]> => {
            const records: unknown[] = await this.db.table(name).toArray();
            return [name, records];
          }),
        ),
      );
      const document = {
        app: 'riselyo',
        format: BACKUP_FORMAT_VERSION,
        schemaVersion: this.db.verno,
        exportedAt: exportedAt.toISOString(),
        tables: Object.fromEntries(rows),
      };
      return JSON.stringify(document, null, 2);
    });
  }

  async restoreSnapshot(content: string): Promise<Result<void, DomainError>> {
    const document = await this.parse(content);
    if (!document.ok) {
      return document;
    }
    const { tables } = document.value;
    return storageResult('could not restore the backup', () =>
      this.db.transaction('rw', ALL_TABLES, async () => {
        for (const name of ALL_TABLES) {
          await this.db.table(name).clear();
        }
        for (const [name, rows] of Object.entries(tables)) {
          await this.db.table(name).bulkAdd(rows);
        }
      }),
    );
  }

  /** Zod is only loaded when a backup is restored, to keep the first display fast. */
  private async parse(content: string): Promise<Result<BackupDocument, DomainError>> {
    let json: unknown;
    try {
      json = JSON.parse(content);
    } catch {
      return refuse('not_json');
    }
    const schemas = await storageResult(
      'could not load the backup checker',
      () => import('./backupSchema'),
    );
    if (!schemas.ok) {
      return schemas;
    }
    const { backupDocument, backupEnvelope } = schemas.value;
    const envelope = backupEnvelope.safeParse(json);
    if (!envelope.success) {
      return refuse('not_a_backup');
    }
    if (envelope.data.schemaVersion > this.db.verno) {
      return refuse('newer_version');
    }
    const document = backupDocument.safeParse(json);
    return document.success ? ok(document.data) : refuse('invalid_data');
  }
}

function refuse(reason: BackupRefusal): Result<never, DomainError> {
  return err(domainError('invalid_input', reason));
}
