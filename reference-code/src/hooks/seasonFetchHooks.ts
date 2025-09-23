// ------------------------------
// TABLE OF CONTENTS
// ------------------------------
// 1. Hooks
//    - useFetchSeasons
//    - useFetchSeason
// 2. FireBaseFunctions
//    - fetchSeasonsRQ
//    - fetchSeasonRQ

//------------------------
// IMPORTS
//------------------------

// react query
import { useQuery, useQueryClient } from "react-query";

// firebase
import { db } from "../../firebaseConfig";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";

// types
import { Season, SeasonName } from "bca-firebase-queries";

// ------------------------------
// 1. HOOKS
// ------------------------------

export const useFetchSeasons = () => {
  const queryClient = useQueryClient();

  const refetchSeasons = () => {
    queryClient.invalidateQueries("seasons");
  };
  return { ...useQuery("currentSeasons", fetchSeasonsRQ), refetchSeasons };
};

export const useFetchSeason = (seasonName: string) => {
  return useQuery(["season", seasonName], () => fetchSeasonRQ(seasonName));
};

// ------------------------------
// 2. FIREBASE FUNCTIONS
// ------------------------------

/**
 * Fetches ALL seasons from Firestore where seasonCompleted = false.
 *
 * Queries seasons collection filtered by seasonCompleted field.
 * Maps results to Season objects by extracting id and data.
 *
 * Returns Promise resolving to array of Season objects.
 */

const fetchSeasonsRQ = async (): Promise<Season[]> => {
  const seasonQuery = query(
    collection(db, "seasons"),
    where("seasonCompleted", "==", false)
  );
  const querySnapshot = await getDocs(seasonQuery);

  const seasonsArray = querySnapshot.docs.map((doc) => {
    const season = doc.data();
    season.id = doc.id;
    return season as Season;
  });

  return seasonsArray;
};

/**
 * Fetches a SINGLE season by name/id from Firestore.
 *
 * Takes a season name/id string.
 * Gets the season document reference by name.
 * Fetches the season document snapshot.
 * If found, returns a Season object from the snapshot data.
 * If not found, throws an error.
 */

export const fetchSeasonRQ = async (
  seasonName: SeasonName | undefined
): Promise<Season> => {
  if (seasonName === undefined) {
    throw new Error("Season name/id not provided");
  }
  const seasonDoc = doc(db, "seasons", seasonName);
  const seasonDocSnapshot = await getDoc(seasonDoc);
  if (seasonDocSnapshot.exists()) {
    const season = seasonDocSnapshot.data();
    season.id = seasonDocSnapshot.id;
    return season as Season;
  } else {
    throw new Error("Season not found");
  }
};
