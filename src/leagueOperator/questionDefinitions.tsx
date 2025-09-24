/**
 * @fileoverview Question Definitions for League Operator Application
 * Configuration objects for all survey questions in the application flow
 */
import React from 'react';
import type { LeagueOperatorApplication } from '../schemas/leagueOperatorSchema';
import type { ApplicationAction } from './types';
import {
  leagueNameSchema,
} from '../schemas/leagueOperatorSchema';
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
            Any contact information you provide will be made publicly available
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
            <button
              onClick={() => setShowSetupGuide(true)}
              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-1 rounded-md transition-colors"
            >
              Recommended Setup
            </button>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-800 mb-2">
            💡 Available Now
          </h4>
          <p className="text-blue-700">
            • Email contact (recommended to start)
          </p>
          <p className="text-xs text-blue-600 mt-2">
            Additional contact methods (phone, social media) will be available
            in future updates
          </p>
        </div>
      </div>
    ),
    choices: [
      {
        value: 'understood',
        label: 'I Understand',
        variant: 'default',
      },
    ],
    getValue: () =>
      state.contactDisclaimerAcknowledged ? 'understood' : '',
    setValue: (value: string) =>
      dispatch({
        type: 'SET_CONTACT_DISCLAIMER_ACKNOWLEDGED',
        payload: value === 'understood',
      }),
  },
];