import { useState, type ReactNode } from 'react';
import { Button } from '../../components/Button';
import { fr } from '../../content/fr';

interface StopHabitButtonProps {
  readonly label: string;
  readonly pending: boolean;
  readonly onConfirm: () => void;
}

/** Stopping a habit is asked twice: one tap opens the question, a second one confirms. */
export function StopHabitButton({ label, pending, onConfirm }: StopHabitButtonProps): ReactNode {
  const [confirming, setConfirming] = useState(false);
  if (confirming) {
    return (
      <ConfirmStop
        label={label}
        pending={pending}
        onConfirm={onConfirm}
        onCancel={() => {
          setConfirming(false);
        }}
      />
    );
  }
  return (
    <Button
      variant="secondary"
      onClick={() => {
        setConfirming(true);
      }}
    >
      {fr.habitPlan.stop}
    </Button>
  );
}

function ConfirmStop(props: StopHabitButtonProps & { readonly onCancel: () => void }): ReactNode {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm">{fr.habitPlan.confirmStop(props.label)}</p>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="secondary" onClick={props.onCancel}>
          {fr.habitPlan.cancel}
        </Button>
        <Button disabled={props.pending} onClick={props.onConfirm}>
          {fr.habitPlan.confirm}
        </Button>
      </div>
    </div>
  );
}
