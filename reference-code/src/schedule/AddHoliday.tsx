import { toast } from 'react-toastify';

// components
import { Explanation } from './Explanation';

// form
import { useForm, Controller } from 'react-hook-form';
import { addHolidaySchema } from './schema';
import { yupResolver } from '@hookform/resolvers/yup';
// date picker
import ReactDatePicker from 'react-datepicker';

// css
import 'react-datepicker/dist/react-datepicker.css';
import './schedule.css';

// utilities
import { readableDate } from '../assets/dateFunctions';

// types
import { Holiday } from '../assets/typesFolder/seasonTypes';

type AddHolidayProps = {
  setEditedHolidays: (updater: (prevHolidays: Holiday[]) => Holiday[]) => void;
  setAddHoliday: (setTo: boolean) => void;
};

type FormValues = {
  title: string;
  startDate: Date;
  endDate: Date;
};

export const AddHoliday = ({
  setEditedHolidays,
  setAddHoliday,
}: AddHolidayProps) => {
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ resolver: yupResolver(addHolidaySchema) });

  const startDateWatch = watch('startDate');

  const onSubmit = (data: FormValues) => {
    if (data.endDate < data.startDate) {
      toast.warn('You cant end before you start!');
      return;
    }
    const newHoliday: Holiday = {
      date: readableDate(data.startDate),
      name: data.title,
      start: data.startDate,
      end: data.endDate,
      rule: 'Custom holiday/event to be inserted into the schedule',
      type: 'custom',
    };
    setEditedHolidays(prevHolidays => [...prevHolidays, newHoliday]);
    setAddHoliday(false);
  };

  return (
    <div className='add-container'>
      <form onSubmit={handleSubmit(onSubmit)} className='form-body'>
        <div className='form-group'>
          <label htmlFor='title'>Event Name: </label>

          <input
            type='text'
            className='form-input-select'
            {...control.register('title')}
          />
          {errors.title && (
            <span className='error-message'>{errors.title.message}</span>
          )}
        </div>
        <div className='form-group'>
          <label htmlFor='startDate'>Start Date: </label>
          <Controller
            name='startDate'
            control={control}
            render={({ field: { onChange, onBlur, value, ref, name } }) => (
              <ReactDatePicker
                className='form-input'
                id='startDate'
                name={name}
                onChange={onChange}
                onBlur={onBlur}
                ref={ref}
                selected={value}
              />
            )}
          />
          {errors.startDate && (
            <span className='error-message'>{errors.startDate.message}</span>
          )}
        </div>
        {startDateWatch && (
          <div className='form-group'>
            <label htmlFor='endDate'>End Date: </label>
            <Controller
              name='endDate'
              control={control}
              render={({ field: { onChange, onBlur, value, ref, name } }) => (
                <ReactDatePicker
                  className='form-input'
                  id='endDate'
                  name={name}
                  onChange={onChange}
                  onBlur={onBlur}
                  ref={ref}
                  selected={value}
                  minDate={startDateWatch}
                />
              )}
            />
            {errors.endDate && (
              <span className='error-message'>{errors.endDate.message}</span>
            )}
          </div>
        )}
        <button className='medium-button' type='submit'>
          Create
        </button>
      </form>
      <Explanation />
    </div>
  );
};
