import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Film, Tv, Zap, TrendingUp, Star, Play, Clock, Sparkles, Gamepad2, Heart, Bomb, Ghost, Sun } from 'lucide-react';
import { getTrending, getPopular, getTopRated, getNowPlaying, getAiringToday, img } from '../lib/tmdb';
import type { MediaItem } from '../lib/tmdb';
import HeroSlider from '../components/HeroSlider';
import ContinueWatching from '../components/ContinueWatching';
import RecentlyViewed from '../components/RecentlyViewed';
import MediaRow from '../components/MediaRow';
import { PageSpinner, RowSkeleton } from '../components/Spinner';
import { useHistory } from '../contexts/HistoryContext';
import { useToast } from '../contexts/ToastContext';
import { useAchievements } from '../contexts/AchievementsContext';
import { useLocalStorage } from '../lib/hooks';

interface ContinueWatchingItem {
  id: number;
  type: 'movie' | 'tv';
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  progress: number;
  episode?: number;
  season?: number;
  media_type?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const { getRecentViews } = useHistory();
  const { addToast } = useToast();
  const { unlockAchievement } = useAchievements();
  const [query, setQuery] = useState('');
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<MediaItem[]>([]);
  const [nowPlayingMovies, setNowPlaying] = useState<MediaItem[]>([]);
  const [airingToday, setAiringToday] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [streak, setStreak] = useLocalStorage<number>('streak-count', 0);
  const [lastVisit, setLastVisit] = useLocalStorage<number>('last-visit', 0);

  useEffect(() => {
    // Check streak
    const now = Date.now();
    const yesterday = now - 86400000;
    if (lastVisit > yesterday) {
      setStreak(prev => prev + 1);
      if (prev === 6) {
        unlockAchievement('streak_starter');
        addToast('🔥 7-day streak achieved!', 'success');
      }
    } else if (lastVisit < now - 172800000) {
      setStreak(1);
    }
    setLastVisit(now);

    // Load continue watching
    try {
      const cw = localStorage.getItem('stinkflix-continue');
      if (cw) {
        setContinueWatching(JSON.parse(cw).slice(0, 8));
      }
    } catch {}

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

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/streams?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, navigate]);

  const goSearch = (title: string) => {
    navigate(`/streams?q=${encodeURIComponent(title)}`);
  };

  const randomPick = () => {
    const all = [...trending, ...popularMovies, ...popularTV].sort(() => Math.random() - 0.5);
    if (all.length > 0) {
      const pick = all[0];
      goSearch(pick.title || pick.name || '');
      addToast(`🎲 Random pick: ${pick.title || pick.name}`, 'info');
    }
  };

  const moods = [
    { name: 'Action', icon: <Bomb size={20} className="text-red-400" />, genres: [28, 12, 10752] },
    { name: 'Comedy', icon: <Sparkles size={20} className="text-yellow-400" />, genres: [35] },
    { name: 'Horror', icon: <Ghost size={20} className="text-purple-400" />, genres: [27] },
    { name: 'Romance', icon: <Heart size={20} className="text-pink-400" />, genres: [10749] },
    { name: 'Sci-Fi', icon: <Gamepad2 size={20} className="text-blue-400" />, genres: [878] },
    { name: 'Feel Good', icon: <Sun size={20} className="text-amber-400" />, genres: [18, 36] },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f]">
        <RowSkeleton count={8} />
        <RowSkeleton count={8} />
        <RowSkeleton count={8} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Netflix-Style Hero Slider */}
      <HeroSlider />

      {/* Search Bar (floating below hero) */}
      <div className="relative -mt-8 z-10 max-w-3xl mx-auto px-4">
        <form onSubmit={handleSearch} className="glass rounded-2xl p-2 flex items-center gap-2 animate-slide-up">
          <Search className="text-white/30 ml-3" size={20} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for movies, TV shows, or anime..."
            className="flex-1 bg-transparent text-white placeholder-white/40 py-3 px-2 focus:outline-none text-base"
          />
          <button
            type="button"
            onClick={randomPick}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-400 hover:to-blue-400 text-white rounded-xl font-medium text-sm transition-all flex items-center gap-2"
            title="Random discovery"
          >
            <Zap size={16} />
            <span className="hidden sm:inline">Random</span>
          </button>
        </form>
      </div>

      {/* Quick Mood Selector */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-emerald-400" />
            What's Your Mood?
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {moods.map(mood => (
              <button
                key={mood.name}
                onClick={() => {
                  const genreId = mood.genres[0];
                  navigate(`/movies?genre=${genreId}`);
                }}
                className="group flex flex-col items-center gap-2 p-4 glass rounded-xl hover:scale-105 transition-all"
              >
                {mood.icon}
                <span className="text-white text-sm font-medium">{mood.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Continue Watching */}
        <ContinueWatching items={continueWatching} />

        {/* Recently Viewed */}
        <RecentlyViewed items={getRecentViews(10)} />

        {/* Trending This Week */}
        {trending.length > 0 && (
          <div className="animate-slide-up">
            <MediaRow
              title="🔥 Trending This Week"
              items={trending.slice(0, 20)}
              mediaType="movie"
              viewAllLink="/movies"
            />
          </div>
        )}

        {/* Now Playing Movies */}
        {nowPlayingMovies.length > 0 && (
          <div className="animate-slide-up">
            <MediaRow
              title="🎬 Now Playing"
              items={nowPlayingMovies.slice(0, 20)}
              mediaType="movie"
            />
          </div>
        )}

        {/* Popular Movies */}
        {popularMovies.length > 0 && (
          <div className="animate-slide-up">
            <MediaRow
              title="Popular Movies"
              items={popularMovies.slice(0, 20)}
              mediaType="movie"
              viewAllLink="/movies"
            />
          </div>
        )}

        {/* Airing Today */}
        {airingToday.length > 0 && (
          <div className="animate-slide-up">
            <MediaRow
              title="📺 Airing Today"
              items={airingToday.slice(0, 20)}
              mediaType="tv"
            />
          </div>
        )}

        {/* Popular TV Shows */}
        {popularTV.length > 0 && (
          <div className="animate-slide-up">
            <MediaRow
              title="Popular TV Shows"
              items={popularTV.slice(0, 20)}
              mediaType="tv"
              viewAllLink="/tv"
            />
          </div>
        )}

        {/* Top Rated */}
        {(topRatedMovies.length > 0 || topRatedTV.length > 0) && (
          <div className="animate-slide-up">
            <MediaRow
              title="⭐ Top Rated"
              items={[...topRatedMovies.slice(0, 10), ...topRatedTV.slice(0, 10)].sort(() => Math.random() - 0.5)}
              mediaType="movie"
            />
          </div>
        )}

        {/* Quick Suggestions */}
        <div className="mt-12 mb-8 text-center">
          <h3 className="text-white/40 text-sm mb-4">Popular Searches</h3>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['Oppenheimer', 'The Last of Us', 'Attack on Titan', 'Stranger Things', 'Dune', 'Breaking Bad', 'The Batman', 'Wednesday'].map(term => (
              <button
                key={term}
                onClick={() => goSearch(term)}
                className="px-4 py-2 bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-white/50 hover:text-emerald-400 rounded-full text-sm transition-all"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
