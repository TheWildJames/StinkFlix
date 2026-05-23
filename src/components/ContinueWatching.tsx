import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { img } from '../lib/tmdb';
import { useLocalStorage } from '../lib/hooks';
import type { MediaItem } from '../lib/tmdb';

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

interface ContinueWatchingProps {
  items: ContinueWatchingItem[];
}

export default function ContinueWatching({ items }: ContinueWatchingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.5;
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (!items.length) return null;

  return (
    <section className="relative px-4 sm:px-6 py-6 group/section">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Play size={20} className="text-emerald-400" />
            Continue Watching
          </h2>
          <div className="flex gap-1 opacity-0 group-hover/section:opacity-100 transition-opacity">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Scroll left"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Scroll right"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map(item => {
            const title = item.title || '';
            const backdrop = img(item.backdrop_path, 'w780');
            const progressPercent = Math.round(item.progress);
            const watchPath = item.type === 'movie'
              ? `/watch/movie/${item.id}`
              : `/watch/tv/${item.id}/${item.season || 1}/${item.episode || 1}`;

            return (
              <Link
                key={`${item.type}-${item.id}`}
                to={watchPath}
                className="shrink-0 w-52 sm:w-64 group cursor-pointer"
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all">
                  {backdrop ? (
                    <img
                      src={backdrop}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                      <Play size={32} className="text-white/20" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/90 flex items-center justify-center shadow-lg shadow-emerald-500/30 transform scale-75 group-hover:scale-100 transition-transform">
                      <Play size={20} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white text-sm font-medium line-clamp-1">{title}</p>
                    {item.episode && (
                      <p className="text-white/50 text-xs">S{item.season} E{item.episode}</p>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                    <div
                      className="h-full bg-emerald-400 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
