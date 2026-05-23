import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Film, Tv, Sparkles, Calendar, Star, TrendingUp } from 'lucide-react';
import { getGenres, discoverMedia, getPopular, getTrending } from '../lib/tmdb';
import type { MediaItem, GenreList } from '../lib/tmdb';
import { PageSpinner, CardSkeleton } from '../components/Spinner';
import { useToast } from '../contexts/ToastContext';
import { useLocalStorage } from '../lib/hooks';

type MediaType = 'all' | 'movie' | 'tv';

export default function Explore() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [genres, setGenres] = useState<GenreList>({ movie_genres: [], tv_genres: [] });
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [ratingFrom, setRatingFrom] = useState(0);
  const [sortBy, setSortBy] = useState('popularity.desc');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [recentSearches, setRecentSearches] = useLocalStorage<string[]>('recent-searches', []);

  useEffect(() => {
    getGenres().then(setGenres).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadResults();
  }, [mediaType, selectedGenre, yearFrom, yearTo, ratingFrom, sortBy]);

  const loadResults = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        sort_by: sortBy,
      };
      if (selectedGenre) params.with_genres = selectedGenre;
      if (yearFrom) params.primary_release_year = yearFrom;
      if (yearTo) params.primary_release_year = yearTo;
      if (ratingFrom > 0) params['vote_average.gte'] = ratingFrom;

      let data;
      if (mediaType === 'movie') {
        data = await discoverMedia('movie', params);
      } else if (mediaType === 'tv') {
        data = await discoverMedia('tv', params);
      } else {
        const [movies, tv] = await Promise.all([
          discoverMedia('movie', params),
          discoverMedia('tv', params),
        ]);
        data = {
          results: [...(movies.results || []), ...(tv.results || [])],
          total_pages: Math.max(movies.total_pages || 1, tv.total_pages || 1),
        };
      }

      setResults(data.results?.slice(0, 50) || []);
      setTotalPages(data.total_pages || 1);
    } catch {
      addToast('Failed to load results', 'error');
    } finally {
      setLoading(false);
    }
  }, [mediaType, selectedGenre, yearFrom, yearTo, ratingFrom, sortBy]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setRecentSearches(prev => {
        const updated = [searchQuery, ...prev.filter(s => s !== searchQuery)].slice(0, 10);
        return updated;
      });
      navigate(`/streams?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const loadMore = () => {
    if (page < totalPages) {
      setPage(p => p + 1);
    }
  };

  const clearFilters = () => {
    setSelectedGenre(null);
    setYearFrom('');
    setYearTo('');
    setRatingFrom(0);
    setSortBy('popularity.desc');
  };

  const activeFiltersCount = [selectedGenre, yearFrom, yearTo, ratingFrom].filter(Boolean).length;

  if (loading && results.length === 0) return <PageSpinner />;

  const currentGenres = mediaType === 'tv' ? genres.tv_genres : mediaType === 'movie' ? genres.movie_genres : [...(genres.movie_genres || []), ...(genres.tv_genres || [])];

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 page-transition">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Sparkles className="text-emerald-400" size={28} />
            Explore
          </h1>
          <p className="text-white/40">Discover movies, TV shows, and anime</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search for content..."
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-400/50 transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white/70 hover:text-white rounded-xl transition-all hover:border-emerald-500/30"
            >
              <SlidersHorizontal size={18} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">{activeFiltersCount}</span>
              )}
            </button>
          </div>

          {/* Media type tabs */}
          <div className="flex gap-2">
            {(['all', 'movie', 'tv'] as MediaType[]).map(type => (
              <button
                key={type}
                onClick={() => setMediaType(type)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  mediaType === type
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {type === 'all' ? <Sparkles size={16} /> : type === 'movie' ? <Film size={16} /> : <Tv size={16} />}
                {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl animate-slide-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Genre */}
                <div>
                  <label className="text-white/60 text-xs font-medium mb-2 block">Genre</label>
                  <select
                    value={selectedGenre || ''}
                    onChange={e => setSelectedGenre(e.target.value ? Number(e.target.value) : null)}
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="">All Genres</option>
                    {currentGenres.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                {/* Year From */}
                <div>
                  <label className="text-white/60 text-xs font-medium mb-2 block">Year From</label>
                  <input
                    type="number"
                    value={yearFrom}
                    onChange={e => setYearFrom(e.target.value)}
                    placeholder="2000"
                    min="1900"
                    max="2030"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>

                {/* Year To */}
                <div>
                  <label className="text-white/60 text-xs font-medium mb-2 block">Year To</label>
                  <input
                    type="number"
                    value={yearTo}
                    onChange={e => setYearTo(e.target.value)}
                    placeholder="2024"
                    min="1900"
                    max="2030"
                    className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="text-white/60 text-xs font-medium mb-2 block">Min Rating: {ratingFrom}</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={ratingFrom}
                    onChange={e => setRatingFrom(Number(e.target.value))}
                    className="w-full accent-emerald-400"
                  />
                </div>

                {/* Sort By */}
                <div className="sm:col-span-2 lg:col-span-4">
                  <label className="text-white/60 text-xs font-medium mb-2 block">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full sm:w-auto bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none"
                  >
                    <option value="popularity.desc">Popularity (High to Low)</option>
                    <option value="popularity.asc">Popularity (Low to High)</option>
                    <option value="vote_average.desc">Rating (High to Low)</option>
                    <option value="vote_average.asc">Rating (Low to High)</option>
                    <option value="primary_release_date.desc">Newest First</option>
                    <option value="primary_release_date.asc">Oldest First</option>
                    <option value="original_title.asc">Title (A-Z)</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-sm"
                >
                  <X size={14} />
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-white/40 text-sm">{results.length} results found</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map(item => {
                const type = (item.media_type || 'movie') as string;
                const title = item.title || item.name || '';
                const year = (item.release_date || item.first_air_date || '').slice(0, 4);
                const poster = item.poster_path ? `https://image.tmdb.org/t/p/w342${item.poster_path}` : null;
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
                          <Calendar size={10} />
                          {year}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {page < totalPages && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={loadMore}
                  className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-all border border-white/10 hover:border-emerald-500/30"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <Search size={56} className="mx-auto text-white/10 mb-5" />
            <p className="text-white/30 text-lg font-medium">No results found</p>
            <p className="text-white/20 text-sm mt-2">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
