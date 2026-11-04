import type { ReactNode } from 'react';
import { TextField } from '../../components/TextField';
import { fr } from '../../content/fr';
import type { MeasurementsDraft } from './measurementsForm';

interface MeasurementFieldsProps {
  readonly draft: MeasurementsDraft;
  readonly onChange: (draft: MeasurementsDraft) => void;
}

interface DraftInputProps extends MeasurementFieldsProps {
  readonly name: keyof MeasurementsDraft;
  readonly label: string;
  readonly decimal?: boolean;
}

function DraftInput({ draft, onChange, name, label, decimal = false }: DraftInputProps): ReactNode {
  return (
    <TextField
      label={label}
      value={draft[name]}
      inputMode={decimal ? 'decimal' : 'numeric'}
      onChange={(event) => {
        onChange({ ...draft, [name]: event.target.value });
      }}
    />
  );
}

export function MeasurementFields(props: MeasurementFieldsProps): ReactNode {
  return (
    <>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 font-semibold">{fr.measurements.body}</legend>
        <DraftInput {...props} name="weightKg" label={fr.measurements.weightKg} decimal />
        <DraftInput {...props} name="waistCm" label={fr.measurements.waistCm} decimal />
      </fieldset>
      <FitnessFields {...props} />
    </>
  );
}

function FitnessFields(props: MeasurementFieldsProps): ReactNode {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-2 font-semibold">{fr.measurements.fitness}</legend>
      <DraftInput {...props} name="pushUps" label={fr.measurements.pushUps} />
      <DraftInput {...props} name="plankSeconds" label={fr.measurements.plankSeconds} />
      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="mb-1 font-medium">{fr.measurements.brisk1km}</legend>
        <DraftInput {...props} name="brisk1kmMinutes" label={fr.measurements.minutes} />
        <DraftInput {...props} name="brisk1kmSeconds" label={fr.measurements.seconds} />
      </fieldset>
    </fieldset>
  );
}
