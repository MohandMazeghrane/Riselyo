import { z } from 'zod';
import { BACKUP_FORMAT_VERSION } from '../../../domain/config/backup';
import {
  consentRecord,
  dayEntryRecord,
  habitLogRecord,
  habitRecord,
  lifeWheelRecord,
  measurementRecord,
  profileRecord,
} from './recordSchemas';
import { ALL_TABLES } from './tableNames';

/** Tables whose records exist today; every other table must still be empty in a backup. */
const FILLED_TABLES = {
  profile: z.array(profileRecord).max(1),
  consents: z.array(consentRecord),
  dayEntries: z.array(dayEntryRecord),
  habits: z.array(habitRecord),
  habitLogs: z.array(habitLogRecord),
  measurements: z.array(measurementRecord),
  lifeWheels: z.array(lifeWheelRecord),
};

const EMPTY_TABLES = Object.fromEntries(
  ALL_TABLES.filter((table) => !(table in FILLED_TABLES)).map((table) => [
    table,
    z.array(z.never()).max(0).optional(),
  ]),
);

const tables = z
  .strictObject({ ...FILLED_TABLES, ...EMPTY_TABLES })
  .refine(({ dayEntries }) => isUnique(dayEntries.map(({ date }) => date)))
  .refine(({ habits }) => isUnique(habits.map(({ templateId }) => templateId)))
  .refine(({ habitLogs }) => isUnique(habitLogs.map(({ habitId, date }) => `${habitId}/${date}`)))
  .refine(({ lifeWheels }) => isUnique(lifeWheels.map(({ day }) => day)))
  .refine(({ consents }) => isUnique(consents.map(({ key }) => key)));

/** Only the envelope: tells "not a Riselyo backup" and "made by a newer version" apart. */
export const backupEnvelope = z.object({
  app: z.literal('riselyo'),
  format: z.literal(BACKUP_FORMAT_VERSION),
  schemaVersion: z.int().positive(),
});

export const backupDocument = z.strictObject({
  app: z.literal('riselyo'),
  format: z.literal(BACKUP_FORMAT_VERSION),
  schemaVersion: z.int().positive(),
  exportedAt: z.iso.datetime(),
  tables,
});

export type BackupDocument = z.infer<typeof backupDocument>;

function isUnique(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}
