import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  spotifyService,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyUser,
} from '../../services/spotifyService';
import { logger } from '../../utils/logger';
import { runtimeConfig } from '../../utils/runtimeConfig';
import SEO from '../ui/SEO';
import '../../styles/Music.css';

const Music: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
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
  const [activeTab, setActiveTab] = useState<'tracks' | 'artists' | 'recent'>(
    'tracks'
  );

  const loadUserData = useCallback(async () => {
    logger.info('Loading Spotify user data', {
      timestamp: new Date().toISOString(),
    });

    try {
      setLoading(true);

      const [userData, tracks, artists, recent, current] = await Promise.all([
        spotifyService.getUserProfile(),
        spotifyService.getTopTracks(timeRange),
        spotifyService.getTopArtists(timeRange),
        spotifyService.getRecentlyPlayed(),
        spotifyService.getCurrentlyPlaying(),
      ]);

      setUser(userData);
      setTopTracks(tracks);
      setTopArtists(artists);
      setRecentlyPlayed(recent);
      setCurrentlyPlaying(current);

      logger.info('Spotify user data loaded successfully', {
        userId: userData.id,
        trackCount: tracks.length,
        artistCount: artists.length,
        recentCount: recent.length,
        hasCurrentTrack: !!current,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to load Spotify user data', { error });
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const handleAuthCallback = useCallback(
    async (code: string) => {
      logger.info('Handling Spotify auth callback', {
        hasCode: !!code,
        timestamp: new Date().toISOString(),
      });

      setLoading(true);
      const success = await spotifyService.handleCallback(code);

      if (success) {
        setIsAuthenticated(true);
        await loadUserData();
        // Clean up URL
        window.history.replaceState({}, document.title, '/music');
      } else {
        logger.error('Spotify authentication failed');
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
      // Initialize runtime config first
      await runtimeConfig.initialize();

      logger.info('Music page loaded', {
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      });

      // Check for callback code
      const code = searchParams.get('code');
      if (code) {
        handleAuthCallback(code);
      } else {
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

  const handleTabChange = (tab: 'tracks' | 'artists' | 'recent') => {
    logger.info('Music page tab changed', {
      from: activeTab,
      to: tab,
      timestamp: new Date().toISOString(),
    });

    setActiveTab(tab);
  };

  const handleLogin = () => {
    logger.info('Spotify login initiated', {
      timestamp: new Date().toISOString(),
    });

    try {
      spotifyService.initiateAuth();
    } catch (error) {
      logger.error('Spotify authentication failed', { error });
      // Show user-friendly error message
      alert(
        "Spotify authentication requires HTTPS or localhost. Please ensure you're accessing the site securely."
      );
    }
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
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
          title='Music - Spotify Integration | Tron Swan'
          description='Connect your Spotify account to view your music taste, top tracks, and recently played songs.'
          keywords='spotify, music, authentication, music taste, top tracks'
          url='/music'
        />
        <div className='music-auth'>
          <h1>🎵 Music Dashboard</h1>
          <p>
            Connect your Spotify account to view your music taste and listening
            history.
          </p>
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
        title='Music - Spotify Integration | Tron Swan'
        description={`${user?.display_name}'s music taste on Spotify. View top tracks, artists, and recently played songs.`}
        keywords='spotify, music, top tracks, artists, recently played, music taste'
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
            <h1>🎵 {user?.display_name}&apos;s Music</h1>
            <p className='user-stats'>
              {user?.followers?.total.toLocaleString()} followers
            </p>
          </div>
        </div>

        <div className='music-controls'>
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
      </div>

      {currentlyPlaying && (
        <div className='currently-playing'>
          <h3>🎧 Currently Playing</h3>
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
        <button
          className={`tab-btn ${activeTab === 'tracks' ? 'active' : ''}`}
          onClick={() => handleTabChange('tracks')}
        >
          Top Tracks ({topTracks.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'artists' ? 'active' : ''}`}
          onClick={() => handleTabChange('artists')}
        >
          Top Artists ({topArtists.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => handleTabChange('recent')}
        >
          Recently Played ({recentlyPlayed.length})
        </button>
      </div>

      <div className='music-content'>
        {activeTab === 'tracks' && (
          <div className='tracks-grid'>
            {topTracks.map((track, index) => (
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
                  <h4 className='track-name'>{track.name}</h4>
                  <p className='track-artist'>
                    {track.artists.map(a => a.name).join(', ')}
                  </p>
                  <p className='track-album'>{track.album.name}</p>
                  <div className='track-meta'>
                    <span className='track-duration'>
                      {formatDuration(track.duration_ms)}
                    </span>
                    <span className='track-popularity'>
                      Popularity: {track.popularity}
                    </span>
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
        )}

        {activeTab === 'artists' && (
          <div className='artists-grid'>
            {topArtists.map((artist, index) => (
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
            {recentlyPlayed.map((track, index) => (
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
      </div>
    </div>
  );
};

export default Music;
