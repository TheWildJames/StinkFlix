import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Play, Star, Clock, Calendar, Globe, Bookmark, BookmarkCheck, ChevronRight, Tv, Film, Zap } from 'lucide-react';
import { getDetail, getCredits, getVideos, getSimilar, img, imgOriginal } from '../lib/tmdb';
import type { MediaDetail, CastMember } from '../lib/tmdb';
import { PageSpinner } from '../components/Spinner';
import MediaRow from '../components/MediaRow';
import { useLocalStorage } from '../lib/hooks';

export default function MediaDetailPage({ type }: { type: 'movie' | 'tv' }) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<MediaDetail | null>(null);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [trailer, setTrailer] = useState<string | null>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);

  const numId = Number(id);

  const [watchlist, setWatchlist] = useLocalStorage<number[]>('watchlist-ids', []);
  const inWatchlist = watchlist.includes(numId);

  const toggleWatchlist = () => {
    setWatchlist(prev =>
      prev.includes(numId) ? prev.filter(i => i !== numId) : [...prev, numId]
    );
    if (detail) {
      localStorage.setItem(`watchlist-item-${numId}`, JSON.stringify({ ...detail, media_type: type }));
    }
  };

  useEffect(() => {
    setLoading(true);
    setDetail(null);
    window.scrollTo(0, 0);
    Promise.all([
      getDetail(type, numId),
      getCredits(type, numId),
      getVideos(type, numId),
      getSimilar(type, numId),
    ]).then(([d, c, v, s]) => {
      setDetail(d);
      setCast(c.cast?.slice(0, 12) ?? []);
      const yt = v.results?.find((r: any) => r.site === 'YouTube' && r.type === 'Trailer') ??
                 v.results?.find((r: any) => r.site === 'YouTube');
      setTrailer(yt?.key ?? null);
      setSimilar(s.results ?? []);
    }).finally(() => setLoading(false));
  }, [id, type]);

  if (loading) return <PageSpinner />;
  if (!detail) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white/40">Not found</div>;

  const title = detail.title ?? detail.name ?? '';
  const year = (detail.release_date ?? detail.first_air_date ?? '').slice(0, 4);
  const backdrop = imgOriginal(detail.backdrop_path);
  const poster = img(detail.poster_path, 'w500');
  const rating = detail.vote_average?.toFixed(1);

  const watchPath = type === 'movie'
    ? `/watch/movie/${numId}`
    : `/watch/tv/${numId}/1/1`;

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero backdrop */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        {backdrop && <img src={backdrop} alt={title} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-[#0a0a0f]/30" />
      </div>

      {/* Content */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="relative -mt-48 sm:-mt-64 pb-10">
          <div className="flex flex-col sm:flex-row gap-8">
            {/* Poster */}
            <div className="shrink-0 w-44 sm:w-56 mx-auto sm:mx-0">
              <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-1 ring-white/10">
                {poster
                  ? <img src={poster} alt={title} className="w-full" />
                  : <div className="aspect-[2/3] bg-white/5 flex items-center justify-center"><Film size={48} className="text-white/20" /></div>
                }
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 pt-4 sm:pt-24">
              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-3">
                {detail.genres?.map(g => (
                  <span key={g.id} className="text-xs px-2.5 py-1 rounded-full bg-white/8 text-white/60 border border-white/10">
                    {g.name}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight mb-2">{title}</h1>

              {detail.tagline && (
                <p className="text-white/40 text-base italic mb-4">{detail.tagline}</p>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-4 mb-5 text-sm">
                {rating && (
                  <div className="flex items-center gap-1.5">
                    <Star size={15} className="text-amber-400" fill="currentColor" />
                    <span className="text-white font-semibold">{rating}</span>
                    <span className="text-white/40">/10</span>
                  </div>
                )}
                {year && (
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Calendar size={14} />
                    {year}
                  </div>
                )}
                {detail.runtime && (
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Clock size={14} />
                    {Math.floor(detail.runtime / 60)}h {detail.runtime % 60}m
                  </div>
                )}
                {detail.number_of_seasons && (
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Tv size={14} />
                    {detail.number_of_seasons} Season{detail.number_of_seasons > 1 ? 's' : ''}
                  </div>
                )}
                {detail.spoken_languages?.[0] && (
                  <div className="flex items-center gap-1.5 text-white/60">
                    <Globe size={14} />
                    {detail.spoken_languages[0].english_name}
                  </div>
                )}
              </div>

              {/* Overview */}
              {detail.overview && (
                <p className="text-white/70 text-base leading-relaxed mb-6 max-w-2xl">{detail.overview}</p>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate(watchPath)}
                  className="flex items-center gap-2 px-7 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95"
                >
                  <Play size={18} fill="white" />
                  Watch Now
                </button>

                <button
                  onClick={() => navigate(`/streams?q=${encodeURIComponent(title)}`)}
                  className="flex items-center gap-2 px-5 py-3 bg-blue-500/80 hover:bg-blue-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
                >
                  <Zap size={18} />
                  Find Streams
                </button>

                {trailer && (
                  <button
                    onClick={() => setShowTrailer(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-all border border-white/10"
                  >
                    <Play size={16} />
                    Trailer
                  </button>
                )}

                <button
                  onClick={toggleWatchlist}
                  className={`flex items-center gap-2 px-5 py-3 font-semibold rounded-xl transition-all border ${
                    inWatchlist
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                      : 'bg-white/10 text-white hover:bg-white/15 border-white/10'
                  }`}
                >
                  {inWatchlist ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                  {inWatchlist ? 'Saved' : 'Watchlist'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Seasons (TV) */}
        {type === 'tv' && detail.seasons && detail.seasons.length > 0 && (
          <section className="mb-12">
            <h2 className="text-white font-bold text-xl mb-4">Seasons</h2>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {detail.seasons.filter(s => s.season_number > 0).map(season => (
                <Link
                  key={season.id}
                  to={`/watch/tv/${numId}/${season.season_number}/1`}
                  className="shrink-0 w-36 group"
                >
                  <div className="rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-1">
                    <div className="aspect-[2/3] overflow-hidden bg-white/5">
                      {season.poster_path
                        ? <img src={img(season.poster_path, 'w185') ?? ''} alt={season.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center text-white/20"><Tv size={24} /></div>
                      }
                    </div>
                    <div className="p-2">
                      <p className="text-white text-xs font-medium line-clamp-1">{season.name}</p>
                      <p className="text-white/40 text-xs">{season.episode_count} eps</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mb-12">
            <h2 className="text-white font-bold text-xl mb-4">Cast</h2>
            <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
              {cast.map(member => (
                <div key={member.id} className="shrink-0 w-24 text-center">
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-white/10 mb-2">
                    {member.profile_path
                      ? <img src={img(member.profile_path, 'w185') ?? ''} alt={member.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">?</div>
                    }
                  </div>
                  <p className="text-white text-xs font-medium line-clamp-1">{member.name}</p>
                  <p className="text-white/40 text-xs line-clamp-1">{member.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar */}
        {similar.length > 0 && (
          <div className="mb-12">
            <MediaRow
              title={`More like ${title}`}
              items={similar}
              mediaType={type}
            />
          </div>
        )}
      </div>

      {/* Trailer modal */}
      {showTrailer && trailer && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowTrailer(false)}
        >
          <div className="w-full max-w-4xl aspect-video rounded-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <iframe
              src={`https://www.youtube.com/embed/${trailer}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}
