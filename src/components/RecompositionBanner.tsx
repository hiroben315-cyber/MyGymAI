import React, { useState } from 'react';
import { ShieldCheck, ChevronDown, ChevronUp, Activity, Dumbbell, Flame } from 'lucide-react';
import { UserIntakeProfile } from '../types/workout';

interface RecompositionBannerProps {
  userProfile: UserIntakeProfile;
}

export const RecompositionBanner: React.FC<RecompositionBannerProps> = ({ userProfile }) => {
  const [expanded, setExpanded] = useState(false);

  const goalText =
    userProfile.goal === 'recomposition'
      ? '身體重組（同步增肌減脂）'
      : userProfile.goal === 'hypertrophy'
      ? '肌肥大（增肌為主）'
      : '減脂為主（保留肌肉）';

  const proteinPerKg = (userProfile.targetProtein / (userProfile.weight || 80)).toFixed(1);

  return (
    <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-zinc-100">
                專屬體態檔案：{userProfile.height}cm / {userProfile.weight}kg（{userProfile.age || 28}歲）
              </span>
              <span className="text-[11px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 font-medium border border-emerald-500/30">
                {goalText}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              雙重進程法則（Double Progression）＋ 每日 {userProfile.targetProtein}g 蛋白質（{proteinPerKg}g/kg）鎖定淨瘦體重
            </p>
          </div>
        </div>

        <button className="text-zinc-400 hover:text-zinc-200 text-xs flex items-center gap-1 font-medium">
          <span className="hidden sm:inline">{expanded ? '收合科學指引' : '查看運動力學方針'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 pt-3 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in fade-in">
          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/60">
            <div className="font-bold text-zinc-300 flex items-center gap-1.5 mb-1">
              <Dumbbell className="w-3.5 h-3.5 text-lime-400" />
              漸進超負荷法則 (Overload)
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              複合大動作達到設定次數上限（如 10 下全滿）時，下次第一組加重 2.5kg（深蹲/腿推加 5kg）。未滿則以同重量增加 1-2 下為目標。
            </p>
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/60">
            <div className="font-bold text-zinc-300 flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              {userProfile.targetProtein}g 蛋白質戰略
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              依據 {userProfile.weight}kg 體重以每公斤 {proteinPerKg}g 設定目標。在目標熱量（~{userProfile.dailyCalories || 2150} 大卡）期間，極大化肌肉蛋白合成 (MPS)。
            </p>
          </div>

          <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/60">
            <div className="font-bold text-zinc-300 flex items-center gap-1.5 mb-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              動作品質與關節力線
            </div>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              離心 2-3 秒受控慢放，向心爆發推起。肩推與臥推嚴防聳肩，深蹲對齊腳尖防膝內扣，拒絕代償。
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
