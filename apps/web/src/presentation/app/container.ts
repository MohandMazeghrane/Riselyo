import { SystemClock } from '../../infrastructure/clock/systemClock';
import { createRiselyoDatabase } from '../../infrastructure/db/database';
import { DexieBackupRepository } from '../../infrastructure/db/backup/dexieBackupRepository';
import { DexieBodyMeasurementsRepository } from '../../infrastructure/db/repositories/dexieBodyMeasurementsRepository';
import { DexieConsentRepository } from '../../infrastructure/db/repositories/dexieConsentRepository';
import { DexieDayEntryRepository } from '../../infrastructure/db/repositories/dexieDayEntryRepository';
import { DexieHabitLogRepository } from '../../infrastructure/db/repositories/dexieHabitLogRepository';
import { DexieHabitRepository } from '../../infrastructure/db/repositories/dexieHabitRepository';
import { DexieLifeWheelRepository } from '../../infrastructure/db/repositories/dexieLifeWheelRepository';
import { DexieProfileRepository } from '../../infrastructure/db/repositories/dexieProfileRepository';
import { createUseCases, type AppContainer } from './useCases';

/** Composition root: the only place that knows concrete adapters. */
export function createContainer(): AppContainer {
  const db = createRiselyoDatabase();
  return createUseCases({
    clock: new SystemClock(),
    profiles: new DexieProfileRepository(db),
    lifeWheels: new DexieLifeWheelRepository(db),
    measurements: new DexieBodyMeasurementsRepository(db),
    habits: new DexieHabitRepository(db),
    consents: new DexieConsentRepository(db),
    dayEntries: new DexieDayEntryRepository(db),
    habitLogs: new DexieHabitLogRepository(db),
    backup: new DexieBackupRepository(db),
  });
}

export type { AppContainer };
