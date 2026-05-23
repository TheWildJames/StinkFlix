import { useState, useEffect } from 'react';
import { Bookmark, Trash2, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { img } from '../lib/tmdb';
import { useLocalStorage } from '../lib/hooks';
import type { MediaItem } from '../lib/tmdb';

export default function Watchlist() {
  const navigate = useNavigate();
  const [watchlistIds] = useLocalStorage<number[]>('watchlist-ids', []);
  const [items, setItems] = useState<(MediaItem & { media_type: string })[]>([]);

  useEffect(() => {
    const loaded = watchlistIds
      .map(id => {
        try {
          const raw = localStorage.getItem(`watchlist-item-${id}`);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean);
    setItems(loaded);
  }, [watchlistIds]);

  const removeAll = () => {
    watchlistIds.forEach(id => localStorage.removeItem(`watchlist-item-${id}`));
    localStorage.setItem('watchlist-ids', JSON.stringify([]));
    window.location.reload();
  };

  const findStreams = (title: string) => {
    navigate(`/streams?q=${encodeURIComponent(title)}`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <Bookmark className="text-emerald-400" size={28} />
              My Watchlist
            </h1>
            <p className="text-white/40 text-sm mt-1">{items.length} {items.length === 1 ? 'title' : 'titles'} saved</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={removeAll}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20"
            >
              <Trash2 size={14} />
              Clear all
            </button>
          )}
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map(item => {
              const type = item.media_type as 'movie' | 'tv';
              const title = item.title || item.name || '';
              const year = (item.release_date || item.first_air_date || '').slice(0, 4);
              const poster = img(item.poster_path, 'w342');
              const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

              return (
                <div key={item.id} className="group relative flex flex-col rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
                  <Link to={`/${type}/${item.id}`} className="block">
                    {/* Poster */}
                    <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
                      {poster ? (
                        <img
                          src={poster}
                          alt={title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <span className="text-4xl">?</span>
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/90 backdrop-blur flex items-center justify-center shadow-lg shadow-emerald-500/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                          <svg className="text-white ml-0.5" width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                        <button
                          onClick={e => { e.preventDefault(); findStreams(title); }}
                          className="px-3 py-1.5 bg-blue-500/90 hover:bg-blue-400 text-white text-xs font-medium rounded-lg backdrop-blur flex items-center gap-1 transform scale-75 group-hover:scale-100 transition-transform duration-300"
                        >
                          <Zap size={12} />
                          Find Streams
                        </button>
                      </div>

                      {/* Rating badge */}
                      {rating && (
                        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                          <svg className="text-amber-400" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          <span className="text-white text-xs font-medium">{rating}</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-3">
                    <p className="text-white text-sm font-medium leading-tight line-clamp-1">{title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {year && <span className="text-white/40 text-xs">{year}</span>}
                      <span className="text-xs px-1.5 py-0.5 rounded uppercase tracking-wide font-medium bg-emerald-500/20 text-emerald-400">
                        {type === 'movie' ? 'Movie' : 'TV'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <Bookmark size={56} className="mx-auto text-white/10 mb-5" strokeWidth={1.5} />
            <p className="text-white/30 text-lg font-medium">Your watchlist is empty</p>
            <p className="text-white/20 text-sm mt-2">Click the bookmark icon on any movie or show to save it here</p>
          </div>
        )}
      </div>
    </div>
  );
}
