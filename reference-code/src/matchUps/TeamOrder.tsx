// utilities
import { shuffleArray } from '../assets/globalFunctions';
import { toast } from 'react-toastify';

// types
import { Team } from '../assets/typesFolder/teamTypes';

import './matchups.css';

type TeamOrderProps = {
  teams: Team[] | null;
  teamOrder: Team[];
  setTeamOrder: React.Dispatch<React.SetStateAction<Team[]>>;
};

export const TeamOrder = ({ teamOrder = [], setTeamOrder }: TeamOrderProps) => {
  // change order functions
  const handleMove = (teamId: string, name: string) => {
    // prompt for position
    const newPosition = prompt(`Enter new position for ${name}`);

    // Exit if User cancels
    if (newPosition === null) {
      return;
    }

    const index = parseInt(newPosition, 10) - 1;

    // Exit if position is invalid
    if (isNaN(index) || index >= teamOrder.length) {
      toast.warn('Invalid position entered');
      return;
    }

    // Find team and move to new index
    const currentTeamIndex = teamOrder.findIndex((team) => team.id === teamId);

    // Exit if team not found
    if (currentTeamIndex === -1) {
      toast.warn('Team not found');
      return;
    }

    // Get moved team
    const movedTeam = teamOrder[currentTeamIndex];

    // Create new array without the moved team
    const newOrder = teamOrder.filter((team) => team.id !== teamId);

    // Insert moved team into correct position
    newOrder.splice(index, 0, movedTeam);

    setTeamOrder(newOrder);
  };

  const handleRandomize = () => {
    const randomOrder = shuffleArray(teamOrder);
    setTeamOrder(randomOrder);
  };

  return (
    <div className="order-container">
      <div className="order-title-group">
        <div className="order-title">Team Order</div>
        <div className="order-title">Count = {teamOrder?.length ?? 0}</div>
      </div>

      {teamOrder.length >= 1 &&
        teamOrder.map((team, index) => (
          <div key={team.id} className="team-container">
            <div className="team-info">
              {index + 1}: {team.teamName}
            </div>
            <button
              className="small-button"
              onClick={() => handleMove(team.id, team.teamName)}
            >
              Move
            </button>
          </div>
        ))}
      <div className="button-group">
        <button className="small-button" onClick={handleRandomize}>
          Random
        </button>
      </div>
    </div>
  );
};
