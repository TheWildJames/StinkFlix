import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { imgOriginal, img } from '../lib/tmdb';
import type { MediaItem } from '../lib/tmdb';

interface Props {
  items: MediaItem[];
}

export default function HeroSlider({ items }: Props) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const go = useCallback((index: number) => {
    if (transitioning) return;
    setTransitioning(true);
    setTimeout(() => {
      setCurrent(index);
      setTransitioning(false);
    }, 200);
  }, [transitioning]);

  const prev = () => go((current - 1 + items.length) % items.length);
  const next = useCallback(() => go((current + 1) % items.length), [current, items.length, go]);

  useEffect(() => {
    const id = setInterval(next, 7000);
    return () => clearInterval(id);
  }, [next]);

  if (!items.length) return null;

  const item = items[current];
  const type = (item.media_type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv';
  const title = item.title ?? item.name ?? '';
  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4);
  const backdrop = imgOriginal(item.backdrop_path);
  const rating = item.vote_average?.toFixed(1);

  return (
    <div className="relative w-full h-[75vh] min-h-[520px] max-h-[900px] overflow-hidden">
      {/* Background */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${transitioning ? 'opacity-0' : 'opacity-100'}`}>
        {backdrop ? (
          <img src={backdrop} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className={`relative h-full flex flex-col justify-end pb-24 px-8 sm:px-12 max-w-3xl transition-all duration-500 ${transitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
        {/* Badges */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            type === 'movie' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
          }`}>
            {type === 'movie' ? 'Movie' : 'TV Show'}
          </span>
          {rating && (
            <div className="flex items-center gap-1 text-amber-400">
              <Star size={13} fill="currentColor" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          )}
          {year && <span className="text-white/50 text-sm">{year}</span>}
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-none tracking-tight mb-4 drop-shadow-2xl">
          {title}
        </h1>

        {/* Overview */}
        {item.overview && (
          <p className="text-white/70 text-base leading-relaxed mb-6 line-clamp-2 max-w-xl">
            {item.overview}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link
            to={`/${type}/${item.id}`}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95"
          >
            <Play size={18} fill="white" />
            Watch Now
          </Link>
          <Link
            to={`/${type}/${item.id}`}
            className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-200 backdrop-blur border border-white/10"
          >
            <Info size={18} />
            Details
          </Link>
        </div>
      </div>

      {/* Thumbnails & Controls */}
      <div className="absolute bottom-6 right-8 sm:right-12 flex items-center gap-3">
        <button onClick={prev} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition-all">
          <ChevronLeft size={18} />
        </button>

        <div className="hidden sm:flex items-center gap-2">
          {items.slice(0, 8).map((it, i) => (
            <button
              key={it.id}
              onClick={() => go(i)}
              className={`transition-all duration-300 rounded overflow-hidden ${
                i === current
                  ? 'w-12 h-8 ring-2 ring-emerald-400 opacity-100'
                  : 'w-8 h-6 opacity-40 hover:opacity-70'
              }`}
            >
              <img
                src={img(it.backdrop_path ?? it.poster_path, 'w185') ?? ''}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        <div className="flex sm:hidden items-center gap-1.5">
          {items.slice(0, 8).map((_, i) => (
            <button
              key={i}
              onClick={() => go(i)}
              className={`rounded-full transition-all ${i === current ? 'w-5 h-1.5 bg-emerald-400' : 'w-1.5 h-1.5 bg-white/30 hover:bg-white/60'}`}
            />
          ))}
        </div>

        <button onClick={next} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur transition-all">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
