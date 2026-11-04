import type {
  DayEntryRepository,
  HabitLogRepository,
} from '../../domain/ports/checkInRepositories';
import type { BackupRepository } from '../../domain/ports/backupRepository';
import type { Clock } from '../../domain/ports/clock';
import type { ConsentRepository } from '../../domain/ports/consentRepository';
import type {
  BodyMeasurementsRepository,
  HabitRepository,
  LifeWheelRepository,
  ProfileRepository,
} from '../../domain/ports/onboardingRepositories';

/** Every port the use cases need; Dexie in the app, in-memory fakes in the tests. */
export interface AppAdapters {
  readonly clock: Clock;
  readonly profiles: ProfileRepository;
  readonly lifeWheels: LifeWheelRepository;
  readonly measurements: BodyMeasurementsRepository;
  readonly habits: HabitRepository;
  readonly consents: ConsentRepository;
  readonly dayEntries: DayEntryRepository;
  readonly habitLogs: HabitLogRepository;
  readonly backup: BackupRepository;
}
