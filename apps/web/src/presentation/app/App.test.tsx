import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createTestApp } from '../../../test/fakes/testContainer';
import { App } from './App';
import { ContainerProvider } from './ContainerContext';

function renderAppOn(isoDay: string, hour: number): void {
  render(
    <ContainerProvider container={createTestApp(isoDay, hour).container}>
      <App />
    </ContainerProvider>,
  );
}

describe('App', () => {
  it('greets the user in French with the current day', () => {
    renderAppOn('2026-11-04', 10);

    expect(screen.getByRole('heading', { level: 1, name: 'Bonjour' })).toBeInTheDocument();
    expect(screen.getByText('mercredi 4 novembre')).toBeInTheDocument();
  });

  it('shows the previous day in the middle of the night', () => {
    renderAppOn('2026-11-04', 2);

    expect(screen.getByText('mardi 3 novembre')).toBeInTheDocument();
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

    expect(() => render(<App />)).toThrow('useContainer must be used inside ContainerProvider');

    window.removeEventListener('error', silenceExpectedCrash);
  });
});
