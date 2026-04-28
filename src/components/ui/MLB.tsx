import React, { useState, useEffect } from 'react';

import { logger } from '../../utils/logger';
import { Button } from '../common/Button';
import { Card } from '../common/Card';

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
  streak?: {
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

interface LinescoreInning {
  num: number;
  ordinalNum: string;
  home: { runs?: number; hits?: number; errors?: number };
  away: { runs?: number; hits?: number; errors?: number };
}

interface Linescore {
  currentInning?: number;
  currentInningOrdinal?: string;
  inningHalf?: string;
  outs?: number;
  balls?: number;
  strikes?: number;
  innings: LinescoreInning[];
  teams: {
    home: { runs: number; hits: number; errors: number };
    away: { runs: number; hits: number; errors: number };
  };
}

interface GameTeam {
  team: { id: number; name: string; abbreviation?: string };
  score?: number;
  isWinner?: boolean;
  probablePitcher?: { id: number; fullName: string };
}

interface LeaderEntry {
  rank: number;
  value: string;
  person: { id: number; fullName: string };
  team: { id: number; name: string };
  league?: { id: number; name: string };
}

interface LeaderCategory {
  leaderCategory: string;
  leaders: LeaderEntry[];
}

interface LeadersData {
  leagueLeaders: LeaderCategory[];
}

interface Game {
  gamePk: number;
  gameDate: string;
  status: {
    abstractGameState: string;
    detailedState: string;
  };
  teams: {
    home: GameTeam;
    away: GameTeam;
  };
  linescore?: Linescore;
  venue?: { name: string };
}

interface ScheduleData {
  dates: Array<{
    date: string;
    games: Game[];
  }>;
}

function MLB() {
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  const [standings, setStandings] = useState<DivisionStanding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [selectedLeague, setSelectedLeague] = useState<'all' | 'AL' | 'NL'>(
    'all'
  );
  const [viewMode, setViewMode] = useState<
    | 'standings'
    | 'teamStats'
    | 'playoff'
    | 'rankings'
    | 'scoreboard'
    | 'splits'
    | 'leaders'
  >('standings');
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);

  const [scheduleByDate, setScheduleByDate] = useState<Record<string, Game[]>>(
    {}
  );
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState('');

  const [leaders, setLeaders] = useState<LeaderCategory[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(false);
  const [leadersError, setLeadersError] = useState('');
  const [leaderGroup, setLeaderGroup] = useState<'hitting' | 'pitching'>(
    'hitting'
  );
  const [leaderTeamFilter, setLeaderTeamFilter] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const openingDay = new Date('2026-03-26T00:00:00'); // March 26, 2026
      const now = new Date();
      const difference = openingDay.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeRemaining({ days, hours, minutes, seconds });
      } else {
        setTimeRemaining(null); // Opening Day has passed
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, []);

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
    return team.records?.splitRecords?.find(record => record.type === type);
  };

  const fetchStandings = async () => {
    setLoading(true);
    setErrorMessage('');

    logger.info('MLB standings fetch started', {
      timestamp: new Date().toISOString(),
    });

    try {
      const url =
        'https://statsapi.mlb.com/api/v1/standings?leagueId=103,104&hydrate=record(overall,splitRecords)';

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

  const localDateStr = (offsetDays: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const fetchSchedule = async () => {
    setLoadingSchedule(true);
    setScheduleError('');
    try {
      const start = localDateStr(-1);
      const end = localDateStr(1);
      const url = `https://statsapi.mlb.com/api/v1/schedule?sportId=1&startDate=${start}&endDate=${end}&hydrate=linescore,team,probablePitcher`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch schedule');
      const data: ScheduleData = await response.json();
      const byDate: Record<string, Game[]> = {};
      for (const entry of data.dates) {
        byDate[entry.date] = entry.games;
      }
      setScheduleByDate(byDate);
    } catch (error) {
      setScheduleError(
        error instanceof Error ? error.message : 'Failed to fetch schedule'
      );
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    logger.info('MLB component initialized', {
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });

    fetchStandings();
  }, []);

  useEffect(() => {
    if (viewMode !== 'scoreboard') return;
    fetchSchedule();
    // Only poll for live updates; yesterday and tomorrow don't change
    const todayStr = localDateStr(0);
    const interval = setInterval(() => {
      if (selectedDate === todayStr) fetchSchedule();
    }, 30000);
    return () => clearInterval(interval);
  }, [viewMode, selectedDate]);

  const fetchLeaders = async () => {
    setLoadingLeaders(true);
    setLeadersError('');
    try {
      const season = new Date().getFullYear();
      const categories = [
        'homeRuns',
        'battingAverage',
        'onBasePlusSlugging',
        'runsBattedIn',
        'hits',
        'stolenBases',
        'walks',
        'wins',
        'earnedRunAverage',
        'strikeouts',
        'saves',
        'walksAndHitsPerInningPitched',
      ].join(',');
      const url = `https://statsapi.mlb.com/api/v1/stats/leaders?leaderCategories=${categories}&sportId=1&season=${season}&limit=10`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch leaders');
      const data: LeadersData = await response.json();
      setLeaders(data.leagueLeaders);
    } catch (error) {
      setLeadersError(
        error instanceof Error ? error.message : 'Failed to fetch leaders'
      );
    } finally {
      setLoadingLeaders(false);
    }
  };

  useEffect(() => {
    if (viewMode !== 'leaders') return;
    if (leaders.length > 0) return;
    fetchLeaders();
  }, [viewMode, leaders.length]);

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

  const renderTeamLogo = (teamId: number, size = 20) => (
    <img
      src={`https://www.mlbstatic.com/team-logos/${teamId}.svg`}
      alt=''
      width={size}
      height={size}
      className='team-logo'
      onError={e => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );

  return (
    <div className='mlb-page'>
      <SEO
        title='MLB Standings - Tron Swan'
        description='View current MLB standings for all divisions in the American League and National League'
        keywords='MLB, baseball, standings, American League, National League, sports'
        url='/mlb'
      />

      <div className='mlb-content'>
        {timeRemaining && (
          <Card className='opening-day-countdown'>
            <div className='countdown-content'>
              <h2 className='countdown-title'>COUNTDOWN TO OPENING DAY 2026</h2>
              <div className='timers'>
                <div className='timer-block'>
                  <span className='timer-value'>{timeRemaining.days}</span>
                  <span className='timer-label'>DAYS</span>
                </div>
                <div className='timer-separator'>:</div>
                <div className='timer-block'>
                  <span className='timer-value'>
                    {String(timeRemaining.hours).padStart(2, '0')}
                  </span>
                  <span className='timer-label'>HRS</span>
                </div>
                <div className='timer-separator'>:</div>
                <div className='timer-block'>
                  <span className='timer-value'>
                    {String(timeRemaining.minutes).padStart(2, '0')}
                  </span>
                  <span className='timer-label'>MIN</span>
                </div>
                <div className='timer-separator'>:</div>
                <div className='timer-block'>
                  <span className='timer-value'>
                    {String(timeRemaining.seconds).padStart(2, '0')}
                  </span>
                  <span className='timer-label'>SEC</span>
                </div>
              </div>
              <p className='countdown-footer'>
                Showing 2025 Season Data Until First Pitch
              </p>
            </div>
          </Card>
        )}

        <h1 className='page-title mlb-title' data-testid='mlb-title'>
          mlb standings
        </h1>

        {/* View Mode Toggle */}
        <div className='view-mode-toggle'>
          <Button
            variant={viewMode === 'standings' ? 'primary' : 'ghost'}
            className={viewMode === 'standings' ? 'active' : ''}
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
          </Button>
          <Button
            variant={viewMode === 'teamStats' ? 'primary' : 'ghost'}
            className={viewMode === 'teamStats' ? 'active' : ''}
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
          </Button>
          <Button
            variant={viewMode === 'playoff' ? 'primary' : 'ghost'}
            className={viewMode === 'playoff' ? 'active' : ''}
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
          </Button>
          <Button
            variant={viewMode === 'rankings' ? 'primary' : 'ghost'}
            className={viewMode === 'rankings' ? 'active' : ''}
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
          </Button>
          <Button
            variant={viewMode === 'scoreboard' ? 'primary' : 'ghost'}
            className={viewMode === 'scoreboard' ? 'active' : ''}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'scoreboard',
                timestamp: new Date().toISOString(),
              });
              setViewMode('scoreboard');
            }}
            disabled={loading}
          >
            Scoreboard
          </Button>
          <Button
            variant={viewMode === 'splits' ? 'primary' : 'ghost'}
            className={viewMode === 'splits' ? 'active' : ''}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'splits',
                timestamp: new Date().toISOString(),
              });
              setViewMode('splits');
            }}
            disabled={loading}
          >
            Split Heatmap
          </Button>
          <Button
            variant={viewMode === 'leaders' ? 'primary' : 'ghost'}
            className={viewMode === 'leaders' ? 'active' : ''}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'leaders',
                timestamp: new Date().toISOString(),
              });
              setViewMode('leaders');
            }}
            disabled={loading}
          >
            Leaders
          </Button>
        </div>

        {/* League Filter (only for standings view) */}
        {viewMode === 'standings' && (
          <div className='league-filter'>
            <Button
              variant={selectedLeague === 'all' ? 'secondary' : 'ghost'}
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
              size='sm'
            >
              All
            </Button>
            <Button
              variant={selectedLeague === 'AL' ? 'secondary' : 'ghost'}
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
              size='sm'
            >
              American League
            </Button>
            <Button
              variant={selectedLeague === 'NL' ? 'secondary' : 'ghost'}
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
              size='sm'
            >
              National League
            </Button>
          </div>
        )}

        {loading ? (
          <div className='loading-spinner' aria-label='Loading MLB standings' />
        ) : errorMessage ? (
          <Card className='error-card'>
            <div className='error-message'>{errorMessage}</div>
          </Card>
        ) : (
          <>
            {viewMode === 'standings' && renderStandings()}
            {viewMode === 'teamStats' && renderTeamStats()}
            {viewMode === 'playoff' && renderPlayoffRace()}
            {viewMode === 'rankings' && renderRankings()}
            {viewMode === 'scoreboard' && renderScoreboard()}
            {viewMode === 'splits' && renderSplitHeatmap()}
            {viewMode === 'leaders' && renderLeaders()}
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
          <Card key={divIndex} className='division-section'>
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
                        {renderTeamLogo(team.team.id)}
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
                          team.streak?.streakType === 'wins'
                            ? 'win-streak'
                            : 'loss-streak'
                        }
                      >
                        {team.streak?.streakCode ?? '-'}
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
          </Card>
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
        {getAllTeams().every(t => !t.records) ? (
          <p className='section-subtitle'>
            Split record data is not yet available for this season.
          </p>
        ) : null}
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
              const expected = team.records?.expectedRecords?.find(
                r => r.type === 'xWinLoss'
              );

              return (
                <Card key={team.team.id} className='team-stats-card'>
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
                      {renderTeamLogo(team.team.id, 22)}
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
                </Card>
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
      <Card className='playoff-section'>
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
                  team.divisionRank === '1' ||
                  team.wildCardLeader ||
                  (team.wildCardRank && parseInt(team.wildCardRank) <= 3);
                const isEliminated =
                  team.eliminationNumber === 'E' ||
                  team.wildCardEliminationNumber === 'E';
                const isOnBubble = !isInPlayoff && !isEliminated;

                return (
                  <tr
                    key={team.team.id}
                    className={`${team.clinchIndicator ? 'clinched' : ''} ${isInPlayoff ? 'in-playoff' : isOnBubble ? 'on-bubble' : ''}`}
                  >
                    <td className='team-name text-left'>
                      {renderTeamLogo(team.team.id)}
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
                        {team.divisionChamp || team.divisionRank === '1'
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
      </Card>
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

  function renderScoreboard() {
    const todayStr = localDateStr(0);
    const dateNav = [
      { date: localDateStr(-1), label: 'Yesterday' },
      { date: todayStr, label: 'Today' },
      { date: localDateStr(1), label: 'Tomorrow' },
    ];

    const formatDateHeading = (dateStr: string): string => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
    };

    const teamAbbr = (g: GameTeam) =>
      g.team.abbreviation ??
      g.team.name.split(' ').pop()!.substring(0, 3).toUpperCase();

    const renderGame = (game: Game) => {
      const isLive = game.status.abstractGameState === 'Live';
      const isFinal = game.status.abstractGameState === 'Final';
      const hasScore = isLive || isFinal;
      const innings = game.linescore?.innings ?? [];
      const maxInning = Math.max(9, innings.length);
      const awayTotals = game.linescore?.teams.away;
      const homeTotals = game.linescore?.teams.home;
      const awayScore = game.teams.away.score;
      const homeScore = game.teams.home.score;
      const awayWins = isFinal && game.teams.away.isWinner;
      const homeWins = isFinal && game.teams.home.isWinner;
      const awayLeading =
        isLive &&
        awayScore !== undefined &&
        homeScore !== undefined &&
        awayScore > homeScore;
      const homeLeading =
        isLive &&
        homeScore !== undefined &&
        awayScore !== undefined &&
        homeScore > awayScore;

      return (
        <Card
          key={game.gamePk}
          className={`game-card ${isLive ? 'game-card-live' : ''}`}
        >
          {/* Status bar */}
          <div className='game-header'>
            {isLive ? (
              <>
                <span className='game-status-live'>
                  <span className='live-dot' />
                  {game.linescore?.inningHalf === 'Top' ? '▲' : '▼'}{' '}
                  {game.linescore?.currentInningOrdinal}
                </span>
                <span className='game-count'>
                  {game.linescore?.balls ?? 0}-{game.linescore?.strikes ?? 0} ·{' '}
                  {game.linescore?.outs ?? 0} out
                </span>
              </>
            ) : isFinal ? (
              <span className='game-status-final'>Final</span>
            ) : (
              <span className='game-status-scheduled'>
                {new Date(game.gameDate).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </span>
            )}
          </div>

          {/* Teams + scores — always rendered, score shown as -- when not started */}
          <div className='game-teams'>
            {(['away', 'home'] as const).map(side => {
              const t = game.teams[side];
              const wins = side === 'away' ? awayWins : homeWins;
              const leading = side === 'away' ? awayLeading : homeLeading;
              const score = side === 'away' ? awayScore : homeScore;
              return (
                <div
                  key={side}
                  className={`game-team ${wins ? 'game-team-winner' : isFinal ? 'game-team-loser' : ''}`}
                >
                  <span className='game-team-identity'>
                    {renderTeamLogo(t.team.id, 24)}
                    <span className='game-team-info'>
                      <span className='game-team-name'>{t.team.name}</span>
                      {t.probablePitcher && (
                        <span className='game-pitcher'>
                          {t.probablePitcher.fullName}
                        </span>
                      )}
                    </span>
                  </span>
                  <span
                    className={`game-score ${leading ? 'game-score-leading' : wins ? 'game-score-winner' : ''}`}
                  >
                    {hasScore ? (score ?? '-') : '--'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Linescore — only for live/final games with inning data */}
          {hasScore && innings.length > 0 && (
            <div className='linescore-wrap'>
              <table className='linescore-table'>
                <thead>
                  <tr>
                    <th className='linescore-team-col' />
                    {Array.from({ length: maxInning }, (_, i) => (
                      <th key={i + 1} className='linescore-inning-col'>
                        {i + 1}
                      </th>
                    ))}
                    <th className='linescore-sep' />
                    <th className='linescore-total-col'>R</th>
                    <th className='linescore-total-col'>H</th>
                    <th className='linescore-total-col'>E</th>
                  </tr>
                </thead>
                <tbody>
                  {(['away', 'home'] as const).map(side => {
                    const totals = side === 'away' ? awayTotals : homeTotals;
                    const teamSide =
                      side === 'away' ? game.teams.away : game.teams.home;
                    return (
                      <tr key={side}>
                        <td className='linescore-team-col'>
                          {teamAbbr(teamSide)}
                        </td>
                        {Array.from({ length: maxInning }, (_, i) => {
                          const inning = innings.find(inn => inn.num === i + 1);
                          const runs = inning?.[side]?.runs;
                          return (
                            <td key={i + 1} className='linescore-inning-col'>
                              {runs !== undefined ? runs : ''}
                            </td>
                          );
                        })}
                        <td className='linescore-sep' />
                        <td className='linescore-total-col'>
                          {totals?.runs ?? '-'}
                        </td>
                        <td className='linescore-total-col'>
                          {totals?.hits ?? '-'}
                        </td>
                        <td className='linescore-total-col'>
                          {totals?.errors ?? '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      );
    };

    const currentGames = scheduleByDate[selectedDate] ?? [];
    const isLoading =
      loadingSchedule && Object.keys(scheduleByDate).length === 0;

    const liveGames = currentGames.filter(
      g => g.status.abstractGameState === 'Live'
    );
    const finalGames = currentGames.filter(
      g => g.status.abstractGameState === 'Final'
    );
    const scheduledGames = currentGames.filter(
      g => g.status.abstractGameState === 'Preview'
    );

    // Teams not playing this day
    const playingIds = new Set(
      currentGames.flatMap(g => [g.teams.home.team.id, g.teams.away.team.id])
    );
    const offTeams = getAllTeams().filter(t => !playingIds.has(t.team.id));

    return (
      <div className='scoreboard-container'>
        {/* Date navigation */}
        <div className='scoreboard-date-nav'>
          {dateNav.map(({ date, label }) => (
            <button
              key={date}
              className={`date-pill ${selectedDate === date ? 'date-pill-active' : ''}`}
              onClick={() => setSelectedDate(date)}
            >
              <span className='date-pill-label'>{label}</span>
              <span className='date-pill-date'>
                {formatDateHeading(date).split(',')[0]}
              </span>
            </button>
          ))}
        </div>

        <div className='scoreboard-day-heading'>
          {formatDateHeading(selectedDate)}
          {selectedDate === todayStr && (
            <Button
              variant='ghost'
              size='sm'
              onClick={fetchSchedule}
              disabled={loadingSchedule}
              className='refresh-btn'
            >
              {loadingSchedule ? '…' : '↻'}
            </Button>
          )}
        </div>

        {isLoading && (
          <div className='loading-spinner' aria-label='Loading schedule' />
        )}

        {scheduleError && (
          <Card className='error-card'>
            <div className='error-message'>{scheduleError}</div>
          </Card>
        )}

        {!isLoading && !scheduleError && (
          <>
            {currentGames.length === 0 ? (
              <Card>
                <p className='section-subtitle' style={{ margin: 0 }}>
                  No games scheduled.
                </p>
              </Card>
            ) : (
              <>
                {liveGames.length > 0 && (
                  <div className='scoreboard-section'>
                    <h3 className='scoreboard-section-title'>
                      <span className='live-dot' /> Live
                    </h3>
                    <div className='games-grid'>
                      {liveGames.map(renderGame)}
                    </div>
                  </div>
                )}
                {finalGames.length > 0 && (
                  <div className='scoreboard-section'>
                    <h3 className='scoreboard-section-title'>Final</h3>
                    <div className='games-grid'>
                      {finalGames.map(renderGame)}
                    </div>
                  </div>
                )}
                {scheduledGames.length > 0 && (
                  <div className='scoreboard-section'>
                    <h3 className='scoreboard-section-title'>Upcoming</h3>
                    <div className='games-grid'>
                      {scheduledGames.map(renderGame)}
                    </div>
                  </div>
                )}
              </>
            )}

            {offTeams.length > 0 && (
              <div className='off-day-section'>
                <span className='off-day-label'>Off today</span>
                <div className='off-day-teams'>
                  {offTeams.map(t => (
                    <span key={t.team.id} className='off-day-chip'>
                      {t.team.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  function renderSplitHeatmap() {
    const splitCategories = [
      { key: 'home', label: 'Home' },
      { key: 'away', label: 'Away' },
      { key: 'day', label: 'Day' },
      { key: 'night', label: 'Night' },
      { key: 'grass', label: 'Grass' },
      { key: 'turf', label: 'Turf' },
      { key: 'left', label: 'vs L' },
      { key: 'right', label: 'vs R' },
      { key: 'lastTen', label: 'L10' },
      { key: 'extraInning', label: 'X-Inn' },
      { key: 'oneRun', label: '1-Run' },
    ];

    const getHeatStyle = (pct: string | undefined): React.CSSProperties => {
      if (!pct)
        return {
          background: 'rgba(255,255,255,0.03)',
          color: 'var(--text-muted)',
        };
      const val = parseFloat(pct);
      if (val >= 0.5) {
        const intensity = Math.min((val - 0.5) * 2, 1);
        return {
          background: `rgba(16, 185, 129, ${0.1 + intensity * 0.35})`,
          color: val >= 0.6 ? '#10b981' : 'var(--text-secondary)',
        };
      }
      const intensity = Math.min((0.5 - val) * 2, 1);
      return {
        background: `rgba(239, 68, 68, ${0.1 + intensity * 0.35})`,
        color: val <= 0.4 ? '#ef4444' : 'var(--text-secondary)',
      };
    };

    const allTeams = getAllTeams().sort(
      (a, b) =>
        parseFloat(b.winningPercentage) - parseFloat(a.winningPercentage)
    );

    const noSplitData = allTeams.every(t => !t.records?.splitRecords?.length);

    return (
      <div className='splits-container'>
        <h2 className='section-title'>Split Performance Heatmap</h2>
        <p className='section-subtitle'>
          Win % by situation — green is strong, red is weak
        </p>
        {noSplitData ? (
          <Card>
            <p className='section-subtitle' style={{ margin: 0 }}>
              Split record data is not yet available for this season.
            </p>
          </Card>
        ) : (
          <Card className='splits-card'>
            <div className='heatmap-scroll'>
              <table className='heatmap-table'>
                <thead>
                  <tr>
                    <th className='heatmap-team-col'>Team</th>
                    <th className='heatmap-record-col'>W-L</th>
                    {splitCategories.map(cat => (
                      <th key={cat.key} className='heatmap-split-col'>
                        {cat.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTeams.map(team => (
                    <tr key={team.team.id} className='heatmap-row'>
                      <td className='heatmap-team-name'>
                        {renderTeamLogo(team.team.id, 16)}
                        {team.team.name}
                      </td>
                      <td className='heatmap-record'>
                        {team.wins}-{team.losses}
                      </td>
                      {splitCategories.map(cat => {
                        const split = getSplitRecord(team, cat.key);
                        return (
                          <td
                            key={cat.key}
                            className='heatmap-cell'
                            style={getHeatStyle(split?.pct)}
                            title={
                              split
                                ? `${split.wins}-${split.losses} (${split.pct})`
                                : 'N/A'
                            }
                          >
                            {split ? `${split.wins}-${split.losses}` : '—'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    );
  }

  function renderLeaders() {
    const hittingCategories = [
      { key: 'homeRuns', label: 'Home Runs', abbr: 'HR' },
      { key: 'battingAverage', label: 'Batting Average', abbr: 'AVG' },
      { key: 'onBasePlusSlugging', label: 'OPS', abbr: 'OPS' },
      { key: 'runsBattedIn', label: 'RBI', abbr: 'RBI' },
      { key: 'hits', label: 'Hits', abbr: 'H' },
      { key: 'stolenBases', label: 'Stolen Bases', abbr: 'SB' },
      { key: 'walks', label: 'Walks', abbr: 'BB' },
    ];
    const pitchingCategories = [
      { key: 'wins', label: 'Wins', abbr: 'W' },
      { key: 'earnedRunAverage', label: 'ERA', abbr: 'ERA' },
      { key: 'strikeouts', label: 'Strikeouts', abbr: 'K' },
      { key: 'saves', label: 'Saves', abbr: 'SV' },
      { key: 'walksAndHitsPerInningPitched', label: 'WHIP', abbr: 'WHIP' },
    ];
    const activeCategories =
      leaderGroup === 'hitting' ? hittingCategories : pitchingCategories;

    const formatValue = (key: string, value: string) => {
      if (
        key === 'battingAverage' ||
        key === 'onBasePlusSlugging' ||
        key === 'walksAndHitsPerInningPitched'
      ) {
        return value.startsWith('0.') ? value.slice(1) : value;
      }
      return value;
    };

    const rankColor = (rank: number) => {
      if (rank === 1) return '#f59e0b';
      if (rank === 2) return '#a1a1aa';
      if (rank === 3) return '#cd7f32';
      return 'var(--text-muted)';
    };

    const allTeams = Array.from(
      new Map(
        leaders.flatMap(cat => cat.leaders).map(e => [e.team.id, e.team])
      ).values()
    ).sort((a, b) => a.name.localeCompare(b.name));

    if (loadingLeaders && leaders.length === 0) {
      return <div className='loading-spinner' aria-label='Loading leaders' />;
    }

    if (leadersError) {
      return (
        <Card className='error-card'>
          <div className='error-message'>{leadersError}</div>
        </Card>
      );
    }

    return (
      <div className='leaders-container'>
        <h2 className='section-title'>League Leaders</h2>
        <p className='section-subtitle'>
          Top 10 individual performers — {new Date().getFullYear()} season
        </p>

        <div className='leaders-controls'>
          <div className='leaders-group-toggle'>
            <Button
              variant={leaderGroup === 'hitting' ? 'secondary' : 'ghost'}
              size='sm'
              onClick={() => setLeaderGroup('hitting')}
            >
              Hitting
            </Button>
            <Button
              variant={leaderGroup === 'pitching' ? 'secondary' : 'ghost'}
              size='sm'
              onClick={() => setLeaderGroup('pitching')}
            >
              Pitching
            </Button>
          </div>

          <select
            className='leaders-team-select'
            value={leaderTeamFilter ?? ''}
            onChange={e =>
              setLeaderTeamFilter(
                e.target.value === '' ? null : Number(e.target.value)
              )
            }
          >
            <option value=''>All Teams</option>
            {allTeams.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className='leaders-grid'>
          {activeCategories.map(cat => {
            const categoryData = leaders.find(
              l => l.leaderCategory === cat.key
            );
            const entries = leaderTeamFilter
              ? (categoryData?.leaders.filter(
                  e => e.team.id === leaderTeamFilter
                ) ?? [])
              : (categoryData?.leaders ?? []);
            return (
              <Card key={cat.key} className='leader-card'>
                <div className='leader-card-header'>
                  <h3 className='leader-card-title'>{cat.label}</h3>
                  <span className='leader-card-abbr'>{cat.abbr}</span>
                </div>
                <div className='leader-list'>
                  {entries.length > 0 ? (
                    entries.map(entry => (
                      <div key={entry.person.id} className='leader-row'>
                        <span
                          className='leader-rank'
                          style={{ color: rankColor(entry.rank) }}
                        >
                          {entry.rank}
                        </span>
                        {renderTeamLogo(entry.team.id, 18)}
                        <span className='leader-name'>
                          {entry.person.fullName}
                        </span>
                        <span className='leader-team'>
                          {entry.team.name.split(' ').pop()}
                        </span>
                        <span className='leader-value'>
                          {formatValue(cat.key, entry.value)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className='leader-empty'>
                      {leaderTeamFilter ? 'Not in top 10' : 'No data available'}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
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
      <Card className='ranking-section'>
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
                <span className='ranking-team'>
                  {renderTeamLogo(team.team.id, 18)}
                  {team.team.name}
                </span>
                <span
                  className={`ranking-stat ${statType === 'runDiff' && team.runDifferential >= 0 ? 'positive-diff' : statType === 'runDiff' ? 'negative-diff' : ''}`}
                >
                  {statValue}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    );

    return (
      <div className='rankings-container'>
        <h2 className='section-title'>League Rankings</h2>
        <p className='section-subtitle'>Top 10 teams in each category</p>
        <div className='rankings-grid'>
          {renderRankingTable(rankings.byRecord, 'Best Records', 'record')}
          {renderRankingTable(
            rankings.byRunsScored,
            'Most Runs Scored',
            'runsScored'
          )}
          {renderRankingTable(
            rankings.byRunsAllowed,
            'Fewest Runs Allowed',
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
            'Best Home Field Advantage',
            'homeAdv'
          )}
        </div>
      </div>
    );
  }
}

export default MLB;
