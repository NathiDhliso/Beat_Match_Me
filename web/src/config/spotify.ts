/**
 * Spotify API Configuration
 * Handles authentication and API access for music data
 */

export const SPOTIFY_CONFIG = {
  clientId: '4fce2b706ca44c78b7892a3625d14fd1',
  clientSecret: 'e38d3deae7144a62bb3b0d9f59c37931',
  redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/callback` : 'http://localhost:5173/callback',
  scopes: [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-read-collaborative',
  ].join(' '),
  authUrl: 'https://accounts.spotify.com/authorize',
  tokenUrl: 'https://accounts.spotify.com/api/token',
  apiUrl: 'https://api.spotify.com/v1',
};

/**
 * Generate Spotify authorization URL
 */
export const getSpotifyAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: SPOTIFY_CONFIG.clientId,
    response_type: 'code',
    redirect_uri: SPOTIFY_CONFIG.redirectUri,
    scope: SPOTIFY_CONFIG.scopes,
    show_dialog: 'true',
  });

  return `${SPOTIFY_CONFIG.authUrl}?${params.toString()}`;
};
