import { useState, useContext } from 'react';

// components
import { HolidayList } from './HolidayList';
import { HolidayDetails } from './HolidayDetails';
import { FinishSchedule } from './FinishSchedule';
import { AddHoliday } from './AddHoliday';

// context
import { SelectedItemContext } from '../context/SelectedItemProvider';

// utilities
import { toast } from 'react-toastify';

// firebase
// import { useUpdateSeasonSchedule } from "bca--firebase-queries";
import { useUpdateSeasonSchedule } from '../hooks/scheduleUpdateHooks';

// types
import { Schedule, Holiday } from '../assets/typesFolder/seasonTypes';

// css
import './schedule.css';

type HolidayViewProps = {
  editedSchedule: Schedule;
  setEditedSchedule: (schedule: Schedule) => void;
  getBasicSchedule: () => void;
};
export const HolidayView = ({
  editedSchedule,
  setEditedSchedule,
  getBasicSchedule,
}: HolidayViewProps) => {
  const { selectedSeason } = useContext(SelectedItemContext);

  // const mutateObject = {
  //   useToast: true,
  //   successMessage: `Your new schedule has been added to ${
  //     selectedSeason ? selectedSeason.seasonName : "Season"
  //   }.\nChoose a new season or move on to Match Ups.`,
  //   failedMessage: "Failed to add schedule to season.",
  //   successToastLength: 6000,
  // };

  const { mutate: updateSchedule, isLoading } =
    useUpdateSeasonSchedule(/*mutateObject*/);
  const holidays = selectedSeason?.holidays || [];
  const [editedHolidays, setEditedHolidays] = useState<Holiday[]>(holidays);
  const [activeHoliday, setActiveHoliday] = useState<Holiday | null>(null);
  const [addHoliday, setAddHoliday] = useState<boolean>(false);

  const handleDismissHoliday = (holiday: Holiday) => {
    // remove activeHoliday from holiday array
    const updatedHolidays = editedHolidays.filter((h) => h !== holiday);
    setEditedHolidays(updatedHolidays);
    if (activeHoliday === holiday) {
      setActiveHoliday(null);
    }
  };
  const handleAddHoliday = () => {
    setAddHoliday(true);
  };
  const handleSaveSchedule = async () => {
    if (!selectedSeason) {
      toast.error('No season selected to save schedule.');
      return;
    }
    updateSchedule({
      seasonName: selectedSeason.seasonName,
      schedule: editedSchedule,
    });
  };

  const handleResetSchedule = () => {
    setEditedHolidays(holidays);
    getBasicSchedule();
  };

  if (isLoading) {
    return <div>Updating...</div>;
  }

  return (
    <div className="holiday-view-container">
      <div className="view-title">Holidays</div>
      {!activeHoliday && (
        <HolidayList
          handleDismissHoliday={handleDismissHoliday}
          editedHolidays={editedHolidays}
          setActiveHoliday={setActiveHoliday}
        />
      )}
      {activeHoliday && (
        <HolidayDetails
          editedSchedule={editedSchedule}
          setEditedSchedule={setEditedSchedule}
          activeHoliday={activeHoliday}
          handleDismissHoliday={handleDismissHoliday}
          setActiveHoliday={setActiveHoliday}
        />
      )}
      {editedHolidays.length === 0 && !addHoliday && (
        <FinishSchedule
          handleAddHoliday={handleAddHoliday}
          handleResetSchedule={handleResetSchedule}
          handleSaveSchedule={handleSaveSchedule}
        />
      )}
      {editedHolidays.length === 0 && addHoliday && (
        <AddHoliday
          setEditedHolidays={setEditedHolidays}
          setAddHoliday={setAddHoliday}
        />
      )}
    </div>
  );
};
