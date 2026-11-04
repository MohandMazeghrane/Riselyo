import type { HabitTemplateId } from '../../domain/entities/habit';
import { createHabitLog, type HabitLevel } from '../../domain/entities/habitLog';
import { dayKeyOf } from '../../domain/shared/dayKey';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import type { HabitDeps } from './habitDeps';

export type LogHabitLevel = (
  templateId: HabitTemplateId,
  level: HabitLevel,
) => Promise<Result<void, DomainError>>;

/** A tap on a habit of the home screen: today's level, replacing the previous one. */
export function createLogHabitLevel(
  deps: Pick<HabitDeps, 'clock' | 'habits' | 'habitLogs'>,
): LogHabitLevel {
  return async (templateId, level) => {
    const day = dayKeyOf(deps.clock.localNow());
    const active = await deps.habits.listActive();
    if (!active.ok) {
      return active;
    }
    const log = createHabitLog(active.value, { templateId, day, level });
    return log.ok ? deps.habitLogs.save(log.value) : log;
  };
}
