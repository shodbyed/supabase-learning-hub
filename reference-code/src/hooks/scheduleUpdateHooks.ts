// ------------------------------
// TABLE OF CONTENTS
// ------------------------------
// 1. Hooks
//    - useUpdateSeasonSchedule
// 2. FireBaseFunctions
//    - updateSeasonScheduleRQ

//------------------------
// IMPORTS
//------------------------

// react-query
import { useMutation } from "react-query";

// firebase
import { db } from "../../firebaseConfig";
import { updateDoc, doc } from "firebase/firestore";

//types
import { Schedule, SeasonName } from "bca-firebase-queries";

// ------------------------------
// 1. HOOKS
// ------------------------------

export const useUpdateSeasonSchedule = () => {
  return useMutation(updateSeasonScheduleRQ);
};

// ------------------------------
// 2. FIREBASE FUNCTIONS
// ------------------------------
/**
 * Updates the schedule for the given season in Firestore.
 *
 * @param seasonName - The name of the season document to update.
 * @param schedule - The updated schedule object to save.
 */

export const updateSeasonScheduleRQ = async ({
  seasonName,
  schedule,
}: {
  seasonName: SeasonName;
  schedule: Schedule;
}) => {
  //reference to the season document
  const seasonRef = doc(db, "seasons", seasonName);
  await updateDoc(seasonRef, {
    schedule: schedule,
  });
};
