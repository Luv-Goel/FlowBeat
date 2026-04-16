import { useState, useEffect, useRef } from 'react';
import { extractDominantColor } from './colorExtract';
import { refreshAccessToken } from './SpotifyAuth';

/**
 * Polls /me/player/currently-playing every 3 s.
 * Returns the current track metadata and the album art dominant colour.
 */
export function useSpotifyNowPlaying(accessToken, refreshToken, onTokenRefresh) {
  const [track, setTrack] = useState(null);
  const [albumColor, setAlbumColor] = useState({ r: 0.4, g: 0.2, b: 0.8 });
  const [error, setError] = useState(null);
  const lastTrackIdRef = useRef(null);
  const tokenRef = useRef(accessToken);

  useEffect(() => {
    tokenRef.current = accessToken;
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) return;

    const poll = async () => {
      try {
        const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: { Authorization: `Bearer ${tokenRef.current}` },
        });

        // 401 = token expired, attempt silent refresh
        if (res.status === 401 && refreshToken) {
          try {
            const data = await refreshAccessToken(refreshToken);
            tokenRef.current = data.access_token;
            onTokenRefresh?.(data.access_token);
          } catch {
            setError('Session expired. Please reconnect Spotify.');
          }
          return;
        }

        // 204 = nothing playing
        if (res.status === 204) {
          setTrack(null);
          return;
        }

        if (!res.ok) return;

        const data = await res.json();
        if (!data?.item) return;

        setTrack(data.item);
        setError(null);

        // Only re-extract colour when track actually changes
        if (data.item.id !== lastTrackIdRef.current) {
          lastTrackIdRef.current = data.item.id;
          const artUrl = data.item?.album?.images?.[1]?.url;
          if (artUrl) {
            const color = await extractDominantColor(artUrl);
            setAlbumColor(color);
          }
        }
      } catch (err) {
        console.error('Spotify poll error:', err);
      }
    };

    poll();
    const id = setInterval(poll, 3000);
    return () => clearInterval(id);
  }, [accessToken, refreshToken, onTokenRefresh]);

  return { track, albumColor, error };
}
