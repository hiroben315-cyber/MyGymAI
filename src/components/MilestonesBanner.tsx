import React from 'react';
import { Trophy, Award, Flame, Zap, Sparkles } from 'lucide-react';
import { MilestoneAchievement } from '../types/workout';

interface MilestonesBannerProps {
  milestones: MilestoneAchievement[];
  onDismiss?: (id: string) => void;
}

export const MilestonesBanner: React.FC<MilestonesBannerProps> = ({ milestones }) => {
  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-lime-500/15 to-emerald-500/15 border border-amber-500/40 rounded-3xl p-4 sm:p-5 shadow-xl relative overflow-hidden animate-in fade-in slide-in-from-top-4">
      {/* Decorative glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 animate-bounce">
          <Trophy className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-black text-amber-300 flex items-center gap-2">
            【榮譽勳章與激勵肯定】里程碑成就達成！
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
          </h3>
          <p className="text-[11px] text-zinc-300">
            教練系統自動偵測到突破：重量極限超越、總容量躍進或體重比里程碑！
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {milestones.map((m) => (
          <div
            key={m.id}
            className="bg-zinc-950/80 border border-amber-500/30 rounded-2xl p-3 flex items-start gap-3 backdrop-blur-sm shadow-sm"
          >
            <span className="text-2xl mt-0.5 select-none">{m.badge}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-black text-zinc-100">{m.title}</span>
                {m.value && (
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {m.value}
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{m.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
