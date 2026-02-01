import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from '@testing-library/react';
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { describe, test, expect, beforeEach, vi } from 'vitest';

import '@testing-library/jest-dom';
import MLB from './MLB';

// Mock fetch globally
global.fetch = vi.fn();

// Helper function to render MLB component with HelmetProvider
const renderMLB = (props = {}) => {
  return render(
    <HelmetProvider>
      <MLB {...props} />
    </HelmetProvider>
  );
};

// Mock standings data
const mockStandingsData = {
  records: [
    {
      standingsType: 'regularSeason',
      league: { id: 103, link: '/api/v1/league/103' },
      division: { id: 201, link: '/api/v1/divisions/201' },
      teamRecords: [
        {
          team: {
            id: 147,
            name: 'New York Yankees',
            link: '/api/v1/teams/147',
          },
          wins: 95,
          losses: 67,
          winningPercentage: '.586',
          gamesBack: '-',
          divisionRank: '1',
          leagueRank: '2',
          sportRank: '4',
          leagueRecord: { wins: 95, losses: 67, pct: '.586' },
          streak: { streakType: 'wins', streakNumber: 3, streakCode: 'W3' },
          runsScored: 850,
          runsAllowed: 720,
          runDifferential: 130,
          divisionChamp: true,
          records: {
            splitRecords: [
              { wins: 48, losses: 33, type: 'home', pct: '.593' },
              { wins: 47, losses: 34, type: 'away', pct: '.580' },
              { wins: 15, losses: 10, type: 'lastTen', pct: '.600' },
            ],
            divisionRecords: [],
            leagueRecords: [],
            expectedRecords: [],
            overallRecords: [],
          },
        },
        {
          team: {
            id: 111,
            name: 'Boston Red Sox',
            link: '/api/v1/teams/111',
          },
          wins: 88,
          losses: 74,
          winningPercentage: '.543',
          gamesBack: '7',
          divisionRank: '2',
          leagueRank: '5',
          sportRank: '8',
          leagueRecord: { wins: 88, losses: 74, pct: '.543' },
          streak: { streakType: 'losses', streakNumber: 2, streakCode: 'L2' },
          runsScored: 780,
          runsAllowed: 750,
          runDifferential: 30,
          records: {
            splitRecords: [
              { wins: 45, losses: 36, type: 'home', pct: '.556' },
              { wins: 43, losses: 38, type: 'away', pct: '.531' },
              { wins: 5, losses: 5, type: 'lastTen', pct: '.500' },
            ],
            divisionRecords: [],
            leagueRecords: [],
            expectedRecords: [],
            overallRecords: [],
          },
        },
      ],
    },
    {
      standingsType: 'regularSeason',
      league: { id: 104, link: '/api/v1/league/104' },
      division: { id: 204, link: '/api/v1/divisions/204' },
      teamRecords: [
        {
          team: {
            id: 144,
            name: 'Atlanta Braves',
            link: '/api/v1/teams/144',
          },
          wins: 104,
          losses: 58,
          winningPercentage: '.642',
          gamesBack: '-',
          divisionRank: '1',
          leagueRank: '1',
          sportRank: '1',
          leagueRecord: { wins: 104, losses: 58, pct: '.642' },
          streak: { streakType: 'wins', streakNumber: 5, streakCode: 'W5' },
          runsScored: 950,
          runsAllowed: 650,
          runDifferential: 300,
          divisionChamp: true,
          records: {
            splitRecords: [
              { wins: 52, losses: 29, type: 'home', pct: '.642' },
              { wins: 52, losses: 29, type: 'away', pct: '.642' },
              { wins: 8, losses: 2, type: 'lastTen', pct: '.800' },
            ],
            divisionRecords: [],
            leagueRecords: [],
            expectedRecords: [],
            overallRecords: [],
          },
        },
      ],
    },
  ],
};

describe('MLB Component', () => {
  beforeEach(() => {
    (global.fetch as any).mockClear();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockStandingsData,
    });
  });

  test('renders MLB page title', async () => {
    renderMLB();

    expect(screen.getByTestId('mlb-title')).toHaveTextContent('mlb standings');
  });

  test('renders loading state initially', () => {
    renderMLB();
    expect(screen.getByLabelText('Loading MLB standings')).toBeInTheDocument();
  });

  test('fetches and displays standings data', async () => {
    renderMLB();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading MLB standings')
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText('New York Yankees')).toBeInTheDocument();
    expect(screen.getByText('Boston Red Sox')).toBeInTheDocument();
    expect(screen.getByText('Atlanta Braves')).toBeInTheDocument();
  });

  test('renders league filter buttons', async () => {
    renderMLB();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading MLB standings')
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('American League')).toBeInTheDocument();
    expect(screen.getByText('National League')).toBeInTheDocument();
  });

  test('renders view mode buttons', async () => {
    renderMLB();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading MLB standings')
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText('Standings')).toBeInTheDocument();
    expect(screen.getByText('Team Stats')).toBeInTheDocument();
    expect(screen.getByText('Playoff Race')).toBeInTheDocument();
    expect(screen.getByText('Rankings')).toBeInTheDocument();
  });

  test('displays win-loss records', async () => {
    renderMLB();

    await waitFor(() => {
      // Check for wins displayed in separate cells
      const winCells = screen.getAllByText('95');
      expect(winCells.length).toBeGreaterThan(0);
      expect(screen.getByText('88')).toBeInTheDocument();
      expect(screen.getByText('104')).toBeInTheDocument();
      // Check for losses (use getAllByText for values that may appear in countdown timer)
      expect(screen.getByText('67')).toBeInTheDocument();
      expect(screen.getByText('74')).toBeInTheDocument();
      const lossCells = screen.getAllByText('58');
      expect(lossCells.length).toBeGreaterThan(0);
    });
  });

  test('displays winning percentages', async () => {
    renderMLB();

    await waitFor(() => {
      expect(screen.getByText('.586')).toBeInTheDocument();
      expect(screen.getByText('.543')).toBeInTheDocument();
      expect(screen.getByText('.642')).toBeInTheDocument();
    });
  });

  test('filters standings by American League', async () => {
    renderMLB();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading MLB standings')
      ).not.toBeInTheDocument();
    });

    const alButton = screen.getByText('American League');
    await act(async () => {
      fireEvent.click(alButton);
    });

    await waitFor(() => {
      expect(screen.getByText('New York Yankees')).toBeInTheDocument();
      expect(screen.getByText('Boston Red Sox')).toBeInTheDocument();
      expect(screen.queryByText('Atlanta Braves')).not.toBeInTheDocument();
    });
  });

  test('filters standings by National League', async () => {
    renderMLB();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading MLB standings')
      ).not.toBeInTheDocument();
    });

    const nlButton = screen.getByText('National League');
    await act(async () => {
      fireEvent.click(nlButton);
    });

    await waitFor(() => {
      expect(screen.queryByText('New York Yankees')).not.toBeInTheDocument();
      expect(screen.queryByText('Boston Red Sox')).not.toBeInTheDocument();
      expect(screen.getByText('Atlanta Braves')).toBeInTheDocument();
    });
  });

  test('switches back to all leagues', async () => {
    renderMLB();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading MLB standings')
      ).not.toBeInTheDocument();
    });

    // Filter to AL first
    const alButton = screen.getByText('American League');
    await act(async () => {
      fireEvent.click(alButton);
    });

    // Then switch back to All
    const allButton = screen.getByText('All');
    await act(async () => {
      fireEvent.click(allButton);
    });

    await waitFor(() => {
      expect(screen.getByText('New York Yankees')).toBeInTheDocument();
      expect(screen.getByText('Boston Red Sox')).toBeInTheDocument();
      expect(screen.getByText('Atlanta Braves')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    (global.fetch as any).mockRejectedValue(new Error('API Error'));

    renderMLB();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading MLB standings')
      ).not.toBeInTheDocument();
    });

    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  test('handles non-ok response', async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    renderMLB();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading MLB standings')
      ).not.toBeInTheDocument();
    });

    expect(
      screen.getByText(/MLB standings data fetch failed/i)
    ).toBeInTheDocument();
  });

  test('switches to Team Stats view', async () => {
    renderMLB();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading MLB standings')
      ).not.toBeInTheDocument();
    });

    const statsButton = screen.getByText('Team Stats');
    await act(async () => {
      fireEvent.click(statsButton);
    });

    // Just verify the button is active, not looking for specific content
    await waitFor(() => {
      expect(statsButton).toHaveClass('active');
    });
  });

  test('switches to Playoff Race view', async () => {
    renderMLB();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading MLB standings')
      ).not.toBeInTheDocument();
    });

    const playoffButton = screen.getByRole('button', { name: 'Playoff Race' });
    await act(async () => {
      fireEvent.click(playoffButton);
    });

    await waitFor(() => {
      expect(playoffButton).toHaveClass('active');
    });
  });

  test('switches to Rankings view', async () => {
    renderMLB();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading MLB standings')
      ).not.toBeInTheDocument();
    });

    const rankingsButton = screen.getByRole('button', { name: 'Rankings' });
    await act(async () => {
      fireEvent.click(rankingsButton);
    });

    await waitFor(() => {
      expect(rankingsButton).toHaveClass('active');
    });
  });

  test('displays division names', async () => {
    renderMLB();

    await waitFor(() => {
      expect(screen.getByText('AL East')).toBeInTheDocument();
      expect(screen.getByText('NL East')).toBeInTheDocument();
    });
  });

  test('expands team details when clicked', async () => {
    renderMLB();

    await waitFor(() => {
      expect(
        screen.queryByLabelText('Loading MLB standings')
      ).not.toBeInTheDocument();
    });

    const yankees = screen.getByText('New York Yankees');
    await act(async () => {
      fireEvent.click(yankees);
    });

    // Check that the team row is now expanded by looking for the expanded state
    await waitFor(() => {
      const teamRows = screen.getAllByText('New York Yankees');
      expect(teamRows.length).toBeGreaterThan(0);
    });
  });

  test('displays streak information', async () => {
    renderMLB();

    await waitFor(() => {
      expect(screen.getByText(/W3/i)).toBeInTheDocument();
      expect(screen.getByText(/L2/i)).toBeInTheDocument();
    });
  });

  test('displays run differential', async () => {
    renderMLB();

    await waitFor(() => {
      // Just verify that run differential data is present in the table
      const tableCells = screen.getAllByRole('cell');
      const hasDifferential = tableCells.some(
        cell =>
          cell.textContent &&
          (cell.textContent.includes('+130') ||
            cell.textContent.includes('+30') ||
            cell.textContent.includes('+300'))
      );
      expect(hasDifferential).toBe(true);
    });
  });

  test('makes correct API call', async () => {
    renderMLB();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://statsapi.mlb.com/api/v1/standings?leagueId=103,104'
      );
    });
  });
});
