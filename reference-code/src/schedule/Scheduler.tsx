import { useCallback, useContext, useEffect, useState } from 'react';
// components
import { SeasonList } from '../seasons/SeasonList';
import { ScheduleView } from './ScheduleView';
import { HolidayView } from './HolidayView';
import { ErrorAndRefetch } from '../components/ErrorAndRefetch';

//context
import { SelectedItemContext } from '../context/SelectedItemProvider';

// utilities
import { createBasicSchedule } from '../assets/globalFunctions';
import { notDate } from '../assets/globalVariables';
import { convertTimestampToDate } from '../assets/dateFunctions';

// css
import './schedule.css';

// firebase
//import { useFetchSeasons } from "bca--firebase-queries";
import { useFetchSeasons } from '../hooks/seasonFetchHooks';

// types
import { Schedule } from '../assets/typesFolder/seasonTypes';

export const Scheduler = () => {
  const { selectedSeason } = useContext(SelectedItemContext);
  const { refetch: fetchSeasons, isLoading, error } = useFetchSeasons();
  const [editedSchedule, setEditedSchedule] = useState<Schedule>({});

  const getBasicSchedule = useCallback(() => {
    if (!selectedSeason || selectedSeason.startDate === notDate) {
      setEditedSchedule({});
      return;
    }
    const basicStartDate = convertTimestampToDate(selectedSeason.startDate);
    const basicSchedule = createBasicSchedule(basicStartDate);
    setEditedSchedule(basicSchedule);
  }, [selectedSeason]);

  useEffect(() => {
    if (
      selectedSeason &&
      selectedSeason.schedule &&
      Object.keys(selectedSeason.schedule).length > 1
    ) {
      setEditedSchedule(selectedSeason.schedule);
    } else {
      getBasicSchedule();
    }
  }, [selectedSeason, getBasicSchedule]);
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error instanceof Error) {
    return <ErrorAndRefetch error={error} onRetry={fetchSeasons} />;
  }
  return (
    <div>
      <div className="container">
        <SeasonList />

        {selectedSeason && (
          <div className="container">
            <ScheduleView editedSchedule={editedSchedule} />
            <HolidayView
              editedSchedule={editedSchedule}
              setEditedSchedule={setEditedSchedule}
              getBasicSchedule={getBasicSchedule}
            />
          </div>
        )}
      </div>
    </div>
  );
};
