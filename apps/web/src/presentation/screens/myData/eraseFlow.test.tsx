import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createTestApp, type TestApp } from '../../../../test/fakes/testContainer';
import { finishedProfile, renderApp } from '../../../../test/renderApp';

function readyApp(): TestApp {
  const testApp = createTestApp('2026-11-05', 10);
  testApp.profiles.profile = finishedProfile('Sam');
  return testApp;
}

async function openConfirmation(): Promise<void> {
  fireEvent.click(await screen.findByRole('button', { name: 'Tout supprimer…' }));
}

const finalButton = (): HTMLElement =>
  screen.getByRole('button', { name: 'Effacer définitivement' });

describe('Profile → Mes données → Tout supprimer', () => {
  it('says what will be erased and that it is final', async () => {
    renderApp('/profil/donnees', readyApp());

    expect(await screen.findByRole('heading', { name: 'Tout supprimer' })).toBeInTheDocument();
    expect(screen.getByText(/C’est définitif : exporte une sauvegarde avant/)).toBeInTheDocument();
  });

  it('only unlocks the final button once SUPPRIMER is typed', async () => {
    const testApp = renderApp('/profil/donnees', readyApp());
    await openConfirmation();
    const field = screen.getByLabelText('Pour confirmer, écris SUPPRIMER');

    expect(finalButton()).toBeDisabled();
    fireEvent.change(field, { target: { value: 'suppr' } });
    expect(finalButton()).toBeDisabled();
    fireEvent.change(field, { target: { value: ' supprimer ' } });
    expect(finalButton()).toBeEnabled();
    expect(testApp.eraser.calls).toEqual([]);
  });

  it('erases everything, then starts again at the welcome screen', async () => {
    const testApp = renderApp('/profil/donnees', readyApp());
    await openConfirmation();
    fireEvent.change(screen.getByLabelText('Pour confirmer, écris SUPPRIMER'), {
      target: { value: 'SUPPRIMER' },
    });
    fireEvent.click(finalButton());

    expect(
      await screen.findByRole('heading', { name: 'Bienvenue sur Riselyo' }),
    ).toBeInTheDocument();
    expect(testApp.eraser.calls).toEqual(['database', 'caches']);
  });

  it('can be cancelled', async () => {
    const testApp = renderApp('/profil/donnees', readyApp());
    await openConfirmation();
    fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));

    expect(screen.queryByLabelText('Pour confirmer, écris SUPPRIMER')).toBeNull();
    expect(testApp.eraser.calls).toEqual([]);
  });

  it('says so when the erasure fails, and stays on the page', async () => {
    const testApp = readyApp();
    testApp.eraser.failing = 'database';
    renderApp('/profil/donnees', testApp);
    await openConfirmation();
    fireEvent.change(screen.getByLabelText('Pour confirmer, écris SUPPRIMER'), {
      target: { value: 'SUPPRIMER' },
    });
    fireEvent.click(finalButton());

    expect(await screen.findByRole('alert')).toHaveTextContent('n’a pas pu aller jusqu’au bout');
    expect(screen.getByRole('heading', { name: 'Mes données' })).toBeInTheDocument();
  });
});
