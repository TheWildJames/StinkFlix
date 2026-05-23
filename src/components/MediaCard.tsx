import { useNavigate, Link } from 'react-router-dom';
import { Star, Play, Bookmark, BookmarkCheck, Zap } from 'lucide-react';
import { img } from '../lib/tmdb';
import type { MediaItem } from '../lib/tmdb';
import { useLocalStorage } from '../lib/hooks';

interface Props {
  item: MediaItem;
  mediaType?: 'movie' | 'tv';
}

export default function MediaCard({ item, mediaType }: Props) {
  const navigate = useNavigate();
  const type = mediaType ?? item.media_type ?? 'movie';
  const title = item.title ?? item.name ?? '';
  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4);
  const poster = img(item.poster_path, 'w342');
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

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

  return (
    <Link
      to={`/${type}/${item.id}`}
      className="group relative flex flex-col rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1"
    >
      {/* Poster */}
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

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/90 backdrop-blur flex items-center justify-center shadow-lg shadow-emerald-500/30 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play size={20} className="text-white ml-0.5" fill="white" />
          </div>
          <button
            onClick={findStreams}
            className="px-3 py-1.5 bg-blue-500/90 hover:bg-blue-400 text-white text-xs font-medium rounded-lg backdrop-blur flex items-center gap-1 transform scale-75 group-hover:scale-100 transition-transform duration-300"
          >
            <Zap size={12} />
            Find Streams
          </button>
        </div>

        {/* Watchlist button */}
        <button
          onClick={toggleWatchlist}
          className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur transition-all duration-200 ${
            inWatchlist
              ? 'bg-emerald-500 text-white'
              : 'bg-black/50 text-white/70 hover:text-white opacity-0 group-hover:opacity-100'
          }`}
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
        <p className="text-white text-sm font-medium leading-tight line-clamp-1">{title}</p>
        <div className="flex items-center gap-2 mt-1">
          {year && <span className="text-white/40 text-xs">{year}</span>}
          <span className={`text-xs px-1.5 py-0.5 rounded uppercase tracking-wide font-medium ${
            type === 'movie' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {type === 'movie' ? 'Movie' : 'TV'}
          </span>
        </div>
      </div>
    </Link>
  );
}
