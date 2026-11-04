import type { Profile } from '../../domain/entities/profile';
import type { ProfileRepository } from '../../domain/ports/onboardingRepositories';
import { domainError, type DomainError } from '../../domain/shared/domainError';
import { err, ok, type Result } from '../../domain/shared/result';

/** Every step after the welcome screen needs the profile it created. */
export async function loadStartedProfile(
  profiles: ProfileRepository,
): Promise<Result<Profile, DomainError>> {
  const loaded = await profiles.load();
  if (!loaded.ok) {
    return loaded;
  }
  if (loaded.value === null) {
    return err(domainError('not_found', 'the onboarding has not started yet'));
  }
  return ok(loaded.value);
}
