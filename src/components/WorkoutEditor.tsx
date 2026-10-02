import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  Flame,
  Dumbbell,
  Sparkles,
  ChevronDown,
  Check,
  Timer,
  Zap,
  TrendingUp,
} from 'lucide-react';
import { ExerciseItem, ExerciseSet, WorkoutRoutine, WorkoutSession } from '../types/workout';
import { PPL_TEMPLATES } from '../constants/presets';
import {
  calculate1RM,
  calculateExerciseVolume,
  calculateTotalWorkoutVolume,
  findPreviousExercisePerformance,
} from '../utils/calc';

interface WorkoutEditorProps {
  routine: WorkoutRoutine;
  exercises: ExerciseItem[];
  sensations: string;
  onSensationsChange: (val: string) => void;
  waterMl: number;
  onWaterChange: (val: number) => void;
  sleepHours: number;
  onSleepChange: (val: number) => void;
  onRoutineChange: (routine: WorkoutRoutine) => void;
  onExercisesChange: (exercises: ExerciseItem[]) => void;
  onStartRestTimer: (seconds: number) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  previousSessions?: WorkoutSession[];
}

export const WorkoutEditor: React.FC<WorkoutEditorProps> = ({
  routine,
  exercises,
  sensations,
  onSensationsChange,
  waterMl,
  onWaterChange,
  sleepHours,
  onSleepChange,
  onRoutineChange,
  onExercisesChange,
  onStartRestTimer,
  onAnalyze,
  isAnalyzing,
  previousSessions = [],
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newIsCompound, setNewIsCompound] = useState(true);

  const totalVolume = calculateTotalWorkoutVolume(exercises);
  const totalCompletedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed !== false).length,
    0
  );

  // Load standard template for selected routine
  const handleLoadTemplate = (selectedRoutine: 'Push' | 'Pull' | 'Legs') => {
    const template = PPL_TEMPLATES[selectedRoutine];
    // deep copy to avoid mutation
    const cloned: ExerciseItem[] = JSON.parse(JSON.stringify(template));
    onExercisesChange(cloned);
  };

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof ExerciseSet,
    value: any
  ) => {
    const updated = [...exercises];
    const targetSet = { ...updated[exerciseIndex].sets[setIndex], [field]: value };
    updated[exerciseIndex].sets[setIndex] = targetSet;
    onExercisesChange(updated);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...exercises];
    const targetExercise = updated[exerciseIndex];
    const lastSet = targetExercise.sets[targetExercise.sets.length - 1];

    const newSet: ExerciseSet = {
      id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      setNumber: targetExercise.sets.length + 1,
      weightKg: lastSet ? lastSet.weightKg : 40,
      reps: lastSet ? lastSet.reps : 10,
      completed: true,
    };

    targetExercise.sets.push(newSet);
    onExercisesChange(updated);
  };

  const handleDuplicateSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    const targetExercise = updated[exerciseIndex];
    const sourceSet = targetExercise.sets[setIndex];

    const newSet: ExerciseSet = {
      ...sourceSet,
      id: `set-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      setNumber: targetExercise.sets.length + 1,
    };

    targetExercise.sets.splice(setIndex + 1, 0, newSet);
    // reindex
    targetExercise.sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    onExercisesChange(updated);
  };

  const handleDeleteSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].sets.splice(setIndex, 1);
    updated[exerciseIndex].sets.forEach((s, idx) => {
      s.setNumber = idx + 1;
    });
    onExercisesChange(updated);
  };

  const handleDeleteExercise = (exerciseIndex: number) => {
    const updated = [...exercises];
    updated.splice(exerciseIndex, 1);
    onExercisesChange(updated);
  };

  const handleToggleCompound = (exerciseIndex: number) => {
    const updated = [...exercises];
    updated[exerciseIndex].isCompound = !updated[exerciseIndex].isCompound;
    onExercisesChange(updated);
  };

  const handleAddCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExerciseName.trim()) return;

    const newEx: ExerciseItem = {
      id: `ex-${Date.now()}`,
      name: newExerciseName.trim(),
      isCompound: newIsCompound,
      targetRepRange: newIsCompound ? '6-10' : '10-15',
      sets: [
        {
          id: `set-${Date.now()}-1`,
          setNumber: 1,
          weightKg: newIsCompound ? 50 : 15,
          reps: 10,
          completed: true,
        },
        {
          id: `set-${Date.now()}-2`,
          setNumber: 2,
          weightKg: newIsCompound ? 50 : 15,
          reps: 10,
          completed: true,
        },
        {
          id: `set-${Date.now()}-3`,
          setNumber: 3,
          weightKg: newIsCompound ? 50 : 15,
          reps: 10,
          completed: true,
        },
      ],
    };

    onExercisesChange([...exercises, newEx]);
    setNewExerciseName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Routine Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-2.5 sm:p-3">
        {/* Routine tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-zinc-950 rounded-xl border border-zinc-800/80">
          {(['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'FullBody', 'Custom'] as WorkoutRoutine[]).map((r) => {
            const labels: Record<WorkoutRoutine, { name: string; icon: string }> = {
              Push: { name: '推日 (Push)', icon: '⚡' },
              Pull: { name: '拉日 (Pull)', icon: '⚓' },
              Legs: { name: '腿日 (Legs)', icon: '🦵' },
              Upper: { name: '上肢 (Upper)', icon: '💪' },
              Lower: { name: '下肢 (Lower)', icon: '🦿' },
              FullBody: { name: '全身 (Full Body)', icon: '🌐' },
              Custom: { name: '自訂', icon: '📝' },
            };
            const active = routine === r;
            return (
              <button
                key={r}
                onClick={() => {
                  onRoutineChange(r);
                  if (['Push', 'Pull', 'Legs'].includes(r)) {
                    handleLoadTemplate(r as any);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-lime-500 text-zinc-950 shadow-md shadow-lime-500/20'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
                }`}
              >
                <span>{labels[r].icon}</span>
                <span>{labels[r].name}</span>
              </button>
            );
          })}
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          {routine !== 'Custom' && (
            <button
              onClick={() => handleLoadTemplate(routine as any)}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-medium transition-colors"
              title="重載官方推薦訓練課表"
            >
              載入官方 {routine} 課表
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-lime-400 border border-zinc-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            新增動作
          </button>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-3.5">
        {exercises.length === 0 ? (
          <div className="text-center py-12 bg-zinc-900/40 border border-dashed border-zinc-800 rounded-2xl">
            <Dumbbell className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
            <p className="text-zinc-400 font-medium">尚未添加動作</p>
            <p className="text-xs text-zinc-400 mt-1">點選上方課表按鈕或自訂新增動作</p>
          </div>
        ) : (
          exercises.map((exercise, exIndex) => {
            const exerciseVol = calculateExerciseVolume(exercise);
            const pastPerf = findPreviousExercisePerformance(exercise.name, previousSessions);

            return (
              <div
                key={exercise.id || exIndex}
                className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-3.5 sm:p-4 shadow-sm hover:border-zinc-700/80 transition-colors"
              >
                {/* Exercise Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2.5 border-b border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-zinc-800 text-zinc-300 text-xs font-mono font-bold flex items-center justify-center">
                      {exIndex + 1}
                    </span>
                    <h3 className="font-bold text-sm sm:text-base text-zinc-100 flex items-center gap-2">
                      {exercise.name}
                    </h3>

                    {/* Compound Badge Toggle */}
                    <button
                      onClick={() => handleToggleCompound(exIndex)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                        exercise.isCompound
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                          : 'bg-zinc-800/70 text-zinc-400 border-zinc-700/50'
                      }`}
                      title={exercise.isCompound ? '前 2-3 個複合動作將獲得專屬超負荷建議' : '標記為複合大動作'}
                    >
                      <Flame className="w-3 h-3" />
                      {exercise.isCompound ? '複合大動作（超負荷焦點）' : '輔助/孤立'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Rest timer quick launcher */}
                    <button
                      onClick={() => onStartRestTimer(exercise.isCompound ? 120 : 90)}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-mono transition-colors"
                      title="啟動此動作的組間計時器"
                    >
                      <Timer className="w-3.5 h-3.5 text-lime-400" />
                      {exercise.isCompound ? '120s' : '90s'}
                    </button>

                    <button
                      onClick={() => handleDeleteExercise(exIndex)}
                      className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="刪除此動作"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* 歷史上次紀錄與本次容量即時對比 (縱向超負荷追蹤) */}
                {pastPerf && (
                  <div className="mb-3 px-3 py-2 rounded-xl bg-zinc-950/80 border border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="font-bold text-lime-400 font-mono flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> 上次表現：
                      </span>
                      <span className="font-mono text-zinc-200 font-bold">{pastPerf.perfString}</span>
                      <span className="text-zinc-500 font-mono text-[11px]">
                        (容量 {pastPerf.totalVolume.toLocaleString()} kg · {pastPerf.date})
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span className="text-zinc-400">今日總容量：</span>
                      <span className="font-bold text-zinc-100">{exerciseVol.toLocaleString()} kg</span>
                      {exerciseVol > 0 && (
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[11px] border ${
                            exerciseVol > pastPerf.totalVolume
                              ? 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40'
                              : exerciseVol === pastPerf.totalVolume
                              ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                              : 'bg-rose-950/70 text-rose-400 border-rose-500/40'
                          }`}
                        >
                          {exerciseVol > pastPerf.totalVolume
                            ? `+${exerciseVol - pastPerf.totalVolume} kg 🟢 超負荷！`
                            : exerciseVol === pastPerf.totalVolume
                            ? `持平 (Maintain)`
                            : `${exerciseVol - pastPerf.totalVolume} kg`}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Sets Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-zinc-400 border-b border-zinc-800/50">
                        <th className="py-1.5 px-2 w-10 text-center font-medium">組數</th>
                        <th className="py-1.5 px-2 w-44 font-medium">重量 (kg)</th>
                        <th className="py-1.5 px-2 w-36 font-medium">次數 (Reps)</th>
                        <th className="py-1.5 px-2 w-24 font-medium hidden sm:table-cell">預估 1RM</th>
                        <th className="py-1.5 px-2 w-24 text-right font-medium">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/40">
                      {exercise.sets.map((set, setIndex) => {
                        const estimated1RM = calculate1RM(set.weightKg, set.reps);
                        return (
                          <tr key={set.id || setIndex} className="hover:bg-zinc-800/20 group">
                            {/* Set Number */}
                            <td className="py-2 px-2 text-center font-mono font-bold text-zinc-400">
                              #{set.setNumber}
                            </td>

                            {/* Weight input with steppers */}
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    handleUpdateSet(
                                      exIndex,
                                      setIndex,
                                      'weightKg',
                                      Math.max(0, Number((set.weightKg - 2.5).toFixed(1)))
                                    )
                                  }
                                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs flex items-center justify-center transition-colors"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  step="0.5"
                                  value={set.weightKg === 0 ? '' : set.weightKg}
                                  onChange={(e) =>
                                    handleUpdateSet(
                                      exIndex,
                                      setIndex,
                                      'weightKg',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="w-16 bg-zinc-950 border border-zinc-800 focus:border-lime-500 rounded px-1.5 py-1 font-mono font-bold text-sm text-center text-zinc-100"
                                />
                                <span className="text-[11px] text-zinc-400 font-mono">kg</span>
                                <button
                                  onClick={() =>
                                    handleUpdateSet(
                                      exIndex,
                                      setIndex,
                                      'weightKg',
                                      Number((set.weightKg + 2.5).toFixed(1))
                                    )
                                  }
                                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs flex items-center justify-center transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* Reps input with steppers */}
                            <td className="py-2 px-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    handleUpdateSet(
                                      exIndex,
                                      setIndex,
                                      'reps',
                                      Math.max(0, set.reps - 1)
                                    )
                                  }
                                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs flex items-center justify-center transition-colors"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  value={set.reps === 0 ? '' : set.reps}
                                  onChange={(e) =>
                                    handleUpdateSet(
                                      exIndex,
                                      setIndex,
                                      'reps',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="w-14 bg-zinc-950 border border-zinc-800 focus:border-lime-500 rounded px-1.5 py-1 font-mono font-bold text-sm text-center text-zinc-100"
                                />
                                <span className="text-[11px] text-zinc-400 font-mono">下</span>
                                <button
                                  onClick={() =>
                                    handleUpdateSet(exIndex, setIndex, 'reps', set.reps + 1)
                                  }
                                  className="w-6 h-6 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-xs flex items-center justify-center transition-colors"
                                >
                                  +
                                </button>
                              </div>
                            </td>

                            {/* 1RM estimation */}
                            <td className="py-2 px-2 font-mono text-zinc-400 hidden sm:table-cell">
                              {estimated1RM > 0 ? (
                                <span className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 text-[11px]">
                                  {estimated1RM} kg
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>

                            {/* Actions (Duplicate / Delete) */}
                            <td className="py-2 px-2 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleDuplicateSet(exIndex, setIndex)}
                                  className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                                  title="複製此組"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                {exercise.sets.length > 1 && (
                                  <button
                                    onClick={() => handleDeleteSet(exIndex, setIndex)}
                                    className="p-1 rounded text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                    title="刪除此組"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Exercise bottom bar */}
                <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-zinc-800/50 text-xs">
                  <button
                    onClick={() => handleAddSet(exIndex)}
                    className="flex items-center gap-1 text-lime-400 hover:text-lime-300 font-semibold px-2 py-1 rounded hover:bg-lime-500/10 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    新增一組
                  </button>

                  <div className="text-zinc-400 font-mono text-[11px]">
                    單項容量：<span className="text-zinc-200 font-bold">{exerciseVol} kg</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Exercise List ends here */}

      {/* Sensation, Joint Feedback & Recovery Input Card (Mode 2 Input) */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime-400" />
            <h4 className="text-xs sm:text-sm font-bold text-zinc-100">
              今日動作品質、體感與關節狀態回報（選填，教練據此診斷代償）
            </h4>
          </div>
          <span className="text-[11px] text-zinc-400">行程速度 · 借力代償 · 疲勞感</span>
        </div>

        <input
          type="text"
          value={sensations}
          onChange={(e) => onSensationsChange(e.target.value)}
          placeholder="例如：臥推第四組右手腕微壓迫、深蹲離心下放偏快、組間休息 90s 第三組後次數掉較多..."
          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-200 text-xs sm:text-sm focus:outline-none focus:border-lime-500 placeholder-zinc-500"
        />

        {/* Quick chip sensations */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-zinc-400 font-medium">常見體感標籤：</span>
          {[
            '臥推手肘微外展/輕微聳肩',
            '深蹲下背微酸/核心未鎖緊',
            '離心下放速度較快(約1秒)',
            '引體向上二頭前臂借力明顯',
            '組間休息充足/狀態極佳',
          ].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => {
                const updated = sensations ? `${sensations}；${tag}` : tag;
                onSensationsChange(updated);
              }}
              className="px-2 py-0.5 rounded bg-zinc-800/80 hover:bg-zinc-800 text-[11px] text-zinc-300 border border-zinc-700/60 transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>

        {/* Water & Sleep recovery inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/60">
          <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-xs text-zinc-400">今日水分攝取 (ml)：</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="100"
                value={waterMl}
                onChange={(e) => onWaterChange(parseInt(e.target.value) || 2000)}
                className="w-20 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-mono font-bold text-center text-cyan-300 focus:outline-none"
              />
              <span className="text-xs text-zinc-400 font-mono">ml</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-zinc-950 p-2.5 rounded-xl border border-zinc-800">
            <span className="text-xs text-zinc-400">昨晚睡眠時數 (h)：</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                value={sleepHours}
                onChange={(e) => onSleepChange(parseFloat(e.target.value) || 7)}
                className="w-16 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs font-mono font-bold text-center text-indigo-300 focus:outline-none"
              />
              <span className="text-xs text-zinc-400 font-mono">小時</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action / Analyze Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 z-30">
        <div className="flex items-center gap-4 text-xs sm:text-sm">
          <div>
            <span className="text-zinc-400">總完成組數：</span>
            <span className="font-mono font-bold text-zinc-100">{totalCompletedSets} 組</span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div>
            <span className="text-zinc-400">今日總訓練容量：</span>
            <span className="font-mono font-extrabold text-lime-400 text-base">
              {totalVolume.toLocaleString()} kg
            </span>
          </div>
        </div>

        <button
          onClick={onAnalyze}
          disabled={isAnalyzing || exercises.length === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-lime-500 to-emerald-500 hover:from-lime-400 hover:to-emerald-400 text-zinc-950 font-black text-sm tracking-wide shadow-lg shadow-lime-500/25 disabled:opacity-40 disabled:pointer-events-none transition-all active:scale-95"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              教練分析超負荷中...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-current" />
              發送數據 · 生成超負荷指引
            </>
          )}
        </button>
      </div>

      {/* Custom Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-base font-bold text-zinc-100 mb-3">新增動作項目</h3>

            <form onSubmit={handleAddCustomExercise} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  動作名稱
                </label>
                <input
                  type="text"
                  placeholder="例如：啞鈴上斜臥推、六角槓硬舉..."
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-lime-500"
                  autoFocus
                />
              </div>

              {/* Quick suggestions */}
              <div>
                <span className="text-[11px] font-medium text-zinc-400 block mb-1.5">常見推薦：</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    '槓鈴平躺臥推',
                    '滑輪下拉',
                    '槓鈴背蹲舉',
                    '槓鈴俯身划船',
                    '啞鈴肩推',
                    '羅馬尼亞硬舉',
                    '雙槓臂屈伸',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setNewExerciseName(sug);
                        setNewIsCompound(true);
                      }}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>

              {/* Compound Toggle */}
              <label className="flex items-center gap-2 p-3 bg-zinc-950 rounded-xl border border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newIsCompound}
                  onChange={(e) => setNewIsCompound(e.target.checked)}
                  className="rounded text-lime-500 focus:ring-0 bg-zinc-900 border-zinc-700 w-4 h-4"
                />
                <div>
                  <div className="text-xs font-bold text-zinc-200 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    複合大動作 (Compound Movement)
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    系統將重點為此動作制定下次超負荷具體目標
                  </div>
                </div>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:bg-zinc-800"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={!newExerciseName.trim()}
                  className="px-4 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 disabled:opacity-40 text-zinc-950 font-bold text-xs"
                >
                  確定新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
