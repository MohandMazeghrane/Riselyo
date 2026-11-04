import { fireEvent, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestApp } from '../../../../test/fakes/testContainer';
import { finishedProfile, renderApp } from '../../../../test/renderApp';

const next = (): void => {
  fireEvent.click(screen.getByRole('button', { name: 'Suivant' }));
};

async function passWelcome(firstName = 'Sam'): Promise<void> {
  fireEvent.change(await screen.findByLabelText('Ton prénom'), { target: { value: firstName } });
  next();
  await screen.findByRole('heading', { name: 'Ta roue de vie' });
}

function scoreEveryDomain(score: string): void {
  for (const group of screen.getAllByRole('group')) {
    fireEvent.click(within(group).getByRole('radio', { name: score }));
  }
}

describe('onboarding part A', () => {
  it('goes from the welcome screen to today', async () => {
    const testApp = renderApp('/demarrage');
    await passWelcome('Sam');

    expect(screen.getByRole('button', { name: 'Suivant' })).toBeDisabled();
    scoreEveryDomain('7');
    next();
    expect(await screen.findByRole('img', { name: /Roue de vie/ })).toBeInTheDocument();
    next();

    fireEvent.click(await screen.findByRole('button', { name: 'Passer' }));
    expect(await screen.findByLabelText('Heure de réveil habituelle (semaine)')).toHaveValue(
      '07:00',
    );
    next();

    fireEvent.change(await screen.findByLabelText(/parce que/), { target: { value: 'pour moi' } });
    next();

    fireEvent.click(await screen.findByRole('checkbox', { name: /Marcher/ }));
    fireEvent.click(screen.getByRole('button', { name: 'C’est parti' }));

    expect(await screen.findByRole('heading', { name: 'Bonjour Sam' })).toBeInTheDocument();
    expect(testApp.profiles.profile?.why).toBe('pour moi');
    expect(testApp.habits.habits.map((habit) => habit.templateId)).toEqual(['walk']);
  });

  it('asks for a first name before going on', async () => {
    renderApp('/demarrage');

    fireEvent.click(await screen.findByRole('button', { name: 'Suivant' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Indique ton prénom');
  });

  it('counts the domains still to score', async () => {
    renderApp('/demarrage');
    await passWelcome();

    expect(screen.getByText('Encore 8 domaines à noter.')).toBeInTheDocument();
  });

  it('rejects an implausible measurement kindly', async () => {
    const testApp = createTestApp();
    testApp.profiles.profile = { ...finishedProfile(), completedSteps: ['welcome', 'lifeWheel'] };
    renderApp('/demarrage/mesures', testApp);

    fireEvent.change(screen.getByLabelText('Poids (kg)'), { target: { value: '900' } });
    next();

    expect(await screen.findByText(/Une valeur semble incorrecte/)).toBeInTheDocument();
    expect(testApp.measurements.saved.size).toBe(0);
  });

  it('gently warns about a very short night without blocking', async () => {
    const testApp = createTestApp();
    testApp.profiles.profile = finishedProfile();
    renderApp('/demarrage/rythme', testApp);

    fireEvent.change(await screen.findByLabelText('Heure de coucher cible'), {
      target: { value: '03:00' },
    });

    expect(screen.getByText(/Moins de 5 h de sommeil/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Suivant' })).toBeEnabled();
  });

  it('refuses a 4th goal with the message of the specification', () => {
    const testApp = createTestApp();
    testApp.profiles.profile = finishedProfile();
    renderApp('/demarrage/objectifs', testApp);

    for (const name of [/Marcher/, /Lire/, /Ranger/, /Pas d’alcool/]) {
      fireEvent.click(screen.getByRole('checkbox', { name }));
    }

    expect(screen.getByText(/Trois pour commencer/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: /Pas d’alcool/ })).not.toBeChecked();
    expect(screen.getByText('Pour commencer : journée sans')).toBeInTheDocument();
  });
});
