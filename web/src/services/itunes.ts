/**
 * iTunes Search API Service
 * Fallback for when Spotify is unavailable
 * No authentication required!
 */

interface SongData {
  title: string;
  artist: string;
  album: string;
  albumArt?: string;
  genre: string;
  duration?: number;
  itunesId?: number;
  previewUrl?: string;
}

/**
 * Search for tracks on iTunes
 */
export async function searchItunes(query: string, limit = 20): Promise<SongData[]> {
  try {
    const response = await fetch(
      `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=${limit}`
    );

    if (!response.ok) {
      throw new Error('iTunes search failed');
    }

    const data = await response.json();

    return data.results.map((track: any) => ({
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      albumArt: track.artworkUrl100?.replace('100x100', '600x600'), // Get higher res
      genre: track.primaryGenreName,
      duration: track.trackTimeMillis,
      itunesId: track.trackId,
      previewUrl: track.previewUrl
    }));
  } catch (error) {
    console.error('iTunes search error:', error);
    throw error;
  }
}
