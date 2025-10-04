/**
 * @fileoverview League Creation Wizard Step Definitions
 * Contains all step configurations for the league creation wizard
 * Extracted from LeagueCreationWizard.tsx for better organization
 */
import React from 'react';
import { fetchBCAChampionshipURL } from '@/utils/tournamentUtils';
import {
  startDateInfo,
  seasonLengthInfo,
  customSeasonLengthInfo,
  gameFormatInfo,
  tournamentSchedulingInfo,
  apaNationalsInfo,
  tournamentCalendarInfo,
  teamFormatComparisonInfo,
  leagueQualifierInfo,
} from '@/constants/infoContent/leagueWizardInfoContent';

/**
 * Wizard step definition interface
 * Reuses the successful pattern from LeagueOperatorApplication
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
 * League form data interface (needed for step getValue/setValue functions)
 */
export interface LeagueFormData {
  gameType: string;
  startDate: string;
  dayOfWeek: string;
  season: string;
  year: number;
  qualifier: string;
  seasonLength: number;
  endDate: string;
  bcaNationalsChoice: string;
  bcaNationalsStart: string;
  bcaNationalsEnd: string;
  apaNationalsStart: string;
  apaNationalsEnd: string;
  teamFormat: '5_man' | '8_man' | '';
  handicapSystem: 'custom_5man' | 'bca_standard' | '';
  organizationName: string;
  organizationAddress: string;
  organizationCity: string;
  organizationState: string;
  organizationZipCode: string;
  contactEmail: string;
  contactPhone: string;
  selectedVenueId: string;
  venueIds: string[];
}

/**
 * Parameters for creating wizard steps
 */
export interface WizardStepParams {
  formData: LeagueFormData;
  updateFormData: (field: keyof LeagueFormData, value: string | number) => void;
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
  validateStartDate: (value: string) => { isValid: boolean; error?: string };
  validateTournamentDate: (value: string) => { isValid: boolean; error?: string };
  validateTournamentDateRange: (value: string) => { isValid: boolean; error?: string };
  seasonLengthChoice: string;
  setSeasonLengthChoice: (value: string) => void;
}

/**
 * Create wizard steps with provided parameters
 * This function generates all steps for the league creation wizard
 */
export const createWizardSteps = (params: WizardStepParams): WizardStep[] => {
  const {
    formData,
    updateFormData,
    foundTournamentDates,
    findTournamentOption,
    validateStartDate,
    validateTournamentDate,
    validateTournamentDateRange,
    seasonLengthChoice,
    setSeasonLengthChoice
  } = params;

  return [
    // Step 1: Start Date (determines day of week)
    {
      id: 'start_date',
      title: 'When does your season begin?',
      subtitle: 'Choose the first match date - this determines your league day of the week',
      type: 'input',
      placeholder: 'Select start date',
      validator: validateStartDate,
      getValue: () => formData.startDate,
      setValue: (value: string) => {
        updateFormData('startDate', value);
        console.log('📝 LEAGUE CREATION: Start date selected:', value);

        if (value) {
          const date = new Date(value);
          const startDate = new Date(value);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + (formData.seasonLength * 7));

          // Calculate derived fields (day of week, season, year)
          const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
          const season = (() => {
            const month = date.getMonth();
            if (month >= 2 && month <= 4) return 'Spring';
            if (month >= 5 && month <= 7) return 'Summer';
            if (month >= 8 && month <= 10) return 'Fall';
            return 'Winter';
          })();
          const year = date.getFullYear();

          updateFormData('dayOfWeek', dayOfWeek);
          updateFormData('season', season);
          updateFormData('year', year);
          updateFormData('endDate', endDate.toISOString().split('T')[0]);

          console.log('✅ CALCULATED: Day =', dayOfWeek, '| Season =', season, '| Year =', year);
          console.log('📅 CALCULATED: End date =', endDate.toISOString().split('T')[0]);
        }
      },
      infoTitle: startDateInfo.title,
      infoContent: startDateInfo.content
    },

    // Step 2: Season Length (12-20 weeks common, 6-52 custom)
    {
      id: 'season_length',
      title: 'How many weeks long should the season be?',
      subtitle: 'Choose a common length or select custom for 6-52 weeks',
      type: 'choice',
      choices: [
        { value: '12', label: '12 weeks', subtitle: 'Compact season' },
        { value: '14', label: '14 weeks', subtitle: 'Popular choice' },
        { value: '16', label: '16 weeks', subtitle: 'Most common ⭐', description: 'Standard season length used by most leagues' },
        { value: '18', label: '18 weeks', subtitle: 'Extended season' },
        { value: '20', label: '20 weeks', subtitle: 'Long season' },
        { value: 'custom', label: 'Custom length', subtitle: '6-52 weeks', description: 'Press Continue to choose your own custom season length' }
      ],
      getValue: () => seasonLengthChoice,
      setValue: (value: string) => {
        setSeasonLengthChoice(value);
        console.log('📝 SEASON LENGTH: Choice =', value);

        if (value !== 'custom') {
          updateFormData('seasonLength', parseInt(value));
          console.log('✅ SEASON LENGTH: Set to', value, 'weeks');

          // Recalculate end date if start date exists
          if (formData.startDate) {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + (parseInt(value) * 7));
            updateFormData('endDate', endDate.toISOString().split('T')[0]);
            console.log('📅 UPDATED: End date =', endDate.toISOString().split('T')[0]);
          }
        }
      },
      infoTitle: seasonLengthInfo.title,
      infoContent: seasonLengthInfo.content
    },

    // Step 2b: Custom Season Length (only shown when custom is selected)
    {
      id: 'custom_season_length',
      title: 'Enter custom season length',
      subtitle: 'Choose between 6-52 weeks for your season',
      type: 'input',
      placeholder: 'Enter number of weeks (6-52)',
      validator: (value: string) => {
        if (!value) return { isValid: false, error: 'Season length is required' };
        const weeks = parseInt(value);
        if (isNaN(weeks)) return { isValid: false, error: 'Please enter a valid number' };
        if (weeks < 6) return { isValid: false, error: 'Minimum season length is 6 weeks' };
        if (weeks > 52) return { isValid: false, error: 'Maximum season length is 52 weeks' };
        return { isValid: true };
      },
      getValue: () => formData.seasonLength.toString(),
      setValue: (value: string) => {
        const weeks = parseInt(value);
        if (!isNaN(weeks)) {
          updateFormData('seasonLength', weeks);
          console.log('✅ CUSTOM SEASON LENGTH: Set to', weeks, 'weeks');

          // Recalculate end date if start date exists
          if (formData.startDate) {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + (weeks * 7));
            updateFormData('endDate', endDate.toISOString().split('T')[0]);
            console.log('📅 UPDATED: End date =', endDate.toISOString().split('T')[0]);
          }
        }
      },
      infoTitle: customSeasonLengthInfo.title,
      infoContent: customSeasonLengthInfo.content
    },

    // Step 3: Game Type Selection
    {
      id: 'game_type',
      title: 'What type of pool game?',
      subtitle: 'Select the primary game format for your league',
      type: 'choice',
      choices: [
        {
          value: '8 Ball',
          label: '8 Ball',
          subtitle: 'Most popular choice',
          icon: '🎱',
          description: 'Traditional 8-ball pool - most common league format'
        },
        {
          value: '9 Ball',
          label: '9 Ball',
          subtitle: 'Fast-paced rotation',
          icon: '🟡',
          description: 'Rotation game with faster matches and more strategy'
        },
        {
          value: '10 Ball',
          label: '10 Ball',
          subtitle: 'Call shot rotation',
          icon: '🔟',
          description: 'Advanced rotation game requiring called shots'
        }
      ],
      getValue: () => formData.gameType,
      setValue: (value: string) => updateFormData('gameType', value),
      infoTitle: gameFormatInfo.title,
      infoContent: gameFormatInfo.content
    },

    // Step 4: BCA Nationals Tournament Scheduling
    {
      id: 'bca_nationals_dates',
      title: 'BCA National Tournament Scheduling',
      subtitle: (
        <span>
          To avoid conflicts with major tournaments your players may want to attend, please select how to handle BCA Nationals dates.
          <br />
          Please verify championship dates at the{' '}
          <a
            href={fetchBCAChampionshipURL()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            BCA Website
          </a>
          .
        </span>
      ),
      type: 'choice',
      choices: [
        // Dynamic choices - found dates from database search
        ...foundTournamentDates.map(option => ({
          value: option.id,
          label: option.label,
          description: option.description
        })),
        // Always include ignore and custom options
        {
          value: 'ignore',
          label: 'Ignore BCA tournament scheduling',
          description: 'Schedule normally without avoiding tournament dates'
        },
        {
          value: 'custom',
          label: 'Enter custom tournament dates',
          description: 'I have different dates or want to enter my own'
        }
      ],
      getValue: () => formData.bcaNationalsChoice,
      setValue: (value: string) => {
        updateFormData('bcaNationalsChoice', value);

        // Handle different choice types
        if (value.startsWith('found_dates_')) {
          // User selected a found date range - extract the dates
          const foundOption = findTournamentOption(value);
          if (foundOption) {
            updateFormData('bcaNationalsStart', foundOption.startDate);
            updateFormData('bcaNationalsEnd', foundOption.endDate);
            console.log('✅ SELECTED: Using community-verified dates:', foundOption);
          }
        } else if (value === 'ignore') {
          // User chose to ignore tournament dates
          updateFormData('bcaNationalsStart', '');
          updateFormData('bcaNationalsEnd', '');
          console.log('🚫 CHOICE: Operator chose to ignore BCA tournament scheduling');
        } else if (value === 'custom') {
          // User wants to enter custom dates - will be handled in next step
          console.log('✏️ CHOICE: Operator will enter custom tournament dates');
        }
      },
      infoTitle: tournamentSchedulingInfo.title,
      infoContent: tournamentSchedulingInfo.content,
      infoLabel: tournamentSchedulingInfo.label
    },

    // Step 5: BCA Custom Tournament Dates (only shown when custom is selected)
    {
      id: 'bca_custom_dates',
      title: 'BCA National Championship Dates',
      subtitle: (
        <span>
          Enter the start and end dates for BCA National Championships.
          <br />
          Verify championship dates at the{' '}
          <a
            href={fetchBCAChampionshipURL()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            BCA Website
          </a>
          .
        </span>
      ),
      type: 'dual_date',
      placeholder: 'BCA Nationals dates',
      validator: validateTournamentDateRange,
      getValue: () => `${formData.bcaNationalsStart}|${formData.bcaNationalsEnd}`,
      setValue: (value: string) => {
        const [startDate, endDate] = value.split('|');
        if (startDate) {
          updateFormData('bcaNationalsStart', startDate);
          console.log('📝 CUSTOM BCA DATE: User entered start date:', startDate);
        }
        if (endDate) {
          updateFormData('bcaNationalsEnd', endDate);
          console.log('📝 CUSTOM BCA DATE: User entered end date:', endDate);
          if (startDate && endDate) {
            console.log('🔄 DATABASE OPERATION: Saving custom BCA tournament dates for voting');
            console.log('📊 New entry structure:', {
              table: 'tournament_dates',
              data: {
                organization: 'BCA',
                tournament_type: 'nationals',
                year: new Date().getFullYear(),
                start_date: startDate,
                end_date: endDate,
                vote_count: 1,
                created_at: new Date().toISOString()
              }
            });
          }
        }
      },
      infoTitle: tournamentSchedulingInfo.title,
      infoContent: tournamentSchedulingInfo.content,
      infoLabel: tournamentSchedulingInfo.label
    },

    // Step 7: APA Nationals Start Date
    {
      id: 'apa_nationals_start',
      title: 'When are the APA National tournaments?',
      subtitle: 'Enter the start date to avoid scheduling conflicts (check APA website for current dates)',
      type: 'input',
      placeholder: 'APA Nationals start date',
      validator: validateTournamentDate,
      getValue: () => formData.apaNationalsStart,
      setValue: (value: string) => updateFormData('apaNationalsStart', value),
      infoTitle: apaNationalsInfo.title,
      infoContent: apaNationalsInfo.content
    },

    // Step 7: APA Nationals End Date
    {
      id: 'apa_nationals_end',
      title: 'APA Nationals end date',
      subtitle: 'Enter the end date for the APA National tournaments',
      type: 'input',
      placeholder: 'APA Nationals end date',
      validator: validateTournamentDate,
      getValue: () => formData.apaNationalsEnd,
      setValue: (value: string) => updateFormData('apaNationalsEnd', value),
      infoTitle: tournamentCalendarInfo.title,
      infoContent: tournamentCalendarInfo.content
    },

    // Step 8: Team Format Selection - CRITICAL DECISION POINT
    {
      id: 'team_format',
      title: 'Choose your team format',
      subtitle: 'This determines your handicap system, match length, and player requirements',
      type: 'choice',
      choices: [
        {
          value: '5_man',
          label: '5-Man Teams + Custom Handicap System',
          subtitle: '⚡ Faster matches • Easier to start • Heavy handicapping',
          description: `🎯 KEY DIFFERENCES:
• 5 players per roster, 3 play each night
• Double round robin: 18 games per match
• Match time: ~2.5 hours
• Minimum players needed: 12 total (6 per team)

🎱 HANDICAP SYSTEM:
• Individual skill assessment (1-7 scale)
• Anti-sandbagging: Team win/loss policy

✅ PROS:
• Faster matches (28% shorter than 8-man)
• Easier to start (need fewer players)
• Great for smaller venues
• Everyone gets more playing time

⚠️ CONSIDERATIONS:
• More handicap management required
• Players must be more committed (less backup)`,
          warning: 'Requires more active handicap management and player commitment'
        },
        {
          value: '8_man',
          label: '8-Man Teams + BCA Standard Handicap',
          subtitle: '🏆 Traditional format • Proven system • Flexible rosters',
          description: `🎯 KEY DIFFERENCES:
• 8 players per roster, 5 play each night
• Single round robin: 25 games per match
• Match time: ~3.5 hours
• Minimum players needed: 20 total (10 per team)

🎱 HANDICAP SYSTEM:
• BCA standard skill levels (2-7)
• Established, proven system
• Less management overhead

✅ PROS:
• Industry standard format
• Larger rosters provide flexibility
• Less handicap management
• Proven tournament structure

⚠️ CONSIDERATIONS:
• Longer matches
• Need more players to start
• Some players get less playing time`,
          warning: 'Requires more players and longer match times'
        }
      ],
      getValue: () => formData.teamFormat,
      setValue: (value: string) => {
        updateFormData('teamFormat', value);

        // Automatically set handicap system based on team format
        if (value === '5_man') {
          updateFormData('handicapSystem', 'custom_5man');
          console.log('✅ AUTO-SET: 5-man format → Custom handicap system');
        } else if (value === '8_man') {
          updateFormData('handicapSystem', 'bca_standard');
          console.log('✅ AUTO-SET: 8-man format → BCA standard handicap system');
        }
      },
      infoTitle: teamFormatComparisonInfo.title,
      infoContent: teamFormatComparisonInfo.content
    },

    // Step 9: Optional Qualifier
    {
      id: 'qualifier',
      title: 'League qualifier (optional)',
      subtitle: 'Add a qualifier to distinguish your league (e.g., "West Side", "Downtown", "Blue", "Red")',
      type: 'input',
      placeholder: 'Enter league qualifier (optional)',
      getValue: () => formData.qualifier,
      setValue: (value: string) => updateFormData('qualifier', value),
      infoTitle: leagueQualifierInfo.title,
      infoContent: leagueQualifierInfo.content
    }
  ];
};