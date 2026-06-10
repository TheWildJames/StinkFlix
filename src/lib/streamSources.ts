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

const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || '7335700b6aa01326857f558c0eea39b8';

export async function getImdbId(type: 'movie' | 'tv', tmdbId: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${TMDB_KEY}`
    );
    const data = await res.json();
    return data.imdb_id ?? null;
  } catch {
    return null;
  }
}

export function generateMovieEmbedSources(imdbId: string, tmdbId: number): StreamLink[] {
  const sources: StreamLink[] = [];

  // Primary reliable embeds (Priority 1 - Best)
  sources.push(
    { name: '2Embed', url: `https://www.2embed.cc/embed/${imdbId}`, type: 'embed', quality: '1080p', priority: 1, reliability: 90, autoSelect: true },
    { name: '2Embed (Fast)', url: `https://www.2embed.cc/stream/${imdbId}`, type: 'embed', quality: '1080p', priority: 1, reliability: 90, autoSelect: true },
    { name: 'SuperEmbed (TMDB)', url: `https://multiembed.mov/?video_id=${imdbId}&tmdb=1`, type: 'embed', quality: '1080p', priority: 1, reliability: 88, autoSelect: true },
  );

  // VidSrc alternatives (Priority 2)
  if (tmdbId) {
    sources.push(
      { name: 'VidSrc.me', url: `https://vidsrc.me/embed/movie/${tmdbId}`, type: 'embed', quality: '1080p', priority: 2, reliability: 85, autoSelect: true },
      { name: 'VidSrc.to', url: `https://vidsrc.to/embed/movie/${imdbId}`, type: 'embed', quality: '1080p', priority: 2, reliability: 82 },
      { name: 'VidSrc.ac', url: `https://vidsrc.ac/embed/movie/${imdbId}`, type: 'embed', quality: '1080p', priority: 2, reliability: 80 },
    );
  }

  // Additional embeds (Priority 3)
  if (imdbId) {
    sources.push(
      { name: 'Embed.su', url: `https://embed.su/embed/movie/${imdbId}`, type: 'embed', quality: '720p', priority: 3, reliability: 75 },
      { name: 'FlixGo', url: `https://flixgo.net/embed/${imdbId}`, type: 'embed', quality: '1080p', priority: 3, reliability: 72, autoSelect: true },
      { name: 'CineGuaran', url: `https://www.cineguaran.pw/embed/movie-${imdbId}.html`, type: 'embed', quality: '720p', priority: 3, reliability: 70 },
    );
  }

  // Reliable alternatives (Priority 4)
  sources.push(
    { name: 'AutoEmbed', url: `https://player.autoembed.cc/embed/movie/${tmdbId}`, type: 'embed', quality: '1080p', priority: 4, reliability: 78, autoSelect: true },
    { name: 'EmbedR', url: `https://embedr.ovh/movie/${imdbId}`, type: 'embed', quality: '720p', priority: 4, reliability: 65 },
    { name: 'StreamTape', url: `https://streamtape.com/e/${imdbId}`, type: 'embed', quality: '720p', priority: 4, reliability: 60 },
  );

  // Backup sources (Priority 5)
  sources.push(
    { name: 'DoodStream', url: `https://dood.to/e/${imdbId}`, type: 'embed', quality: '720p', priority: 5, reliability: 50 },
    { name: 'MixDrop', url: `https://mixdrop.co/e/${imdbId}`, type: 'embed', quality: '720p', priority: 5, reliability: 45 },
    { name: 'Uqload', url: `https://uqload.com/embed-${imdbId}.html`, type: 'embed', quality: '480p', priority: 5, reliability: 40 },
  );

  return sources;
}

export function generateTVEmbedSources(imdbId: string, tmdbId: number, season: number, episode: number): StreamLink[] {
  return [
    // Priority 1 - Best reliability
    { name: '2Embed', url: `https://www.2embed.cc/embedtv/${imdbId}?s=${season}&e=${episode}`, type: 'embed', quality: '1080p', priority: 1, reliability: 90, autoSelect: true },
    { name: '2Embed Fast', url: `https://www.2embed.cc/streamtv/${imdbId}?s=${season}&e=${episode}`, type: 'embed', quality: '1080p', priority: 1, reliability: 88, autoSelect: true },
    { name: 'SuperEmbed (TMDB)', url: `https://multiembed.mov/?video_id=${imdbId}&tmdb=1&s=${season}&e=${episode}`, type: 'embed', quality: '1080p', priority: 1, reliability: 87, autoSelect: true },
    // Priority 2 - VidSrc family
    { name: 'VidSrc Pro', url: `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed', quality: '1080p', priority: 2, reliability: 85, autoSelect: true },
    { name: 'VidSrc.me', url: `https://vidsrc.me/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed', quality: '1080p', priority: 2, reliability: 82 },
    { name: 'VidSrc.to', url: `https://vidsrc.to/embed/tv/${imdbId}/${season}/${episode}`, type: 'embed', quality: '1080p', priority: 2, reliability: 80 },
    { name: 'VidSrc.ac', url: `https://vidsrc.ac/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed', quality: '1080p', priority: 2, reliability: 78 },
    // Priority 3 - Good alternatives
    { name: 'Embed.su', url: `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed', quality: '720p', priority: 3, reliability: 75 },
    { name: 'SmashyStream', url: `https://player.smashystream.com/tv/${tmdbId}/${season}/${episode}`, type: 'embed', quality: '1080p', priority: 3, reliability: 73, autoSelect: true },
    { name: 'AutoEmbed', url: `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed', quality: '1080p', priority: 3, reliability: 76, autoSelect: true },
    { name: 'FlixGo', url: `https://flixgo.net/embed/tv/${imdbId}/${season}/${episode}`, type: 'embed', quality: '1080p', priority: 3, reliability: 70, autoSelect: true },
    { name: 'NontonGo', url: `https://www.nontongo.net/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed', quality: '720p', priority: 3, reliability: 68 },
    // Priority 4 - Backup options
    { name: 'VidSrc.cc', url: `https://vidsrc.cc/embed/tv/${imdbId}/${season}/${episode}`, type: 'embed', quality: '720p', priority: 4, reliability: 65 },
    { name: 'EmbedR', url: `https://embedr.ovh/tv/${imdbId}/${season}/${episode}`, type: 'embed', quality: '720p', priority: 4, reliability: 60 },
    { name: 'DoodStream', url: `https://dood.to/e/${imdbId}-${season}-${episode}`, type: 'embed', quality: '720p', priority: 5, reliability: 50 },
  ];
}

export function generateDirectStreamLinks(imdbId: string, tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): StreamLink[] {
  const links: StreamLink[] = [];
  const idParam = type === 'movie' ? imdbId : `${imdbId}/${season}/${episode}`;

  // Priority 1 - Direct stream APIs
  links.push(
    { name: 'VideoAPI.sk', url: `https://api.videoapi.sk/v2/stream/start?imdbId=${imdbId}`, type: 'direct', quality: '1080p', priority: 1, reliability: 80, autoSelect: true },
    { name: 'Crown0 API', url: `https://vid_api.crown0.cc/movies/${imdbId}`, type: 'direct', quality: '1080p', priority: 1, reliability: 78, autoSelect: true },
    { name: 'XStreamCDN', url: `https://xstreamcdn.com/api/stream.php?id=${imdbId}`, type: 'direct', quality: '1080p', priority: 1, reliability: 75, autoSelect: true },
  );

  // Priority 2 - Alternative direct streams
  links.push(
    { name: 'StreamSB', url: `https://streamsb.net/e/${imdbId}.mp4`, type: 'direct', quality: '1080p', priority: 2, reliability: 70 },
    { name: 'StreamingCommunity', url: `https://streamingcommunity.to/api/v1/stream/${imdbId}`, type: 'direct', quality: '1080p', priority: 2, reliability: 68 },
    { name: 'Filemoon', url: `https://filemoonembed.com/e/${imdbId}`, type: 'embed', quality: '1080p', priority: 2, reliability: 65 },
  );

  // Priority 3 - Backup direct links
  if (type === 'movie') {
    links.push(
      { name: 'MP4 Direct', url: `https://directdown.net/api/download?imdb=${imdbId}`, type: 'direct', quality: '1080p', priority: 3, reliability: 60 },
      { name: 'M3U8 Playlist', url: `https://m3u8api.github.io/api.php?imdb=${imdbId}`, type: 'direct', quality: 'multi', priority: 3, reliability: 55 },
      { name: 'DoodStream', url: `https://dood.to/e/${imdbId}`, type: 'embed', quality: '720p', priority: 4, reliability: 50 },
    );
  }

  return links;
}



export function generateAnimeSources(animeId: string, tmdbId: number, episodeNum?: number): StreamLink[] {
  const ep = episodeNum || 1;
  const links: StreamLink[] = [];

  // Priority 1 - Most reliable anime sources
  links.push(
    { name: 'Gogoanime CDN1', url: `https://gogocdn1.pro/embed-${animeId.replace('-', '')}-${ep}.html?ap=1&title=`, type: 'embed', quality: '720p', priority: 1, reliability: 88, autoSelect: true },
    { name: 'Gogoanime CDN2', url: `https://www1.gogocdn.pro/embed-${animeId.replace('-', '')}-${ep}.html`, type: 'embed', quality: '720p', priority: 1, reliability: 85, autoSelect: true },
    { name: 'AnimeFlix', url: `https://animiflix.tv/watch/${animeId}${ep ? `?episode=${ep}` : ''}`, type: 'embed', quality: '1080p', priority: 1, reliability: 80, autoSelect: true },
  );

  // Priority 2 - Good alternatives
  links.push(
    { name: 'AniWatch', url: `https://aniwatch.tv/api/episode/${animeId}/stream`, type: 'embed', quality: '1080p', priority: 2, reliability: 78 },
    { name: '9Anime', url: `https://9anime.to/watch/${animeId}${ep ? `?ep=${ep}` : ''}`, type: 'embed', quality: '720p', priority: 2, reliability: 72 },
    { name: 'AnimeKisa', url: `https://animekisa.pro/category/${animeId}${ep ? `-episode-${ep}` : ''}`, type: 'embed', quality: '720p', priority: 2, reliability: 70 },
  );

  // Priority 3 - Backup sources
  links.push(
    { name: 'BiliAnime', url: `https://bilianime.tv/anime/${animeId}${ep ? `/ep${ep}` : ''}`, type: 'embed', quality: '720p', priority: 3, reliability: 65 },
    { name: 'AnimePahe', url: `https://animepahe.ru/watch/${animeId}${ep ? `&q=0` : ''}`, type: 'embed', quality: '480p', priority: 3, reliability: 60 },
    { name: 'AniMix', url: `https://animix.pl/api/play/${animeId}?ep=${ep}`, type: 'direct', quality: '1080p', priority: 3, reliability: 58 },
  );

  return links;
}

export async function searchStreams(query: string, categories: ('movie' | 'tv' | 'anime')[]): Promise<SearchCategory[]> {
  const results: SearchCategory[] = [];

  if (categories.includes('movie')) {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&page=1`
      );
      const data = await res.json();
      const movies: StreamResult[] = (data.results || []).slice(0, 10).map((m: any) => ({
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
      const tvShows: StreamResult[] = (data.results || []).slice(0, 10).map((t: any) => ({
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
      const animeList: StreamResult[] = (data.results || []).slice(0, 10).map((t: any) => ({
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

// Stream validation interface
export interface StreamValidationResult {
  link: StreamLink;
  isValid: boolean;
  loadTime: number;
}

/**
 * Validate a stream link by attempting to load it in a hidden iframe with timeout
 * Returns true if the iframe loads successfully within timeout
 */
export async function validateStreamLink(link: StreamLink, timeout: number = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = link.url;
      
      // Iframe loaded successfully
      iframe.onload = () => {
        const loadTime = Date.now() - startTime;
        document.body.removeChild(iframe);
        resolve(true);
      };
      
      // Timeout - consider invalid if doesn't load
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {}
        resolve(false);
      }, timeout);
      
      document.body.appendChild(iframe);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Validate multiple streams and return results
 * Stops after finding first valid auto-select stream, or validates all
 */
export async function validateStreams(
  links: StreamLink[],
  maxValidationTime: number = 15000,
  findAutoSelectOnly: boolean = false
): Promise<StreamValidationResult[]> {
  const results: StreamValidationResult[] = [];
  const autoSelectStartTime = Date.now();
  
  for (const link of links) {
    // If we're only looking for auto-select and time is running out, stop
    if (findAutoSelectOnly && (Date.now() - autoSelectStartTime) > 10000) {
      break;
    }
    
    const isValid = await validateStreamLink(link, 6000);
    results.push({ link, isValid, loadTime: 0 });
    
    // If we found a valid auto-select stream, continue validating remaining high-priority ones
    if (findAutoSelectOnly && isValid && link.autoSelect) {
      // Continue to find other valid auto-select options for comparison
    }
  }
  
  return results;
}

/**
 * Get best stream index based on priority, reliability, and validation
 * Prefers autoSelect streams with highest priority/reliability
 */
export function getBestStreamIndex(links: StreamLink[], validatedLinks: StreamValidationResult[] = []): number {
  // If we have validation results, use them
  if (validatedLinks.length > 0) {
    const validStreams = validatedLinks
      .filter(r => r.isValid)
      .map(r => ({
        index: links.findIndex(l => l === r.link),
        priority: r.link.priority || 999,
        reliability: r.link.reliability || 0,
        autoSelect: r.link.autoSelect || false,
      }));
    
    if (validStreams.length > 0) {
      // Sort: autoSelect first, then by priority, then by reliability
      validStreams.sort((a, b) => {
        if (a.autoSelect && !b.autoSelect) return -1;
        if (!a.autoSelect && b.autoSelect) return 1;
        if (a.priority !== b.priority) return a.priority - b.priority;
        return b.reliability - a.reliability;
      });
      
      return validStreams[0].index;
    }
  }
  
  // No validation - fall back to priority-based selection
  const autoSelectLinks = links.filter(l => l.autoSelect);
  const candidates = autoSelectLinks.length > 0 ? autoSelectLinks : links;
  
  // Sort by priority (lower = better), then reliability
  candidates.sort((a, b) => {
    const aPriority = a.priority || 999;
    const bPriority = b.priority || 999;
    if (aPriority !== bPriority) return aPriority - bPriority;
    const aReliability = a.reliability || 0;
    const bReliability = b.reliability || 0;
    return bReliability - aReliability;
  });
  
  return links.findIndex(l => l === candidates[0]);
}
