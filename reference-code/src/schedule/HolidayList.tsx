import { readableDateWithDay } from '../assets/dateFunctions';
import { Holiday } from '../assets/typesFolder/seasonTypes';
import './schedule.css';

type HolidayListProps = {
  editedHolidays: Holiday[];
  setActiveHoliday: (holiday: Holiday | null) => void;
  handleDismissHoliday: (holiday: Holiday) => void;
};

export const HolidayList = ({
  editedHolidays,
  setActiveHoliday,
  handleDismissHoliday,
}: HolidayListProps) => {
  return (
    <div className='holiday-list-container'>
      {editedHolidays &&
        editedHolidays.map((holiday, index) => {
          return (
            <div className='view-group' key={index}>
              <div>{readableDateWithDay(holiday.start)}</div>
              <button
                className='small-button'
                onClick={() => setActiveHoliday(holiday)}
              >
                {holiday.name}
              </button>
              <button
                className='dismiss-button'
                onClick={() => handleDismissHoliday(holiday)}
              >
                Dismiss
              </button>
            </div>
          );
        })}
    </div>
  );
};
