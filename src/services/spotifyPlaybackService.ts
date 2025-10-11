/**
 * Spotify Web Playback SDK Service
 * Handles music playback directly on the website
 */

import { logger } from '../utils/logger';

// Spotify Web Playback SDK types
declare global {
  interface Window {
    Spotify: {
      Player: new (options: SpotifyPlayerOptions) => SpotifyPlayer;
    };
  }
}

interface SpotifyPlayerOptions {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume?: number;
}

interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  getCurrentState(): Promise<SpotifyPlaybackState | null>;
  setVolume(volume: number): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(position_ms: number): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack(): Promise<void>;
  addListener(event: string, callback: (state: any) => void): boolean;
  removeListener(event: string, callback?: (state: any) => void): boolean;
}

interface SpotifyPlaybackState {
  context: {
    uri: string;
    metadata: any;
  };
  disallows: {
    pausing: boolean;
    peeking_next: boolean;
    peeking_prev: boolean;
    resuming: boolean;
    seeking: boolean;
    skipping_next: boolean;
    skipping_prev: boolean;
  };
  paused: boolean;
  position: number;
  repeat_mode: number;
  shuffle: boolean;
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    name: string;
  }>;
  album: {
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  uri: string;
}

export class SpotifyPlaybackService {
  private player: SpotifyPlayer | null = null;
  private deviceId: string | null = null;
  private isReady = false;
  private accessToken: string | null = null;

  constructor() {
    this.loadAccessToken();
  }

  private loadAccessToken(): void {
    try {
      const storedTokens = localStorage.getItem('spotify_tokens');
      if (storedTokens) {
        const { accessToken } = JSON.parse(storedTokens);
        this.accessToken = accessToken;
        logger.debug('Loaded Spotify access token from storage');
      } else {
        logger.warn('No Spotify tokens found in storage');
      }
    } catch (error) {
      logger.error('Failed to load Spotify access token', { error });
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      const storedTokens = localStorage.getItem('spotify_tokens');
      if (!storedTokens) {
        logger.error('No stored tokens available for refresh');
        return false;
      }

      const { refreshToken } = JSON.parse(storedTokens);
      if (!refreshToken) {
        logger.error('No refresh token available');
        return false;
      }

      // Import the Spotify service to refresh the token
      const { spotifyService } = await import('./spotifyService');
      const newTokens = await spotifyService.refreshAccessToken();
      
      if (newTokens) {
        this.accessToken = newTokens.accessToken;
        logger.info('Successfully refreshed Spotify access token');
        return true;
      } else {
        logger.error('Failed to refresh Spotify access token');
        return false;
      }
    } catch (error) {
      logger.error('Error refreshing access token', { error });
      return false;
    }
  }

  private async waitForSpotifySDK(timeout: number = 10000): Promise<void> {
    const startTime = Date.now();
    
    while (!window.Spotify && (Date.now() - startTime) < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (window.Spotify) {
      logger.info('Spotify Web Playback SDK loaded successfully');
    } else {
      logger.error('Spotify Web Playback SDK failed to load within timeout', { timeout });
    }
  }

  public async initialize(): Promise<boolean> {
    if (this.isReady) {
      logger.info('Spotify player already initialized');
      return true;
    }

    // Wait for Spotify SDK to load if not available
    if (!window.Spotify) {
      logger.warn('Spotify Web Playback SDK not loaded, waiting...');
      await this.waitForSpotifySDK();
      
      if (!window.Spotify) {
        logger.error('Spotify Web Playback SDK failed to load after waiting');
        return false;
      }
    }

    if (!this.accessToken) {
      logger.error('No Spotify access token available');
      return false;
    }

    try {
      logger.info('Creating Spotify player instance', {
        hasAccessToken: !!this.accessToken,
        timestamp: new Date().toISOString(),
      });

      this.player = new window.Spotify.Player({
        name: 'Tron Swan Music Player',
        getOAuthToken: (cb) => {
          logger.debug('Getting OAuth token for Spotify player');
          cb(this.accessToken!);
        },
        volume: 0.5,
      });

      // Set up event listeners
      this.setupEventListeners();

      // Connect to Spotify
      logger.info('Connecting to Spotify Web Playback SDK');
      const success = await this.player.connect();
      
      if (success) {
        logger.info('Spotify Web Playback SDK connected successfully');
        return true;
      } else {
        logger.error('Failed to connect to Spotify Web Playback SDK');
        return false;
      }
    } catch (error) {
      logger.error('Failed to initialize Spotify Web Playback SDK', { error });
      return false;
    }
  }

  private setupEventListeners(): void {
    if (!this.player) return;

    // Ready event
    this.player.addListener('ready', ({ device_id }) => {
      logger.info('Spotify player is ready', { device_id });
      this.deviceId = device_id;
      this.isReady = true;
    });

    // Not Ready event
    this.player.addListener('not_ready', ({ device_id }) => {
      logger.warn('Spotify player has gone offline', { device_id });
      this.isReady = false;
    });

    // Initialization Error event
    this.player.addListener('initialization_error', ({ message }) => {
      logger.error('Spotify player initialization error', { message });
    });

    // Authentication Error event
    this.player.addListener('authentication_error', ({ message }) => {
      logger.error('Spotify player authentication error', { message });
    });

    // Account Error event
    this.player.addListener('account_error', ({ message }) => {
      logger.error('Spotify player account error', { message });
    });

    // Playback Status Update event
    this.player.addListener('playback_status_update', (state) => {
      logger.debug('Spotify playback status update', { 
        paused: state.paused,
        position: state.position,
        track: state.track_window?.current_track?.name 
      });
    });

    // Player State Changed event
    this.player.addListener('player_state_changed', (state) => {
      logger.debug('Spotify player state changed', {
        paused: state.paused,
        track: state.track_window?.current_track?.name,
        position: state.position
      });
    });
  }

  public async playTrack(trackUri: string): Promise<boolean> {
    logger.info('Attempting to play track', {
      trackUri,
      isReady: this.isReady,
      deviceId: this.deviceId,
      hasAccessToken: !!this.accessToken,
    });

    if (!this.isReady || !this.deviceId) {
      logger.warn('Spotify player not ready, cannot play track', {
        isReady: this.isReady,
        deviceId: this.deviceId,
      });
      return false;
    }

    if (!this.accessToken) {
      logger.error('No access token available for track playback');
      return false;
    }

    try {
      const url = `https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`;
      logger.debug('Making playback request', { url, trackUri });

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uris: [trackUri]
        }),
      });

      if (response.ok) {
        logger.info('Track playback started successfully', { trackUri });
        return true;
      } else if (response.status === 401) {
        // Token might be expired, try to refresh
        logger.warn('Access token expired, attempting to refresh');
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the request with the new token
          return this.playTrack(trackUri);
        } else {
          logger.error('Failed to refresh access token, cannot play track');
          return false;
        }
      } else {
        const errorText = await response.text();
        logger.error('Failed to start track playback', { 
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          trackUri,
        });
        return false;
      }
    } catch (error) {
      logger.error('Error starting track playback', { error, trackUri });
      return false;
    }
  }

  public async playPlaylist(playlistUri: string, offset: number = 0): Promise<boolean> {
    if (!this.isReady || !this.deviceId) {
      logger.warn('Spotify player not ready, cannot play playlist');
      return false;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${this.deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context_uri: playlistUri,
          offset: { position: offset }
        }),
      });

      if (response.ok) {
        logger.info('Playlist playback started', { playlistUri, offset });
        return true;
      } else {
        logger.error('Failed to start playlist playback', { 
          status: response.status,
          statusText: response.statusText 
        });
        return false;
      }
    } catch (error) {
      logger.error('Error starting playlist playback', { error });
      return false;
    }
  }

  public async pause(): Promise<boolean> {
    if (!this.isReady) {
      logger.warn('Spotify player not ready, cannot pause');
      return false;
    }

    try {
      await this.player!.pause();
      logger.info('Playback paused');
      return true;
    } catch (error) {
      logger.error('Error pausing playback', { error });
      return false;
    }
  }

  public async resume(): Promise<boolean> {
    if (!this.isReady) {
      logger.warn('Spotify player not ready, cannot resume');
      return false;
    }

    try {
      await this.player!.resume();
      logger.info('Playback resumed');
      return true;
    } catch (error) {
      logger.error('Error resuming playback', { error });
      return false;
    }
  }

  public async togglePlay(): Promise<boolean> {
    if (!this.isReady) {
      logger.warn('Spotify player not ready, cannot toggle play');
      return false;
    }

    try {
      await this.player!.togglePlay();
      logger.info('Playback toggled');
      return true;
    } catch (error) {
      logger.error('Error toggling playback', { error });
      return false;
    }
  }

  public async nextTrack(): Promise<boolean> {
    if (!this.isReady) {
      logger.warn('Spotify player not ready, cannot skip to next track');
      return false;
    }

    try {
      await this.player!.nextTrack();
      logger.info('Skipped to next track');
      return true;
    } catch (error) {
      logger.error('Error skipping to next track', { error });
      return false;
    }
  }

  public async previousTrack(): Promise<boolean> {
    if (!this.isReady) {
      logger.warn('Spotify player not ready, cannot skip to previous track');
      return false;
    }

    try {
      await this.player!.previousTrack();
      logger.info('Skipped to previous track');
      return true;
    } catch (error) {
      logger.error('Error skipping to previous track', { error });
      return false;
    }
  }

  public async setVolume(volume: number): Promise<boolean> {
    if (!this.isReady) {
      logger.warn('Spotify player not ready, cannot set volume');
      return false;
    }

    try {
      await this.player!.setVolume(volume);
      logger.info('Volume set', { volume });
      return true;
    } catch (error) {
      logger.error('Error setting volume', { error });
      return false;
    }
  }

  public async getCurrentState(): Promise<SpotifyPlaybackState | null> {
    if (!this.isReady) {
      logger.warn('Spotify player not ready, cannot get current state');
      return null;
    }

    try {
      const state = await this.player!.getCurrentState();
      return state;
    } catch (error) {
      logger.error('Error getting current state', { error });
      return null;
    }
  }

  public isPlayerReady(): boolean {
    return this.isReady;
  }

  public getDeviceId(): string | null {
    return this.deviceId;
  }

  public disconnect(): void {
    if (this.player) {
      this.player.disconnect();
      this.player = null;
      this.isReady = false;
      this.deviceId = null;
      logger.info('Spotify player disconnected');
    }
  }
}

// Export singleton instance
export const spotifyPlaybackService = new SpotifyPlaybackService();
