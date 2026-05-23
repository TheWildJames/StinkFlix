const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '7335700b6aa01326857f558c0eea39b8';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const img = (path: string | null, size = 'w500') =>
  path ? `${IMAGE_BASE}/${size}${path}` : null;

export const imgOriginal = (path: string | null) => img(path, 'original');

async function apiFetch(endpoint: string, params: Record<string, string> = {}) {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${res.statusText}`);
  return res.json();
}

export interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type?: string;
  genre_ids?: number[];
}

export interface MediaDetail extends MediaItem {
  genres: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  status: string;
  tagline?: string;
  production_countries?: { name: string }[];
  spoken_languages?: { english_name: string }[];
  seasons?: Season[];
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  poster_path: string | null;
  air_date: string | null;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  air_date: string | null;
  runtime: number | null;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export const getTrending = (type: 'movie' | 'tv' | 'all' = 'all', window: 'day' | 'week' = 'week') =>
  apiFetch(`/trending/${type}/${window}`);

export const getPopular = (type: 'movie' | 'tv') =>
  apiFetch(`/${type}/popular`);

export const getTopRated = (type: 'movie' | 'tv') =>
  apiFetch(`/${type}/top_rated`);

export const getNowPlaying = () => apiFetch('/movie/now_playing');

export const getAiringToday = () => apiFetch('/tv/airing_today');

export const getDetail = (type: 'movie' | 'tv', id: number): Promise<MediaDetail> =>
  apiFetch(`/${type}/${id}`);

export const getCredits = (type: 'movie' | 'tv', id: number) =>
  apiFetch(`/${type}/${id}/credits`);

export const getVideos = (type: 'movie' | 'tv', id: number) =>
  apiFetch(`/${type}/${id}/videos`);

export const getSimilar = (type: 'movie' | 'tv', id: number) =>
  apiFetch(`/${type}/${id}/similar`);

export const getRecommendations = (type: 'movie' | 'tv', id: number) =>
  apiFetch(`/${type}/${id}/recommendations`);

export const getSeasonEpisodes = (tvId: number, season: number): Promise<{ episodes: Episode[] }> =>
  apiFetch(`/tv/${tvId}/season/${season}`);

export const searchMulti = (query: string, page = '1') =>
  apiFetch('/search/multi', { query, page });

export const getGenres = (type: 'movie' | 'tv') =>
  apiFetch(`/genre/${type}/list`);

export const discoverMedia = (type: 'movie' | 'tv', params: Record<string, string> = {}) =>
  apiFetch(`/discover/${type}`, params);
