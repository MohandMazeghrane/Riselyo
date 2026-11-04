import { beforeEach, describe, expect, it } from 'vitest';
import { FakeClock } from '../../../test/fakes/fakeClock';
import {
  InMemoryBodyMeasurementsRepository,
  InMemoryHabitRepository,
  InMemoryLifeWheelRepository,
  InMemoryProfileRepository,
} from '../../../test/fakes/inMemoryRepositories';
import { unwrap } from '../../../test/fixtures/unwrap';
import { LIFE_DOMAINS, type LifeDomain } from '../../domain/entities/lifeWheel';
import { defaultRhythm } from '../../domain/entities/rhythm';
import { parseDayKey } from '../../domain/shared/dayKey';
import { createGetDayZeroLifeWheel } from './getDayZeroLifeWheel';
import { createGetOnboardingStatus } from './getOnboardingStatus';
import { createSubmitFirstGoals } from './submitFirstGoals';
import { createSubmitLifeWheel } from './submitLifeWheel';
import { createSubmitMeasurements } from './submitMeasurements';
import { createSubmitRhythm } from './submitRhythm';
import { createSubmitWelcome } from './submitWelcome';
import { createSubmitWhy } from './submitWhy';

const DAY_ZERO = unwrap(parseDayKey('2026-11-04'));
const NEXT_DAY = unwrap(parseDayKey('2026-11-05'));
const SCORES = Object.fromEntries(LIFE_DOMAINS.map((domain) => [domain, 7])) as Record<
  LifeDomain,
  number
>;

function setup() {
  const profiles = new InMemoryProfileRepository();
  const lifeWheels = new InMemoryLifeWheelRepository();
  const measurements = new InMemoryBodyMeasurementsRepository();
  const habits = new InMemoryHabitRepository();
  const clock = new FakeClock(new Date('2026-11-04T09:00:00Z'), {
    date: DAY_ZERO,
    hour: 10,
    minute: 0,
  });
  return {
    profiles,
    lifeWheels,
    measurements,
    habits,
    clock,
    status: createGetOnboardingStatus({ profiles }),
    welcome: createSubmitWelcome({ profiles, clock }),
    lifeWheel: createSubmitLifeWheel({ profiles, lifeWheels }),
    dayZeroWheel: createGetDayZeroLifeWheel({ profiles, lifeWheels }),
    measure: createSubmitMeasurements({ profiles, measurements }),
    rhythm: createSubmitRhythm({ profiles }),
    why: createSubmitWhy({ profiles }),
    goals: createSubmitFirstGoals({ profiles, habits, clock }),
  };
}

type Setup = ReturnType<typeof setup>;

describe('onboarding part A', () => {
  let app: Setup;

  beforeEach(() => {
    app = setup();
  });

  it('starts at the welcome screen', async () => {
    expect(await app.status()).toEqual({ ok: true, value: { nextStep: 'welcome', profile: null } });
  });

  it('creates the profile on day 0 with the first name', async () => {
    unwrap(await app.welcome('  Sam '));

    expect(app.profiles.profile).toMatchObject({ firstName: 'Sam', dayZero: DAY_ZERO });
    expect(unwrap(await app.status()).nextStep).toBe('lifeWheel');
  });

  it('keeps day 0 when the first name is changed later', async () => {
    unwrap(await app.welcome('Sam'));
    app.clock.set(new Date('2026-11-05T09:00:00Z'), { date: NEXT_DAY, hour: 10, minute: 0 });

    unwrap(await app.welcome('Samuel'));

    expect(app.profiles.profile).toMatchObject({ firstName: 'Samuel', dayZero: DAY_ZERO });
  });

  it('goes through every screen and ends done', async () => {
    unwrap(await app.welcome('Sam'));
    unwrap(await app.lifeWheel(SCORES));
    unwrap(await app.measure({}));
    unwrap(await app.rhythm(defaultRhythm()));
    unwrap(await app.why(''));
    unwrap(await app.goals(['walk']));

    expect(unwrap(await app.status()).nextStep).toBe('done');
  });

  it('stores the life wheel on day 0 and gives it back for the radar', async () => {
    unwrap(await app.welcome('Sam'));
    unwrap(await app.lifeWheel(SCORES));

    expect(await app.dayZeroWheel()).toEqual({
      ok: true,
      value: { day: DAY_ZERO, scores: SCORES },
    });
  });

  it('stores measurements only when some were given', async () => {
    unwrap(await app.welcome('Sam'));
    unwrap(await app.measure({}));
    expect(app.measurements.saved.size).toBe(0);

    unwrap(await app.measure({ weightKg: 80 }));
    expect(app.measurements.saved.get(DAY_ZERO)).toEqual({ day: DAY_ZERO, weightKg: 80 });
  });

  it('saves the rhythm and the why on the profile', async () => {
    unwrap(await app.welcome('Sam'));
    unwrap(await app.rhythm({ ...defaultRhythm(), sportDays: ['sat'] }));
    unwrap(await app.why('pour mes enfants'));

    expect(app.profiles.profile).toMatchObject({
      why: 'pour mes enfants',
      rhythm: { sportDays: ['sat'] },
    });
  });

  it('replaces the goals when the user chooses again', async () => {
    unwrap(await app.welcome('Sam'));
    unwrap(await app.goals(['walk', 'read']));
    unwrap(await app.goals(['water']));

    expect(app.habits.habits.map((habit) => habit.templateId)).toEqual(['water']);
  });
});

describe('onboarding errors', () => {
  let app: Setup;

  beforeEach(() => {
    app = setup();
  });

  it('refuses an empty first name without saving anything', async () => {
    expect(await app.welcome(' ')).toMatchObject({ ok: false, error: { code: 'invalid_input' } });
    expect(app.profiles.profile).toBeNull();
  });

  it('refuses the next screens before the welcome screen', async () => {
    const results = [
      await app.lifeWheel(SCORES),
      await app.dayZeroWheel(),
      await app.measure({}),
      await app.rhythm(defaultRhythm()),
      await app.why(''),
      await app.goals(['walk']),
    ];

    for (const result of results) {
      expect(result).toMatchObject({ ok: false, error: { code: 'not_found' } });
    }
  });

  it('does not complete a step whose answer is invalid', async () => {
    unwrap(await app.welcome('Sam'));
    const invalid = [
      await app.lifeWheel({ mood: 4 }),
      await app.measure({ weightKg: 9999 }),
      await app.rhythm({ ...defaultRhythm(), sleepTargetMinutes: 0 }),
      await app.why('a'.repeat(500)),
      await app.goals([]),
    ];

    expect(invalid.every((result) => !result.ok)).toBe(true);
    expect(app.profiles.profile?.completedSteps).toEqual(['welcome']);
  });

  it('reports storage failures', async () => {
    unwrap(await app.welcome('Sam'));
    app.lifeWheels.failing = true;
    app.measurements.failing = true;
    app.habits.failing = true;

    expect(await app.lifeWheel(SCORES)).toMatchObject({ ok: false });
    expect(await app.measure({ pushUps: 5 })).toMatchObject({ ok: false });
    expect(await app.goals(['walk'])).toMatchObject({ ok: false });

    app.profiles.failing = true;
    expect(await app.status()).toMatchObject({ ok: false, error: { code: 'storage_failure' } });
    expect(await app.welcome('Sam')).toMatchObject({ ok: false });
  });
});
