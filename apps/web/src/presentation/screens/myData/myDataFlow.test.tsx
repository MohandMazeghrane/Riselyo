import { fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTestApp, type TestApp } from '../../../../test/fakes/testContainer';
import { finishedProfile, renderApp } from '../../../../test/renderApp';

const saved: { name: string; blob: Blob }[] = [];

beforeEach(() => {
  saved.length = 0;
  let lastBlob = new Blob();
  vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
    lastBlob = blob as Blob;
    return 'blob:riselyo';
  });
  vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement,
  ) {
    saved.push({ name: this.download, blob: lastBlob });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

function readyApp(): TestApp {
  const testApp = createTestApp('2026-11-05', 10);
  testApp.profiles.profile = finishedProfile('Sam');
  return testApp;
}

const chooseFile = (content: string, name = 'riselyo-sauvegarde.json'): void => {
  fireEvent.change(screen.getByLabelText('Choisir un fichier'), {
    target: { files: [new File([content], name, { type: 'application/json' })] },
  });
};

describe('Profile → Mes données', () => {
  it('is reachable from the profile', async () => {
    renderApp('/profil', readyApp());
    fireEvent.click(await screen.findByRole('link', { name: /Mes données/ }));

    expect(await screen.findByRole('heading', { name: 'Mes données' })).toBeInTheDocument();
    expect(screen.getByText(/données en clair/)).toBeInTheDocument();
  });

  it('downloads the full backup as a JSON file named after today', async () => {
    renderApp('/profil/donnees', readyApp());
    fireEvent.click(await screen.findByRole('button', { name: /sauvegarde complète/ }));

    await waitFor(() => {
      expect(saved.map(({ name }) => name)).toEqual(['riselyo-sauvegarde-2026-11-05.json']);
    });
    expect(await saved[0]?.blob.text()).toMatch(/^\{"app":"riselyo"\}@/);
  });

  it('downloads the days as a CSV with French headers', async () => {
    renderApp('/profil/donnees', readyApp());
    fireEvent.click(await screen.findByRole('button', { name: /mes journées/ }));

    await waitFor(() => {
      expect(saved.map(({ name }) => name)).toEqual(['riselyo-journees-2026-11-05.csv']);
    });
    expect(await saved[0]?.blob.text()).toContain('Date;Coucher;Réveil');
  });

  it('says so when the file cannot be built', async () => {
    const testApp = readyApp();
    testApp.backup.failing = true;
    renderApp('/profil/donnees', testApp);
    fireEvent.click(await screen.findByRole('button', { name: /sauvegarde complète/ }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Impossible de préparer le fichier');
    expect(saved).toHaveLength(0);
  });

  it('restores a backup only after confirmation, then opens today', async () => {
    const testApp = renderApp('/profil/donnees', readyApp());
    await screen.findByRole('heading', { name: 'Mes données' });

    chooseFile('{"app":"riselyo"}');
    expect(
      await screen.findByText(/seront remplacées par celles de « riselyo-sauvegarde.json »/),
    ).toBeInTheDocument();
    expect(testApp.backup.restored).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Remplacer mes données' }));

    expect(await screen.findByRole('heading', { name: 'Bonjour Sam' })).toBeInTheDocument();
    expect(testApp.backup.restored).toBe('{"app":"riselyo"}');
  });

  it('can be cancelled', async () => {
    const testApp = renderApp('/profil/donnees', readyApp());
    await screen.findByRole('heading', { name: 'Mes données' });

    chooseFile('{}');
    fireEvent.click(await screen.findByRole('button', { name: 'Annuler' }));

    expect(screen.queryByRole('button', { name: 'Remplacer mes données' })).toBeNull();
    expect(testApp.backup.restored).toBeNull();
  });

  it('explains why a file is refused', async () => {
    const testApp = readyApp();
    testApp.backup.refusal = 'newer_version';
    renderApp('/profil/donnees', testApp);
    await screen.findByRole('heading', { name: 'Mes données' });

    chooseFile('{}');
    fireEvent.click(await screen.findByRole('button', { name: 'Remplacer mes données' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('version plus récente de Riselyo');
  });
});
