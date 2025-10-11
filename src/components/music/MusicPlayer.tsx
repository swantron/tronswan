import React, { useState, useEffect, useCallback } from 'react';
import { spotifyPlaybackService } from '../../services/spotifyPlaybackService';
import { logger } from '../../utils/logger';
import '../../styles/MusicPlayer.css';

interface MusicPlayerProps {
  isVisible: boolean;
  onClose: () => void;
}

interface PlaybackState {
  isPlaying: boolean;
  currentTrack: {
    name: string;
    artists: string[];
    album: string;
    image: string;
    duration: number;
    position: number;
  } | null;
  volume: number;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isVisible, onClose }) => {
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    currentTrack: null,
    volume: 50,
  });
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const initializePlayer = useCallback(async () => {
    if (isInitialized) return;

    logger.info('Initializing Spotify Web Playback SDK', {
      timestamp: new Date().toISOString(),
    });

    try {
      setIsLoading(true);
      const success = await spotifyPlaybackService.initialize();
      
      if (success) {
        setIsInitialized(true);
        logger.info('Spotify Web Playback SDK initialized successfully');
      } else {
        logger.error('Failed to initialize Spotify Web Playback SDK');
      }
    } catch (error) {
      logger.error('Error initializing Spotify Web Playback SDK', { error });
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const updatePlaybackState = useCallback(async () => {
    if (!spotifyPlaybackService.isPlayerReady()) return;

    try {
      const state = await spotifyPlaybackService.getCurrentState();
      
      if (state) {
        const currentTrack = state.track_window.current_track;
        setPlaybackState(prev => ({
          ...prev,
          isPlaying: !state.paused,
          currentTrack: {
            name: currentTrack.name,
            artists: currentTrack.artists.map(artist => artist.name),
            album: currentTrack.album.name,
            image: currentTrack.album.images[0]?.url || '',
            duration: currentTrack.duration_ms,
            position: state.position,
          },
        }));
      }
    } catch (error) {
      logger.error('Error updating playback state', { error });
    }
  }, []);

  useEffect(() => {
    if (isVisible && !isInitialized) {
      initializePlayer();
    }
  }, [isVisible, isInitialized, initializePlayer]);

  useEffect(() => {
    if (isInitialized) {
      // Update state every second
      const interval = setInterval(updatePlaybackState, 1000);
      return () => clearInterval(interval);
    }
  }, [isInitialized, updatePlaybackState]);

  const handlePlayPause = async () => {
    if (!spotifyPlaybackService.isPlayerReady()) return;

    try {
      await spotifyPlaybackService.togglePlay();
      logger.info('Playback toggled', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error toggling playback', { error });
    }
  };

  const handleNextTrack = async () => {
    if (!spotifyPlaybackService.isPlayerReady()) return;

    try {
      await spotifyPlaybackService.nextTrack();
      logger.info('Skipped to next track', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error skipping to next track', { error });
    }
  };

  const handlePreviousTrack = async () => {
    if (!spotifyPlaybackService.isPlayerReady()) return;

    try {
      await spotifyPlaybackService.previousTrack();
      logger.info('Skipped to previous track', {
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Error skipping to previous track', { error });
    }
  };

  const handleVolumeChange = async (newVolume: number) => {
    if (!spotifyPlaybackService.isPlayerReady()) return;

    try {
      await spotifyPlaybackService.setVolume(newVolume / 100);
      setPlaybackState(prev => ({ ...prev, volume: newVolume }));
      logger.info('Volume changed', { volume: newVolume });
    } catch (error) {
      logger.error('Error changing volume', { error });
    }
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (): number => {
    if (!playbackState.currentTrack) return 0;
    return (playbackState.currentTrack.position / playbackState.currentTrack.duration) * 100;
  };

  if (!isVisible) return null;

  return (
    <div className="music-player-overlay">
      <div className="music-player">
        <div className="music-player-header">
          <h3>Now Playing</h3>
          <button 
            className="close-btn"
            onClick={onClose}
            aria-label="Close player"
          >
            ×
          </button>
        </div>

        {isLoading ? (
          <div className="music-player-loading">
            <div className="loading-spinner" />
            <p>Initializing player...</p>
          </div>
        ) : !isInitialized ? (
          <div className="music-player-error">
            <p>Failed to initialize music player</p>
            <button onClick={initializePlayer} className="retry-btn">
              Retry
            </button>
          </div>
        ) : !playbackState.currentTrack ? (
          <div className="music-player-empty">
            <p>No track playing</p>
            <p className="empty-subtitle">Play a track from your music to see it here</p>
          </div>
        ) : (
          <div className="music-player-content">
            <div className="track-info">
              <img
                src={playbackState.currentTrack.image}
                alt={`${playbackState.currentTrack.album} cover`}
                className="track-image"
              />
              <div className="track-details">
                <h4 className="track-name">{playbackState.currentTrack.name}</h4>
                <p className="track-artist">
                  {playbackState.currentTrack.artists.join(', ')}
                </p>
                <p className="track-album">{playbackState.currentTrack.album}</p>
              </div>
            </div>

            <div className="player-controls">
              <div className="progress-container">
                <span className="time current">
                  {formatTime(playbackState.currentTrack.position)}
                </span>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ width: `${getProgressPercentage()}%` }}
                  />
                </div>
                <span className="time total">
                  {formatTime(playbackState.currentTrack.duration)}
                </span>
              </div>

              <div className="control-buttons">
                <button
                  className="control-btn prev-btn"
                  onClick={handlePreviousTrack}
                  aria-label="Previous track"
                >
                  ⏮
                </button>
                <button
                  className="control-btn play-pause-btn"
                  onClick={handlePlayPause}
                  aria-label={playbackState.isPlaying ? 'Pause' : 'Play'}
                >
                  {playbackState.isPlaying ? '⏸' : '▶'}
                </button>
                <button
                  className="control-btn next-btn"
                  onClick={handleNextTrack}
                  aria-label="Next track"
                >
                  ⏭
                </button>
              </div>

              <div className="volume-control">
                <span className="volume-icon">🔊</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={playbackState.volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="volume-slider"
                  aria-label="Volume control"
                />
                <span className="volume-value">{playbackState.volume}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicPlayer;
