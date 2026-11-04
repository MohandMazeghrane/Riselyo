import type { ReactNode } from 'react';
import { fr } from '../content/fr';

/** 3114, 15 and 112 as phone links: static, so they work offline and without the AI. */
export function HelpLines(): ReactNode {
  return (
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
  );
}
