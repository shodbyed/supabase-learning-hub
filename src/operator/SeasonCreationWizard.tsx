/**
 * @fileoverview Season Creation Wizard
 *
 * Multi-step wizard for creating a new season for a league.
 * Uses localStorage for form persistence across page refreshes.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabaseClient';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { WizardProgress } from '@/components/forms/WizardProgress';
import { DayOfWeekWarningModal } from '@/components/modals/DayOfWeekWarningModal';
import { DualDateStep } from '@/components/forms/DualDateStep';
import { SimpleRadioChoice } from '@/components/forms/SimpleRadioChoice';
import { getSeasonWizardSteps, clearSeasonCreationData, type SeasonFormData } from '@/data/seasonWizardSteps';
import { fetchChampionshipDateOptions, submitChampionshipDates, type ChampionshipDateOption } from '@/utils/tournamentUtils';
import type { League } from '@/types/league';
import type { Season, SeasonInsertData } from '@/types/season';
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

  const [league, setLeague] = useState<League | null>(null);
  const [existingSeasons, setExistingSeasons] = useState<Season[]>([]);
  const [bcaDateOptions, setBcaDateOptions] = useState<ChampionshipDateOption[]>([]);
  const [apaDateOptions, setApaDateOptions] = useState<ChampionshipDateOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(() => {
    // Restore current step from localStorage
    const stored = localStorage.getItem(`season-wizard-step-${leagueId}`);
    return stored ? parseInt(stored, 10) : 0;
  });
  const [isCreating, setIsCreating] = useState(false);
  const [_refreshKey, setRefreshKey] = useState(0); // Force re-render when form data changes
  const [validationError, setValidationError] = useState<string | null>(null);
  const [dayOfWeekWarning, setDayOfWeekWarning] = useState<{
    show: boolean;
    oldDay: string;
    newDay: string;
    newDate: string;
  } | null>(null);

  /**
   * Fetch league and existing seasons
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!leagueId) {
        setError('No league ID provided');
        setLoading(false);
        return;
      }

      try {
        // Fetch league
        const { data: leagueData, error: leagueError } = await supabase
          .from('leagues')
          .select('*')
          .eq('id', leagueId)
          .single();

        if (leagueError) throw leagueError;
        setLeague(leagueData);

        // TODO: Fetch existing seasons once seasons table exists
        // const { data: seasonsData, error: seasonsError } = await supabase
        //   .from('seasons')
        //   .select('*')
        //   .eq('league_id', leagueId)
        //   .order('start_date', { ascending: false });
        //
        // if (seasonsError) throw seasonsError;
        // setExistingSeasons(seasonsData || []);

        // For now, simulate no existing seasons
        setExistingSeasons([]);

        // Fetch championship date options for both BCA and APA
        const bcaDates = await fetchChampionshipDateOptions('BCA');
        setBcaDateOptions(bcaDates);

        const apaDates = await fetchChampionshipDateOptions('APA');
        setApaDateOptions(apaDates);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load league information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId]);

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

  const steps = getSeasonWizardSteps(
    leagueId,
    hasExistingSeasons,
    defaultStartDate,
    league.day_of_week,
    handleDayOfWeekChange,
    bcaDateOptions,
    apaDateOptions
  );

  // Wrap setValue to trigger re-render
  const currentStepData = {
    ...steps[currentStep],
    setValue: (value: string) => {
      steps[currentStep].setValue(value);
      setRefreshKey(prev => prev + 1); // Trigger re-render
    }
  };

  const handleNext = () => {
    // Clear previous validation error
    setValidationError(null);

    // If current step has a validator, run it
    const currentStepData = steps[currentStep];
    if (currentStepData.validator) {
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
    }
  };

  const handleCreateSeason = async () => {
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
      if (formData.bcaChoice === 'custom' && formData.bcaStartDate && formData.bcaEndDate) {
        await submitChampionshipDates('BCA', formData.bcaStartDate, formData.bcaEndDate);
      }

      // Submit APA championship dates to database if custom dates were entered
      if (formData.apaChoice === 'custom' && formData.apaStartDate && formData.apaEndDate) {
        await submitChampionshipDates('APA', formData.apaStartDate, formData.apaEndDate);
      }

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

      // Build insert data
      const insertData: SeasonInsertData = {
        league_id: leagueId,
        season_name: seasonName,
        start_date: formatDateForDB(startDate),
        end_date: formatDateForDB(endDate),
        season_length: parseInt(formData.seasonLength),
        status: 'upcoming',
        bca_championship: formData.bcaIgnored || !formData.bcaStartDate || !formData.bcaEndDate
          ? undefined
          : {
              start: formData.bcaStartDate,
              end: formData.bcaEndDate,
              ignored: formData.bcaIgnored,
            },
        apa_championship: formData.apaIgnored || !formData.apaStartDate || !formData.apaEndDate
          ? undefined
          : {
              start: formData.apaStartDate,
              end: formData.apaEndDate,
              ignored: formData.apaIgnored,
            },
        // TODO: Fetch and add holidays when we have that functionality
        holidays: [],
      };

      console.log('Creating season:', insertData);

      // TODO: Uncomment when seasons table exists
      // const { data: newSeason, error } = await supabase
      //   .from('seasons')
      //   .insert([insertData])
      //   .select()
      //   .single();
      //
      // if (error) throw error;
      //
      // console.log('✅ Season created successfully:', newSeason);

      // Clear localStorage
      clearSeasonCreationData(leagueId);

      // Navigate back to league detail page
      navigate(`/league/${leagueId}`);
    } catch (err) {
      console.error('Error creating season:', err);
      setError(err instanceof Error ? err.message : 'Failed to create season');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/league/${leagueId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to League
          </button>
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
            <button
              onClick={() => {
                if (confirm('Clear all form data and start over?')) {
                  clearSeasonCreationData(leagueId);
                  window.location.reload();
                }
              }}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Clear Form
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <WizardProgress currentStep={currentStep} totalSteps={steps.length} />

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
              <input
                type={currentStepData.inputType || 'text'}
                min={currentStepData.min}
                max={currentStepData.max}
                value={currentStepData.getValue()}
                onChange={(e) => {
                  currentStepData.setValue(e.target.value);
                  setValidationError(null); // Clear error on input change
                }}
                placeholder={currentStepData.placeholder}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
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

        {/* Navigation Buttons (hidden for dual-date steps which have their own buttons) */}
        {currentStepData.type !== 'dual-date' && (
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
                onClick={handleCreateSeason}
                disabled={isCreating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isCreating ? 'Creating Season...' : 'Create Season'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
