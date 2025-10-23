/**
 * @fileoverview Season Creation Wizard
 *
 * Multi-step wizard for creating a new season for a league.
 * Uses localStorage for form persistence across page refreshes.
 */
import { useState, useEffect, useRef, useCallback, useReducer } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useOperatorId } from '@/hooks/useOperatorId';
import { wizardReducer, createInitialState } from './wizardReducer';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { WizardProgress } from '@/components/forms/WizardProgress';
import { DayOfWeekWarningModal } from '@/components/modals/DayOfWeekWarningModal';
import { DualDateStep } from '@/components/forms/DualDateStep';
import { SimpleRadioChoice } from '@/components/forms/SimpleRadioChoice';
import { ScheduleReview } from '@/components/season/ScheduleReview';
import { SeasonStatusCard } from '@/components/operator/SeasonStatusCard';
import { getSeasonWizardSteps, clearSeasonCreationData, type SeasonFormData, type ChampionshipPreference } from '@/data/seasonWizardSteps';
import { fetchChampionshipDateOptions, submitChampionshipDates, type ChampionshipDateOption } from '@/utils/tournamentUtils';
import { generateSchedule } from '@/utils/scheduleUtils';
import { fetchHolidaysForSeason } from '@/utils/holidayUtils';
import { detectScheduleConflicts } from '@/utils/conflictDetectionUtils';
import type { League } from '@/types/league';
import type { Season, SeasonInsertData, WeekEntry, ChampionshipEvent } from '@/types/season';
import { generateSeasonName, calculateEndDate, formatDateForDB } from '@/types/season';
import { formatGameType, formatDayOfWeek } from '@/types/league';
import { parseLocalDate } from '@/utils/formatters';

/**
 * Season Creation Wizard Component
 *
 * Guides operators through creating a new season:
 * 1. Start date (auto-set for first season)
 * 2. Season length
 * 3. BCA championship dates
 * 4. APA championship dates
 */
export const SeasonCreationWizard: React.FC = () => {
  const { leagueId } = useParams<{ leagueId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { operatorId } = useOperatorId();

  // New useReducer hook for state management (running alongside useState for now)
  // Prefixed with _ because we're setting up infrastructure but not using it yet
  const [_state, _dispatch] = useReducer(wizardReducer, createInitialState(leagueId));

  const [league, setLeague] = useState<League | null>(null);
  const [existingSeasons, setExistingSeasons] = useState<Season[]>([]);
  const [bcaDateOptions, setBcaDateOptions] = useState<ChampionshipDateOption[]>([]);
  const [apaDateOptions, setApaDateOptions] = useState<ChampionshipDateOption[]>([]);
  const [savedChampionshipPreferences, setSavedChampionshipPreferences] = useState<ChampionshipPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(() => {
    // Restore current step from localStorage
    const stored = localStorage.getItem(`season-wizard-step-${leagueId}`);
    return stored ? parseInt(stored, 10) : 0;
  });
  const [isEditingExistingSeason, setIsEditingExistingSeason] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [_refreshKey, setRefreshKey] = useState(0); // Force re-render when form data changes
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dayOfWeekWarning, setDayOfWeekWarning] = useState<{
    show: boolean;
    oldDay: string;
    newDay: string;
    newDate: string;
  } | null>(null);
  const [schedule, setSchedule] = useState<WeekEntry[]>([]);

  // Wrapper to log schedule updates from ScheduleReview
  // Wrapped in useCallback to prevent infinite loops in ScheduleReview's useEffect
  const handleScheduleChange = useCallback((newSchedule: WeekEntry[]) => {
    console.log('📥 SeasonCreationWizard received schedule update from ScheduleReview:', {
      weekCount: newSchedule.length,
      byType: {
        regular: newSchedule.filter(w => w.type === 'regular').length,
        playoffs: newSchedule.filter(w => w.type === 'playoffs').length,
        'week-off': newSchedule.filter(w => w.type === 'week-off').length,
      },
      weeks: newSchedule.map(w => ({ weekNumber: w.weekNumber, weekName: w.weekName, date: w.date, type: w.type }))
    });
    setSchedule(newSchedule);
  }, []);
  const [seasonStartDate, setSeasonStartDate] = useState<string>('');
  const [holidays, setHolidays] = useState<any[]>([]);
  const [bcaChampionship, setBcaChampionship] = useState<ChampionshipEvent | undefined>();
  const [apaChampionship, setApaChampionship] = useState<ChampionshipEvent | undefined>();

  // Track if schedule has been generated for current step to prevent infinite loops
  const scheduleGeneratedForStep = useRef<number | null>(null);

  /**
   * Fetch operator's saved championship preferences
   * Returns array of saved preferences or empty array if none exist
   */
  const fetchChampionshipPreferences = async (operatorId: string | null): Promise<ChampionshipPreference[]> => {
    if (!operatorId) {
      console.log('⚠️ No operatorId available - cannot fetch preferences');
      return [];
    }

    try {
      const { data: preferences } = await supabase
        .from('operator_blackout_preferences')
        .select('*, championship_date_options(*)')
        .eq('operator_id', operatorId)
        .eq('preference_type', 'championship');

      if (preferences && preferences.length > 0) {
        const prefs: ChampionshipPreference[] = preferences
          .filter(p => p.championship_date_options && p.preference_action !== null)
          .map(p => ({
            organization: p.championship_date_options!.organization as 'BCA' | 'APA',
            startDate: p.championship_date_options!.start_date,
            endDate: p.championship_date_options!.end_date,
            ignored: p.preference_action === 'ignore',
          }));

        console.log('📋 Loaded saved championship preferences:', prefs);
        return prefs;
      } else {
        console.log('📋 No saved championship preferences found');
        return [];
      }
    } catch (err) {
      console.error('❌ Failed to fetch saved championship preferences:', err);
      return [];
    }
  };

  /**
   * Fetch league and existing seasons
   * If seasonId query param exists, we're editing an existing season
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!leagueId) {
        setError('No league ID provided');
        setLoading(false);
        return;
      }

      const seasonId = searchParams.get('seasonId');

      try {
        // Fetch league
        const { data: leagueData, error: leagueError } = await supabase
          .from('leagues')
          .select('*')
          .eq('id', leagueId)
          .single();

        if (leagueError) throw leagueError;
        setLeague(leagueData);

        // Fetch championship date options for both BCA and APA
        const bcaDates = await fetchChampionshipDateOptions('BCA');
        setBcaDateOptions(bcaDates);

        const apaDates = await fetchChampionshipDateOptions('APA');
        setApaDateOptions(apaDates);

        // Fetch operator's saved championship preferences to skip those steps in wizard
        const prefs = await fetchChampionshipPreferences(operatorId);
        setSavedChampionshipPreferences(prefs);

        // If editing existing season, load season data and jump to schedule review
        if (seasonId) {
          console.log('📝 Edit mode - loading season:', seasonId);
          setIsEditingExistingSeason(true);

          // Fetch season data
          const { data: seasonData, error: seasonError } = await supabase
            .from('seasons')
            .select('*')
            .eq('id', seasonId)
            .single();

          if (seasonError) throw seasonError;

          // Fetch season weeks
          const { data: weeksData, error: weeksError } = await supabase
            .from('season_weeks')
            .select('*')
            .eq('season_id', seasonId)
            .order('scheduled_date', { ascending: true });

          if (weeksError) throw weeksError;

          console.log('✅ Loaded season data:', seasonData);
          console.log('✅ Loaded season weeks:', weeksData);

          // TODO: Transform weeksData into the format expected by the wizard
          // For now, just jump to the schedule-review step
          // This will be improved later to properly load and display the existing season data

          // Set existingSeasons array (to indicate we're editing)
          setExistingSeasons([seasonData]);
        } else {
          // Creating new season
          setExistingSeasons([]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load league information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId, searchParams, operatorId]);

  /**
   * Load existing season data into wizard when editing
   * User can navigate through all steps to make changes
   */
  useEffect(() => {
    if (!league || !leagueId || loading || !isEditingExistingSeason) return;

    // TODO: Load season data into localStorage to populate wizard fields
    // For now, user will start at step 0 and can navigate through all steps
    console.log('📝 Edit mode: User can navigate through wizard steps to edit season');
  }, [league, leagueId, loading, isEditingExistingSeason]);

  /**
   * Generate schedule when reaching schedule-review step
   * If editing an existing season, load saved schedule from localStorage
   * Otherwise, generate a fresh schedule
   *
   * Only runs once when entering schedule-review step to prevent infinite loops
   */
  useEffect(() => {
    if (!league || !leagueId || loading) return;

    const steps = getSeasonWizardSteps(
      leagueId,
      existingSeasons.length > 0,
      existingSeasons.length > 0 ? undefined : league.league_start_date,
      league.day_of_week,
      () => {},
      bcaDateOptions,
      apaDateOptions,
      savedChampionshipPreferences
    );

    const currentStepData = steps[currentStep];

    if (currentStepData?.type === 'schedule-review') {
      // Prevent infinite loop - only generate schedule once per step
      if (scheduleGeneratedForStep.current === currentStep) {
        console.log('⏸️ Schedule already generated for step', currentStep, '- skipping');
        return;
      }

      console.log('🔄 Generating schedule for step', currentStep);
      scheduleGeneratedForStep.current = currentStep;

      // Get form data from localStorage
      const stored = localStorage.getItem(`season-creation-${leagueId}`);
      if (!stored) {
        console.log('⚠️ No localStorage data found for schedule generation');
        return;
      }

      const formData: SeasonFormData = JSON.parse(stored);
      console.log('📋 Form data for schedule generation:', formData);

      // Check if we have a saved complete schedule (from Continue Setup)
      const savedSchedule = localStorage.getItem('season-schedule-review');
      const savedBlackouts = localStorage.getItem('season-blackout-weeks');

      const startDate = parseLocalDate(formData.startDate);
      const seasonLength = parseInt(formData.seasonLength);
      const leagueDayOfWeek = formatDayOfWeek(league.day_of_week);

      let initialSchedule: WeekEntry[];

      if (savedSchedule) {
        // Load saved schedule (from Continue Setup)
        console.log('📂 Loading saved schedule from localStorage');
        initialSchedule = JSON.parse(savedSchedule);
      } else {
        // Generate fresh schedule
        console.log('🔄 Generating new schedule');
        initialSchedule = generateSchedule(
          startDate,
          leagueDayOfWeek,
          seasonLength
        );
      }

      // Fetch holidays for the season
      const holidays = fetchHolidaysForSeason(startDate, seasonLength);

      // Function to fetch operator's championship preferences and generate schedule with conflicts
      const generateScheduleWithPreferences = async () => {
        // Fetch operator's championship preferences from database to determine if they should be included in conflict detection
        let bcaShouldBeIncluded = !formData.bcaIgnored; // Default to wizard form data
        let apaShouldBeIncluded = !formData.apaIgnored; // Default to wizard form data

        // Fetch preferences using shared function
        const preferences = await fetchChampionshipPreferences(operatorId);

        if (preferences.length > 0) {
          // Check if operator has set these championships to 'ignore'
          const bcaPref = preferences.find(p => p.organization === 'BCA');
          const apaPref = preferences.find(p => p.organization === 'APA');

          // Only include championships in conflict detection if NOT ignored
          if (bcaPref) {
            bcaShouldBeIncluded = !bcaPref.ignored;
          }
          if (apaPref) {
            apaShouldBeIncluded = !apaPref.ignored;
          }

          console.log('📋 Championship preference check:', {
            bca: bcaPref ? `${bcaPref.ignored ? 'ignore' : 'blackout'} (${bcaShouldBeIncluded ? 'included' : 'ignored'})` : 'no preference',
            apa: apaPref ? `${apaPref.ignored ? 'ignore' : 'blackout'} (${apaShouldBeIncluded ? 'included' : 'ignored'})` : 'no preference',
          });
        }

        // Build championship event objects for conflict detection
        // Only include if operator hasn't set them to 'ignore'
        const bcaChampionshipEvent: ChampionshipEvent | undefined =
          bcaShouldBeIncluded && formData.bcaStartDate && formData.bcaEndDate
            ? { start: formData.bcaStartDate, end: formData.bcaEndDate, ignored: false }
            : undefined;

        const apaChampionshipEvent: ChampionshipEvent | undefined =
          apaShouldBeIncluded && formData.apaStartDate && formData.apaEndDate
            ? { start: formData.apaStartDate, end: formData.apaEndDate, ignored: false }
            : undefined;

        // Detect conflicts using shared utility
        const scheduleWithConflicts = detectScheduleConflicts(
          initialSchedule,
          holidays,
          bcaChampionshipEvent,
          apaChampionshipEvent,
          leagueDayOfWeek
        );

        return { scheduleWithConflicts, bcaChampionshipEvent, apaChampionshipEvent };
      };

      // Execute the async function
      generateScheduleWithPreferences().then(({ scheduleWithConflicts, bcaChampionshipEvent, apaChampionshipEvent }) => {
        // Save data to state for ScheduleReview component
        setSchedule(scheduleWithConflicts);
        setSeasonStartDate(formData.startDate);
        setHolidays(holidays);

        // Set championship data based on what was actually included in conflict detection
        setBcaChampionship(bcaChampionshipEvent);
        setApaChampionship(apaChampionshipEvent);

        console.log('📅 Schedule loaded with conflicts:', {
          source: savedSchedule ? 'localStorage' : 'generated',
          weekCount: scheduleWithConflicts.length,
          hasBlackouts: savedBlackouts ? 'yes' : 'no',
          bcaIncluded: !!bcaChampionshipEvent,
          apaIncluded: !!apaChampionshipEvent,
        });
      });
    }
  }, [currentStep, league, leagueId, loading, existingSeasons, bcaDateOptions, apaDateOptions, operatorId, savedChampionshipPreferences]);

  /**
   * Auto-populate and auto-advance BCA/APA steps when saved preferences exist
   * This creates a seamless "breeze through" experience for operators who have saved preferences
   */
  useEffect(() => {
    if (!leagueId || loading || !league || savedChampionshipPreferences.length === 0) return;

    const steps = getSeasonWizardSteps(
      leagueId,
      existingSeasons.length > 0,
      existingSeasons.length > 0 ? undefined : league.league_start_date,
      league.day_of_week,
      () => {},
      bcaDateOptions,
      apaDateOptions,
      savedChampionshipPreferences
    );

    const currentStepData = steps[currentStep];
    if (!currentStepData) return;

    // Check if we're on BCA or APA choice step
    if (currentStepData.id === 'bcaChoice' || currentStepData.id === 'apaChoice') {
      const organization = currentStepData.id === 'bcaChoice' ? 'BCA' : 'APA';
      const preference = savedChampionshipPreferences.find(p => p.organization === organization);

      if (preference) {
        // Auto-populate localStorage with saved preference
        const STORAGE_KEY = `season-creation-${leagueId}`;
        const stored = localStorage.getItem(STORAGE_KEY);
        console.log(`📦 Current localStorage for ${organization}:`, stored);
        const formData: SeasonFormData = stored ? JSON.parse(stored) : {
          startDate: '',
          seasonLength: '16',
          isCustomLength: false,
          bcaChoice: '',
          bcaStartDate: '',
          bcaEndDate: '',
          bcaIgnored: false,
          apaChoice: '',
          apaStartDate: '',
          apaEndDate: '',
          apaIgnored: false,
        };

        if (organization === 'BCA') {
          formData.bcaChoice = 'saved-preference';
          formData.bcaStartDate = preference.startDate;
          formData.bcaEndDate = preference.endDate;
          formData.bcaIgnored = preference.ignored;
        } else {
          formData.apaChoice = 'saved-preference';
          formData.apaStartDate = preference.startDate;
          formData.apaEndDate = preference.endDate;
          formData.apaIgnored = preference.ignored;
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
        console.log(`✅ Auto-populated ${organization} preference from saved settings`);

        // Auto-advance to next step
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        localStorage.setItem(`season-wizard-step-${leagueId}`, nextStep.toString());
        console.log(`⏭️ Auto-advancing from ${organization} step to step ${nextStep}`);
      }
    }
  }, [currentStep, leagueId, loading, league, savedChampionshipPreferences, existingSeasons, bcaDateOptions, apaDateOptions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !league || !leagueId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-red-600 text-lg font-semibold mb-4">Error</h3>
            <p className="text-gray-700 mb-4">{error || 'League not found'}</p>
            <Button onClick={() => navigate('/operator-dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const hasExistingSeasons = existingSeasons.length > 0;
  const defaultStartDate = hasExistingSeasons ? undefined : league.league_start_date;

  /**
   * Callback triggered when user changes start date to a different day of week
   * Shows warning modal explaining that league will be updated
   */
  const handleDayOfWeekChange = (newDay: string, newDate: string) => {
    setDayOfWeekWarning({
      show: true,
      oldDay: formatDayOfWeek(league.day_of_week),
      newDay,
      newDate,
    });
  };

  /**
   * User accepted the day of week change
   * Updates the league and saves the new date
   */
  const handleAcceptDayChange = async () => {
    if (!dayOfWeekWarning || !leagueId) return;

    try {
      // Convert day name to number (0 = Sunday, 6 = Saturday)
      const dayMap: Record<string, number> = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };

      const newDayNumber = dayMap[dayOfWeekWarning.newDay];
      const newDayString = dayOfWeekWarning.newDay.toLowerCase() as 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

      // Update the league's day_of_week in database
      console.log('Updating league day_of_week to:', newDayNumber, `(${dayOfWeekWarning.newDay})`);

      const { error } = await supabase
        .from('leagues')
        .update({ day_of_week: newDayNumber })
        .eq('id', leagueId);

      if (error) throw error;

      console.log('✅ League day_of_week updated successfully');

      // Update local state
      setLeague((prev) => prev ? { ...prev, day_of_week: newDayString } : null);

      // Save the new start date to form data
      const STORAGE_KEY = `season-creation-${leagueId}`;
      const stored = localStorage.getItem(STORAGE_KEY);
      const formData = stored ? JSON.parse(stored) : {};
      formData.startDate = dayOfWeekWarning.newDate;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

      // Close modal
      setDayOfWeekWarning(null);
    } catch (err) {
      console.error('Error updating league day:', err);
      setError('Failed to update league day of week');
    }
  };

  /**
   * User cancelled the day of week change
   * Revert to the original date
   */
  const handleCancelDayChange = () => {
    // Just close the modal - the date wasn't saved
    setDayOfWeekWarning(null);
  };

  /**
   * Handle edit button clicks from SeasonStatusCard
   * Jumps to specific wizard step for editing
   */
  const handleEdit = (step: 'startDate' | 'seasonLength' | 'bca' | 'apa') => {
    const stepMap = {
      startDate: 0,
      seasonLength: 1,
      bca: 2,
      apa: 3,
    };
    const targetStep = stepMap[step];
    setCurrentStep(targetStep);
    localStorage.setItem(`season-wizard-step-${leagueId}`, targetStep.toString());
  };

  const steps = getSeasonWizardSteps(
    leagueId,
    hasExistingSeasons,
    defaultStartDate,
    league.day_of_week,
    handleDayOfWeekChange,
    bcaDateOptions,
    apaDateOptions,
    savedChampionshipPreferences
  );

  // Wrap setValue to trigger re-render
  const currentStepData = steps[currentStep] ? {
    ...steps[currentStep],
    setValue: (value: string) => {
      steps[currentStep]?.setValue(value);
      setRefreshKey(prev => prev + 1); // Trigger re-render
    }
  } : null;

  const handleNext = () => {
    // Clear previous validation error
    setValidationError(null);

    // If current step has a validator, run it
    const currentStepData = steps[currentStep];
    if (currentStepData?.validator) {
      const value = currentStepData.getValue();
      const result = currentStepData.validator(value);
      if (!result.isValid) {
        setValidationError(result.error || 'Invalid input');
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      localStorage.setItem(`season-wizard-step-${leagueId}`, newStep.toString());
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      localStorage.setItem(`season-wizard-step-${leagueId}`, newStep.toString());
      // Reset schedule generation flag when navigating away
      scheduleGeneratedForStep.current = null;
    }
  };

  /**
   * Save championship preference to operator_blackout_preferences table
   * Called after championship dates are submitted to database
   */
  const saveChampionshipPreference = async (
    organization: 'BCA' | 'APA',
    choice: string,
    championshipId?: string
  ) => {
    if (!operatorId) {
      console.warn('⚠️ No operator ID available - skipping preference save');
      return;
    }

    try {
      // Delete any existing preference for this organization
      await supabase
        .from('operator_blackout_preferences')
        .delete()
        .eq('operator_id', operatorId)
        .eq('preference_type', 'championship')
        .eq('championship_id', championshipId || null);

      // Determine what to save based on choice
      if (choice === 'ignore' || choice === 'skip') {
        // Check if future championship dates exist in database
        const { data: futureChampionships } = await supabase
          .from('championship_date_options')
          .select('id')
          .eq('organization', organization)
          .gte('end_date', new Date().toISOString().split('T')[0])
          .order('start_date', { ascending: true })
          .limit(1);

        if (futureChampionships && futureChampionships.length > 0) {
          // Dates exist - save "ignore" preference
          await supabase
            .from('operator_blackout_preferences')
            .insert({
              operator_id: operatorId,
              preference_type: 'championship',
              preference_action: 'ignore',
              championship_id: futureChampionships[0].id,
              auto_apply: false,
            });
          console.log(`✅ Saved ${organization} preference: ignore (dates available)`);
        } else {
          // No dates available - don't save preference (NULL state)
          console.log(`ℹ️ Skipping ${organization} preference save - no future dates available`);
        }
      } else if (championshipId) {
        // They selected a specific championship option or entered custom dates
        await supabase
          .from('operator_blackout_preferences')
          .insert({
            operator_id: operatorId,
            preference_type: 'championship',
            preference_action: 'blackout',
            championship_id: championshipId,
            auto_apply: false,
          });
        console.log(`✅ Saved ${organization} preference: blackout with ID ${championshipId}`);
      }
    } catch (err) {
      console.error(`❌ Error saving ${organization} preference:`, err);
      // Don't throw - preference saving is not critical to season creation
    }
  };

  const handleCreateSeason = async (destination: 'dashboard' | 'teams' = 'dashboard') => {
    setIsCreating(true);

    try {
      // Get form data from localStorage
      const STORAGE_KEY = `season-creation-${leagueId}`;
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        throw new Error('No form data found');
      }

      const formData: SeasonFormData = JSON.parse(stored);

      // Submit BCA championship dates to database if custom dates were entered
      let bcaSavedId: string | undefined;
      if (formData.bcaChoice === 'custom' && formData.bcaStartDate && formData.bcaEndDate) {
        console.log('🏆 Submitting BCA championship dates:', formData.bcaStartDate, 'to', formData.bcaEndDate);
        const bcaResult = await submitChampionshipDates('BCA', formData.bcaStartDate, formData.bcaEndDate);
        if (bcaResult) {
          console.log('✅ BCA championship dates saved successfully:', bcaResult);
          bcaSavedId = bcaResult.id;
        } else {
          console.error('❌ Failed to save BCA championship dates - check console for errors');
        }
      } else {
        console.log('ℹ️ Skipping BCA championship date submission:', {
          choice: formData.bcaChoice,
          hasStartDate: !!formData.bcaStartDate,
          hasEndDate: !!formData.bcaEndDate
        });
      }

      // Save BCA preference
      await saveChampionshipPreference(
        'BCA',
        formData.bcaChoice,
        bcaSavedId || (formData.bcaChoice !== 'custom' && formData.bcaChoice !== 'ignore' ? formData.bcaChoice : undefined)
      );

      // Submit APA championship dates to database if custom dates were entered
      let apaSavedId: string | undefined;
      if (formData.apaChoice === 'custom' && formData.apaStartDate && formData.apaEndDate) {
        console.log('🏆 Submitting APA championship dates:', formData.apaStartDate, 'to', formData.apaEndDate);
        const apaResult = await submitChampionshipDates('APA', formData.apaStartDate, formData.apaEndDate);
        if (apaResult) {
          console.log('✅ APA championship dates saved successfully:', apaResult);
          apaSavedId = apaResult.id;
        } else {
          console.error('❌ Failed to save APA championship dates - check console for errors');
        }
      } else {
        console.log('ℹ️ Skipping APA championship date submission:', {
          choice: formData.apaChoice,
          hasStartDate: !!formData.apaStartDate,
          hasEndDate: !!formData.apaEndDate
        });
      }

      // Save APA preference
      await saveChampionshipPreference(
        'APA',
        formData.apaChoice,
        apaSavedId || (formData.apaChoice !== 'custom' && formData.apaChoice !== 'ignore' ? formData.apaChoice : undefined)
      );

      // Calculate end date using timezone-safe parsing
      const startDate = parseLocalDate(formData.startDate);
      const endDate = calculateEndDate(startDate, parseInt(formData.seasonLength));

      // Generate season name
      const seasonName = generateSeasonName(
        startDate,
        formatDayOfWeek(league.day_of_week),
        formatGameType(league.game_type),
        league.division
      );

      // Build insert data (holidays and championships NOT stored - fetched on-demand)
      const insertData: SeasonInsertData = {
        league_id: leagueId,
        season_name: seasonName,
        start_date: formatDateForDB(startDate),
        end_date: formatDateForDB(endDate),
        season_length: parseInt(formData.seasonLength),
        status: 'upcoming',
      };

      console.log('🔄 Creating season:', insertData);
      console.log('🏆 Championship dates (not stored, baked into schedule):', {
        bca: formData.bcaIgnored ? 'ignored' : `${formData.bcaStartDate} - ${formData.bcaEndDate}`,
        apa: formData.apaIgnored ? 'ignored' : `${formData.apaStartDate} - ${formData.apaEndDate}`,
      });

      let seasonId: string | null = null;

      try {
        // Step 1: Insert season record
        const { data: newSeason, error: seasonError } = await supabase
          .from('seasons')
          .insert([insertData])
          .select()
          .single();

        if (seasonError) throw seasonError;

        seasonId = newSeason.id;
        console.log('✅ Season created:', seasonId);

        // Step 2: Get final schedule from state (already contains regular weeks + blackouts combined)
        // The ScheduleReview component manages the combination and passes us the complete schedule
        console.log('📦 Schedule state at save time:', {
          weekCount: schedule.length,
          byType: {
            regular: schedule.filter(w => w.type === 'regular').length,
            playoffs: schedule.filter(w => w.type === 'playoffs').length,
            'week-off': schedule.filter(w => w.type === 'week-off').length,
          },
          weeks: schedule.map(w => ({ weekNumber: w.weekNumber, weekName: w.weekName, date: w.date, type: w.type }))
        });

        // Map UI week types to database week_type values:
        // - 'regular' → 'regular'
        // - 'playoffs' → 'playoffs'
        // - 'week-off' with weekName containing specific strings → determine if 'season_end_break' or 'blackout'
        const allWeeks = schedule.map(week => {
          let weekType: 'regular' | 'playoffs' | 'blackout' | 'season_end_break';

          // Determine the correct database week_type for each UI type
          if (week.type === 'week-off') {
            // Season End Break has a specific name pattern
            if (week.weekName === 'Season End Break') {
              weekType = 'season_end_break';
            } else {
              // All other week-offs are blackouts (holidays, championships, custom reasons)
              weekType = 'blackout';
            }
          } else if (week.type === 'playoffs') {
            weekType = 'playoffs';
          } else {
            weekType = 'regular';
          }

          return {
            season_id: seasonId,
            scheduled_date: week.date,
            week_name: week.weekName,
            week_type: weekType,
            week_completed: false,
            notes: null,
          };
        });

        console.log('📊 Week insertion summary:', {
          totalWeeks: allWeeks.length,
          byType: {
            regular: allWeeks.filter(w => w.week_type === 'regular').length,
            playoffs: allWeeks.filter(w => w.week_type === 'playoffs').length,
            blackout: allWeeks.filter(w => w.week_type === 'blackout').length,
            season_end_break: allWeeks.filter(w => w.week_type === 'season_end_break').length,
          }
        });
        console.log('📅 Complete schedule to insert:', allWeeks);

        // Step 3: If editing existing season, delete old weeks first
        const existingSeasonId = searchParams.get('seasonId');
        if (existingSeasonId) {
          console.log('🗑️ Deleting old season_weeks for existing season:', existingSeasonId);
          const { error: deleteError } = await supabase
            .from('season_weeks')
            .delete()
            .eq('season_id', existingSeasonId);

          if (deleteError) {
            console.error('❌ Failed to delete old weeks:', deleteError);
            throw deleteError;
          }
          console.log('✅ Old weeks deleted successfully');
        }

        console.log('🔄 Inserting', allWeeks.length, 'weeks into season_weeks table');

        // Step 4: Batch insert all weeks
        const { error: weeksError } = await supabase
          .from('season_weeks')
          .insert(allWeeks);

        if (weeksError) {
          console.error('❌ Failed to insert weeks, rolling back season creation');
          throw weeksError;
        }

        console.log('✅ Season schedule saved:', allWeeks.length, 'weeks');
      } catch (weeksInsertError) {
        // Rollback: Delete the season if weeks insertion failed
        if (seasonId) {
          console.log('🔄 Rolling back - deleting season:', seasonId);
          await supabase.from('seasons').delete().eq('id', seasonId);
          console.log('✅ Rollback complete - season deleted');
        }
        throw weeksInsertError;
      }

      // Clear localStorage
      clearSeasonCreationData(leagueId);
      localStorage.removeItem('season-schedule-review');
      localStorage.removeItem('season-blackout-weeks');

      // Navigate based on user's choice
      if (destination === 'teams' && seasonId) {
        // Navigate to team management page for the new season
        console.log('🎯 Navigating to team management with seasonId:', seasonId);
        navigate(`/league/${leagueId}/manage-teams?seasonId=${seasonId}`);
      } else {
        // Navigate back to league detail page (dashboard view)
        navigate(`/league/${leagueId}`);
      }
    } catch (err) {
      console.error('Error creating season:', err);
      setError(err instanceof Error ? err.message : 'Failed to create season');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className={`container mx-auto px-4 ${steps[currentStep]?.type === 'schedule-review' ? 'max-w-6xl' : 'max-w-2xl'}`}>
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/league/${leagueId}`)}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to League
          </Button>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Create {hasExistingSeasons ? 'New' : 'First'} Season
              </h1>
              <p className="text-gray-600 mt-2">
                {formatDayOfWeek(league.day_of_week)} {formatGameType(league.game_type)}
                {league.division && ` ${league.division}`}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm('Clear all form data and start over?')) {
                  clearSeasonCreationData(leagueId);
                  localStorage.removeItem('season-schedule-review');
                  localStorage.removeItem('season-blackout-weeks');
                  window.location.reload();
                }
              }}
              className="text-red-600 hover:text-red-800"
            >
              Clear Form
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <WizardProgress currentStep={currentStep} totalSteps={steps.length} />

        {/* Season Status Card - Shows configured data and allows editing */}
        {(() => {
          const STORAGE_KEY = `season-creation-${leagueId}`;
          const stored = localStorage.getItem(STORAGE_KEY);
          if (!stored) return null;

          const formData: SeasonFormData = JSON.parse(stored);

          return (
            <SeasonStatusCard
              startDate={formData.startDate}
              seasonLength={parseInt(formData.seasonLength) || undefined}
              bcaStartDate={formData.bcaStartDate}
              bcaEndDate={formData.bcaEndDate}
              bcaIgnored={formData.bcaIgnored}
              apaStartDate={formData.apaStartDate}
              apaEndDate={formData.apaEndDate}
              apaIgnored={formData.apaIgnored}
              onEdit={handleEdit}
            />
          );
        })()}

        {/* Guard against missing step data */}
        {!currentStepData ? (
          <div className="text-center text-gray-600">Loading step...</div>
        ) : steps[currentStep]?.type === 'schedule-review' ? (
          <ScheduleReview
            schedule={schedule}
            leagueDayOfWeek={formatDayOfWeek(league?.day_of_week || 'tuesday')}
            seasonStartDate={seasonStartDate}
            holidays={holidays}
            bcaChampionship={bcaChampionship}
            apaChampionship={apaChampionship}
            currentPlayWeek={0} // New season hasn't started yet - all weeks are editable. TODO: For existing seasons, fetch from database
            onScheduleChange={handleScheduleChange}
            onConfirm={handleCreateSeason}
            onBack={handleBack}
          />
        ) : (
          <>
            {/* Step Content */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
              {/* Title and subtitle (hidden for dual-date steps which render their own) */}
              {currentStepData.type !== 'dual-date' && (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {currentStepData.title}
              </h2>
              {currentStepData.subtitle && (
                <p className="text-gray-600 mb-6">{currentStepData.subtitle}</p>
              )}
            </>
          )}

          {/* Render step based on type */}
          {currentStepData.type === 'date' && (
            <Calendar
              value={currentStepData.getValue()}
              onChange={(value) => currentStepData.setValue(value)}
              placeholder="Select date"
            />
          )}

          {currentStepData.type === 'choice' && currentStepData.choices && (
            <SimpleRadioChoice
              title=""
              subtitle=""
              choices={currentStepData.choices}
              selectedValue={currentStepData.getValue()}
              onSelect={(value) => currentStepData.setValue(value)}
              infoTitle={currentStepData.infoTitle}
              infoContent={currentStepData.infoContent}
              infoLabel={currentStepData.infoLabel}
            />
          )}

          {currentStepData.type === 'input' && (
            <div className="space-y-4">
              <Input
                type={currentStepData.inputType || 'text'}
                min={currentStepData.min}
                max={currentStepData.max}
                value={currentStepData.getValue()}
                onChange={(e) => {
                  currentStepData.setValue(e.target.value);
                  setValidationError(null); // Clear error on input change
                }}
                placeholder={currentStepData.placeholder}
                className="text-lg"
              />
              {validationError && (
                <p className="text-red-600 text-sm">{validationError}</p>
              )}
            </div>
          )}

          {/* Championship Date Steps (BCA and APA) */}
          {currentStepData.type === 'dual-date' && (
            <DualDateStep
              title={currentStepData.title}
              subtitle={currentStepData.subtitle}
              startValue={currentStepData.getValue().split('|')[0] || ''}
              endValue={currentStepData.getValue().split('|')[1] || ''}
              onStartChange={(value) => {
                const endValue = currentStepData.getValue().split('|')[1] || '';
                currentStepData.setValue(`${value}|${endValue}`);
              }}
              onEndChange={(value) => {
                const startValue = currentStepData.getValue().split('|')[0] || '';
                currentStepData.setValue(`${startValue}|${value}`);
              }}
              onNext={handleNext}
              onPrevious={handleBack}
              canGoBack={currentStep > 0}
              isLastQuestion={currentStep === steps.length - 1}
              infoTitle={currentStepData.infoTitle}
              infoContent={currentStepData.infoContent}
              infoLabel={currentStepData.infoLabel}
            />
          )}
            </div>

            {/* Navigation Buttons (hidden for dual-date and schedule-review steps which have their own buttons) */}
            {!(steps[currentStep]?.type === 'dual-date' || (steps[currentStep]?.type as string) === 'schedule-review') && (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0 || isCreating}
                >
                  Back
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button onClick={handleNext} disabled={isCreating}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleCreateSeason('dashboard')}
                    disabled={isCreating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isCreating ? 'Creating Season...' : 'Create Season'}
                  </Button>
                )}
              </div>
            )}
          </>
        )
        }

        {/* Warning Modal for Day of Week Changes */}
        {dayOfWeekWarning && (
          <DayOfWeekWarningModal
            isOpen={dayOfWeekWarning.show}
            oldDay={dayOfWeekWarning.oldDay}
            newDay={dayOfWeekWarning.newDay}
            onAccept={handleAcceptDayChange}
            onCancel={handleCancelDayChange}
          />
        )}
      </div>
    </div>
  );
};
