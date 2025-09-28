/**
 * @fileoverview League Creation Wizard - Main Component
 *
 * Multi-step wizard for league operators to create new leagues.
 * This wizard guides operators through the essential league setup process:
 *
 * WIZARD STEPS:
 * 1. Basic League Information (name, game type, night of week)
 * 2. Team Format Selection (5-man vs 8-man teams)
 * 3. Handicap System Selection (Custom 5-man vs BCA Standard)
 * 4. Organization & Contact Details (pulled from operator profile)
 * 5. Review & Create
 *
 * DESIGN PHILOSOPHY:
 * - Uses existing reusable components from league operator application
 * - Step-by-step approach prevents overwhelming operators
 * - Clear explanations of handicap systems help operators make informed decisions
 * - Validation at each step ensures complete league setup
 * - Database operations are logged but not executed (dummy operations)
 *
 * INTEGRATION POINTS:
 * - Links from OperatorDashboard "Create League" buttons
 * - Uses operator profile data for organization details
 * - Will eventually integrate with league management system
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionStep } from '@/components/forms/QuestionStep';
import { RadioChoiceStep } from '@/components/forms/RadioChoiceStep';
import { useUserProfile } from '../hooks/useUserProfile';

/**
 * League data structure for the creation wizard
 * Matches the hierarchy defined in LEAGUE_MANAGEMENT_PLAN.md:
 * Organization → League → Season → Team → Player
 */
interface LeagueFormData {
  // Basic League Information (auto-generated from other fields)
  leagueName: string;
  gameType: 'eight_ball' | 'nine_ball' | 'ten_ball' | '';
  startDate: string; // ISO date string (YYYY-MM-DD)

  // Location/Venue Information
  venueName: string;

  // Optional qualifier to differentiate leagues (West Side, North Valley, Blue, Red, etc.)
  qualifier: string;

  // Team Format (determines match structure)
  teamFormat: '5_man' | '8_man' | '';

  // Handicap System Selection
  handicapSystem: 'custom_5man' | 'bca_standard' | '';

  // Organization Details (from operator profile)
  organizationName: string;
  organizationAddress: string;
  organizationCity: string;
  organizationState: string;
  organizationZipCode: string;
  contactEmail: string;
  contactPhone: string;
}

/**
 * Wizard step definition interface
 * Reuses the successful pattern from LeagueOperatorApplication
 */
interface WizardStep {
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
    icon?: string;
    infoTitle?: string;
    infoContent?: string;
  }>;
  validator?: (value: string) => { isValid: boolean; error?: string };
  getValue: () => string;
  setValue: (value: string) => void;
  infoTitle?: string;
  infoContent?: string | null;
}

/**
 * League Creation Wizard Component
 *
 * Guides league operators through creating a new league with proper
 * validation and explanation of complex concepts like handicap systems.
 *
 * FLOW:
 * 1. League name and basic info
 * 2. Team format selection (5-man vs 8-man)
 * 3. Handicap system selection with detailed explanations
 * 4. Organization details review
 * 5. Final review and creation
 */
export const LeagueCreationWizard: React.FC = () => {
  const navigate = useNavigate();
  const { member } = useUserProfile();

  // Wizard state management
  const [currentStep, setCurrentStep] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);

  // League form data
  const [formData, setFormData] = useState<LeagueFormData>({
    leagueName: '',
    gameType: '',
    startDate: '',
    venueName: '',
    qualifier: '',
    teamFormat: '',
    handicapSystem: '',
    organizationName: '',
    organizationAddress: '',
    organizationCity: '',
    organizationState: '',
    organizationZipCode: '',
    contactEmail: '',
    contactPhone: ''
  });

  /**
   * Update form data for a specific field
   */
  const updateFormData = (field: keyof LeagueFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  /**
   * Build league name automatically based on user selections
   * Based on naming convention from reference code buildSeasonName function
   * Format: "{Game} {Day} {Venue} {Qualifier?}"
   * Examples:
   * - "9-Ball Tuesday Billiards Plaza"
   * - "8-Ball Thursday Corner Pocket West Side"
   * - "9-Ball Monday Rack Em Up Blue"
   *
   * Day of week is derived from the start date
   */
  const buildLeagueName = (): string => {
    const parts: string[] = [];

    // Game type
    if (formData.gameType) {
      const gameNames = {
        'eight_ball': '8-Ball',
        'nine_ball': '9-Ball',
        'ten_ball': '10-Ball'
      };
      parts.push(gameNames[formData.gameType]);
    }

    // Day of week derived from start date
    if (formData.startDate) {
      const date = new Date(formData.startDate);
      if (!isNaN(date.getTime())) {
        const dayNames = [
          'Sunday', 'Monday', 'Tuesday', 'Wednesday',
          'Thursday', 'Friday', 'Saturday'
        ];
        parts.push(dayNames[date.getDay()]);
      }
    }

    // Venue name
    if (formData.venueName.trim()) {
      parts.push(formData.venueName.trim());
    }

    // Optional qualifier (West Side, North Valley, Blue, Red, etc.)
    if (formData.qualifier.trim()) {
      parts.push(formData.qualifier.trim());
    }

    return parts.length > 0 ? parts.join(' ') : 'League Name Preview';
  };

  /**
   * Venue name validation - requires meaningful name
   */
  const validateVenueName = (value: string): { isValid: boolean; error?: string } => {
    if (!value || value.trim().length < 2) {
      return { isValid: false, error: 'Venue name must be at least 2 characters' };
    }
    if (value.trim().length > 30) {
      return { isValid: false, error: 'Venue name must be 30 characters or less' };
    }
    return { isValid: true };
  };

  /**
   * Start date validation - must be a valid future date
   */
  const validateStartDate = (value: string): { isValid: boolean; error?: string } => {
    if (!value) {
      return { isValid: false, error: 'Start date is required' };
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Please enter a valid date' };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare dates only

    if (date < today) {
      return { isValid: false, error: 'Start date must be today or in the future' };
    }

    return { isValid: true };
  };

  /**
   * Qualifier validation - optional but if provided, should be meaningful
   */
  const validateQualifier = (value: string): { isValid: boolean; error?: string } => {
    // Qualifier is optional, so empty is valid
    if (!value || value.trim().length === 0) {
      return { isValid: true };
    }
    if (value.trim().length > 20) {
      return { isValid: false, error: 'Qualifier must be 20 characters or less' };
    }
    return { isValid: true };
  };

  /**
   * Wizard step definitions
   * Each step represents a key decision point in league creation
   */
  const steps: WizardStep[] = [
    // Step 1: Game Type Selection
    {
      id: 'game_type',
      title: 'What type of pool will you be playing?',
      subtitle: 'Select the primary game format for your league',
      type: 'choice',
      choices: [
        {
          value: 'eight_ball',
          label: '8-Ball',
          subtitle: 'Most popular choice',
          icon: '🎱',
          description: 'Traditional 8-ball.'
        },
        {
          value: 'nine_ball',
          label: '9-Ball',
          subtitle: 'Fastest matches',
          icon: '⚡',
          description: 'Traditional 9-ball rotation.'
        },
        {
          value: 'ten_ball',
          label: '10-Ball',
          subtitle: 'High skill',
          icon: '🏆',
          warning: 'Matches take significantly longer'
        }
      ],
      getValue: () => formData.gameType,
      setValue: (value: string) => updateFormData('gameType', value as typeof formData.gameType)
    },

    // Step 2: Start Date
    {
      id: 'start_date',
      title: 'When does your league start?',
      subtitle: 'Choose the first match date - this determines your league day of the week',
      type: 'input',
      placeholder: 'Select start date',
      validator: validateStartDate,
      getValue: () => formData.startDate,
      setValue: (value: string) => updateFormData('startDate', value),
      infoTitle: 'League Start Date',
      infoContent: 'This is the date of your first league night. All subsequent matches will be on the same day of the week. The day of the week will automatically be included in your league name.'
    },

    // Step 3: Venue Name
    {
      id: 'venue_name',
      title: 'What is the name of your venue?',
      subtitle: 'Enter the pool hall, bar, or club name where matches will be played',
      type: 'input',
      placeholder: 'e.g., "Billiards Plaza" or "Corner Pocket"',
      validator: validateVenueName,
      getValue: () => formData.venueName,
      setValue: (value: string) => updateFormData('venueName', value),
      infoTitle: 'Venue Naming',
      infoContent: 'Use the commonly known name of your venue. This will be part of your league name and help players identify your league.'
    },

    // Step 4: Optional Qualifier
    {
      id: 'qualifier',
      title: 'League qualifier (optional)',
      subtitle: 'Add a qualifier to differentiate your league from others with the same format',
      type: 'input',
      placeholder: 'e.g., "West Side", "North Valley", "Blue", "Red", "Division A"',
      validator: validateQualifier,
      getValue: () => formData.qualifier,
      setValue: (value: string) => updateFormData('qualifier', value),
      infoTitle: 'League Qualifiers',
      infoContent: 'Optional qualifier helps distinguish your league if there are multiple leagues with the same game type and night at the same venue. Examples: location-based (West Side, Downtown), color-coded (Blue, Red), or division-based (Division A, Advanced).'
    },

    // Step 5: Team Format Selection
    {
      id: 'team_format',
      title: 'How many players per team?',
      subtitle: 'This determines your match format and handicap system options',
      type: 'choice',
      choices: [
        {
          value: '5_man',
          label: '5-Man Teams',
          subtitle: 'Smaller teams, faster matches',
          description: '5 players per roster, 3 play each night. Double round robin format (18 games per match).',
          infoTitle: '5-Man Team Benefits',
          infoContent: 'Requires fewer players to start (only 12 total needed). Faster matches (28% shorter). Better for smaller venues. Uses custom handicap system optimized for competitive balance.'
        },
        {
          value: '8_man',
          label: '8-Man Teams',
          subtitle: 'Standard BCA format',
          description: '8 players per roster, 5 play each night. Single round robin format (25 games per match).',
          infoTitle: '8-Man Team Benefits',
          infoContent: 'Official BCA format. More players get to participate. Standard across most pool leagues. Uses proven BCA handicap system.'
        }
      ],
      getValue: () => formData.teamFormat,
      setValue: (value: string) => updateFormData('teamFormat', value as typeof formData.teamFormat)
    },

    // Step 6: Handicap System Selection (conditional based on team format)
    {
      id: 'handicap_system',
      title: 'Choose your handicap system',
      subtitle: 'This determines how games are balanced for fair play',
      type: 'choice',
      choices: [], // Will be populated dynamically based on team format
      getValue: () => formData.handicapSystem,
      setValue: (value: string) => updateFormData('handicapSystem', value as typeof formData.handicapSystem),
      infoTitle: 'Handicap System Importance',
      infoContent: 'The handicap system ensures fair matches regardless of skill differences. Each system has different philosophies about competitive balance.'
    }
  ];

  /**
   * Get current step with dynamic handicap system choices
   */
  const getCurrentStep = (): WizardStep => {
    const step = steps[currentStep];

    // Dynamically populate handicap system choices based on team format
    if (step.id === 'handicap_system') {
      if (formData.teamFormat === '5_man') {
        step.choices = [
          {
            value: 'custom_5man',
            label: 'Custom 5-Man System',
            subtitle: 'Optimized for maximum balance',
            description: 'Sophisticated system designed for 5-man teams. Heavy handicapping ensures anyone can win.',
            infoTitle: 'Custom 5-Man System Details',
            infoContent: 'Uses (Wins-Losses)÷Weeks formula with standings modifiers. 25 handicap levels. Strong anti-sandbagging features. Perfect for casual leagues with skill gaps.'
          }
        ];
      } else if (formData.teamFormat === '8_man') {
        step.choices = [
          {
            value: 'bca_standard',
            label: 'BCA Standard System',
            subtitle: 'Official BCA handicapping',
            description: 'Percentage-based system used in official BCA leagues. Minimal handicap interference.',
            infoTitle: 'BCA Standard System Details',
            infoContent: 'Win percentage based (Wins÷Games). Last 50 games rolling window. CHARTS lookup table for game requirements. Standard across BCA leagues.'
          }
        ];
      }
    }

    return step;
  };

  /**
   * Handle input changes with validation
   */
  const handleInputChange = (value: string) => {
    setCurrentInput(value);
    setError(undefined); // Clear error when user types
  };

  /**
   * Handle choice selection
   */
  const handleChoiceSelect = (choiceId: string) => {
    const step = getCurrentStep();
    step.setValue(choiceId);
    setError(undefined);
  };

  /**
   * Save current input to form data
   */
  const saveCurrentInput = (): boolean => {
    const step = getCurrentStep();

    if (step.validator) {
      const validation = step.validator(currentInput);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid input');
        return false;
      }
    }

    step.setValue(currentInput);
    setCurrentInput('');
    return true;
  };

  /**
   * Navigate to next step
   */
  const handleNext = () => {
    const step = getCurrentStep();

    // For input steps, validate before proceeding
    if (step.type === 'input') {
      if (!saveCurrentInput()) return;
    }

    // For choice steps, ensure selection was made
    if (step.type === 'choice' && !step.getValue()) {
      setError('Please make a selection to continue');
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCurrentInput('');
      setError(undefined);
    } else {
      handleSubmit();
    }
  };

  /**
   * Navigate to previous step
   */
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCurrentInput('');
      setError(undefined);
    }
  };

  /**
   * Handle form submission - create the league
   */
  const handleSubmit = async () => {
    console.group('🏆 LEAGUE CREATION - DATABASE OPERATIONS');

    console.log('📋 COMPLETE LEAGUE DATA:', formData);

    console.group('🏢 LEAGUE INFORMATION');
    console.log('League Name:', formData.leagueName);
    console.log('Game Type:', formData.gameType);
    console.log('Start Date:', formData.startDate);
    console.log('Day of Week (derived):', formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-US', { weekday: 'long' }) : 'Not set');
    console.log('Team Format:', formData.teamFormat);
    console.log('Handicap System:', formData.handicapSystem);
    console.groupEnd();

    console.group('📍 ORGANIZATION DETAILS');
    console.log('Organization:', formData.organizationName);
    console.log('Address:', `${formData.organizationAddress}, ${formData.organizationCity}, ${formData.organizationState} ${formData.organizationZipCode}`);
    console.log('Contact Email:', formData.contactEmail);
    console.log('Contact Phone:', formData.contactPhone);
    console.groupEnd();

    console.group('🔄 DATABASE OPERATIONS TO PERFORM');
    console.log('1. Create leagues table record');
    console.log('2. Link to operator organization');
    console.log('3. Set up initial season framework');
    console.log('4. Configure handicap system parameters');
    console.log('5. Initialize league settings');
    console.groupEnd();

    console.group('📊 HANDICAP SYSTEM CONFIGURATION');
    if (formData.handicapSystem === 'custom_5man') {
      console.log('System: Custom 5-Man Double Round Robin');
      console.log('- Formula: (Wins - Losses) ÷ Weeks Played');
      console.log('- Handicap Range: +2 to -2 (rounds to nearest integer)');
      console.log('- Team Handicap: Sum of 3 active players');
      console.log('- Standings Modifier: (Home Wins - Away Wins) ÷ 2');
      console.log('- Games per Match: 18 (3v3 double round robin)');
      console.log('- Anti-sandbagging: Team win/loss policy');
    } else if (formData.handicapSystem === 'bca_standard') {
      console.log('System: BCA Standard Handicap');
      console.log('- Formula: Win Percentage (Wins ÷ Total Games)');
      console.log('- Rolling Window: Last 50 games');
      console.log('- Team Handicap: Sum of 5 active players');
      console.log('- Lookup: CHARTS table for game requirements');
      console.log('- Games per Match: 25 (5v5 single round robin)');
      console.log('- Point System: 1.5x for 70%+ close losses');
    }
    console.groupEnd();

    console.group('✅ NEXT STEPS FOR LEAGUE OPERATOR');
    console.log('1. Set up first season parameters');
    console.log('2. Begin team registration process');
    console.log('3. Schedule venue partnerships');
    console.log('4. Set registration deadlines');
    console.log('5. Plan season schedule generation');
    console.groupEnd();

    console.groupEnd();

    // Navigate back to operator dashboard with success message
    // In a real implementation, we'd show a success toast/notification
    navigate('/operator-dashboard');
  };

  /**
   * Load organization details from operator profile when component mounts
   */
  useEffect(() => {
    if (member) {
      // Pre-populate basic contact details from member profile
      // Organization details would come from league operator application (future enhancement)
      updateFormData('contactEmail', member.email);
      updateFormData('contactPhone', member.phone);
    }
  }, [member]);

  /**
   * Auto-generate league name whenever relevant form data changes
   */
  useEffect(() => {
    const generatedName = buildLeagueName();
    updateFormData('leagueName', generatedName);
  }, [formData.gameType, formData.startDate, formData.venueName, formData.qualifier]);

  /**
   * Sync input field with current step's saved value when navigating
   */
  useEffect(() => {
    const step = getCurrentStep();
    if (step.type === 'input') {
      const savedValue = step.getValue();
      if (savedValue) {
        setCurrentInput(savedValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]); // Only depend on currentStep - getCurrentStep changes with currentStep

  const currentStepData = getCurrentStep();
  const isLastStep = currentStep === steps.length - 1;
  const canGoBack = currentStep > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New League
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

        {/* Main wizard content */}
        <div className="max-w-2xl mx-auto">
          {currentStepData.type === 'choice' ? (
            <RadioChoiceStep
              title={currentStepData.title}
              subtitle={currentStepData.subtitle}
              choices={currentStepData.choices || []}
              selectedValue={currentStepData.getValue()}
              onSelect={handleChoiceSelect}
              onNext={handleNext}
              onPrevious={handlePrevious}
              canGoBack={canGoBack}
              isLastQuestion={isLastStep}
              infoTitle={currentStepData.infoTitle}
              infoContent={currentStepData.infoContent ?? undefined}
              error={error}
            />
          ) : (
            <QuestionStep
              title={currentStepData.title}
              subtitle={currentStepData.subtitle || ''}
              placeholder={currentStepData.placeholder || ''}
              value={currentInput}
              onChange={handleInputChange}
              onNext={handleNext}
              onPrevious={handlePrevious}
              canGoBack={canGoBack}
              isLastQuestion={isLastStep}
              infoTitle={currentStepData.infoTitle}
              infoContent={currentStepData.infoContent ?? undefined}
              error={error}
              inputType={currentStepData.id === 'start_date' ? 'date' : 'text'}
            />
          )}
        </div>

        {/* League Name Preview */}
        {formData.leagueName !== 'League Name Preview' && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">League Name Preview:</h3>
              <p className="text-lg font-semibold text-blue-800">{formData.leagueName}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};