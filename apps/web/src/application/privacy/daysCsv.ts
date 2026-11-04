import { emptyDayEntry, type DailyPriority, type DayEntry } from '../../domain/entities/dayEntry';
import type { HabitTemplateId } from '../../domain/entities/habit';
import type { HabitLevel, HabitLog } from '../../domain/entities/habitLog';
import { QUICK_ACTIONS } from '../../domain/entities/quickCounts';

export const DAY_COLUMNS = [
  'date',
  'bedtime',
  'wakeTime',
  'sleepQuality',
  'energy',
  'priority',
  'mood',
  'stress',
  'priorityKept',
  'victory',
  ...QUICK_ACTIONS,
] as const;

export type DayColumn = (typeof DAY_COLUMNS)[number];

/** Visible texts come from the presentation layer: the CSV is read by a person. */
export interface DaysCsvLabels {
  readonly columns: Readonly<Record<DayColumn, string>>;
  readonly habitName: (templateId: HabitTemplateId) => string;
  readonly habitLevel: (templateId: HabitTemplateId, level: HabitLevel) => string;
  readonly priority: (priority: DailyPriority) => string;
  readonly yes: string;
  readonly no: string;
}

const SEPARATOR = ';';
const LINE_END = '\r\n';
/** Lets spreadsheets read the accents correctly. */
const UTF8_BOM = '\uFEFF';
/** A cell starting like a formula is neutralised (CSV injection). */
const FORMULA_START = /^[=+\-@\t\r]/;

/** One line per day with an entry or a habit log, oldest first, then one column per habit. */
export function buildDaysCsv(
  entries: readonly DayEntry[],
  logs: readonly HabitLog[],
  labels: DaysCsvLabels,
): string {
  const habitIds = [...new Set(logs.map((log) => log.templateId))];
  const header = [
    ...DAY_COLUMNS.map((column) => labels.columns[column]),
    ...habitIds.map(labels.habitName),
  ];
  const levels = new Map(logs.map((log) => [`${log.templateId}/${log.day}`, log.level]));
  const habitCell = (templateId: HabitTemplateId, { day }: DayEntry): string => {
    const level = levels.get(`${templateId}/${day}`);
    return level === undefined ? '' : labels.habitLevel(templateId, level);
  };
  const lines = allDays(entries, logs).map((entry) => [
    ...dayCells(entry, labels),
    ...habitIds.map((id) => habitCell(id, entry)),
  ]);
  return (
    UTF8_BOM +
    [header, ...lines].map((cells) => cells.map(escapeCell).join(SEPARATOR)).join(LINE_END)
  );
}

function allDays(entries: readonly DayEntry[], logs: readonly HabitLog[]): DayEntry[] {
  const byDay = new Map(entries.map((entry) => [entry.day, entry]));
  for (const { day } of logs) {
    if (!byDay.has(day)) {
      byDay.set(day, emptyDayEntry(day));
    }
  }
  return [...byDay.values()].sort((a, b) => a.day.localeCompare(b.day));
}

function dayCells({ day, morning, evening, quick }: DayEntry, labels: DaysCsvLabels): string[] {
  const kept = evening?.priorityKept ?? null;
  const priority = morning?.priority ?? null;
  return [
    day,
    morning?.bedtime ?? '',
    morning?.wakeTime ?? '',
    numberCell(morning?.sleepQuality),
    numberCell(morning?.energy),
    priority === null ? '' : labels.priority(priority),
    numberCell(evening?.mood),
    numberCell(evening?.stress),
    kept === null ? '' : kept ? labels.yes : labels.no,
    evening?.victory ?? '',
    ...QUICK_ACTIONS.map((action) => String(quick[action])),
  ];
}

function numberCell(value: number | undefined): string {
  return value === undefined ? '' : String(value);
}

function escapeCell(value: string): string {
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  return /[";\r\n]/.test(safe) ? `"${safe.replaceAll('"', '""')}"` : safe;
}
