import type Dexie from 'dexie';
import {
  CONSENT_PURPOSES,
  defaultConsents,
  type ConsentDecision,
  type ConsentPurpose,
  type ConsentSet,
} from '../../../domain/entities/consent';
import type { ConsentRepository } from '../../../domain/ports/consentRepository';
import { domainError, type DomainError } from '../../../domain/shared/domainError';
import { err, ok, type Result } from '../../../domain/shared/result';

interface ConsentRecord {
  readonly key: ConsentPurpose;
  readonly granted: boolean;
  readonly decidedAt: string | null;
}

export class DexieConsentRepository implements ConsentRepository {
  constructor(private readonly db: Dexie) {}

  async load(): Promise<Result<ConsentSet, DomainError>> {
    try {
      const records: unknown[] = await this.db.table('consents').toArray();
      return ok(records.filter(isConsentRecord).reduce(applyRecord, defaultConsents()));
    } catch {
      return err(domainError('storage_failure', 'could not read consents'));
    }
  }

  async save(consents: ConsentSet): Promise<Result<void, DomainError>> {
    try {
      await this.db
        .table('consents')
        .bulkPut(CONSENT_PURPOSES.map((key) => toRecord(key, consents[key])));
      return ok(undefined);
    } catch {
      return err(domainError('storage_failure', 'could not save consents'));
    }
  }
}

function toRecord(key: ConsentPurpose, decision: ConsentDecision): ConsentRecord {
  return { key, granted: decision.granted, decidedAt: decision.decidedAt?.toISOString() ?? null };
}

function applyRecord(consents: ConsentSet, record: ConsentRecord): ConsentSet {
  const decidedAt = record.decidedAt === null ? null : new Date(record.decidedAt);
  return { ...consents, [record.key]: { granted: record.granted, decidedAt } };
}

/** Anything unexpected is dropped, so a damaged record can only ever fall back to "denied". */
function isConsentRecord(value: unknown): value is ConsentRecord {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const { key, granted, decidedAt } = value as Record<string, unknown>;
  return (
    CONSENT_PURPOSES.includes(key as ConsentPurpose) &&
    typeof granted === 'boolean' &&
    (decidedAt === null || (typeof decidedAt === 'string' && !Number.isNaN(Date.parse(decidedAt))))
  );
}
