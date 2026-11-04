import type { ReactNode } from 'react';
import { CONSENT_FORM } from '../../../application/privacy/consentForm';
import type { ConsentPurpose } from '../../../domain/entities/consent';
import { ConsentSwitch } from '../../components/ConsentSwitch';
import { fr } from '../../content/fr';

export interface ConsentItem {
  readonly purpose: ConsentPurpose;
  readonly granted: boolean;
  /** Shown under the switch; omitted during the onboarding, where nothing is decided yet. */
  readonly note?: string;
}

interface ConsentListProps {
  readonly items: readonly ConsentItem[];
  readonly disabled?: boolean;
  readonly onChange: (purpose: ConsentPurpose, granted: boolean) => void;
}

export function ConsentList({ items, disabled = false, onChange }: ConsentListProps): ReactNode {
  const isGranted = (purpose: ConsentPurpose): boolean =>
    items.some((item) => item.purpose === purpose && item.granted);
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const prerequisite = CONSENT_FORM.prerequisiteOf(item.purpose);
        const locked = prerequisite !== undefined && !isGranted(prerequisite);
        const note = locked ? fr.consents.journalNeedsAi : item.note;
        return (
          <li key={item.purpose}>
            <ConsentSwitch
              label={fr.consents.purposes[item.purpose].label}
              description={fr.consents.purposes[item.purpose].description}
              checked={item.granted}
              disabled={disabled || locked}
              {...(note === undefined ? {} : { note })}
              onChange={(granted) => {
                onChange(item.purpose, granted);
              }}
            />
          </li>
        );
      })}
    </ul>
  );
}
