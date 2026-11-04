import { beforeEach, describe, expect, it } from 'vitest';
import { FakeClock } from '../../../test/fakes/fakeClock';
import { InMemoryConsentRepository } from '../../../test/fakes/inMemoryRepositories';
import { unwrap } from '../../../test/fixtures/unwrap';
import { defaultConsents } from '../../domain/entities/consent';
import { parseDayKey } from '../../domain/shared/dayKey';
import { createGetConsents } from './getConsents';
import { createUpdateConsent } from './updateConsent';

const NOW = new Date('2026-11-06T18:00:00Z');

function setup() {
  const consents = new InMemoryConsentRepository();
  const clock = new FakeClock(NOW, {
    date: unwrap(parseDayKey('2026-11-06')),
    hour: 19,
    minute: 0,
  });
  return {
    consents,
    get: createGetConsents({ consents }),
    update: createUpdateConsent({ consents, clock }),
  };
}

describe('Profile → Confidentialité', () => {
  let app: ReturnType<typeof setup>;

  beforeEach(() => {
    app = setup();
  });

  it('shows everything refused by default', async () => {
    expect(await app.get()).toEqual({ ok: true, value: defaultConsents() });
  });

  it('grants one purpose, dated, and returns the new state', async () => {
    const result = await app.update({ purpose: 'notifications', granted: true });

    expect(result).toMatchObject({
      ok: true,
      value: { notifications: { granted: true, decidedAt: NOW } },
    });
    expect(app.consents.consents.notifications.granted).toBe(true);
  });

  it('revoking the AI also revokes the journal', async () => {
    unwrap(await app.update({ purpose: 'ai', granted: true }));
    unwrap(await app.update({ purpose: 'aiJournal', granted: true }));

    const result = unwrap(await app.update({ purpose: 'ai', granted: false }));

    expect(result.aiJournal.granted).toBe(false);
  });

  it('refuses the journal without the AI and saves nothing', async () => {
    const result = await app.update({ purpose: 'aiJournal', granted: true });

    expect(result).toMatchObject({ ok: false, error: { code: 'invalid_input' } });
    expect(app.consents.consents).toEqual(defaultConsents());
  });

  it('reports storage failures', async () => {
    app.consents.failing = true;

    expect((await app.get()).ok).toBe(false);
    expect((await app.update({ purpose: 'health', granted: true })).ok).toBe(false);
  });
});
