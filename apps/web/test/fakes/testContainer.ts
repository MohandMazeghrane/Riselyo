import { createGetCurrentDay } from '../../src/application/day/getCurrentDay';
import { parseDayKey } from '../../src/domain/shared/dayKey';
import { createOnboardingUseCases, type AppContainer } from '../../src/presentation/app/container';
import { unwrap } from '../fixtures/unwrap';
import { FakeClock } from './fakeClock';
import {
  InMemoryBodyMeasurementsRepository,
  InMemoryHabitRepository,
  InMemoryLifeWheelRepository,
  InMemoryProfileRepository,
} from './inMemoryRepositories';

export interface TestApp {
  readonly container: AppContainer;
  readonly clock: FakeClock;
  readonly profiles: InMemoryProfileRepository;
  readonly lifeWheels: InMemoryLifeWheelRepository;
  readonly measurements: InMemoryBodyMeasurementsRepository;
  readonly habits: InMemoryHabitRepository;
}

/** The real use cases wired to in-memory repositories, for screen tests. */
export function createTestApp(isoDay = '2026-11-04', hour = 10): TestApp {
  const clock = new FakeClock(new Date(`${isoDay}T12:00:00Z`), {
    date: unwrap(parseDayKey(isoDay)),
    hour,
    minute: 0,
  });
  const repositories = {
    profiles: new InMemoryProfileRepository(),
    lifeWheels: new InMemoryLifeWheelRepository(),
    measurements: new InMemoryBodyMeasurementsRepository(),
    habits: new InMemoryHabitRepository(),
  };
  const container: AppContainer = {
    getCurrentDay: createGetCurrentDay({ clock }),
    onboarding: createOnboardingUseCases(repositories, clock),
  };
  return { container, clock, ...repositories };
}
