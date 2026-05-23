import { Link } from 'react-router-dom';
import { Film, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="relative mb-8">
          <Film size={80} className="text-white/10 mx-auto" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-black text-white/5">404</span>
          </div>
        </div>
        <h1 className="text-4xl font-black text-white mb-3">Page Not Found</h1>
        <p className="text-white/40 text-lg mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-xl transition-all"
          >
            <ArrowLeft size={16} />
            Go Home
          </Link>
          <Link
            to="/streams"
            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-semibold rounded-xl transition-all border border-white/10"
          >
            <Search size={16} />
            Find Streams
          </Link>
        </div>
      </div>
    </div>
  );
}
