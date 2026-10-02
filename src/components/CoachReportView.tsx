import React, { useState } from 'react';
import {
  Copy,
  Check,
  Zap,
  Target,
  Utensils,
  Dumbbell,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Droplets,
  Moon,
  Clock,
  Sparkles,
  ArrowDownRight,
  Minus,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { OverloadTarget, MilestoneAchievement, LongitudinalComparison } from '../types/workout';

interface CoachReportViewProps {
  markdown: string;
  comparisons?: LongitudinalComparison[];
  overloadTargets: OverloadTarget[];
  milestones?: MilestoneAchievement[];
  deloadAdvice?: string;
  proteinGrams: number;
  targetProtein: number;
  waterMl?: number;
  sleepHours?: number;
  proteinFeedback?: string;
  onClose?: () => void;
}

export const CoachReportView: React.FC<CoachReportViewProps> = ({
  markdown,
  comparisons = [],
  overloadTargets = [],
  milestones = [],
  deloadAdvice,
  proteinGrams,
  targetProtein,
  waterMl = 2500,
  sleepHours = 7.5,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const percentage = Math.round((proteinGrams / targetProtein) * 100);

  // Filter comparisons by status
  const progressItems = comparisons.filter((c) => c.status === 'progress');
  const dropItems = comparisons.filter((c) => c.status === 'drop');
  const maintainItems = comparisons.filter((c) => c.status === 'maintain');

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-lime-500/20 border border-lime-500/40 flex items-center justify-center text-lime-400">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-100 flex items-center gap-2">
              訓練歷史縱向比對與動態超負荷教練報告
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-lime-500/10 text-lime-400 border border-lime-500/30">
                運動力學 × 歷史比對
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              優先執行歷史比對分析：縱向對比表、深度診斷、精確超負荷指令、營養修復打卡
            </p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 transition-all active:scale-95 shadow-sm"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400">已複製報告 Markdown！</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-zinc-400" />
              <span>複製分析報告</span>
            </>
          )}
        </button>
      </div>

      {/* 核心任務 1：📈 歷史數據縱向對比表 (優先置頂展示) */}
      <div className="bg-zinc-950 border border-lime-500/30 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-black text-lime-400">
            <TrendingUp className="w-4 h-4" />
            <span>【優先核心】📈 歷史數據縱向對比表</span>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">
            精準檢索動作「上一次記錄」並縱向追蹤容量與次數
          </span>
        </div>

        {comparisons.length > 0 ? (
          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-zinc-900/90 text-zinc-400 font-semibold border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3.5">動作名稱</th>
                  <th className="py-2.5 px-3.5">上次表現 (重量 × 次數)</th>
                  <th className="py-2.5 px-3.5">本次表現 (重量 × 次數)</th>
                  <th className="py-2.5 px-3.5">總容量變化</th>
                  <th className="py-2.5 px-3.5">狀態判定</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {comparisons.map((c, i) => {
                  const isProgress = c.status === 'progress';
                  const isDrop = c.status === 'drop';
                  const isMaintain = c.status === 'maintain';

                  let statusBadgeClass = 'bg-zinc-800 text-zinc-400 border-zinc-700';
                  if (isProgress) statusBadgeClass = 'bg-emerald-950/60 text-emerald-400 border-emerald-500/40';
                  else if (isDrop) statusBadgeClass = 'bg-rose-950/60 text-rose-400 border-rose-500/40';
                  else if (isMaintain) statusBadgeClass = 'bg-amber-950/60 text-amber-400 border-amber-500/40';

                  const volSign = c.volumeDiffKg >= 0 ? `+${c.volumeDiffKg}` : `${c.volumeDiffKg}`;
                  const repSign = c.repsDiff >= 0 ? `+${c.repsDiff}` : `${c.repsDiff}`;

                  return (
                    <tr key={i} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-2.5 px-3.5 font-bold text-zinc-100 flex items-center gap-1.5">
                        <Dumbbell className="w-3.5 h-3.5 text-lime-400 shrink-0" />
                        <span>{c.exerciseName}</span>
                      </td>
                      <td className="py-2.5 px-3.5 font-mono text-zinc-400">{c.lastPerformance}</td>
                      <td className="py-2.5 px-3.5 font-mono font-bold text-zinc-200">{c.currentPerformance}</td>
                      <td className="py-2.5 px-3.5 font-mono">
                        {c.status === 'baseline' ? (
                          <span className="text-zinc-500">-</span>
                        ) : (
                          <span
                            className={`font-bold ${
                              isProgress ? 'text-emerald-400' : isDrop ? 'text-rose-400' : 'text-zinc-300'
                            }`}
                          >
                            {volSign} kg ({repSign}下)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${statusBadgeClass}`}
                        >
                          {c.statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-900 text-xs text-zinc-400 text-center">
            暫無歷史紀錄，已為今日動作建立第 1 筆基準工作重量數據。
          </div>
        )}
      </div>

      {/* 核心任務 2：🔍 深度比對診斷 (進步分析 / 衰退停滯診斷 / 代償預警) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-200">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>【模組 2】🔍 深度比對診斷（進步肯定、疲勞歸因與運動力學）</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 進步分析 */}
          <div className="bg-zinc-900/80 border border-emerald-500/25 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>進步分析（超負荷成效）</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {progressItems.length > 0 ? (
                <>
                  <span className="text-emerald-300 font-bold">
                    {progressItems.map((p) => p.exerciseName).join('、')}
                  </span>{' '}
                  總容量或重量超越上次！已達到進階加重門檻，神經適應性與肌纖維肥大驅動強烈。
                </>
              ) : (
                '今日主要動作維持工作重量累積，平穩維持有效次數區間，持續蓄積中樞神經抗疲勞耐受度。'
              )}
            </p>
          </div>

          {/* 衰退/停滯診斷 */}
          <div className="bg-zinc-900/80 border border-amber-500/25 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-400">
              <Clock className="w-3.5 h-3.5" />
              <span>衰退/停滯診斷（疲勞歸因）</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {dropItems.length > 0 ? (
                <>
                  檢測到{' '}
                  <span className="text-amber-300 font-bold">{dropItems.map((d) => d.exerciseName).join('、')}</span>{' '}
                  次數微跌。關鍵診斷：複合動作大組間休息是否少於 2 分鐘（磷酸原未及時再合成）？或受前夜睡眠及動作順序調換影響。
                </>
              ) : (
                '無顯著次數大跌衰退，組間次數跌幅平順小於 20%，組間休息充足，神經傳導效率保持良好。'
              )}
            </p>
          </div>

          {/* 代償預警 */}
          <div className="bg-zinc-900/80 border border-cyan-500/25 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-cyan-400">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>代償預警（力學安全）</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              離心維持 2-3 秒受控慢放，向心爆發推起。臥推鎖死肩胛下壓防肩夾擠；深蹲下放時核心飽滿防骨盆眨眼，切忌拼次數犧牲行程！
            </p>
          </div>
        </div>
      </div>

      {/* 核心任務 3：🎯 下次訓練精準超負荷指令 (達成進步者 vs 停滯/衰退者明確數字) */}
      {overloadTargets && overloadTargets.length > 0 && (
        <div className="bg-zinc-950 border border-lime-500/30 rounded-2xl p-4 sm:p-5 space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-200">
              <Target className="w-4 h-4 text-lime-400" />
              <span>【模組 3】🎯 下次訓練精準超負荷指令（明確數字微調）</span>
            </div>
            <span className="text-[11px] font-mono text-lime-400 font-bold">進步加重 2.5kg / 停滯休息 120s</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {overloadTargets.map((target, idx) => (
              <div
                key={idx}
                className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 relative overflow-hidden group hover:border-lime-500/50 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-lime-500/20 text-lime-400 font-mono text-[11px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    {target.exerciseName}
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                    核心複合
                  </span>
                </div>

                <div className="text-xs text-zinc-400 mb-2 font-mono">
                  今日完成紀錄：<span className="text-zinc-200 font-bold">{target.currentPerformance}</span>
                </div>

                <div className="bg-lime-950/40 border border-lime-500/25 rounded-xl p-3 mt-2">
                  <div className="text-[11px] font-extrabold text-lime-400 flex items-center gap-1 mb-1">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    下次具體微調指令：
                  </div>
                  <p className="text-xs font-semibold text-lime-100 leading-relaxed">
                    {target.nextTarget}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 4: 里程碑成就感系統 (若有觸發 PR 置頂徽章) */}
      {milestones && milestones.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-lime-500/15 to-emerald-500/15 border border-amber-500/40 rounded-2xl p-4 sm:p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-black text-amber-300">
            <span className="text-lg">🏆</span>
            <span>【榮譽勳章與激勵提示】今日達成里程碑突破！</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {milestones.map((m) => (
              <div
                key={m.id}
                className="bg-zinc-950/80 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5"
              >
                <span className="text-2xl mt-0.5">{m.badge}</span>
                <div>
                  <div className="text-xs font-bold text-zinc-100">{m.title}</div>
                  <p className="text-xs text-zinc-300 mt-0.5">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DELOAD MONITORING ALERT */}
      {deloadAdvice && (
        <div className="bg-amber-950/30 border border-amber-500/30 rounded-2xl p-4 text-xs font-semibold text-amber-200/95 flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
          <div>{deloadAdvice}</div>
        </div>
      )}

      {/* MODULE 5: 🥩 飲食與修復打卡 */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-zinc-200">
            <Utensils className="w-4 h-4 text-amber-400" />
            <span>【模組 5】🥩 飲食與夜間修復打卡（160g 蛋白質標準）</span>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-amber-300">
            蛋白質：{proteinGrams}g / {targetProtein}g ({percentage}%)
          </span>
        </div>

        {/* 3 Metrics: Protein progress, Water, Sleep */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800/80">
            <div className="text-[11px] font-bold text-zinc-400 mb-1 flex items-center justify-between">
              <span>蛋白質達成度</span>
              <span className="font-mono text-zinc-200">{percentage}%</span>
            </div>
            <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 mb-1.5">
              <div
                className={`h-full rounded-full transition-all ${
                  proteinGrams >= targetProtein ? 'bg-emerald-400' : 'bg-lime-400'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-zinc-400 leading-tight">
              {proteinGrams >= targetProtein
                ? '已達成肌肥大合成閾值！'
                : `尚差 ${targetProtein - proteinGrams}g，晚間請安排加餐補足。`}
            </p>
          </div>

          <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 mb-1 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                水分代謝指標
              </div>
              <div className="font-mono font-bold text-sm text-cyan-300">{waterMl} ml / 2800 ml</div>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">維持肌纖維水分飽滿度與肌酸利用率</p>
          </div>

          <div className="bg-zinc-900/80 p-3 rounded-xl border border-zinc-800/80 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold text-zinc-400 mb-1 flex items-center gap-1.5">
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                深層睡眠修復
              </div>
              <div className="font-mono font-bold text-sm text-indigo-300">{sleepHours} 小時（建議 7.5-8h）</div>
            </div>
            <p className="text-[11px] text-zinc-400 mt-1">神經系統疲勞排除與生長激素分泌高峰</p>
          </div>
        </div>
      </div>

      {/* FULL MARKDOWN: 包含歷史縱向對比表、深度診斷、精確超負荷指令與飲食打卡的完整教練回覆 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-zinc-500" />
            教練完整分析報告（標準 Markdown 清單格式，含歷史對比表）
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">可一鍵複製至任何筆記軟體</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 font-mono text-xs sm:text-sm text-zinc-200 leading-relaxed overflow-x-auto whitespace-pre-wrap select-all">
          {markdown}
        </div>
      </div>
    </div>
  );
};
