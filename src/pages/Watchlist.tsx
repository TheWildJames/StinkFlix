import { useState, useEffect } from 'react';
import { Bookmark, Trash2 } from 'lucide-react';
import MediaCard from '../components/MediaCard';
import { useLocalStorage } from '../lib/hooks';
import type { MediaItem } from '../lib/tmdb';

export default function Watchlist() {
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
            {items.map(item => (
              <MediaCard key={item.id} item={item} mediaType={item.media_type as 'movie' | 'tv'} />
            ))}
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
