import React, { useState } from 'react';
import { Subject } from '../types';
import { X, Check, ArrowRight, Sparkles } from 'lucide-react';
import { calculateGap, calculatePriority } from '../../server/plannerCore';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  initialSubjectName?: string;
  onSubmitQuizScore: (
    subjectName: string,
    newScore: number,
    options?: { studentReason?: string; assessmentMode?: 'marks' | 'self_assessment'; confidenceLevel?: string }
  ) => Promise<void>;
}

const CONFIDENCE_LEVELS = [
  { key: 'beginner', label: 'Starting Fresh / Unfamiliar', score: 45, color: 'border-rose-300 bg-rose-50 text-rose-900' },
  { key: 'moderate', label: 'Basic Concept / Needs Practice', score: 60, color: 'border-amber-300 bg-amber-50 text-amber-900' },
  { key: 'comfortable', label: 'Comfortable / Good Foundation', score: 75, color: 'border-blue-300 bg-blue-50 text-blue-900' },
  { key: 'advanced', label: 'Strong / Confident', score: 90, color: 'border-emerald-300 bg-emerald-50 text-emerald-900' },
];

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  subjects,
  initialSubjectName,
  onSubmitQuizScore,
}) => {
  if (!isOpen || subjects.length === 0) return null;

  const defaultSub = initialSubjectName || subjects[0]?.name || '';
  const [selectedSubject, setSelectedSubject] = useState(defaultSub);

  const currentSubjectObj = subjects.find((s) => s.name === selectedSubject) || subjects[0];
  const [mode, setMode] = useState<'marks' | 'self_assessment'>(currentSubjectObj.assessment_mode || 'marks');
  const [score, setScore] = useState<number>(currentSubjectObj.performance);
  const [reason, setReason] = useState<string>(currentSubjectObj.student_reason || '');
  const [confidence, setConfidence] = useState<string>(currentSubjectObj.confidence_level || 'moderate');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dynamic preview of priority transition
  const oldScore = currentSubjectObj.performance;
  const oldPriority = currentSubjectObj.priority;
  const newScore = Number(score);
  const newGap = calculateGap(newScore);
  const newPriority = calculatePriority(newScore);

  const handleSubjectChange = (subName: string) => {
    setSelectedSubject(subName);
    const match = subjects.find((s) => s.name === subName);
    if (match) {
      setScore(match.performance);
      setReason(match.student_reason || '');
      setMode(match.assessment_mode || 'marks');
      setConfidence(match.confidence_level || 'moderate');
    }
  };

  const handleConfidenceSelect = (key: string, baselineScore: number) => {
    setConfidence(key);
    setScore(baselineScore);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    setIsSubmitting(true);
    try {
      await onSubmitQuizScore(selectedSubject, newScore, {
        studentReason: reason,
        assessmentMode: mode,
        confidenceLevel: confidence,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-[#E6E1D8] shadow-2xl overflow-hidden animate-in fade-in duration-200">
        <div className="p-4 bg-[#FAF8F5] border-b border-[#E6E1D8] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">Update Performance & Progress</h3>
            <p className="text-xs text-[#64748B]">
              Reflects quiz marks or 1st-semester self-assessed comfort level
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#EFECE6] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Select Subject */}
          <div>
            <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
              Subject
            </label>
            <select
              id="quiz-subject-select"
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              className="w-full text-sm p-2.5 rounded-lg border border-[#D5CFC3] bg-white focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
            >
              {subjects.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name} (Current: {s.performance}%, {s.priority})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-lg border border-[#D5CFC3]">
            <button
              type="button"
              onClick={() => {
                setMode('marks');
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded cursor-pointer transition-colors ${
                mode === 'marks' ? 'bg-[#0F172A] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              📝 Test / Quiz Marks
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('self_assessment');
                const match = CONFIDENCE_LEVELS.find((c) => c.key === confidence);
                if (match) setScore(match.score);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded cursor-pointer transition-colors ${
                mode === 'self_assessment' ? 'bg-[#0F172A] text-white' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              🌱 1st Sem / Self-Assessment
            </button>
          </div>

          {mode === 'self_assessment' ? (
            <div>
              <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
                Comfort Level
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CONFIDENCE_LEVELS.map((conf) => (
                  <button
                    key={conf.key}
                    type="button"
                    onClick={() => handleConfidenceSelect(conf.key, conf.score)}
                    className={`p-2 rounded-lg border text-left text-xs cursor-pointer transition-all ${
                      confidence === conf.key ? `${conf.color} font-bold ring-1` : 'bg-white border-[#D5CFC3] text-[#475569]'
                    }`}
                  >
                    <div>{conf.label}</div>
                    <span className="text-[10px] opacity-75">~{conf.score}% score baseline</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider">
                  Test / Quiz Score (%)
                </label>
                <span className="text-xs text-[#64748B] font-bold">{score}%</span>
              </div>
              <input
                id="quiz-score-input"
                type="number"
                min="0"
                max="100"
                value={score}
                onChange={(e) => setScore(Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-full p-2.5 rounded-lg border border-[#D5CFC3] bg-white font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[#0F172A]"
                required
              />
            </div>
          )}

          {/* Why do you feel weak or strong? */}
          <div>
            <label className="block text-xs font-semibold text-[#334155] uppercase tracking-wider mb-1.5">
              Why do you feel this way? (Reason / Note)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Midterm numericals were difficult, or 1st semester new syllabus"
              className="w-full p-2 text-xs rounded-lg border border-[#D5CFC3] bg-white focus:outline-none"
            />
          </div>

          {/* Dynamic Adaptation Preview */}
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#E6E1D8] space-y-2 text-xs">
            <span className="font-semibold text-[#0F172A] block text-xs uppercase tracking-wider">
              Autonomous Plan Preview:
            </span>
            <div className="flex items-center justify-between text-[#475569]">
              <span>Score Transition:</span>
              <span className="font-bold text-[#0F172A]">
                {oldScore}% → {newScore}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[#475569]">
              <span>Learning Gap:</span>
              <span className="font-mono font-bold text-[#B45309]">
                {100 - oldScore}% → {newGap}%
              </span>
            </div>
            <div className="flex items-center justify-between text-[#475569]">
              <span>Priority Level:</span>
              <span className="font-bold">
                <span className="text-[#64748B]">{oldPriority}</span>
                <span className="mx-1">→</span>
                <span
                  className={
                    newPriority === 'Critical'
                      ? 'text-rose-700'
                      : newPriority === 'High'
                      ? 'text-amber-700'
                      : newPriority === 'Medium'
                      ? 'text-blue-700'
                      : 'text-emerald-700'
                  }
                >
                  {newPriority}
                </span>
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#EFECE6]">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#0F172A] rounded cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-quiz-submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold rounded-lg bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Updating Plan...' : 'Apply & Adapt Plan'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
