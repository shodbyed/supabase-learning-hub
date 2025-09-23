import { useState } from "react";
// components
import { PastPlayersList } from "./PastPlayersList";
import { CurrentPlayersList } from "./CurrentPlayersList";
import { Info } from "./Info";

// types
import { CurrentUser } from "../assets/typesFolder/userTypes";

// firebase
import { PastPlayer } from "bca-firebase-queries";
import { failedFetch } from "../constants/messages";
import {
  useFetchCurrentUsers,
  useFetchPastPlayers,
} from "../hooks/playerFetchHooks";

// import {
//   failedFetch,
//   useFetchPastPlayers,
//   useFetchCurrentUsers,
// } from "bca--firebase-queries";

export const Players = () => {
  const {
    data: pastPlayers,
    isLoading: isLoadingPastPlayers,
    error: errorPastPlayers,
  } = useFetchPastPlayers();
  const {
    data: currentUsers,
    isLoading: isLoadingCurrentUsers,
    error: errorCurrentUsers,
  } = useFetchCurrentUsers();

  const [chosenPastPlayer, setChosenPastPlayer] = useState<PastPlayer | null>(
    null
  );
  const [chosenCurrentUser, setChosenCurrentUser] =
    useState<CurrentUser | null>(null);

  if (isLoadingPastPlayers || isLoadingCurrentUsers) {
    return <div>Loading...</div>;
  }
  if (errorPastPlayers) {
    return (
      <div>
        {failedFetch} Past Players:{" "}
        {/** TODO fix this errorPastPlayers.message */}
      </div>
    );
  }
  if (errorCurrentUsers) {
    return (
      <div>
        {failedFetch} Current Users: {/*errorCurrentUsers} TODO fix this */}
      </div>
    );
  }
  return (
    <div className="player-container">
      <PastPlayersList
        setChosenPastPlayer={setChosenPastPlayer}
        pastPlayers={pastPlayers || []}
      />
      <Info
        pastPlayer={chosenPastPlayer}
        currentUser={chosenCurrentUser}
        setChosenPastPlayer={setChosenPastPlayer}
      />
      <CurrentPlayersList
        setChosenCurrentUser={setChosenCurrentUser}
        currentUsers={currentUsers || []}
      />
    </div>
  );
};
