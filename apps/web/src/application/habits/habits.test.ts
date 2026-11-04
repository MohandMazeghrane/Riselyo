import { describe, expect, it } from 'vitest';
import { FakeClock } from '../../../test/fakes/fakeClock';
import {
  InMemoryDayEntryRepository,
  InMemoryHabitLogRepository,
  InMemoryHabitRepository,
} from '../../../test/fakes/inMemoryRepositories';
import { unwrap } from '../../../test/fixtures/unwrap';
import { createHabit, type HabitTemplateId } from '../../domain/entities/habit';
import type { HabitLevel } from '../../domain/entities/habitLog';
import { daysBefore, parseDayKey, type DayKey } from '../../domain/shared/dayKey';
import { createAddHabit } from './addHabit';
import { createAdjustQuickCount } from './adjustQuickCount';
import { createChangeHabitTarget } from './changeHabitTarget';
import { createGetHabitPlan } from './getHabitPlan';
import { createGetTodayHabits } from './getTodayHabits';
import { HABITS_FORM, habitKindOf, levelAfterTap, targetTiersFor } from './habitsForm';
import { createLogHabitLevel } from './logHabitLevel';
import { createStopHabit } from './stopHabit';

const TODAY = unwrap(parseDayKey('2026-11-20'));
const [YESTERDAY, TWO_DAYS_AGO, THREE_DAYS_AGO] = daysBefore(TODAY, 3) as [DayKey, DayKey, DayKey];

function setup() {
  const clock = new FakeClock(new Date('2026-11-20T09:00:00Z'), {
    date: TODAY,
    hour: 10,
    minute: 0,
  });
  const habits = new InMemoryHabitRepository();
  const habitLogs = new InMemoryHabitLogRepository();
  const dayEntries = new InMemoryDayEntryRepository();
  habits.habits = [createHabit('walk', TODAY), createHabit('snacking', TODAY)];
  const deps = { clock, habits, habitLogs, dayEntries };
  return {
    ...deps,
    getToday: createGetTodayHabits(deps),
    logLevel: createLogHabitLevel(deps),
    adjust: createAdjustQuickCount(deps),
    getPlan: createGetHabitPlan(deps),
    add: createAddHabit(deps),
    changeTarget: createChangeHabitTarget(deps),
    stop: createStopHabit(deps),
  };
}

const log = (templateId: HabitTemplateId, day: DayKey, level: HabitLevel) => ({
  templateId,
  day,
  level,
});

describe('getTodayHabits and logHabitLevel', () => {
  it('lists the active habits, nothing logged yet, counters at zero', async () => {
    const today = unwrap(await setup().getToday());
    expect(today.day).toBe(TODAY);
    expect(today.habits.map(({ habit, level }) => [habit.templateId, level])).toEqual([
      ['walk', undefined],
      ['snacking', undefined],
    ]);
    expect(today.quick.waterGlasses).toBe(0);
  });

  it('logs and replaces the level of the day', async () => {
    const app = setup();
    unwrap(await app.logLevel('walk', 'min'));
    unwrap(await app.logLevel('walk', 'normal'));
    expect(app.habitLogs.logs).toEqual([log('walk', TODAY, 'normal')]);
    expect(unwrap(await app.getToday()).habits[0]?.level).toBe('normal');
  });

  it('counts the days without for a habit to reduce only', async () => {
    const app = setup();
    app.habitLogs.logs = [
      log('snacking', THREE_DAYS_AGO, 'none'),
      log('snacking', TWO_DAYS_AGO, 'normal'),
      log('snacking', YESTERDAY, 'normal'),
    ];
    const [walk, snacking] = unwrap(await app.getToday()).habits;
    expect(walk?.daysWithout).toBeNull();
    expect(snacking?.daysWithout).toBe(2);
  });

  it('refuses to log a habit that is not active', async () => {
    expect(await setup().logLevel('read', 'min')).toMatchObject({
      ok: false,
      error: { code: 'not_found' },
    });
  });
});

describe('adjustQuickCount', () => {
  it('adds and undoes taps on the day entry', async () => {
    const app = setup();
    unwrap(await app.adjust('walkMinutes', 'add'));
    unwrap(await app.adjust('walkMinutes', 'add'));
    unwrap(await app.adjust('walkMinutes', 'remove'));
    expect(app.dayEntries.entries.get(TODAY)?.quick.walkMinutes).toBe(10);
    expect(unwrap(await app.getToday()).quick.walkMinutes).toBe(10);
  });

  it('refuses to go below zero and keeps the morning answers', async () => {
    const app = setup();
    expect((await app.adjust('workouts', 'remove')).ok).toBe(false);
    expect(app.dayEntries.entries.size).toBe(0);
  });
});

describe('getHabitPlan and addHabit', () => {
  it('lists the habits that can be added and why others must wait', async () => {
    const plan = unwrap(await setup().getPlan());
    expect(plan.active.map(({ templateId }) => templateId)).toEqual(['walk', 'snacking']);
    expect(plan.available).toHaveLength(12);
    expect(plan.available.find(({ templateId }) => templateId === 'read')?.check).toEqual({
      allowed: false,
      reason: 'not_enough_data',
      answeredDays: 0,
    });
    expect(plan.available.find(({ templateId }) => templateId === 'tobacco')?.check).toEqual({
      allowed: true,
    });
  });

  it('adds a habit once the current ones hold', async () => {
    const app = setup();
    app.habitLogs.logs = [YESTERDAY, TWO_DAYS_AGO, THREE_DAYS_AGO].map((day) =>
      log('walk', day, 'min'),
    );
    unwrap(await app.add('read'));
    expect(app.habits.habits.find(({ templateId }) => templateId === 'read')).toEqual(
      createHabit('read', TODAY),
    );
  });

  it('refuses to add a habit too early', async () => {
    expect(await setup().add('read')).toMatchObject({
      ok: false,
      error: { detail: 'not_enough_data' },
    });
  });

  it('restarts a stopped habit at its smallest tier', async () => {
    const app = setup();
    unwrap(await app.changeTarget('walk', 'excellent'));
    unwrap(await app.stop('walk'));
    unwrap(await app.add('walk'));
    expect(app.habits.habits.filter(({ templateId }) => templateId === 'walk')).toEqual([
      createHabit('walk', TODAY),
    ]);
  });
});

describe('changeHabitTarget and stopHabit', () => {
  it('moves the target tier', async () => {
    const app = setup();
    unwrap(await app.changeTarget('walk', 'normal'));
    expect(app.habits.habits.find(({ templateId }) => templateId === 'walk')?.tier).toBe('normal');
  });

  it('refuses a tier the habit does not have', async () => {
    expect((await setup().changeTarget('snacking', 'excellent')).ok).toBe(false);
  });

  it('stops a habit without erasing its history', async () => {
    const app = setup();
    app.habitLogs.logs = [log('walk', YESTERDAY, 'min')];
    unwrap(await app.stop('walk'));
    const today = unwrap(await app.getToday());
    expect(today.habits.map(({ habit }) => habit.templateId)).toEqual(['snacking']);
    expect(app.habitLogs.logs).toHaveLength(1);
  });

  it('cannot stop or change a habit that is not active', async () => {
    const app = setup();
    expect(await app.stop('read')).toMatchObject({ ok: false, error: { code: 'not_found' } });
    expect((await app.changeTarget('read', 'normal')).ok).toBe(false);
  });
});

describe('storage failures', () => {
  it('are reported, never hidden', async () => {
    const app = setup();
    app.habits.failing = true;
    expect((await app.getToday()).ok).toBe(false);
    expect((await app.getPlan()).ok).toBe(false);
    expect((await app.add('tobacco')).ok).toBe(false);
    expect((await app.logLevel('walk', 'min')).ok).toBe(false);
    expect((await app.stop('walk')).ok).toBe(false);

    app.habits.failing = false;
    app.habitLogs.failing = true;
    expect((await app.getToday()).ok).toBe(false);
    expect((await app.getPlan()).ok).toBe(false);
    expect((await app.add('tobacco')).ok).toBe(false);

    app.habitLogs.failing = false;
    app.dayEntries.failing = true;
    expect((await app.getToday()).ok).toBe(false);
    expect((await app.adjust('waterGlasses', 'add')).ok).toBe(false);
  });

  it('reports a failing history read of a habit to reduce', async () => {
    const app = setup();
    app.habitLogs.listForHabit = () =>
      Promise.resolve({ ok: false, error: { code: 'storage_failure', detail: 'x' } });
    expect((await app.getToday()).ok).toBe(false);
  });
});

describe('habitsForm', () => {
  it('exposes the catalogues and the quick buttons', () => {
    expect(HABITS_FORM.toBuild).toHaveLength(10);
    expect(HABITS_FORM.toReduce).toHaveLength(4);
    expect(HABITS_FORM.quickActions).toHaveLength(5);
  });

  it('cycles levels and lists target tiers', () => {
    expect(levelAfterTap('walk', undefined)).toBe('min');
    expect(targetTiersFor('noAlcohol')).toEqual(['normal', 'excellent']);
    expect(habitKindOf('tobacco')).toBe('reduce');
  });
});
