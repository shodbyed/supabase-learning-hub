import { GameOnPlayer, PastPlayerSeasonStat } from "bca-firebase-queries";
import { shuffleArray } from "./globalFunctions";
import { Timestamp } from "firebase/firestore";

export const extractGamesFromPastPlayerSeason = (
  date: string,
  season: PastPlayerSeasonStat
) => {
  // extract elements from season
  const { wins, losses, seasonName, game } = season;

  // create constants
  const gameArray = createSimpleGameArray(wins, losses);
  const shapedGames: GameOnPlayer[] = [];

  const createdAt = Timestamp.fromDate(new Date(date));

  if (gameArray.length === 0) return null;
  const pluckAndCreate = () => {
    const length = gameArray.length;
    const randomIndex = Math.floor(Math.random() * length);
    // pull value from usedArray at randomIndex
    const element = gameArray.splice(randomIndex, 1)[0];
    const shapedGame = {
      break: randomIndex % 2 === 0 ? true : false,
      value: element,
      opponentId: "",
      seasonId: seasonName,
      game,
      week: Math.ceil(length / 6),
      createdAt: createdAt,
    };
    shapedGames.push(shapedGame);
    if (gameArray.length > 0) {
      pluckAndCreate();
    }
  };
  pluckAndCreate();
  return shapedGames;
};

/**
 * Creates a simple game array with the given number of wins and losses.
 *
 * @param wins - The number of wins to include in the game array.
 * @param losses - The number of losses to include in the game array.
 * @returns The shuffled game array, where 1 represents a win and -1 represents a loss.
 */

export const createSimpleGameArray = (wins: number, losses: number) => {
  const gameArray: (1 | -1)[] = [];

  for (let i = 0; i < wins; i++) {
    gameArray.push(1);
  }
  for (let i = 0; i < losses; i++) {
    gameArray.push(-1);
  }
  return shuffleArray(gameArray);
};
