import type Dexie from 'dexie';
import {
  createLifeWheel,
  LIFE_DOMAINS,
  type LifeDomain,
  type LifeWheel,
} from '../../../domain/entities/lifeWheel';
import type { LifeWheelRepository } from '../../../domain/ports/onboardingRepositories';
import { parseDayKey, type DayKey } from '../../../domain/shared/dayKey';
import type { DomainError } from '../../../domain/shared/domainError';
import { err, ok, type Result } from '../../../domain/shared/result';
import {
  asFields,
  storageResult,
  textOrEmpty,
  unreadableRecord,
  type UntrustedFields,
} from '../storageResult';

export class DexieLifeWheelRepository implements LifeWheelRepository {
  constructor(private readonly db: Dexie) {}

  save(wheel: LifeWheel): Promise<Result<void, DomainError>> {
    return storageResult('could not save the life wheel', async () => {
      await this.db.table('lifeWheels').put({ day: wheel.day, scores: { ...wheel.scores } });
    });
  }

  async findByDay(day: DayKey): Promise<Result<LifeWheel | null, DomainError>> {
    const read = await storageResult('could not read the life wheel', () =>
      this.db.table('lifeWheels').get(day),
    );
    if (!read.ok || read.value === undefined) {
      return read.ok ? ok(null) : read;
    }
    const wheel = fromLifeWheelRecord(read.value);
    return wheel === null ? err(unreadableRecord('lifeWheels')) : ok(wheel);
  }
}

function fromLifeWheelRecord(value: unknown): LifeWheel | null {
  const fields = asFields<keyof LifeWheel>(value);
  const scores = asFields<LifeDomain>(fields?.scores);
  const day = parseDayKey(textOrEmpty(fields?.day));
  if (scores === null || !day.ok) {
    return null;
  }
  const wheel = createLifeWheel(day.value, toNumbers(scores));
  return wheel.ok ? wheel.value : null;
}

/** Non-numeric scores are dropped, so the domain rejects the incomplete wheel. */
function toNumbers(scores: UntrustedFields<LifeDomain>): Partial<Record<LifeDomain, number>> {
  return Object.fromEntries(
    LIFE_DOMAINS.flatMap((domain) => {
      const score = scores[domain];
      return typeof score === 'number' ? [[domain, score]] : [];
    }),
  );
}
