import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useContainer } from '../../app/ContainerContext';
import { ROUTES } from '../../app/routes';
import { Button } from '../../components/Button';
import { fr } from '../../content/fr';
import { useSubmit } from '../../hooks/useSubmit';
import { ConfirmErase } from './ConfirmErase';

/** Right to erasure: everything on the phone, after a typed confirmation, then a fresh start. */
export function EraseSection(): ReactNode {
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const submission = useSubmit<undefined>(useContainer().privacy.eraseAllData, () => {
    void navigate(ROUTES.welcome, { replace: true });
  });
  return (
    <section className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-red-200">
      <h2 className="text-lg font-semibold text-red-800">{fr.myData.eraseTitle}</h2>
      <p>{fr.myData.eraseIntro}</p>
      {confirming ? (
        <ConfirmErase
          pending={submission.pending}
          failed={submission.error !== null}
          onConfirm={() => {
            submission.submit(undefined);
          }}
          onCancel={() => {
            setConfirming(false);
          }}
        />
      ) : (
        <StartErase onStart={setConfirming} />
      )}
    </section>
  );
}

function StartErase({ onStart }: { readonly onStart: (start: boolean) => void }): ReactNode {
  return (
    <Button
      variant="secondary"
      onClick={() => {
        onStart(true);
      }}
    >
      {fr.myData.eraseStart}
    </Button>
  );
}
