import { useState } from 'react';
import { Trophy, Medal, Star, Lock, CheckCircle, X } from 'lucide-react';
import { useAchievements } from '../contexts/AchievementsContext';

export default function Achievements() {
  const { achievements, getUnlockedCount } = useAchievements();
  const [selectedAchievement, setSelectedAchievement] = useState<typeof achievements[0] | null>(null);

  const unlocked = achievements.filter(a => a.unlocked).length;
  const total = achievements.length;
  const progress = (unlocked / total) * 100;

  return (
    <div className="min-h-screen bg-[#0a0a0f] pt-20 page-transition">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <Trophy className="text-amber-400" size={32} />
            Achievements
          </h1>
          <p className="text-white/40">Track your streaming milestones</p>
        </div>

        {/* Progress */}
        <div className="mb-8 p-6 bg-gradient-to-r from-amber-500/10 to-emerald-500/10 border border-amber-500/20 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-white">{unlocked} / {total}</h2>
              <p className="text-white/40 text-sm">Achievements Unlocked</p>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-black text-amber-400">{Math.round(progress)}%</h2>
              <p className="text-white/40 text-sm">Complete</p>
            </div>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {achievements.map(achievement => (
            <button
              key={achievement.id}
              onClick={() => setSelectedAchievement(achievement)}
              className={`p-6 rounded-2xl border transition-all text-left hover:scale-105 ${
                achievement.unlocked
                  ? 'bg-gradient-to-br from-amber-500/10 to-emerald-500/10 border-amber-500/30 hover:shadow-xl hover:shadow-amber-500/10'
                  : 'bg-white/5 border-white/10 opacity-50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{achievement.icon}</span>
                {achievement.unlocked ? (
                  <CheckCircle size={20} className="text-emerald-400" />
                ) : (
                  <Lock size={20} className="text-white/20" />
                )}
              </div>
              <h3 className={`text-lg font-bold mb-2 ${achievement.unlocked ? 'text-white' : 'text-white/40'}`}>
                {achievement.name}
              </h3>
              <p className={`text-sm ${achievement.unlocked ? 'text-white/60' : 'text-white/20'}`}>
                {achievement.description}
              </p>
              {achievement.unlocked && achievement.unlockedAt && (
                <p className="text-xs text-emerald-400/60 mt-3">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Achievement Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedAchievement(null)}>
          <div className="bg-[#1a1a2e] rounded-2xl max-w-md w-full border border-white/10 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-8 text-center">
              <button
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              <div className="text-8xl mb-6">{selectedAchievement.icon}</div>
              <h2 className="text-2xl font-black text-white mb-2">{selectedAchievement.name}</h2>
              <p className="text-white/60 mb-4">{selectedAchievement.description}</p>
              {selectedAchievement.unlocked ? (
                <div className="flex items-center justify-center gap-2 text-emerald-400">
                  <Medal size={20} />
                  <span className="font-semibold">Unlocked!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-white/30">
                  <Lock size={20} />
                  <span className="font-semibold">Locked</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
