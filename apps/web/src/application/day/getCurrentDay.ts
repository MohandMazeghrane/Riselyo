import type { Clock } from '../../domain/ports/clock';
import { dayKeyOf, type DayKey } from '../../domain/shared/dayKey';

export interface GetCurrentDayDeps {
  readonly clock: Clock;
}

export type GetCurrentDay = () => DayKey;

export function createGetCurrentDay({ clock }: GetCurrentDayDeps): GetCurrentDay {
  return () => dayKeyOf(clock.localNow());
}
