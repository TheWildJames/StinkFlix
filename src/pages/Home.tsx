import { useState, useEffect } from 'react';
import HeroSlider from '../components/HeroSlider';
import MediaRow from '../components/MediaRow';
import { PageSpinner } from '../components/Spinner';
import { getTrending, getPopular, getTopRated, getNowPlaying, getAiringToday } from '../lib/tmdb';
import type { MediaItem } from '../lib/tmdb';

export default function Home() {
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<MediaItem[]>([]);
  const [nowPlaying, setNowPlaying] = useState<MediaItem[]>([]);
  const [airingToday, setAiringToday] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTrending('all', 'week'),
      getPopular('movie'),
      getPopular('tv'),
      getTopRated('movie'),
      getTopRated('tv'),
      getNowPlaying(),
      getAiringToday(),
    ]).then(([t, pm, ptv, trm, trtv, np, at]) => {
      setTrending(t.results ?? []);
      setPopularMovies(pm.results ?? []);
      setPopularTV(ptv.results ?? []);
      setTopRatedMovies(trm.results ?? []);
      setTopRatedTV(trtv.results ?? []);
      setNowPlaying(np.results ?? []);
      setAiringToday(at.results ?? []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <HeroSlider items={trending.slice(0, 8)} />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 space-y-12">
        <MediaRow title="Trending This Week" items={trending} />
        <MediaRow title="Now Playing in Theaters" items={nowPlaying} mediaType="movie" viewAllLink="/movies" />
        <MediaRow title="Airing Today" items={airingToday} mediaType="tv" viewAllLink="/tv" />
        <MediaRow title="Popular Movies" items={popularMovies} mediaType="movie" viewAllLink="/movies" />
        <MediaRow title="Popular TV Shows" items={popularTV} mediaType="tv" viewAllLink="/tv" />
        <MediaRow title="Top Rated Movies" items={topRatedMovies} mediaType="movie" />
        <MediaRow title="Top Rated TV Shows" items={topRatedTV} mediaType="tv" />
      </div>
    </div>
  );
}
