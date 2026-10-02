export interface ExerciseSet {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  completed: boolean;
  rpe?: number;
}

export interface ExerciseItem {
  id: string;
  name: string;
  isCompound: boolean;
  targetRepRange?: string; // e.g. "8-12" or "6-8"
  suggestedWeight?: number;
  rpeTarget?: number;
  sets: ExerciseSet[];
  notes?: string;
  sensationNotes?: string;
}

export type WorkoutRoutine = 'Push' | 'Pull' | 'Legs' | 'Upper' | 'Lower' | 'FullBody' | 'Custom';

export interface OverloadTarget {
  exerciseName: string;
  currentPerformance: string;
  nextTarget: string;
}

export interface LongitudinalComparison {
  exerciseName: string;
  lastPerformance: string;
  currentPerformance: string;
  volumeDiffKg: number;
  repsDiff: number;
  status: 'progress' | 'maintain' | 'drop' | 'baseline';
  statusLabel: string;
}

export interface MovementQualityDiagnosis {
  romAndTempoAnalysis: string; // 行程與速度
  jointAndCompensations: string; // 關節與代償預警
  fatigueDropOffAnalysis: string; // 疲勞衰退率
}

export interface MilestoneAchievement {
  id: string;
  type: 'weight_pr' | 'volume_pr' | 'strength_bw' | 'streak';
  title: string;
  description: string;
  badge: string; // emoji or icon
  achievedAt: string;
  exerciseName?: string;
  value?: string;
}

export interface MealLog {
  id: string;
  time: string;
  foodDescription: string;
  estimatedProtein: number;
  estimatedCalories: number;
  breakdown: string;
  replenishTip?: string;
}

export interface BodyMetricsLog {
  id: string;
  date: string;
  weightKg: number;
  waistCm?: number;
  chestCm?: number;
  armCm?: number;
  notes?: string;
  coachDiagnosis?: string;
}

export interface RoutinePlan {
  name: string;
  routineType: WorkoutRoutine;
  focusMuscles: string;
  exercises: ExerciseItem[];
}

export interface CustomPlanResponse {
  splitType: string;
  routines: RoutinePlan[];
  nutrition: {
    targetCalories: number;
    targetProteinGrams: number;
    proteinPerKg: number;
    nutritionGuidance: string;
  };
  markdownPlan: string;
}

export interface UserIntakeProfile {
  gender: 'male' | 'female' | 'other';
  age: number;
  height: number;
  weight: number;
  goal: 'hypertrophy' | 'fat_loss' | 'recomposition';
  trainingDaysPerWeek: number;
  sessionDurationMin: number;
  trainingLocation: 'gym' | 'home_dumbbells';
  experienceYears: string;
  currentWorkingWeights?: string;
  injuriesOrLimitations?: string;
  dailyCalories?: number;
  targetProtein: number;
  assignedSplit?: string;
  consecutiveTrainingWeeks?: number;
  isDeloadActive?: boolean;
  createdAt?: string;
}

export interface DailyWorkoutFeedback {
  markdown: string;
  comparisons?: LongitudinalComparison[];
  milestonesEarned: MilestoneAchievement[];
  dataSummary: string;
  qualityDiagnosis: MovementQualityDiagnosis;
  overloadTargets: OverloadTarget[];
  deloadAdvice?: string;
  recoveryCheck: {
    proteinStatus: string;
    hydrationTip: string;
    sleepRecoveryTip: string;
  };
  generatedAt: string;
  usedAi: boolean;
}

export interface WorkoutSession {
  id: string;
  date: string;
  routine: string;
  exercises: ExerciseItem[];
  sensations?: string;
  proteinGrams: number;
  waterMl?: number;
  sleepHours?: number;
  totalVolumeKg: number;
  milestonesEarned?: MilestoneAchievement[];
  isDeload?: boolean;
  coachFeedback?: DailyWorkoutFeedback;
}

export interface MealNutritionItem {
  category: '主菜' | '副菜' | '配菜' | '主食' | '飲品' | '其他';
  name: string;
  portionGrams?: string | number;
  proteinGrams: number;
  caloriesKcal: number;
}

export interface VisionMealAnalysisResult {
  success: boolean;
  step1_segmentation: {
    mainDish: {
      name: string;
      meatType: string;
      cookingMethod: string;
      estimatedGrams: string;
      description: string;
    };
    sideDishes: {
      eggOrBeanItem: string;
      description: string;
    };
    stapleAndVeg: {
      stapleType: string;
      staplePortion: string;
      vegOilLevel: string;
      description: string;
    };
  };
  step2_nutritionList: {
    items: MealNutritionItem[];
    totalProtein: number;
    totalCalories: number;
    totalCarbs?: number;
    totalFat?: number;
  };
  step3_proteinProgress: {
    targetProtein: number;
    mealContribution: number;
    currentProteinBefore: number;
    newTotalProtein: number;
    remainingProtein: number;
    replenishSuggestion: string;
  };
  step4_oilAndCookingWarning: {
    hasOilWarning: boolean;
    warningItems: string[];
    oilWarningText: string;
    calorieSurgeKcal: number;
    fatLossTip: string;
  };
  fullMarkdownReport?: string;
}



