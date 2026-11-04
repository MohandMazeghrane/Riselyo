import { useId, type ReactNode } from 'react';
import { Link } from 'react-router';
import type { DailyPriority } from '../../../domain/entities/dayEntry';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { LoadState } from '../../components/LoadState';
import { fr } from '../../content/fr';
import { useAsyncData } from '../../hooks/useAsyncData';
import { priorityLabel } from '../checkin/checkInDrafts';

/** The priority chosen this morning, then the two check-ins with what is already done. */
export function DayCheckIns(): ReactNode {
  const day = useAsyncData(useContainer().checkIn.getDay);
  if (day.status !== 'ready') {
    return <LoadState status={day.status} onRetry={day.retry} />;
  }
  const { morning, evening } = day.data.entry;
  const priority = morning?.priority ?? null;
  return (
    <>
      {priority !== null && (
        <PriorityCard priority={priority} kept={evening?.priorityKept ?? null} />
      )}
      <CheckInCardList morningDone={morning !== null} eveningDone={evening !== null} />
    </>
  );
}

interface PriorityCardProps {
  readonly priority: DailyPriority;
  readonly kept: boolean | null;
}

function PriorityCard({ priority, kept }: PriorityCardProps): ReactNode {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
    >
      <h2 id={titleId} className="text-sm font-medium text-slate-600">
        {fr.home.priorityTitle}
      </h2>
      <p className="mt-1 text-lg font-semibold">{priorityLabel(priority)}</p>
      {kept !== null && (
        <p className="mt-1 text-sm text-brand-700">
          {kept ? fr.home.priorityKept : fr.home.priorityNotKept}
        </p>
      )}
    </section>
  );
}

function CheckInCardList(props: { morningDone: boolean; eveningDone: boolean }): ReactNode {
  return (
    <ul className="grid grid-cols-2 gap-3">
      <li>
        <CheckInCard
          to={ROUTES.morningCheckIn}
          title={fr.checkIn.morningTitle}
          done={props.morningDone}
        />
      </li>
      <li>
        <CheckInCard
          to={ROUTES.eveningCheckIn}
          title={fr.checkIn.eveningTitle}
          done={props.eveningDone}
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
