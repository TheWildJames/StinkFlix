import { HashRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { HistoryProvider } from './contexts/HistoryContext';
import { AchievementsProvider } from './contexts/AchievementsContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SearchPage from './pages/Search';
import StreamsPage from './pages/Streams';
import MediaDetailPage from './pages/MediaDetail';
import WatchPage from './pages/Watch';
import Browse from './pages/Browse';
import Watchlist from './pages/Watchlist';
import NotFound from './pages/NotFound';
import Disclaimer from './components/Disclaimer';
import KeyboardShortcuts from './components/KeyboardShortcuts';

export default function App() {
  return (
    <ToastProvider>
      <SettingsProvider>
        <HistoryProvider>
          <AchievementsProvider>
            <HashRouter>
              <div className="min-h-screen bg-[#0a0a0f] text-white">
                <KeyboardShortcuts />
                <Disclaimer />
                <Routes>
                  {/* Watch page has its own minimal layout */}
                  <Route path="/watch/:type/:id/:season?/:episode?" element={<WatchPage />} />

                  {/* All other pages use the navbar */}
                  <Route
                    path="/*"
                    element={
                      <>
                        <Navbar />
                        <Routes>
                          <Route path="/search" element={<SearchPage />} />
                          <Route path="/streams" element={<StreamsPage />} />
                          <Route path="/movies" element={<Browse type="movie" />} />
                          <Route path="/tv" element={<Browse type="tv" />} />
                          <Route path="/movie/:id" element={<MediaDetailPage type="movie" />} />
                          <Route path="/tv/:id" element={<MediaDetailPage type="tv" />} />
                          <Route path="/watchlist" element={<Watchlist />} />
                          <Route path="/" element={<Home />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </>
                    }
                  />
                </Routes>
              </div>
            </HashRouter>
          </AchievementsProvider>
        </HistoryProvider>
      </SettingsProvider>
    </ToastProvider>
  );
}
