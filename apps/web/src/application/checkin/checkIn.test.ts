import { beforeEach, describe, expect, it } from 'vitest';
import { FakeClock } from '../../../test/fakes/fakeClock';
import {
  InMemoryDayEntryRepository,
  InMemoryHabitLogRepository,
  InMemoryHabitRepository,
  InMemoryProfileRepository,
} from '../../../test/fakes/inMemoryRepositories';
import { unwrap } from '../../../test/fixtures/unwrap';
import { chooseFirstGoals } from '../../domain/entities/habit';
import { startProfile } from '../../domain/entities/profile';
import { defaultRhythm } from '../../domain/entities/rhythm';
import { parseDayKey } from '../../domain/shared/dayKey';
import type { EveningForm, MorningForm } from './checkInForm';
import { createGetCheckInDay } from './getCheckInDay';
import { createSubmitEveningCheckIn } from './submitEveningCheckIn';
import { createSubmitMorningCheckIn } from './submitMorningCheckIn';

const TODAY = unwrap(parseDayKey('2026-11-05'));
const MORNING_AT = new Date('2026-11-05T07:30:00Z');

const MORNING: MorningForm = {
  bedtime: '23:40',
  wakeTime: '07:05',
  sleepQuality: 4,
  energy: 3,
  priority: { kind: 'habit', templateId: 'walk' },
};

const EVENING: EveningForm = {
  mood: 4,
  stress: 2,
  priorityKept: true,
  victory: '',
  habitLevels: { walk: 'normal' },
};

function setup() {
  const clock = new FakeClock(MORNING_AT, { date: TODAY, hour: 8, minute: 30 });
  const profiles = new InMemoryProfileRepository();
  const dayEntries = new InMemoryDayEntryRepository();
  const habits = new InMemoryHabitRepository();
  const habitLogs = new InMemoryHabitLogRepository();
  profiles.profile = { ...startProfile('Sam', TODAY), rhythm: defaultRhythm() };
  habits.habits = unwrap(chooseFirstGoals(['walk', 'read'], TODAY));
  const deps = { clock, profiles, dayEntries, habits, habitLogs };
  return {
    ...deps,
    getDay: createGetCheckInDay(deps),
    morning: createSubmitMorningCheckIn(deps),
    evening: createSubmitEveningCheckIn(deps),
  };
}

describe('check-ins', () => {
  let app: ReturnType<typeof setup>;

  beforeEach(() => {
    app = setup();
  });

  it('starts the day empty, with the habits and the rhythm to pre-fill', async () => {
    const day = unwrap(await app.getDay());

    expect(day.day).toBe(TODAY);
    expect(day.entry).toEqual({ day: TODAY, morning: null, evening: null });
    expect(day.activeHabits.map((habit) => habit.templateId)).toEqual(['walk', 'read']);
    expect(day.rhythm?.bedtime).toBe('23:30');
  });

  it('saves the morning check-in on the current day', async () => {
    unwrap(await app.morning(MORNING));

    expect(app.dayEntries.entries.get(TODAY)?.morning).toMatchObject({
      sleepQuality: 4,
      priority: { kind: 'habit', templateId: 'walk' },
      completedAt: MORNING_AT,
    });
  });

  it('counts a check-in made at 1 a.m. for the day before', async () => {
    app.clock.set(new Date('2026-11-06T00:30:00Z'), {
      date: unwrap(parseDayKey('2026-11-06')),
      hour: 1,
      minute: 30,
    });

    unwrap(await app.evening({ ...EVENING, priorityKept: null }));

    expect(app.dayEntries.entries.has(TODAY)).toBe(true);
  });

  it('saves the evening next to the morning, with the habit logs', async () => {
    unwrap(await app.morning(MORNING));
    unwrap(await app.evening(EVENING));

    const day = unwrap(await app.getDay());
    expect(day.entry.morning).not.toBeNull();
    expect(day.entry.evening).toMatchObject({ mood: 4, priorityKept: true, victory: null });
    expect(day.habitLogs).toEqual([{ templateId: 'walk', day: TODAY, level: 'normal' }]);
  });

  it('replaces the answers when a check-in is redone', async () => {
    unwrap(await app.morning(MORNING));
    unwrap(await app.evening(EVENING));
    unwrap(await app.morning({ ...MORNING, energy: 5 }));
    unwrap(await app.evening({ ...EVENING, habitLevels: { read: 'min' } }));

    const day = unwrap(await app.getDay());
    expect(day.entry.morning?.energy).toBe(5);
    expect(day.entry.evening).not.toBeNull();
    expect(day.habitLogs).toEqual([{ templateId: 'read', day: TODAY, level: 'min' }]);
  });

  it('asks about the priority only if there was one this morning', async () => {
    expect((await app.evening({ ...EVENING, priorityKept: null })).ok).toBe(true);

    unwrap(await app.morning(MORNING));
    expect(await app.evening({ ...EVENING, priorityKept: null })).toMatchObject({ ok: false });
  });

  it('refuses invalid answers without saving anything', async () => {
    expect((await app.morning({ ...MORNING, bedtime: '25:00' })).ok).toBe(false);
    expect((await app.morning({ ...MORNING, energy: undefined })).ok).toBe(false);
    expect((await app.evening({ ...EVENING, habitLevels: { walk: 'none' }, mood: 9 })).ok).toBe(
      false,
    );
    expect(app.dayEntries.entries.size).toBe(0);
    expect(app.habitLogs.logs).toEqual([]);
  });

  it('refuses a level the habit does not have', async () => {
    app.habits.habits = unwrap(chooseFirstGoals(['noAlcohol'], TODAY));

    expect(
      await app.evening({ ...EVENING, priorityKept: null, habitLevels: { noAlcohol: 'min' } }),
    ).toMatchObject({
      ok: false,
      error: { code: 'invalid_input' },
    });
  });

  it('reports storage failures', async () => {
    app.dayEntries.failing = true;
    expect((await app.getDay()).ok).toBe(false);
    expect((await app.morning(MORNING)).ok).toBe(false);
    expect((await app.evening(EVENING)).ok).toBe(false);

    app.dayEntries.failing = false;
    app.habits.failing = true;
    expect((await app.evening(EVENING)).ok).toBe(false);
    expect((await app.getDay()).ok).toBe(false);

    app.habits.failing = false;
    app.habitLogs.failing = true;
    expect((await app.getDay()).ok).toBe(false);
    expect((await app.evening({ ...EVENING, priorityKept: null })).ok).toBe(false);

    app.habitLogs.failing = false;
    app.profiles.failing = true;
    expect((await app.getDay()).ok).toBe(false);
  });
});
