import React, { useState, useEffect } from 'react';

import { logger } from '../../utils/logger';

import SEO from './SEO';
import '../../styles/MLB.css';

interface TeamRecord {
  team: {
    id: number;
    name: string;
    link: string;
  };
  wins: number;
  losses: number;
  winningPercentage: string;
  gamesBack: string;
  leagueRecord: {
    wins: number;
    losses: number;
    pct: string;
  };
  divisionRank: string;
  streak: {
    streakType: string;
    streakNumber: number;
    streakCode: string;
  };
  runsScored: number;
  runsAllowed: number;
  runDifferential: number;
  clinchIndicator?: string;
}

interface DivisionStanding {
  standingsType: string;
  league: {
    id: number;
    link: string;
  };
  division: {
    id: number;
    link: string;
  };
  teamRecords: TeamRecord[];
}

interface StandingsData {
  records: DivisionStanding[];
}

function MLB() {
  const [standings, setStandings] = useState<DivisionStanding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedLeague, setSelectedLeague] = useState<'all' | 'AL' | 'NL'>(
    'all'
  );

  const getDivisionName = (divisionId: number): string => {
    const divisions: Record<number, string> = {
      200: 'AL West',
      201: 'AL East',
      202: 'AL Central',
      203: 'NL West',
      204: 'NL East',
      205: 'NL Central',
    };
    return divisions[divisionId] || 'Unknown Division';
  };

  const getLeagueFromDivision = (divisionId: number): 'AL' | 'NL' => {
    return divisionId >= 200 && divisionId <= 202 ? 'AL' : 'NL';
  };

  const fetchStandings = async () => {
    setLoading(true);
    setErrorMessage('');

    logger.info('MLB standings fetch started', {
      timestamp: new Date().toISOString(),
    });

    try {
      const url = 'https://statsapi.mlb.com/api/v1/standings?leagueId=103,104';

      const response = await logger.measureAsync(
        'mlb-standings-api-call',
        async () => {
          return await fetch(url);
        }
      );

      if (!response.ok) {
        logger.error('MLB API error', {
          status: response.status,
          statusText: response.statusText,
        });
        throw new Error('MLB standings data fetch failed');
      }

      const data: StandingsData = await response.json();

      logger.info('MLB standings fetched successfully', {
        divisionsCount: data.records.length,
        timestamp: new Date().toISOString(),
      });

      setStandings(data.records);
    } catch (error) {
      logger.error('Error fetching MLB standings', { error });
      setErrorMessage(
        error instanceof Error ? error.message : 'Failed to fetch MLB standings'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    logger.info('MLB component initialized', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    fetchStandings();
  }, []);

  const filteredStandings = standings.filter(division => {
    if (selectedLeague === 'all') return true;
    const league = getLeagueFromDivision(division.division.id);
    return league === selectedLeague;
  });

  return (
    <div className='mlb-page'>
      <SEO
        title='MLB Standings - Tron Swan'
        description='View current MLB standings for all divisions in the American League and National League'
        keywords='MLB, baseball, standings, American League, National League, sports'
        url='/mlb'
      />

      <div className='mlb-content'>
        <h1 className='mlb-title' data-testid='mlb-title'>
          MLB Standings
        </h1>

        <div className='league-filter'>
          <button
            className={`filter-button ${selectedLeague === 'all' ? 'active' : ''}`}
            onClick={() => {
              logger.info('League filter changed', {
                from: selectedLeague,
                to: 'all',
                timestamp: new Date().toISOString(),
              });
              setSelectedLeague('all');
            }}
            disabled={loading}
          >
            All
          </button>
          <button
            className={`filter-button ${selectedLeague === 'AL' ? 'active' : ''}`}
            onClick={() => {
              logger.info('League filter changed', {
                from: selectedLeague,
                to: 'AL',
                timestamp: new Date().toISOString(),
              });
              setSelectedLeague('AL');
            }}
            disabled={loading}
          >
            American League
          </button>
          <button
            className={`filter-button ${selectedLeague === 'NL' ? 'active' : ''}`}
            onClick={() => {
              logger.info('League filter changed', {
                from: selectedLeague,
                to: 'NL',
                timestamp: new Date().toISOString(),
              });
              setSelectedLeague('NL');
            }}
            disabled={loading}
          >
            National League
          </button>
        </div>

        {loading ? (
          <div className='loading-spinner' aria-label='Loading MLB standings' />
        ) : errorMessage ? (
          <div className='error-message'>{errorMessage}</div>
        ) : (
          <div className='divisions-container'>
            {filteredStandings.map((division, divIndex) => (
              <div key={divIndex} className='division-section'>
                <h2 className='division-title'>
                  {getDivisionName(division.division.id)}
                </h2>
                <div className='standings-table-container'>
                  <table className='standings-table'>
                    <thead>
                      <tr>
                        <th className='text-left'>Team</th>
                        <th>W</th>
                        <th>L</th>
                        <th>PCT</th>
                        <th>GB</th>
                        <th>STRK</th>
                        <th>RS</th>
                        <th>RA</th>
                        <th>DIFF</th>
                      </tr>
                    </thead>
                    <tbody>
                      {division.teamRecords.map((team, teamIndex) => (
                        <tr
                          key={teamIndex}
                          className={team.clinchIndicator ? 'clinched' : ''}
                        >
                          <td className='team-name text-left'>
                            {team.clinchIndicator && (
                              <span
                                className='clinch-indicator'
                                title='Clinched'
                              >
                                {team.clinchIndicator}
                              </span>
                            )}
                            {team.team.name}
                          </td>
                          <td>{team.wins}</td>
                          <td>{team.losses}</td>
                          <td>{team.winningPercentage}</td>
                          <td>{team.gamesBack}</td>
                          <td
                            className={
                              team.streak.streakType === 'wins'
                                ? 'win-streak'
                                : 'loss-streak'
                            }
                          >
                            {team.streak.streakCode}
                          </td>
                          <td>{team.runsScored}</td>
                          <td>{team.runsAllowed}</td>
                          <td
                            className={
                              team.runDifferential >= 0
                                ? 'positive-diff'
                                : 'negative-diff'
                            }
                          >
                            {team.runDifferential > 0 ? '+' : ''}
                            {team.runDifferential}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className='mlb-info'>
          <p>Live MLB standings data from MLB Stats API</p>
          <p>
            <strong>Legend:</strong> W = Wins, L = Losses, PCT = Win Percentage,
            GB = Games Back, STRK = Current Streak, RS = Runs Scored, RA = Runs
            Allowed, DIFF = Run Differential
          </p>
        </div>
      </div>
    </div>
  );
}

export default MLB;
