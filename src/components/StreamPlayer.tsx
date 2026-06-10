import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Play, Pause, Maximize, Minimize, Volume2, VolumeX,
  Settings, SkipForward, RotateCcw, Film, ChevronDown,
  Circle, Monitor, PiP, Rewind, Heart, Share2, Copy, X,
  List, Keyboard, FastForward, Flag, Info, Home,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { useHistory } from '../contexts/HistoryContext';
import { getImdbId, getVideos } from '../lib/tmdb';
import { getStreamLinksForItem, generateDirectStreamLinks, generateMovieEmbedSources, generateTVEmbedSources, validateStreams, getBestStreamIndex } from '../lib/streamSources';
import type { StreamLink, StreamValidationResult } from '../lib/streamSources';

interface StreamPlayerProps {
  tmdbId: number;
  type: 'movie' | 'tv';
  title: string;
  season?: number;
  episode?: number;
  backdropUrl?: string;
  posterUrl?: string;
  overview?: string;
  releaseDate?: string;
  voteAverage?: number;
  genres?: Array<{ id: number; name: string }>;
  cast?: Array<{ id: number; name: string; character: string }>;
  crew?: Array<{ id: number; name: string; job: string }>;
  episodes?: Array<{
    season: number;
    episode: number;
    name: string;
    overview: string;
    still_path: string | null;
    vote_average: number;
    air_date: string;
  }>;
}

export default function StreamPlayer({
  tmdbId, type, title, season, episode,
  backdropUrl, posterUrl, overview, releaseDate, voteAverage, genres, cast, crew, episodes
}: StreamPlayerProps) {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const { addToast } = useToast();
  const { addToHistory, getRecentViews } = useHistory();
  const params = useParams();

  const [streams, setStreams] = useState<StreamLink[]>([]);
  const [validatedStreams, setValidatedStreams] = useState<StreamValidationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [currentStream, setCurrentStream] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSourceSelector, setShowSourceSelector] = useState(false);
  const [showEpisodeList, setShowEpisodeList] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(settings.playbackSpeed);
  const [isTheater, setIsTheater] = useState(false);
  const [isCinema, setIsCinema] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [autoSelectResult, setAutoSelectResult] = useState<{found: boolean, streamName?: string}>({found: false});
  const [watchlist, setWatchlist] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('watchlist-ids');
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [inWatchlist, setInWatchlist] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controlsTimeout = useRef<ReturnType<typeof setTimeout>>();
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const s = season || 1;
  const e = episode || 1;

  useEffect(() => {
    const loadStreams = async () => {
      try {
        const imdbId = await getImdbId(type, tmdbId);
        const idParam = imdbId || String(tmdbId);
        let loadedStreams: StreamLink[] = [];

        if (type === 'movie') {
          loadedStreams = [
            ...generateMovieEmbedSources(idParam, tmdbId),
            ...generateDirectStreamLinks(idParam, tmdbId, 'movie'),
          ];
        } else {
          loadedStreams = [
            ...generateTVEmbedSources(idParam, tmdbId, s, e),
            ...generateDirectStreamLinks(idParam, tmdbId, 'tv', s, e),
          ];
        }

        setStreams(loadedStreams);

        // Validate streams and auto-select the best one
        setValidating(true);
        const validationResults = await validateStreams(loadedStreams, 20000, true);
        setValidatedStreams(validationResults);
        
        const bestIdx = getBestStreamIndex(loadedStreams, validationResults);
        setCurrentStream(bestIdx);
        
        const bestStream = loadedStreams[bestIdx];
        const autoSelectStream = loadedStreams.find(l => l.autoSelect && validationResults.find(r => r.link === l && r.isValid));
        if (autoSelectStream) {
          setAutoSelectResult({ found: true, streamName: autoSelectStream.name });
        }
        
        setValidating(false);

        addToHistory({
          id: tmdbId,
          type,
          title,
          poster_path: posterUrl || null,
          episode: e,
          season: s,
        });
      } catch (error) {
        console.error('Error loading streams:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStreams();
    setInWatchlist(watchlist.includes(tmdbId));
  }, [tmdbId, type, s, e]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement && playerContainerRef.current) {
      playerContainerRef.current.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(prev => !prev);

  const toggleMute = () => setMuted(prev => !prev);

  const changeVolume = (newVolume: number) => {
    setVolume(newVolume);
    if (newVolume > 0) setMuted(false);
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    settings.updateSetting('playbackSpeed', speed);
    setShowSpeedMenu(false);
    addToast(`Playback speed: ${speed}x`, 'info');
  };

  const addWatchlist = () => {
    const newWatchlist = inWatchlist
      ? watchlist.filter(id => id !== tmdbId)
      : [...watchlist, tmdbId];
    setWatchlist(newWatchlist);
    setInWatchlist(!inWatchlist);
    localStorage.setItem('watchlist-ids', JSON.stringify(newWatchlist));
    addToast(
      inWatchlist ? 'Removed from watchlist' : 'Added to watchlist',
      inWatchlist ? 'info' : 'success'
    );
  };

  const shareContent = () => {
    const url = `${window.location.origin}/watch/${type}/${tmdbId}`;
    navigator.clipboard.writeText(url);
    addToast('Link copied to clipboard!', 'copy');
  };

  const copyEmbedCode = () => {
    const embedCode = `<iframe src="${streams[currentStream]?.url}" frameborder="0" allowfullscreen width="100%" height="500"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    addToast('Embed code copied!', 'copy');
  };

  const goNextEpisode = () => {
    if (type === 'tv' && episodes) {
      const currentEp = episodes.find(ep => ep.season === s && ep.episode === e);
      const nextEpIndex = episodes.indexOf(currentEp || {}) + 1;
      if (nextEpIndex < episodes.length) {
        const nextEp = episodes[nextEpIndex];
        navigate(`/watch/tv/${tmdbId}/${nextEp.season}/${nextEp.episode}`);
      }
    }
  };

  const goPrevEpisode = () => {
    if (type === 'tv' && episodes) {
      const currentEp = episodes.find(ep => ep.season === s && ep.episode === e);
      const prevEpIndex = episodes.indexOf(currentEp || {}) - 1;
      if (prevEpIndex >= 0) {
        const prevEp = episodes[prevEpIndex];
        navigate(`/watch/tv/${tmdbId}/${prevEp.season}/${prevEp.episode}`);
      }
    }
  };

  const selectSource = (index: number) => {
    setCurrentStream(index);
    setShowSourceSelector(false);
    addToast(`Switched to ${streams[index]?.name}`, 'info');
  };

  const retryValidation = async () => {
    setValidating(true);
    const validationResults = await validateStreams(streams, 20000, true);
    setValidatedStreams(validationResults);
    
    const bestIdx = getBestStreamIndex(streams, validationResults);
    setCurrentStream(bestIdx);
    
    const autoSelectStream = streams.find(l => l.autoSelect && validationResults.find(r => r.link === l && r.isValid));
    if (autoSelectStream) {
      setAutoSelectResult({ found: true, streamName: autoSelectStream.name });
    }
    
    setValidating(false);
    addToast('Stream validation complete', 'success');
  };

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const currentStreamData = streams[currentStream];

  const getEmbedUrl = (stream: StreamLink) => {
    if (stream.url.startsWith('http')) return stream.url;
    return stream.url;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/60">{validating ? 'Validating streams...' : 'Loading streams...'}</p>
          {autoSelectResult.found && (
            <p className="text-emerald-400 text-sm">Auto-selected best quality stream: {autoSelectResult.streamName}</p>
          )}
        </div>
      </div>
    );
  }

  const containerClass = isTheater
    ? 'fixed inset-0 z-[9999] bg-black flex items-center justify-center'
    : isCinema
    ? 'fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center'
    : 'relative w-full h-full';

  return (
    <div className={containerClass}>
      <div
        ref={playerContainerRef}
        className={`relative w-full ${isTheater || isCinema ? 'h-full max-w-7xl mx-auto' : ''} bg-black`}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Iframe Player */}
        <div className={`w-full ${isTheater || isCinema ? 'h-full' : 'aspect-video'} relative`}>
          {currentStreamData ? (
            <iframe
              ref={iframeRef}
              src={getEmbedUrl(currentStreamData)}
              className="w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/40">
              No streams available
            </div>
          )}

          {/* Controls Overlay */}
          <div
            className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/60 transition-opacity duration-300 ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    aria-label="Go back"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div>
                    <h2 className="text-white font-semibold text-lg">{title}</h2>
                    {type === 'tv' && (
                      <p className="text-white/60 text-sm">Season {s} Episode {e}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInfo(!showInfo)}
                    className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    aria-label="Show info"
                  >
                    <Info size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Center Play/Pause */}
            {isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={togglePlay}
                  className="w-20 h-20 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all backdrop-blur-sm"
                  aria-label="Pause"
                >
                  <Pause size={32} className="text-white" />
                </button>
              </div>
            )}

            {/* Bottom Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              {/* Progress Bar (visual only for embeds) */}
              <div className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer group hover:h-2 transition-all">
                <div className="w-1/3 h-full bg-emerald-400 rounded-full group-hover:bg-emerald-300 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-emerald-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {/* Play/Pause */}
                  <button
                    onClick={togglePlay}
                    className="p-2 text-white hover:text-emerald-400 transition-all"
                    aria-label={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>

                  {/* Previous Episode */}
                  {type === 'tv' && (
                    <button
                      onClick={goPrevEpisode}
                      className="p-2 text-white/80 hover:text-white transition-all"
                      aria-label="Previous episode"
                    >
                      <Rewind size={20} />
                    </button>
                  )}

                  {/* Next Episode */}
                  {type === 'tv' && (
                    <button
                      onClick={goNextEpisode}
                      className="p-2 text-white/80 hover:text-white transition-all"
                      aria-label="Next episode"
                    >
                      <FastForward size={20} />
                    </button>
                  )}

                  {/* Volume */}
                  <button
                    onClick={toggleMute}
                    className="p-2 text-white/80 hover:text-white transition-all"
                    aria-label={muted ? 'Unmute' : 'Mute'}
                  >
                    {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={muted ? 0 : volume}
                    onChange={e => changeVolume(parseFloat(e.target.value))}
                    className="w-20 accent-emerald-400"
                    aria-label="Volume"
                  />

                  {/* Source Selector */}
                  <div className="relative ml-2">
                    <button
                      onClick={() => setShowSourceSelector(!showSourceSelector)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-sm"
                    >
                      <Settings size={16} />
                      <span className="hidden sm:inline">{currentStreamData?.name}</span>
                      {validating && <span className="text-xs text-emerald-400 animate-pulse">...</span>}
                      {!validating && validatedStreams.some(r => r.isValid) && (
                        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                      )}
                      <ChevronDown size={14} />
                    </button>
    
                    {showSourceSelector && (
                      <div className="absolute bottom-full mb-2 left-0 w-80 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl max-h-96 overflow-y-auto">
                        <div className="p-2">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white/50 text-xs font-medium">Stream Sources</p>
                            {!validating && (
                              <button
                                onClick={retryValidation}
                                className="text-xs text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded bg-white/5 hover:bg-white/10 transition-all"
                              >
                                Re-validate
                              </button>
                            )}
                          </div>
                          
                          {!validating && validatedStreams.length > 0 && (
                            <p className="text-white/40 text-xs px-2 py-1 mb-1">
                              {validatedStreams.filter(r => r.isValid).length} valid of {validatedStreams.length} sources
                            </p>
                          )}
                          
                          {streams.map((stream, idx) => {
                            const validationResult = validatedStreams.find(r => r.link === stream);
                            const isValid = validationResult?.isValid || false;
                            const isAutoSelect = stream.autoSelect;
                            const priority = stream.priority || 999;
                            
                            return (
                              <button
                                key={idx}
                                onClick={() => selectSource(idx)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                                  idx === currentStream
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : isValid
                                    ? 'text-white/70 hover:bg-white/10 hover:text-white'
                                    : 'text-white/30 hover:bg-white/5'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="font-medium">{stream.name}</div>
                                    {isAutoSelect && !validating && isValid && (
                                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">AUTO</span>
                                    )}
                                    {isAutoSelect && !isValid && (
                                      <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">OFF</span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span className="text-white/40">{stream.quality}</span>
                                    {!isValid && !validating && (
                                      <span className="text-red-400/60">✕</span>
                                    )}
                                  </div>
                                </div>
                                {!validating && isValid && (
                                  <div className="text-xs text-emerald-400/60 mt-1">✓ Valid</div>
                                )}
                                {!validating && !isValid && validatedStreams.length > 0 && (
                                  <div className="text-xs text-red-400/60 mt-1">✕ Invalid</div>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Settings */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSettings(!showSettings)}
                      className="p-2 text-white/80 hover:text-white transition-all"
                      aria-label="Settings"
                    >
                      <Settings size={20} />
                    </button>

                    {showSettings && (
                      <div className="absolute bottom-full mb-2 right-0 w-56 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl p-3">
                        <p className="text-white/50 text-xs mb-2 font-medium">Playback Speed</p>
                        <div className="grid grid-cols-4 gap-1">
                          {playbackSpeeds.map(speed => (
                            <button
                              key={speed}
                              onClick={() => changeSpeed(speed)}
                              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                                playbackSpeed === speed
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-white/5 text-white/60 hover:bg-white/15'
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Theater Mode */}
                  <button
                    onClick={() => setIsTheater(!isTheater)}
                    className={`p-2 transition-all ${isTheater ? 'text-emerald-400' : 'text-white/80 hover:text-white'}`}
                    aria-label="Theater mode"
                  >
                    <Monitor size={20} />
                  </button>

                  {/* Cinema Mode */}
                  <button
                    onClick={() => setIsCinema(!isCinema)}
                    className={`p-2 transition-all ${isCinema ? 'text-emerald-400' : 'text-white/80 hover:text-white'}`}
                    aria-label="Cinema mode"
                  >
                    <Film size={20} />
                  </button>

                  {/* Fullscreen */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 text-white/80 hover:text-white transition-all"
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowInfo(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-white/10" onClick={e => e.stopPropagation()}>
            <div className="relative h-48">
              {backdropUrl && (
                <img src={backdropUrl} alt="" className="w-full h-full object-cover rounded-t-2xl" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a2e] to-transparent" />
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{title}</h2>
                <div className="flex items-center gap-3 mt-2">
                  {voteAverage && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <span className="font-semibold">{voteAverage.toFixed(1)}</span>
                      <span className="text-white/40 text-sm">/10</span>
                    </span>
                  )}
                  {releaseDate && (
                    <span className="text-white/50 text-sm">{releaseDate.slice(0, 4)}</span>
                  )}
                </div>
              </div>
              {overview && (
                <p className="text-white/70 text-sm leading-relaxed">{overview}</p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={addWatchlist}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    inWatchlist
                      ? 'bg-emerald-500 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Heart size={16} fill={inWatchlist ? 'white' : 'none'} />
                  {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                </button>
                <button
                  onClick={shareContent}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  <Share2 size={16} />
                  Share
                </button>
                <button
                  onClick={copyEmbedCode}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                >
                  <Copy size={16} />
                  Copy Embed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
