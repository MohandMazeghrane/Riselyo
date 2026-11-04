import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { DayKey } from '../src/domain/shared/dayKey';
import type { Profile } from '../src/domain/entities/profile';
import { App } from '../src/presentation/app/App';
import { ContainerProvider } from '../src/presentation/app/ContainerContext';
import { createTestApp, type TestApp } from './fakes/testContainer';

/** Renders the whole app at `path`, wired to in-memory repositories. */
export function renderApp(path = '/', testApp: TestApp = createTestApp()): TestApp {
  render(
    <ContainerProvider container={testApp.container}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ContainerProvider>,
  );
  return testApp;
}

export function finishedProfile(firstName = 'Sam'): Profile {
  return {
    firstName,
    dayZero: '2026-11-04' as DayKey,
    why: null,
    rhythm: null,
    completedSteps: ['welcome', 'lifeWheel', 'measurements', 'rhythm', 'why', 'goals'],
  };
}
