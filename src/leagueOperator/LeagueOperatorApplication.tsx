/**
 * @fileoverview League Operator Application Form
 * Survey-style form orchestrator with step management
 */
import React, { useReducer, useState, useEffect } from 'react';
import { QuestionStep } from './QuestionStep';
import { ChoiceStep } from './ChoiceStep';
import { ApplicationPreview } from './ApplicationPreview';
import type {
  LeagueOperatorApplication as ApplicationData,
  Venue,
} from '../schemas/leagueOperatorSchema';
import {
  leagueNameSchema,
  useProfileAddressSchema,
  organizationAddressSchema,
  organizationCitySchema,
  organizationStateSchema,
  organizationZipSchema,
} from '../schemas/leagueOperatorSchema';
import {
  formatLeagueName,
  formatAddress,
  formatCity,
  formatZipCode,
} from '../utils/formatters';
import { useUserProfile } from '../hooks/useUserProfile';
import { US_STATES } from '../constants/states';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ApplicationAction =
  | { type: 'SET_LEAGUE_NAME'; payload: string }
  | { type: 'SET_USE_PROFILE_ADDRESS'; payload: boolean }
  | { type: 'SET_ORGANIZATION_ADDRESS'; payload: string }
  | { type: 'SET_ORGANIZATION_CITY'; payload: string }
  | { type: 'SET_ORGANIZATION_STATE'; payload: string }
  | { type: 'SET_ORGANIZATION_ZIP_CODE'; payload: string }
  | { type: 'SET_CONTACT_DISCLAIMER_ACKNOWLEDGED'; payload: boolean }
  | { type: 'ADD_VENUE'; payload: Venue }
  | {
      type: 'UPDATE_VENUE';
      payload: { id: string; field: keyof Venue; value: string | number };
    }
  | { type: 'SET_CONTACT_NAME'; payload: string }
  | { type: 'SET_CONTACT_EMAIL'; payload: string }
  | { type: 'SET_CONTACT_PHONE'; payload: string };

const initialState: ApplicationData = {
  leagueName: '',
  useProfileAddress: undefined,
  organizationAddress: '',
  organizationCity: '',
  organizationState: '',
  organizationZipCode: '',
  contactDisclaimerAcknowledged: undefined,
  venues: [],
  contactName: '',
  contactEmail: '',
  contactPhone: '',
};

function applicationReducer(
  state: ApplicationData,
  action: ApplicationAction
): ApplicationData {
  switch (action.type) {
    case 'SET_LEAGUE_NAME':
      return { ...state, leagueName: action.payload };
    case 'SET_USE_PROFILE_ADDRESS':
      return { ...state, useProfileAddress: action.payload };
    case 'SET_ORGANIZATION_ADDRESS':
      return { ...state, organizationAddress: action.payload };
    case 'SET_ORGANIZATION_CITY':
      return { ...state, organizationCity: action.payload };
    case 'SET_ORGANIZATION_STATE':
      return { ...state, organizationState: action.payload };
    case 'SET_ORGANIZATION_ZIP_CODE':
      return { ...state, organizationZipCode: action.payload };
    case 'SET_CONTACT_DISCLAIMER_ACKNOWLEDGED':
      return { ...state, contactDisclaimerAcknowledged: action.payload };
    case 'ADD_VENUE':
      return { ...state, venues: [...state.venues, action.payload] };
    case 'UPDATE_VENUE':
      return {
        ...state,
        venues: state.venues.map((venue) =>
          venue.id === action.payload.id
            ? { ...venue, [action.payload.field]: action.payload.value }
            : venue
        ),
      };
    case 'SET_CONTACT_NAME':
      return { ...state, contactName: action.payload };
    case 'SET_CONTACT_EMAIL':
      return { ...state, contactEmail: action.payload };
    case 'SET_CONTACT_PHONE':
      return { ...state, contactPhone: action.payload };
    default:
      return state;
  }
}

/**
 * League Operator Application Form Component
 *
 * Survey-style application with dynamic preview
 */
export const LeagueOperatorApplication: React.FC = () => {
  const { member } = useUserProfile();
  const [state, dispatch] = useReducer(applicationReducer, initialState);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [error, setError] = useState<string>('');

  // Custom address input states
  const [customAddress, setCustomAddress] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customState, setCustomState] = useState('');
  const [customZip, setCustomZip] = useState('');

  // Modal states
  const [showSecurityDisclaimer, setShowSecurityDisclaimer] = useState(false);
  const [showSetupGuide, setShowSetupGuide] = useState(false);

  // Question definitions
  const questions = [
    {
      id: 'leagueName',
      title: 'What would you like to name your organization?',
      subtitle:
        'Your organization will hold all of the different leagues you want to run. Think of it as your league operator business name.',
      placeholder:
        "e.g., Ed's BCA Leagues, Downtown Pool Organization, Murphy's League System",
      formatter: formatLeagueName,
      validator: (value: string) => {
        try {
          leagueNameSchema.parse(value);
          return { success: true };
        } catch (error: unknown) {
          const zodError = error as { errors?: Array<{ message: string }> };
          return {
            success: false,
            error: zodError.errors?.[0]?.message || 'Invalid input',
          };
        }
      },
      getValue: () => state.leagueName,
      setValue: (value: string) =>
        dispatch({ type: 'SET_LEAGUE_NAME', payload: value }),
      infoTitle: 'Organization vs Individual Leagues',
      infoContent: (
        <div className="space-y-2">
          <p>
            <strong>Organization Name:</strong> "Ed's BCA Leagues"
          </p>
          <p>
            <strong>Individual Leagues:</strong>
          </p>
          <ul className="ml-4 space-y-1">
            <li>• Tuesday Night 8-Ball West Side</li>
            <li>• Wednesday Night 9-Ball East Side</li>
            <li>• Friday Mixed Tournament League</li>
          </ul>
          <p className="mt-3 text-xs text-blue-600">
            You'll create the specific leagues later. This is just your
            organization name.
          </p>
        </div>
      ),
    },
    {
      id: 'useProfileAddress',
      type: 'choice',
      title: 'Organization Address',
      subtitle: `Use this address for ${
        state.leagueName || 'your organization'
      }?`,
      content:
        state.useProfileAddress !== false && member ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">
              Profile Address:
            </h4>
            <p className="text-gray-900">
              {member.address}
              <br />
              {member.city}, {member.state} {member.zip_code}
            </p>
          </div>
        ) : state.useProfileAddress !== false ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600">Loading your profile address...</p>
          </div>
        ) : (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-4">
              Enter Organization Address:
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  value={customAddress}
                  onChange={(e) => {
                    setCustomAddress(e.target.value);
                    dispatch({
                      type: 'SET_ORGANIZATION_ADDRESS',
                      payload: e.target.value,
                    });
                  }}
                  placeholder="123 Main Street"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={customCity}
                    onChange={(e) => {
                      setCustomCity(e.target.value);
                      dispatch({
                        type: 'SET_ORGANIZATION_CITY',
                        payload: e.target.value,
                      });
                    }}
                    placeholder="Springfield"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <Select
                    value={customState}
                    onValueChange={(value) => {
                      setCustomState(value);
                      dispatch({
                        type: 'SET_ORGANIZATION_STATE',
                        payload: value,
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={customZip}
                  onChange={(e) => {
                    setCustomZip(e.target.value);
                    dispatch({
                      type: 'SET_ORGANIZATION_ZIP_CODE',
                      payload: e.target.value,
                    });
                  }}
                  placeholder="62701"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        ),
      choices: [
        { value: 'yes', label: 'Use Profile Address' },
        { value: 'no', label: 'Enter New Address' },
      ],
      getValue: () =>
        state.useProfileAddress === true
          ? 'yes'
          : state.useProfileAddress === false
          ? 'no'
          : '',
      setValue: (value: string) => {
        const useProfile = value === 'yes';
        dispatch({ type: 'SET_USE_PROFILE_ADDRESS', payload: useProfile });

        // Clear custom address fields if switching back to "yes"
        if (useProfile) {
          setCustomAddress('');
          setCustomCity('');
          setCustomState('');
          setCustomZip('');
          dispatch({ type: 'SET_ORGANIZATION_ADDRESS', payload: '' });
          dispatch({ type: 'SET_ORGANIZATION_CITY', payload: '' });
          dispatch({ type: 'SET_ORGANIZATION_STATE', payload: '' });
          dispatch({ type: 'SET_ORGANIZATION_ZIP_CODE', payload: '' });
        }
      },
      infoTitle: 'Organization Address',
      infoContent: (
        <div className="space-y-2">
          <p>
            <strong>Profile Address:</strong> This is the address from your
            member application
          </p>
          <p>
            <strong>Organization Address:</strong> This can be different if your
            organization operates from a different location
          </p>
          <p className="mt-3 text-xs text-blue-600">
            Most operators use their profile address, but you can specify a
            different one if needed.
          </p>
        </div>
      ),
    },
    {
      id: 'contactDisclaimer',
      type: 'choice',
      title: 'Contact Information Privacy Notice',
      subtitle: '',
      content: (
        <div className="space-y-6">
          {/* Privacy Warning */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-yellow-800">
                  Security Warning
                </h4>
                <p className="mt-1 text-sm text-yellow-700">
                  Any contact information you provide may be published publicly
                  to any player searching for leagues. You are responsible for
                  any consequences of this published information.
                  <button
                    onClick={() => setShowSecurityDisclaimer(true)}
                    className="underline ml-1 text-yellow-700 hover:text-yellow-800"
                  >
                    View security disclaimer
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-blue-400 text-xl">💡</span>
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  Recommended
                </h4>
                <p className="mt-1 text-sm text-blue-700">
                  We recommend creating any contact information specifically for
                  your organization rather than using personal accounts.
                  <button
                    onClick={() => setShowSetupGuide(true)}
                    className="underline ml-1 text-blue-700 hover:text-blue-800"
                  >
                    Our recommendations
                  </button>
                </p>
              </div>
            </div>
          </div>

          {/* Coming Soon Notice */}
          <div className="bg-gray-50 border border-gray-200 p-4 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Available now:</strong> Email contact
              <br />
              <strong>Coming soon:</strong> Social media, phone, venue contact
              options
            </p>
          </div>
        </div>
      ),
      choices: [{ value: 'understood', label: 'I Understand, Continue' }],
      getValue: () => (state.contactDisclaimerAcknowledged ? 'understood' : ''),
      setValue: (value: string) =>
        dispatch({
          type: 'SET_CONTACT_DISCLAIMER_ACKNOWLEDGED',
          payload: value === 'understood',
        }),
      infoTitle: 'Legal Distinction',
      infoContent: (
        <div className="space-y-2">
          <p>
            <strong>This is NOT our privacy policy:</strong> That covers how WE
            protect YOUR data
          </p>
          <p>
            <strong>This IS a security disclaimer:</strong> Warning about what
            YOU choose to make public
          </p>
          <p>
            <strong>Your Responsibility:</strong> Any issues from publishing
            your contact info publicly
          </p>
          <p>
            <strong>Our Responsibility:</strong> Protecting your private account
            data (separate issue)
          </p>
          <p className="mt-3 text-xs text-blue-600">
            Two different legal concepts: our data protection vs your public
            information choices.
          </p>
        </div>
      ),
    },
  ];

  const currentQuestion = questions[currentStep];

  const handleInputChange = (value: string) => {
    setCurrentInput(value);
    setError('');
  };

  const handleNext = (formattedValue?: string) => {
    // Choice questions don't need validation since they're pre-validated
    if (currentQuestion.type === 'choice') {
      const currentValue = currentQuestion.getValue();
      if (currentValue) {
        // Special validation for address choice - if "no", require custom address
        if (
          currentQuestion.id === 'useProfileAddress' &&
          currentValue === 'no'
        ) {
          // Format the data first
          const formattedAddress = formatAddress(customAddress);
          const formattedCity = formatCity(customCity);
          const formattedZip = formatZipCode(customZip);
          // State doesn't need formatting as it comes from dropdown

          // Validate formatted data
          try {
            organizationAddressSchema.parse(formattedAddress);
          } catch {
            setError('Please enter a valid street address');
            return;
          }

          try {
            organizationCitySchema.parse(formattedCity);
          } catch {
            setError('Please enter a valid city');
            return;
          }

          try {
            organizationStateSchema.parse(customState);
          } catch {
            setError('Please select a valid state');
            return;
          }

          try {
            organizationZipSchema.parse(formattedZip);
          } catch (error: unknown) {
            const zodError = error as { errors?: Array<{ message: string }> };
            setError(
              zodError.errors?.[0]?.message || 'Please enter a valid ZIP code'
            );
            return;
          }

          // Store the formatted data
          setCustomAddress(formattedAddress);
          setCustomCity(formattedCity);
          setCustomZip(formattedZip);
          dispatch({
            type: 'SET_ORGANIZATION_ADDRESS',
            payload: formattedAddress,
          });
          dispatch({ type: 'SET_ORGANIZATION_CITY', payload: formattedCity });
          dispatch({
            type: 'SET_ORGANIZATION_ZIP_CODE',
            payload: formattedZip,
          });
        }

        setError(''); // Clear any errors
        if (currentStep < questions.length - 1) {
          setCurrentStep((prev) => prev + 1);
          setCurrentInput('');
        } else {
          alert('Form completed! (We need to add the next questions)');
        }
      }
      return;
    }

    // Regular text input questions need validation
    const valueToUse = formattedValue || currentInput;
    if (currentQuestion.validator) {
      const validation = currentQuestion.validator(valueToUse);
      if (validation.success) {
        currentQuestion.setValue(valueToUse);

        if (currentStep < questions.length - 1) {
          setCurrentStep((prev) => prev + 1);
          setCurrentInput('');
        } else {
          alert('Form completed! (We need to add the next questions)');
        }
      } else {
        setError(validation.error || 'Invalid input');
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setCurrentInput(questions[currentStep - 1].getValue());
    }
  };

  // Initialize current input when step changes
  useEffect(() => {
    setCurrentInput(currentQuestion.getValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              League Operator Application
            </h1>
            <p className="text-gray-600">
              Question {currentStep + 1} of {questions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Question Section */}
        {currentQuestion.type === 'choice' ? (
          <ChoiceStep
            title={currentQuestion.title}
            subtitle={currentQuestion.subtitle}
            content={currentQuestion.content}
            choices={currentQuestion.choices}
            selectedValue={currentQuestion.getValue()}
            onSelect={(value) => currentQuestion.setValue(value)}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoBack={currentStep > 0}
            isLastQuestion={currentStep === questions.length - 1}
            infoTitle={currentQuestion.infoTitle}
            infoContent={currentQuestion.infoContent}
            error={error}
          />
        ) : (
          <QuestionStep
            title={currentQuestion.title}
            subtitle={currentQuestion.subtitle || ''}
            placeholder={currentQuestion.placeholder || ''}
            value={currentInput}
            onChange={handleInputChange}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onFormat={currentQuestion.formatter || ((v) => v)}
            validator={currentQuestion.validator || (() => ({ success: true }))}
            error={error}
            canGoBack={currentStep > 0}
            isLastQuestion={currentStep === questions.length - 1}
            infoTitle={currentQuestion.infoTitle}
            infoContent={currentQuestion.infoContent}
          />
        )}

        {/* Application Preview */}
        <ApplicationPreview applicationData={state} />
      </div>

      {/* Security Disclaimer Modal */}
      {/* TODO: Have a lawyer review this disclaimer to ensure it's legally enforceable and provides adequate protection */}
      {showSecurityDisclaimer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-96 overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Security Disclaimer</h3>
            <div className="space-y-3 text-sm">
              <p>
                <strong>Public Information Warning:</strong> Any contact
                information you choose to provide will be made publicly
                available to players searching for leagues through our platform.
              </p>

              <p>
                <strong>Your Responsibility:</strong> You acknowledge and accept
                full responsibility for any consequences that may result from
                publishing your contact information publicly, including but not
                limited to unwanted communications, solicitation, harassment, or
                other issues.
              </p>

              <p>
                <strong>Platform Liability:</strong> Our platform serves only as
                a conduit for information you choose to make public. We accept
                no responsibility or liability for any problems, damages, or
                consequences arising from your decision to publish contact
                information.
              </p>

              <p>
                <strong>Recommendation:</strong> We strongly recommend using
                dedicated business contact methods rather than personal
                information to minimize risk.
              </p>

              <p>
                <strong>Your Choice:</strong> Publication of contact information
                is entirely voluntary and at your own risk.
              </p>
            </div>
            <button
              onClick={() => setShowSecurityDisclaimer(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Setup Guide Modal */}
      {showSetupGuide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl max-h-96 overflow-y-scroll" style={{scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 #f1f5f9'}}>
            <h3 className="text-lg font-bold mb-4">
              Professional League Setup Guide
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-semibold">
                  1. Create Dedicated Email (Highly Recommended)
                </h4>
                <p>
                  • Google, Outlook, Yahoo and more give FREE email addresses
                </p>
                <p>• Easy naming format: [YourLeagueName]@gmail.com</p>
                <p>• Example: "MidTownBCALeagues@gmail.com"</p>
                <p>• Keep separate from personal email</p>
                <p>• (Optional) Forward into your personal email</p>
                <p>• (Optional) Filter into separate folders</p>
                <div className="mt-2 text-green-600 font-medium">
                  This is FREE and EASY - should be done at minimum
                </div>
              </div>

              <div>
                <h4 className="font-semibold">2. Google Voice (Recommended)</h4>
                <p>• Get a FREE professional business phone number</p>
                <p>• Works like a real business line with multiple "employees"</p>
                <p>• Ring multiple phones - share with co-operators/assistants</p>
                <p>• Professional voicemail with custom greeting</p>
                <p>• Text messaging capabilities for quick responses</p>
                <p>• Use through mobile app or web interface</p>
                <p>• Set business hours - calls go to voicemail after hours</p>
                <p>• Turn on/off anytime - full control</p>
                <p>• Appears completely separate from personal number</p>
                <div className="mt-2 text-blue-600 font-medium">
                  Creates a legitimate business presence that players will trust
                </div>
              </div>
              <div>
                <h4 className="font-semibold">
                  3. Social Media Accounts (Optional)
                </h4>
                <p>• Facebook Business Page (not personal profile)</p>
                <p>• Instagram: @YourLeagueName</p>
                <p>• Twitter/X: @YourLeagueName</p>
                <div className="mt-2 text-amber-600 font-medium">
                  Regular posting can grow your league and increase venue patronage
                </div>
                <div className="mt-1 text-amber-700 text-xs">
                  Note: Requires ongoing effort and content creation to be effective
                </div>
                <div className="mt-1 text-gray-600 text-xs">
                  Coming soon: App integration for social media functionality
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-700 mb-2">Why Separate Your Personal Information?</h4>
                <p className="text-gray-600 leading-relaxed">
                  Setting up dedicated league contact methods protects your personal privacy while
                  presenting a professional, organized image to players. When players see dedicated
                  business email addresses and phone numbers, they immediately recognize you as a
                  serious, trustworthy league operator. Plus, these dedicated channels can be easily
                  shared with co-operators or assistants, making it simple to manage your growing
                  league operations without compromising your personal information.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSetupGuide(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
