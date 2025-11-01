/**
 * @fileoverview Season Creation Wizard
 *
 * Multi-step wizard for creating a new season for a league.
 * Uses localStorage for form persistence across page refreshes.
 */
import { useEffect, useCallback, useReducer } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { useOperatorIdValue } from '@/api/hooks';
import { useScheduleGeneration } from '@/hooks/useScheduleGeneration';
import { useChampionshipAutoFill } from '@/hooks/useChampionshipAutoFill';
import { fetchChampionshipPreferences } from '@/services/championshipService';
import { createSeason } from '@/services/seasonService';
import { updateLeagueDayOfWeek } from '@/services/leagueService';
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
import { getSeasonWizardSteps, clearSeasonCreationData, type SeasonFormData } from '@/data/seasonWizardSteps';
import { fetchChampionshipDateOptions } from '@/utils/tournamentUtils';
import type { WeekEntry } from '@/types/season';
import { formatGameType, formatDayOfWeek } from '@/types/league';

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
  const operatorId = useOperatorIdValue();

  // Centralized state management with useReducer
  const [state, dispatch] = useReducer(wizardReducer, createInitialState(leagueId));

  /**
   * Callback to handle schedule updates from ScheduleReview component
   * Wrapped in useCallback to prevent infinite loops in ScheduleReview's useEffect
   * The dispatch function is stable, so this callback won't cause unnecessary re-renders
   */
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
    dispatch({ type: 'SET_SCHEDULE', payload: newSchedule });
  }, [dispatch]);

  /**
   * Fetch league and existing seasons
   * If seasonId query param exists, we're editing an existing season
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!leagueId) {
        dispatch({ type: 'SET_ERROR', payload: 'No league ID provided' });
        dispatch({ type: 'SET_LOADING', payload: false });
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
        dispatch({ type: 'SET_LEAGUE', payload: leagueData });

        // Fetch championship date options for both BCA and APA
        const bcaDates = await fetchChampionshipDateOptions('BCA');
        dispatch({ type: 'SET_BCA_DATE_OPTIONS', payload: bcaDates });

        const apaDates = await fetchChampionshipDateOptions('APA');
        dispatch({ type: 'SET_APA_DATE_OPTIONS', payload: apaDates });

        // Fetch operator's saved championship preferences to skip those steps in wizard
        const prefs = await fetchChampionshipPreferences(operatorId);
        dispatch({ type: 'SET_SAVED_CHAMPIONSHIP_PREFERENCES', payload: prefs });

        // If editing existing season, load season data and jump to schedule review
        if (seasonId) {
          console.log('📝 Edit mode - loading season:', seasonId);
          dispatch({ type: 'SET_IS_EDITING_EXISTING_SEASON', payload: true });

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
          dispatch({ type: 'SET_EXISTING_SEASONS', payload: [seasonData] });
        } else {
          // Creating new season
          dispatch({ type: 'SET_EXISTING_SEASONS', payload: [] });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load league information' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    fetchData();
  }, [leagueId, searchParams, operatorId]);

  /**
   * Load existing season data into wizard when editing
   * User can navigate through all steps to make changes
   */
  useEffect(() => {
    if (!state.league || !leagueId || state.loading || !state.isEditingExistingSeason) return;

    // TODO: Load season data into localStorage to populate wizard fields
    // For now, user will start at step 0 and can navigate through all steps
    console.log('📝 Edit mode: User can navigate through wizard steps to edit season');
  }, [state.league, leagueId, state.loading, state.isEditingExistingSeason]);

  // Calculate step data for hooks - safe to do before guards since we handle null cases
  const hasExistingSeasons = state.existingSeasons.length > 0;
  const defaultStartDate = hasExistingSeasons ? undefined : state.league?.league_start_date;

  /**
   * Callback triggered when user changes start date to a different day of week
   * Shows warning modal explaining that league will be updated
   */
  const handleDayOfWeekChange = (newDay: string, newDate: string) => {
    if (!state.league) return;

    dispatch({
      type: 'SET_DAY_OF_WEEK_WARNING',
      payload: {
        show: true,
        oldDay: formatDayOfWeek(state.league.day_of_week),
        newDay,
        newDate,
      }
    });
  };

  const steps = getSeasonWizardSteps(
    leagueId || '',
    hasExistingSeasons,
    defaultStartDate,
    state.league?.day_of_week || 'tuesday',
    handleDayOfWeekChange,
    state.bcaDateOptions,
    state.apaDateOptions,
    state.savedChampionshipPreferences
  );

  // Wrap setValue to trigger re-render
  const currentStepData = steps[state.currentStep] ? {
    ...steps[state.currentStep],
    setValue: (value: string) => {
      steps[state.currentStep]?.setValue(value);
      dispatch({ type: 'INCREMENT_REFRESH_KEY' }); // Trigger re-render
    }
  } : null;

  /**
   * Schedule generation hook
   * Handles loading schedule from localStorage or generating fresh schedule
   * Only runs when reaching schedule-review step
   * MUST be called before loading guard to satisfy Rules of Hooks
   */
  useScheduleGeneration({
    currentStep: state.currentStep,
    isScheduleReviewStep: currentStepData?.type === 'schedule-review',
    league: state.league,
    leagueId,
    loading: state.loading,
    operatorId,
    existingSeasons: state.existingSeasons,
    bcaDateOptions: state.bcaDateOptions,
    apaDateOptions: state.apaDateOptions,
    savedChampionshipPreferences: state.savedChampionshipPreferences,
    onScheduleUpdate: (schedule) => dispatch({ type: 'SET_SCHEDULE', payload: schedule }),
    onSeasonStartDateUpdate: (date) => dispatch({ type: 'SET_SEASON_START_DATE', payload: date }),
    onHolidaysUpdate: (holidays) => dispatch({ type: 'SET_HOLIDAYS', payload: holidays }),
    onBcaChampionshipUpdate: (champ) => dispatch({ type: 'SET_BCA_CHAMPIONSHIP', payload: champ }),
    onApaChampionshipUpdate: (champ) => dispatch({ type: 'SET_APA_CHAMPIONSHIP', payload: champ }),
  });

  /**
   * Championship auto-fill hook
   * Auto-populates and auto-advances BCA/APA steps when saved preferences exist
   * Creates a seamless "breeze through" experience for operators
   * MUST be called before loading guard to satisfy Rules of Hooks
   */
  useChampionshipAutoFill({
    currentStep: state.currentStep,
    leagueId,
    loading: state.loading,
    league: state.league,
    savedChampionshipPreferences: state.savedChampionshipPreferences,
    existingSeasons: state.existingSeasons,
    bcaDateOptions: state.bcaDateOptions,
    apaDateOptions: state.apaDateOptions,
    onStepChange: (step) => {
      dispatch({ type: 'SET_CURRENT_STEP', payload: step });
      if (leagueId) {
        localStorage.setItem(`season-wizard-step-${leagueId}`, step.toString());
      }
    },
  });

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (state.error || !state.league || !leagueId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-red-600 text-lg font-semibold mb-4">Error</h3>
            <p className="text-gray-700 mb-4">{state.error || 'League not found'}</p>
            <Button onClick={() => navigate('/operator-dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /**
   * User accepted the day of week change
   * Updates the league and saves the new date
   */
  const handleAcceptDayChange = async () => {
    if (!state.dayOfWeekWarning || !leagueId) return;

    try {
      // Update league day of week using service
      const newDayString = await updateLeagueDayOfWeek(leagueId, state.dayOfWeekWarning.newDay);

      // Update local state
      dispatch({
        type: 'SET_LEAGUE',
        payload: state.league ? { ...state.league, day_of_week: newDayString } : null
      });

      // Save the new start date to form data
      const STORAGE_KEY = `season-creation-${leagueId}`;
      const stored = localStorage.getItem(STORAGE_KEY);
      const formData = stored ? JSON.parse(stored) : {};
      formData.startDate = state.dayOfWeekWarning.newDate;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));

      // Close modal
      dispatch({ type: 'SET_DAY_OF_WEEK_WARNING', payload: null });
    } catch (err) {
      console.error('Error updating league day:', err);
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to update league day of week' });
    }
  };

  /**
   * User cancelled the day of week change
   * Revert to the original date
   */
  const handleCancelDayChange = () => {
    // Just close the modal - the date wasn't saved
    dispatch({ type: 'SET_DAY_OF_WEEK_WARNING', payload: null });
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
    dispatch({ type: 'SET_CURRENT_STEP', payload: targetStep });
    localStorage.setItem(`season-wizard-step-${leagueId}`, targetStep.toString());
  };

  const handleNext = () => {
    // Clear previous validation error
    dispatch({ type: 'SET_VALIDATION_ERROR', payload: null });

    // If current step has a validator, run it
    const currentStepData = steps[state.currentStep];
    if (currentStepData?.validator) {
      const value = currentStepData.getValue();
      const result = currentStepData.validator(value);
      if (!result.isValid) {
        dispatch({ type: 'SET_VALIDATION_ERROR', payload: result.error || 'Invalid input' });
        return;
      }
    }

    if (state.currentStep < steps.length - 1) {
      const newStep = state.currentStep + 1;
      dispatch({ type: 'SET_CURRENT_STEP', payload: newStep });
      localStorage.setItem(`season-wizard-step-${leagueId}`, newStep.toString());
    }
  };

  const handleBack = () => {
    dispatch({ type: 'SET_VALIDATION_ERROR', payload: null });
    if (state.currentStep > 0) {
      const newStep = state.currentStep - 1;
      dispatch({ type: 'SET_CURRENT_STEP', payload: newStep });
      localStorage.setItem(`season-wizard-step-${leagueId}`, newStep.toString());
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
    if (!state.league || !leagueId) return;

    dispatch({ type: 'SET_IS_CREATING', payload: true });

    try {
      // Get form data from localStorage
      const STORAGE_KEY = `season-creation-${leagueId}`;
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        throw new Error('No form data found');
      }

      const formData: SeasonFormData = JSON.parse(stored);
      const existingSeasonId = searchParams.get('seasonId');

      // Create season using service
      const { seasonId } = await createSeason({
        leagueId,
        league: state.league,
        formData,
        schedule: state.schedule,
        operatorId,
        existingSeasonId,
        onSavePreference: saveChampionshipPreference,
      });

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
      dispatch({ type: 'SET_ERROR', payload: err instanceof Error ? err.message : 'Failed to create season' });
    } finally {
      dispatch({ type: 'SET_IS_CREATING', payload: false });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className={`container mx-auto px-4 ${steps[state.currentStep]?.type === 'schedule-review' ? 'max-w-6xl' : 'max-w-2xl'}`}>
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
                {formatDayOfWeek(state.league.day_of_week)} {formatGameType(state.league.game_type)}
                {state.league.division && ` ${state.league.division}`}
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
        <WizardProgress currentStep={state.currentStep} totalSteps={steps.length} />

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
        ) : steps[state.currentStep]?.type === 'schedule-review' ? (
          <ScheduleReview
            schedule={state.schedule}
            leagueDayOfWeek={formatDayOfWeek(state.league?.day_of_week || 'tuesday')}
            seasonStartDate={state.seasonStartDate}
            holidays={state.holidays}
            bcaChampionship={state.bcaChampionship}
            apaChampionship={state.apaChampionship}
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
                  dispatch({ type: 'SET_VALIDATION_ERROR', payload: null }); // Clear error on input change
                }}
                placeholder={currentStepData.placeholder}
                className="text-lg"
              />
              {state.validationError && (
                <p className="text-red-600 text-sm">{state.validationError}</p>
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
              canGoBack={state.currentStep > 0}
              isLastQuestion={state.currentStep === steps.length - 1}
              infoTitle={currentStepData.infoTitle}
              infoContent={currentStepData.infoContent}
              infoLabel={currentStepData.infoLabel}
            />
          )}
            </div>

            {/* Navigation Buttons (hidden for dual-date and schedule-review steps which have their own buttons) */}
            {!(steps[state.currentStep]?.type === 'dual-date' || (steps[state.currentStep]?.type as string) === 'schedule-review') && (
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={state.currentStep === 0 || state.isCreating}
                >
                  Back
                </Button>

                {state.currentStep < steps.length - 1 ? (
                  <Button onClick={handleNext} disabled={state.isCreating}>
                    Next
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleCreateSeason('dashboard')}
                    disabled={state.isCreating}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {state.isCreating ? 'Creating Season...' : 'Create Season'}
                  </Button>
                )}
              </div>
            )}
          </>
        )
        }

        {/* Warning Modal for Day of Week Changes */}
        {state.dayOfWeekWarning && (
          <DayOfWeekWarningModal
            isOpen={state.dayOfWeekWarning.show}
            oldDay={state.dayOfWeekWarning.oldDay}
            newDay={state.dayOfWeekWarning.newDay}
            onAccept={handleAcceptDayChange}
            onCancel={handleCancelDayChange}
          />
        )}
      </div>
    </div>
  );
};
