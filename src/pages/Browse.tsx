import { useState, useEffect, useCallback } from 'react';
import { SlidersHorizontal, ChevronDown, Search, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MediaCard from '../components/MediaCard';
import { Spinner } from '../components/Spinner';
import { getPopular, getTopRated, discoverMedia, getGenres } from '../lib/tmdb';
import type { MediaItem } from '../lib/tmdb';

type SortOption = 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'vote_count.desc';

const SORT_LABELS: Record<SortOption, string> = {
  'popularity.desc': 'Most Popular',
  'vote_average.desc': 'Highest Rated',
  'release_date.desc': 'Newest First',
  'vote_count.desc': 'Most Voted',
};

export default function Browse({ type }: { type: 'movie' | 'tv' }) {
  const navigate = useNavigate();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sort, setSort] = useState<SortOption>('popularity.desc');
  const [genres, setGenres] = useState<{ id: number; name: string }[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    getGenres(type).then(d => setGenres(d.genres ?? []));
  }, [type]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const params: Record<string, string> = { sort_by: sort, page: '1' };
    if (selectedGenre) params.with_genres = String(selectedGenre);
    if (sort === 'vote_average.desc') params.vote_count_gte = '200';

    discoverMedia(type, params).then(data => {
      setItems(data.results ?? []);
      setTotalPages(data.total_pages ?? 1);
    }).finally(() => setLoading(false));
  }, [type, sort, selectedGenre]);

  const loadMore = () => {
    if (page >= totalPages || loadingMore) return;
    const next = page + 1;
    setLoadingMore(true);
    const params: Record<string, string> = { sort_by: sort, page: String(next) };
    if (selectedGenre) params.with_genres = String(selectedGenre);
    if (sort === 'vote_average.desc') params.vote_count_gte = '200';

    discoverMedia(type, params).then(data => {
      setItems(prev => [...prev, ...(data.results ?? [])]);
      setPage(next);
    }).finally(() => setLoadingMore(false));
  };

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/streams?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }, [searchQuery, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {type === 'movie' ? 'Movies' : 'TV Shows'}
            </h1>
            <p className="text-white/40 text-sm mt-1">
              Discover {type === 'movie' ? 'films' : 'series'} to watch
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <form onSubmit={handleSearch} className="flex-1 sm:flex-none sm:w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Find streams..."
                  className="w-full bg-white/8 border border-white/10 text-white placeholder-white/30 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-400/50 transition-all"
                />
              </div>
            </form>
            <button
              onClick={() => setShowFilters(s => !s)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border whitespace-nowrap ${
                showFilters
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-white/8 text-white/60 hover:bg-white/15 hover:text-white border-white/10'
              }`}
            >
              <SlidersHorizontal size={15} />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-8 p-5 rounded-2xl bg-white/5 border border-white/8 space-y-4">
            {/* Sort */}
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-2">Sort By</p>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(SORT_LABELS) as SortOption[]).map(s => (
                  <button
                    key={s}
                    onClick={() => setSort(s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      sort === s
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/8 text-white/60 hover:bg-white/15 border border-white/10'
                    }`}
                  >
                    {SORT_LABELS[s]}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre */}
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider font-medium mb-2">Genre</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedGenre(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    selectedGenre === null
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/8 text-white/60 hover:bg-white/15 border border-white/10'
                  }`}
                >
                  All
                </button>
                {genres.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setSelectedGenre(g.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedGenre === g.id
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/8 text-white/60 hover:bg-white/15 border border-white/10'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {items.map(item => (
                <MediaCard key={item.id} item={item} mediaType={type} />
              ))}
            </div>

            {page < totalPages && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-all border border-white/10 disabled:opacity-50"
                >
                  {loadingMore ? <Spinner size="sm" /> : <ChevronDown size={16} />}
                  {loadingMore ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
