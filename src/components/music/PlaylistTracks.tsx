import React, { useState, useEffect, useCallback } from 'react';

import {
  spotifyService,
  SpotifyTrack,
  SpotifyPlaylist,
} from '../../services/spotifyService';
import { logger } from '../../utils/logger';

interface PlaylistTracksProps {
  playlist: SpotifyPlaylist;
  onPlayTrack: (track: SpotifyTrack) => void;
  onBack: () => void;
}

const PlaylistTracks: React.FC<PlaylistTracksProps> = ({
  playlist,
  onPlayTrack,
  onBack,
}) => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const loadTracks = useCallback(
    async (resetTracks = false) => {
      try {
        setError(null);
        if (resetTracks) {
          setLoading(true);
          setTracks([]);
          setOffset(0);
        }

        const newOffset = resetTracks ? 0 : offset;
        const data = await spotifyService.getPlaylistTracks(
          playlist.id,
          50,
          newOffset
        );

        if (resetTracks) {
          setTracks(data.tracks);
        } else {
          setTracks(prev => [...prev, ...data.tracks]);
        }

        setTotal(data.total);
        setHasMore(data.hasMore);
        setOffset(newOffset + 50);

        logger.info('Playlist tracks loaded', {
          playlistId: playlist.id,
          trackCount: data.tracks.length,
          total: data.total,
          hasMore: data.hasMore,
        });
      } catch (error) {
        logger.error('Failed to load playlist tracks', {
          error,
          playlistId: playlist.id,
        });
        setError('Failed to load playlist tracks. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [playlist.id, offset]
  );

  useEffect(() => {
    loadTracks(true);
  }, [playlist.id]); // Only depend on playlist.id

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadTracks(false);
    }
  };

  const formatDuration = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (loading && tracks.length === 0) {
    return (
      <div className='playlist-tracks-loading'>
        <div className='loading-spinner' />
        <p>Loading playlist tracks...</p>
      </div>
    );
  }

  if (error && tracks.length === 0) {
    return (
      <div className='playlist-tracks-error'>
        <p>{error}</p>
        <button onClick={() => loadTracks(true)} className='retry-btn'>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className='playlist-tracks-container'>
      <div className='playlist-tracks-header'>
        <button
          onClick={onBack}
          className='back-btn'
          aria-label='Back to playlists'
        >
          ← Back to Playlists
        </button>
        <div className='playlist-header-info'>
          <img
            src={playlist.images[0]?.url || '/placeholder-playlist.png'}
            alt={`${playlist.name} cover`}
            className='playlist-header-image'
          />
          <div className='playlist-header-details'>
            <h2>{playlist.name}</h2>
            <p className='playlist-description'>
              {playlist.description || 'No description'}
            </p>
            <div className='playlist-meta'>
              <span>{total} tracks</span>
              <span>by {playlist.owner.display_name}</span>
              <span>{playlist.public ? 'Public' : 'Private'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className='playlist-tracks-list'>
        {tracks.map((track, index) => (
          <div key={`${track.id}-${index}`} className='playlist-track-item'>
            <div className='track-number'>{index + 1}</div>
            <img
              src={track.album.images[0]?.url}
              alt={`${track.album.name} cover`}
              className='track-item-image'
            />
            <div className='track-item-info'>
              <h4 className='track-item-name' title={track.name}>
                {track.name}
              </h4>
              <p
                className='track-item-artist'
                title={track.artists.map(a => a.name).join(', ')}
              >
                {track.artists.map(a => a.name).join(', ')}
              </p>
              <p className='track-item-album' title={track.album.name}>
                {track.album.name}
              </p>
            </div>
            <div className='track-item-actions'>
              <span className='track-duration'>
                {formatDuration(track.duration_ms)}
              </span>
              <button
                className='play-btn'
                onClick={() => onPlayTrack(track)}
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

      {hasMore && (
        <div className='load-more-container'>
          <button
            className='load-more-btn'
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Tracks'}
          </button>
        </div>
      )}

      {tracks.length === 0 && !loading && (
        <div className='no-tracks'>
          <p>
            This playlist appears to be empty or contains no playable tracks.
          </p>
        </div>
      )}
    </div>
  );
};

export default PlaylistTracks;
