import { useNavigate, Link } from 'react-router-dom';
import { Star, Play, Bookmark, BookmarkCheck, Zap, Clock, Newspaper } from 'lucide-react';
import { img } from '../lib/tmdb';
import type { MediaItem } from '../lib/tmdb';
import { useLocalStorage } from '../lib/hooks';

interface Props {
  item: MediaItem;
  mediaType?: 'movie' | 'tv';
  index?: number;
  showProgress?: boolean;
}

export default function MediaCard({ item, mediaType, index, showProgress }: Props) {
  const navigate = useNavigate();
  const type = mediaType ?? item.media_type ?? 'movie';
  const title = item.title ?? item.name ?? '';
  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4);
  const poster = img(item.poster_path, 'w342');
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const matchPercent = item.vote_average ? Math.round(item.vote_average * 10) : 0;
  const isRecent = year && (new Date().getFullYear() - parseInt(year)) <= 1;
  const progress = showProgress ? Math.random() * 60 + 10 : 0;

  const [watchlist, setWatchlist] = useLocalStorage<number[]>('watchlist-ids', []);
  const inWatchlist = watchlist.includes(item.id);

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

  const playNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/watch/${type}/${item.id}`);
  };

  return (
    <Link
      to={`/${type}/${item.id}`}
      className={`group relative flex flex-col rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
        index !== undefined ? 'min-w-[160px] w-[160px]' : ''
      }`}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20">
            <span className="text-4xl">?</span>
          </div>
        )}

        {/* Number overlay for Top 10 */}
        {index !== undefined && index < 10 && (
          <div className="absolute bottom-0 left-0 z-10">
            <span className="text-[80px] font-black text-transparent leading-none"
              style={{
                WebkitTextStroke: '3px rgba(255,255,255,0.8)',
                fontSize: '80px',
                fontFamily: 'Arial Black, sans-serif'
              }}
            >{index + 1}</span>
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
          <button
            onClick={playNow}
            className="w-14 h-14 rounded-full bg-white/90 hover:bg-white flex items-center justify-center shadow-xl transform scale-75 group-hover:scale-100 transition-all duration-300"
          >
            <Play size={24} className="text-black ml-1" fill="black" />
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-lg">
            <button
              onClick={toggleWatchlist}
              className="p-1 hover:text-emerald-400 transition-colors"
            >
              {inWatchlist ? <BookmarkCheck size={14} className="text-emerald-400" /> : <Bookmark size={14} />}
            </button>
            <button
              onClick={findStreams}
              className="p-1 hover:text-blue-400 transition-colors"
            >
              <Zap size={14} />
            </button>
          </div>
        </div>

        {/* Match percentage */}
        {matchPercent > 70 && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <span className="text-white text-[10px] font-bold">{matchPercent}% Match</span>
          </div>
        )}

        {/* New badge */}
        {isRecent && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500/90 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <Newspaper size={8} className="text-white" />
            <span className="text-white text-[10px] font-bold">NEW</span>
          </div>
        )}

        {/* Rating badge */}
        {rating && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
            <Star size={10} className="text-amber-400" fill="currentColor" />
            <span className="text-white text-[10px] font-medium">{rating}</span>
          </div>
        )}

        {/* Progress bar */}
        {showProgress && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 space-y-1.5">
        <p className="text-white text-sm font-medium leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
          {title}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {year && <span className="text-white/40 text-xs">{year}</span>}
          {rating && (
            <span className="text-amber-400/70 text-xs flex items-center gap-0.5">
              <Star size={10} fill="currentColor" />
              {rating}
            </span>
          )}
        </div>
        {showProgress && progress > 0 && (
          <div className="flex items-center gap-1 text-white/30 text-[10px]">
            <Clock size={8} />
            {Math.round(progress)}% watched
          </div>
        )}
      </div>
    </Link>
  );
}
