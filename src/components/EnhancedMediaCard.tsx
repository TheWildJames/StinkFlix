import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Play, Bookmark, BookmarkCheck, Zap, Info } from 'lucide-react';
import { img } from '../lib/tmdb';
import { getVideos } from '../lib/tmdb';
import type { MediaItem } from '../lib/tmdb';
import { useLocalStorage } from '../lib/hooks';

interface Props {
  item: MediaItem;
  mediaType?: 'movie' | 'tv';
  onHover?: (item: MediaItem | null) => void;
}

export default function EnhancedMediaCard({ item, mediaType, onHover }: Props) {
  const navigate = useNavigate();
  const type = mediaType ?? item.media_type ?? 'movie';
  const title = item.title ?? item.name ?? '';
  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4);
  const poster = img(item.poster_path, 'w342');
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

  const [watchlist, setWatchlist] = useLocalStorage<number[]>('watchlist-ids', []);
  const inWatchlist = watchlist.includes(item.id);
  const [showPreview, setShowPreview] = useState(false);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [loadingTrailer, setLoadingTrailer] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout>>();

  const toggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWatchlist(prev =>
      prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
    );
    localStorage.setItem(
      `watchlist-item-${item.id}`,
      JSON.stringify({ ...item, media_type: type })
    );
  };

  const findStreams = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/streams?q=${encodeURIComponent(title)}`);
  };

  const goDetail = () => {
    navigate(`/${type}/${item.id}`);
  };

  const fetchTrailer = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (trailerKey) {
      setShowPreview(!showPreview);
      return;
    }
    setLoadingTrailer(true);
    try {
      const data = await getVideos(type, item.id);
      const trailer = data.results?.find((r: any) => r.site === 'YouTube' && r.type === 'Trailer')
        ?? data.results?.find((r: any) => r.site === 'YouTube');
      setTrailerKey(trailer?.key ?? null);
      setShowPreview(!!trailer);
    } catch {
      // silently fail
    } finally {
      setLoadingTrailer(false);
    }
  };

  const handleMouseEnter = () => {
    hoverTimeout.current = setTimeout(() => {
      setShowPreview(true);
      onHover?.(item);
    }, 500);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    setShowPreview(false);
    onHover?.(null);
  };

  return (
    <div
      className="group relative flex flex-col rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="article"
      aria-label={`${title} (${year})`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-white/5 cursor-pointer" onClick={goDetail}>
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <span className="text-4xl">?</span>
          </div>
        )}

        {/* Preview overlay */}
        {showPreview && trailerKey && (
          <div className="absolute inset-0 bg-black">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        )}

        {/* Loading overlay for trailer */}
        {loadingTrailer && (
          <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
          <div className="flex flex-col items-center gap-2 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <button
              onClick={goDetail}
              className="w-14 h-14 rounded-full bg-emerald-500/90 backdrop-blur flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all"
              aria-label={`Play ${title}`}
            >
              <Play size={22} className="text-white ml-0.5" fill="white" />
            </button>
            <button
              onClick={fetchTrailer}
              className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium rounded-lg backdrop-blur flex items-center gap-1.5 transition-all"
              aria-label={`Watch trailer for ${title}`}
            >
              <Info size={12} />
              Trailer
            </button>
            <button
              onClick={findStreams}
              className="px-3 py-1.5 bg-blue-500/90 hover:bg-blue-400 text-white text-xs font-medium rounded-lg backdrop-blur flex items-center gap-1 transition-all"
              aria-label={`Find streams for ${title}`}
            >
              <Zap size={12} />
              Find Streams
            </button>
          </div>
        </div>

        {/* Watchlist button */}
        <button
          onClick={toggleWatchlist}
          className={`absolute top-2 right-2 p-2 rounded-lg backdrop-blur transition-all duration-200 ${
            inWatchlist
              ? 'bg-emerald-500 text-white'
              : 'bg-black/50 text-white/70 hover:text-white opacity-0 group-hover:opacity-100'
          }`}
          aria-label={inWatchlist ? `Remove ${title} from watchlist` : `Add ${title} to watchlist`}
        >
          {inWatchlist ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        </button>

        {/* Rating badge */}
        {rating && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <Star size={10} className="text-amber-400" fill="currentColor" />
            <span className="text-white text-xs font-medium">{rating}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-white text-sm font-medium leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
          {title}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {year && <span className="text-white/40 text-xs">{year}</span>}
          <span className="text-xs px-1.5 py-0.5 rounded uppercase tracking-wide font-medium bg-emerald-500/20 text-emerald-400">
            {type === 'movie' ? 'Movie' : 'TV'}
          </span>
        </div>
      </div>
    </div>
  );
}
