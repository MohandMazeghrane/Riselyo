import type { LocalDataEraser } from '../../domain/ports/localDataEraser';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';

export type EraseAllData = () => Promise<Result<void, DomainError>>;

/**
 * Profile → my data → erase everything (local part; the Worker part comes with task 2.13).
 * The data goes first: if the caches then resist, nothing personal is left anyway.
 */
export function createEraseAllData(deps: { readonly eraser: LocalDataEraser }): EraseAllData {
  return async () => {
    const database = await deps.eraser.eraseDatabase();
    if (!database.ok) {
      return database;
    }
    return deps.eraser.eraseCaches();
  };
}
