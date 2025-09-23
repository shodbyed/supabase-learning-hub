import * as yup from 'yup';
export type playerSchema = {
  firstName: string;
  lastName: string;
  nickname?: string;
  phone: string;
  address?: string;
  city: string;
  zip: string;
  dob: Date;
  email: string;
};

/**
 * common phone number formats:
 * - (###) ###-####
 * - ###-###-####
 * - ###.###.####
 * - ### ### ####
 * - ##########
 */
const phoneRegex =
  /^\(\d{3}\) \d{3}-\d{4}$|^\d{3}-\d{3}-\d{4}$|^\d{3}\.\d{3}\.\d{4}$|^\d{10}$|^\d{3} \d{3} \d{4}$/;

//phone format (###)###-#### only
const strictPhoneRegEx = /^\(\d{3}\) \d{3}-\d{4}$/;

//zip format ##### or #####-####
const zipRegEx = /^\d{5}(-\d{4})?$/;
// 21 years ago
const minimumAge = new Date();
minimumAge.setFullYear(minimumAge.getFullYear() - 21);

export const profileSchema = yup.object().shape({
  firstName: yup
    .string()
    .min(1, 'First name must be at least 1 character')
    .required('First name is required'),
  lastName: yup
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .required('Last name is required'),
  nickname: yup.string().max(10, 'Nickname must be less than 10 characters'),
  strictPhone: yup
    .string()
    .matches(strictPhoneRegEx, 'Phone number must be in (###)###-#### format'),
  phone: yup
    .string()
    .matches(phoneRegex, 'Phone number must be in (###)###-#### format')
    .required('Phone Number is required'),
  address: yup.string().max(100, 'Address must be less than 100 characters'),
  city: yup
    .string()
    .max(40, 'City must be less than 40 characters')
    .required('City is required'),
  state: yup.string(),
  zip: yup
    .string()
    .matches(zipRegEx, 'Please enter a valid ZIP code')
    .required('Zip code is required'),
  dob: yup
    .date()
    .required('Date of Birth is required')
    .typeError('Please provide a valid date')
    .max(minimumAge, 'You must be at least 21 years old'),
  email: yup.string().email('Please enter a valid email address'),
});
