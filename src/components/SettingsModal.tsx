import { useState } from 'react';
import { X, RotateCcw, Play, Volume2, Maximize, Speed, Bell, Monitor } from 'lucide-react';
import { useSettings, type UserSettings } from '../contexts/SettingsContext';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSetting, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<'player' | 'general' | 'accessibility'>('player');

  if (!isOpen) return null;

  const playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#1a1a2e] rounded-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto border border-white/10 shadow-2xl"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#1a1a2e] border-b border-white/5 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <h2 className="text-xl font-bold text-white">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5 px-6">
          {([
            { key: 'player' as const, icon: <Play size={16} />, label: 'Player' },
            { key: 'general' as const, icon: <Monitor size={16} />, label: 'General' },
            { key: 'accessibility' as const, icon: <Bell size={16} />, label: 'Accessibility' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === tab.key
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-white/40 hover:text-white/60'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Settings Content */}
        <div className="p-6 space-y-6">
          {activeTab === 'player' && (
            <>
              {/* Playback Speed */}
              <div>
                <label className="flex items-center gap-2 text-white/70 text-sm font-medium mb-3">
                  <Speed size={16} />
                  Default Playback Speed
                </label>
                <div className="flex flex-wrap gap-2">
                  {playbackSpeeds.map(speed => (
                    <button
                      key={speed}
                      onClick={() => updateSetting('playbackSpeed', speed)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        settings.playbackSpeed === speed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white/8 text-white/60 hover:bg-white/15 border border-white/10'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto Play Next Episode */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">Auto-play Next Episode</p>
                  <p className="text-white/30 text-xs mt-0.5">Automatically play the next episode</p>
                </div>
                <button
                  onClick={() => updateSetting('autoPlayNextEpisode', !settings.autoPlayNextEpisode)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    settings.autoPlayNextEpisode ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                  role="switch"
                  aria-checked={settings.autoPlayNextEpisode}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      settings.autoPlayNextEpisode ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>

              {/* Show Titles */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">Show Episode Titles</p>
                  <p className="text-white/30 text-xs mt-0.5">Display episode titles in the player</p>
                </div>
                <button
                  onClick={() => updateSetting('showTitles', !settings.showTitles)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    settings.showTitles ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                  role="switch"
                  aria-checked={settings.showTitles}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      settings.showTitles ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </>
          )}

          {activeTab === 'general' && (
            <>
              {/* Compact Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">Compact Mode</p>
                  <p className="text-white/30 text-xs mt-0.5">Reduce spacing and card sizes</p>
                </div>
                <button
                  onClick={() => updateSetting('compactMode', !settings.compactMode)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    settings.compactMode ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                  role="switch"
                  aria-checked={settings.compactMode}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      settings.compactMode ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </>
          )}

          {activeTab === 'accessibility' && (
            <>
              {/* Reduced Motion */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm font-medium">Reduce Motion</p>
                  <p className="text-white/30 text-xs mt-0.5">Disable animations and transitions</p>
                </div>
                <button
                  onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    settings.reducedMotion ? 'bg-emerald-500' : 'bg-white/20'
                  }`}
                  role="switch"
                  aria-checked={settings.reducedMotion}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                      settings.reducedMotion ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </button>
              </div>
            </>
          )}

          {/* Reset */}
          <div className="pt-4 border-t border-white/5">
            <button
              onClick={resetSettings}
              className="flex items-center gap-2 px-4 py-2 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all text-sm"
            >
              <RotateCcw size={14} />
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
