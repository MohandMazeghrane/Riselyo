import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestApp, type TestApp } from '../../../../test/fakes/testContainer';
import { finishedProfile, renderApp } from '../../../../test/renderApp';
import type { Habit } from '../../../domain/entities/habit';
import type { DayKey } from '../../../domain/shared/dayKey';
import type { TimeOfDay } from '../../../domain/shared/timeOfDay';

const DAY = '2026-11-05' as DayKey;

function habit(templateId: Habit['templateId'], tier: Habit['tier']): Habit {
  return { templateId, kind: 'do', tier, active: true, createdOn: DAY };
}

function readyApp(): TestApp {
  const testApp = createTestApp('2026-11-05', 9);
  testApp.profiles.profile = {
    ...finishedProfile('Sam'),
    rhythm: {
      bedtime: '22:45' as TimeOfDay,
      wakeTime: '06:30' as TimeOfDay,
      sleepTargetMinutes: 465,
      eveningCheckInTime: '21:30' as TimeOfDay,
      sportDays: [],
    },
  };
  testApp.habits.habits = [habit('walk', 'min'), habit('noAlcohol', 'normal')];
  return testApp;
}

const answer = (groupName: string, choice: string): void => {
  fireEvent.click(
    within(screen.getByRole('group', { name: groupName })).getByRole('radio', { name: choice }),
  );
};

const save = (): void => {
  fireEvent.click(screen.getByRole('button', { name: 'Valider' }));
};

describe('today', () => {
  it('shows both check-ins still to do', async () => {
    renderApp('/', readyApp());

    expect(await screen.findByRole('link', { name: /Check-in du matin/ })).toHaveTextContent(
      'À faire',
    );
    expect(screen.getByRole('link', { name: /Check-in du soir/ })).toHaveTextContent('À faire');
  });
});

describe('morning check-in', () => {
  it('pre-fills last night with the usual rhythm', async () => {
    renderApp('/check-in/matin', readyApp());

    expect(await screen.findByLabelText('Heure de coucher')).toHaveValue('22:45');
    expect(screen.getByLabelText('Heure de réveil')).toHaveValue('06:30');
    expect(screen.getByText('Environ 7 h 45 de sommeil')).toBeInTheDocument();
  });

  it('asks again kindly when a rating is missing', async () => {
    const testApp = readyApp();
    renderApp('/check-in/matin', testApp);
    await screen.findByLabelText('Heure de coucher');

    save();

    expect(await screen.findByRole('alert')).toHaveTextContent('Il manque une réponse');
    expect(testApp.dayEntries.entries.size).toBe(0);
  });

  it('saves the answers with a goal as priority and goes back to today', async () => {
    const testApp = readyApp();
    renderApp('/check-in/matin', testApp);
    await screen.findByLabelText('Heure de coucher');

    answer('Qualité du sommeil', '4');
    answer('Énergie', '3');
    fireEvent.click(screen.getByRole('radio', { name: 'Marcher' }));
    save();

    expect(await screen.findByRole('link', { name: /Check-in du matin/ })).toHaveTextContent(
      'Fait',
    );
    expect(testApp.dayEntries.entries.get(DAY)?.morning).toMatchObject({
      sleepQuality: 4,
      energy: 3,
      priority: { kind: 'habit', templateId: 'walk' },
    });
  });

  it('accepts a priority written freely', async () => {
    const testApp = readyApp();
    renderApp('/check-in/matin', testApp);
    await screen.findByLabelText('Heure de coucher');
    answer('Qualité du sommeil', '2');
    answer('Énergie', '2');

    fireEvent.click(screen.getByRole('radio', { name: 'Autre chose' }));
    fireEvent.change(screen.getByLabelText('Ta priorité'), { target: { value: 'Appeler maman' } });
    save();

    await screen.findByRole('link', { name: /Check-in du matin/ });
    expect(testApp.dayEntries.entries.get(DAY)?.morning?.priority).toEqual({
      kind: 'free',
      text: 'Appeler maman',
    });
  });
});

describe('evening check-in', () => {
  it('offers the levels each habit has, without "Minimum" for no alcohol', async () => {
    renderApp('/check-in/soir', readyApp());

    const alcohol = await screen.findByRole('group', { name: 'Pas d’alcool' });
    expect(within(alcohol).queryByRole('radio', { name: 'Minimum' })).toBeNull();
    expect(
      within(screen.getByRole('group', { name: 'Marcher' })).getByRole('radio', {
        name: 'Minimum',
      }),
    ).toBeInTheDocument();
  });

  it('only asks about the priority when there was one this morning', async () => {
    renderApp('/check-in/soir', readyApp());
    await screen.findByRole('group', { name: 'Ton humeur' });

    expect(screen.queryByText(/As-tu tenu ta priorité/)).toBeNull();
  });

  it('saves mood, stress, habits, priority and victory', async () => {
    const testApp = readyApp();
    testApp.dayEntries.entries.set(DAY, {
      day: DAY,
      morning: {
        bedtime: '23:00' as TimeOfDay,
        wakeTime: '07:00' as TimeOfDay,
        sleepQuality: 3,
        energy: 3,
        priority: { kind: 'habit', templateId: 'walk' },
        completedAt: new Date('2026-11-05T07:00:00Z'),
      },
      evening: null,
      quick: { waterGlasses: 0, walkMinutes: 0, workouts: 0, healthyMeals: 0, cravingsResisted: 0 },
    });
    renderApp('/check-in/soir', testApp);
    await screen.findByRole('group', { name: 'Ton humeur' });

    answer('Ton humeur', 'Bien');
    answer('Ton stress', '2');
    answer('Marcher', 'Normal');
    answer('As-tu tenu ta priorité : « Marcher » ?', 'Oui');
    fireEvent.change(screen.getByLabelText('Ta victoire du jour (facultatif)'), {
      target: { value: 'Sorti malgré la pluie' },
    });
    save();

    expect(await screen.findByRole('link', { name: /Check-in du soir/ })).toHaveTextContent('Fait');
    expect(testApp.dayEntries.entries.get(DAY)?.evening).toMatchObject({
      mood: 4,
      stress: 2,
      priorityKept: true,
      victory: 'Sorti malgré la pluie',
    });
    expect(testApp.habitLogs.logs).toEqual([{ templateId: 'walk', day: DAY, level: 'normal' }]);
  });
});
