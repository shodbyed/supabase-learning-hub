import { readableDate } from '../assets/dateFunctions';
import { Season, Holiday } from '../assets/typesFolder/seasonTypes';
import './seasons.css';

type SeasonEntryDetailsProps = {
  seasonData: Season;
  bcaEvent: Holiday;
  apaEvent: Holiday;
};

export const SeasonEntryDetails: React.FC<SeasonEntryDetailsProps> = ({
  seasonData,
  bcaEvent,
  apaEvent,
}) => {
  const { endDate } = seasonData;
  const readableEndDate = readableDate(endDate);
  return (
    <div className="form-container">
      <div className="season-title">New Season Details</div>
      <div className="form-group">
        <div className="form-label">Season Name: </div>
        <div className="form-input">{seasonData.seasonName}</div>
      </div>
      <div className="form-group">
        <div className="form-label">Pool Hall: </div>
        <div className="form-input">{seasonData.poolHall}</div>
      </div>
      <div className="form-group">
        <div className="form-label">Start date:</div>
        <div className="form-input">{readableDate(seasonData.startDate)}</div>
      </div>
      <div className="form-group">
        <div className="form-label">End date:</div>
        <div className="form-input"> {readableEndDate}</div>
      </div>
      <div className="form-group">
        <div className="form-label">Weeks:</div>
        <div className="form-input">{seasonData.seasonLength}</div>
      </div>
      <div className="form-group">
        <div className="form-label">Night:</div>
        <div className="form-input">{seasonData.night}</div>
      </div>
      <div className="form-group">
        <div className="form-label">Game:</div>
        <div className="form-input">{seasonData.game}</div>
      </div>{' '}
      <div className="form-group">
        <div className="form-label">Holidays:</div>
        <div className="form-input">{seasonData.holidays.length} possible</div>
      </div>
      <div className="form-group">
        <div className="form-label">BCA Start:</div>
        <div className="form-input">{readableDate(bcaEvent.start)}</div>
      </div>
      <div className="form-group">
        <div className="form-label">BCA End:</div>
        <div className="form-input">{readableDate(bcaEvent.end)}</div>
      </div>
      <div className="form-group">
        <div className="form-label">APA Start:</div>
        <div className="form-input">{readableDate(apaEvent.start)}</div>
      </div>
      <div className="form-group">
        <div className="form-label">APA End</div>
        <div className="form-input">{readableDate(apaEvent.end)}</div>
      </div>
    </div>
  );
};
