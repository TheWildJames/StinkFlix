import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bookmark, Trash2, Zap, Star, Edit3, X,
  Play, ListFilter, ChevronDown, TrendingUp,
  Clock, CheckCircle, Film, Tv, BarChart3,
  Download, Search, SortAsc, Heart, Calendar
} from 'lucide-react';
import { img } from '../lib/tmdb';
import { useLocalStorage } from '../lib/hooks';
import { useToast } from '../contexts/ToastContext';
import type { MediaItem } from '../lib/tmdb';

type WatchlistCategory = 'all' | 'watching' | 'want-to-watch' | 'completed';
type SortOption = 'date-added' | 'title' | 'year' | 'rating';

interface WatchlistItem extends MediaItem {
  media_type: string;
  userRating?: number;
  notes?: string;
  category?: WatchlistCategory;
  dateAdded?: number;
  dateWatched?: number;
}

export default function Watchlist() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [watchlistIds] = useLocalStorage<number[]>('watchlist-ids', []);
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [category, setCategory] = useState<WatchlistCategory>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-added');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editNotes, setEditNotes] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loaded = watchlistIds
      .map(id => {
        try {
          const raw = localStorage.getItem(`watchlist-item-${id}`);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .map(item => ({
        ...item,
        userRating: item.userRating || 0,
        notes: item.notes || '',
        category: item.category || 'want-to-watch' as WatchlistCategory,
        dateAdded: item.dateAdded || Date.now(),
      }));
    setItems(loaded);
  }, [watchlistIds]);

  const updateItem = (id: number, updates: Partial<WatchlistItem>) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    setItems(updated);
    localStorage.setItem(`watchlist-item-${id}`, JSON.stringify({ ...items.find(i => i.id === id)!, ...updates }));
    addToast('Updated!', 'success');
  };

  const removeItem = (id: number) => {
    const updated = items.filter(item => item.id !== id);
    setItems(updated);
    const newIds = watchlistIds.filter(i => i !== id);
    localStorage.setItem('watchlist-ids', JSON.stringify(newIds));
    localStorage.removeItem(`watchlist-item-${id}`);
    addToast('Removed from watchlist', 'info');
  };

  const removeAll = () => {
    watchlistIds.forEach(id => localStorage.removeItem(`watchlist-item-${id}`));
    localStorage.setItem('watchlist-ids', JSON.stringify([]));
    setItems([]);
    addToast('Watchlist cleared', 'info');
  };

  const exportCSV = () => {
    const headers = 'Title,Year,Type,Rating,Category,Notes\n';
    const rows = items.map(item => {
      const title = (item.title || item.name || '').replace(/"/g, '""');
      const year = (item.release_date || item.first_air_date || '').slice(0, 4);
      const type = item.media_type;
      const rating = item.userRating || 0;
      const category = item.category || 'want-to-watch';
      const notes = (item.notes || '').replace(/"/g, '""');
      return `"${title}","${year}","${type}",${rating},"${category}","${notes}"`;
    }).join('\n');
    const csv = headers + rows;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'stinkflix-watchlist.csv';
    a.click();
    URL.revokeObjectURL(url);
    addToast('Watchlist exported!', 'success');
  };

  const filtered = items
    .filter(item => {
      if (category !== 'all' && item.category !== category) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (item.title || item.name || '').toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title': return (a.title || a.name || '').localeCompare(b.title || b.name || '');
        case 'year': return ((b.release_date || b.first_air_date || '').slice(0, 4))
          .localeCompare((a.release_date || a.first_air_date || '').slice(0, 4));
        case 'rating': return (b.userRating || 0) - (a.userRating || 0);
        default: return (b.dateAdded || 0) - (a.dateAdded || 0);
      }
    });

  const stats = {
    total: items.length,
    watching: items.filter(i => i.category === 'watching').length,
    wantToWatch: items.filter(i => i.category === 'want-to-watch').length,
    completed: items.filter(i => i.category === 'completed').length,
    avgRating: items.filter(i => i.userRating > 0).length > 0
      ? items.filter(i => i.userRating > 0).reduce((sum, i) => sum + (i.userRating || 0), 0) / items.filter(i => i.userRating > 0).length
      : 0,
  };

  const openEdit = (item: WatchlistItem) => {
    setEditingId(item.id);
    setEditRating(item.userRating || 0);
    setEditNotes(item.notes || '');
  };

  const saveEdit = () => {
    if (editingId !== null) {
      updateItem(editingId, { userRating: editRating, notes: editNotes });
      setEditingId(null);
    }
  };

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case 'watching': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  const categories: { key: WatchlistCategory; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All', icon: <Bookmark size={14} /> },
    { key: 'watching', label: 'Watching', icon: <Play size={14} /> },
    { key: 'want-to-watch', label: 'Want to Watch', icon: <Clock size={14} /> },
    { key: 'completed', label: 'Completed', icon: <CheckCircle size={14} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 page-transition">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <Bookmark className="text-emerald-400" size={28} />
              My Watchlist
            </h1>
            <p className="text-white/40 text-sm mt-1">{items.length} {items.length === 1 ? 'title' : 'titles'} saved</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all text-sm"
            >
              <BarChart3 size={16} />
              Stats
            </button>
            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all text-sm"
            >
              <Download size={16} />
              Export
            </button>
            {items.length > 0 && (
              <button
                onClick={removeAll}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <Trash2 size={14} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <div className="mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl animate-slide-up">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-400" />
              Watchlist Statistics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <div className="text-3xl font-black text-white">{stats.total}</div>
                <div className="text-white/40 text-xs mt-1">Total Titles</div>
              </div>
              <div className="text-center p-4 bg-blue-500/10 rounded-xl">
                <div className="text-3xl font-black text-blue-400">{stats.watching}</div>
                <div className="text-white/40 text-xs mt-1">Watching</div>
              </div>
              <div className="text-center p-4 bg-amber-500/10 rounded-xl">
                <div className="text-3xl font-black text-amber-400">{stats.wantToWatch}</div>
                <div className="text-white/40 text-xs mt-1">Want to Watch</div>
              </div>
              <div className="text-center p-4 bg-emerald-500/10 rounded-xl">
                <div className="text-3xl font-black text-emerald-400">{stats.completed}</div>
                <div className="text-white/40 text-xs mt-1">Completed</div>
              </div>
              <div className="text-center p-4 bg-amber-500/10 rounded-xl">
                <div className="text-3xl font-black text-amber-400">{stats.avgRating.toFixed(1)}</div>
                <div className="text-white/40 text-xs mt-1">Avg Rating</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Category tabs */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  category === cat.key
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
              >
                {cat.icon}
                {cat.label}
                <span className="text-xs opacity-60">
                  {cat.key === 'all' ? stats.total : cat.key === 'watching' ? stats.watching : cat.key === 'completed' ? stats.completed : stats.wantToWatch}
                </span>
              </button>
            ))}
          </div>

          {/* Search and Sort */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search watchlist..."
                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-400/50 transition-all"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 text-white/70 hover:text-white rounded-xl transition-all text-sm"
              >
                <SortAsc size={16} />
                Sort
                <ChevronDown size={14} />
              </button>
              {showFilters && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl z-10 overflow-hidden">
                  {([
                    { key: 'date-added' as const, label: 'Date Added' },
                    { key: 'title' as const, label: 'Title' },
                    { key: 'year' as const, label: 'Year' },
                    { key: 'rating' as const, label: 'Rating' },
                  ]).map(option => (
                    <button
                      key={option.key}
                      onClick={() => { setSortBy(option.key); setShowFilters(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-all ${
                        sortBy === option.key
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Items Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filtered.map(item => {
              const type = item.media_type as 'movie' | 'tv';
              const title = item.title || item.name || '';
              const year = (item.release_date || item.first_air_date || '').slice(0, 4);
              const poster = img(item.poster_path, 'w342');
              const tmdbRating = item.vote_average ? item.vote_average.toFixed(1) : null;
              const userRating = item.userRating || 0;

              return (
                <div key={item.id} className="group relative flex flex-col rounded-xl overflow-hidden bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1">
                  {/* Poster */}
                  <div className="relative aspect-[2/3] overflow-hidden bg-white/5 cursor-pointer" onClick={() => navigate(`/${type}/${item.id}`)}>
                    {poster ? (
                      <img
                        src={poster}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <span className="text-4xl">?</span>
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
                      <button
                        onClick={e => { e.preventDefault(); navigate(`/streams?q=${encodeURIComponent(title)}`); }}
                        className="px-3 py-1.5 bg-emerald-500/90 hover:bg-emerald-400 text-white text-xs font-medium rounded-lg flex items-center gap-1 transform scale-75 group-hover:scale-100 transition-transform duration-300"
                      >
                        <Zap size={12} />
                        Find Streams
                      </button>
                    </div>

                    {/* Category badge */}
                    <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${getCategoryColor(item.category)}`}>
                      {item.category === 'watching' ? 'Watching' : item.category === 'completed' ? 'Completed' : 'Wanna Watch'}
                    </div>

                    {/* User rating */}
                    {userRating > 0 && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500/80 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                        <Star size={10} className="text-white" fill="white" />
                        <span className="text-white text-xs font-bold">{userRating}</span>
                      </div>
                    )}

                    {/* TMDB rating */}
                    {tmdbRating && (
                      <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur-sm rounded-md px-1.5 py-0.5">
                        <Star size={10} className="text-amber-400" fill="currentColor" />
                        <span className="text-white text-xs font-medium">{tmdbRating}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-3 space-y-2">
                    <p className="text-white text-sm font-medium leading-tight line-clamp-1 group-hover:text-emerald-400 transition-colors">
                      {title}
                    </p>
                    {year && (
                      <div className="flex items-center gap-1 text-white/40 text-xs">
                        <Calendar size={10} />
                        {year}
                      </div>
                    )}
                    {userRating > 0 && (
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            size={12}
                            className={(star <= userRating ? 'text-amber-400' : 'text-white/20')}
                            fill={(star <= userRating ? 'currentColor' : 'none')}
                          />
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-all text-xs"
                      >
                        <Edit3 size={10} />
                        Edit
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="flex items-center justify-center p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400/50 hover:text-red-400 rounded-lg transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24">
            <Bookmark size={56} className="mx-auto text-white/10 mb-5" strokeWidth={1.5} />
            <p className="text-white/30 text-lg font-medium">Your watchlist is empty</p>
            <p className="text-white/20 text-sm mt-2">Click the bookmark icon on any movie or show to save it here</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingId !== null && (
        <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditingId(null)}>
          <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full border border-white/10 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Edit Entry</h3>
                <button onClick={() => setEditingId(null)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setEditRating(star)}
                      className="transition-all hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={(star <= editRating ? 'text-amber-400' : 'text-white/20')}
                        fill={(star <= editRating ? 'currentColor' : 'none')}
                      />
                    </button>
                  ))}
                  {editRating > 0 && <span className="text-white/60 text-sm ml-2">{editRating}/5</span>}
                </div>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Category</label>
                <select
                  value={items.find(i => i.id === editingId)?.category || 'want-to-watch'}
                  onChange={e => updateItem(editingId, { category: e.target.value as WatchlistCategory })}
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none"
                >
                  <option value="want-to-watch">Want to Watch</option>
                  <option value="watching">Watching</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="text-white/60 text-sm mb-2 block">Notes</label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Add your notes..."
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(null)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all text-sm font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
