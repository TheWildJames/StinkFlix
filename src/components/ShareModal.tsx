import { useState } from 'react';
import { X, Copy, Link, Share2, Facebook, Twitter, MessageCircle, Mail } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

interface ShareModalProps {
  isOpen: boolean;
  title: string;
  url: string;
  onClose: () => void;
}

export default function ShareModal({ isOpen, title, url, onClose }: ShareModalProps) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      addToast('Link copied to clipboard!', 'copy');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Failed to copy link', 'error');
    }
  };

  const handleShare = async (platform: string) => {
    let shareUrl = '';
    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);

    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedTitle}`;
        break;
      case 'reddit':
        shareUrl = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodedTitle}&body=${encodedTitle}%20${url}`;
        break;
      default:
        return;
    }

    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    addToast(`Sharing on ${platform}`, 'info');
  };

  const shareOptions = [
    { name: 'Copy Link', icon: <Copy size={20} />, action: handleCopy, color: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400' },
    { name: 'Twitter', icon: <Twitter size={20} />, action: () => handleShare('twitter'), color: 'bg-sky-500/20 hover:bg-sky-500/30 text-sky-400' },
    { name: 'Facebook', icon: <Facebook size={20} />, action: () => handleShare('facebook'), color: 'bg-blue-600/20 hover:bg-blue-600/30 text-blue-500' },
    { name: 'Reddit', icon: <Share2 size={20} />, action: () => handleShare('reddit'), color: 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-400' },
    { name: 'WhatsApp', icon: <MessageCircle size={20} />, action: () => handleShare('whatsapp'), color: 'bg-green-500/20 hover:bg-green-500/30 text-green-400' },
    { name: 'Email', icon: <Mail size={20} />, action: () => handleShare('email'), color: 'bg-red-500/20 hover:bg-red-500/30 text-red-400' },
  ];

  return (
    <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[#1a1a2e] rounded-2xl max-w-md w-full border border-white/10 animate-slide-up"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Share this content"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h3 className="text-lg font-bold text-white">Share</h3>
            <p className="text-white/40 text-sm mt-0.5">{title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            aria-label="Close share dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* URL */}
          <div className="mb-6">
            <label className="text-white/60 text-xs font-medium mb-2 block">Share Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={url}
                className="flex-1 bg-white/5 border border-white/10 text-white/60 rounded-lg px-3 py-2.5 text-sm focus:outline-none"
              />
              <button
                onClick={handleCopy}
                className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all ${
                  copied
                    ? 'bg-emerald-500 text-white'
                    : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Social platforms */}
          <div>
            <label className="text-white/60 text-xs font-medium mb-3 block">Share on Social Media</label>
            <div className="grid grid-cols-3 gap-3">
              {shareOptions.slice(1).map(option => (
                <button
                  key={option.name}
                  onClick={option.action}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all ${option.color}`}
                >
                  {option.icon}
                  <span className="text-xs font-medium">{option.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
