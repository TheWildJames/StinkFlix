import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  List, Plus, Trash2, Edit3, X, Heart, Film, Tv,
  Star, Calendar, ChevronRight, Sparkles, Lock, Globe
} from 'lucide-react';
import { img } from '../lib/tmdb';
import { useToast } from '../contexts/ToastContext';
import { useLocalStorage } from '../lib/hooks';
import type { MediaItem } from '../lib/tmdb';

interface CustomList {
  id: string;
  name: string;
  description: string;
  items: number[];
  type: 'movie' | 'tv' | 'anime';
  isPublic: boolean;
  createdAt: number;
  color: string;
}

const LIST_COLORS = [
  'from-emerald-500 to-blue-500',
  'from-purple-500 to-pink-500',
  'from-amber-500 to-red-500',
  'from-cyan-500 to-blue-500',
  'from-pink-500 to-rose-500',
  'from-indigo-500 to-purple-500',
];

export default function CustomLists() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [lists, setLists] = useLocalStorage<CustomList[]>('stinkflix-custom-lists', []);
  const [showCreate, setShowCreate] = useState(false);
  const [editingList, setEditingList] = useState<CustomList | null>(null);

  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [newListType, setNewListType] = useState<'movie' | 'tv' | 'anime'>('movie');
  const [newListPublic, setNewListPublic] = useState(false);
  const [newListColor, setNewListColor] = useState(LIST_COLORS[0]);

  const createList = () => {
    if (!newListName.trim()) {
      addToast('Please enter a list name', 'error');
      return;
    }

    const newList: CustomList = {
      id: Date.now().toString(),
      name: newListName.trim(),
      description: newListDesc.trim(),
      items: [],
      type: newListType,
      isPublic: newListPublic,
      createdAt: Date.now(),
      color: newListColor,
    };

    setLists(prev => [...prev, newList]);
    setNewListName('');
    setNewListDesc('');
    setNewListPublic(false);
    setShowCreate(false);
    addToast('List created!', 'success');
  };

  const deleteList = (id: string) => {
    setLists(prev => prev.filter(l => l.id !== id));
    addToast('List deleted', 'info');
  };

  const addItemToList = (listId: number, mediaId: number) => {
    // This would integrate with search - for now just show toast
    addToast('Use search to find and add items', 'info');
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 page-transition">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <List className="text-emerald-400" size={32} />
              My Lists
            </h1>
            <p className="text-white/40">Create and manage your custom watchlists</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50"
          >
            <Plus size={18} />
            Create List
          </button>
        </div>

        {/* Lists Grid */}
        {lists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {lists.map(list => (
              <div
                key={list.id}
                className="group relative bg-white/5 border border-white/5 hover:border-emerald-500/30 rounded-2xl overflow-hidden transition-all hover:shadow-xl hover:shadow-emerald-500/10 hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/lists/${list.id}`)}
              >
                {/* Color header */}
                <div className={`h-24 bg-gradient-to-br ${list.color} relative`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-3 left-4">
                    <div className="flex items-center gap-2">
                      {list.type === 'movie' ? <Film size={16} className="text-white" /> : list.type === 'tv' ? <Tv size={16} className="text-white" /> : <Sparkles size={16} className="text-white" />}
                      <span className="text-white font-bold text-lg">{list.name}</span>
                    </div>
                  </div>
                  {list.isPublic && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 py-1">
                      <Globe size={12} className="text-white" />
                      <span className="text-white text-xs">Public</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  {list.description && (
                    <p className="text-white/40 text-sm line-clamp-2">{list.description}</p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-white/40 text-sm">{list.items.length} items</span>
                    <span className="text-white/30 text-xs">
                      {new Date(list.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setEditingList(list);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-all text-xs"
                    >
                      <Edit3 size={12} />
                      Edit
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        if (confirm('Delete this list?')) {
                          deleteList(list.id);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400/60 hover:text-red-400 rounded-lg transition-all text-xs"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <List size={56} className="mx-auto text-white/10 mb-5" />
            <p className="text-white/30 text-lg font-medium">No lists yet</p>
            <p className="text-white/20 text-sm mt-2">Create your first custom list to get started</p>
          </div>
        )}
      </div>

      {/* Create List Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full border border-white/10 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Create New List</h3>
                <button onClick={() => setShowCreate(false)} className="text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">List Name</label>
                <input
                  type="text"
                  value={newListName}
                  onChange={e => setNewListName(e.target.value)}
                  placeholder="My Awesome List"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400/50"
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Description</label>
                <textarea
                  value={newListDesc}
                  onChange={e => setNewListDesc(e.target.value)}
                  placeholder="What's this list about?"
                  className="w-full bg-white/5 border border-white/10 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400/50 resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Type</label>
                <div className="flex gap-2">
                  {(['movie', 'tv', 'anime'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setNewListType(type)}
                      className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        newListType === type
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {type === 'movie' ? 'Movies' : type === 'tv' ? 'TV Shows' : 'Anime'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-white/60 text-sm mb-2 block">Color Theme</label>
                <div className="flex gap-2">
                  {LIST_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewListColor(color)}
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} transition-all ${
                        newListColor === color ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a2e]' : 'opacity-50 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-white/60 text-sm">
                  <input
                    type="checkbox"
                    checked={newListPublic}
                    onChange={e => setNewListPublic(e.target.checked)}
                    className="accent-emerald-500"
                  />
                  Public list
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-xl transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={createList}
                  className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl transition-all text-sm font-medium"
                >
                  Create List
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
