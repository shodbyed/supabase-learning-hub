/**
 * @fileoverview Profile Component Types
 * TypeScript interfaces and types for profile editing functionality
 */

/**
 * Form data structure for address editing
 */
export interface AddressFormData {
  address: string;
  city: string;
  state: string;
  zip_code: string;
}

/**
 * Form data structure for personal information editing
 */
export interface PersonalFormData {
  first_name: string;
  last_name: string;
  nickname: string;
  date_of_birth: string;
}

/**
 * Form data structure for contact information editing
 */
export interface ContactFormData {
  email: string;
  phone: string;
}

/**
 * Generic form state interface for edit modes
 */
export interface EditFormState<T> {
  isEditing: boolean;
  formData: T;
  errors: Record<string, string>;
}

/**
 * Success message state
 */
export interface SuccessMessage {
  visible: boolean;
  type: string;
  changes: string[];
}