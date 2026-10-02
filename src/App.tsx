import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ProteinTracker } from './components/ProteinTracker';
import { WorkoutEditor } from './components/WorkoutEditor';
import { QuickTextInput } from './components/QuickTextInput';
import { CoachReportView } from './components/CoachReportView';
import { RestTimerModal } from './components/RestTimerModal';
import { HistoryModal } from './components/HistoryModal';
import { IntakeModal } from './components/IntakeModal';
import { RecompositionBanner } from './components/RecompositionBanner';
import { MilestonesBanner } from './components/MilestonesBanner';
import { MealEstimator } from './components/MealEstimator';
import { BodyMetricsTracker } from './components/BodyMetricsTracker';
import { ExerciseProgressChart } from './components/ExerciseProgressChart';
import { FatigueDecayPredictorChart } from './components/FatigueDecayPredictorChart';
import {
  ExerciseItem,
  WorkoutRoutine,
  WorkoutSession,
  UserIntakeProfile,
  OverloadTarget,
  MilestoneAchievement,
  LongitudinalComparison,
} from './types/workout';
import { PPL_TEMPLATES } from './constants/presets';
import {
  loadUserProfile,
  saveUserProfile,
  loadSessions,
  saveSession,
  saveSessions,
  loadTodayProtein,
  saveTodayProtein,
} from './utils/storage';
import {
  calculateTotalWorkoutVolume,
  generateLocalProgressiveOverload,
  computeLongitudinalComparisons,
} from './utils/calc';
import { Timer, UserCheck, Dumbbell, Utensils, Scale, Trophy, Flame, Activity } from 'lucide-react';

type AppTab = 'workout' | 'nutrition' | 'body_metrics';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('workout');
  const [userProfile, setUserProfile] = useState<UserIntakeProfile>(loadUserProfile());
  const [sessions, setSessions] = useState<WorkoutSession[]>(loadSessions());
  const [currentRoutine, setCurrentRoutine] = useState<WorkoutRoutine>('Push');
  const [exercises, setExercises] = useState<ExerciseItem[]>(() => {
    return JSON.parse(JSON.stringify(PPL_TEMPLATES.Push));
  });
  const [proteinGrams, setProteinGrams] = useState<number>(loadTodayProtein());

  // Mode 2 specific fields
  const [sensations, setSensations] = useState<string>('');
  const [waterMl, setWaterMl] = useState<number>(2600);
  const [sleepHours, setSleepHours] = useState<number>(7.5);
  const [isDeloadManual, setIsDeloadManual] = useState<boolean>(false);
  const [chartViewMode, setChartViewMode] = useState<'both' | 'progress' | 'fatigue'>('both');

  // Coach Analysis State (Mode 2 Output with Longitudinal Comparison)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [coachReport, setCoachReport] = useState<{
    markdown: string;
    comparisons?: LongitudinalComparison[];
    targets: OverloadTarget[];
    milestones: MilestoneAchievement[];
    deloadAdvice?: string;
    proteinFeedback?: string;
  } | null>(null);

  // Active milestones (from last session or seeded)
  const [currentMilestones, setCurrentMilestones] = useState<MilestoneAchievement[]>([
    {
      id: 'm-init-1',
      type: 'weight_pr',
      title: '臥推突破 50kg 榮譽勳章！',
      description: '平躺槓鈴臥推超越歷史紀錄，成功達成 50kg × 10 下！',
      badge: '🥇',
      achievedAt: new Date().toISOString(),
      value: '50 kg',
    },
  ]);

  // Modals
  const [isIntakeOpen, setIsIntakeOpen] = useState(false);
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const reportRef = useRef<HTMLDivElement>(null);

  // Timer interval effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && activeTimerSeconds !== null && activeTimerSeconds > 0) {
      interval = setInterval(() => {
        setActiveTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (activeTimerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTimerSeconds]);

  const handleStartTimer = (seconds: number) => {
    setActiveTimerSeconds(seconds);
    setIsTimerRunning(true);
    setIsTimerOpen(true);
  };

  const handleProteinChange = (grams: number) => {
    setProteinGrams(grams);
    saveTodayProtein(grams);
  };

  const handleAddProteinFromMeal = (grams: number) => {
    const updated = proteinGrams + grams;
    setProteinGrams(updated);
    saveTodayProtein(updated);
  };

  const handleSaveProfile = (profile: UserIntakeProfile) => {
    setUserProfile(profile);
    saveUserProfile(profile);
  };

  const handleUpdateWeightFromMetrics = (newWeight: number) => {
    const updated = { ...userProfile, weight: newWeight };
    setUserProfile(updated);
    saveUserProfile(updated);
  };

  const handleQuickTextParsed = (data: {
    routine?: string;
    exercises: any[];
    protein?: number;
    rawText: string;
    extractedSensations?: string;
  }) => {
    if (data.routine && ['Push', 'Pull', 'Legs', 'Upper', 'Lower', 'FullBody', 'Custom'].includes(data.routine)) {
      setCurrentRoutine(data.routine as WorkoutRoutine);
    }
    if (data.exercises && data.exercises.length > 0) {
      setExercises(data.exercises);
    }
    if (data.protein !== undefined && data.protein !== null) {
      handleProteinChange(data.protein);
    }
    if (data.extractedSensations) {
      setSensations(data.extractedSensations);
    }
    setActiveTab('workout');
  };

  // Main Coach Mode 2 Execution: 日常訓練日誌與動作品質分析
  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const totalVolume = calculateTotalWorkoutVolume(exercises);

    const payload = {
      workoutType: currentRoutine,
      date: new Date().toISOString().split('T')[0],
      exercises,
      sensations,
      restTimeSeconds: activeTimerSeconds || 90,
      proteinGrams,
      waterMl,
      sleepHours,
      previousSessions: sessions,
      userProfile,
      isDeloadManual,
    };

    try {
      const res = await fetch('/api/coach/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (result.success) {
        const earnedMilestones = result.milestonesEarned || [];
        setCoachReport({
          markdown: result.markdown,
          comparisons: result.comparisons || [],
          targets: result.overloadTargets || [],
          milestones: earnedMilestones,
          deloadAdvice: result.deloadAdvice,
          proteinFeedback: result.proteinFeedback,
        });

        if (earnedMilestones.length > 0) {
          setCurrentMilestones(earnedMilestones);
        }

        // Save session to history
        const newSession: WorkoutSession = {
          id: `session-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          routine: currentRoutine,
          exercises,
          sensations,
          proteinGrams,
          waterMl,
          sleepHours,
          totalVolumeKg: totalVolume,
          milestonesEarned: earnedMilestones,
          isDeload: isDeloadManual,
          coachFeedback: {
            markdown: result.markdown,
            comparisons: result.comparisons || [],
            milestonesEarned: earnedMilestones,
            dataSummary: '',
            qualityDiagnosis: {
              romAndTempoAnalysis: '',
              jointAndCompensations: '',
              fatigueDropOffAnalysis: '',
            },
            overloadTargets: result.overloadTargets || [],
            deloadAdvice: result.deloadAdvice,
            recoveryCheck: {
              proteinStatus: `${proteinGrams}g / ${userProfile.targetProtein}g`,
              hydrationTip: `${waterMl} ml 水分充足`,
              sleepRecoveryTip: `${sleepHours} 小時睡眠`,
            },
            generatedAt: new Date().toISOString(),
            usedAi: Boolean(result.usedAi),
          },
        };

        saveSession(newSession);
        setSessions(loadSessions());

        setTimeout(() => {
          reportRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
    } catch (e) {
      console.error('Coach analysis failed:', e);
      // Local fallback calculation with longitudinal history comparison
      const { comparisons, tableMd } = computeLongitudinalComparisons(exercises, sessions);
      const targets = generateLocalProgressiveOverload(exercises);
      const proteinDiff = userProfile.targetProtein - proteinGrams;

      let md = `### 1. 📈 歷史數據縱向對比表\n\n`;
      md += `${tableMd}\n`;

      md += `### 2. 🔍 深度比對診斷\n\n`;
      const progressComps = comparisons.filter((c) => c.status === 'progress');
      const dropComps = comparisons.filter((c) => c.status === 'drop');
      if (progressComps.length > 0) {
        md += `- **進步分析**：${progressComps.map((c) => `**${c.exerciseName}**`).join('、')} 總容量超越前次，超負荷成效顯著，已達進階加重門檻！\n`;
      } else {
        md += `- **進步分析**：各項動作維持強度平穩推進，持續蓄積中樞神經抗疲勞耐受力。\n`;
      }
      if (dropComps.length > 0) {
        md += `- **衰退/停滯診斷**：${dropComps.map((c) => `**${c.exerciseName}**`).join('、')} 本次次數稍退。潛在原因：大組間休息是否小於 120 秒？前晚睡眠（${sleepHours}h）未充足恢復，或動作先後次序更換所致。\n`;
      } else {
        md += `- **衰退/停滯診斷**：組間次數跌幅平順小於 20%，組間休息充足，神經系統維持高效率傳導。\n`;
      }
      md += `- **代償預警**：${
        sensations
          ? `依體感回報（${sensations}）：推起時注意肩胛下壓防夾擠，深蹲維持腹壓中立，切勿為了拼次數而犧牲完整行程或借力代償！`
          : '各動作均維持完整動作行程（ROM），離心 2 秒平穩受控慢放，向心 1 秒強勁推起，未出現借力代償。'
      }\n\n`;

      md += `### 3. 🎯 下次訓練精準超負荷指令\n\n`;
      targets.forEach((t, idx) => {
        md += `${idx + 1}. **${t.exerciseName}**（今日：${t.currentPerformance}）\n   - **下回具體目標**：${t.nextTarget}\n`;
      });

      md += `\n### 4. 🏆 里程碑成就檢測\n- 🔥 今日持續穩健累積訓練容量！主要動作已推進至高次數區間，下次有望衝刺重量 PR！\n\n`;

      md += `### 5. 🥩 飲食與恢復打卡\n\n`;
      md += `- **蛋白質檢視**：今日 **${proteinGrams}g / ${userProfile.targetProtein}g**（${Math.round((proteinGrams / userProfile.targetProtein) * 100)}%）。${
        proteinDiff <= 0 ? '蛋白質全數達標！' : `尚有 ${proteinDiff}g 缺口，睡前安排一杯無糖豆漿或乳清補齊。`
      }\n`;
      md += `- **水分與睡眠修復**：今日水分記錄 **${waterMl} ml**，昨晚睡眠 **${sleepHours} 小時**，持續維持 7.5 小時以上深層睡眠。`;

      setCoachReport({
        markdown: md,
        comparisons,
        targets,
        milestones: currentMilestones,
      });

      setTimeout(() => {
        reportRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPastSession = (session: WorkoutSession) => {
    setCurrentRoutine(session.routine as WorkoutRoutine);
    setExercises(JSON.parse(JSON.stringify(session.exercises)));
    if (session.sensations) setSensations(session.sensations);
    if (session.coachFeedback) {
      setCoachReport({
        markdown: session.coachFeedback.markdown,
        comparisons: session.coachFeedback.comparisons || [],
        targets: session.coachFeedback.overloadTargets || [],
        milestones: session.coachFeedback.milestonesEarned || [],
        deloadAdvice: session.coachFeedback.deloadAdvice,
      });
    }
  };

  const handleDeleteSession = (id: string) => {
    const updated = sessions.filter((s) => s.id !== id);
    setSessions(updated);
    saveSessions(updated);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-lime-500 selection:text-zinc-950 pb-20">
      {/* Header */}
      <Header
        userProfile={userProfile}
        activeTimerSeconds={activeTimerSeconds}
        onOpenTimer={() => setIsTimerOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenIntake={() => setIsIntakeOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1">
        {/* User Recomposition Profile Banner */}
        <RecompositionBanner userProfile={userProfile} />

        {/* Milestone Gamification Banner (Module 2) */}
        <MilestonesBanner milestones={currentMilestones} />

        {/* Navigation Tabs (Modules 1, 3, 4, 5) */}
        <div className="flex items-center gap-1.5 p-1 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('workout')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'workout'
                ? 'bg-lime-500 text-zinc-950 shadow-md shadow-lime-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
            }`}
          >
            <Dumbbell className="w-4 h-4" />
            <span>日常訓練日誌與超負荷</span>
          </button>

          <button
            onClick={() => setActiveTab('nutrition')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'nutrition'
                ? 'bg-amber-500 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>外食營養即時估算器</span>
          </button>

          <button
            onClick={() => setActiveTab('body_metrics')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
              activeTab === 'body_metrics'
                ? 'bg-cyan-500 text-zinc-950 shadow-md shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>雙週體態與圍度追蹤</span>
          </button>
        </div>

        {/* TAB 1: WORKOUT LOGGING & PROGRESSIVE OVERLOAD */}
        {activeTab === 'workout' && (
          <div className="space-y-6 animate-in fade-in">
            {/* Protein Tracker */}
            <ProteinTracker
              proteinGrams={proteinGrams}
              targetGrams={userProfile.targetProtein}
              onChange={handleProteinChange}
            />

            {/* Quick Text / Gym Shorthand Input (核心能力：極簡輸入與模糊解析) */}
            <QuickTextInput onParsed={handleQuickTextParsed} />

            {/* Recharts 圖表分析切換列 */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl">
              <span className="text-xs font-bold text-zinc-300 px-2.5 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-lime-400" />
                科學數據圖表分析：
              </span>

              <div className="flex items-center gap-1 text-xs font-bold">
                <button
                  onClick={() => setChartViewMode('both')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    chartViewMode === 'both'
                      ? 'bg-zinc-800 text-lime-400 border border-lime-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  雙圖完整展示
                </button>
                <button
                  onClick={() => setChartViewMode('progress')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    chartViewMode === 'progress'
                      ? 'bg-zinc-800 text-lime-400 border border-lime-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  📈 超負荷演進趨勢
                </button>
                <button
                  onClick={() => setChartViewMode('fatigue')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    chartViewMode === 'fatigue'
                      ? 'bg-zinc-800 text-rose-400 border border-rose-500/30 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  ⚡ 體力衰退率預測
                </button>
              </div>
            </div>

            {/* Recharts 核心動作重量與訓練容量變化趨勢圖表 */}
            {(chartViewMode === 'both' || chartViewMode === 'progress') && (
              <ExerciseProgressChart
                sessions={sessions}
                currentExercises={exercises}
                userProfile={userProfile}
              />
            )}

            {/* Recharts 體力衰退率預測與組間休息診斷圖表 */}
            {(chartViewMode === 'both' || chartViewMode === 'fatigue') && (
              <FatigueDecayPredictorChart
                exercises={exercises}
                activeRestSeconds={activeTimerSeconds}
                onApplyRestTime={(sec) => {
                  setActiveTimerSeconds(sec);
                  setIsTimerRunning(true);
                  setIsTimerOpen(true);
                }}
              />
            )}

            {/* Workout Editor with Sets, Weights, Reps, Sensations & Recovery */}
            <WorkoutEditor
              routine={currentRoutine}
              exercises={exercises}
              sensations={sensations}
              onSensationsChange={setSensations}
              waterMl={waterMl}
              onWaterChange={setWaterMl}
              sleepHours={sleepHours}
              onSleepChange={setSleepHours}
              onRoutineChange={(r) => {
                setCurrentRoutine(r);
                if (['Push', 'Pull', 'Legs'].includes(r)) {
                  setExercises(JSON.parse(JSON.stringify(PPL_TEMPLATES[r as 'Push' | 'Pull' | 'Legs'])));
                }
              }}
              onExercisesChange={setExercises}
              onStartRestTimer={handleStartTimer}
              onAnalyze={handleAnalyze}
              isAnalyzing={isAnalyzing}
              previousSessions={sessions}
            />

            {/* Generated Coach Report View (Mode 2: 4-6 Modules) */}
            {coachReport && (
              <div ref={reportRef} className="pt-4 animate-in fade-in slide-in-from-bottom-6">
                <CoachReportView
                  markdown={coachReport.markdown}
                  comparisons={coachReport.comparisons}
                  overloadTargets={coachReport.targets}
                  milestones={coachReport.milestones}
                  deloadAdvice={coachReport.deloadAdvice}
                  proteinGrams={proteinGrams}
                  targetProtein={userProfile.targetProtein}
                  waterMl={waterMl}
                  sleepHours={sleepHours}
                  proteinFeedback={coachReport.proteinFeedback}
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: MEAL NUTRITION ESTIMATOR (MODULE 4) */}
        {activeTab === 'nutrition' && (
          <div className="space-y-6 animate-in fade-in">
            <MealEstimator
              currentProtein={proteinGrams}
              targetProtein={userProfile.targetProtein}
              onAddProtein={handleAddProteinFromMeal}
            />
          </div>
        )}

        {/* TAB 3: BODY METRICS & RECOMPOSITION (MODULE 5) */}
        {activeTab === 'body_metrics' && (
          <div className="space-y-6 animate-in fade-in">
            <BodyMetricsTracker
              userProfile={userProfile}
              onUpdateWeight={handleUpdateWeightFromMetrics}
            />
          </div>
        )}
      </main>

      {/* Floating Rest Timer Widget */}
      {!isTimerOpen && activeTimerSeconds !== null && activeTimerSeconds > 0 && (
        <div
          onClick={() => setIsTimerOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-zinc-900 border border-lime-500/50 shadow-2xl shadow-lime-500/20 rounded-2xl px-4 py-2.5 flex items-center gap-3 cursor-pointer hover:scale-105 transition-all group"
        >
          <div className="w-8 h-8 rounded-xl bg-lime-500/20 flex items-center justify-center text-lime-400 animate-pulse">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
              組間休息
            </div>
            <div className="font-mono font-black text-lime-400 text-base leading-none">
              {Math.floor(activeTimerSeconds / 60)}:
              {(activeTimerSeconds % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>
      )}

      {/* Mode 1: Intake & Custom Routine Plan Formulation Modal */}
      <IntakeModal
        isOpen={isIntakeOpen}
        onClose={() => setIsIntakeOpen(false)}
        currentProfile={userProfile}
        onSaveProfile={handleSaveProfile}
        onApplyGeneratedRoutine={(split, _md) => {
          if (/push|pull|legs/i.test(split)) {
            setCurrentRoutine('Push');
          }
          setActiveTab('workout');
        }}
      />

      {/* Rest Timer Modal */}
      <RestTimerModal
        isOpen={isTimerOpen}
        onClose={() => setIsTimerOpen(false)}
        secondsRemaining={activeTimerSeconds}
        isRunning={isTimerRunning}
        onStart={(sec) => {
          setActiveTimerSeconds(sec);
          setIsTimerRunning(true);
        }}
        onPause={() => setIsTimerRunning(false)}
        onResume={() => setIsTimerRunning(true)}
        onReset={() => {
          setActiveTimerSeconds(0);
          setIsTimerRunning(false);
        }}
      />

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        sessions={sessions}
        onSelectSession={handleSelectPastSession}
        onDeleteSession={handleDeleteSession}
      />
    </div>
  );
}
