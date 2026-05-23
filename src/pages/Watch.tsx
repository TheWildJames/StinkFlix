import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight, List, AlertTriangle, ExternalLink } from 'lucide-react';
import { getDetail, getSeasonEpisodes, img } from '../lib/tmdb';
import { getMovieSources, getTVSources, getImdbId } from '../lib/sources';
import type { MediaDetail, Episode } from '../lib/tmdb';
import type { EmbedSource } from '../lib/sources';
import { PageSpinner } from '../components/Spinner';

export default function WatchPage() {
  const params = useParams<{ type: string; id: string; season?: string; episode?: string }>();
  const navigate = useNavigate();

  const type = params.type as 'movie' | 'tv';
  const id = Number(params.id);
  const season = Number(params.season ?? 1);
  const episode = Number(params.episode ?? 1);

  const [detail, setDetail] = useState<MediaDetail | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [sources, setSources] = useState<EmbedSource[]>([]);
  const [sourceIdx, setSourceIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showEpisodes, setShowEpisodes] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);

    const loadData = async () => {
      const d = await getDetail(type, id);
      setDetail(d);

      const imdbId = await getImdbId(type, id);
      const srcs = type === 'movie'
        ? getMovieSources(imdbId ?? String(id), id)
        : getTVSources(imdbId ?? String(id), id, season, episode);
      setSources(srcs);
      setSourceIdx(0);
      setIframeKey(k => k + 1);

      if (type === 'tv') {
        const epData = await getSeasonEpisodes(id, season);
        setEpisodes(epData.episodes ?? []);
      }

      setLoading(false);
    };

    loadData().catch(() => setLoading(false));
  }, [type, id, season, episode]);

  if (loading) return <PageSpinner />;

  const title = detail?.title ?? detail?.name ?? '';
  const currentEp = episodes.find(e => e.episode_number === episode);
  const prevEp = episodes.find(e => e.episode_number === episode - 1);
  const nextEp = episodes.find(e => e.episode_number === episode + 1);

  const goEp = (s: number, e: number) => {
    navigate(`/watch/tv/${id}/${s}/${e}`);
    setShowEpisodes(false);
  };

  const changeSource = (idx: number) => {
    setSourceIdx(idx);
    setIframeKey(k => k + 1);
  };

  return (
    <div className="min-h-screen bg-[#070709]">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center gap-4">
          <Link
            to={`/${type}/${id}`}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {title}
              {type === 'tv' && ` — S${String(season).padStart(2, '0')}E${String(episode).padStart(2, '0')}`}
              {currentEp && ` · ${currentEp.name}`}
            </p>
          </div>

          {type === 'tv' && (
            <button
              onClick={() => setShowEpisodes(s => !s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                showEpisodes ? 'bg-emerald-500/20 text-emerald-400' : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}
            >
              <List size={15} />
              Episodes
            </button>
          )}
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-0 sm:px-4">
        <div className={`flex gap-4 ${showEpisodes ? 'flex-col lg:flex-row' : 'flex-col'}`}>
          {/* Player area */}
          <div className={`flex-1 ${showEpisodes ? 'lg:max-w-[calc(100%-340px)]' : 'w-full'}`}>
            {/* Video */}
            <div className="relative w-full bg-black" style={{ aspectRatio: '16/9' }}>
              <iframe
                key={iframeKey}
                src={sources[sourceIdx]?.url}
                className="absolute inset-0 w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; picture-in-picture"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Controls below player */}
            <div className="bg-[#0e0e16] px-4 sm:px-6 py-4 border-b border-white/5">
              {/* Source selector */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-white/40 text-xs uppercase tracking-wider font-medium">Source:</span>
                {sources.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => changeSource(i)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      i === sourceIdx
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/8 text-white/60 hover:bg-white/15 hover:text-white border border-white/10'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
                <a
                  href={sources[sourceIdx]?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-auto flex items-center gap-1 text-white/30 hover:text-white/60 text-xs transition-colors"
                >
                  Open in tab <ExternalLink size={12} />
                </a>
              </div>

              {/* Notice */}
              <div className="flex items-start gap-2 bg-amber-500/5 border border-amber-500/15 rounded-lg px-3 py-2">
                <AlertTriangle size={13} className="text-amber-400/60 mt-0.5 shrink-0" />
                <p className="text-white/30 text-xs leading-relaxed">
                  If one source doesn't work, try another. Sources are third-party embeds and availability may vary.
                </p>
              </div>

              {/* Episode navigation (TV) */}
              {type === 'tv' && (
                <div className="flex items-center gap-3 mt-4">
                  {prevEp ? (
                    <button
                      onClick={() => goEp(season, prevEp.episode_number)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/8 hover:bg-white/15 text-white/70 hover:text-white rounded-lg text-sm transition-all border border-white/10"
                    >
                      <ChevronLeft size={15} />
                      Prev Ep
                    </button>
                  ) : <div />}

                  <div className="flex-1 text-center">
                    <p className="text-white/40 text-xs">S{season} · Episode {episode} of {episodes.length}</p>
                  </div>

                  {nextEp ? (
                    <button
                      onClick={() => goEp(season, nextEp.episode_number)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm font-medium transition-all border border-emerald-500/20"
                    >
                      Next Ep
                      <ChevronRight size={15} />
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Episode list sidebar */}
          {type === 'tv' && showEpisodes && (
            <div className="w-full lg:w-80 shrink-0 bg-[#0e0e16] lg:border-l border-white/5 overflow-y-auto max-h-[80vh] lg:max-h-[calc(100vh-56px)]">
              {/* Season selector */}
              {detail?.seasons && (
                <div className="p-3 border-b border-white/5 flex gap-2 flex-wrap">
                  {detail.seasons
                    .filter(s => s.season_number > 0)
                    .map(s => (
                      <button
                        key={s.id}
                        onClick={() => goEp(s.season_number, 1)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                          s.season_number === season
                            ? 'bg-emerald-500 text-white'
                            : 'bg-white/8 text-white/60 hover:bg-white/15 border border-white/10'
                        }`}
                      >
                        S{s.season_number}
                      </button>
                    ))}
                </div>
              )}

              {/* Episodes */}
              <div className="divide-y divide-white/5">
                {episodes.map(ep => (
                  <button
                    key={ep.id}
                    onClick={() => goEp(season, ep.episode_number)}
                    className={`w-full flex items-start gap-3 p-3 text-left transition-colors ${
                      ep.episode_number === episode
                        ? 'bg-emerald-500/10 border-l-2 border-emerald-400'
                        : 'hover:bg-white/5 border-l-2 border-transparent'
                    }`}
                  >
                    {ep.still_path ? (
                      <img
                        src={img(ep.still_path, 'w185') ?? ''}
                        alt=""
                        className="w-24 aspect-video rounded object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-24 aspect-video rounded bg-white/5 shrink-0 flex items-center justify-center text-white/20 text-xs">
                        {ep.episode_number}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium line-clamp-1 ${ep.episode_number === episode ? 'text-emerald-400' : 'text-white'}`}>
                        {ep.episode_number}. {ep.name}
                      </p>
                      {ep.overview && (
                        <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{ep.overview}</p>
                      )}
                      {ep.runtime && (
                        <p className="text-white/25 text-xs mt-1">{ep.runtime}m</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
