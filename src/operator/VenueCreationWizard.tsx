/**
 * @fileoverview Venue Creation Wizard
 *
 * Simple wizard for adding new venues to an organization.
 * Collects essential venue information needed for league operations.
 *
 * VENUE DATA COLLECTED:
 * - Name (required)
 * - Address (required)
 * - Phone (required)
 * - # of Bar Box tables (7ft) (required)
 * - # of Regulation tables (9ft) (required)
 * - Main league contact (optional)
 *
 * INTEGRATION:
 * - Called from League Creation Wizard "Add New Venue" option
 * - Returns to calling wizard after successful creation
 * - Checks for venue conflicts before saving
 */
import React, { useState } from 'react';
import { QuestionStep } from '@/components/forms/QuestionStep';

interface VenueFormData {
  name: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  barBoxTables: string; // Number input as string for validation
  regulationTables: string; // Number input as string for validation
  mainContact: string; // Optional
}

interface VenueCreationWizardProps {
  onComplete: (venue: any) => void; // Called when venue is successfully created
  onCancel: () => void; // Called when user cancels
}

/**
 * Venue Creation Wizard Component
 *
 * Guides users through adding a new venue with essential information
 * for league operations. Includes conflict checking and validation.
 */
export const VenueCreationWizard: React.FC<VenueCreationWizardProps> = ({
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  const [formData, setFormData] = useState<VenueFormData>({
    name: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    barBoxTables: '',
    regulationTables: '',
    mainContact: ''
  });

  /**
   * Update form data for a specific field
   */
  const updateFormData = (field: keyof VenueFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Fake database call to check for venue conflicts
   */
  const checkVenueConflicts = async (streetAddress: string, city: string, state: string): Promise<{hasConflict: boolean; conflictVenue?: any}> => {
    const fullAddress = `${streetAddress}, ${city}, ${state}`;
    console.log('🔍 Checking for venue conflicts at address:', fullAddress);

    // Simulate database lookup delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Mock conflict check - for now, no conflicts
    // TODO: Implement real conflict resolution system
    console.log('✅ No venue conflicts found');
    return { hasConflict: false };
  };

  /**
   * Fake database call to save new venue
   */
  const saveVenue = async (venueData: VenueFormData) => {
    console.group('🏢 VENUE CREATION - DATABASE OPERATIONS');
    console.log('📋 Venue Data:', venueData);

    // Simulate database save delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const fullAddress = `${venueData.streetAddress}, ${venueData.city}, ${venueData.state} ${venueData.zipCode}`;

    const newVenue = {
      id: `venue_${Date.now()}`, // Mock ID generation
      name: venueData.name,
      address: fullAddress,
      streetAddress: venueData.streetAddress,
      city: venueData.city,
      state: venueData.state,
      zipCode: venueData.zipCode,
      phone: venueData.phone,
      barBoxTables: parseInt(venueData.barBoxTables),
      regulationTables: parseInt(venueData.regulationTables),
      totalTables: parseInt(venueData.barBoxTables) + parseInt(venueData.regulationTables),
      mainContact: venueData.mainContact || null,
      organizationId: 'current_org_id', // Would come from context
      createdAt: new Date().toISOString(),
      isActive: true
    };

    console.log('💾 Saving venue to database...');
    console.log('✅ Venue saved successfully:', newVenue);
    console.groupEnd();

    return newVenue;
  };

  /**
   * Validation functions
   */
  const validateName = (value: string) => {
    if (!value.trim()) return { isValid: false, error: 'Venue name is required' };
    if (value.trim().length < 2) return { isValid: false, error: 'Name must be at least 2 characters' };
    if (value.trim().length > 50) return { isValid: false, error: 'Name must be 50 characters or less' };
    return { isValid: true };
  };

  const validateStreetAddress = (value: string) => {
    if (!value.trim()) return { isValid: false, error: 'Street address is required' };
    if (value.trim().length < 5) return { isValid: false, error: 'Please enter a complete street address' };
    return { isValid: true };
  };

  const validateCity = (value: string) => {
    if (!value.trim()) return { isValid: false, error: 'City is required' };
    if (value.trim().length < 2) return { isValid: false, error: 'Please enter a valid city name' };
    return { isValid: true };
  };

  const validateState = (value: string) => {
    if (!value.trim()) return { isValid: false, error: 'State is required' };
    const stateRegex = /^[A-Za-z]{2}$/; // Two letter state code
    if (!stateRegex.test(value.trim())) return { isValid: false, error: 'Please enter a 2-letter state code (e.g., AZ, CA, TX)' };
    return { isValid: true };
  };

  const validateZipCode = (value: string) => {
    if (!value.trim()) return { isValid: false, error: 'ZIP code is required' };
    const zipRegex = /^\d{5}(-\d{4})?$/; // 5 digits or 5+4 format
    if (!zipRegex.test(value.trim())) return { isValid: false, error: 'Please enter a valid ZIP code (e.g., 85001 or 85001-1234)' };
    return { isValid: true };
  };


  const validatePhone = (value: string) => {
    if (!value.trim()) return { isValid: false, error: 'Phone number is required' };
    const phoneRegex = /^[\+]?[(]?[\d\s\-\.\(\)]{10,}$/;
    if (!phoneRegex.test(value.trim())) return { isValid: false, error: 'Please enter a valid phone number' };
    return { isValid: true };
  };

  const validateTables = (value: string, tableName: string) => {
    if (!value.trim()) return { isValid: false, error: `Number of ${tableName} is required` };
    const num = parseInt(value.trim());
    if (isNaN(num)) return { isValid: false, error: 'Please enter a valid number' };
    if (num < 0) return { isValid: false, error: 'Number cannot be negative' };
    if (num > 50) return { isValid: false, error: 'Number seems too high (max 50)' };
    return { isValid: true };
  };

  const validateContact = (value: string) => {
    // Optional field, so empty is valid
    if (!value.trim()) return { isValid: true };
    if (value.trim().length > 50) return { isValid: false, error: 'Contact name must be 50 characters or less' };
    return { isValid: true };
  };

  /**
   * Wizard steps
   */
  const steps = [
    {
      id: 'name',
      title: 'What is the venue name?',
      subtitle: 'Enter the business name as it\'s commonly known',
      placeholder: 'e.g., "Billiards Plaza", "Corner Pocket"',
      validator: validateName,
      getValue: () => formData.name,
      setValue: (value: string) => updateFormData('name', value)
    },
    {
      id: 'streetAddress',
      title: 'What is the street address?',
      subtitle: 'Enter the street address (number and street name)',
      placeholder: 'e.g., "123 Main Street" or "456 Oak Avenue"',
      validator: validateStreetAddress,
      getValue: () => formData.streetAddress,
      setValue: (value: string) => updateFormData('streetAddress', value)
    },
    {
      id: 'city',
      title: 'What city?',
      subtitle: 'Enter the city name',
      placeholder: 'e.g., "Phoenix", "Scottsdale"',
      validator: validateCity,
      getValue: () => formData.city,
      setValue: (value: string) => updateFormData('city', value)
    },
    {
      id: 'state',
      title: 'What state?',
      subtitle: 'Enter the 2-letter state code',
      placeholder: 'e.g., "AZ", "CA", "TX"',
      validator: validateState,
      getValue: () => formData.state,
      setValue: (value: string) => updateFormData('state', value.toUpperCase())
    },
    {
      id: 'zipCode',
      title: 'What is the ZIP code?',
      subtitle: 'Enter the 5-digit ZIP code',
      placeholder: 'e.g., "85001" or "85001-1234"',
      validator: validateZipCode,
      getValue: () => formData.zipCode,
      setValue: (value: string) => updateFormData('zipCode', value)
    },
    {
      id: 'phone',
      title: 'What is the venue phone number?',
      subtitle: 'Main phone number for the business',
      placeholder: 'e.g., "(602) 555-0123"',
      validator: validatePhone,
      getValue: () => formData.phone,
      setValue: (value: string) => updateFormData('phone', value)
    },
    {
      id: 'barBoxTables',
      title: 'How many Bar Box tables?',
      subtitle: 'Number of 7-foot tables available for league play',
      placeholder: 'e.g., "6"',
      validator: (value: string) => validateTables(value, 'Bar Box tables'),
      getValue: () => formData.barBoxTables,
      setValue: (value: string) => updateFormData('barBoxTables', value)
    },
    {
      id: 'regulationTables',
      title: 'How many Regulation tables?',
      subtitle: 'Number of 9-foot tables available for league play',
      placeholder: 'e.g., "2"',
      validator: (value: string) => validateTables(value, 'Regulation tables'),
      getValue: () => formData.regulationTables,
      setValue: (value: string) => updateFormData('regulationTables', value)
    },
    {
      id: 'mainContact',
      title: 'Main league contact (optional)',
      subtitle: 'Person at the venue who handles league coordination',
      placeholder: 'e.g., "John Smith" or "Manager"',
      validator: validateContact,
      getValue: () => formData.mainContact,
      setValue: (value: string) => updateFormData('mainContact', value)
    }
  ];

  /**
   * Handle input changes
   */
  const handleInputChange = (value: string) => {
    setCurrentInput(value);
    setError(undefined);
  };

  /**
   * Save current input with validation
   */
  const saveCurrentInput = (): boolean => {
    const step = steps[currentStep];

    if (step.validator) {
      const validation = step.validator(currentInput);
      if (!validation.isValid) {
        setError(validation.error);
        return false;
      }
    }

    step.setValue(currentInput);
    setCurrentInput('');
    return true;
  };

  /**
   * Handle next step
   */
  const handleNext = async () => {
    if (!saveCurrentInput()) return;

    // Check for conflicts when ZIP code is entered (last address component)
    if (steps[currentStep].id === 'zipCode') {
      const conflictCheck = await checkVenueConflicts(formData.streetAddress, formData.city, formData.state);
      if (conflictCheck.hasConflict) {
        setError('A venue already exists at this address. Please verify the address or contact support for conflict resolution.');
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentInput('');
      setError(undefined);
    } else {
      await handleSubmit();
    }
  };

  /**
   * Handle previous step
   */
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentInput('');
      setError(undefined);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    try {
      const newVenue = await saveVenue(formData);
      onComplete(newVenue);
    } catch (error) {
      setError('Failed to save venue. Please try again.');
      console.error('Venue creation error:', error);
    }
  };

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canGoBack = currentStep > 0;

  // Pre-populate input with current value when navigating
  React.useEffect(() => {
    const savedValue = currentStepData.getValue();
    if (savedValue) {
      setCurrentInput(savedValue);
    }
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Add New Venue
          </h1>
          <p className="text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-2xl mx-auto">
          <QuestionStep
            title={currentStepData.title}
            subtitle={currentStepData.subtitle}
            placeholder={currentStepData.placeholder}
            value={currentInput}
            onChange={handleInputChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onCancel={onCancel}
            canGoBack={canGoBack}
            isLastQuestion={isLastStep}
            error={error}
            inputType="text"
          />
        </div>

        {/* Venue Preview */}
        {(formData.name || formData.streetAddress || formData.city || formData.state || formData.zipCode) && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Venue Preview:</h3>
              <div className="text-blue-800 space-y-1">
                {formData.name && <p className="font-semibold">{formData.name}</p>}
                {(formData.streetAddress || formData.city || formData.state || formData.zipCode) && (
                  <p className="text-sm">
                    {[formData.streetAddress, formData.city, formData.state, formData.zipCode].filter(Boolean).join(', ')}
                  </p>
                )}
                {formData.phone && <p className="text-sm">{formData.phone}</p>}
                {(formData.barBoxTables || formData.regulationTables) && (
                  <p className="text-sm">
                    Tables: {formData.barBoxTables || '0'} Bar Box + {formData.regulationTables || '0'} Regulation
                    {(formData.barBoxTables && formData.regulationTables) &&
                      ` = ${parseInt(formData.barBoxTables || '0') + parseInt(formData.regulationTables || '0')} total`
                    }
                  </p>
                )}
                {formData.mainContact && <p className="text-sm">Contact: {formData.mainContact}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};