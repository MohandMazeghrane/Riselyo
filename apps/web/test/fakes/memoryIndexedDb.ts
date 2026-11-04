import { IDBFactory, IDBKeyRange } from 'fake-indexeddb';
import type { OpenDatabaseOptions } from '../../src/infrastructure/db/database';

/** A fresh, isolated in-memory IndexedDB for each test. */
export function memoryIndexedDb(): Required<
  Pick<OpenDatabaseOptions, 'indexedDB' | 'IDBKeyRange'>
> {
  return { indexedDB: new IDBFactory(), IDBKeyRange };
}
