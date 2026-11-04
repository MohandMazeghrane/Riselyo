export type DomainErrorCode = 'invalid_input' | 'not_found' | 'storage_failure' | 'unavailable';

export interface DomainError {
  readonly code: DomainErrorCode;
  readonly detail: string;
}

export function domainError(code: DomainErrorCode, detail: string): DomainError {
  return { code, detail };
}
