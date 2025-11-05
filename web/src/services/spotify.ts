/**
 * Spotify Web API Service
 * Handles song search and metadata retrieval
 */

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  duration_ms: number;
  preview_url: string | null;
}

interface SongData {
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
  genre: string;
  duration?: number;
  spotifyId?: string;
  previewUrl?: string;
}

// Spotify API credentials - from environment variables
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '';

if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
  console.warn('⚠️ Spotify credentials not configured. Set VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET in .env file');
}

let accessToken: string | null = null;
let tokenExpirationTime = 0;

/**
 * Get Spotify access token using Client Credentials flow
 */
async function getAccessToken(): Promise<string> {
  // Check if token is still valid
  if (accessToken && Date.now() < tokenExpirationTime) {
    return accessToken;
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error('Failed to get Spotify access token');
    }

    const data = await response.json();
    accessToken = data.access_token;
    tokenExpirationTime = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 min early

    console.log('✅ Spotify access token obtained');
    return accessToken!;
  } catch (error) {
    console.error('❌ Spotify auth error:', error);
    throw error;
  }
}

/**
 * Search for tracks on Spotify
 */
export async function searchSpotify(query: string, limit = 20): Promise<SongData[]> {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Spotify search failed');
    }

    const data = await response.json();
    const tracks: SpotifyTrack[] = data.tracks.items;

    return tracks.map(track => ({
      title: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      album: track.album.name,
      albumArt: track.album.images[0]?.url,
      genre: 'Pop', // Spotify doesn't provide genre per track easily
      duration: track.duration_ms,
      spotifyId: track.id,
      previewUrl: track.preview_url || undefined
    }));
  } catch (error) {
    console.error('Spotify search error:', error);
    throw error;
  }
}

/**
 * Get track details by Spotify ID
 */
export async function getTrackById(trackId: string): Promise<SongData> {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/tracks/${trackId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get track details');
    }

    const track: SpotifyTrack = await response.json();

    return {
      title: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      album: track.album.name,
      albumArt: track.album.images[0]?.url,
      genre: 'Pop',
      duration: track.duration_ms,
      spotifyId: track.id,
      previewUrl: track.preview_url || undefined
    };
  } catch (error) {
    console.error('Get track error:', error);
    throw error;
  }
}

/**
 * Get tracks from a Spotify playlist
 */
export async function getPlaylistTracks(playlistId: string): Promise<SongData[]> {
  try {
    const token = await getAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get playlist tracks');
    }

    const data = await response.json();
    const tracks: SpotifyTrack[] = data.items
      .filter((item: any) => item.track) // Filter out null tracks
      .map((item: any) => item.track);

    console.log(`✅ Retrieved ${tracks.length} tracks from playlist`);

    return tracks.map(track => ({
      title: track.name,
      artist: track.artists[0]?.name || 'Unknown Artist',
      album: track.album.name,
      albumArt: track.album.images[0]?.url,
      genre: 'Pop',
      duration: track.duration_ms,
      spotifyId: track.id,
      previewUrl: track.preview_url || undefined
    }));
  } catch (error) {
    console.error('Get playlist error:', error);
    throw error;
  }
}

/**
 * Extract playlist ID from Spotify URL
 * Supports URLs like:
 * - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
 * - spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
 */
export function extractPlaylistId(url: string): string | null {
  const patterns = [
    /playlist\/([a-zA-Z0-9]+)/,  // URL format
    /playlist:([a-zA-Z0-9]+)/,   // URI format
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}
