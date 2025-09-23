import './matchups.css';
import { RoundRobinSchedule } from '../assets/typesFolder/matchupTypes';

type CreateMatchesProps = {
  schedule: RoundRobinSchedule | null | undefined;
};

export const CreateMatches = ({ schedule }: CreateMatchesProps) => {
  return (
    <div>
      Create Matches
      <div>
        {schedule &&
          Object.keys(schedule).length > 0 &&
          Object.keys(schedule)
            .sort((a, b) => {
              const weekNumberA = parseInt(a.split(' ')[1]);
              const weekNumberB = parseInt(b.split(' ')[1]);
              return weekNumberA - weekNumberB;
            })
            .map(key => (
              <div key={key} className='schedule-matchups'>
                <div>{key}</div>
                {schedule[key].map((table, index) => (
                  <div key={index}>
                    <div className='indent'>
                      Table {index + 1}: -- home: {table.home} vs. away:{' '}
                      {table.away}
                    </div>
                  </div>
                ))}
              </div>
            ))}
      </div>
    </div>
  );
};
