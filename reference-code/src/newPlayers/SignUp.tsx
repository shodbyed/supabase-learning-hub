import { Email, useFetchPastPlayerById } from "bca-firebase-queries";
import { LoadingScreen } from "../components/LoadingScreen";
import { useAuthContext } from "../context/useAuthContext";

import "./newPlayers.css";
import { PastPlayerPage } from "./PastPlayerPage";
import { NewPlayerForm } from "./NewPlayerForm";
import { RetryFindPast } from "./RetryFindPast";
import { useState } from "react";

export const SignUp = () => {
  const { user } = useAuthContext();
  const [findPast, setFindPast] = useState(false);
  const [fetchId, setFetchId] = useState<string | undefined | null>(
    user?.email
  );
  const {
    data: pastPlayer,
    isLoading: isLoadingPastPlayer,
    isError: isPastPlayerError,
  } = useFetchPastPlayerById(fetchId as Email);

  if (isLoadingPastPlayer) {
    return (
      <LoadingScreen message="No user data found! Searching for past data" />
    );
  }

  //console.log('SignUp', data, isError);
  return (
    <div className="sign-container">
      <div className="sign-title">Sign Up</div>

      {isPastPlayerError && (
        <>
          <RetryFindPast
            findPast={findPast}
            setFindPast={setFindPast}
            setFetchId={setFetchId}
          />
          {!findPast && <NewPlayerForm />}
        </>
      )}
      {pastPlayer && <PastPlayerPage pastPlayer={pastPlayer} />}
    </div>
  );
};
