// ------------------------------
// TABLE OF CONTENTS
// ------------------------------
// 1. Hooks
//    - useFetchTeamById
//    - useFetchTeamsFromSeason
// 2. FireBaseFunctions
//    - fetchTeamByIdRQ
//    - fetchTeamsFromSeasonRQ

//------------------------
// IMPORTS
//------------------------

// react query
import { useQuery } from "react-query";
import { fetchSeasonRQ } from "./seasonFetchHooks";

// firebase
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

// types
import { SeasonName, Team } from "bca-firebase-queries";

// ------------------------------
// 1. HOOKS
// ------------------------------

export const useFetchTeamById = (teamId: string | undefined) => {
  return useQuery(["team", teamId], () => fetchTeamByIdRQ(teamId), {
    enabled: teamId !== undefined,
  });
};

export const useFetchTeamsFromSeason = (seasonName: SeasonName | undefined) => {
  const query = useQuery<Team[], unknown>(
    ["teamsFromSeason", seasonName],
    () => fetchTeamsFromSeasonRQ(seasonName),
    {
      enabled: !!seasonName,
    }
  );
  return query;
};

// ------------------------------
// 2. FIREBASE FUNCTIONS
// ------------------------------

/**
 * Fetches a team by ID from Firestore.
 *
 * Takes a team ID string.
 * Gets the team document reference by ID.
 * Fetches the team document snapshot.
 * If found, returns a Team object from the snapshot data.
 * If not found, throws an error.
 */

export const fetchTeamByIdRQ = async (
  teamId: string | undefined
): Promise<Team | null> => {
  if (teamId === undefined) {
    throw new Error("Team ID not provided");
  }
  const teamDoc = doc(db, "teams", teamId);
  const teamDocSnapshot = await getDoc(teamDoc);
  if (teamDocSnapshot.exists()) {
    const teamData = teamDocSnapshot.data() as Team;
    teamData.id = teamDocSnapshot.id;
    return teamData;
  } else {
    throw new Error("Team not found");
  }
};

/**
 * Fetches all teams for a given season from Firestore.
 *
 * Takes a season name/id string.
 * Gets the season document.
 * Maps over the season's team IDs to fetch each team document.
 * Awaits all team fetch promises.
 * Filters out any null teams.
 * Returns the array of Team objects.
 */

const fetchTeamsFromSeasonRQ = async (
  seasonName: SeasonName | undefined
): Promise<Team[]> => {
  const seasonDoc = await fetchSeasonRQ(seasonName);
  if (!seasonDoc.teams || seasonDoc.teams.length === 0) {
    return [];
  }
  const teamsPromises = seasonDoc.teams.map(async (teamId) =>
    fetchTeamByIdRQ(teamId)
  );
  const teams = await Promise.all(teamsPromises);
  return teams.filter((team) => team !== null) as Team[];
};
