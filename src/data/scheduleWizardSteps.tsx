/**
 * @fileoverview Schedule Creation Wizard Step Definitions
 * Contains all step configurations for the schedule creation wizard
 * Handles season length and tournament conflict avoidance (BCA/APA nationals)
 */
import React from 'react';
import { fetchBCAChampionshipURL } from '@/utils/tournamentUtils';
import {
  seasonLengthInfo,
  customSeasonLengthInfo,
  tournamentSchedulingInfo,
  apaNationalsInfo,
  tournamentCalendarInfo,
} from '@/constants/infoContent/leagueWizardInfoContent';

/**
 * Wizard step definition interface
 */
export interface WizardStep {
  id: string;
  title: string;
  subtitle?: string | React.ReactElement;
  type: 'input' | 'choice' | 'dual_date';
  placeholder?: string;
  choices?: Array<{
    value: string;
    label: string;
    subtitle?: string;
    description?: string;
    warning?: string;
    icon?: string;
    infoTitle?: string;
    infoContent?: string;
  }>;
  validator?: (value: string) => { isValid: boolean; error?: string };
  getValue: () => string;
  setValue: (value: string) => void;
  infoTitle?: string;
  infoContent?: string | React.ReactElement | null;
  infoLabel?: string;
}

/**
 * Schedule form data interface
 */
export interface ScheduleFormData {
  leagueId: string;
  seasonLength: number;
  bcaNationalsChoice: string;
  bcaNationalsStart: string;
  bcaNationalsEnd: string;
  apaNationalsStart: string;
  apaNationalsEnd: string;
  endDate: string;
}

/**
 * Parameters for creating wizard steps
 */
export interface WizardStepParams {
  formData: ScheduleFormData;
  updateFormData: (field: keyof ScheduleFormData, value: string | number) => void;
  foundTournamentDates: Array<{
    id: string;
    label: string;
    description: string;
    startDate: string;
    endDate: string;
    voteCount: number;
    lastConfirmed: string;
  }>;
  findTournamentOption: (id: string) => any;
  validateTournamentDate: (value: string) => { isValid: boolean; error?: string };
  validateTournamentDateRange: (value: string) => { isValid: boolean; error?: string };
  seasonLengthChoice: string;
  setSeasonLengthChoice: (value: string) => void;
  leagueStartDate: string;
}

/**
 * Create schedule wizard steps with current form data and functions
 */
export const createWizardSteps = (params: WizardStepParams): WizardStep[] => {
  const {
    formData,
    updateFormData,
    foundTournamentDates,
    findTournamentOption,
    validateTournamentDate,
    validateTournamentDateRange,
    seasonLengthChoice,
    setSeasonLengthChoice,
    // leagueStartDate is available but not used yet - will be needed for calculating end dates
  } = params;

  return [
    // Step 1: Season Length Selection
    {
      id: 'season_length',
      title: 'How many weeks will the regular season last?',
      subtitle: 'Standard season lengths are 12-20 weeks. Choose a custom length if needed.',
      type: 'choice',
      choices: [
        { value: '12', label: '12 weeks', subtitle: 'Shorter season' },
        { value: '14', label: '14 weeks', subtitle: 'Standard short season' },
        { value: '16', label: '16 weeks', subtitle: 'Most common length' },
        { value: '18', label: '18 weeks', subtitle: 'Standard long season' },
        { value: '20', label: '20 weeks', subtitle: 'Extended season' },
        { value: 'custom', label: 'Custom length', subtitle: 'Enter a specific number of weeks' },
      ],
      getValue: () => seasonLengthChoice,
      setValue: (value: string) => {
        setSeasonLengthChoice(value);
        if (value !== 'custom') {
          updateFormData('seasonLength', parseInt(value));
        }
      },
      infoTitle: seasonLengthInfo.title,
      infoContent: seasonLengthInfo.content,
    },

    // Step 2: Custom Season Length (conditional)
    {
      id: 'custom_season_length',
      title: 'Enter the number of weeks for your season',
      subtitle: 'How many weeks will your regular season last? (Does not include playoffs)',
      type: 'input',
      placeholder: 'Enter number of weeks (e.g., 16)',
      getValue: () => formData.seasonLength.toString(),
      setValue: (value: string) => {
        const weeks = parseInt(value);
        if (!isNaN(weeks)) {
          updateFormData('seasonLength', weeks);
        }
      },
      validator: (value: string) => {
        const weeks = parseInt(value);
        if (isNaN(weeks)) {
          return { isValid: false, error: 'Please enter a valid number' };
        }
        if (weeks < 1) {
          return { isValid: false, error: 'Season must be at least 1 week' };
        }
        if (weeks > 52) {
          return { isValid: false, error: 'Season cannot exceed 52 weeks' };
        }
        return { isValid: true };
      },
      infoTitle: customSeasonLengthInfo.title,
      infoContent: customSeasonLengthInfo.content,
    },

    // Step 3: BCA Nationals Tournament Scheduling
    {
      id: 'bca_nationals_dates',
      title: 'When are the BCA National Championships?',
      subtitle: (
        <>
          <p className="mb-2">
            We need to know when nationals are so your playoffs don't conflict.
          </p>
          <p className="text-sm text-gray-600">
            If another operator has already entered these dates, you'll see them below with
            verification counts.
          </p>
        </>
      ),
      type: 'choice',
      choices: [
        // Dynamic choices populated from database search results
        ...foundTournamentDates.map((option) => ({
          value: option.id,
          label: option.label,
          subtitle: option.description,
          description: `${option.voteCount} operator${option.voteCount !== 1 ? 's' : ''} confirmed • Last verified ${option.lastConfirmed}`,
        })),
        {
          value: 'ignore',
          label: "I don't need to avoid BCA Nationals",
          subtitle: 'Skip tournament conflict checking',
          description:
            'Choose this if your league does not send teams to nationals or you will schedule around it manually.',
        },
        {
          value: 'custom',
          label: 'Enter custom BCA dates',
          subtitle: 'Dates not listed above',
          description:
            'Enter your own dates. Your entry will be added to the database for other operators to verify.',
        },
      ],
      getValue: () => formData.bcaNationalsChoice,
      setValue: (value: string) => {
        updateFormData('bcaNationalsChoice', value);

        // If selecting a found option, auto-fill the dates
        if (value !== 'ignore' && value !== 'custom') {
          const selectedOption = findTournamentOption(value);
          if (selectedOption) {
            updateFormData('bcaNationalsStart', selectedOption.startDate);
            updateFormData('bcaNationalsEnd', selectedOption.endDate);
          }
        }

        // Clear dates if ignoring
        if (value === 'ignore') {
          updateFormData('bcaNationalsStart', '');
          updateFormData('bcaNationalsEnd', '');
        }
      },
      infoTitle: tournamentSchedulingInfo.title,
      infoContent: (
        <div className="space-y-3">
          {tournamentSchedulingInfo.content}
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-blue-900 mb-2">Check Official Dates:</p>
            <a
              href={fetchBCAChampionshipURL()}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              {fetchBCAChampionshipURL()}
            </a>
          </div>
        </div>
      ),
      infoLabel: 'Why track nationals?',
    },

    // Step 4: Custom BCA Dates (conditional - dual date picker)
    {
      id: 'bca_custom_dates',
      title: 'Enter BCA National Championship dates',
      subtitle:
        "Enter the start and end dates for this year's BCA National Championships. Your entry will help other operators too!",
      type: 'dual_date',
      getValue: () => `${formData.bcaNationalsStart}|${formData.bcaNationalsEnd}`,
      setValue: (value: string) => {
        const [start, end] = value.split('|');
        if (start) updateFormData('bcaNationalsStart', start);
        if (end) updateFormData('bcaNationalsEnd', end);
      },
      validator: validateTournamentDateRange,
    },

    // Step 5: APA Nationals Start Date
    {
      id: 'apa_nationals_start',
      title: 'When do APA Nationals start?',
      subtitle: 'Enter the first day of the APA National Championships',
      type: 'input',
      placeholder: 'Select start date',
      getValue: () => formData.apaNationalsStart,
      setValue: (value: string) => {
        updateFormData('apaNationalsStart', value);
      },
      validator: validateTournamentDate,
      infoTitle: apaNationalsInfo.title,
      infoContent: apaNationalsInfo.content,
      infoLabel: 'Why APA nationals?',
    },

    // Step 6: APA Nationals End Date
    {
      id: 'apa_nationals_end',
      title: 'When do APA Nationals end?',
      subtitle: 'Enter the last day of the APA National Championships',
      type: 'input',
      placeholder: 'Select end date',
      getValue: () => formData.apaNationalsEnd,
      setValue: (value: string) => {
        updateFormData('apaNationalsEnd', value);
      },
      validator: validateTournamentDate,
      infoTitle: tournamentCalendarInfo.title,
      infoContent: tournamentCalendarInfo.content,
      infoLabel: 'See calendar example',
    },
  ];
};
