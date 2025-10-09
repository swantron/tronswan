import { logger } from '../utils/logger';
import { runtimeConfig } from '../utils/runtimeConfig';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  popularity: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyArtist {
  id: string;
  name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  genres: string[];
  popularity: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAudioFeatures {
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
  tempo: number;
  key: number;
  mode: number;
  time_signature: number;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  images: Array<{
    url: string;
    height: number;
    width: number;
  }>;
  followers: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

class SpotifyService {
  private clientId: string;
  private redirectUri: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.clientId = runtimeConfig.get('VITE_SPOTIFY_CLIENT_ID');
    this.redirectUri = runtimeConfig.get('VITE_SPOTIFY_REDIRECT_URI');

    // Load tokens from localStorage
    this.loadTokens();
  }

  private loadTokens(): void {
    try {
      const storedTokens = localStorage.getItem('spotify_tokens');
      if (storedTokens) {
        const { accessToken, refreshToken, expiry } = JSON.parse(storedTokens);
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.tokenExpiry = expiry;

        logger.debug('Spotify tokens loaded from localStorage', {
          hasAccessToken: !!this.accessToken,
          hasRefreshToken: !!this.refreshToken,
          expiresAt: new Date(this.tokenExpiry).toISOString(),
        });
      }
    } catch (error) {
      logger.error('Failed to load Spotify tokens', { error });
    }
  }

  private saveTokens(): void {
    try {
      const tokens = {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        expiry: this.tokenExpiry,
      };
      localStorage.setItem('spotify_tokens', JSON.stringify(tokens));

      logger.debug('Spotify tokens saved to localStorage', {
        hasAccessToken: !!this.accessToken,
        hasRefreshToken: !!this.refreshToken,
      });
    } catch (error) {
      logger.error('Failed to save Spotify tokens', { error });
    }
  }

  private generateCodeVerifier(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private async generateCodeChallenge(codeVerifier: string): Promise<string> {
    // Check if we're in a secure context (HTTPS or localhost)
    if (!window.isSecureContext) {
      throw new Error(
        'Crypto operations require a secure context (HTTPS or localhost)'
      );
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA256', data);
    return btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  public initiateAuth(): void {
    logger.info('Initiating Spotify authentication', {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      timestamp: new Date().toISOString(),
    });

    const codeVerifier = this.generateCodeVerifier();
    sessionStorage.setItem('spotify_code_verifier', codeVerifier);

    this.generateCodeChallenge(codeVerifier).then(codeChallenge => {
      const params = new URLSearchParams({
        client_id: this.clientId,
        response_type: 'code',
        redirect_uri: this.redirectUri,
        scope:
          'user-top-read user-read-recently-played user-read-currently-playing user-read-playback-state',
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        show_dialog: 'true',
      });

      const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
      window.location.href = authUrl;
    });
  }

  public async handleCallback(code: string): Promise<boolean> {
    logger.info('Handling Spotify authentication callback', {
      hasCode: !!code,
      timestamp: new Date().toISOString(),
    });

    const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
    if (!codeVerifier) {
      logger.error('No code verifier found in session storage');
      return false;
    }

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: this.redirectUri,
          code_verifier: codeVerifier,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        logger.error('Spotify token exchange failed', {
          status: response.status,
          error,
        });
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000;

      this.saveTokens();
      sessionStorage.removeItem('spotify_code_verifier');

      logger.info('Spotify authentication successful', {
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      logger.error('Spotify authentication callback failed', { error });
      return false;
    }
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      logger.error('No refresh token available');
      return false;
    }

    logger.debug('Refreshing Spotify access token');

    try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          grant_type: 'refresh_token',
          refresh_token: this.refreshToken,
        }),
      });

      if (!response.ok) {
        logger.error('Spotify token refresh failed', {
          status: response.status,
        });
        return false;
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000;

      if (data.refresh_token) {
        this.refreshToken = data.refresh_token;
      }

      this.saveTokens();

      logger.info('Spotify access token refreshed successfully', {
        expiresIn: data.expires_in,
        timestamp: new Date().toISOString(),
      });

      return true;
    } catch (error) {
      logger.error('Spotify token refresh failed', { error });
      return false;
    }
  }

  private async ensureValidToken(): Promise<boolean> {
    if (!this.accessToken) {
      logger.warn('No Spotify access token available');
      return false;
    }

    if (Date.now() >= this.tokenExpiry - 60000) {
      // Refresh 1 minute before expiry
      logger.debug('Spotify token expired, refreshing');
      return await this.refreshAccessToken();
    }

    return true;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const isValid = await this.ensureValidToken();
    if (!isValid) {
      throw new Error('Invalid or expired Spotify token');
    }

    const url = `https://api.spotify.com/v1${endpoint}`;

    logger.debug('Making Spotify API request', {
      endpoint,
      url,
      timestamp: new Date().toISOString(),
    });

    const response = await logger.measureAsync(
      'spotify-api-call',
      async () => {
        return await fetch(url, {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        });
      },
      { endpoint }
    );

    if (!response.ok) {
      logger.error('Spotify API request failed', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        url,
      });
      throw new Error(
        `Spotify API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    logger.info('Spotify API request successful', {
      endpoint,
      status: response.status,
      url,
    });

    return data;
  }

  public async getUserProfile(): Promise<SpotifyUser> {
    logger.info('Fetching Spotify user profile', {
      timestamp: new Date().toISOString(),
    });

    const user = await this.makeRequest<SpotifyUser>('/me');

    logger.info('Spotify user profile fetched successfully', {
      userId: user.id,
      displayName: user.display_name,
      followers: user.followers.total,
      timestamp: new Date().toISOString(),
    });

    return user;
  }

  public async getTopTracks(
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 20
  ): Promise<SpotifyTrack[]> {
    logger.info('Fetching Spotify top tracks', {
      timeRange,
      limit,
      timestamp: new Date().toISOString(),
    });

    const response = await this.makeRequest<{ items: SpotifyTrack[] }>(
      `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
    );
    const tracks = response.items;

    logger.info('Spotify top tracks fetched successfully', {
      trackCount: tracks.length,
      timeRange,
      limit,
      timestamp: new Date().toISOString(),
    });

    return tracks;
  }

  public async getTopArtists(
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term',
    limit: number = 20
  ): Promise<SpotifyArtist[]> {
    logger.info('Fetching Spotify top artists', {
      timeRange,
      limit,
      timestamp: new Date().toISOString(),
    });

    const response = await this.makeRequest<{ items: SpotifyArtist[] }>(
      `/me/top/artists?time_range=${timeRange}&limit=${limit}`
    );
    const artists = response.items;

    logger.info('Spotify top artists fetched successfully', {
      artistCount: artists.length,
      timeRange,
      limit,
      timestamp: new Date().toISOString(),
    });

    return artists;
  }

  public async getRecentlyPlayed(limit: number = 20): Promise<SpotifyTrack[]> {
    logger.info('Fetching Spotify recently played tracks', {
      limit,
      timestamp: new Date().toISOString(),
    });

    const response = await this.makeRequest<{
      items: Array<{ track: SpotifyTrack }>;
    }>(`/me/player/recently-played?limit=${limit}`);
    const tracks = response.items.map(item => item.track);

    logger.info('Spotify recently played tracks fetched successfully', {
      trackCount: tracks.length,
      limit,
      timestamp: new Date().toISOString(),
    });

    return tracks;
  }

  public async getCurrentlyPlaying(): Promise<SpotifyTrack | null> {
    logger.debug('Fetching Spotify currently playing track', {
      timestamp: new Date().toISOString(),
    });

    try {
      const response = await this.makeRequest<{ item: SpotifyTrack | null }>(
        '/me/player/currently-playing'
      );
      const track = response.item;

      if (track) {
        logger.info('Spotify currently playing track fetched successfully', {
          trackId: track.id,
          trackName: track.name,
          artistName: track.artists[0]?.name,
          timestamp: new Date().toISOString(),
        });
      } else {
        logger.debug('No track currently playing on Spotify');
      }

      return track;
    } catch (error) {
      logger.warn('Failed to fetch currently playing track', { error });
      return null;
    }
  }

  public async getAudioFeatures(
    trackIds: string[]
  ): Promise<SpotifyAudioFeatures[]> {
    logger.info('Fetching Spotify audio features', {
      trackCount: trackIds.length,
      timestamp: new Date().toISOString(),
    });

    const ids = trackIds.join(',');
    const response = await this.makeRequest<{
      audio_features: SpotifyAudioFeatures[];
    }>(`/audio-features?ids=${ids}`);
    const features = response.audio_features.filter(f => f !== null);

    logger.info('Spotify audio features fetched successfully', {
      featureCount: features.length,
      requestedCount: trackIds.length,
      timestamp: new Date().toISOString(),
    });

    return features;
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken && Date.now() < this.tokenExpiry;
  }

  public logout(): void {
    logger.info('Spotify user logout', {
      timestamp: new Date().toISOString(),
    });

    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = 0;

    localStorage.removeItem('spotify_tokens');
  }
}

export const spotifyService = new SpotifyService();
