import { useState } from 'react';
import { currentBrowserFacts, installStateOf, type InstallState } from '../platform/installState';

/** Read once: how the app is opened does not change while it runs. */
export function useInstallState(): InstallState {
  const [state] = useState(() => installStateOf(currentBrowserFacts()));
  return state;
}
