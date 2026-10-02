import { ExerciseItem } from '../types/workout';

export const USER_BASELINE = {
  height: 171,
  weight: 80,
  targetProtein: 160,
  goal: '身體重組（增肌為主、減脂為輔）',
};

export const PPL_TEMPLATES: Record<'Push' | 'Pull' | 'Legs', ExerciseItem[]> = {
  Push: [
    {
      id: 'push-1',
      name: '槓鈴平躺臥推 (Barbell Bench Press)',
      isCompound: true,
      targetRepRange: '6-10',
      sets: [
        { id: 'p1-1', setNumber: 1, weightKg: 50, reps: 10, completed: true },
        { id: 'p1-2', setNumber: 2, weightKg: 50, reps: 10, completed: true },
        { id: 'p1-3', setNumber: 3, weightKg: 50, reps: 10, completed: true },
        { id: 'p1-4', setNumber: 4, weightKg: 50, reps: 9, completed: true },
      ],
      notes: '核心收緊，肩胛後收下壓，維持軌跡穩定',
    },
    {
      id: 'push-2',
      name: '上斜啞鈴臥推 (Incline DB Press)',
      isCompound: true,
      targetRepRange: '8-12',
      sets: [
        { id: 'p2-1', setNumber: 1, weightKg: 18, reps: 12, completed: true },
        { id: 'p2-2', setNumber: 2, weightKg: 18, reps: 11, completed: true },
        { id: 'p2-3', setNumber: 3, weightKg: 18, reps: 10, completed: true },
      ],
      notes: '椅背 30 度角度，集中上胸發力',
    },
    {
      id: 'push-3',
      name: '坐姿啞鈴肩推 (Seated DB OHP)',
      isCompound: true,
      targetRepRange: '8-10',
      sets: [
        { id: 'p3-1', setNumber: 1, weightKg: 16, reps: 10, completed: true },
        { id: 'p3-2', setNumber: 2, weightKg: 16, reps: 9, completed: true },
        { id: 'p3-3', setNumber: 3, weightKg: 16, reps: 8, completed: true },
      ],
      notes: '手肘微內收，推過頭頂不拱腰',
    },
    {
      id: 'push-4',
      name: '啞鈴側平舉 (Lateral Raise)',
      isCompound: false,
      targetRepRange: '12-15',
      sets: [
        { id: 'p4-1', setNumber: 1, weightKg: 8, reps: 15, completed: true },
        { id: 'p4-2', setNumber: 2, weightKg: 8, reps: 15, completed: true },
        { id: 'p4-3', setNumber: 3, weightKg: 8, reps: 14, completed: true },
      ],
      notes: '手肘微屈，向兩側抬起，頂峰短暫停頓',
    },
    {
      id: 'push-5',
      name: '滑輪繩索三頭下壓 (Rope Pushdown)',
      isCompound: false,
      targetRepRange: '10-15',
      sets: [
        { id: 'p5-1', setNumber: 1, weightKg: 20, reps: 12, completed: true },
        { id: 'p5-2', setNumber: 2, weightKg: 20, reps: 12, completed: true },
        { id: 'p5-3', setNumber: 3, weightKg: 20, reps: 11, completed: true },
      ],
      notes: '上手臂貼緊軀幹，底部外分繩索完全收縮',
    },
  ],
  Pull: [
    {
      id: 'pull-1',
      name: '滑輪下拉 (Lat Pulldown)',
      isCompound: true,
      targetRepRange: '8-12',
      sets: [
        { id: 'pl1-1', setNumber: 1, weightKg: 55, reps: 10, completed: true },
        { id: 'pl1-2', setNumber: 2, weightKg: 55, reps: 10, completed: true },
        { id: 'pl1-3', setNumber: 3, weightKg: 55, reps: 10, completed: true },
        { id: 'pl1-4', setNumber: 4, weightKg: 55, reps: 9, completed: true },
      ],
      notes: '軀幹微後仰，用手肘引導向下拉至上胸',
    },
    {
      id: 'pull-2',
      name: '槓鈴俯身划船 (Barbell Row)',
      isCompound: true,
      targetRepRange: '8-10',
      sets: [
        { id: 'pl2-1', setNumber: 1, weightKg: 50, reps: 10, completed: true },
        { id: 'pl2-2', setNumber: 2, weightKg: 50, reps: 10, completed: true },
        { id: 'pl2-3', setNumber: 3, weightKg: 50, reps: 9, completed: true },
      ],
      notes: '髖鉸鏈站穩，背部平直，拉向肚臍下緣',
    },
    {
      id: 'pull-3',
      name: '坐姿滑輪划船 (Seated Cable Row)',
      isCompound: true,
      targetRepRange: '10-12',
      sets: [
        { id: 'pl3-1', setNumber: 1, weightKg: 45, reps: 12, completed: true },
        { id: 'pl3-2', setNumber: 2, weightKg: 45, reps: 11, completed: true },
        { id: 'pl3-3', setNumber: 3, weightKg: 45, reps: 10, completed: true },
      ],
      notes: '完全伸展背闊肌，回拉時背肌強力擠壓',
    },
    {
      id: 'pull-4',
      name: '繩索面拉 (Face Pull)',
      isCompound: false,
      targetRepRange: '12-15',
      sets: [
        { id: 'pl4-1', setNumber: 1, weightKg: 17.5, reps: 15, completed: true },
        { id: 'pl4-2', setNumber: 2, weightKg: 17.5, reps: 15, completed: true },
        { id: 'pl4-3', setNumber: 3, weightKg: 17.5, reps: 14, completed: true },
      ],
      notes: '強化後三角肌與肩袖肌群，保護肩膀健康',
    },
    {
      id: 'pull-5',
      name: '啞鈴交替二頭彎舉 (DB Bicep Curl)',
      isCompound: false,
      targetRepRange: '10-12',
      sets: [
        { id: 'pl5-1', setNumber: 1, weightKg: 12, reps: 12, completed: true },
        { id: 'pl5-2', setNumber: 2, weightKg: 12, reps: 10, completed: true },
        { id: 'pl5-3', setNumber: 3, weightKg: 12, reps: 10, completed: true },
      ],
      notes: '身體不借力晃動，前臂頂峰外旋',
    },
  ],
  Legs: [
    {
      id: 'leg-1',
      name: '槓鈴背蹲舉 (Barbell Back Squat)',
      isCompound: true,
      targetRepRange: '6-10',
      sets: [
        { id: 'lg1-1', setNumber: 1, weightKg: 70, reps: 10, completed: true },
        { id: 'lg1-2', setNumber: 2, weightKg: 70, reps: 10, completed: true },
        { id: 'lg1-3', setNumber: 3, weightKg: 70, reps: 9, completed: true },
        { id: 'lg1-4', setNumber: 4, weightKg: 70, reps: 8, completed: true },
      ],
      notes: '深吸氣憋住腹壓，膝蓋對齊第二腳趾，蹲至大腿低於水平',
    },
    {
      id: 'leg-2',
      name: '羅馬尼亞硬舉 (Romanian Deadlift RDL)',
      isCompound: true,
      targetRepRange: '8-10',
      sets: [
        { id: 'lg2-1', setNumber: 1, weightKg: 65, reps: 10, completed: true },
        { id: 'lg2-2', setNumber: 2, weightKg: 65, reps: 10, completed: true },
        { id: 'lg2-3', setNumber: 3, weightKg: 65, reps: 9, completed: true },
      ],
      notes: '臀部向後推，膝微曲，感受腿後側與臀大肌拉伸',
    },
    {
      id: 'leg-3',
      name: '45度機械腿推 (Leg Press)',
      isCompound: true,
      targetRepRange: '10-12',
      sets: [
        { id: 'lg3-1', setNumber: 1, weightKg: 120, reps: 12, completed: true },
        { id: 'lg3-2', setNumber: 2, weightKg: 120, reps: 12, completed: true },
        { id: 'lg3-3', setNumber: 3, weightKg: 120, reps: 11, completed: true },
      ],
      notes: '雙腳與肩同寬，下放至膝蓋近胸，推起不鎖死膝蓋',
    },
    {
      id: 'leg-4',
      name: '俯臥/坐姿腿後勾 (Leg Curl)',
      isCompound: false,
      targetRepRange: '10-15',
      sets: [
        { id: 'lg4-1', setNumber: 1, weightKg: 35, reps: 12, completed: true },
        { id: 'lg4-2', setNumber: 2, weightKg: 35, reps: 12, completed: true },
        { id: 'lg4-3', setNumber: 3, weightKg: 35, reps: 11, completed: true },
      ],
      notes: '骨盆固定貼平，離心 2 秒慢放',
    },
    {
      id: 'leg-5',
      name: '站姿/坐姿提踵 (Calf Raise)',
      isCompound: false,
      targetRepRange: '15-20',
      sets: [
        { id: 'lg5-1', setNumber: 1, weightKg: 40, reps: 18, completed: true },
        { id: 'lg5-2', setNumber: 2, weightKg: 40, reps: 16, completed: true },
        { id: 'lg5-3', setNumber: 3, weightKg: 40, reps: 15, completed: true },
      ],
      notes: '腳跟完全下沉拉伸，頂峰踮腳停留 1 秒',
    },
  ],
};

export const COMMON_PROTEIN_FOODS = [
  { name: '乳清蛋白 1 份', grams: 26, icon: '🥛' },
  { name: '即食雞胸肉 1 包', grams: 23, icon: '🍗' },
  { name: '無糖高纖豆漿 400ml', grams: 14, icon: '🫘' },
  { name: '茶葉蛋/水煮蛋 2 顆', grams: 14, icon: '🥚' },
  { name: '牛排/牛肉 150g', grams: 32, icon: '🥩' },
  { name: '希臘式優格 200g', grams: 18, icon: '🥣' },
  { name: '鮭魚/鯛魚片 150g', grams: 30, icon: '🐟' },
];
