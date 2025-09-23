import { useState } from "react";

// components
import { PastPlayerSearch } from "../components/PastPlayerSearch";
import { ErrorAndRefetch } from "../components/ErrorAndRefetch";

// types
import { TeamPlayerRole, TeamPlayer, PastPlayer } from "bca-firebase-queries";

// firebase
import { useFetchPastPlayers } from "../hooks/playerFetchHooks";

type EditPlayerProps = {
  role: TeamPlayerRole;
  playerInfo: TeamPlayer;
  onSelect: (player: PastPlayer, role: TeamPlayerRole) => void;
};

export const EditPlayer: React.FC<EditPlayerProps> = ({
  playerInfo,
  role,
  onSelect,
}) => {
  const {
    data: pastPlayers,
    isLoading,
    error,
    refetch: fetchPastPlayers,
  } = useFetchPastPlayers();
  const [isEditing, setIsEditing] = useState(false);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error instanceof Error) {
    return <ErrorAndRefetch error={error} onRetry={fetchPastPlayers} />;
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };
  const handleCancelClick = () => {
    setIsEditing(false);
  };
  if (isEditing || playerInfo.firstName === "") {
    return (
      <div style={{ display: "flex" }}>
        <div style={{ marginRight: "15px" }}>{role}:</div>
        <PastPlayerSearch
          list={pastPlayers ? pastPlayers : []}
          onSelect={(player) => {
            onSelect(player, role);
            setIsEditing(false);
          }}
        />

        {playerInfo.firstName !== "" && (
          <button className="small-button" onClick={handleCancelClick}>
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {role}: {playerInfo.firstName} {playerInfo.lastName}
      <button className="small-button" onClick={handleEditClick}>
        Edit
      </button>
    </div>
  );
};
