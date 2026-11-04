import type Dexie from 'dexie';
import type { LocalDataEraser } from '../../domain/ports/localDataEraser';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import { storageResult } from '../db/storageResult';

/** The browser APIs used, injected so that tests can provide fakes. */
export interface BrowserStorage {
  readonly caches: Pick<CacheStorage, 'keys' | 'delete'> | undefined;
  readonly serviceWorker: Pick<ServiceWorkerContainer, 'getRegistrations'> | undefined;
}

export class BrowserLocalDataEraser implements LocalDataEraser {
  constructor(
    private readonly db: Dexie,
    private readonly browser: BrowserStorage,
  ) {}

  eraseDatabase(): Promise<Result<void, DomainError>> {
    const names = this.db.tables.map((table) => table.name);
    return storageResult('could not erase the data', () =>
      this.db.transaction('rw', names, async () => {
        await Promise.all(names.map((name) => this.db.table(name).clear()));
      }),
    );
  }

  eraseCaches(): Promise<Result<void, DomainError>> {
    const { caches, serviceWorker } = this.browser;
    return storageResult('could not erase the caches', async () => {
      if (caches !== undefined) {
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
      }
      const registrations = (await serviceWorker?.getRegistrations()) ?? [];
      await Promise.all(registrations.map((registration) => registration.unregister()));
    });
  }
}
