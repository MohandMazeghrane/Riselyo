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
import { createAddHabit, type AddHabit } from '../../application/habits/addHabit';
import {
  createAdjustQuickCount,
  type AdjustQuickCount,
} from '../../application/habits/adjustQuickCount';
import {
  createChangeHabitTarget,
  type ChangeHabitTarget,
} from '../../application/habits/changeHabitTarget';
import { createGetHabitPlan, type GetHabitPlan } from '../../application/habits/getHabitPlan';
import { createGetTodayHabits, type GetTodayHabits } from '../../application/habits/getTodayHabits';
import { createLogHabitLevel, type LogHabitLevel } from '../../application/habits/logHabitLevel';
import { createStopHabit, type StopHabit } from '../../application/habits/stopHabit';
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

export interface HabitUseCases {
  readonly getToday: GetTodayHabits;
  readonly logLevel: LogHabitLevel;
  readonly adjustQuickCount: AdjustQuickCount;
  readonly getPlan: GetHabitPlan;
  readonly add: AddHabit;
  readonly changeTarget: ChangeHabitTarget;
  readonly stop: StopHabit;
}

/** Use cases exposed to the UI. */
export interface AppContainer {
  readonly getCurrentDay: GetCurrentDay;
  readonly onboarding: OnboardingUseCases;
  readonly privacy: PrivacyUseCases;
  readonly checkIn: CheckInUseCases;
  readonly habits: HabitUseCases;
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
    habits: createHabitUseCases(adapters),
  };
}

function createHabitUseCases(adapters: AppAdapters): HabitUseCases {
  return {
    getToday: createGetTodayHabits(adapters),
    logLevel: createLogHabitLevel(adapters),
    adjustQuickCount: createAdjustQuickCount(adapters),
    getPlan: createGetHabitPlan(adapters),
    add: createAddHabit(adapters),
    changeTarget: createChangeHabitTarget(adapters),
    stop: createStopHabit(adapters),
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
