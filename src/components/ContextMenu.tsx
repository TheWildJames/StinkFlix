import { useState, useEffect, useRef, ReactNode } from 'react';
import {
  Play, Bookmark, Share2, Copy, Info, ExternalLink, Heart,
  Calendar, Star, Trash2, Edit3, Download, Link as LinkIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

interface ContextMenuItem {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  danger?: boolean;
  separator?: boolean;
}

interface ContextMenuProps {
  children: ReactNode;
  items: ContextMenuItem[];
}

export function ContextMenu({ children, items }: ContextMenuItem[]) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [show, setShow] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setShow(true);
  };

  useEffect(() => {
    const handleClick = () => setShow(false);
    if (show) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;

    const maxX = window.innerWidth - 200;
    const maxY = window.innerHeight - 300;
    const x = Math.min(position.x, maxX);
    const y = Math.min(position.y, maxY);

    menuRef.current?.style.setProperty('left', `${x}px`);
    menuRef.current?.style.setProperty('top', `${y}px`);
  }, [position, show]);

  return (
    <div onContextMenu={handleContextMenu}>
      {children}
      {show && (
        <div
          ref={menuRef}
          className="fixed z-[9999] w-52 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fade-in"
          onClick={() => setShow(false)}
        >
          {items.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                item.action();
                setShow(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
                item.danger
                  ? 'text-red-400 hover:bg-red-500/10'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              } ${item.separator ? 'border-t border-white/5' : ''}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function useContextMenu() {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const getMediaItems = (item: any) => {
    const type = item.media_type || 'movie';
    const title = item.title || item.name || '';
    const id = item.id;

    return [
      {
        label: 'Find Streams',
        icon: <Play size={16} />,
        action: () => navigate(`/streams?q=${encodeURIComponent(title)}`),
      },
      {
        label: 'More Info',
        icon: <Info size={16} />,
        action: () => navigate(`/${type}/${id}`),
      },
      { separator: true },
      {
        label: 'Add to Watchlist',
        icon: <Bookmark size={16} />,
        action: () => {
          try {
            const watchlist = JSON.parse(localStorage.getItem('watchlist-ids') || '[]');
            if (!watchlist.includes(id)) {
              watchlist.push(id);
              localStorage.setItem('watchlist-ids', JSON.stringify(watchlist));
              localStorage.setItem(`watchlist-item-${id}`, JSON.stringify(item));
              addToast('Added to watchlist!', 'success');
            } else {
              addToast('Already in watchlist', 'info');
            }
          } catch {
            addToast('Failed to add to watchlist', 'error');
          }
        },
      },
      {
        label: 'Share',
        icon: <Share2 size={16} />,
        action: () => {
          const url = `${window.location.origin}/${type}/${id}`;
          navigator.clipboard.writeText(url);
          addToast('Share link copied!', 'copy');
        },
      },
    ];
  };

  return { getMediaItems };
}
