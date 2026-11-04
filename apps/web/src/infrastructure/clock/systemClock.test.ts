import { describe, expect, it } from 'vitest';
import { SystemClock } from './systemClock';

describe('SystemClock', () => {
  it('reads local time in Paris during winter time (UTC+1)', () => {
    const clock = new SystemClock(() => new Date('2026-11-04T23:30:00Z'));

    expect(clock.localNow()).toEqual({ date: '2026-11-05', hour: 0, minute: 30 });
  });

  it('reads local time in Paris during summer time (UTC+2)', () => {
    const clock = new SystemClock(() => new Date('2026-07-14T21:15:00Z'));

    expect(clock.localNow()).toEqual({ date: '2026-07-14', hour: 23, minute: 15 });
  });

  it('returns the instant given by the time source', () => {
    const instant = new Date('2026-11-04T08:00:00Z');
    const clock = new SystemClock(() => instant);

    expect(clock.now()).toEqual(instant);
  });
});
