import { markStepCompleted } from '../../domain/entities/profile';
import { createRhythm, type Rhythm } from '../../domain/entities/rhythm';
import type { ProfileRepository } from '../../domain/ports/onboardingRepositories';
import { domainError, type DomainError } from '../../domain/shared/domainError';
import { err, type Result } from '../../domain/shared/result';
import { parseTimeOfDay } from '../../domain/shared/timeOfDay';
import { loadStartedProfile } from './loadStartedProfile';
import type { RhythmForm } from './onboardingForm';

export type SubmitRhythm = (form: RhythmForm) => Promise<Result<void, DomainError>>;

/** Screen A3. */
export function createSubmitRhythm(deps: { readonly profiles: ProfileRepository }): SubmitRhythm {
  return async (form) => {
    const profile = await loadStartedProfile(deps.profiles);
    if (!profile.ok) {
      return profile;
    }
    const rhythm = rhythmFromForm(form);
    if (!rhythm.ok) {
      return rhythm;
    }
    return deps.profiles.save(
      markStepCompleted({ ...profile.value, rhythm: rhythm.value }, 'rhythm'),
    );
  };
}

function rhythmFromForm(form: RhythmForm): Result<Rhythm, DomainError> {
  const wakeTime = parseTimeOfDay(form.wakeTime);
  const bedtime = parseTimeOfDay(form.bedtime);
  const eveningCheckInTime = parseTimeOfDay(form.eveningCheckInTime);
  if (!wakeTime.ok || !bedtime.ok || !eveningCheckInTime.ok) {
    return err(domainError('invalid_input', 'every time must be formatted HH:MM'));
  }
  return createRhythm({
    ...form,
    wakeTime: wakeTime.value,
    bedtime: bedtime.value,
    eveningCheckInTime: eveningCheckInTime.value,
  });
}
