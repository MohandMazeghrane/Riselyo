import { WELLBEING_WINDOW_DAYS } from '../../domain/config/safety';
import { wellbeingSignal, type WellbeingSignal } from '../../domain/safety/wellbeing';
import type { DayEntryRepository } from '../../domain/ports/checkInRepositories';
import type { Clock } from '../../domain/ports/clock';
import { dayKeyOf, daysBefore } from '../../domain/shared/dayKey';
import type { DomainError } from '../../domain/shared/domainError';
import { ok, type Result } from '../../domain/shared/result';

export type GetWellbeingSignal = () => Promise<Result<WellbeingSignal | null, DomainError>>;

/** Reads the last 7 days to decide whether the caring card is shown on the home screen. */
export function createGetWellbeingSignal(deps: {
  readonly clock: Clock;
  readonly dayEntries: DayEntryRepository;
}): GetWellbeingSignal {
  return async () => {
    const today = dayKeyOf(deps.clock.localNow());
    const firstDay = daysBefore(today, WELLBEING_WINDOW_DAYS - 1).at(-1) ?? today;
    const entries = await deps.dayEntries.listSince(firstDay);
    return entries.ok ? ok(wellbeingSignal(entries.value, today)) : entries;
  };
}
