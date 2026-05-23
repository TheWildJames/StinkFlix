import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Film, Tv, Zap, TrendingUp, Star, Play, Clock, Sparkles, Gamepad2, Heart, Bomb, Ghost, Sun, X } from 'lucide-react';
import { getTrending, getPopular, getTopRated, getNowPlaying, getAiringToday, searchTMDB, img } from '../lib/tmdb';
import type { MediaItem } from '../lib/tmdb';
import HeroSlider from '../components/HeroSlider';
import ContinueWatching from '../components/ContinueWatching';
import RecentlyViewed from '../components/RecentlyViewed';
import MediaRow from '../components/MediaRow';
import { PageSpinner, RowSkeleton, CardSkeleton } from '../components/Spinner';
import { useHistory } from '../contexts/HistoryContext';
import { useToast } from '../contexts/ToastContext';
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
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
    if (showSearchResults && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchResults]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const data = await searchTMDB(searchQuery);
      setSearchResults(data.results?.slice(0, 30) || []);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
      setShowSearchResults(true);
    }
  }, [query, performSearch]);

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const goSearch = (title: string) => {
    setQuery(title);
    performSearch(title);
    setShowSearchResults(true);
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
      {showSearchResults ? (
        /* Search Results View */
        <div className="pt-20 page-transition">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
            {/* Search Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={clearSearch}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  aria-label="Back to home"
                >
                  <X size={20} />
                </button>
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={query}
                      onChange={e => setQuery(e.target.value)}
                      placeholder="Search for movies, TV shows..."
                      className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-400/50 transition-all"
                    />
                  </div>
                </form>
              </div>
              <h1 className="text-2xl font-bold text-white">
                {isSearching ? 'Searching...' : `Results for "${query}"`}
              </h1>
              <p className="text-white/40 text-sm mt-1">
                {isSearching ? 'Please wait' : `${searchResults.length} results found`}
              </p>
            </div>

            {/* Search Results */}
            {isSearching ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 18 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {searchResults.map(item => {
                  const type = (item.media_type || 'movie') as string;
                  const title = item.title || item.name || '';
                  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
                  const poster = item.poster_path ? img(item.poster_path, 'w342') : null;
                  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

                  return (
                    <div
                      key={item.id}
                      className="group relative flex flex-col rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 cursor-pointer"
                      onClick={() => navigate(`/${type}/${item.id}`)}
                    >
                      <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
                        {poster ? (
                          <img
                            src={poster}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20">
                            <span className="text-4xl">?</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                        {rating && (
                          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                            <Star size={10} className="text-amber-400" fill="currentColor" />
                            <span className="text-white text-xs font-medium">{rating}</span>
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-emerald-500/80 rounded-md">
                          <span className="text-white text-[10px] font-bold uppercase">{type}</span>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="text-white text-sm font-medium leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                          {title}
                        </p>
                        {year && (
                          <div className="flex items-center gap-1 text-white/40 text-xs mt-1">
                            <Clock size={10} />
                            {year}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24">
                <Search size={56} className="mx-auto text-white/10 mb-5" />
                <p className="text-white/30 text-lg font-medium">No results found</p>
                <p className="text-white/20 text-sm mt-2">Try searching for a different title</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Main Home View */
        <div>
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

            {/* Continue Watching with Progress */}
            {continueWatching.length > 0 && (
              <div className="animate-slide-up">
                <MediaRow
                  title="▶️ Continue Watching"
                  items={continueWatching.map(item => item.media as MediaItem)}
                  mediaType={continueWatching[0]?.media.media_type as 'movie' | 'tv'}
                  showProgress
                />
              </div>
            )}

            {/* Recently Viewed */}
            <RecentlyViewed items={getRecentViews(10)} />

            {/* Top 10 in Your Country Today */}
            {trending.length >= 10 && (
              <div className="animate-slide-up">
                <MediaRow
                  title="🏆 Top 10 in Your Country Today"
                  items={trending.slice(0, 10)}
                  mediaType="movie"
                  isTop10
                />
              </div>
            )}

            {/* 🔥 Trending This Week */}
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

            {/* 🎬 Now Playing Movies */}
            {nowPlayingMovies.length > 0 && (
              <div className="animate-slide-up">
                <MediaRow
                  title="🎬 Now Playing"
                  items={nowPlayingMovies.slice(0, 20)}
                  mediaType="movie"
                />
              </div>
            )}

            {/* 🆕 New Releases */}
            {popularMovies.length > 0 && (
              <div className="animate-slide-up">
                <MediaRow
                  title="🆕 New Releases"
                  items={popularMovies.slice(0, 20)}
                  mediaType="movie"
                  viewAllLink="/movies"
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

            {/* 📺 Airing Today */}
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

            {/* ⭐ Top Rated */}
            {(topRatedMovies.length > 0 || topRatedTV.length > 0) && (
              <div className="animate-slide-up">
                <MediaRow
                  title="⭐ Top Rated"
                  items={[...topRatedMovies.slice(0, 10), ...topRatedTV.slice(0, 10)].sort(() => Math.random() - 0.5)}
                  mediaType="movie"
                />
              </div>
            )}

            {/* 🎭 Award-Winning Dramas */}
            {topRatedMovies.length > 5 && (
              <div className="animate-slide-up">
                <MediaRow
                  title="🎭 Award-Winning Dramas"
                  items={topRatedMovies.slice(0, 15)}
                  mediaType="movie"
                />
              </div>
            )}

            {/* 🌟 Critically Acclaimed TV */}
            {topRatedTV.length > 0 && (
              <div className="animate-slide-up">
                <MediaRow
                  title="🌟 Critically Acclaimed TV"
                  items={topRatedTV.slice(0, 15)}
                  mediaType="tv"
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
      )}
    </div>
  );
}
