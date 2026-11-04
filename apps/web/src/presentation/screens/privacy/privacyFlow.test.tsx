import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestApp } from '../../../../test/fakes/testContainer';
import { finishedProfile, renderApp } from '../../../../test/renderApp';

const switchFor = (name: string): HTMLElement => screen.getByRole('switch', { name });

function onConsentScreen() {
  const testApp = createTestApp();
  testApp.profiles.profile = {
    ...finishedProfile(),
    completedSteps: ['welcome', 'lifeWheel', 'measurements', 'rhythm', 'why', 'goals'],
  };
  renderApp('/', testApp);
  return testApp;
}

describe('consent screen (A6)', () => {
  it('is shown after the goals, with every switch off', async () => {
    onConsentScreen();

    expect(
      await screen.findByRole('heading', { name: 'Tes données, tes choix' }),
    ).toBeInTheDocument();
    for (const name of [
      'Coach IA',
      'Journal partagé avec le coach',
      'Apple Santé',
      'Notifications',
    ]) {
      expect(switchFor(name)).toHaveAttribute('aria-checked', 'false');
    }
  });

  it('locks the journal until the AI is switched on, and unlocks it after', async () => {
    onConsentScreen();
    await screen.findByRole('heading', { name: 'Tes données, tes choix' });

    expect(switchFor('Journal partagé avec le coach')).toBeDisabled();
    fireEvent.click(switchFor('Coach IA'));
    expect(switchFor('Journal partagé avec le coach')).toBeEnabled();
  });

  it('switching the AI off also switches the journal off', async () => {
    onConsentScreen();
    await screen.findByRole('heading', { name: 'Tes données, tes choix' });
    fireEvent.click(switchFor('Coach IA'));
    fireEvent.click(switchFor('Journal partagé avec le coach'));

    fireEvent.click(switchFor('Coach IA'));

    expect(switchFor('Journal partagé avec le coach')).toHaveAttribute('aria-checked', 'false');
  });

  it('saves the choices and opens today', async () => {
    const testApp = onConsentScreen();
    fireEvent.click(await screen.findByRole('switch', { name: 'Notifications' }));

    fireEvent.click(screen.getByRole('button', { name: 'Valider mes choix' }));

    expect(await screen.findByRole('heading', { name: 'Bonjour Sam' })).toBeInTheDocument();
    expect(testApp.consents.consents.notifications.granted).toBe(true);
    expect(testApp.consents.consents.health).toMatchObject({ granted: false });
    expect(testApp.consents.consents.health.decidedAt).not.toBeNull();
  });
});

describe('Profile → Confidentialité', () => {
  it('is reachable from today through the profile', async () => {
    const testApp = createTestApp();
    testApp.profiles.profile = finishedProfile();
    renderApp('/', testApp);

    fireEvent.click(await screen.findByRole('link', { name: 'Profil' }));
    fireEvent.click(screen.getByRole('link', { name: /Confidentialité/ }));

    expect(await screen.findByRole('heading', { name: 'Confidentialité' })).toBeInTheDocument();
  });

  it('saves a switch right away and shows the date of the decision', async () => {
    const testApp = createTestApp('2026-11-06');
    renderApp('/profil/confidentialite', testApp);
    expect(await screen.findAllByText('Pas encore choisi')).toHaveLength(3);
    expect(screen.getByText('Active d’abord le coach IA.')).toBeInTheDocument();

    fireEvent.click(switchFor('Apple Santé'));

    expect(await screen.findByText('Activé le 6 novembre 2026')).toBeInTheDocument();
    expect(testApp.consents.consents.health.granted).toBe(true);
  });

  it('shows a kind error when the choice cannot be saved', async () => {
    const testApp = createTestApp();
    renderApp('/profil/confidentialite', testApp);
    await screen.findAllByText('Pas encore choisi');
    testApp.consents.failing = true;

    fireEvent.click(switchFor('Notifications'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Impossible d’enregistrer');
    });
    expect(switchFor('Notifications')).toHaveAttribute('aria-checked', 'false');
  });
});
