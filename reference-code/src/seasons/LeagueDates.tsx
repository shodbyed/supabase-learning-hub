import { Dispatch, SetStateAction } from 'react';
import ReactDatePicker from 'react-datepicker';

type LeagueDateProps = {
  league: string;
  startDate: Date;
  endDate: Date;
  onStartChange: (date: Date) => void;
  onEndChange: (date: Date) => void;
  website: string;
  startError?: string;
  endError?: string;
  setIgnoreDates: Dispatch<SetStateAction<{ apa: boolean; bca: boolean }>>;
};

export const LeagueDates = ({
  league,
  startDate,
  endDate,
  onEndChange,
  onStartChange,
  website,
  startError,
  endError,
}: LeagueDateProps) => {
  const startLabelId = `${league.toLowerCase()}StartDate`;
  const endLabelId = `${league.toLowerCase()}EndDate`;
  return (
    <>
      <div className="champ-label">{`${league.toUpperCase()} Nationals`}</div>
      <div className="form-group">
        <label htmlFor={startLabelId}>Start Date:</label>
        <ReactDatePicker
          className="form-input"
          selected={startDate}
          onChange={onStartChange}
        />
        {startError && <span className="error-message">{startError}</span>}
      </div>

      <div className="form-group">
        <label htmlFor={endLabelId}>End Date: </label>
        <ReactDatePicker
          className="form-input"
          selected={endDate}
          onChange={onEndChange}
        />
        {endError && <span className="error-message">{endError}</span>}
      </div>
      <a href={website} target="_blank" rel="noopener noreferrer">
        {`Check ${league.toUpperCase()} Dates`}
      </a>
    </>
  );
};
