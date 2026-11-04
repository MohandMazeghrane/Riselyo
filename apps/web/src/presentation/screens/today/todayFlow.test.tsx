import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestApp, type TestApp } from '../../../../test/fakes/testContainer';
import { finishedProfile, renderApp } from '../../../../test/renderApp';
import type { DayEntry } from '../../../domain/entities/dayEntry';
import type { DayKey } from '../../../domain/shared/dayKey';
import type { TimeOfDay } from '../../../domain/shared/timeOfDay';

const DAY = '2026-11-05' as DayKey;
const NO_QUICK = {
  waterGlasses: 0,
  walkMinutes: 0,
  workouts: 0,
  healthyMeals: 0,
  cravingsResisted: 0,
};

function readyApp(): TestApp {
  const testApp = createTestApp('2026-11-05', 9);
  testApp.profiles.profile = finishedProfile('Sam');
  return testApp;
}

function dayWith(priorityKept: boolean | null): DayEntry {
  const at = new Date('2026-11-05T07:00:00Z');
  return {
    day: DAY,
    morning: {
      bedtime: '23:00' as TimeOfDay,
      wakeTime: '07:00' as TimeOfDay,
      sleepQuality: 3,
      energy: 3,
      priority: { kind: 'free', text: 'Appeler Léa' },
      completedAt: at,
    },
    evening:
      priorityKept === null
        ? null
        : { mood: 4, stress: 2, priorityKept, victory: null, completedAt: at },
    quick: NO_QUICK,
  };
}

const tabBar = (): HTMLElement => screen.getByRole('navigation', { name: 'Navigation principale' });

describe('tab bar', () => {
  it('shows the five tabs, today being the current one', async () => {
    renderApp('/', readyApp());
    await screen.findByRole('heading', { name: 'Bonjour Sam' });

    const links = within(tabBar()).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Aujourd’hui',
      'Coach',
      'Progrès',
      'Bilans',
      'Profil',
    ]);
    expect(within(tabBar()).getByRole('link', { name: 'Aujourd’hui' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('opens a tab that comes later with what it will hold', async () => {
    renderApp('/', readyApp());
    await screen.findByRole('heading', { name: 'Bonjour Sam' });

    fireEvent.click(within(tabBar()).getByRole('link', { name: 'Progrès' }));

    expect(await screen.findByRole('heading', { name: 'Progrès' })).toBeInTheDocument();
    expect(screen.getByText('Bientôt disponible')).toBeInTheDocument();
    expect(within(tabBar()).getByRole('link', { name: 'Progrès' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('shows the profile as a tab, without a back link', async () => {
    renderApp('/profil', readyApp());

    expect(await screen.findByRole('heading', { name: 'Profil' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Retour' })).toBeNull();
  });

  it('sends back to the onboarding until it is finished, without the tab bar', async () => {
    renderApp('/coach', createTestApp());

    expect(
      await screen.findByRole('heading', { name: 'Bienvenue sur Riselyo' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('navigation', { name: 'Navigation principale' })).toBeNull();
  });

  it('is not shown on a check-in', async () => {
    renderApp('/check-in/matin', readyApp());

    await screen.findByLabelText('Heure de coucher');
    expect(screen.queryByRole('navigation', { name: 'Navigation principale' })).toBeNull();
  });
});

describe('priority of the day', () => {
  it('is shown once chosen in the morning check-in', async () => {
    const testApp = readyApp();
    testApp.dayEntries.entries.set(DAY, dayWith(null));
    renderApp('/', testApp);

    const card = await screen.findByRole('region', { name: 'Ta priorité du jour' });
    expect(card).toHaveTextContent('Appeler Léa');
    expect(card).not.toHaveTextContent('Tenue');
  });

  it('says whether it was kept after the evening check-in', async () => {
    const testApp = readyApp();
    testApp.dayEntries.entries.set(DAY, dayWith(false));
    renderApp('/', testApp);

    expect(await screen.findByRole('region', { name: 'Ta priorité du jour' })).toHaveTextContent(
      'Pas cette fois',
    );
  });

  it('is absent while there is none', async () => {
    renderApp('/', readyApp());
    await screen.findByRole('heading', { name: 'Bonjour Sam' });

    expect(screen.queryByText('Ta priorité du jour')).toBeNull();
  });
});
