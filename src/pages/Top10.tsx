import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, Film, Tv, Star, Trophy } from 'lucide-react';
import { getTrending, getPopular, img } from '../lib/tmdb';
import type { MediaItem } from '../lib/tmdb';
import { PageSpinner } from '../components/Spinner';

type TopCategory = 'trending' | 'movies' | 'tv';

export default function Top10() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TopCategory>('trending');
  const [data, setData] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetch = async () => {
      try {
        let result: MediaItem[] = [];
        if (activeTab === 'trending') {
          const data = await getTrending('all', 'week');
          result = data.results?.slice(0, 50) || [];
        } else if (activeTab === 'movies') {
          const data = await getPopular('movie');
          result = data.results?.slice(0, 50) || [];
        } else {
          const data = await getPopular('tv');
          result = data.results?.slice(0, 50) || [];
        }
        setData(result);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [activeTab]);

  if (loading) return <PageSpinner />;

  const tabs: { key: TopCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'trending', label: 'Trending This Week', icon: <TrendingUp size={18} /> },
    { key: 'movies', label: 'Top Movies', icon: <Film size={18} /> },
    { key: 'tv', label: 'Top TV Shows', icon: <Tv size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 page-transition">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Trophy className="text-amber-400" size={32} />
            Top 10
          </h1>
          <p className="text-white/40">The most popular content right now</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Top 10 List */}
        <div className="space-y-3">
          {data.slice(0, 10).map((item, index) => {
            const title = item.title || item.name || '';
            const type = (item.media_type || 'movie') as string;
            const year = (item.release_date || item.first_air_date || '').slice(0, 4);
            const poster = item.poster_path ? img(item.poster_path, 'w185') : null;
            const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
            const backdrop = item.backdrop_path ? img(item.backdrop_path, 'w780') : null;

            return (
              <div
                key={item.id}
                onClick={() => navigate(`/${type}/${item.id}`)}
                className="group flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 rounded-xl transition-all cursor-pointer"
              >
                {/* Rank */}
                <div className="shrink-0 w-12 h-12 flex items-center justify-center">
                  {index < 3 ? (
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-black ${
                      index === 0 ? 'bg-amber-500 text-black' :
                      index === 1 ? 'bg-gray-300 text-black' :
                      'bg-amber-700 text-white'
                    }`}>
                      {index + 1}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-xl font-black text-white/40">
                      {index + 1}
                    </div>
                  )}
                </div>

                {/* Poster */}
                {poster ? (
                  <img
                    src={poster}
                    alt={title}
                    className="shrink-0 w-16 h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="shrink-0 w-16 h-24 bg-white/5 rounded-lg flex items-center justify-center">
                    <span className="text-white/20 text-2xl">?</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-lg group-hover:text-emerald-400 transition-colors truncate">
                    {title}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    {year && (
                      <span className="text-white/40 text-sm">{year}</span>
                    )}
                    <span className="text-xs px-2 py-0.5 rounded uppercase tracking-wide font-medium bg-emerald-500/20 text-emerald-400">
                      {type}
                    </span>
                    {rating && (
                      <div className="flex items-center gap-1">
                        <Star size={14} className="text-amber-400" fill="currentColor" />
                        <span className="text-white text-sm font-medium">{rating}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Trending arrow */}
                {index < 5 && (
                  <TrendingUp size={20} className="text-emerald-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* More results */}
        {data.length > 10 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-white mb-4">More Popular Content</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {data.slice(10, 30).map(item => {
                const title = item.title || item.name || '';
                const type = (item.media_type || 'movie') as string;
                const year = (item.release_date || item.first_air_date || '').slice(0, 4);
                const poster = item.poster_path ? img(item.poster_path, 'w342') : null;
                const rating = item.vote_average ? item.vote_average.toFixed(1) : null;

                return (
                  <div
                    key={item.id}
                    onClick={() => navigate(`/${type}/${item.id}`)}
                    className="group relative flex flex-col rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all cursor-pointer"
                  >
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
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
                      <div className="absolute top-2 left-2 w-8 h-8 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">#{data.indexOf(item) + 1}</span>
                      </div>
                      {rating && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                          <Star size={10} className="text-amber-400" fill="currentColor" />
                          <span className="text-white text-xs font-medium">{rating}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-white text-sm font-medium leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                        {title}
                      </p>
                      {year && (
                        <p className="text-white/40 text-xs mt-1">{year}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
