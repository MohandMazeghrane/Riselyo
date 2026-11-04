import { emptyDayEntry } from '../../domain/entities/dayEntry';
import {
  adjustQuickCount,
  type QuickAction,
  type QuickAdjustment,
} from '../../domain/entities/quickCounts';
import { dayKeyOf } from '../../domain/shared/dayKey';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';
import type { HabitDeps } from './habitDeps';

export type AdjustQuickCount = (
  action: QuickAction,
  adjustment: QuickAdjustment,
) => Promise<Result<void, DomainError>>;

/** A quick button of the home screen ("+1 glass of water"…), or undoing one tap. */
export function createAdjustQuickCount(
  deps: Pick<HabitDeps, 'clock' | 'dayEntries'>,
): AdjustQuickCount {
  return async (action, adjustment) => {
    const day = dayKeyOf(deps.clock.localNow());
    const existing = await deps.dayEntries.findByDay(day);
    if (!existing.ok) {
      return existing;
    }
    const entry = existing.value ?? emptyDayEntry(day);
    const quick = adjustQuickCount(entry.quick, action, adjustment);
    return quick.ok ? deps.dayEntries.save({ ...entry, quick: quick.value }) : quick;
  };
}
