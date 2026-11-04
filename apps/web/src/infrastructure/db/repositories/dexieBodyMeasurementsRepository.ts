import type Dexie from 'dexie';
import type { BodyMeasurements } from '../../../domain/entities/bodyMeasurements';
import type { BodyMeasurementsRepository } from '../../../domain/ports/onboardingRepositories';
import type { DomainError } from '../../../domain/shared/domainError';
import type { Result } from '../../../domain/shared/result';
import { asFields, storageResult } from '../storageResult';

/** Measurements stay on the phone: this table is never read to build an AI summary. */
export class DexieBodyMeasurementsRepository implements BodyMeasurementsRepository {
  constructor(private readonly db: Dexie) {}

  save(measurements: BodyMeasurements): Promise<Result<void, DomainError>> {
    const table = this.db.table('measurements');
    return storageResult('could not save the measurements', () =>
      this.db.transaction('rw', table, async () => {
        const { day, ...values } = measurements;
        const existing: unknown = await table.where('date').equals(day).first();
        const id = existingId(existing);
        await table.put(id === undefined ? { date: day, ...values } : { id, date: day, ...values });
      }),
    );
  }
}

function existingId(record: unknown): number | undefined {
  const id = asFields<'id'>(record)?.id;
  return typeof id === 'number' ? id : undefined;
}
