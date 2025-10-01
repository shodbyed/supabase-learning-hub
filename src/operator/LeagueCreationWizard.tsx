/**
 * @fileoverview League Creation Wizard - Restructured Component
 *
 * Multi-step wizard for league operators to create new leagues.
 * This wizard guides operators through the essential league setup process:
 *
 * WIZARD STEPS:
 * 1. Game Type Selection (8-ball, 9-ball, 10-ball)
 * 2. Start Date Selection (determines day of week)
 * 3. Optional Qualifier
 * 4. Team Format Selection (5-man vs 8-man teams) - Determines handicap system
 * 5. Review & Create
 *
 * NOTE: Venue selection moved to team creation process where team captains
 * choose their home venue when registering teams.
 *
 * DESIGN PHILOSOPHY:
 * - Focus on core league rules and format during creation
 * - Venue selection handled during team registration (more natural)
 * - Team format choice determines handicap system automatically
 * - Step-by-step approach prevents overwhelming operators
 * - Clear explanations of team formats help operators make informed decisions
 * - Validation at each step ensures complete league setup
 * - Database operations are logged but not executed (dummy operations)
 *
 * INTEGRATION POINTS:
 * - Links from OperatorDashboard "Create League" buttons
 * - Uses operator profile data for organization details
 * - Integrates with separate Venue Creation Wizard
 * - Will eventually integrate with league management system
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuestionStep } from '@/components/forms/QuestionStep';
import { RadioChoiceStep } from '@/components/forms/RadioChoiceStep';
import { VenueCreationWizard } from './VenueCreationWizard';
import { useUserProfile } from '../hooks/useUserProfile';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { generateAllLeagueNames, getTimeOfYear, getDayOfWeek } from '@/utils/leagueUtils';
import { fetchBCAChampionshipURL } from '@/utils/tournamentUtils';

/**
 * Venue information interface
 * Represents a billiard hall/bar where matches can be played
 */
interface Venue {
  id: string;
  name: string;
  address: string; // Full formatted address for display
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  barBoxTables: number;
  regulationTables: number;
  totalTables: number;
  mainContact?: string;
  organizationId: string;
  createdAt: string;
  isActive: boolean;
}

/**
 * League data structure for the creation wizard
 * Matches the hierarchy defined in LEAGUE_MANAGEMENT_PLAN.md:
 * Organization → League → Season → Team → Player
 */
interface LeagueFormData {
  // Venue Information (for future implementation)
  selectedVenueId: string; // ID of selected venue or 'add_new' for new venue creation
  venueIds: string[]; // Array of venue IDs (for traveling leagues)

  // Basic League Information
  gameType: string; // "8 Ball", "9 Ball", "10 Ball", or ""
  startDate: string; // ISO date string (YYYY-MM-DD)

  // Derived fields from startDate (calculated once when startDate is set)
  dayOfWeek: string; // "Tuesday", "Wednesday", etc.
  season: string; // "Spring", "Summer", "Fall", "Winter"
  year: number;

  // Optional qualifier to differentiate leagues (West Side, North Valley, Blue, Red, etc.)
  qualifier: string;

  // Season Configuration
  seasonLength: number; // weeks (10-30, default 16)
  endDate: string; // calculated from start date + season length

  // Tournament Dates (to avoid conflicts)
  bcaNationalsChoice: string; // Choice from radio buttons (found dates, ignore, or custom)
  bcaNationalsStart: string;
  bcaNationalsEnd: string;
  apaNationalsStart: string;
  apaNationalsEnd: string;

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
  subtitle?: string | React.ReactElement;
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
  infoContent?: string | React.ReactElement | null;
  infoLabel?: string;
}

/**
 * League Creation Wizard Component
 *
 * Guides league operators through creating a new league with proper
 * validation and explanation of complex concepts like handicap systems.
 *
 * FLOW:
 * 1. Venue selection from organization venues
 * 2. League format (in-house vs traveling)
 * 3. Game type selection
 * 4. Start date selection
 * 5. Optional qualifier
 * 6. Team format selection (5-man vs 8-man)
 * 7. Handicap system selection with detailed explanations
 * 8. Review and creation
 */
export const LeagueCreationWizard: React.FC = () => {
  const navigate = useNavigate();
  const { member } = useUserProfile();

  // Wizard state management with localStorage persistence
  const [currentStep, setCurrentStep] = useLocalStorage('league-wizard-step', 0);
  const [currentInput, setCurrentInput] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [showVenueWizard, setShowVenueWizard] = useState(false);
  const [seasonLengthChoice, setSeasonLengthChoice] = useState<string>('16'); // Track the radio button selection

  // Organization venues - loaded from database
  const [organizationVenues, setOrganizationVenues] = useState<Venue[]>([]);

  /**
   * Fake database call to fetch organization venues
   */
  const fetchOrganizationVenues = async (): Promise<Venue[]> => {
    console.log('🔍 Fetching organization venues...');

    // Simulate database call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock venues - some organizations might have none
    const mockVenues: Venue[] = [
      {
        id: 'venue_1',
        name: 'Billiards Plaza',
        address: '123 Main St, Phoenix, AZ 85001',
        streetAddress: '123 Main St',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        phone: '(602) 555-0123',
        barBoxTables: 6,
        regulationTables: 2,
        totalTables: 8,
        mainContact: 'John Manager',
        organizationId: 'current_org_id',
        createdAt: '2024-01-15T10:00:00Z',
        isActive: true
      },
      {
        id: 'venue_2',
        name: 'Corner Pocket',
        address: '456 Oak Ave, Scottsdale, AZ 85251',
        streetAddress: '456 Oak Ave',
        city: 'Scottsdale',
        state: 'AZ',
        zipCode: '85251',
        phone: '(480) 555-0456',
        barBoxTables: 8,
        regulationTables: 4,
        totalTables: 12,
        mainContact: 'Sarah Owner',
        organizationId: 'current_org_id',
        createdAt: '2024-02-01T14:30:00Z',
        isActive: true
      }
    ];

    // Simulate different scenarios:
    // 50% chance of having venues, 50% chance of no venues yet
    const hasVenues = Math.random() > 0.3; // Favor having venues for demo
    const venues = hasVenues ? mockVenues : [];

    console.log(`✅ Found ${venues.length} venues for organization`);
    return venues;
  };

  /**
   * Load venues when component mounts
   */
  useEffect(() => {
    const loadVenues = async () => {
      const venues = await fetchOrganizationVenues();
      setOrganizationVenues(venues);
    };
    loadVenues();
  }, []);

  // State for found tournament dates to populate radio button choices
  const [foundTournamentDates, setFoundTournamentDates] = useState<Array<{
    id: string;
    label: string;
    description: string;
    startDate: string;
    endDate: string;
    voteCount: number;
    lastConfirmed: string;
  }>>([]);

  // League form data with localStorage persistence
  const [formData, setFormData] = useLocalStorage<LeagueFormData>('league-creation-wizard', {
    selectedVenueId: '',
    venueIds: [],
    gameType: '',
    startDate: '',
    dayOfWeek: '',
    season: '',
    year: 0,
    seasonLength: 16, // default 16 weeks
    endDate: '',
    bcaNationalsChoice: '',
    bcaNationalsStart: '',
    bcaNationalsEnd: '',
    apaNationalsStart: '',
    apaNationalsEnd: '',
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
  const updateFormData = (field: keyof LeagueFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Simulate database search for BCA nationals dates
   * Populates radio button choices with found date ranges and vote counts
   */
  const searchBCANationalsInDatabase = () => {
    console.log('🔍 DATABASE OPERATION: Automatically searching for BCA Nationals dates');

    // Simulate the database query structure
    const currentYear = new Date().getFullYear();
    const searchQuery = {
      table: 'tournament_dates',
      where: {
        organization: 'BCA',
        tournament_type: 'nationals',
        year: currentYear
      },
      select: ['start_date', 'end_date', 'vote_count', 'last_confirmed'],
      orderBy: 'vote_count DESC'
    };

    console.log('📋 Query:', JSON.stringify(searchQuery, null, 2));

    // Simulate multiple date entries from different operators
    const foundOptions = [];

    // Simulate 2-3 different date options with different vote counts
    const dateOptions = [
      {
        start_date: `${currentYear}-02-22`,
        end_date: `${currentYear}-02-26`,
        vote_count: 8,
        last_confirmed: `${currentYear}-01-15`
      },
      {
        start_date: `${currentYear}-02-20`,
        end_date: `${currentYear}-02-24`,
        vote_count: 3,
        last_confirmed: `${currentYear}-01-10`
      },
      {
        start_date: `${currentYear}-02-25`,
        end_date: `${currentYear}-02-28`,
        vote_count: 1,
        last_confirmed: `${currentYear}-01-05`
      }
    ];

    // Randomly include 1-3 options (simulate varying amounts of data)
    const numOptions = Math.floor(Math.random() * 3) + 1;

    for (let i = 0; i < numOptions; i++) {
      const option = dateOptions[i];
      foundOptions.push({
        id: `found_dates_${i}`,
        label: `${option.start_date} to ${option.end_date}`,
        description: `${option.vote_count} operators have confirmed these dates`,
        startDate: option.start_date,
        endDate: option.end_date,
        voteCount: option.vote_count,
        lastConfirmed: option.last_confirmed
      });
    }

    console.log(`✅ FOUND: ${foundOptions.length} BCA Nationals date options in database:`, foundOptions);
    setFoundTournamentDates(foundOptions);
  };

  /**
   * Get the organization name for league naming
   */
  const getOrganizationName = (): string => {
    // For now, use a placeholder. In the future, this should come from the operator's profile
    // Using ERROR in the name ensures we catch missing organization data immediately
    return formData.organizationName || 'ORGANIZATION_NAME_ERROR';
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
   * Tournament date validation - must be valid dates
   */
  const validateTournamentDate = (value: string): { isValid: boolean; error?: string } => {
    if (!value) {
      return { isValid: false, error: 'Tournament date is required' };
    }

    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { isValid: false, error: 'Please enter a valid date' };
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
   * Handle venue addition - opens venue creation wizard
   */
  const handleAddVenue = () => {
    console.log('🏢 Opening Venue Creation Wizard...');
    setShowVenueWizard(true);
  };

  /**
   * Handle venue creation completion
   */
  const handleVenueCreated = async (newVenue: Venue) => {
    console.log('✅ Venue created successfully:', newVenue);
    setShowVenueWizard(false);

    // Refresh venue list to include new venue
    const updatedVenues = await fetchOrganizationVenues();
    setOrganizationVenues(updatedVenues);

    // Auto-select the new venue
    updateFormData('selectedVenueId', newVenue.id);
  };

  /**
   * Handle venue creation cancellation
   */
  const handleVenueCanceled = () => {
    console.log('❌ Venue creation canceled');
    setShowVenueWizard(false);
  };

  /**
   * Wizard step definitions - Following reference code flow
   * Order: Start Date → Season Length → Game Type → Venue → BCA Nationals → APA Nationals → Team Format → Qualifier
   */
  const steps: WizardStep[] = [
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

        // Calculate and save derived fields from start date
        if (value) {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            updateFormData('dayOfWeek', getDayOfWeek(date));
            updateFormData('season', getTimeOfYear(date));
            updateFormData('year', date.getFullYear());
          }
        }

        // Auto-calculate end date when start date changes
        if (value && formData.seasonLength) {
          const startDate = new Date(value);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + (formData.seasonLength * 7));
          updateFormData('endDate', endDate.toISOString().split('T')[0]);
        }
      },
      infoTitle: 'Season Start Date',
      infoContent: 'This is the date of your first league night. All subsequent matches will be on the same day of the week. The day of the week will automatically be included in your league name.'
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
        if (value === 'custom') {
          // Keep current seasonLength as starting point for custom input
          // The actual value will be updated in the custom input step
        } else {
          const weeks = parseInt(value, 10);
          updateFormData('seasonLength', weeks);
          // Auto-calculate end date when season length changes
          if (formData.startDate && weeks) {
            const startDate = new Date(formData.startDate);
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + (weeks * 7));
            updateFormData('endDate', endDate.toISOString().split('T')[0]);
          }
        }
      },
      infoTitle: 'Things to keep in mind when choosing season length',
      infoContent: `LONGER SEASONS:
• Larger prize pools and payouts
• Makes sandbagging less effective
• More stable standings

SHORTER SEASONS:
• More frequent payouts
• More engaging and exciting
• Easier to retain less committed players
• Less likely for runaway/locked positions in standings

HOLIDAY CONSIDERATIONS:
• Xmas/New Year near beginning or end of a season can cause issues. Try to avoid this if possible.

OPERATOR WORKLOAD:
• Each season requires administrative time even with our tools to streamline the process
• Admin/supply fees taken from prize pools affect smaller pools more than larger ones

BOTTOM LINE: 16 weeks is popular because it balances all these factors - enough time for meaningful competition without overwhelming players or operators.`,
      infoLabel: 'Need help choosing'
    },

    // Step 2b: Custom Season Length (only shown when custom is selected)
    {
      id: 'custom_season_length',
      title: 'Enter custom season length',
      subtitle: 'How many weeks should your season be? (6-52 weeks)',
      type: 'input',
      placeholder: 'Enter number of weeks',
      validator: (value: string): { isValid: boolean; error?: string } => {
        if (!value) {
          return { isValid: false, error: 'Season length is required' };
        }

        const weeks = parseInt(value, 10);
        if (isNaN(weeks)) {
          return { isValid: false, error: 'Please enter a valid number' };
        }

        if (weeks < 6 || weeks > 52) {
          return { isValid: false, error: 'Season must be between 6 and 52 weeks' };
        }

        return { isValid: true };
      },
      getValue: () => {
        // Always show the current season length as default for easy editing
        return formData.seasonLength.toString();
      },
      setValue: (value: string) => {
        const weeks = parseInt(value, 10);
        updateFormData('seasonLength', weeks);
        // Auto-calculate end date when season length changes
        if (formData.startDate && weeks) {
          const startDate = new Date(formData.startDate);
          const endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + (weeks * 7));
          updateFormData('endDate', endDate.toISOString().split('T')[0]);
        }
      },
      infoTitle: 'Things to keep in mind when choosing season length',
      infoContent: `LONGER SEASONS:
• Larger prize pools and payouts
• Makes sandbagging less effective
• More stable standings

SHORTER SEASONS:
• More frequent payouts
• More engaging and exciting
• Easier to retain less committed players
• Less likely for runaway/locked positions in standings

HOLIDAY CONSIDERATIONS:
• Xmas/New Year near beginning or end of a season can cause issues. Try to avoid this if possible.

OPERATOR WORKLOAD:
• Each season requires administrative time even with our tools to streamline the process
• Admin/supply fees taken from prize pools affect smaller pools more than larger ones

BOTTOM LINE: 16 weeks is popular because it balances all these factors - enough time for meaningful competition without overwhelming players or operators.`
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
          subtitle: 'Fastest matches',
          icon: '⚡',
          description: 'Rotation game - faster paced with shorter matches'
        },
        {
          value: '10 Ball',
          label: '10 Ball',
          subtitle: 'High skill',
          icon: '🏆',
          description: 'Advanced rotation game requiring call shots',
          warning: 'Matches take significantly longer and require higher skill level'
        }
      ],
      getValue: () => formData.gameType,
      setValue: (value: string) => updateFormData('gameType', value as typeof formData.gameType)
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
          description: 'I don\'t expect enough of my league players to travel to this tournament so I have no need to schedule my league around it'
        },
        {
          value: 'custom',
          label: 'Enter my own tournament dates',
          description: 'I have different/updated BCA tournament dates to use for scheduling'
        }
      ],
      getValue: () => formData.bcaNationalsChoice || '',
      setValue: (value: string) => {
        updateFormData('bcaNationalsChoice', value);

        // Handle different choice types
        if (value.startsWith('found_dates_')) {
          // User selected a found date range - extract the dates
          const foundOption = foundTournamentDates.find(option => option.id === value);
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
      infoLabel: 'Why is this important'
    },

    // Step 6: APA Nationals Start Date
    {
      id: 'apa_nationals_start',
      title: 'When are the APA National tournaments?',
      subtitle: 'Enter the start date to avoid scheduling conflicts (check APA website for current dates)',
      type: 'input',
      placeholder: 'APA Nationals start date',
      validator: validateTournamentDate,
      getValue: () => formData.apaNationalsStart,
      setValue: (value: string) => updateFormData('apaNationalsStart', value),
      infoTitle: 'APA Nationals Scheduling',
      infoContent: 'APA Nationals typically occur in late spring/early summer. Visit poolplayers.com for current tournament dates and locations.'
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
      infoTitle: 'Complete Tournament Calendar',
      infoContent: 'Having both BCA and APA tournament dates ensures your league schedule works around all major national competitions.'
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

🏆 HANDICAP SYSTEM: Custom 5-Man Formula
• Formula: (Wins - Losses) ÷ Weeks Played
• Range: +2 to -2 handicap points
• Heavy handicapping for maximum balance
• Anti-sandbagging: Team win/loss policy

✅ PROS:
• Faster matches (28% shorter than 8-man)
• Easier to start (need fewer players)
• Great for smaller venues
• Everyone gets more playing time
• Highly competitive balance

❌ CONS:
• Non-standard format
• Fewer total players involved
• More complex handicap calculations`,
          infoTitle: '5-Man System Deep Dive',
          infoContent: 'The 5-man system with custom handicapping creates extremely competitive matches where skill gaps are heavily minimized. Perfect for casual leagues or smaller player pools.'
        },
        {
          value: '8_man',
          label: '8-Man Teams + BCA Standard Handicap',
          subtitle: '🏅 Official BCA format • Standard everywhere • Light handicapping',
          description: `🎯 KEY DIFFERENCES:
• 8 players per roster, 5 play each night
• Single round robin: 25 games per match
• Match time: ~3.5 hours
• Minimum players needed: 20 total (10 per team)

🏆 HANDICAP SYSTEM: BCA Standard
• Formula: Win Percentage (Wins ÷ Total Games)
• Rolling window: Last 50 games
• Light handicapping preserves skill advantage
• Standard CHARTS lookup table

✅ PROS:
• Official BCA sanctioned format
• Standard across most pool leagues
• More players participate each week
• Proven, time-tested system
• Easier player transfers between leagues

❌ CONS:
• Longer matches (3.5+ hours)
• Need more players to start
• Skill gaps more pronounced
• Less playing time per individual`,
          infoTitle: 'BCA Standard System Deep Dive',
          infoContent: 'The official BCA format used in leagues nationwide. Minimal handicapping means better players maintain their advantage, creating traditional competitive structure.'
        }
      ],
      getValue: () => formData.teamFormat,
      setValue: (value: string) => {
        updateFormData('teamFormat', value as typeof formData.teamFormat);
        // Auto-set handicap system based on team format
        if (value === '5_man') {
          updateFormData('handicapSystem', 'custom_5man');
        } else if (value === '8_man') {
          updateFormData('handicapSystem', 'bca_standard');
        }
      },
      infoTitle: 'Team Format Comparison Chart',
      infoContent: `
📊 SIDE-BY-SIDE COMPARISON:

                    5-MAN          8-MAN
Players/Roster:       5              8
Play Each Night:      3              5
Games/Match:         18             25
Match Duration:    2.5hrs         3.5hrs
Min Players:         12             20
Handicap Style:    Heavy          Light
Skill Impact:       Low           High
BCA Official:       No            Yes
Startup Ease:      Easy          Hard

🎯 CHOOSE 5-MAN IF:
• You want faster, more balanced matches
• You have a smaller player pool
• You want maximum competitive balance
• Venue has limited time slots

🎯 CHOOSE 8-MAN IF:
• You want official BCA sanctioning
• You have plenty of players available
• You prefer skill-based competition
• You want standard league compatibility`
    },

    // Step 9: Optional Qualifier
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

  ];

  /**
   * Get current step with dynamic choices (venue selection, etc.)
   */
  const getCurrentStep = (): WizardStep => {
    const step = steps[currentStep];

    // Dynamically populate venue choices based on organization venues
    if (step.id === 'venue_selection') {
      const venueChoices = organizationVenues.map(venue => ({
        value: venue.id,
        label: venue.name,
        subtitle: `${venue.totalTables} tables • ${venue.city}, ${venue.state}`,
        description: `📍 ${venue.address}\n📞 ${venue.phone}\n🎱 ${venue.barBoxTables} Bar Box + ${venue.regulationTables} Regulation tables`
      }));

      // Add traveling league option
      venueChoices.push({
        value: 'traveling',
        label: 'Traveling League',
        subtitle: 'Multiple venues',
        description: 'League rotates between multiple venues. Teams take turns hosting matches at different locations.'
      });

      // Add option to create new venue
      venueChoices.push({
        value: 'add_new',
        label: '+ Add New Venue',
        subtitle: 'Create a new venue',
        description: 'Set up a new pool hall or bar for your organization.'
      });

      step.choices = venueChoices;
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

    // Handle special venue selection cases
    if (step.id === 'venue_selection') {
      if (choiceId === 'add_new') {
        handleAddVenue();
        return;
      }
    }

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
   * Navigate to next step with conditional step logic
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

    // Handle conditional step navigation
    let nextStep = currentStep + 1;

    // Skip custom season length step if not needed
    if (step.id === 'season_length' && seasonLengthChoice !== 'custom') {
      // Skip the custom_season_length step
      nextStep = currentStep + 2;
    }

    // Skip custom season length step when going backwards from game_type
    if (step.id === 'custom_season_length') {
      // Normal progression to game_type
      nextStep = currentStep + 1;
    }

    if (nextStep < steps.length) {
      setCurrentStep(nextStep);
      setCurrentInput('');
      setError(undefined);
    } else {
      handleSubmit();
    }
  };

  /**
   * Navigate to previous step with conditional step logic
   */
  const handlePrevious = () => {
    if (currentStep > 0) {
      let prevStep = currentStep - 1;

      // Handle conditional step navigation when going backwards
      const currentStepData = steps[currentStep];

      // If we're on game_type and the previous season_length choice wasn't 'custom',
      // skip back over the custom_season_length step
      if (currentStepData.id === 'game_type') {
        if (seasonLengthChoice !== 'custom') {
          prevStep = currentStep - 2; // Skip back over custom_season_length
        }
      }

      // Ensure we don't go below 0
      if (prevStep >= 0) {
        setCurrentStep(prevStep);
        setCurrentInput('');
        setError(undefined);
      }
    }
  };

  /**
   * Cancel wizard and return to operator dashboard
   */
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel league creation? All progress will be lost.')) {
      // Clear localStorage
      localStorage.removeItem('league-creation-wizard');
      localStorage.removeItem('league-wizard-step');
      navigate('/operator-dashboard');
    }
  };

  /**
   * Clear form data and restart wizard
   */
  const handleClearForm = () => {
    if (window.confirm('Are you sure you want to clear all form data and start over?')) {
      // Clear localStorage
      localStorage.removeItem('league-creation-wizard');
      localStorage.removeItem('league-wizard-step');
      // Refresh the page to reset everything
      window.location.reload();
    }
  };

  /**
   * Handle form submission - create the league
   */
  const handleSubmit = async () => {
    console.group('🏆 LEAGUE CREATION - DATABASE OPERATIONS');

    console.log('📋 COMPLETE LEAGUE DATA:', formData);

    console.group('🏢 LEAGUE INFORMATION');
    console.log('Game Type:', formData.gameType);
    console.log('Start Date:', formData.startDate);
    console.log('Day of Week (derived):', formData.startDate ? new Date(formData.startDate).toLocaleDateString('en-US', { weekday: 'long' }) : 'Not set');
    console.log('Team Format:', formData.teamFormat);
    console.log('Handicap System:', formData.handicapSystem);

    // Generate all formatted league names for database storage
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      const leagueComponents = {
        organizationName: getOrganizationName(),
        year: startDate.getFullYear(),
        season: getTimeOfYear(startDate),
        gameType: formData.gameType || 'eight_ball',
        dayOfWeek: getDayOfWeek(startDate),
        qualifier: formData.qualifier
      };

      const allNames = generateAllLeagueNames(leagueComponents);

      console.group('📛 FORMATTED LEAGUE NAMES');
      console.log('Preview Name:', `${formData.gameType} ${formData.dayOfWeek} ${formData.season} ${formData.year} ${getOrganizationName()}${formData.qualifier ? ` ${formData.qualifier}` : ''}`.trim());
      console.log('Database Systematic Name:', allNames.systematicName);
      console.log('Player-Friendly Name:', allNames.playerFriendlyName);
      console.log('Operator Management Name:', allNames.operatorName);
      console.log('Full Display Name:', allNames.fullDisplayName);
      console.groupEnd();
    }

    console.groupEnd();

    console.group('📍 VENUE INFORMATION');
    console.log('Venue selection will be handled during team registration phase');
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

    console.group('🔄 DATABASE OPERATIONS TO PERFORM');
    console.log('1. Create leagues table record');
    console.log('2. Link to selected venue(s)');
    console.log('3. Link to operator organization');
    console.log('4. Set up initial season framework');
    console.log('5. Configure handicap system parameters');
    console.log('6. Initialize league settings');
    console.groupEnd();

    console.group('✅ NEXT STEPS FOR LEAGUE OPERATOR');
    console.log('1. Set up first season parameters');
    console.log('2. Begin team registration process');
    console.log('3. Schedule venue partnerships (if traveling)');
    console.log('4. Set registration deadlines');
    console.log('5. Plan season schedule generation');
    console.groupEnd();

    console.groupEnd();

    // Clear localStorage after successful creation
    localStorage.removeItem('league-creation-wizard');
    localStorage.removeItem('league-wizard-step');

    // Navigate back to operator dashboard with success message
    navigate('/operator-dashboard');
  };

  /**
   * Load organization details from operator profile when component mounts
   */
  useEffect(() => {
    if (member) {
      // Pre-populate basic contact details from member profile
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]); // Only depend on currentStep - getCurrentStep changes with currentStep

  /**
   * Automatically search for BCA nationals dates when reaching that step
   */
  useEffect(() => {
    const step = getCurrentStep();
    // Trigger search when user reaches BCA nationals step for the first time
    if (step.id === 'bca_nationals_dates' && foundTournamentDates.length === 0) {
      console.log('🎯 STEP TRIGGER: Reached BCA Nationals step - starting automatic database search');
      searchBCANationalsInDatabase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]); // Trigger when step changes

  const currentStepData = getCurrentStep();
  const isLastStep = currentStep === steps.length - 1;
  const canGoBack = currentStep > 0;

  // Show venue creation wizard if requested
  if (showVenueWizard) {
    return (
      <VenueCreationWizard
        onComplete={handleVenueCreated}
        onCancel={handleVenueCanceled}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-between items-center mb-4">
            <div></div> {/* Spacer for centering */}
            <h1 className="text-3xl font-bold text-gray-900">
              Create New League
            </h1>
            <button
              onClick={handleClearForm}
              className="text-sm text-red-600 hover:text-red-800 underline"
              title="Clear all form data and start over"
            >
              Clear Form
            </button>
          </div>
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
              onCancel={handleCancel}
              canGoBack={canGoBack}
              isLastQuestion={isLastStep}
              infoTitle={currentStepData.infoTitle}
              infoContent={currentStepData.infoContent ?? undefined}
              infoLabel={currentStepData.infoLabel}
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
              onCancel={handleCancel}
              canGoBack={canGoBack}
              isLastQuestion={isLastStep}
              infoTitle={currentStepData.infoTitle}
              infoContent={currentStepData.infoContent ?? undefined}
              error={error}
              inputType={currentStepData.id === 'start_date' ? 'date' : 'text'}
            />
          )}
        </div>

        {/* League Preview */}
        {(formData.startDate || formData.endDate) && (
          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-3">League Preview:</h3>

              <p className="text-lg font-semibold text-blue-800 mb-2">
                <span className="text-blue-600">League Name:</span> {
                  `${formData.gameType} ${formData.dayOfWeek} ${formData.season} ${formData.year || ''} ${getOrganizationName()}${formData.qualifier ? ` ${formData.qualifier}` : ''}`.trim()
                }
              </p>

              {formData.startDate && (
                <p className="text-sm text-gray-700 mb-1">
                  <span className="font-medium">Start Date:</span> {new Date(formData.startDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              )}

              {formData.endDate && (
                <>
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">End of Regular Season:</span> {new Date(formData.endDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>

                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">Week Off:</span> {(() => {
                      const weekOff = new Date(formData.endDate);
                      weekOff.setDate(weekOff.getDate() + 7);
                      return weekOff.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    })()}
                  </p>

                  <p className="text-sm text-gray-700 mb-3">
                    <span className="font-medium">Playoffs:</span> {(() => {
                      const playoffs = new Date(formData.endDate);
                      playoffs.setDate(playoffs.getDate() + 14);
                      return playoffs.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      });
                    })()}
                  </p>

                  <p className="text-xs text-gray-400 italic">
                    (does not include holiday breaks)
                  </p>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};