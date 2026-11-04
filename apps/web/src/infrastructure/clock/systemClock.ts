import { APP_TIME_ZONE } from '../../domain/config/time';
import type { Clock } from '../../domain/ports/clock';
import { parseDayKey, type LocalDateTime } from '../../domain/shared/dayKey';

type TimeSource = () => Date;

const LOCAL_PARTS_FORMAT = new Intl.DateTimeFormat('en-CA', {
  timeZone: APP_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export class SystemClock implements Clock {
  constructor(private readonly readTime: TimeSource = () => new Date()) {}

  now(): Date {
    return this.readTime();
  }

  localNow(): LocalDateTime {
    const parts = new Map(
      LOCAL_PARTS_FORMAT.formatToParts(this.readTime()).map((part) => [part.type, part.value]),
    );
    const date = parseDayKey(
      `${part(parts, 'year')}-${part(parts, 'month')}-${part(parts, 'day')}`,
    );
    if (!date.ok) {
      throw new Error('SystemClock: the platform returned an unreadable local date');
    }
    return {
      date: date.value,
      hour: Number(part(parts, 'hour')),
      minute: Number(part(parts, 'minute')),
    };
  }
}

function part(parts: Map<string, string>, type: Intl.DateTimeFormatPartTypes): string {
  return parts.get(type) ?? '';
}
