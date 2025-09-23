// ------------------------------
// TABLE OF CONTENTS
// ------------------------------
// 1. Hooks
//    - useRemoveTeamFromSeason
//    - useUpdateTeamData
//    - useAddNewTeamToSeason
// 2. FireBaseFunctions
//    - removeTeamFromSeasonRQ
//    - updateTeamDataRQ
//    - addNewTeamToSeasonRQ

//------------------------
// IMPORTS
//------------------------

// react-query
import { useMutation } from "react-query";
import { updateSeasonRQ } from "./seasonUpdateHooks";
import { fetchSeasonRQ } from "./seasonFetchHooks";
import { removeAllPlayersFromTeamRQ } from "./teamToPlayerOperations";

//firebase
import { db } from "../../firebaseConfig";
import {
  collection,
  updateDoc,
  deleteDoc,
  doc,
  runTransaction,
} from "firebase/firestore";

// types
import { SeasonName, TeamId, Team } from "bca-firebase-queries";

export const createNewTeamData = (teamName: string, seasonId: SeasonName) => ({
  teamName,
  seasonId,
  players: {
    captain: {},
    player2: {},
    player3: {},
    player4: {},
    player5: {},
  },
  wins: 0,
  losses: 0,
  points: 0,
});

// ------------------------------
// 1. HOOKS
// ------------------------------

/**
 * Hook to remove a team from a season.
 *
 * Calls removeTeamFromSeasonRQ to remove the team ID from the season's
 * team array. Also deletes the team document and removes teamId players documents.
 *
 * @param props - Optional config props for useMutation
 * @returns Object with removeTeam function and mutation result/methods
 */

export const useRemoveTeamFromSeason = () => {
  const mutation = useMutation(removeTeamFromSeasonRQ);
  const removeTeam = async (seasonName: SeasonName, teamId: TeamId) => {
    try {
      await mutation.mutateAsync({ seasonName, teamId });
      if (mutation.isSuccess) {
        await deleteTeamRQ(teamId);
        await removeAllPlayersFromTeamRQ(teamId);
      }
    } catch (error) {
      console.error("Error removing Team from Season", error);
    }
  };
  return { removeTeam, ...mutation };
};

export const useUpdateTeamData = () => {
  return useMutation(updateTeamDataRQ);
};

export const useAddNewTeamToSeason = () => {
  return useMutation(addNewTeamToSeasonRQ);
};
// ------------------------------
// 2. FIREBASE FUNCTIONS
// ------------------------------

/**
 * Removes a team from a season.
 *
 * @param seasonName - The name of the season to remove the team from.
 * @param teamId - The ID of the team to remove.
 *
 * Fetches the season, filters the team array to remove the given team ID,
 * and updates the season with the new team array.
 */

const removeTeamFromSeasonRQ = async ({
  seasonName,
  teamId,
}: {
  seasonName: SeasonName;
  teamId: TeamId;
}) => {
  const season = await fetchSeasonRQ(seasonName);
  if (!season) return;

  const teamArray = season.teams;
  const newArray = teamArray.filter((team) => team !== teamId);
  await updateSeasonRQ({ seasonName, seasonData: { teams: newArray } });
};

/**
 * Updates the data for the team with the given ID.
 *
 * @param teamId - The ID of the team to update.
 * @param data - The new team data to update.
 */
const updateTeamDataRQ = async ({
  teamId,
  data,
}: {
  teamId: TeamId;
  data: Team;
}) => {
  // Reference to the team document
  const teamRef = doc(db, "teams", teamId);
  // Update team data
  await updateDoc(teamRef, data);
};

const deleteTeamRQ = async (teamId: TeamId) => {
  const teamRef = doc(db, "teams", teamId);
  await deleteDoc(teamRef);
};

/**
 * Adds a new team to the given season.
 *
 * Creates a new team document with the provided name and season.
 * Gets the current team array for the season.
 * Adds the new team's ID to the array.
 * Updates the season document with the new team array.
 */
const addNewTeamToSeasonRQ = async ({
  seasonName,
  teamName,
}: {
  seasonName: SeasonName;
  teamName: string;
}) => {
  await runTransaction(db, async (transaction) => {
    // Reference to the season
    const seasonRef = doc(db, "seasons", seasonName);
    const seasonDoc = await transaction.get(seasonRef);

    // Ensure the season exists
    if (!seasonDoc.exists()) {
      throw new Error(`Season ${seasonName} not found`);
    }

    // Create a new team document reference with an ID
    const teamRef = doc(collection(db, "teams"));
    const newTeamData = createNewTeamData(teamName, seasonName);
    transaction.set(teamRef, newTeamData);

    // Get the current teams array from the season document, if it exists
    const currentTeams = seasonDoc.data().teams || [];

    // Update the season document with the new team's ID
    transaction.update(seasonRef, {
      teams: [...currentTeams, teamRef.id],
    });
  });
};
