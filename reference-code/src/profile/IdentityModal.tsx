import { useState } from 'react';
import { newPlayerSchema } from '../newPlayers/newPlayerSchema';
import { ValidationError } from 'yup';
import { useUpdatePlayer } from 'bca-firebase-queries';
import { useAuthContext } from '../context/useAuthContext';
import { capitalizeField } from '../assets/formatEntryFunctions';

type IdentityModalProps = {
  firstName: string;
  lastName: string;
  dob: string;
  closeModal: () => void;
};

export const IdentityModal = ({
  firstName,
  lastName,
  dob,
  closeModal,
}: IdentityModalProps) => {
  const [proceed, setProceed] = useState(false);
  const [first, setFirst] = useState(firstName);
  const [last, setLast] = useState(lastName);
  const [bday, setBday] = useState(dob);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  const { updatePlayer } = useUpdatePlayer();

  const identitySchema = newPlayerSchema.pick(['firstName', 'lastName', 'dob']);

  const handleSave = async () => {
    if (!user) return;
    try {
      // validate entries
      await identitySchema.validate({
        firstName: first,
        lastName: last,
        dob: bday,
      });
      setError(null);
      // update player
      updatePlayer(user.uid, {
        firstName: capitalizeField(first),
        lastName: capitalizeField(last),
        dob: bday,
      });
      setProceed(false);
    } catch (err) {
      if (err instanceof ValidationError) {
        setError(err.message);
        console.error(error);
      } else {
        console.error('Something went wrong', err);
      }
    }
    closeModal();
  };
  return (
    <div>
      <h2 className="modal-warning-title">WARNING</h2>
      {!proceed && (
        <>
          <div className="modal-warning-text">
            Changing these values can cause issues with local and national
            registrations, and may lead to confusion among teammates and
            opponents regarding your identity. Please only make these changes to
            correct errors or for specific reasons, such as a legal name changes
            such as marriage. Please note that your 'Nickname' which is what is
            displayed in most cases, can be changed at any time without causing
            any issues.
          </div>
          <div className="modal-button">
            <button onClick={() => setProceed(true)}>Proceed</button>
          </div>
        </>
      )}
      {proceed && (
        <>
          <div className="modal-input-row">
            <div className="input-label">First: </div>
            <input
              className="profile-input"
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
          </div>
          <div className="modal-input-row">
            <div className="input-label">Last: </div>
            <input
              className="profile-input"
              value={last}
              onChange={(e) => setLast(e.target.value)}
            />
          </div>
          <div className="modal-input-row">
            <div className="input-label">DOB: </div>
            <input
              type="date"
              className="profile-input"
              value={bday}
              onChange={(e) => setBday(e.target.value)}
            />
          </div>
          <div className="modal-button">
            <button onClick={() => setProceed(false)}>Cancel</button>
            <button onClick={handleSave}>Save</button>
          </div>
        </>
      )}
    </div>
  );
};
