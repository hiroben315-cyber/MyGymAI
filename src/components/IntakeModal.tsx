import React, { useState } from 'react';
import {
  X,
  UserCheck,
  Target,
  Clock,
  Dumbbell,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';
import { UserIntakeProfile, CustomPlanResponse } from '../types/workout';

interface IntakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: UserIntakeProfile;
  onSaveProfile: (profile: UserIntakeProfile) => void;
  onApplyGeneratedRoutine?: (splitType: string, markdown: string) => void;
}

export const IntakeModal: React.FC<IntakeModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSaveProfile,
  onApplyGeneratedRoutine,
}) => {
  const [formData, setFormData] = useState<UserIntakeProfile>({
    ...currentProfile,
    age: currentProfile.age || 28,
    gender: currentProfile.gender || 'male',
    height: currentProfile.height || 171,
    weight: currentProfile.weight || 80,
    goal: currentProfile.goal || 'recomposition',
    trainingDaysPerWeek: currentProfile.trainingDaysPerWeek || 4,
    sessionDurationMin: currentProfile.sessionDurationMin || 60,
    trainingLocation: currentProfile.trainingLocation || 'gym',
    experienceYears: currentProfile.experienceYears || '1-3年',
    currentWorkingWeights: currentProfile.currentWorkingWeights || '臥推 50kg 10下、滑輪下拉 55kg 10下、槓鈴深蹲 70kg 10下',
    injuriesOrLimitations: currentProfile.injuriesOrLimitations || '無顯著舊傷，偶爾深蹲下背微酸',
    targetProtein: currentProfile.targetProtein || 160,
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<CustomPlanResponse | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/coach/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.success) {
        setGeneratedPlan(data);
        // update profile with new protein and calories
        const updated = {
          ...formData,
          targetProtein: data.nutrition.targetProteinGrams,
          dailyCalories: data.nutrition.targetCalories,
          assignedSplit: data.splitType,
        };
        setFormData(updated);
        onSaveProfile(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!generatedPlan) return;
    navigator.clipboard.writeText(generatedPlan.markdownPlan);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-3xl max-h-[92vh] bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl flex flex-col my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-zinc-100 flex items-center gap-2">
                模式一：個人建檔與專屬課表制定
              </h2>
              <p className="text-xs text-zinc-400">
                運動力學與肌肥大科學量身規劃：分化方式、動作重量 RPE、TDEE 與蛋白質計算
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-6">
          {!generatedPlan ? (
            <form onSubmit={handleGenerate} className="space-y-5">
              {/* Section 1: 基本資料 */}
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  <UserCheck className="w-4 h-4 text-lime-400" />
                  1. 基本身體資料
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">生理性別</label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-lime-500"
                    >
                      <option value="male">男性 (Male)</option>
                      <option value="female">女性 (Female)</option>
                      <option value="other">其他</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">年齡 (歲)</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 25 })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-lime-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">身高 (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: parseFloat(e.target.value) || 170 })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-lime-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">體重 (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 75 })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 font-mono focus:outline-none focus:border-lime-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: 目標導向 */}
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  <Target className="w-4 h-4 text-amber-400" />
                  2. 核心體態目標
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'recomposition', title: '身體重組 (Recomposition)', desc: '同步增肌減脂，適合 80kg/171cm 體態' },
                    { id: 'hypertrophy', title: '肌肥大 (Hypertrophy)', desc: '增肌為主，熱量微盈餘，追求力量與肌肉維度' },
                    { id: 'fat_loss', title: '減脂為主 (Fat Loss)', desc: '創造熱量赤字，高白質維持瘦體組織' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        formData.goal === item.id
                          ? 'bg-lime-500/10 border-lime-500/60 text-zinc-100 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-zinc-200">{item.title}</span>
                        <input
                          type="radio"
                          name="goal"
                          checked={formData.goal === item.id}
                          onChange={() => setFormData({ ...formData, goal: item.id as any })}
                          className="accent-lime-500"
                        />
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-tight">{item.desc}</p>
                    </label>
                  ))}
                </div>
              </div>

              {/* Section 3: 訓練資源 */}
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  3. 訓練資源與環境
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">每週可訓練天數</label>
                    <select
                      value={formData.trainingDaysPerWeek}
                      onChange={(e) => setFormData({ ...formData, trainingDaysPerWeek: parseInt(e.target.value) || 4 })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-lime-500"
                    >
                      <option value={3}>3 天 (全身循環 Full Body)</option>
                      <option value={4}>4 天 (上下肢 Upper/Lower)</option>
                      <option value={5}>5 天 (PPL 循環)</option>
                      <option value={6}>6 天 (PPL 雙循環)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">每次訓練時間</label>
                    <select
                      value={formData.sessionDurationMin}
                      onChange={(e) => setFormData({ ...formData, sessionDurationMin: parseInt(e.target.value) || 60 })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-lime-500"
                    >
                      <option value={45}>45 分鐘 (高效精準)</option>
                      <option value={60}>60 分鐘 (標準充裕)</option>
                      <option value={75}>75 分鐘 (充血與充分休息)</option>
                      <option value={90}>90 分鐘 (大容量循環)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">訓練場所器材</label>
                    <select
                      value={formData.trainingLocation}
                      onChange={(e) => setFormData({ ...formData, trainingLocation: e.target.value as any })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-lime-500"
                    >
                      <option value="gym">健身房完整器材 (槓鈴/啞鈴/滑輪/機械)</option>
                      <option value="home_dumbbells">居家可調式啞鈴/彈力帶</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 4: 過往經驗與舊傷限制 */}
              <div className="bg-zinc-950/70 border border-zinc-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  4. 過往經驗與舊傷關節限制
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">訓練年資</label>
                    <select
                      value={formData.experienceYears}
                      onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-lime-500"
                    >
                      <option value="<1年">&lt; 1 年 (初階/動作學習期)</option>
                      <option value="1-3年">1 - 3 年 (中階/規律超負荷)</option>
                      <option value="3年以上">3 年以上 (進階/突破瓶頸)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                      目前主要動作工作重量（臥推、深蹲、硬舉、下拉等）
                    </label>
                    <input
                      type="text"
                      placeholder="例如：臥推 50kg 10下、深蹲 70kg、下拉 55kg"
                      value={formData.currentWorkingWeights}
                      onChange={(e) => setFormData({ ...formData, currentWorkingWeights: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-lime-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-zinc-400 block mb-1">
                    有無舊傷或關節不適（教練將於運動力學上自動避開危險弧度並強化肩袖/核心）
                  </label>
                  <input
                    type="text"
                    placeholder="例如：無 / 右肩臥推曾微夾擠 / 深蹲下背偶爾緊繃"
                    value={formData.injuriesOrLimitations}
                    onChange={(e) => setFormData({ ...formData, injuriesOrLimitations: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-lime-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-800 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-zinc-950 font-black text-xs shadow-lg shadow-lime-500/20 disabled:opacity-40 transition-all active:scale-95"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      運動力學課表計算中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      立即量身制定專屬課表
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Generated Plan View */
            <div className="space-y-5 animate-in fade-in">
              <div className="bg-lime-500/10 border border-lime-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider block mb-0.5">
                    課表制定成功 · 推薦分化方案
                  </span>
                  <h3 className="text-base font-extrabold text-zinc-100">{generatedPlan.splitType}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 text-center font-mono">
                    <span className="text-[10px] text-zinc-400 block">建議每日熱量</span>
                    <span className="text-xs font-bold text-amber-300">
                      {generatedPlan.nutrition.targetCalories} kcal
                    </span>
                  </div>
                  <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-zinc-800 text-center font-mono">
                    <span className="text-[10px] text-zinc-400 block">目標蛋白質</span>
                    <span className="text-xs font-bold text-lime-400">
                      {generatedPlan.nutrition.targetProteinGrams} g
                    </span>
                  </div>
                </div>
              </div>

              {/* Markdown Display */}
              <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 font-mono text-xs sm:text-sm text-zinc-200 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all max-h-[50vh]">
                {generatedPlan.markdownPlan}
              </div>

              {/* Plan Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setGeneratedPlan(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition-colors"
                >
                  ← 修改建檔資料
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyMarkdown}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">已複製課表！</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>複製課表 Markdown</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      if (onApplyGeneratedRoutine) {
                        onApplyGeneratedRoutine(generatedPlan.splitType, generatedPlan.markdownPlan);
                      }
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-zinc-950 font-extrabold text-xs transition-colors shadow-md shadow-lime-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    應用此課表至日常訓練日誌
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
