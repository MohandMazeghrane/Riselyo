import type Dexie from 'dexie';
import {
  STORED_DATA_KINDS,
  type StoredDataCounts,
  type StoredDataInventory,
  type StoredDataKind,
} from '../../../domain/ports/storedDataInventory';
import type { DomainError } from '../../../domain/shared/domainError';
import type { Result } from '../../../domain/shared/result';
import { storageResult } from '../storageResult';

const TABLE_OF: Readonly<Record<StoredDataKind, string>> = {
  profile: 'profile',
  consents: 'consents',
  days: 'dayEntries',
  habits: 'habits',
  habitLogs: 'habitLogs',
  measurements: 'measurements',
  lifeWheels: 'lifeWheels',
};

export class DexieStoredDataInventory implements StoredDataInventory {
  constructor(private readonly db: Dexie) {}

  count(): Promise<Result<StoredDataCounts, DomainError>> {
    return storageResult('could not count the stored data', async () => {
      const counts = await Promise.all(
        STORED_DATA_KINDS.map(async (kind) => [kind, await this.db.table(TABLE_OF[kind]).count()]),
      );
      return Object.fromEntries(counts) as Record<StoredDataKind, number>;
    });
  }
}
