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
  teamFormatInfo,
  leagueQualifierInfo,
} from '@/constants/infoContent/leagueWizardInfoContent';

/**
 * Wizard step definition interface
 */
export interface WizardStep {
  id: string;
  title: string;
  subtitle?: string;
  type: 'input' | 'choice';
  placeholder?: string;
  choices?: Array<{
    value: string;
    label: string;
    subtitle?: string;
    description?: string;
    warning?: string;
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
          const date = new Date(value);

          // Calculate derived fields for league name
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

          console.log('✅ CALCULATED: Day =', dayOfWeek, '| Season =', season, '| Year =', year);
        }
      },
      infoTitle: startDateInfo.title,
      infoContent: startDateInfo.content
    },

    // Step 3: Optional Qualifier/Differentiator
    {
      id: 'qualifier',
      title: 'Add an optional league qualifier? (Optional)',
      subtitle: 'Used if you run multiple leagues of the same type on the same day',
      type: 'input',
      placeholder: 'e.g., "East Division", "Beginner", "Advanced" (leave blank if not needed)',
      getValue: () => formData.qualifier,
      setValue: (value: string) => {
        updateFormData('qualifier', value.trim());
        console.log('📝 LEAGUE CREATION: Qualifier =', value.trim() || '(none)');
      },
      infoTitle: leagueQualifierInfo.title,
      infoContent: leagueQualifierInfo.content,
      infoLabel: 'When do I need this?'
    },

    // Step 4: Team Format + Handicap System (combined question)
    {
      id: 'team_format',
      title: 'What team format will this league use?',
      subtitle: 'This determines both team size and handicap system',
      type: 'choice',
      choices: [
        {
          value: '5_man|custom_5man',
          label: '5-Man Teams',
          subtitle: 'Custom Handicap System',
          description: `✓ Faster matches (28% shorter)
✓ Easier to start (need fewer players)
✓ Great for smaller venues
✓ Everyone gets more playing time
✓ 18 games per match (3v3 double round robin)
⚠️ Requires custom handicap management`,
        },
        {
          value: '8_man|bca_standard',
          label: '8-Man Teams',
          subtitle: 'BCA Standard Handicap',
          description: `✓ Standard league format used widely
✓ Established handicap system
✓ Larger team rosters for flexibility
✓ Traditional match structure
✓ 25 games per match (5v5 single round robin)
✓ Uses official BCA handicap tables`,
        }
      ],
      getValue: () => formData.teamFormat ? `${formData.teamFormat}|${formData.handicapSystem}` : '',
      setValue: (value: string) => {
        const [teamFormat, handicapSystem] = value.split('|');
        updateFormData('teamFormat', teamFormat as '5_man' | '8_man');
        updateFormData('handicapSystem', handicapSystem as 'custom_5man' | 'bca_standard');
        console.log('📝 LEAGUE CREATION: Team format =', teamFormat, '| Handicap =', handicapSystem);
      },
      infoTitle: teamFormatInfo.title,
      infoContent: teamFormatInfo.content,
      infoLabel: 'Compare formats'
    },
  ];
};
