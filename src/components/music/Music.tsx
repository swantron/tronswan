import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  spotifyService,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyUser,
  SpotifyPlaylist,
} from '../../services/spotifyService';
import { logger } from '../../utils/logger';
import { runtimeConfig } from '../../utils/runtimeConfig';
import SEO from '../ui/SEO';

import MusicPlayer from './MusicPlayer';
import PlaylistTracks from './PlaylistTracks';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import '../../styles/Music.css';

const Music: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [topTracks, setTopTracks] = useState<SpotifyTrack[]>([]);
  const [topArtists, setTopArtists] = useState<SpotifyArtist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<SpotifyTrack[]>([]);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<SpotifyTrack | null>(
    null
  );
  const [timeRange, setTimeRange] = useState<
    'short_term' | 'medium_term' | 'long_term'
  >('medium_term');
  const [activeTab, setActiveTab] = useState<
    'tracks' | 'artists' | 'recent' | 'liked' | 'playlists'
  >('tracks');
  const [likedSongs, setLikedSongs] = useState<SpotifyTrack[]>([]);
  const [likedSongsTotal, setLikedSongsTotal] = useState(0);
  const [likedSongsOffset, setLikedSongsOffset] = useState(0);
  const [likedSongsHasMore, setLikedSongsHasMore] = useState(false);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [playlistsTotal, setPlaylistsTotal] = useState(0);
  const [playlistsOffset, setPlaylistsOffset] = useState(0);
  const [playlistsHasMore, setPlaylistsHasMore] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] =
    useState<SpotifyPlaylist | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const loadUserData = useCallback(async () => {
    logger.info('Loading Spotify user data', {
      timestamp: new Date().toISOString(),
    });

    try {
      setLoading(true);

      logger.info('Starting parallel API calls for user data');
      const [
        userData,
        tracks,
        artists,
        recent,
        current,
        likedData,
        playlistsData,
      ] = await Promise.all([
        spotifyService.getUserProfile(),
        spotifyService.getTopTracks(timeRange),
        spotifyService.getTopArtists(timeRange),
        spotifyService.getRecentlyPlayed(),
        spotifyService.getCurrentlyPlaying(),
        spotifyService.getLikedSongs(20, 0),
        spotifyService.getPlaylists(20, 0),
      ]);

      logger.info('All API calls completed successfully', {
        hasUserData: !!userData,
        trackCount: tracks?.length || 0,
        artistCount: artists?.length || 0,
        recentCount: recent?.length || 0,
        hasCurrentTrack: !!current,
      });

      setUser(userData);
      setTopTracks(tracks || []);
      setTopArtists(artists || []);
      setRecentlyPlayed(recent || []);
      setCurrentlyPlaying(current);
      setLikedSongs(likedData?.tracks || []);
      setLikedSongsTotal(likedData?.total || 0);
      setLikedSongsHasMore(likedData?.hasMore || false);
      setLikedSongsOffset(0);
      setPlaylists(playlistsData?.playlists || []);
      setPlaylistsTotal(playlistsData?.total || 0);
      setPlaylistsHasMore(playlistsData?.hasMore || false);
      setPlaylistsOffset(0);

      logger.info('Spotify user data loaded successfully', {
        userId: userData?.id,
        trackCount: tracks?.length || 0,
        artistCount: artists?.length || 0,
        recentCount: recent?.length || 0,
        likedCount: likedData?.tracks?.length || 0,
        likedTotal: likedData?.total || 0,
        playlistCount: playlistsData?.playlists?.length || 0,
        playlistTotal: playlistsData?.total || 0,
        hasCurrentTrack: !!current,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to load Spotify user data', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error; // Re-throw so calling code can handle it
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const handleAuthCallback = useCallback(
    async (code: string) => {
      logger.info('Handling Spotify auth callback', {
        hasCode: !!code,
        codeLength: code.length,
        timestamp: new Date().toISOString(),
      });

      setLoading(true);
      setAuthError(null);

      try {
        const success = await spotifyService.handleCallback(code);

        if (success) {
          logger.info(
            'Spotify callback successful, setting authenticated state'
          );
          setIsAuthenticated(true);

          try {
            await loadUserData();
            logger.info('User data loaded successfully after callback');
          } catch (dataError) {
            logger.error('Failed to load user data after callback', {
              dataError,
            });
            setAuthError(
              'Authentication successful but failed to load music data. Please refresh the page.'
            );
          }

          // Clean up URL
          window.history.replaceState({}, document.title, '/music');
        } else {
          logger.error('Spotify authentication failed during callback');
          setAuthError('Spotify authentication failed. Please try again.');
        }
      } catch (error) {
        logger.error('Error during Spotify callback handling', { error });
        setAuthError(
          'An error occurred during authentication. Please try again.'
        );
      }

      setLoading(false);
    },
    [loadUserData]
  );

  const checkAuthStatus = useCallback(async () => {
    logger.debug('Checking Spotify authentication status', {
      timestamp: new Date().toISOString(),
    });

    const authenticated = spotifyService.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      await loadUserData();
    }

    setLoading(false);
  }, [loadUserData]);

  useEffect(() => {
    const initializeMusic = async () => {
      logger.info('Music component initializing', {
        timestamp: new Date().toISOString(),
        url: window.location.href,
        pathname: window.location.pathname,
        hasCodeParam: !!searchParams.get('code'),
        codeValue: searchParams.get('code')?.substring(0, 20) + '...', // Log first 20 chars for debugging
      });

      // Initialize runtime config first
      await runtimeConfig.initialize();

      logger.info('Music page loaded', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });

      // Check for callback code
      const code = searchParams.get('code');
      const isCallbackRoute = window.location.pathname === '/music/callback';

      if (code) {
        logger.info('Found authorization code in URL, processing callback', {
          codeLength: code.length,
          isCallbackRoute,
          pathname: window.location.pathname,
        });
        handleAuthCallback(code);
      } else {
        logger.info('No authorization code found, checking auth status', {
          isCallbackRoute,
          pathname: window.location.pathname,
        });
        checkAuthStatus();
      }
    };

    initializeMusic();
  }, [searchParams, checkAuthStatus, handleAuthCallback]);

  const handleTimeRangeChange = async (
    newTimeRange: 'short_term' | 'medium_term' | 'long_term'
  ) => {
    logger.info('Spotify time range changed', {
      from: timeRange,
      to: newTimeRange,
      timestamp: new Date().toISOString(),
    });

    setTimeRange(newTimeRange);

    if (isAuthenticated) {
      try {
        const [tracks, artists] = await Promise.all([
          spotifyService.getTopTracks(newTimeRange),
          spotifyService.getTopArtists(newTimeRange),
        ]);

        setTopTracks(tracks);
        setTopArtists(artists);
      } catch (error) {
        logger.error('Failed to load data for new time range', { error });
      }
    }
  };

  const handleTabChange = (
    tab: 'tracks' | 'artists' | 'recent' | 'liked' | 'playlists'
  ) => {
    logger.info('Music page tab changed', {
      from: activeTab,
      to: tab,
      timestamp: new Date().toISOString(),
    });

    setActiveTab(tab);
  };

  const handleLogin = async () => {
    logger.info('Spotify login initiated', {
      timestamp: new Date().toISOString(),
    });

    setAuthError(null); // Clear any previous errors

    try {
      await spotifyService.initiateAuth();
    } catch (error) {
      logger.error('Spotify authentication failed', { error });
      setAuthError('Spotify authentication failed. Please try again.');
    }
  };

  const loadMoreLikedSongs = useCallback(async () => {
    if (!likedSongsHasMore) return;

    logger.info('Loading more liked songs', {
      currentOffset: likedSongsOffset,
      currentCount: likedSongs.length,
      timestamp: new Date().toISOString(),
    });

    try {
      const newOffset = likedSongsOffset + 20;
      const likedData = await spotifyService.getLikedSongs(20, newOffset);

      setLikedSongs(prev => [...prev, ...likedData.tracks]);
      setLikedSongsOffset(newOffset);
      setLikedSongsHasMore(likedData.hasMore);

      logger.info('More liked songs loaded successfully', {
        newCount: likedSongs.length + likedData.tracks.length,
        hasMore: likedData.hasMore,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to load more liked songs', { error });
    }
  }, [likedSongsOffset, likedSongs.length, likedSongsHasMore]);

  const loadMorePlaylists = useCallback(async () => {
    if (!playlistsHasMore) return;

    logger.info('Loading more playlists', {
      currentOffset: playlistsOffset,
      currentCount: playlists.length,
      timestamp: new Date().toISOString(),
    });

    try {
      const newOffset = playlistsOffset + 20;
      const playlistsData = await spotifyService.getPlaylists(20, newOffset);

      setPlaylists(prev => [...prev, ...playlistsData.playlists]);
      setPlaylistsOffset(newOffset);
      setPlaylistsHasMore(playlistsData.hasMore);

      logger.info('More playlists loaded successfully', {
        newCount: playlists.length + playlistsData.playlists.length,
        hasMore: playlistsData.hasMore,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to load more playlists', { error });
    }
  }, [playlistsOffset, playlists.length, playlistsHasMore]);

  const handleViewPlaylist = (playlist: SpotifyPlaylist) => {
    logger.info('Viewing playlist tracks', {
      playlistName: playlist.name,
      playlistId: playlist.id,
      timestamp: new Date().toISOString(),
    });
    setSelectedPlaylist(playlist);
  };

  const handleBackToPlaylists = () => {
    logger.info('Back to playlists view');
    setSelectedPlaylist(null);
  };

  const handleLogout = () => {
    logger.info('Spotify logout initiated', {
      timestamp: new Date().toISOString(),
    });

    spotifyService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setTopTracks([]);
    setTopArtists([]);
    setRecentlyPlayed([]);
    setCurrentlyPlaying(null);
    setLikedSongs([]);
    setLikedSongsTotal(0);
    setLikedSongsOffset(0);
    setLikedSongsHasMore(false);
    setPlaylists([]);
    setPlaylistsTotal(0);
    setPlaylistsOffset(0);
    setPlaylistsHasMore(false);
    setSelectedPlaylist(null);
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handlePlayTrack = async (track: SpotifyTrack) => {
    logger.info('Playing track', {
      trackName: track.name,
      trackId: track.id,
      timestamp: new Date().toISOString(),
    });

    try {
      const { spotifyPlaybackService } =
        await import('../../services/spotifyPlaybackService');

      // Check Premium status first
      const premiumCheck = await spotifyPlaybackService.checkPremiumStatus();

      if (!premiumCheck.hasPremium) {
        if (premiumCheck.error === 'Failed to refresh access token') {
          alert(
            'Session Expired\n\n' +
            'Your Spotify session has expired. Please refresh the page to log in again.'
          );
          // Optionally redirect to re-authenticate
          window.location.reload();
        } else {
          alert(
            'Spotify Premium Required\n\n' +
            'To play music directly on this website, you need a Spotify Premium account.\n\n' +
            'Premium allows for web playback control. You can still browse your music and \n' +
            'click the Spotify links to play songs in your Spotify app.'
          );
        }
        return;
      }

      // Initialize player if not already done
      if (!spotifyPlaybackService.isPlayerReady()) {
        logger.info('Initializing Spotify player for track playback');

        // Show loading message
        alert(
          'Setting up music player...\n\nThis may take a few seconds. Please wait.'
        );

        try {
          const initialized = await spotifyPlaybackService.initialize();
          if (!initialized) {
            throw new Error('Failed to initialize Spotify player');
          }

          // Wait for player to be fully ready with better timeout handling
          let attempts = 0;
          const maxAttempts = 15; // 15 seconds max

          while (
            !spotifyPlaybackService.isPlayerReady() &&
            attempts < maxAttempts
          ) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
            logger.debug(
              `Waiting for player to be ready, attempt ${attempts}/${maxAttempts}`
            );
          }

          if (!spotifyPlaybackService.isPlayerReady()) {
            throw new Error(
              'Player initialization timed out. Please make sure Spotify is open on another device.'
            );
          }

          logger.info('Spotify player is ready for playback');
        } catch (initError) {
          logger.error('Failed to initialize Spotify player', {
            error: initError,
          });
          const errorMessage =
            initError instanceof Error
              ? initError.message
              : 'Unknown error occurred';
          alert(
            `Music Player Setup Failed\n\n` +
            `${errorMessage}\n\n` +
            `Please make sure:\n` +
            `1. Spotify is open in another browser tab or app\n` +
            `2. You're logged into the same Spotify account\n` +
            `3. Your browser allows the Spotify player to load\n` +
            `4. Try refreshing the page and trying again`
          );
          return;
        }
      }

      logger.info('Attempting to play track', {
        trackName: track.name,
        trackUri: track.uri,
        playerReady: spotifyPlaybackService.isPlayerReady(),
        deviceId: spotifyPlaybackService.getDeviceId(),
      });

      const success = await spotifyPlaybackService.playTrack(track.uri);

      if (success) {
        setShowMusicPlayer(true);
        logger.info('Track playback started successfully', {
          trackName: track.name,
          timestamp: new Date().toISOString(),
        });
      } else {
        logger.error('Failed to start track playback', {
          trackName: track.name,
          playerReady: spotifyPlaybackService.isPlayerReady(),
          deviceId: spotifyPlaybackService.getDeviceId(),
          timestamp: new Date().toISOString(),
        });
        alert(
          "Failed to start playback.\n\nPlease make sure:\n1. Spotify is open on another device/tab\n2. You're logged into the same account\n3. Try refreshing and trying again"
        );
      }
    } catch (error) {
      logger.error('Error starting track playback', { error });
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      alert(
        `Error starting playback: ${errorMessage}\n\nPlease try again or refresh the page.`
      );
    }
  };

  const handlePlayPlaylist = async (playlist: SpotifyPlaylist) => {
    logger.info('Playing playlist', {
      playlistName: playlist.name,
      playlistId: playlist.id,
      timestamp: new Date().toISOString(),
    });

    try {
      const { spotifyPlaybackService } =
        await import('../../services/spotifyPlaybackService');

      // Check Premium status first
      const premiumCheck = await spotifyPlaybackService.checkPremiumStatus();

      if (!premiumCheck.hasPremium) {
        if (premiumCheck.error === 'Failed to refresh access token') {
          alert(
            'Session Expired\n\n' +
            'Your Spotify session has expired. Please refresh the page to log in again.'
          );
          window.location.reload();
        } else {
          alert(
            'Spotify Premium Required\n\n' +
            'To play playlists directly on this website, you need a Spotify Premium account.\n\n' +
            'Premium allows for web playback control. You can still browse your playlists and \n' +
            'click the Spotify links to open them in your Spotify app.'
          );
        }
        return;
      }

      // Initialize player if not already done
      if (!spotifyPlaybackService.isPlayerReady()) {
        logger.info('Initializing Spotify player for playlist playback');
        // Show a brief message to user
        alert('Setting up music player... This may take a moment.');

        const initialized = await spotifyPlaybackService.initialize();
        if (!initialized) {
          logger.error('Failed to initialize Spotify player');
          alert(
            'Music Player Setup Failed\n\n' +
            'Failed to initialize music player.\n\n' +
            'Please make sure you have Spotify Premium and Spotify is open.'
          );
          return;
        }

        // Wait a bit for the player to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const success = await spotifyPlaybackService.playPlaylist(playlist.uri);

      if (success) {
        setShowMusicPlayer(true);
        logger.info('Playlist playback started successfully', {
          playlistName: playlist.name,
          timestamp: new Date().toISOString(),
        });
      } else {
        logger.error('Failed to start playlist playback', {
          playlistName: playlist.name,
          timestamp: new Date().toISOString(),
        });
        alert(
          'Failed to start playback. Please make sure you have Spotify open and try again.'
        );
      }
    } catch (error) {
      logger.error('Error starting playlist playback', { error });
      alert('Error starting playback. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className='music-page'>
        <SEO
          title='Music - Spotify Integration | Tron Swan'
          description='Discover my music taste through Spotify integration. View my top tracks, artists, and recently played songs.'
          keywords='spotify, music, top tracks, artists, recently played, music taste'
          url='/music'
        />
        <div className='music-loading'>
          <div className='loading-spinner' aria-label='Loading music data' />
          <p>Loading your music data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='music-page'>
        <SEO
          title='Enhanced Spotify Player | Tron Swan'
          description='Experience a better Spotify player with enhanced controls, personal analytics, and superior interface for your music.'
          keywords='spotify player, enhanced music player, better spotify, music analytics, personal music dashboard'
          url='/music'
        />
        <div className='music-auth'>
          <h1 className='page-title'>music</h1>
          <p className='auth-tagline'>it&apos;s spotify, but less janky</p>

          <p>
            Connect your Spotify account to access your top tracks, playlists,
            and listening history with better controls and a cleaner interface.
          </p>
          <p>
            <strong>Requires Spotify Premium.</strong>
          </p>
          {authError && (
            <div
              className='auth-error'
              style={{ color: 'red', marginBottom: '1rem' }}
            >
              {authError}
            </div>
          )}
          <Button
            className='spotify-login-btn'
            onClick={handleLogin}
            aria-label='Login with Spotify'
            size='lg'
          >
            <span className='spotify-icon' />
            Connect with Spotify
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className='music-page'>
      <SEO
        title='Enhanced Spotify Player | Tron Swan'
        description={`${user?.display_name}'s enhanced Spotify player with superior controls and personal music analytics.`}
        keywords='enhanced spotify player, better spotify, music analytics, personal music dashboard, spotify alternative'
        url='/music'
      />

      <div className='music-header'>
        <div className='music-user-info'>
          {user?.images?.[0] && (
            <img
              src={user.images[0].url}
              alt={user.display_name}
              className='user-avatar'
            />
          )}
          <div>
            <h1 className='page-title'>music</h1>
            <p className='user-subtitle'>it&apos;s spotify, but less janky</p>
          </div>
        </div>

        <div className='music-controls'>
          <div className='time-range-block'>
            <div className='time-range-selector'>
              <label htmlFor='time-range'>Time Range:</label>
              <select
                id='time-range'
                value={timeRange}
                onChange={e =>
                  handleTimeRangeChange(
                    e.target.value as 'short_term' | 'medium_term' | 'long_term'
                  )
                }
              >
                <option value='short_term'>Last 4 weeks</option>
                <option value='short_term'>Last month</option>
                <option value='medium_term'>Last 6 months</option>
                <option value='medium_term'>Last year</option>
                <option value='long_term'>Last two years</option>
                <option value='long_term'>All time</option>
              </select>
            </div>

            <div className='logout-container'>
              <Button
                className='logout-btn'
                onClick={handleLogout}
                aria-label='Logout from Spotify'
              >
                Logout
              </Button>
            </div>
          </div>
        </div>

        <div className='music-help'>
          <Button
            className='help-button'
            onClick={() => setShowHelpModal(true)}
          >
            how this enhanced music player works
          </Button>
        </div>

        {showHelpModal && (
          <div
            className='help-modal-overlay'
            onClick={() => setShowHelpModal(false)}
            onKeyDown={e => {
              if (e.key === 'Escape') setShowHelpModal(false);
            }}
            role='button'
            tabIndex={0}
            aria-label='Close help modal'
          >
            <div
              className='help-modal'
              onClick={e => e.stopPropagation()}
              onKeyDown={e => e.stopPropagation()}
              role='dialog'
              tabIndex={-1}
            >
              <div className='help-modal-header'>
                <h3>how this enhanced music player works</h3>
                <button
                  className='help-modal-close'
                  onClick={() => setShowHelpModal(false)}
                >
                  Close
                </button>
              </div>
              <div className='help-modal-content'>
                <div className='help-section'>
                  <h4>spotify premium required</h4>
                  <p>
                    To play music directly on this website, you need Spotify
                    Premium. This is a requirement from Spotify, not our
                    limitation.
                  </p>
                </div>

                <div className='help-section'>
                  <h4>what you can do (after login)</h4>
                  <ul>
                    <li>
                      Browse your personal playlists, top tracks, and artists
                    </li>
                    <li>Discover new music through your listening history</li>
                    <li>
                      Click the Spotify buttons to open songs in your Spotify
                      app
                    </li>
                    <li>
                      If you have Premium, click Play to play directly here
                    </li>
                  </ul>
                </div>

                <div className='help-section'>
                  <h4>how to play music (premium users)</h4>
                  <ol>
                    <li>Click any Play button below</li>
                    <li>
                      You&apos;ll be prompted with a Spotify login page (if not
                      already logged in)
                    </li>
                    <li>
                      Make sure you have <strong>Spotify open</strong> on
                      another device
                    </li>
                    <li>Your music will transfer to this enhanced player</li>
                  </ol>
                </div>

                <div className='help-section'>
                  <h4>login required</h4>
                  <p>
                    You need to log in with your Spotify account to access your
                    music data. Once logged in, you can browse your playlists,
                    top tracks, and artists. Premium is only required for direct
                    playback on this site.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {currentlyPlaying && (
        <div className='currently-playing'>
          <h3>currently playing</h3>
          <div className='current-track'>
            {currentlyPlaying.album.images[0] && (
              <img
                src={currentlyPlaying.album.images[0].url}
                alt={currentlyPlaying.album.name}
                className='current-album-art'
              />
            )}
            <div className='current-track-info'>
              <h4>{currentlyPlaying.name}</h4>
              <p>{currentlyPlaying.artists.map(a => a.name).join(', ')}</p>
              <p className='current-album'>{currentlyPlaying.album.name}</p>
            </div>
          </div>
        </div>
      )}

      <div className='music-tabs'>
        <Button
          variant={activeTab === 'tracks' ? 'secondary' : 'ghost'}
          onClick={() => handleTabChange('tracks')}
          className={activeTab === 'tracks' ? 'active' : ''}
        >
          top tracks ({topTracks.length})
        </Button>
        <Button
          variant={activeTab === 'artists' ? 'secondary' : 'ghost'}
          onClick={() => handleTabChange('artists')}
          className={activeTab === 'artists' ? 'active' : ''}
        >
          top artists ({topArtists.length})
        </Button>
        <Button
          variant={activeTab === 'recent' ? 'secondary' : 'ghost'}
          onClick={() => handleTabChange('recent')}
          className={activeTab === 'recent' ? 'active' : ''}
        >
          recently played ({recentlyPlayed.length})
        </Button>
        <Button
          variant={activeTab === 'liked' ? 'secondary' : 'ghost'}
          onClick={() => handleTabChange('liked')}
          className={activeTab === 'liked' ? 'active' : ''}
        >
          liked songs ({likedSongsTotal})
        </Button>
        <Button
          variant={activeTab === 'playlists' ? 'secondary' : 'ghost'}
          onClick={() => handleTabChange('playlists')}
          className={activeTab === 'playlists' ? 'active' : ''}
        >
          playlists ({playlistsTotal})
        </Button>
      </div>

      <div className='music-content'>
        {activeTab === 'tracks' && (
          <div className='tracks-grid'>
            {topTracks.map((track, index) => (
              <Card key={track.id} className='track-card' hoverable>
                <div className='track-rank'>#{index + 1}</div>
                {track.album.images[0] && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className='track-album-art'
                  />
                )}
                <div className='track-info'>
                  <h4 className='track-name' title={track.name}>
                    {track.name}
                  </h4>
                  <p
                    className='track-artist'
                    title={track.artists.map(a => a.name).join(', ')}
                  >
                    {track.artists.map(a => a.name).join(', ')}
                  </p>
                  <p className='track-album' title={track.album.name}>
                    {track.album.name}
                  </p>
                </div>
                <div className='track-meta'>
                  <span className='track-duration'>
                    {formatDuration(track.duration_ms)}
                  </span>
                  <span className='track-popularity'>
                    Popularity: {track.popularity}
                  </span>
                </div>
                <div className='track-actions'>
                  <Button
                    className='play-btn'
                    onClick={() => handlePlayTrack(track)}
                    aria-label={`Play ${track.name}`}
                    size='sm'
                  >
                    Play
                  </Button>
                  <a
                    href={track.external_urls.spotify}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='spotify-link'
                    aria-label={`Open ${track.name} on Spotify`}
                  >
                    Spotify
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'artists' && (
          <div className='artists-grid'>
            {topArtists.map((artist, index) => (
              <Card key={artist.id} className='artist-card' hoverable>
                <div className='artist-rank'>#{index + 1}</div>
                {artist.images[0] && (
                  <img
                    src={artist.images[0].url}
                    alt={artist.name}
                    className='artist-image'
                  />
                )}
                <div className='artist-info'>
                  <h4 className='artist-name'>{artist.name}</h4>
                  <p className='artist-genres'>
                    {artist.genres.slice(0, 3).join(', ')}
                  </p>
                  <div className='artist-meta'>
                    <span className='artist-popularity'>
                      Popularity: {artist.popularity}
                    </span>
                  </div>
                </div>
                <a
                  href={artist.external_urls.spotify}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='spotify-link'
                  aria-label={`Open ${artist.name} on Spotify`}
                >
                  Spotify
                </a>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className='recent-tracks'>
            {recentlyPlayed.map((track, index) => (
              <Card key={`${track.id}-${index}`} className='recent-track' hoverable>
                {track.album.images[0] && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className='recent-album-art'
                  />
                )}
                <div className='recent-track-info'>
                  <h4>{track.name}</h4>
                  <p>{track.artists.map(a => a.name).join(', ')}</p>
                  <p className='recent-album'>{track.album.name}</p>
                </div>
                <a
                  href={track.external_urls.spotify}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='spotify-link'
                  aria-label={`Open ${track.name} on Spotify`}
                >
                  Spotify
                </a>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'liked' && (
          <div className='liked-songs-container'>
            <div className='liked-songs-header'>
              <h3>your liked songs</h3>
              <p className='liked-songs-count'>
                {likedSongs.length} of {likedSongsTotal} songs
              </p>
            </div>

            <div className='tracks-grid'>
              {likedSongs.map((track, index) => (
                <Card key={track.id} className='track-card' hoverable>
                  <div className='track-rank'>
                    {likedSongsOffset + index + 1}
                  </div>
                  <img
                    src={track.album.images[0]?.url}
                    alt={`${track.album.name} cover`}
                    className='track-album-art'
                  />
                  <div className='track-info'>
                    <h4 className='track-name'>{track.name}</h4>
                    <p className='track-artist'>
                      {track.artists.map(a => a.name).join(', ')}
                    </p>
                    <p className='track-album'>{track.album.name}</p>
                    <div className='track-meta'>
                      <span>{formatDuration(track.duration_ms)}</span>
                      <span>
                        {new Date(track.album.release_date).getFullYear()}
                      </span>
                    </div>
                    <div className='track-actions'>
                      <Button
                        className='play-btn'
                        onClick={() => handlePlayTrack(track)}
                        aria-label={`Play ${track.name}`}
                        size='sm'
                      >
                        Play
                      </Button>
                    </div>
                  </div>
                  <a
                    href={track.external_urls.spotify}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='spotify-link'
                    aria-label={`Open ${track.name} on Spotify`}
                  >
                    Spotify
                  </a>
                </Card>
              ))}
            </div>

            {likedSongsHasMore && (
              <div className='load-more-container'>
                <Button
                  className='load-more-btn'
                  onClick={loadMoreLikedSongs}
                  disabled={loading}
                  variant='secondary'
                >
                  {loading ? 'Loading...' : 'Load More Songs'}
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'playlists' && !selectedPlaylist && (
          <div className='playlists-container'>
            <div className='playlists-header'>
              <h3>your playlists</h3>
              <p className='playlists-count'>
                {playlists.length} of {playlistsTotal} playlists
              </p>
            </div>

            <div className='playlists-grid'>
              {playlists.map(playlist => (
                <Card key={playlist.id} className='playlist-card' hoverable>
                  <div className='playlist-image-container'>
                    <img
                      src={
                        playlist.images[0]?.url || '/placeholder-playlist.png'
                      }
                      alt={`${playlist.name} cover`}
                      className='playlist-image'
                    />
                    <div className='playlist-overlay'>
                      <a
                        href={playlist.external_urls.spotify}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='playlist-link'
                        aria-label={`Open ${playlist.name} on Spotify`}
                      >
                        Spotify
                      </a>
                    </div>
                  </div>
                  <div className='playlist-info'>
                    <h4 className='playlist-name'>{playlist.name}</h4>
                    <p className='playlist-owner'>
                      by {playlist.owner.display_name}
                    </p>
                    <p className='playlist-description'>
                      {playlist.description || 'No description'}
                    </p>
                    <div className='playlist-meta'>
                      <span className='playlist-tracks'>
                        {playlist.tracks.total} tracks
                      </span>
                      <span className='playlist-visibility'>
                        {playlist.public ? 'Public' : 'Private'}
                      </span>
                      {playlist.collaborative && (
                        <span className='playlist-collaborative'>
                          Collaborative
                        </span>
                      )}
                    </div>
                    <div className='playlist-actions'>
                      <Button
                        className='view-tracks-btn'
                        onClick={() => handleViewPlaylist(playlist)}
                        aria-label={`View tracks in ${playlist.name}`}
                        size='sm'
                        variant='secondary'
                      >
                        📝 View Tracks
                      </Button>
                      <Button
                        className='play-btn'
                        onClick={() => handlePlayPlaylist(playlist)}
                        aria-label={`Play ${playlist.name}`}
                        size='sm'
                      >
                        Play Playlist
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {playlistsHasMore && (
              <div className='load-more-container'>
                <Button
                  className='load-more-btn'
                  onClick={loadMorePlaylists}
                  disabled={loading}
                  variant='secondary'
                >
                  {loading ? 'Loading...' : 'Load More Playlists'}
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'playlists' && selectedPlaylist && (
          <PlaylistTracks
            playlist={selectedPlaylist}
            onPlayTrack={handlePlayTrack}
            onBack={handleBackToPlaylists}
          />
        )}
      </div>

      <MusicPlayer
        isVisible={showMusicPlayer}
        onClose={() => setShowMusicPlayer(false)}
      />
    </div>
  );
};

export default Music;
