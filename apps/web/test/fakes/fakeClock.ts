import type { Clock } from '../../src/domain/ports/clock';
import type { LocalDateTime } from '../../src/domain/shared/dayKey';

/** Deterministic clock for tests: returns whatever time it was last set to. */
export class FakeClock implements Clock {
  constructor(
    private instant: Date,
    private local: LocalDateTime,
  ) {}

  now(): Date {
    return new Date(this.instant.getTime());
  }

  localNow(): LocalDateTime {
    return this.local;
  }

  set(instant: Date, local: LocalDateTime): void {
    this.instant = instant;
    this.local = local;
  }
}
