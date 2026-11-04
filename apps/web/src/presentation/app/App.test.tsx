import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createTestApp } from '../../../test/fakes/testContainer';
import { finishedProfile, renderApp } from '../../../test/renderApp';
import { App } from './App';

describe('first launch', () => {
  it('sends a new user to the welcome screen', async () => {
    renderApp('/');

    expect(
      await screen.findByRole('heading', { name: 'Bienvenue sur Riselyo' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Étape 1 sur 7')).toBeInTheDocument();
  });

  it('resumes the onboarding where it was left', async () => {
    const testApp = createTestApp();
    testApp.profiles.profile = { ...finishedProfile(), completedSteps: ['welcome', 'lifeWheel'] };

    renderApp('/', testApp);

    expect(await screen.findByRole('heading', { name: 'Tes mesures' })).toBeInTheDocument();
  });
});

describe('today', () => {
  it('greets the user by first name with the current day', async () => {
    const testApp = createTestApp('2026-11-04', 10);
    testApp.profiles.profile = finishedProfile('Sam');

    renderApp('/', testApp);

    expect(await screen.findByRole('heading', { name: 'Bonjour Sam' })).toBeInTheDocument();
    expect(screen.getByText('mercredi 4 novembre')).toBeInTheDocument();
  });

  it('still shows the previous day in the middle of the night', async () => {
    const testApp = createTestApp('2026-11-04', 2);
    testApp.profiles.profile = finishedProfile();

    renderApp('/', testApp);

    expect(await screen.findByText('mardi 3 novembre')).toBeInTheDocument();
  });

  it('offers to retry when the data cannot be read', async () => {
    const testApp = createTestApp();
    testApp.profiles.failing = true;

    renderApp('/', testApp);

    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de charger');
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeInTheDocument();
  });
});

describe('help', () => {
  it('lists the emergency numbers as phone links, without any network', () => {
    renderApp('/aide');

    expect(screen.getByRole('link', { name: 'Appeler le 3114' })).toHaveAttribute(
      'href',
      'tel:3114',
    );
    expect(screen.getByRole('link', { name: 'Appeler le 15' })).toHaveAttribute('href', 'tel:15');
    expect(screen.getByRole('link', { name: 'Appeler le 112' })).toHaveAttribute('href', 'tel:112');
  });

  it('is reachable from the welcome screen', async () => {
    renderApp('/demarrage');

    fireEvent.click(await screen.findByRole('link', { name: 'Besoin d’aide' }));

    expect(screen.getByRole('heading', { name: 'Besoin d’aide' })).toBeInTheDocument();
  });
});

describe('ContainerProvider', () => {
  it('fails loudly when a screen is rendered without it', () => {
    // React reports the expected crash through console.error and jsdom's error event.
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const silenceExpectedCrash = (event: ErrorEvent): void => {
      event.preventDefault();
    };
    window.addEventListener('error', silenceExpectedCrash);

    expect(() => render(<App />)).toThrow();

    window.removeEventListener('error', silenceExpectedCrash);
  });
});

describe('launch', () => {
  it('purges expired data once the app starts, whatever the screen', async () => {
    const testApp = renderApp('/aide');

    await waitFor(() => {
      expect(testApp.purger.received.length).toBeGreaterThan(0);
    });
  });

  it('keeps working when the purge fails', async () => {
    const testApp = createTestApp();
    testApp.purger.failing = true;
    renderApp('/aide', testApp);

    expect(await screen.findByRole('heading', { name: 'Besoin d’aide' })).toBeInTheDocument();
  });
});
