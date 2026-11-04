import { parseDayKey } from '../../src/domain/shared/dayKey';
import { createUseCases, type AppContainer } from '../../src/presentation/app/useCases';
import { unwrap } from '../fixtures/unwrap';
import { FakeClock } from './fakeClock';
import {
  InMemoryBackupRepository,
  InMemoryBodyMeasurementsRepository,
  InMemoryConsentRepository,
  InMemoryDayEntryRepository,
  InMemoryHabitLogRepository,
  InMemoryHabitRepository,
  InMemoryLifeWheelRepository,
  InMemoryLocalDataEraser,
  InMemoryProfileRepository,
  InMemoryStoredDataInventory,
} from './inMemoryRepositories';

export interface TestApp {
  readonly container: AppContainer;
  readonly clock: FakeClock;
  readonly profiles: InMemoryProfileRepository;
  readonly lifeWheels: InMemoryLifeWheelRepository;
  readonly measurements: InMemoryBodyMeasurementsRepository;
  readonly habits: InMemoryHabitRepository;
  readonly consents: InMemoryConsentRepository;
  readonly dayEntries: InMemoryDayEntryRepository;
  readonly habitLogs: InMemoryHabitLogRepository;
  readonly backup: InMemoryBackupRepository;
  readonly eraser: InMemoryLocalDataEraser;
  readonly inventory: InMemoryStoredDataInventory;
}

/** The real use cases wired to in-memory repositories, for screen tests. */
export function createTestApp(isoDay = '2026-11-04', hour = 10): TestApp {
  const clock = new FakeClock(new Date(`${isoDay}T12:00:00Z`), {
    date: unwrap(parseDayKey(isoDay)),
    hour,
    minute: 0,
  });
  const adapters = {
    clock,
    profiles: new InMemoryProfileRepository(),
    lifeWheels: new InMemoryLifeWheelRepository(),
    measurements: new InMemoryBodyMeasurementsRepository(),
    habits: new InMemoryHabitRepository(),
    consents: new InMemoryConsentRepository(),
    dayEntries: new InMemoryDayEntryRepository(),
    habitLogs: new InMemoryHabitLogRepository(),
    backup: new InMemoryBackupRepository(),
    eraser: new InMemoryLocalDataEraser(),
    inventory: new InMemoryStoredDataInventory(),
  };
  return { container: createUseCases(adapters), ...adapters };
}
