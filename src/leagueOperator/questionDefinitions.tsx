/**
 * @fileoverview Question Definitions for League Operator Application
 * Configuration objects for all survey questions in the application flow
 */
import React from 'react';
import type { LeagueOperatorApplication } from '../schemas/leagueOperatorSchema';
import type { ApplicationAction } from './types';
import {
  leagueNameSchema,
  leagueEmailSchema,
} from '../schemas/leagueOperatorSchema';
import { ContactInfoExposure } from './ContactInfoExposure';
import {
  formatLeagueName,
  formatCity,
  formatZipCode,
} from '../utils/formatters';
import { US_STATES } from '../constants/states';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Question configuration interface
 */
interface QuestionConfig {
  id: string;
  type?: 'input' | 'choice';
  title: string;
  subtitle?: string;
  placeholder?: string;
  formatter?: (value: string) => string;
  validator?: (value: string) => { success: boolean; error?: string };
  getValue: () => any;
  setValue: (value: any) => void;
  infoTitle?: string;
  infoContent?: React.ReactNode;
  choices?: Array<{
    value: string;
    label: string;
    variant?: 'default' | 'outline' | 'secondary';
  }>;
  content?: React.ReactNode;
  additionalContent?: React.ReactNode;
}

/**
 * Generate question definitions for the league operator application
 *
 * @param state - Current application state
 * @param dispatch - State dispatch function
 * @param member - User profile data
 * @param customAddress - Custom address state
 * @param setCustomAddress - Custom address setter
 * @param customCity - Custom city state
 * @param setCustomCity - Custom city setter
 * @param customState - Custom state value
 * @param setCustomState - Custom state setter
 * @param customZip - Custom zip state
 * @param setCustomZip - Custom zip setter
 * @param setShowSecurityDisclaimer - Security disclaimer modal setter
 * @param setShowSetupGuide - Setup guide modal setter
 */
export const getQuestionDefinitions = (
  state: LeagueOperatorApplication,
  dispatch: React.Dispatch<ApplicationAction>,
  member: any,
  customAddress: string,
  setCustomAddress: (value: string) => void,
  customCity: string,
  setCustomCity: (value: string) => void,
  customState: string,
  setCustomState: (value: string) => void,
  customZip: string,
  setCustomZip: (value: string) => void,
  setShowSecurityDisclaimer: (show: boolean) => void,
  setShowSetupGuide: (show: boolean) => void
): QuestionConfig[] => [
  // Question 1: Organization Name
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

  // Question 2: Profile Address Choice
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                value={customCity}
                onChange={(e) => {
                  const formatted = formatCity(e.target.value);
                  setCustomCity(formatted);
                  dispatch({
                    type: 'SET_ORGANIZATION_CITY',
                    payload: formatted,
                  });
                }}
                placeholder="Springfield"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
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
                    {US_STATES.map((stateCode) => (
                      <SelectItem key={stateCode} value={stateCode}>
                        {stateCode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={customZip}
                  onChange={(e) => {
                    const formatted = formatZipCode(e.target.value);
                    setCustomZip(formatted);
                    dispatch({
                      type: 'SET_ORGANIZATION_ZIP_CODE',
                      payload: formatted,
                    });
                  }}
                  placeholder="12345"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      ),
    choices: [
      {
        value: 'yes',
        label: 'Use Profile Address',
        variant: 'default',
      },
      {
        value: 'no',
        label: 'Enter New Address',
        variant: 'outline',
      },
    ],
    getValue: () => state.useProfileAddress?.toString() || '',
    setValue: (value: string) => {
      const boolValue = value === 'yes';
      dispatch({ type: 'SET_USE_PROFILE_ADDRESS', payload: boolValue });
    },
    infoTitle: 'Address Privacy',
    infoContent: (
      <div className="space-y-2 text-sm">
        <p>
          This address will be used for official league correspondence and may
          be visible to players in your leagues.
        </p>
        <p>
          <strong>Profile Address:</strong> Uses your existing member address
        </p>
        <p>
          <strong>New Address:</strong> Enter a different business address for
          your organization
        </p>
      </div>
    ),
  },

  // Question 3: Contact Disclaimer
  {
    id: 'contactDisclaimer',
    type: 'choice',
    title: 'Contact Information Setup',
    subtitle:
      'How do you want players to contact you about joining your leagues?',
    content: (
      <div className="space-y-4 text-sm">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h4 className="font-semibold text-amber-800 mb-2">
            ⚠️ Security Warning
          </h4>
          <p className="text-amber-700 mb-3">
            Any contact information you provide as a League Operator will be made publicly available
            to players searching for leagues. This information will be visible
            on your league listings.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSecurityDisclaimer(true)}
              className="text-xs bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1 rounded-md transition-colors"
            >
              Security Disclaimer
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            💡 Professional Setup Recommendations
          </h4>
          <p className="text-blue-700 mb-3">
            Please read these insider tips that successful league operators use to build thriving, professional leagues and protect their privacy.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSetupGuide(true)}
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md transition-colors"
            >
              Setup Guide
            </button>
          </div>
        </div>

        {/* Agreement Checkbox */}
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={state.contactDisclaimerAcknowledged || false}
              onChange={(e) =>
                dispatch({
                  type: 'SET_CONTACT_DISCLAIMER_ACKNOWLEDGED',
                  payload: e.target.checked,
                })
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-900">
              I agree to the terms and acknowledge that my League Operator contact information may be made public
            </span>
          </label>
        </div>
      </div>
    ),
    choices: [],
    getValue: () =>
      state.contactDisclaimerAcknowledged ? 'agreed' : '',
    setValue: () => {
      // Handled by checkbox onChange
    },
  },

  // Question 4: League Email
  {
    id: 'leagueEmail',
    type: 'choice',
    title: 'League Contact Email',
    subtitle: `What email should players use to contact ${
      state.leagueName || 'your league'
    }?`,
    content: (
      <div className="space-y-6">
        {/* Email Display */}
        <div className="bg-gray-50 p-4 rounded-lg">
          {state.useProfileEmail !== false && member ? (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">
                Your Profile Email:
              </h4>
              <p className="text-gray-900 mb-4">
                {member.email}
              </p>
            </div>
          ) : state.useProfileEmail !== false ? (
            <div>
              <p className="text-gray-600 mb-4">Loading your profile email...</p>
            </div>
          ) : (
            <div>
              <h4 className="font-semibold text-gray-700 mb-4">
                Enter League Email:
              </h4>
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    League Email Address
                  </label>
                  <input
                    type="email"
                    value={state.leagueEmail}
                    onChange={(e) => {
                      const value = e.target.value;
                      dispatch({
                        type: 'SET_LEAGUE_EMAIL',
                        payload: value,
                      });
                    }}
                    onBlur={(e) => {
                      // Validate email when user leaves the field
                      const value = e.target.value;
                      if (value) {
                        try {
                          leagueEmailSchema.parse(value);
                          e.target.setCustomValidity('');
                        } catch (error) {
                          e.target.setCustomValidity('Please enter a valid email address');
                        }
                      } else {
                        e.target.setCustomValidity('');
                      }
                    }}
                    placeholder="leaguename@gmail.com"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      state.leagueEmail && (() => {
                        try {
                          leagueEmailSchema.parse(state.leagueEmail);
                          return 'border-gray-300';
                        } catch {
                          return 'border-red-300 bg-red-50';
                        }
                      })()
                    }`}
                    required
                  />
                  {state.leagueEmail && (() => {
                    try {
                      leagueEmailSchema.parse(state.leagueEmail);
                      return null;
                    } catch (error) {
                      return (
                        <p className="mt-1 text-sm text-red-600">
                          Please enter a valid email address
                        </p>
                      );
                    }
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Email Choice Buttons - Now inside the content area */}
          <div className="flex gap-3 pt-2 border-t">
            <button
              onClick={() => dispatch({ type: 'SET_USE_PROFILE_EMAIL', payload: true })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                state.useProfileEmail === true
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Use Profile Email
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_USE_PROFILE_EMAIL', payload: false })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                state.useProfileEmail === false
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Enter New Email
            </button>
          </div>
        </div>

        {/* Email Visibility Settings - Show only if email is selected/entered */}
        {(state.useProfileEmail === true || (state.useProfileEmail === false && state.leagueEmail)) && (
          <div className="border-t pt-6">
            <ContactInfoExposure
              contactType="email"
              userRole="league_operator"
              selectedLevel={state.emailVisibility}
              onLevelChange={(level) => {
                dispatch({ type: 'SET_EMAIL_VISIBILITY', payload: level });
              }}
              title="Who can see your league email?"
              helpText="Choose who can access your email address for league-related communication."
            />
          </div>
        )}
      </div>
    ),
    choices: [],
    getValue: () => state.useProfileEmail?.toString() || '',
    setValue: (value: string) => {
      const boolValue = value === 'profile';
      dispatch({ type: 'SET_USE_PROFILE_EMAIL', payload: boolValue });
    },
    infoTitle: 'Email Contact Method',
    infoContent: (
      <div className="space-y-2 text-sm">
        <p>
          This email will be used for league-related communication and may
          be visible to players in your leagues.
        </p>
        <p>
          <strong>Profile Email:</strong> Uses your existing member email
        </p>
        <p>
          <strong>New Email:</strong> Enter a dedicated league email address
        </p>
        <p className="mt-3 text-xs text-blue-600">
          Consider using a dedicated league email for better organization
          and privacy protection.
        </p>
      </div>
    ),
  },
];