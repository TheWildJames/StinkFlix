import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight, Star, Calendar, Clock, TrendingUp } from 'lucide-react';
import { getTrending, getPopular, getOnTheAir, getAiringToday, img, imgOriginal } from '../lib/tmdb';
import type { MediaItem } from '../lib/tmdb';
import { PageSpinner } from './Spinner';

interface Slide {
  item: MediaItem;
  type: 'movie' | 'tv';
}

export default function HeroSlider() {
  const navigate = useNavigate();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const fetchSlides = useCallback(async () => {
    try {
      const [trending, popularMovies, airingToday, onTheAir] = await Promise.all([
        getTrending('all', 'week'),
        getPopular('movie'),
        getAiringToday(),
        getOnTheAir(),
      ]);

      const movieSlides: Slide[] = [];

      (trending.results?.slice(0, 8) || []).forEach((item: MediaItem) => {
        movieSlides.push({ item, type: (item.media_type as 'movie' | 'tv') || 'movie' });
      });

      (popularMovies.results?.slice(0, 4) || []).forEach((item: MediaItem) => {
        movieSlides.push({ item, type: 'movie' });
      });

      (airingToday.results?.slice(0, 4) || []).forEach((item: MediaItem) => {
        movieSlides.push({ item, type: 'tv' });
      });

      (onTheAir.results?.slice(0, 4) || []).forEach((item: MediaItem) => {
        movieSlides.push({ item, type: 'tv' });
      });

      // Shuffle and take 10
      const shuffled = movieSlides.sort(() => Math.random() - 0.5).slice(0, 10);
      setSlides(shuffled);
    } catch {
      setSlides([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  useEffect(() => {
    if (slides.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  const goToSlide = (idx: number) => {
    setCurrentIdx(idx);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goPrev = () => {
    setCurrentIdx(prev => (prev - 1 + slides.length) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goNext = () => {
    setCurrentIdx(prev => (prev + 1) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  if (loading) return <PageSpinner />;
  if (slides.length === 0) return null;

  const current = slides[currentIdx];
  const backdrop = imgOriginal(current.item.backdrop_path);
  const title = current.item.title || current.item.name || '';
  const year = (current.item.release_date || current.item.first_air_date || '').slice(0, 4);
  const rating = current.item.vote_average?.toFixed(1);
  const overview = current.item.overview || '';

  const watchPath = current.type === 'movie'
    ? `/watch/movie/${current.item.id}`
    : `/watch/tv/${current.item.id}/1/1`;

  return (
    <div
      className="relative h-[75vh] min-h-[500px] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-label="Featured content carousel"
      aria-roledescription="carousel"
    >
      {/* Background */}
      {backdrop && (
        <img
          src={backdrop}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
          aria-hidden="true"
        />
      )}

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0f] to-transparent" />

      {/* Content */}
      <div className="relative h-full max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center">
        <div className="max-w-2xl space-y-4 animate-fade-in">
          {/* Trending badge */}
          {currentIdx < 5 && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full w-fit">
              <TrendingUp size={14} className="text-emerald-400" />
              <span className="text-emerald-400 text-xs font-semibold">Trending #{currentIdx + 1}</span>
            </div>
          )}

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-2xl">
            {title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            {rating && (
              <div className="flex items-center gap-1.5">
                <Star size={16} className="text-amber-400" fill="currentColor" />
                <span className="text-white font-semibold">{rating}</span>
                <span className="text-white/50">/10</span>
              </div>
            )}
            {year && (
              <div className="flex items-center gap-1.5 text-white/60">
                <Calendar size={14} />
                {year}
              </div>
            )}
            {current.type === 'tv' && (
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full font-medium border border-blue-500/30">
                TV Series
              </span>
            )}
          </div>

          {/* Overview */}
          <p className="text-white/70 text-sm sm:text-base leading-relaxed line-clamp-3 max-w-xl">
            {overview}
          </p>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => navigate(watchPath)}
              className="flex items-center gap-2 px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 text-base"
            >
              <Play size={20} fill="white" />
              Play Now
            </button>
            <button
              onClick={() => navigate(`/${current.type}/${current.item.id}`)}
              className="flex items-center gap-2 px-6 py-3.5 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl transition-all backdrop-blur-sm border border-white/10 text-base"
            >
              <Info size={18} />
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* Navigation arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-all backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIdx
                    ? 'w-8 bg-emerald-400'
                    : 'w-1.5 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={idx === currentIdx ? 'true' : 'false'}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
