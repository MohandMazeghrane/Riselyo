import { useMemo } from 'react';
import { useContainer } from '../app/ContainerContext';

const DAY_LABEL_FORMAT = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
});

/** Human label of the current Riselyo day, e.g. « mercredi 4 novembre ». */
export function useCurrentDayLabel(): string {
  const { getCurrentDay } = useContainer();
  const day = getCurrentDay();
  return useMemo(() => DAY_LABEL_FORMAT.format(new Date(`${day}T00:00:00Z`)), [day]);
}
