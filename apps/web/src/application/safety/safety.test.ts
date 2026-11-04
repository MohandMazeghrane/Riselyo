import { describe, expect, it } from 'vitest';
import { FakeClock } from '../../../test/fakes/fakeClock';
import { InMemoryDayEntryRepository } from '../../../test/fakes/inMemoryRepositories';
import { unwrap } from '../../../test/fixtures/unwrap';
import { emptyDayEntry } from '../../domain/entities/dayEntry';
import { daysBefore, parseDayKey } from '../../domain/shared/dayKey';
import { createGetWellbeingSignal } from './getWellbeingSignal';
import { textNeedsHelp } from './needsHelp';

const TODAY = unwrap(parseDayKey('2026-11-20'));
const AT = new Date('2026-11-20T20:00:00Z');

function setup() {
  const clock = new FakeClock(AT, { date: TODAY, hour: 21, minute: 0 });
  const dayEntries = new InMemoryDayEntryRepository();
  return { dayEntries, getSignal: createGetWellbeingSignal({ clock, dayEntries }) };
}

function lowMoodDays(count: number, offset = 0) {
  return daysBefore(TODAY, count + offset)
    .slice(offset)
    .map((day) => ({
      ...emptyDayEntry(day),
      evening: { mood: 1, stress: 3, priorityKept: null, victory: null, completedAt: AT },
    }));
}

describe('getWellbeingSignal', () => {
  it('stays quiet without data', async () => {
    expect(await setup().getSignal()).toEqual({ ok: true, value: null });
  });

  it('reads the last 7 days, today included', async () => {
    const app = setup();
    for (const entry of lowMoodDays(4)) {
      app.dayEntries.entries.set(entry.day, entry);
    }
    expect(await app.getSignal()).toEqual({ ok: true, value: 'low_mood' });
  });

  it('ignores evenings older than the week', async () => {
    const app = setup();
    for (const entry of lowMoodDays(4, 6)) {
      app.dayEntries.entries.set(entry.day, entry);
    }
    expect(await app.getSignal()).toEqual({ ok: true, value: null });
  });

  it('reports a storage failure', async () => {
    const app = setup();
    app.dayEntries.failing = true;
    expect((await app.getSignal()).ok).toBe(false);
  });
});

describe('textNeedsHelp', () => {
  it('flags distress in what the user types', () => {
    expect(textNeedsHelp('je veux disparaître')).toBe(true);
    expect(textNeedsHelp('J’ai marché 30 minutes')).toBe(false);
  });
});
