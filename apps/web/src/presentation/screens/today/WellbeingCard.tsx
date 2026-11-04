import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { fr } from '../../content/fr';
import { useAsyncData } from '../../hooks/useAsyncData';

/**
 * A caring word after a hard week (low mood or very high stress), never a judgment.
 * If the week cannot be read, nothing is shown: the help lines stay in Profile.
 */
export function WellbeingCard(): ReactNode {
  const signal = useAsyncData(useContainer().safety.getWellbeingSignal);
  if (signal.status !== 'ready' || signal.data === null) {
    return null;
  }
  return (
    <section
      aria-label={fr.wellbeing.title}
      className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-100"
    >
      <h2 className="font-semibold">{fr.wellbeing.title}</h2>
      <p>{fr.wellbeing[signal.data]}</p>
      <p className="text-sm text-slate-600">{fr.wellbeing.help}</p>
      <Link
        to={ROUTES.help}
        className="flex min-h-11 items-center self-start font-medium text-brand-700"
      >
        {fr.wellbeing.link}
      </Link>
    </section>
  );
}
