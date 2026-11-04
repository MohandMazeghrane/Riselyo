import {
  STORED_DATA_KINDS,
  type StoredDataCounts,
  type StoredDataInventory,
  type StoredDataKind,
} from '../../domain/ports/storedDataInventory';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';

export type GetStoredData = () => Promise<Result<StoredDataCounts, DomainError>>;

/** Profile → my data: what is stored on the phone, kind by kind. */
export function createGetStoredData(deps: {
  readonly inventory: StoredDataInventory;
}): GetStoredData {
  return () => deps.inventory.count();
}

/** The kinds in display order, for the screens. */
export const STORED_DATA_ORDER: readonly StoredDataKind[] = STORED_DATA_KINDS;
