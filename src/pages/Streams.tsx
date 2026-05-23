import { useState, useEffect, useCallback } from 'react';
import { Search, Play, ExternalLink, Link as LinkIcon, Film, Tv, Zap, X, Copy, Check, Info, Globe } from 'lucide-react';
import { searchStreams, getStreamLinkCategories, type SearchCategory, type StreamLink, type StreamResult } from '../lib/streamSources';
import { img } from '../lib/tmdb';
import { PageSpinner, Spinner } from '../components/Spinner';

type CategoryFilter = 'all' | 'movie' | 'tv' | 'anime';
type LinkTypeFilter = 'all' | 'embed' | 'direct' | 'app';

interface SelectedItem {
  result: StreamResult;
  season?: number;
  episode?: number;
}

export default function StreamsPage() {
  const [query, setQuery] = useState('');
  const [categories, setCategories] = useState<SearchCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SelectedItem | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [linkTypeFilter, setLinkTypeFilter] = useState<LinkTypeFilter>('all');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setCategories([]);
      return;
    }

    setLoading(true);
    const activeCategories: ('movie' | 'tv' | 'anime')[] = [];
    if (categoryFilter === 'all' || categoryFilter === 'movie') activeCategories.push('movie');
    if (categoryFilter === 'all' || categoryFilter === 'tv') activeCategories.push('tv');
    if (categoryFilter === 'all' || categoryFilter === 'anime') activeCategories.push('anime');

    try {
      const results = await searchStreams(searchQuery, activeCategories);
      setCategories(results);
    } catch {
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [categoryFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      performSearch(query);
    }, 500);
    return () => clearTimeout(timeout);
  }, [query, performSearch]);

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch {
      window.open(url, '_blank');
    }
  };

  const getAllLinks = (item: StreamResult): StreamLink[] => {
    if (linkTypeFilter === 'all') return item.links;
    return item.links.filter(l => l.type === linkTypeFilter);
  };

  const getLinkIcon = (type: string) => {
    switch (type) {
      case 'embed': return <Play size={14} />;
      case 'direct': return <Globe size={14} />;
      case 'app': return <ExternalLink size={14} />;
      default: return <LinkIcon size={14} />;
    }
  };

  const getLinkBadgeColor = (type: string) => {
    switch (type) {
      case 'embed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'direct': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'app': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const totalLinks = categories.reduce((sum, cat) => sum + cat.results.reduce((s, r) => s + r.links.length, 0), 0);

  if (loading) return <PageSpinner />;

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-3">
            <Zap className="inline-block text-emerald-400 mr-2" size={36} />
            Stream Finder
          </h1>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            Search for movies, TV shows, or anime to find all available stream links
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for any movie, show, or anime..."
            className="w-full bg-white/8 border border-white/10 text-white placeholder-white/30 rounded-2xl pl-12 pr-12 py-4 text-base focus:outline-none focus:border-emerald-400/50 focus:bg-white/10 transition-all"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-white/30 text-xs uppercase tracking-wider font-medium">Type:</span>
            {(['all', 'movie', 'tv', 'anime'] as CategoryFilter[]).map(f => (
              <button
                key={f}
                onClick={() => { setCategoryFilter(f); setQuery(query); }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                  categoryFilter === f
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/8 text-white/60 hover:bg-white/15 hover:text-white border border-white/10'
                }`}
              >
                {f === 'all' && <Film size={14} />}
                {f === 'movie' && <Film size={14} />}
                {f === 'tv' && <Tv size={14} />}
                {f === 'anime' && <Zap size={14} />}
                {f === 'anime' ? 'Anime' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {categories.length > 0 && (
          <div className="space-y-8">
            {categories.map(category => (
              <div key={category.type}>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  {category.type === 'movie' && <Film size={20} className="text-blue-400" />}
                  {category.type === 'tv' && <Tv size={20} className="text-purple-400" />}
                  {category.type === 'anime' && <Zap size={20} className="text-emerald-400" />}
                  {category.name}
                  <span className="text-white/30 text-sm font-normal">({category.results.length})</span>
                </h2>

                {category.results.length === 0 ? (
                  <p className="text-white/30 text-sm py-4">No results found in this category</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {category.results.map(result => (
                      <button
                        key={result.tmdbId}
                        onClick={() => setSelectedItem({ result })}
                        className="group bg-white/5 hover:bg-white/10 rounded-xl overflow-hidden transition-all border border-white/5 hover:border-emerald-500/30 text-left"
                      >
                        {result.poster ? (
                          <div className="relative aspect-[2/3] overflow-hidden">
                            <img
                              src={img(result.poster, 'w342') || ''}
                              alt={result.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span className="bg-emerald-500/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                                  {result.links.length} links
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-[2/3] bg-white/5 flex items-center justify-center">
                            <Film size={32} className="text-white/20" />
                          </div>
                        )}
                        <div className="p-2.5">
                          <p className="text-white text-sm font-medium line-clamp-1 group-hover:text-emerald-400 transition-colors">
                            {result.title}
                          </p>
                          {result.year && (
                            <p className="text-white/30 text-xs mt-0.5">{result.year}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {totalLinks > 0 && (
              <div className="text-center">
                <p className="text-white/30 text-sm">
                  Found <span className="text-emerald-400 font-semibold">{totalLinks}</span> total stream links
                </p>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!query && !loading && (
          <div className="text-center py-20">
            <Search size={64} className="mx-auto text-white/10 mb-4" />
            <p className="text-white/30 text-lg">Search for movies, TV shows, or anime</p>
            <p className="text-white/20 text-sm mt-2">Find all available stream links in one place</p>
          </div>
        )}

        {/* No results */}
        {query && categories.length > 0 && totalLinks === 0 && !loading && (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg">No stream links found for &ldquo;{query}&rdquo;</p>
            <p className="text-white/20 text-sm mt-2">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedItem(null)}>
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
          <div
            className="relative bg-[#0e0e16] rounded-2xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0e0e16]/95 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3 min-w-0">
                {selectedItem.result.poster && (
                  <img
                    src={img(selectedItem.result.poster, 'w92') || ''}
                    alt=""
                    className="w-10 h-14 rounded object-cover shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="text-white font-semibold text-lg truncate">
                    {selectedItem.result.title}
                  </h3>
                  <p className="text-white/40 text-xs">
                    {selectedItem.result.type === 'movie' ? 'Movie' : selectedItem.result.type === 'tv' ? 'TV Show' : 'Anime'} · {selectedItem.result.links.length} links available
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="text-white/40 hover:text-white/70 transition-colors p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* Link Type Filter */}
            <div className="px-6 py-4 border-b border-white/5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-white/30 text-xs uppercase tracking-wider font-medium">Filter:</span>
                {(['all', 'embed', 'direct', 'app'] as LinkTypeFilter[]).map(type => (
                  <button
                    key={type}
                    onClick={() => setLinkTypeFilter(type)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      linkTypeFilter === type
                        ? 'bg-emerald-500 text-white'
                        : 'bg-white/8 text-white/60 hover:bg-white/15 border border-white/10'
                    }`}
                  >
                    {type === 'all' ? 'All' : type === 'embed' ? 'Players' : type === 'direct' ? 'Direct Streams' : 'App Links'}
                  </button>
                ))}
              </div>
            </div>

            {/* Links */}
            <div className="p-6">
              {(() => {
                const filteredLinks = getAllLinks(selectedItem.result);
                const categories = getStreamLinkCategories(filteredLinks);

                if (filteredLinks.length === 0) {
                  return <p className="text-white/30 text-center py-8">No links match the selected filter</p>;
                }

                return (
                  <div className="space-y-6">
                    {Array.from(categories.entries()).map(([catName, links]) => (
                      <div key={catName}>
                        <h4 className="text-white/60 text-sm font-medium mb-3 flex items-center gap-2">
                          <Info size={14} />
                          {catName}
                          <span className="text-white/30 text-xs">({links.length})</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {links.map((link, idx) => (
                            <div
                              key={`${link.name}-${idx}`}
                              className="group flex items-center gap-3 bg-white/5 hover:bg-white/8 rounded-xl px-4 py-3 border border-white/5 hover:border-white/10 transition-all"
                            >
                              <div className={`p-2 rounded-lg ${getLinkBadgeColor(link.type)}`}>
                                {getLinkIcon(link.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{link.name}</p>
                                <p className="text-white/30 text-xs truncate">{link.url}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  onClick={() => handleCopyUrl(link.url)}
                                  className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/10 transition-all"
                                  title="Copy URL"
                                >
                                  {copiedUrl === link.url ? (
                                    <Check size={14} className="text-emerald-400" />
                                  ) : (
                                    <Copy size={14} />
                                  )}
                                </button>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                                  title="Open in new tab"
                                >
                                  <ExternalLink size={14} />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Footer Notice */}
            <div className="px-6 py-4 border-t border-white/5 bg-white/[0.02]">
              <div className="flex items-start gap-2">
                <Info size={14} className="text-white/20 mt-0.5 shrink-0" />
                <p className="text-white/25 text-xs leading-relaxed">
                  All links are generated from third-party sources. Availability may vary. Links are provided for educational purposes.
                  Use at your own discretion. Some links may redirect to external websites.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
