import { createContext, useContext, type ReactNode } from 'react';
import type { AppContainer } from './container';

const ContainerContext = createContext<AppContainer | null>(null);

interface ContainerProviderProps {
  readonly container: AppContainer;
  readonly children: ReactNode;
}

export function ContainerProvider({ container, children }: ContainerProviderProps): ReactNode {
  return <ContainerContext.Provider value={container}>{children}</ContainerContext.Provider>;
}

export function useContainer(): AppContainer {
  const container = useContext(ContainerContext);
  if (container === null) {
    throw new Error('useContainer must be used inside ContainerProvider');
  }
  return container;
}
