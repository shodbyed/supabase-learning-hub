import { profileSchema } from './profileSchema';
import * as yup from 'yup';
export type PastPlayerType = yup.InferType<typeof profileSchema>;

export const validatePastPlayerFields = (
  field: keyof PastPlayerType,
  value: unknown,
) => {
  let isValid = true;
  let error;

  try {
    const schema = profileSchema.fields[
      field as keyof typeof profileSchema.fields
    ] as yup.StringSchema;

    if (schema) {
      schema.validateSync(value);
    }
  } catch (err) {
    isValid = false;
    error = err instanceof yup.ValidationError ? err.message : 'Unknown error';
  }

  return { isValid, error };
};
