import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestApp, type TestApp } from '../../../../test/fakes/testContainer';
import { finishedProfile, renderApp } from '../../../../test/renderApp';
import type { Habit, HabitTemplateId } from '../../../domain/entities/habit';
import type { HabitLevel } from '../../../domain/entities/habitLog';
import type { DayKey } from '../../../domain/shared/dayKey';

const DAY = '2026-11-05' as DayKey;

function habit(templateId: HabitTemplateId, kind: Habit['kind'] = 'do'): Habit {
  return { templateId, kind, tier: kind === 'do' ? 'min' : 'normal', active: true, createdOn: DAY };
}

function readyApp(): TestApp {
  const testApp = createTestApp('2026-11-05', 9);
  testApp.profiles.profile = finishedProfile('Sam');
  testApp.habits.habits = [habit('walk'), habit('snacking', 'reduce')];
  return testApp;
}

const log = (templateId: HabitTemplateId, day: string, level: HabitLevel) => ({
  templateId,
  day: day as DayKey,
  level,
});

describe('habits on the home screen', () => {
  it('changes the level of the day with each tap', async () => {
    const testApp = renderApp('/', readyApp());

    fireEvent.click(
      await screen.findByRole('button', { name: 'Marcher : À noter. Toucher pour changer.' }),
    );
    fireEvent.click(
      await screen.findByRole('button', { name: 'Marcher : Minimum. Toucher pour changer.' }),
    );

    expect(
      await screen.findByRole('button', { name: 'Marcher : Normal. Toucher pour changer.' }),
    ).toHaveTextContent('Objectif : 10 min');
    expect(testApp.habitLogs.logs).toEqual([log('walk', DAY, 'normal')]);
  });

  it('shows the days without for a habit to reduce', async () => {
    const testApp = readyApp();
    testApp.habitLogs.logs = [
      log('snacking', '2026-11-03', 'normal'),
      log('snacking', '2026-11-04', 'normal'),
    ];
    renderApp('/', testApp);

    expect(await screen.findByRole('button', { name: /^Grignotage/ })).toHaveTextContent(
      '2 jours sans',
    );
    fireEvent.click(screen.getByRole('button', { name: /^Grignotage/ }));
    expect(
      await screen.findByRole('button', {
        name: 'Grignotage : Journée sans. Toucher pour changer.',
      }),
    ).toHaveTextContent('3 jours sans');
  });

  it('adds with the quick buttons and undoes a mistake', async () => {
    const testApp = renderApp('/', readyApp());

    fireEvent.click(await screen.findByRole('button', { name: '+1 verre d’eau (0 verre)' }));
    fireEvent.click(await screen.findByRole('button', { name: '+1 verre d’eau (1 verre)' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Retirer 1 verre d’eau' }));

    await waitFor(() => {
      expect(testApp.dayEntries.entries.get(DAY)?.quick.waterGlasses).toBe(1);
    });
    expect(
      await screen.findByRole('button', { name: '+1 verre d’eau (1 verre)' }),
    ).toBeInTheDocument();
  });

  it('says so when saving fails', async () => {
    const testApp = renderApp('/', readyApp());
    await screen.findByRole('button', { name: /^Marcher/ });
    testApp.habitLogs.failing = true;

    fireEvent.click(screen.getByRole('button', { name: /^Marcher/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible d’enregistrer');
  });
});

describe('evening check-in', () => {
  it('pre-fills the walk from the minutes added on the home screen', async () => {
    const testApp = readyApp();
    testApp.dayEntries.entries.set(DAY, {
      day: DAY,
      morning: null,
      evening: null,
      quick: {
        waterGlasses: 0,
        walkMinutes: 30,
        workouts: 0,
        healthyMeals: 0,
        cravingsResisted: 0,
      },
    });
    renderApp('/check-in/soir', testApp);

    const walk = await screen.findByRole('group', { name: 'Marcher' });
    expect(within(walk).getByRole('radio', { name: 'Normal' })).toBeChecked();
    const snacking = screen.getByRole('group', { name: 'Grignotage' });
    expect(within(snacking).getByRole('radio', { name: 'Journée sans' })).not.toBeChecked();
  });
});

describe('profile → my habits', () => {
  it('moves the target tier of a habit', async () => {
    const testApp = renderApp('/profil/habitudes', readyApp());

    const target = await screen.findByRole('group', { name: 'Palier visé pour « Marcher »' });
    fireEvent.click(within(target).getByRole('radio', { name: 'Normal : 30 min' }));

    await waitFor(() => {
      expect(testApp.habits.habits.find(({ templateId }) => templateId === 'walk')?.tier).toBe(
        'normal',
      );
    });
  });

  it('asks before stopping a habit', async () => {
    const testApp = renderApp('/profil/habitudes', readyApp());

    const walk = await screen.findByRole('article', { name: 'Marcher' });
    fireEvent.click(within(walk).getByRole('button', { name: 'Arrêter' }));
    expect(
      screen.getByText('Arrêter « Marcher » ? Ton historique est conservé.'),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Oui, arrêter' }));

    await waitFor(() => {
      expect(testApp.habits.habits.find(({ templateId }) => templateId === 'walk')?.active).toBe(
        false,
      );
    });
  });

  it('explains why a new habit to build must wait, and allows a habit to reduce', async () => {
    const testApp = renderApp('/profil/habitudes', readyApp());

    expect(await screen.findByText(/Note tes habitudes encore 3 soirs/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Ajouter « Lire »' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter « Tabac »' }));

    await waitFor(() => {
      expect(testApp.habits.habits.some(({ templateId }) => templateId === 'tobacco')).toBe(true);
    });
  });

  it('allows a new habit once the current ones hold', async () => {
    const testApp = readyApp();
    testApp.habitLogs.logs = ['2026-11-02', '2026-11-03', '2026-11-04'].map((day) =>
      log('walk', day, 'min'),
    );
    renderApp('/profil/habitudes', testApp);

    fireEvent.click(await screen.findByRole('button', { name: 'Ajouter « Lire »' }));

    await waitFor(() => {
      expect(testApp.habits.habits.some(({ templateId }) => templateId === 'read')).toBe(true);
    });
  });

  it('is reachable from the profile', async () => {
    renderApp('/profil', readyApp());

    expect(await screen.findByRole('link', { name: /Mes habitudes/ })).toHaveAttribute(
      'href',
      '/profil/habitudes',
    );
  });
});
