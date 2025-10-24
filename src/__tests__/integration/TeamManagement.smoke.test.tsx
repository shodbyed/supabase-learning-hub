/**
 * @fileoverview Smoke test for TeamManagement
 *
 * Purpose: Verify the component renders without crashing and basic UI elements are present.
 * This catches "oops, I broke the whole thing" errors during refactoring.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils';
import { TeamManagement } from '@/operator/TeamManagement';
import * as useOperatorIdModule from '@/hooks/useOperatorId';

// Mock the Supabase client with chainable query builder
vi.mock('@/supabaseClient', () => {
  const createChainableQuery = (finalData: any) => {
    const chain: any = {
      select: vi.fn(() => chain),
      insert: vi.fn(() => chain),
      update: vi.fn(() => chain),
      delete: vi.fn(() => chain),
      eq: vi.fn(() => chain),
      neq: vi.fn(() => chain),
      in: vi.fn(() => chain),
      lt: vi.fn(() => chain),
      order: vi.fn(() => chain),
      limit: vi.fn(() => chain),
      single: vi.fn(() => Promise.resolve(finalData)),
      maybeSingle: vi.fn(() => Promise.resolve(finalData)),
    };
    return Object.assign(Promise.resolve(finalData), chain);
  };

  return {
    supabase: {
      from: vi.fn((table: string) => {
        // Mock responses for different tables
        if (table === 'leagues') {
          return createChainableQuery({
            data: {
              id: 'test-league-id',
              league_name: 'Test League',
              game_type: '8ball',
              team_format: '8_man',
              day_of_week: 'wednesday',
              operator_id: 'test-operator-id',
            },
            error: null,
          });
        }
        if (table === 'venues') {
          return createChainableQuery({
            data: [
              {
                id: 'venue-1',
                name: 'Test Venue',
                bar_box_tables: 2,
                regulation_tables: 2,
                total_tables: 4,
                created_by_operator_id: 'test-operator-id',
                is_active: true,
              },
            ],
            error: null,
          });
        }
        if (table === 'league_venues') {
          return createChainableQuery({
            data: [],
            error: null,
          });
        }
        if (table === 'teams') {
          return createChainableQuery({
            data: [],
            error: null,
          });
        }
        if (table === 'members') {
          return createChainableQuery({
            data: [
              {
                id: 'member-1',
                first_name: 'John',
                last_name: 'Doe',
                player_number: 12345,
                email: 'john@example.com',
              },
            ],
            error: null,
          });
        }
        if (table === 'seasons') {
          return createChainableQuery({
            data: {
              id: 'season-1',
              league_id: 'test-league-id',
              status: 'active',
              created_at: new Date().toISOString(),
            },
            error: null,
          });
        }
        // Default response
        return createChainableQuery({
          data: [],
          error: null,
        });
      }),
    },
  };
});

// Mock the useOperatorId hook
vi.spyOn(useOperatorIdModule, 'useOperatorId').mockReturnValue({
  operatorId: 'test-operator-id',
  loading: false,
  error: null,
});

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ leagueId: 'test-league-id' }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    useNavigate: () => vi.fn(),
  };
});

describe('TeamManagement - Smoke Test', () => {
  beforeEach(() => {
    // Clear any previous state
    localStorage.clear();
  });

  it('should render the component without crashing', async () => {
    renderWithProviders(<TeamManagement />);

    // Wait for loading to complete
    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify component rendered
    expect(screen.getByText('Manage Teams')).toBeInTheDocument();
  });

  it('should display the "Back to League" button', async () => {
    renderWithProviders(<TeamManagement />);

    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('Back to League')).toBeInTheDocument();
  });

  it('should display Setup Summary section', async () => {
    renderWithProviders(<TeamManagement />);

    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('Setup Summary')).toBeInTheDocument();
  });

  it('should display League Venues section', async () => {
    renderWithProviders(<TeamManagement />);

    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('League Venues')).toBeInTheDocument();
  });

  it('should display Teams section', async () => {
    renderWithProviders(<TeamManagement />);

    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('Teams')).toBeInTheDocument();
  });

  it('should not throw JavaScript errors on mount', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    renderWithProviders(<TeamManagement />);

    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Verify no console errors were logged
    expect(consoleSpy).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it('should have Add Team button', async () => {
    renderWithProviders(<TeamManagement />);

    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    expect(screen.getByText('Add Team')).toBeInTheDocument();
  });
});
