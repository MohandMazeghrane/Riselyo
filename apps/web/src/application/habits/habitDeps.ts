import type { Habit, HabitTemplateId } from '../../domain/entities/habit';
import type {
  DayEntryRepository,
  HabitLogRepository,
} from '../../domain/ports/checkInRepositories';
import type { Clock } from '../../domain/ports/clock';
import type { HabitRepository } from '../../domain/ports/onboardingRepositories';
import { domainError, type DomainError } from '../../domain/shared/domainError';
import { err, ok, type Result } from '../../domain/shared/result';

/** Ports used by the habit use cases. */
export interface HabitDeps {
  readonly clock: Clock;
  readonly habits: HabitRepository;
  readonly habitLogs: HabitLogRepository;
  readonly dayEntries: DayEntryRepository;
}

export async function findActiveHabit(
  habits: HabitRepository,
  templateId: HabitTemplateId,
): Promise<Result<Habit, DomainError>> {
  const active = await habits.listActive();
  if (!active.ok) {
    return active;
  }
  const habit = active.value.find((candidate) => candidate.templateId === templateId);
  return habit === undefined
    ? err(domainError('not_found', `${templateId} is not an active habit`))
    : ok(habit);
}
