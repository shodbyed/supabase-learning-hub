import { PastPlayer } from 'bca-firebase-queries';
import { useState, useEffect } from 'react';
import { Verify } from './Verify';
import { PastDataEdit } from './PastDataEdit';

export type Checks = 'dob' | 'phone' | undefined;

type VerificationProps = {
  setFindPast: React.Dispatch<React.SetStateAction<boolean>>;
  matches: PastPlayer[];
  setMatches: React.Dispatch<React.SetStateAction<PastPlayer[]>>;
  setCheckedCity: React.Dispatch<
    React.SetStateAction<'' | 'failed' | 'passed'>
  >;
};

export const Verification = ({
  setFindPast,
  matches,
  setMatches,
  setCheckedCity,
}: VerificationProps) => {
  const [useCheck, setUseCheck] = useState<Checks>(undefined);
  const [availableChecks, setAvailableChecks] = useState<Checks[]>([]);
  const [pastPlayer, setPastPlayer] = useState<PastPlayer | null>(null);

  useEffect(() => {
    const checksForPlayers: ('dob' | 'phone')[] = [];
    matches.forEach((player) => {
      console.log('player', player.dob, player.phone.trim());
      if (player.dob || player.dob !== '') {
        checksForPlayers.push('dob');
      }
      if (player.phone.trim()) {
        console.log(player.phone.trim());
        checksForPlayers.push('phone');
      }
      return undefined; // handle the case where neither is defined
    });
    const uniqueChecks = [...new Set(checksForPlayers)];
    console.log('available checks', uniqueChecks);
    setAvailableChecks(uniqueChecks);

    const setCheck = () => {
      if (uniqueChecks.length === 0) {
        setUseCheck(undefined);
        return; // Return early to avoid further execution
      }
      let phoneCount = 0;
      let dobCount = 0;

      uniqueChecks.forEach((check) => {
        if (check === 'dob') dobCount++;
        if (check === 'phone') phoneCount++;
      });

      setUseCheck(dobCount >= phoneCount ? 'dob' : 'phone');
    };

    setCheck();
  }, [matches]);

  const handleReset = () => {
    //here
    setPastPlayer(null);
    setUseCheck(undefined);
    setAvailableChecks([]);
    // up
    setMatches([]);
    setCheckedCity('');
    setFindPast(false);
  };

  return (
    <>
      {!pastPlayer && (
        <Verify
          useCheck={useCheck}
          setUseCheck={setUseCheck}
          matches={matches}
          setPastPlayer={setPastPlayer}
          availableChecks={availableChecks}
          setFindPast={setFindPast}
          setMatches={setMatches}
          handleReset={handleReset}
        />
      )}
      {pastPlayer && <PastDataEdit pastPlayer={pastPlayer} />}
    </>
  );
};
