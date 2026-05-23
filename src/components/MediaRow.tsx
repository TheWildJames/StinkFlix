import { useRef } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import MediaCard from './MediaCard';
import type { MediaItem } from '../lib/tmdb';

interface Props {
  title: string;
  items: MediaItem[];
  mediaType?: 'movie' | 'tv';
  viewAllLink?: string;
}

export default function MediaRow({ title, items, mediaType, viewAllLink }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (!ref.current) return;
    const amount = ref.current.clientWidth * 0.75;
    ref.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (!items.length) return null;

  return (
    <section className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-white font-bold text-lg sm:text-xl tracking-tight">{title}</h2>
        <div className="flex items-center gap-2">
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="text-emerald-400 hover:text-emerald-300 text-sm font-medium flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          )}
          <div className="hidden sm:flex gap-1">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Scroll container */}
      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map(item => (
          <div key={item.id} className="shrink-0 w-36 sm:w-44">
            <MediaCard item={item} mediaType={mediaType} />
          </div>
        ))}
      </div>
    </section>
  );
}
