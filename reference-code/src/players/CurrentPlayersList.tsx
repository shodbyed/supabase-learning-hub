import { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { CurrentUser } from '../assets/typesFolder/userTypes';

type CurrentUserListProps = {
  currentUsers: CurrentUser[];
  setChosenCurrentUser: (player: CurrentUser | null) => void;
};
export const CurrentPlayersList = ({
  currentUsers,
  setChosenCurrentUser,
}: CurrentUserListProps) => {
  const [filteredPlayers, setFilteredPlayers] =
    useState<CurrentUser[]>(currentUsers);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = currentUsers.filter(player =>
      `${player.firstName} ${player.lastName}`
        .toLowerCase()
        .includes(lowerCaseSearchTerm),
    );
    setFilteredPlayers(filtered);
  }, [currentUsers, searchTerm]);

  const handleChoose = (player: CurrentUser) => {
    setChosenCurrentUser(player);
  };

  const handleSort = (sortBy: 'firstName' | 'lastName') => {
    const sortedPlayers = [...filteredPlayers];
    sortedPlayers.sort((a, b) => {
      if (a[sortBy] < b[sortBy]) {
        return -1;
      }
      if (a[sortBy] > b[sortBy]) {
        return 1;
      }
      return 0;
    });
    setFilteredPlayers(sortedPlayers);
  };

  return (
    <div className='past-players-container'>
      <div className='title'>Current Players</div>
      <div className='buttons'>
        <button className='tooltip' onClick={() => handleSort('firstName')}>
          First
          <span className='tooltip-text'>Order by First Name</span>
        </button>
        <button className='tooltip' onClick={() => handleSort('lastName')}>
          Last
          <span className='tooltip-text'>Order by Last Name</span>
        </button>
      </div>
      <div className='search-bar'>
        <FaSearch className='search-icon' size={24} />
        <input
          type='text'
          className='search-bar-input'
          placeholder='Search Players'
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>
      <div className='list'>
        {filteredPlayers.map(player => (
          <button
            className='text-button'
            key={player.id}
            onClick={() => handleChoose(player)}
          >
            {player.firstName} {player.lastName}
          </button>
        ))}
      </div>
    </div>
  );
};
