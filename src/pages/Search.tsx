import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import MediaCard from '../components/MediaCard';
import Spinner from '../components/Spinner';
import { searchMulti } from '../lib/tmdb';
import { useDebounce } from '../lib/hooks';
import type { MediaItem } from '../lib/tmdb';

type FilterType = 'all' | 'movie' | 'tv';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const debounced = useDebounce(query, 400);

  useEffect(() => {
    if (!debounced.trim()) { setResults([]); return; }
    setLoading(true);
    setPage(1);
    searchMulti(debounced, '1').then(data => {
      const filtered = (data.results ?? []).filter(
        (r: MediaItem) => r.media_type === 'movie' || r.media_type === 'tv'
      );
      setResults(filtered);
      setTotalPages(data.total_pages ?? 1);
    }).finally(() => setLoading(false));
  }, [debounced]);

  const loadMore = () => {
    if (page >= totalPages) return;
    const next = page + 1;
    setPage(next);
    searchMulti(debounced, String(next)).then(data => {
      const filtered = (data.results ?? []).filter(
        (r: MediaItem) => r.media_type === 'movie' || r.media_type === 'tv'
      );
      setResults(prev => [...prev, ...filtered]);
    });
  };

  const filtered = filter === 'all' ? results : results.filter(r => r.media_type === filter);

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Search input */}
        <div className="relative max-w-2xl mx-auto mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search movies, TV shows..."
            className="w-full bg-white/8 border border-white/10 text-white placeholder-white/30 rounded-2xl pl-12 pr-4 py-4 text-base focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all"
          />
          {loading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </div>
          )}
        </div>

        {/* Filters */}
        {results.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal size={15} className="text-white/40" />
            {(['all', 'movie', 'tv'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                  filter === f
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/8 text-white/60 hover:bg-white/15 hover:text-white border border-white/10'
                }`}
              >
                {f === 'all' ? 'All' : f === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
            <span className="text-white/30 text-sm ml-auto">{filtered.length} results</span>
          </div>
        )}

        {/* Results */}
        {filtered.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {filtered.map(item => (
                <MediaCard key={item.id} item={item} />
              ))}
            </div>
            {page < totalPages && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={loadMore}
                  className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white rounded-xl font-medium transition-all border border-white/10"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        ) : debounced && !loading ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg">No results for &ldquo;{debounced}&rdquo;</p>
            <p className="text-white/20 text-sm mt-2">Try a different search term</p>
          </div>
        ) : !debounced ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/30 text-lg">Search for movies and TV shows</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
