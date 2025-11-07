/**
 * @fileoverview League Creation Wizard Step Definitions (Simplified)
 * Contains ONLY the core league identity steps:
 * - Game Type
 * - Start Date (for league name generation)
 * - Optional Qualifier
 * - Team Format + Handicap System
 *
 * Season length and tournament scheduling moved to ScheduleCreationWizard
 */
import {
  startDateInfo,
  gameFormatInfo,
  teamFormatComparisonInfo,
  fiveManFormatInfo,
  eightManFormatInfo,
  leagueQualifierInfo,
} from '@/constants/infoContent/leagueWizardInfoContent';

/**
 * Wizard step definition interface
 */
export interface WizardStep {
  id: string;
  title: string;
  subtitle?: string;
  type: 'input' | 'choice' | 'radio';
  placeholder?: string;
  choices?: Array<{
    value: string;
    label: string;
    subtitle?: string;
    description?: string;
    warning?: string;
    infoTitle?: string;
    infoContent?: string | React.ReactElement;
  }>;
  options?: Array<{
    value: string;
    label: string;
    description?: string;
    benefit?: string;
  }>;
  validator?: (value: string) => { isValid: boolean; error?: string };
  getValue: () => string;
  setValue: (value: string) => void;
  infoTitle?: string;
  infoContent?: string | React.ReactElement | null;
  infoLabel?: string;
}

/**
 * League form data interface (simplified - only core identity fields)
 */
export interface LeagueFormData {
  gameType: string;
  startDate: string;
  dayOfWeek: string;
  season: string;
  year: number;
  qualifier: string;
  teamFormat: '5_man' | '8_man' | '';
  handicapSystem: 'custom_5man' | 'bca_standard' | '';
  handicapVariant: 'standard' | 'reduced' | 'none' | '';
  teamHandicapVariant: 'standard' | 'reduced' | 'none' | '';
}

/**
 * Parameters for creating wizard steps
 */
export interface WizardStepParams {
  formData: LeagueFormData;
  updateFormData: (field: keyof LeagueFormData, value: string | number) => void;
  validateStartDate: (value: string) => { isValid: boolean; error?: string };
}

/**
 * Create wizard steps with provided parameters
 */
export const createWizardSteps = (params: WizardStepParams): WizardStep[] => {
  const {
    formData,
    updateFormData,
    validateStartDate,
  } = params;

  return [
    // Step 1: Game Type Selection
    {
      id: 'game_type',
      title: 'What game will this league play?',
      subtitle: 'This determines the game format for all matches',
      type: 'choice',
      choices: [
        {
          value: 'eight_ball',
          label: '8-Ball',
          subtitle: 'Most popular format',
          description: 'Standard 8-ball rules'
        },
        {
          value: 'nine_ball',
          label: '9-Ball',
          subtitle: 'Rotation game',
          description: 'Balls must be hit in numerical order'
        },
        {
          value: 'ten_ball',
          label: '10-Ball',
          subtitle: 'Advanced format',
          description: 'Like 9-ball but with 10 balls and call-shot rules'
        }
      ],
      getValue: () => formData.gameType,
      setValue: (value: string) => {
        updateFormData('gameType', value);
        console.log('📝 LEAGUE CREATION: Game type selected:', value);
      },
      infoTitle: gameFormatInfo.title,
      infoContent: gameFormatInfo.content
    },

    // Step 2: Start Date (determines league name: day/season/year)
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
          // Parse date correctly to avoid timezone issues
          // value format is "YYYY-MM-DD"
          const [year, month, day] = value.split('-').map(Number);
          const date = new Date(year, month - 1, day); // month is 0-indexed in JS

          // Calculate derived fields for league name
          const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' });
          const season = (() => {
            const monthIndex = date.getMonth();
            if (monthIndex >= 2 && monthIndex <= 4) return 'Spring';
            if (monthIndex >= 5 && monthIndex <= 7) return 'Summer';
            if (monthIndex >= 8 && monthIndex <= 10) return 'Fall';
            return 'Winter';
          })();
          const calculatedYear = date.getFullYear();

          updateFormData('dayOfWeek', dayOfWeek);
          updateFormData('season', season);
          updateFormData('year', calculatedYear);

          console.log('✅ CALCULATED: Day =', dayOfWeek, '| Season =', season, '| Year =', calculatedYear);
        }
      },
      infoTitle: startDateInfo.title,
      infoContent: startDateInfo.content
    },

    // Step 3: Optional Division/Identifier
    {
      id: 'qualifier',
      title: 'Add an optional division identifier? (Optional)',
      subtitle: 'Used if you run multiple leagues of the same type on the same day',
      type: 'input',
      placeholder: 'e.g., "East Division", "Beginner", "Advanced" (leave blank if not needed)',
      getValue: () => formData.qualifier,
      setValue: (value: string) => {
        updateFormData('qualifier', value.trim());
        console.log('📝 LEAGUE CREATION: Division =', value.trim() || '(none)');
      },
      infoTitle: leagueQualifierInfo.title,
      infoContent: leagueQualifierInfo.content,
      infoLabel: 'When do I need this?'
    },

    // Step 4: Team Format + Handicap System (combined question)
    {
      id: 'team_format',
      title: 'What team format will this league use?',
      subtitle: 'Choose the format that works best for your players and venue',
      type: 'choice',
      choices: [
        {
          value: '5_man|custom_5man',
          label: '5-Man Teams (Recommended)',
          subtitle: 'Modern format - Faster, more engaging matches',
          description: `⭐ RECOMMENDED - Better player experience
✓ Faster matches - finish 28% quicker than 8-man
✓ More action - everyone plays more games per night
✓ Less crowded tables - only 6 players shooting at once
✓ Easier team management - need fewer players per roster
✓ Better for player retention - less waiting around
✓ 18 games per match (3v3 double round robin)
✓ Handicap system highly discourages sandbagging`,
          infoTitle: fiveManFormatInfo.title,
          infoContent: fiveManFormatInfo.content,
        },
        {
          value: '8_man|bca_standard',
          label: '8-Man Teams (Traditional)',
          subtitle: 'BCA Standard - Familiar to experienced players',
          description: `Traditional format for established leagues
✓ BCA official handicap system
✓ Larger rosters provide scheduling flexibility
✓ 25 games per match (5v5 single round robin)
✓ Familiar to players who've played BCA leagues before
⚠️ Longer matches (average 3-4 hours)
⚠️ More crowded - 10 players around tables
⚠️ Less playing time per person`,
          infoTitle: eightManFormatInfo.title,
          infoContent: eightManFormatInfo.content,
        }
      ],
      getValue: () => formData.teamFormat ? `${formData.teamFormat}|${formData.handicapSystem}` : '',
      setValue: (value: string) => {
        const [teamFormat, handicapSystem] = value.split('|');
        updateFormData('teamFormat', teamFormat as '5_man' | '8_man');
        updateFormData('handicapSystem', handicapSystem as 'custom_5man' | 'bca_standard');
        console.log('📝 LEAGUE CREATION: Team format =', teamFormat, '| Handicap =', handicapSystem);
      },
      infoTitle: teamFormatComparisonInfo.title,
      infoContent: teamFormatComparisonInfo.content,
      infoLabel: 'How to choose'
    },

    // Handicap Variant Selection
    {
      id: 'handicapVariant',
      title: 'Handicap strength',
      subtitle: '',
      type: 'choice',
      choices: [
        {
          value: 'standard',
          label: 'Standard',
          description: '3v3: -2 to +2 | 5v5: 0-100%',
          subtitle: 'Maximum skill balancing'
        },
        {
          value: 'reduced',
          label: 'Reduced',
          description: '3v3: -1 to +1 | 5v5: 0-50%',
          subtitle: 'Moderate skill balancing'
        },
        {
          value: 'none',
          label: 'No Handicap',
          description: 'All players at 0',
          subtitle: 'Pure skill-based competition'
        }
      ],
      getValue: () => formData.handicapVariant,
      setValue: (value: string) => {
        updateFormData('handicapVariant', value);
        // Default team handicap to match player handicap
        updateFormData('teamHandicapVariant', value);
      },
      infoTitle: 'Choose the handicap range to apply',
      infoContent: (
        <div className="space-y-3">
          <p>
            <strong>Standard:</strong> Uses the entire handicap range for maximum skill balancing.
            Provides the largest differential between teams to help level the playing field.
          </p>
          <p>
            <strong>Reduced:</strong> Uses half the handicap range, creating a smaller differential.
            More skill-based while still providing some effort to level the playing field.
          </p>
          <p>
            <strong>No Handicap:</strong> Removes all handicapping. Pure skill-based competition with no adjustments.
          </p>
        </div>
      ),
      infoLabel: 'Choose the handicap range to apply'
    },
  ];
};
