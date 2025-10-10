import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
  spotifyService,
  SpotifyTrack,
  SpotifyArtist,
  SpotifyUser,
  SpotifyPlaylist,
  SpotifyAudioFeatures,
} from '../../services/spotifyService';
import { logger } from '../../utils/logger';
import { runtimeConfig } from '../../utils/runtimeConfig';
import SEO from '../ui/SEO';
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
  const [activeTab, setActiveTab] = useState<'tracks' | 'artists' | 'recent' | 'liked' | 'playlists' | 'visualizer'>(
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
  const [audioFeatures, setAudioFeatures] = useState<SpotifyAudioFeatures | null>(null);
  const [visualizerLoading, setVisualizerLoading] = useState(false);

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

  const handleTabChange = (tab: 'tracks' | 'artists' | 'recent' | 'liked' | 'playlists' | 'visualizer') => {
    logger.info('Music page tab changed', {
      from: activeTab,
      to: tab,
      timestamp: new Date().toISOString(),
    });

    setActiveTab(tab);

    // Load audio features when visualizer tab is selected
    if (tab === 'visualizer') {
      loadAudioFeatures();
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

  const loadAudioFeatures = useCallback(async () => {
    if (audioFeatures || visualizerLoading) return;

    logger.info('Loading audio features for visualizer', {
      trackCount: topTracks.length,
      timestamp: new Date().toISOString(),
    });

    try {
      setVisualizerLoading(true);
      const trackIds = topTracks.slice(0, 50).map(track => track.id); // Limit to 50 tracks for performance
      const analysis = await spotifyService.getAudioFeaturesAnalysis(trackIds);
      
      setAudioFeatures(analysis.averageFeatures);

      logger.info('Audio features loaded successfully', {
        trackCount: trackIds.length,
        danceability: analysis.averageFeatures.danceability,
        energy: analysis.averageFeatures.energy,
        valence: analysis.averageFeatures.valence,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to load audio features', { error });
    } finally {
      setVisualizerLoading(false);
    }
  }, [topTracks, audioFeatures, visualizerLoading]);

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
    setAudioFeatures(null);
    setVisualizerLoading(false);
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
        <button
          className={`tab-btn ${activeTab === 'liked' ? 'active' : ''}`}
          onClick={() => handleTabChange('liked')}
        >
          Liked Songs ({likedSongsTotal})
        </button>
        <button
          className={`tab-btn ${activeTab === 'playlists' ? 'active' : ''}`}
          onClick={() => handleTabChange('playlists')}
        >
          Playlists ({playlistsTotal})
        </button>
        <button
          className={`tab-btn ${activeTab === 'visualizer' ? 'active' : ''}`}
          onClick={() => handleTabChange('visualizer')}
        >
          Visualizer
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

        {activeTab === 'liked' && (
          <div className='liked-songs-container'>
            <div className='liked-songs-header'>
              <h3>Your Liked Songs</h3>
              <p className='liked-songs-count'>
                {likedSongs.length} of {likedSongsTotal} songs
              </p>
            </div>
            
            <div className='tracks-grid'>
              {likedSongs.map((track, index) => (
                <div key={track.id} className='track-card'>
                  <div className='track-rank'>{likedSongsOffset + index + 1}</div>
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

        {activeTab === 'playlists' && (
          <div className='playlists-container'>
            <div className='playlists-header'>
              <h3>Your Playlists</h3>
              <p className='playlists-count'>
                {playlists.length} of {playlistsTotal} playlists
              </p>
            </div>
            
            <div className='playlists-grid'>
              {playlists.map((playlist) => (
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

        {activeTab === 'visualizer' && (
          <div className='visualizer-container'>
            <div className='visualizer-header'>
              <h3>Your Music DNA</h3>
              <p className='visualizer-subtitle'>
                Audio analysis of your top tracks
              </p>
            </div>

            {visualizerLoading ? (
              <div className='visualizer-loading'>
                <div className='loading-spinner' aria-label='Loading audio analysis' />
                <p>Analyzing your music taste...</p>
              </div>
            ) : audioFeatures ? (
              <div className='visualizer-content'>
                {/* Main Features Radar Chart */}
                <div className='features-radar'>
                  <h4>Music Characteristics</h4>
                  <div className='radar-chart'>
                    <div className='radar-feature' style={{ '--value': audioFeatures.danceability * 100 + '%' } as React.CSSProperties}>
                      <div className='feature-label'>Danceability</div>
                      <div className='feature-bar'>
                        <div className='feature-fill'></div>
                      </div>
                      <div className='feature-value'>{Math.round(audioFeatures.danceability * 100)}%</div>
                    </div>
                    <div className='radar-feature' style={{ '--value': audioFeatures.energy * 100 + '%' } as React.CSSProperties}>
                      <div className='feature-label'>Energy</div>
                      <div className='feature-bar'>
                        <div className='feature-fill'></div>
                      </div>
                      <div className='feature-value'>{Math.round(audioFeatures.energy * 100)}%</div>
                    </div>
                    <div className='radar-feature' style={{ '--value': audioFeatures.valence * 100 + '%' } as React.CSSProperties}>
                      <div className='feature-label'>Valence (Mood)</div>
                      <div className='feature-bar'>
                        <div className='feature-fill'></div>
                      </div>
                      <div className='feature-value'>{Math.round(audioFeatures.valence * 100)}%</div>
                    </div>
                    <div className='radar-feature' style={{ '--value': audioFeatures.acousticness * 100 + '%' } as React.CSSProperties}>
                      <div className='feature-label'>Acousticness</div>
                      <div className='feature-bar'>
                        <div className='feature-fill'></div>
                      </div>
                      <div className='feature-value'>{Math.round(audioFeatures.acousticness * 100)}%</div>
                    </div>
                    <div className='radar-feature' style={{ '--value': audioFeatures.instrumentalness * 100 + '%' } as React.CSSProperties}>
                      <div className='feature-label'>Instrumentalness</div>
                      <div className='feature-bar'>
                        <div className='feature-fill'></div>
                      </div>
                      <div className='feature-value'>{Math.round(audioFeatures.instrumentalness * 100)}%</div>
                    </div>
                    <div className='radar-feature' style={{ '--value': audioFeatures.speechiness * 100 + '%' } as React.CSSProperties}>
                      <div className='feature-label'>Speechiness</div>
                      <div className='feature-bar'>
                        <div className='feature-fill'></div>
                      </div>
                      <div className='feature-value'>{Math.round(audioFeatures.speechiness * 100)}%</div>
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className='additional-metrics'>
                  <div className='metric-card'>
                    <h5>Tempo</h5>
                    <div className='metric-value'>{Math.round(audioFeatures.tempo)} BPM</div>
                  </div>
                  <div className='metric-card'>
                    <h5>Loudness</h5>
                    <div className='metric-value'>{Math.round(audioFeatures.loudness)} dB</div>
                  </div>
                  <div className='metric-card'>
                    <h5>Liveness</h5>
                    <div className='metric-value'>{Math.round(audioFeatures.liveness * 100)}%</div>
                  </div>
                </div>

                {/* Music Personality */}
                <div className='music-personality'>
                  <h4>Your Music Personality</h4>
                  <div className='personality-traits'>
                    {audioFeatures.valence > 0.6 && (
                      <span className='personality-trait positive'>Upbeat & Positive</span>
                    )}
                    {audioFeatures.energy > 0.7 && (
                      <span className='personality-trait energetic'>High Energy</span>
                    )}
                    {audioFeatures.danceability > 0.7 && (
                      <span className='personality-trait danceable'>Danceable</span>
                    )}
                    {audioFeatures.acousticness > 0.5 && (
                      <span className='personality-trait acoustic'>Acoustic</span>
                    )}
                    {audioFeatures.instrumentalness > 0.5 && (
                      <span className='personality-trait instrumental'>Instrumental</span>
                    )}
                    {audioFeatures.speechiness > 0.3 && (
                      <span className='personality-trait speechy'>Lyrical</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='visualizer-error'>
                <p>Unable to load audio analysis. Please try again.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Music;
