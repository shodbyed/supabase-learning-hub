import { PastPlayer } from 'bca-firebase-queries';
import { useState } from 'react';
import './newPlayers.css';

type ConfirmConnectionProps = {
  pastPlayer: PastPlayer;
  setIsConfirmed: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ConfirmConnection = ({
  pastPlayer,
  setIsConfirmed,
}: ConfirmConnectionProps) => {
  // state
  const [inputDate, setInputDate] = useState('');
  const [error, setError] = useState('');

  // handlers
  const handleConfirm = () => {
    if (!inputDate) {
      setError('Please enter a date');
      return;
    }
    if (inputDate !== pastPlayer.dob) {
      setError(
        'This is not the DoB associated with your email.  Please enter the correct date of birth or contact your League Operator to confirm your identity'
      );
      return;
    }
    if (inputDate === pastPlayer.dob) {
      console.log('its a match!', pastPlayer.dob);
      setError('');
      setIsConfirmed(true);
    }
  };

  return (
    <div className="confirm-container">
      <div className="confirm-title">
        We have found a profile associated with {pastPlayer.email}.
      </div>
      <div>Is this you?</div>
      <div className="confirm-info-container">
        <div className="confirm-info">
          Name: {pastPlayer.firstName} {pastPlayer.lastName}
        </div>
        <div className="confirm-info">City: {pastPlayer.city}</div>
      </div>
      <div className="confirm-info-question">
        Enter your Date of Birth to confirm your identity
      </div>

      <div className="confirm-input-container">
        <input
          className="confirm-input"
          type="date"
          value={inputDate}
          onChange={(e) => setInputDate(e.target.value)}
        />
      </div>
      <div className="confirm-error-container">
        {error && <div className="error">{error}</div>}
      </div>
      <div className="confirm-button-container">
        <button onClick={handleConfirm}>Confirm</button>
      </div>
    </div>
  );
};
