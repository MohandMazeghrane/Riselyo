import type { LocalDateTime } from '../shared/dayKey';

/** The only way for the domain and the application to know the current time. */
export interface Clock {
  now(): Date;
  localNow(): LocalDateTime;
}
