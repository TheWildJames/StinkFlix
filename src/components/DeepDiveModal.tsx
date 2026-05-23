import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Play, Bookmark, BookmarkCheck, Star, Clock, Calendar, TrendingUp } from 'lucide-react';
import { img, getImdbId } from '../lib/tmdb';
import type { MediaItem } from '../lib/tmdb';
import { useLocalStorage } from '../lib/hooks';
import { generateMovieEmbedSources, generateTVEmbedSources } from '../lib/streamSources';

interface Props {
  item: MediaItem;
  onClose: () => void;
}

export default function DeepDiveModal({ item, onClose }: Props) {
  const navigate = useNavigate();
  const type = item.media_type ?? 'movie';
  const title = item.title ?? item.name ?? '';
  const year = (item.release_date ?? item.first_air_date ?? '').slice(0, 4);
  const poster = img(item.poster_path, 'w780');
  const backdrop = img(item.backdrop_path, 'w1280');
  const rating = item.vote_average?.toFixed(1);
  const [watchlist, setWatchlist] = useLocalStorage<number[]>('watchlist-ids', []);
  const inWatchlist = watchlist.includes(item.id);
  const [streams, setStreams] = useState<any[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  useEffect(() => {
    const fetchStreams = async () => {
      setLoadingStreams(true);
      const imdbId = await getImdbId(item.id, type);
      if (type === 'movie' && imdbId) {
        const sources = generateMovieEmbedSources(imdbId, item.id);
        setStreams(sources.flatMap(s => s.links || []));
      } else if (type === 'tv' && imdbId) {
        const sources = generateTVEmbedSources(imdbId, item.id, 1, 1);
        setStreams(sources.flatMap(s => s.links || []));
      }
      setLoadingStreams(false);
    };
    fetchStreams();
  }, [item.id, type]);

  const toggleWatchlist = () => {
    setWatchlist(prev =>
      prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto" onClick={onClose}>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-4xl mx-4 my-8 bg-gray-900/95 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
        >
          <X size={20} />
        </button>

        {/* Hero backdrop */}
        <div className="relative h-64 sm:h-80 overflow-hidden">
          {backdrop && (
            <img
              src={backdrop}
              alt={title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent" />

          {/* Poster overlay */}
          <div className="absolute bottom-0 left-0 flex items-end gap-4 p-6">
            {poster && (
              <img
                src={poster}
                alt={title}
                className="w-32 rounded-lg shadow-xl border-2 border-white/10"
              />
            )}
            <div className="pb-2">
              <h2 className="text-3xl font-bold text-white">{title}</h2>
              <div className="flex items-center gap-3 mt-2">
                {rating && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star size={16} fill="currentColor" />
                    {rating}
                  </span>
                )}
                {year && (
                  <span className="text-white/60 text-sm">{year}</span>
                )}
                <span className="text-emerald-400 text-sm font-medium capitalize">{type}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onClose();
                navigate(`/watch/${type}/${item.id}`);
              }}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-colors"
            >
              <Play size={18} fill="white" />
              Play Now
            </button>
            <button
              onClick={toggleWatchlist}
              className={`p-3 rounded-xl border-2 transition-colors ${
                inWatchlist
                  ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                  : 'border-white/20 hover:border-white/40 text-white'
              }`}
            >
              {inWatchlist ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
            </button>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                <TrendingUp size={14} />
                <span>Popularity</span>
              </div>
              <span className="text-white font-bold">{Math.round(item.popularity || 0)}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-3">
              <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                <Star size={14} />
                <span>Votes</span>
              </div>
              <span className="text-white font-bold">{Math.round(item.vote_count || 0)}</span>
            </div>
            {item.release_date && (
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                  <Calendar size={14} />
                  <span>Released</span>
                </div>
                <span className="text-white font-bold text-sm">{item.release_date}</span>
              </div>
            )}
            {item.runtime && (
              <div className="bg-white/5 rounded-xl p-3">
                <div className="flex items-center gap-2 text-white/60 text-xs mb-1">
                  <Clock size={14} />
                  <span>Runtime</span>
                </div>
                <span className="text-white font-bold text-sm">{Math.floor(item.runtime! / 60)}h {item.runtime! % 60}m</span>
              </div>
            )}
          </div>

          {/* Overview */}
          {item.overview && (
            <div>
              <h3 className="text-white font-semibold mb-2">Overview</h3>
              <p className="text-white/60 text-sm leading-relaxed">{item.overview}</p>
            </div>
          )}

          {/* Genres */}
          {item.genre_ids && item.genre_ids.length > 0 && (
            <div>
              <h3 className="text-white font-semibold mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {item.genre_ids.slice(0, 5).map(genreId => (
                  <span
                    key={genreId}
                    className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white rounded-full text-xs transition-colors"
                  >
                    Genre {genreId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stream links */}
          <div>
            <h3 className="text-white font-semibold mb-3">Available Streams</h3>
            {loadingStreams ? (
              <div className="flex items-center gap-2 text-white/50 text-sm">
                <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                Loading streams...
              </div>
            ) : streams.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {streams.slice(0, 6).map((stream, i) => (
                  <a
                    key={i}
                    href={stream.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                      <Play size={14} className="text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{stream.server || `Stream ${i + 1}`}</p>
                      <p className="text-white/40 text-xs truncate">{stream.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-white/40 text-sm">No streams available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
