/**
 * @fileoverview Tournament Search Hook
 * Reusable hook for searching tournament dates in the database
 * Supports both BCA and APA tournament types with mock data simulation
 */
import { useState } from 'react';

/**
 * Tournament date option returned by search
 */
export interface TournamentDateOption {
  id: string;
  label: string;
  description: string;
  startDate: string;
  endDate: string;
  voteCount: number;
  lastConfirmed: string;
}

/**
 * Tournament search parameters
 */
interface TournamentSearchParams {
  organization: 'BCA' | 'APA';
  tournamentType: 'nationals';
  year?: number;
}

/**
 * Mock tournament data for different organizations
 */
const getMockTournamentData = (organization: 'BCA' | 'APA', year: number) => {
  const baseData = {
    BCA: [
      {
        start_date: `${year}-02-22`,
        end_date: `${year}-02-26`,
        vote_count: 8,
        last_confirmed: `${year}-01-15`
      },
      {
        start_date: `${year}-02-20`,
        end_date: `${year}-02-24`,
        vote_count: 3,
        last_confirmed: `${year}-01-10`
      },
      {
        start_date: `${year}-02-25`,
        end_date: `${year}-02-28`,
        vote_count: 1,
        last_confirmed: `${year}-01-05`
      }
    ],
    APA: [
      {
        start_date: `${year}-05-15`,
        end_date: `${year}-05-19`,
        vote_count: 12,
        last_confirmed: `${year}-03-01`
      },
      {
        start_date: `${year}-05-20`,
        end_date: `${year}-05-24`,
        vote_count: 7,
        last_confirmed: `${year}-02-28`
      },
      {
        start_date: `${year}-05-13`,
        end_date: `${year}-05-17`,
        vote_count: 2,
        last_confirmed: `${year}-02-15`
      }
    ]
  };

  return baseData[organization];
};

/**
 * Custom hook for tournament date searching
 * Simulates database operations and returns formatted options for UI
 */
export const useTournamentSearch = () => {
  const [foundDates, setFoundDates] = useState<TournamentDateOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  /**
   * Search for tournament dates in the database
   * @param params Search parameters
   * @returns Promise<TournamentDateOption[]> Found tournament date options
   */
  const searchTournamentDates = async (params: TournamentSearchParams): Promise<TournamentDateOption[]> => {
    const { organization, tournamentType, year = new Date().getFullYear() } = params;

    console.log(`🔍 DATABASE OPERATION: Automatically searching for ${organization} ${tournamentType} dates`);
    setIsSearching(true);

    // Simulate the database query structure
    const searchQuery = {
      table: 'tournament_dates',
      where: {
        organization,
        tournament_type: tournamentType,
        year
      },
      select: ['start_date', 'end_date', 'vote_count', 'last_confirmed'],
      orderBy: 'vote_count DESC'
    };

    console.log('📋 Query:', JSON.stringify(searchQuery, null, 2));

    // Simulate database delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Get mock data for the organization
    const dateOptions = getMockTournamentData(organization, year);

    // Randomly include 1-3 options (simulate varying amounts of data)
    const numOptions = Math.floor(Math.random() * 3) + 1;
    const foundOptions: TournamentDateOption[] = [];

    for (let i = 0; i < numOptions; i++) {
      const option = dateOptions[i];
      if (option) {
        foundOptions.push({
          id: `found_dates_${organization.toLowerCase()}_${i}`,
          label: `${option.start_date} to ${option.end_date}`,
          description: `${option.vote_count} operators have confirmed these dates`,
          startDate: option.start_date,
          endDate: option.end_date,
          voteCount: option.vote_count,
          lastConfirmed: option.last_confirmed
        });
      }
    }

    console.log(`✅ FOUND: ${foundOptions.length} ${organization} ${tournamentType} date options in database:`, foundOptions);

    setFoundDates(foundOptions);
    setIsSearching(false);

    return foundOptions;
  };

  /**
   * Clear found tournament dates
   */
  const clearFoundDates = () => {
    setFoundDates([]);
  };

  /**
   * Find a specific tournament option by ID
   * @param id Tournament option ID
   * @returns TournamentDateOption | undefined
   */
  const findTournamentOption = (id: string): TournamentDateOption | undefined => {
    return foundDates.find(option => option.id === id);
  };

  return {
    foundDates,
    isSearching,
    searchTournamentDates,
    clearFoundDates,
    findTournamentOption
  };
};