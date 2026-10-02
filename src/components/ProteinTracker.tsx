import React from 'react';
import { Plus, Minus, CheckCircle, Sparkles, Utensils } from 'lucide-react';
import { COMMON_PROTEIN_FOODS } from '../constants/presets';

interface ProteinTrackerProps {
  proteinGrams: number;
  targetGrams: number;
  onChange: (grams: number) => void;
}

export const ProteinTracker: React.FC<ProteinTrackerProps> = ({
  proteinGrams,
  targetGrams,
  onChange,
}) => {
  const percentage = Math.min(Math.round((proteinGrams / targetGrams) * 100), 150);
  const remaining = Math.max(0, targetGrams - proteinGrams);
  const isReached = proteinGrams >= targetGrams;

  const handleAdd = (amount: number) => {
    onChange(Math.max(0, proteinGrams + amount));
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
      {/* Background glow accent */}
      <div
        className={`absolute -right-16 -top-16 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-opacity ${
          isReached ? 'bg-emerald-500/15' : 'bg-lime-500/10'
        }`}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300">
            <Utensils className="w-4 h-4 text-lime-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-zinc-100">今日蛋白質打卡檢視</h2>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono">
                目標 160g（2.0g/kg）
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              增肌減脂身體重組關鍵：每日確保充足白質維持肌肉合成環境
            </p>
          </div>
        </div>

        {/* Current number with manual stepper */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-zinc-950 border border-zinc-800 rounded-xl p-1.5">
          <button
            onClick={() => handleAdd(-5)}
            className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 flex items-center justify-center transition-colors"
            title="減少 5g"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-baseline px-2">
            <input
              type="number"
              value={proteinGrams === 0 ? '' : proteinGrams}
              onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
              placeholder="0"
              className="w-14 text-center font-mono font-black text-xl text-zinc-100 bg-transparent focus:outline-none"
            />
            <span className="text-xs font-mono font-medium text-zinc-400">/ {targetGrams}g</span>
          </div>

          <button
            onClick={() => handleAdd(5)}
            className="w-8 h-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 active:scale-95 text-zinc-300 flex items-center justify-center transition-colors"
            title="增加 5g"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Status */}
      <div className="space-y-1.5 mb-4">
        <div className="flex justify-between items-center text-xs font-medium">
          <div className="flex items-center gap-1.5">
            {isReached ? (
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                目標達成！({proteinGrams}g)
              </span>
            ) : (
              <span className="text-zinc-400">
                還差 <span className="font-mono font-bold text-amber-400">{remaining}g</span> 達標
              </span>
            )}
          </div>
          <span className="font-mono font-bold text-zinc-300">{percentage}%</span>
        </div>

        <div className="h-2.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isReached
                ? 'bg-gradient-to-r from-emerald-500 to-lime-400 shadow-sm shadow-emerald-500/50'
                : percentage >= 75
                ? 'bg-gradient-to-r from-lime-500 to-lime-400'
                : 'bg-gradient-to-r from-amber-500 to-lime-500'
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Quick Add Food Chips */}
      <div>
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-lime-400" />
          快速打卡常見食物
        </div>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {COMMON_PROTEIN_FOODS.map((food) => (
            <button
              key={food.name}
              onClick={() => handleAdd(food.grams)}
              className="group flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950/70 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-zinc-100 transition-all active:scale-95"
            >
              <span>{food.icon}</span>
              <span className="font-medium">{food.name}</span>
              <span className="font-mono text-[11px] font-bold text-lime-400 group-hover:text-lime-300">
                +{food.grams}g
              </span>
            </button>
          ))}
          <button
            onClick={() => onChange(160)}
            className="px-2.5 py-1.5 rounded-lg bg-lime-500/10 hover:bg-lime-500/20 border border-lime-500/30 text-xs font-semibold text-lime-400 transition-all active:scale-95"
          >
            直接拉滿 160g 🎯
          </button>
        </div>
      </div>
    </div>
  );
};
