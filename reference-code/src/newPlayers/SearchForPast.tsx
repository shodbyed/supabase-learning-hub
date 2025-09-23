import { PastPlayer, useFetchAllPastPlayers } from "bca-firebase-queries";
import { useState } from "react";
import { Verification } from "./Verification";

type SearchForPastProps = {
  setFindPast: React.Dispatch<React.SetStateAction<boolean>>;
  setCheckedCity: React.Dispatch<
    React.SetStateAction<"failed" | "passed" | "">
  >;
};

export const SearchForPast = ({
  setFindPast,
  setCheckedCity,
}: SearchForPastProps) => {
  const { data, isLoading, isError } = useFetchAllPastPlayers();
  const [option, setOption] = useState<"" | "name" | "email">("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [emailEntry, setEmailEntry] = useState<string>("");
  const [matches, setMatches] = useState<PastPlayer[]>([]);
  const [matchChecked, setMatchChecked] = useState(false);

  if (isLoading) return <div>Loading Search Options...</div>;
  if (isError)
    return <div>Error loading search options. Please refresh the page</div>;

  const handleSearch = () => {
    const matches: PastPlayer[] = [];
    if (option === "name") {
      // search thru data for a player that matches the last name and push to matches array
      data?.forEach((player) => {
        if (
          player.lastName?.toLowerCase() === lastName.toLowerCase() &&
          player.firstName?.toLowerCase() === firstName.toLowerCase()
        ) {
          matches.push(player);
        }
      });
    }
    if (option === "email") {
      console.log("searching by email", emailEntry);
      // search thru data for a player that matches the email and push to matches array
      data?.forEach((player) => {
        //console.log( 'checks',player.email);
        if (player.email?.toLowerCase() === emailEntry.toLowerCase()) {
          matches.push(player);
        }
      });
    }
    setMatches(matches);
    setMatchChecked(true);
  };

  const handleReset = () => {
    console.log("Resetting search...");
    setMatches([]);
    setMatchChecked(false);
    setOption("");
    setFirstName("");
    setLastName("");
    setEmailEntry("");
  };
  const hasMatches = matches.length > 0;

  return (
    <div className="check-container">
      {!hasMatches && (
        <div className="confirm-body-title">Choose a search option</div>
      )}
      <div className="check-button-row">
        <div className="search-option">
          {!hasMatches && (
            <button onClick={() => setOption("name")}>Name</button>
          )}
          {option === "name" && !matchChecked && (
            <>
              <div className="search-input-wrapper">
                <div>Enter names as they appeared on your score sheets</div>
                <div className="edit-input-container">
                  <div>First Name</div>
                  <input
                    className="edit-input"
                    type="text"
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="edit-input-container">
                  <div>Last Name:</div>
                  <input
                    className="edit-input"
                    type="text"
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <div className="search-option">
          {!hasMatches && (
            <button onClick={() => setOption("email")}>Alt Email</button>
          )}
          {option === "email" && !matchChecked && (
            <>
              <div className="search-input-wrapper">
                <div>Enter a previous email we might have</div>
                <div className="edit-input-container">
                  <div>Old Email:</div>
                  <input
                    className="edit-input"
                    type="text"
                    onChange={(e) => setEmailEntry(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {!hasMatches && matchChecked && option !== "" && (
        <div
          className="confirm-body-title"
          style={{ color: "red", marginTop: "1em" }}
        >
          <div>We did not find any profiles with this {option}</div>
          <div>Please contact your League Operator or try again</div>
        </div>
      )}
      {option !== "" && !matchChecked && (
        <div className="form-button-wrapper">
          <button onClick={handleSearch}>Search</button>
        </div>
      )}
      {option !== "" && matchChecked && !hasMatches && (
        <div className="form-button-wrapper">
          <button onClick={handleReset}>Try Again</button>
        </div>
      )}
      {hasMatches && (
        <Verification
          setFindPast={setFindPast}
          matches={matches}
          setMatches={setMatches}
          setCheckedCity={setCheckedCity}
        />
      )}
    </div>
  );
};
