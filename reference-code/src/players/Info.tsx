import React from "react";
// types
// components
import { NameFields } from "./NameFields";
import { ProfileFields } from "./ProfileFields";
// styles
import "./players.css";
import { EmailField } from "./EmailField";
import { Stats } from "./Stats";
import { CurrentUser } from "../assets/typesFolder/userTypes";
import { PastPlayer } from "bca-firebase-queries";

type InfoProps = {
  pastPlayer: PastPlayer | null;
  currentUser: CurrentUser | null;
  setChosenPastPlayer: React.Dispatch<React.SetStateAction<PastPlayer | null>>;
};
export const Info = ({
  pastPlayer,
  currentUser,
  setChosenPastPlayer,
}: InfoProps) => {
  return (
    <div className="info-container">
      {pastPlayer && (
        <>
          <div className="title">Information</div>
          <div className="info-grid">
            <NameFields
              pastPlayer={pastPlayer}
              setChosenPastPlayer={setChosenPastPlayer}
            />
            <EmailField
              pastPlayer={pastPlayer}
              setChosenPastPlayer={setChosenPastPlayer}
            />

            <ProfileFields
              pastPlayer={pastPlayer}
              setChosenPastPlayer={setChosenPastPlayer}
            />
          </div>
          <div className="title">Statistics</div>
          <div className="info-grid">
            <Stats
              pastPlayer={pastPlayer}
              setChosenPastPlayer={setChosenPastPlayer}
            />
          </div>
        </>
      )}

      {currentUser && (
        <>
          <div>
            {currentUser.firstName} {currentUser.lastName}
          </div>
          <div>{currentUser.email}</div>
        </>
      )}
    </div>
  );
};
