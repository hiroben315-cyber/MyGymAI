import { ExerciseItem, ExerciseSet, OverloadTarget, LongitudinalComparison, WorkoutSession } from '../types/workout';

export function calculate1RM(weightKg: number, reps: number): number {
  if (weightKg <= 0 || reps <= 0) return 0;
  if (reps === 1) return weightKg;
  // Epley formula
  const oneRm = weightKg * (1 + reps / 30);
  return Math.round(oneRm * 10) / 10;
}

export function calculateExerciseVolume(exercise: ExerciseItem): number {
  return exercise.sets.reduce((sum, s) => {
    return sum + (s.completed !== false ? s.weightKg * s.reps : 0);
  }, 0);
}

export function calculateTotalWorkoutVolume(exercises: ExerciseItem[]): number {
  return exercises.reduce((sum, ex) => sum + calculateExerciseVolume(ex), 0);
}

export function normalizeExerciseName(raw: string): string {
  const t = raw.trim();
  if (/^槓鈴.*臥推|^臥推|bench\s*press/i.test(t)) return '槓鈴平躺臥推';
  if (/^上斜.*臥推|incline/i.test(t)) return '上斜啞鈴臥推';
  if (/^坐姿.*肩推|肩推|ohp/i.test(t)) return '坐姿啞鈴肩推';
  if (/^側平舉|平舉|lateral/i.test(t)) return '啞鈴側平舉';
  if (/^三頭|下壓|pushdown/i.test(t)) return '滑輪繩索三頭下壓';
  if (/^下拉|lat\s*pulldown/i.test(t)) return '滑輪下拉';
  if (/^划船|row/i.test(t)) return '槓鈴俯身划船';
  if (/^坐姿.*划船|cable\s*row/i.test(t)) return '坐姿滑輪划船';
  if (/^面拉|face\s*pull/i.test(t)) return '繩索面拉';
  if (/^二頭|彎舉|curl/i.test(t)) return '啞鈴二頭彎舉';
  if (/^深蹲|squat/i.test(t)) return '槓鈴背蹲舉';
  if (/^腿推|leg\s*press/i.test(t)) return '45度機械腿推';
  if (/^rdl|硬舉|羅馬尼亞/i.test(t)) return '羅馬尼亞硬舉 (RDL)';
  if (/^腿後勾|leg\s*curl/i.test(t)) return '俯臥/坐姿腿後勾';
  if (/^提踵|calf/i.test(t)) return '站姿/坐姿提踵';
  // Strip parentheses content like (Barbell Bench Press)
  return t.replace(/\(.*?\)/g, '').trim();
}

/**
 * Find the most recent performance of an exercise from past sessions
 */
export function findPreviousExercisePerformance(
  exerciseName: string,
  previousSessions: WorkoutSession[]
): {
  exercise: ExerciseItem | null;
  perfString: string;
  totalVolume: number;
  totalReps: number;
  maxWeight: number;
  date: string;
} | null {
  if (!Array.isArray(previousSessions) || previousSessions.length === 0) return null;

  const targetNorm = normalizeExerciseName(exerciseName);

  for (const session of previousSessions) {
    const matched = (session.exercises || []).find((ex) => {
      const pastNorm = normalizeExerciseName(ex.name);
      return (
        pastNorm === targetNorm ||
        ex.name === exerciseName ||
        pastNorm.includes(targetNorm) ||
        targetNorm.includes(pastNorm)
      );
    });

    if (matched) {
      const validSets = (matched.sets || []).filter((s) => s.weightKg > 0 && s.reps > 0);
      if (validSets.length > 0) {
        const totalVolume = validSets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
        const totalReps = validSets.reduce((sum, s) => sum + s.reps, 0);
        const maxWeight = Math.max(...validSets.map((s) => s.weightKg));
        const allSameWeight = validSets.every((s) => s.weightKg === maxWeight);

        let perfString = '';
        if (allSameWeight) {
          perfString = `${maxWeight}kg (${validSets.map((s) => s.reps).join(', ')})`;
        } else {
          perfString = validSets.map((s) => `${s.weightKg}k×${s.reps}`).join(', ');
        }

        return {
          exercise: matched,
          perfString,
          totalVolume,
          totalReps,
          maxWeight,
          date: session.date,
        };
      }
    }
  }

  return null;
}

/**
 * 縱向歷史比對分析引擎
 */
export function computeLongitudinalComparisons(
  currentExercises: ExerciseItem[],
  previousSessions: WorkoutSession[]
): {
  comparisons: LongitudinalComparison[];
  tableMd: string;
} {
  const comparisons: LongitudinalComparison[] = [];

  currentExercises.forEach((ex) => {
    const validSets = (ex.sets || []).filter((s) => s.weightKg > 0 && s.reps > 0);
    if (validSets.length === 0) return;

    const currentVol = validSets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
    const currentRepsTotal = validSets.reduce((sum, s) => sum + s.reps, 0);
    const currentMaxWeight = Math.max(...validSets.map((s) => s.weightKg));
    const allSameWeight = validSets.every((s) => s.weightKg === currentMaxWeight);

    let currentPerfStr = '';
    if (allSameWeight) {
      currentPerfStr = `${currentMaxWeight}kg (${validSets.map((s) => s.reps).join(', ')})`;
    } else {
      currentPerfStr = validSets.map((s) => `${s.weightKg}k×${s.reps}`).join(', ');
    }

    const past = findPreviousExercisePerformance(ex.name, previousSessions);

    if (past) {
      const volDiff = currentVol - past.totalVolume;
      const repsDiff = currentRepsTotal - past.totalReps;

      let status: 'progress' | 'maintain' | 'drop' = 'maintain';
      let statusLabel = '🟡 持平 (Maintain)';

      if (currentMaxWeight > past.maxWeight) {
        status = 'progress';
        statusLabel = '🟢 進步 (Weight PR)';
      } else if (volDiff > 0 || repsDiff > 0) {
        status = 'progress';
        statusLabel = '🟢 進步 (Volume PR)';
      } else if (volDiff < 0 || repsDiff < 0) {
        status = 'drop';
        statusLabel = '🔴 疲勞/衰退';
      }

      comparisons.push({
        exerciseName: ex.name,
        lastPerformance: past.perfString,
        currentPerformance: currentPerfStr,
        volumeDiffKg: volDiff,
        repsDiff,
        status,
        statusLabel,
      });
    } else {
      comparisons.push({
        exerciseName: ex.name,
        lastPerformance: '首度記錄 (Baseline)',
        currentPerformance: currentPerfStr,
        volumeDiffKg: 0,
        repsDiff: 0,
        status: 'baseline',
        statusLabel: '⚪ 建立基準',
      });
    }
  });

  // Build Markdown table formatted as specified:
  // | 動作名稱 | 上次表現 (重量 × 次數) | 本次表現 (重量 × 次數) | 總容量變化 | 狀態判定 |
  let tableMd = `| 動作名稱 | 上次表現 (重量 × 次數) | 本次表現 (重量 × 次數) | 總容量變化 | 狀態判定 |\n| :--- | :--- | :--- | :--- | :--- |\n`;
  comparisons.forEach((c) => {
    let diffStr = '-';
    if (c.status !== 'baseline') {
      const volSign = c.volumeDiffKg >= 0 ? `+${c.volumeDiffKg}` : `${c.volumeDiffKg}`;
      const repSign = c.repsDiff >= 0 ? `+${c.repsDiff}` : `${c.repsDiff}`;
      diffStr = `${volSign} kg (${repSign}下)`;
    }
    tableMd += `| **${c.exerciseName}** | ${c.lastPerformance} | ${c.currentPerformance} | ${diffStr} | ${c.statusLabel} |\n`;
  });

  return { comparisons, tableMd };
}

export function generateLocalProgressiveOverload(exercises: ExerciseItem[]): OverloadTarget[] {
  // Focus on top 2-3 compound movements
  const compoundOrMain = exercises
    .filter(
      (e) =>
        e.isCompound ||
        /推|蹲|拉|划船|硬舉|press|squat|deadlift|pulldown|row|dip/i.test(e.name)
    )
    .slice(0, 3);

  const list = compoundOrMain.length > 0 ? compoundOrMain : exercises.slice(0, 2);

  return list.map((ex) => {
    const validSets = ex.sets.filter((s) => s.weightKg > 0 && s.reps > 0);
    if (validSets.length === 0) {
      return {
        exerciseName: ex.name,
        currentPerformance: '無有效組數記錄',
        nextTarget: `${ex.name} 下次建議先設定 3 組 8-10 下確立基礎力量指標。`,
      };
    }

    const maxWeight = Math.max(...validSets.map((s) => s.weightKg));
    const setsAtMax = validSets.filter((s) => s.weightKg === maxWeight);
    const avgReps = setsAtMax.reduce((acc, s) => acc + s.reps, 0) / setsAtMax.length;
    const isLower = /蹲|腿|硬舉|leg|squat|deadlift/i.test(ex.name);
    const increment = isLower ? 5 : 2.5;

    let targetAdvice = '';
    if (avgReps >= 10) {
      targetAdvice = `下次第一組嘗試加重 ${increment}kg 至 ${(maxWeight + increment).toFixed(1)}kg（挑戰 8 下）！`;
    } else if (avgReps >= 8) {
      targetAdvice = `下次維持 ${maxWeight}kg，組間休息拉長至 120 秒，衝刺每組補滿 10 下。`;
    } else {
      targetAdvice = `下次重量維持不變，組間休息拉長至 120 秒，專注於離心 2 秒慢放控制與行程飽滿。`;
    }

    return {
      exerciseName: ex.name,
      currentPerformance: `${maxWeight}kg × ${validSets.map((s) => s.reps).join('-')} 下`,
      nextTarget: targetAdvice,
    };
  });
}

export interface ExerciseHistoryPoint {
  date: string;
  displayDate: string;
  exerciseName: string;
  maxWeight: number;
  totalVolume: number;
  totalReps: number;
  setsCount: number;
  estimated1RM: number;
  setsDetail: string;
  isToday?: boolean;
}

/**
 * 提取特定動作在所有歷史會話中的演進數列（依日期遞增排序）
 */
export function extractExerciseHistorySeries(
  exerciseName: string,
  sessions: WorkoutSession[],
  currentExercise?: ExerciseItem | null,
  includeCurrent: boolean = true
): ExerciseHistoryPoint[] {
  const targetNorm = normalizeExerciseName(exerciseName);
  const points: ExerciseHistoryPoint[] = [];

  // Sort sessions chronologically ascending
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedSessions.forEach((session) => {
    const matched = (session.exercises || []).find((ex) => {
      const pastNorm = normalizeExerciseName(ex.name);
      return (
        pastNorm === targetNorm ||
        ex.name === exerciseName ||
        pastNorm.includes(targetNorm) ||
        targetNorm.includes(pastNorm)
      );
    });

    if (matched) {
      const validSets = (matched.sets || []).filter((s) => s.weightKg > 0 && s.reps > 0);
      if (validSets.length > 0) {
        const totalVolume = validSets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
        const totalReps = validSets.reduce((sum, s) => sum + s.reps, 0);
        const maxWeight = Math.max(...validSets.map((s) => s.weightKg));
        const estimated1RM = Math.max(...validSets.map((s) => calculate1RM(s.weightKg, s.reps)));
        const allSame = validSets.every((s) => s.weightKg === maxWeight);

        let setsDetail = '';
        if (allSame) {
          setsDetail = `${maxWeight}kg (${validSets.map((s) => s.reps).join(', ')})`;
        } else {
          setsDetail = validSets.map((s) => `${s.weightKg}k×${s.reps}`).join(', ');
        }

        const dateParts = session.date.split('-');
        const displayDate = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]}` : session.date;

        points.push({
          date: session.date,
          displayDate,
          exerciseName: matched.name,
          maxWeight,
          totalVolume,
          totalReps,
          setsCount: validSets.length,
          estimated1RM,
          setsDetail,
          isToday: false,
        });
      }
    }
  });

  // Append current live workout sets if requested
  if (includeCurrent && currentExercise) {
    const currentNorm = normalizeExerciseName(currentExercise.name);
    if (
      currentNorm === targetNorm ||
      currentExercise.name === exerciseName ||
      currentNorm.includes(targetNorm) ||
      targetNorm.includes(currentNorm)
    ) {
      const validSets = (currentExercise.sets || []).filter((s) => s.weightKg > 0 && s.reps > 0);
      if (validSets.length > 0) {
        const totalVolume = validSets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
        const totalReps = validSets.reduce((sum, s) => sum + s.reps, 0);
        const maxWeight = Math.max(...validSets.map((s) => s.weightKg));
        const estimated1RM = Math.max(...validSets.map((s) => calculate1RM(s.weightKg, s.reps)));
        const allSame = validSets.every((s) => s.weightKg === maxWeight);

        let setsDetail = '';
        if (allSame) {
          setsDetail = `${maxWeight}kg (${validSets.map((s) => s.reps).join(', ')})`;
        } else {
          setsDetail = validSets.map((s) => `${s.weightKg}k×${s.reps}`).join(', ');
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const dateParts = todayStr.split('-');
        const displayDate = dateParts.length === 3 ? `${dateParts[1]}/${dateParts[2]} (今日)` : '今日';

        points.push({
          date: todayStr,
          displayDate,
          exerciseName: currentExercise.name,
          maxWeight,
          totalVolume,
          totalReps,
          setsCount: validSets.length,
          estimated1RM,
          setsDetail,
          isToday: true,
        });
      }
    }
  }

  return points;
}

export interface FatigueSetDataPoint {
  setNumber: number;
  label: string;
  weightKg: number;
  reps: number;
  volume: number;
  retentionPct: number; // 體力保留率 %
  dropOffPct: number; // 疲勞衰退率 %
  isPredicted: boolean;
  status: 'optimal' | 'warning' | 'critical';
  statusText: string;
}

export interface FatigueAnalysisResult {
  exerciseName: string;
  isCompound: boolean;
  currentRestSeconds: number;
  averageDropOffPct: number;
  maxDropOffPct: number;
  points: FatigueSetDataPoint[];
  restDiagnosis: {
    severity: 'optimal' | 'needs_extension' | 'critical_rest_needed';
    recommendedRestSeconds: number;
    title: string;
    description: string;
    rationale: string;
  };
}

/**
 * 體力衰退率與組間休息診斷分析模型
 */
export function computeFatigueDecayAnalysis(
  exercise: ExerciseItem,
  currentRestSeconds: number = 90
): FatigueAnalysisResult {
  const isCompound =
    exercise.isCompound ||
    /推|蹲|拉|划船|硬舉|press|squat|deadlift|pulldown|row|dip/i.test(exercise.name);

  const validSets = (exercise.sets || []).filter((s) => s.weightKg > 0 && s.reps > 0);

  // If no sets, provide a default 4-set baseline demonstration
  const baseSets =
    validSets.length > 0
      ? validSets
      : [
          { setNumber: 1, weightKg: 50, reps: 10 },
          { setNumber: 2, weightKg: 50, reps: 10 },
          { setNumber: 3, weightKg: 50, reps: 9 },
          { setNumber: 4, weightKg: 50, reps: 8 },
        ];

  const firstSetVolume = baseSets[0].weightKg * baseSets[0].reps;
  const points: FatigueSetDataPoint[] = [];

  baseSets.forEach((s, idx) => {
    const vol = s.weightKg * s.reps;
    const retention = firstSetVolume > 0 ? Math.round((vol / firstSetVolume) * 100) : 100;
    const drop = Math.max(0, 100 - retention);

    let status: 'optimal' | 'warning' | 'critical' = 'optimal';
    let statusText = '🟢 最佳肌肥大維持（0-15%）';

    if (drop > 20) {
      status = 'critical';
      statusText = '🔴 過度衰退（代償風險高）';
    } else if (drop > 15) {
      status = 'warning';
      statusText = '🟡 疲勞累積臨界（15-20%）';
    }

    points.push({
      setNumber: s.setNumber || idx + 1,
      label: `第 ${s.setNumber || idx + 1} 組`,
      weightKg: s.weightKg,
      reps: s.reps,
      volume: vol,
      retentionPct: retention,
      dropOffPct: drop,
      isPredicted: false,
      status,
      statusText,
    });
  });

  // Calculate actual dropoffs
  const actualDrops = points.map((p) => p.dropOffPct);
  const maxDropOffPct = Math.max(...actualDrops);
  const averageDropOffPct =
    actualDrops.length > 1
      ? Math.round(
          actualDrops.slice(1).reduce((sum, d) => sum + d, 0) / (actualDrops.length - 1)
        )
      : 0;

  // Predict next 2 sets (e.g. Set N+1 and Set N+2) based on current rest interval
  const lastSet = points[points.length - 1];
  const lastWeight = lastSet.weightKg;
  const lastReps = lastSet.reps;

  // Decay acceleration factor depends on rest time:
  // < 90s: heavy metabolic accumulation, -12% per extra set
  // 90-120s: -7% per extra set
  // 120-180s: -3% per extra set
  const decayStepPct =
    currentRestSeconds < 90 ? 12 : currentRestSeconds < 120 ? 7 : 3;

  for (let step = 1; step <= 2; step++) {
    const nextSetNum = points.length + 1;
    const cumulativeDrop = Math.min(60, lastSet.dropOffPct + decayStepPct * step);
    const predictedRetention = Math.max(40, 100 - cumulativeDrop);
    const predictedVol = Math.round((firstSetVolume * predictedRetention) / 100);
    const predictedReps = Math.max(3, Math.round(predictedVol / lastWeight));

    let status: 'optimal' | 'warning' | 'critical' = 'optimal';
    let statusText = '🟢 預估維持可控';
    if (cumulativeDrop > 20) {
      status = 'critical';
      statusText = '🔴 預估向心力竭失速';
    } else if (cumulativeDrop > 15) {
      status = 'warning';
      statusText = '🟡 預估需強烈意志維持';
    }

    points.push({
      setNumber: nextSetNum,
      label: `預測第 ${nextSetNum} 組`,
      weightKg: lastWeight,
      reps: predictedReps,
      volume: lastWeight * predictedReps,
      retentionPct: predictedRetention,
      dropOffPct: cumulativeDrop,
      isPredicted: true,
      status,
      statusText,
    });
  }

  // Diagnostic logic based on exercise type and drop off
  let severity: 'optimal' | 'needs_extension' | 'critical_rest_needed' = 'optimal';
  let recommendedRest = isCompound ? 120 : 90;
  let title = '組間休息充分，體力衰退率處於黃金區間';
  let description = `目前各組容量跌幅均控制在 15% 內，ATP-CP 磷酸原系統重置良好。`;
  let rationale = `肌肥大研究顯示，組間跌幅控制在 10-15% 能在維持機械張力（Mechanical Tension）的同時激發代謝壓力。`;

  if (maxDropOffPct >= 20 || (currentRestSeconds < 120 && isCompound && maxDropOffPct >= 15)) {
    severity = maxDropOffPct >= 25 ? 'critical_rest_needed' : 'needs_extension';
    recommendedRest = isCompound ? 150 : 120;
    if (maxDropOffPct >= 25 && isCompound) {
      recommendedRest = 180;
    }

    title =
      maxDropOffPct >= 25
        ? '⚠️ 體力劇烈衰退警告：組間休息嚴重不足！'
        : '⚡ 建議拉長組間休息時間（延長至 120-150 秒）';

    description = `檢測到第 3-4 組容量跌幅達 ${maxDropOffPct}%（超出 15% 安全閾值）。目前設定的 ${currentRestSeconds} 秒休息時間不足以讓磷酸肌酸（PCr）充分再合成。`;

    rationale = `複合動作（如${exercise.name}）需動用大量高閾值運動單元。當組間休息短於 2 分鐘時，中樞神經（CNS）疲勞與細胞內 H+ 離子堆積會迫使後續組數提早力竭，甚至引發聳肩、圓背等代償動作。建議將休息時間拉長至 ${recommendedRest} 秒以守住容量品質！`;
  }

  return {
    exerciseName: exercise.name,
    isCompound,
    currentRestSeconds,
    averageDropOffPct,
    maxDropOffPct,
    points,
    restDiagnosis: {
      severity,
      recommendedRestSeconds: recommendedRest,
      title,
      description,
      rationale,
    },
  };
}
