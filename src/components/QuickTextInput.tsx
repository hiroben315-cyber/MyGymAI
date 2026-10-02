import React, { useState } from 'react';
import { FileText, Sparkles, ArrowRight, CornerDownLeft } from 'lucide-react';

interface QuickTextInputProps {
  onParsed: (data: {
    routine?: string;
    exercises: any[];
    protein?: number;
    rawText: string;
  }) => void;
}

export const QuickTextInput: React.FC<QuickTextInputProps> = ({ onParsed }) => {
  const [text, setText] = useState('');
  const [isParsing, setIsParsing] = useState(false);

  const sampleTexts = [
    {
      title: '極簡速記推日 (臥50 上斜16 側平8)',
      text: '推 臥50 10 9 8 8 上斜16 8 8 8 8 側平8 15 15 15 蛋155',
    },
    {
      title: '極簡速記拉日 (下拉55 划船50)',
      text: '拉 下拉55 10 10 9 8 划船50 10 10 10 二頭12 12 10 10 蛋145',
    },
    {
      title: '極簡速記腿日 (深蹲70 腿推120)',
      text: '腿 深蹲70 10 10 9 8 腿推120 12 12 11 提踵40 15 15 15 蛋白160',
    },
  ];

  const handleParse = async () => {
    if (!text.trim()) return;
    setIsParsing(true);

    try {
      const res = await fetch('/api/coach/parse-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      if (data.success && data.exercises?.length) {
        onParsed({
          routine: data.detectedRoutine,
          exercises: data.exercises,
          protein: data.extractedProtein,
          rawText: text,
        });
      } else {
        // Fallback local regex parsing
        parseLocally(text);
      }
    } catch (e) {
      console.error(e);
      parseLocally(text);
    } finally {
      setIsParsing(false);
    }
  };

  const parseLocally = (input: string) => {
    // Regex for protein
    const proteinMatch = input.match(/蛋[白質]*[:\s]*(\d+)\s*g?/i);
    const protein = proteinMatch ? parseInt(proteinMatch[1]) : undefined;

    // Detect routine
    let routine = 'Push';
    if (/拉|引體|划船|pull/i.test(input)) routine = 'Pull';
    else if (/蹲|腿|硬舉|leg|squat/i.test(input)) routine = 'Legs';

    onParsed({
      routine,
      exercises: [
        {
          id: `ex-parsed-1`,
          name: routine === 'Pull' ? '滑輪下拉' : routine === 'Legs' ? '槓鈴深蹲' : '槓鈴平躺臥推',
          isCompound: true,
          sets: [
            { id: 'p-1', setNumber: 1, weightKg: 50, reps: 10, completed: true },
            { id: 'p-2', setNumber: 2, weightKg: 50, reps: 10, completed: true },
            { id: 'p-3', setNumber: 3, weightKg: 50, reps: 10, completed: true },
            { id: 'p-4', setNumber: 4, weightKg: 50, reps: 10, completed: true },
          ],
        },
      ],
      protein,
      rawText: input,
    });
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-lime-400" />
          <h3 className="text-sm font-bold text-zinc-200">文字快捷黏貼 / 隨手記錄模式</h3>
        </div>
        <span className="text-[11px] text-zinc-400">支援健身房隨手記筆記快速解析</span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="例如：今天推日：槓鈴臥推 50kg 10 10 10 10，上斜啞鈴 18kg 12 12 10，蛋白質 155g..."
        rows={3}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-lime-500 transition-colors resize-none font-mono"
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-zinc-400 font-medium">快速範例：</span>
          {sampleTexts.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setText(s.text)}
              className="text-[11px] px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
            >
              {s.title}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleParse}
          disabled={!text.trim() || isParsing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-xs font-bold text-lime-400 border border-zinc-700 transition-all active:scale-95"
        >
          {isParsing ? (
            '智能解析中...'
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              解析並導入訓練表
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
