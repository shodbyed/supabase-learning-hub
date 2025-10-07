/**
 * @fileoverview Season Creation Wizard Step Definitions
 *
 * Steps for creating a new season:
 * 1. Start Date (auto-set for first season, manual for subsequent)
 * 2. Season Length (weeks)
 * 3. BCA Championship Dates
 * 4. APA Championship Dates
 */
import { getDayOfWeekName } from '@/utils/formatters';
import { seasonLengthInfo } from '@/constants/infoContent/seasonWizardInfoContent';
import { fetchBCAChampionshipURL, fetchAPAChampionshipURL, type ChampionshipDateOption } from '@/utils/tournamentUtils';

/**
 * Season form data interface
 */
export interface SeasonFormData {
  startDate: string;           // ISO date string
  seasonLength: string;        // Number as string for form handling
  isCustomLength: boolean;     // Whether custom length option was selected
  bcaChoice: string;           // Choice ID: 'ignore', 'custom', or database option ID
  bcaStartDate: string;        // ISO date string
  bcaEndDate: string;          // ISO date string
  bcaIgnored: boolean;         // Whether to ignore BCA dates
  apaStartDate: string;        // ISO date string
  apaEndDate: string;          // ISO date string
  apaIgnored: boolean;         // Whether to ignore APA dates
}

/**
 * Wizard step definition interface
 */
export interface SeasonWizardStep {
  id: string; // Allow any string for step IDs
  title: string;
  subtitle?: string | React.ReactElement;
  type: 'date' | 'choice' | 'dual-date' | 'input' | 'review';
  placeholder?: string;
  inputType?: string;
  min?: number;
  max?: number;
  choices?: Array<{
    value: string;
    label: string;
    subtitle?: string;
  }>;
  validator?: (value: string) => { isValid: boolean; error?: string };
  getValue: () => string;
  setValue: (value: string) => void;
  infoTitle?: string;
  infoContent?: string | React.ReactElement | null;
  infoLabel?: string;
}

/**
 * Get season wizard steps with localStorage integration
 */
export function getSeasonWizardSteps(
  leagueId: string,
  hasExistingSeasons: boolean,
  defaultStartDate?: string,
  _leagueDayOfWeek?: string,
  onDayOfWeekChange?: (newDay: string, newDate: string) => void,
  bcaDateOptions?: ChampionshipDateOption[]
): SeasonWizardStep[] {
  const STORAGE_KEY = `season-creation-${leagueId}`;

  // Initialize form data from localStorage or defaults
  const getStoredData = (): SeasonFormData => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      startDate: defaultStartDate || '',
      seasonLength: '16',
      isCustomLength: false,
      bcaChoice: '',
      bcaStartDate: '',
      bcaEndDate: '',
      bcaIgnored: false,
      apaStartDate: '',
      apaEndDate: '',
      apaIgnored: false,
    };
  };

  const formData = getStoredData();

  const saveData = (updates: Partial<SeasonFormData>) => {
    const newData = { ...formData, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
    Object.assign(formData, newData);
  };

  const allSteps: SeasonWizardStep[] = [
    // Step 1: Start Date
    {
      id: 'startDate',
      title: hasExistingSeasons
        ? 'When does the new season start?'
        : 'Confirm season start date',
      subtitle: hasExistingSeasons
        ? 'Select the first league night of the new season'
        : 'This is what you chose as the first night of league play',
      type: 'date',
      getValue: () => formData.startDate,
      setValue: (value: string) => {
        // If first season and date changes, check if we need to warn
        if (!hasExistingSeasons && defaultStartDate && onDayOfWeekChange && value !== defaultStartDate) {
          // Use timezone-safe day calculation
          const newDayOfWeek = getDayOfWeekName(value);

          // Only trigger callback if date is different from default
          onDayOfWeekChange(newDayOfWeek, value);
          // Don't save yet - wait for user confirmation
          return;
        }
        saveData({ startDate: value });
      },
      infoTitle: 'Season Start Date',
      infoContent:
        'This is the date of your first league night. The schedule will be generated starting from this date based on the season length you choose.',
    },

    // Step 2: Season Length (common choices)
    {
      id: 'seasonLength',
      title: 'How many weeks will this season run?',
      subtitle: 'Choose a common length or select custom for 10-52 weeks',
      type: 'choice',
      choices: [
        { value: '10', label: '10 weeks', subtitle: 'Short season' },
        { value: '12', label: '12 weeks', subtitle: 'Compact season' },
        { value: '14', label: '14 weeks', subtitle: 'Popular choice' },
        { value: '16', label: '16 weeks', subtitle: 'Most common ⭐' },
        { value: '18', label: '18 weeks', subtitle: 'Extended season' },
        { value: '20', label: '20 weeks', subtitle: 'Long season' },
        { value: 'custom', label: 'Custom length', subtitle: '10-52 weeks' },
      ],
      getValue: () => {
        // If custom was selected, show 'custom' as selected
        if (formData.isCustomLength) {
          return 'custom';
        }
        // Otherwise return the actual length value or default to '16'
        return formData.seasonLength || '16';
      },
      setValue: (value: string) => {
        if (value === 'custom') {
          // Save that custom was selected, keep previous seasonLength as default
          saveData({ isCustomLength: true });
        } else {
          // Save the standard length and clear custom flag
          saveData({ seasonLength: value, isCustomLength: false });
        }
      },
      infoTitle: seasonLengthInfo.title,
      infoLabel: seasonLengthInfo.label,
      infoContent: seasonLengthInfo.content,
    },

    // Step 2b: Custom Season Length (only shown when custom is selected)
    {
      id: 'customSeasonLength',
      title: 'Enter custom season length',
      subtitle: 'Choose between 10-52 weeks for your season',
      type: 'input',
      inputType: 'number',
      min: 10,
      max: 52,
      getValue: () => formData.seasonLength || '',
      setValue: (value: string) => saveData({ seasonLength: value }),
      validator: (value: string) => {
        if (!value || value.trim() === '') return { isValid: false, error: 'Season length is required' };
        const weeks = parseInt(value);
        if (isNaN(weeks)) return { isValid: false, error: 'Please enter a valid number' };
        if (weeks < 10) return { isValid: false, error: 'Minimum season length is 10 weeks' };
        if (weeks > 52) return { isValid: false, error: 'Maximum season length is 52 weeks' };
        return { isValid: true };
      },
      infoTitle: seasonLengthInfo.title,
      infoLabel: seasonLengthInfo.label,
      infoContent: seasonLengthInfo.content,
    },

    // Step 3: BCA Championship Date Selection
    {
      id: 'bcaChoice',
      title: 'BCA National Tournament Scheduling',
      subtitle: (
        <>
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
        </>
      ),
      type: 'choice',
      choices: [
        // Dynamic choices from database
        ...(bcaDateOptions || []).map(option => ({
          value: option.id,
          label: `${option.start_date} to ${option.end_date}`,
          subtitle: option.dev_verified
            ? '✓ Verified dates'
            : `${option.vote_count} operator${option.vote_count > 1 ? 's' : ''} confirmed`,
        })),
        // Always include ignore and custom options
        {
          value: 'ignore',
          label: 'Ignore BCA tournament scheduling',
          subtitle: 'I don\'t expect my players to attend this tournament',
        },
        {
          value: 'custom',
          label: 'Enter my own tournament dates',
          subtitle: 'I have different/updated BCA tournament dates',
        },
      ],
      getValue: () => formData.bcaChoice || '',
      setValue: (value: string) => {
        saveData({ bcaChoice: value });

        // Handle different choice types
        if (value === 'ignore') {
          saveData({
            bcaIgnored: true,
            bcaStartDate: '',
            bcaEndDate: ''
          });
        } else if (value === 'custom') {
          // User will enter dates in next step
          saveData({ bcaIgnored: false });
        } else {
          // User selected a found date option
          const selectedOption = bcaDateOptions?.find(opt => opt.id === value);
          if (selectedOption) {
            saveData({
              bcaIgnored: false,
              bcaStartDate: selectedOption.start_date,
              bcaEndDate: selectedOption.end_date
            });
          }
        }
      },
      infoTitle: 'Why Schedule Around Major Tournaments?',
      infoContent: (
        <div className="space-y-4">
          <p><strong>Many players want to compete in BCA and APA Championships.</strong> These tournaments represent the highest level of pool competition.</p>

          <div>
            <p><strong>Scheduling during tournaments causes problems:</strong></p>
            <ul className="list-disc ml-4 mt-2">
              <li>Teams lose key players who travel to compete</li>
              <li>Unnecessary forfeits when rosters are short</li>
              <li>Complicated makeup matches later in the season</li>
            </ul>
          </div>

          <p><strong>If any of your players might attend these championships, schedule around them.</strong> This supports player growth and keeps your league running smoothly.</p>
        </div>
      ),
      infoLabel: 'Why is this important',
    },

    // Step 3b: BCA Custom Championship Dates (only shown when custom is selected)
    {
      id: 'bcaCustomDates',
      title: 'BCA National Championship Dates',
      subtitle: (
        <>
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
        </>
      ),
      type: 'dual-date',
      getValue: () => `${formData.bcaStartDate || ''}|${formData.bcaEndDate || ''}`,
      setValue: (value: string) => {
        const [startDate, endDate] = value.split('|');
        saveData({
          bcaStartDate: startDate || '',
          bcaEndDate: endDate || ''
        });
      },
      infoTitle: 'Why Schedule Around Major Tournaments?',
      infoContent: (
        <div className="space-y-4">
          <p><strong>Many players want to compete in BCA and APA Championships.</strong> These tournaments represent the highest level of pool competition.</p>

          <div>
            <p><strong>Scheduling during tournaments causes problems:</strong></p>
            <ul className="list-disc ml-4 mt-2">
              <li>Teams lose key players who travel to compete</li>
              <li>Unnecessary forfeits when rosters are short</li>
              <li>Complicated makeup matches later in the season</li>
            </ul>
          </div>

          <p><strong>If any of your players might attend these championships, schedule around them.</strong> This supports player growth and keeps your league running smoothly.</p>
        </div>
      ),
      infoLabel: 'Why is this important',
    },

    // Step 4: APA Championship Dates
    {
      id: 'apaStartDate',
      title: 'APA National Championship Dates',
      subtitle: (
        <>
          Enter the start and end dates for APA National Championships.
          <br />
          Verify championship dates at the{' '}
          <a
            href={fetchAPAChampionshipURL()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            APA Website
          </a>
          .
        </>
      ),
      type: 'dual-date',
      getValue: () => `${formData.apaStartDate || ''}|${formData.apaEndDate || ''}`,
      setValue: (value: string) => {
        const [startDate, endDate] = value.split('|');
        saveData({
          apaStartDate: startDate || '',
          apaEndDate: endDate || ''
        });
      },
      infoTitle: 'APA Championship Scheduling',
      infoContent:
        'The APA National Championship is typically held in August. You can choose to skip league nights during this week to allow your players to attend. If this doesn\'t apply to your league, you can ignore these dates.',
    },
  ];

  // Show custom season length step only when custom flag is set
  const shouldShowCustomSeasonLength = formData.isCustomLength === true;

  // Show BCA custom dates step only when 'custom' is selected
  const shouldShowBCACustomDates = formData.bcaChoice === 'custom';

  return allSteps.filter(step => {
    if (step.id === 'customSeasonLength') {
      return shouldShowCustomSeasonLength;
    }
    if (step.id === 'bcaCustomDates') {
      return shouldShowBCACustomDates;
    }
    return true;
  });
}

/**
 * Clear season creation data from localStorage
 */
export function clearSeasonCreationData(leagueId: string): void {
  const STORAGE_KEY = `season-creation-${leagueId}`;
  localStorage.removeItem(STORAGE_KEY);
}
