import { createGetCurrentDay, type GetCurrentDay } from '../../application/day/getCurrentDay';
import {
  createGetDayZeroLifeWheel,
  type GetDayZeroLifeWheel,
} from '../../application/onboarding/getDayZeroLifeWheel';
import {
  createGetOnboardingStatus,
  type GetOnboardingStatus,
} from '../../application/onboarding/getOnboardingStatus';
import {
  createSubmitFirstGoals,
  type SubmitFirstGoals,
} from '../../application/onboarding/submitFirstGoals';
import {
  createSubmitLifeWheel,
  type SubmitLifeWheel,
} from '../../application/onboarding/submitLifeWheel';
import {
  createSubmitMeasurements,
  type SubmitMeasurements,
} from '../../application/onboarding/submitMeasurements';
import { createSubmitRhythm, type SubmitRhythm } from '../../application/onboarding/submitRhythm';
import {
  createSubmitWelcome,
  type SubmitWelcome,
} from '../../application/onboarding/submitWelcome';
import { createSubmitWhy, type SubmitWhy } from '../../application/onboarding/submitWhy';
import type { Clock } from '../../domain/ports/clock';
import { SystemClock } from '../../infrastructure/clock/systemClock';
import { createRiselyoDatabase } from '../../infrastructure/db/database';
import { DexieBodyMeasurementsRepository } from '../../infrastructure/db/repositories/dexieBodyMeasurementsRepository';
import { DexieHabitRepository } from '../../infrastructure/db/repositories/dexieHabitRepository';
import { DexieLifeWheelRepository } from '../../infrastructure/db/repositories/dexieLifeWheelRepository';
import { DexieProfileRepository } from '../../infrastructure/db/repositories/dexieProfileRepository';
import type { OnboardingRepositories } from './onboardingRepositories';

export interface OnboardingUseCases {
  readonly getStatus: GetOnboardingStatus;
  readonly submitWelcome: SubmitWelcome;
  readonly submitLifeWheel: SubmitLifeWheel;
  readonly getDayZeroLifeWheel: GetDayZeroLifeWheel;
  readonly submitMeasurements: SubmitMeasurements;
  readonly submitRhythm: SubmitRhythm;
  readonly submitWhy: SubmitWhy;
  readonly submitFirstGoals: SubmitFirstGoals;
}

/** Use cases exposed to the UI. The only place that knows concrete adapters. */
export interface AppContainer {
  readonly getCurrentDay: GetCurrentDay;
  readonly onboarding: OnboardingUseCases;
}

export function createContainer(): AppContainer {
  const clock = new SystemClock();
  const db = createRiselyoDatabase();
  const repositories: OnboardingRepositories = {
    profiles: new DexieProfileRepository(db),
    lifeWheels: new DexieLifeWheelRepository(db),
    measurements: new DexieBodyMeasurementsRepository(db),
    habits: new DexieHabitRepository(db),
  };
  return {
    getCurrentDay: createGetCurrentDay({ clock }),
    onboarding: createOnboardingUseCases(repositories, clock),
  };
}

/** Shared with the tests, which pass in-memory repositories. */
export function createOnboardingUseCases(
  repositories: OnboardingRepositories,
  clock: Clock,
): OnboardingUseCases {
  const { profiles, lifeWheels, measurements, habits } = repositories;
  return {
    getStatus: createGetOnboardingStatus({ profiles }),
    submitWelcome: createSubmitWelcome({ profiles, clock }),
    submitLifeWheel: createSubmitLifeWheel({ profiles, lifeWheels }),
    getDayZeroLifeWheel: createGetDayZeroLifeWheel({ profiles, lifeWheels }),
    submitMeasurements: createSubmitMeasurements({ profiles, measurements }),
    submitRhythm: createSubmitRhythm({ profiles }),
    submitWhy: createSubmitWhy({ profiles }),
    submitFirstGoals: createSubmitFirstGoals({ profiles, habits, clock }),
  };
}
