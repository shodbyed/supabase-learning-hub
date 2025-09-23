import { UseFormRegister, Path } from 'react-hook-form';
import { usStates } from 'bca-firebase-queries';

type StateSelectProps<T extends Record<string, unknown>> = {
  register: UseFormRegister<T>;
  error?: string;
};

export const StateSelect = <T extends Record<string, unknown>>({
  register,
  error,
}: StateSelectProps<T>) => {
  return (
    <div className="edit-input-container">
      <div className="input-label">State:</div>

      <select {...register('state' as Path<T>)} className="edit-input">
        {usStates.map((state) => (
          <option key={state.abbreviation} value={state.abbreviation}>
            {state.name}
          </option>
        ))}
      </select>
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};
