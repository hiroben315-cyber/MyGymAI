import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Dumbbell,
  Target,
  Zap,
  Activity,
  Flame,
  Award,
  ChevronDown,
  Eye,
  Info,
} from 'lucide-react';
import { ExerciseItem, WorkoutSession, UserIntakeProfile } from '../types/workout';
import { extractExerciseHistorySeries, normalizeExerciseName } from '../utils/calc';

interface ExerciseProgressChartProps {
  sessions: WorkoutSession[];
  currentExercises: ExerciseItem[];
  userProfile: UserIntakeProfile;
}

type ChartMetricView = 'both' | 'weight' | 'volume';

export const ExerciseProgressChart: React.FC<ExerciseProgressChartProps> = ({
  sessions,
  currentExercises,
  userProfile,
}) => {
  // Collect all available exercise names across sessions and current workout
  const availableExercises = useMemo(() => {
    const namesSet = new Set<string>();

    // Common core compound presets prioritized
    const corePresets = [
      '槓鈴平躺臥推 (Barbell Bench Press)',
      '上斜啞鈴臥推 (Incline DB Press)',
      '坐姿啞鈴肩推 (Seated DB OHP)',
      '滑輪下拉 (Lat Pulldown)',
      '槓鈴背蹲舉 (Squat)',
      '45度機械腿推 (Leg Press)',
      '羅馬尼亞硬舉 (RDL)',
    ];

    corePresets.forEach((p) => namesSet.add(p));

    currentExercises.forEach((e) => {
      if (e.name) namesSet.add(e.name);
    });

    sessions.forEach((s) => {
      (s.exercises || []).forEach((e) => {
        if (e.name) namesSet.add(e.name);
      });
    });

    return Array.from(namesSet);
  }, [sessions, currentExercises]);

  const [selectedExercise, setSelectedExercise] = useState<string>('槓鈴平躺臥推 (Barbell Bench Press)');
  const [metricView, setMetricView] = useState<ChartMetricView>('both');
  const [includeCurrentWorkout, setIncludeCurrentWorkout] = useState<boolean>(true);

  // Find matching active exercise in current workout
  const currentMatchingExercise = useMemo(() => {
    const selNorm = normalizeExerciseName(selectedExercise);
    return (
      currentExercises.find((ex) => {
        const norm = normalizeExerciseName(ex.name);
        return norm === selNorm || ex.name === selectedExercise;
      }) || null
    );
  }, [selectedExercise, currentExercises]);

  // Extract history series
  const dataSeries = useMemo(() => {
    return extractExerciseHistorySeries(
      selectedExercise,
      sessions,
      currentMatchingExercise,
      includeCurrentWorkout
    );
  }, [selectedExercise, sessions, currentMatchingExercise, includeCurrentWorkout]);

  // Compute summary stats
  const stats = useMemo(() => {
    if (dataSeries.length === 0) {
      return {
        hasData: false,
        maxWeight: 0,
        weightGain: 0,
        weightGainPct: 0,
        latestVolume: 0,
        volumeGain: 0,
        volumeGainPct: 0,
        highest1RM: 0,
        bwRatio: 0,
        totalEntries: 0,
      };
    }

    const first = dataSeries[0];
    const latest = dataSeries[dataSeries.length - 1];

    const maxWeight = Math.max(...dataSeries.map((d) => d.maxWeight));
    const highest1RM = Math.max(...dataSeries.map((d) => d.estimated1RM));
    const latestVolume = latest.totalVolume;

    const weightGain = latest.maxWeight - first.maxWeight;
    const weightGainPct = first.maxWeight > 0 ? Math.round((weightGain / first.maxWeight) * 100) : 0;

    const volumeGain = latest.totalVolume - first.totalVolume;
    const volumeGainPct = first.totalVolume > 0 ? Math.round((volumeGain / first.totalVolume) * 100) : 0;

    const bwRatio = userProfile.weight > 0 ? Math.round((maxWeight / userProfile.weight) * 100) / 100 : 0;

    return {
      hasData: true,
      maxWeight: latest.maxWeight,
      weightGain,
      weightGainPct,
      latestVolume,
      volumeGain,
      volumeGainPct,
      highest1RM,
      bwRatio,
      totalEntries: dataSeries.length,
    };
  }, [dataSeries, userProfile.weight]);

  // Quick select badges
  const quickSelectChips = [
    { label: '槓鈴平躺臥推', target: '槓鈴平躺臥推 (Barbell Bench Press)', badge: '胸推' },
    { label: '上斜啞鈴臥推', target: '上斜啞鈴臥推 (Incline DB Press)', badge: '上胸' },
    { label: '坐姿啞鈴肩推', target: '坐姿啞鈴肩推 (Seated DB OHP)', badge: '肩推' },
    { label: '滑輪下拉', target: '滑輪下拉 (Lat Pulldown)', badge: '背闊' },
    { label: '槓鈴背蹲舉', target: '槓鈴背蹲舉 (Squat)', badge: '下肢' },
  ];

  const cleanSelectedName = normalizeExerciseName(selectedExercise);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-4 sm:p-6 shadow-xl space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-400 shadow-sm shadow-lime-500/10">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-zinc-100 flex items-center gap-2">
              核心動作重量與容量變化趨勢
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-lime-500/10 text-lime-400 border border-lime-500/30 font-mono">
                Recharts 雙軸追蹤
              </span>
            </h2>
            <p className="text-xs text-zinc-400">
              身體重組（增肌為主）視覺化曲線：量化重量 PR 爬升與訓練容量累積
            </p>
          </div>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-1 p-1 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-bold">
          <button
            onClick={() => setMetricView('both')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metricView === 'both'
                ? 'bg-lime-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            雙軸總覽
          </button>
          <button
            onClick={() => setMetricView('weight')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metricView === 'weight'
                ? 'bg-lime-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            重量 & 1RM
          </button>
          <button
            onClick={() => setMetricView('volume')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              metricView === 'volume'
                ? 'bg-cyan-500 text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            總容量 (kg)
          </button>
        </div>
      </div>

      {/* Movement Selector Chips & Options */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-zinc-400 font-semibold mr-1 flex items-center gap-1">
              <Dumbbell className="w-3.5 h-3.5 text-zinc-500" />
              核心動作：
            </span>
            {quickSelectChips.map((chip) => {
              const isSelected =
                normalizeExerciseName(selectedExercise) === normalizeExerciseName(chip.target);
              return (
                <button
                  key={chip.target}
                  onClick={() => setSelectedExercise(chip.target)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? 'bg-lime-500/20 text-lime-400 border-lime-500/50 shadow-sm shadow-lime-500/10'
                      : 'bg-zinc-950/70 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-800 text-zinc-400">
                    {chip.badge}
                  </span>
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Include live workout toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 hover:text-zinc-200 font-medium">
            <input
              type="checkbox"
              checked={includeCurrentWorkout}
              onChange={(e) => setIncludeCurrentWorkout(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-700 text-lime-500 focus:ring-0 focus:ring-offset-0 bg-zinc-950"
            />
            <span>包含今日正在編輯組數（即時聯動）</span>
          </label>
        </div>

        {/* Extended Dropdown if user has custom exercises */}
        {availableExercises.length > 5 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">更多動作選擇：</span>
            <div className="relative inline-block text-xs">
              <select
                value={selectedExercise}
                onChange={(e) => setSelectedExercise(e.target.value)}
                className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-xl px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:border-lime-500 font-medium cursor-pointer"
              >
                {availableExercises.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* KPI Highlight Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Metric 1: Max Working Weight */}
        <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-between">
            <span>最高工作重量</span>
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          </div>
          <div className="mt-1">
            <div className="font-mono font-black text-xl sm:text-2xl text-lime-400 flex items-baseline gap-1">
              {stats.maxWeight}
              <span className="text-xs font-normal text-zinc-400">kg</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              {stats.weightGain > 0 ? (
                <span className="text-emerald-400 font-bold">
                  +{stats.weightGain} kg ({stats.weightGainPct > 0 ? `+${stats.weightGainPct}%` : '首次'}) 🟢
                </span>
              ) : (
                <span>穩定維持中</span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 2: Estimated 1RM */}
        <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-between">
            <span>預估極限 1RM</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1">
            <div className="font-mono font-black text-xl sm:text-2xl text-amber-300 flex items-baseline gap-1">
              {stats.highest1RM}
              <span className="text-xs font-normal text-zinc-400">kg</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              Epley 力學公式換算
            </div>
          </div>
        </div>

        {/* Metric 3: Latest Total Volume */}
        <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-between">
            <span>單項總訓練容量</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-1">
            <div className="font-mono font-black text-xl sm:text-2xl text-cyan-300 flex items-baseline gap-1">
              {stats.latestVolume.toLocaleString()}
              <span className="text-xs font-normal text-zinc-400">kg</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              {stats.volumeGain > 0 ? (
                <span className="text-cyan-400 font-bold">
                  +{stats.volumeGain.toLocaleString()} kg (+{stats.volumeGainPct}%) ⚡
                </span>
              ) : (
                <span>基線建立完成</span>
              )}
            </div>
          </div>
        </div>

        {/* Metric 4: Bodyweight Ratio */}
        <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-3 sm:p-3.5 flex flex-col justify-between">
          <div className="text-[11px] font-bold text-zinc-400 flex items-center justify-between">
            <span>力量體重比 (80kg)</span>
            <Award className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="mt-1">
            <div className="font-mono font-black text-xl sm:text-2xl text-purple-300 flex items-baseline gap-1">
              {stats.bwRatio}x
              <span className="text-xs font-normal text-zinc-400">BW</span>
            </div>
            <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
              {stats.bwRatio >= 0.8 ? '🏅 達 0.8x 標誌性門檻' : '朝 0.8x 推進中'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Recharts Container */}
      <div className="bg-zinc-950 border border-zinc-800/90 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center justify-between text-xs text-zinc-400 mb-3 px-1">
          <div className="flex items-center gap-3">
            <span className="font-bold text-zinc-200 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-lime-400" />
              {cleanSelectedName} 漸進超負荷軌跡
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            {(metricView === 'both' || metricView === 'weight') && (
              <>
                <span className="flex items-center gap-1 text-lime-400">
                  <span className="w-3 h-0.5 bg-lime-400" /> 最高重量 (kg)
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-3 h-0.5 bg-amber-400 border-b border-dashed" /> 預估 1RM
                </span>
              </>
            )}
            {(metricView === 'both' || metricView === 'volume') && (
              <span className="flex items-center gap-1 text-cyan-400">
                <span className="w-3 h-2 rounded bg-cyan-500/30 border border-cyan-400" /> 訓練容量 (kg)
              </span>
            )}
          </div>
        </div>

        {dataSeries.length > 0 ? (
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dataSeries} margin={{ top: 10, right: 15, left: -10, bottom: 5 }}>
                <defs>
                  {/* Cyan gradient for Volume Area */}
                  <linearGradient id="volumeAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />

                <XAxis
                  dataKey="displayDate"
                  stroke="#71717a"
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  tickLine={false}
                />

                {/* Left Axis: Weight in kg */}
                <YAxis
                  yAxisId="weightAxis"
                  stroke="#84cc16"
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  tickLine={false}
                  unit="kg"
                  hide={metricView === 'volume'}
                />

                {/* Right Axis: Volume in kg */}
                <YAxis
                  yAxisId="volumeAxis"
                  orientation="right"
                  stroke="#06b6d4"
                  domain={['dataMin - 150', 'dataMax + 200']}
                  tick={{ fill: '#06b6d4', fontSize: 11 }}
                  tickLine={false}
                  unit="kg"
                  hide={metricView === 'weight'}
                />

                <Tooltip content={<CustomTooltip />} />

                {/* Volume Area (Rendered first so line stays on top) */}
                {(metricView === 'both' || metricView === 'volume') && (
                  <Area
                    yAxisId="volumeAxis"
                    type="monotone"
                    dataKey="totalVolume"
                    name="單項訓練容量"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="url(#volumeAreaGradient)"
                  />
                )}

                {/* Estimated 1RM Line (Dashed) */}
                {(metricView === 'both' || metricView === 'weight') && (
                  <Line
                    yAxisId="weightAxis"
                    type="monotone"
                    dataKey="estimated1RM"
                    name="預估極限 1RM"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ fill: '#fbbf24', r: 3 }}
                    activeDot={{ r: 5, stroke: '#f59e0b', strokeWidth: 2 }}
                  />
                )}

                {/* Max Working Weight Line */}
                {(metricView === 'both' || metricView === 'weight') && (
                  <Line
                    yAxisId="weightAxis"
                    type="monotone"
                    dataKey="maxWeight"
                    name="最高工作重量"
                    stroke="#84cc16"
                    strokeWidth={3}
                    dot={{ fill: '#84cc16', r: 4 }}
                    activeDot={{ r: 6, stroke: '#a3e635', strokeWidth: 2 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="py-16 text-center text-zinc-500 text-xs">
            尚未記錄到「{cleanSelectedName}」的歷史數據，在下方課表中完成此動作即可即時繪製成長軌跡！
          </div>
        )}
      </div>

      {/* Scientific Recomposition Insight Note */}
      <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 flex items-start gap-3 text-xs leading-relaxed text-zinc-300">
        <Info className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-zinc-100 mr-1">
            身體重組（Recomposition）力學洞察：
          </span>
          在 171cm / 80kg 與每日 160g 蛋白質的重組週期中，主要複合動作（如臥推、深蹲、下拉）的
          <strong className="text-lime-400">「有效重量」</strong>與
          <strong className="text-cyan-400">「訓練總容量（Volume）」</strong>
          向上爬升是肌肉橫截面積（CSA）擴增的最根本動力。若工作重量持平但次數增加（Volume PR），代表微觀肌耐力與運動單元同步徵召，已為下一次 +2.5kg 重量突破做好中樞神經準備！
        </div>
      </div>
    </div>
  );
};

// Custom Sleek Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-zinc-950/95 border border-zinc-700/80 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md text-xs space-y-2 min-w-[210px]">
        <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800">
          <span className="font-bold text-zinc-100 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-lime-400" />
            {data.exerciseName}
          </span>
          <span className="font-mono text-[11px] text-zinc-400">
            {data.displayDate}
          </span>
        </div>

        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex items-center justify-between text-zinc-300">
            <span className="text-zinc-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-lime-400" /> 工作重量：
            </span>
            <span className="font-bold text-lime-400 text-sm">{data.maxWeight} kg</span>
          </div>

          <div className="flex items-center justify-between text-zinc-300">
            <span className="text-zinc-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> 預估 1RM：
            </span>
            <span className="font-bold text-amber-300">{data.estimated1RM} kg</span>
          </div>

          <div className="flex items-center justify-between text-zinc-300">
            <span className="text-zinc-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> 單項總容量：
            </span>
            <span className="font-bold text-cyan-300">{data.totalVolume.toLocaleString()} kg</span>
          </div>
        </div>

        {data.setsDetail && (
          <div className="pt-1.5 border-t border-zinc-800/80 text-[10px] text-zinc-400 font-mono">
            當日完成：<span className="text-zinc-200">{data.setsDetail}</span>
          </div>
        )}

        {data.isToday && (
          <div className="text-[10px] text-lime-400 font-bold bg-lime-500/10 px-2 py-0.5 rounded text-center">
            ⚡ 即時預覽（今日正在編輯）
          </div>
        )}
      </div>
    );
  }
  return null;
};
