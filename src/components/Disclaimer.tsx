import { useState, useEffect } from 'react';
import { X, Shield, BookOpen } from 'lucide-react';

export default function Disclaimer() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('disclaimer_dismissed');
    if (!dismissed) {
      setShow(true);
    }
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('disclaimer_dismissed', 'true');
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={dismiss} />
      <div className="relative bg-[#12121a] border border-white/10 rounded-2xl max-w-lg w-full p-8 shadow-2xl">
        <button
          onClick={dismiss}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
            <Shield size={32} className="text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Stream Finder</h2>
          <p className="text-emerald-400 text-sm font-medium">Disclaimer & Terms</p>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3">
            <BookOpen size={18} className="text-blue-400 mt-0.5 shrink-0" />
            <p className="text-white/60 text-sm leading-relaxed">
              Stream Finder is an <span className="text-white font-medium">educational tool</span> designed to demonstrate how media aggregation works. This project is built for learning and research purposes.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <Shield size={18} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-white/60 text-sm leading-relaxed">
              We do <span className="text-white font-medium">not host, store, or distribute</span> any video content. All links displayed are publicly available URLs sourced from third-party websites. We have no control over the availability or content of these external sources.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-[18px] h-[18px] rounded-full bg-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
              <span className="text-purple-400 text-xs">⚡</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Users are responsible for ensuring their use of third-party content complies with applicable laws and regulations in their jurisdiction. The responsibility for any actions taken based on information provided by this application lies solely with the user.
            </p>
          </div>
        </div>

        <button
          onClick={dismiss}
          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-medium transition-colors"
        >
          I Understand — Continue
        </button>

        <p className="text-white/20 text-xs text-center mt-3">
          This message will not be shown again
        </p>
      </div>
    </div>
  );
}
