/*
// hooks
import { useContext, useState } from "react";

// components
import { SeasonList } from "../seasons/SeasonList";
import { TeamOrder } from "./TeamOrder";
import { CreateMatches } from "./CreateMatches";
// import { FinishedMatches } from './FinishedMatches';
import { SetTeamsInSchedule } from "./SetTeamsInSchedule";
// import { ErrorAndRefetch } from '../components/ErrorAndRefetch';

// context
import { SelectedItemContext } from "../context/SelectedItemProvider";

// firebase
import {
  useFetchTeamsFromSeason,
  useFetchFinishedRoundRobin,
  useFetchRoundRobin,
} from "bca-firebase-queries";
import {
  RoundRobinSchedule,
  RoundRobinScheduleFinished,
} from "../assets/typesFolder/matchupTypes";
// import { useFetchTeamsFromSeason } from '../hooks/teamFetchHooks';
// import {
//   useFetchFinishedRoundRobin,
//   useFetchRoundRobin,
// } from '../assets/unused/matchupFetchHooks';

// types
import { Team } from "../assets/typesFolder/teamTypes";

// styles
import "./matchups.css";
//import { useStateUpdater } from '../assets/useStateUpdater';
 */

export const MatchUps = () => {};
/*
  // state
  const [teamOrder, setTeamOrder] = useState<Team[]>([]);
  const [modifiedSchedule, setModifiedSchedule] = useState<
    RoundRobinSchedule | RoundRobinScheduleFinished | null
  >(null);
  const { selectedSeason } = useContext(SelectedItemContext);
  const {
    data: teams,
    isLoading: isLoadingTeams,
    //  state: teamOrder,
    //  setState: setTeamOrder,
    //  error: errorTeams,
    //  refetch: fetchTeams,
  } = useFetchTeamsFromSeason(selectedSeason?.id);

  const {
    data: initialSchedule,
    // isLoading: isLoadingInitialSchedule,
    // error: errorInitialSchedule,
    // refetch: fetchRoundRobin,
  } = useFetchRoundRobin(teams?.length);

  const {
    // data: finishedSchedule,
    isLoading: isLoadingFinishedSchedule,
    // error: errorFinishedSchedule,
    // refetch: fetchFinishedRoundRobin,
  } = useFetchFinishedRoundRobin(selectedSeason?.id);

  //useStateUpdater(teams, setTeamOrder);
  // loading handling
  if (isLoadingTeams || isLoadingFinishedSchedule) {
    return <div>Loading...</div>;
  }

  // error handling
  // const errors = [
  //   { error: errorTeams, refetch: fetchTeams },
  //   { error: errorFinishedSchedule, refetch: fetchFinishedRoundRobin },
  // ];

  // const activeError = errors.find(error => error.error instanceof Error);
  // if (activeError instanceof Error) {
  //   return (
  //     <ErrorAndRefetch
  //       error={activeError.error as Error}
  //       onRetry={activeError.refetch}
  //     />
  //   );
  // }

  return (
    <div className="container">
      <div className="match-lists">
        <SeasonList />
        <TeamOrder
          teams={teams as Team[]}
          teamOrder={teamOrder}
          setTeamOrder={setTeamOrder}
        />
        <SetTeamsInSchedule
          teamOrder={teamOrder}
          schedule={initialSchedule}
          setModifiedSchedule={setModifiedSchedule}
          modifiedSchedule={modifiedSchedule}
          seasonId={selectedSeason ? selectedSeason.id : ""}
        />
      </div>
      <div className="match-working-area">
        <FinishedMatches
              finishedSchedule={finishedSchedule}
              selectedSeason={selectedSeason}
         />

        <CreateMatches schedule={initialSchedule} />
      </div>
    </div>
  );
};
  */
