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
    release_date: string;
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
  loudness: number;
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
  tracks: {
    total: number;
  };
  public: boolean;
  collaborative: boolean;
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
    // Always try Web Crypto API first
    if (window.isSecureContext && window.crypto && window.crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await crypto.subtle.digest('SHA256', data);
        const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=/g, '');
        
        logger.debug('Generated code challenge using Web Crypto API', {
          challengeLength: challenge.length,
          challengeStart: challenge.substring(0, 10) + '...',
        });
        
        return challenge;
      } catch (error) {
        logger.warn('Web Crypto API failed, using fallback SHA256', {
          error: error instanceof Error ? error.message : error,
        });
      }
    }

    // Fallback: Use a reliable SHA256 implementation
    logger.warn('Using fallback SHA256 implementation for code challenge');
    
    const sha256Hash = await this.sha256Fallback(codeVerifier);
    const challenge = btoa(String.fromCharCode(...new Uint8Array(sha256Hash)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
    
    logger.debug('Generated code challenge using fallback SHA256', {
      challengeLength: challenge.length,
      challengeStart: challenge.substring(0, 10) + '...',
    });
    
    return challenge;
  }

  // Reliable SHA256 fallback implementation
  private async sha256Fallback(message: string): Promise<Uint8Array> {
    // Convert string to bytes
    const msgBytes = new TextEncoder().encode(message);
    
    // SHA256 constants
    const K = [
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
    ];

    // Initial hash values
    let h0 = 0x6a09e667;
    let h1 = 0xbb67ae85;
    let h2 = 0x3c6ef372;
    let h3 = 0xa54ff53a;
    let h4 = 0x510e527f;
    let h5 = 0x9b05688c;
    let h6 = 0x1f83d9ab;
    let h7 = 0x5be0cd19;

    // Pre-processing
    const msgLength = msgBytes.length;
    const msgBits = msgLength * 8;
    
    // Add padding
    const paddedLength = Math.ceil((msgLength + 9) / 64) * 64;
    const padded = new Uint8Array(paddedLength);
    padded.set(msgBytes);
    padded[msgLength] = 0x80;
    
    // Add length as 64-bit big-endian
    const view = new DataView(padded.buffer);
    view.setUint32(paddedLength - 8, Math.floor(msgBits / 0x100000000), false);
    view.setUint32(paddedLength - 4, msgBits & 0xffffffff, false);

    // Process each 512-bit chunk
    for (let chunk = 0; chunk < paddedLength; chunk += 64) {
      const w = new Array(64);
      
      // Copy chunk into first 16 words
      for (let i = 0; i < 16; i++) {
        w[i] = view.getUint32(chunk + i * 4, false);
      }
      
      // Extend the first 16 words into the remaining 48 words
      for (let i = 16; i < 64; i++) {
        const s0 = this.rightRotate(w[i-15], 7) ^ this.rightRotate(w[i-15], 18) ^ (w[i-15] >>> 3);
        const s1 = this.rightRotate(w[i-2], 17) ^ this.rightRotate(w[i-2], 19) ^ (w[i-2] >>> 10);
        w[i] = (w[i-16] + s0 + w[i-7] + s1) & 0xffffffff;
      }
      
      // Initialize hash value for this chunk
      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
      
      // Main loop
      for (let i = 0; i < 64; i++) {
        const S1 = this.rightRotate(e, 6) ^ this.rightRotate(e, 11) ^ this.rightRotate(e, 25);
        const ch = (e & f) ^ ((~e) & g);
        const temp1 = (h + S1 + ch + K[i] + w[i]) & 0xffffffff;
        const S0 = this.rightRotate(a, 2) ^ this.rightRotate(a, 13) ^ this.rightRotate(a, 22);
        const maj = (a & b) ^ (a & c) ^ (b & c);
        const temp2 = (S0 + maj) & 0xffffffff;
        
        h = g;
        g = f;
        f = e;
        e = (d + temp1) & 0xffffffff;
        d = c;
        c = b;
        b = a;
        a = (temp1 + temp2) & 0xffffffff;
      }
      
      // Add this chunk's hash to result so far
      h0 = (h0 + a) & 0xffffffff;
      h1 = (h1 + b) & 0xffffffff;
      h2 = (h2 + c) & 0xffffffff;
      h3 = (h3 + d) & 0xffffffff;
      h4 = (h4 + e) & 0xffffffff;
      h5 = (h5 + f) & 0xffffffff;
      h6 = (h6 + g) & 0xffffffff;
      h7 = (h7 + h) & 0xffffffff;
    }
    
    // Produce the final hash value
    const hash = new Uint8Array(32);
    const hashView = new DataView(hash.buffer);
    hashView.setUint32(0, h0, false);
    hashView.setUint32(4, h1, false);
    hashView.setUint32(8, h2, false);
    hashView.setUint32(12, h3, false);
    hashView.setUint32(16, h4, false);
    hashView.setUint32(20, h5, false);
    hashView.setUint32(24, h6, false);
    hashView.setUint32(28, h7, false);
    
    return hash;
  }

  private rightRotate(value: number, amount: number): number {
    return ((value >>> amount) | (value << (32 - amount))) & 0xffffffff;
  }

  public async initiateAuth(): Promise<void> {
    logger.info('Initiating Spotify authentication', {
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      timestamp: new Date().toISOString(),
    });

    const codeVerifier = this.generateCodeVerifier();
    logger.debug('Generated code verifier', {
      verifierLength: codeVerifier.length,
      verifierStart: codeVerifier.substring(0, 10) + '...',
    });
    
    sessionStorage.setItem('spotify_code_verifier', codeVerifier);
    
    // Verify storage worked
    const storedVerifier = sessionStorage.getItem('spotify_code_verifier');
    logger.debug('Code verifier storage verification', {
      stored: !!storedVerifier,
      matches: storedVerifier === codeVerifier,
      storedLength: storedVerifier?.length || 0,
    });

    try {
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      logger.debug('Generated code challenge', {
        challengeLength: codeChallenge.length,
        challengeStart: codeChallenge.substring(0, 10) + '...',
        verifierLength: codeVerifier.length,
        verifierStart: codeVerifier.substring(0, 10) + '...',
      });

      const params = new URLSearchParams({
        client_id: this.clientId,
        response_type: 'code',
        redirect_uri: this.redirectUri,
        scope:
          'user-top-read user-read-recently-played user-read-currently-playing user-read-playback-state user-library-read',
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        show_dialog: 'true',
      });

      const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
      logger.info('Redirecting to Spotify authorization', {
        authUrl: authUrl.substring(0, 100) + '...',
      });
      
      window.location.href = authUrl;
    } catch (error) {
      logger.error('Failed to generate code challenge', { error });
      throw error;
    }
  }

  public async handleCallback(code: string): Promise<boolean> {
    logger.info('Handling Spotify authentication callback', {
      hasCode: !!code,
      codeLength: code.length,
      timestamp: new Date().toISOString(),
    });

    const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
    logger.debug('Code verifier check', {
      hasVerifier: !!codeVerifier,
      verifierLength: codeVerifier?.length || 0,
      verifierStart: codeVerifier?.substring(0, 10) + '...' || 'none',
      codeLength: code.length,
      codeStart: code.substring(0, 20) + '...',
    });

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
      hasToken: !!this.accessToken,
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
      const errorText = await response.text();
      logger.error('Spotify API request failed', {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        url,
        error: errorText,
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

  public async getLikedSongs(limit: number = 20, offset: number = 0): Promise<{
    tracks: SpotifyTrack[];
    total: number;
    hasMore: boolean;
  }> {
    logger.info('Fetching liked songs', {
      limit,
      offset,
      timestamp: new Date().toISOString(),
    });

    const data = await this.makeRequest<{
      items: Array<{ track: SpotifyTrack; added_at: string }>;
      total: number;
      limit: number;
      offset: number;
      next: string | null;
    }>(`/me/tracks?limit=${limit}&offset=${offset}`);

    const tracks = data.items.map(item => item.track);
    const hasMore = !!data.next;

    logger.info('Liked songs fetched successfully', {
      trackCount: tracks.length,
      total: data.total,
      hasMore,
      timestamp: new Date().toISOString(),
    });

    return {
      tracks,
      total: data.total,
      hasMore,
    };
  }

  public async getPlaylists(limit: number = 20, offset: number = 0): Promise<{
    playlists: SpotifyPlaylist[];
    total: number;
    hasMore: boolean;
  }> {
    logger.info('Fetching playlists', {
      limit,
      offset,
      timestamp: new Date().toISOString(),
    });

    const data = await this.makeRequest<{
      items: SpotifyPlaylist[];
      total: number;
      limit: number;
      offset: number;
      next: string | null;
    }>(`/me/playlists?limit=${limit}&offset=${offset}`);

    const hasMore = !!data.next;

    logger.info('Playlists fetched successfully', {
      playlistCount: data.items.length,
      total: data.total,
      hasMore,
      timestamp: new Date().toISOString(),
    });

    return {
      playlists: data.items,
      total: data.total,
      hasMore,
    };
  }

  public async getAudioFeaturesAnalysis(trackIds: string[]): Promise<{
    averageFeatures: SpotifyAudioFeatures;
    features: SpotifyAudioFeatures[];
    isRestricted: boolean;
  }> {
    logger.info('Fetching audio features analysis', {
      trackCount: trackIds.length,
      timestamp: new Date().toISOString(),
    });

    try {
      // Get audio features for all tracks
      const features = await this.getAudioFeatures(trackIds);

      // Calculate average features
      const averageFeatures: SpotifyAudioFeatures = {
        danceability: features.reduce((sum, f) => sum + f.danceability, 0) / features.length,
        energy: features.reduce((sum, f) => sum + f.energy, 0) / features.length,
        valence: features.reduce((sum, f) => sum + f.valence, 0) / features.length,
        acousticness: features.reduce((sum, f) => sum + f.acousticness, 0) / features.length,
        instrumentalness: features.reduce((sum, f) => sum + f.instrumentalness, 0) / features.length,
        liveness: features.reduce((sum, f) => sum + f.liveness, 0) / features.length,
        speechiness: features.reduce((sum, f) => sum + f.speechiness, 0) / features.length,
        tempo: features.reduce((sum, f) => sum + f.tempo, 0) / features.length,
        loudness: features.reduce((sum, f) => sum + f.loudness, 0) / features.length,
        key: Math.round(features.reduce((sum, f) => sum + f.key, 0) / features.length),
        mode: Math.round(features.reduce((sum, f) => sum + f.mode, 0) / features.length),
        time_signature: Math.round(features.reduce((sum, f) => sum + f.time_signature, 0) / features.length),
      };

      logger.info('Audio features analysis completed', {
        trackCount: features.length,
        averageDanceability: averageFeatures.danceability,
        averageEnergy: averageFeatures.energy,
        averageValence: averageFeatures.valence,
        timestamp: new Date().toISOString(),
      });

      return {
        averageFeatures,
        features,
        isRestricted: false,
      };
    } catch (error: any) {
      // Check if this is a 403 error (restricted access)
      if (error.status === 403) {
        logger.warn('Audio features access restricted by Spotify', {
          error: error.message,
          timestamp: new Date().toISOString(),
        });

        // Return mock data for demonstration purposes
        const mockFeatures: SpotifyAudioFeatures = {
          danceability: 0.7,
          energy: 0.8,
          valence: 0.6,
          acousticness: 0.3,
          instrumentalness: 0.1,
          liveness: 0.2,
          speechiness: 0.1,
          tempo: 120,
          loudness: -5,
          key: 0,
          mode: 1,
          time_signature: 4,
        };

        return {
          averageFeatures: mockFeatures,
          features: [mockFeatures],
          isRestricted: true,
        };
      }

      // Re-throw other errors
      throw error;
    }
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
