import React, { useState, useEffect } from 'react';
import { Scale, TrendingDown, TrendingUp, Sparkles, Plus, Calendar, ShieldCheck, Check } from 'lucide-react';
import { BodyMetricsLog, UserIntakeProfile } from '../types/workout';

interface BodyMetricsTrackerProps {
  userProfile: UserIntakeProfile;
  onUpdateWeight: (newWeight: number) => void;
}

const STORAGE_KEY = 'ppl_hyperload_body_metrics_v2';

export const BodyMetricsTracker: React.FC<BodyMetricsTrackerProps> = ({
  userProfile,
  onUpdateWeight,
}) => {
  const [logs, setLogs] = useState<BodyMetricsLog[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
    // Seed sample initial and 2-week-ago record
    const twoWeeksAgo = new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0];
    const initialLogs: BodyMetricsLog[] = [
      {
        id: 'bm-init',
        date: twoWeeksAgo,
        weightKg: 80.5,
        waistCm: 86.5,
        chestCm: 100.0,
        armCm: 34.5,
        notes: '初期基準測量',
      },
    ];
    return initialLogs;
  });

  const [weight, setWeight] = useState<number>(userProfile.weight || 80);
  const [waist, setWaist] = useState<number>(85);
  const [chest, setChest] = useState<number>(101);
  const [arm, setArm] = useState<number>(35.2);
  const [diagnosis, setDiagnosis] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Save logs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }, [logs]);

  const latestLog = logs[0];
  const previousLog = logs[1] || logs[0];

  const handleAddMeasurement = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newLog: BodyMetricsLog = {
      id: `bm-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      weightKg: weight,
      waistCm: waist,
      chestCm: chest,
      armCm: arm,
      notes: '雙週追蹤測量',
    };

    try {
      const res = await fetch('/api/body/analyze-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current: newLog,
          previous: latestLog,
          userProfile,
        }),
      });
      const data = await res.json();
      if (data.success) {
        newLog.coachDiagnosis = data.diagnosis;
        setDiagnosis(data.diagnosis);
      }
    } catch (e) {
      console.error(e);
    }

    setLogs([newLog, ...logs]);
    onUpdateWeight(weight);
    setIsSubmitting(false);
  };

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-lime-500/10 border border-lime-500/30 flex items-center justify-center text-lime-400">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-zinc-100 flex items-center gap-2">
              模組五：雙週體態與圍度追蹤
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-lime-500/10 text-lime-400 border border-lime-500/30">
                身體重組驗證
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              監測腰圍、手臂圍、胸圍與體重動態，驗證「增肌減脂同步發生」黃金成效
            </p>
          </div>
        </div>

        <span className="text-xs text-zinc-400 font-mono">
          基準身高：{userProfile.height}cm / 體重：{userProfile.weight}kg
        </span>
      </div>

      {/* Golden Recomposition Rule Box */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-lime-950/30 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-zinc-200 leading-relaxed">
          <strong className="text-emerald-300 font-bold block mb-0.5">
            運動科學重組判斷準則：
          </strong>
          若「體重微幅波動（±0.5~1.0kg），但腰圍減少、手臂或胸圍增加」，此為最佳的<strong>身體重組成效</strong>！內臟與皮下脂肪正被高密度肌肉取代，不需為體重數字焦慮！
        </div>
      </div>

      {/* Input Form for New Measurement */}
      <form onSubmit={handleAddMeasurement} className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 space-y-3">
        <div className="text-xs font-bold text-zinc-300">輸入今日測量數值：</div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">體重 (kg)</label>
            <input
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-center text-zinc-100 focus:outline-none focus:border-lime-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">腰圍 (cm，肚臍處)</label>
            <input
              type="number"
              step="0.5"
              value={waist}
              onChange={(e) => setWaist(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-center text-zinc-100 focus:outline-none focus:border-lime-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">胸圍 (cm，乳頭連線)</label>
            <input
              type="number"
              step="0.5"
              value={chest}
              onChange={(e) => setChest(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-center text-zinc-100 focus:outline-none focus:border-lime-500"
            />
          </div>

          <div>
            <label className="text-[11px] text-zinc-400 block mb-1">手臂圍 (cm，二頭屈曲)</label>
            <input
              type="number"
              step="0.5"
              value={arm}
              onChange={(e) => setArm(parseFloat(e.target.value) || 0)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-mono font-bold text-center text-zinc-100 focus:outline-none focus:border-lime-500"
            />
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-lime-500 hover:bg-lime-400 text-zinc-950 font-bold text-xs transition-colors shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            記錄今日圍度並診斷重組成效
          </button>
        </div>
      </form>

      {/* Latest Coach Diagnosis */}
      {diagnosis && (
        <div className="bg-lime-950/30 border border-lime-500/30 rounded-2xl p-4 text-xs font-medium text-lime-100 leading-relaxed animate-in fade-in">
          {diagnosis}
        </div>
      )}

      {/* Past Measurement History */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
          雙週歷史測量紀錄
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {logs.map((item, idx) => (
            <div
              key={item.id || idx}
              className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-300 font-bold">{item.date}</span>
              </div>

              <div className="flex items-center gap-4 text-zinc-300">
                <span>體重: <strong className="text-zinc-100">{item.weightKg}kg</strong></span>
                {item.waistCm && <span>腰圍: <strong className="text-amber-400">{item.waistCm}cm</strong></span>}
                {item.chestCm && <span>胸圍: <strong className="text-cyan-400">{item.chestCm}cm</strong></span>}
                {item.armCm && <span>手臂: <strong className="text-lime-400">{item.armCm}cm</strong></span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
