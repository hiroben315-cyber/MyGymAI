import React, { useState, useRef } from 'react';
import {
  Utensils,
  Camera,
  Upload,
  Sparkles,
  CheckCircle2,
  ShoppingBag,
  AlertTriangle,
  X,
  Droplets,
  Flame,
  ArrowRight,
  Eye,
  Info,
} from 'lucide-react';
import { VisionMealAnalysisResult } from '../types/workout';

interface MealEstimatorProps {
  currentProtein: number;
  targetProtein: number;
  onAddProtein: (grams: number) => void;
}

export const MealEstimator: React.FC<MealEstimatorProps> = ({
  currentProtein,
  targetProtein,
  onAddProtein,
}) => {
  const [mealText, setMealText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<VisionMealAnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset sample meals (including image descriptions) for instant demonstration
  const samplePresets = [
    {
      title: '經典香煎雞腿便當',
      text: '香煎去皮大雞腿便當，配菜有滷蛋半顆、炒豆乾、炒高麗菜，吃 3/4 碗白飯',
      placeholderBg: 'from-amber-600 to-orange-700',
      icon: '🍗',
    },
    {
      title: '超商增肌低脂套餐',
      text: '7-11 舒肥義式風味雞胸肉 1 塊 + 無糖高纖豆漿 400ml + 茶葉蛋 2 顆 + 烤地瓜 1 個',
      placeholderBg: 'from-emerald-600 to-teal-700',
      icon: '🥗',
    },
    {
      title: '炙燒牛肩排定食',
      text: '炙燒牛肩排約 180g + 煎荷包蛋 1 顆 + 雙色溫蔬菜 + 白飯半碗',
      placeholderBg: 'from-red-600 to-rose-800',
      icon: '🥩',
    },
    {
      title: '日式鹽烤鮭魚排定食',
      text: '鹽烤挪威鮭魚排約 140g + 嫩豆腐半盒 + 涼拌毛豆 + 味噌湯',
      placeholderBg: 'from-cyan-600 to-blue-700',
      icon: '🐟',
    },
  ];

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImageBase64(result);
      setImagePreviewUrl(result);
      // Auto-trigger multimodal analysis upon photo upload
      triggerAnalysis(result, mealText);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setImageBase64(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerAnalysis = async (imgData?: string | null, textNote?: string) => {
    const imageToSend = imgData !== undefined ? imgData : imageBase64;
    const textToSend = textNote !== undefined ? textNote : mealText;

    if (!imageToSend && !textToSend.trim()) return;

    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/nutrition/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageToSend,
          mealText: textToSend,
          currentProteinToday: currentProtein,
          targetProtein,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAnalysisResult(data);
      }
    } catch (e) {
      console.error('Error analyzing meal:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyToTracker = () => {
    if (analysisResult) {
      const proteinToAdd =
        analysisResult.step2_nutritionList?.totalProtein ||
        analysisResult.step3_proteinProgress?.mealContribution ||
        0;

      if (proteinToAdd > 0) {
        onAddProtein(proteinToAdd);
        // Clear or keep result
        handleClearImage();
        setMealText('');
      }
    }
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      {/* Module Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm shadow-amber-500/10">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-zinc-100 flex items-center gap-2">
              視覺外食多模態營養即時估算
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                多模態影像拆解
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              上傳餐點照片：即時視覺食材分割、蛋白質清單、160g 進度追蹤與油脂盲點預警
            </p>
          </div>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 px-3.5 py-1.5 rounded-2xl text-right">
          <span className="text-[10px] text-zinc-400 block font-semibold">今日蛋白質累計</span>
          <span className="font-mono text-xs sm:text-sm font-black text-amber-300">
            {currentProtein}g / {targetProtein}g
          </span>
        </div>
      </div>

      {/* Multimodal Upload & Input Zone */}
      <div className="space-y-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* If image is selected, show preview card */}
        {imagePreviewUrl ? (
          <div className="relative rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-950 p-2.5 flex items-center gap-4">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-750 relative">
              <img
                src={imagePreviewUrl}
                alt="Meal uploaded"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-1 left-1 bg-zinc-900/80 backdrop-blur-sm text-[10px] text-lime-400 px-1.5 py-0.2 rounded font-mono font-bold flex items-center gap-1">
                <Eye className="w-3 h-3" /> 已鎖定
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  已上傳餐點照片（多模態視覺已辨識）
                </span>
                <button
                  onClick={handleClearImage}
                  className="p-1 text-zinc-400 hover:text-zinc-100 rounded-lg hover:bg-zinc-800 transition-colors"
                  title="移除照片"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={mealText}
                  onChange={(e) => setMealText(e.target.value)}
                  placeholder="可補充備註（如：飯吃半碗、去皮、無糖豆漿）..."
                  className="flex-1 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => triggerAnalysis(imageBase64, mealText)}
                  disabled={isAnalyzing}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs rounded-xl flex items-center gap-1.5 disabled:opacity-40 transition-all shadow-md shadow-amber-500/10"
                >
                  {isAnalyzing ? (
                    '分析中...'
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      重新估算
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Upload trigger dropzone */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-zinc-750 hover:border-amber-500/70 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center gap-2.5 bg-zinc-950/60 hover:bg-zinc-950 transition-all text-center cursor-pointer"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform shadow-md shadow-amber-500/10">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-bold text-zinc-200 block group-hover:text-amber-300 transition-colors">
                  點擊拍照或上傳餐點照片
                </span>
                <span className="text-[11px] text-zinc-500 block mt-0.5">
                  支援相機拍攝、手機圖庫或便當外食相片
                </span>
              </div>
            </button>

            {/* Quick Text Input fallback */}
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4 flex flex-col justify-between gap-2.5">
              <div>
                <span className="text-xs font-bold text-zinc-300 block mb-1">
                  或輸入文字備忘估算：
                </span>
                <input
                  type="text"
                  value={mealText}
                  onChange={(e) => setMealText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && triggerAnalysis(null, mealText)}
                  placeholder="例如：雞腿便當吃半碗飯、超商雞胸+豆漿..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => triggerAnalysis(null, mealText)}
                  disabled={!mealText.trim() || isAnalyzing}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
                >
                  {isAnalyzing ? (
                    '拆解中...'
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                      文字即時估算
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-zinc-400 font-semibold mr-1">
            快速測試範例（一鍵模擬）：
          </span>
          {samplePresets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setMealText(preset.text);
                triggerAnalysis(null, preset.text);
              }}
              className="text-[11px] px-2.5 py-1 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-amber-300 flex items-center gap-1 transition-colors"
            >
              <span>{preset.icon}</span>
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading animation state */}
      {isAnalyzing && (
        <div className="bg-zinc-950 border border-amber-500/40 rounded-2xl p-6 text-center space-y-3 animate-pulse">
          <div className="w-12 h-12 rounded-full border-3 border-amber-500/30 border-t-amber-400 animate-spin mx-auto" />
          <div className="text-xs sm:text-sm font-extrabold text-amber-300">
            視覺多模態模型正在由左至右、由主至副拆解食材...
          </div>
          <div className="text-[11px] text-zinc-400 max-w-sm mx-auto">
            執行肉品種類識別、烹調方式判斷、蛋豆配菜檢索、主食份量測量與油脂盲點掃描
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4-STEP STRUCTURED MULTIMODAL NUTRITION ESTIMATION OUTPUT */}
      {/* ======================================================== */}
      {analysisResult && !isAnalyzing && (
        <div className="bg-zinc-950 border border-amber-500/30 rounded-3xl p-4 sm:p-6 space-y-5 animate-in fade-in">
          {/* Top Quick Metrics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-semibold">本餐蛋白質貢獻</span>
              <span className="font-mono text-xl sm:text-2xl font-black text-lime-400">
                +{analysisResult.step2_nutritionList?.totalProtein || 32} g
              </span>
            </div>

            <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-semibold">本餐預估總熱量</span>
              <span className="font-mono text-xl sm:text-2xl font-black text-amber-300">
                ~{analysisResult.step2_nutritionList?.totalCalories || 650} kcal
              </span>
            </div>

            <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-semibold">預估碳水 / 脂肪</span>
              <span className="font-mono text-sm sm:text-base font-bold text-zinc-200 mt-1 block">
                {analysisResult.step2_nutritionList?.totalCarbs || 60}g /{' '}
                {analysisResult.step2_nutritionList?.totalFat || 22}g
              </span>
            </div>

            <div className="bg-zinc-900/90 p-3 rounded-2xl border border-zinc-800">
              <span className="text-[10px] text-zinc-400 block font-semibold">今日距離 160g 尚差</span>
              <span className="font-mono text-xl sm:text-2xl font-black text-rose-400">
                {analysisResult.step3_proteinProgress?.remainingProtein ?? 0} g
              </span>
            </div>
          </div>

          {/* STEP 1: 🔍 視覺食材分割與份量估算 */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-xs sm:text-sm font-extrabold text-zinc-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 font-mono text-xs flex items-center justify-center font-bold">
                1
              </span>
              🔍 視覺食材分割與份量估算
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                由左至右 · 由主至副
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* 主菜辨識 */}
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/90 space-y-1">
                <div className="text-amber-400 font-bold flex items-center justify-between">
                  <span>🍗 主菜辨識</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-300 font-mono">
                    {analysisResult.step1_segmentation?.mainDish?.meatType || '肉品'}
                  </span>
                </div>
                <div className="font-bold text-zinc-100 text-sm">
                  {analysisResult.step1_segmentation?.mainDish?.name}
                </div>
                <div className="text-zinc-400 text-[11px] leading-relaxed">
                  烹調：{analysisResult.step1_segmentation?.mainDish?.cookingMethod} ｜ 肉量推估：
                  <strong className="text-zinc-200">
                    {analysisResult.step1_segmentation?.mainDish?.estimatedGrams}
                  </strong>
                </div>
                {analysisResult.step1_segmentation?.mainDish?.description && (
                  <p className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-850">
                    {analysisResult.step1_segmentation.mainDish.description}
                  </p>
                )}
              </div>

              {/* 副菜與蛋白質補充 */}
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/90 space-y-1">
                <div className="text-cyan-400 font-bold flex items-center justify-between">
                  <span>🥚 副菜與蛋白質補充</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                    蛋豆類
                  </span>
                </div>
                <div className="font-bold text-zinc-100 text-sm">
                  {analysisResult.step1_segmentation?.sideDishes?.eggOrBeanItem || '半顆滷蛋 / 豆製品'}
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {analysisResult.step1_segmentation?.sideDishes?.description ||
                    '提供額外完整胺基酸來源'}
                </p>
              </div>

              {/* 主食與蔬菜 */}
              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800/90 space-y-1">
                <div className="text-emerald-400 font-bold flex items-center justify-between">
                  <span>🍚 主食與蔬菜</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-300 font-mono">
                    碳水 & 纖維
                  </span>
                </div>
                <div className="font-bold text-zinc-100 text-sm">
                  {analysisResult.step1_segmentation?.stapleAndVeg?.stapleType}
                </div>
                <div className="text-zinc-400 text-[11px] leading-relaxed">
                  份量：
                  <strong className="text-zinc-200">
                    {analysisResult.step1_segmentation?.stapleAndVeg?.staplePortion}
                  </strong>{' '}
                  ｜ 蔬菜油度：
                  <span className="text-amber-300 font-medium">
                    {analysisResult.step1_segmentation?.stapleAndVeg?.vegOilLevel}
                  </span>
                </div>
                {analysisResult.step1_segmentation?.stapleAndVeg?.description && (
                  <p className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-850">
                    {analysisResult.step1_segmentation.stapleAndVeg.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* STEP 2: 📊 營養數據清單 */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-xs sm:text-sm font-extrabold text-zinc-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 font-mono text-xs flex items-center justify-center font-bold">
                2
              </span>
              📊 營養數據清單
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
                條列清晰化
              </span>
            </h4>

            <div className="divide-y divide-zinc-800/70 border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
              {analysisResult.step2_nutritionList?.items?.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs hover:bg-zinc-900/40 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        item.category === '主菜'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : item.category === '副菜'
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : item.category === '主食'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {item.category}
                    </span>
                    <span className="font-bold text-zinc-200">{item.name}</span>
                    {item.portionGrams && (
                      <span className="text-[11px] text-zinc-500 font-mono">
                        ({item.portionGrams})
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 font-mono text-xs">
                    <span className="text-lime-400 font-bold">
                      蛋白質約 {item.proteinGrams}g
                    </span>
                    <span className="text-zinc-400">熱量約 {item.caloriesKcal} 大卡</span>
                  </div>
                </div>
              ))}

              {/* 🧮 本餐總計列 */}
              <div className="p-3 sm:px-4 sm:py-3 bg-zinc-900/90 flex flex-wrap items-center justify-between gap-2 text-xs border-t-2 border-amber-500/40">
                <span className="font-black text-amber-300 flex items-center gap-1.5 text-sm">
                  🧮 本餐總計
                </span>
                <div className="flex items-center gap-4 font-mono text-sm font-extrabold">
                  <span className="text-lime-400">
                    蛋白質約 <strong>{analysisResult.step2_nutritionList?.totalProtein}g</strong>
                  </span>
                  <span className="text-amber-300">
                    熱量約 <strong>{analysisResult.step2_nutritionList?.totalCalories} 大卡</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: 🎯 每日蛋白質進度追蹤 */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <h4 className="text-xs sm:text-sm font-extrabold text-zinc-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-lg bg-amber-500/20 text-amber-400 font-mono text-xs flex items-center justify-center font-bold">
                3
              </span>
              🎯 每日蛋白質進度追蹤
              <span className="text-[11px] font-mono font-bold text-amber-300 ml-auto">
                目標 160g 達成進度
              </span>
            </h4>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">
                  原累積 {analysisResult.step3_proteinProgress?.currentProteinBefore || currentProtein}g + 本餐貢獻{' '}
                  <strong className="text-lime-400">
                    {analysisResult.step3_proteinProgress?.mealContribution || 0}g
                  </strong>
                </span>
                <span className="font-bold text-zinc-200">
                  新累積：
                  <strong className="text-lime-300">
                    {analysisResult.step3_proteinProgress?.newTotalProtein ||
                      currentProtein + (analysisResult.step2_nutritionList?.totalProtein || 0)}
                    g
                  </strong>{' '}
                  / {targetProtein}g
                </span>
              </div>

              <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                <div
                  className="h-full bg-gradient-to-r from-lime-500 to-emerald-400 rounded-full transition-all duration-500 shadow-sm shadow-lime-500/20"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        ((analysisResult.step3_proteinProgress?.newTotalProtein || currentProtein) /
                          targetProtein) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* Replenish Tip Box */}
            <div className="bg-amber-950/25 border border-amber-500/30 rounded-xl p-3 flex items-start gap-2.5">
              <ShoppingBag className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <span className="font-bold text-amber-300 mr-1">
                  尚需補充約 {analysisResult.step3_proteinProgress?.remainingProtein ?? 0}g：
                </span>
                {analysisResult.step3_proteinProgress?.replenishSuggestion}
              </div>
            </div>
          </div>

          {/* STEP 4: ⚠️ 烹調與油脂盲點提醒 */}
          <div
            className={`rounded-2xl p-4 sm:p-5 border transition-all ${
              analysisResult.step4_oilAndCookingWarning?.hasOilWarning
                ? 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                : 'bg-zinc-900/70 border-zinc-800 text-zinc-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold text-zinc-100 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-rose-500/20 text-rose-400 font-mono text-xs flex items-center justify-center font-bold">
                    4
                  </span>
                  ⚠️ 烹調與油脂盲點提醒
                  {analysisResult.step4_oilAndCookingWarning?.calorieSurgeKcal > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                      熱量浮動 +{analysisResult.step4_oilAndCookingWarning.calorieSurgeKcal} kcal
                    </span>
                  )}
                </h4>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {analysisResult.step4_oilAndCookingWarning?.oilWarningText}
                </p>

                {analysisResult.step4_oilAndCookingWarning?.fatLossTip && (
                  <div className="pt-2 text-xs text-amber-300 font-medium flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      <strong>減脂技巧：</strong> {analysisResult.step4_oilAndCookingWarning.fatLossTip}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Confirm Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800">
            <span className="text-xs text-zinc-400">
              確認此拆解無誤後，可直接累計至今日記錄：
            </span>
            <button
              onClick={handleApplyToTracker}
              className="px-5 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-zinc-950 font-black text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-lime-500/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                確認並將 +{analysisResult.step2_nutritionList?.totalProtein || 0}g 累計至今日蛋白質進度
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
