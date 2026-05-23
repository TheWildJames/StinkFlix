export interface EmbedSource {
  name: string;
  url: string;
}

export function getMovieSources(imdbId: string, tmdbId: number): EmbedSource[] {
  return [
    { name: 'VidSrc Pro', url: `https://vidsrc.pro/embed/movie/${tmdbId}` },
    { name: 'VidSrc', url: `https://vidsrc.to/embed/movie/${imdbId}` },
    { name: '2Embed', url: `https://www.2embed.cc/embed/${imdbId}` },
    { name: 'SuperEmbed', url: `https://multiembed.mov/?video_id=${imdbId}&tmdb=1` },
    { name: 'EmbedSu', url: `https://embed.su/embed/movie/${tmdbId}` },
    { name: 'SmashyStream', url: `https://player.smashystream.com/movie/${tmdbId}` },
    { name: 'AutoEmbed', url: `https://player.autoembed.cc/embed/movie/${tmdbId}` },
    { name: 'NontonGo', url: `https://www.NontonGo.net/embed/movie/${tmdbId}` },
  ];
}

export function getTVSources(imdbId: string, tmdbId: number, season: number, episode: number): EmbedSource[] {
  return [
    { name: 'VidSrc Pro', url: `https://vidsrc.pro/embed/tv/${tmdbId}/${season}/${episode}` },
    { name: 'VidSrc', url: `https://vidsrc.to/embed/tv/${imdbId}/${season}/${episode}` },
    { name: '2Embed', url: `https://www.2embed.cc/embedtv/${imdbId}&s=${season}&e=${episode}` },
    { name: 'SuperEmbed', url: `https://multiembed.mov/?video_id=${imdbId}&tmdb=1&s=${season}&e=${episode}` },
    { name: 'EmbedSu', url: `https://embed.su/embed/tv/${tmdbId}/${season}/${episode}` },
    { name: 'SmashyStream', url: `https://player.smashystream.com/tv/${tmdbId}/${season}/${episode}` },
    { name: 'AutoEmbed', url: `https://player.autoembed.cc/embed/tv/${tmdbId}/${season}/${episode}` },
    { name: 'NontonGo', url: `https://www.NontonGo.net/embed/tv/${tmdbId}/${season}/${episode}` },
  ];
}

export async function getImdbId(type: 'movie' | 'tv', tmdbId: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=aee5d1d09b9a81d5e9bcba0b7a6d2ab3`
    );
    const data = await res.json();
    return data.imdb_id ?? null;
  } catch {
    return null;
  }
}
