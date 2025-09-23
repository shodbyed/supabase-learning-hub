// ------------------------------
// TABLE OF CONTENTS
// ------------------------------
// 1. Hooks
//    - useFetchPastPlayerById
//    - useFetchCurrentUserById
//    - useFetchPastPlayers
//    - useFetchCurrentUsers
// 2. FireBaseFunctions
//    - fetchPastPlayerByIdRQ
//    - fetchCurrentUserById
//    - fetchAllPastPlayersRQ
//    - fetchAllCurrentUsers

//------------------------
// IMPORTS
//------------------------
import { useQuery } from "react-query";
import { db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { Player } from "../assets/typesFolder/newTypes";

// ------------------------------
// 1. HOOKS
// ------------------------------
export const useFetchPlayerById = (id: string | undefined) => {
  return useQuery(["player", id], () => fetchCurrentUserById(id), {
    enabled: !!id,
  });
};

/**
 * Fetches a Player object by ID from Firestore.
 *
 * @param id - The ID of the user to fetch.
 * @returns A Promise resolving to the Player object if found, or null if not found.
 * @throws Error if ID is not provided.
 */
export const fetchCurrentUserById = async (
  id: string | undefined
): Promise<Player | null> => {
  if (id === undefined) {
    throw new Error("Player ID not provided");
  }
  const userDoc = doc(db, "players", id as string);
  const userDocSnapshot = await getDoc(userDoc);

  if (userDocSnapshot.exists()) {
    return {
      id: userDocSnapshot.id,
      ...(userDocSnapshot.data() as Omit<Player, "id">),
    };
  } else {
    throw new Error("Player not found");
  }
};
