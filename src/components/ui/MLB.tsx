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

interface PlayerStatSplit {
  rank: number;
  player: { id: number; fullName: string };
  team: { id: number; name: string };
  position?: { abbreviation: string };
  stat: Record<string, string | number>;
}

interface Transaction {
  id: number;
  date: string;
  typeCode: string;
  typeDesc: string;
  description: string;
  person?: { id: number; fullName: string };
  fromTeam?: { id: number; name: string };
  toTeam?: { id: number; name: string };
}

interface BoxscoreBatter {
  personId: number;
  fullName: string;
  position: string;
  ab: number;
  r: number;
  h: number;
  rbi: number;
  bb: number;
  k: number;
  lob: number;
  avg: string;
}

interface BoxscorePitcher {
  personId: number;
  fullName: string;
  ip: string;
  h: number;
  r: number;
  er: number;
  bb: number;
  k: number;
  era: string;
  note: string;
}

interface BoxscoreTeamData {
  team: { id: number; name: string };
  batters: BoxscoreBatter[];
  pitchers: BoxscorePitcher[];
  totals: { ab: number; r: number; h: number; rbi: number; bb: number; k: number; lob: number };
}

interface BoxscoreData {
  away: BoxscoreTeamData;
  home: BoxscoreTeamData;
}

interface PitchArsenalEntry {
  code: string;
  description: string;
  percentage: number;
  averageSpeed: number;
  count: number;
}

interface ArsenalPitcher {
  id: number;
  fullName: string;
  teamName: string;
}

interface GameRecap {
  gamePk: number;
  awayTeam: string;
  awayTeamId: number;
  homeTeam: string;
  homeTeamId: number;
  awayScore: number;
  homeScore: number;
  headline: string;
  blurb: string;
  imageUrl: string;
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
    | 'playerStats'
    | 'transactions'
    | 'powerRankings'
    | 'trends'
    | 'boxscore'
    | 'arsenal'
    | 'recaps'
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
  const [leaderTeamSearch, setLeaderTeamSearch] = useState('');

  const [playerStats, setPlayerStats] = useState<PlayerStatSplit[]>([]);
  const [loadingPlayerStats, setLoadingPlayerStats] = useState(false);
  const [playerStatsError, setPlayerStatsError] = useState('');
  const [playerStatsGroup, setPlayerStatsGroup] = useState<
    'hitting' | 'pitching'
  >('hitting');
  const [playerStatsSortKey, setPlayerStatsSortKey] = useState('ops');
  const [playerStatsSortDir, setPlayerStatsSortDir] = useState<'asc' | 'desc'>(
    'desc'
  );

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [transactionsError, setTransactionsError] = useState('');
  const [txnTypeFilter, setTxnTypeFilter] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });

  // Boxscore state
  const [boxscoreGamePk, setBoxscoreGamePk] = useState<number | null>(null);
  const [boxscoreData, setBoxscoreData] = useState<BoxscoreData | null>(null);
  const [loadingBoxscore, setLoadingBoxscore] = useState(false);
  const [boxscoreError, setBoxscoreError] = useState('');

  // Pitch Arsenal state
  const [arsenalPitchers, setArsenalPitchers] = useState<ArsenalPitcher[]>([]);
  const [loadingArsenalPitchers, setLoadingArsenalPitchers] = useState(false);
  const [arsenalPlayerId, setArsenalPlayerId] = useState<number | null>(null);
  const [arsenalPlayerName, setArsenalPlayerName] = useState('');
  const [arsenalData, setArsenalData] = useState<PitchArsenalEntry[]>([]);
  const [loadingArsenal, setLoadingArsenal] = useState(false);
  const [arsenalError, setArsenalError] = useState('');

  // Game Recaps state
  const [recaps, setRecaps] = useState<GameRecap[]>([]);
  const [loadingRecaps, setLoadingRecaps] = useState(false);
  const [recapsError, setRecapsError] = useState('');
  const [recapsDate, setRecapsDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
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

  const fetchPlayerStats = async (
    group: 'hitting' | 'pitching',
    sortStat: string,
    order: 'asc' | 'desc'
  ) => {
    setLoadingPlayerStats(true);
    setPlayerStatsError('');
    try {
      const season = new Date().getFullYear();
      const url = `https://statsapi.mlb.com/api/v1/stats?stats=season&group=${group}&sportId=1&season=${season}&playerPool=Qualified&limit=100&sortStat=${sortStat}&order=${order}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch player stats');
      const data = await response.json();
      setPlayerStats(data.stats?.[0]?.splits ?? []);
    } catch (error) {
      setPlayerStatsError(
        error instanceof Error ? error.message : 'Failed to fetch player stats'
      );
    } finally {
      setLoadingPlayerStats(false);
    }
  };

  useEffect(() => {
    if (viewMode !== 'playerStats') return;
    fetchPlayerStats(playerStatsGroup, playerStatsSortKey, playerStatsSortDir);
  }, [viewMode, playerStatsGroup, playerStatsSortKey, playerStatsSortDir]);

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    setTransactionsError('');
    try {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      const fmt = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const url = `https://statsapi.mlb.com/api/v1/transactions?sportId=1&startDate=${fmt(start)}&endDate=${fmt(end)}&limit=200`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data.transactions ?? []);
    } catch (error) {
      setTransactionsError(
        error instanceof Error ? error.message : 'Failed to fetch transactions'
      );
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (viewMode !== 'transactions') return;
    if (transactions.length > 0) return;
    fetchTransactions();
  }, [viewMode, transactions.length]);

  const fetchBoxscore = async (gamePk: number) => {
    setLoadingBoxscore(true);
    setBoxscoreError('');
    setBoxscoreData(null);
    try {
      const response = await fetch(`https://statsapi.mlb.com/api/v1/game/${gamePk}/boxscore`);
      if (!response.ok) throw new Error('Failed to fetch boxscore');
      const raw = await response.json();

      const parseTeam = (side: 'away' | 'home'): BoxscoreTeamData => {
        const t = raw.teams[side];
        const players = t.players as Record<string, {
          person: { id: number; fullName: string };
          position?: { abbreviation: string };
          stats: {
            batting?: Record<string, number | string>;
            pitching?: Record<string, number | string>;
          };
          gameStatus?: { isOnBench?: boolean };
          battingOrder?: string;
          pitchingNotes?: string;
        }>;

        const batterIds: number[] = t.batters ?? [];
        const pitcherIds: number[] = t.pitchers ?? [];

        const batters: BoxscoreBatter[] = batterIds
          .map(id => players[`ID${id}`])
          .filter(p => p && p.stats?.batting && !p.gameStatus?.isOnBench)
          .map(p => {
            const s = p.stats.batting!;
            return {
              personId: p.person.id,
              fullName: p.person.fullName,
              position: p.position?.abbreviation ?? '—',
              ab: Number(s.atBats ?? 0),
              r: Number(s.runs ?? 0),
              h: Number(s.hits ?? 0),
              rbi: Number(s.rbi ?? 0),
              bb: Number(s.baseOnBalls ?? 0),
              k: Number(s.strikeOuts ?? 0),
              lob: Number(s.leftOnBase ?? 0),
              avg: String(s.avg ?? '.000'),
            };
          });

        const pitchers: BoxscorePitcher[] = pitcherIds
          .map(id => players[`ID${id}`])
          .filter(p => p && p.stats?.pitching)
          .map(p => {
            const s = p.stats.pitching!;
            return {
              personId: p.person.id,
              fullName: p.person.fullName,
              ip: String(s.inningsPitched ?? '0.0'),
              h: Number(s.hits ?? 0),
              r: Number(s.runs ?? 0),
              er: Number(s.earnedRuns ?? 0),
              bb: Number(s.baseOnBalls ?? 0),
              k: Number(s.strikeOuts ?? 0),
              era: String(s.era ?? '-.--'),
              note: p.pitchingNotes ?? '',
            };
          });

        const ts = t.teamStats?.batting ?? {};
        return {
          team: { id: t.team.id, name: t.team.name },
          batters,
          pitchers,
          totals: {
            ab: Number(ts.atBats ?? 0),
            r: Number(ts.runs ?? 0),
            h: Number(ts.hits ?? 0),
            rbi: Number(ts.rbi ?? 0),
            bb: Number(ts.baseOnBalls ?? 0),
            k: Number(ts.strikeOuts ?? 0),
            lob: Number(ts.leftOnBase ?? 0),
          },
        };
      };

      setBoxscoreData({ away: parseTeam('away'), home: parseTeam('home') });
    } catch (error) {
      setBoxscoreError(error instanceof Error ? error.message : 'Failed to fetch boxscore');
    } finally {
      setLoadingBoxscore(false);
    }
  };

  useEffect(() => {
    if (viewMode !== 'boxscore') return;
    // Reuse schedule data; fetch if not loaded
    if (Object.keys(scheduleByDate).length === 0) fetchSchedule();
  }, [viewMode]);

  const fetchArsenalPitchers = async () => {
    setLoadingArsenalPitchers(true);
    try {
      const season = new Date().getFullYear();
      const url = `https://statsapi.mlb.com/api/v1/stats?stats=season&group=pitching&sportId=1&season=${season}&playerPool=Qualified&limit=40&sortStat=strikeOuts&order=desc`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch pitchers');
      const data = await response.json();
      const splits = data.stats?.[0]?.splits ?? [];
      const pitchers: ArsenalPitcher[] = splits.map((s: {
        player: { id: number; fullName: string };
        team: { name: string };
      }) => ({
        id: s.player.id,
        fullName: s.player.fullName,
        teamName: s.team.name,
      }));
      setArsenalPitchers(pitchers);
      if (pitchers.length > 0 && !arsenalPlayerId) {
        setArsenalPlayerId(pitchers[0].id);
        setArsenalPlayerName(pitchers[0].fullName);
      }
    } catch {
      // silently fail — UI will show empty list
    } finally {
      setLoadingArsenalPitchers(false);
    }
  };

  const fetchArsenal = async (playerId: number) => {
    setLoadingArsenal(true);
    setArsenalError('');
    setArsenalData([]);
    try {
      const season = new Date().getFullYear();
      const url = `https://statsapi.mlb.com/api/v1/people/${playerId}/stats?stats=pitchArsenal&season=${season}&group=pitching`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch arsenal');
      const data = await response.json();
      const splits = data.stats?.[0]?.splits ?? [];
      const entries: PitchArsenalEntry[] = splits.map((s: {
        stat: {
          type: { code: string; description: string };
          percentage: number;
          averageSpeed: number;
          count: number;
        };
      }) => ({
        code: s.stat.type.code,
        description: s.stat.type.description,
        percentage: s.stat.percentage,
        averageSpeed: s.stat.averageSpeed,
        count: s.stat.count,
      })).sort((a: PitchArsenalEntry, b: PitchArsenalEntry) => b.percentage - a.percentage);
      setArsenalData(entries);
    } catch (error) {
      setArsenalError(error instanceof Error ? error.message : 'Failed to fetch arsenal');
    } finally {
      setLoadingArsenal(false);
    }
  };

  useEffect(() => {
    if (viewMode !== 'arsenal') return;
    if (arsenalPitchers.length === 0) fetchArsenalPitchers();
  }, [viewMode]);

  useEffect(() => {
    if (viewMode !== 'arsenal' || !arsenalPlayerId) return;
    fetchArsenal(arsenalPlayerId);
  }, [viewMode, arsenalPlayerId]);

  const fetchRecaps = async (date: string) => {
    setLoadingRecaps(true);
    setRecapsError('');
    setRecaps([]);
    try {
      const schedRes = await fetch(
        `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${date}&hydrate=linescore`
      );
      if (!schedRes.ok) throw new Error('Failed to fetch schedule');
      const schedData: ScheduleData = await schedRes.json();
      const games = schedData.dates?.[0]?.games ?? [];
      const finished = games.filter(g => g.status.abstractGameState === 'Final');

      const results = await Promise.all(
        finished.map(async g => {
          try {
            const contentRes = await fetch(`https://statsapi.mlb.com/api/v1/game/${g.gamePk}/content`);
            if (!contentRes.ok) return null;
            const content = await contentRes.json();
            const recap = content?.editorial?.recap?.mlb;
            if (!recap) return null;
            const cuts = recap.image?.cuts ?? [];
            const img = (cuts.find((c: { width: number; src: string }) => c.width === 640) ?? cuts[0])?.src ?? '';
            return {
              gamePk: g.gamePk,
              awayTeam: g.teams.away.team.name,
              awayTeamId: g.teams.away.team.id,
              homeTeam: g.teams.home.team.name,
              homeTeamId: g.teams.home.team.id,
              awayScore: g.teams.away.score ?? 0,
              homeScore: g.teams.home.score ?? 0,
              headline: recap.headline ?? '',
              blurb: recap.blurb ?? '',
              imageUrl: img,
            } as GameRecap;
          } catch {
            return null;
          }
        })
      );
      setRecaps(results.filter((r): r is GameRecap => r !== null));
    } catch (error) {
      setRecapsError(error instanceof Error ? error.message : 'Failed to fetch recaps');
    } finally {
      setLoadingRecaps(false);
    }
  };

  useEffect(() => {
    if (viewMode !== 'recaps') return;
    fetchRecaps(recapsDate);
  }, [viewMode, recapsDate]);

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
          <Button
            variant={viewMode === 'playerStats' ? 'primary' : 'ghost'}
            className={viewMode === 'playerStats' ? 'active' : ''}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'playerStats',
                timestamp: new Date().toISOString(),
              });
              setViewMode('playerStats');
            }}
            disabled={loading}
          >
            Player Stats
          </Button>
          <Button
            variant={viewMode === 'transactions' ? 'primary' : 'ghost'}
            className={viewMode === 'transactions' ? 'active' : ''}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'transactions',
                timestamp: new Date().toISOString(),
              });
              setViewMode('transactions');
            }}
            disabled={loading}
          >
            Roster Moves
          </Button>
          <Button
            variant={viewMode === 'powerRankings' ? 'primary' : 'ghost'}
            className={viewMode === 'powerRankings' ? 'active' : ''}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'powerRankings',
                timestamp: new Date().toISOString(),
              });
              setViewMode('powerRankings');
            }}
            disabled={loading}
          >
            Power Rankings
          </Button>
          <Button
            variant={viewMode === 'trends' ? 'primary' : 'ghost'}
            className={viewMode === 'trends' ? 'active' : ''}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'trends',
                timestamp: new Date().toISOString(),
              });
              setViewMode('trends');
            }}
            disabled={loading}
          >
            Team Trends
          </Button>
          <Button
            variant={viewMode === 'boxscore' ? 'primary' : 'ghost'}
            className={viewMode === 'boxscore' ? 'active' : ''}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'boxscore',
                timestamp: new Date().toISOString(),
              });
              setViewMode('boxscore');
            }}
            disabled={loading}
          >
            Boxscore
          </Button>
          <Button
            variant={viewMode === 'arsenal' ? 'primary' : 'ghost'}
            className={viewMode === 'arsenal' ? 'active' : ''}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'arsenal',
                timestamp: new Date().toISOString(),
              });
              setViewMode('arsenal');
            }}
            disabled={loading}
          >
            Pitch Arsenal
          </Button>
          <Button
            variant={viewMode === 'recaps' ? 'primary' : 'ghost'}
            className={viewMode === 'recaps' ? 'active' : ''}
            onClick={() => {
              logger.info('View mode changed', {
                from: viewMode,
                to: 'recaps',
                timestamp: new Date().toISOString(),
              });
              setViewMode('recaps');
            }}
            disabled={loading}
          >
            Game Recaps
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
            {viewMode === 'playerStats' && renderPlayerStats()}
            {viewMode === 'transactions' && renderTransactions()}
            {viewMode === 'powerRankings' && renderPowerRankings()}
            {viewMode === 'trends' && renderTeamTrends()}
            {viewMode === 'boxscore' && renderBoxscore()}
            {viewMode === 'arsenal' && renderPitchArsenal()}
            {viewMode === 'recaps' && renderGameRecaps()}
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

    const selectedTeamName =
      leaderTeamFilter != null
        ? (allTeams.find(t => t.id === leaderTeamFilter)?.name ?? '')
        : '';

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

          <div className='leaders-team-search'>
            {leaderTeamFilter != null ? (
              <div className='leaders-team-chip'>
                {renderTeamLogo(leaderTeamFilter, 16)}
                <span>{selectedTeamName}</span>
                <button
                  className='leaders-team-chip-clear'
                  onClick={() => {
                    setLeaderTeamFilter(null);
                    setLeaderTeamSearch('');
                  }}
                  aria-label='Clear team filter'
                >
                  ×
                </button>
              </div>
            ) : (
              <>
                <input
                  className='leaders-team-input'
                  type='text'
                  placeholder='Filter by team…'
                  value={leaderTeamSearch}
                  onChange={e => setLeaderTeamSearch(e.target.value)}
                />
                {leaderTeamSearch.trim().length > 0 && (
                  <ul className='leaders-team-suggestions'>
                    {allTeams
                      .filter(t =>
                        t.name
                          .toLowerCase()
                          .includes(leaderTeamSearch.toLowerCase().trim())
                      )
                      .map(t => (
                        <li
                          key={t.id}
                          role='option'
                          aria-selected={leaderTeamFilter === t.id}
                          className='leaders-team-suggestion'
                          onClick={() => {
                            setLeaderTeamFilter(t.id);
                            setLeaderTeamSearch('');
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              setLeaderTeamFilter(t.id);
                              setLeaderTeamSearch('');
                            }
                          }}
                        >
                          {renderTeamLogo(t.id, 16)}
                          {t.name}
                        </li>
                      ))}
                  </ul>
                )}
              </>
            )}
          </div>
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

  function renderPlayerStats() {
    const hittingCols = [
      { key: 'avg', label: 'AVG', asc: false },
      { key: 'ops', label: 'OPS', asc: false },
      { key: 'obp', label: 'OBP', asc: false },
      { key: 'slg', label: 'SLG', asc: false },
      { key: 'homeRuns', label: 'HR', asc: false },
      { key: 'rbi', label: 'RBI', asc: false },
      { key: 'hits', label: 'H', asc: false },
      { key: 'stolenBases', label: 'SB', asc: false },
      { key: 'strikeOuts', label: 'K', asc: true },
      { key: 'baseOnBalls', label: 'BB', asc: false },
    ];
    const pitchingCols = [
      { key: 'era', label: 'ERA', asc: true },
      { key: 'whip', label: 'WHIP', asc: true },
      { key: 'wins', label: 'W', asc: false },
      { key: 'strikeOuts', label: 'K', asc: false },
      { key: 'inningsPitched', label: 'IP', asc: false },
      { key: 'strikeoutsPer9Inn', label: 'K/9', asc: false },
      { key: 'walksPer9Inn', label: 'BB/9', asc: true },
      { key: 'hitsPer9Inn', label: 'H/9', asc: true },
      { key: 'saves', label: 'SV', asc: false },
      { key: 'holds', label: 'HLD', asc: false },
    ];
    const cols = playerStatsGroup === 'hitting' ? hittingCols : pitchingCols;

    const handleSort = (key: string, defaultAsc: boolean) => {
      if (playerStatsSortKey === key) {
        setPlayerStatsSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setPlayerStatsSortKey(key);
        setPlayerStatsSortDir(defaultAsc ? 'asc' : 'desc');
      }
    };

    const fmtStat = (key: string, val: string | number | undefined) => {
      if (val === undefined || val === null) return '—';
      const s = String(val);
      if (key === 'avg' || key === 'obp' || key === 'slg' || key === 'ops') {
        return s.startsWith('0.') ? s.slice(1) : s;
      }
      if (key === 'whip') return s.startsWith('0.') ? s.slice(1) : s;
      if (key === 'inningsPitched') return s;
      return s;
    };

    return (
      <div className='player-stats-container'>
        <h2 className='section-title'>Player Stats</h2>
        <p className='section-subtitle'>
          Qualified players — {new Date().getFullYear()} season
        </p>

        <div className='player-stats-controls'>
          <div className='leaders-group-toggle'>
            <Button
              variant={playerStatsGroup === 'hitting' ? 'secondary' : 'ghost'}
              size='sm'
              onClick={() => {
                setPlayerStatsGroup('hitting');
                setPlayerStatsSortKey('ops');
                setPlayerStatsSortDir('desc');
              }}
            >
              Hitting
            </Button>
            <Button
              variant={playerStatsGroup === 'pitching' ? 'secondary' : 'ghost'}
              size='sm'
              onClick={() => {
                setPlayerStatsGroup('pitching');
                setPlayerStatsSortKey('era');
                setPlayerStatsSortDir('asc');
              }}
            >
              Pitching
            </Button>
          </div>
        </div>

        {loadingPlayerStats ? (
          <div className='loading-spinner' aria-label='Loading player stats' />
        ) : playerStatsError ? (
          <Card className='error-card'>
            <div className='error-message'>{playerStatsError}</div>
          </Card>
        ) : (
          <div className='player-stats-table-wrap'>
            <table className='player-stats-table'>
              <thead>
                <tr>
                  <th className='ps-rank'>#</th>
                  <th className='ps-player'>Player</th>
                  <th className='ps-team'>Team</th>
                  {playerStatsGroup === 'hitting' && (
                    <th className='ps-pos'>POS</th>
                  )}
                  {cols.map(col => (
                    <th
                      key={col.key}
                      className={`ps-stat ${playerStatsSortKey === col.key ? 'ps-sorted' : ''}`}
                      onClick={() => handleSort(col.key, col.asc)}
                    >
                      {col.label}
                      {playerStatsSortKey === col.key && (
                        <span className='ps-sort-arrow'>
                          {playerStatsSortDir === 'asc' ? ' ↑' : ' ↓'}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {playerStats.map((row, i) => (
                  <tr key={row.player.id} className='ps-row'>
                    <td className='ps-rank'>{i + 1}</td>
                    <td className='ps-player'>
                      {renderTeamLogo(row.team.id, 16)}
                      <span>{row.player.fullName}</span>
                    </td>
                    <td className='ps-team'>
                      {row.team.name.split(' ').pop()}
                    </td>
                    {playerStatsGroup === 'hitting' && (
                      <td className='ps-pos'>
                        {row.position?.abbreviation ?? '—'}
                      </td>
                    )}
                    {cols.map(col => (
                      <td
                        key={col.key}
                        className={`ps-stat ${playerStatsSortKey === col.key ? 'ps-sorted' : ''}`}
                      >
                        {fmtStat(
                          col.key,
                          row.stat[col.key] as string | number | undefined
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  function renderTransactions() {
    const typeLabels: Record<string, string> = {
      all: 'All',
      'Status Change': 'IL / Activation',
      Selected: 'Called Up',
      Optioned: 'Optioned',
      'Designated for Assignment': 'DFA',
      'Signed as Free Agent': 'Signed',
      Assigned: 'Assigned',
      Outrighted: 'Outrighted',
    };

    const txnTypes = [
      'all',
      'Status Change',
      'Selected',
      'Optioned',
      'Designated for Assignment',
      'Signed as Free Agent',
    ];

    const filtered =
      txnTypeFilter === 'all'
        ? transactions
        : transactions.filter(t => t.typeDesc === txnTypeFilter);

    const txnIcon = (typeDesc: string) => {
      if (typeDesc === 'Status Change') return '🏥';
      if (typeDesc === 'Selected') return '⬆️';
      if (typeDesc === 'Optioned') return '⬇️';
      if (typeDesc === 'Designated for Assignment') return '✂️';
      if (typeDesc === 'Signed as Free Agent') return '📝';
      if (typeDesc === 'Assigned') return '↩️';
      return '•';
    };

    const groupByDate = (txns: Transaction[]) => {
      const groups: Record<string, Transaction[]> = {};
      for (const t of txns) {
        if (!groups[t.date]) groups[t.date] = [];
        groups[t.date].push(t);
      }
      return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
    };

    return (
      <div className='txn-container'>
        <h2 className='section-title'>Roster Moves</h2>
        <p className='section-subtitle'>Last 7 days of MLB transactions</p>

        <div className='txn-filters'>
          {txnTypes.map(type => (
            <Button
              key={type}
              variant={txnTypeFilter === type ? 'secondary' : 'ghost'}
              size='sm'
              onClick={() => setTxnTypeFilter(type)}
            >
              {typeLabels[type] ?? type}
            </Button>
          ))}
        </div>

        {loadingTransactions ? (
          <div className='loading-spinner' aria-label='Loading transactions' />
        ) : transactionsError ? (
          <Card className='error-card'>
            <div className='error-message'>{transactionsError}</div>
          </Card>
        ) : (
          <div className='txn-list'>
            {groupByDate(filtered).map(([date, txns]) => (
              <div key={date} className='txn-date-group'>
                <div className='txn-date-label'>
                  {new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                {txns.map(t => (
                  <div key={t.id} className='txn-row'>
                    <span className='txn-icon'>{txnIcon(t.typeDesc)}</span>
                    <span className='txn-desc'>{t.description}</span>
                    {t.toTeam && (
                      <span className='txn-team-logo'>
                        {renderTeamLogo(t.toTeam.id, 16)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className='txn-empty'>No transactions found.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderPowerRankings() {
    const allTeams = getAllTeams();

    const score = (t: TeamRecord) => {
      const wpct = parseFloat(t.winningPercentage) || 0;
      const rdNorm = Math.min(1, Math.max(-1, (t.runDifferential ?? 0) / 150));
      const lastTenRecord = t.records?.overallRecords?.find(
        r => r.type === 'lastTen'
      );
      const lastTenWpct = lastTenRecord
        ? lastTenRecord.wins / (lastTenRecord.wins + lastTenRecord.losses || 1)
        : wpct;
      return wpct * 0.5 + ((rdNorm + 1) / 2) * 0.3 + lastTenWpct * 0.2;
    };

    const ranked = [...allTeams]
      .map(t => ({ team: t, score: score(t) }))
      .sort((a, b) => b.score - a.score);

    const lastTenStr = (t: TeamRecord) => {
      const r = t.records?.overallRecords?.find(r => r.type === 'lastTen');
      return r ? `${r.wins}-${r.losses}` : '—';
    };

    const tierLabel = (i: number) => {
      if (i < 5) return { label: 'Elite', cls: 'tier-elite' };
      if (i < 12) return { label: 'Contender', cls: 'tier-contender' };
      if (i < 20) return { label: 'Fringe', cls: 'tier-fringe' };
      return { label: 'Rebuilding', cls: 'tier-rebuilding' };
    };

    return (
      <div className='power-rankings-container'>
        <h2 className='section-title'>Power Rankings</h2>
        <p className='section-subtitle'>
          Composite score: 50% win%, 30% run differential, 20% last-10
        </p>

        <div className='power-rankings-list'>
          {ranked.map(({ team: t }, i) => {
            const tier = tierLabel(i);
            const rd = t.runDifferential ?? 0;
            return (
              <div key={t.team.id} className='pr-row'>
                <span className='pr-rank'>{i + 1}</span>
                <span className='pr-logo'>{renderTeamLogo(t.team.id, 28)}</span>
                <span className='pr-name'>{t.team.name}</span>
                <span className={`pr-tier ${tier.cls}`}>{tier.label}</span>
                <span className='pr-record'>
                  {t.wins}–{t.losses}
                </span>
                <span className='pr-last10'>{lastTenStr(t)}</span>
                <span
                  className={`pr-rd ${rd > 0 ? 'pr-rd-pos' : rd < 0 ? 'pr-rd-neg' : ''}`}
                >
                  {rd > 0 ? '+' : ''}
                  {rd}
                </span>
                <div className='pr-bar-wrap'>
                  <div
                    className='pr-bar'
                    style={{ width: `${Math.round(score(t) * 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderTeamTrends() {
    const allTeams = getAllTeams();

    const byRunsScored = [...allTeams].sort(
      (a, b) => (b.runsScored ?? 0) - (a.runsScored ?? 0)
    );
    const byRunsAllowed = [...allTeams].sort(
      (a, b) => (a.runsAllowed ?? 0) - (b.runsAllowed ?? 0)
    );
    const byRunDiff = [...allTeams].sort(
      (a, b) => (b.runDifferential ?? 0) - (a.runDifferential ?? 0)
    );
    const byWinPct = [...allTeams].sort(
      (a, b) =>
        parseFloat(b.winningPercentage) - parseFloat(a.winningPercentage)
    );

    const trendTable = (
      title: string,
      teams: TeamRecord[],
      valueKey: keyof TeamRecord,
      positive: boolean
    ) => (
      <Card className='trends-card'>
        <h3 className='trends-card-title'>{title}</h3>
        <div className='trends-list'>
          {teams.slice(0, 10).map((t, i) => {
            const val = t[valueKey] as number;
            const max = Math.abs((teams[0][valueKey] as number) || 1);
            const pct = Math.min(100, (Math.abs(val) / max) * 100);
            return (
              <div key={t.team.id} className='trends-row'>
                <span className='trends-rank'>{i + 1}</span>
                {renderTeamLogo(t.team.id, 18)}
                <span className='trends-name'>
                  {t.team.name.split(' ').pop()}
                </span>
                <div className='trends-bar-wrap'>
                  <div
                    className={`trends-bar ${positive ? 'trends-bar-pos' : 'trends-bar-neg'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className='trends-value'>
                  {valueKey === 'winningPercentage'
                    ? `.${String(Math.round(parseFloat(String(val)) * 1000)).padStart(3, '0')}`
                    : val > 0 && valueKey === 'runDifferential'
                      ? `+${val}`
                      : val}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    );

    return (
      <div className='trends-container'>
        <h2 className='section-title'>Team Trends</h2>
        <p className='section-subtitle'>
          League-wide team performance — {new Date().getFullYear()} season
        </p>
        <div className='trends-grid'>
          {trendTable('Most Runs Scored', byRunsScored, 'runsScored', true)}
          {trendTable(
            'Fewest Runs Allowed',
            byRunsAllowed,
            'runsAllowed',
            false
          )}
          {trendTable(
            'Best Run Differential',
            byRunDiff,
            'runDifferential',
            true
          )}
          {trendTable('Best Win %', byWinPct, 'winningPercentage', true)}
        </div>
      </div>
    );
  }
  function renderBoxscore() {
    const todayStr = localDateStr(0);
    const games = scheduleByDate[todayStr] ?? scheduleByDate[localDateStr(-1)] ?? [];
    const finished = games.filter(g => g.status.abstractGameState === 'Final');
    const inProgress = games.filter(g => g.status.abstractGameState === 'Live');
    const selectable = [...inProgress, ...finished];

    const BatterRow = ({ b, isTotal = false }: { b: BoxscoreBatter; isTotal?: boolean }) => (
      <tr className={isTotal ? 'boxscore-totals-row' : 'boxscore-batter-row'}>
        <td className='bs-player'>{isTotal ? 'Totals' : `${b.fullName} ${b.position}`}</td>
        <td>{b.ab}</td>
        <td>{b.r}</td>
        <td>{b.h}</td>
        <td>{b.rbi}</td>
        <td>{b.bb}</td>
        <td>{b.k}</td>
        <td>{b.lob}</td>
        {!isTotal && <td className='bs-avg'>{b.avg}</td>}
        {isTotal && <td />}
      </tr>
    );

    const PitcherRow = ({ p }: { p: BoxscorePitcher }) => (
      <tr className='boxscore-pitcher-row'>
        <td className='bs-player'>
          {p.fullName}
          {p.note && <span className='bs-pitcher-note'> {p.note}</span>}
        </td>
        <td>{p.ip}</td>
        <td>{p.h}</td>
        <td>{p.r}</td>
        <td>{p.er}</td>
        <td>{p.bb}</td>
        <td>{p.k}</td>
        <td className='bs-era'>{p.era}</td>
      </tr>
    );

    const TeamBox = ({ side }: { side: 'away' | 'home' }) => {
      const d = boxscoreData![side];
      return (
        <div className='boxscore-team-section'>
          <div className='boxscore-team-header'>
            {renderTeamLogo(d.team.id, 22)}
            <span className='boxscore-team-name'>{d.team.name}</span>
          </div>
          <div className='boxscore-table-wrap'>
            <table className='boxscore-table'>
              <thead>
                <tr>
                  <th className='bs-player'>Batting</th>
                  <th>AB</th>
                  <th>R</th>
                  <th>H</th>
                  <th>RBI</th>
                  <th>BB</th>
                  <th>K</th>
                  <th>LOB</th>
                  <th>AVG</th>
                </tr>
              </thead>
              <tbody>
                {d.batters.map(b => <BatterRow key={b.personId} b={b} />)}
                <BatterRow b={{ ...d.totals, personId: -1, fullName: '', position: '', avg: '' }} isTotal />
              </tbody>
            </table>
          </div>
          <div className='boxscore-table-wrap' style={{ marginTop: '1rem' }}>
            <table className='boxscore-table'>
              <thead>
                <tr>
                  <th className='bs-player'>Pitching</th>
                  <th>IP</th>
                  <th>H</th>
                  <th>R</th>
                  <th>ER</th>
                  <th>BB</th>
                  <th>K</th>
                  <th>ERA</th>
                </tr>
              </thead>
              <tbody>
                {d.pitchers.map(p => <PitcherRow key={p.personId} p={p} />)}
              </tbody>
            </table>
          </div>
        </div>
      );
    };

    return (
      <div className='boxscore-container'>
        <h2 className='section-title'>Boxscore</h2>
        <p className='section-subtitle'>Select a game to view the full batting and pitching lines</p>

        {loadingSchedule ? (
          <div className='loading-spinner' aria-label='Loading games' />
        ) : selectable.length === 0 ? (
          <Card><p className='section-subtitle' style={{ margin: 0 }}>No completed games today.</p></Card>
        ) : (
          <div className='boxscore-game-picker'>
            {selectable.map(g => {
              const isSelected = g.gamePk === boxscoreGamePk;
              const away = g.teams.away;
              const home = g.teams.home;
              return (
                <button
                  key={g.gamePk}
                  className={`boxscore-game-chip ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    setBoxscoreGamePk(g.gamePk);
                    fetchBoxscore(g.gamePk);
                  }}
                >
                  {renderTeamLogo(away.team.id, 16)}
                  <span>{away.score ?? '—'}</span>
                  <span className='bs-at'>@</span>
                  {renderTeamLogo(home.team.id, 16)}
                  <span>{home.score ?? '—'}</span>
                </button>
              );
            })}
          </div>
        )}

        {loadingBoxscore && (
          <div className='loading-spinner' aria-label='Loading boxscore' />
        )}
        {boxscoreError && (
          <Card className='error-card'><div className='error-message'>{boxscoreError}</div></Card>
        )}
        {boxscoreData && !loadingBoxscore && (
          <div className='boxscore-content'>
            <TeamBox side='away' />
            <TeamBox side='home' />
          </div>
        )}
      </div>
    );
  }

  function renderPitchArsenal() {
    const pitchColors: Record<string, string> = {
      FF: '#ef4444', // Four-seam: red
      SI: '#f97316', // Sinker: orange
      FC: '#eab308', // Cutter: yellow
      SL: '#22c55e', // Slider: green
      SW: '#10b981', // Sweeper: emerald
      CU: '#3b82f6', // Curve: blue
      KC: '#8b5cf6', // Knuckle-curve: purple
      CH: '#ec4899', // Changeup: pink
      FS: '#06b6d4', // Splitter: cyan
      KN: '#a1a1aa', // Knuckleball: gray
    };

    return (
      <div className='arsenal-container'>
        <h2 className='section-title'>Pitch Arsenal</h2>
        <p className='section-subtitle'>
          Pitch mix, usage rate, and average velocity for qualified starters
        </p>

        {loadingArsenalPitchers ? (
          <div className='loading-spinner' aria-label='Loading pitchers' />
        ) : (
          <div className='arsenal-pitcher-grid'>
            {arsenalPitchers.map(p => (
              <button
                key={p.id}
                className={`arsenal-pitcher-chip ${arsenalPlayerId === p.id ? 'selected' : ''}`}
                onClick={() => {
                  setArsenalPlayerId(p.id);
                  setArsenalPlayerName(p.fullName);
                }}
              >
                {renderTeamLogo(
                  // find team id from standings
                  (() => {
                    const team = getAllTeams().find(t => t.team.name === p.teamName);
                    return team?.team.id ?? 0;
                  })(),
                  14
                )}
                <span>{p.fullName.split(' ').pop()}</span>
              </button>
            ))}
          </div>
        )}

        {arsenalPlayerId && (
          <div className='arsenal-detail'>
            {loadingArsenal ? (
              <div className='loading-spinner' aria-label='Loading arsenal' />
            ) : arsenalError ? (
              <Card className='error-card'><div className='error-message'>{arsenalError}</div></Card>
            ) : arsenalData.length === 0 ? (
              <Card><p className='section-subtitle' style={{ margin: 0 }}>No pitch arsenal data available.</p></Card>
            ) : (
              <Card className='arsenal-card'>
                <h3 className='arsenal-pitcher-title'>{arsenalPlayerName}</h3>
                <div className='arsenal-pitches'>
                  {arsenalData.map(pitch => {
                    const color = pitchColors[pitch.code] ?? '#a1a1aa';
                    const pct = Math.round(pitch.percentage * 100);
                    return (
                      <div key={pitch.code} className='arsenal-pitch-row'>
                        <div className='arsenal-pitch-label'>
                          <span className='arsenal-pitch-dot' style={{ background: color }} />
                          <span className='arsenal-pitch-name'>{pitch.description}</span>
                          <span className='arsenal-pitch-code'>({pitch.code})</span>
                        </div>
                        <div className='arsenal-pitch-bar-wrap'>
                          <div
                            className='arsenal-pitch-bar'
                            style={{ width: `${pct}%`, background: color }}
                          />
                        </div>
                        <div className='arsenal-pitch-stats'>
                          <span className='arsenal-pitch-pct'>{pct}%</span>
                          <span className='arsenal-pitch-velo'>
                            {pitch.averageSpeed.toFixed(1)} mph
                          </span>
                          <span className='arsenal-pitch-count'>{pitch.count} pitches</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  function renderGameRecaps() {
    const todayStr = localDateStr(0);
    const yesterdayStr = localDateStr(-1);

    return (
      <div className='recaps-container'>
        <h2 className='section-title'>Game Recaps</h2>
        <div className='recaps-date-picker'>
          <button
            className={`recaps-date-btn ${recapsDate === yesterdayStr ? 'active' : ''}`}
            onClick={() => setRecapsDate(yesterdayStr)}
          >
            Yesterday
          </button>
          <button
            className={`recaps-date-btn ${recapsDate === todayStr ? 'active' : ''}`}
            onClick={() => setRecapsDate(todayStr)}
          >
            Today
          </button>
        </div>

        {loadingRecaps ? (
          <div className='loading-spinner' aria-label='Loading recaps' />
        ) : recapsError ? (
          <Card className='error-card'><div className='error-message'>{recapsError}</div></Card>
        ) : recaps.length === 0 ? (
          <Card><p className='section-subtitle' style={{ margin: 0 }}>No recaps available for this date.</p></Card>
        ) : (
          <div className='recaps-grid'>
            {recaps.map(recap => (
              <Card key={recap.gamePk} className='recap-card'>
                {recap.imageUrl && (
                  <div className='recap-img-wrap'>
                    <img
                      src={recap.imageUrl}
                      alt={recap.headline}
                      className='recap-img'
                      loading='lazy'
                    />
                    <div className='recap-score-badge'>
                      {renderTeamLogo(recap.awayTeamId, 18)}
                      <span className='recap-score'>{recap.awayScore}</span>
                      <span className='recap-at'>@</span>
                      {renderTeamLogo(recap.homeTeamId, 18)}
                      <span className='recap-score'>{recap.homeScore}</span>
                    </div>
                  </div>
                )}
                <div className='recap-body'>
                  <h3 className='recap-headline'>{recap.headline}</h3>
                  <p className='recap-blurb'>{recap.blurb}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }
}

export default MLB;
