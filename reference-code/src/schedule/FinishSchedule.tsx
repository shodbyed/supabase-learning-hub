import './schedule.css';

type FinishScheduleProps = {
  handleAddHoliday: () => void;
  handleSaveSchedule: () => void;
  handleResetSchedule: () => void;
};

export const FinishSchedule = ({
  handleAddHoliday,
  handleSaveSchedule,
  handleResetSchedule,
}: FinishScheduleProps) => {
  return (
    <div className='finish-container'>
      <div className='finish-message'>
        Nice Work! All traditional holidays that were potential conflicts have
        been dealt with.
      </div>
      <div className='finish-message'>
        If you need more days off in the season create a custom holiday/event
        with Add Holiday
      </div>
      <div className='finish-message'>
        If you are satisfied with your schedule save it with Save Season
      </div>
      <div className='finish-message'>
        Click Reset schedule ONLY if you wish to start over choosing holidays.
      </div>
      <div className='finish-button-container'>
        <button onClick={handleAddHoliday}>Add Holiday</button>
        <button onClick={handleSaveSchedule}>Save Schedule</button>
      </div>
      <div className='reset-button-container'>
        <button className='reset-button' onClick={handleResetSchedule}>
          RESET SCHEDULE
        </button>
      </div>
    </div>
  );
};
