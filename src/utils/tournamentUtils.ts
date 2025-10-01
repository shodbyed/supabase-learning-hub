/**
 * @fileoverview Tournament Utility Functions
 *
 * Functions for generating dynamic tournament links and handling tournament date logic.
 * Accounts for the fact that tournament websites update their URLs after each year's event.
 */

/**
 * Fetches the current BCA Championship URL based on today's date
 *
 * Logic: After March 15, the NEXT year's championship page becomes active
 * - Before March 15: Current year's championship is still relevant
 * - After March 15: Next year's championship page is published
 *
 * @returns The current relevant BCA championship URL
 */
export const fetchBCAChampionshipURL = (): string => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const month = today.getMonth(); // 0-based (March = 2)
  const day = today.getDate();

  // After March 15, use next year's championship page
  const useNextYear = month > 2 || (month === 2 && day > 15); // month > 2 = April+, month === 2 && day > 15 = after March 15

  const championshipYear = useNextYear ? currentYear + 1 : currentYear;

  return `https://www.playcsipool.com/${championshipYear}-bcapl-world-championships.html`;
};

/**
 * Fetches the current APA Championship URL
 *
 * APA uses a static URL that doesn't change year to year
 *
 * @returns The APA championship URL
 */
export const fetchAPAChampionshipURL = (): string => {
  return 'https://poolplayers.com/world-pool-championships/';
};

/**
 * Gets the championship year that's currently relevant for planning
 *
 * @param organization - 'BCA' or 'APA'
 * @returns The year of the next upcoming championship
 */
export const getRelevantChampionshipYear = (organization: 'BCA' | 'APA'): number => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const month = today.getMonth();
  const day = today.getDate();

  if (organization === 'BCA') {
    // BCA championships are in February/March
    const useNextYear = month > 2 || (month === 2 && day > 15);
    return useNextYear ? currentYear + 1 : currentYear;
  } else {
    // APA championships are in August
    const useNextYear = month >= 8;
    return useNextYear ? currentYear + 1 : currentYear;
  }
};

/**
 * Generic tournament URL fetcher
 *
 * @param organization - 'BCA' or 'APA'
 * @returns The current relevant championship URL
 */
export const getChampionshipLink = (organization: 'BCA' | 'APA'): string => {
  return organization === 'BCA' ? fetchBCAChampionshipURL() : fetchAPAChampionshipURL();
};