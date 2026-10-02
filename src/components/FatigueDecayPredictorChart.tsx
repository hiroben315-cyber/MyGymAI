import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  Timer,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
  ShieldAlert,
  Flame,
  Zap,
} from 'lucide-react';
import { ExerciseItem } from '../types/workout';
import { computeFatigueDecayAnalysis, FatigueSetDataPoint } from '../utils/calc';

interface FatigueDecayPredictorChartProps {
  exercises: ExerciseItem[];
  activeRestSeconds?: number | null;
  onApplyRestTime?: (seconds: number) => void;
}

export const FatigueDecayPredictorChart: React.FC<FatigueDecayPredictorChartProps> = ({
  exercises,
  activeRestSeconds,
  onApplyRestTime,
}) => {
  // Movement selector: default to the first compound movement or first exercise
  const compoundOrFirst = useMemo(() => {
    return (
      exercises.find(
        (e) =>
          e.isCompound ||
          /推|蹲|拉|划船|硬舉|press|squat|deadlift|pulldown|row/i.test(e.name)
      ) ||
      exercises[0] ||
      null
    );
  }, [exercises]);

  const [selectedExerciseName, setSelectedExerciseName] = useState<string>(
    compoundOrFirst ? compoundOrFirst.name : '槓鈴平躺臥推'
  );

  // Simulated rest time interval (defaults to current active timer or 90s)
  const [restSeconds, setRestSeconds] = useState<number>(activeRestSeconds || 90);

  // Active exercise object
  const currentEx = useMemo(() => {
    return exercises.find((e) => e.name === selectedExerciseName) || compoundOrFirst;
  }, [exercises, selectedExerciseName, compoundOrFirst]);

  // Compute analysis and predictions
  const analysis = useMemo(() => {
    if (!currentEx) {
      // Fallback dummy
      return computeFatigueDecayAnalysis(
        {
          id: 'dummy',
          name: '槓鈴平躺臥推',
          isCompound: true,
          sets: [
            { id: '1', setNumber: 1, weightKg: 50, reps: 10, completed: true },
            { id: '2', setNumber: 2, weightKg: 50, reps: 10, completed: true },
            { id: '3', setNumber: 3, weightKg: 50, reps: 9, completed: true },
            { id: '4', setNumber: 4, weightKg: 50, reps: 8, completed: true },
          ],
        },
        restSeconds
      );
    }
    return computeFatigueDecayAnalysis(currentEx, restSeconds);
  }, [currentEx, restSeconds]);

  const { points, restDiagnosis, maxDropOffPct, averageDropOffPct } = analysis;

  const handleQuickRestSelect = (sec: number) => {
    setRestSeconds(sec);
  };

  const handleApplyRecommended = () => {
    if (onApplyRestTime) {
      onApplyRestTime(restDiagnosis.recommendedRestSeconds);
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-5">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-sm shadow-rose-500/10">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-zinc-100 flex items-center gap-2">
              體力衰退率預測與組間休息診斷
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono">
                ATP-CP 磷酸原代謝分析
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              分析連續多組有效容量衰退趨勢，預測向心失速點，科學診斷組間休息是否充足
            </p>
          </div>
        </div>

        {/* Current / Recommended Rest Badge */}
        <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-2xl text-xs">
          <Clock className="w-4 h-4 text-amber-400" />
          <span className="text-zinc-400">當前間歇模型：</span>
          <span className="font-mono font-bold text-amber-300">{restSeconds} 秒</span>
        </div>
      </div>

      {/* Movement and Rest Interval Controllers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Exercise Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-lime-400" />
            分析目標動作：
          </label>
          <div className="flex flex-wrap gap-1.5">
            {exercises.map((ex) => {
              const isSelected = ex.name === selectedExerciseName;
              return (
                <button
                  key={ex.name}
                  onClick={() => setSelectedExerciseName(ex.name)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all truncate max-w-[200px] ${
                    isSelected
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-sm shadow-rose-500/10'
                      : 'bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                  title={ex.name}
                >
                  {ex.name.split('(')[0].trim()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Rest Interval Simulator Controls */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
            <Timer className="w-3.5 h-3.5 text-amber-400" />
            模擬不同組間休息秒數（觀察衰退曲線變化）：
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {[60, 90, 120, 150].map((sec) => (
              <button
                key={sec}
                onClick={() => handleQuickRestSelect(sec)}
                className={`py-1.5 rounded-xl text-xs font-mono font-bold border transition-all ${
                  restSeconds === sec
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-zinc-950/80 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                {sec}s {sec === 60 ? '⚡短' : sec === 120 ? '👑推薦' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Diagnostic Alert Box */}
      <div
        className={`rounded-2xl p-4 sm:p-5 border transition-all ${
          restDiagnosis.severity === 'critical_rest_needed'
            ? 'bg-rose-950/25 border-rose-500/40 text-rose-200'
            : restDiagnosis.severity === 'needs_extension'
            ? 'bg-amber-950/25 border-amber-500/40 text-amber-200'
            : 'bg-emerald-950/25 border-emerald-500/40 text-emerald-200'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {restDiagnosis.severity === 'optimal' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : restDiagnosis.severity === 'critical_rest_needed' ? (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-bounce" />
            ) : (
              <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div>
              <div className="font-extrabold text-sm sm:text-base tracking-tight">
                {restDiagnosis.title}
              </div>
              <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                {restDiagnosis.description}
              </p>
            </div>
          </div>

          {/* Action button to apply recommended rest */}
          {onApplyRestTime && (
            <button
              onClick={handleApplyRecommended}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-zinc-100 flex items-center gap-2 transition-all active:scale-95 shadow-md"
            >
              <Timer className="w-4 h-4 text-lime-400" />
              <span>
                套用建議間歇：<strong>{restDiagnosis.recommendedRestSeconds} 秒</strong>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
            </button>
          )}
        </div>

        {/* Scientific Mechanism Breakdown */}
        <div className="mt-3 pt-3 border-t border-zinc-800/60 text-xs text-zinc-400 leading-relaxed font-sans">
          <strong className="text-zinc-300">💡 肌力與肌肥大生理學機制：</strong>{' '}
          {restDiagnosis.rationale}
        </div>
      </div>

      {/* KPI Numbers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-400">平均組間跌幅</div>
          <div className="font-mono font-black text-xl text-zinc-100 mt-1">
            {averageDropOffPct}%
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">
            {averageDropOffPct <= 15 ? '🟢 處於理想可控範圍' : '⚠️ 衰退加速'}
          </div>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-400">最大疲勞衰退率</div>
          <div
            className={`font-mono font-black text-xl mt-1 ${
              maxDropOffPct > 20
                ? 'text-rose-400'
                : maxDropOffPct > 15
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {maxDropOffPct}%
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">
            門檻上限：15% (安全線)
          </div>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-400">當前間歇 ATP 恢復率</div>
          <div className="font-mono font-black text-xl text-amber-300 mt-1">
            {restSeconds >= 150 ? '98%' : restSeconds >= 120 ? '95%' : restSeconds >= 90 ? '85%' : '75%'}
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">
            磷酸肌酸 (PCr) 再合成
          </div>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-3 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-400">建議最佳間歇</div>
          <div className="font-mono font-black text-xl text-lime-400 mt-1">
            {restDiagnosis.recommendedRestSeconds} 秒
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">
            守住後續組數高品質
          </div>
        </div>
      </div>

      {/* Main Recharts Composed Chart */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-3 sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400 mb-3 px-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-200">
              各組容量保留 vs 疲勞衰退率趨勢（含預測組）
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400/30 border border-emerald-400" />
              單組容量 (kg)
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <span className="w-3 h-0.5 bg-rose-400" /> 疲勞衰退率 (%)
            </span>
            <span className="flex items-center gap-1 text-zinc-500">
              <span className="w-3 h-0.5 border-b border-dashed border-zinc-400" /> 預測區間
            </span>
          </div>
        </div>

        <div className="w-full h-72 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={points} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="volumeBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.25} />
                </linearGradient>
                <linearGradient id="predictedBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#d97706" stopOpacity={0.15} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

              <XAxis
                dataKey="label"
                stroke="#71717a"
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                tickLine={false}
              />

              {/* Left Axis: Volume in kg */}
              <YAxis
                yAxisId="left"
                stroke="#10b981"
                tick={{ fill: '#a1a1aa', fontSize: 11 }}
                tickLine={false}
                unit="kg"
              />

              {/* Right Axis: Drop-off percentage */}
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#f43f5e"
                domain={[0, 50]}
                tick={{ fill: '#f43f5e', fontSize: 11 }}
                tickLine={false}
                unit="%"
              />

              {/* Safe Threshold Line at 15% */}
              <ReferenceLine
                yAxisId="right"
                y={15}
                stroke="#eab308"
                strokeDasharray="4 4"
                label={{
                  value: '15% 黃金肥大衰退上限',
                  fill: '#eab308',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />

              {/* Critical Danger Line at 20% */}
              <ReferenceLine
                yAxisId="right"
                y={20}
                stroke="#f43f5e"
                strokeDasharray="3 3"
                label={{
                  value: '20% 代償危險紅線',
                  fill: '#f43f5e',
                  fontSize: 10,
                  position: 'insideTopRight',
                }}
              />

              <Tooltip content={<FatigueTooltip />} />

              {/* Capacity Bar */}
              <Bar
                yAxisId="left"
                dataKey="volume"
                name="單組容量"
                fill="url(#volumeBarGrad)"
                radius={[6, 6, 0, 0]}
              />

              {/* Drop-off Trend Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="dropOffPct"
                name="疲勞衰退率"
                stroke="#f43f5e"
                strokeWidth={3}
                dot={<CustomDot />}
                activeDot={{ r: 6, stroke: '#fda4af', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sets Detail Table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="bg-zinc-950/80 text-zinc-400 font-semibold border-b border-zinc-800">
            <tr>
              <th className="py-2 px-3">組數</th>
              <th className="py-2 px-3">重量 × 次數</th>
              <th className="py-2 px-3">單組有效容量</th>
              <th className="py-2 px-3">體力保留率</th>
              <th className="py-2 px-3">疲勞衰退率</th>
              <th className="py-2 px-3">狀態判定</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-850">
            {points.map((p, idx) => (
              <tr
                key={idx}
                className={
                  p.isPredicted
                    ? 'bg-amber-950/10 text-amber-200/90'
                    : 'hover:bg-zinc-900/40'
                }
              >
                <td className="py-2 px-3 font-mono font-bold flex items-center gap-1.5">
                  {p.isPredicted && <Sparkles className="w-3 h-3 text-amber-400" />}
                  <span>{p.label}</span>
                </td>
                <td className="py-2 px-3 font-mono text-zinc-200">
                  {p.weightKg} kg × {p.reps} 下
                </td>
                <td className="py-2 px-3 font-mono font-bold text-emerald-400">
                  {p.volume.toLocaleString()} kg
                </td>
                <td className="py-2 px-3 font-mono text-zinc-300">{p.retentionPct}%</td>
                <td className="py-2 px-3 font-mono font-bold">
                  {p.dropOffPct === 0 ? (
                    <span className="text-zinc-500">基準 (0%)</span>
                  ) : (
                    <span
                      className={
                        p.dropOffPct > 20
                          ? 'text-rose-400'
                          : p.dropOffPct > 15
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }
                    >
                      -{p.dropOffPct}%
                    </span>
                  )}
                </td>
                <td className="py-2 px-3 text-[11px] font-semibold">{p.statusText}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Custom Dot to visually mark warning / critical sets
const CustomDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (!cx || !cy) return null;

  const isCritical = payload.dropOffPct > 20;
  const isWarning = payload.dropOffPct > 15;
  const isPredicted = payload.isPredicted;

  let fill = '#10b981';
  if (isCritical) fill = '#f43f5e';
  else if (isWarning) fill = '#f59e0b';

  return (
    <circle
      cx={cx}
      cy={cy}
      r={isPredicted ? 5 : 4}
      fill={fill}
      stroke={isPredicted ? '#fbbf24' : '#ffffff'}
      strokeWidth={isPredicted ? 2 : 1}
      strokeDasharray={isPredicted ? '2 2' : 'none'}
    />
  );
};

// Custom Tooltip for Fatigue Chart
const FatigueTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data: FatigueSetDataPoint = payload[0].payload;
    return (
      <div className="bg-zinc-950/95 border border-zinc-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
          <span className="font-bold text-zinc-100 flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                data.dropOffPct > 20
                  ? 'bg-rose-400 animate-ping'
                  : data.dropOffPct > 15
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
            />
            {data.label}
          </span>
          {data.isPredicted && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
              預測組
            </span>
          )}
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between text-zinc-300">
            <span className="text-zinc-400">完成組數數據：</span>
            <span className="font-bold text-zinc-100">
              {data.weightKg}kg × {data.reps}下
            </span>
          </div>

          <div className="flex items-center justify-between text-zinc-300">
            <span className="text-zinc-400">單組有效容量：</span>
            <span className="font-bold text-emerald-400">{data.volume} kg</span>
          </div>

          <div className="flex items-center justify-between text-zinc-300">
            <span className="text-zinc-400">體力保留率：</span>
            <span className="font-bold text-zinc-200">{data.retentionPct}%</span>
          </div>

          <div className="flex items-center justify-between text-zinc-300">
            <span className="text-zinc-400">疲勞衰退率：</span>
            <span
              className={`font-bold ${
                data.dropOffPct > 20
                  ? 'text-rose-400 text-sm'
                  : data.dropOffPct > 15
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {data.dropOffPct === 0 ? '0% (基準)' : `-${data.dropOffPct}%`}
            </span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-zinc-800 text-[11px] font-semibold text-zinc-300">
          {data.statusText}
        </div>
      </div>
    );
  }
  return null;
};
