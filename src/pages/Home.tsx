import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Film, Tv, Zap, TrendingUp, Star, Play } from 'lucide-react';
import { getTrending, getPopular, getTopRated, img } from '../lib/tmdb';
import type { MediaItem } from '../lib/tmdb';
import { PageSpinner } from '../components/Spinner';

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [trending, setTrending] = useState<MediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<MediaItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getTrending('all', 'week'),
      getPopular('movie'),
      getPopular('tv'),
      getTopRated('movie'),
      getTopRated('tv'),
    ]).then(([t, pm, ptv, trm, trtv]) => {
      setTrending(t.results ?? []);
      setPopularMovies(pm.results ?? []);
      setPopularTV(ptv.results ?? []);
      setTopRatedMovies(trm.results ?? []);
      setTopRatedTV(trtv.results ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/streams?q=${encodeURIComponent(query.trim())}`);
    }
  }, [query, navigate]);

  const goSearch = (title: string) => {
    setQuery(title);
    navigate(`/streams?q=${encodeURIComponent(title)}`);
  };

  if (loading) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Search Section */}
      <div className="relative h-[500px] flex items-center justify-center bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Stream <span className="text-emerald-400">Finder</span>
          </h1>
          <p className="text-white/50 text-lg mb-8">
            Find all available stream links for movies, TV shows, and anime
          </p>
          
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={22} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search for any movie, show, or anime..."
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 rounded-2xl pl-14 pr-6 py-5 text-lg focus:outline-none focus:border-emerald-400/60 focus:bg-white/15 transition-all"
            />
          </form>

          {/* Quick Suggestions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-white/30 text-sm">Popular:</span>
            {['Oppenheimer', 'The Last of Us', 'Attack on Titan', 'Stranger Things', 'Dune', 'Breaking Bad'].map(term => (
              <button
                key={term}
                onClick={() => goSearch(term)}
                className="px-3 py-1.5 bg-white/8 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/30 text-white/50 hover:text-emerald-400 rounded-full text-sm transition-all"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trending & Popular Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 space-y-12">
        {/* Trending */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={22} className="text-emerald-400" />
            <h2 className="text-2xl font-semibold text-white">Trending This Week</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {trending.slice(0, 12).map(item => (
              <button
                key={item.id}
                onClick={() => goSearch(item.title || item.name || '')}
                className="group bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all border border-white/5 hover:border-emerald-500/30 text-left"
              >
                {item.poster_path ? (
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={img(item.poster_path, 'w342') || ''}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center gap-1.5">
                        <span className="bg-emerald-500/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                          {item.vote_average?.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-white/5 flex items-center justify-center">
                    <Film size={32} className="text-white/20" />
                  </div>
                )}
                <div className="p-2.5">
                  <p className="text-white text-sm font-medium line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {item.title || item.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Popular Movies */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Film size={22} className="text-blue-400" />
            <h2 className="text-2xl font-semibold text-white">Popular Movies</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {popularMovies.slice(0, 12).map(item => (
              <button
                key={item.id}
                onClick={() => goSearch(item.title || '')}
                className="group bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all border border-white/5 hover:border-emerald-500/30 text-left"
              >
                {item.poster_path ? (
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={img(item.poster_path, 'w342') || ''}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-white/5 flex items-center justify-center">
                    <Film size={32} className="text-white/20" />
                  </div>
                )}
                <div className="p-2.5">
                  <p className="text-white text-sm font-medium line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Popular TV Shows */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Tv size={22} className="text-purple-400" />
            <h2 className="text-2xl font-semibold text-white">Popular TV Shows</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {popularTV.slice(0, 12).map(item => (
              <button
                key={item.id}
                onClick={() => goSearch(item.name || '')}
                className="group bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all border border-white/5 hover:border-emerald-500/30 text-left"
              >
                {item.poster_path ? (
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={img(item.poster_path, 'w342') || ''}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-white/5 flex items-center justify-center">
                    <Tv size={32} className="text-white/20" />
                  </div>
                )}
                <div className="p-2.5">
                  <p className="text-white text-sm font-medium line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {item.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Rated */}
        <div>
          <div className="flex items-center gap-2 mb-5">
            <Star size={22} className="text-amber-400" />
            <h2 className="text-2xl font-semibold text-white">Top Rated</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {topRatedMovies.slice(0, 6).map(item => (
              <button
                key={item.id}
                onClick={() => goSearch(item.title || '')}
                className="group bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all border border-white/5 hover:border-emerald-500/30 text-left"
              >
                {item.poster_path ? (
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={img(item.poster_path, 'w342') || ''}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-white/5 flex items-center justify-center">
                    <Film size={32} className="text-white/20" />
                  </div>
                )}
                <div className="p-2.5">
                  <p className="text-white text-sm font-medium line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {item.title}
                  </p>
                </div>
              </button>
            ))}
            {topRatedTV.slice(0, 6).map(item => (
              <button
                key={item.id}
                onClick={() => goSearch(item.name || '')}
                className="group bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all border border-white/5 hover:border-emerald-500/30 text-left"
              >
                {item.poster_path ? (
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={img(item.poster_path, 'w342') || ''}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  </div>
                ) : (
                  <div className="aspect-[2/3] bg-white/5 flex items-center justify-center">
                    <Tv size={32} className="text-white/20" />
                  </div>
                )}
                <div className="p-2.5">
                  <p className="text-white text-sm font-medium line-clamp-1 group-hover:text-emerald-400 transition-colors">
                    {item.name}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
