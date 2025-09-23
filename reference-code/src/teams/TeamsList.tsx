import { useContext } from 'react';
import { Team } from '../assets/typesFolder/teamTypes';

import './teams.css';
import { SelectedItemContext } from '../context/SelectedItemProvider';

type TeamsListProps = {
  teams: Team[];
  handleTeamSelect: (teamId: string | null) => void;
};

export const TeamsList = ({ teams, handleTeamSelect }: TeamsListProps) => {
  const { selectedTeam } = useContext(SelectedItemContext);
  return (
    <div className='list-container'>
      <div className='list-title'>
        {selectedTeam ? 'Working Team:' : 'Choose Team'}
      </div>
      {selectedTeam ? (
        <>
          <div className='list-name'>{selectedTeam.teamName}</div>
          <button
            className='small-button'
            onClick={() => handleTeamSelect(null)}
          >
            Change
          </button>
        </>
      ) : (
        <div className='list-button-container'>
          {teams && teams.length > 0 ? (
            teams.map((team, index) => (
              <button
                className='small-button'
                key={index}
                onClick={() => handleTeamSelect(team.id)}
              >
                {team.teamName}
              </button>
            ))
          ) : (
            <div>No teams available</div>
          )}
        </div>
      )}
      {teams && teams.length > 0 && <div>Team count: {teams.length}</div>}
    </div>
  );
};
