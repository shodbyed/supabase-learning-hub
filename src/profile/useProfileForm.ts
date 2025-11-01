/**
 * @fileoverview Profile Form Management Hook
 * Custom hook for managing profile edit forms with validation and state
 */
import { useState } from 'react';
import { useUser } from '../context/useUser';
import { useUserProfile } from '@/api/hooks';
import { personalInfoSchema, contactInfoSchema, addressSchema } from './validationSchemas';
import { capitalizeWords, formatPhoneNumber } from '../utils/formatters';
import type {
  AddressFormData,
  PersonalFormData,
  ContactFormData,
  EditFormState,
  SuccessMessage
} from './types';

/**
 * Custom hook for managing profile form state and operations
 *
 * Centralizes all form management logic including:
 * - Edit mode states for each form section
 * - Form validation and submission
 * - Success message handling
 * - Error state management
 */
export const useProfileForm = () => {
  const { user } = useUser();
  const { member } = useUserProfile();

  // Success message state
  const [successMessage, setSuccessMessage] = useState<SuccessMessage>({
    visible: false,
    type: '',
    changes: []
  });

  // Address form state
  const [addressForm, setAddressForm] = useState<EditFormState<AddressFormData>>({
    isEditing: false,
    formData: {
      address: '',
      city: '',
      state: '',
      zip_code: ''
    },
    errors: {}
  });

  // Personal info form state
  const [personalForm, setPersonalForm] = useState<EditFormState<PersonalFormData>>({
    isEditing: false,
    formData: {
      first_name: '',
      last_name: '',
      nickname: '',
      date_of_birth: ''
    },
    errors: {}
  });

  // Contact info form state
  const [contactForm, setContactForm] = useState<EditFormState<ContactFormData>>({
    isEditing: false,
    formData: {
      email: '',
      phone: ''
    },
    errors: {}
  });

  /**
   * Show success message with auto-hide after 5 seconds
   */
  const showSuccessMessage = (type: string, changes: string[]) => {
    setSuccessMessage({ visible: true, type, changes });

    setTimeout(() => {
      setSuccessMessage({ visible: false, type: '', changes: [] });
    }, 5000);
  };

  /**
   * Generic form validation and processing function
   * Reduces code duplication across different form types
   */
  const processFormSubmission = <T>(
    schema: any,
    formData: T,
    currentMemberData: any,
    formatFn: (data: any) => any,
    changeDetectionFn: (formatted: any, current: any) => string[],
    formType: string
  ) => {
    // Validate form data
    const validation = schema.safeParse(formData);

    if (!validation.success) {
      const errors: Record<string, string> = {};
      validation.error.issues.forEach((error: any) => {
        if (error.path[0]) {
          errors[error.path[0] as string] = error.message;
        }
      });
      return { success: false, errors };
    }

    // Apply formatting
    const formattedData = formatFn(validation.data);

    // Detect changes
    const changes = changeDetectionFn(formattedData, currentMemberData);

    // Log update request
    console.log(`=== ${formType.toUpperCase()} UPDATE REQUEST ===`);
    console.log('Member ID:', member?.id);
    console.log('User ID:', user?.id);
    console.log('Validation Result: PASSED');
    console.log('Changes Made:', changes);
    console.log('Raw Form Data:', formData);
    console.log('Validated Data:', validation.data);
    console.log('Formatted Data for Database:', formattedData);
    console.log('===============================');

    return { success: true, changes, formattedData };
  };

  /**
   * Address form handlers
   */
  const addressHandlers = {
    startEdit: () => {
      if (member) {
        setAddressForm(prev => ({
          ...prev,
          isEditing: true,
          formData: {
            address: member.address,
            city: member.city,
            state: member.state,
            zip_code: member.zip_code
          },
          errors: {}
        }));
      }
    },

    updateForm: (field: keyof AddressFormData, value: string) => {
      setAddressForm(prev => ({
        ...prev,
        formData: { ...prev.formData, [field]: value },
        errors: { ...prev.errors, [field]: '' } // Clear field error on change
      }));
    },

    save: () => {
      if (!member) return;

      const result = processFormSubmission(
        addressSchema,
        addressForm.formData,
        member,
        (data: any) => ({
          address: capitalizeWords(data.address),
          city: capitalizeWords(data.city),
          state: data.state.toUpperCase(),
          zip_code: data.zip_code
        }),
        (formatted: any, current: any) => {
          const changes: string[] = [];
          if (formatted.address !== current.address) changes.push(`Address: "${current.address}" → "${formatted.address}"`);
          if (formatted.city !== current.city) changes.push(`City: "${current.city}" → "${formatted.city}"`);
          if (formatted.state !== current.state) changes.push(`State: "${current.state}" → "${formatted.state}"`);
          if (formatted.zip_code !== current.zip_code) changes.push(`Zip Code: "${current.zip_code}" → "${formatted.zip_code}"`);
          return changes;
        },
        'ADDRESS'
      );

      if (!result.success) {
        setAddressForm(prev => ({ ...prev, errors: result.errors || {} }));
        return;
      }

      // Success - exit edit mode and show message
      setAddressForm(prev => ({ ...prev, isEditing: false, errors: {} }));
      showSuccessMessage('Address Information', result.changes || []);
    },

    cancel: () => {
      setAddressForm(prev => ({ ...prev, isEditing: false, errors: {} }));
    }
  };

  /**
   * Personal info form handlers
   */
  const personalHandlers = {
    startEdit: () => {
      if (member) {
        setPersonalForm(prev => ({
          ...prev,
          isEditing: true,
          formData: {
            first_name: member.first_name,
            last_name: member.last_name,
            nickname: member.nickname || '',
            date_of_birth: member.date_of_birth
          },
          errors: {}
        }));
      }
    },

    updateForm: (field: keyof PersonalFormData, value: string) => {
      setPersonalForm(prev => ({
        ...prev,
        formData: { ...prev.formData, [field]: value },
        errors: { ...prev.errors, [field]: '' }
      }));
    },

    save: () => {
      if (!member) return;

      const result = processFormSubmission(
        personalInfoSchema,
        personalForm.formData,
        member,
        (data: any) => ({
          first_name: capitalizeWords(data.first_name),
          last_name: capitalizeWords(data.last_name),
          nickname: data.nickname?.trim() || null,
          date_of_birth: data.date_of_birth
        }),
        (formatted: any, current: any) => {
          const changes: string[] = [];
          if (formatted.first_name !== current.first_name) changes.push(`First Name: "${current.first_name}" → "${formatted.first_name}"`);
          if (formatted.last_name !== current.last_name) changes.push(`Last Name: "${current.last_name}" → "${formatted.last_name}"`);
          if (formatted.nickname !== current.nickname) changes.push(`Nickname: "${current.nickname || 'None'}" → "${formatted.nickname || 'None'}"`);
          if (formatted.date_of_birth !== current.date_of_birth) changes.push(`Date of Birth: "${current.date_of_birth}" → "${formatted.date_of_birth}"`);
          return changes;
        },
        'PERSONAL INFO'
      );

      if (!result.success) {
        setPersonalForm(prev => ({ ...prev, errors: result.errors || {} }));
        return;
      }

      setPersonalForm(prev => ({ ...prev, isEditing: false, errors: {} }));
      showSuccessMessage('Personal Information', result.changes || []);
    },

    cancel: () => {
      setPersonalForm(prev => ({ ...prev, isEditing: false, errors: {} }));
    }
  };

  /**
   * Contact info form handlers
   */
  const contactHandlers = {
    startEdit: () => {
      if (member) {
        setContactForm(prev => ({
          ...prev,
          isEditing: true,
          formData: {
            email: member.email,
            phone: member.phone
          },
          errors: {}
        }));
      }
    },

    updateForm: (field: keyof ContactFormData, value: string) => {
      setContactForm(prev => ({
        ...prev,
        formData: { ...prev.formData, [field]: value },
        errors: { ...prev.errors, [field]: '' }
      }));
    },

    save: () => {
      if (!member) return;

      const result = processFormSubmission(
        contactInfoSchema,
        contactForm.formData,
        member,
        (data: any) => ({
          email: data.email.toLowerCase(),
          phone: formatPhoneNumber(data.phone)
        }),
        (formatted: any, current: any) => {
          const changes: string[] = [];
          if (formatted.email !== current.email) changes.push(`Email: "${current.email}" → "${formatted.email}"`);
          if (formatted.phone !== current.phone) changes.push(`Phone: "${current.phone}" → "${formatted.phone}"`);
          return changes;
        },
        'CONTACT INFO'
      );

      if (!result.success) {
        setContactForm(prev => ({ ...prev, errors: result.errors || {} }));
        return;
      }

      setContactForm(prev => ({ ...prev, isEditing: false, errors: {} }));
      showSuccessMessage('Contact Information', result.changes || []);
    },

    cancel: () => {
      setContactForm(prev => ({ ...prev, isEditing: false, errors: {} }));
    }
  };

  return {
    // Form states
    addressForm,
    personalForm,
    contactForm,
    successMessage,

    // Form handlers
    addressHandlers,
    personalHandlers,
    contactHandlers,
  };
};