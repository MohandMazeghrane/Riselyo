import type Dexie from 'dexie';
import type { Profile } from '../../../domain/entities/profile';
import type { ProfileRepository } from '../../../domain/ports/onboardingRepositories';
import type { DomainError } from '../../../domain/shared/domainError';
import { err, ok, type Result } from '../../../domain/shared/result';
import { fromProfileRecord, PROFILE_ID, toProfileRecord } from '../records/profileRecord';
import { storageResult, unreadableRecord } from '../storageResult';

export class DexieProfileRepository implements ProfileRepository {
  constructor(private readonly db: Dexie) {}

  async load(): Promise<Result<Profile | null, DomainError>> {
    const read = await storageResult('could not read the profile', () =>
      this.db.table('profile').get(PROFILE_ID),
    );
    if (!read.ok || read.value === undefined) {
      return read.ok ? ok(null) : read;
    }
    const profile = fromProfileRecord(read.value);
    return profile === null ? err(unreadableRecord('profile')) : ok(profile);
  }

  async save(profile: Profile): Promise<Result<void, DomainError>> {
    return storageResult('could not save the profile', async () => {
      await this.db.table('profile').put(toProfileRecord(profile));
    });
  }
}
