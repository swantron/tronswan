import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  spotifyService,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyUser,
  SpotifyPlaylist,
} from '../../services/spotifyService';
import {
  tronSwanSpotifyService,
  SpotifyTrack as TronSpotifyTrack,
  SpotifyArtist as TronSpotifyArtist,
  SpotifyUser as TronSpotifyUser,
  SpotifyPlaylist as TronSpotifyPlaylist,
} from '../../services/tronSwanSpotifyService';
import { logger } from '../../utils/logger';
import { runtimeConfig } from '../../utils/runtimeConfig';
import SEO from '../ui/SEO';
import MusicPlayer from './MusicPlayer';
import PlaylistTracks from './PlaylistTracks';
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
  const [activeTab, setActiveTab] = useState<'tracks' | 'artists' | 'recent' | 'liked' | 'playlists'>(
    'tracks'
  );
  const [likedSongs, setLikedSongs] = useState<SpotifyTrack[]>([]);
  const [likedSongsTotal, setLikedSongsTotal] = useState(0);
  const [likedSongsOffset, setLikedSongsOffset] = useState(0);
  const [likedSongsHasMore, setLikedSongsHasMore] = useState(false);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [playlistsTotal, setPlaylistsTotal] = useState(0);
  const [playlistsOffset, setPlaylistsOffset] = useState(0);
  const [playlistsHasMore, setPlaylistsHasMore] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [musicSource, setMusicSource] = useState<'user' | 'tron'>('user');
  
  // Tron Swan's data
  const [tronUser, setTronUser] = useState<TronSpotifyUser | null>(null);
  const [tronTopTracks, setTronTopTracks] = useState<TronSpotifyTrack[]>([]);
  const [tronTopArtists, setTronTopArtists] = useState<TronSpotifyArtist[]>([]);
  const [tronRecentlyPlayed, setTronRecentlyPlayed] = useState<TronSpotifyTrack[]>([]);
  const [tronCurrentlyPlaying, setTronCurrentlyPlaying] = useState<TronSpotifyTrack | null>(null);
  const [tronLikedSongs, setTronLikedSongs] = useState<TronSpotifyTrack[]>([]);
  const [tronLikedSongsTotal, setTronLikedSongsTotal] = useState(0);
  const [tronLikedSongsOffset, setTronLikedSongsOffset] = useState(0);
  const [tronLikedSongsHasMore, setTronLikedSongsHasMore] = useState(false);
  const [tronPlaylists, setTronPlaylists] = useState<TronSpotifyPlaylist[]>([]);
  const [tronPlaylistsTotal, setTronPlaylistsTotal] = useState(0);
  const [tronPlaylistsOffset, setTronPlaylistsOffset] = useState(0);
  const [tronPlaylistsHasMore, setTronPlaylistsHasMore] = useState(false);

  const loadTronSwanData = useCallback(async () => {
    logger.info('Loading Tron Swan Spotify data', {
      timestamp: new Date().toISOString(),
    });

    try {
      setLoading(true);

      logger.info('Starting parallel API calls for Tron Swan data');
      const [userData, tracks, artists, recent, current, likedData, playlistsData] = await Promise.all([
        tronSwanSpotifyService.getUserProfile(),
        tronSwanSpotifyService.getTopTracks(timeRange),
        tronSwanSpotifyService.getTopArtists(timeRange),
        tronSwanSpotifyService.getRecentlyPlayed(),
        tronSwanSpotifyService.getCurrentlyPlaying(),
        tronSwanSpotifyService.getLikedSongs(20, 0),
        tronSwanSpotifyService.getPlaylists(20, 0),
      ]);

      logger.info('All Tron Swan API calls completed successfully', {
        hasUserData: !!userData,
        trackCount: tracks?.length || 0,
        artistCount: artists?.length || 0,
        recentCount: recent?.length || 0,
        hasCurrentTrack: !!current,
      });

      setTronUser(userData);
      setTronTopTracks(tracks || []);
      setTronTopArtists(artists || []);
      setTronRecentlyPlayed(recent || []);
      setTronCurrentlyPlaying(current);
      setTronLikedSongs(likedData?.tracks || []);
      setTronLikedSongsTotal(likedData?.total || 0);
      setTronLikedSongsHasMore(likedData?.hasMore || false);
      setTronLikedSongsOffset(0);
      setTronPlaylists(playlistsData?.playlists || []);
      setTronPlaylistsTotal(playlistsData?.total || 0);
      setTronPlaylistsHasMore(playlistsData?.hasMore || false);
      setTronPlaylistsOffset(0);

      logger.info('Tron Swan Spotify data loaded successfully', {
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
      logger.error('Failed to load Tron Swan Spotify data', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error; // Re-throw so calling code can handle it
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const loadUserData = useCallback(async () => {
    logger.info('Loading Spotify user data', {
      timestamp: new Date().toISOString(),
    });

    try {
      setLoading(true);

      logger.info('Starting parallel API calls for user data');
      const [userData, tracks, artists, recent, current, likedData, playlistsData] = await Promise.all([
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
          logger.info('Spotify callback successful, setting authenticated state');
          setIsAuthenticated(true);
          
          try {
            await loadUserData();
            logger.info('User data loaded successfully after callback');
          } catch (dataError) {
            logger.error('Failed to load user data after callback', { dataError });
            setAuthError('Authentication successful but failed to load music data. Please refresh the page.');
          }
          
          // Clean up URL
          window.history.replaceState({}, document.title, '/music');
        } else {
          logger.error('Spotify authentication failed during callback');
          setAuthError('Spotify authentication failed. Please try again.');
        }
      } catch (error) {
        logger.error('Error during Spotify callback handling', { error });
        setAuthError('An error occurred during authentication. Please try again.');
      }

      setLoading(false);
    },
    [loadUserData]
  );

  const initializeTronSwanFromCurrentUser = useCallback(async () => {
    try {
      // Get the current user's tokens from localStorage
      const userTokens = localStorage.getItem('spotify_tokens');
      if (!userTokens) {
        throw new Error('No user tokens found');
      }

      const { accessToken, refreshToken, expiresAt } = JSON.parse(userTokens);
      
      // Initialize Tron Swan's service with the same tokens
      await tronSwanSpotifyService.initializeTokens(
        accessToken, 
        refreshToken, 
        Math.floor((expiresAt - Date.now()) / 1000) // Convert to seconds
      );
      
      logger.info('Tron Swan service initialized with current user tokens');
    } catch (error) {
      logger.error('Failed to initialize Tron Swan with current user tokens', { error });
      throw error;
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    logger.debug('Checking Spotify authentication status', {
      timestamp: new Date().toISOString(),
    });

    const authenticated = spotifyService.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      await loadUserData();
      
      // Also initialize Tron Swan's service with the same tokens
      try {
        await initializeTronSwanFromCurrentUser();
        logger.info('Tron Swan service pre-initialized with user tokens');
      } catch (error) {
        logger.warn('Failed to pre-initialize Tron Swan service', { error });
        // This is not critical, so we don't throw
      }
    }

    setLoading(false);
  }, [loadUserData, initializeTronSwanFromCurrentUser]);

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

  const handleTabChange = (tab: 'tracks' | 'artists' | 'recent' | 'liked' | 'playlists') => {
    logger.info('Music page tab changed', {
      from: activeTab,
      to: tab,
      timestamp: new Date().toISOString(),
    });

    setActiveTab(tab);
  };

  const handleMusicSourceChange = async (source: 'user' | 'tron') => {
    logger.info('Music source changed', {
      from: musicSource,
      to: source,
      timestamp: new Date().toISOString(),
    });

    setMusicSource(source);
    
    if (source === 'tron') {
      // Load Tron Swan's data if not already loaded
      if (!tronUser) {
        try {
          // First, try to initialize Tron Swan's tokens from the current user's session
          await initializeTronSwanFromCurrentUser();
          await loadTronSwanData();
        } catch (error) {
          logger.error('Failed to load Tron Swan data', { error });
          // Show error message to user
          alert('Failed to load Tron Swan\'s music data. Please make sure you\'re logged in and try again.');
        }
      }
    }
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
      const { spotifyPlaybackService } = await import('../../services/spotifyPlaybackService');
      
      // Check Premium status first
      const premiumCheck = await spotifyPlaybackService.checkPremiumStatus();
      
      // TEMPORARY DEBUG: Let's bypass the premium check to see if playback works
      // We'll remove this once we figure out the API response issue
      const debugBypass = true; // Set to false to re-enable premium check
      
      if (!premiumCheck.hasPremium && !debugBypass) {
        if (premiumCheck.error === 'Failed to refresh access token') {
          alert(
            '🎵 Session Expired\n\n' +
            'Your Spotify session has expired. Please refresh the page to log in again.'
          );
          // Optionally redirect to re-authenticate
          window.location.reload();
        } else {
          alert(
            '🎵 Spotify Premium Required\n\n' +
            'To play music directly on this website, you need a Spotify Premium account.\n\n' +
            'Premium allows for web playback control. You can still browse your music and \n' +
            'click the Spotify links (♪) to play songs in your Spotify app.'
          );
        }
        return;
      }
      
      if (debugBypass) {
        logger.info('📝 DEBUG: Bypassing premium check for testing', {
          actualPremiumStatus: premiumCheck.hasPremium,
          user: premiumCheck.user,
        });
      }
      
      // Initialize player if not already done
      if (!spotifyPlaybackService.isPlayerReady()) {
        logger.info('Initializing Spotify player for track playback');
        
        // Show loading message
        const loadingAlert = alert('🎵 Setting up music player...\n\nThis may take a few seconds. Please wait.');
        
        try {
          const initialized = await spotifyPlaybackService.initialize();
          if (!initialized) {
            throw new Error('Failed to initialize Spotify player');
          }
          
          // Wait for player to be fully ready with better timeout handling
          let attempts = 0;
          const maxAttempts = 15; // 15 seconds max
          
          while (!spotifyPlaybackService.isPlayerReady() && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
            logger.debug(`Waiting for player to be ready, attempt ${attempts}/${maxAttempts}`);
          }
          
          if (!spotifyPlaybackService.isPlayerReady()) {
            throw new Error('Player initialization timed out. Please make sure Spotify is open on another device.');
          }
          
          logger.info('Spotify player is ready for playback');
        } catch (initError) {
          logger.error('Failed to initialize Spotify player', { error: initError });
          const errorMessage = initError instanceof Error ? initError.message : 'Unknown error occurred';
          alert(
            `🎵 Music Player Setup Failed\n\n` +
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
        logger.info('✅ Track playback started successfully', {
          trackName: track.name,
          timestamp: new Date().toISOString(),
        });
      } else {
        logger.error('❌ Failed to start track playback', {
          trackName: track.name,
          playerReady: spotifyPlaybackService.isPlayerReady(),
          deviceId: spotifyPlaybackService.getDeviceId(),
          timestamp: new Date().toISOString(),
        });
        alert('❌ Failed to start playback.\n\nPlease make sure:\n1. Spotify is open on another device/tab\n2. You\'re logged into the same account\n3. Try refreshing and trying again');
      }
    } catch (error) {
      logger.error('Error starting track playback', { error });
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Error starting playback: ${errorMessage}\n\nPlease try again or refresh the page.`);
    }
  };

  const handlePlayPlaylist = async (playlist: SpotifyPlaylist) => {
    logger.info('Playing playlist', {
      playlistName: playlist.name,
      playlistId: playlist.id,
      timestamp: new Date().toISOString(),
    });

    try {
      const { spotifyPlaybackService } = await import('../../services/spotifyPlaybackService');
      
      // Check Premium status first  
      const premiumCheck = await spotifyPlaybackService.checkPremiumStatus();
      
      // TEMPORARY DEBUG: Let's bypass the premium check to see if playback works
      const debugBypass = true; // Set to false to re-enable premium check
      
      if (!premiumCheck.hasPremium && !debugBypass) {
        if (premiumCheck.error === 'Failed to refresh access token') {
          alert(
            '🎵 Session Expired\n\n' +
            'Your Spotify session has expired. Please refresh the page to log in again.'
          );
          window.location.reload();
        } else {
          alert(
            '🎵 Spotify Premium Required\n\n' +
            'To play playlists directly on this website, you need a Spotify Premium account.\n\n' +
            'Premium allows for web playback control. You can still browse your playlists and \n' +
            'click the Spotify links (♪) to open them in your Spotify app.'
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
            '🎵 Music Player Setup Failed\n\n' +
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
        alert('Failed to start playback. Please make sure you have Spotify open and try again.');
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
          {process.env.NODE_ENV === 'development' && (
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666' }}>
              <p>Debug Info:</p>
              <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>Has User: {user ? 'Yes' : 'No'}</p>
              <p>Has Tracks: {topTracks.length > 0 ? 'Yes' : 'No'}</p>
              <p>URL: {window.location.href}</p>
            </div>
          )}
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
          <h1>🎵 A Better Spotify Player</h1>
          <p className='auth-tagline'>
            Experience your music like never before with our enhanced Spotify player
          </p>
          
          <div className='premium-notice'>
            <h3>🔒 Spotify Premium Required for Playback</h3>
            <p>This enhanced player requires Spotify Premium to play music directly on the website. 
            You can still explore and discover music without Premium!</p>
          </div>
          
          <p>
            Connect your Spotify account to access <strong>your personal</strong> music taste, 
            top tracks, playlists, and listening history with superior controls and interface.
          </p>
          {authError && (
            <div
              className='auth-error'
              style={{ color: 'red', marginBottom: '1rem' }}
            >
              {authError}
            </div>
          )}
          <button
            className='spotify-login-btn'
            onClick={handleLogin}
            aria-label='Login with Spotify'
          >
            <span className='spotify-icon'>♪</span>
            Connect with Spotify
          </button>
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
          {(musicSource === 'user' ? user?.images?.[0] : tronUser?.images?.[0]) && (
            <img
              src={musicSource === 'user' ? user?.images?.[0]?.url : tronUser?.images?.[0]?.url}
              alt={musicSource === 'user' ? user?.display_name : tronUser?.display_name}
              className='user-avatar'
            />
          )}
          <div>
            <h1>🎵 {(musicSource === 'user' ? user?.display_name : tronUser?.display_name || 'Tron Swan')}&apos;s Enhanced Music Player</h1>
            <p className='user-subtitle'>
              {musicSource === 'user' 
                ? 'A better way to experience your Spotify' 
                : 'Discover Tron Swan\'s music taste and playlists'
              }
            </p>
          </div>
        </div>

        <div className='music-controls'>
          <div className='music-source-toggle'>
            <label htmlFor='music-source'>Music Source:</label>
            <select
              id='music-source'
              value={musicSource}
              onChange={e => handleMusicSourceChange(e.target.value as 'user' | 'tron')}
            >
              <option value='user'>Your Music</option>
              <option value='tron'>Tron Swan's Music</option>
            </select>
          </div>

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
              <option value='medium_term'>Last 6 months</option>
              <option value='long_term'>All time</option>
            </select>
          </div>

          <button
            className='logout-btn'
            onClick={handleLogout}
            aria-label='Logout from Spotify'
          >
            Logout
          </button>
        </div>
        
        <div className='music-help'>
          <details>
            <summary>🎵 How this enhanced music player works</summary>
            <div className='help-content'>
              <div className='premium-requirement'>
                <h4>🔒 Spotify Premium Required for Playback</h4>
                <p><strong>To play music directly on this website, you need Spotify Premium.</strong></p>
                <p>This is a requirement from Spotify, not our limitation. Here's what you can do:</p>
              </div>

              <div className='user-experience'>
                <h4>🎵 What You Can Do:</h4>
                <ul>
                  <li>✅ <strong>Browse Music:</strong> Explore {musicSource === 'user' ? 'your' : 'Tron Swan\'s'} playlists, top tracks, and artists</li>
                  <li>✅ <strong>Discover New Music:</strong> See what {musicSource === 'user' ? 'you\'ve' : 'Tron Swan has'} been listening to</li>
                  <li>✅ <strong>Click Spotify Links:</strong> Use the ♪ buttons to open songs in your Spotify app</li>
                  {musicSource === 'user' ? (
                    <li>✅ <strong>Play Your Music:</strong> If you have Premium, click ▶ to play directly here</li>
                  ) : (
                    <li>✅ <strong>Play Tron Swan's Music:</strong> If you have Premium, click ▶ to play his music here</li>
                  )}
                </ul>
              </div>

              <div className='premium-benefits'>
                <h4>💎 With Spotify Premium:</h4>
                <ul>
                  <li>🎯 <strong>Enhanced Player:</strong> Superior interface and controls</li>
                  <li>📊 <strong>Personal Analytics:</strong> See your top tracks, artists, and listening patterns</li>
                  <li>🎵 <strong>Instant Playback:</strong> Play any song with one click</li>
                  <li>📱 <strong>Responsive Design:</strong> Works perfectly on any device</li>
                  <li>🔄 <strong>Seamless Switching:</strong> Toggle between your music and Tron Swan's music</li>
                </ul>
              </div>

              <div className='how-to-play'>
                <h4>▶ How to Play Music (Premium Users):</h4>
                <ol>
                  <li>Click any "▶ Play" button below</li>
                  <li>You'll be prompted with a Spotify login page (if not already logged in)</li>
                  <li>Make sure you have <strong>Spotify open</strong> on another device (desktop app, mobile app, or web player)</li>
                  <li>Your music will transfer to this enhanced player</li>
                  <li>Enjoy superior controls and interface</li>
                </ol>
              </div>

              <div className='no-premium'>
                <h4>🆓 Without Premium:</h4>
                <p>You can still explore and discover music, but playback will redirect you to Spotify. Consider upgrading to Premium for the full enhanced experience!</p>
              </div>
            </div>
          </details>
        </div>
      </div>

      {(musicSource === 'user' ? currentlyPlaying : tronCurrentlyPlaying) && (
        <div className='currently-playing'>
          <h3>🎧 Currently Playing</h3>
          <div className='current-track'>
            {(musicSource === 'user' ? currentlyPlaying?.album.images[0] : tronCurrentlyPlaying?.album.images[0]) && (
              <img
                src={musicSource === 'user' ? currentlyPlaying?.album.images[0]?.url : tronCurrentlyPlaying?.album.images[0]?.url}
                alt={musicSource === 'user' ? currentlyPlaying?.album.name : tronCurrentlyPlaying?.album.name}
                className='current-album-art'
              />
            )}
            <div className='current-track-info'>
              <h4>{musicSource === 'user' ? currentlyPlaying?.name : tronCurrentlyPlaying?.name}</h4>
              <p>{musicSource === 'user' 
                ? currentlyPlaying?.artists.map(a => a.name).join(', ')
                : tronCurrentlyPlaying?.artists.map(a => a.name).join(', ')
              }</p>
              <p className='current-album'>{musicSource === 'user' ? currentlyPlaying?.album.name : tronCurrentlyPlaying?.album.name}</p>
            </div>
          </div>
        </div>
      )}

      <div className='music-tabs'>
        <button
          className={`tab-btn ${activeTab === 'tracks' ? 'active' : ''}`}
          onClick={() => handleTabChange('tracks')}
        >
          Top Tracks ({musicSource === 'user' ? topTracks.length : tronTopTracks.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'artists' ? 'active' : ''}`}
          onClick={() => handleTabChange('artists')}
        >
          Top Artists ({musicSource === 'user' ? topArtists.length : tronTopArtists.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => handleTabChange('recent')}
        >
          Recently Played ({musicSource === 'user' ? recentlyPlayed.length : tronRecentlyPlayed.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => handleTabChange('liked')}
        >
          Liked Songs ({musicSource === 'user' ? likedSongsTotal : tronLikedSongsTotal})
        </button>
        <button
          className={`tab-btn ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => handleTabChange('playlists')}
        >
          Playlists ({musicSource === 'user' ? playlistsTotal : tronPlaylistsTotal})
        </button>
      </div>

      <div className='music-content'>
        {activeTab === 'tracks' && (
          <div className='tracks-grid'>
            {(musicSource === 'user' ? topTracks : tronTopTracks).map((track, index) => (
              <div key={track.id} className='track-card'>
                <div className='track-rank'>#{index + 1}</div>
                {track.album.images[0] && (
                  <img
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    className='track-album-art'
                  />
                )}
                <div className='track-info'>
                  <h4 className='track-name' title={track.name}>{track.name}</h4>
                  <p className='track-artist' title={track.artists.map(a => a.name).join(', ')}>
                    {track.artists.map(a => a.name).join(', ')}
                  </p>
                  <p className='track-album' title={track.album.name}>{track.album.name}</p>
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
                  <button
                    className='play-btn'
                    onClick={() => handlePlayTrack(track)}
                    aria-label={`Play ${track.name}`}
                  >
                    ▶ Play
                  </button>
                  <a
                    href={track.external_urls.spotify}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='spotify-link'
                    aria-label={`Open ${track.name} on Spotify`}
                  >
                    ♪
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'artists' && (
          <div className='artists-grid'>
            {(musicSource === 'user' ? topArtists : tronTopArtists).map((artist, index) => (
              <div key={artist.id} className='artist-card'>
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
                  ♪
                </a>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className='recent-tracks'>
            {(musicSource === 'user' ? recentlyPlayed : tronRecentlyPlayed).map((track, index) => (
              <div key={`${track.id}-${index}`} className='recent-track'>
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
                  ♪
                </a>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'liked' && (
          <div className='liked-songs-container'>
            <div className='liked-songs-header'>
              <h3>{musicSource === 'user' ? 'Your Liked Songs' : 'Tron Swan\'s Liked Songs'}</h3>
              <p className='liked-songs-count'>
                {musicSource === 'user' ? likedSongs.length : tronLikedSongs.length} of {musicSource === 'user' ? likedSongsTotal : tronLikedSongsTotal} songs
              </p>
            </div>
            
            <div className='tracks-grid'>
              {(musicSource === 'user' ? likedSongs : tronLikedSongs).map((track, index) => (
                <div key={track.id} className='track-card'>
                  <div className='track-rank'>{(musicSource === 'user' ? likedSongsOffset : tronLikedSongsOffset) + index + 1}</div>
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
                      <span>{new Date(track.album.release_date).getFullYear()}</span>
                    </div>
                    <div className='track-actions'>
                      <button
                        className='play-btn'
                        onClick={() => handlePlayTrack(track)}
                        aria-label={`Play ${track.name}`}
                      >
                        ▶ Play
                      </button>
                    </div>
                  </div>
                  <a
                    href={track.external_urls.spotify}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='spotify-link'
                    aria-label={`Open ${track.name} on Spotify`}
                  >
                    ♪
                  </a>
                </div>
              ))}
            </div>

            {likedSongsHasMore && (
              <div className='load-more-container'>
                <button
                  className='load-more-btn'
                  onClick={loadMoreLikedSongs}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Songs'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'playlists' && !selectedPlaylist && (
          <div className='playlists-container'>
            <div className='playlists-header'>
              <h3>{musicSource === 'user' ? 'Your Playlists' : 'Tron Swan\'s Playlists'}</h3>
              <p className='playlists-count'>
                {musicSource === 'user' ? playlists.length : tronPlaylists.length} of {musicSource === 'user' ? playlistsTotal : tronPlaylistsTotal} playlists
              </p>
            </div>
            
            <div className='playlists-grid'>
              {(musicSource === 'user' ? playlists : tronPlaylists).map((playlist) => (
                <div key={playlist.id} className='playlist-card'>
                  <div className='playlist-image-container'>
                    <img
                      src={playlist.images[0]?.url || '/placeholder-playlist.png'}
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
                        ♪
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
                        <span className='playlist-collaborative'>Collaborative</span>
                      )}
                    </div>
                    <div className='playlist-actions'>
                      <button
                        className='view-tracks-btn'
                        onClick={() => handleViewPlaylist(playlist)}
                        aria-label={`View tracks in ${playlist.name}`}
                      >
                        📝 View Tracks
                      </button>
                      <button
                        className='play-btn'
                        onClick={() => handlePlayPlaylist(playlist)}
                        aria-label={`Play ${playlist.name}`}
                      >
                        ▶ Play Playlist
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {playlistsHasMore && (
              <div className='load-more-container'>
                <button
                  className='load-more-btn'
                  onClick={loadMorePlaylists}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Playlists'}
                </button>
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
