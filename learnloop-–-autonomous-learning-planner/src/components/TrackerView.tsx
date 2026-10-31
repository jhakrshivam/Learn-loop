import React, { useState } from 'react';
import { CheckCircle2, XCircle, Clock, AlertTriangle, ArrowRight, Filter, Info, BookOpen } from 'lucide-react';
import { AppState, StudySession, SessionStatus } from '../types';

interface TrackerViewProps {
  state: AppState;
  onTrackSession: (sessionId: string, status: 'completed' | 'missed' | 'partial') => void;
}

export const TrackerView: React.FC<TrackerViewProps> = ({ state, onTrackSession }) => {
  const { sessions, plan_version, plan_diff, subjects, profile } = state;
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'missed'>('all');

  const filteredSessions = sessions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const completedCount = sessions.filter((s) => s.status === 'completed').length;
  const missedCount = sessions.filter((s) => s.status === 'missed').length;
  const scheduledCount = sessions.filter((s) => s.status === 'scheduled').length;
  const partialCount = sessions.filter((s) => s.status === 'partial').length;

  return (
    <div className="space-y-6">
      {/* Tracker Header */}
      <div className="bg-white p-5 rounded-lg border border-[#E6E1D8]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">Study Session Execution Tracker</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Mark attendance. When you mark a session as <strong className="text-rose-700">Miss</strong>, LearnLoop automatically replans future sessions to recover workload.
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-[#F1EFEA] text-[#334155] font-semibold self-start sm:self-auto border border-[#E2DDD3]">
            Current: Plan v{plan_version}
          </span>
        </div>

        {/* Quick Stats & Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#EFECE6]">
          <span className="text-xs font-medium text-[#475569] flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setFilter('all')}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              filter === 'all'
                ? 'bg-[#0F172A] text-white font-medium'
                : 'bg-[#FAF8F5] text-[#334155] border border-[#D5CFC3] hover:bg-[#EFECE6]'
            }`}
          >
            All ({sessions.length})
          </button>
          <button
            onClick={() => setFilter('scheduled')}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              filter === 'scheduled'
                ? 'bg-[#0F172A] text-white font-medium'
                : 'bg-[#FAF8F5] text-[#334155] border border-[#D5CFC3] hover:bg-[#EFECE6]'
            }`}
          >
            Scheduled ({scheduledCount})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              filter === 'completed'
                ? 'bg-emerald-700 text-white font-medium'
                : 'bg-[#FAF8F5] text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            onClick={() => setFilter('missed')}
            className={`text-xs px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
              filter === 'missed'
                ? 'bg-rose-700 text-white font-medium'
                : 'bg-[#FAF8F5] text-rose-700 border border-rose-300 hover:bg-rose-50'
            }`}
          >
            Missed ({missedCount})
          </button>
        </div>
      </div>

      {/* Plan Adapted Notification Banner: Exactly matching requirement 7 */}
      {plan_diff && (
        <div id="tracker-adapted-banner" className="bg-[#FAF3E7] border border-[#E8D6B8] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#B45309] flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-[#B45309]" />
              Plan adapted
            </span>
            <span className="text-xs font-bold text-[#78350F] px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300">
              Plan v{plan_diff.previous_version} → Plan v{plan_diff.new_version}
            </span>
          </div>

          <div className="text-sm font-semibold text-[#0F172A] mt-1">
            <span className="text-[#64748B] font-medium">Reason: </span>
            {plan_diff.reason}
          </div>
          <p className="text-xs text-[#475569] mt-0.5 leading-relaxed">{plan_diff.details}</p>

          {plan_diff.before_workload && plan_diff.after_workload ? (
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white/90 rounded-lg border border-[#E8D6B8]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">Before:</span>
                <span className="text-sm font-bold text-[#0F172A]">
                  {plan_diff.before_workload.subject} — {plan_diff.before_workload.hours_remaining}h remaining
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider block">After:</span>
                <span className="text-sm font-bold text-[#9A3412]">
                  {plan_diff.after_workload.subject} — {plan_diff.after_workload.hours_remaining}h remaining
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2 text-xs text-[#64748B] flex items-center gap-2">
              <span>Workload recalculated from actual state and redistributed across upcoming days.</span>
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-[#E8D6B8]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#475569]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#0F172A]">Loop executed:</span>
              <span>1. Status → missed</span>
              <span>•</span>
              <span>2. Workload recalculated</span>
              <span>•</span>
              <span>3. Replanner triggered</span>
              <span>•</span>
              <span>4. Deadline verified</span>
            </div>
            <span className="text-[11px] text-[#78350F] font-mono">Plan v{plan_diff.new_version} persisted</span>
          </div>
        </div>
      )}

      {/* Sessions Table */}
      <div className="bg-white rounded-lg border border-[#E6E1D8] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E6E1D8] text-[#475569] text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Session ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Subject & Topic</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6] text-sm">
              {filteredSessions.map((session) => {
                const subObj = subjects.find((s) => s.name === session.subject);
                const priority = subObj?.priority || 'Medium';

                return (
                  <tr
                    key={session.id}
                    id={`session-row-${session.id}`}
                    className={`hover:bg-[#FAF9F7] transition-colors ${
                      session.status === 'missed'
                        ? 'bg-rose-50/40'
                        : session.status === 'completed'
                        ? 'bg-emerald-50/30'
                        : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono text-xs text-[#64748B]">
                      {session.id}
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-[#0F172A]">
                      <div>{session.date}</div>
                      <div className="text-[#64748B] text-[11px]">{session.time || '5:00 PM'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#0F172A]">{session.subject}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                            priority === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : priority === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {priority}
                        </span>
                      </div>
                      {session.topic && (
                        <div className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5">
                          <BookOpen className="w-3 h-3" />
                          <span>{session.topic}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#0F172A] font-medium text-xs">
                      {session.duration_minutes || session.duration * 60} min ({session.duration}h)
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                          session.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : session.status === 'missed'
                            ? 'bg-rose-100 text-rose-800'
                            : session.status === 'partial'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-[#F1EFEA] text-[#475569]'
                        }`}
                      >
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          id={`btn-complete-${session.id}`}
                          onClick={() => onTrackSession(session.id, 'completed')}
                          className={`text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                            session.status === 'completed'
                              ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                              : 'bg-white text-emerald-800 border-emerald-300 hover:bg-emerald-50'
                          }`}
                        >
                          Complete
                        </button>
                        <button
                          id={`btn-miss-${session.id}`}
                          onClick={() => onTrackSession(session.id, 'missed')}
                          className={`text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                            session.status === 'missed'
                              ? 'bg-rose-700 text-white border-rose-700 font-semibold'
                              : 'bg-white text-rose-700 border-rose-300 hover:bg-rose-50'
                          }`}
                        >
                          Miss
                        </button>
                        <button
                          id={`btn-partial-${session.id}`}
                          onClick={() => onTrackSession(session.id, 'partial')}
                          className={`text-xs px-2.5 py-1 rounded border transition-colors cursor-pointer ${
                            session.status === 'partial'
                              ? 'bg-amber-600 text-white border-amber-600 font-semibold'
                              : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'
                          }`}
                        >
                          Partial
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
