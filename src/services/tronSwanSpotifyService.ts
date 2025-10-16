/**
 * Tron Swan's Personal Spotify Service
 * Fetches Tron Swan's personal Spotify data using stored credentials
 */

import { logger } from '../utils/logger';
import { runtimeConfig } from '../utils/runtimeConfig';

// Types (reusing from spotifyService)
export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
    external_urls: {
      spotify: string;
    };
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
    release_date: string;
    external_urls: {
      spotify: string;
    };
  };
  duration_ms: number;
  popularity: number;
  external_urls: {
    spotify: string;
  };
  uri: string;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
  popularity: number;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  owner: {
    display_name: string;
    id: string;
  };
  public: boolean;
  collaborative: boolean;
  tracks: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
  uri: string;
}

class TronSwanSpotifyService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.loadStoredTokens();
  }

  private loadStoredTokens(): void {
    try {
      // In a real implementation, you'd store Tron Swan's tokens securely
      // For now, we'll use environment variables or a secure config
      const storedTokens = localStorage.getItem('tron_spotify_tokens');
      if (storedTokens) {
        const { accessToken, refreshToken, expiresAt } = JSON.parse(storedTokens);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiry = expiresAt;
        
        // Check if token is expired
        if (Date.now() >= this.tokenExpiry) {
          logger.warn('Tron Swan Spotify token expired, will need refresh');
          this.accessToken = null;
        }
      }
    } catch (error) {
      logger.error('Failed to load Tron Swan Spotify tokens', { error });
    }
  }

  private async getValidToken(): Promise<string | null> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    if (!this.refreshToken) {
      logger.error('No refresh token available for Tron Swan Spotify');
      return null;
    }

    try {
      const refreshed = await this.refreshAccessToken();
      return refreshed ? this.accessToken : null;
    } catch (error) {
      logger.error('Failed to refresh Tron Swan Spotify token', { error });
      return null;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      logger.error('No refresh token available for Tron Swan Spotify');
      return false;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${runtimeConfig.get('VITE_SPOTIFY_CLIENT_ID')}:${runtimeConfig.get('VITE_SPOTIFY_CLIENT_SECRET')}`)}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        logger.error('Failed to refresh Tron Swan Spotify token', {
          status: response.status,
          statusText: response.statusText,
        });
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + (data.expires_in * 1000);

      // Update stored tokens
      localStorage.setItem('tron_spotify_tokens', JSON.stringify({
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiresAt: this.tokenExpiry,
      }));

      logger.info('Tron Swan Spotify token refreshed successfully');
      return true;
    } catch (error) {
      logger.error('Error refreshing Tron Swan Spotify token', { error });
      return false;
    }
  }

  private async makeRequest<T>(endpoint: string): Promise<T | null> {
    const token = await this.getValidToken();
    if (!token) {
      logger.error('No valid token available for Tron Swan Spotify request');
      return null;
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        logger.error('Tron Swan Spotify API request failed', {
          endpoint,
          status: response.status,
          statusText: response.statusText,
        });
        return null;
      }

      return await response.json();
    } catch (error) {
      logger.error('Error making Tron Swan Spotify request', { error, endpoint });
      return null;
    }
  }

  public async getUserProfile(): Promise<SpotifyUser | null> {
    logger.info('Fetching Tron Swan Spotify profile');
    return this.makeRequest<SpotifyUser>('/me');
  }

  public async getTopTracks(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyTrack[] | null> {
    logger.info('Fetching Tron Swan top tracks', { timeRange });
    const data = await this.makeRequest<{ items: SpotifyTrack[] }>(`/me/top/tracks?time_range=${timeRange}&limit=50`);
    return data?.items || null;
  }

  public async getTopArtists(timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyArtist[] | null> {
    logger.info('Fetching Tron Swan top artists', { timeRange });
    const data = await this.makeRequest<{ items: SpotifyArtist[] }>(`/me/top/artists?time_range=${timeRange}&limit=50`);
    return data?.items || null;
  }

  public async getRecentlyPlayed(): Promise<SpotifyTrack[] | null> {
    logger.info('Fetching Tron Swan recently played tracks');
    const data = await this.makeRequest<{ items: Array<{ track: SpotifyTrack }> }>('/me/player/recently-played?limit=50');
    return data?.items.map(item => item.track) || null;
  }

  public async getCurrentlyPlaying(): Promise<SpotifyTrack | null> {
    logger.info('Fetching Tron Swan currently playing track');
    const data = await this.makeRequest<{ item: SpotifyTrack }>('/me/player/currently-playing');
    return data?.item || null;
  }

  public async getLikedSongs(limit: number = 20, offset: number = 0): Promise<{ tracks: SpotifyTrack[]; total: number; hasMore: boolean } | null> {
    logger.info('Fetching Tron Swan liked songs', { limit, offset });
    const data = await this.makeRequest<{ items: Array<{ track: SpotifyTrack }>; total: number }>(`/me/tracks?limit=${limit}&offset=${offset}`);
    
    if (!data) return null;
    
    return {
      tracks: data.items.map(item => item.track),
      total: data.total,
      hasMore: offset + limit < data.total,
    };
  }

  public async getPlaylists(limit: number = 20, offset: number = 0): Promise<{ playlists: SpotifyPlaylist[]; total: number; hasMore: boolean } | null> {
    logger.info('Fetching Tron Swan playlists', { limit, offset });
    const data = await this.makeRequest<{ items: SpotifyPlaylist[]; total: number }>(`/me/playlists?limit=${limit}&offset=${offset}`);
    
    if (!data) return null;
    
    return {
      playlists: data.items.map(playlist => ({
        ...playlist,
        description: playlist.description || 'No description'
      })),
      total: data.total,
      hasMore: offset + limit < data.total,
    };
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken && Date.now() < this.tokenExpiry;
  }

  public async initializeTokens(accessToken: string, refreshToken: string, expiresIn: number): Promise<void> {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.tokenExpiry = Date.now() + (expiresIn * 1000);

    localStorage.setItem('tron_spotify_tokens', JSON.stringify({
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      expiresAt: this.tokenExpiry,
    }));

    logger.info('Tron Swan Spotify tokens initialized');
  }

  /**
   * Initialize tokens from environment variables (for development)
   * This should only be used in development and with secure token storage
   */
  public async initializeFromEnv(): Promise<boolean> {
    try {
      // Check if we have tokens in environment variables
      const accessToken = process.env.REACT_APP_TRON_SPOTIFY_ACCESS_TOKEN;
      const refreshToken = process.env.REACT_APP_TRON_SPOTIFY_REFRESH_TOKEN;
      
      if (!accessToken || !refreshToken) {
        logger.warn('Tron Swan Spotify tokens not found in environment variables');
        return false;
      }

      await this.initializeTokens(accessToken, refreshToken, 3600); // 1 hour default
      logger.info('Tron Swan Spotify tokens initialized from environment');
      return true;
    } catch (error) {
      logger.error('Failed to initialize Tron Swan tokens from environment', { error });
      return false;
    }
  }
}

// Export singleton instance
export const tronSwanSpotifyService = new TronSwanSpotifyService();
