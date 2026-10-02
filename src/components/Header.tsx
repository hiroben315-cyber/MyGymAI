import React from 'react';
import { Dumbbell, Flame, Timer, History, Award } from 'lucide-react';
import { UserIntakeProfile } from '../types/workout';

interface HeaderProps {
  userProfile: UserIntakeProfile;
  activeTimerSeconds: number | null;
  onOpenTimer: () => void;
  onOpenHistory: () => void;
  onOpenIntake: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userProfile,
  activeTimerSeconds,
  onOpenTimer,
  onOpenHistory,
  onOpenIntake,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-40 px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Persona title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400 shadow-sm shadow-lime-500/20">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-1.5">
                AI 體態教練與訓練數據分析師
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-lime-500/20 text-lime-400 border border-lime-500/40">
                <Flame className="w-3 h-3" />
                運動力學 · 超負荷
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {userProfile.height}cm / {userProfile.weight}kg ·{' '}
              {userProfile.goal === 'recomposition'
                ? '身體重組（同步增肌減脂）'
                : userProfile.goal === 'hypertrophy'
                ? '肌肥大（增肌為主）'
                : userProfile.goal || '身體重組'}
            </p>
          </div>
        </div>

        {/* User Target Stats & Quick Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode 1 Intake button */}
          <button
            onClick={onOpenIntake}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-lime-500/10 hover:bg-lime-500/20 text-lime-400 border border-lime-500/30 transition-all active:scale-95"
            title="模式一：初次建檔與量身制定專屬課表"
          >
            <Award className="w-3.5 h-3.5" />
            <span>建檔制定課表</span>
          </button>
          {/* Target Protein pill */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-zinc-400 hidden xs:inline">目標蛋白:</span>
            <span className="font-mono font-bold text-amber-300">{userProfile.targetProtein}g</span>
          </div>

          {/* Rest Timer Button */}
          <button
            onClick={onOpenTimer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              activeTimerSeconds !== null && activeTimerSeconds > 0
                ? 'bg-lime-500 text-zinc-950 border-lime-400 font-bold animate-pulse'
                : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700/80'
            }`}
            title="開啟組間休息計時器"
          >
            <Timer className="w-4 h-4" />
            <span>
              {activeTimerSeconds !== null && activeTimerSeconds > 0
                ? `${Math.floor(activeTimerSeconds / 60)}:${(activeTimerSeconds % 60).toString().padStart(2, '0')}`
                : '休息計時'}
            </span>
          </button>

          {/* History button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 transition-colors"
            title="訓練歷史日誌"
          >
            <History className="w-4 h-4 text-zinc-400" />
            <span className="hidden sm:inline">歷史日誌</span>
          </button>
        </div>
      </div>
    </header>
  );
};
