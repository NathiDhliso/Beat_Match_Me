# 🎵 Music Database Integration Guide

## Problem
Manually entering song details (title, artist, genre) is tedious and error-prone. DJs need a quick way to search and add songs from mainstream databases.

---

## 🎯 Recommended Solutions

### Option 1: **Spotify Web API** (BEST - Free & Comprehensive) ⭐

**Why Spotify:**
- ✅ **30 million+ songs**
- ✅ **Free API** (no payment required)
- ✅ **Rich metadata** (genre, album art, duration, popularity)
- ✅ **Search by song/artist/album**
- ✅ **Audio features** (tempo, energy, danceability)
- ✅ **Official API** with good documentation

**Setup:**
```bash
# 1. Register app at: https://developer.spotify.com/dashboard
# 2. Get Client ID and Client Secret
# 3. Install SDK
npm install spotify-web-api-node
```

**Usage Example:**
```typescript
import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: 'YOUR_CLIENT_ID',
  clientSecret: 'YOUR_CLIENT_SECRET'
});

// Authenticate
const data = await spotifyApi.clientCredentialsGrant();
spotifyApi.setAccessToken(data.body['access_token']);

// Search for a song
const results = await spotifyApi.searchTracks('Blinding Lights The Weeknd');

// Extract song data
const track = results.body.tracks.items[0];
const songData = {
  title: track.name,
  artist: track.artists[0].name,
  album: track.album.name,
  albumArt: track.album.images[0]?.url,
  duration: track.duration_ms,
  spotifyId: track.id,
  previewUrl: track.preview_url, // 30-second preview
  genre: track.artists[0].genres?.[0] || 'Unknown'
};
```

**API Limits:**
- ✅ Free tier: Unlimited requests
- ✅ Rate limit: ~180 requests/minute
- ✅ No credit card required

---

### Option 2: **iTunes Search API** (Apple Music)

**Why iTunes:**
- ✅ **Completely free** (no registration)
- ✅ **No API key required**
- ✅ **Simple REST API**
- ✅ **Good for mainstream songs**

**Usage Example:**
```typescript
const searchSong = async (query: string) => {
  const response = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=10`
  );
  const data = await response.json();
  
  return data.results.map((track: any) => ({
    title: track.trackName,
    artist: track.artistName,
    album: track.collectionName,
    albumArt: track.artworkUrl100.replace('100x100', '600x600'),
    genre: track.primaryGenreName,
    previewUrl: track.previewUrl,
    duration: track.trackTimeMillis,
    price: track.trackPrice
  }));
};
```

**API Limits:**
- ✅ Completely free
- ✅ No rate limits (reasonable use)
- ✅ No authentication needed

---

### Option 3: **MusicBrainz API** (Open Source)

**Why MusicBrainz:**
- ✅ **Open-source music encyclopedia**
- ✅ **Free forever**
- ✅ **No API key required**
- ✅ **Comprehensive metadata**

**Usage:**
```typescript
const searchMusicBrainz = async (query: string) => {
  const response = await fetch(
    `https://musicbrainz.org/ws/2/recording/?query=${encodeURIComponent(query)}&fmt=json&limit=10`
  );
  const data = await response.json();
  
  return data.recordings.map((recording: any) => ({
    title: recording.title,
    artist: recording['artist-credit'][0].name,
    duration: recording.length,
    mbid: recording.id
  }));
};
```

**Limitations:**
- ⚠️ No album art (need separate service)
- ⚠️ Rate limit: 1 request/second
- ✅ Free forever

---

### Option 4: **Last.fm API**

**Why Last.fm:**
- ✅ **Free API**
- ✅ **Rich metadata**
- ✅ **Genre tags**
- ✅ **Similar tracks**

**Setup:**
```bash
# Register at: https://www.last.fm/api/account/create
```

**Usage:**
```typescript
const searchLastFm = async (query: string) => {
  const API_KEY = 'YOUR_API_KEY';
  const response = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=track.search&track=${encodeURIComponent(query)}&api_key=${API_KEY}&format=json`
  );
  const data = await response.json();
  
  return data.results.trackmatches.track.map((track: any) => ({
    title: track.name,
    artist: track.artist,
    listeners: track.listeners,
    url: track.url
  }));
};
```

---

## 🏆 Recommended Implementation: Spotify + iTunes Fallback

**Why this combo:**
1. **Spotify** for primary search (best metadata)
2. **iTunes** as fallback (no API key needed)
3. **Best of both worlds**

---

## 📋 Implementation Plan

### Phase 1: Add Song Search Component

Create `SongSearchModal.tsx`:
```typescript
interface SongSearchModalProps {
  onSelectSong: (song: SongData) => void;
  onClose: () => void;
}

export const SongSearchModal: React.FC<SongSearchModalProps> = ({ onSelectSong, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SongData[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Try Spotify first
      const spotifyResults = await searchSpotify(query);
      setResults(spotifyResults);
    } catch (error) {
      // Fallback to iTunes
      const itunesResults = await searchItunes(query);
      setResults(itunesResults);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-900 rounded-3xl border border-white/10 p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Search Songs</h2>
        
        {/* Search Input */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by song title or artist..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-white font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {results.map((song, index) => (
            <button
              key={index}
              onClick={() => onSelectSong(song)}
              className="w-full flex items-center gap-4 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-left"
            >
              {song.albumArt && (
                <img src={song.albumArt} alt={song.title} className="w-12 h-12 rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{song.title}</p>
                <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                <p className="text-gray-500 text-xs">{song.genre}</p>
              </div>
              <div className="text-purple-400 text-sm">Add →</div>
            </button>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg text-white transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
```

---

### Phase 2: Update DJLibrary Component

Add "Search Online" button:
```typescript
<button
  onClick={() => setShowSongSearch(true)}
  className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white font-semibold hover:from-green-700 hover:to-emerald-700 transition-all flex items-center gap-2"
>
  <Search className="w-5 h-5" />
  Search Online
</button>

{showSongSearch && (
  <SongSearchModal
    onSelectSong={(song) => {
      handleAddTrack({
        title: song.title,
        artist: song.artist,
        genre: song.genre,
        basePrice: 20,
        isEnabled: true
      });
      setShowSongSearch(false);
    }}
    onClose={() => setShowSongSearch(false)}
  />
)}
```

---

### Phase 3: Add Spotify Service

Create `services/spotify.ts`:
```typescript
import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
  clientSecret: process.env.REACT_APP_SPOTIFY_CLIENT_SECRET
});

let tokenExpirationTime = 0;

const ensureValidToken = async () => {
  if (Date.now() >= tokenExpirationTime) {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    tokenExpirationTime = Date.now() + (data.body['expires_in'] * 1000);
  }
};

export const searchSpotify = async (query: string) => {
  await ensureValidToken();
  
  const results = await spotifyApi.searchTracks(query, { limit: 20 });
  
  return results.body.tracks.items.map(track => ({
    title: track.name,
    artist: track.artists[0].name,
    album: track.album.name,
    albumArt: track.album.images[0]?.url,
    genre: 'Pop', // Spotify doesn't provide genre per track
    duration: track.duration_ms,
    spotifyId: track.id,
    previewUrl: track.preview_url
  }));
};
```

---

### Phase 4: Add iTunes Fallback

Create `services/itunes.ts`:
```typescript
export const searchItunes = async (query: string) => {
  const response = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=20`
  );
  
  if (!response.ok) {
    throw new Error('iTunes search failed');
  }
  
  const data = await response.json();
  
  return data.results.map((track: any) => ({
    title: track.trackName,
    artist: track.artistName,
    album: track.collectionName,
    albumArt: track.artworkUrl100?.replace('100x100', '600x600'),
    genre: track.primaryGenreName,
    duration: track.trackTimeMillis,
    previewUrl: track.previewUrl,
    itunesId: track.trackId
  }));
};
```

---

## 🔧 Environment Setup

Add to `.env`:
```env
# Spotify API (get from: https://developer.spotify.com/dashboard)
REACT_APP_SPOTIFY_CLIENT_ID=your_client_id_here
REACT_APP_SPOTIFY_CLIENT_SECRET=your_client_secret_here

# iTunes API (no key needed)
# Last.fm API (optional)
REACT_APP_LASTFM_API_KEY=your_lastfm_key_here
```

---

## 📊 Comparison Table

| Feature | Spotify | iTunes | MusicBrainz | Last.fm |
|---------|---------|--------|-------------|---------|
| **Free** | ✅ | ✅ | ✅ | ✅ |
| **No API Key** | ❌ | ✅ | ✅ | ❌ |
| **Album Art** | ✅ | ✅ | ❌ | ✅ |
| **Genre** | ⚠️ | ✅ | ✅ | ✅ |
| **Preview Audio** | ✅ | ✅ | ❌ | ❌ |
| **Catalog Size** | 30M+ | 20M+ | 2M+ | 10M+ |
| **Rate Limits** | 180/min | None | 1/sec | 5/sec |
| **Best For** | Primary | Fallback | Metadata | Tags |

---

## 🎯 Final Recommendation

**Use this stack:**
1. **Primary:** Spotify Web API (best metadata + album art)
2. **Fallback:** iTunes API (no auth required)
3. **Enhancement:** Last.fm (for genre tags)

**Benefits:**
- ✅ Fast song search (type & select)
- ✅ Auto-fill all fields
- ✅ High-quality album art
- ✅ Accurate metadata
- ✅ Free forever

---

## 🚀 Next Steps

1. Register Spotify app
2. Add environment variables
3. Install `spotify-web-api-node`
4. Create `SongSearchModal` component
5. Update `DJLibrary` with search button
6. Test with real songs

**This will reduce song entry from 30 seconds to 3 seconds!** 🎉
