import * as yup from 'yup';

export const addHolidaySchema = yup.object().shape({
  title: yup.string().required('Title is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date().required('End date is required'),
});
