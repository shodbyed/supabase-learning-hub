// context
import { useContext } from 'react';
import { SelectedItemContext } from '../context/SelectedItemProvider';

// components
import { ErrorAndRefetch } from '../components/ErrorAndRefetch';

// utilities
import { useNavigate } from 'react-router-dom';

// firebase
// import { useFetchSeasons } from "bca--firebase-queries";
import { useFetchSeasons } from '../hooks/seasonFetchHooks';

// css
import './seasons.css';

export const SeasonList = () => {
  const navigate = useNavigate();
  const { selectedSeason, setSelectedSeason } = useContext(SelectedItemContext);
  const { data: seasons, isLoading, error, refetch } = useFetchSeasons();
  if (isLoading) return <p>Loading...</p>;
  if (error instanceof Error)
    return <ErrorAndRefetch error={error} onRetry={refetch} />;
  return (
    <div className="list-container">
      <div className="list-title">
        {selectedSeason ? 'Working Season:' : 'Choose Season'}
      </div>
      {selectedSeason ? (
        <>
          <div className="list-name">{selectedSeason.seasonName}</div>
          <button
            className="small-button"
            onClick={() => setSelectedSeason(null)}
          >
            Change
          </button>
        </>
      ) : (
        <div className="list-button-container">
          {seasons && seasons.length > 0 ? (
            seasons.map((season, index) => (
              <button
                className="small-button"
                key={index}
                onClick={() => setSelectedSeason(season)}
              >
                {season.seasonName}
              </button>
            ))
          ) : (
            <button
              className="small-button"
              onClick={() => navigate('/seasons')}
            >
              Create New Season
            </button>
          )}
        </div>
      )}
    </div>
  );
};
