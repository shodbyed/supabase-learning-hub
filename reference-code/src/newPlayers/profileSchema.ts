import * as Yup from 'yup';

export type FormValues = {
  firstName: string;
  lastName: string;
  nickname: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
};

export const profileSchema = Yup.object().shape({
  firstName: Yup.string()
    .max(20, 'Name must be less than 20 characters')
    .required('First Name is required'),
  lastName: Yup.string()
    .max(20, 'Name must be less than 20 characters')
    .required('Last Name is required'),
  nickname: Yup.string()
    .max(12, 'Nickname must be less than 12 characters')
    .required('Nickname is required'),
  address: Yup.string().required('Address is required'),
  city: Yup.string().required('City is required'),
  state: Yup.string().required('State is required'),
  zip: Yup.string().required('Zip is required'),
  phone: Yup.string().required('Phone is required'),
});

export const formFieldNames = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'nickname', label: 'Nickname' },
  { name: 'address', label: 'Address' },
  { name: 'city', label: 'City' },
  { name: 'state', label: 'State' },
  { name: 'zip', label: 'Zip' },
  { name: 'phone', label: 'Phone' },
];
