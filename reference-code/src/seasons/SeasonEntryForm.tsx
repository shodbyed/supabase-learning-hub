import { useContext, useEffect, useState } from 'react';
import { SelectedItemContext } from '../context/SelectedItemProvider';
// components
import ReactDatePicker from 'react-datepicker';
import { LeagueDates } from './LeagueDates';
import { FormSelect } from './FormSelect';

// utilities
import {
  convertDateToTimestamp,
  getSeasonEndDate,
} from '../assets/dateFunctions';
import { buildSeasonName, fetchHolidays } from '../assets/globalFunctions';
import {
  games,
  poolHalls,
  bcaWebsite,
  apaWebsite,
  daysOfTheWeek,
  notDate,
} from '../assets/globalVariables';

// form
import { useForm } from 'react-hook-form';
import { seasonSchema } from './schema';
import { yupResolver } from '@hookform/resolvers/yup';

//css
import './seasons.css';
import 'react-datepicker/dist/react-datepicker.css';

// firebase
// import { useAddSeason, useFetchSeasons } from "bca--firebase-queries";
import { useAddSeason } from '../hooks/seasonUpdateHooks';
import { useFetchSeasons } from '../hooks/seasonFetchHooks';

// types
import { FormValues } from './seasonTypes';
import { Season, Holiday } from '../assets/typesFolder/seasonTypes';
import { PoolHall, Game } from '../assets/typesFolder/sharedTypes';

export type IgnoreDatesType = {
  apa: boolean;
  bca: boolean;
};

type SeasonEntryFormProps = {
  seasonData: Season;
  setSeasonData: (data: Season) => void;
  bcaEvent: Holiday;
  setBcaEvent: (date: Holiday) => void;
  apaEvent: Holiday;
  setApaEvent: (date: Holiday) => void;
};

export const SeasonEntryForm: React.FC<SeasonEntryFormProps> = ({
  seasonData,
  setSeasonData,
  bcaEvent,
  setBcaEvent,
  apaEvent,
  setApaEvent,
}) => {
  const { setSelectedSeason } = useContext(SelectedItemContext);

  const { addSeason } = useAddSeason();
  {
    /*
--WAS IN USE ADD SEASON HOOK--
    useToast: true,
    successToastLength: 6000,
    successMessage:
      "\nSeason added successfully!\n\n You can now create another season or press the teams link to add teams to the created seasons",
*/
  }
  const { refetch: refetchSeasons } = useFetchSeasons();
  const [ignoreDates, setIgnoreDates] = useState<IgnoreDatesType>({
    apa: false,
    bca: false,
  });
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(seasonSchema),
    context: { ignoreDates: ignoreDates },
  });

  useEffect(() => {
    register('startDate');
    register('bcaStartDate');
    register('bcaEndDate');
    register('apaStartDate');
    register('apaEndDate');
  }, [register]);

  const handleDateChange = (
    event: 'bca' | 'apa',
    position: 'Start' | 'End',
    value: Date
  ) => {
    setValue(`${event}${position}Date`, value);
    const setter = event === 'bca' ? setBcaEvent : setApaEvent;
    const object = event === 'bca' ? bcaEvent : apaEvent;
    const key = position.toLowerCase();
    const newObject = {
      ...object,
      [key]: value,
    };
    setter(newObject);
  };

  const handleStartDateChange = (newValue: Date) => {
    // update form
    setValue('startDate', newValue);
    // things to update
    const startDate = convertDateToTimestamp(newValue);
    const endDate = getSeasonEndDate(startDate, seasonData.seasonLength);
    const night = daysOfTheWeek[newValue.getDay()];
    const holidays = fetchHolidays(newValue);
    const seasonName = buildSeasonName(
      newValue,
      seasonData.poolHall,
      seasonData.game
    );
    const updatedData: Season = {
      ...seasonData,
      startDate,
      seasonName,
      endDate,
      night,
      holidays,
    };
    setSeasonData(updatedData);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const noop = (_: unknown) => {
    // The noop function is a no-operation placeholder.
    // It's used here to acknowledge the reception of 'data' which is necessary for form validation.
    // This approach avoids TypeScript's unused variable warning without affecting the functionality.
  };

  const onSubmit = async (data: FormValues) => {
    // Although 'data' is not directly used, it's required for form validation.
    // Passing 'data' to noop() to indicate its intentional presence.
    noop(data);
    // Add holidays to seasonData
    const updatedSeasonData = {
      ...seasonData,
      holidays: [...seasonData.holidays, bcaEvent, apaEvent],
    };
    // Add season doc to firebase
    addSeason(updatedSeasonData.seasonName, updatedSeasonData);

    // Clean up: sets the new season to selectedSeason, fetches seasons again and resets the form
    setSelectedSeason(updatedSeasonData);
    refetchSeasons();
    reset();
  };

  const handleStringChange = (
    fieldName: 'poolHall' | 'game',
    newValue: string
  ) => {
    setValue(fieldName, newValue as PoolHall | Game);

    // Create a new seasonData object with the updated field value
    const newSeasonName = buildSeasonName(
      seasonData.startDate,
      fieldName === 'poolHall' ? (newValue as PoolHall) : seasonData.poolHall,
      fieldName === 'game' ? (newValue as Game) : seasonData.game
    );

    const updatedData: Season = {
      ...seasonData,
      seasonName: newSeasonName,
      [fieldName]: newValue, // Dynamically update the field based on fieldName
    };

    // Directly set the new seasonData state
    setSeasonData(updatedData);
  };

  const handleSeasonLengthChange = (newValue: number) => {
    setValue('seasonLength', newValue);
    const startDate = convertDateToTimestamp(watch('startDate'));
    const endDate = getSeasonEndDate(startDate, newValue);
    const updatedData: Season = {
      ...seasonData,
      seasonLength: newValue,
      endDate: endDate === notDate ? seasonData.endDate : endDate,
    };
    setSeasonData(updatedData);
  };

  return (
    <div className="form-container">
      <div className="season-title">Build a Season</div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label htmlFor="startDate">Start Date: </label>
          <ReactDatePicker
            className="form-input"
            selected={watch('startDate')}
            onChange={(date: Date) => handleStartDateChange(date)}
          />
          {errors.startDate && (
            <span className="error-message">{errors.startDate.message}</span>
          )}
        </div>
        <FormSelect
          label="Weeks"
          fieldName="seasonLength"
          register={register}
          //choices={Array.from({ length: 21 }, (_, i) => String(i + 10))}
          choices={Array.from({ length: 21 }, (_, index) => index + 10)}
          onChange={(e) => handleSeasonLengthChange(Number(e.target.value))}
          errorMessage={errors.game && errors.game.message}
          defaultValue={'16'}
        />
        <FormSelect
          label="Game"
          fieldName="game"
          register={register}
          choices={games}
          onChange={(e) => handleStringChange('game', e.target.value)}
          errorMessage={errors.game && errors.game.message}
        />
        <FormSelect
          label="Pool Hall"
          fieldName="poolHall"
          register={register}
          choices={poolHalls}
          onChange={(e) => handleStringChange('poolHall', e.target.value)}
          errorMessage={errors.poolHall && errors.poolHall.message}
        />

        <LeagueDates
          league="bca"
          startDate={
            bcaEvent.start instanceof Date ? bcaEvent.start : new Date()
          }
          endDate={bcaEvent.end instanceof Date ? bcaEvent.end : new Date()}
          onStartChange={(date: Date) => handleDateChange('bca', 'Start', date)}
          onEndChange={(date: Date) => handleDateChange('bca', 'End', date)}
          website={bcaWebsite}
          startError={errors.bcaStartDate?.message}
          endError={errors.bcaEndDate?.message}
          setIgnoreDates={setIgnoreDates}
        />
        <LeagueDates
          league="apa"
          startDate={
            apaEvent.start instanceof Date ? apaEvent.start : new Date()
          }
          endDate={apaEvent.end instanceof Date ? apaEvent.end : new Date()}
          onStartChange={(date: Date) => handleDateChange('apa', 'Start', date)}
          onEndChange={(date: Date) => handleDateChange('apa', 'End', date)}
          website={apaWebsite}
          startError={errors.apaStartDate?.message}
          endError={errors.apaEndDate?.message}
          setIgnoreDates={setIgnoreDates}
        />

        <div className="submit-button-container">
          <button type="submit">Create Season</button>
        </div>
      </form>
    </div>
  );
};
