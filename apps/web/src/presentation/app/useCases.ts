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
  createSubmitConsents,
  type SubmitConsents,
} from '../../application/onboarding/submitConsents';
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
import { createGetConsents, type GetConsents } from '../../application/privacy/getConsents';
import { createUpdateConsent, type UpdateConsent } from '../../application/privacy/updateConsent';
import { createGetCheckInDay, type GetCheckInDay } from '../../application/checkin/getCheckInDay';
import {
  createSubmitEveningCheckIn,
  type SubmitEveningCheckIn,
} from '../../application/checkin/submitEveningCheckIn';
import {
  createSubmitMorningCheckIn,
  type SubmitMorningCheckIn,
} from '../../application/checkin/submitMorningCheckIn';
import type { AppAdapters } from './appRepositories';

export interface OnboardingUseCases {
  readonly getStatus: GetOnboardingStatus;
  readonly submitWelcome: SubmitWelcome;
  readonly submitLifeWheel: SubmitLifeWheel;
  readonly getDayZeroLifeWheel: GetDayZeroLifeWheel;
  readonly submitMeasurements: SubmitMeasurements;
  readonly submitRhythm: SubmitRhythm;
  readonly submitWhy: SubmitWhy;
  readonly submitFirstGoals: SubmitFirstGoals;
  readonly submitConsents: SubmitConsents;
}

export interface PrivacyUseCases {
  readonly getConsents: GetConsents;
  readonly updateConsent: UpdateConsent;
}

export interface CheckInUseCases {
  readonly getDay: GetCheckInDay;
  readonly submitMorning: SubmitMorningCheckIn;
  readonly submitEvening: SubmitEveningCheckIn;
}

/** Use cases exposed to the UI. */
export interface AppContainer {
  readonly getCurrentDay: GetCurrentDay;
  readonly onboarding: OnboardingUseCases;
  readonly privacy: PrivacyUseCases;
  readonly checkIn: CheckInUseCases;
}

/** Wires the use cases to whatever adapters are given (Dexie in the app, fakes in tests). */
export function createUseCases(adapters: AppAdapters): AppContainer {
  const { clock, consents } = adapters;
  return {
    getCurrentDay: createGetCurrentDay({ clock }),
    onboarding: createOnboardingUseCases(adapters),
    privacy: {
      getConsents: createGetConsents({ consents }),
      updateConsent: createUpdateConsent({ consents, clock }),
    },
    checkIn: {
      getDay: createGetCheckInDay(adapters),
      submitMorning: createSubmitMorningCheckIn(adapters),
      submitEvening: createSubmitEveningCheckIn(adapters),
    },
  };
}

function createOnboardingUseCases(adapters: AppAdapters): OnboardingUseCases {
  const { clock, profiles, lifeWheels, measurements, habits, consents } = adapters;
  return {
    getStatus: createGetOnboardingStatus({ profiles }),
    submitWelcome: createSubmitWelcome({ profiles, clock }),
    submitLifeWheel: createSubmitLifeWheel({ profiles, lifeWheels }),
    getDayZeroLifeWheel: createGetDayZeroLifeWheel({ profiles, lifeWheels }),
    submitMeasurements: createSubmitMeasurements({ profiles, measurements }),
    submitRhythm: createSubmitRhythm({ profiles }),
    submitWhy: createSubmitWhy({ profiles }),
    submitFirstGoals: createSubmitFirstGoals({ profiles, habits, clock }),
    submitConsents: createSubmitConsents({ profiles, consents, clock }),
  };
}
