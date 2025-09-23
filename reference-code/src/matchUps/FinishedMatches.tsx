// types
import { RoundRobinScheduleFinished } from '../assets/typesFolder/matchupTypes';
import { Season } from '../assets/typesFolder/seasonTypes';

// css
import './matchups.css';

type FinishedMatchesProps = {
  finishedSchedule: RoundRobinScheduleFinished;
  selectedSeason: Season | null;
};
export const FinishedMatches = ({
  finishedSchedule,
  selectedSeason,
}: FinishedMatchesProps) => {
  const seasonSchedule = selectedSeason ? selectedSeason.schedule : {};
  const seasonScheduleKeys = selectedSeason
    ? Object.keys(selectedSeason.schedule).sort((a, b) => {
        const dateA = new Date(a).getTime();
        const dateB = new Date(b).getTime();
        return dateA - dateB;
      })
    : [];

  return (
    <div>
      <div>FinishedMatches</div>
      {selectedSeason &&
        finishedSchedule &&
        seasonScheduleKeys.map(key => {
          const title = seasonSchedule[key].title;
          if (!title.startsWith('Week'))
            return (
              <div key={key} className='set-team-button'>
                <div>
                  <span>{key}:</span>
                  <span className='indent'>{title}</span>
                </div>
              </div>
            );
          return (
            <div key={key} className='set-team-button'>
              <div>{key}</div>
              <div className='indent'>{title}:</div>
              {finishedSchedule[title].map((table, index) => {
                const homeTeam = table.home.teamName;
                const awayTeam = table.away.teamName;
                const uniqueKey = `${key}-${index}`;

                return (
                  <div key={uniqueKey}>
                    <div className='finished-table'>
                      <div className='table-number'>Table {index + 1}:</div>

                      <div className='home'>{homeTeam}</div>
                      <div className='vs'>vs.</div>

                      <div className='away'>{awayTeam}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
    </div>
  );
};
