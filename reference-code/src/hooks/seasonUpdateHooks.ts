// ------------------------------
// TABLE OF CONTENTS
// ------------------------------
// 1. Hooks
//    - useAddOrUpdateSeason
// 2. FireBaseFunctions
//    - addOrUpdateSeasonRQ

//------------------------
// IMPORTS
//------------------------

// react query
import { useMutation } from "react-query";
// import { fetchSeasonRQ } from "./seasonFetchHooks";

// firebase
import { db } from "../../firebaseConfig";
import { updateDoc, doc, setDoc } from "firebase/firestore";

// types
import { Season, SeasonName } from "bca-firebase-queries";

// ------------------------------
// 1. HOOKS
// ------------------------------

export const useAddSeason = () => {
  const mutation = useMutation(addSeasonRQ);

  const addSeason = async (seasonName: string, seasonData: Season) => {
    mutation.mutate({ seasonName, seasonData });
  };

  return { addSeason, ...mutation };
};

export const useUpdateSeason = () => {
  return useMutation(updateSeasonRQ);
};

// ------------------------------
// 2. FIREBASE FUNCTIONS
// ------------------------------

/**
 * Adds a new season document to Firestore.
 *
 * @param seasonName - The name of the season to add.
 * @param seasonData - The season data object to add.
 */
export const addSeasonRQ = async ({
  seasonName,
  seasonData,
}: {
  seasonName: SeasonName;
  seasonData: Season;
}) => {
  const seasonRef = doc(db, "seasons", seasonName);
  await setDoc(seasonRef, { ...seasonData, seasonCompleted: false });
};

/**
 * Updates an existing season document in Firestore.
 *
 * @param seasonName - The name of the season to update.
 * @param seasonData - The partial season data to update.
 */
export const updateSeasonRQ = async ({
  seasonName,
  seasonData,
}: {
  seasonName: SeasonName;
  seasonData: Partial<Season>;
}) => {
  const seasonRef = doc(db, "seasons", seasonName);
  await updateDoc(seasonRef, seasonData);
};

/*
const checkSeasonExists = async (seasonName: SeasonName): Promise<boolean> => {
  try {
    const season = await fetchSeasonRQ(seasonName);
    return Boolean(season);
  } catch (error) {
    return false;
  }
};
*/
