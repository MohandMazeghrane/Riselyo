import { useState, type ReactNode } from 'react';
import { Button } from '../../components/Button';
import { FormMessage } from '../../components/FormMessage';
import { TextField } from '../../components/TextField';
import { fr } from '../../content/fr';

interface ConfirmEraseProps {
  readonly pending: boolean;
  readonly failed: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

/** The final button only unlocks once the confirmation word is typed (any case, any spaces). */
export function ConfirmErase({
  pending,
  failed,
  onConfirm,
  onCancel,
}: ConfirmEraseProps): ReactNode {
  const [typed, setTyped] = useState('');
  const confirmed = typed.trim().toUpperCase() === fr.myData.eraseConfirmWord;
  return (
    <div className="flex flex-col gap-3">
      <TextField
        label={fr.myData.eraseConfirmLabel}
        value={typed}
        autoComplete="off"
        autoCapitalize="characters"
        onChange={(event) => {
          setTyped(event.target.value);
        }}
      />
      <EraseActions
        canErase={confirmed && !pending}
        pending={pending}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
      {failed && <FormMessage tone="error">{fr.myData.eraseFailed}</FormMessage>}
    </div>
  );
}

interface EraseActionsProps {
  readonly canErase: boolean;
  readonly pending: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

function EraseActions({ canErase, pending, onConfirm, onCancel }: EraseActionsProps): ReactNode {
  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant="secondary" onClick={onCancel}>
        {fr.myData.eraseCancel}
      </Button>
      <Button variant="danger" disabled={!canErase} onClick={onConfirm}>
        {pending ? fr.myData.erasing : fr.myData.eraseConfirm}
      </Button>
    </div>
  );
}
