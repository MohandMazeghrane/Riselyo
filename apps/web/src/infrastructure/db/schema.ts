/**
 * Dexie stores per schema version (CLAUDE.md, section 5).
 * A published version is frozen: any change goes into a new version with its migration.
 */
export const SCHEMA_V1 = {
  profile: '&id',
  consents: '&key',
  coachProfile: '&id',
  coachMemory: '++id, createdAt',
  dayEntries: '&date',
  healthDays: '&date, importedAt',
  habits: '++id, kind, active',
  habitLogs: '++id, [habitId+date], date',
  measurements: '++id, date',
  photos: '++id, date',
  reviews: '++id, type, periodStart',
  journal: '++id, date, expiresAt',
  conversations: '++id, startedAt, mode',
  messages: '++id, conversationId, createdAt',
  progression: '&id',
  aiUsage: '++id, date, task',
  settings: '&key',
} as const satisfies Readonly<Record<string, string>>;

/** v2 (task 1.6): dated life wheels, one per day (day 0, then every 30 days). */
export const SCHEMA_V2 = {
  lifeWheels: '&day',
} as const satisfies Readonly<Record<string, string>>;
