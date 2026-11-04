import type { DomainError } from '../shared/domainError';
import type { Result } from '../shared/result';

/** The kinds of personal data kept on the phone today (CLAUDE.md, section 12: transparency). */
export const STORED_DATA_KINDS = [
  'profile',
  'consents',
  'days',
  'habits',
  'habitLogs',
  'measurements',
  'lifeWheels',
] as const;

export type StoredDataKind = (typeof STORED_DATA_KINDS)[number];

export type StoredDataCounts = Readonly<Record<StoredDataKind, number>>;

export interface StoredDataInventory {
  /** How many records of each kind are stored; reads nothing but counts. */
  count(): Promise<Result<StoredDataCounts, DomainError>>;
}
