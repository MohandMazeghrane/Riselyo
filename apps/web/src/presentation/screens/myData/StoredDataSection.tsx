import type { ReactNode } from 'react';
import { STORED_DATA_ORDER } from '../../../application/privacy/getStoredData';
import { useContainer } from '../../app/ContainerContext';
import { LoadState } from '../../components/LoadState';
import { fr } from '../../content/fr';
import { useAsyncData } from '../../hooks/useAsyncData';

/** Transparency (CLAUDE.md, section 12): what is kept, counted for real, and where it goes. */
export function StoredDataSection(): ReactNode {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{fr.myData.storedTitle}</h2>
      <p>{fr.myData.storedIntro}</p>
      <StoredCounts />
      <h2 className="mt-2 text-lg font-semibold">{fr.myData.whereTitle}</h2>
      <ul className="flex flex-col gap-2">
        {fr.myData.places.map((place) => (
          <li key={place.name} className="rounded-2xl bg-white p-4 ring-1 ring-slate-200">
            <p className="font-semibold">{place.name}</p>
            <p className="text-sm text-slate-600">{place.detail}</p>
          </li>
        ))}
      </ul>
      <p className="text-sm text-slate-600">{fr.myData.noTracking}</p>
    </section>
  );
}

function StoredCounts(): ReactNode {
  const counts = useAsyncData(useContainer().privacy.getStoredData);
  if (counts.status !== 'ready') {
    return <LoadState status={counts.status} onRetry={counts.retry} />;
  }
  return (
    <ul className="flex flex-col gap-1 rounded-2xl bg-white p-4 ring-1 ring-slate-200">
      {STORED_DATA_ORDER.map((kind) => (
        <li key={kind}>{fr.myData.stored[kind](counts.data[kind])}</li>
      ))}
    </ul>
  );
}
