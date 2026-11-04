import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { ROUTES } from '../../app/routes';
import { fr } from '../../content/fr';

/** Static on purpose: works offline and never depends on the AI (CLAUDE.md, section 10). */
export function HelpScreen(): ReactNode {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col gap-5 px-5 pt-[max(env(safe-area-inset-top),1.5rem)] pb-[max(env(safe-area-inset-bottom),1.5rem)]">
      <Link to={ROUTES.today} className="flex min-h-11 items-center font-medium text-brand-700">
        {fr.common.back}
      </Link>
      <h1 className="text-2xl font-bold">{fr.help.title}</h1>
      <p>{fr.help.intro}</p>
      <ul className="flex flex-col gap-3">
        {fr.help.lines.map((line) => (
          <li key={line.number}>
            <a
              href={`tel:${line.number}`}
              aria-label={fr.help.call(line.number)}
              className="flex min-h-16 items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200"
            >
              <span className="text-2xl font-bold text-brand-700">{line.number}</span>
              <span className="flex flex-col">
                <span className="font-semibold">{line.name}</span>
                <span className="text-sm text-slate-600">{line.detail}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-600">{fr.common.notAProfessional}</p>
    </main>
  );
}
