import { WorkoutSession, UserIntakeProfile } from '../types/workout';

const STORAGE_KEYS = {
  SESSIONS: 'ppl_hyperload_sessions_v3',
  USER_PROFILE: 'ppl_hyperload_profile_v2',
  CURRENT_DRAFT: 'ppl_hyperload_draft_v2',
  TODAY_PROTEIN: 'ppl_hyperload_protein_today_v2',
};

export const DEFAULT_INTAKE_PROFILE: UserIntakeProfile = {
  gender: 'male',
  age: 28,
  height: 171,
  weight: 80,
  goal: 'recomposition',
  trainingDaysPerWeek: 4,
  sessionDurationMin: 60,
  trainingLocation: 'gym',
  experienceYears: '1-3年',
  currentWorkingWeights: '臥推 50kg 10下、滑輪下拉 55kg 10下、深蹲 70kg 10下',
  injuriesOrLimitations: '無顯著舊傷，深蹲下背偶爾緊繃',
  targetProtein: 160,
  dailyCalories: 2150,
  assignedSplit: 'PPL (Push-Pull-Legs) / Upper-Lower',
};

export function loadUserProfile(): UserIntakeProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_INTAKE_PROFILE;
}

export function saveUserProfile(profile: UserIntakeProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error(e);
  }
}

export function loadSessions(): WorkoutSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error(e);
  }

  // Seed sample progressive sessions so the Recharts trend has realistic historical depth
  const now = Date.now();
  const dayMs = 86400000;

  const seedSessions: WorkoutSession[] = [
    {
      id: 'seed-session-1',
      date: new Date(now - dayMs * 16).toISOString().split('T')[0],
      routine: 'Push',
      proteinGrams: 148,
      totalVolumeKg: 2890,
      exercises: [
        {
          id: 's1-ex-1',
          name: '槓鈴平躺臥推 (Barbell Bench Press)',
          isCompound: true,
          sets: [
            { id: 's1-1', setNumber: 1, weightKg: 45, reps: 10, completed: true },
            { id: 's1-2', setNumber: 2, weightKg: 45, reps: 10, completed: true },
            { id: 's1-3', setNumber: 3, weightKg: 45, reps: 9, completed: true },
            { id: 's1-4', setNumber: 4, weightKg: 45, reps: 8, completed: true },
          ],
        },
        {
          id: 's1-ex-2',
          name: '上斜啞鈴臥推 (Incline DB Press)',
          isCompound: true,
          sets: [
            { id: 's1-5', setNumber: 1, weightKg: 16, reps: 10, completed: true },
            { id: 's1-6', setNumber: 2, weightKg: 16, reps: 10, completed: true },
            { id: 's1-7', setNumber: 3, weightKg: 16, reps: 9, completed: true },
          ],
        },
        {
          id: 's1-ex-3',
          name: '坐姿啞鈴肩推 (Seated DB OHP)',
          isCompound: true,
          sets: [
            { id: 's1-8', setNumber: 1, weightKg: 14, reps: 10, completed: true },
            { id: 's1-9', setNumber: 2, weightKg: 14, reps: 9, completed: true },
          ],
        },
      ],
    },
    {
      id: 'seed-session-2',
      date: new Date(now - dayMs * 11).toISOString().split('T')[0],
      routine: 'Push',
      proteinGrams: 152,
      totalVolumeKg: 3080,
      exercises: [
        {
          id: 's2-ex-1',
          name: '槓鈴平躺臥推 (Barbell Bench Press)',
          isCompound: true,
          sets: [
            { id: 's2-1', setNumber: 1, weightKg: 47.5, reps: 10, completed: true },
            { id: 's2-2', setNumber: 2, weightKg: 47.5, reps: 9, completed: true },
            { id: 's2-3', setNumber: 3, weightKg: 47.5, reps: 9, completed: true },
            { id: 's2-4', setNumber: 4, weightKg: 47.5, reps: 8, completed: true },
          ],
        },
        {
          id: 's2-ex-2',
          name: '上斜啞鈴臥推 (Incline DB Press)',
          isCompound: true,
          sets: [
            { id: 's2-5', setNumber: 1, weightKg: 18, reps: 10, completed: true },
            { id: 's2-6', setNumber: 2, weightKg: 18, reps: 9, completed: true },
            { id: 's2-7', setNumber: 3, weightKg: 18, reps: 8, completed: true },
          ],
        },
        {
          id: 's2-ex-3',
          name: '坐姿啞鈴肩推 (Seated DB OHP)',
          isCompound: true,
          sets: [
            { id: 's2-8', setNumber: 1, weightKg: 16, reps: 8, completed: true },
            { id: 's2-9', setNumber: 2, weightKg: 16, reps: 8, completed: true },
          ],
        },
      ],
    },
    {
      id: 'seed-session-3',
      date: new Date(now - dayMs * 5).toISOString().split('T')[0],
      routine: 'Push',
      proteinGrams: 158,
      totalVolumeKg: 3260,
      exercises: [
        {
          id: 's3-ex-1',
          name: '槓鈴平躺臥推 (Barbell Bench Press)',
          isCompound: true,
          sets: [
            { id: 's3-1', setNumber: 1, weightKg: 50, reps: 10, completed: true },
            { id: 's3-2', setNumber: 2, weightKg: 50, reps: 10, completed: true },
            { id: 's3-3', setNumber: 3, weightKg: 50, reps: 9, completed: true },
            { id: 's3-4', setNumber: 4, weightKg: 50, reps: 8, completed: true },
          ],
        },
        {
          id: 's3-ex-2',
          name: '上斜啞鈴臥推 (Incline DB Press)',
          isCompound: true,
          sets: [
            { id: 's3-5', setNumber: 1, weightKg: 18, reps: 10, completed: true },
            { id: 's3-6', setNumber: 2, weightKg: 18, reps: 10, completed: true },
            { id: 's3-7', setNumber: 3, weightKg: 18, reps: 9, completed: true },
          ],
        },
        {
          id: 's3-ex-3',
          name: '坐姿啞鈴肩推 (Seated DB OHP)',
          isCompound: true,
          sets: [
            { id: 's3-8', setNumber: 1, weightKg: 16, reps: 9, completed: true },
            { id: 's3-9', setNumber: 2, weightKg: 16, reps: 8, completed: true },
          ],
        },
      ],
    },
  ];

  saveSessions(seedSessions);
  return seedSessions;
}

export function saveSessions(sessions: WorkoutSession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error(e);
  }
}

export function saveSession(newSession: WorkoutSession): void {
  try {
    const existing = loadSessions();
    const updated = [newSession, ...existing];
    saveSessions(updated);
  } catch (e) {
    console.error(e);
  }
}

export function loadTodayProtein(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TODAY_PROTEIN);
    if (raw) {
      const parsed = JSON.parse(raw);
      const today = new Date().toISOString().split('T')[0];
      if (parsed.date === today) {
        return parsed.grams;
      }
    }
  } catch (e) {
    console.error(e);
  }
  return 95; // Default active baseline for today
}

export function saveTodayProtein(grams: number): void {
  try {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(
      STORAGE_KEYS.TODAY_PROTEIN,
      JSON.stringify({ date: today, grams })
    );
  } catch (e) {
    console.error(e);
  }
}
