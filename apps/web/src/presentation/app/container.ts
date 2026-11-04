import { createGetCurrentDay, type GetCurrentDay } from '../../application/day/getCurrentDay';
import { SystemClock } from '../../infrastructure/clock/systemClock';

/** Use cases exposed to the UI. The only place that knows concrete adapters. */
export interface AppContainer {
  readonly getCurrentDay: GetCurrentDay;
}

export function createContainer(): AppContainer {
  const clock = new SystemClock();
  return {
    getCurrentDay: createGetCurrentDay({ clock }),
  };
}
