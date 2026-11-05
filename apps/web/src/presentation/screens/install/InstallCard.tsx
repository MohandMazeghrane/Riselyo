import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../app/routes';
import { fr } from '../../content/fr';
import { useInstallState } from '../../hooks/useInstallState';

/**
 * First launch in Safari on an iPhone: suggests installing before anything is entered,
 * because the installed app does not share Safari's storage.
 */
export function InstallCard(): ReactNode {
  if (useInstallState() !== 'ios') {
    return null;
  }
  return (
    <section
      aria-label={fr.install.cardTitle}
      className="flex flex-col gap-2 rounded-2xl bg-brand-50 p-4 ring-1 ring-brand-100"
    >
      <h2 className="font-semibold">{fr.install.cardTitle}</h2>
      <p className="text-sm">{fr.install.cardText}</p>
      <Link
        to={ROUTES.install}
        className="flex min-h-11 items-center self-start font-medium text-brand-700 underline"
      >
        {fr.install.cardLink}
      </Link>
    </section>
  );
}
