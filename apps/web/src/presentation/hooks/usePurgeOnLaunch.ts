import { useEffect } from 'react';
import { useContainer } from '../app/ContainerContext';

/**
 * Purges expired data once when the app starts (CLAUDE.md, section 12). Silent on purpose:
 * a failed purge is retried at the next launch and never blocks the app.
 */
export function usePurgeOnLaunch(): void {
  const { purgeExpiredData } = useContainer().privacy;
  useEffect(() => {
    void purgeExpiredData();
  }, [purgeExpiredData]);
}
