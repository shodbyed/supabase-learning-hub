import { PastPlayer as Player } from 'bca-firebase-queries';
import { useState, useEffect } from 'react';
import { ConfirmConnection } from './ConfirmConnection';
import { PastDataEdit } from './PastDataEdit';

type PastPlayerProps = {
  pastPlayer: Player;
};

export const PastPlayerPage = ({ pastPlayer }: PastPlayerProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (isConfirmed) {
      localStorage.setItem('isConfirmed', 'true');
    }
  }, [isConfirmed]);

  const cashedConfirmed = localStorage.getItem('isConfirmed') === 'true';
  if (cashedConfirmed && isConfirmed === false) {
    setIsConfirmed(true);
  }

  return (
    <div>
      {isConfirmed && <PastDataEdit pastPlayer={pastPlayer} />}
      {!isConfirmed && (
        <ConfirmConnection
          pastPlayer={pastPlayer}
          setIsConfirmed={setIsConfirmed}
        />
      )}
    </div>
  );
};
