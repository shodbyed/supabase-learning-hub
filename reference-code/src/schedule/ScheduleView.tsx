import { Schedule } from '../assets/typesFolder/seasonTypes';
import './schedule.css';

type ScheduleViewProps = {
  editedSchedule: Schedule;
};
export const ScheduleView = ({ editedSchedule }: ScheduleViewProps) => {
  const sortedScheduleEntries = Object.entries(editedSchedule).sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
  );
  return (
    <div className='schedule-view-container'>
      <div className='view-title'>Schedule:</div>

      {sortedScheduleEntries.map(([key, value]) => {
        return (
          <div className='view-group' key={key}>
            <div>{value.title}:</div>
            <div>{key}</div>
          </div>
        );
      })}
    </div>
  );
};
