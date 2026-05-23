import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';

export default function KeyboardShortcuts() {
  const navigate = useNavigate();
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/streams?q=${encodeURIComponent(query.trim())}`);
      setShowSearch(false);
    }
  };

  if (!showSearch) return null;

  return (
    <div className="fixed inset-0 z-[99] flex items-start justify-center pt-32 px-4" onClick={() => setShowSearch(false)}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl bg-[#12121a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleSearch} className="flex items-center gap-3 p-4">
          <Search className="text-emerald-400 shrink-0" size={20} />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search movies, shows, anime..."
            className="flex-1 bg-transparent text-white placeholder-white/30 text-lg focus:outline-none"
          />
          <kbd className="px-2 py-1 bg-white/10 rounded text-white/40 text-xs font-mono">ESC</kbd>
        </form>
        <div className="px-4 pb-4 border-t border-white/5 pt-3">
          <p className="text-white/20 text-xs">Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-white/40 text-xs font-mono">/</kbd> to search from anywhere</p>
        </div>
      </div>
    </div>
  );
}
