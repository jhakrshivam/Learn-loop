import React from 'react';
import { Subject } from '../types';
import { Edit3, Sparkles, HelpCircle, BookOpen, Clock } from 'lucide-react';

interface AnalysisViewProps {
  subjects: Subject[];
  onOpenQuizModal: (subjectName?: string) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ subjects, onOpenQuizModal }) => {
  // Rank subjects by learning need (highest gap first)
  const rankedSubjects = [...subjects].sort((a, b) => b.gap - a.gap);

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Quiz Update Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-xl border border-[#E6E1D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-[#0F172A]">Subject Priority & Preparation Analysis</h2>
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
              Personalized
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1 max-w-2xl leading-relaxed">
            Prioritized based on your learning gap (<span className="font-mono font-semibold">gap = 100 - score</span>) and your self-assessment. Higher gap subjects receive more scheduled practice slots without ever assuming you are "weak".
          </p>
        </div>
        <button
          id="btn-analysis-update-quiz"
          onClick={() => onOpenQuizModal()}
          className="text-xs font-semibold px-4 py-2.5 rounded-lg bg-[#0F172A] text-white hover:bg-[#1E293B] transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Update Score / Notes</span>
        </button>
      </div>

      {/* Empathy & Fairness Note */}
      <div className="p-4 rounded-xl bg-[#F8F6F0] border border-[#E8E2D5] flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-[#334155] space-y-1">
          <span className="font-bold text-[#0F172A] block">1st Semester & Fresh Starts Approach:</span>
          <p className="text-[#475569] leading-relaxed">
            In first semester or brand-new modules, students do not have previous marks. Rather than labeling anyone as "weak", LearnLoop treats higher-gap subjects as <strong>Foundational Focus</strong> areas — scheduling extra daytime blocks so you can learn at a comfortable, stress-free pace.
          </p>
        </div>
      </div>

      {/* Priority Rules Reference */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-xl bg-rose-50/80 border border-rose-200/80 text-rose-950">
          <div className="flex items-center justify-between">
            <span className="font-bold">Critical</span>
            <span className="text-[10px] uppercase font-semibold text-rose-700">Foundational Focus</span>
          </div>
          <span className="text-[11px] text-rose-700 mt-1 block">Preparation &lt; 50% (Max study slots)</span>
        </div>
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-950">
          <div className="flex items-center justify-between">
            <span className="font-bold">High</span>
            <span className="text-[10px] uppercase font-semibold text-amber-700">Active Practice</span>
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">Preparation 50–64% (Frequent review)</span>
        </div>
        <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/80 text-blue-950">
          <div className="flex items-center justify-between">
            <span className="font-bold">Medium</span>
            <span className="text-[10px] uppercase font-semibold text-blue-700">Steady Pace</span>
          </div>
          <span className="text-[11px] text-blue-700 mt-1 block">Preparation 65–79% (Balanced slots)</span>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-emerald-950">
          <div className="flex items-center justify-between">
            <span className="font-bold">Low</span>
            <span className="text-[10px] uppercase font-semibold text-emerald-700">Maintenance</span>
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">Preparation 80%+ (Light brush-ups)</span>
        </div>
      </div>

      {/* Subject Analysis Table */}
      <div className="bg-white rounded-xl border border-[#E6E1D8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table id="table-subject-analysis" className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E6E1D8] text-[#475569] text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Subject & Context</th>
                <th className="py-3 px-4">Mode</th>
                <th className="py-3 px-4">Score / Level</th>
                <th className="py-3 px-4">Learning Gap</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6] text-sm">
              {rankedSubjects.map((subject, index) => (
                <tr
                  key={subject.name}
                  id={`subject-row-${subject.name.replace(/\s+/g, '-').toLowerCase()}`}
                  className="hover:bg-[#FAF9F7] transition-colors"
                >
                  {/* Subject Name and Student Reason */}
                  <td className="py-3.5 px-4 font-medium text-[#0F172A] max-w-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="text-xs text-[#94A3B8] font-mono mt-0.5 w-4">{index + 1}.</span>
                      <div>
                        <span className="font-bold text-[#0F172A]">{subject.name}</span>
                        {subject.student_reason ? (
                          <p className="text-[11px] text-[#64748B] italic mt-0.5 line-clamp-2">
                            "{subject.student_reason}"
                          </p>
                        ) : (
                          <p className="text-[11px] text-[#94A3B8] mt-0.5">No specific note added</p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Assessment Mode */}
                  <td className="py-3.5 px-4">
                    {subject.assessment_mode === 'self_assessment' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        🌱 1st Sem / Self-Assess
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
                        📝 Quiz / Test Marks
                      </span>
                    )}
                  </td>

                  {/* Performance */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#0F172A] w-10">{subject.performance}%</span>
                      <div className="w-20 bg-[#EAE5DC] h-2 rounded-full overflow-hidden hidden sm:block">
                        <div
                          className={`h-full rounded-full ${
                            subject.performance < 50
                              ? 'bg-rose-600'
                              : subject.performance <= 64
                              ? 'bg-amber-500'
                              : subject.performance <= 79
                              ? 'bg-blue-600'
                              : 'bg-emerald-600'
                          }`}
                          style={{ width: `${Math.min(100, subject.performance)}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Gap */}
                  <td className="py-3.5 px-4 font-mono text-xs font-semibold text-[#B45309]">
                    {subject.gap}%
                  </td>

                  {/* Priority */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border ${getPriorityBadgeClass(
                        subject.priority
                      )}`}
                    >
                      {subject.priority}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3.5 px-4 text-right">
                    <button
                      id={`btn-edit-quiz-${subject.name.replace(/\s+/g, '-').toLowerCase()}`}
                      onClick={() => onOpenQuizModal(subject.name)}
                      className="text-xs font-semibold text-[#0F172A] hover:text-[#1E293B] underline underline-offset-2 p-1 cursor-pointer"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
