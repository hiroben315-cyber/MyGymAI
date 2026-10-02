import React from 'react';
import { X, Calendar, Dumbbell, Award, ArrowRight, Trash2 } from 'lucide-react';
import { WorkoutSession } from '../types/workout';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: WorkoutSession[];
  onSelectSession: (session: WorkoutSession) => void;
  onDeleteSession: (sessionId: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onSelectSession,
  onDeleteSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-lime-400" />
            <h3 className="text-base font-bold text-zinc-100">訓練日誌歷史記錄</h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
              {sessions.length} 筆紀錄
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 text-sm">
              尚無歷史訓練記錄，完成一次訓練並發送給教練分析後將在此留存。
            </div>
          ) : (
            sessions.map((session) => {
              const routineNames: Record<string, string> = {
                Push: '推日 (Push)',
                Pull: '拉日 (Pull)',
                Legs: '腿日 (Legs)',
                Custom: '自訂',
              };

              return (
                <div
                  key={session.id}
                  className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 transition-all group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-lime-500/10 text-lime-400 border border-lime-500/20 font-mono">
                        {routineNames[session.routine] || session.routine}
                      </span>
                      <span className="text-xs text-zinc-400 font-mono">{session.date}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-zinc-300">
                        總容量：<strong className="text-lime-400">{session.totalVolumeKg.toLocaleString()} kg</strong>
                      </span>
                      <span className="text-xs font-mono text-zinc-300">
                        蛋白質：<strong className="text-amber-400">{session.proteinGrams}g</strong>
                      </span>

                      <button
                        onClick={() => onDeleteSession(session.id)}
                        className="p-1 text-zinc-500 hover:text-rose-400 transition-colors"
                        title="刪除此紀錄"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Exercises mini tags */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {session.exercises.map((ex, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800"
                      >
                        {ex.name} ({ex.sets.length}組)
                      </span>
                    ))}
                  </div>

                  {/* Overload target snippet */}
                  {session.coachFeedback?.overloadTargets?.[0] && (
                    <div className="text-xs bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-2.5 text-zinc-300 flex items-start gap-2">
                      <Award className="w-3.5 h-3.5 text-lime-400 mt-0.5 shrink-0" />
                      <div className="text-[11px] leading-relaxed">
                        <strong className="text-zinc-200">
                          {session.coachFeedback.overloadTargets[0].exerciseName}下次目標：
                        </strong>{' '}
                        {session.coachFeedback.overloadTargets[0].nextTarget}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        onSelectSession(session);
                        onClose();
                      }}
                      className="text-xs font-bold text-lime-400 hover:text-lime-300 flex items-center gap-1 transition-colors"
                    >
                      載入這份訓練作為今日基礎
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
