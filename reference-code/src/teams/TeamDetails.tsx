import { useState, useEffect } from "react";
// components
import { EditPlayer } from "./EditPlayer";

// utilities
import { convertPastPlayerToTeamPlayer } from "../assets/globalFunctions";
import { blankPlayerInfoObject, playerOrder } from "../assets/globalVariables";

// css
import "./teams.css";

// types
import { Team, TeamPlayerRole, PastPlayer } from "bca-firebase-queries";

// firebase
// import { useAddPlayerToTeam } from "bca--firebase-queries";
import { useAddPlayerToTeam } from "../hooks/teamToPlayerOperations";

type TeamDetailsProps = {
  team: Team;
  onSave: (editedTeam: Team) => void;
  onDelete: (teamToDelete: Team) => void;
  onCancel: () => void;
};

export const TeamDetails = ({
  team,
  onSave,
  onDelete,
  onCancel,
}: TeamDetailsProps) => {
  // set edited Team
  const [editedTeam, setEditedTeam] = useState<Team>(team);
  const { mutate: addPlayerToTeam, isLoading } = useAddPlayerToTeam();

  // useEffect
  useEffect(() => {
    setEditedTeam(team);
  }, [team]);

  const handleRemovePlayer = (role: TeamPlayerRole) => {
    const teamId = team.id;

    addPlayerToTeam({
      teamId: teamId,
      playerData: blankPlayerInfoObject,
      role: role,
    });
    setEditedTeam((prevTeam) => {
      const updatedPlayers = { ...prevTeam.players };
      updatedPlayers[role] = blankPlayerInfoObject;
      return {
        ...prevTeam,
        players: updatedPlayers,
      };
    });
  };

  const handleSelect = (player: PastPlayer, role: TeamPlayerRole) => {
    const newPlayerData = convertPastPlayerToTeamPlayer(player);
    setEditedTeam((prevTeam) => ({
      ...prevTeam,
      players: {
        ...prevTeam.players,
        [role]: newPlayerData,
      },
    }));
  };

  if (isLoading) {
    return <div>Adding player...</div>;
  }
  return (
    <div className="d2-container">
      <div className="details-name-group">
        <div className="details-title">Team Name:</div>
        <input
          value={editedTeam.teamName}
          onChange={(e) =>
            setEditedTeam({ ...editedTeam, teamName: e.target.value })
          }
        />
      </div>
      <div className="details-player-group">
        <div className="details-title">Players:</div>
        {team &&
          playerOrder.map((role) => {
            const playerInfo =
              editedTeam.players[role as keyof typeof team.players];

            return (
              <div style={{ display: "flex" }}>
                <EditPlayer
                  key={role}
                  playerInfo={playerInfo}
                  role={role}
                  onSelect={handleSelect}
                />
                <button
                  className="small-button"
                  onClick={() => handleRemovePlayer(role as TeamPlayerRole)}
                >
                  Remove
                </button>
              </div>
            );
          })}
      </div>
      <div className="details-button-group">
        {" "}
        <button onClick={() => onSave(editedTeam)}>Save</button>
        <button onClick={() => onDelete(team)}>Delete</button>
        <button onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
};
