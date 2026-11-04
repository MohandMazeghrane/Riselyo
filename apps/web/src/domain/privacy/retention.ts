import { AI_USAGE_RETENTION_MONTHS, CONVERSATION_RETENTION_DAYS } from '../config/retention';
import { monthsBefore, type DayKey } from '../shared/dayKey';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

/** Everything older than these limits is purged when the app starts. */
export interface RetentionCutoffs {
  /** Journal entries whose stored expiry is at or before this instant. */
  readonly journalExpiredAt: Date;
  /** Conversations (and their messages) started before this instant. */
  readonly conversationsStartedBefore: Date;
  /** AI usage records of days strictly before this day. */
  readonly aiUsageBefore: DayKey;
}

export function retentionCutoffs(now: Date, today: DayKey): RetentionCutoffs {
  return {
    journalExpiredAt: now,
    conversationsStartedBefore: new Date(
      now.getTime() - CONVERSATION_RETENTION_DAYS * MILLISECONDS_PER_DAY,
    ),
    aiUsageBefore: monthsBefore(today, AI_USAGE_RETENTION_MONTHS),
  };
}
