import {
  createBodyMeasurements,
  type MeasurementValues,
} from '../../domain/entities/bodyMeasurements';
import { markStepCompleted } from '../../domain/entities/profile';
import type {
  BodyMeasurementsRepository,
  ProfileRepository,
} from '../../domain/ports/onboardingRepositories';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import { loadStartedProfile } from './loadStartedProfile';

export type SubmitMeasurements = (values: MeasurementValues) => Promise<Result<void, DomainError>>;

/** Screen A2. Everything is optional: skipping stores nothing but still moves on. */
export function createSubmitMeasurements(deps: {
  readonly profiles: ProfileRepository;
  readonly measurements: BodyMeasurementsRepository;
}): SubmitMeasurements {
  return async (values) => {
    const profile = await loadStartedProfile(deps.profiles);
    if (!profile.ok) {
      return profile;
    }
    const measurements = createBodyMeasurements(profile.value.dayZero, values);
    if (!measurements.ok) {
      return measurements;
    }
    if (measurements.value !== null) {
      const saved = await deps.measurements.save(measurements.value);
      if (!saved.ok) {
        return saved;
      }
    }
    return deps.profiles.save(markStepCompleted(profile.value, 'measurements'));
  };
}
