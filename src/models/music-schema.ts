interface AppleMusicPreview {
  url: string;
}

interface AppleMusicArtwork {
  width: number;
  height: number;
  url: string;
  bgColor: string;
  textColor1: string;
  textColor2: string;
  textColor3: string;
  textColor4: string;
}

interface AppleMusicPlayParams {
  id: string;
  kind: string;
}

interface AppleMusic {
  previews: AppleMusicPreview[];
  artwork: AppleMusicArtwork;
  artistName: string;
  url: string;
  discNumber: number;
  genreNames: string[];
  durationInMillis: number;
  releaseDate: string;
  name: string;
  isrc: string;
  albumName: string;
  playParams: AppleMusicPlayParams;
  trackNumber: number;
  composerName: string;
  isAppleDigitalMaster: boolean;
  hasLyrics: boolean;
}

interface SpotifyExternalUrls {
  spotify: string;
}

interface SpotifyArtist {
  name: string;
  id: string;
  uri: string;
  href: string;
  external_urls: SpotifyExternalUrls;
}

interface SpotifyImage {
  height: number;
  width: number;
  url: string;
}

interface SpotifyAlbum {
  name: string;
  artists: SpotifyArtist[];
  album_group: string;
  album_type: string;
  id: string;
  uri: string;
  available_markets: string[];
  href: string;
  images: SpotifyImage[];
  external_urls: SpotifyExternalUrls;
  release_date: string;
  release_date_precision: string;
}

interface SpotifyExternalIds {
  isrc: string;
}

interface Spotify {
  album: SpotifyAlbum;
  external_ids: SpotifyExternalIds;
  popularity: number;
  is_playable: boolean;
  linked_from: null;
  artists: SpotifyArtist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  name: string;
  preview_url: string;
  track_number: number;
  uri: string;
  type: string;
}

interface MusicResponse {
  artist: string;
  title: string;
  album: string;
  release_date: string;
  label: string;
  timecode: string;
  song_link: string;
  apple_music: AppleMusic;
  spotify: Spotify;
}

export type { MusicResponse };
