import { TeamName } from '../assets/typesFolder/sharedTypes';
import './teams.css';

type AddTeamButtonProps = {
  onAddTeam: (teamName: TeamName) => void;
};
export const AddTeamButton = ({ onAddTeam }: AddTeamButtonProps) => {
  const handleAddTeam = () => {
    const teamName = prompt('Enter team name');
    if (teamName) {
      onAddTeam(teamName);
    }
  };
  return (
    <div className='add-button-view'>
      <button className='add-button' onClick={handleAddTeam}>
        Add A Team
      </button>
    </div>
  );
};
