import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestApp, type TestApp } from '../../../../test/fakes/testContainer';
import { finishedProfile, renderApp } from '../../../../test/renderApp';
import type { DayEntry } from '../../../domain/entities/dayEntry';
import type { DayKey } from '../../../domain/shared/dayKey';

const NO_QUICK = {
  waterGlasses: 0,
  walkMinutes: 0,
  workouts: 0,
  healthyMeals: 0,
  cravingsResisted: 0,
};
const AT = new Date('2026-11-05T20:00:00Z');

function readyApp(): TestApp {
  const testApp = createTestApp('2026-11-05', 21);
  testApp.profiles.profile = finishedProfile('Sam');
  return testApp;
}

function eveningOn(day: string, mood: number): DayEntry {
  return {
    day: day as DayKey,
    morning: null,
    evening: { mood, stress: 3, priorityKept: null, victory: null, completedAt: AT },
    quick: NO_QUICK,
  };
}

const banner = (): HTMLElement | null =>
  screen.queryByRole('alert', { name: 'Tu peux en parler maintenant' });

describe('help banner on what the user types', () => {
  it('appears under the victory of the day, and never blocks saving', async () => {
    const testApp = renderApp('/check-in/soir', readyApp());
    const victory = await screen.findByLabelText('Ta victoire du jour (facultatif)');

    fireEvent.change(victory, { target: { value: 'rien, je veux disparaître' } });

    const help = screen.getByRole('alert', { name: 'Tu peux en parler maintenant' });
    expect(within(help).getByRole('link', { name: 'Appeler le 3114' })).toHaveAttribute(
      'href',
      'tel:3114',
    );
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Ton humeur' })).getByRole('radio', {
        name: 'Très mal',
      }),
    );
    fireEvent.click(
      within(screen.getByRole('group', { name: 'Ton stress' })).getByRole('radio', { name: '5' }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Valider' }));
    await waitFor(() => {
      expect(testApp.dayEntries.entries.get('2026-11-05' as DayKey)?.evening?.victory).toBe(
        'rien, je veux disparaître',
      );
    });
  });

  it('stays hidden for an ordinary sentence, and leaves when the text changes', async () => {
    renderApp('/check-in/soir', readyApp());
    const victory = await screen.findByLabelText('Ta victoire du jour (facultatif)');

    fireEvent.change(victory, { target: { value: 'j’en peux plus' } });
    expect(banner()).not.toBeNull();
    fireEvent.change(victory, { target: { value: 'J’ai marché 30 minutes' } });
    expect(banner()).toBeNull();
  });

  it('appears under a free priority in the morning', async () => {
    renderApp('/check-in/matin', readyApp());
    fireEvent.click(await screen.findByRole('radio', { name: 'Autre chose' }));

    fireEvent.change(screen.getByLabelText('Ta priorité'), {
      target: { value: 'en finir avec la vie' },
    });

    expect(banner()).not.toBeNull();
  });

  it('appears under the « pourquoi » of the onboarding', async () => {
    renderApp('/demarrage/pourquoi', readyApp());

    fireEvent.change(await screen.findByLabelText('Je veux me reprendre en main parce que…'), {
      target: { value: 'sinon j’ai des idées noires' },
    });

    expect(banner()).not.toBeNull();
  });
});

describe('caring card on the home screen', () => {
  it('shows after a week of low mood, with a way to the help lines', async () => {
    const testApp = readyApp();
    for (const day of ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05']) {
      testApp.dayEntries.entries.set(day as DayKey, eveningOn(day, 2));
    }
    renderApp('/', testApp);

    const card = await screen.findByRole('region', { name: 'On pense à toi' });
    expect(card).toHaveTextContent('Ton humeur est basse depuis plusieurs jours.');
    fireEvent.click(within(card).getByRole('link', { name: 'Voir les numéros d’aide' }));
    expect(await screen.findByRole('heading', { name: 'Besoin d’aide' })).toBeInTheDocument();
  });

  it('is absent on ordinary days', async () => {
    const testApp = readyApp();
    testApp.dayEntries.entries.set('2026-11-05' as DayKey, eveningOn('2026-11-05', 4));
    renderApp('/', testApp);
    await screen.findByRole('heading', { name: 'Bonjour Sam' });

    expect(screen.queryByRole('region', { name: 'On pense à toi' })).toBeNull();
  });
});

describe('help page', () => {
  it('is reachable from the profile and lists 3114, 15 and 112', async () => {
    renderApp('/profil', readyApp());

    expect(await screen.findByText(/pas un professionnel de santé/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: /Besoin d’aide/ }));

    for (const number of ['3114', '15', '112']) {
      expect(await screen.findByRole('link', { name: `Appeler le ${number}` })).toHaveAttribute(
        'href',
        `tel:${number}`,
      );
    }
  });
});
