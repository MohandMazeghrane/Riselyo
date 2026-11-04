import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { LoadState } from '../../components/LoadState';
import { fr } from '../../content/fr';
import { useAsyncData } from '../../hooks/useAsyncData';

/** The two check-ins of the day, with what is already done. */
export function CheckInCards(): ReactNode {
  const day = useAsyncData(useContainer().checkIn.getDay);
  if (day.status !== 'ready') {
    return <LoadState status={day.status} onRetry={day.retry} />;
  }
  const { morning, evening } = day.data.entry;
  return (
    <ul className="grid grid-cols-2 gap-3">
      <li>
        <CheckInCard
          to={ROUTES.morningCheckIn}
          title={fr.checkIn.morningTitle}
          done={morning !== null}
        />
      </li>
      <li>
        <CheckInCard
          to={ROUTES.eveningCheckIn}
          title={fr.checkIn.eveningTitle}
          done={evening !== null}
        />
      </li>
    </ul>
  );
}

interface CheckInCardProps {
  readonly to: string;
  readonly title: string;
  readonly done: boolean;
}

function CheckInCard({ to, title, done }: CheckInCardProps): ReactNode {
  const card = done ? 'bg-white text-slate-900 ring-1 ring-slate-200' : 'bg-brand-600 text-white';
  return (
    <Link
      to={to}
      className={`flex min-h-24 flex-col justify-between rounded-2xl p-4 shadow-sm ${card}`}
    >
      <span className="font-semibold">{title}</span>
      <span className={`text-sm ${done ? 'text-slate-600' : 'text-brand-50'}`}>
        {done ? `${fr.checkIn.done} · ${fr.checkIn.redo}` : fr.checkIn.toDo}
      </span>
    </Link>
  );
}
