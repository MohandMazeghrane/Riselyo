import type { ReactNode } from 'react';
import type { CheckInDay } from '../../../application/checkin/getCheckInDay';
import { useContainer } from '../../app/ContainerContext';
import { LoadState } from '../../components/LoadState';
import { useAsyncData } from '../../hooks/useAsyncData';

interface WithCheckInDayProps {
  readonly children: (day: CheckInDay) => ReactNode;
}

/** Loads today's check-ins, habits and rhythm before showing a check-in form. */
export function WithCheckInDay({ children }: WithCheckInDayProps): ReactNode {
  const day = useAsyncData(useContainer().checkIn.getDay);
  if (day.status !== 'ready') {
    return <LoadState status={day.status} onRetry={day.retry} />;
  }
  return children(day.data);
}
