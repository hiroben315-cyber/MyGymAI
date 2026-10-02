import React, { useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, Volume2, VolumeX, CheckCircle } from 'lucide-react';

interface RestTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  secondsRemaining: number | null;
  isRunning: boolean;
  onStart: (seconds: number) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
}

export const RestTimerModal: React.FC<RestTimerModalProps> = ({
  isOpen,
  onClose,
  secondsRemaining,
  isRunning,
  onStart,
  onPause,
  onResume,
  onReset,
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(true);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play beep sound when timer reaches 0
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.3); // up to A6
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (secondsRemaining === 0) {
      playBeep();
    }
  }, [secondsRemaining]);

  if (!isOpen) return null;

  const currentSeconds = secondsRemaining ?? 0;
  const minutes = Math.floor(currentSeconds / 60);
  const seconds = currentSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="absolute top-4 left-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          title={soundEnabled ? '關閉提示音' : '開啟提示音'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-lime-400" /> : <VolumeX className="w-5 h-5" />}
        </button>

        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          組間休息計時器 (Rest Timer)
        </h3>

        {/* Big Digital Display */}
        <div className="my-6">
          <div className="font-mono text-6xl font-black text-zinc-100 tracking-tight">
            {formattedTime}
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            {currentSeconds === 0 ? (
              <span className="text-lime-400 font-semibold flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4" /> 休息結束，準備下一組超負荷！
              </span>
            ) : isRunning ? (
              '心率平復中，專注下一組神經募集'
            ) : (
              '選擇休息秒數或繼續'
            )}
          </p>
        </div>

        {/* Preset Seconds Buttons */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {[
            { label: '60s', desc: '孤立/小肌群', val: 60 },
            { label: '90s', desc: '增肌標準', val: 90 },
            { label: '120s', desc: '複合推拉', val: 120 },
            { label: '180s', desc: '大重量深蹲', val: 180 },
          ].map((item) => (
            <button
              key={item.val}
              onClick={() => onStart(item.val)}
              className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-lime-500/50 hover:bg-zinc-800/80 active:scale-95 transition-all text-zinc-200"
            >
              <span className="font-mono font-bold text-sm text-lime-400">{item.label}</span>
              <span className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</span>
            </button>
          ))}
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          {isRunning ? (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold transition-all active:scale-95 shadow-lg shadow-amber-500/20"
            >
              <Pause className="w-5 h-5 fill-current" />
              暫停
            </button>
          ) : (
            <button
              onClick={onResume}
              disabled={currentSeconds <= 0}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-lime-500 hover:bg-lime-400 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 font-bold transition-all active:scale-95 shadow-lg shadow-lime-500/20"
            >
              <Play className="w-5 h-5 fill-current" />
              繼續
            </button>
          )}

          <button
            onClick={onReset}
            className="p-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all active:scale-95"
            title="重設計時器"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
