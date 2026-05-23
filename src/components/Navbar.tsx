import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Film, Home, Bookmark, ChevronDown, Bell, User, Shuffle, Settings } from 'lucide-react';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications] = useState(3);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const surpriseMe = () => {
    const randomId = Math.floor(Math.random() * 10000) + 1;
    navigate(`/watch/movie/${randomId}`);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setShowSearch(false);
    setQuery('');
  }, [location]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Use hash to keep user on home page
      window.location.hash = `/search?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-[#0a0a0f]/95 backdrop-blur-md shadow-xl shadow-black/20' : 'bg-gradient-to-b from-black/70 to-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/50 transition-all">
            <Film size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            Stink<span className="text-emerald-400">Flix</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" icon={<Home size={15} />} label="Home" />
          <NavLink to="/watchlist" icon={<Bookmark size={15} />} label="Watchlist" />
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 ml-auto">
          {showSearch ? (
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onBlur={() => { if (!query) setShowSearch(false); }}
                placeholder="Search movies, shows..."
                className="bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/50 rounded-full px-4 py-1.5 text-sm w-52 sm:w-72 focus:outline-none focus:border-emerald-400/60 focus:bg-white/15 transition-all"
              />
            </form>
          ) : (
            <>
              <button
                onClick={surpriseMe}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                title="Surprise Me"
              >
                <Shuffle size={18} />
              </button>
              <button
                className="relative p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                title="Notifications"
              >
                <Bell size={18} />
                {notifications > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setShowSearch(true)}
                className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <Search size={18} />
              </button>
            </>
          )}

          {/* Profile */}
          <div ref={profileRef} className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-1 p-1.5 rounded-full hover:bg-white/10 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center">
                <User size={14} className="text-white" />
              </div>
              <ChevronDown size={14} className="text-white/50" />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl overflow-hidden">
                <div className="p-3 border-b border-white/10">
                  <p className="text-white font-medium text-sm">James</p>
                  <p className="text-white/40 text-xs">Member</p>
                </div>
                <div className="p-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors">
                    <User size={14} />
                    Manage Profiles
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors">
                    <Settings size={14} />
                    Settings
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors">
                    <Bell size={14} />
                    Notifications
                  </button>
                  <div className="border-t border-white/10 my-1" />
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors">
                    <User size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu trigger */}
        <MobileMenu />
      </div>
    </nav>
  );
}

function NavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        active
          ? 'text-emerald-400 bg-emerald-400/10'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function MobileMenu() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location]);

  return (
    <div className="md:hidden relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
      >
        <ChevronDown size={18} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-2 w-44 bg-[#12121a]/95 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden">
          <MobileNavLink to="/" icon={<Home size={15} />} label="Home" />
          <MobileNavLink to="/watchlist" icon={<Bookmark size={15} />} label="Watchlist" />
        </div>
      )}
    </div>
  );
}

function MobileNavLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  const location = useLocation();
  const active = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? 'text-emerald-400 bg-emerald-400/10'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
