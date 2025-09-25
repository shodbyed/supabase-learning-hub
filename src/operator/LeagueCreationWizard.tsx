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
import { ChoiceStep } from '@/components/forms/ChoiceStep';
import { useUserProfile } from '../hooks/useUserProfile';

/**
 * League data structure for the creation wizard
 * Matches the hierarchy defined in LEAGUE_MANAGEMENT_PLAN.md:
 * Organization → League → Season → Team → Player
 */
interface LeagueFormData {
  // Basic League Information
  leagueName: string;
  gameType: 'eight_ball' | 'nine_ball' | 'straight_pool' | '';
  nightOfWeek: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday' | '';

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
    nightOfWeek: '',
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
   * League name validation - requires meaningful name
   */
  const validateLeagueName = (value: string): { isValid: boolean; error?: string } => {
    if (!value || value.trim().length < 3) {
      return { isValid: false, error: 'League name must be at least 3 characters' };
    }
    if (value.trim().length > 50) {
      return { isValid: false, error: 'League name must be 50 characters or less' };
    }
    return { isValid: true };
  };

  /**
   * Wizard step definitions
   * Each step represents a key decision point in league creation
   */
  const steps: WizardStep[] = [
    // Step 1: League Name
    {
      id: 'league_name',
      title: 'What would you like to name your league?',
      subtitle: 'Choose a descriptive name that players will recognize',
      type: 'input',
      placeholder: 'e.g., "North Valley 9-Ball Tuesday League"',
      validator: validateLeagueName,
      getValue: () => formData.leagueName,
      setValue: (value: string) => updateFormData('leagueName', value),
      infoTitle: 'League Naming Tips',
      infoContent: 'Good league names include the location, game type, and night. This helps players easily identify your league and differentiates it from others in your area.'
    },

    // Step 2: Game Type Selection
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
          description: 'Traditional 8-ball with stripes and solids. Great for all skill levels.',
          infoTitle: '8-Ball League Details',
          infoContent: '8-ball is the most common pool league format. Easy to learn, accommodates all skill levels, and familiar to most players.'
        },
        {
          value: 'nine_ball',
          label: '9-Ball',
          subtitle: 'Fast-paced action',
          description: 'Rotation game with balls 1-9. More challenging and strategic.',
          infoTitle: '9-Ball League Details',
          infoContent: '9-ball is faster-paced and requires more skill. Players must hit the lowest numbered ball first. Great for competitive players.'
        },
        {
          value: 'straight_pool',
          label: 'Straight Pool',
          subtitle: 'Classic choice',
          description: 'Call your shots, play to a point total. Traditional pool hall game.',
          infoTitle: 'Straight Pool League Details',
          infoContent: 'Also called 14.1 continuous. Players call every shot and play to a predetermined score. Requires high skill level.'
        }
      ],
      getValue: () => formData.gameType,
      setValue: (value: string) => updateFormData('gameType', value as typeof formData.gameType)
    },

    // Step 3: Night of Week
    {
      id: 'night_of_week',
      title: 'What night of the week will your league play?',
      subtitle: 'Choose the consistent night for all league matches',
      type: 'choice',
      choices: [
        { value: 'monday', label: 'Monday Night', description: 'Start the week with pool' },
        { value: 'tuesday', label: 'Tuesday Night', description: 'Popular choice for leagues' },
        { value: 'wednesday', label: 'Wednesday Night', description: 'Mid-week competition' },
        { value: 'thursday', label: 'Thursday Night', description: 'Another popular option' },
        { value: 'friday', label: 'Friday Night', description: 'End the week with pool' },
        { value: 'saturday', label: 'Saturday Night', description: 'Weekend league option' },
        { value: 'sunday', label: 'Sunday Night', description: 'Relaxed weekend play' }
      ],
      getValue: () => formData.nightOfWeek,
      setValue: (value: string) => updateFormData('nightOfWeek', value as typeof formData.nightOfWeek),
      infoTitle: 'Choosing Your League Night',
      infoContent: 'Consider your venue\'s busiest nights and player availability. Tuesday through Thursday are most popular for leagues. Weekend nights work well for casual players.'
    },

    // Step 4: Team Format Selection
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

    // Step 5: Handicap System Selection (conditional based on team format)
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
    setError(null);
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
      setError(null);
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
      setError(null);
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
    console.log('Night of Week:', formData.nightOfWeek);
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
  }, [currentStep]);

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
            <ChoiceStep
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
            />
          )}
        </div>

        {/* League preview sidebar would go here in future iteration */}
        {/* Similar to ApplicationPreview from league operator application */}
      </div>
    </div>
  );
};