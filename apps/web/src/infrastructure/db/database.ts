import Dexie, { type DexieOptions, type Transaction } from 'dexie';
import { SCHEMA_V1, SCHEMA_V2 } from './schema';

export const DATABASE_NAME = 'riselyo';

export interface SchemaVersion {
  readonly version: number;
  readonly stores: Readonly<Record<string, string | null>>;
  readonly upgrade?: (transaction: Transaction) => Promise<void>;
}

/** Ordered history of the schema. Append only: never edit or remove a published entry. */
export const SCHEMA_VERSIONS: readonly SchemaVersion[] = [
  { version: 1, stores: SCHEMA_V1 },
  { version: 2, stores: SCHEMA_V2 },
];

export interface OpenDatabaseOptions {
  readonly name?: string;
  /** Stops at this version: lets migration tests create data in an older schema. */
  readonly upToVersion?: number;
  /** Injected in tests (fake-indexeddb); the browser implementation is used otherwise. */
  readonly indexedDB?: IDBFactory;
  readonly IDBKeyRange?: typeof IDBKeyRange;
}

export function createRiselyoDatabase(options: OpenDatabaseOptions = {}): Dexie {
  const db = new Dexie(options.name ?? DATABASE_NAME, dexieOptions(options));
  const lastVersion = options.upToVersion ?? Number.POSITIVE_INFINITY;
  for (const { version, stores, upgrade } of SCHEMA_VERSIONS) {
    if (version > lastVersion) {
      break;
    }
    const declared = db.version(version).stores(stores);
    if (upgrade !== undefined) {
      declared.upgrade(upgrade);
    }
  }
  return db;
}

function dexieOptions({ indexedDB, IDBKeyRange: keyRange }: OpenDatabaseOptions): DexieOptions {
  if (indexedDB === undefined || keyRange === undefined) {
    return {};
  }
  return { indexedDB, IDBKeyRange: keyRange };
}
