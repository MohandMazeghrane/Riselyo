import { EXPORT_FIRST_DAY } from '../../domain/config/backup';
import type {
  DayEntryRepository,
  HabitLogRepository,
} from '../../domain/ports/checkInRepositories';
import type { Clock } from '../../domain/ports/clock';
import { dayKeyOf, type DayKey } from '../../domain/shared/dayKey';
import type { DomainError } from '../../domain/shared/domainError';
import { ok, type Result } from '../../domain/shared/result';
import { buildDaysCsv, type DaysCsvLabels } from './daysCsv';
import type { DownloadFile } from './downloadFile';

export type ExportDaysCsv = (labels: DaysCsvLabels) => Promise<Result<DownloadFile, DomainError>>;

/** Profile → my data: the days as a table, to open in a spreadsheet. */
export function createExportDaysCsv(deps: {
  readonly clock: Clock;
  readonly dayEntries: DayEntryRepository;
  readonly habitLogs: HabitLogRepository;
}): ExportDaysCsv {
  return async (labels) => {
    const since = EXPORT_FIRST_DAY as DayKey;
    const [entries, logs] = await Promise.all([
      deps.dayEntries.listSince(since),
      deps.habitLogs.listSince(since),
    ]);
    if (!entries.ok) {
      return entries;
    }
    if (!logs.ok) {
      return logs;
    }
    const day = dayKeyOf(deps.clock.localNow());
    return ok({
      fileName: `riselyo-journees-${day}.csv`,
      mimeType: 'text/csv;charset=utf-8',
      content: buildDaysCsv(entries.value, logs.value, labels),
    });
  };
}
