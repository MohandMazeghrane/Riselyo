import { describe, expect, it } from 'vitest';
import { FakeClock } from '../../../test/fakes/fakeClock';
import {
  InMemoryBackupRepository,
  InMemoryDayEntryRepository,
  InMemoryHabitLogRepository,
} from '../../../test/fakes/inMemoryRepositories';
import { unwrap } from '../../../test/fixtures/unwrap';
import { BACKUP_MAX_CHARACTERS } from '../../domain/config/backup';
import { emptyDayEntry, type DayEntry } from '../../domain/entities/dayEntry';
import { emptyQuickCounts } from '../../domain/entities/quickCounts';
import { parseDayKey } from '../../domain/shared/dayKey';
import type { TimeOfDay } from '../../domain/shared/timeOfDay';
import { buildDaysCsv, DAY_COLUMNS, type DaysCsvLabels } from './daysCsv';
import { createExportBackup } from './exportBackup';
import { createExportDaysCsv } from './exportDaysCsv';
import { createImportBackup } from './importBackup';

const UTF8_BOM_CODE = 0xfeff;
const DAY = unwrap(parseDayKey('2026-11-05'));
const NEXT = unwrap(parseDayKey('2026-11-06'));
const NOW = new Date('2026-11-06T09:00:00Z');

function setup() {
  const clock = new FakeClock(NOW, { date: NEXT, hour: 10, minute: 0 });
  const backup = new InMemoryBackupRepository();
  const dayEntries = new InMemoryDayEntryRepository();
  const habitLogs = new InMemoryHabitLogRepository();
  const deps = { clock, backup, dayEntries, habitLogs };
  return {
    ...deps,
    exportBackup: createExportBackup(deps),
    importBackup: createImportBackup(deps),
    exportCsv: createExportDaysCsv(deps),
  };
}

const LABELS: DaysCsvLabels = {
  columns: Object.fromEntries(
    DAY_COLUMNS.map((column) => [column, column]),
  ) as DaysCsvLabels['columns'],
  habitName: (id) => `habit:${id}`,
  habitLevel: (_id, level) => `level:${level}`,
  priority: (priority) => (priority.kind === 'free' ? priority.text : priority.templateId),
  yes: 'oui',
  no: 'non',
};

const FULL_DAY: DayEntry = {
  day: DAY,
  morning: {
    bedtime: '23:30' as TimeOfDay,
    wakeTime: '07:00' as TimeOfDay,
    sleepQuality: 4,
    energy: 3,
    priority: { kind: 'free', text: '=SOMME(A1); "appeler"' },
    completedAt: NOW,
  },
  evening: { mood: 4, stress: 2, priorityKept: true, victory: 'marché', completedAt: NOW },
  quick: { ...emptyQuickCounts(), waterGlasses: 6 },
};

describe('exportBackup', () => {
  it('names the file after today and keeps the snapshot as is', async () => {
    expect(await setup().exportBackup()).toEqual({
      ok: true,
      value: {
        fileName: 'riselyo-sauvegarde-2026-11-06.json',
        mimeType: 'application/json',
        content: `{"app":"riselyo"}@${NOW.toISOString()}`,
      },
    });
  });

  it('reports a storage failure', async () => {
    const app = setup();
    app.backup.failing = true;
    expect((await app.exportBackup()).ok).toBe(false);
  });
});

describe('importBackup', () => {
  it('hands the file to the repository', async () => {
    const app = setup();
    unwrap(await app.importBackup('{"app":"riselyo"}'));
    expect(app.backup.restored).toBe('{"app":"riselyo"}');
  });

  it('refuses a file that is too large before reading it (boundary)', async () => {
    const app = setup();
    expect((await app.importBackup('x'.repeat(BACKUP_MAX_CHARACTERS))).ok).toBe(true);
    expect(await app.importBackup('x'.repeat(BACKUP_MAX_CHARACTERS + 1))).toEqual({
      ok: false,
      error: { code: 'invalid_input', detail: 'too_large' },
    });
  });

  it('passes on why the repository refused the file', async () => {
    const app = setup();
    app.backup.refusal = 'newer_version';
    expect(await app.importBackup('{}')).toMatchObject({ error: { detail: 'newer_version' } });
  });
});

describe('buildDaysCsv', () => {
  it('writes a header, one line per day and one column per habit', () => {
    const logs = [{ templateId: 'walk', day: NEXT, level: 'min' }] as const;
    const lines = buildDaysCsv([FULL_DAY], logs, LABELS).split('\r\n');

    expect(lines[0]?.charCodeAt(0)).toBe(UTF8_BOM_CODE);
    expect(lines[0]?.slice(1)).toBe([...DAY_COLUMNS, 'habit:walk'].join(';'));
    expect(lines[1]).toBe(
      `2026-11-05;23:30;07:00;4;3;"'=SOMME(A1); ""appeler""";4;2;oui;marché;6;0;0;0;0;`,
    );
    expect(lines[2]).toBe('2026-11-06;;;;;;;;;;0;0;0;0;0;level:min');
  });

  it('leaves blank what was not answered', () => {
    const line = buildDaysCsv([emptyDayEntry(DAY)], [], LABELS).split('\r\n')[1];
    expect(line).toBe('2026-11-05;;;;;;;;;;0;0;0;0;0');
  });

  it('writes "no" for a priority not kept and the habit name of a habit priority', () => {
    const morning =
      FULL_DAY.morning === null
        ? null
        : { ...FULL_DAY.morning, priority: { kind: 'habit', templateId: 'read' } as const };
    const evening = FULL_DAY.evening === null ? null : { ...FULL_DAY.evening, priorityKept: false };
    const line = buildDaysCsv([{ ...FULL_DAY, morning, evening }], [], LABELS).split('\r\n')[1];
    expect(line).toContain(';read;4;2;non;');
  });
});

describe('exportDaysCsv', () => {
  it('reads every day and every habit log', async () => {
    const app = setup();
    app.dayEntries.entries.set(DAY, FULL_DAY);
    app.habitLogs.logs = [{ templateId: 'walk', day: DAY, level: 'normal' }];

    const file = unwrap(await app.exportCsv(LABELS));
    expect(file.fileName).toBe('riselyo-journees-2026-11-06.csv');
    expect(file.content.split('\r\n')).toHaveLength(2);
  });

  it('reports storage failures', async () => {
    const app = setup();
    app.habitLogs.failing = true;
    expect((await app.exportCsv(LABELS)).ok).toBe(false);
    app.habitLogs.failing = false;
    app.dayEntries.failing = true;
    expect((await app.exportCsv(LABELS)).ok).toBe(false);
  });
});
