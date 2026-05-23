export interface StreamLink {
  name: string;
  url: string;
  type: 'embed' | 'direct' | 'app';
  quality?: string;
  category?: string;
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

  // Primary reliable embeds
  sources.push(
    { name: '2Embed', url: `https://www.2embed.cc/embed/${imdbId}`, type: 'embed' },
    { name: '2Embed (Fast)', url: `https://www.2embed.cc/stream/${imdbId}`, type: 'embed' },
    { name: 'SuperEmbed', url: `https://multiembed.mov/?video_id=${imdbId}&tmdb=1`, type: 'embed' },
  );

  // VidSrc alternatives
  if (tmdbId) {
    sources.push(
      { name: 'VidSrc.me', url: `https://vidsrc.me/embed/movie/${tmdbId}`, type: 'embed' },
      { name: 'VidSrc.to', url: `https://vidsrc.to/embed/movie/${imdbId}`, type: 'embed' },
    );
  }

  // Additional embeds
  if (imdbId) {
    sources.push(
      { name: 'Embed.su', url: `https://embed.su/embed/movie/${imdbId}`, type: 'embed' },
      { name: 'FlixGo', url: `https://flixgo.net/embed/${imdbId}`, type: 'embed' },
    );
  }

  // Backup sources
  sources.push(
    { name: 'AutoEmbed', url: `https://player.autoembed.cc/embed/movie/${tmdbId}`, type: 'embed' },
  );

  return sources;
}

export function generateTVEmbedSources(imdbId: string, tmdbId: number, season: number, episode: number): StreamLink[] {
  return [
    { name: 'VidSrc Pro', url: `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed' },
    { name: 'VidSrc', url: `https://vidsrc.to/embed/tv/${imdbId}/${season}/${episode}`, type: 'embed' },
    { name: 'VidSrc to', url: `https://vidsrc.cc/embed/tv/${imdbId}/${season}/${episode}`, type: 'embed' },
    { name: '2Embed', url: `https://www.2embed.cc/embedtv/${imdbId}?s=${season}&e=${episode}`, type: 'embed' },
    { name: '2Embed Fast', url: `https://www.2embed.cc/streamtv/${imdbId}?s=${season}&e=${episode}`, type: 'embed' },
    { name: 'SuperEmbed', url: `https://multiembed.mov/?video_id=${imdbId}&tmdb=1&s=${season}&e=${episode}`, type: 'embed' },
    { name: 'EmbedSu', url: `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed' },
    { name: 'SmashyStream', url: `https://player.smashystream.com/tv/${tmdbId}/${season}/${episode}`, type: 'embed' },
    { name: 'AutoEmbed', url: `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed' },
    { name: 'NontonGo', url: `https://www.nontongo.net/embed/tv/${tmdbId}/${season}/${episode}`, type: 'embed' },
    { name: 'FlixGo', url: `https://flixgo.net/embed/tv/${imdbId}/${season}/${episode}`, type: 'embed' },
    { name: 'EmbedR', url: `https://embed.su/tv/${imdbId}/${season}/${episode}`, type: 'embed' },
  ];
}

export function generateDirectStreamLinks(imdbId: string, tmdbId: number, type: 'movie' | 'tv', season?: number, episode?: number): StreamLink[] {
  const links: StreamLink[] = [];
  const idParam = type === 'movie' ? imdbId : `${imdbId}/${season}/${episode}`;

  links.push(
    { name: 'API 1 (m3u8)', url: `https://api.videoapi.sk/v2/stream/start?imdbId=${imdbId}`, type: 'direct', quality: 'auto' },
    { name: 'API 2 (direct)', url: `https://vid_api.crown0.cc/movies/${imdbId}`, type: 'direct', quality: '1080p' },
    { name: 'StreamSB', url: `https://streamsb.net/e/${imdbId}.mp4`, type: 'direct', quality: '1080p' },
    { name: 'XStreamCDN', url: `https://xstreamcdn.com/api/stream.php?id=${imdbId}`, type: 'direct', quality: 'auto' },
  );

  if (type === 'movie') {
    links.push(
      { name: 'MP4 Direct', url: `https://directdown.net/api/download?imdb=${imdbId}`, type: 'direct', quality: '1080p' },
      { name: 'M3U8 Playlist', url: `https://m3u8api.github.io/api.php?imdb=${imdbId}`, type: 'direct', quality: 'multi' },
    );
  }

  return links;
}



export function generateAnimeSources(animeId: string, tmdbId: number, episodeNum?: number): StreamLink[] {
  const links: StreamLink[] = [];

  const embedSources = [
    { name: 'Gogoanime CDN1', url: `https://gogocdn1.pro/embed-${animeId.replace('-', '')}-${episodeNum || 1}.html?ap=1&title=` },
    { name: 'Gogoanime CDN2', url: `https://www1.gogocdn.pro/embed-${animeId.replace('-', '')}-${episodeNum || 1}.html` },
    { name: 'AniWatch', url: `https://aniwatch.tv/api/episode/${animeId}/stream` },
    { name: '9Anime', url: `https://9anime.to/watch/${animeId}${episodeNum ? `?ep=${episodeNum}` : ''}` },
    { name: 'AnimeFlix', url: `https://animiflix.tv/watch/${animeId}${episodeNum ? `?episode=${episodeNum}` : ''}` },
    { name: 'BiliAnime', url: `https://bilianime.tv/anime/${animeId}${episodeNum ? `/ep${episodeNum}` : ''}` },
    { name: 'AnimeKisa', url: `https://animekisa.pro/category/${animeId}${episodeNum ? `-episode-${episodeNum}` : ''}` },
    { name: 'AnimePahe', url: `https://animepahe.ru/watch/${animeId}${episodeNum ? `&q=0` : ''}` },
  ];

  for (const src of embedSources) {
    links.push(src as StreamLink);
  }

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
