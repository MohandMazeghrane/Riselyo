import { useState, type ReactNode } from 'react';
import { CONSENT_FORM } from '../../../application/privacy/consentForm';
import type { ConsentPurpose, ConsentSet } from '../../../domain/entities/consent';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { FormMessage } from '../../components/FormMessage';
import { LoadState } from '../../components/LoadState';
import { PageLayout } from '../../components/PageLayout';
import { fr } from '../../content/fr';
import { useAsyncData } from '../../hooks/useAsyncData';
import { ConsentList } from './ConsentList';
import { decisionNote } from './decisionNote';

/** Profile → Confidentialité: each switch is saved and dated right away. */
export function PrivacyScreen(): ReactNode {
  const consents = useAsyncData(useContainer().privacy.getConsents);
  if (consents.status !== 'ready') {
    return <LoadState status={consents.status} onRetry={consents.retry} />;
  }
  return <PrivacySettings initial={consents.data} />;
}

function PrivacySettings({ initial }: { readonly initial: ConsentSet }): ReactNode {
  const { consents, pending, failed, change } = useConsentUpdates(initial);
  return (
    <PageLayout title={fr.consents.privacyTitle} backTo={ROUTES.profile}>
      <FormMessage tone="info">{fr.consents.localTracking}</FormMessage>
      {failed && <FormMessage tone="error">{fr.common.saveError}</FormMessage>}
      <ConsentList
        items={CONSENT_FORM.purposes.map((purpose) => ({
          purpose,
          granted: consents[purpose].granted,
          note: decisionNote(consents[purpose]),
        }))}
        disabled={pending}
        onChange={change}
      />
    </PageLayout>
  );
}

interface ConsentUpdates {
  readonly consents: ConsentSet;
  readonly pending: boolean;
  readonly failed: boolean;
  readonly change: (purpose: ConsentPurpose, granted: boolean) => void;
}

/** The screen only shows what was actually saved: a failed save leaves the switch as it was. */
function useConsentUpdates(initial: ConsentSet): ConsentUpdates {
  const { updateConsent } = useContainer().privacy;
  const [consents, setConsents] = useState(initial);
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);
  const change = (purpose: ConsentPurpose, granted: boolean): void => {
    setPending(true);
    void updateConsent({ purpose, granted }).then((result) => {
      setPending(false);
      setFailed(!result.ok);
      if (result.ok) {
        setConsents(result.value);
      }
    });
  };
  return { consents, pending, failed, change };
}
