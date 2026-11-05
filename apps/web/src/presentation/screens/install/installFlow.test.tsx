import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTestApp } from '../../../../test/fakes/testContainer';
import { finishedProfile, renderApp } from '../../../../test/renderApp';

const IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1';

function asIphone(standalone = false): void {
  vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(IPHONE);
  Object.defineProperty(navigator, 'standalone', { value: standalone, configurable: true });
}

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(navigator, 'standalone');
});

describe('install guide', () => {
  it('is suggested on the welcome screen in Safari on an iPhone', async () => {
    asIphone();
    renderApp('/demarrage');

    const card = await screen.findByRole('region', { name: 'Installe Riselyo sur ton iPhone' });
    expect(card).toHaveTextContent('20 secondes');
  });

  it('is not suggested once installed, nor on a computer', async () => {
    asIphone(true);
    renderApp('/demarrage');
    await screen.findByRole('heading', { name: 'Bienvenue sur Riselyo' });

    expect(screen.queryByRole('region', { name: 'Installe Riselyo sur ton iPhone' })).toBeNull();
  });

  it('explains the three Safari gestures from the profile', async () => {
    asIphone();
    const testApp = createTestApp();
    testApp.profiles.profile = finishedProfile();
    renderApp('/profil/installer', testApp);

    expect(await screen.findAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByText(/Sur l’écran d’accueil/)).toBeInTheDocument();
    expect(screen.getByText(/exporte-les d’abord/)).toBeInTheDocument();
  });

  it('says when the app is already installed', async () => {
    asIphone(true);
    renderApp('/profil/installer');

    expect(await screen.findByText(/déjà installée/)).toBeInTheDocument();
  });
});
