import type { ConsentSet } from '../../domain/entities/consent';
import type { ConsentRepository } from '../../domain/ports/consentRepository';
import type { DomainError } from '../../domain/shared/domainError';
import type { Result } from '../../domain/shared/result';

export type GetConsents = () => Promise<Result<ConsentSet, DomainError>>;

export function createGetConsents(deps: { readonly consents: ConsentRepository }): GetConsents {
  return () => deps.consents.load();
}
