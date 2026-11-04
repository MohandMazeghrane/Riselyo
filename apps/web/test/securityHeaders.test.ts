import { describe, expect, it } from 'vitest';
import { readGlobalSecurityHeaders } from '../build/securityHeaders';

const headers = readGlobalSecurityHeaders();

function cspDirectives(): Map<string, string> {
  const csp = headers['Content-Security-Policy'] ?? '';
  return new Map(
    csp
      .split(';')
      .map((directive) => directive.trim().split(/\s+/))
      .map(([name = '', ...values]) => [name, values.join(' ')]),
  );
}

describe('security headers (CLAUDE.md, section 11)', () => {
  it.each([
    ['default-src', "'self'"],
    ['script-src', "'self'"],
    ['img-src', "'self' blob: data:"],
    ['object-src', "'none'"],
    ['frame-ancestors', "'none'"],
  ])('restricts %s to %s', (directive, expected) => {
    expect(cspDirectives().get(directive)).toBe(expected);
  });

  it('never allows inline or evaluated code', () => {
    const csp = headers['Content-Security-Policy'] ?? '';

    expect(csp).not.toMatch(/unsafe-inline|unsafe-eval|\*/);
  });

  it('only talks to its own origin until the Worker exists', () => {
    expect(cspDirectives().get('connect-src')).toBe("'self'");
  });

  it('enforces HTTPS, MIME sniffing protection and no referrer', () => {
    expect(headers['Strict-Transport-Security']).toMatch(/max-age=\d{8,}/);
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('no-referrer');
  });

  it('allows the microphone for dictation only, and nothing else sensitive', () => {
    const policy = headers['Permissions-Policy'] ?? '';

    expect(policy).toContain('microphone=(self)');
    expect(policy).toContain('camera=()');
    expect(policy).toContain('geolocation=()');
  });
});
