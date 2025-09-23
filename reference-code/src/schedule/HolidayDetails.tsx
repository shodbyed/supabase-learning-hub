import { useEffect, useState } from 'react';

// utilities
import { readableDateWithDay, toJSDate } from '../assets/dateFunctions';
import {
  checkForConflicts,
  insertHolidayIntoSchedule,
} from '../assets/globalFunctions';

// css
import './schedule.css';

// types
import { Holiday, Schedule } from '../assets/typesFolder/seasonTypes';

type HolidayDetailsProps = {
  activeHoliday: Holiday;
  setActiveHoliday: (holiday: Holiday | null) => void;
  editedSchedule: Schedule;
  setEditedSchedule: (schedule: Schedule) => void;
  handleDismissHoliday: (holiday: Holiday) => void;
};

export const HolidayDetails = ({
  activeHoliday,
  setActiveHoliday,
  handleDismissHoliday,
  editedSchedule,
  setEditedSchedule,
}: HolidayDetailsProps) => {
  // states
  const [conflicts, setConflicts] = useState<string[]>([]);

  // useEffects
  useEffect(() => {
    // convert dates for comparison
    const holidayStart = new Date(toJSDate(activeHoliday.start));
    const holidayEnd = new Date(toJSDate(activeHoliday.end));

    // find conflicts where leaguePlay is true
    const foundConflicts = checkForConflicts(
      editedSchedule,
      holidayStart,
      holidayEnd,
    );

    setConflicts(foundConflicts);
  }, [activeHoliday, editedSchedule]);

  // functions

  const handleInsertHoliday = (date: string) => {
    // create a schedule with holiday inserted
    const newSchedule = insertHolidayIntoSchedule(
      activeHoliday.name,
      date,
      editedSchedule,
    );
    // this triggers the useEffect so that this conflict will be removed
    setEditedSchedule(newSchedule);
    // recheck for conflicts
    const holidayStart = new Date(toJSDate(activeHoliday.start));
    const holidayEnd = new Date(toJSDate(activeHoliday.end));
    const remainingConflicts = checkForConflicts(
      newSchedule,
      holidayStart,
      holidayEnd,
    );
    if (remainingConflicts.length === 0) {
      handleDismissHoliday(activeHoliday);
    }
  };

  return (
    <div className='details-main-container'>
      <div className='details-title'>Details</div>
      <div className='details-container'>
        <div className='details-holiday'>
          <div className='details-holiday-title'>Holiday</div>
          <div>{activeHoliday.name}</div>
          <div>{readableDateWithDay(activeHoliday.start)}</div>
          <div>{readableDateWithDay(activeHoliday.end)}</div>
        </div>

        <div className='details-conflicts'>
          <div className='details-conflicts-title'>Conflicts</div>
          {conflicts.map((date, index) => {
            const detail = editedSchedule[date];
            return (
              <div key={index}>
                <div>
                  {detail.title} {readableDateWithDay(date)}
                </div>
                <div></div>
                <button
                  onClick={() => handleInsertHoliday(date)}
                  className='small-button'
                >
                  Insert holiday {detail.title}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      <div className='details-button-container'>
        <button onClick={() => handleDismissHoliday(activeHoliday)}>
          Dismiss holiday
        </button>
        <button onClick={() => setActiveHoliday(null)}>Go Back</button>
      </div>
    </div>
  );
};
