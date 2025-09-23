import { useState } from "react";
import { PastPlayer } from "bca-firebase-queries";
import { Checks } from "./Verification";

type VerifyProps = {
  useCheck: Checks;
  setUseCheck: React.Dispatch<React.SetStateAction<Checks>>;
  matches: PastPlayer[];
  setPastPlayer: React.Dispatch<React.SetStateAction<PastPlayer | null>>;
  availableChecks: Checks[];
  setFindPast: React.Dispatch<React.SetStateAction<boolean>>;
  setMatches: React.Dispatch<React.SetStateAction<PastPlayer[]>>;
  handleReset: () => void;
};

export const Verify = ({
  useCheck,
  setUseCheck,
  matches,
  setPastPlayer,
  availableChecks,
  handleReset,
}: VerifyProps) => {
  // state
  const [enteredString, setEnteredString] = useState("");
  const [failedVerify, setFailedVerify] = useState(false);

  // handlers
  const handleVerify = (type: "dob" | "phone") => {
    matches.forEach((player) => {
      if (enteredString === player[type]) {
        setPastPlayer(player);
        setFailedVerify(false);
      }
      console.log("available,", availableChecks);
    });
    setFailedVerify(true);
  };

  const handleRetry = (type: "dob" | "phone") => {
    setFailedVerify(false);
    setEnteredString("");
    setUseCheck(type);
  };

  //   const handleNoChance = () => {
  //     setPastPlayer(null);
  //     setFindPast(false);
  //   };

  return (
    <div className="check-container">
      <div className="confirm-body-title">Verification</div>

      {!useCheck && (
        <div>
          We have a possible profile however no way to verify you. Please
          contact your League operator.
          <button onClick={handleReset}>Application</button>
        </div>
      )}
      {useCheck === "dob" && (
        <div>
          <div className="search-input-wrapper">
            <div>Enter Your Date of Birth</div>
            <div className="edit-input-container">
              <input
                className="edit-input"
                type="date"
                onChange={(e) => setEnteredString(e.target.value)}
              />
            </div>
            <div>
              <button onClick={() => handleVerify("dob")}>Verify</button>
            </div>
          </div>
        </div>
      )}
      {useCheck === "phone" && (
        <div>
          <div className="search-input-wrapper">
            <div>Enter Phone number</div>
            <div className="edit-input-container">
              <input
                className="edit-input"
                type="text"
                onChange={(e) => setEnteredString(e.target.value)}
              />
            </div>
            <div>
              <button onClick={() => handleVerify("phone")}>Verify</button>
            </div>
          </div>
        </div>
      )}
      {failedVerify && (
        <div className="">
          <div>
            Verification failed. Please check the information entered and try
            again.
          </div>
          <div>
            {availableChecks.includes("dob") && (
              <button onClick={() => handleRetry("dob")}>Retry DoB</button>
            )}
            {availableChecks.includes("phone") && (
              <button onClick={() => handleRetry("phone")}>Retry Phone</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
