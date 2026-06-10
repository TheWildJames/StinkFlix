const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || '7335700b6aa01326857f558c0eea39b8';

export interface StreamLink {
  name: string;
  url: string;
  type: 'embed' | 'direct' | 'app';
  quality?: string;
  category?: string;
  priority?: number; // Lower = better (1 = highest priority)
  reliability?: number; // 0-100 score
  autoSelect?: boolean; // Auto-select if valid
}

export interface StreamResult {
  title: string;
  year: string;
  type: 'movie' | 'tv' | 'anime';
  tmdbId: number;
  imdbId: string | null;
  poster: string | null;
  links: StreamLink[];
}

export interface SearchCategory {
  name: string;
  type: 'movie' | 'tv' | 'anime';
  results: StreamResult[];
}

// Get IMDB ID from TMDB
export async function getImdbId(type: 'movie' | 'tv', tmdbId: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${TMDB_KEY}`
    );
    const data = await res.json();
    const imdbId = data.external_ids?.imdb_id;
    return imdbId || null;
  } catch {
    return null;
  }
}

// Safe, vetted movie embed sources only (no adult/adult-adjacent sites)
export function generateMovieEmbedSources(imdbId: string, tmdbId: number): StreamLink[] {
  const sources: StreamLink[] = [];

  // Priority 1 - Most reliable embeds
  sources.push(
    { name: 'VidSrc.me', url: `https://vidsrc.me/embed/movie/${tmdbId}`, type: 'embed', quality: '1080p', priority: 1, reliability: 90, autoSelect: true },
    { name: 'VidSrc.to', url: `https://vidsrc.to/embed/movie/${imdbId}`, type: 'embed', quality: '1080p', priority: 1, reliability: 88, autoSelect: true },
    { name: 'AutoEmbed', url: `https://player.autoembed.cc/embed/movie/${tmdbId}`, type: 'embed', quality: '1080p', priority: 1, reliability: 85, autoSelect: true },
  );

  // Priority 2 - Good alternatives
  sources.push(
    { name: 'VidSrc.ac', url: `https://vidsrc.ac/embed/movie/${imdbId}`, type: 'embed', quality: '1080p', priority: 2, reliability: 80 },
    { name: 'FlixGo', url: `https://flixgo.net/embed/${imdbId}`, type: 'embed', quality: '1080p', priority: 2, reliability: 75 },
    { name: 'Embed.su', url: `https://embed.su/embed/movie/${imdbId}`, type: 'embed', quality: '720p', priority: 2, reliability: 72 },
  );

  // Priority 3 - Backup options
  sources.push(
    { name: 'VidSrc.cc', url: `https://vidsrc.cc/embed/movie/${imdbId}`, type: 'embed', quality: '720p', priority: 3, reliability: 65 },
    { name: 'EmbedR', url: `https://embedr.ovh/movie/${imdbId}`, type: 'embed', quality: '720p', priority: 3, reliability: 60 },
  );

  return sources;
}

// Safe, vetted TV embed sources only
export function generateTVEmbedSources(imdbId: string, tmdbId: number, season: number, episode: number): StreamLink[] {
  return [
    // Priority 1 - Best reliability
    { name: 'VidSrc.me', url: `https://vidsrc.me/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed', quality: '1080p', priority: 1, reliability: 90, autoSelect: true },
    { name: 'VidSrc.to', url: `https://vidsrc.to/embed/tv/${imdbId}/${season}/${episode}`, type: 'embed', quality: '1080p', priority: 1, reliability: 88, autoSelect: true },
    { name: 'AutoEmbed', url: `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed', quality: '1080p', priority: 1, reliability: 85, autoSelect: true },
    // Priority 2 - Good alternatives
    { name: 'VidSrc.pro', url: `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed', quality: '1080p', priority: 2, reliability: 80 },
    { name: 'VidSrc.ac', url: `https://vidsrc.ac/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed', quality: '1080p', priority: 2, reliability: 75 },
    { name: 'FlixGo', url: `https://flixgo.net/embed/tv/${imdbId}/${season}/${episode}`, type: 'embed', quality: '1080p', priority: 2, reliability: 72 },
    // Priority 3 - Backup options
    { name: 'VidSrc.cc', url: `https://vidsrc.cc/embed/tv/${imdbId}/${season}/${episode}`, type: 'embed', quality: '720p', priority: 3, reliability: 65 },
    { name: 'EmbedR', url: `https://embedr.ovh/tv/${imdbId}/${season}/${episode}`, type: 'embed', quality: '720p', priority: 3, reliability: 60 },
  ];
}

// Direct stream links (via proxy)
export function generateDirectStreamLinks(imdbId: string, tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): StreamLink[] {
  const links: StreamLink[] = [];

  // NOTE: Replace YOUR_WORKER_URL with your actual Cloudflare Workers URL
  // Deploy at: https://dash.cloudflare.com -> Workers -> stinkflix-proxy
  // After deployment, update the constant below
  const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'https://stinkflix-proxy.your-subdomain.workers.dev';

  links.push(
    { name: 'StreamSB', url: `${PROXY_URL}/api/proxy?url=https://streamsb.net/e/${imdbId}.mp4`, type: 'direct', quality: '1080p', priority: 1, reliability: 75, autoSelect: true },
    { name: 'Filemoon', url: `${PROXY_URL}/api/proxy?url=https://filemoonembed.com/e/${imdbId}`, type: 'embed', quality: '1080p', priority: 1, reliability: 70, autoSelect: true },
    { name: 'VidSB', url: `${PROXY_URL}/api/proxy?url=https://vidsb.net/e/${imdbId}`, type: 'direct', quality: '720p', priority: 2, reliability: 65 },
  );

  return links;
}

// Safe anime sources only
export function generateAnimeSources(animeId: string, tmdbId: number, episodeNum?: number): StreamLink[] {
  const ep = episodeNum || 1;
  const links: StreamLink[] = [];

  links.push(
    { name: 'VidSrc.me', url: `https://vidsrc.me/embed/tv/${tmdbId}/1/${ep}`, type: 'embed', quality: '720p', priority: 1, reliability: 85, autoSelect: true },
    { name: 'VidSrc.to', url: `https://vidsrc.to/embed/tv/${animeId.replace(/-/g, '')}/1/${ep}`, type: 'embed', quality: '720p', priority: 1, reliability: 80, autoSelect: true },
    { name: 'AutoEmbed', url: `https://player.autoembed.cc/embed/tv/${tmdbId}/1/${ep}`, type: 'embed', quality: '1080p', priority: 1, reliability: 78, autoSelect: true },
  );

  links.push(
    { name: 'VidSrc.ac', url: `https://vidsrc.ac/embed/tv/${tmdbId}/1/${ep}`, type: 'embed', quality: '720p', priority: 2, reliability: 70 },
    { name: 'VidSrc.cc', url: `https://vidsrc.cc/embed/tv/${tmdbId}/1/${ep}`, type: 'embed', quality: '720p', priority: 2, reliability: 65 },
  );

  return links;
}

// Search for streams using TMDB
export async function searchStreams(query: string, categories: ('movie' | 'tv' | 'anime')[]): Promise<SearchCategory[]> {
  const results: SearchCategory[] = [];

  if (categories.includes('movie')) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=1`
      );
      const data = await res.json();
      const movies = (data.results || []).slice(0, 10).map((m: any) => ({
        title: m.title || '',
        year: m.release_date ? m.release_date.substring(0, 4) : '',
        type: 'movie' as const,
        tmdbId: m.id,
        imdbId: null,
        poster: m.poster_path,
        links: [],
      }));

      for (const movie of movies) {
        const imdbId = await getImdbId('movie', movie.tmdbId);
        movie.imdbId = imdbId;
        movie.links = [
          ...generateMovieEmbedSources(imdbId || String(movie.tmdbId), movie.tmdbId),
          ...generateDirectStreamLinks(imdbId || String(movie.tmdbId), movie.tmdbId, 'movie'),
        ];
      }

      results.push({ name: 'Movies', type: 'movie', results: movies });
    } catch {
      results.push({ name: 'Movies', type: 'movie', results: [] });
    }
  }

  if (categories.includes('tv')) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=1`
      );
      const data = await res.json();
      const tvShows = (data.results || []).slice(0, 10).map((t: any) => ({
        title: t.name || '',
        year: t.first_air_date ? t.first_air_date.substring(0, 4) : '',
        type: 'tv' as const,
        tmdbId: t.id,
        imdbId: null,
        poster: t.poster_path,
        links: [],
      }));

      for (const show of tvShows) {
        const imdbId = await getImdbId('tv', show.tmdbId);
        show.imdbId = imdbId;
        show.links = [
          ...generateTVEmbedSources(imdbId || String(show.tmdbId), show.tmdbId, 1, 1),
          ...generateDirectStreamLinks(imdbId || String(show.tmdbId), show.tmdbId, 'tv', 1, 1),
        ];
      }

      results.push({ name: 'TV Shows', type: 'tv', results: tvShows });
    } catch {
      results.push({ name: 'TV Shows', type: 'tv', results: [] });
    }
  }

  if (categories.includes('anime')) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/tv?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=1&include_adult=false`
      );
      const data = await res.json();
      const animeList = (data.results || []).slice(0, 10).map((t: any) => ({
        title: t.name || '',
        year: t.first_air_date ? t.first_air_date.substring(0, 4) : '',
        type: 'anime' as const,
        tmdbId: t.id,
        imdbId: null,
        poster: t.poster_path,
        links: [],
      }));

      for (const anime of animeList) {
        const imdbId = await getImdbId('tv', anime.tmdbId);
        anime.imdbId = imdbId;
        const slugId = anime.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        anime.links = [
          ...generateAnimeSources(slugId, anime.tmdbId, 1),
        ];
      }

      results.push({ name: 'Anime', type: 'anime', results: animeList });
    } catch {
      results.push({ name: 'Anime', type: 'anime', results: [] });
    }
  }

  return results;
}

// Get stream links for a specific item
export async function getStreamLinksForItem(
  tmdbId: number,
  type: 'movie' | 'tv',
  title: string,
  season?: number,
  episode?: number
): Promise<StreamResult> {
  const imdbId = await getImdbId(type, tmdbId);
  const idParam = imdbId || String(tmdbId);

  let links: StreamLink[] = [];

  if (type === 'movie') {
    links = [
      ...generateMovieEmbedSources(idParam, tmdbId),
      ...generateDirectStreamLinks(idParam, tmdbId, 'movie'),
    ];
  } else {
    const s = season || 1;
    const e = episode || 1;
    links = [
      ...generateTVEmbedSources(idParam, tmdbId, s, e),
      ...generateDirectStreamLinks(idParam, tmdbId, 'tv', s, e),
    ];
  }

  return {
    title,
    year: '',
    type,
    tmdbId,
    imdbId,
    poster: null,
    links,
  };
}

// Group stream links by category
export function getStreamLinkCategories(links: StreamLink[]): Map<string, StreamLink[]> {
  const categories = new Map<string, StreamLink[]>();
  const playableStreams: StreamLink[] = [];
  const otherLinks: StreamLink[] = [];

  for (const link of links) {
    if (link.type === 'embed') {
      playableStreams.push(link);
    } else {
      otherLinks.push(link);
    }
  }

  if (playableStreams.length > 0) {
    categories.set('Playable Streams', playableStreams);
  }
  if (otherLinks.length > 0) {
    categories.set('Other Links', otherLinks);
  }

  return categories;
}

// Get best stream index based on priority and reliability (no validation needed)
export function getBestStreamIndex(links: StreamLink[]): number {
  if (links.length === 0) return 0;

  // Sort by priority (lower = better), then reliability, then autoSelect
  const indexedLinks = links.map((link, index) => ({
    index,
    priority: link.priority || 999,
    reliability: link.reliability || 0,
    autoSelect: link.autoSelect || false,
  }));

  indexedLinks.sort((a, b) => {
    // Auto-select streams first
    if (a.autoSelect && !b.autoSelect) return -1;
    if (!a.autoSelect && b.autoSelect) return 1;
    // Then by priority
    if (a.priority !== b.priority) return a.priority - b.priority;
    // Then by reliability (higher is better)
    return b.reliability - a.reliability;
  });

  return indexedLinks[0].index;
}
