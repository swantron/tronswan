import React, { useState, useEffect } from 'react';

import { logger } from '../../utils/logger';

import SEO from './SEO';
import '../../styles/MLB.css';

interface SplitRecord {
  wins: number;
  losses: number;
  type: string;
  pct: string;
}

interface ExpectedRecord {
  wins: number;
  losses: number;
  type: string;
  pct: string;
}

interface DivisionRecord {
  wins: number;
  losses: number;
  pct: string;
  division: {
    id: number;
    name: string;
    link: string;
  };
}

interface LeagueRecord {
  wins: number;
  losses: number;
  pct: string;
  league: {
    id: number;
    name: string;
    link: string;
  };
}

interface TeamRecords {
  splitRecords: SplitRecord[];
  divisionRecords: DivisionRecord[];
  leagueRecords: LeagueRecord[];
  expectedRecords: ExpectedRecord[];
  overallRecords: SplitRecord[];
}

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
  wildCardGamesBack?: string;
  wildCardRank?: string;
  leagueRecord: {
    wins: number;
    losses: number;
    pct: string;
  };
  divisionRank: string;
  leagueRank: string;
  sportRank: string;
  streak: {
    streakType: string;
    streakNumber: number;
    streakCode: string;
  };
  runsScored: number;
  runsAllowed: number;
  runDifferential: number;
  clinchIndicator?: string;
  eliminationNumber?: string;
  wildCardEliminationNumber?: string;
  divisionChamp?: boolean;
  wildCardLeader?: boolean;
  records?: TeamRecords;
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
  const [viewMode, setViewMode] = useState<
    'standings' | 'teamStats' | 'playoff' | 'rankings'
  >('standings');
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

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

  const getAllTeams = (): TeamRecord[] => {
    return standings.flatMap(division => division.teamRecords);
  };

  const getSplitRecord = (
    team: TeamRecord,
    type: string
  ): SplitRecord | undefined => {
    return team.records?.splitRecords.find(record => record.type === type);
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

  const getPlayoffTeams = (): TeamRecord[] => {
    const allTeams = getAllTeams();
    return allTeams
      .filter(team => team.wildCardGamesBack !== undefined)
      .sort((a, b) => {
        // Sort by winning percentage
        const pctA = parseFloat(a.winningPercentage);
        const pctB = parseFloat(b.winningPercentage);
        return pctB - pctA;
      });
  };

  const getRankings = () => {
    const allTeams = getAllTeams();
    return {
      byRecord: [...allTeams].sort((a, b) => {
        const pctA = parseFloat(a.winningPercentage);
        const pctB = parseFloat(b.winningPercentage);
        return pctB - pctA;
      }),
      byRunsScored: [...allTeams].sort((a, b) => b.runsScored - a.runsScored),
      byRunsAllowed: [...allTeams].sort(
        (a, b) => a.runsAllowed - b.runsAllowed
      ),
      byRunDiff: [...allTeams].sort(
        (a, b) => b.runDifferential - a.runDifferential
      ),
      byLastTen: [...allTeams].sort((a, b) => {
        const lastTenA = getSplitRecord(a, 'lastTen');
        const lastTenB = getSplitRecord(b, 'lastTen');
        if (!lastTenA || !lastTenB) return 0;
        return parseFloat(lastTenB.pct) - parseFloat(lastTenA.pct);
      }),
      byHomeAdvantage: [...allTeams].sort((a, b) => {
        const homeA = getSplitRecord(a, 'home');
        const awayA = getSplitRecord(a, 'away');
        const homeB = getSplitRecord(b, 'home');
        const awayB = getSplitRecord(b, 'away');
        if (!homeA || !awayA || !homeB || !awayB) return 0;
        const diffA = parseFloat(homeA.pct) - parseFloat(awayA.pct);
        const diffB = parseFloat(homeB.pct) - parseFloat(awayB.pct);
        return diffB - diffA;
      }),
    };
  };

  return (
    <div className='mlb-page'>
      <SEO
        title='MLB Standings - Tron Swan'
        description='View current MLB standings for all divisions in the American League and National League'
        keywords='MLB, baseball, standings, American League, National League, sports'
        url='/mlb'
      />

      <div className='mlb-content'>
        <h1 className='page-title mlb-title' data-testid='mlb-title'>
          mlb standings
        </h1>

        {/* View Mode Toggle */}
        <div className='view-mode-toggle'>
          <button
            className={`mode-button ${viewMode === 'standings' ? 'active' : ''}`}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'standings',
                timestamp: new Date().toISOString(),
              });
              setViewMode('standings');
            }}
            disabled={loading}
          >
            Standings
          </button>
          <button
            className={`mode-button ${viewMode === 'teamStats' ? 'active' : ''}`}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'teamStats',
                timestamp: new Date().toISOString(),
              });
              setViewMode('teamStats');
            }}
            disabled={loading}
          >
            Team Stats
          </button>
          <button
            className={`mode-button ${viewMode === 'playoff' ? 'active' : ''}`}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'playoff',
                timestamp: new Date().toISOString(),
              });
              setViewMode('playoff');
            }}
            disabled={loading}
          >
            Playoff Race
          </button>
          <button
            className={`mode-button ${viewMode === 'rankings' ? 'active' : ''}`}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'rankings',
                timestamp: new Date().toISOString(),
              });
              setViewMode('rankings');
            }}
            disabled={loading}
          >
            Rankings
          </button>
        </div>

        {/* League Filter (only for standings view) */}
        {viewMode === 'standings' && (
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
        )}

        {loading ? (
          <div className='loading-spinner' aria-label='Loading MLB standings' />
        ) : errorMessage ? (
          <div className='error-message'>{errorMessage}</div>
        ) : (
          <>
            {viewMode === 'standings' && renderStandings()}
            {viewMode === 'teamStats' && renderTeamStats()}
            {viewMode === 'playoff' && renderPlayoffRace()}
            {viewMode === 'rankings' && renderRankings()}
          </>
        )}

        <div className='mlb-info'>
          <p>Live MLB standings data from MLB Stats API</p>
          {viewMode === 'standings' && (
            <p>
              <strong>Legend:</strong> W = Wins, L = Losses, PCT = Win
              Percentage, GB = Games Back, STRK = Current Streak, RS = Runs
              Scored, RA = Runs Allowed, DIFF = Run Differential
            </p>
          )}
        </div>
      </div>
    </div>
  );

  function renderStandings() {
    return (
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
                          <span className='clinch-indicator' title='Clinched'>
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
    );
  }

  function renderTeamStats() {
    return (
      <div className='team-stats-container'>
        <h2 className='section-title'>Team Statistics Deep Dive</h2>
        <p className='section-subtitle'>
          Click on any team to expand and view detailed splits
        </p>
        <div className='team-stats-list'>
          {getAllTeams()
            .sort(
              (a, b) =>
                parseFloat(b.winningPercentage) -
                parseFloat(a.winningPercentage)
            )
            .map((team, index) => {
              const isExpanded = expandedTeam === team.team.id;
              const home = getSplitRecord(team, 'home');
              const away = getSplitRecord(team, 'away');
              const lastTen = getSplitRecord(team, 'lastTen');
              const day = getSplitRecord(team, 'day');
              const night = getSplitRecord(team, 'night');
              const grass = getSplitRecord(team, 'grass');
              const turf = getSplitRecord(team, 'turf');
              const vsLeft = getSplitRecord(team, 'left');
              const vsRight = getSplitRecord(team, 'right');
              const extraInnings = getSplitRecord(team, 'extraInning');
              const oneRun = getSplitRecord(team, 'oneRun');
              const expected = team.records?.expectedRecords.find(
                r => r.type === 'xWinLoss'
              );

              return (
                <div key={team.team.id} className='team-stats-card'>
                  <div
                    className='team-stats-header'
                    onClick={() =>
                      setExpandedTeam(isExpanded ? null : team.team.id)
                    }
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setExpandedTeam(isExpanded ? null : team.team.id);
                      }
                    }}
                    role='button'
                    tabIndex={0}
                    aria-expanded={isExpanded}
                  >
                    <div className='team-stats-rank'>#{index + 1}</div>
                    <div className='team-stats-name'>
                      {team.team.name}
                      {team.clinchIndicator && (
                        <span className='clinch-badge'>
                          {team.clinchIndicator}
                        </span>
                      )}
                    </div>
                    <div className='team-stats-record'>
                      {team.wins}-{team.losses} ({team.winningPercentage})
                    </div>
                    <div className='expand-icon'>{isExpanded ? '▼' : '▶'}</div>
                  </div>

                  {isExpanded && (
                    <div className='team-stats-details'>
                      <div className='stats-grid'>
                        <div className='stat-block'>
                          <h4>Home vs Away</h4>
                          {home && (
                            <div className='stat-row'>
                              <span>Home:</span>
                              <span className='stat-value'>
                                {home.wins}-{home.losses} ({home.pct})
                              </span>
                            </div>
                          )}
                          {away && (
                            <div className='stat-row'>
                              <span>Away:</span>
                              <span className='stat-value'>
                                {away.wins}-{away.losses} ({away.pct})
                              </span>
                            </div>
                          )}
                        </div>

                        <div className='stat-block'>
                          <h4>Day vs Night</h4>
                          {day && (
                            <div className='stat-row'>
                              <span>Day:</span>
                              <span className='stat-value'>
                                {day.wins}-{day.losses} ({day.pct})
                              </span>
                            </div>
                          )}
                          {night && (
                            <div className='stat-row'>
                              <span>Night:</span>
                              <span className='stat-value'>
                                {night.wins}-{night.losses} ({night.pct})
                              </span>
                            </div>
                          )}
                        </div>

                        <div className='stat-block'>
                          <h4>vs Pitcher Hand</h4>
                          {vsLeft && (
                            <div className='stat-row'>
                              <span>vs LHP:</span>
                              <span className='stat-value'>
                                {vsLeft.wins}-{vsLeft.losses} ({vsLeft.pct})
                              </span>
                            </div>
                          )}
                          {vsRight && (
                            <div className='stat-row'>
                              <span>vs RHP:</span>
                              <span className='stat-value'>
                                {vsRight.wins}-{vsRight.losses} ({vsRight.pct})
                              </span>
                            </div>
                          )}
                        </div>

                        <div className='stat-block'>
                          <h4>Surface</h4>
                          {grass && (
                            <div className='stat-row'>
                              <span>Grass:</span>
                              <span className='stat-value'>
                                {grass.wins}-{grass.losses} ({grass.pct})
                              </span>
                            </div>
                          )}
                          {turf && (
                            <div className='stat-row'>
                              <span>Turf:</span>
                              <span className='stat-value'>
                                {turf.wins}-{turf.losses} ({turf.pct})
                              </span>
                            </div>
                          )}
                        </div>

                        <div className='stat-block'>
                          <h4>Close Games</h4>
                          {extraInnings && (
                            <div className='stat-row'>
                              <span>Extra Innings:</span>
                              <span className='stat-value'>
                                {extraInnings.wins}-{extraInnings.losses} (
                                {extraInnings.pct})
                              </span>
                            </div>
                          )}
                          {oneRun && (
                            <div className='stat-row'>
                              <span>One-Run Games:</span>
                              <span className='stat-value'>
                                {oneRun.wins}-{oneRun.losses} ({oneRun.pct})
                              </span>
                            </div>
                          )}
                        </div>

                        <div className='stat-block'>
                          <h4>Recent & Expected</h4>
                          {lastTen && (
                            <div className='stat-row'>
                              <span>Last 10:</span>
                              <span
                                className={`stat-value ${parseFloat(lastTen.pct) >= 0.6 ? 'hot-team' : parseFloat(lastTen.pct) <= 0.4 ? 'cold-team' : ''}`}
                              >
                                {lastTen.wins}-{lastTen.losses} ({lastTen.pct})
                              </span>
                            </div>
                          )}
                          {expected && (
                            <div className='stat-row'>
                              <span>Expected W-L:</span>
                              <span className='stat-value'>
                                {expected.wins}-{expected.losses} (
                                {expected.pct})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  function renderPlayoffRace() {
    const playoffTeams = getPlayoffTeams();
    const alTeams = playoffTeams.filter(t =>
      [200, 201, 202].includes(
        standings.find(d => d.teamRecords.some(tr => tr.team.id === t.team.id))
          ?.division.id || 0
      )
    );
    const nlTeams = playoffTeams.filter(t =>
      [203, 204, 205].includes(
        standings.find(d => d.teamRecords.some(tr => tr.team.id === t.team.id))
          ?.division.id || 0
      )
    );

    const renderPlayoffTable = (teams: TeamRecord[], leagueName: string) => (
      <div className='playoff-section'>
        <h2 className='division-title'>{leagueName}</h2>
        <div className='standings-table-container'>
          <table className='standings-table playoff-table'>
            <thead>
              <tr>
                <th className='text-left'>Team</th>
                <th>W</th>
                <th>L</th>
                <th>PCT</th>
                <th>GB</th>
                <th>WCGB</th>
                <th>Status</th>
                <th>E#</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => {
                const isInPlayoff =
                  team.divisionChamp ||
                  team.wildCardLeader ||
                  (team.wildCardRank && parseInt(team.wildCardRank) <= 3);
                const isOnBubble =
                  team.wildCardRank &&
                  parseInt(team.wildCardRank) > 3 &&
                  parseInt(team.wildCardRank) <= 6;

                return (
                  <tr
                    key={team.team.id}
                    className={`${team.clinchIndicator ? 'clinched' : ''} ${isInPlayoff ? 'in-playoff' : isOnBubble ? 'on-bubble' : ''}`}
                  >
                    <td className='team-name text-left'>
                      {team.clinchIndicator && (
                        <span className='clinch-indicator' title='Clinched'>
                          {team.clinchIndicator}
                        </span>
                      )}
                      {team.team.name}
                    </td>
                    <td>{team.wins}</td>
                    <td>{team.losses}</td>
                    <td>{team.winningPercentage}</td>
                    <td>{team.gamesBack}</td>
                    <td>{team.wildCardGamesBack || '-'}</td>
                    <td>
                      <span
                        className={`status-badge ${isInPlayoff ? 'in' : isOnBubble ? 'bubble' : 'out'}`}
                      >
                        {team.divisionChamp
                          ? 'DIV'
                          : team.wildCardLeader
                            ? 'WC1'
                            : isInPlayoff
                              ? `WC${team.wildCardRank}`
                              : isOnBubble
                                ? 'HUNT'
                                : 'OUT'}
                      </span>
                    </td>
                    <td>
                      {team.eliminationNumber === 'E'
                        ? 'E'
                        : team.wildCardEliminationNumber || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );

    return (
      <div className='playoff-container'>
        <h2 className='section-title'>Playoff Race</h2>
        <p className='section-subtitle'>
          Division winners and Wild Card standings
        </p>
        <div className='playoff-legend'>
          <span className='legend-item'>
            <span className='status-badge in'>DIV/WC</span> = In Playoffs
          </span>
          <span className='legend-item'>
            <span className='status-badge bubble'>HUNT</span> = Hunting
          </span>
          <span className='legend-item'>
            <span className='status-badge out'>OUT</span> = Eliminated
          </span>
          <span className='legend-item'>
            <strong>WCGB</strong> = Wild Card Games Back
          </span>
          <span className='legend-item'>
            <strong>E#</strong> = Elimination Number
          </span>
        </div>
        {renderPlayoffTable(alTeams, 'American League')}
        {renderPlayoffTable(nlTeams, 'National League')}
      </div>
    );
  }

  function renderRankings() {
    const rankings = getRankings();

    const renderRankingTable = (
      teams: TeamRecord[],
      title: string,
      statType:
        | 'record'
        | 'runsScored'
        | 'runsAllowed'
        | 'runDiff'
        | 'lastTen'
        | 'homeAdv'
    ) => (
      <div className='ranking-section'>
        <h3 className='ranking-title'>{title}</h3>
        <div className='ranking-list'>
          {teams.slice(0, 10).map((team, idx) => {
            let statValue = '';
            switch (statType) {
              case 'record':
                statValue = `${team.wins}-${team.losses} (${team.winningPercentage})`;
                break;
              case 'runsScored':
                statValue = `${team.runsScored} runs`;
                break;
              case 'runsAllowed':
                statValue = `${team.runsAllowed} runs`;
                break;
              case 'runDiff':
                statValue = `${team.runDifferential > 0 ? '+' : ''}${team.runDifferential}`;
                break;
              case 'lastTen': {
                const lastTen = getSplitRecord(team, 'lastTen');
                statValue = lastTen
                  ? `${lastTen.wins}-${lastTen.losses}`
                  : 'N/A';
                break;
              }
              case 'homeAdv': {
                const home = getSplitRecord(team, 'home');
                const away = getSplitRecord(team, 'away');
                if (home && away) {
                  const diff = parseFloat(home.pct) - parseFloat(away.pct);
                  statValue = `${diff > 0 ? '+' : ''}${(diff * 1000).toFixed(0)}`;
                } else {
                  statValue = 'N/A';
                }
                break;
              }
            }

            return (
              <div key={team.team.id} className='ranking-item'>
                <span className='ranking-position'>#{idx + 1}</span>
                <span className='ranking-team'>{team.team.name}</span>
                <span
                  className={`ranking-stat ${statType === 'runDiff' && team.runDifferential >= 0 ? 'positive-diff' : statType === 'runDiff' ? 'negative-diff' : ''}`}
                >
                  {statValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );

    return (
      <div className='rankings-container'>
        <h2 className='section-title'>League Rankings</h2>
        <p className='section-subtitle'>Top 10 teams in each category</p>
        <div className='rankings-grid'>
          {renderRankingTable(rankings.byRecord, '🏆 Best Records', 'record')}
          {renderRankingTable(
            rankings.byRunsScored,
            '⚾ Most Runs Scored',
            'runsScored'
          )}
          {renderRankingTable(
            rankings.byRunsAllowed,
            '🛡️ Fewest Runs Allowed',
            'runsAllowed'
          )}
          {renderRankingTable(
            rankings.byRunDiff,
            'Best Run Differential',
            'runDiff'
          )}
          {renderRankingTable(
            rankings.byLastTen,
            'Hottest Teams (Last 10)',
            'lastTen'
          )}
          {renderRankingTable(
            rankings.byHomeAdvantage,
            '🏠 Best Home Field Advantage',
            'homeAdv'
          )}
        </div>
      </div>
    );
  }
}

export default MLB;
